"use client";

/**
 * battleAudio.js
 * High-performance Web Audio API sound synthesizer and Web Speech API announcer for PrepZii Battle Arena.
 * Zero external audio files required - works 100% offline with zero latency and no asset loading delays.
 * Fully respects browser autoplay policies by initializing only on user interaction.
 */

let audioCtx = null;

const SOUND_STORAGE_KEY = "prepzii_arena_sound_enabled";
const VOICE_STORAGE_KEY = "prepzii_arena_voice_enabled";

export function getSoundEnabled() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

export function setSoundEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
}

export function getVoiceEnabled() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(VOICE_STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

export function setVoiceEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOICE_STORAGE_KEY, enabled ? "true" : "false");
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function unlockAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

/**
 * Plays a single synthesized tone with ADSR envelope.
 */
function playTone({ freq, duration = 0.15, type = "sine", gain = 0.15, detune = 0, delay = 0 }) {
  if (!getSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (detune) osc.detune.setValueAtTime(detune, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// 1. Matchmaking Radar Pulse
export function playMatchmakingPulse() {
  if (!getSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(587.33, t); // D5
  osc.frequency.exponentialRampToValueAtTime(440, t + 0.35); // A4

  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.4);
}

// 2. Opponent Found Chime (Energetic Triad)
export function playOpponentFound() {
  if (!getSoundEnabled()) return;
  playTone({ freq: 523.25, duration: 0.12, gain: 0.18, delay: 0 }); // C5
  playTone({ freq: 659.25, duration: 0.14, gain: 0.2, delay: 0.1 }); // E5
  playTone({ freq: 783.99, duration: 0.28, gain: 0.22, delay: 0.2 }); // G5
  playTone({ freq: 1046.50, duration: 0.4, gain: 0.25, delay: 0.32 }); // C6
}

// 3. Countdown Tick (3, 2, 1)
export function playCountdownTick(num) {
  if (!getSoundEnabled()) return;
  const freq = num === 1 ? 880 : 784;
  playTone({ freq, duration: 0.1, type: "triangle", gain: 0.2 });
}

// 4. GO Start Chime (Major Triad Strike)
export function playGoSound() {
  if (!getSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major Chord
  freqs.forEach((freq) => {
    playTone({ freq, duration: 0.6, type: "sine", gain: 0.12 });
  });
}

// 5. Answer Selection Tactile Click
export function playAnswerSelect() {
  if (!getSoundEnabled()) return;
  playTone({ freq: 680, duration: 0.04, type: "triangle", gain: 0.12 });
}

// 6. Correct Answer Chime
export function playCorrectSound() {
  if (!getSoundEnabled()) return;
  playTone({ freq: 880, duration: 0.12, gain: 0.18, delay: 0 }); // A5
  playTone({ freq: 1174.66, duration: 0.25, gain: 0.2, delay: 0.08 }); // D6
}

// 7. Incorrect Answer Muted Tone
export function playIncorrectSound() {
  if (!getSoundEnabled()) return;
  playTone({ freq: 240, duration: 0.18, type: "sawtooth", gain: 0.08, delay: 0 });
  playTone({ freq: 196, duration: 0.25, type: "sawtooth", gain: 0.08, delay: 0.1 });
}

// 8. Timer Warning (Urgent tick)
export function playTimerWarning() {
  if (!getSoundEnabled()) return;
  playTone({ freq: 950, duration: 0.05, type: "square", gain: 0.06 });
  playTone({ freq: 950, duration: 0.05, type: "square", gain: 0.06, delay: 0.08 });
}

// 9. Victory Fanfare
export function playVictoryFanfare() {
  if (!getSoundEnabled()) return;
  const notes = [
    { freq: 523.25, duration: 0.12, delay: 0 },
    { freq: 659.25, duration: 0.12, delay: 0.12 },
    { freq: 783.99, duration: 0.16, delay: 0.24 },
    { freq: 1046.50, duration: 0.5, delay: 0.4 },
  ];
  notes.forEach((n) => playTone({ freq: n.freq, duration: n.duration, delay: n.delay, gain: 0.2 }));
}

// 10. Defeat Tone
export function playDefeatChime() {
  if (!getSoundEnabled()) return;
  const notes = [
    { freq: 587.33, duration: 0.16, delay: 0 },
    { freq: 523.25, duration: 0.18, delay: 0.16 },
    { freq: 440.00, duration: 0.45, delay: 0.34 },
  ];
  notes.forEach((n) => playTone({ freq: n.freq, duration: n.duration, delay: n.delay, gain: 0.15 }));
}

// ==========================================
// ARENA VOICE ANNOUNCER (Web Speech API)
// ==========================================

export function speakAnnouncer(text) {
  if (!getVoiceEnabled()) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop prior queue
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.08;
    utterance.pitch = 1.0;
    utterance.volume = 0.85;

    // Pick crisp English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith("en") && !v.localService) || voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis failover
  }
}
