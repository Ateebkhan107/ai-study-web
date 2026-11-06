# 🚀 Prepzii Architecture: Start Here (Beginner's Guide)

> **Welcome to the Engineering Core of Prepzii!**  
> Agar aap ek co-founder hain jinhone AI tools se ek huge application build kiya hai, par andar ki engineering "black box" lagti hai — to yeh documentation aapke liye ek superpower hai.

---

## 💡 Yeh Guide Kis Baare Mein Hai?

Prepzii ek simple website nahi hai; yeh ek **Full-Stack, Multi-Tenant, AI-Integrated EdTech Platform** hai jo India ke sabse competitive exams (**JEE Main, JEE Advanced, NEET**) ke aspirants ke liye banaya gaya hai.

Is repository mein:
- **Next.js 16** (React 19) par chalne wala modern web application.
- **Supabase (PostgreSQL)** jisme 60+ tables, custom stored procedures, Row Level Security (RLS) policies hain.
- **Clerk Authentication** jo user sessions aur identities manage karta hai.
- **Dual AI Systems**: **Google Gemini (3.6 Flash / 3.6 Pro)** for the interactive AI Tutor "Zi", and **Anthropic Claude** for on-demand question explanations.
- **Competitive Battle Zone**: Real-time 1v1 PvP quiz engine with ELO ratings.
- **Admissions Predictors**: Mathematical percentile & rank interpolation engine + JoSAA cutoff search.
- **Razorpay Payments**: Automated recurring & one-time subscriptions with cryptographic HMAC verification.
- **B2B Coaching Institute MVP**: Batches, student rosters, custom mock test builders.

---

## 🗺️ Documentation Map (Kaise Padhein?)

Aapke pure architecture ko 14 modular documents aur ek **Interactive Architecture Explorer (HTML)** mein divide kiya gaya hai:

| File | Document | Hinglish Description (Kya milega?) |
|---|---|---|
| `00-start-here.md` | **Start Here** | *Yeh document* — Orientation, mindset, aur reading guide. |
| `01-system-overview.md` | **System Overview** | Bird's-eye view: Browser se lekar database aur AI tak request kaise ghumti hai. |
| `02-high-level-design.md` | **High Level Design (HLD)** | Prepzii ke 18 core modules ka complete functional map with big Mermaid diagrams. |
| `03-low-level-design.md` | **Low Level Design (LLD)** | Code-level deep dive: Har module ki exact files, functions, inputs, outputs, schemas. |
| `04-database-design.md` | **Database Architecture** | 63 tables ka analysis, ER diagrams, Primary Keys, Foreign Keys, RLS, aur custom RPCs. |
| `05-api-reference.md` | **API Reference** | Sabhi ~75 API endpoints ka detailed inventory (Method, Auth, Table, Purpose). |
| `06-auth-and-security.md` | **Auth & Security** | Clerk + Supabase sync, Next 16 `src/proxy.js`, HMAC validation, security gaps. |
| `07-user-journeys.md` | **Real User Journeys** | 6 real user journeys (Signup, Mock Test, Analytics, Zi AI, Predictor, Battle). |
| `08-ai-architecture.md` | **Zi AI & LLM Engine** | Gemini 3.6 Flash/Pro integration, streaming, memory, rate limits, audio transcription. |
| `09-deployment.md` | **Deployment & Infra** | Vercel serverless, Edge caching, SSL/DNS, Supabase hosted postgres, Razorpay flow. |
| `10-scalability.md` | **Scalability Guide** | 100 se 100,000 active users tak Prepzii kaise scale karega, bottlenecks aur solutions. |
| `11-glossary.md` | **Technical Glossary** | 40+ engineering terms (ORM, RLS, RPC, HMAC, SSR, Hydration) in plain Hinglish. |
| `12-learning-roadmap.md` | **Learning Roadmap** | Ek 4-week step-by-step roadmap to speak like a Principal Architect. |
| `13-evidence-and-unknowns.md` | **Audit Evidence & Unknowns** | Verified code facts, line citations, and unverified production secrets/flags. |
| `prepzii-architecture-explorer.html` | **Interactive Visual Explorer** | Locally viewable offline web dashboard with zoomable diagrams & search. |

---

## 🧠 Fundamental Mental Model: "Prepzii As A Restaurant"

System design ko samajhne ka sabse aasan tarika ek restaurant ka analogy hai:

1. **The Customer (Student in Browser)**: Menu dekhta hai, order deta hai (clicks button / submits answer).
2. **The Waiter (Frontend / Next.js Client Components)**: Order note karta hai, form validate karta hai, screen update karta hai (React state).
3. **The Order Counter / Dispatcher (`src/proxy.js` & API Routes)**: Order verify karta hai (Clerk auth check karta hai ki customer valid hai ya nahi).
4. **The Kitchen Chefs (Next.js Server API Routes & Server Actions)**: Business logic execute karte hain — test evaluation (+4, -1 score calculation), prompt preparation for AI, payment signature checking.
5. **The Storage Pantry (Supabase PostgreSQL Database)**: Jaha saara raw material aur records store hote hain (Questions, Student Attempts, XP, Streaks).
6. **The Specialist Guest Chef (Zi AI - Google Gemini)**: Jab student ko personalised tutor chahiye ya complex concept samajhna ho, to kitchen Gemini API ko request bhejta hai.

---

## 🎯 Next Steps

Ab seedha jump karein **[`01-system-overview.md`](./01-system-overview.md)** par jahan hum Prepzii ke real architecture ka high-level snapshot dekhenge!
