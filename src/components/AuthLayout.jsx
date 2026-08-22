import Logo from "@/components/Logo";
import { BookOpen, FileText, Bot, BarChart, TrendingUp } from "lucide-react";

// Injected once — pure CSS hover, no JS event handlers needed
const hoverStyles = `
  .feature-card {
    border: 1px solid rgba(234,179,8,0.1);
    background: rgba(0,0,0,0.4);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .feature-card:hover {
    border-color: rgba(234,179,8,0.3);
    background: rgba(234,179,8,0.06);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(234,179,8,0.15);
  }
`;

const FEATURES = [
  {
    icon: <BookOpen className="w-5 h-5 text-brand" />,
    title: "Fully Solved PYQs",
    desc: "Complete previous year questions with detailed solutions.",
  },
  {
    icon: <FileText className="w-5 h-5 text-brand" />,
    title: "Mock Tests",
    desc: "Full-length and chapter-wise tests that simulate the real exam experience.",
  },
  {
    icon: <Bot className="w-5 h-5 text-brand" />,
    title: "AI Study Tutor (Coming Soon)",
    desc: "Personalized AI tutor for doubt solving, explanations, and guided learning.",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-brand" />,
    title: "Rank Predictor (Coming Soon)",
    desc: "Predict your expected JEE or NEET rank based on your performance.",
  },
  {
    icon: <BarChart className="w-5 h-5 text-brand" />,
    title: "Smart Analytics",
    desc: "Track accuracy, strengths, weaknesses, and progress over time.",
  },
];

const STATS = [
  { value: "500+", label: "Students" },
  { value: "50,000+", label: "Questions" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden text-white flex font-sans" style={{ background: "#000000" }}>
      <style>{hoverStyles}</style>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-center p-16 xl:p-24 relative overflow-hidden"
        style={{ borderRight: "1px solid rgba(234,179,8,0.1)" }}
      >

        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(234,179,8,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Indigo radial spotlight — the signature element */}
        <div
          className="absolute pointer-events-none animate-fadeInScale"
          style={{
            top: "20%",
            left: "-10%",
            width: "80%",
            height: "70%",
            background: "radial-gradient(ellipse at center, rgba(234,179,8,0.15) 0%, transparent 60%)",
            filter: "blur(50px)",
            animationDuration: "1s"
          }}
        />

        {/* Top corner accent */}
        <div
          className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(234,179,8,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="w-full max-w-lg mx-auto">
          {/* Top — Logo + tagline */}
          <div className="relative z-10 animate-slideUp" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <Logo size={48} forceDark={true} />

            <p className="mt-8 text-base md:text-lg leading-relaxed max-w-sm font-medium" style={{ color: "#94A3B8" }}>
              The smartest way to crack{" "}
              <span className="font-bold text-white">JEE</span>
              {" "}& {" "}
              <span className="font-bold text-white">NEET</span>.
            </p>

            {/* Stats row */}
            <div
              className="inline-flex items-center gap-0 mt-10 rounded-2xl overflow-hidden shadow-xl shadow-brand/5 backdrop-blur-sm"
              style={{ border: "1px solid rgba(234,179,8,0.15)", background: "rgba(234,179,8,0.03)" }}
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="px-8 py-5"
                  style={{
                    borderRight: i < STATS.length - 1 ? "1px solid rgba(234,179,8,0.15)" : "none",
                  }}
                >
                  <p
                    className="text-2xl font-black tracking-tight tabular-nums leading-none"
                    style={{ color: "#FFFFFF" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[11px] mt-2 font-bold tracking-widest uppercase" style={{ color: "#EAB308" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle — Feature cards */}
          <div className="relative z-10 space-y-3.5 mt-12 animate-slideUp" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card flex items-start gap-5 p-5 rounded-2xl"
                style={{ backdropFilter: "blur(12px)" }}
              >
                <span
                  className="text-lg mt-0.5 shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-inner"
                  style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}
                >
                  {f.icon}
                </span>
                <div>
                  <p className="font-bold text-[15px] tracking-tight" style={{ color: "#FFFFFF" }}>{f.title}</p>
                  <p className="text-[13px] mt-1.5 leading-relaxed font-medium" style={{ color: "#94A3B8" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:p-8 relative animate-fadeInScale"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(234,179,8,0.04) 0%, transparent 70%)",
          animationDelay: "0.3s",
          animationFillMode: "both"
        }}
      >
        {/* Subtle corner glow */}
        <div
          className="absolute bottom-0 right-0 hidden w-96 h-96 pointer-events-none sm:block"
          style={{
            background: "radial-gradient(circle at bottom right, rgba(234,179,8,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Mobile logo */}
        <div className="absolute top-5 left-4 lg:hidden animate-slideUp sm:left-6 sm:top-8" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <Logo size={36} forceDark={true} />
        </div>

        <div className="w-full max-w-[min(100%,28rem)] relative z-10">
          {children}
        </div>
      </div>

    </div>
  );
}
