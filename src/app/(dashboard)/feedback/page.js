import PageWrapper from "@/components/PageWrapper";
import { MessageSquarePlus, Lightbulb, PenTool, Sparkles, Send } from "lucide-react";

export const metadata = {
  title: "Feedback | PrepZii",
  description: "Share your thoughts, feature requests, and feedback to help us build a better PrepZii.",
};

const FEEDBACK_TYPES = [
  { icon: Lightbulb, title: "Feature Requests", desc: "Have an idea for a new feature? We're all ears.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { icon: Sparkles, title: "Platform Improvements", desc: "Thoughts on how we can make the dashboard or UI better.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  { icon: PenTool, title: "Study Tools", desc: "Feedback on our mock tests, analytics, or formula books.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { icon: MessageSquarePlus, title: "General Feedback", desc: "Anything else you want to share about your experience.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" }
];

export default function FeedbackPage() {
  return (
    <PageWrapper
      title="Feedback"
      subtitle="Your voice shapes our future."
      badge="WE'RE LISTENING"
      badgeVariant="indigo"
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-slideUp">

        {/* Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            PrepZii is built for students, by a team that listens to students. We read every single piece of feedback to ensure we are building exactly what you need to succeed.
          </p>
        </div>

        {/* Feedback Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEEDBACK_TYPES.map((item, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl flex items-start gap-4 group hover:border-indigo-500/30 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-brand-hover shadow-lg shadow-brand/20">
            <div className="bg-[var(--card)] dark:bg-[var(--surface)] rounded-xl px-12 py-10 relative overflow-hidden">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 relative z-10">Ready to share your thoughts?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8 relative z-10">
                Drop us an email with your suggestions. If you are requesting a feature, let us know how it would help your preparation.
              </p>
              <a
                href="mailto:contact.prepzii@gmail.com?subject=PrepZii%20Feedback"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand text-white dark:bg-brand dark:text-white font-bold text-sm hover:bg-brand-hover dark:hover:bg-slate-100 transition-colors shadow-lg relative z-10 group"
              >
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                Send Feedback
              </a>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
