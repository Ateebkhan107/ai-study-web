# 🚀 Prepzii: Deployment & Cloud Infrastructure

> **How Prepzii Runs in Production**  
> Is document mein Vercel serverless deployment, edge caching, CI/CD pipeline, SSL/DNS routing, aur external cloud boundaries ka complete infrastructure audit hai.

---

## 🗺️ Deployment Topology Diagram

```mermaid
graph TB
    subgraph Users["End Users (Students Across India)"]
        Mobile["Mobile Web Browsers"]
        Desktop["Desktop Laptops & PCs"]
    end

    subgraph InternetLayer["Public Internet & Edge Network"]
        DNS["Authoritative DNS<br/>(Cloudflare / Vercel Nameservers)"]
        Edge["Vercel Global Edge Network<br/>(TLS Termination, Port 443, Anycast CDN)"]
        StaticAssets["Static Asset Cache<br/>(_next/static, public/images, fonts)"]
    end

    subgraph VercelCompute["Vercel Serverless Platform (ap-south-1 / bom1)"]
        ProxyFunction["Edge Middleware<br/>(src/proxy.js)"]
        RSCFunctions["Serverless Node.js Lambdas<br/>(React Server Components & SSR)"]
        ApiFunctions["API Route Handlers<br/>(src/app/api/* - Max 60s/300s Duration)"]
    end

    subgraph CloudServices["Managed Backend Cloud Providers"]
        SupabasePostgres[("Supabase Managed PostgreSQL<br/>Host: vyqcciooigmnfmzrwtpp.supabase.co")]
        SupabaseStorage[("Supabase S3-Compatible Storage<br/>(Question Images & Formula PDFs)")]
        ClerkCloud["Clerk Identity Cloud<br/>(JWT Signing & Session Store)"]
        GeminiCloud["Google Cloud Vertex / GenAI<br/>(generativelanguage.googleapis.com)"]
        RazorpayCloud["Razorpay Payment Gateway<br/>(api.razorpay.com)"]
    end

    Users -->|HTTPS / Port 443| DNS
    DNS --> Edge
    Edge -->|Static Files (.js, .css, .png)| StaticAssets
    Edge -->|Dynamic Requests| ProxyFunction
    ProxyFunction --> RSCFunctions
    ProxyFunction --> ApiFunctions

    RSCFunctions -->|PostgREST / Pooling Port 6543| SupabasePostgres
    ApiFunctions -->|PostgREST / Pooling| SupabasePostgres
    ApiFunctions -->|Signed URLs| SupabaseStorage
    ProxyFunction -.->|Verify JWT Token| ClerkCloud
    ApiFunctions -->|HTTPS REST| GeminiCloud
    ApiFunctions -->|HMAC & REST| RazorpayCloud
```

---

## 🔄 The CI/CD Build Pipeline (Push to Live)

Jab developer local machine se `git push origin main` karta hai:

```
1. Developer pushes commit to GitHub repository (`ai-study-web`)
   │
   ▼
2. Vercel Webhook Triggers Automated Build Environment
   │  - Environment Provisioning: Node.js 22 LTS container (as defined in package.json)
   │  - Dependency Installation: `npm ci` with caching of node_modules
   │  - Build Step: `next build`
   │      * React Compiler parses and optimizes component trees (`reactCompiler: true`)
   │      * Tailwind CSS 4 compiles modern utility classes
   │      * TypeScript & Zod schemas undergo type/validation checks
   │      * Static routes (e.g. landing, terms, about) pre-render to HTML
   │      * Dynamic API routes bundle into standalone Serverless Functions
   │
   ▼
3. Zero-Downtime Atomic Deployment
   │  - Vercel assigns a unique deployment URL (e.g. `ai-study-web-abc123.vercel.app`)
   │  - Health-checks verify that the bundle starts without runtime errors
   │  - Vercel updates Anycast routing to point `prepzii.com` to the new deployment instant-alias!
```

---

## 💻 What Executes in the Browser vs What Executes on the Server?

| Component / Action | Execution Environment | Why Here? |
|---|---|---|
| **Form Inputs, Button Clicks** | Browser (Client Component) | Instant UI feedback without server round-trip latency. |
| **KaTeX Math Rendering** | Browser (Client Component) | Render LaTeX equations locally using the client's GPU/CPU. |
| **Test Timer Countdown** | Browser (Client Component) | Smooth second-by-second countdown without continuous network calls. |
| **Route Protection & Gatekeeping** | Edge Server (`src/proxy.js`) | Block unauthenticated requests before they consume compute or DB resources. |
| **Test Evaluation & Scoring** | Serverless Node.js (`/api/test-session`) | Security: Prevents students from tampering with scores or XP. |
| **Gemini AI Prompt Construction** | Serverless Node.js (`/api/zi/chat`) | Security: Keeps Google GenAI API keys strictly hidden from browser users. |
| **Razorpay Signature Verification**| Serverless Node.js (`/api/payment/verify`)| Security: Uses `RAZORPAY_KEY_SECRET` to verify authentic transactions. |
| **Database Queries & Mutations** | Serverless Node.js (`supabaseAdmin`) | Uses `SUPABASE_SERVICE_ROLE_KEY` to enforce business invariants. |

---

## 🔐 Environment Variables & Secret Management

Environment variables are partitioned into two strict categories:

1. **Public Client Variables (`NEXT_PUBLIC_*`)**:
   - Bundled directly into the browser JavaScript.
   - Examples: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Contain zero destructive privileges; safe for public eyes.

2. **Server-Only Secret Variables**:
   - Injected exclusively into Vercel Serverless Function runtime memory.
   - Guarded by Next.js's `import "server-only";` directive.
   - Examples: `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `RAZORPAY_KEY_SECRET`.
   - Never visible in client network traffic, browser console, or GitHub source code.

---

## 🌐 Network Lifecycle: DNS, HTTPS & TLS Termination

1. **DNS Resolution**:
   - Student enters `prepzii.com`. DNS resolves to Vercel's global Anycast IP addresses.
2. **HTTPS & Port 443**:
   - Standard web traffic uses Port 80 (HTTP); however, Vercel Edge automatically redirects all traffic to **Port 443 (HTTPS)** with modern TLS 1.3 encryption.
   - Vercel manages automated Let's Encrypt SSL certificates that renew every 90 days.
3. **HTTP Security Headers (`next.config.mjs`)**:
   - `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing exploits).
   - `X-Frame-Options: DENY` (Prevents clickjacking inside iframes).
   - `Referrer-Policy: strict-origin-when-cross-origin` (Protects user privacy).
   - `Permissions-Policy: camera=(), microphone=(self), geolocation=()` (Allows voice input for Zi AI while blocking camera access).
