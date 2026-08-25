"use client";

function baseProps(className, title) {
  return {
    className,
    viewBox: "0 0 120 120",
    fill: "none",
    role: "img",
    "aria-label": title,
  };
}

export default function SubjectVisual({ subject = "Physics", className = "h-20 w-20" }) {
  const normalized = String(subject).toLowerCase();
  const stroke = "currentColor";

  if (normalized.includes("chem")) {
    return (
      <svg {...baseProps(className, "Minimal chemistry flask diagram")}>
        <path d="M49 18h22M55 18v28L32 88c-4 7 1 16 9 16h38c8 0 13-9 9-16L65 46V18" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 82h40M46 68c8 4 20 4 28 0" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <circle cx="46" cy="91" r="3" fill="currentColor" opacity="0.65" />
        <circle cx="70" cy="80" r="2.5" fill="currentColor" opacity="0.45" />
        <circle cx="80" cy="96" r="2" fill="currentColor" opacity="0.35" />
      </svg>
    );
  }

  if (normalized.includes("math")) {
    return (
      <svg {...baseProps(className, "Minimal mathematics geometry diagram")}>
        <path d="M22 92h76M32 84 60 28l28 56H32Z" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
        <path d="M60 28v56M42 64h36" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M24 40c15-12 28-12 40 0s24 12 32 0" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        <circle cx="60" cy="28" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (normalized.includes("bio")) {
    return (
      <svg {...baseProps(className, "Minimal biology helix diagram")}>
        <path d="M42 20c36 20 36 60 0 80M78 20c-36 20-36 60 0 80" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        <path d="M48 34h24M43 50h34M43 70h34M48 86h24" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }

  return (
    <svg {...baseProps(className, "Minimal physics atom and wave diagram")}>
      <circle cx="60" cy="60" r="5" fill="currentColor" />
      <ellipse cx="60" cy="60" rx="42" ry="16" stroke={stroke} strokeWidth="4" />
      <ellipse cx="60" cy="60" rx="42" ry="16" stroke={stroke} strokeWidth="4" transform="rotate(60 60 60)" />
      <ellipse cx="60" cy="60" rx="42" ry="16" stroke={stroke} strokeWidth="4" transform="rotate(120 60 60)" />
      <path d="M18 96c10-10 20-10 30 0s20 10 30 0 20-10 30 0" stroke={stroke} strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}
