"use client";

import PricingCard from "@/components/pricing/PricingCard";
import { useEffect, useState } from "react";
import { Bot, BarChart3, FileText, BookOpen } from "lucide-react";

export default function PricingPage() {
  const [examTrack, setExamTrack] = useState("JEE");

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((profile) => setExamTrack(profile?.exam === "NEET" ? "NEET" : "JEE"))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Heading */}

        <div className="text-center">

          <h1 className="text-5xl font-black text-gray-900">
            Upgrade to PrepZii Pro
          </h1>

          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
            Unlock {examTrack} learning, unlimited tests, premium PYQs,
            advanced analytics and much more. Your subscription applies only to {examTrack}.
          </p>

        </div>

        {/* Cards */}

        <div className="grid lg:grid-cols-3 gap-8 mt-20">

          <PricingCard
            title="Monthly"
            price={49}
            originalPrice={199}
            discount={75}
            duration="month"
            plan="monthly"
            examTrack={examTrack}
            features={[
              "Unlimited Tests",
              "Unlimited PYQs",
              "AI Doubt Solver",
              "AI Solutions",
              "Premium Analytics",
              "Priority Support",
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
            popular={true}
            features={[
              "Everything in Monthly",
      "Save ₹370 from the original price",
              "Unlimited AI Usage",
              "Priority Support",
              "Early Feature Access",
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
              "Best Value",
              "Unlimited Everything",
            ]}
          />

        </div>

        {/* Bottom Section */}

        <div className="mt-20 text-center">

          <h2 className="text-2xl font-bold">
            Why PrepZii Pro?
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mt-10">

            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="text-4xl text-indigo-500 mb-2 flex items-center"><Bot className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                AI Doubt Solver
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Instant AI explanations for every question.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="text-4xl text-emerald-500 mb-2 flex items-center"><BarChart3 className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                Premium Analytics
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Track strengths and weaknesses in detail.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="text-4xl text-rose-500 mb-2 flex items-center"><FileText className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                Unlimited Tests
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Practice without limits.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="text-4xl text-violet-500 mb-2 flex items-center"><BookOpen className="w-10 h-10" /></div>

              <h3 className="mt-3 font-bold">
                Premium PYQs
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Access all previous year questions.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
