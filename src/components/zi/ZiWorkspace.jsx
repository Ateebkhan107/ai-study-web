"use client";
"use no memo";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleMinus,
  CircleX,
  Loader2,
  MessagesSquare,
  PenLine,
  SendHorizontal,
  Sigma,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";

import Logo from "@/components/Logo";
import MathText from "@/components/MathText";
import ZiVisual from "@/components/zi/ZiVisual";
import { useZiPageContext } from "@/lib/zi/pageContext";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "zi",
  text: "What are we learning today?",
  status: "done",
};

const MAX_CLIENT_HISTORY = 12;
const ZI_ERROR_MESSAGE = "Zi couldn't respond right now. Try again in a moment.";

const SUGGESTION_CARDS = [
  {
    title: "Learn a concept",
    description: "Build intuition first, then exam-ready steps.",
    prompt: "Teach me a JEE/NEET concept step by step.",
    icon: BookOpen,
  },
  {
    title: "Solve a problem",
    description: "Share the question text and Zi will guide the method.",
    prompt: "Help me solve this problem step by step: ",
    icon: PenLine,
  },
  {
    title: "Review my test",
    description: "Get a study strategy from available performance context.",
    prompt: "Help me review my recent test performance and decide what to revise next.",
    icon: CheckCircle2,
  },
  {
    title: "Explain a formula",
    description: "Understand the meaning, use case, and common traps.",
    prompt: "Explain this formula with intuition and an example: ",
    icon: Sigma,
  },
];

const FOLLOW_UPS = [
  "Give me a simpler explanation",
  "Show the steps like an exam solution",
  "Quiz me on this",
  "What mistakes should I avoid?",
];

const REVIEW_FOLLOW_UPS = [
  "Explain the concept first",
  "Show the exam method",
  "Why was my answer wrong?",
  "Give me one similar practice tip",
];

function getAnswerStatus(answer) {
  if (!answer?.selected_option) return "skipped";
  return answer.is_correct ? "correct" : "incorrect";
}

function getStatusStyles(status, isSelected = false) {
  const styles = {
    incorrect: isSelected
      ? "border-rose-300 bg-rose-50 text-rose-800"
      : "border-stone-200 bg-white text-stone-700 hover:border-rose-200 hover:bg-rose-50/70",
    skipped: isSelected
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-stone-200 bg-white text-stone-700 hover:border-amber-200 hover:bg-amber-50/70",
    correct: isSelected
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : "border-stone-200 bg-white text-stone-700 hover:border-emerald-200 hover:bg-emerald-50/70",
  };

  return styles[status] || styles.skipped;
}

function StatusIcon({ status, className = "h-4 w-4" }) {
  if (status === "correct") {
    return <CircleCheck className={`${className} text-emerald-600`} strokeWidth={2.4} />;
  }

  if (status === "incorrect") {
    return <CircleX className={`${className} text-rose-600`} strokeWidth={2.4} />;
  }

  return <CircleMinus className={`${className} text-amber-600`} strokeWidth={2.4} />;
}

function normalizeOptionLabel(value) {
  if (value === null || value === undefined || value === "") return "Not attempted";
  return String(value);
}

function createMessage(role, text, status = "done") {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    status,
  };
}

function buildPreparedCustomTestRoute(action) {
  if (action.trustedRoute) return action.trustedRoute;

  const subjectsList = (action.subjects || []).map((subject) => subject.name).filter(Boolean);
  const isNeetBiology =
    (action.exam || "JEE") === "NEET" &&
    subjectsList.some((subject) => subject.toLowerCase() === "biology");
  const params = new URLSearchParams({
    exam: action.exam || "JEE",
    subjects: subjectsList.join(","),
    chapters: (action.chapters || []).map((chapter) => chapter.name).filter(Boolean).join(","),
    duration: Math.max(10, Math.ceil((action.questionCount || 10) * 1.5)).toString(),
    count: (action.questionCount || 10).toString(),
    difficulty: "Mixed",
    mode: "custom",
  });

  if (isNeetBiology) {
    params.set("sourceType", "PREPZII_PRACTICE");
  }

  return `/test/session?${params.toString()}`;
}

