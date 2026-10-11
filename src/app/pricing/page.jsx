"use client";

import PricingCard from "@/components/pricing/PricingCard";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bot, BarChart3, FileText, BookOpen, Zap } from "lucide-react";

function getInitialTrack() {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )prepzii_track=([^;]+)"));
    const savedTrack = match ? match[2].toUpperCase() : null;
    if (savedTrack === "NEET" || savedTrack === "JEE") return savedTrack;
  }
  return "JEE";
}

export default function PricingPage() {
  const [examTrack, setExamTrack] = useState(getInitialTrack);
  const { user } = useUser();
  const isSignedOut = !user;

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((profile) => setExamTrack(profile?.exam === "NEET" ? "NEET" : "JEE"))
      .catch(() => {});
  }, [user]);

  const handleTrackChange = (newTrack) => {
    setExamTrack(newTrack);
    if (typeof document !== "undefined") {
      document.cookie = `prepzii_track=${newTrack.toLowerCase()}; path=/; max-age=31536000; SameSite=Lax;`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-5xl font-black font-display text-gray-900">
            Upgrade to PrepZii Pro
          </h1>

          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
            {isSignedOut ? (
              <>Unlock premium JEE & NEET tests, PYQ tools, analytics, and AI explanations. Formula handbooks are included in the free plan.</>
            ) : (
              <>Unlock premium {examTrack} tests, PYQ tools, analytics, and AI explanations. Formula handbooks are included in the free plan.</>
            )}
          </p>

          {/* Track Selector / Badge */}
          <div className="mt-6 flex justify-center">
            {isSignedOut ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Select Exam Track:
                </span>
                <div className="inline-flex items-center p-1 rounded-full border border-slate-300 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleTrackChange("JEE")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      examTrack === "JEE"
                        ? "bg-[#1e3a5f] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    JEE Track
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTrackChange("NEET")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      examTrack === "NEET"
                        ? "bg-[#1e3a5f] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    NEET Track
                  </button>
                </div>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-black text-blue-700 shadow-sm">
                <Zap className="h-3.5 w-3.5 fill-current" />
                {examTrack === "NEET" ? "NEET Track" : "JEE Track"}
              </span>
            )}
          </div>
        </div>

        {/* Cards */}

        <div className="grid lg:grid-cols-4 gap-8 mt-20">

          <PricingCard
            title="Monthly"
            price={49}
            originalPrice={199}
            discount={75}
            duration="month"
            plan="monthly"
            examTrack={examTrack}
            features={[
              "Unlimited custom tests",
              "Quick tests and premium full mock tests",
              "Chapter-wise PYQs and mistake redo",
              "Advanced and PYQ analytics",
              "AI-powered question explanations",
              "Ad-free experience",
            ]}
          />

          <PricingCard
            title="Quarterly"
            price={129}
            originalPrice={499}
            discount={74}
            duration="3 months"
            plan="quarterly"
            examTrack={examTrack}
            
            features={[
              "Everything in Monthly",
              "Save ₹370 from the original price",
              "3 months of Pro access",
            ]}
          />

          <PricingCard
            title="Yearly"
            price={399}
            originalPrice={1799}
            discount={78}
            duration="year"
            plan="yearly"
            examTrack={examTrack}
            features={[
              "Everything in Quarterly",
              "Save ₹1,400 from the original price",
              "12 months of Pro access",
            ]}
          />


          <PricingCard
            title="AI Mode"
            price={1999}
            originalPrice={3699}
            discount={54}
            duration="month"
            plan="ai_mode"
            examTrack={examTrack}
            isAiMode={true}
            features={[
              "Everything in Pro",
              "Full Zi AI companion",
              "Higher AI usage limits",
              "Voice interaction",
              "Visual explanations",
              "Personalized study memory",
              "Personalized study plans",
            ]}
          />

        </div>

        {/* Bottom Section */}

        <div className="mt-20 text-center">

          <h2 className="text-2xl font-bold">
            Why PrepZii Pro?
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mt-10">

            <div className="rounded-2xl bg-[var(--card)] p-6 shadow">
              <div className="text-4xl text-indigo-500 mb-2 flex items-center"><Bot className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                AI Explanations
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Get AI-powered help with supported practice questions.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--card)] p-6 shadow">
              <div className="text-4xl text-emerald-500 mb-2 flex items-center"><BarChart3 className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                Premium Analytics
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Track strengths and weaknesses in detail.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--card)] p-6 shadow">
              <div className="text-4xl text-rose-500 mb-2 flex items-center"><FileText className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                Unlimited Custom Tests
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Build custom tests without the Free plan&apos;s monthly limit.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--card)] p-6 shadow">
              <div className="text-4xl text-indigo-500 mb-2 flex items-center"><BookOpen className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                Premium PYQ Tools
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Unlock chapter practice, mistake redo, analytics, and revision insights.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
