"use client";

import { useState, useSyncExternalStore } from "react";
import { useUser } from "@clerk/nextjs";
import { rememberBuilderAction, clearBuilderToken, subscribeBuilder, readBuilderToken } from "./testBuilderSession";

// One card is used by the floating tutor and the Zi workspace.
export function ZiTestBuilderForm({ draft, busy, error, onSubmit, onReset }) {
  const c = draft.config;
  const field = "mt-1 w-full min-w-0 rounded-md border border-stone-300 bg-white px-2 py-2 text-sm text-stone-900 focus:outline-2 focus:outline-amber-500 disabled:opacity-60";
  return (
    <section aria-label="AI test configuration" className="mt-4 rounded-lg border border-stone-300 bg-stone-50 p-3 text-stone-900">
      <h3 className="text-sm font-bold">AI-Generated Practice Test · Configuration</h3>
      <p className="mt-2 text-sm" role="status">{draft.prompt}</p>
      {draft.preferenceUsed ? <p className="mt-1 text-xs text-stone-600">Your PrepZii exam preference was used. You can change the exam within your available access.</p> : null}
      <form key={draft.token} onSubmit={onSubmit} className="mt-3 space-y-3">
        <fieldset disabled={busy} className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <legend className="sr-only">Test settings</legend>
          <label className="text-xs font-semibold">Exam<select className={field} name="exam" defaultValue={c.exam || ""} required><option value="">Choose exam</option><option>JEE Main</option><option>NEET</option></select></label>
          <label className="text-xs font-semibold">Subject<select className={field} name="subject" defaultValue={c.subject || ""} required><option value="">Choose subject</option>{["Physics", "Chemistry", "Mathematics", "Biology"].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="text-xs font-semibold sm:col-span-2">Chapter / topic<input className={field} name="topic" defaultValue={c.topic || c.chapter || ""} minLength={2} maxLength={120} required /></label>
          <label className="text-xs font-semibold">Difficulty<select className={field} name="difficulty" defaultValue={c.difficulty || ""} required><option value="">Choose difficulty</option>{["Easy", "Medium", "Hard", "Mixed"].map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="text-xs font-semibold">Questions (5–30)<input className={field} type="number" name="questionCount" min={5} max={30} step={1} defaultValue={c.questionCount || ""} required /></label>
          <label className="text-xs font-semibold">Mode<select className={field} name="mode" defaultValue={c.mode || ""} required><option value="">Choose mode</option><option value="timed">Timed Test</option><option value="practice">Practice Quiz</option></select></label>
          <label className="text-xs font-semibold">Timed duration (minutes)<input className={field} type="number" name="durationMinutes" min={5} max={180} step={1} defaultValue={c.durationMinutes || ""} /><span className="mt-1 block font-normal text-stone-600">5–180; ignored for practice quizzes.</span></label>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-md border border-stone-400 px-3 py-2 text-xs font-bold disabled:opacity-50" disabled={busy} type="submit">{busy ? "Saving…" : "Update summary"}</button>
          {!draft.missing.length && !draft.errors.length && !draft.confirmed ? <button className="rounded-md bg-amber-300 px-3 py-2 text-xs font-bold disabled:opacity-50" disabled={busy} name="confirm" value="true" type="submit">Confirm configuration</button> : null}
          <button className="rounded-md px-2 py-2 text-xs underline disabled:opacity-50" disabled={busy} onClick={onReset} type="button">Reset</button>
        </div>
      </form>
      {!draft.missing.length ? <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-5" aria-label="Configuration summary">{c.exam} · {c.subject} · {c.topic || c.chapter} · {c.difficulty} · {c.questionCount} questions · {c.mode === "timed" ? `Timed Test · ${c.durationMinutes} minutes` : "Practice Quiz · Untimed"}</p> : null}
      {draft.confirmed ? <p className="mt-2 text-sm font-bold">Configuration confirmed. No test has been created.</p> : null}
      <p className="mt-3 text-xs leading-5 text-stone-600">{draft.availability.message}</p>
      {error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}

export default function ZiTestBuilder({ action }) {
  const { user } = useUser();
  const [draft, setDraft] = useState(action);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeToken = useSyncExternalStore(subscribeBuilder, () => readBuilderToken(user?.id), () => undefined);
  async function update(operation, patch) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/zi/test-builder", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, token: draft.token, ...(patch ? { patch } : {}) }) });
      const payload = await response.json();
      if (!response.ok) {
        if ([400, 403, 410].includes(response.status)) clearBuilderToken(user?.id);
        throw new Error(payload.error || "Could not update the configuration.");
      }
      setDraft(payload.action); rememberBuilderAction(user?.id, payload.action);
    } catch (e) { setError(e.message || "Could not update the configuration."); }
    finally { setBusy(false); }
  }
  if (activeToken && activeToken !== draft.token) return <p className="mt-3 text-xs">This configuration has been updated. Use the latest configuration card or send Zi your changes.</p>;
  return <ZiTestBuilderForm draft={draft} busy={busy} error={error} onReset={() => update("reset")} onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const patch = Object.fromEntries(["exam", "subject", "topic", "difficulty", "mode"].map((name) => [name, String(form.get(name))]));
    patch.chapter = patch.topic;
    patch.questionCount = Number(form.get("questionCount"));
    if (form.get("durationMinutes")) patch.durationMinutes = Number(form.get("durationMinutes"));
    update(event.nativeEvent.submitter?.name === "confirm" ? "confirm" : "update", patch);
  }} />;
}
