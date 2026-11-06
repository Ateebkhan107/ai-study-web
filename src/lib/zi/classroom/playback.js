export const initialPlayback = { step: 0, elapsedMs: 0, playing: false };

export function playbackReducer(state, event) {
  switch (event.type) {
    case "reset":
      return initialPlayback;
    case "select":
      return { ...initialPlayback, step: event.step };
    case "play":
      return {
        ...state,
        elapsedMs: state.elapsedMs >= event.durationMs ? 0 : state.elapsedMs,
        playing: event.durationMs > 0,
      };
    case "pause":
      return state.playing ? { ...state, playing: false } : state;
    case "replay":
      return { ...state, elapsedMs: 0, playing: event.durationMs > 0 };
    case "tick": {
      if (!state.playing) return state;
      const elapsedMs = Math.min(state.elapsedMs + event.deltaMs, event.durationMs);
      return { ...state, elapsedMs, playing: elapsedMs < event.durationMs };
    }
    default:
      return state;
  }
}
