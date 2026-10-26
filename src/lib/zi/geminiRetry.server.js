import "server-only";
import { setTimeout as sleep } from "node:timers/promises";

// Never retain API keys, project/account identifiers, arbitrary headers or raw
// provider messages. These diagnostics describe provider restrictions only.
const identifier = (v) => typeof v === "string" && /^[a-zA-Z0-9_.\/-]{1,200}$/.test(v) ? v : undefined;
function durationMs(value) {
  if (typeof value === "string" && /^\d+(?:\.\d+)?s$/.test(value)) return Number(value.slice(0, -1)) * 1000;
  if (value && typeof value === "object" && Number.isFinite(Number(value.seconds))) return Number(value.seconds) * 1000 + Number(value.nanos || 0) / 1e6;
  return null;
}
export function retryAfterMs(value, now = Date.now()) {
  if (value === null || value === undefined || value === "") return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  if (/^-?\d+(?:\.\d+)?$/.test(String(value))) return null;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : null;
}
export function classifyGeminiError(error, now = Date.now()) {
  let body = error.body;
  if (!body) { try { body = JSON.parse(error.message); } catch { body = {}; } }
  const service = body?.error || {};
  const status = error.status ?? error.providerStatus ?? service.code ?? null;
  const details = Array.isArray(service.details) ? service.details : [];
  const violations = details.filter((d) => d["@type"]?.endsWith("/google.rpc.QuotaFailure")).flatMap((d) => d.violations || []).slice(0, 10).map((v) => ({
    quotaMetric: identifier(v.quotaMetric), quotaId: identifier(v.quotaId),
    ...(v.quotaValue !== null && v.quotaValue !== undefined && v.quotaValue !== "" && Number.isFinite(Number(v.quotaValue)) ? { quotaValue: Number(v.quotaValue) } : {}),
    model: identifier(v.quotaDimensions?.model), location: identifier(v.quotaDimensions?.location),
  }));
  const hints = details.filter((d) => d["@type"]?.endsWith("/google.rpc.RetryInfo")).map((d) => durationMs(d.retryDelay));
  const headers = error.headers || error.response?.headers;
  hints.push(retryAfterMs(headers?.get?.("retry-after") ?? headers?.["retry-after"], now));
  const retryHints = hints.filter((v) => Number.isFinite(v) && v >= 0);
  const retryDelay = retryHints.length ? Math.max(...retryHints) : null;
  const quotaNames = violations.map((v) => `${v.quotaId || ""} ${v.quotaMetric || ""}`).join(" ").toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const message = String(service.message || "").toLowerCase();
  const reason = details.find((d) => d["@type"]?.endsWith("/google.rpc.ErrorInfo"))?.reason || "";
  let category = "nonretryable_provider_error";
  let retryable = false;
  if (/billing.*(?:disabled|inactive)|insufficient (?:balance|credits)|prepaid.*exhaust/.test(message) || /BILLING_DISABLED|CREDIT_EXHAUSTED|PAYMENT_REQUIRED/.test(reason)) category = "billing_restriction";
  else if (/perday|daily|permonth|monthly/.test(quotaNames)) category = /token/.test(quotaNames) ? "daily_token_quota" : "daily_request_quota";
  else if (violations.some((v) => v.quotaValue === 0)) category = "zero_model_quota";
  else if (status === 429) {
    if (/perminute|persecond/.test(quotaNames)) { category = /token/.test(quotaNames) ? "token_rate_limit" : "request_rate_limit"; retryable = true; }
    else if (/spend.*rate|rolling.*spend/.test(message)) { category = "spend_rate_limit"; retryable = true; }
    else if (retryDelay !== null && !violations.length) { category = "provider_throttling_with_retry_hint"; retryable = true; }
    else category = "unclassified_resource_exhaustion";
  } else if ([408, 500, 502, 503, 504].includes(status)) { category = "transient_provider_error"; retryable = true; }
  else if (["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "UND_ERR_CONNECT_TIMEOUT"].includes(error.cause?.code || error.code)) { category = "transient_network_error"; retryable = true; }
  else if (status === 404) category = "model_unavailable";
  return { status, category, retryable, retryAfterMs: retryDelay, quotaViolations: violations };
}

export function createGeminiRequestRunner({ wait = (ms, signal) => sleep(ms, undefined, { signal }), random = Math.random, now = Date.now } = {}) {
  const cooldowns = new Map();
  async function run({ models, operation, signal, cooldownKey, deadlineAt = now() + 45000, maxAttempts = 3 }) {
    if (![1, 2, 3].includes(maxAttempts)) throw new Error("Invalid provider attempt bound");
    for (const [key, value] of cooldowns) if (value.until <= now()) cooldowns.delete(key);
    const cached = cooldowns.get(cooldownKey);
    if (cached) throw Object.assign(new Error("Gemini quota cooldown is active."), { providerRequests: 0, status: cached.diagnostic.status, providerDiagnostic: { ...cached.diagnostic, retryAfterMs: cached.until - now(), cooldownHit: true } });
    let modelIndex = 0;
    const attempts = [];
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (signal?.aborted) throw Object.assign(new Error("Gemini request cancelled."), { providerRequests: attempt });
      try {
        const result = await operation(models[modelIndex]);
        return { result, model: models[modelIndex], providerRequests: attempt + 1, attempts };
      } catch (error) {
        const diagnostic = classifyGeminiError(error, now());
        attempts.push({ model: models[modelIndex], status: diagnostic.status, category: diagnostic.category });
        const hardQuota = ["daily_request_quota", "daily_token_quota", "zero_model_quota", "billing_restriction"].includes(diagnostic.category);
        if (hardQuota) {
          if (cooldowns.size >= 32) cooldowns.delete(cooldowns.keys().next().value);
          cooldowns.set(cooldownKey, { until: now() + Math.max(60000, diagnostic.retryAfterMs || 0), diagnostic });
        }
        const fallback = [404, 503].includes(diagnostic.status) && modelIndex + 1 < models.length;
        const jitter = Math.min(4000, 500 * 2 ** attempt) * (0.5 + random() * 0.5);
        const delay = Math.max(diagnostic.retryAfterMs || 0, jitter);
        const exhausted = attempt === maxAttempts - 1;
        const deferred = delay >= deadlineAt - now();
        if (hardQuota || (!diagnostic.retryable && !fallback) || exhausted || deferred || signal?.aborted) {
          throw Object.assign(new Error("Gemini structured request failed."), {
            status: diagnostic.status, providerRequests: attempt + 1,
            providerDiagnostic: { ...diagnostic, retryExhausted: exhausted && diagnostic.retryable, retryDeferred: deferred && diagnostic.retryable, attempts },
          });
        }
        // A 429 never triggers model/key switching. Existing availability
        // fallback is restricted to a missing/unavailable model, as before.
        if (fallback) modelIndex += 1;
        try { await wait(delay, signal); }
        catch { throw Object.assign(new Error("Gemini retry wait cancelled."), { providerRequests: attempt + 1, providerDiagnostic: { ...diagnostic, cancelled: true, attempts } }); }
      }
    }
  }
  // Read-only status for configuration UI; never probes the provider.
  run.getQuotaCooldown = () => {
    const active = [...cooldowns.values()].filter((entry) => entry.until > now());
    return active.length ? { blocked: true, retryAfterMs: Math.max(...active.map((entry) => entry.until - now())) } : { blocked: false };
  };
  return run;
}
