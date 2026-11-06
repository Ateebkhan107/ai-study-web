# 📈 Prepzii: Scalability & Performance Analysis

> **How Prepzii Scales from 100 to 100,000 Active Aspirants**  
> Is document mein platform ke scalability bottlenecks, serverless behavior under heavy traffic, database connection limits, aur practical scaling solutions ka realistic analysis hai.

---

## 🚦 Traffic Tier Analysis (What Happens at Scale?)

### Tier 1: 100 Active Users (Current MVP Stage)
- **Status**: 🟢 **Flawless & Smooth**.
- **Serverless**: Vercel handles 100 concurrent students effortlessly within free/pro limits.
- **Database**: Supabase direct connections stay well below default limits (usually ~60 concurrent connections).
- **Latency**: Sub-second page loads, fast API responses (<150ms).
- **Cost**: Almost $0 (within free tiers of Supabase, Clerk, and Vercel, with minimal Gemini API costs).

### Tier 2: 1,000 Active Users (Growth Stage / College Exam Week)
- **Status**: 🟡 **Stable with Minor Latency Spikes**.
- **Bottlenecks**:
  - Direct database connection exhaustion if multiple students submit 3-hour mock tests simultaneously.
  - In-memory rate limiting (`globalThis.__prepziiZiRateLimitStore`) in `src/lib/zi/rateLimit.js` starts showing inconsistencies across distinct serverless instances.
  - Analytics endpoint (`/api/analytics`) recalculates raw historical attempts on every page load instead of serving cached stats.
- **Immediate Fixes**:
  - Connect to Supabase via its **Connection Pooler (PgBouncer - Port 6543)** or Supabase Transaction Pooler.
  - Enable Redis (Upstash) for shared rate limiting.

### Tier 3: 10,000 Active Users (National JEE/NEET Exam Season)
- **Status**: 🟠 **Critical Bottlenecks Will Emerge**.
- **Bottlenecks**:
  - **Leaderboard Queries**: `src/utils/leaderboard.js` running `SELECT * FROM user_xp ORDER BY total_xp DESC` will cause table scans on unindexed or unpartitioned tables.
  - **AI Concurrency & Costs**: 10,000 students asking Zi AI questions simultaneously will hit Google Gemini rate limits (TPM - Tokens Per Minute, RPM - Requests Per Minute). Costs will surge without aggressive semantic caching.
  - **Battle Zone Matchmaking**: Polling `battle_queue` every 2 seconds by thousands of students will create heavy read-write lock contention on Postgres.
- **Required Upgrades**:
  - Migrate Battle Zone matchmaking from database table polling to **WebSockets / Redis PubSub**.
  - Cache Leaderboards in Redis with 5-minute TTL.
  - Implement Semantic Caching for repetitive JEE/NEET theory explanations.

### Tier 4: 100,000 Active Users (Enterprise National Test Series)
- **Status**: 🔴 **Current Architecture Requires Distributed Evolution**.
- **Architecture Upgrades Required**:
  - **Read Replicas**: Separate PostgreSQL primary (for test submissions & writes) from 2–3 Read Replicas (for question browsing and leaderboard viewing).
  - **Message Queues (Asynchronous Evaluation)**: When 50,000 students finish the National Mock Test at 12:00 PM sharp, submitting them synchronously will crash the database. Submissions must enter an asynchronous message queue (e.g. AWS SQS / RabbitMQ / Redis Streams) for workers to score in batches.

---

## 🛑 Identified Technical Bottlenecks in Current Code

### 1. In-Memory Concurrency Locks in Serverless Lambdas
- **Code Reference**: `src/lib/tests/bankSubmission.server.js` uses `withBankSubmissionLock(sessionId)` via an in-memory `Set`.
- **The Issue**: In a serverless environment, if Student A clicks Submit twice and the requests land on two separate serverless containers, the in-memory locks do not see each other!
- **Mitigation in Code**: The codebase smartly includes a database-level fallback: stored procedure `zi_commit_bank_submission` with unique session constraints that prevents duplicate DB inserts.

### 2. Analytics Computation on Every Request
- **Code Reference**: `src/services/analytics.server.js` queries all historical `test_attempts` and `pyq_attempts` whenever a user opens `/analytics`.
- **The Issue**: For a student who has solved 2,000 questions over 6 months, fetching and aggregating all attempt rows on every page refresh wastes CPU and database I/O.
- **Solution**: Compute and store aggregated metrics into a `user_analytics_cache` table whenever a test is submitted, rather than recalculating from raw history on every view.

### 3. Battle Zone Polling vs WebSockets
- **Code Reference**: `src/app/api/battle/queue/route.js` relies on HTTP polling.
- **The Issue**: 500 students in the queue poll the database every 2 seconds, generating 250 DB queries per second just to check if an opponent has joined.
- **Solution**: Use Supabase Realtime (PostgreSQL Logical Replication) or a dedicated lightweight WebSocket server to push matchmaking events directly to clients.

---

## 🧑‍🏫 Core Scalability Concepts Explained in Plain Hinglish

### 1. Horizontal Scaling vs Vertical Scaling
- **Vertical Scaling ("Bada Hathi")**: Ek hi server ka RAM aur CPU badha dena (e.g. 8GB RAM se 64GB RAM). Iski ek physical limit hoti hai aur yeh expensive hota hai.
- **Horizontal Scaling ("Bohat Saare Ghode")**: Ek machine ki jagah 10 chhote servers parallel mein laga dena. Vercel automatically horizontal scaling karta hai — traffic badhne par naye serverless containers spawn ho jaate hain.

### 2. Load Balancer Kya Hota Hai?
- **Concept**: Traffic Police jo road par gaadiyon ko alag-alag khali lanes mein bhejta hai.
- **Prepzii Application**: Vercel Edge router load balancer ki tarah kaam karta hai jo incoming student requests ko automatically sabse fast available server container par distribute karta hai.

### 3. CDN (Content Delivery Network) Kya Hota Hai?
- **Concept**: Har shahar mein ek local godown (warehouse) khol dena taaki delivery instant ho sake.
- **Prepzii Application**: Prepzii ke static files (logos, JavaScript bundles, KaTeX fonts) Vercel ke global CDN par cached rehte hain. Delhi ka student Delhi ke server se files load karta hai, aur Mumbai ka student Mumbai ke server se!

### 4. Caching Kya Hoti Hai?
- **Concept**: Ek bar calculate ki hui cheez ko yaad rakh lena taaki dobara mehnat na karni pade.
- **Prepzii Application**: JoSAA cutoffs badalti nahi hain. Har query par database hit karne ke bajaye server unhe memory mein cache kar sakta hai.

### 5. Message Queues Kya Hote Hain?
- **Concept**: Bank ka token system. 100 log ek sath counter par aayenge to stampede ho jayega. Har kisi ko token do aur line mein aaram se process karo.
- **Prepzii Application**: Jab 10,000 students ek sath "Submit Mock Test" click karenge, to queue unke answers ko queue mein daal degi aur workers 10-10 karke score evaluate karte rahenge bina database crash huye.
