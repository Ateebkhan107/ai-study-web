# 🗺️ Prepzii: Real User Journeys (Trace & Execution)

> **Execution Traces of Critical User Flows**  
> Is document mein 6 core user journeys ka end-to-end trace, ordered function calls, database mutations, aur failure edge-cases document kiye gaye hain.

---

## 🏃 Journey 1: Student Signs Up & Completes Onboarding

### Hinglish Explanation:
Student Google One-Tap ya Email se Sign Up karta hai. Clerk account create karta hai aur background mein Clerk Webhook call hota hai jo Supabase ke `user_profiles` table mein base row daal deta hai. Student ko `/onboarding` page par redirect kiya jata hai jahan wo apna Exam (JEE ya NEET), Target Year, Name, aur Username select karta hai. Next.js Server Action database update karta hai, Clerk metadata mein `onboardingComplete: true` set karta hai, cookie store karta hai, aur dashboard par bhej deta hai.

### Mermaid Sequence Diagram:
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant Clerk as Clerk Cloud
    participant Hook as /api/webhooks/clerk
    participant Onboarding as /onboarding Page
    participant ServerAction as completeOnboarding() Server Action
    participant DB as Supabase PostgreSQL

    Student->>Clerk: Sign Up with Google / Email
    Clerk-->>Hook: POST webhook { type: "user.created", data: { id, name } }
    Hook->>DB: UPSERT user_profiles (clerk_user_id, exam: 'JEE')
    Clerk-->>Student: Set __session cookie & Redirect to /onboarding
    
    Student->>Onboarding: GET /onboarding
    Onboarding-->>Student: Render OnboardingForm.jsx
    
    Student->>ServerAction: Submit form { exam: "NEET", year: 2026, username: "arjun_neet" }
    ServerAction->>ServerAction: validateUsername("arjun_neet")
    ServerAction->>DB: UPDATE user_profiles WHERE clerk_user_id = actionUserId
    ServerAction->>Clerk: updateUserMetadata({ onboardingComplete: true, targetExam: "NEET" })
    ServerAction->>Student: Set cookie "prepzii_track=neet" (maxAge: 1 year)
    ServerAction-->>Student: 303 Redirect to /dashboard?tour=welcome
```

### Call Chain:
1. `src/app/api/webhooks/clerk/route.js` -> `verifyWebhook(req)` -> `supabaseAdmin.from("user_profiles").upsert()`
2. `src/app/onboarding/page.js` -> `getAuthContext()`
3. `completeOnboarding(formData)` Server Action:
   - `validateUsername()` in `src/lib/username.js`
   - `supabaseAdmin.from("user_profiles").update(profilePayload)`
   - `clerkClient().users.updateUserMetadata()`
   - `cookies().set("prepzii_track", normalizedExam)`

---

## 📝 Journey 2: Student Starts & Submits a Mock Test

### Hinglish Explanation:
Student Custom Test Builder mein jakar 30 questions aur 60 minutes choose karta hai. Backend `test_sessions` mein session create karta hai aur questions fetch karta hai. Student ko questions bheje jaate hain par `correct_option` intentionally hide kar diya jata hai taaki cheating na ho sake. Student test solve karta hai aur "Submit Test" click karta hai. Server atomic lock acquire karta hai, evaluation karta hai (+4, -1 marking), `test_attempts` mein record save karta hai, aur background mein XP aur streak recalculate karta hai.

### Mermaid Sequence Diagram:
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant API as /api/test-session
    participant Lock as withBankSubmissionLock
    participant DB as Supabase PostgreSQL
    participant Background as Next.js after() Task

    Student->>API: POST /api/test-session { mode: "custom", questionCount: 30, duration: 60 }
    API->>DB: INSERT into test_sessions
    API->>DB: SELECT questions WHERE subject IN (...)
    API->>Student: 200 OK { sessionId, questions (answers stripped!) }
    
    Note over Student: Student solves questions with running timer in TestRunner.jsx
    
    Student->>API: POST /api/test-session { action: "submit", sessionId, answers: [...] }
    API->>Lock: Acquire memory lock for sessionId
    API->>DB: Fetch test_sessions and official answer keys
    API->>API: Compute score (+4 for correct, -1 for wrong, 0 for blank)
    API->>DB: INSERT into test_attempts (score, total_marks, accuracy)
    API->>DB: INSERT bulk into user_answers
    API->>Background: after() -> runPostSubmitProgressUpdates()
    Note over Background: Updates user_xp, evaluates daily goals, increments streak
    API-->>Student: 200 OK { attemptId: "attempt-uuid" }
    Student->>Student: Redirects to /test/result/attempt-uuid
```

