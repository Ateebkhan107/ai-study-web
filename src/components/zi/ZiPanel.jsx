import ZiComposer from "@/components/zi/ZiComposer";
import ZiHeader from "@/components/zi/ZiHeader";
import ZiMessages from "@/components/zi/ZiMessages";
import ZiSuggestions from "@/components/zi/ZiSuggestions";

export default function ZiPanel({
  isOpen,
  messages,
  input,
  isThinking,
  isGenerating,
  onClose,
  onInputChange,
  onSend,
  onStop,
  onSuggestionSelect,
}) {
  return (
    <div
      className={`fixed inset-0 z-[65] pointer-events-none ${
        isOpen ? "" : "invisible"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-950/20 transition-opacity motion-reduce:transition-none sm:bg-transparent ${
          isOpen ? "pointer-events-auto opacity-100" : "opacity-0"
        }`}
        aria-label="Close Zi panel"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="zi-panel-title"
        className={`pointer-events-auto absolute bottom-0 right-0 flex h-[min(92dvh,calc(100dvh-1rem))] w-full max-w-full translate-y-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-[var(--card)] shadow-xl transition-transform duration-200 ease-out motion-reduce:transition-none dark:border-[var(--border)] dark:bg-[var(--surface)] sm:bottom-4 sm:right-4 sm:top-4 sm:h-auto sm:w-[min(400px,calc(100vw-2rem))] sm:translate-x-[calc(100%+1rem)] sm:translate-y-0 sm:rounded-2xl ${
          isOpen ? "translate-y-0 sm:translate-x-0" : ""
        }`}
      >
        <span id="zi-panel-title" className="sr-only">
          Zi assistant panel
        </span>
        <ZiHeader onClose={onClose} />
        <ZiMessages messages={messages} isThinking={isThinking} />
        <ZiSuggestions onSelect={onSuggestionSelect} disabled={isThinking} />
        <ZiComposer
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          onStop={onStop}
          disabled={isGenerating}
          isGenerating={isGenerating}
        />
      </aside>
    </div>
  );
}