function getActionMeta(action) {
  if (!action?.type) return null;

  const basicRoutes = {
    dashboard: { label: "Open Dashboard", route: "/dashboard" },
    analytics: { label: "Open Analytics", route: "/analytics" },
    pyq: { label: "Open PYQs", route: "/pyq" },
    revision: { label: "Open Revision", route: "/formula-cards" },
    arena: { label: "Open Battle Arena", route: "/battle" },
    profile: { label: "Open Profile", route: "/profile" },
    community: { label: "Open Community", route: "/community" },
    test: { label: "Open Test Center", route: "/test" },
  };

  if (action.type === "navigate" && basicRoutes[action.destination]) {
    return basicRoutes[action.destination];
  }

  if (action.trustedRoute) {
    if (action.type.startsWith("open_pyq_")) {
      return {
        label: "Open PYQs",
        route: action.trustedRoute,
        title: action.chapter || action.subject || "Practice PYQs",
      };
    }

    if (action.type.startsWith("open_revision_")) {
      return {
        label: "Open Revision",
        route: action.trustedRoute,
        title: action.chapter || action.subject || "Revision cards",
      };
    }
  }

  if (action.type === "prepared_custom_test") {
    return {
      label: "Start Test",
      route: buildPreparedCustomTestRoute(action),
      title: `${action.questionCount || 10} question practice set`,
    };
  }

  return null;
}

function parseStreamPayload(streamedText) {
  const actionIdx = streamedText.indexOf("__ZI_VALIDATED_ACTION__=");
  if (actionIdx === -1) {
    return { text: streamedText, action: null };
  }

  const text = streamedText.substring(0, actionIdx).trim();
  const actionStr = streamedText.substring(actionIdx + "__ZI_VALIDATED_ACTION__=".length).trim();

  try {
    return {
      text,
      action: actionStr ? JSON.parse(actionStr) : null,
    };
  } catch {
    return { text, action: null };
  }
}

function ConversationAction({ action }) {
  const router = useRouter();
  const meta = getActionMeta(action);
  const [isOpening, setIsOpening] = useState(false);

  if (action?.type === "test_unavailable") {
    return (
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm">
        <div className="font-black text-stone-950">No matching test found</div>
        <div className="mt-1 font-medium leading-6 text-stone-700">
          {action.reason || "Zi could not find enough existing PrepZii questions for that exact request."}
        </div>
        <div className="mt-3 text-xs font-bold text-stone-500">
          Try choosing a broader subject, more chapters, or a smaller focused test.
        </div>
      </div>
    );
  }

  if (!meta?.route) return null;

  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-bold text-stone-950">{meta.title || meta.label}</div>
          <div className="mt-0.5 text-xs font-medium text-stone-600">
            Zi prepared a safe PrepZii destination for this step.
          </div>
        </div>
        <button
          type="button"
          disabled={isOpening}
          onClick={() => {
            setIsOpening(true);
            router.push(meta.route);
          }}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-700"
        >
          {isOpening ? "Opening..." : meta.label}
          {!isOpening ? <ChevronRight className="h-4 w-4" strokeWidth={2.4} /> : null}
        </button>
      </div>
    </div>
  );
}

