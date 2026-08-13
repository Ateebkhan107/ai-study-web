import PageWrapper from "@/components/PageWrapper";
import { Code2, Brain, PenTool, Edit3, Megaphone, Users, Send } from "lucide-react";

export const metadata = {
  title: "Careers | PrepZii",
  description: "Join the team at PrepZii and help us revolutionize education for JEE and NEET aspirants.",
};

const DEPARTMENTS = [
  { icon: Code2, name: "Software Engineering", desc: "Build scalable architecture and seamless user experiences." },
  { icon: Brain, name: "AI & Machine Learning", desc: "Develop models that personalize and predict student learning paths." },
  { icon: PenTool, name: "UI/UX Design", desc: "Craft beautiful, intuitive, and modern interfaces for students." },
  { icon: Edit3, name: "Content Development", desc: "Create high-quality academic content, mock tests, and solutions." },
  { icon: Megaphone, name: "Marketing", desc: "Help us reach millions of students across the globe." },
  { icon: Users, name: "Customer Success", desc: "Ensure every student has the best possible experience on our platform." }
];

export default function CareersPage() {
  return (
    <PageWrapper 
      title="Careers at PrepZii" 
      subtitle="Help us build the future of learning." 
      badge="HIRING"
      badgeVariant="emerald"
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-slideUp">
        
        {/* Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            At PrepZii, we are on a mission to democratize quality education. We are always looking for passionate, driven, and talented individuals to join our journey.
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300">
            Currently, there are <span className="text-red-500">no open positions</span>.
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">
            However, we are constantly expanding. If you believe you can make a difference, we would love to hear from you.
          </p>
        </div>

        {/* Future Opportunities */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center">Future Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl group hover:border-indigo-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                  <dept.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{dept.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card p-10 rounded-3xl border-indigo-500/20 shadow-lg shadow-indigo-500/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mt-20 pointer-events-none" />
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 relative z-10">Think you&apos;d be a great fit?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-8 relative z-10">
            Even though we don&apos;t have open roles right now, we keep an active talent pool. Send us your resume and a brief introduction about what you&apos;d like to build at PrepZii.
          </p>
          
          <a 
            href="mailto:contact.prepzii@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg relative z-10 group"
          >
            <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            Send Resume
          </a>
        </div>

      </div>
    </PageWrapper>
  );
}
