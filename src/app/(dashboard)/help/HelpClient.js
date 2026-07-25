"use client";

import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { Search, ChevronDown, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    question: "How do I start a test?",
    answer: "Navigate to the 'Tests' section from the sidebar or quick links. Browse the available chapter-wise or full mock tests and click 'Start Test'. Note that once a test starts, you will enter a strict, full-screen exam environment."
  },
  {
    question: "How does XP work?",
    answer: "You earn Experience Points (XP) by actively preparing on PrepZii. Completing tests, practicing PYQs, reading formula books, and maintaining streaks all contribute to your total XP. Your XP reflects your overall dedication and effort."
  },
  {
    question: "How are rankings calculated?",
    answer: "The global leaderboard ranks users entirely based on their total XP. The more you practice and engage with the platform, the higher your XP grows, boosting your rank among all PrepZii aspirants."
  },
  {
    question: "What is PrepZii Pro?",
    answer: "PrepZii Pro is our premium subscription tier. It unlocks advanced analytics, unlimited full-length mock tests, detailed solutions, ad-free experience, and priority support. It's designed to give serious aspirants a competitive edge."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support a wide range of payment options through our secure payment gateway, Razorpay. This includes Credit/Debit Cards, UPI, Net Banking, and major mobile wallets."
  },
  {
    question: "My payment was successful but Pro is not activated. What should I do?",
    answer: "Occasionally, payment network delays can cause a sync issue. Wait 5-10 minutes and refresh your dashboard. If your Pro status still hasn't updated, please report a bug or contact our support team with your payment transaction ID."
  },
  {
    question: "How does the subscription work?",
    answer: "PrepZii Pro plans are fixed-term subscriptions (e.g., 1 Month, 6 Months). They remain active until the billing period ends. Once expired, your account will safely return to the free tier unless you purchase a new plan."
  },
  {
    question: "How can I contact support?",
    answer: "You can reach out to us at any time by emailing contact.prepzii@gmail.com, or by using the 'Contact Us' or 'Feedback' links found in the footer."
  }
];

export default function HelpClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper 
      title="Help Center" 
      subtitle="How can we help you today?" 
      badge="SUPPORT"
      badgeVariant="purple"
    >
      <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-slideUp">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-4 bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm font-medium"
            placeholder="Search for articles, questions, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "border-indigo-500/30 bg-white/90 dark:bg-[#0f172a]/90 shadow-md shadow-indigo-500/5" 
                      : "border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-[#0f172a]/60 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                  >
                    <span className="font-bold text-slate-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
                  </button>
                  
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <MessageCircleQuestion className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                We couldn't find any FAQs matching "{searchQuery}".
              </p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-6 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Still need help? */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Still need help?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Can't find the answer you're looking for? Our support team is here to help you with any questions.
          </p>
          <div className="pt-2">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
