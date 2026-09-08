"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import ZiCoreOrb from "@/components/zi/ZiCoreOrb";

const MAX_RECORDING_MS = 45_000;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const FALLBACK_AUDIO_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getMediaRecorderType() {
  if (typeof MediaRecorder === "undefined") return "";
  return FALLBACK_AUDIO_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function canUseFallbackRecorder() {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

function getRecognitionLocale(preferredLanguage) {
  const preference = String(preferredLanguage || "").toLowerCase();
  if (preference.includes("hindi")) return "hi-IN";
  if (preference.includes("hinglish")) return "en-IN";

  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("hi")) {
    return "hi-IN";
  }

  return "en-IN";
}

function logVoiceLifecycle(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
}

function logVoiceError(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
}

async function getMicrophonePermissionState() {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unsupported";
  }

  try {
    const permission = await navigator.permissions.query({ name: "microphone" });
    return permission?.state || "unknown";
  } catch {
    return "unknown";
  }
}

function getVoiceErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone permission was blocked.";
  }
  if (error === "no-speech") return "No speech detected.";
  if (error === "network") return "Voice input stopped unexpectedly.";
  return "Voice input couldn't start.";
}

function getRecorderErrorMessage(error) {
  if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
    return "Microphone permission was blocked.";
  }
  if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
    return "No microphone was found.";
  }
  return "Voice recording couldn't start.";
}

function shouldFallbackFromNativeError(error) {
  return error === "not-allowed" || error === "service-not-allowed" || error === "network";
}

function normalizeTranscript(transcript) {
  return String(transcript || "").replace(/\s+/g, " ").trim();
}

function stopStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

