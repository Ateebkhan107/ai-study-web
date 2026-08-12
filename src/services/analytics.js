export async function getUserAnalytics(_userId, stream = "JEE") {
  const params = new URLSearchParams({
    track: String(stream || "JEE").toUpperCase(),
  });

  const response = await fetch(`/api/analytics?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to load analytics: ${response.status}`);
  }

  return response.json();
}
