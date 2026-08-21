// lib/analyticsData.js
// All static data for the analytics page.
// Replace each constant with an API call / DB query when ready.

export const OVERVIEW_STATS = [
  { label: "Accuracy",       value: "73.4%", sub: "↑ 2.1% vs last week",  trend: "up"      },
  { label: "Rank",           value: "#214",  sub: "Top 8% nationally",     trend: "neutral" },
  { label: "Study Time",     value: "124h",  sub: "This month",            trend: "neutral" },
  { label: "Exam Readiness", value: "78%",   sub: "67 days to exam",       trend: "warn"    },
];

export const PERFORMANCE_WEEKS = ["W1","W2","W3","W4","W5","W6","W7","W8"];

export const PERFORMANCE_SERIES = [
  { subject: "Physics",   color: "#4F6F86", dash: [],      data: [61,64,62,68,70,72,75,78] },
  { subject: "Chemistry", color: "#4F7A59", dash: [4,4],   data: [55,58,60,62,61,65,68,71] },
  { subject: "Maths",     color: "#A95D32", dash: [2,3],   data: [60,58,63,61,67,65,70,68] },
  { subject: "Biology",   color: "#A05252", dash: [6,3],   data: [72,75,76,78,79,80,81,80] },
];

export const SUBJECT_DISTRIBUTION = [
  { subject: "Physics",   pct: 32, color: "#4F6F86" },
  { subject: "Chemistry", pct: 28, color: "#4F7A59" },
  { subject: "Maths",     pct: 24, color: "#A95D32" },
  { subject: "Biology",   pct: 16, color: "#A05252" },
];

export const RADAR_LABELS = ["Mechanics","Organic Chem","Calculus","Genetics","Thermo"];
export const RADAR_YOU    = [68, 42, 38, 81, 51];
export const RADAR_TOPPER = [88, 78, 82, 88, 79];

export const TOPIC_WEAKNESS = [
  { topic: "Integration",      accuracy: 38, severity: "critical" },
  { topic: "Organic Reactions", accuracy: 42, severity: "critical" },
  { topic: "Thermodynamics",   accuracy: 51, severity: "warn"     },
  { topic: "Kinematics",       accuracy: 44, severity: "critical" },
  { topic: "Optics",           accuracy: 77, severity: "good"     },
  { topic: "Genetics",         accuracy: 81, severity: "good"     },
];

// 56 values (8 weeks × 7 days), 0=none 1=light 2=medium 3=high
export const HEATMAP_VALUES = [
  0,1,2,3,2,1,0,
  1,2,3,3,2,1,0,
  0,1,3,2,1,2,3,
  2,1,0,1,2,3,2,
  3,2,1,0,1,2,1,
  3,2,0,1,2,3,2,
  1,0,2,3,2,1,0,
  1,3,2,1,1,2,3,
];

export const TIME_BY_DAY = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.0 },
  { day: "Wed", hours: 3.5 },
  { day: "Thu", hours: 2.0 },
  { day: "Fri", hours: 2.5 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 1.0 },
];

export const PYQ_INSIGHTS = [
  { topic: "Kinematics",  note: "Appears in 87% of JEE papers",    accuracy: 44, status: "weak"   },
  { topic: "Gibbs Energy", note: "High repeat rate — 2019–2023",   accuracy: 58, status: "avg"    },
  { topic: "Genetics",    note: "20% of NEET Biology marks",        accuracy: 81, status: "strong" },
  { topic: "Integration", note: "JEE Advanced — 3–4 Qs every year", accuracy: 38, status: "weak"  },
];

export const READINESS_BREAKDOWN = [
  { label: "Concept coverage", pct: 82, color: "#4F7A59" },
  { label: "PYQ accuracy",     pct: 73, color: "#4F6F86" },
  { label: "Speed (q/min)",    pct: 69, color: "#A95D32" },
  { label: "Mock test score",  pct: 76, color: "#A05252" },
];

export const AI_PREDICTIONS = [
  { label: "JEE percentile estimate", value: "94.2 ile", pct: 94 , color: "#4F7A59" },
  { label: "NEET score estimate",     value: "612 / 720", pct: 85, color: "#4F6F86" },
  { label: "Projected rank (JEE)",    value: "#8,400",    pct: null, color: null     },
];

export const ADAPTIVE_STEPS = [
  { step: "Step 1 — Foundations",  detail: "Basic definite integrals · Easy · 10 Qs",  color: "#4F7A59" },
  { step: "Step 2 — By parts",     detail: "IBP method drills · Medium · 15 Qs",        color: "#A8791D" },
  { step: "Step 3 — PYQ Blitz",    detail: "2018–2023 JEE papers · Hard · 20 Qs",       color: "#A95D32" },
  { step: "Step 4 — Mock test",    detail: "Timed 30 min session",                       color: "#4F6F86" },
];

export const DAILY_TASKS = [
  { task: "Revise Integration formulas",  detail: "30 min · Critical gap",         color: "#A95D32" },
  { task: "Solve 20 Kinematics PYQs",    detail: "45 min · High weightage",        color: "#4F7A59" },
  { task: "Chemistry formula cards",      detail: "20 min · Scheduled revision",    color: "#4F6F86" },
  { task: "Physics mini mock test",       detail: "30 min · 25 Qs",                color: "#A8791D" },
];

export const AI_RECOMMENDATIONS = [
  {
    title:  "Integration needs urgent attention",
    body:   "38% accuracy with 3–4 guaranteed JEE Advanced questions. Start with basic definite integrals today.",
    tag:    "Critical",
    type:   "danger",
  },
  {
    title:  "Leverage your Genetics strength",
    body:   "81% accuracy. Solve 2019–2023 NEET Genetics PYQs to consolidate — easy marks here.",
    tag:    "Strength",
    type:   "success",
  },
  {
    title:  "Increase study consistency",
    body:   "Sundays show only 1h of study. Even 2h on rest days will close 12% of your readiness gap.",
    tag:    "Habit",
    type:   "warn",
  },
  {
    title:  "Speed is your bottleneck",
    body:   "69% speed score. You know the answers but take too long. Practice timed 2-minute-per-Q sessions.",
    tag:    "Speed",
    type:   "info",
  },
];
