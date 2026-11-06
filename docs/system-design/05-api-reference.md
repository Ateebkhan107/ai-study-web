# 🔌 Prepzii: Verified Backend API Reference

> **Complete Inventory of Next.js 16 API Routes**  
> Is document mein Prepzii ke sabhi verified backend API routes ka detailed inventory, unka HTTP method, purpose, authentication requirement, aur underlying database interaction document kiya gaya hai.

---

## 📑 API Endpoint Inventory Table

### 1. Student Core, Dashboard & Profile
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/profile` | `GET` | Fetch student profile and metadata | Clerk Auth (`auth()`) | `user_profiles` | `src/app/api/profile/route.js` |
| `/api/profile/update` | `POST` | Update target exam, year, name | Clerk Auth | `user_profiles` | `src/app/api/profile/update/route.js` |
| `/api/profile/badges` | `GET` | List badges earned by student | Clerk Auth | `user_badges`, `badges` | `src/app/api/profile/badges/route.js` |
| `/api/dashboard-stats` | `GET` | Aggregated dashboard numbers | Clerk Auth | `user_xp`, `test_attempts` | `src/app/api/dashboard-stats/route.js` |
| `/api/daily-goals` | `GET, POST` | View & update daily study goals | Clerk Auth | `daily_goals`, `user_daily_goals` | `src/app/api/daily-goals/route.js` |
| `/api/study-sessions/recent` | `GET` | List recent focus study timers | Clerk Auth | `study_sessions` | `src/app/api/study-sessions/recent/route.js` |
| `/api/username/availability` | `GET` | Check if chosen handle is free | Public | `user_profiles` | `src/app/api/username/availability/route.js` |
| `/api/user/tour-complete` | `POST` | Mark introductory tour finished | Clerk Auth | Clerk User Metadata | `src/app/api/user/tour-complete/route.js` |
| `/api/users/search` | `GET` | Search other students for battles | Clerk Auth | `user_profiles` | `src/app/api/users/search/route.js` |
| `/api/notifications` | `GET, POST`| Read system announcements | Clerk Auth | `notifications`, `reads` | `src/app/api/notifications/route.js` |

### 2. Test Engine & Practice Sessions
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/test-session` | `GET` | Load active test session & questions | Clerk Auth | `test_sessions`, `questions` | `src/app/api/test-session/route.js` |
| `/api/test-session` | `POST` | Start test or submit answers | Clerk Auth | `test_sessions`, `test_attempts` | `src/app/api/test-session/route.js` |
| `/api/test-attempts` | `GET` | Historical test attempts list | Clerk Auth | `test_attempts` | `src/app/api/test-attempts/route.js` |
| `/api/test-attempts/[id]` | `GET` | Detailed test score summary | Clerk Auth | `test_attempts` | `src/app/api/test-attempts/[id]/route.js` |
| `/api/test-attempts/[id]/review` | `GET` | Full question-by-question review | Clerk Auth | `user_answers`, `questions` | `src/app/api/test-attempts/[id]/review/route.js` |
| `/api/test-attempts/[id]/zi-review` | `POST`| Generate AI diagnostic review | Clerk + Pro | Gemini 3.6 Pro | `src/app/api/test-attempts/[id]/zi-review/route.js` |
| `/api/test/practice-availability` | `GET` | Check remaining free test quota | Clerk Auth | `test_attempts` | `src/app/api/test/practice-availability/route.js` |
| `/api/explain` | `POST` | Explain single question on-demand | Clerk + Pro | Anthropic Claude API | `src/app/api/explain/route.js` |

### 3. PYQs (Previous Year Questions)
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/pyq` | `GET` | Search and filter PYQ questions | Public / Clerk | `pyq_questions` | `src/app/api/pyq/route.js` |
| `/api/pyq/papers` | `GET` | List full past exam shifts | Public | `pyq_exams` | `src/app/api/pyq/papers/route.js` |
| `/api/pyq/chapters` | `GET` | Chapter-wise question counts | Public | `chapters`, `pyq_questions` | `src/app/api/pyq/chapters/route.js` |
| `/api/pyq-attempts` | `GET, POST`| Save drill answers & compute marks | Clerk Auth | `pyq_attempts` | `src/app/api/pyq-attempts/route.js` |
| `/api/pyq-bookmarks` | `GET, POST`| Save/unsave questions for review | Clerk Auth | `pyq_bookmarks` | `src/app/api/pyq-bookmarks/route.js` |
| `/api/pyq/analytics` | `GET` | Historical PYQ practice breakdown | Clerk + Pro | `pyq_attempts` | `src/app/api/pyq/analytics/route.js` |
| `/api/pyq/leaderboard` | `GET` | Top PYQ solvers ranking | Clerk Auth | `pyq_attempts` | `src/app/api/pyq/leaderboard/route.js` |

### 4. Performance Analytics
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/analytics` | `GET` | Full score trends, heatmaps, readiness | Clerk + Pro | `test_attempts`, `pyq_attempts` | `src/app/api/analytics/route.js` |

