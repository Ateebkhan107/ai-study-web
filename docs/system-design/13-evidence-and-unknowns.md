# 🔍 Prepzii: Audit Evidence, Citations & Unknowns

> **Code Audit Trail & Empirical Findings**  
> Is document mein pure codebase audit ke verifiable code references, feature completion matrix, aur unverified cloud-level unknowns ko transparently list kiya gaya hai.

---

## 📋 Feature Implementation Matrix

| Module / Feature | Verified Status | Evidence (File & Line) | Notes / Caveats |
|---|---|---|---|
| **Landing & SEO Pages** | ✅ **Fully Implemented** | `src/app/page.js`, `src/app/HomePageClient.jsx` | Static / SSR with preloaded fonts and modern Tailwind 4. |
| **Clerk Auth Integration** | ✅ **Fully Implemented** | `src/proxy.js:1-35`, `src/lib/auth.js:1-119` | Middleware route matcher protects dashboard routes. |
| **Onboarding Flow** | ✅ **Fully Implemented** | `src/app/onboarding/page.js:35-141` | Server Action updates `user_profiles` & Clerk metadata. |
| **Unified Dashboard** | ✅ **Fully Implemented** | `src/app/(dashboard)/dashboard/page.js` | Track-aware (JEE/NEET) rendering of stats, goals, XP. |
| **PYQ Explorer & Practice**| ✅ **Fully Implemented** | `src/app/api/pyq/route.js`, `src/lib/pyqData.js` | 2017–2026 exam papers with chapter filtering. |
| **Mock Test Session** | ✅ **Fully Implemented** | `src/app/api/test-session/route.js:1-638` | Full proctored test session with answer evaluation. |
| **Performance Analytics** | ✅ **Fully Implemented** | `src/services/analytics.server.js:1-109` | Pro-gated aggregation of historical attempts. |
| **JEE Main Predictor** | ✅ **Fully Implemented** | `src/components/analytics/JEEMainPredictor.jsx:1-120` | Piecewise linear interpolation + JoSAA cutoff search. |
| **NEET Rank Forecast** | ✅ **Fully Implemented** | `src/lib/neet/rankForecast.js:1-61` | Historical distribution dataset interpolator. |
| **Battle Zone (1v1 PvP)** | ✅ **Fully Implemented** | `src/app/api/battle/queue/route.js:1-146`, `src/lib/battle.js` | DB-backed queue, 1v1 quiz engine, and ELO calculations. |
| **Community & Groups** | ✅ **Fully Implemented** | `src/services/community.server.js:1-148` | Study groups, group messages, direct chat, reports. |
| **Zi AI Companion** | ✅ **Fully Implemented** | `src/app/api/zi/chat/route.js:1-527`, `src/lib/zi/provider.js` | Gemini 3.6 Flash/Pro SSE streaming, context, memories. |
| **Zi Voice Transcription**| ✅ **Fully Implemented** | `src/app/api/zi/transcribe/route.js` | Audio binary transcription using Gemini multimodal API. |
| **AI Test Generation** | ⚠️ **Partially Implemented** | `src/lib/zi/testGenerator/builder.server.js:55-64` | Wizard & crypto tokens complete; execution gated by `ZI_AI_TEST_GENERATION_ENABLED`. |
| **Gamification & Rewards** | ✅ **Fully Implemented** | `src/utils/xp.js`, `src/lib/goalRewards.mjs`, `levelEngine.js` | XP awards, level scaling, badges, streak calculation. |
| **Razorpay Subscriptions**| ✅ **Fully Implemented** | `src/app/api/payment/verify/route.js:25-63` | Timing-safe HMAC SHA256 signature verification. |
| **Formula Handbooks** | ✅ **Fully Implemented** | `src/app/formula-cards/`, `src/lib/formulaCards.js` | Subject-wise flashcards with LaTeX equations. |
| **Admin CMS** | ✅ **Fully Implemented** | `src/app/admin/`, `src/lib/admin.js` | Questions, images, exams, and moderation. |
| **Institute B2B Portal** | ✅ **Fully Implemented** | `src/app/institute/`, `src/lib/instituteAuth.js` | Coaching tenant batches, custom test assignments, CSV import. |

---

## 📌 Verified Code Evidence (Key File Citations)

1. **Next.js 16 Edge Gateway Convention**:
   - File: `src/proxy.js`, Line 20: `export default clerkMiddleware(async (auth, req) => ...)`
   - Matches routes: `/onboarding`, `/analytics`, `/profile`, `/subscriptions`, `/test/session`, `/battle`, `/admin`.

2. **Dual AI Model Integration**:
   - Google GenAI SDK: `src/lib/zi/provider.js`, Line 3: `import { GoogleGenAI } from "@google/genai";`
   - Default models: `gemini-3.6-flash` (pro/free) and `gemini-3.6-pro` (AI mode).
   - Anthropic Claude API: `src/app/api/explain/route.js`, Line 42: `model: "claude-sonnet-4-20250514"`.

3. **Cryptographic Payment Signature Verification**:
   - File: `src/app/api/payment/verify/route.js`, Lines 25–34:
     ```javascript
     const expectedSignature = crypto
       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
       .digest("hex");
     if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(suppliedSignature))) ...
     ```

4. **Cryptographic Stateless AI Wizard Tokens**:
   - File: `src/lib/zi/testGenerator/builder.server.js`, Lines 33–53:
     Uses `createCipheriv("aes-256-gcm", key(secret), iv)` with HKDF derived keys to seal wizard configuration into a tamper-proof string passed between client and server.

5. **In-Memory Rate Limiting**:
   - File: `src/lib/zi/rateLimit.js`, Line 9:
     `const store = globalThis.__prepziiZiRateLimitStore || new Map();`

6. **Free AI Prompt Quota System**:
   - File: `src/lib/zi/promptUsage.server.js`, Line 5:
     `export const FREE_ZI_PROMPT_LIMIT = 3;` (Checked via DB RPC `zi_trial_prompt_usage`).

---

## ❓ Cloud-Level Unknowns & Unverified Areas

The following items belong to external hosted cloud dashboards and cannot be inspected strictly from the local Git repository:

1. **Live Production Environment Variables on Vercel**:
   - Whether `PREPZII_INTEGRITY_CONTRACT_ENABLED` is currently `"true"` or `"false"` in the hosted Vercel production dashboard.
   - Whether `ZI_AI_TEST_GENERATION_ENABLED` has been switched to `"true"` on production.
2. **Supabase Hosted Extensions & PgBouncer Status**:
   - While the local code references connection pooling, whether the live project `vyqcciooigmnfmzrwtpp` has enabled PgBouncer on port `6543` requires checking the Supabase dashboard.
3. **Razorpay Live Webhook Configuration**:
   - The application verifies payments synchronously via `/api/payment/verify`. Whether an asynchronous fallback webhook (e.g. for UPI payment delays) is configured inside the Razorpay merchant dashboard cannot be verified from code alone.
