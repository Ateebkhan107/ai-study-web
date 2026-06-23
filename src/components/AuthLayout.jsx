import Logo from "@/components/Logo";

// Injected once — pure CSS hover, no JS event handlers needed
const hoverStyles = `
  .feature-card { border: 1px solid rgba(99,102,241,0.15); background: rgba(15,19,32,0.7); }
  .feature-card:hover { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.08); }
`;

const FEATURES = [
  {
    icon: "📚",
    title: "Previous Year Questions",
    desc: "2000–2024 fully solved PYQs for JEE & NEET with detailed explanations.",
  },
  {
    icon: "📝",
    title: "Mock Tests",
    desc: "Full-length & chapter-wise tests that simulate the real exam experience.",
  },
  {
    icon: "🤖",
    title: "AI Study Assistant",
    desc: "Personalised study plans and weak area detection powered by AI.",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    desc: "Track accuracy, rank, and progress across subjects over time.",
  },
];

const STATS = [
  { value: "12,000+", label: "Students" },
  { value: "50,000+", label: "Questions" },
  { value: "94%", label: "Satisfaction" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen text-white flex" style={{ background: "#080C14" }}>
      <style>{hoverStyles}</style>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ borderRight: "1px solid rgba(99,102,241,0.15)" }}
      >

        {/* Dot-grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Indigo radial spotlight — the signature element */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "30%",
            left: "-10%",
            width: "70%",
            height: "55%",
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Top corner accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(129,140,248,0.08) 0%, transparent 65%)",
          }}
        />

        {/* Top — Logo + tagline */}
        <div className="relative z-10">
          <Logo size={44} forceDark={true} />

          <p className="mt-5 text-sm leading-relaxed max-w-xs" style={{ color: "#94A3B8" }}>
            The smartest way to crack{" "}
            <span className="font-bold" style={{ color: "#A5B4FC" }}>JEE</span>
            {" "}& {" "}
            <span className="font-bold" style={{ color: "#A5B4FC" }}>NEET</span>.
          </p>

          {/* Stats row */}
          <div
            className="inline-flex items-center gap-0 mt-8 rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)" }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="px-6 py-3"
                style={{
                  borderRight: i < STATS.length - 1 ? "1px solid rgba(99,102,241,0.2)" : "none",
                }}
              >
                <p
                  className="text-xl font-black tracking-tight tabular-nums"
                  style={{ color: "#E0E7FF" }}
                >
                  {s.value}
                </p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: "#6366F1" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Middle — Feature cards */}
        <div className="relative z-10 space-y-2.5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card flex items-start gap-4 p-4 rounded-2xl transition-all duration-300"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <span
                className="text-lg mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                {f.icon}
              </span>
              <div>
                <p className="font-bold text-sm" style={{ color: "#E0E7FF" }}>{f.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748B" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom — Testimonial */}
        <div
          className="relative z-10 pt-6"
          style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}
        >
          {/* Stars */}
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#6366F1">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#94A3B8", fontStyle: "italic" }}
          >
            &quot;Prepzii&apos;s mock tests and AI plans helped me go from 85%ile to{" "}
            <span className="font-bold not-italic" style={{ color: "#A5B4FC" }}>99.2%ile</span>{" "}
            in JEE Mains in just 3 months.&quot;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
                color: "#fff",
              }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#E0E7FF" }}>Aryan M.</p>
              <p className="text-xs" style={{ color: "#6366F1" }}>JEE Mains 99.2%ile, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.07) 0%, transparent 65%)",
        }}
      >
        {/* Subtle corner glow */}
        <div
          className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background: "radial-gradient(circle at bottom right, rgba(99,102,241,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Mobile logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Logo size={36} forceDark={true} />
        </div>

        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>

    </div>
  );
}