---

## 📊 Journey 3: Student Views Performance Analytics

### Hinglish Explanation:
Student sidebar se Analytics click karta hai. Server pehle verify karta hai ki student ke paas active Prepzii Pro subscription hai ya nahi. Agar Free student hai, to 403 status ke sath upgrade prompt milta hai. Agar Pro student hai, to server parallel mein `test_attempts`, `pyq_attempts`, aur `user_answers` query karta hai. Ek pure in-memory mathematical aggregator (`aggregateAnalytics`) accuracy, time-spent, weak chapters aur readiness score compute karke clean visual state render karta hai.

### Mermaid Sequence Diagram:
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant Page as /analytics Page
    participant API as /api/analytics
    participant Access as getUserAccessContext
    participant Aggregator as aggregateAnalytics()
    participant DB as Supabase PostgreSQL

    Student->>Page: GET /analytics
    Page->>API: GET /api/analytics?track=JEE
    API->>Access: Check subscription status
    alt Subscription Expired / Free Tier
        Access-->>API: allowed = false
        API-->>Student: 403 Forbidden { error: "PRO_REQUIRED", upgradeUrl: "/pro" }
    else Active Pro Subscription
        Access-->>API: allowed = true
        par Query Test Attempts
            API->>DB: SELECT from test_attempts WHERE user_id = userId
        and Query PYQ Attempts
            API->>DB: SELECT from pyq_attempts WHERE user_id = userId
        and Query Individual Answers
            API->>DB: SELECT from user_answers WHERE attempt_id IN (...)
        end
        API->>Aggregator: Process arrays into heatmaps, speed curves, readiness index
        Aggregator-->>API: Return calculated stats JSON
        API-->>Student: 200 OK { stats, readinessIndex, weakTopics }
    end
```

---

## 💬 Journey 4: Student Asks Zi AI a Question

### Hinglish Explanation:
Student floating Zi AI icon click karta hai aur poochta hai: *"Mujhe Rotational Motion ke Moment of Inertia mein problem ho rahi hai."*
Message backend par `/api/zi/chat` par jata hai. Pehle rate-limit check hota hai. Agar user free hai, to database mein prompt reservation counter increment hota hai. Phir server student ki past history, weak chapters, aur active screen context ko combine karke ek comprehensive system prompt tayar karta hai. Google Gemini API ko request jaati hai aur response server-sent events (SSE) ke through browser mein live stream hota hai. Agar Gemini explanation ke doran koi personalized memory generate karta hai (e.g. "Student struggles with parallel axis theorem"), to background mein wo `zi_memories` table mein save ho jati hai!

### Mermaid Sequence Diagram:
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant API as /api/zi/chat
    participant Rate as checkZiRateLimit()
    participant Quota as promptUsageOperation()
    participant Context as Context Collectors
    participant Gemini as Google GenAI SDK (Gemini 3.6 Flash)
    participant DB as Supabase PostgreSQL

    Student->>API: POST /api/zi/chat { messages, screenContext }
    API->>Rate: Check sliding-window limit (10 req/min for free)
    alt Free Tier User
        API->>Quota: Reserve trial prompt (limit = 3)
        Quota->>DB: RPC zi_trial_prompt_usage (reserve)
    end
    
    par Collect Multi-layered Context
        API->>Context: getZiStudentContext(userId)
        API->>Context: getZiLearningMemories(userId)
        API->>Context: buildZiEntityContext(screenContext)
    end
    
    API->>API: buildZiSystemPrompt(context)
    API->>Gemini: ai.models.generateContentStream({ model: "gemini-3.6-flash", contents })
    
    loop Stream chunks via SSE
        Gemini-->>API: Chunk: "Moment of Inertia $I = \\sum m_i r_i^2$..."
        API-->>Student: data: {"type": "text_delta", "delta": "..."}
    end
    
    alt Response contains Action or Memory
        API->>DB: INSERT into zi_memories { memory_type: "concept_confusion", text: "..." }
    end
    API-->>Student: data: {"type": "done"}
```

