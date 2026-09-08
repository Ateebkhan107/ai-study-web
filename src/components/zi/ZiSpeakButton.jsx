"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function stripForSpeech(text) {
  return String(text || "")
    .replace(/__ZI_VALIDATED_ACTION__=.*$/s, "")
    .replace(/__ZI_ACTION__=.*$/s, "")
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\\(([\s\S]*?)\\\)/g, "$1")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$1")
    .replace(/[#*_~>\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ZiSpeakButton({ text, disabled = false }) {
  const utteranceRef = useRef(null);
  const [isSupported, setIsSupported] = useState(() =>
    typeof window === "undefined" ? null : isSpeechSupported()
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (isSpeechSupported()) window.speechSynthesis.cancel();
      utteranceRef.current = null;
    };
  }, []);

  if (!text || disabled || isSupported === false) return null;

  const speakableText = stripForSpeech(text);
  if (!speakableText) return null;

  const handleClick = () => {
    if (!isSpeechSupported()) {
      setIsSupported(false);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speakableText);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`prepzii-interactive mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        isSpeaking
          ? "border-amber-500/50 bg-amber-100 text-amber-800 shadow-[0_0_22px_rgba(234,179,8,0.18)]"
          : "border-amber-900/15 bg-white/55 text-stone-600 hover:border-amber-500/45 hover:text-amber-700"
      }`}
      aria-label={isSpeaking ? "Stop reading response aloud" : "Read response aloud"}
      title={isSpeaking ? "Stop reading response aloud" : "Read response aloud"}
    >
      {isSpeaking ? (
        <VolumeX className="h-3.5 w-3.5" strokeWidth={2.4} />
      ) : (
        <Volume2 className="h-3.5 w-3.5" strokeWidth={2.4} />
      )}
      <span>{isSpeaking ? "Stop" : "Listen"}</span>
      {isSpeaking ? (
        <span className="zi-voice-wave flex h-4 items-center gap-0.5" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : null}
    </button>
  );
}
