const SUGGESTIONS_BY_PAGE = {
  dashboard: [
    "What should I do here?",
    "Help me start studying",
    "Explain PrepZii features",
  ],
  test: [
    "Give me test strategy",
    "How should I manage time?",
    "Help me stay calm",
  ],
  pyq: [
    "How should I approach PYQs?",
    "Explain a concept",
    "Give me a solving strategy",
  ],
  revision: [
    "How should I revise effectively?",
    "Quiz me",
    "Explain a concept",
  ],
  analytics: [
    "Help me understand Analytics",
    "What metrics matter most?",
    "How should I use this page?",
  ],
  profile: [
    "How should I use Profile?",
    "Help me plan my next step",
    "Explain what I can update here",
  ],
  community: [
    "How should I use Community?",
    "Help me ask a good doubt",
    "How do I explain my problem?",
  ],
  arena: [
    "Give me battle strategy",
    "How should I manage speed?",
    "Help me stay focused",
  ],
  unknown: [
    "What can you help me with?",
    "Explain something",
    "Help me decide what to do next",
  ],
};

const SUGGESTIONS_BY_ENTITY = {
  pyq_question: [
    "Give me a hint",
    "Explain this question",
    "Why is this option wrong?",
    "Explain the concept",
  ],
  revision_card: [
    "Explain this simply",
    "Quiz me from this",
    "Give me a memory trick",
    "What should I remember?",
  ],
  test_question: [
    "Give me a hint",
    "Explain the concept",
    "What is this question asking?",
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
    <div className="border-t border-white/10 px-4 py-3 sm:px-5">
      <p className="sr-only">Suggested prompts</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="prepzii-interactive rounded-full border border-brand/20 bg-brand/[0.08] px-3 py-1.5 text-xs font-bold text-amber-100/90 shadow-sm transition-colors hover:border-brand/60 hover:bg-brand/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
