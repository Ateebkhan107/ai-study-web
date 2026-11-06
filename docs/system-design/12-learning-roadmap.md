# 🎓 Prepzii: 4-Week System Design Learning Roadmap

> **From "AI-Generated Code" to "Principal Architect Mastery"**  
> Yeh roadmap specifically aapke liye design kiya gaya hai taaki aap Prepzii ke har layer ko itne confidence ke sath explain kar sakein ki koi senior engineer ya investor aapko veteran system designer maane.

---

## 🗓️ 4-Week Mastery Schedule

```
  Week 1: The Big Picture (HLD) ─────► Week 2: The Data Foundation (PostgreSQL)
                │                                          │
                ▼                                          ▼
  Week 3: Code Mechanics (Next.js 16) ─► Week 4: The Interview Masterclass
```

---

### 📅 Week 1: Master the High-Level Design (HLD)
**Goal**: Explain Prepzii's macro architecture in 2 minutes without hesitation.
- **Concepts to Learn**:
  - Client-Server Architecture, DNS, Edge Gateways, BaaS (Backend-as-a-Service).
  - Why Prepzii is an **Optimized Serverless Monolith** and why microservices would have been an over-engineering disaster at this stage.
- **Action Steps**:
  1. Read [`01-system-overview.md`](./01-system-overview.md) and [`02-high-level-design.md`](./02-high-level-design.md).
  2. Open the **Interactive Explorer (`prepzii-architecture-explorer.html`)** and trace the connection between Next.js, Clerk, Supabase, and Google Gemini.
  3. **Mirror Exercise**: Explain aloud: *"Student browser se request nikal kar database tak kaise pahunchti hai?"*

---

### 📅 Week 2: Master the Data & Storage Layer
**Goal**: Speak about relational schemas, indexes, foreign keys, and RLS like a database architect.
- **Concepts to Learn**:
  - Relational Database Normalization, Primary Keys vs Foreign Keys.
  - Why Supabase RLS is critical for client-side queries.
  - How `supabaseAdmin` bypasses RLS for server-side score and payment evaluation.
  - How Stored Procedures (RPCs) like `zi_commit_bank_submission` provide atomic ACID guarantees.
- **Action Steps**:
  1. Study [`04-database-design.md`](./04-database-design.md).
  2. Inspect the 9 table clusters and explain how `user_profiles` maps to `test_attempts` and `subscriptions`.
  3. Understand why indexes on `josaa_cutoffs(institute_name, seat_type)` prevent query latency.

---

### 📅 Week 3: Master Next.js 16 & Serverless Mechanics
**Goal**: Deeply understand modern React 19 and Next.js 16 execution environments.
- **Concepts to Learn**:
  - React Server Components (RSC) vs Client Components (`"use client"`).
  - Next.js 16 Edge Gateway convention (`src/proxy.js`) and Clerk route matchers.
  - Server Actions vs API Routes.
  - Serverless cold starts and why in-memory state (like `Set` or `Map`) is isolated per container.
- **Action Steps**:
  1. Read [`03-low-level-design.md`](./03-low-level-design.md) and [`06-auth-and-security.md`](./06-auth-and-security.md).
  2. Trace `completeOnboarding` in `src/app/onboarding/page.js` to see how Server Actions write directly to the DB without a REST endpoint.
  3. Inspect `src/lib/accessControl.js` to understand how feature flags protect Pro features.

---

### 📅 Week 4: The System Design Interview Masterclass
**Goal**: Pitch and defend Prepzii's architecture in an interview or investor meeting.
- **Concepts to Learn**:
  - Scalability bottlenecks (100 -> 100K users) from [`10-scalability.md`](./10-scalability.md).
  - Cryptographic HMAC verification for payments.
  - AI prompt engineering, token economics, and SSE streaming from [`08-ai-architecture.md`](./08-ai-architecture.md).

---

## 🎤 The 5-Minute Technical Pitch (How to Explain Prepzii)

> *"Prepzii is an AI-powered, multi-tenant EdTech platform designed for highly competitive exams like JEE and NEET.  
> 
> Architecturally, it is built as an **Optimized Serverless Monolith** using **Next.js 16 and React 19**, hosted on Vercel's global edge network. Instead of managing raw server instances, we leverage best-in-class managed BaaS providers:
> 1. **Clerk** manages user identities, Google OAuth, and signed session JWTs.
> 2. **Supabase PostgreSQL** serves as our relational data backbone, housing over 60 tables protected by Row Level Security for client queries and accessed via an authoritative service-role admin client on the server.
> 3. Our AI layer, **Zi**, is powered by **Google Gemini 3.6 Flash and Pro** using Server-Sent Events (SSE) for low-latency token streaming. It incorporates a multi-layer context pipeline that injects personal student memory, performance analytics, and KaTeX math formatting directly into the prompt.
> 4. For monetization, we integrate **Razorpay** with server-side timing-safe HMAC SHA256 signature verification.
> 
> By keeping the application unified in a single repository while delegating compute, database, and auth to managed serverless layers, we maintain near-zero idle infrastructure costs while retaining the capability to scale horizontally to thousands of concurrent test takers during exam seasons."*

---

## 🛡️ Top 3 Interview Defense Questions (And How to Answer Them)

### Q1: *"Agar 50,000 students ek sath 12:00 PM par Mock Test submit karenge, to kya aapka serverless backend crash hoga?"*
- **Your Answer**:
  > *"Direct PostgreSQL connections par connection limits (e.g. 100 connections) crash ho sakti hain. Humne code level par stored procedure atomic cutovers (`zi_commit_bank_submission`) aur optimistic revision locks lagaye hain. Next stage par, hum Supabase ke PgBouncer Connection Pooler (Port 6543) aur ek asynchronous message queue (jaise Upstash Redis Streams / SQS) deploy karenge jahan test submissions queue ho jayengi aur background workers unhe score karenge."*

### Q2: *"Aapne Free users ko AI abuse karne se kaise roka hai?"*
- **Your Answer**:
  > *"Hamare paas two-tier defense hai: Pehla, an in-memory sliding-window rate limiter jo per-minute bursts ko throttle karta hai. Doosra, database-level atomic trial accounting procedure (`zi_trial_prompt_usage`) jo non-paying users ko strictly 3 free trial prompts grant karta hai with state transitions (`reserve` -> `dispatch` -> `consume`). Limit hit hote hi user ko Pro upgrade prompt milta hai."*

### Q3: *"Aapka Battle Zone real-time matchmaking kaise handle karta hai?"*
- **Your Answer**:
  > *"Current MVP mein hum lightweight database queue polling state-machine use karte hain jisme matching track (JEE vs NEET) ke students pair hote hain. Concurrency conflicts se bachne ke liye match creation atomic hai. High-concurrency traffic ke liye hamara roadmap Supabase Realtime (logical replication) ya Redis PubSub par migrate karne ka hai."*
