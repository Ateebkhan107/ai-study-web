"use client";

import Hero from "./Hero";
import StatsCards from "./StatsCards";
import SubjectGrid from "./SubjectGrid";
import StudyMode from "./StudyMode";
import FocusTimer from "./FocusTimer";
import GoalCard from "./GoalCard";
import RecentSessions from "./RecentSessions";

import {
  SelfStudyProvider,
  useSelfStudy,
} from "@/context/SelfStudyContext";

function SelfStudyContent() {

  const { loading } = useSelfStudy();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <Hero />

      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left */}

        <div className="xl:col-span-2 space-y-8">

          <FocusTimer />

          <SubjectGrid />

          <StudyMode />

        </div>

        {/* Right */}

        <div className="space-y-8">

          <GoalCard />

          <RecentSessions />

        </div>

      </div>

    </div>
  );
}

export default function SelfStudy() {
  return (
    <SelfStudyProvider>
      <SelfStudyContent />
    </SelfStudyProvider>
  );
}