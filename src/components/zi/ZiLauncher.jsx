"use client";

import { readBuilderToken, rememberBuilderAction, clearBuilderToken } from "@/components/zi/testBuilderSession";
import { useUser } from "@clerk/nextjs";
import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import ZiStartupGreeting from "@/components/zi/ZiStartupGreeting";
import { usePathname } from "next/navigation";
import { useZiPageContext } from "@/lib/zi/pageContext";
import { readZiChat } from "@/lib/zi/chatFrames";

const ZiPanel = lazy(() => import("@/components/zi/ZiPanel"));

class ZiPanelBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (!this.props.isOpen) return null;
    return (
      <div role="alert" className="fixed bottom-6 right-6 z-[65] rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-sm">
        Zi could not load. Reload this page to try again.
        <button type="button" className="ml-2 underline" onClick={this.props.onClose}>Close</button>
      </div>
    );
  }
}

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "zi",
  text: "What are you working on? I can help you understand, revise, or figure out what to do next.",
};

const ZI_ERROR_MESSAGE = "Zi couldn't respond right now. Try again in a moment.";
const ZI_ABORT_MESSAGE = "Stopped.";
const MAX_CLIENT_HISTORY = 12;

export function isZiTrialLocked(plan, usage, remaining) {
  // Held requests and accounting outages still allow the server to report a
  // retryable error. The server remains responsible for prompt admission.
  const trialUnavailable = usage?.available === false ||
    (usage?.pending > 0 && usage?.used < 3 && usage?.remaining <= 0);
  return plan !== "AI_MODE" && remaining <= 0 && !trialUnavailable;
}

function createMessage(role, text, status = "done") {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    status,
  };
}

function getZiGreetingName(user) {
  const firstName = String(user?.firstName || "").trim();
  if (firstName) return firstName;

  const fullNameFirstWord = String(user?.fullName || "").trim().split(/\s+/)[0];
  if (fullNameFirstWord) return fullNameFirstWord;

  const username = String(user?.username || "").trim().replace(/^@+/, "");
  if (username) return username;

  return "";
}

export default function ZiLauncher(props) {
  const identity = useUser();
  return <ZiLauncherSession key={identity.user?.id || "signed-out"} {...props} {...identity} />;
}