function WorkspaceMessage({ message }) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isLoading = message.status === "streaming" && !message.text;
  const visual = message.action?.type === "visual_explanation" ? message.action.visual : null;

  if (message.id === WELCOME_MESSAGE.id) return null;

  if (isUser) {
    return (
      <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500">
          You asked
        </div>
        <p className="whitespace-pre-wrap text-[0.96rem] leading-7 text-stone-950">{message.text}</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-stone-950">
          <Sparkles className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div>
          <div className="text-sm font-black text-stone-950">Zi</div>
          <div className="text-xs font-semibold text-stone-500">Personal AI Tutor</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-sm font-semibold text-stone-600">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          Zi is preparing the explanation...
        </div>
      ) : isError ? (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message.text || ZI_ERROR_MESSAGE}</span>
        </div>
      ) : (
        <MathText className="zi-workspace-markdown text-[0.98rem] leading-8 text-stone-800 [&_blockquote]:my-4 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:bg-amber-50 [&_blockquote]:py-3 [&_blockquote]:pl-4 [&_code]:rounded-md [&_code]:bg-amber-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-amber-800 [&_h1]:mb-3 [&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-stone-950 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-stone-950 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-black [&_h3]:text-stone-950 [&_li]:pl-1 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-stone-200 [&_pre]:bg-stone-50 [&_pre]:p-4">
          {message.text}
        </MathText>
      )}

      {visual ? <ZiVisual visual={visual} /> : null}
      <ConversationAction action={message.action} />
    </article>
  );
}

