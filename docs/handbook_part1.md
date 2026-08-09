# PrepZii Engineering Handbook
## Complete Architectural Documentation — v1.0 (August 2026)

> **For every engineer joining PrepZii.** This document is your single source of truth. Read it before you write a single line of code. It is the product of a complete read-only audit of the entire codebase.

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Folder Structure](#2-folder-structure)
3. [Routing Architecture](#3-routing-architecture)
4. [Authentication](#4-authentication)
5. [Database Architecture](#5-database-architecture)
6. [Supabase Storage](#6-supabase-storage)
7. [PYQ Engine](#7-pyq-engine)
8. [Test Engine](#8-test-engine)
9. [Formula Handbook](#9-formula-handbook)
10. [Community Module](#10-community-module)
11. [Analytics System](#11-analytics-system)
12. [Admin CMS](#12-admin-cms)
13. [API Documentation](#13-api-documentation)
14. [Component Architecture](#14-component-architecture)
15. [State Management](#15-state-management)
16. [Design System](#16-design-system)
17. [Performance Audit](#17-performance-audit)
18. [Security Audit](#18-security-audit)
19. [Current Technical Debt](#19-current-technical-debt)
20. [Future Architecture](#20-future-architecture)
21. [Data Flow Diagrams](#21-data-flow-diagrams)
22. [Final System Map](#22-final-system-map)

---

## 1. Executive Overview

### What is PrepZii?

PrepZii is a **Next.js 16 web application for JEE and NEET exam preparation**, targeting Class 11/12 students in India who are preparing for the most competitive engineering and medical entrance examinations in the world.

PrepZii is **not** a simple question bank. It is an intelligent preparation platform that combines:

- **Practice** (PYQs + Custom Mock Tests)
- **Performance tracking** (Analytics, weak chapter detection, readiness scores)
- **Gamification** (XP, Levels, Badges, Leaderboard, Streaks, Daily Goals)
- **Content** (Formula Handbooks, AI Explanations)
- **Community** (Study groups, Direct messages — schema designed, partially deployed)
- **Admin CMS** (Full content management for questions, exams, images, goals, badges, notifications)
- **Payments** (Razorpay Pro subscriptions)

### What Problems Does PrepZii Solve?

| Student Problem | PrepZii Solution |
|----------------|------------------|
| "I don't know what to practice" | PYQ Engine with year/subject/chapter filtering |
| "I don't know how I'm doing" | Analytics dashboard with accuracy, weak topics, readiness index |
| "I'm not motivated" | XP system, leveling, badges, daily goals, streaks, leaderboard |
| "I can't afford expensive coaching" | Affordable Pro plan (Rs.49/month) unlocking premium content |
| "I don't understand this question" | AI Explanation powered by Claude (Anthropic) |
| "I need formula references" | Formula PDF library per subject |
| "I can't find PYQs organized by year/chapter" | PYQ Engine with full exam paper mode, chapter mode, random mode |

### Core Modules

1. **PYQ Engine** — 2017-2026 past year questions, multi-mode filtering, bookmark, mistakes review
2. **Mock Test Engine** — Custom and quick tests with proctoring, scoring, and post-test analytics
3. **Analytics Dashboard** — Score trends, heatmaps, radar charts, weak topic analysis, readiness index, leaderboard
4. **Gamification System** — XP economy, 6-tier leveling, badge engine, streaks, daily goals
5. **Formula Library** — PDF handbooks per subject (Physics/Chemistry/Math/Biology)
6. **AI Explanations** — Claude Sonnet explains any question step-by-step
7. **Admin CMS** — Full content pipeline: create exams -> import CSV -> upload images -> publish
8. **Payments** — Razorpay Pro subscriptions with HMAC verification
9. **Community** — Study groups and private messaging (schema ready, feature partially live)
10. **Notifications** — Real-time admin broadcasts per exam track

### Architecture Style

PrepZii follows a **Monolithic Next.js Application** pattern:

- **Frontend + Backend in one Next.js 16 repository** using App Router
- **Server Components** for data-fetching pages (dashboard, analytics)
- **Client Components** for interactive pages (PYQ session, test session)
- **Next.js API Routes** as the backend API layer
- **Supabase PostgreSQL** as the database with Row Level Security (RLS)
- **Clerk** for authentication and user identity
- **No separate backend service** — all business logic lives in the Next.js API routes and server components

### Biggest Strengths

1. **Clean domain separation** — auth, dashboard, admin, and API each have separate route groups and layouts
2. **Thoughtful gamification** — XP, levels, badges, streaks, and goals are all interconnected through a well-designed system
3. **3-tier question fallback** — `getQuestions()` gracefully degrades if specific chapter/difficulty combinations yield no results
4. **Supabase realtime** — Notifications update live without page refresh
5. **Premium design system** — Glassmorphism, animated mesh gradients, micro-animations create an engaging experience

---

## 2. Folder Structure

```
ai-study-web/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Public auth pages
│   │   │   ├── sign-in/             # Clerk sign-in UI
│   │   │   └── sign-up/             # Clerk sign-up UI
│   │   │
│   │   ├── (dashboard)/             # Protected student pages
│   │   │   ├── layout.js            # Auth guard + onboarding check + Navbar
│   │   │   ├── dashboard/           # Home hub
│   │   │   ├── pyq/                 # PYQ studio + /session
│   │   │   ├── test/                # Test center + /session, /result/[id], /review/[id]
│   │   │   ├── analytics/           # Performance analytics dashboard
│   │   │   ├── history/             # Test history
│   │   │   ├── profile/             # Account settings + badges
│   │   │   ├── community/           # Study groups + direct messages
│   │   │   ├── pro/                 # Upgrade page with Razorpay checkout
│   │   │   └── ...
│   │   │
│   │   ├── admin/                   # Admin CMS — role="admin" gated
│   │   │   ├── layout.js            # isAdmin() role check + AdminSidebar
│   │   │   ├── exams/               # Exam paper CRUD
│   │   │   ├── import/              # CSV bulk question importer
│   │   │   ├── questions/           # Question browser with inline editing
│   │   │   ├── images/              # Missing image slot uploader
│   │   │   ├── students/            # Student directory
│   │   │   ├── notifications/       # Broadcast announcements
│   │   │   ├── badges/              # Badge CRUD
│   │   │   └── goals/               # Daily goal configuration
│   │   │
│   │   ├── api/                     # Next.js Route Handlers (server-only)
│   │   │   ├── admin/               # Admin-only endpoints
│   │   │   ├── pyq/                 # PYQ query engine + sub-routes
│   │   │   ├── pyq-attempts/        # PYQ attempt + XP + badge trigger
│   │   │   ├── test-session/        # Test session creation
│   │   │   ├── payment/             # Razorpay order + verification
│   │   │   └── webhooks/clerk/      # Clerk user.created webhook
│   │   │
│   │   ├── formula-books/           # PDF viewer pages
│   │   ├── onboarding/              # New user setup
│   │   ├── layout.js                # Root layout — ClerkProvider, fonts, Razorpay SDK
│   │   ├── page.js                  # Public landing page
│   │   └── globals.css              # Global CSS (Tailwind v4 + custom utilities)
│   │
│   ├── components/                  # Shared React components
│   │   ├── admin/                   # Admin-specific UI
│   │   ├── analytics/               # Chart + card analytics
│   │   ├── community/               # Community UI
│   │   ├── pyq/                     # PYQ UI
│   │   ├── review/                  # Post-test review
│   │   ├── test/                    # Test builder
│   │   ├── Navbar.jsx               # Top navigation bar
│   │   ├── DailyGoals.jsx           # Daily challenge task tracker
│   │   ├── MathText.jsx             # KaTeX math renderer
│   │   ├── NotificationBell.jsx     # Real-time notification bell
│   │   ├── PageWrapper.jsx          # Page layout with ambient background
│   │   └── UserGreeting.jsx         # Personalized greeting heading
│   │
│   ├── constants/                   # Static configuration
│   │   ├── analyticsData.js         # Mock/fallback analytics datasets
│   │   └── examConfig.js            # JEE vs NEET config
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useQuestionImagePreload.js
│   │   ├── useRecentSessions.js
│   │   └── useStrictExamMode.js     # Proctoring enforcement
│   │
│   ├── lib/                         # Low-level library modules
│   │   ├── auth.js                  # Route constants + getAuthContext()
│   │   ├── admin.js                 # isAdmin() role check
│   │   ├── questions.js             # getQuestions() 3-tier fallback
│   │   ├── supabase.js              # Anon Supabase client (RLS-bound)
│   │   ├── supabaseAdmin.js         # Service role client (bypasses RLS)
│   │   ├── supabaseClient.js        # Duplicate of supabase.js (legacy)
│   │   └── subscription.js          # isUserPro(), daysRemaining()
│   │
│   ├── services/                    # High-level orchestration
│   │   └── analytics.js             # getUserAnalytics() aggregator
│   │
│   ├── utils/                       # Business logic utilities
│   │   ├── badgeEngine.js           # evaluateUserBadges()
│   │   ├── levelEngine.js           # getLevelFromXP()
│   │   ├── streak.js                # updateStreak()
│   │   ├── goals.js                 # updateGoalProgress()
│   │   ├── leaderboard.js           # getTopLeaderboard(), getUserRank()
│   │   └── xp.js                   # addXP()
│   │
│   └── proxy.js                     # Clerk middleware (route protection)
```

### Folder Purpose Rules

| Folder | Purpose | Store Here | Never Store Here |
|--------|---------|------------|------------------|
| `app/(auth)` | Clerk auth UI pages | Sign-in, sign-up layouts | Business logic |
| `app/(dashboard)` | Protected student pages | Page components, layout | API handlers |
| `app/admin` | Admin CMS pages | Admin UI, role-gated pages | Student pages |
| `app/api` | API Route Handlers | All server-side handlers | Client-side code |
| `components` | Reusable UI components | Domain-specific components | DB queries |
| `constants` | Pure static data | Config objects, mock data | DB calls, side effects |
| `hooks` | Custom React hooks | Browser-side stateful logic | Server-only code |
| `lib` | SDK wrappers + low-level DB | Supabase clients, auth helpers | Complex orchestration |
| `services` | High-level orchestration | Multi-table aggregations | Raw Supabase queries |
| `utils` | Stateless business logic | XP, badges, streaks, bookmarks | React components |

---

## 3. Routing Architecture

### Middleware (src/proxy.js)

The middleware uses `clerkMiddleware` and `createRouteMatcher`. Protected routes:

```
/onboarding(.*)
/dashboard(.*)
/analytics(.*)
/profile(.*)
/pyq(.*)
/test(.*)
/pro(.*)
/community(.*)
```

If a protected route is accessed without authentication -> Clerk redirects to /sign-in.

> **Note:** The middleware runs on the Edge runtime. Admin role checking happens inside the Admin layout using the full Clerk client, not in middleware.

### Route Tree

```
URL                              Auth Required    Layout
─────────────────────────────────────────────────────────────────
/                                No               Root
/sign-in                         No               Root + AuthLayout
/sign-up                         No               Root + AuthLayout
/pricing                         No               Root
/onboarding                      Yes (Clerk)      Root (custom)
/dashboard                       Yes + Onboarded  Dashboard
/pyq                             Yes + Onboarded  Dashboard
/pyq/session                     Yes + Onboarded  Dashboard
/test                            Yes + Onboarded  Dashboard
/test/session                    Yes + Onboarded  Dashboard
/test/result/[id]                Yes + Onboarded  Dashboard
/test/review/[id]                Yes + Onboarded  Dashboard
/analytics                       Yes + Onboarded  Dashboard
/profile                         Yes + Onboarded  Dashboard
/community                       Yes + Onboarded  Dashboard
/pro                             Yes + Onboarded  Dashboard
/admin                           Yes + Admin Role Admin
/admin/exams                     Yes + Admin Role Admin
/admin/import                    Yes + Admin Role Admin
/admin/questions                 Yes + Admin Role Admin
/admin/images                    Yes + Admin Role Admin
/admin/students                  Yes + Admin Role Admin
/admin/notifications             Yes + Admin Role Admin
/admin/badges                    Yes + Admin Role Admin
/admin/goals                     Yes + Admin Role Admin
/formula-books                   No               Root (custom)
/api/*                           Varies           None
```

### API Routes

```
/api/pyq                 GET PYQ questions (modes: full, chapter, random, mistakes)
/api/pyq/analytics       GET user PYQ stats + streak
/api/pyq/chapters        GET chapter list from pyq_questions
/api/pyq/leaderboard     GET global XP leaderboard
/api/pyq/overview        GET total question count + year range
/api/pyq/papers          GET available exam papers by year
/api/pyq-attempts        POST record PYQ answer + award XP
/api/pyq-bookmarks       GET/POST/DELETE bookmark
/api/analytics           GET aggregate analytics
/api/profile             GET user profile + XP
/api/profile/update      POST update name/track/year
/api/profile/badges      GET badge progress
/api/update              POST batch XP after test session
/api/test-session        POST create test session
/api/test-attempts       POST/GET test attempt management
/api/formula-books       GET all formula books
/api/explain             POST AI explanation (Anthropic proxy)
/api/payment/create-order POST create Razorpay order
/api/payment/verify      POST verify payment + activate subscription
/api/daily-goals         GET active goals + user progress
/api/notifications       GET notifications
/api/study-sessions      POST record study session
/api/subscription        GET subscription status
/api/webhooks/clerk      POST Clerk user.created webhook
/api/admin/*             Admin-only endpoints
```

---

## 4. Authentication

### Complete Authentication Flow

**New User Registration:**
```
User visits /sign-up
  -> Clerk renders sign-up widget (inside AuthLayout)
  -> User submits email/Google/GitHub
  -> Clerk creates user account
  -> Clerk fires "user.created" webhook -> POST /api/webhooks/clerk
  -> Webhook: verifyWebhook() + upserts user_profiles
     { clerk_user_id, full_name, exam: "JEE", target_year: 2026 }
  -> Clerk redirects to /onboarding (signUpForceRedirectUrl)
  -> /onboarding (Server Component + Server Action):
     User enters: full name, target exam, target year
     Server Action fires:
       a. Upserts user_profiles in Supabase
       b. Updates Clerk publicMetadata: { onboardingComplete: true }
       c. Sets HTTP cookie "prepzii_track" = "jee" or "neet" (1 year TTL)
     Redirects to /dashboard
  -> Dashboard Layout:
       getAuthContext() -> OK
       initUserLeaderboard(userId, name) -> ensures user_xp row exists
       Renders Navbar + TrackWrapper + dashboard children
```

**Returning User:**
```
User visits /sign-in
  -> Clerk authenticates
  -> signInForceRedirectUrl -> /dashboard
  -> Dashboard Layout: auth check passes, renders normally
```

**Admin User:**
```
Admin signs in normally
  -> Clerk publicMetadata.role = "admin" (set manually by superadmin)
  -> /admin/* routes: AdminLayout calls isAdmin()
  -> isAdmin() checks publicMetadata.role === "admin"
  -> If true: renders AdminSidebar
```

### Key Authentication Files

| File | Purpose |
|------|---------|
| `src/proxy.js` | Clerk middleware — blocks unauthenticated access |
| `src/lib/auth.js` | Route constants + getAuthContext() |
| `src/lib/admin.js` | isAdmin() — checks publicMetadata.role |
| `src/lib/supabase.js` | Anon Supabase client (RLS-enforced) |
| `src/lib/supabaseAdmin.js` | Service Role client (bypasses RLS — server-only) |
| `src/app/api/webhooks/clerk/route.js` | Provisions user_profiles on sign-up |
| `src/app/onboarding/page.js` | Onboarding form + Server Action |

### Supabase Client Selection Guide

```
supabase.js / supabaseClient.js
  Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
  OK:  Subject to RLS, safe for client + server components
  NOT: Cannot bypass RLS

supabaseAdmin.js
  Key: SUPABASE_SERVICE_ROLE_KEY
  OK:  Bypasses ALL RLS, used for webhooks + admin ops
  NOT: NEVER import in client components (server-only)
```

### getAuthContext() Resilience Pattern

If `currentUser()` throws (Clerk API timeout, rate limit), `getAuthContext()` returns:
`{ userId, user: null, onboardingComplete: true }`

This prevents authenticated users from being trapped in infinite redirect loops during Clerk API downtime.

### Three-Layer State Sync on Onboarding

When a user completes onboarding, 3 stores are written simultaneously:

```
Server Action (completeOnboarding):
  1. Supabase user_profiles: { clerk_user_id, email, full_name, exam, target_year }
  2. Clerk publicMetadata: { onboardingComplete: true, targetExam, targetYear }
  3. HTTP Cookie: "prepzii_track" = "jee" | "neet" (1 year, path="/")
```

The cookie is the fastest way to read the exam track client-side without an API call.

---

## 5. Database Architecture

PrepZii uses Supabase (PostgreSQL) with 17 core tables, 2 RPC functions, and 11 community tables.

### Core Tables

#### user_profiles
Student profiles, auto-created on sign-up via Clerk webhook.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| clerk_user_id | text UNIQUE | Link to Clerk |
| email | text | |
| full_name | text | |
| exam | text | JEE or NEET (uppercase) |
| current_track | text | jee or neet (lowercase) |
| target_year | int | |

**Read:** /api/profile, getDashboardData(), Admin student API
**Write:** /api/webhooks/clerk, /api/profile/update, Onboarding Server Action

#### user_xp
The gamification hub. XP, level, badge, streak, question counters.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | text | Clerk user ID |
| name | text | Denormalized for leaderboard |
| xp | int | Total XP |
| level | int | Computed from XP |
| badge | text | Explorer, Challenger, Expert, Elite, Master, Grandmaster |
| correct_answers | int | |
| pyq_solved | int | |
| questions_solved | int | |
| streak | int | Current daily streak |
| last_study_date | date | For streak calculation |
| updated_at | timestamp | For leaderboard tie-breaking |

**Read:** getUserXP(), getTopLeaderboard(), getUserRank()
**Write:** addXP(), updateStreak(), initUserLeaderboard()

#### questions
Practice test question bank (non-PYQ). Powers the Mock Test Engine.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| exam | text | JEE Main, JEE Advanced, NEET |
| subject | text | Physics, Chemistry, Mathematics, Biology |
| chapter | text | |
| difficulty | text | Easy, Medium, Hard |
| question_text | text | |
| question_image | text | URL or null |
| option_a to option_d | text | |
| option_a_image to option_d_image | text | |
| correct_option | text | A, B, C, or D |
| explanation | text | |
| marks | numeric | Default 4 |
| negative_marks | numeric | Default -1 |

#### pyq_questions
Past Year Questions bank. Powers the PYQ Engine.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| exam_id | uuid FK -> pyq_exams | |
| exam | text | |
| year | int | |
| subject | text | |
| chapter | text | |
| question | text | |
| option_a to option_d | text | |
| correct_option | text | |
| marks_positive | numeric | |
| marks_negative | numeric | |
| question_type | text | MCQ, Numerical |
| exam_type | text | Main, Advanced |
| attempt | text | January, April |
| shift | text | Shift 1, Shift 2 |

#### pyq_exams
Parent container for PYQ papers.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| exam | text | |
| year | int | |
| is_published | bool | Controls student visibility |
| status | text | DRAFT or PUBLISHED |
| question_count | int | Auto-maintained via RPC |

#### test_attempts
Records each mock test session.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | text | Clerk user ID |
| test_id | uuid FK -> tests | |
| mode | text | quick, custom |
| score | numeric | Signed score (with negative marking) |
| correct_answers | int | |
| attempted | int | |
| time_taken_seconds | int | |
| status | text | in_progress, completed |
| created_at | timestamp | |

#### user_answers
Individual question responses within a test attempt.

| Column | Type |
|--------|------|
| id | uuid PK |
| test_attempt_id | uuid FK -> test_attempts |
| question_id | uuid FK -> questions |
| selected_option | text |
| is_correct | bool |

#### pyq_attempts
Individual PYQ answer attempts.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | text | |
| pyq_question_id | uuid FK -> pyq_questions | |
| is_correct | bool | |
| attempted_at | timestamp | NOT created_at |

> **CRITICAL:** This table uses `attempted_at`, NOT `created_at`. Queries using `created_at` will error. Always use `attempted_at`.

#### pyq_bookmarks
User bookmarked PYQ questions.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | text | |
| question_id | text | Stored as STRING (not uuid) |

> **Note:** question_id is stored as text. Treat as string in all queries.

#### daily_goals
Admin-configured daily challenge tasks.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | |
| goal_type | text | PYQ, TEST, STREAK |
| target | text | JEE, NEET, or ALL |
| target_value | int | Completion threshold |
| xp | int | XP reward on completion |
| is_active | bool | |

#### user_daily_goals
Tracks student progress toward daily goals.

| Column | Type |
|--------|------|
| user_id | text |
| goal_id | uuid FK -> daily_goals |
| progress | int |
| goal_date | date |
| completed_at | timestamp |

#### subscriptions
PrepZii Pro subscription status.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| clerk_user_id | text | |
| status | text | active, expired |
| plan | text | monthly, quarterly, yearly |
| expires_at | timestamp | |

#### badges
Achivement badge definitions (admin-configured).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | |
| xp_reward | int | XP awarded on earning |
| requirement_type | text | See below |
| requirement_value | int | |
| enabled | bool | |

Requirement types: `tests_completed`, `pyq_completed`, `total_questions`, `total_xp`, `streak`, `accuracy`, `leaderboard_rank`, `mock_tests`, `speed_solver`

#### user_badges
Records earned badges.

| Column | Type |
|--------|------|
| user_id | text |
| badge_id | uuid FK -> badges |
| earned_at | timestamp |

#### notifications
Admin-broadcast messages.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | text | "all" for global broadcasts |
| title | text | |
| message | text | |
| href | text | Deep-link URL |
| stream | text | JEE, NEET, or ALL |
| is_read | bool | |
| created_at | timestamp | |

#### formula_books
Formula PDF handbook metadata.

| Column | Type |
|--------|------|
| id | uuid PK |
| title | text |
| subject | text |
| file_url | text |
| created_at | timestamp |

### RPC Functions

| Function | Purpose |
|----------|---------|
| `increment_exam_question_count` | Increment pyq_exams.question_count when adding questions |
| `decrement_exam_question_count` | Decrement pyq_exams.question_count when deleting questions |

---

## 6. Supabase Storage

### Buckets

| Bucket | Purpose |
|--------|---------|
| `pyq-images` | Question, option, and explanation images for PYQ questions |
| `formula-books` | PDF formula handbook files |

### How Images Work

**Upload (Admin):**
1. Admin navigates to /admin/images
2. ImageManager shows questions with missing question_image
3. Admin uploads image -> POST /api/admin/upload-image
4. Server uploads to Supabase Storage pyq-images bucket
5. Returns public URL -> Updates pyq_questions.question_image

**Display (Student):**
1. PYQ question fetched from Supabase (includes image URL fields)
2. QuestionCard renders images using img tags
3. Image URL points to Supabase Storage CDN
4. useQuestionImagePreload hook preloads next question's images for smooth navigation

### Image URL Format
```
https://<project-ref>.supabase.co/storage/v1/object/public/pyq-images/<filename>
```

### Fallbacks
- If question_image is null: no image rendered (text-only)
- If image URL 404s: browser shows broken image icon (no explicit fallback handler)
- pyqData.js contains static mock dataset for fallback/demo

---

## 7. PYQ Engine

The PYQ Engine is the most complex feature. Students practice questions from real exam papers from 2017-2026.

### Query Modes

| Mode | How It Works | Required Params |
|------|-------------|------------------|
| `full` | All questions for a specific exam_id (entire paper) | examId |
| `chapter` | Filters by exam + subject + chapter | exam, subject, chapter |
| `random` | Random subset by exam + subject + year | exam, subject, year, limit |
| `mistakes` | Questions previously answered incorrectly by user | userId (via auth), exam |

### Complete PYQ Session Data Flow

```
Step 1: Subject/Mode Selection
  Student visits /pyq (Client Component)
  Student selects: Exam -> Subject -> Year -> Chapter -> Mode
  State stored in React useState

Step 2: Question Loading
  getPYQ(params) -> GET /api/pyq?mode=chapter&exam=...
  api/pyq/route.js:
    - Queries pyq_questions
    - Joins pyq_exams to check is_published = true
    - Strips answers/explanations for unattempted questions (anti-cheat)
    - Returns array of question objects

Step 3: Rendering
  Questions rendered by QuestionCard:
    - Question text (LaTeX via MathText)
    - Question image (from Supabase Storage)
    - 4 options (A/B/C/D) with option images
    - Bookmark toggle button
    - Explain button (triggers AI explanation)

Step 4: Answer Recording
  Student selects an option ->
  POST /api/pyq-attempts { pyq_question_id, selected_option, is_correct, exam }
    1. Upserts row in pyq_attempts
    2. Awards XP: correct = +10 XP, wrong = +2 XP
    3. Async: evaluateUserBadges(userId)
    4. Returns { success, xpGained, isCorrect }

Step 5: AI Explanation
  Student clicks Explain ->
  POST /api/explain -> Anthropic Claude -> Step-by-step explanation
  Rendered in modal with ReactMarkdown + KaTeX

Step 6: Navigation
  useQuestionImagePreload hook preloads next question's images
  Smooth transition to next question

Step 7: Bookmarks
  Student clicks bookmark icon ->
  toggleBookmark(userId, questionId) from src/utils/bookmarks.js
  Upsert/delete in pyq_bookmarks table
```

### Answer Security

The /api/pyq route strips correct_option, explanation, and numerical bounds from **unattempted** questions:
```
if (!attempted) {
  question.correct_option = null
  question.explanation = null
  question.answer_revealed = false
}
```
This prevents students from reading answers via browser DevTools before answering.

### Chapter Mapping System

In `src/lib/questions.js`, a `CHAPTER_ALIASES` map normalizes chapter names:
```
"Kinematics" -> matches DB values:
  "Kinematics", "Motion in a Straight Line", "Motion in a Plane"
```
When a student selects "Kinematics", the query expands to include all DB variations. This handles inconsistent chapter naming across different import sources.

### Bookmarks Implementation

File: `src/utils/bookmarks.js`

| Function | Description |
|----------|-------------|
| getBookmarks(userId) | Returns all bookmarked question IDs |
| isBookmarked(userId, questionId) | Returns boolean |
| saveBookmark(userId, questionId) | Inserts into pyq_bookmarks |
| removeBookmark(userId, questionId) | Deletes from pyq_bookmarks |
| toggleBookmark(userId, questionId) | Calls save or remove based on current state |

> **Important:** question_id stored as STRING in pyq_bookmarks. Must be treated as string.

---

## 8. Test Engine

### Test Flow

```
/test page (Client Component)
  TestBuilder (custom config) or QuickTest (preset)
    Config stored in sessionStorage
    (subjects, chapters, difficulty, count, duration, mode)

  Navigate to /test/session
    getQuestions() -> questions table (3-tier fallback)
    POST /api/test-session -> test_attempts (status: in_progress)
    useStrictExamMode(true) -> Fullscreen + anti-cheat
    Countdown timer starts

  Student answers questions
    selectedAnswers[] stores each answer
    QuestionPalette shows color-coded status

  Submit (manual or timer expires)
    calculateQuestionScore() per question
    UPDATE test_attempts: { score, correct_answers, attempted, time_taken, status: "completed" }
    INSERT user_answers: { test_attempt_id, question_id, selected_option, is_correct } x N

  Post-submit effects:
    updateGoalProgress(userId, "TEST", 1)
    updateStreak(userId)
    POST /api/update -> addXP(+15 per correct answer)

  Redirect to /test/result/[attemptId]
    Shows score, accuracy, time, subject breakdown
    Links to /test/review/[attemptId]

  /test/review/[attemptId]
    Per-question review: correct/wrong color coding, explanation
```

### 3-Tier Question Fallback

In `src/lib/questions.js`:

```
Tier 1: Strict query (exam + subject + chapter + difficulty)
  If results: use them

Tier 2: Relax chapter filter (exam + subject + difficulty)
  If results: use them

Tier 3: Relax both (exam + subject only)
  Use whatever is available
```

This ensures students always get a test even with very specific filtering combinations.

### Subject Distribution

| Exam | Physics | Chemistry | Math/Biology |
|------|---------|-----------|---------------|
| JEE | 33% | 33% | 33% (Math) |
| NEET | 25% | 25% | 50% (Biology) |

### useStrictExamMode Hook

File: `src/hooks/useStrictExamMode.js`

When enabled:
- Requests fullscreen mode
- Detects Esc key / fullscreen exit -> warning
- Listens for `visibilitychange` (alt-tab detection)
- Listens for window blur (other window focused)
- Blocks F5, Ctrl+R, Cmd+R, Alt+Left, Backspace navigation
- Counts violations in sessionStorage
- Intercepts link clicks to prevent accidental navigation

### Scoring Formula

```
calculateQuestionScore(question, selectedOption, exam):
  attempted = selectedOption !== null && !== undefined
  isCorrect = attempted && selectedOption === question.correct
  positive = question.marks || question.marks_positive || 4
  negative = |question.negative_marks || question.marks_negative| || 1
  scoreDelta = !attempted ? 0 : isCorrect ? positive : -negative
```

### Timer Logic

- Duration stored in sessionStorage, passed to session
- `useEffect` + `setInterval` countdown (client-side)
- Auto-submits when timer reaches zero
- Last 5 minutes: UI switches to red danger mode
- Time format: MM:SS

---

## 9. Formula Handbook

### Structure

| Layer | Location | Purpose |
|-------|----------|----------|
| DB table | `formula_books` | PDF metadata (title, subject, file_url) |
| API | `/api/formula-books` | Fetch all books |
| Lib | `src/lib/formulaBooks.js` | getFormulaBooks(), getFormulaBook(id), getPdfUrl() |
| Page | `src/app/formula-books/[id]/page.jsx` | PDF iframe viewer |
| Dashboard | `DashboardSection.jsx` | 3D animated book cards linking to formula books |
| Storage | Supabase `formula-books` bucket | PDF files |

### How PDF Viewing Works

1. `formula_books.file_url` contains direct URL to PDF
2. Page renders `<iframe src="{url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH">`
3. Uses @react-pdf-viewer library (alternative PDF rendering available)
4. PDF is rendered inline in the browser

### Goal Tracking Integration

When a student opens a formula book, `updateGoalProgress(user.id, "FORMULA", 1)` is called:
- Updates user_daily_goals for any active FORMULA type goals
- Awards XP when goal threshold is reached
- Uses a `useRef(false)` lock to only fire once per page load

---

## 10. Community Module

The Community Module has a complete database schema and full API, partially live in the frontend.

### 11 Database Tables

| Table | Purpose |
|-------|----------|
| `community_groups` | Study groups (PUBLIC/PRIVATE, by exam track) |
| `community_group_members` | Group membership (OWNER/ADMIN/MEMBER roles) |
| `community_join_requests` | Join request workflow for PRIVATE groups |
| `community_group_messages` | Group chat messages (max 2000 chars) |
| `community_direct_conversations` | 1-on-1 DM channels |
| `community_direct_messages` | Direct messages (max 2000 chars) |
| `community_user_blocks` | User blocking system |
| `community_reports` | Abuse/content reporting |
| `community_moderation_logs` | Admin moderation audit trail |
| `community_user_status` | Community-level suspensions |
| `community_rate_limits` | Rate limiting by action type |

### Rate Limits

| Action | Limit |
|--------|-------|
| Messages | 20 per minute |
| DM requests | 5 per hour |
| Group create | 3 per day |
| Join requests | 20 per day |
| Reports | 10 per day |
| Max groups per user | 3 active groups |

### Complete API Routes

```
GET/POST  /api/community/groups             Discover groups, create group
GET       /api/community/groups/[id]         Group details
PATCH     /api/community/groups/[id]         Update group (owner only)
DELETE    /api/community/groups/[id]         Delete group (owner only)
POST      /api/community/groups/[id]/join    Join public / request private
POST      /api/community/groups/[id]/leave   Leave group
GET/PATCH/DELETE /api/community/groups/[id]/members  Member management
GET/PATCH /api/community/groups/[id]/requests  Join request review
GET/POST  /api/community/groups/[id]/messages  Group chat
DELETE    /api/community/groups/[id]/messages/[msgId]  Soft-delete message
GET       /api/community/direct/conversations    DM inbox
GET/POST  /api/community/direct/conversations/[id]/messages  DMs
DELETE    /api/community/direct/conversations/[id]/messages/[msgId]  Delete DM
GET/POST  /api/community/direct/requests     DM request management
PATCH     /api/community/direct/requests/[id]  Accept/decline DM
GET/POST/DELETE /api/community/blocks         Block/unblock users
POST      /api/community/reports              Report content/user/group
```

### Realtime

Supabase Realtime must be enabled on:
- `community_group_messages` — for live group chat
- `community_direct_messages` — for live DMs

Clients subscribe to INSERT events:
```javascript
supabase.channel(`group-chat-${groupId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'community_group_messages',
    filter: `group_id=eq.${groupId}` }, handleNewMessage)
  .subscribe()
```

### Security Design

| Concern | Solution |
|---------|----------|
| Spam | community_rate_limits per action |
| Harassment | community_user_blocks |
| Bad actors | community_reports |
| Admin action | community_moderation_logs audit trail |
| Group control | is_frozen flag blocks all group activity |
| Suspension | community_user_status (doesn't affect Clerk account) |

> **Gap:** RLS policies only define one SELECT policy (community_groups_select). All other community tables need RLS policies defined.

---

## 11. Analytics System

### Main Function: getUserAnalytics()

File: `src/services/analytics.js`

Runs 2 parallel Supabase queries with deep joins, then computes 15+ metrics:

```javascript
const [testAttempts, pyqAttempts] = await Promise.all([
  supabase.from("test_attempts").select(`
    created_at, score, total_marks, total_questions,
    correct_answers, attempted, time_taken_seconds,
    tests(exam),
    user_answers(selected_option, is_correct, created_at,
      questions(exam, subject, chapter)
    )
  `).eq("user_id", userId),

  supabase.from("pyq_attempts").select(`
    is_correct, attempted_at,
    pyq_questions(exam, subject, chapter, marks_positive, marks_negative)
  `).eq("user_id", userId)
]);
```

### Analytics Formulas

| Metric | Formula |
|--------|----------|
| averageScore | (totalScore / totalMarks) x 100 |
| accuracy | (totalCorrect / totalAttempted) x 100 |
| PYQ score per attempt | correct ? +marks_positive : -abs(marks_negative) |
| speedScore | min(100, round((120 / max(avgTimePerQ, 30)) x 75)) — default 69 if no data |
| mockTestScore | (totalScoreFromTests / totalMarksFromTests) x 100 |
| overallReadiness | mean of [conceptCoverage, pyqAccuracy, speedScore, mockTestScore] |
| conceptCoverage | min((chaptersAttempted / max(chaptersAttempted, 30)) x 100, 100) |
| chapterAccuracy | (correct / total) x 100 |
| topicSeverity | <50% = critical, <70% = warn, >=70% = good |
| heatmap activity | testsOnDay + floor(questionAttemptsOnDay / 5) -> level 0-3 |
| radarTopper | Constant 85 (fixed benchmark) |
| timeByDay | Hours per weekday, rounded to 1 decimal |

### Streak Calculation

File: `src/lib/analyticsHelpers.js`

```
1. Collect all activity timestamps (tests + PYQs)
2. Convert to local midnight (setHours(0,0,0,0))
3. Deduplicate into unique days, sort descending
4. If most recent day is neither today nor yesterday: streak = 0
5. Otherwise: start streak = 1
   For each consecutive prior day: streak++
   Stop when a day is missed
```

### XP Economy

File: `src/utils/xp.js`

| Event | XP Award |
|-------|----------|
| PYQ correct answer | +10 XP |
| PYQ wrong answer | +2 XP (participation) |
| Test correct answer | +15 XP |
| Goal completion | +goal.xp XP (from daily_goals table) |
| Badge earned | +badge.xp_reward XP |

`addXP()` process:
1. Fetch current user_xp row
2. newXP = existing_xp + amount
3. levelStats = getLevelFromXP(newXP)
4. badgeTitle = getLevelBadge(levelStats.currentLevel)
5. Upsert user_xp with new values
6. If not skipBadgeEval: fire evaluateUserBadges() asynchronously

### Level System

File: `src/utils/levelEngine.js`

```
Level  XP Threshold    Increment    Title
  1         0 XP        -           Explorer
  2       500 XP       +500         Challenger
  3     1,200 XP       +700         Challenger
  4     2,200 XP      +1,000        Expert
  5     3,500 XP      +1,300        Expert
  6     5,000 XP      +1,500        Elite
  7     6,500 XP      +1,800        Elite
  8     8,300 XP      +2,100        Master
  9    10,400 XP      +2,400        Master
 10    12,800 XP      +2,700        Grandmaster
 ...   (increment +300 per level beyond L6)
```

### Badge Engine

File: `src/utils/badgeEngine.js`

Runs after every PYQ answer. Makes 6 Supabase queries:
1. SELECT all enabled badges from badges
2. SELECT user's already-earned badges from user_badges
3. SELECT user_xp row (XP + streak)
4. SELECT all user_xp rows for leaderboard rank (full table scan!)
5. SELECT pyq_attempts for accuracy/count
6. SELECT test_attempts with user_answers for mock score/speed

For each unearned badge: checks requirement against user stats.
If met: INSERT into user_badges + award badge.xp_reward XP.

### Badge Requirement Types

| Type | Metric | Direction |
|------|--------|----------|
| tests_completed | Total mock tests | >= requirement_value |
| pyq_completed | Total PYQ answered | >= requirement_value |
| total_questions | Total questions answered | >= requirement_value |
| total_xp | Total XP | >= requirement_value |
| streak | Current daily streak | >= requirement_value |
| accuracy | Overall accuracy % | >= requirement_value |
| leaderboard_rank | Global rank | <= requirement_value (lower is better) |
| mock_tests | Best mock score % | >= requirement_value |
| speed_solver | Avg seconds per question | <= requirement_value (faster is better) |

### Leaderboard

File: `src/utils/leaderboard.js`

- `getTopLeaderboard()`: Top 10 from user_xp ordered by `xp DESC, updated_at ASC`
- `getUserRank(userId)`: Counts users with higher XP (or same XP + earlier updated_at) + 1
- Tie-breaking: whoever reached that XP level first wins

### Daily Goals

File: `src/utils/updateGoalProgress.js`

```
1. Find active goals matching goalType (PYQ/TEST/STREAK)
2. Find user's progress record
3. If record is today: progress += amount
4. If record is from yesterday: isNewDay=true, progress = amount (reset)
5. If goal now completed AND wasn't before:
   -> award goal.xp XP
   -> set completed_at = now
```

### Analytics Dashboard Tabs

| Tab | Content |
|-----|----------|
| Overview | 4 metric cards (avg score, accuracy, PYQs solved, tests completed) |
| Charts | Line chart (trend), Donut (subjects), Radar (vs topper), Bar (time by day), Heatmap |
| AI Insights | PLACEHOLDER - static "Coming Soon" |
| Leaderboard | Top 10 global XP rankings |

> **Note:** Chart.js is loaded from CDN at runtime, not bundled. Charts don't render until CDN script loads.
