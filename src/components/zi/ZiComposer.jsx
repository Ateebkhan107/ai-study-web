import { SendHorizontal, Square } from "lucide-react";
import ZiVoiceInput from "@/components/zi/ZiVoiceInput";

export default function ZiComposer({
  value,
  onChange,
  onSend,
  onStop,
  disabled = false,
  isGenerating = false,
}) {
  const canSend = value.trim().length > 0 && !disabled;

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (canSend) onSend();
  };

  return (
    <form
      className="border-t border-[var(--border-subtle)] bg-[var(--card)]/50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <label htmlFor="zi-composer" className="sr-only">
        Ask Zi anything
      </label>
      <div className="flex items-end gap-2 rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-2 shadow-sm focus-within:border-brand/50">
        <textarea
          id="zi-composer"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask Zi anything..."
          disabled={disabled}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
        />
        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            className="prepzii-interactive flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 text-xs font-black text-red-200 transition-colors hover:border-red-500/60 hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            <Square className="h-3 w-3 fill-current" strokeWidth={2.4} />
            Stop
          </button>
        ) : null}
        {!isGenerating ? (
          <ZiVoiceInput
            disabled={disabled}
            onTranscript={(transcript) => {
              const separator = value.trim() ? " " : "";
              onChange(`${value.trimEnd()}${separator}${transcript}`);
            }}
          />
        ) : null}
        <button
          type="submit"
          disabled={!canSend}
          className="prepzii-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-black shadow-md transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Send message to Zi"
        >
          <SendHorizontal className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
