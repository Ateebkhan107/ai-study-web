import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const maxDuration = 60;

import { getUserAccessContext, canUseFeature } from "@/lib/accessControl";
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
import { handleBuilder, parseBuilderText } from "@/lib/zi/testGenerator/builder.server";

import { reserveZiFreePrompt, promptUsageOperation } from "@/lib/zi/promptUsage.server";

import { ziChatFrame, ziChatReply, ziChatResponse } from "@/lib/zi/chatFrames";
import { readZiProviderAction } from "@/lib/zi/providerActionStream.server";
import { resolveZiVisualReveal, ziVisualsAllowed, ZI_PROTECTED_CONCEPT_REPLY } from "@/lib/zi/visualReveal.server";
import { classroomCommand, classroomSelectionAllowed, resolveClassroomSelection } from "@/lib/zi/classroom/selection.server";

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

async function resolveZiAction(actionObj, { studentContext, requestedPlanDuration, pageContext, trustedEntityContext }) {
  if (actionObj.type === "navigate") {
    const destinations = ["dashboard", "analytics", "pyq", "revision", "arena", "profile", "community", "test"];
    return destinations.includes(actionObj.destination) ? { type: "navigate", destination: actionObj.destination } : null;
  }
  let safeAction = null;
  const exam = studentContext?.profile?.exam || "JEE";
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

        const matchedChap = chapters.find(c => {
          const cName = c.name.toLowerCase();
          const reqName = requestedChapter.toLowerCase();
          if (cName === reqName) return true;
          const canonicalC = normalizeChapterName(c.name);
          return canonicalC.toLowerCase() === canonicalRequested.toLowerCase() && canonicalC !== "";
        });

        if (matchedChap) {
          safeAction = { type: actionObj.type, subject: matchedSubj.name, chapter: matchedChap.name, trustedRoute: `/formula-cards/${matchedSubj.slug}/${matchedChap.slug}` };
        }
      }
    }
  } else if (actionObj.type.startsWith("open_pyq_")) {
    const normSubj = subjectName.toLowerCase() === 'mathematics' || subjectName.toLowerCase() === 'math' || subjectName.toLowerCase() === 'maths' ? 'Maths' : subjectName.charAt(0).toUpperCase() + subjectName.slice(1).toLowerCase();
    const pyqChapters = getCanonicalChaptersForSubject(normSubj);

    if (pyqChapters && pyqChapters.length > 0) {
      if (actionObj.type === "open_pyq_subject") {
        safeAction = { type: actionObj.type, subject: normSubj, trustedRoute: `/pyq/session?mode=random&exam=${exam}&subjects=${normSubj}` };
      } else if (actionObj.type === "open_pyq_chapter") {
        const requestedChapter = actionObj.chapter || "";
        const canonicalRequested = normalizeChapterName(requestedChapter);

        const exactChap = pyqChapters.find(c => {
          const cName = c.toLowerCase();
          const reqName = requestedChapter.toLowerCase();
          if (cName === reqName) return true;
          const canonicalC = normalizeChapterName(c);
          return canonicalC.toLowerCase() === canonicalRequested.toLowerCase() && canonicalC !== "";
        });

        if (exactChap) {
          safeAction = { type: actionObj.type, subject: normSubj, chapter: exactChap, trustedRoute: `/pyq/session?mode=chapter&exam=${exam}&subjects=${normSubj}&chapter=${encodeURIComponent(exactChap)}` };
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
      pageContext,
      entityContext: trustedEntityContext,
    });
  } else if (actionObj.type === "visual_explanation") {
    safeAction = validateZiVisualAction(actionObj);
  }
  return safeAction;
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  let access;
  try { access = await getUserAccessContext({ userId }); }
  catch { return jsonError("Zi access is temporarily unavailable", 503); }
  const isAiMode = access.isAiMode;
  const freeUsage = access.ziFreeUsage;

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

  // Configuration is deterministic, authenticated and rate limited, and does not
  // consume a Gemini call or an AI trial prompt. Never accept model-proposed drafts.
  const latestText = parsed.data.messages.at(-1).content;
  const selection = classroomCommand(latestText);
  if (!selection && (parsed.data.testBuilderToken || parseBuilderText(latestText).handled)) {
    try {
      const action = handleBuilder({ userId, access, text: latestText, token: parsed.data.testBuilderToken });
      if (action) return ziChatReply(action.prompt, action);
    } catch (error) {
      return NextResponse.json({ error: error.status ? error.message : "Test configuration is unavailable." }, { status: error.status || 503 });
    }
  }
  if (!isAiMode && (!freeUsage || freeUsage.available === false)) {
    return jsonError("Zi usage accounting is temporarily unavailable", 503);
  }
  if (!isAiMode && freeUsage.remaining <= 0 && freeUsage.pending > 0 && freeUsage.used < 3) {
    return jsonError("Zi trial requests are pending. Please try again later.", 503);
  }
  if (!isAiMode && freeUsage.remaining <= 0) {
    return NextResponse.json({ error: "AI_MODE_REQUIRED", message: "You have used all 3 free trial prompts. Upgrade to AI Mode to continue chatting with Zi." }, { status: 403 });
  }

  if (selection && !classroomSelectionAllowed(userId, access)) {
    return jsonError("Classroom lesson selection is unavailable", 403);
  }

  const { pageContext, messages } = parsed.data;
  const revealInput = { client: supabaseAdmin, userId, examTrack: access.examTrack, pageContext };
  const reveal = await resolveZiVisualReveal(revealInput);
  if (!ziVisualsAllowed(reveal)) return ziChatReply(ZI_PROTECTED_CONCEPT_REPLY);

  if (selection) {
    const student = await getZiStudentContext(userId).catch(() => null);
    const action = resolveClassroomSelection({
      type: "visual_explanation",
      visual: { visualType: "classroom_lesson", schemaVersion: 1, templateKey: selection.templateKey },
    }, { exam: student?.profile?.exam, examTrack: access.examTrack, language: selection.language });
    if (!action) return jsonError("Choose an available Classroom topic for your exam track", 422);
    if (!ziVisualsAllowed(await resolveZiVisualReveal(revealInput))) return ziChatReply(ZI_PROTECTED_CONCEPT_REPLY);
    return ziChatReply("Open the whiteboard to explore this lesson step by step.", action);
  }

  const streamAbort = new AbortController();
  const signal = AbortSignal.any([request.signal, streamAbort.signal]);
  let reservation = null;
  let providerDispatched = false;
  let providerStream;
  let studentContext = null;
  let trustedEntityContext = "";
  let requestedPlanDuration = null;
  try {
    if (!isAiMode) {
      reservation = await reserveZiFreePrompt(userId);
      if (!reservation.allowed) return reservation.used >= 3
        ? jsonError("AI_MODE_REQUIRED", 403)
        : jsonError("Zi trial requests are pending. Please try again later.", 503);
    }
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

    providerStream = await streamZiResponse({
      messages,
      systemPrompt: buildZiSystemPrompt(
        parsed.data.pageContext?.pageType,
        entityContext,
        studentContext,
        learningMemories
      ),
      signal,
      accessContext: access,
      beforeDispatch: async () => {
        if (!ziVisualsAllowed(await resolveZiVisualReveal(revealInput))) {
          throw Object.assign(new Error("Assessment reveal state changed"), { code: "ZI_REVEAL_CHANGED" });
        }
        signal.throwIfAborted();
        if (reservation) await promptUsageOperation(userId, "dispatch", reservation.requestId);
        providerDispatched = true;
      },
    });

    if (reservation) {
      if (!providerDispatched) throw new Error("Provider did not confirm dispatch boundary");
      await promptUsageOperation(userId, "consume", reservation.requestId);
    }
  } catch (error) {
    if (reservation && !providerDispatched) {
      // Release only before provider dispatch; the RPC never releases dispatched work.
      try { await promptUsageOperation(userId, "release", reservation.requestId); }
      catch { /* Unknown accounting outcome remains held; never grant a fresh allowance. */ }
    }
    if (error?.code === "ZI_REVEAL_CHANGED") return ziChatReply(ZI_PROTECTED_CONCEPT_REPLY);
    if (error?.code === "ZI_USAGE_UNAVAILABLE") return jsonError("Zi usage accounting is temporarily unavailable", 503);
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
      try {
        controller.enqueue(ziChatFrame("text", "_Gemini-generated response_\n\n"));
        const proposal = await readZiProviderAction(providerStream, (text) => {
          controller.enqueue(ziChatFrame("text", text));
        }, signal);
        if (proposal) {
          let action;
          try {
            action = await resolveZiAction(proposal, { studentContext, requestedPlanDuration, pageContext, trustedEntityContext });
            // Recheck after provider work. A new assessment or a lookup failure
            // while the response was streaming must suppress the visual.
            if (action?.type === "visual_explanation" &&
              !ziVisualsAllowed(await resolveZiVisualReveal(revealInput))) action = null;
          } catch {
            action = null; // Preserve the preceding chat prose.
          }
          signal.throwIfAborted();
          if (action) controller.enqueue(ziChatFrame("action", action));
        }
        controller.enqueue(ziChatFrame("done"));
      } catch (error) {
        if (!signal.aborted && error?.name !== "AbortError") {
          controller.enqueue(ziChatFrame("text", "Zi couldn't respond right now. Try again in a moment."));
          controller.enqueue(ziChatFrame("done"));
        }
      } finally {
        // cancel() closes the stream itself. A request abort may leave it open.
        if (!streamAbort.signal.aborted) controller.close();
      }
    },
    cancel() { streamAbort.abort(); },
  });

  return ziChatResponse(stream);
}