export default function ZiVoiceInput({
  disabled = false,
  onTranscript,
}) {
  const recognitionRef = useRef(null);
  const recorderRef = useRef(null);
  const recorderStreamRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const recorderTimeoutRef = useRef(null);
  const nativeStartFailuresRef = useRef(0);
  const [isSupported, setIsSupported] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setIsSupported(Boolean(getSpeechRecognition()) || canUseFallbackRecorder());
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/zi/preferences?key=preferred_language")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && data?.value) setPreferredLanguage(data.value);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
      recorderRef.current?.stop?.();
      recorderRef.current = null;
      stopStream(recorderStreamRef.current);
      recorderStreamRef.current = null;
      if (recorderTimeoutRef.current) clearTimeout(recorderTimeoutRef.current);
    };
  }, []);

  if (isSupported === false) {
    return null;
  }

  const isListening = status === "listening";
  const isTranscribing = status === "transcribing";

  const stopListening = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }

    recognitionRef.current?.stop?.();
    setStatus("transcribing");
  };

  const stopCurrentRecording = () => {
    if (recorderTimeoutRef.current) {
      clearTimeout(recorderTimeoutRef.current);
      recorderTimeoutRef.current = null;
    }
    stopStream(recorderStreamRef.current);
    recorderStreamRef.current = null;
    recorderRef.current = null;
  };

  const requestMicrophoneStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException("getUserMedia is unavailable.", "NotSupportedError");
    }

    return navigator.mediaDevices.getUserMedia({ audio: true });
  };

  const transcribeFallbackAudio = async (blob) => {
    if (!blob?.size) {
      setErrorMessage("No speech detected.");
      setStatus("error");
      return;
    }

    if (blob.size > MAX_AUDIO_BYTES) {
      setErrorMessage("Voice note is too long. Try a shorter recording.");
      setStatus("error");
      return;
    }

    setStatus("transcribing");

    const formData = new FormData();
    formData.append("audio", blob, "zi-voice.webm");

    const response = await fetch("/api/zi/transcribe", {
      method: "POST",
      body: formData,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      if (payload?.code === "NO_SPEECH") {
        setErrorMessage("No speech detected.");
      } else if (response.status === 401) {
        setErrorMessage("Please sign in again to use voice input.");
      } else if (response.status === 413) {
        setErrorMessage("Voice note is too long. Try a shorter recording.");
      } else if (response.status === 415) {
        setErrorMessage("Voice recording format isn't supported here.");
      } else {
        setErrorMessage("Transcription failed. Try typing or recording again.");
      }
      setStatus("error");
      return;
    }

    const transcript = normalizeTranscript(payload?.text);
    if (!transcript) {
      setErrorMessage("No speech detected.");
      setStatus("error");
      return;
    }

    onTranscript(transcript);
    setStatus("idle");
  };

  const startFallbackRecording = async (reason, existingStream = null) => {
    logVoiceLifecycle("[Zi Voice] fallback recording:", reason);

    if (!canUseFallbackRecorder()) {
      setErrorMessage("Voice recording isn't supported in this browser.");
      setStatus("error");
      return;
    }

    let stream = existingStream;
    try {
      stream ||= await requestMicrophoneStream();
    } catch (error) {
      setErrorMessage(getRecorderErrorMessage(error));
      setStatus("error");
      return;
    }

    const mimeType = getMediaRecorderType();
    let recorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (error) {
      stopStream(stream);
      setErrorMessage(getRecorderErrorMessage(error));
      setStatus("error");
      return;
    }

    recorderChunksRef.current = [];
    recorderStreamRef.current = stream;
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data?.size) recorderChunksRef.current.push(event.data);
    };

    recorder.onerror = () => {
      stopCurrentRecording();
      setErrorMessage("Voice recording failed. Try again.");
      setStatus("error");
    };

    recorder.onstop = () => {
      const chunks = recorderChunksRef.current;
      const type = recorder.mimeType || mimeType || "audio/webm";
      stopCurrentRecording();
      const blob = new Blob(chunks, { type });
      transcribeFallbackAudio(blob).catch((error) => {
        logVoiceError("[Zi Voice] transcription failed:", error);
        setErrorMessage("Transcription failed. Try typing or recording again.");
        setStatus("error");
      });
    };

    try {
      recorder.start(1000);
      setStatus("listening");
      setInterimTranscript("");
      recorderTimeoutRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (error) {
      stopCurrentRecording();
      setErrorMessage(getRecorderErrorMessage(error));
      setStatus("error");
    }
  };

  const handleNativeRecognitionError = async (event) => {
    logVoiceLifecycle("[Zi Voice] recognition error:", event.error, event.message);
    setInterimTranscript("");

    if (!shouldFallbackFromNativeError(event.error)) {
      setErrorMessage(getVoiceErrorMessage(event.error));
      setStatus("error");
      return;
    }

    recognitionRef.current = null;

    let stream;
    try {
      stream = await requestMicrophoneStream();
    } catch (error) {
      setErrorMessage(getRecorderErrorMessage(error));
      setStatus("error");
      return;
    }

    await startFallbackRecording(`native-${event.error}`, stream);
  };

  const startNativeRecognition = (SpeechRecognition) => {
    window.speechSynthesis?.cancel?.();

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getRecognitionLocale(preferredLanguage);

    recognition.onstart = () => {
      logVoiceLifecycle("[Zi Voice] recognition started");
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript || "";
        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      const normalizedInterim = normalizeTranscript(interim);
      const normalizedFinal = normalizeTranscript(finalTranscript);

      if (normalizedInterim) setInterimTranscript(normalizedInterim);
      if (normalizedFinal) {
        setStatus("transcribing");
        onTranscript(normalizedFinal);
      }
    };

    recognition.onerror = (event) => {
      handleNativeRecognitionError(event);
    };

    recognition.onend = () => {
      logVoiceLifecycle("[Zi Voice] recognition ended");
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setInterimTranscript("");
        setStatus((currentStatus) => (currentStatus === "error" ? "error" : "idle"));
      }
    };

    recognitionRef.current = recognition;

    try {
      logVoiceLifecycle("[Zi Voice] starting recognition");
      recognition.start();
      nativeStartFailuresRef.current = 0;
    } catch (err) {
      logVoiceError("[Zi Voice] start failed:", err);
      recognitionRef.current = null;
      nativeStartFailuresRef.current += 1;

      if (nativeStartFailuresRef.current >= 2) {
        startFallbackRecording("repeated-native-start-failure");
      } else {
        setErrorMessage("Voice input couldn't start. Try the mic again.");
        setStatus("error");
      }
    }
  };

  const startListening = async () => {
    logVoiceLifecycle("[Zi Voice] mic clicked");
    setErrorMessage(null);
    setStatus("idle");
    setInterimTranscript("");

    const permissionState = await getMicrophonePermissionState();
    logVoiceLifecycle("[Zi Voice] permission state:", permissionState);

    const SpeechRecognition = getSpeechRecognition();
    logVoiceLifecycle("[Zi Voice] recognition available:", Boolean(SpeechRecognition));

    if (SpeechRecognition) {
      startNativeRecognition(SpeechRecognition);
      return;
    }

    await startFallbackRecording("native-unsupported");
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={disabled || isSupported === null}
        onClick={isListening ? stopListening : startListening}
        className={`prepzii-interactive group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          isListening
            ? "border-brand/80 bg-brand/15 text-brand shadow-[0_0_24px_rgba(234,179,8,0.28)]"
            : isTranscribing
            ? "border-brand/50 bg-brand/10 text-brand"
            : "border-white/10 bg-white/5 text-stone-300 hover:border-brand/50 hover:text-brand"
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        title={isListening ? "Stop voice input" : "Start voice input"}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-45 transition-opacity group-hover:opacity-70" aria-hidden="true">
          <ZiCoreOrb
            size="sm"
            state={isListening ? "listening" : isTranscribing ? "thinking" : "idle"}
            showRings={isListening || isTranscribing}
          />
        </span>
        {isListening ? (
          <MicOff className="relative z-10 h-4 w-4" strokeWidth={2.4} />
        ) : (
          <Mic className="relative z-10 h-4 w-4" strokeWidth={2.4} />
        )}
      </button>
      {isListening ? (
        <span className="max-w-36 truncate text-[0.68rem] font-semibold text-brand">
          {interimTranscript || "Listening..."}
        </span>
      ) : isTranscribing ? (
        <span className="max-w-36 truncate text-[0.68rem] font-semibold text-brand">
          Transcribing...
        </span>
      ) : errorMessage ? (
        <span className="max-w-44 text-right text-[0.68rem] font-semibold leading-4 text-red-200">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
