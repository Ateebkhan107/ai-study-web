import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/pro/page.js', 'utf8');

const aiModePlan = `  {
    id: "ai_mode",
    label: "AI Mode",
    price: 2000,
    originalPrice: 2000,
    discount: 0,
    per: "month",
    total: 2000,
    badge: "Premium AI",
    savings: null,
  },
];`;

code = code.replace(
  '    savings: "Save ₹1,400",\n  },\n];',
  '    savings: "Save ₹1,400",\n  },\n' + aiModePlan
);

code = code.replace(
  'const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };',
  'const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };'
);

code = code.replace(
  'disabled={loading || currentPlan === "yearly"}',
  'disabled={loading || (currentPlan && PLAN_RANK[plan.id] <= PLAN_RANK[currentPlan])}'
);

code = code.replace(
  'currentPlan === "yearly" ? "Yearly plan active"',
  '(currentPlan && PLAN_RANK[plan.id] <= PLAN_RANK[currentPlan]) ? "Plan already active"'
);

// We need to adjust grid-cols-3 to grid-cols-4 for the plan selector if there are 4 plans.
code = code.replace(
  'grid w-full max-w-md grid-cols-3',
  'grid w-full max-w-2xl grid-cols-2 md:grid-cols-4'
);

fs.writeFileSync('./src/app/(dashboard)/pro/page.js', code);
