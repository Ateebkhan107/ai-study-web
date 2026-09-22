"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import ZiPanel from "@/components/zi/ZiPanel";
import ZiStartupGreeting from "@/components/zi/ZiStartupGreeting";
import { usePathname } from "next/navigation";
import { useZiPageContext } from "@/lib/zi/pageContext";

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

export default function ZiLauncher({ plan }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();
  const pageContext = useZiPageContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartupGreetingActive, setIsStartupGreetingActive] = useState(false);
  const abortControllerRef = useRef(null);
  const greetingName = getZiGreetingName(user);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
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
        body: JSON.stringify({ messages: requestMessages, pageContext }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        const statusMessage =
          response.status === 401
            ? "Please sign in again to chat with Zi."
            : response.status === 400
            ? "That message could not be sent. Try a shorter question."
            : response.status === 429
            ? "Zi needs a short breather. Try again in a moment."
            : ZI_ERROR_MESSAGE;

        updateAssistantMessage(assistantMessage.id, () => ({
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
        setIsThinking(false);

        let displayText = streamedText;
        let displayAction = null;
        const actionIdx = streamedText.indexOf("__ZI_VALIDATED_ACTION__=");
        if (actionIdx !== -1) {
          displayText = streamedText.substring(0, actionIdx).trim();
          try {
            const actionStr = streamedText.substring(actionIdx + "__ZI_VALIDATED_ACTION__=".length).trim();
            if (actionStr) {
               displayAction = JSON.parse(actionStr);
            }
          } catch(e) {
            // ignore partial JSON during streaming
          }
        }

        updateAssistantMessage(assistantMessage.id, () => ({
          text: displayText,
          action: displayAction,
          status: "streaming",
        }));
      }

      const trailingText = decoder.decode();
      if (trailingText) {
        streamedText += trailingText;
      }

      let finalText = streamedText;
      let finalAction = null;
      const actionIdxFinal = streamedText.indexOf("__ZI_VALIDATED_ACTION__=");
      if (actionIdxFinal !== -1) {
         finalText = streamedText.substring(0, actionIdxFinal).trim();
         try {
            const actionStr = streamedText.substring(actionIdxFinal + "__ZI_VALIDATED_ACTION__=".length).trim();
            if (actionStr) {
               finalAction = JSON.parse(actionStr);
            }
         } catch(e) {}
      }

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

  const isSolvingSession = (pageContext.pageType === "test" || pageContext.pageType === "pyq") && pathname?.includes("/session");

  if (isSolvingSession) {
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
        isLocked={plan !== "AI_MODE"}
        plan={plan}
      />
    </>
  );
}