function ZiLauncherSession({ plan, ziFreeUsage, classroomFixtureOwner, isLoaded, isSignedIn, user }) {
  const pathname = usePathname();
  const pageContext = useZiPageContext();
  const usageRemaining = ziFreeUsage?.remaining !== undefined ? ziFreeUsage.remaining : 3;
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartupGreetingActive, setIsStartupGreetingActive] = useState(false);
  const [freePromptState, setFreePromptState] = useState({
    sourceRemaining: usageRemaining,
    remaining: usageRemaining,
  });
  const abortControllerRef = useRef(null);
  const greetingName = getZiGreetingName(user);
  const remainingFreePrompts = freePromptState.remaining;

  // Adjust state when the server's usage snapshot changes, without an effect.
  if (freePromptState.sourceRemaining !== usageRemaining) {
    setFreePromptState({
      sourceRemaining: usageRemaining,
      remaining: usageRemaining,
    });
  }

  const isLocked = isZiTrialLocked(plan, ziFreeUsage, remainingFreePrompts);
  const panelLocked = isLocked && !messages.some((message) => message.action?.type === "ai_test_builder");
  const classroomAvailable = Boolean(
    classroomFixtureOwner && isSignedIn && user?.id === classroomFixtureOwner &&
    !panelLocked && !["test", "pyq", "arena"].includes(pageContext.pageType)
  );

  useEffect(() => {
    if (!isOpen || classroomAvailable) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, classroomAvailable]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessageRef = useRef(null);

  useEffect(() => {
    let pendingPrompt;
    const handleOpenZi = (event) => {
      setHasOpened(true);
      setIsOpen(true);
      const prompt = event?.detail?.prompt;
      if (prompt && sendMessageRef.current) {
        clearTimeout(pendingPrompt);
        pendingPrompt = setTimeout(() => {
          sendMessageRef.current?.(prompt);
        }, 100);
      }
    };

    window.addEventListener("prepzii:open-zi", handleOpenZi);
    return () => {
      clearTimeout(pendingPrompt);
      window.removeEventListener("prepzii:open-zi", handleOpenZi);
    };
  }, []);

  const buildRequestMessages = (nextUserMessage) => {
    return [...messages, nextUserMessage]
      .filter((message) => message.id !== WELCOME_MESSAGE.id)
      .filter((message) => message.status !== "error")
      .filter((message) => message.status !== "streaming")
      .filter((message) => message.text?.trim())
      .map((message) => ({
        role: message.role === "zi" ? "assistant" : "user",
        content: message.text.trim(),
      }))
      .slice(-MAX_CLIENT_HISTORY);
  };

  const updateAssistantMessage = (messageId, updater) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, ...updater(message) } : message
      )
    );
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsThinking(false);
    setIsGenerating(false);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || abortControllerRef.current) return;

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("zi", "", "streaming");
    const requestMessages = buildRequestMessages(userMessage);
    const abortController = new AbortController();

    abortControllerRef.current = abortController;

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setIsThinking(true);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/zi/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages, pageContext, testBuilderToken: readBuilderToken(user?.id) }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        if ([400, 410].includes(response.status)) clearBuilderToken(user?.id);
        const payload = await response.json().catch(() => ({}));
        if (payload.error === "AI_MODE_REQUIRED") {
          setFreePromptState((current) => ({ ...current, remaining: 0 }));
        }
        const statusMessage = (typeof payload.error === "string" && payload.error !== "AI_MODE_REQUIRED" ? payload.error : payload.message) || (
          response.status === 401
            ? "Please sign in again to chat with Zi."
            : response.status === 403
            ? "You've used all 3 free trial prompts. Upgrade to AI Mode to continue chatting with Zi."
            : response.status === 400
            ? "That message could not be sent. Try a shorter question."
            : response.status === 429
            ? "Zi needs a short breather. Try again in a moment."
            : ZI_ERROR_MESSAGE);

        updateAssistantMessage(assistantMessage.id, () => ({
          text: statusMessage,
          status: "error",
        }));
        return;
      }

      if (plan !== "AI_MODE" && response.headers.get("X-Zi-Prompt-Charged") !== "0") {
        setFreePromptState((current) => ({
          ...current,
          remaining: Math.max(0, current.remaining - 1),
        }));
      }

      const { text: finalText, action: finalAction } = await readZiChat(response, (text) => {
        setIsThinking(false);
        updateAssistantMessage(assistantMessage.id, () => ({ text, status: "streaming" }));
      }, abortController.signal);

      rememberBuilderAction(user?.id, finalAction);
      updateAssistantMessage(assistantMessage.id, () => ({
        text: finalText || ZI_ERROR_MESSAGE,
        action: finalAction,
        status: finalText ? "done" : "error",
      }));
    } catch (error) {
      if (abortController.signal.aborted || error?.name === "AbortError") {
        updateAssistantMessage(assistantMessage.id, (message) => ({
          text: message.text || ZI_ABORT_MESSAGE,
          status: "done",
        }));
        return;
      }

      updateAssistantMessage(assistantMessage.id, () => ({
        text: ZI_ERROR_MESSAGE,
        status: "error",
      }));
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
        setIsThinking(false);
        setIsGenerating(false);
      }
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  const isSolvingSession = (pageContext.pageType === "test" || pageContext.pageType === "pyq") && pathname?.includes("/session");
  const isZiWorkspace = pathname === "/zi";

  if (isSolvingSession || isZiWorkspace) {
    return null;
  }

  return (
    <>
      <ZiStartupGreeting
        displayName={greetingName}
        disabled={!isLoaded || !isSignedIn || isOpen || plan !== "AI_MODE"}
        onActiveChange={setIsStartupGreetingActive}
      />

      <button
        type="button"
        onClick={() => {
          setHasOpened(true);
          setIsOpen(true);
        }}
        className={`prepzii-interactive group fixed right-0 top-1/2 z-[55] flex -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-l-xl border-y border-l border-brand/20 bg-[var(--card)]/95 px-2 py-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-transform hover:-translate-x-1 hover:border-brand/40 sm:px-2.5 ${
          isOpen ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        }`}
        aria-label="Open Zi study companion"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Logo size={20} showText={false} className="opacity-90 grayscale group-hover:grayscale-0 transition-all duration-300" />
        <span className="font-display text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-brand transition-colors duration-300" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          Zi Assistant
        </span>
      </button>

      {hasOpened && (
        <ZiPanelBoundary isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Suspense fallback={isOpen ? (
            <div role="status" className="fixed bottom-6 right-6 z-[65] rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-sm">
              Loading Zi… <button type="button" className="ml-2 underline" onClick={() => setIsOpen(false)}>Cancel</button>
            </div>
          ) : null}>
            <ZiPanel
              key={classroomAvailable ? classroomFixtureOwner : "zi-panel"}
              classroomAvailable={classroomAvailable}
              isOpen={isOpen}
              messages={messages}
              input={input}
              isThinking={isThinking}
              isGenerating={isGenerating}
              pageType={pageContext.pageType}
              entityType={pageContext.entity?.type}
              onClose={() => setIsOpen(false)}
              onInputChange={setInput}
              onSend={() => sendMessage(input)}
              onStop={stopGeneration}
              onSuggestionSelect={sendMessage}
              isLocked={panelLocked}
              onConfigureTest={() => sendMessage("Create an AI practice test")}
              plan={plan}
              remainingFreePrompts={remainingFreePrompts}
            />
          </Suspense>
        </ZiPanelBoundary>
      )}
    </>
  );
}
