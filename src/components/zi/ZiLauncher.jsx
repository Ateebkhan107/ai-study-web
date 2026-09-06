"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import ZiPanel from "@/components/zi/ZiPanel";

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

export default function ZiLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);

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
        body: JSON.stringify({ messages: requestMessages }),
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
        updateAssistantMessage(assistantMessage.id, () => ({
          text: streamedText,
          status: "streaming",
        }));
      }

      const trailingText = decoder.decode();
      if (trailingText) {
        streamedText += trailingText;
      }

      updateAssistantMessage(assistantMessage.id, () => ({
        text: streamedText || ZI_ERROR_MESSAGE,
        status: streamedText ? "done" : "error",
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`prepzii-interactive fixed right-4 z-[55] inline-flex h-12 items-center gap-2 rounded-full border border-brand/30 bg-[#151411] px-4 text-sm font-black text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:border-brand/60 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-[#11110f] sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:right-6 ${
          isOpen ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
        } bottom-[calc(5.75rem+env(safe-area-inset-bottom))]`}
        aria-label="Open Zi study companion"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-4 w-4 text-brand" strokeWidth={2.4} />
        <span>Zi</span>
      </button>

      <ZiPanel
        isOpen={isOpen}
        messages={messages}
        input={input}
        isThinking={isThinking}
        isGenerating={isGenerating}
        onClose={() => setIsOpen(false)}
        onInputChange={setInput}
        onSend={() => sendMessage(input)}
        onStop={stopGeneration}
        onSuggestionSelect={sendMessage}
      />
    </>
  );
}
