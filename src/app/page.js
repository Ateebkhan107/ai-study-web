"use client";

import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Rocket } from "lucide-react";

export default function PublicLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 filter blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Logo size={32} />
      </header>

      {/* Hero Welcome Message */}
      <main className="max-w-3xl w-full mx-auto px-6 py-20 flex flex-col items-center text-center justify-center flex-1 relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
          <Rocket className="w-3.5 h-3.5" /> Welcome to PrepZii
        </div>
        
        <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white leading-none">
          Peak Performance <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Exam Prep.
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-[#7d8590] max-w-md mx-auto leading-relaxed">
          The next-generation AI practice workspace engineered specifically for elite JEE and NEET aspirants.
        </p>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-white text-black font-black text-sm rounded-2xl hover:bg-gray-100 transition-all hover:scale-[0.98] shadow-xl shadow-white/5"
          >
            Get Started — It&apos;s Free
          </button>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-[10px] font-semibold text-[#7d8590]/40">
        © PrepZii Systems. Built for top national ranks.
      </footer>
    </div>
  );
}
