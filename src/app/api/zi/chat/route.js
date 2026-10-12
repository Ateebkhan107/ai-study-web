import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const maxDuration = 60;

import { getUserAccessContext, canUseFeature, incrementZiFreePromptsUsage } from "@/lib/accessControl";
import { checkZiRateLimit } from "@/lib/zi/rateLimit";
import { attachStudyPlanStepActions } from "@/lib/zi/actionResolver.server";
import { buildZiEntityContext } from "@/lib/zi/entityContext.server";
import { getZiLearningMemories, validateZiLearningMemoryAction } from "@/lib/zi/memories.server";
import { getZiStudentContext } from "@/lib/zi/studentContext.server";
import { buildZiSystemPrompt } from "@/lib/zi/prompt";
import { streamZiResponse } from "@/lib/zi/provider";
import { inferRequestedPlanDuration, validateZiStudyPlanAction } from "@/lib/zi/studyPlan.server";
import { ZiChatRequestSchema } from "@/lib/zi/validation";
import { validateZiVisualAction } from "@/lib/zi/visuals.server";
import { getFormulaSubjectsForExam, getFormulaChaptersForSubject } from "@/lib/formulaCards";
import { getCanonicalChaptersForSubject, normalizeChapterName } from "@/lib/pyqChapterMapping";
import { getQuestions } from "@/lib/questions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const encoder = new TextEncoder();

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

function logZiProviderStatus(status, error) {
  if (process.env.NODE_ENV === "production") return;

  console.info(`[Zi] provider status: ${status}`);
  if (error) {
    console.error(`[Zi] provider error name: ${error?.name || "UnknownError"}`);
    console.error(`[Zi] provider error message: ${error?.message || "Unknown provider error"}`);
  }
}

function normalizeZiTestSubject(subjectName) {
  const subject = String(subjectName || "").trim();
  const lower = subject.toLowerCase();
  if (["mathematics", "math", "maths"].includes(lower)) return "Maths";
  if (["physics", "chemistry", "biology"].includes(lower)) {
    return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  }
  return null;
}

function buildPreparedTestRoute({ exam, subjects, chapters, questionCount, sourceType }) {
  const params = new URLSearchParams({
    exam,
    subjects: subjects.join(","),
    chapters: chapters.join(","),
    duration: Math.max(10, Math.ceil(questionCount * 1.5)).toString(),
    count: questionCount.toString(),
    difficulty: "Mixed",
    mode: "custom",
  });

  if (sourceType) {
    params.set("sourceType", sourceType);
  }

  return `/test/session?${params.toString()}`;
}

