# 📖 Prepzii: Technical Glossary (Hinglish Dictionary)

> **Learn System Design Like a Pro**  
> Is dictionary mein 40+ complex software engineering terms ko crystal-clear Hinglish aur real Prepzii code examples ke sath explain kiya gaya hai.

---

## 🎨 Frontend & React Terms

### 1. SSR (Server-Side Rendering)
- **Hinglish**: Webpage ka HTML pehle hi server par prepare hokar browser ko bhejna.
- **Prepzii Example**: Jab student landing page `prepzii.com` open karta hai, to server par hi pura HTML ban jata hai jisse Google SEO aur page speed instant hoti hai.

### 2. CSR (Client-Side Rendering)
- **Hinglish**: Khali HTML aana aur browser mein JavaScript run hokar screen par elements banana.
- **Prepzii Example**: Battle Arena (`BattleArenaClient.jsx`) mein questions aur timer browser ke andar dynamically render hote hain.

### 3. RSC (React Server Components)
- **Hinglish**: Aise React components jo sirf aur sirf server par execute hote hain aur jinka JavaScript code kabhi browser mein download hi nahi hota.
- **Prepzii Example**: `src/app/(dashboard)/layout.js` ek Server Component hai jo database se user ka plan fetch karta hai bina database credentials browser ko bheje.

### 4. Hydration
- **Hinglish**: Server se aaye static "sukhe" HTML par React ke dynamic event listeners (clicks, inputs) ko "pani dekar zinda karna".
- **Prepzii Example**: Page load hote hi navbar dikhta hai, fir 100ms baad hydration complete hone par "Start Test" button clickable ban jata hai.

### 5. State vs Props
- **State**: Component ka apna personal data jo time ke sath badalta hai (e.g. `selectedOption` in a quiz).
- **Props**: Parent component dwara child component ko bheja gaya read-only data (e.g. `<QuestionCard question={q} />`).

---

## ⚙️ Backend & API Terms

### 6. API (Application Programming Interface)
- **Hinglish**: Do softwares ke aapas mein baat karne ka niyam aur zariya.
- **Prepzii Example**: `/api/daily-goals` endpoint frontend ko student ke daily targets return karta hai.

### 7. Middleware / Edge Gateway
- **Hinglish**: Gatekeeper jo har request ko check karta hai andar aane se pehle.
- **Prepzii Example**: `src/proxy.js` check karta hai ki user logged in hai ya nahi. Agar nahi hai to andar ghusne hi nahi deta!

### 8. Serverless Functions
- **Hinglish**: Aise backend functions jinke liye 24/7 server khareedna nahi padta. Jab request aati hai to function jagta hai, kaam karta hai, aur so jata hai.
- **Prepzii Example**: Vercel par chalne wale `/api/*` endpoints.

### 9. Cold Start
- **Hinglish**: Jab kaafi der tak koi request na aayi ho, to serverless container ko dubara start hone mein jo 1–2 second ka extra time lagta hai.

### 10. Webhook
- **Hinglish**: "Reverse API" — jab koi external service khud hamare server ko notify karti hai ki koi event hua hai.
- **Prepzii Example**: Jab student Clerk par sign up karta hai, to Clerk hamare `/api/webhooks/clerk` endpoint ko automatic alert bhejta hai taaki hum Supabase mein profile row bana sakein.

### 11. HMAC (Hash-based Message Authentication Code)
- **Hinglish**: Secret password se lock kiya gaya digital stamp jo prove karta hai ki message raste mein badla nahi gaya hai.
- **Prepzii Example**: Razorpay payment hone par signature ko `crypto.timingSafeEqual` se verify kiya jata hai taaki koi fake payment confirm na kar sake.

---

## 🗄️ Database & PostgreSQL Terms

### 12. RLS (Row Level Security)
- **Hinglish**: Database level par lagaya gaya security rule jo ensure karta hai ki student sirf apni hi rows dekh sake, doosre ki nahi.
- **Prepzii Example**: Supabase mein policy hai ki Student A kabhi bhi Student B ke test answers query nahi kar sakta.

### 13. Primary Key (PK)
- **Hinglish**: Har row ka unique identifier. E.g. `user_profiles.id`.

### 14. Foreign Key (FK)
- **Hinglish**: Ek table ka doosri table ke sath relation jodna. E.g. `test_attempts.user_id` pointing to `user_profiles.clerk_user_id`.

### 15. Stored Procedure / RPC (Remote Procedure Call)
- **Hinglish**: Database ke andar likha gaya SQL function jo heavy business logic ko database ke paas hi execute kar deta hai.
- **Prepzii Example**: `zi_commit_bank_submission` ek atomic transaction mein attempt evaluate karta hai aur answers save karta hai.

### 16. Connection Pooler (PgBouncer)
- **Hinglish**: Ek smart manager jo hazaron serverless functions ko thode se database connections mein efficiently queue karta hai taaki database crash na ho.

---

## 🤖 AI & LLM Terms

### 17. Prompt & System Prompt
- **User Prompt**: Jo student type karta hai (e.g. *"What is Lenz's law?"*).
- **System Prompt**: Hidden instructions jo hum model ko dete hain uske behave karne ke liye (e.g. *"Aap Prepzii ke expert JEE teacher ho, Hinglish mein jawab do"*).

### 18. Context Window
- **Hinglish**: AI model ki temporary memory limit — ek bar mein model kitne words padh aur samajh sakta hai.
- **Prepzii Example**: Gemini 3.6 ka large context window hume student ki past mistakes aur current question ek sath model ko bhejne ki suvidha deta hai.

### 19. Streaming / SSE (Server-Sent Events)
- **Hinglish**: Pura paragraph generate hone ka wait karne ke bajaye word-by-word real-time mein screen par dikhana.

### 20. Hallucination
- **Hinglish**: Jab AI model confidence ke sath galat formula ya jhooth bol deta hai.
- **Prepzii Solution**: Hum system prompt mein strict instructions dete hain aur official questions database se retrieve karke supply karte hain.

---

## 🏛️ System Architecture Terms

### 21. Monolith
- **Hinglish**: Saara frontend, backend, aur business logic ek hi project repository ke andar hona.

### 22. BaaS (Backend as a Service)
- **Hinglish**: Backend ke heavy components (Auth, DB) ko khud maintain karne ke bajaye third-party platforms (Clerk, Supabase) se rent par lena.

### 23. CDN (Content Delivery Network)
- **Hinglish**: Worldwide distributed servers jo static images, CSS, aur JS ko student ke paas wale shahar se deliver karte hain.

### 24. ELO Rating
- **Hinglish**: Mathematical skill rating system (originally chess ke liye banaya gaya) jo Prepzii Battle Zone mein do players ki relative ranking track karta hai.
