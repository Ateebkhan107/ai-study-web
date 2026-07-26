"use client";

import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Rocket } from "lucide-react";

export default function PublicLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] rounded-full bg-indigo-600/20 filter blur-[100px] md:blur-[130px] pointer-events-none animate-fadeInScale opacity-50 mix-blend-screen" />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] md:w-[60vw] h-[70vw] md:h-[60vw] rounded-full bg-purple-600/15 filter blur-[100px] md:blur-[150px] pointer-events-none animate-fadeInScale opacity-40 mix-blend-screen" 
        style={{ animationDelay: '0.5s', animationFillMode: 'both' }} 
      />

      {/* Top Header Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-8 flex items-center justify-between relative z-10 animate-slideUp">
        <Logo forceDark size={36} className="hover:opacity-80 transition-opacity cursor-pointer" />
      </header>

      {/* Hero Welcome Message */}
      <main className="max-w-4xl w-full mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center justify-center flex-1 relative z-10">
        
        <div 
          className="animate-slideUp inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide mb-8 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          <Rocket className="w-4 h-4 text-indigo-400" /> Welcome to PrepZii
        </div>
        
        <h1 
          className="animate-slideUp text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05]" 
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          Peak Performance <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 inline-block pb-2">
            Exam Prep.
          </span>
        </h1>
        
        <p 
          className="animate-slideUp text-base sm:text-lg md:text-xl text-[#8b949e] max-w-2xl mx-auto leading-relaxed mt-8 font-medium" 
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          The next-generation AI practice workspace engineered specifically for elite JEE and NEET aspirants.
        </p>

        <div 
          className="animate-slideUp pt-12 w-full sm:w-auto" 
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-sm sm:text-base rounded-full hover:bg-gray-100 transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Get Started — It&apos;s Free
          </button>
        </div>
      </main>

      {/* Footer copyright */}
      <footer 
        className="w-full text-center py-8 text-[11px] sm:text-xs font-medium text-[#7d8590]/50 relative z-10 animate-slideUp"
        style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
      >
        © PrepZii Systems. Built for top national ranks.
      </footer>
    </div>
  );
}