async function resolvePreparedCustomTestAction({ actionObj, exam }) {
  let qCount = parseInt(actionObj.questionCount, 10);
  if (isNaN(qCount) || qCount < 5) qCount = 5;
  if (qCount > 30) qCount = 30;

  const safeSubjects = [];
  for (const subject of actionObj.subjects || []) {
    const normalized = normalizeZiTestSubject(subject);
    if (normalized && !safeSubjects.some((item) => item.name === normalized)) {
      safeSubjects.push({ id: normalized.toLowerCase(), name: normalized });
    }
  }

  if (safeSubjects.length === 0) {
    safeSubjects.push({ id: "mixed", name: "Mixed Subjects" });
  }

  const safeChapters = [];
  for (const chapter of actionObj.chapters || []) {
    const requestedChapter = chapter || "";
    const canonicalRequested = normalizeChapterName(requestedChapter);

    for (const subject of safeSubjects) {
      if (subject.name === "Mixed Subjects") continue;
      const chapters = getCanonicalChaptersForSubject(subject.name);
      if (!chapters) continue;

      const exactChapter = chapters.find((candidate) => {
        const candidateName = candidate.toLowerCase();
        const requestedName = requestedChapter.toLowerCase();
        if (candidateName === requestedName) return true;
        const canonicalCandidate = normalizeChapterName(candidate);
        return canonicalCandidate.toLowerCase() === canonicalRequested.toLowerCase() && canonicalCandidate !== "";
      });

      if (exactChapter && !safeChapters.some((item) => item.name === exactChapter && item.subject === subject.name)) {
        safeChapters.push({
          id: exactChapter.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: exactChapter,
          subject: subject.name,
        });
        break;
      }
    }
  }

  const subjectsForRoute = safeSubjects.map((subject) => subject.name);
  const chaptersForRoute = safeChapters.map((chapter) => chapter.name);
  const isNeetBiologyPractice =
    exam === "NEET" &&
    subjectsForRoute.some((subject) => subject.toLowerCase() === "biology");
  const sourceType = isNeetBiologyPractice ? "PREPZII_PRACTICE" : "";

  const availableQuestions = await getQuestions({
    exam,
    subject: subjectsForRoute.join(","),
    chapter: chaptersForRoute.join(",") || "All Chapters",
    difficulty: "Mixed",
    limit: qCount,
    client: supabaseAdmin,
    sourceType: sourceType || undefined,
    status: sourceType ? "PUBLISHED" : undefined,
    activeOnly: Boolean(sourceType),
    strictFilters: Boolean(sourceType),
  });

  if (availableQuestions.length < 5) {
    return {
      type: "test_unavailable",
      exam,
      requestedQuestionCount: qCount,
      availableQuestionCount: availableQuestions.length,
      subjects: safeSubjects,
      chapters: safeChapters,
      reason: "Zi could not find enough existing PrepZii questions for that exact test request.",
    };
  }

  const resolvedQuestionCount = Math.min(qCount, availableQuestions.length);
  const trustedRoute = buildPreparedTestRoute({
    exam,
    subjects: subjectsForRoute,
    chapters: chaptersForRoute,
    questionCount: resolvedQuestionCount,
    sourceType,
  });

  return {
    type: "prepared_custom_test",
    questionCount: resolvedQuestionCount,
    requestedQuestionCount: qCount,
    subjects: safeSubjects,
    chapters: safeChapters,
    exam,
    source: actionObj.source || "custom",
    trustedRoute,
  };
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const access = await getUserAccessContext({ userId });
  const isAiMode = access.isAiMode;
  const freeUsage = access.ziFreeUsage || { used: 0, limit: 3, remaining: 3 };

  if (!isAiMode && freeUsage.remaining <= 0) {
    return NextResponse.json(
      { error: "AI_MODE_REQUIRED", message: "You have used all 3 free trial prompts. Upgrade to AI Mode to continue chatting with Zi." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = ZiChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { allowed, remaining, resetMs } = checkZiRateLimit(userId, access.plan);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(resetMs / 1000)),
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  // Deduct 1 free prompt if user is using free trial
  if (!isAiMode) {
    await incrementZiFreePromptsUsage(userId);
  }

  let providerStream;
  let studentContext = null;
  let trustedEntityContext = "";
  let requestedPlanDuration = null;
  try {
    const [entityContext, fetchedStudentContext] = await Promise.all([
      buildZiEntityContext({
        userId,
        pageContext: parsed.data.pageContext,
      }).catch((error) => {
        console.error("[ZI_ENTITY_CONTEXT_ERROR]", error);
        return "";
      }),
      getZiStudentContext(userId).catch((error) => {
        console.error("[ZI_STUDENT_CONTEXT_ERROR]", error);
        return null;
      }),
    ]);
    studentContext = fetchedStudentContext;
    trustedEntityContext = entityContext;
    const learningMemories = await getZiLearningMemories(userId, { entityContext }).catch((error) => {
      console.error("[ZI_MEMORIES_CONTEXT_ERROR]", error);
      return [];
    });
    requestedPlanDuration = inferRequestedPlanDuration(parsed.data.messages);

    let finalMessages = [...parsed.data.messages];
    if (finalMessages.length >= 3) {
      const latestMsg = finalMessages[finalMessages.length - 1];
      const prevMsg = finalMessages[finalMessages.length - 2];
      const prevPriorMsg = finalMessages[finalMessages.length - 3];

      if (latestMsg.role === "user" && prevMsg.role === "zi" && prevPriorMsg.role === "user") {
        const latestText = latestMsg.content.toLowerCase().trim();
        const isSubjectClarification = ["physics", "chemistry", "maths", "mathematics", "biology"].includes(latestText);
        const assistantAsked = prevMsg.content.toLowerCase().includes("which") || prevMsg.content.toLowerCase().includes("or");
        if (isSubjectClarification && assistantAsked) {
          console.log("[Zi Action] clarification turn detected: true");
          console.log("[Zi Action] prior intent:", prevPriorMsg.content);
        }
      }
    }

    providerStream = await streamZiResponse({
      messages: finalMessages,
      systemPrompt: buildZiSystemPrompt(
        parsed.data.pageContext?.pageType,
        entityContext,
        studentContext,
        learningMemories
      ),
      signal: request.signal,
      accessContext: access,
    });
  } catch (error) {
    if (error?.code === "ZI_PROVIDER_NOT_CONFIGURED") {
      logZiProviderStatus("configuration-error", error);
      console.error("[ZI_PROVIDER_CONFIG_ERROR]", error.message);
      return jsonError("Zi provider is not configured", 503);
    }

    logZiProviderStatus("start-error", error);
    console.error("[ZI_PROVIDER_START_ERROR]", {
      message: error?.message,
      name: error?.name,
    });
    return jsonError("Zi provider unavailable", 503);
  }

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let foundAction = false;
      let actionString = "";

      try {
        for await (const chunk of providerStream) {
          if (request.signal.aborted) break;
          const text =
            typeof chunk.text === "function" ? chunk.text() : chunk.text;
          if (text) {
             if (foundAction) {
                actionString += text;
             } else {
                buffer += text;
                const actionIndex = buffer.indexOf("__ZI_ACTION__=");
                if (actionIndex !== -1) {
                   const before = buffer.substring(0, actionIndex);
                   if (before) controller.enqueue(encoder.encode(before));
                   foundAction = true;
                   actionString = buffer.substring(actionIndex + "__ZI_ACTION__=".length);
                } else {
                   const safeLength = Math.max(0, buffer.length - "__ZI_ACTION__=".length);
                   if (safeLength > 0) {
                      controller.enqueue(encoder.encode(buffer.substring(0, safeLength)));
                      buffer = buffer.substring(safeLength);
                   }
                }
             }
          }
        }

        if (!foundAction && buffer) {
          controller.enqueue(encoder.encode(buffer));
        }

        if (foundAction && actionString) {
           try {
              const actionObj = JSON.parse(actionString.trim());
              if (actionObj && actionObj.type === "navigate") {
                  const VALID_DESTS = ["dashboard", "analytics", "pyq", "revision", "arena", "profile", "community", "test"];
                  if (VALID_DESTS.includes(actionObj.destination)) {
                      const safeAction = { type: "navigate", destination: actionObj.destination };
                      controller.enqueue(encoder.encode(`\n\n__ZI_VALIDATED_ACTION__=${JSON.stringify(safeAction)}`));
                  }
              } else if (actionObj && typeof actionObj.type === "string") {
                  let safeAction = null;
                  const exam = studentContext?.exam || "JEE";
                  const subjectName = actionObj.subject || "";

                  if (actionObj.type.startsWith("open_revision_")) {
                     const subjects = await getFormulaSubjectsForExam(exam);
                     const matchedSubj = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase() || (subjectName.toLowerCase() === 'maths' && s.name.toLowerCase() === 'mathematics') || (subjectName.toLowerCase() === 'mathematics' && s.name.toLowerCase() === 'maths'));

                     if (matchedSubj) {
                        if (actionObj.type === "open_revision_subject") {
                           safeAction = { type: actionObj.type, subject: matchedSubj.name, trustedRoute: `/formula-cards/${matchedSubj.slug}` };
                        } else if (actionObj.type === "open_revision_chapter") {
                           const chapters = await getFormulaChaptersForSubject(matchedSubj.slug, exam);
                           const requestedChapter = actionObj.chapter || "";
                           const canonicalRequested = normalizeChapterName(requestedChapter);

                           console.log("[Zi Action] raw proposed action:", actionObj);
                           console.log("[Zi Action] resolved subject:", matchedSubj.name);

                           const matchedChap = chapters.find(c => {
                              const cName = c.name.toLowerCase();
                              const reqName = requestedChapter.toLowerCase();
                              if (cName === reqName) return true;
                              const canonicalC = normalizeChapterName(c.name);
                              return canonicalC.toLowerCase() === canonicalRequested.toLowerCase() && canonicalC !== "";
                           });

                           if (matchedChap) {
                              console.log("[Zi Action] resolved chapter:", matchedChap.name);
                              safeAction = { type: actionObj.type, subject: matchedSubj.name, chapter: matchedChap.name, trustedRoute: `/formula-cards/${matchedSubj.slug}/${matchedChap.slug}` };
                              console.log("[Zi Action] trusted route:", safeAction.trustedRoute);
                           } else {
                              console.log("[Zi Action] no matched chapter for:", requestedChapter);
                           }
                        }
                     }
                  } else if (actionObj.type.startsWith("open_pyq_")) {
                     let normSubj = subjectName.toLowerCase() === 'mathematics' || subjectName.toLowerCase() === 'math' || subjectName.toLowerCase() === 'maths' ? 'Maths' : subjectName.charAt(0).toUpperCase() + subjectName.slice(1).toLowerCase();
                     const pyqChapters = getCanonicalChaptersForSubject(normSubj);

                     if (pyqChapters && pyqChapters.length > 0) {
                        if (actionObj.type === "open_pyq_subject") {
                           safeAction = { type: actionObj.type, subject: normSubj, trustedRoute: `/pyq/session?mode=random&exam=${exam}&subjects=${normSubj}` };
                        } else if (actionObj.type === "open_pyq_chapter") {
                           const requestedChapter = actionObj.chapter || "";
                           const canonicalRequested = normalizeChapterName(requestedChapter);

                           console.log("[Zi Action] raw proposed action:", actionObj);
                           console.log("[Zi Action] resolved subject:", normSubj);

                           const exactChap = pyqChapters.find(c => {
                              const cName = c.toLowerCase();
                              const reqName = requestedChapter.toLowerCase();
                              if (cName === reqName) return true;
                              const canonicalC = normalizeChapterName(c);
                              return canonicalC.toLowerCase() === canonicalRequested.toLowerCase() && canonicalC !== "";
                           });

                           if (exactChap) {
                              console.log("[Zi Action] resolved chapter:", exactChap);
                              safeAction = { type: actionObj.type, subject: normSubj, chapter: exactChap, trustedRoute: `/pyq/session?mode=chapter&exam=${exam}&subjects=${normSubj}&chapter=${encodeURIComponent(exactChap)}` };
                              console.log("[Zi Action] trusted route:", safeAction.trustedRoute);
                           } else {
                              console.log("[Zi Action] no matched chapter for:", requestedChapter);
                           }
                        }
                     }
                  } else if (actionObj.type === "prepare_custom_test") {
                     safeAction = await resolvePreparedCustomTestAction({ actionObj, exam });
                  } else if (actionObj.type === "save_preference") {
                     const allowedKeys = ["preferred_language", "response_length", "explanation_style", "learning_style", "study_preference"];
                     if (allowedKeys.includes(actionObj.key) && typeof actionObj.value === "string") {
                        const val = actionObj.value.trim().substring(0, 150); // Validate length
                        if (val.length > 0) {
                           safeAction = {
                              type: "save_preference",
                              key: actionObj.key,
                              value: val
                           };
                        }
                     }
                  } else if (actionObj.type === "delete_preference") {
                     const allowedKeys = ["preferred_language", "response_length", "explanation_style", "learning_style", "study_preference"];
                     if (allowedKeys.includes(actionObj.key)) {
                        safeAction = {
                           type: "delete_preference",
                           key: actionObj.key
                        };
                     }
                  } else if (actionObj.type === "reset_preferences") {
                     safeAction = { type: "reset_preferences" };
                  } else if (
                     actionObj.type === "save_learning_memory" ||
                     actionObj.type === "update_learning_memory" ||
                     actionObj.type === "delete_learning_memory"
                  ) {
                     safeAction = validateZiLearningMemoryAction(actionObj);
                  } else if (actionObj.type === "study_plan") {
                     safeAction = validateZiStudyPlanAction(actionObj, {
                        requestedDurationMinutes: requestedPlanDuration,
                     });
                     safeAction = await attachStudyPlanStepActions({
                        planAction: safeAction,
                        studentContext,
                        pageContext: parsed.data.pageContext,
                        entityContext: trustedEntityContext,
                     });
                  } else if (actionObj.type === "visual_explanation") {
                     safeAction = validateZiVisualAction(actionObj);
                     if (!safeAction && process.env.NODE_ENV !== "production") {
                        console.warn("[ZI_VISUAL_VALIDATION_REJECTED]", {
                           visualType: actionObj?.visual?.visualType,
                        });
                     }
                  }

                  if (safeAction) {
                      console.log("[Zi Action] validated action emitted:", safeAction);
                      controller.enqueue(encoder.encode(`\n\n__ZI_VALIDATED_ACTION__=${JSON.stringify(safeAction)}`));
                  }
              }
           } catch(e) {
              // Ignore invalid JSON action
           }
        }

        controller.close();
      } catch (error) {
        if (request.signal.aborted || error?.name === "AbortError") {
          controller.close();
          return;
        }

        logZiProviderStatus("stream-error", error);
        console.error("[ZI_STREAM_ERROR]", {
          message: error?.message,
          name: error?.name,
        });
        controller.enqueue(
          encoder.encode("Zi couldn't respond right now. Try again in a moment.")
        );
        controller.close();
      }
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
