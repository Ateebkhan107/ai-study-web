// Serialize full answer snapshots and retain the server's optimistic revision.
// A failed/unknown acknowledgement blocks submission until reload/resume.
export function createGeneratedAnswerQueue({ sessionId, revision, fetcher = fetch }) {
  let tail = Promise.resolve();
  let currentRevision = revision;
  return {
    save(answers) {
      const snapshot = structuredClone(answers);
      tail = tail.then(async () => {
        const response = await fetcher("/api/test-session", { method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceType: "AI_GENERATED", sessionId, revision: currentRevision, answers: snapshot }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Answers could not be saved. Reload to resume safely.");
        currentRevision = data.revision;
        return data;
      });
      return tail;
    },
    async flush() { await tail; return currentRevision; },
  };
}
