const SUGGESTIONS = [
  "What should I study now?",
  "Show my weak topics",
  "Quick revision",
  "Explain something",
];

export default function ZiSuggestions({ onSelect, disabled = false }) {
  return (
    <div className="border-t border-slate-200/70 px-4 py-3 dark:border-[var(--border-subtle)] sm:px-5">
      <p className="sr-only">Suggested prompts</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="prepzii-interactive rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/60 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-slate-300 dark:hover:border-brand/60 dark:hover:text-white"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
