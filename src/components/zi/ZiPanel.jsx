"use client";

import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import ZiComposer from "@/components/zi/ZiComposer";
import ZiHeader from "@/components/zi/ZiHeader";
import ZiMessages from "@/components/zi/ZiMessages";
import ZiSuggestions from "@/components/zi/ZiSuggestions";

import { Check, Lock, Maximize2, Minimize2, Presentation, X } from "lucide-react";
import Link from "next/link";

const ZiClassroom = lazy(() => import("./classroom/ZiClassroom"));
const DESKTOP_CLASSROOM = "(min-width: 1024px)";
const tabClass = "prepzii-interactive inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-2.5 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-pressed:border-brand aria-pressed:bg-brand/15";

function subscribeToDesktop(callback) {
  const query = window.matchMedia(DESKTOP_CLASSROOM);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function isDesktop() {
  return window.matchMedia(DESKTOP_CLASSROOM).matches;
}

function isCompact() {
  return false;
}

function noSubscription() {
  return () => {};
}

class ClassroomBoundary extends Component {
  state = { unavailable: false };

  static getDerivedStateFromError() {
    return { unavailable: true };
  }

  render() {
    return this.state.unavailable
      ? <p className="p-4 text-sm" role="status">The whiteboard is unavailable. You can continue in Chat.</p>
      : this.props.children;
  }
}

export default function ZiPanel({
  classroomAvailable = false,
  isOpen,
  messages,
  input,
  isThinking,
  isGenerating,
  pageType,
  entityType,
  onClose,
  onInputChange,
  onSend,
  onStop,
  onSuggestionSelect,
  isLocked,
  onConfigureTest,
  plan,
  remainingFreePrompts,
}) {
  const pathname = usePathname();
  const dialogRef = useRef(null);
  const boardRef = useRef(null);
  const expandRef = useRef(null);
  const exitRef = useRef(null);
  const restoreExpandFocus = useRef(false);
  const [visitedBoard, setVisitedBoard] = useState(false);
  const [openedLesson, setOpenedLesson] = useState(null);
  const [chatSelected, setChatSelected] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const desktop = useSyncExternalStore(
    classroomAvailable ? subscribeToDesktop : noSubscription,
    classroomAvailable ? isDesktop : isCompact,
    isCompact,
  );
  const showBoard = classroomAvailable && (!chatSelected || (expanded && desktop));
  const fullscreen = classroomAvailable && isOpen && expanded;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!classroomAvailable || !dialog || !isOpen) return;
    dialog.showModal();
    return () => dialog.close();
  }, [classroomAvailable, isOpen]);

  useLayoutEffect(() => {
    if (!fullscreen) {
      if (restoreExpandFocus.current) {
        restoreExpandFocus.current = false;
        expandRef.current?.focus();
      }
      return;
    }
    exitRef.current?.focus();
    if (boardRef.current) boardRef.current.scrollTop = 0;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previousOverflow; };
  }, [fullscreen]);

  const collapse = () => {
    restoreExpandFocus.current = true;
    setChatSelected(false);
    setExpanded(false);
  };
  const closePanel = () => {
    if (fullscreen) collapse();
    else onClose();
  };

  useEffect(() => {
    if (isOpen || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, [pathname]);

  const panelTransformClass = isOpen
    ? "translate-y-0 sm:translate-x-0"
    : "translate-y-full sm:translate-x-[calc(100%+1rem)] sm:translate-y-0";

  
  if (isLocked) {
    return (
      <div
        className={`fixed inset-0 z-[65] pointer-events-none transition-[visibility] ${
          isOpen ? "" : "invisible"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 z-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={onClose}
          aria-label="Close Zi"
          tabIndex={-1}
        />
        <div
          className={`absolute inset-x-2 bottom-3 top-2 z-10 mx-auto flex w-auto max-w-[28rem] flex-col overflow-hidden rounded-[2rem] border border-brand/20 bg-slate-50 shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:border-brand/10 dark:bg-slate-950 sm:inset-auto sm:bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:top-20 sm:w-[30rem] sm:max-w-none ${panelTransformClass}`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-black dark:hover:text-white pointer-events-auto"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <div className="flex h-full flex-col items-center justify-center p-8 text-center pointer-events-auto">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Lock className="h-10 w-10" strokeWidth={2} />
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Unlock Zi AI
            </h2>
            <div className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-200">
              ₹1,999/month
            </div>
            <p className="mb-5 text-[0.95rem] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
              You&apos;ve used all 3 free trial prompts. Upgrade to AI Mode to continue chatting with Zi.
            </p>
            <ul className="mb-7 w-full max-w-[280px] space-y-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
              {[
                "Everything included in Pro",
                "Full Zi AI companion",
                "Higher AI usage limits",
                "Voice interaction",
                "Visual explanations",
                "Personalized study memory",
                "Personalized study plans",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={3} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={onConfigureTest} className="mb-4 text-sm font-bold underline">Configure an AI practice test (no AI prompt used)</button>
            <Link
              href="/pro"
              onClick={onClose}
              className="inline-flex h-12 w-full max-w-[240px] items-center justify-center rounded-xl bg-brand px-6 font-display text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all hover:scale-105 active:scale-95"
            >
              Upgrade to AI Mode
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assistantState = isThinking || isGenerating ? "thinking" : "idle";
  const PanelSurface = classroomAvailable ? "dialog" : "aside";

  return (
    <div
      className={`fixed inset-0 z-[65] pointer-events-none transition-[visibility] ${
        isOpen ? "" : "invisible"
      }`}
      aria-hidden={!isOpen}
    >
      {!classroomAvailable ? <button
        type="button"
        className={`absolute inset-0 z-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "pointer-events-auto opacity-100" : "opacity-0"
        }`}
        aria-label="Close Zi panel"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      /> : null}

      <PanelSurface
        ref={classroomAvailable ? dialogRef : undefined}
        onCancel={classroomAvailable ? (event) => {
          event.preventDefault();
          closePanel();
        } : undefined}
        onClick={classroomAvailable && !fullscreen ? (event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right ||
              event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
        } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zi-panel-title"
        className={`zi-console-surface pointer-events-auto z-10 flex flex-col overflow-hidden text-slate-900 shadow-2xl dark:text-white ${
          classroomAvailable ? "fixed m-0 max-h-none max-w-none not-open:hidden backdrop:bg-slate-950/45 backdrop:backdrop-blur-[2px]" : "absolute"
        } ${
          fullscreen
            ? "inset-0 h-dvh min-h-dvh w-full rounded-none border-0 bg-[var(--background)]"
            : "bottom-0 right-0 left-auto top-auto h-[min(94dvh,calc(100dvh-0.5rem))] w-full max-w-full rounded-t-[1.75rem] border border-brand/20 sm:bottom-4 sm:right-4 sm:top-4 sm:h-auto sm:w-[min(460px,calc(100vw-2rem))] sm:rounded-[1.75rem] transition-transform duration-300 ease-out motion-reduce:transition-none"
        } ${
          isOpen ? "zi-panel-reveal" : ""
        } ${panelTransformClass}`}
      >
        <span id="zi-panel-title" className="sr-only">
          {fullscreen ? "Zi Visual Classroom" : "Zi assistant panel"}
        </span>
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand/80 to-transparent" aria-hidden="true" />
        <ZiHeader
          plan={plan}
          onClose={closePanel}
          assistantState={assistantState}
          remainingFreePrompts={remainingFreePrompts}
          isAiMode={plan === "AI_MODE"}
        />
        {classroomAvailable ? (
          <div className="flex shrink-0 items-center gap-1.5 border-b border-[var(--border)] px-2 py-1.5 sm:px-4" role="group" aria-label="Zi views">
            <button type="button" className={tabClass} aria-pressed={chatSelected} aria-controls="zi-classroom-chat"
              onClick={() => setChatSelected(fullscreen ? !chatSelected : true)}>Chat</button>
            <button type="button" className={tabClass} aria-pressed={!chatSelected} aria-controls="zi-classroom-board"
              onClick={() => {
                setVisitedBoard(true);
                setChatSelected(false);
              }}>
              <Presentation size={15} aria-hidden="true" />
              {visitedBoard ? "Whiteboard" : "Visual Classroom"}
            </button>
            {showBoard || fullscreen ? (
              <button type="button" ref={fullscreen ? exitRef : expandRef} className={`${tabClass} ml-auto`}
                onClick={fullscreen ? collapse : () => setExpanded(true)}>
                {fullscreen ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
                {fullscreen ? "Exit full screen" : "Expand"}
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={`flex min-h-0 flex-1 ${fullscreen && desktop && chatSelected ? "divide-x divide-[var(--border)]" : ""}`}>
          {classroomAvailable ? (
            <section id="zi-classroom-board" ref={boardRef} hidden={!showBoard} tabIndex={-1} aria-label="Whiteboard"
              className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
              {visitedBoard ? (
                <ClassroomBoundary>
                  <Suspense fallback={<p className="p-4 text-sm" role="status">Loading whiteboard…</p>}>
                    <ZiClassroom key={openedLesson?.revision} initialLesson={openedLesson?.lesson}
                      active={showBoard && isOpen} interrupted={isGenerating} />
                  </Suspense>
                </ClassroomBoundary>
              ) : null}
            </section>
          ) : null}
          <div id="zi-classroom-chat" hidden={classroomAvailable && !chatSelected}
            className={`min-w-0 flex-col ${classroomAvailable && !chatSelected ? "hidden" : "flex"} ${
              fullscreen && desktop ? "w-[min(38%,30rem)]" : "flex-1"
            }`}>
            <ZiMessages messages={messages} isThinking={isThinking} onOpenClassroom={classroomAvailable ? (lesson) => {
              setOpenedLesson((current) => ({ lesson, revision: (current?.revision ?? 0) + 1 }));
              setVisitedBoard(true);
              setChatSelected(false);
              requestAnimationFrame(() => boardRef.current?.focus());
            } : undefined} />
            <ZiSuggestions
              onSelect={onSuggestionSelect}
              disabled={isThinking}
              pageType={pageType}
              entityType={entityType}
            />
            <ZiComposer
              value={input}
              onChange={onInputChange}
              onSend={onSend}
              onStop={onStop}
              disabled={isGenerating}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </PanelSurface>
    </div>
  );
}
