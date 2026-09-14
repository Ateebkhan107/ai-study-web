"use client";
"use no memo";

import { useState } from "react";
import { BookOpen, Check, ChevronRight, UserRound } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import MathText from "@/components/MathText";
import ZiSpeakButton from "@/components/zi/ZiSpeakButton";
import ZiVisual from "@/components/zi/ZiVisual";
import Logo from "@/components/Logo";

const ACTION_META = {
  dashboard: { label: "Open Dashboard", description: "Return to your main overview", route: "/dashboard" },
  analytics: { label: "Open Analytics", description: "View your performance", route: "/analytics" },
  pyq: { label: "Open PYQs", description: "Practice previous year questions", route: "/pyq" },
  revision: { label: "Open Revision", description: "Review your formula cards", route: "/formula-cards" },
  arena: { label: "Open Battle Arena", description: "Compete with other students", route: "/battle" },
  profile: { label: "Open Profile", description: "Manage your account and goals", route: "/profile" },
  community: { label: "Open Community", description: "Join the discussion", route: "/community" },
  test: { label: "Open Test Center", description: "Take a practice test", route: "/test" },
};

function formatMemoryType(type) {
  return String(type || "learning_note").replace(/_/g, " ");
}

function formatMemoryExpiry(expiresAt) {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatActivity(activity) {
  return String(activity || "study")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildPreparedCustomTestRoute(action) {
  const subjectsList = (action.subjects || []).map((subject) => subject.name);
  const isNeetBiology =
    (action.exam || "NEET") === "NEET" &&
    subjectsList.length === 1 &&
    subjectsList[0] === "Biology";

  const params = new URLSearchParams({
    exam: action.exam || "NEET",
    subjects: subjectsList.join(","),
    chapters: (action.chapters || []).map((chapter) => chapter.name).join(","),
    duration: ((action.questionCount || 10) * 1.5).toString(),
    count: (action.questionCount || 10).toString(),
    difficulty: "Mixed",
    mode: "custom",
  });

  if (isNeetBiology) {
    params.set("sourceType", "PREPZII_PRACTICE");
  }

  return `/test/session?${params.toString()}`;
}

function getPlanStepActionMeta(action) {
  if (!action) return null;

  if (action.type === "open_revision_subject" || action.type === "open_revision_chapter") {
    return {
      label: "Open Revision",
      loadingLabel: "Opening...",
      route: action.trustedRoute,
    };
  }

  if (action.type === "open_pyq_subject" || action.type === "open_pyq_chapter") {
    return {
      label: "Open PYQs",
      loadingLabel: "Opening...",
      route: action.trustedRoute,
    };
  }

  if (action.type === "prepared_custom_test") {
    return {
      label: "Start Test",
      loadingLabel: "Preparing...",
      route: buildPreparedCustomTestRoute(action),
    };
  }

  if (action.type === "open_test_review") {
    return {
      label: "Open Review",
      loadingLabel: "Opening...",
      route: action.trustedRoute,
    };
  }

  return null;
}

function ZiStudyPlan({ plan }) {
  const router = useRouter();
  const pathname = usePathname();
  const [stepStatuses, setStepStatuses] = useState({});

  if (!plan?.steps?.length) return null;

  const setStepStatus = (key, status) => {
    setStepStatuses((current) => ({ ...current, [key]: status }));
  };

  return (
    <div className="mt-5 border-t border-[#2A2A2A] pt-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-black text-slate-200">
            {plan.title}
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {plan.durationMinutes} min plan
          </div>
        </div>
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-400">
        {plan.reason}
      </p>
      <ol className="space-y-3">
        {plan.steps.map((step) => {
          const key = `${step.order}-${step.activity}-${step.durationMinutes}`;
          const actionMeta = getPlanStepActionMeta(step.action);
          const routePath = actionMeta?.route?.split("?")[0];
          const alreadyHere = Boolean(actionMeta?.route && !actionMeta.route.includes("?") && pathname === routePath);
          const status = stepStatuses[key] || "idle";
          const isBusy = status === "opening";

          return (
          <li key={key} className="flex gap-3 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-[#333] bg-[#222] text-xs font-black text-slate-300">
              {step.order}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-200">
                {formatActivity(step.activity)}
                {step.chapter ? ` · ${step.chapter}` : step.subject ? ` · ${step.subject}` : ""} · {step.durationMinutes} min
              </div>
              <div className="text-xs leading-5 text-slate-400">
                {step.goal}
              </div>
              {alreadyHere ? (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  You&apos;re already here
                </div>
              ) : actionMeta?.route ? (
                <div className="mt-2">
                  {status === "error" ? (
                    <div className="mb-1.5 text-xs font-semibold text-rose-500">
                      Zi couldn&apos;t open that step right now.
                    </div>
                  ) : null}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setStepStatus(key, "opening");
                      try {
                        router.push(actionMeta.route);
                        setTimeout(() => setStepStatus(key, "idle"), 3000);
                      } catch {
                        setStepStatus(key, "error");
                      }
                    }}
                    className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      isBusy
                        ? "cursor-wait bg-[#854D0E] text-black"
                        : "bg-[#222] text-slate-200 hover:bg-[#2A2A2A] border border-[#333]"
                    }`}
                  >
                    {isBusy ? actionMeta.loadingLabel : actionMeta.label}
                  </button>
                </div>
              ) : null}
            </div>
          </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function ZiMessage({
  role = "zi",
  children,
  isLoading = false,
  tone = "default",
  action = null,
}) {
  const isUser = role === "user";
  const isError = tone === "error";
  const shouldRenderMarkdown = !isUser && !isError && !isLoading;
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  let destMeta = null;

  if (action) {
    if (action.type === "navigate" && action.destination) {
      destMeta = ACTION_META[action.destination];
    } else if (action.type.startsWith("open_") && action.trustedRoute) {
      if (action.type === "open_pyq_subject" || action.type === "open_pyq_chapter") {
         destMeta = {
            label: "Open PYQs",
            description: action.chapter ? `${action.subject} · Previous Year Questions` : `${action.subject} PYQs`,
            title: action.chapter || action.subject,
            route: action.trustedRoute
         };
      } else if (action.type === "open_revision_subject" || action.type === "open_revision_chapter") {
         destMeta = {
            label: "Open Revision",
            description: action.chapter ? `${action.subject} · Revision Cards` : `${action.subject} Revision`,
            title: action.chapter || action.subject,
            route: action.trustedRoute
         };
      } else if (action.type === "open_test_review") {
         destMeta = {
            label: "Open Review",
            description: "Review this completed test",
            title: "Test Review",
            route: action.trustedRoute
         };
      }
    } else if (action.type === "prepared_custom_test") {
       const subjectNames = (action.subjects || []).map(s => s.name).join(", ");
       const chapterNames = (action.chapters || []).length > 0 ? action.chapters.map(c => c.name).join(" · ") : "All Chapters";

       destMeta = {
          label: "Start Test",
          title: "Custom Test",
          description: (
             <div className="flex flex-col gap-0.5 mt-1">
                <div className="font-medium text-slate-300">{action.questionCount} Questions</div>
                <div>{subjectNames}</div>
                <div className="text-slate-400">{chapterNames}</div>
                {action.source === "weak_chapters" && (
                   <div className="mt-1 text-brand italic">Based on your recent weak areas</div>
                )}
             </div>
          ),
          route: buildPreparedCustomTestRoute(action)
       };
    } else if (action.type === "save_preference") {
       destMeta = {
          isApiAction: true,
          apiPayload: { action: "save", key: action.key, value: action.value },
          label: "Save",
          title: "Save preference",
          description: (
             <div className="flex flex-col gap-0.5 mt-1">
                <div className="font-medium text-slate-300">{action.value}</div>
                <div className="text-slate-400">Default Zi {action.key.replace("_", " ")}</div>
             </div>
          )
       };
    } else if (action.type === "delete_preference") {
       destMeta = {
          isApiAction: true,
          apiPayload: { action: "delete", key: action.key },
          label: "Remove",
          title: "Remove saved preference?",
          description: `Delete your saved preference for ${action.key.replace("_", " ")}.`
       };
    } else if (action.type === "reset_preferences") {
       destMeta = {
          isApiAction: true,
          apiPayload: { action: "reset" },
          label: "Reset Preferences",
          title: "Reset all Zi preferences?",
          description: "This will clear all your saved Zi study preferences. This action cannot be undone."
       };
    } else if (
      action.type === "save_learning_memory" ||
      action.type === "update_learning_memory" ||
      action.type === "delete_learning_memory"
    ) {
      const memory = action.memory || {};
      const isDelete = action.type === "delete_learning_memory";
      const expiryLabel = formatMemoryExpiry(memory.expires_at);
      const scope = [memory.subject, memory.chapter].filter(Boolean).join(" · ");

      destMeta = {
        isApiAction: true,
        apiEndpoint: "/api/zi/memories",
        apiPayload: {
          action: isDelete ? "delete" : action.type === "update_learning_memory" ? "update" : "save",
          memory,
        },
        label: isDelete ? "Remove" : "Save",
        title: isDelete
          ? "Remove learning memory?"
          : memory.expires_at
          ? "Save temporary memory"
          : "Save learning memory",
        description: (
          <div className="flex flex-col gap-0.5 mt-1">
            {scope ? (
              <div className="text-slate-400">{scope}</div>
            ) : null}
            <div className="font-medium text-slate-300">
              {memory.memory_text}
            </div>
            <div className="text-slate-400">
              {formatMemoryType(memory.memory_type)}
              {expiryLabel ? ` · until ${expiryLabel}` : ""}
            </div>
          </div>
        ),
      };
    }
  }

  const [apiActionStatus, setApiActionStatus] = useState("idle");
  const showAction = destMeta && (destMeta.isApiAction ? apiActionStatus === "idle" || apiActionStatus === "error" : pathname !== destMeta.route);
  const studyPlan = action?.type === "study_plan" ? action.plan : null;
  const visual = action?.type === "visual_explanation" ? action.visual : null;

  return (
    <div className={`zi-notebook-reveal flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`text-sm leading-6 ${
          isUser
            ? "max-w-[78%] rounded-md rounded-br-sm border border-[#2A2A2A] bg-[#1E1E1E] px-3.5 py-2.5 text-slate-200"
            : isError
            ? "max-w-[92%] rounded-md border border-[#4A1515] bg-[#1A1111] px-4 py-3 text-red-400"
            : "relative w-full rounded-md border border-[#2A2A2A] bg-[#141414] px-5 py-4 text-slate-200"
        }`}
      >
        {!isUser && !isError ? (
          <div className="mb-3 flex items-center gap-2 border-b border-[#2A2A2A] pb-2 text-[0.66rem] font-black uppercase tracking-[0.16em] text-brand">
            <Logo size={16} showText={false} forceDark={true} />
            <span>Zi Assistant</span>
          </div>
        ) : null}
        {isLoading ? (
          <span className="inline-flex items-center gap-3 text-slate-300">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#333] bg-[#222] text-brand">
              <span className="absolute h-5 w-5 rounded-full border border-[#854D0E] motion-safe:animate-ping" aria-hidden="true" />
              <Logo size={16} showText={false} forceDark={true} />
            </span>
            <span className="font-semibold text-sm">Zi is thinking...</span>
          </span>
        ) : (
          shouldRenderMarkdown ? (
            <MathText className="zi-markdown text-sm leading-6 text-slate-200 [&_blockquote]:my-3 [&_blockquote]:rounded-r-md [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:bg-[#222222] [&_blockquote]:py-2 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-[#222] [&_code]:text-brand [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.82rem] [&_h1]:mb-2 [&_h1]:mt-1 [&_h1]:font-display [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-white [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-white [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-black [&_h3]:text-white [&_li]:pl-0.5 [&_pre]:my-3 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-[#0A0A0A] [&_pre]:border [&_pre]:border-[#2A2A2A] [&_pre]:p-3 [&_pre]:text-slate-300 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit">
              {children}
            </MathText>
          ) : (
            children
          )
        )}

        {studyPlan ? <ZiStudyPlan plan={studyPlan} /> : null}
        {visual ? <ZiVisual visual={visual} /> : null}

        {!isUser && !isError && !isLoading ? <ZiSpeakButton text={children} /> : null}

        {showAction && (
          <div className="mt-4 border-t border-[#2A2A2A] pt-3">
            <div className="mb-2">
              <div className="font-semibold text-slate-200">
                {destMeta.title || destMeta.label.replace("Open ", "")}
              </div>
              <div className="text-xs text-slate-400">
                {destMeta.description}
              </div>
            </div>
            {apiActionStatus === "error" && (
              <div className="mb-3 text-xs font-semibold text-rose-500">
                Zi couldn&apos;t complete that action right now.
              </div>
            )}

            {destMeta.isApiAction ? (
               <div className="flex gap-2">
                 <button
                   type="button"
                   disabled={isNavigating}
                   onClick={async () => {
                     setIsNavigating(true);
                     setApiActionStatus("loading");
                     try {
                        const res = await fetch(destMeta.apiEndpoint || "/api/zi/preferences", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify(destMeta.apiPayload)
                        });
                        if (!res.ok) throw new Error("Failed");
                        setApiActionStatus("success");
                     } catch {
                        setApiActionStatus("error");
                     } finally {
                        setIsNavigating(false);
                     }
                   }}
                   className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      isNavigating
                         ? "cursor-wait bg-[#854D0E] text-black"
                         : "bg-[#222] text-slate-200 hover:bg-[#2A2A2A] border border-[#333]"
                   }`}
                 >
                   {isNavigating ? (destMeta.apiPayload.action === "save" || destMeta.apiPayload.action === "update" ? "Saving..." : destMeta.apiPayload.action === "delete" ? "Removing..." : "Resetting...") : destMeta.label}
                 </button>
                 <button
                   type="button"
                   disabled={isNavigating}
                   onClick={() => setApiActionStatus("dismissed")}
                   className="inline-flex flex-1 items-center justify-center rounded-md bg-[#222] px-3 py-2 text-sm font-semibold text-slate-200 border border-[#333] transition-colors hover:bg-[#2A2A2A]"
                 >
                   Cancel
                 </button>
               </div>
            ) : (
               <button
                 type="button"
                 disabled={isNavigating}
                 onClick={() => {
                    setIsNavigating(true);
                    router.push(destMeta.route);
                    setTimeout(() => setIsNavigating(false), 3000);
                 }}
                 className={`inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isNavigating
                       ? "cursor-wait bg-[#854D0E] text-black"
                       : "bg-[#222] text-slate-200 hover:bg-[#2A2A2A] border border-[#333]"
                 }`}
               >
                 {isNavigating ? (destMeta.label === "Start Test" ? "Preparing test..." : "Preparing...") : destMeta.label}
                 {!isNavigating ? <ChevronRight className="h-4 w-4" strokeWidth={2.4} /> : null}
               </button>
            )}
          </div>
        )}
      </div>

      {isUser ? (
        <span
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-[#333] bg-[#1A1A1A] text-slate-300"
          aria-hidden="true"
        >
          <UserRound className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
      ) : null}
    </div>
  );
}