function ReviewSummary({ reviewData }) {
  const attempt = reviewData?.attempt;
  if (!attempt) return null;

  const scoreLabel = `${attempt.score} / ${attempt.totalMarks}`;
  const subjectLabel = attempt.subjects?.filter(Boolean).join(", ") || "Mixed subjects";

  return (
    <section className="mb-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
            Post-test review
          </p>
          <h2 className="mt-1 truncate font-display text-2xl font-black tracking-tight text-stone-950">
            {attempt.testName || "Mock Test"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {subjectLabel} · {attempt.totalQuestions} questions · {attempt.timeTaken}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <div className="text-lg font-black text-stone-950">{scoreLabel}</div>
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">Score</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-lg font-black text-emerald-700">{attempt.correct}</div>
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Correct</div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <div className="text-lg font-black text-rose-700">{attempt.wrong}</div>
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-700">Wrong</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-lg font-black text-amber-700">{attempt.skipped}</div>
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Skipped</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewQuestionPanel({ answer, onStartReview, isGenerating }) {
  if (!answer) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm font-semibold text-stone-500">
        Select a question to review with Zi.
      </div>
    );
  }

  const question = answer.questions || {};
  const status = getAnswerStatus(answer);
  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d],
  ].filter(([, value]) => value);

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
              Question {answer.questionNumber || ""}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${getStatusStyles(status, true)}`}>
              <StatusIcon status={status} className="h-3.5 w-3.5" />
              {status}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-stone-500">
            {[question.subject, question.chapter, question.topic].filter(Boolean).join(" · ") || "Subject metadata unavailable"}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartReview}
          disabled={isGenerating}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 text-sm font-black text-white transition-colors hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-400"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" strokeWidth={2.4} />}
          Explain with Zi
        </button>
      </div>

      <MathText className="text-[0.98rem] font-semibold leading-7 text-stone-950">
        {question.question_text || "Question text is unavailable."}
      </MathText>

      {question.question_image ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.question_image}
            alt="Question visual"
            className="max-h-56 w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      {options.length ? (
        <div className="mt-4 grid gap-2">
          {options.map(([label, value]) => {
            const selected = String(answer.selected_option || "").split(",").includes(label);
            const correct = String(answer.correct_option || "").split(",").includes(label);
            const optionClass = correct
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : selected
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : "border-stone-200 bg-stone-50 text-stone-700";

            return (
              <div key={label} className={`rounded-xl border p-3 ${optionClass}`}>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm">
                    {label}
                  </span>
                  <MathText className="min-w-0 text-sm font-semibold leading-6">
                    {value}
                  </MathText>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 text-sm font-semibold text-stone-600 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          Your answer: <span className="font-black text-stone-950">{normalizeOptionLabel(answer.selected_option)}</span>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          Correct answer: <span className="font-black text-stone-950">{normalizeOptionLabel(answer.correct_option)}</span>
        </div>
      </div>

      {question.explanation ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700">
            Existing explanation
          </div>
          <MathText className="text-sm font-medium leading-7 text-stone-800">
            {question.explanation}
          </MathText>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm font-semibold text-stone-500">
          No stored explanation is available for this question. Zi will use the verified question and answer context.
        </div>
      )}
    </article>
  );
}

export default function ZiWorkspace() {
  const basePageContext = useZiPageContext();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt") || "";
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [selectedAnswerId, setSelectedAnswerId] = useState("");
  const abortControllerRef = useRef(null);
  const transcriptRef = useRef(null);
  const textareaRef = useRef(null);

  const selectedAnswer = useMemo(() => {
    if (!reviewData?.answers?.length) return null;
    return reviewData.answers.find((answer) => String(answer.id) === String(selectedAnswerId)) || reviewData.answers[0];
  }, [reviewData, selectedAnswerId]);
  const isReviewMode = Boolean(attemptId);
  const hasConversation = messages.some((message) => message.id !== WELCOME_MESSAGE.id);
  const latestAssistant = useMemo(
    () => [...messages].reverse().find((message) => message.role === "zi" && message.text?.trim()),
    [messages]
  );
  const effectiveFollowUps = isReviewMode ? REVIEW_FOLLOW_UPS : FOLLOW_UPS;

  const getPageContextForRequest = () => {
    if (isReviewMode && selectedAnswer?.id) {
      return {
        pageType: "test",
        entity: {
          type: "test_review_question",
          id: String(selectedAnswer.id),
        },
      };
    }

    return basePageContext;
  };

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!attemptId) {
      return;
    }

    const controller = new AbortController();

    async function loadReviewAttempt() {
      setReviewLoading(true);
      setReviewError("");

      try {
        const response = await fetch(`/api/test-attempts/${encodeURIComponent(attemptId)}/zi-review`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          setReviewError("Please sign in again to review this test with Zi.");
          return;
        }

        if (response.status === 404) {
          setReviewError("This completed test attempt was not found for your account.");
          return;
        }

        if (!response.ok) {
          setReviewError("Zi could not load this test review right now.");
          return;
        }

        const data = await response.json();
        setReviewData(data);
        const firstReviewTarget =
          (data.answers || []).find((answer) => !answer.is_correct) ||
          (data.answers || [])[0] ||
          null;
        setSelectedAnswerId(firstReviewTarget?.id ? String(firstReviewTarget.id) : "");
        setMessages([WELCOME_MESSAGE]);
        setInput("");
      } catch (error) {
        if (error?.name !== "AbortError") {
          setReviewError("Network trouble while loading the test review.");
        }
      } finally {
        setReviewLoading(false);
      }
    }

    loadReviewAttempt();

    return () => controller.abort();
  }, [attemptId]);

  const buildRequestMessages = (nextUserMessage) =>
    [...messages, nextUserMessage]
      .filter((message) => message.id !== WELCOME_MESSAGE.id)
      .filter((message) => message.status !== "error")
      .filter((message) => message.status !== "streaming")
      .filter((message) => message.text?.trim())
      .map((message) => ({
        role: message.role === "zi" ? "assistant" : "user",
        content: message.text.trim(),
      }))
      .slice(-MAX_CLIENT_HISTORY);

  const updateMessage = (messageId, updater) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, ...updater(message) } : message
      )
    );
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;
    if (isReviewMode && !selectedAnswer?.id) {
      setErrorBanner("Select a completed-test question before asking Zi to review it.");
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("zi", "", "streaming");
    const requestMessages = buildRequestMessages(userMessage);
    const pageContext = getPageContextForRequest();
    const abortController = new AbortController();

    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;
    setErrorBanner("");
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/zi/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages, pageContext }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        const statusMessage =
          response.status === 401
            ? "Please sign in again to use Zi."
            : response.status === 403
            ? "Zi AI is available after upgrading to AI Mode or while free prompts remain."
            : response.status === 400
            ? "That question could not be sent. Try shortening it."
            : response.status === 429
            ? "Zi needs a short breather. Try again in a moment."
            : ZI_ERROR_MESSAGE;

        setErrorBanner(statusMessage);
        updateMessage(assistantMessage.id, () => ({
          text: statusMessage,
          status: "error",
        }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        streamedText += chunk;

        const parsed = parseStreamPayload(streamedText);
        updateMessage(assistantMessage.id, () => ({
          text: parsed.text,
          action: parsed.action,
          status: "streaming",
        }));
      }

      const trailingText = decoder.decode();
      if (trailingText) streamedText += trailingText;

      const parsed = parseStreamPayload(streamedText);
      updateMessage(assistantMessage.id, () => ({
        text: parsed.text || ZI_ERROR_MESSAGE,
        action: parsed.action,
        status: parsed.text ? "done" : "error",
      }));
    } catch (error) {
      if (abortController.signal.aborted || error?.name === "AbortError") {
        updateMessage(assistantMessage.id, (message) => ({
          text: message.text || "Stopped.",
          status: "done",
        }));
        return;
      }

      setErrorBanner(ZI_ERROR_MESSAGE);
      updateMessage(assistantMessage.id, () => ({
        text: ZI_ERROR_MESSAGE,
        status: "error",
      }));
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsGenerating(false);
      textareaRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendMessage(input);
  };

  const clearConversation = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setErrorBanner("");
    setIsGenerating(false);
  };

  const selectReviewAnswer = (answerId) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setSelectedAnswerId(String(answerId));
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setErrorBanner("");
    setIsGenerating(false);
  };

  const startSelectedQuestionReview = () => {
    if (!selectedAnswer?.id) return;
    sendMessage("Review this selected completed-test question. Explain the concept, why my answer was wrong if applicable, the correct reasoning step by step, and tips for similar questions.");
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#fbfaf7] text-stone-950 lg:min-h-[calc(100dvh-6rem)]">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:min-h-[calc(100dvh-6rem)] lg:px-8">
        <header className="mb-4 rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={isReviewMode && attemptId ? `/test/result/${attemptId}` : "/dashboard"}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-stone-950"
                aria-label={isReviewMode ? "Back to test result" : "Back to dashboard"}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
              </Link>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-400">
                  <Logo size={26} showText={false} forceLight />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate font-display text-xl font-black tracking-tight text-stone-950 sm:text-2xl">
                      Zi
                    </h1>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                      24x7
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-stone-500">Your Personal AI Tutor</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasConversation ? (
                <button
                  type="button"
                  onClick={clearConversation}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold text-stone-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.4} />
                  Clear
                </button>
              ) : null}
              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 bg-stone-950 px-3 text-sm font-bold text-white transition-colors hover:bg-stone-800"
                >
                  <Square className="h-3.5 w-3.5 fill-current" strokeWidth={2.4} />
                  Stop
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {isReviewMode ? (
          reviewLoading ? (
            <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-5 text-sm font-bold text-stone-500 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                Loading your completed test review...
              </div>
            </div>
          ) : reviewError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 shadow-sm">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            </div>
          ) : (
            <ReviewSummary reviewData={reviewData} />
          )
        ) : null}

        <section
          ref={transcriptRef}
          className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-stone-200 bg-stone-50/80 px-3 py-4 shadow-sm [scrollbar-color:rgba(217,119,6,0.45)_transparent] sm:px-5 sm:py-6"
          aria-live="polite"
        >
          {isReviewMode ? (
            reviewLoading || reviewError ? (
              <div className="flex min-h-[360px] items-center justify-center text-sm font-bold text-stone-500">
                {reviewLoading ? "Preparing Zi's review workspace..." : "Open a completed result to review it with Zi."}
              </div>
            ) : !reviewData?.answers?.length ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
                <div>
                  <h2 className="font-display text-2xl font-black text-stone-950">No question data found</h2>
                  <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-stone-500">
                    This attempt exists, but Zi could not find stored answer rows to review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start">
                  <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                          Questions
                        </div>
                        <div className="mt-1 text-xs font-semibold text-stone-500">
                          Select one to tutor with Zi
                        </div>
                      </div>
                    </div>
                    <div className="grid max-h-[46vh] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-8 lg:grid-cols-4">
                      {reviewData.answers.map((answer) => {
                        const status = getAnswerStatus(answer);
                        const isSelected = String(answer.id) === String(selectedAnswer?.id);
                        return (
                          <button
                            key={answer.id}
                            type="button"
                            onClick={() => selectReviewAnswer(answer.id)}
                            className={`flex aspect-square items-center justify-center rounded-xl border text-xs font-black transition-colors ${getStatusStyles(status, isSelected)}`}
                            aria-label={`Review question ${answer.questionNumber || ""}, ${status}`}
                          >
                            {answer.questionNumber || ""}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 grid gap-2 border-t border-stone-100 pt-3 text-xs font-bold text-stone-500">
                      <div className="flex items-center gap-2"><StatusIcon status="incorrect" /> Incorrect</div>
                      <div className="flex items-center gap-2"><StatusIcon status="skipped" /> Skipped</div>
                      <div className="flex items-center gap-2"><StatusIcon status="correct" /> Correct</div>
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 space-y-4">
                  <ReviewQuestionPanel
                    answer={selectedAnswer}
                    onStartReview={startSelectedQuestionReview}
                    isGenerating={isGenerating}
                  />

                  {hasConversation ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <WorkspaceMessage key={message.id} message={message} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm font-semibold leading-6 text-stone-500">
                      Click <span className="font-black text-stone-950">Explain with Zi</span> or ask a specific doubt below. Zi will use the server-verified question, your selected answer, the correct answer, and any stored explanation.
                    </div>
                  )}
                </div>
              </div>
            )
          ) : !hasConversation ? (
            <div className="mx-auto flex max-w-4xl flex-col items-center justify-center py-8 text-center sm:py-14">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-700">
                <MessagesSquare className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
                What are we learning today?
              </h2>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-stone-600">
                Ask Zi to explain concepts, structure solutions, compare ideas, or turn confusion into a clean study path.
              </p>

              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SUGGESTION_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => {
                        setInput(card.prompt);
                        textareaRef.current?.focus();
                      }}
                      className="group min-h-[132px] rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                    >
                      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-100">
                        <Icon className="h-5 w-5" strokeWidth={2.3} />
                      </span>
                      <span className="block text-sm font-black text-stone-950">{card.title}</span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-stone-500">{card.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-4">
              {messages.map((message) => (
                <WorkspaceMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </section>

        {latestAssistant && !isGenerating ? (
          <div className="mx-auto mt-3 flex w-full max-w-4xl gap-2 overflow-x-auto pb-1">
            {effectiveFollowUps.map((followUp) => (
              <button
                key={followUp}
                type="button"
                onClick={() => sendMessage(followUp)}
                className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-stone-950"
              >
                {followUp}
              </button>
            ))}
          </div>
        ) : null}

        {errorBanner ? (
          <div className="mx-auto mt-3 flex w-full max-w-4xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 mx-auto mt-3 w-full max-w-4xl rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_-10px_30px_rgba(28,25,23,0.08)]"
        >
          <label htmlFor="zi-workspace-composer" className="sr-only">
            Ask Zi a question
          </label>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              id="zi-workspace-composer"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isGenerating || reviewLoading || Boolean(reviewError) || (isReviewMode && !selectedAnswer?.id)}
              placeholder={isReviewMode ? "Ask a follow-up about the selected question..." : "Ask Zi to explain, solve, compare, or quiz you..."}
              className="max-h-40 min-h-12 flex-1 resize-none rounded-xl bg-stone-50 px-3 py-3 text-[0.96rem] font-medium leading-6 text-stone-950 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-amber-300 disabled:cursor-not-allowed disabled:text-stone-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating || reviewLoading || Boolean(reviewError) || (isReviewMode && !selectedAnswer?.id)}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-950 shadow-sm transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
              aria-label="Send message to Zi"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.4} />
              ) : (
                <SendHorizontal className="h-5 w-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
