const SUGGESTIONS_BY_PAGE = {
  dashboard: [
    "What's my mission today?",
    "Find my weakest chapter",
    "Plan a quick revision",
  ],
  test: [
    "Test-taking strategy",
    "Time management tips",
    "How to handle tough questions",
  ],
  pyq: [
    "High-yield topics analysis",
    "Explain tricky concepts",
    "Problem solving frameworks",
  ],
  revision: [
    "Active recall practice",
    "Quiz me on this",
    "Simplify complex topics",
  ],
  analytics: [
    "Identify weak areas",
    "Performance breakdown",
    "How to improve accuracy",
  ],
  profile: [
    "Update my study goals",
    "Adjust target exam",
    "Change my prep track",
  ],
  community: [
    "How to ask good doubts",
    "Explain my problem better",
    "Find study partners",
  ],
  arena: [
    "Speed vs accuracy strategy",
    "How to stay focused",
    "Handling exam pressure",
  ],
  unknown: [
    "Test my knowledge",
    "Explain a concept",
    "Help me plan",
  ],
};

const SUGGESTIONS_BY_ENTITY = {
  pyq_question: [
    "Give me a hint",
    "Break down this question",
    "Why is my approach wrong?",
    "Explain the core concept",
  ],
  revision_card: [
    "Explain this simply",
    "Quiz me from this",
    "Give me a memory trick",
    "What's the key takeaway?",
  ],
  test_question: [
    "Give me a hint",
    "Explain the concept",
    "What is the catch here?",
    "Help me approach this",
  ],
  test_result: [
    "Where did I lose marks?",
    "What should I revise?",
    "Which subject hurt me most?",
    "Analyze this test",
  ],
};

export default function ZiSuggestions({
  onSelect,
  disabled = false,
  pageType = "unknown",
  entityType,
}) {
  const suggestions =
    SUGGESTIONS_BY_ENTITY[entityType] ||
    SUGGESTIONS_BY_PAGE[pageType] ||
    SUGGESTIONS_BY_PAGE.unknown;

  return (
    <div className="border-t border-[var(--border-subtle)] px-4 py-3 sm:px-5">
      <p className="sr-only">Suggested prompts</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="prepzii-interactive rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-brand shadow-sm transition-colors hover:border-brand hover:bg-brand/20 hover:text-amber-900 dark:hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
