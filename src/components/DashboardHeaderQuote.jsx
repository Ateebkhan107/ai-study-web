"use client";

import { useState } from "react";

const DASHBOARD_HEADER_MESSAGES = [
  "One solid session. That's enough.",
  "Small wins compound. Unfortunately, so does the syllabus.",
  "Accuracy first. Speed can panic later.",
  "One chapter at a time. There are enough of them.",
  "The syllabus has not disappeared overnight.",
  "Today's plan: know slightly more than yesterday.",
  "Your notes are starting to miss you.",
  "One difficult question is still progress.",
  "Start with one question. Negotiate with yourself later.",
  "The answer is probably not always option C.",
  "Read the question. Yes, the whole question.",
  "Confidence is good. Checking the units is better.",
  "The formula looked easier yesterday.",
  "One more PYQ won't hurt. Probably.",
  "Guessing is a strategy. Just not a very good one.",
  "The backlog would like a word.",
  "Physics has entered the chat.",
  "Chemistry would like you to remember that exception.",
  "Biology has another name for you to memorize.",
  "Mathematics noticed that skipped step.",
  "That silly mistake is getting suspiciously familiar.",
  "Read twice. Regret once.",
  "The diagram is trying to tell you something.",
  "Units: tiny symbols, enormous consequences.",
  "Elimination is also a skill.",
  'Today\'s target: fewer "I knew this" moments.',
  "Ten focused questions beat fifty distracted ones.",
  "The hard chapter is still a chapter.",
  "You can check your phone after this question.",
  "Revision: because your brain has a delete button.",
  "Future you has requested fewer backlogs.",
  "There is no negative marking for starting.",
  "One clean hour can rescue a messy day.",
  "Stop negotiating. Open the chapter.",
  "The question setter is not personally attacking you.",
  "Maybe draw the free-body diagram this time.",
  "Organic chemistry remembers everything you forgot.",
  "NCERT is quietly waiting on the shelf.",
  "Your rank does not improve by refreshing the dashboard.",
  "Today's boss battle: the chapter you keep avoiding.",
  "Don't speedrun the question statement.",
  "A wrong answer reviewed properly is useful.",
  "You have survived worse chapters.",
  "The chapter is not going to revise itself.",
  "One good session beats five guilty ones.",
  "Focus first. Panic later.",
  "The easy marks are still marks.",
  "Today is a good day to stop skipping that chapter.",
  "Your future self votes for doing the PYQs.",
  "Okay. Enough dashboard. Go study.",
];

function getLocalDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function getDateLabel(date = new Date()) {
  const { weekday, month, day } = getLocalDateParts(date);

  return `${weekday.toUpperCase()} · ${day} ${month.toUpperCase()}`;
}

function getRandomMessage() {
  let previousIndex = null;
  try {
    previousIndex = Number(window.sessionStorage.getItem("prepzii_dashboard_quote_index"));
  } catch {
    previousIndex = null;
  }

  let nextIndex = Math.floor(Math.random() * DASHBOARD_HEADER_MESSAGES.length);

  if (
    DASHBOARD_HEADER_MESSAGES.length > 1 &&
    Number.isInteger(previousIndex) &&
    nextIndex === previousIndex
  ) {
    nextIndex = (nextIndex + 1) % DASHBOARD_HEADER_MESSAGES.length;
  }

  try {
    window.sessionStorage.setItem("prepzii_dashboard_quote_index", String(nextIndex));
  } catch {
    // Session storage is only used to reduce back-to-back repeats.
  }

  return DASHBOARD_HEADER_MESSAGES[nextIndex];
}

function getInitialMessage() {
  if (typeof window === "undefined") {
    return DASHBOARD_HEADER_MESSAGES[0];
  }

  return getRandomMessage();
}

export default function DashboardHeaderQuote() {
  const [dateLabel] = useState(() => getDateLabel());
  const [message] = useState(() => getInitialMessage());

  return (
    <div className="max-w-full min-w-0 lg:col-start-2 lg:max-w-[440px] lg:pt-6">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700/75 dark:text-brand/70">
        {dateLabel}
      </p>
      <p
        className="mt-1 max-w-[440px] text-base font-semibold leading-snug text-slate-700 dark:text-slate-100 sm:text-lg lg:text-[21px]"
        suppressHydrationWarning
      >
        {message}
      </p>
    </div>
  );
}
