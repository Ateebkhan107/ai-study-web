// One request per explicit submission. Retries are a user decision; successful
// server acknowledgements and terminal conflicts must survive response parsing.
export async function submitTestSessionRequest(body, fetcher = fetch) {
  const response = await fetcher("/api/test-session", {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || `Failed to submit test: ${response.status}`), { status: response.status });
  }
  if (typeof data.attemptId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.attemptId)) {
    throw new Error("The submission acknowledgement could not be verified. Please retry to check the saved result.");
  }
  return data;
}
