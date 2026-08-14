export async function getUserAnalytics(_userId, stream = "JEE") {
  const params = new URLSearchParams({
    track: String(stream || "JEE").toUpperCase(),
  });

  const response = await fetch(`/api/analytics?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || `Failed to load analytics: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
