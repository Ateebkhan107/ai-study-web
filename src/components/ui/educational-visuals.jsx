const visualBaseClass = "h-full w-full text-brand";

export function AtomVisual({ className = visualBaseClass, title = "Atom diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <circle cx="80" cy="80" r="10" fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeWidth="6" opacity="0.76">
        <ellipse cx="80" cy="80" rx="58" ry="20" />
        <ellipse cx="80" cy="80" rx="58" ry="20" transform="rotate(60 80 80)" />
        <ellipse cx="80" cy="80" rx="58" ry="20" transform="rotate(120 80 80)" />
      </g>
      <g fill="currentColor">
        <circle cx="133" cy="80" r="5" />
        <circle cx="54" cy="33" r="5" />
        <circle cx="54" cy="127" r="5" />
      </g>
    </svg>
  );
}

export function PendulumVisual({ className = visualBaseClass, title = "Pendulum diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M34 28h92" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M80 32 115 116" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.72" />
      <path d="M80 32 62 124" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.28" />
      <circle cx="115" cy="116" r="16" fill="currentColor" />
      <path d="M47 126c20 14 48 16 72 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.38" />
    </svg>
  );
}

export function CircuitVisual({ className = visualBaseClass, title = "Electric circuit diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M34 48h92v64H34z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <path d="M58 48v-14M72 48V28M96 112v14M110 112v20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M36 80h28m32 0h28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="m67 68 26 12-26 12z" fill="currentColor" opacity="0.72" />
      <circle cx="126" cy="80" r="7" fill="currentColor" />
    </svg>
  );
}

export function WavesVisual({ className = visualBaseClass, title = "Wave diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M20 82c15-38 30-38 45 0s30 38 45 0 30-38 45 0" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 118h112" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.32" />
      <path d="M42 118V52M80 118V82M118 118V52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.28" />
    </svg>
  );
}

export function GeometryVisual({ className = visualBaseClass, title = "Geometry diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M35 122 80 34l45 88z" fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
      <circle cx="80" cy="86" r="34" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.42" />
      <path d="M35 122h90M80 34v88" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.34" />
    </svg>
  );
}

export function MoleculeVisual({ className = visualBaseClass, title = "Molecule diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M61 72 98 49M69 94l35 26M63 76l38 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.46" />
      <circle cx="54" cy="82" r="18" fill="currentColor" />
      <circle cx="111" cy="42" r="13" fill="currentColor" opacity="0.72" />
      <circle cx="116" cy="124" r="13" fill="currentColor" opacity="0.72" />
      <circle cx="112" cy="82" r="10" fill="currentColor" opacity="0.42" />
    </svg>
  );
}

export function RayOpticsVisual({ className = visualBaseClass, title = "Ray optics diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M80 28v104" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity="0.68" />
      <path d="M22 54h46M22 106h46M92 54h46M92 106h46" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.28" />
      <path d="M24 48c28 14 46 26 56 32M24 112c28-14 46-26 56-32M80 80c14-10 34-20 58-30M80 80c14 10 34 20 58 30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="80" cy="80" r="5" fill="currentColor" />
    </svg>
  );
}

export function GraphVisual({ className = visualBaseClass, title = "Graph diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M34 126V34M34 126h96" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M44 108c18-2 27-50 44-52 15-2 20 34 38 34" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M58 126V38M82 126V38M106 126V38M130 126V38M34 102h96M34 78h96M34 54h96" stroke="currentColor" strokeWidth="2" opacity="0.18" />
      <circle cx="88" cy="56" r="5" fill="currentColor" />
      <circle cx="126" cy="90" r="5" fill="currentColor" />
    </svg>
  );
}

export function VectorVisual({ className = visualBaseClass, title = "Vector diagram" }) {
  return (
    <svg className={className} viewBox="0 0 160 160" role="img" aria-label={title}>
      <path d="M36 124 116 44" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M91 43h25v25" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 124h74M36 124V50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.32" />
      <path d="M66 124c0-16-12-28-30-28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
    </svg>
  );
}

export const educationalVisuals = {
  atom: AtomVisual,
  circuit: CircuitVisual,
  geometry: GeometryVisual,
  molecule: MoleculeVisual,
  pendulum: PendulumVisual,
  graph: GraphVisual,
  optics: RayOpticsVisual,
  vector: VectorVisual,
  waves: WavesVisual,
};
