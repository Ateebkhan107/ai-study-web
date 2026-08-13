import PageWrapper from "@/components/PageWrapper";
import { Target, Lightbulb, ShieldCheck, Rocket, Zap, Heart } from "lucide-react";

export const metadata = {
  title: "About Us | PrepZii",
  description: "Learn more about PrepZii, our mission, vision, and how we're revolutionizing JEE & NEET preparation.",
};

export default function AboutPage() {
  return (
    <PageWrapper 
      title="About Us" 
      subtitle="The team behind your success." 
      badge="COMPANY"
      badgeVariant="blue"
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-slideUp">
        
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-3xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              To democratize high-quality education by providing every JEE and NEET aspirant with intelligent, affordable, and highly effective tools to unlock their true potential.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Our Vision</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              To become the global standard for personalized learning, where technology and education seamlessly merge to create the next generation of engineers and doctors.
            </p>
          </div>
        </div>

        {/* Why PrepZii */}
        <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Why PrepZii?</h2>
          <div className="space-y-4 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            <p>
              Preparing for competitive exams like JEE and NEET is incredibly challenging. Students often face an overwhelming amount of content, lack of structured feedback, and expensive coaching institutes that don&apos;t cater to individual learning paces.
            </p>
            <p>
              <strong>PrepZii was built to change this.</strong> We believe that technology can provide a personalized, hyper-focused learning experience that adapts to you. Instead of just giving you questions, we analyze your weaknesses, track your performance, and provide an environment that perfectly simulates the real CBT (Computer Based Test) experience.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Exam Simulation", desc: "A strict, distraction-free interface that mirrors the actual JEE/NEET CBT exam." },
              { icon: Zap, title: "Deep Analytics", desc: "AI-driven insights that pinpoint your exact weak chapters and concepts." },
              { icon: Rocket, title: "Structured Practice", desc: "Unlimited tests, comprehensive PYQs, and daily goals to keep your momentum high." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50">
                  <feature.icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Roadmap */}
        <div className="glass-card p-8 md:p-12 rounded-3xl border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Our Future Roadmap</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6">
            We are constantly iterating and improving. Here is a glimpse of what&apos;s coming next to PrepZii:
          </p>
          <ul className="space-y-4">
            {[
              "Advanced AI Doubt Solving integration.",
              "Live multiplayer mock tests with real-time leaderboards.",
              "Detailed video solutions for complex physics and chemistry PYQs.",
              "Parent & Mentor dashboards for better progress tracking."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Closing Message */}
        <div className="text-center space-y-4 pt-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
            <Heart className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Built with passion by Team PrepZii</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
            We are dedicated to helping you achieve your dreams. Keep learning, keep pushing your limits, and trust the process. You&apos;ve got this.
          </p>
        </div>

      </div>
    </PageWrapper>
  );
}