### 5. Battle Zone Arena (1v1 PvP)
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/battle/queue` | `GET, POST`| Check queue status or enter queue | Clerk Auth | `battle_queue`, `battle_matches` | `src/app/api/battle/queue/route.js` |
| `/api/battle/matches/[id]` | `GET` | Live state of current 1v1 battle | Clerk Auth | `battle_matches`, `players` | `src/app/api/battle/matches/[id]/route.js` |
| `/api/battle/matches/[id]/answers` | `POST` | Submit answer for current battle round | Clerk Auth | `battle_answers` | `src/app/api/battle/matches/[id]/answers/route.js` |
| `/api/battle/matches/[id]/finish` | `POST` | Conclude battle & update ELO | Clerk Auth | `battle_matches`, `battle_stats` | `src/app/api/battle/matches/[id]/finish/route.js` |
| `/api/battle/matches/[id]/rematch`| `POST` | Challenge same opponent again | Clerk Auth | `battle_challenges` | `src/app/api/battle/matches/[id]/rematch/route.js` |
| `/api/battle/challenges` | `GET, POST`| Direct 1v1 friend challenges | Clerk Auth | `battle_challenges` | `src/app/api/battle/challenges/route.js` |
| `/api/battle/leaderboard` | `GET` | Global ELO ranking ladder | Public | `battle_stats` | `src/app/api/battle/leaderboard/route.js` |
| `/api/battle/feed` | `GET` | Real-time ticker of finished battles | Public | `battle_events` | `src/app/api/battle/feed/route.js` |
| `/api/battle/champion` | `GET` | Daily reigning arena champion | Public | `battle_season_awards` | `src/app/api/battle/champion/route.js` |

### 6. Zi AI Companion
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/zi/chat` | `POST` | Stream interactive AI responses (SSE)| Clerk Auth | Gemini 3.6 Flash / Pro | `src/app/api/zi/chat/route.js` |
| `/api/zi/preferences` | `GET, POST`| AI personality & teaching mode | Clerk Auth | `zi_preferences` | `src/app/api/zi/preferences/route.js` |
| `/api/zi/memories` | `GET, POST`| View or delete personal AI memories| Clerk Auth | `zi_memories` | `src/app/api/zi/memories/route.js` |
| `/api/zi/transcribe` | `POST` | Transcribe voice queries (STT) | Clerk Auth | Gemini Audio Model | `src/app/api/zi/transcribe/route.js` |
| `/api/zi/test-builder` | `POST` | Cryptographic wizard test setup | Clerk Auth | AES-256-GCM tokens | `src/app/api/zi/test-builder/route.js` |
| `/api/zi/generation-jobs` | `POST` | Reserve background test job | Clerk + AI Mode | `zi_generation.jobs` | `src/app/api/zi/generation-jobs/route.js` |
| `/api/zi/generation-jobs/[id]/execute`| `POST`| Generate questions via LLM (max 300s)| Clerk + AI Mode | Gemini 3.6 Pro | `src/app/api/zi/generation-jobs/[id]/execute/route.js` |

### 7. Payments & Subscriptions
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/payment/create-order` | `POST` | Initialize Razorpay payment order | Clerk Auth | Razorpay SDK | `src/app/api/payment/create-order/route.js` |
| `/api/payment/verify` | `POST` | Verify HMAC SHA256 & activate plan| Clerk Auth | `subscriptions`, Razorpay | `src/app/api/payment/verify/route.js` |
| `/api/subscription` | `GET` | Check active plan and expiry | Clerk Auth | `subscriptions` | `src/app/api/subscription/route.js` |

### 8. Webhooks & Integrations
| Endpoint | Method | Purpose | Authentication | Database/Service | Source File |
|---|---|---|---|---|---|
| `/api/webhooks/clerk` | `POST` | Sync Clerk users on creation | Clerk Webhook Secret | `user_profiles` | `src/app/api/webhooks/clerk/route.js` |

---

## 🧑‍🏫 Backend Concepts Explained in Plain Hinglish

### 1. API (Application Programming Interface) Kya Hai?
- **Concept**: Ek software ka "Menu Card" aur "Counter". Frontend button click karta hai, aur API server par database se baat karke jawab wapas bhejti hai.

### 2. GET vs POST vs PATCH vs DELETE
- **GET**: Data sirf mangwana (Read-only, no side effects). E.g. `/api/profile` profile dikhata hai.
- **POST**: Naya record create karna ya action perform karna. E.g. `/api/test-session` test submit karta hai.
- **PATCH**: Existing record ka chhota sa hissa update karna. E.g. student ka target year badalna.
- **DELETE**: Data hatana. E.g. saved bookmark remove karna.

### 3. HTTP Status Codes
- **`200 OK`**: Sab badhiya, request successfully process ho gayi.
- **`201 Created`**: Naya resource successfully create ho gaya.
- **`400 Bad Request`**: Client ne galat data bheja (validation failed, e.g. empty answer).
- **`401 Unauthorized`**: Aap logged in nahi ho (Clerk session missing).
- **`403 Forbidden`**: Logged in ho par permission nahi hai (e.g. Free student asking for Pro Analytics).
- **`404 Not Found`**: Dhoonda gaya question ya test exist nahi karta.
- **`409 Conflict`**: Race condition ya double-submission (e.g. Test pehle hi submit ho chuka hai).
- **`429 Too Many Requests`**: Rate limit exceed ho gayi (AI prompts spam kar rahe ho).
- **`500 Internal Server Error`**: Server code fat gaya ya unhandled exception.
- **`503 Service Unavailable`**: Third-party API (Gemini/Supabase) temporarily down hai.

### 4. Idempotency Kya Hoti Hai?
- **Concept**: Ek hi button agar student ne network lag ki wajah se do baar click kar diya, to do baar paise nahi katne chahiye aur do baar test submit nahi hona chahiye.
- **Prepzii Implementation**: `src/lib/tests/bankSubmission.server.js` mein in-memory lock `withBankSubmissionLock(sessionId)` aur database stored procedure `zi_commit_bank_submission` check karta hai ki agar session already completed hai to second call duplicate attempt create karne ke bajaye existing attempt return kar de.