---

## 🎓 Journey 5: Student Uses JEE College Predictor

### Hinglish Explanation:
Analytics page ke andar `JEEMainPredictor.jsx` component student ke mock test scores ya custom entered marks ko read karta hai. Piece-wise linear interpolation se NTA Percentile aur Common Rank List (CRL) rank estimate ki jaati hai. Phir student Category (OBC-NCL, SC, ST, EWS), Home State, aur Branch select karta hai. Browser Supabase se `josaa_cutoffs` table query karta hai (ya bundled 2026 JSON fallback use karta hai). Results ko Safe, Target, aur Dream college badges mein sort karke display kiya jata hai.

### Mermaid Sequence Diagram:
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant Component as JEEMainPredictor.jsx
    participant Data as marks-percentile-2026.json
    participant DB as Supabase (josaa_cutoffs)

    Student->>Component: Enters Marks: "185" & Category: "OBC-NCL" & State: "UP"
    Component->>Data: Read score distribution brackets
    Component->>Component: interpolatePercentile(185) -> "98.42"
    Component->>Component: calculateRank(98.42, 1400000) -> CRL Rank: ~22,120
    
    Component->>DB: supabase.from('josaa_cutoffs').select().eq('seat_type', 'OBC-NCL')
    alt Network OK
        DB-->>Component: 50 matching institute cutoffs returned
    else Network / Supabase Offline
        Component->>Component: Fallback to bundled cutoffs-2026.json
    end
    
    Component->>Component: Partition into Safe, Target, Dream
    Component-->>Student: Render interactive college cards (MNNIT Allahabad, NIT Trichy...)
```

---

## ⚔️ Journey 6: Student Plays in Battle Zone

### Hinglish Explanation:
Student Battle Arena mein "Find Match" click karta hai. Client POST karta hai `/api/battle/queue`. Backend dekhta hai ki kya queue mein koi aur student usi track (JEE/NEET) ka wait kar raha hai. Agar koi nahi hai, to student ko queue mein rakh kar client ko `status: queued` milta hai aur client har 2 second par poll karta hai. Jaise hi doosra student aata hai, match record create hota hai `battle_matches` mein aur dono players ko arena room mein bhej diya jata hai. Questions live solve hote hain aur match khatam hone par ELO ratings update ho jati hain!

### Mermaid Sequence Diagram:
```mermaid
sequenceDiagram
    autonumber
    actor P1 as Player 1 Browser
    actor P2 as Player 2 Browser
    participant API as /api/battle/queue
    participant MatchAPI as /api/battle/matches/[id]
    participant DB as Supabase PostgreSQL

    P1->>API: POST /api/battle/queue { exam: "JEE" }
    API->>DB: Query battle_queue for waiting opponent
    Note over API: No opponent found
    API->>DB: INSERT into battle_queue (user_id: P1)
    API-->>P1: { status: "queued" }
    
    P2->>API: POST /api/battle/queue { exam: "JEE" }
    API->>DB: Query battle_queue for waiting opponent -> Found P1!
    API->>DB: DELETE P1 from battle_queue
    API->>DB: INSERT into battle_matches (status: 'ACTIVE')
    API->>DB: INSERT into battle_players (P1, P2)
    API-->>P2: { status: "matched", battleId: "battle-123" }
    
    P1->>API: GET /api/battle/queue (Polling)
    API->>DB: Check battle_players for active match
    API-->>P1: { status: "matched", battleId: "battle-123" }
    
    par Play 1v1 Quiz
        P1->>MatchAPI: POST /answers { questionId, selected: "B" }
        P2->>MatchAPI: POST /answers { questionId, selected: "A" }
    end
    
    MatchAPI->>DB: Conclude match, calculate ELO rating changes (+25, -15)
    MatchAPI-->>P1: Game Over: You Won! (+25 ELO)
    MatchAPI-->>P2: Game Over: You Lost! (-15 ELO)
```
