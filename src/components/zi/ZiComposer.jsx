import { SendHorizontal } from "lucide-react";

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
      className="border-t border-slate-200/70 bg-[var(--card)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:px-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <label htmlFor="zi-composer" className="sr-only">
        Ask Zi anything
      </label>
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-brand dark:border-[var(--border)] dark:bg-[#11110f]">
        <textarea
          id="zi-composer"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask Zi anything..."
          disabled={disabled}
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-slate-500"
        />
        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            className="prepzii-interactive h-10 shrink-0 rounded-xl border border-slate-300 px-3 text-xs font-black text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-[var(--border)] dark:text-slate-200 dark:hover:bg-[var(--surface-elevated)]"
          >
            Stop
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!canSend}
          className="prepzii-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-black transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-[var(--surface-elevated)] dark:disabled:text-slate-600"
          aria-label="Send message to Zi"
        >
          <SendHorizontal className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
