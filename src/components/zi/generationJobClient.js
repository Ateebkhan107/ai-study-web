export async function generationJobRequest(path = "", body, fetcher = fetch) {
  const response = await fetcher(`/api/zi/generation-jobs${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error(payload.error || "Generation status is unavailable."), { status: response.status });
  return payload.job;
}
