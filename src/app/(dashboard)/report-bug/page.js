import PageWrapper from "@/components/PageWrapper";
import { Bug, Send, Monitor, MonitorSmartphone, Camera, Info, Search } from "lucide-react";

export const metadata = {
  title: "Report a Bug | PrepZii",
  description: "Help us improve PrepZii by reporting any bugs or issues you encounter.",
};

const BUG_GUIDELINES = [
  { icon: Monitor, title: "Device", desc: "Are you using a Laptop, Tablet, or Mobile phone?" },
  { icon: MonitorSmartphone, title: "Browser", desc: "Which browser are you using? (Chrome, Safari, Edge, etc.)" },
  { icon: Search, title: "Steps to Reproduce", desc: "What exactly were you doing when the bug occurred?" },
  { icon: Info, title: "Expected vs Actual", desc: "What did you expect to happen, and what actually happened?" },
  { icon: Camera, title: "Screenshot", desc: "If possible, attach a screenshot of the error." }
];

export default function ReportBugPage() {
  return (
    <PageWrapper 
      title="Report a Bug" 
      subtitle="Help us squash bugs and improve your experience." 
      badge="BUG REPORT"
      badgeVariant="rose"
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-slideUp">
        
        {/* Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
            <Bug className="w-8 h-8" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            Found something that isn&apos;t working quite right? We appreciate your help in identifying issues so we can fix them as quickly as possible.
          </p>
        </div>

        {/* Guidelines */}
        <div className="glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden border-rose-500/20 shadow-lg shadow-rose-500/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <h2 className="text-xl font-black font-display text-slate-900 dark:text-white mb-6 relative z-10">What to include in your report:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {BUG_GUIDELINES.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[var(--card)]/50 dark:bg-[var(--surface)]/50 border border-slate-100 dark:border-[var(--border)]/50">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[var(--surface-elevated)]/80 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center relative z-10">
            <a 
              href="mailto:contact.prepzii@gmail.com?subject=PrepZii%20Bug%20Report"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25 group"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              Report Bug via Email
            </a>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
              Clicking this button will open your default email client.
            </p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
