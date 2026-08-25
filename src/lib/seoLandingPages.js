const SITE_URL = "https://www.prepzii.com";
const OG_IMAGE = "/images/branding/prepzii-logo-dark.png";

export const SEO_PAGES = {
  jee: {
    path: "/jee",
    title: "JEE Preparation, PYQs & Mock Tests | PrepZii",
    description:
      "Prepare for JEE Main with previous year questions, full-length mock tests, formula revision, chapter-wise practice, and performance analytics on PrepZii.",
    h1: "JEE Preparation with PYQs, Mock Tests and Analytics",
    eyebrow: "JEE Main preparation",
    intro:
      "Build a focused JEE Main preparation routine with previous year questions, chapter-wise practice, full-length mock tests, formula revision and performance analytics in one PrepZii workspace.",
    exam: "JEE",
    parentPath: null,
    breadcrumb: [{ name: "Home", path: "/" }, { name: "JEE", path: "/jee" }],
    primaryCta: { label: "Start JEE Practice", href: "/go/jee/dashboard" },
    secondaryCta: { label: "View JEE PYQs", href: "/go/jee/pyq" },
    sections: [
      {
        title: "What JEE students can organize on PrepZii",
        body:
          "PrepZii keeps practice, revision and review close together so your preparation does not split across disconnected notebooks, PDFs and test portals.",
        items: [
          "Practice JEE Main previous year questions by subject, chapter and year.",
          "Take full-length mock tests and review mistakes after each attempt.",
          "Revise formulas before practice sessions and save important questions.",
          "Track accuracy, skipped questions and weak chapters after practice.",
        ],
      },
      {
        title: "Use PYQs and mocks together",
        body:
          "PYQs help you understand repeated patterns and chapter weight, while mock tests help you rehearse timing, stamina and exam-day decision making.",
        items: [
          "Use chapter-wise PYQs when fixing a weak concept.",
          "Use year-wise PYQs when checking how questions appeared in real papers.",
          "Use full-length mocks when you need a timed exam-style attempt.",
          "Use analytics after each attempt to decide what to revise next.",
        ],
      },
    ],
    linkCards: [
      {
        title: "JEE Main Previous Year Questions",
        href: "/go/jee/pyq",
        description:
          "Practice JEE Main PYQs by subject, chapter and year with focused review.",
      },
      {
        title: "JEE Main Mock Tests",
        href: "/go/jee/mock-tests",
        description:
          "Take exam-style mock tests and review accuracy, speed and weak areas.",
      },
      {
        title: "PrepZii Pricing",
        href: "/pricing",
        description:
          "Compare public plans for mock tests, PYQ practice and analytics access.",
      },
    ],
    faqs: [
      {
        question: "How should I use PYQs during JEE preparation?",
        answer:
          "Use PYQs after revising a chapter to test whether you can recognize real exam patterns. Then review wrong and skipped questions before moving to the next chapter.",
      },
      {
        question: "When should I start full-length JEE mock tests?",
        answer:
          "Start mocks once you have enough syllabus coverage to make the attempt useful, then increase frequency as revision becomes more stable.",
      },
      {
        question: "Does PrepZii replace textbooks or coaching material?",
        answer:
          "No. PrepZii is designed as a practice, mock-test and analytics workspace that supports your existing learning material.",
      },
    ],
  },
  neet: {
    path: "/neet",
    title: "NEET Preparation, PYQs & Mock Tests | PrepZii",
    description:
      "Prepare for NEET with previous year questions, full-length mock tests, formula revision, chapter-wise practice, and performance analytics on PrepZii.",
    h1: "NEET Preparation with PYQs, Mock Tests and Analytics",
    eyebrow: "NEET preparation",
    intro:
      "Prepare for NEET with previous year questions for Physics, Chemistry and Biology, full-length mock tests, formula revision, chapter-wise practice and performance analytics on PrepZii.",
    exam: "NEET",
    parentPath: null,
    breadcrumb: [{ name: "Home", path: "/" }, { name: "NEET", path: "/neet" }],
    primaryCta: { label: "Start NEET Practice", href: "/go/neet/dashboard" },
    secondaryCta: { label: "View NEET PYQs", href: "/go/neet/pyq" },
    sections: [
      {
        title: "A focused NEET practice workspace",
        body:
          "PrepZii helps NEET students move from revision to practice to review without losing track of weak chapters or repeated mistakes.",
        items: [
          "Practice previous year questions for Physics, Chemistry and Biology.",
          "Use chapter-wise practice for targeted revision.",
          "Take full-length mock tests in an exam-style workspace.",
          "Review accuracy and weak areas after each attempt.",
        ],
      },
      {
        title: "Why combine PYQs, mocks and analytics",
        body:
          "NEET preparation rewards consistency. PYQs reveal how concepts are asked, mocks build stamina, and analytics show where your next revision block should go.",
        items: [
          "Use PYQs to identify recurring question styles.",
          "Use mocks to practice timing and answer selection.",
          "Use review data to separate careless errors from concept gaps.",
          "Use formula and saved-question revision before timed practice.",
        ],
      },
    ],
    linkCards: [
      {
        title: "NEET Previous Year Questions",
        href: "/go/neet/pyq",
        description:
          "Practice NEET PYQs by year and chapter across Physics, Chemistry and Biology.",
      },
      {
        title: "NEET Mock Tests",
        href: "/go/neet/mock-tests",
        description:
          "Take full-length NEET mock tests and review accuracy, speed and weak chapters.",
      },
      {
        title: "PrepZii Pricing",
        href: "/pricing",
        description:
          "Compare public plans for NEET mock tests, PYQ practice and analytics.",
      },
    ],
    faqs: [
      {
        question: "Why are NEET previous year questions important?",
        answer:
          "PYQs show how NCERT-linked concepts and application-based questions have appeared in real exams. They are especially useful after chapter revision.",
      },
      {
        question: "Can I practice only Biology chapters on PrepZii?",
        answer:
          "PrepZii supports focused practice by subject and chapter, so Biology-heavy revision can be separated from full mock-test practice.",
      },
      {
        question: "How do mock-test analytics help NEET revision?",
        answer:
          "Analytics help you see whether marks are being lost due to accuracy, skipped questions, time pressure or weak chapters.",
      },
    ],
  },
  jeePyq: {
    path: "/jee/pyq",
    title: "JEE Main Previous Year Questions (PYQs) | PrepZii",
    description:
      "Practice JEE Main previous year questions by subject, chapter, and year with focused practice tools and performance tracking on PrepZii.",
    h1: "JEE Main Previous Year Questions (PYQs)",
    eyebrow: "JEE PYQ practice",
    intro:
      "Practice JEE Main PYQs by Physics, Chemistry and Mathematics, filter by chapter or year, and use performance tracking to understand which topics need more revision.",
    exam: "JEE",
    parentPath: "/jee",
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "JEE", path: "/jee" },
      { name: "Previous Year Questions", path: "/jee/pyq" },
    ],
    primaryCta: { label: "Practice JEE PYQs", href: "/go/jee/pyq" },
    secondaryCta: { label: "Explore JEE Preparation", href: "/jee" },
    pyq: {
      subjects: ["Physics", "Chemistry", "Mathematics"],
      samplePaths: [
        "Revise a chapter, then solve related PYQs without switching context.",
        "Attempt a year-wise set to understand how the paper balanced topics.",
        "Bookmark difficult questions for mistake revision before the next mock.",
      ],
    },
    sections: [
      {
        title: "What JEE PYQs are available",
        body:
          "PrepZii is structured around JEE Main previous year question practice, with subject, chapter and year filters that help you move from broad revision to targeted practice.",
        items: [
          "Subject-wise practice for Physics, Chemistry and Mathematics.",
          "Chapter-wise sessions for focused revision after concept study.",
          "Year-wise practice to understand how questions appeared in real papers.",
          "Review tools to separate correct, wrong and skipped attempts.",
        ],
      },
      {
        title: "Why PYQs matter for JEE Main",
        body:
          "Previous year questions help you learn the exam's language. They show the level of calculation, concept mixing and common traps better than generic practice alone.",
        items: [
          "Recognize repeated concepts and familiar framing.",
          "Compare chapter confidence against actual exam questions.",
          "Find topics where you understand theory but miss application.",
          "Build a revision list from mistakes rather than guesswork.",
        ],
      },
      {
        title: "How PrepZii PYQ practice works",
        body:
          "Choose your subject, chapter or year, answer questions in a focused interface, then review performance signals that help decide the next study block.",
        items: [
          "Start with a filtered practice set.",
          "Answer, skip or revisit questions during the session.",
          "Review accuracy and mistakes after submission.",
          "Use saved questions and analytics to guide revision.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I practice JEE PYQs chapter-wise?",
        answer:
          "Yes. The PYQ workflow is designed for chapter-wise practice so you can focus on one weak topic before returning to full-paper practice.",
      },
      {
        question: "Should PYQs be solved before or after theory revision?",
        answer:
          "Most students get better feedback by revising the core concepts first, then solving PYQs to test application and identify gaps.",
      },
      {
        question: "Are PYQs enough for JEE Main preparation?",
        answer:
          "PYQs are essential, but they work best alongside concept learning, formula revision, timed mock tests and mistake review.",
      },
    ],
  },
  neetPyq: {
    path: "/neet/pyq",
    title: "NEET Previous Year Questions (PYQs) | PrepZii",
    description:
      "Practice NEET previous year questions for Physics, Chemistry, and Biology by year and chapter with PrepZii.",
    h1: "NEET Previous Year Questions (PYQs)",
    eyebrow: "NEET PYQ practice",
    intro:
      "Practice NEET previous year questions across Physics, Chemistry and Biology with year-wise and chapter-wise workflows that make revision more focused.",
    exam: "NEET",
    parentPath: "/neet",
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "NEET", path: "/neet" },
      { name: "Previous Year Questions", path: "/neet/pyq" },
    ],
    primaryCta: { label: "Practice NEET PYQs", href: "/go/neet/pyq" },
    secondaryCta: { label: "Explore NEET Preparation", href: "/neet" },
    pyq: {
      subjects: ["Physics", "Chemistry", "Biology"],
      samplePaths: [
        "Solve Biology PYQs after NCERT revision to check recall and application.",
        "Use Physics and Chemistry chapter practice to expose calculation gaps.",
        "Review wrong and skipped questions before taking a full-length mock.",
      ],
    },
    sections: [
      {
        title: "What NEET PYQs are available",
        body:
          "PrepZii supports NEET previous year question practice by subject, year and chapter, so you can move between targeted Biology revision and full exam-style preparation.",
        items: [
          "Physics, Chemistry and Biology PYQ practice.",
          "Chapter-wise practice for focused revision blocks.",
          "Year-wise practice for real-paper familiarity.",
          "Review flow for correct, wrong and skipped questions.",
        ],
      },
      {
        title: "Why PYQs matter for NEET",
        body:
          "NEET PYQs help you understand how familiar syllabus concepts are framed under exam pressure. They make revision more practical than rereading alone.",
        items: [
          "See how high-yield concepts are asked in real papers.",
          "Improve speed by recognizing familiar question patterns.",
          "Identify weak chapters before full-length mock tests.",
          "Turn mistakes into a clear revision queue.",
        ],
      },
      {
        title: "How PrepZii NEET practice works",
        body:
          "Select the subject, chapter or year you want to practice, attempt questions in a clean interface and use post-practice review to guide your next revision session.",
        items: [
          "Choose focused PYQ practice or broader year-wise sets.",
          "Track answers, skipped questions and review outcomes.",
          "Save important questions for later revision.",
          "Use analytics to decide whether to revise or test next.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can NEET PYQs be practiced by subject?",
        answer:
          "Yes. PrepZii organizes NEET practice around Physics, Chemistry and Biology so you can focus revision by subject.",
      },
      {
        question: "How often should I solve NEET PYQs?",
        answer:
          "PYQs are most useful when used regularly after chapter revision and again before mocks to refresh common patterns.",
      },
      {
        question: "Do PYQs help with Biology revision?",
        answer:
          "Yes. Biology PYQs help test NCERT recall, terminology and application, especially when reviewed chapter by chapter.",
      },
    ],
  },
  jeeMockTests: {
    path: "/jee/mock-tests",
    title: "JEE Main Mock Tests & Full-Length Practice | PrepZii",
    description:
      "Take JEE Main mock tests in a realistic exam-style environment and review accuracy, speed, weak chapters, and performance on PrepZii.",
    h1: "JEE Main Mock Tests and Full-Length Practice",
    eyebrow: "JEE mock tests",
    intro:
      "Take JEE Main mock tests in an exam-style workspace, then review accuracy, speed, skipped questions and weak chapters before planning your next revision session.",
    exam: "JEE",
    parentPath: "/jee",
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "JEE", path: "/jee" },
      { name: "Mock Tests", path: "/jee/mock-tests" },
    ],
    primaryCta: { label: "Start JEE Mock Practice", href: "/go/jee/mock-tests" },
    secondaryCta: { label: "Explore JEE Preparation", href: "/jee" },
    sections: [
      {
        title: "Realistic exam-style practice",
        body:
          "PrepZii mock-test practice is built to make full-length attempts feel organized and reviewable, without mixing private dashboard data into public pages.",
        items: [
          "Timed full-length practice based on the selected JEE paper setup.",
          "Question navigation and review flow for exam-style attempts.",
          "Post-test breakdown of correct, wrong and skipped responses.",
          "Review links that help convert mistakes into revision tasks.",
        ],
      },
      {
        title: "What to review after a JEE mock",
        body:
          "A mock test is useful only if the review is specific. PrepZii helps students look beyond marks and study the reason behind lost questions.",
        items: [
          "Accuracy by attempt instead of only total score.",
          "Questions skipped under time pressure.",
          "Chapters where repeated mistakes appear.",
          "Speed and confidence signals for the next practice plan.",
        ],
      },
      {
        title: "How to combine mocks with PYQs",
        body:
          "Use mocks for exam readiness and PYQs for targeted repair. After a mock, return to chapter-wise PYQs for topics where accuracy dropped.",
        items: [
          "Take a full-length mock.",
          "Review wrong, skipped and guessed questions.",
          "Revise formulas and concepts for weak chapters.",
          "Practice related PYQs before the next mock.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are JEE mock tests useful before syllabus completion?",
        answer:
          "Partial mocks can be useful, but full-length mocks become more meaningful once enough syllabus has been revised to make timing and review realistic.",
      },
      {
        question: "What should I do after a low mock-test score?",
        answer:
          "Separate errors into concept gaps, calculation mistakes, time pressure and skipped questions. Then revise one or two weak areas before the next attempt.",
      },
      {
        question: "Do mock tests replace PYQ practice?",
        answer:
          "No. Mock tests build timing and stamina, while PYQs help you understand real question patterns. They work best together.",
      },
    ],
  },
  neetMockTests: {
    path: "/neet/mock-tests",
    title: "NEET Mock Tests & Full-Length Practice | PrepZii",
    description:
      "Take full-length NEET mock tests with exam-style practice, detailed review, accuracy tracking, and performance analytics on PrepZii.",
    h1: "NEET Mock Tests and Full-Length Practice",
    eyebrow: "NEET mock tests",
    intro:
      "Use PrepZii for full-length NEET mock tests, exam-style practice and detailed review of accuracy, skipped questions, weak chapters and performance trends.",
    exam: "NEET",
    parentPath: "/neet",
    breadcrumb: [
      { name: "Home", path: "/" },
      { name: "NEET", path: "/neet" },
      { name: "Mock Tests", path: "/neet/mock-tests" },
    ],
    primaryCta: { label: "Start NEET Mock Practice", href: "/go/neet/mock-tests" },
    secondaryCta: { label: "Explore NEET Preparation", href: "/neet" },
    sections: [
      {
        title: "Exam-style NEET mock practice",
        body:
          "PrepZii mock tests help students rehearse full-length attempts and review performance without exposing any private user data on public pages.",
        items: [
          "Full-length NEET practice in a focused interface.",
          "Question navigation built for sustained exam-style attempts.",
          "Post-test review for correct, wrong and skipped responses.",
          "Performance analytics that point toward weak chapters.",
        ],
      },
      {
        title: "What to analyze after a NEET mock",
        body:
          "NEET review should look at more than the final score. Accuracy, skipped questions and chapter-level mistakes often explain what revision should happen next.",
        items: [
          "Whether Biology marks were lost to recall or question interpretation.",
          "Whether Physics and Chemistry errors came from concepts or calculations.",
          "Which chapters repeatedly reduce accuracy.",
          "Which questions were skipped because of time or uncertainty.",
        ],
      },
      {
        title: "Mock tests plus PYQ repair",
        body:
          "After each mock, use PYQs to repair specific weak chapters. That makes the next full-length attempt more focused than simply taking another test.",
        items: [
          "Attempt the mock in one sitting when possible.",
          "Review wrong and skipped questions carefully.",
          "Revise weak chapters and formulas.",
          "Solve related NEET PYQs before the next mock.",
        ],
      },
    ],
    faqs: [
      {
        question: "How should I review a NEET mock test?",
        answer:
          "Start with wrong and skipped questions, then identify whether each issue came from recall, concept gaps, calculation, time pressure or misreading.",
      },
      {
        question: "Should NEET mock tests be timed?",
        answer:
          "Timed practice is important for stamina and decision making, but untimed review is also useful when repairing weak chapters after the test.",
      },
      {
        question: "How do mock tests and PYQs work together for NEET?",
        answer:
          "Mocks show readiness across the full paper, while PYQs help repair specific subjects and chapters after review.",
      },
    ],
  },
};

export function buildLandingMetadata(page) {
  return {
    title: {
      absolute: page.title,
    },
    description: page.description,
    alternates: {
      canonical: page.path,
    },
    openGraph: {
      type: "website",
      siteName: "PrepZii",
      title: page.title,
      description: page.description,
      url: page.path,
      images: [
        {
          url: OG_IMAGE,
          width: 1536,
          height: 1024,
          alt: `${page.exam} preparation on PrepZii`,
        },
      ],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [OG_IMAGE],
    },
  };
}

export function buildBreadcrumbJsonLd(page) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
