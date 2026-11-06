"use client";

import { readBuilderToken, rememberBuilderAction, clearBuilderToken } from "@/components/zi/testBuilderSession";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import ZiPanel from "@/components/zi/ZiPanel";
import ZiStartupGreeting from "@/components/zi/ZiStartupGreeting";
import { usePathname } from "next/navigation";
import { useZiPageContext } from "@/lib/zi/pageContext";
import { readZiChat } from "@/lib/zi/chatFrames";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "zi",
  text: "What are you working on? I can help you understand, revise, or figure out what to do next.",
};

const ZI_ERROR_MESSAGE = "Zi couldn't respond right now. Try again in a moment.";
const ZI_ABORT_MESSAGE = "Stopped.";
const MAX_CLIENT_HISTORY = 12;

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

export default function ZiLauncher({ plan, ziFreeUsage, classroomFixtureOwner }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();
  const pageContext = useZiPageContext();
  const usageRemaining = ziFreeUsage?.remaining !== undefined ? ziFreeUsage.remaining : 3;
  const [isOpen, setIsOpen] = useState(false);
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

  // An accounting outage or held request is not an exhausted trial. Keep the
  // existing composer available to show the server's retryable error; it remains
  // the authority for admission and never dispatches without a reservation.
  const trialUnavailable = ziFreeUsage?.available === false ||
    (ziFreeUsage?.pending > 0 && ziFreeUsage?.used < 3 && usageRemaining <= 0);
  const isLocked = plan !== "AI_MODE" && remainingFreePrompts <= 0 && !trialUnavailable;
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
    const handleOpenZi = (event) => {
      setIsOpen(true);
      const prompt = event?.detail?.prompt;
      if (prompt && sendMessageRef.current) {
        setTimeout(() => {
          sendMessageRef.current?.(prompt);
        }, 100);
      }
    };

    window.addEventListener("prepzii:open-zi", handleOpenZi);
    return () => window.removeEventListener("prepzii:open-zi", handleOpenZi);
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
    if (!trimmed || isGenerating) return;

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("zi", "", "streaming");
    const requestMessages = buildRequestMessages(userMessage);
    const abortController = new AbortController();

    abortControllerRef.current?.abort();
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
      }
      setIsThinking(false);
      setIsGenerating(false);
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
        onClick={() => setIsOpen(true)}
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
    </>
  );
}
