import { createContext, useContext } from "react";

const DiagramSizeContext = createContext({ compact: false });

function Axis({ xLabel, yLabel }) {
  return (
    <>
      <line x1="34" y1="166" x2="188" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" />
      <line x1="34" y1="166" x2="34" y2="22" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" />
      <path d="M188 166 L180 161 L180 171 Z" className="fill-slate-500 dark:fill-stone-500" />
      <path d="M34 22 L29 30 L39 30 Z" className="fill-slate-500 dark:fill-stone-500" />
      <text x="196" y="170" className="fill-slate-600 text-[13px] font-bold dark:fill-stone-300">
        {xLabel}
      </text>
      <text x="26" y="18" className="fill-slate-600 text-[13px] font-bold dark:fill-stone-300">
        {yLabel}
      </text>
      <text x="24" y="180" className="fill-slate-400 text-[11px] dark:fill-stone-500">
        0
      </text>
    </>
  );
}

function DiagramFrame({ title, children }) {
  const { compact } = useContext(DiagramSizeContext);
  const frameClassName = compact
    ? "rounded-lg border border-slate-200/80 bg-white/50 p-2 dark:border-stone-800/80 dark:bg-stone-900/20 overflow-hidden"
    : "rounded-lg border border-slate-200/80 bg-white/50 p-2.5 sm:p-3 dark:border-stone-800/80 dark:bg-stone-900/20 overflow-hidden";
  const svgClassName = compact
    ? "h-auto w-full max-w-[210px] sm:max-w-[230px] [&_text]:text-[10px] sm:[&_text]:text-[10.5px]"
    : "h-auto w-full max-w-[260px] sm:max-w-[300px]";

  return (
    <div className={frameClassName}>
      {title && (
        <div className={`text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-stone-400 ${compact ? "mb-1.5" : "mb-2"}`}>
          {title}
        </div>
      )}
      <div className="flex justify-center overflow-hidden">
        <svg viewBox="0 0 220 190" role="img" aria-label={title || "diagram"} className={svgClassName}>
          {children}
        </svg>
      </div>
    </div>
  );
}

function PositionTimeDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="a > 0">
        <Axis xLabel="t" yLabel="x" />
        <path
          d="M44 154 C72 150 98 131 122 94 C140 66 159 45 180 36"
          fill="none"
          className="stroke-amber-500"
          strokeLinecap="round"
          strokeWidth="3.5"
        />
        <line x1="34" y1="120" x2="54" y2="120" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="3 3" />
        <text x="8" y="124" className="fill-slate-500 text-[11px] dark:fill-stone-400">
          xi
        </text>
      </DiagramFrame>
      <DiagramFrame title="a < 0">
        <Axis xLabel="t" yLabel="x" />
        <path
          d="M44 54 C72 58 98 77 122 114 C140 142 159 158 180 162"
          fill="none"
          className="stroke-amber-500"
          strokeLinecap="round"
          strokeWidth="3.5"
        />
        <line x1="34" y1="72" x2="54" y2="72" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="3 3" />
        <text x="8" y="76" className="fill-slate-500 text-[11px] dark:fill-stone-400">
          xi
        </text>
      </DiagramFrame>
    </div>
  );
}

function VelocityTimeDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="positive acceleration">
        <Axis xLabel="t" yLabel="v" />
        <line x1="44" y1="126" x2="180" y2="54" className="stroke-amber-500" strokeLinecap="round" strokeWidth="3.5" />
        <text x="16" y="130" className="fill-slate-500 text-[11px] dark:fill-stone-400">
          u
        </text>
        <text x="100" y="82" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">
          slope = a
        </text>
      </DiagramFrame>
      <DiagramFrame title="negative acceleration">
        <Axis xLabel="t" yLabel="v" />
        <line x1="44" y1="74" x2="180" y2="144" className="stroke-amber-500" strokeLinecap="round" strokeWidth="3.5" />
        <text x="16" y="78" className="fill-slate-500 text-[11px] dark:fill-stone-400">
          u
        </text>
        <text x="98" y="112" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">
          slope = a
        </text>
      </DiagramFrame>
    </div>
  );
}

function AccelerationTimeDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="positive acceleration">
        <Axis xLabel="t" yLabel="a" />
        <line x1="44" y1="78" x2="180" y2="78" className="stroke-amber-500" strokeLinecap="round" strokeWidth="3.5" />
        <text x="17" y="82" className="fill-slate-500 text-[11px] dark:fill-stone-400">
          a
        </text>
      </DiagramFrame>
      <DiagramFrame title="negative acceleration">
        <Axis xLabel="t" yLabel="a" />
        <line x1="44" y1="140" x2="180" y2="140" className="stroke-amber-500" strokeLinecap="round" strokeWidth="3.5" />
        <text x="17" y="144" className="fill-slate-500 text-[11px] dark:fill-stone-400">
          a
        </text>
      </DiagramFrame>
    </div>
  );
}

function Arrow({ x1, y1, x2, y2, label, labelX, labelY, dashed = false }) {
  return (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="stroke-amber-500"
        strokeLinecap="round"
        strokeWidth="3"
        strokeDasharray={dashed ? "5 5" : undefined}
        markerEnd="url(#arrow)"
      />
      {label && (
        <text x={labelX ?? x2 + 4} y={labelY ?? y2 - 4} className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">
          {label}
        </text>
      )}
    </>
  );
}

function DiagramDefs() {
  return (
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500" />
      </marker>
    </defs>
  );
}

function ProjectileInclineDiagram() {
  return (
    <DiagramFrame title="projection on inclined plane">
      <DiagramDefs />
      <line x1="34" y1="150" x2="180" y2="82" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="78" y1="130" x2="176" y2="130" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.8" />
      <line x1="78" y1="130" x2="56" y2="82" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.8" />
      <path d="M80 128 C96 101 122 91 156 78" fill="none" className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" />
      <Arrow x1="78" y1="130" x2="101" y2="88" label="u" labelX="107" labelY="91" />
      <path d="M89 125 A25 25 0 0 1 101 107" fill="none" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="1.6" />
      <text x="101" y="119" className="fill-slate-700 text-[11px] dark:fill-stone-200">alpha</text>
      <path d="M118 130 A43 43 0 0 0 156 101" fill="none" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="1.6" />
      <text x="142" y="120" className="fill-slate-700 text-[11px] dark:fill-stone-200">beta</text>
      <Arrow x1="68" y1="135" x2="40" y2="148" label="x" labelX="36" labelY="164" />
      <Arrow x1="70" y1="126" x2="54" y2="90" label="y" labelX="47" labelY="82" />
    </DiagramFrame>
  );
}

function RiverBase({ shortestPath = false }) {
  return (
    <DiagramFrame title={shortestPath ? "river crossing: shortest path" : "river crossing: shortest time"}>
      <DiagramDefs />
      <line x1="34" y1="55" x2="188" y2="55" className="stroke-slate-600 dark:stroke-stone-400" strokeWidth="2" />
      <line x1="34" y1="150" x2="188" y2="150" className="stroke-slate-600 dark:stroke-stone-400" strokeWidth="2" />
      <line x1="80" y1="150" x2="80" y2="55" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" strokeWidth="2" />
      <Arrow x1="34" y1="150" x2="194" y2="150" label="x" labelX="199" labelY="154" />
      <Arrow x1="80" y1="150" x2="80" y2="34" label="y" labelX="84" labelY="36" />
      <line x1="58" y1="150" x2="58" y2="55" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="46" y="105" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">d</text>
      {shortestPath ? (
        <>
          <path d="M80 150 L80 55" className="stroke-amber-500" strokeWidth="3" strokeDasharray="6 5" />
          <Arrow x1="80" y1="145" x2="107" y2="118" label="v_mR" labelX="105" labelY="132" />
          <Arrow x1="80" y1="145" x2="112" y2="145" label="v_R" labelX="114" labelY="142" />
          <path d="M90 143 A23 23 0 0 1 102 126" fill="none" className="stroke-slate-500 dark:stroke-stone-400" />
          <text x="95" y="151" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
          <text x="72" y="167" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">A</text>
          <text x="84" y="53" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">B</text>
        </>
      ) : (
        <>
          <path d="M80 150 L155 55" className="stroke-amber-500" strokeWidth="3" strokeDasharray="6 5" />
          <Arrow x1="80" y1="145" x2="80" y2="112" label="v_mR" labelX="50" labelY="126" />
          <Arrow x1="80" y1="145" x2="111" y2="145" label="v_R" labelX="113" labelY="142" />
          <Arrow x1="80" y1="145" x2="112" y2="104" label="v_m" labelX="115" labelY="108" />
          <text x="72" y="167" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">A</text>
          <text x="85" y="52" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">B</text>
          <text x="158" y="53" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">C</text>
          <text x="116" y="49" className="fill-slate-700 text-[12px] dark:fill-stone-200">drift = x</text>
        </>
      )}
    </DiagramFrame>
  );
}

function PulleySystemDiagram() {
  return (
    <DiagramFrame title="pulley relation">
      <DiagramDefs />
      <line x1="55" y1="28" x2="155" y2="28" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
      <circle cx="88" cy="58" r="18" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="112" cy="112" r="18" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <path d="M70 58 V96 H94 V112" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <path d="M106 58 V94 M130 112 V154" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <rect x="54" y="94" width="22" height="22" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="98" y="148" width="22" height="22" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="128" y="150" width="22" height="22" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <Arrow x1="48" y1="130" x2="48" y2="158" label="V1" labelX="30" labelY="149" />
      <Arrow x1="150" y1="126" x2="150" y2="160" label="V2" labelX="154" labelY="150" />
      <Arrow x1="145" y1="92" x2="145" y2="126" label="Vp" labelX="150" labelY="112" />
    </DiagramFrame>
  );
}

function AtwoodMachineDiagram() {
  return (
    <DiagramFrame title="atwood machine">
      <DiagramDefs />
      <line x1="52" y1="30" x2="168" y2="30" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
      <circle cx="110" cy="72" r="28" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="110" cy="72" r="3" className="fill-slate-700 dark:fill-stone-300" />
      <path d="M82 72 V136 M138 72 V154" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <rect x="68" y="136" width="28" height="28" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="124" y="154" width="28" height="28" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <text x="72" y="155" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">m1</text>
      <text x="128" y="173" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">m2</text>
      <Arrow x1="58" y1="160" x2="58" y2="125" label="a" labelX="44" labelY="142" />
      <Arrow x1="164" y1="135" x2="164" y2="170" label="a" labelX="170" labelY="154" />
      <Arrow x1="84" y1="118" x2="84" y2="89" label="T" labelX="68" labelY="102" />
      <Arrow x1="136" y1="130" x2="136" y2="100" label="T" labelX="141" labelY="116" />
    </DiagramFrame>
  );
}

function WedgeConstraintDiagram() {
  return (
    <DiagramFrame title="wedge constraint">
      <DiagramDefs />
      <path d="M40 154 H166 L166 56 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
      <g transform="translate(88 106) rotate(-42)">
        <rect x="-18" y="-11" width="36" height="22" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      </g>
      <Arrow x1="166" y1="124" x2="202" y2="124" label="V1" labelX="205" labelY="128" />
      <Arrow x1="88" y1="106" x2="62" y2="126" label="V2" labelX="50" labelY="130" />
      <Arrow x1="88" y1="106" x2="112" y2="132" label="V3" labelX="114" labelY="136" />
      <text x="72" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
      <text x="72" y="174" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">V3 = V1 sin theta</text>
    </DiagramFrame>
  );
}

function FrictionGraphDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="block under applied force">
        <DiagramDefs />
        <line x1="28" y1="146" x2="176" y2="146" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
        <rect x="78" y="100" width="48" height="46" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2.5" />
        <text x="96" y="128" className="fill-slate-700 text-[14px] font-bold dark:fill-stone-200">M</text>
        <Arrow x1="126" y1="123" x2="170" y2="123" label="F" labelX="175" labelY="127" />
        <Arrow x1="78" y1="134" x2="40" y2="134" label="f" labelX="26" labelY="138" />
        <text x="74" y="164" className="fill-slate-700 text-[12px] dark:fill-stone-200">mu_s, mu_k</text>
      </DiagramFrame>
      <DiagramFrame title="friction vs applied force">
        <DiagramDefs />
        <Axis xLabel="" yLabel="" />
        <path d="M34 166 L102 82 Q116 62 132 84 L178 84" fill="none" className="stroke-amber-500" strokeWidth="3.5" />
        <line x1="104" y1="166" x2="104" y2="82" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <line x1="146" y1="166" x2="146" y2="84" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <text x="7" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200" transform="rotate(-90 7 78)">Friction</text>
        <text x="112" y="181" className="fill-slate-700 text-[12px] dark:fill-stone-200">Applied Force</text>
        <text x="57" y="126" className="fill-slate-700 text-[12px] dark:fill-stone-200" transform="rotate(-43 57 126)">static</text>
        <text x="108" y="103" className="fill-slate-700 text-[12px] dark:fill-stone-200">mu_s N</text>
        <text x="149" y="103" className="fill-slate-700 text-[12px] dark:fill-stone-200">mu_k N</text>
      </DiagramFrame>
    </div>
  );
}

function CircularAngularVelocityDiagram() {
  return (
    <DiagramFrame title="angular displacement">
      <DiagramDefs />
      <circle cx="110" cy="96" r="50" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="110" cy="96" r="3" className="fill-slate-700 dark:fill-stone-300" />
      <line x1="110" y1="96" x2="160" y2="96" className="stroke-slate-600 dark:stroke-stone-400" strokeWidth="2" />
      <line x1="110" y1="96" x2="151" y2="68" className="stroke-slate-600 dark:stroke-stone-400" strokeWidth="2" />
      <path d="M139 96 A29 29 0 0 0 134 80" fill="none" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
      <Arrow x1="110" y1="96" x2="110" y2="36" label="omega" labelX="116" labelY="44" />
      <text x="132" y="88" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">theta</text>
    </DiagramFrame>
  );
}

function CircularAccelerationDiagram() {
  return (
    <DiagramFrame title="acceleration components">
      <DiagramDefs />
      <circle cx="94" cy="104" r="48" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="94" cy="104" r="3" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="142" cy="104" r="4" className="fill-amber-500" />
      <line x1="94" y1="104" x2="142" y2="104" className="stroke-slate-600 dark:stroke-stone-400" strokeWidth="2" />
      <Arrow x1="142" y1="104" x2="142" y2="58" label="v, at" labelX="148" labelY="68" />
      <Arrow x1="142" y1="104" x2="103" y2="104" label="ar" labelX="112" labelY="96" />
      <Arrow x1="142" y1="104" x2="128" y2="61" label="a" labelX="119" labelY="56" dashed />
      <text x="84" y="121" className="fill-slate-700 text-[12px] dark:fill-stone-200">O</text>
      <text x="146" y="121" className="fill-slate-700 text-[12px] dark:fill-stone-200">P</text>
    </DiagramFrame>
  );
}

function BridgeReactionsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="concave bridge">
        <DiagramDefs />
        <path d="M35 102 Q110 174 185 102" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="4" />
        <rect x="62" y="107" width="36" height="18" rx="3" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" transform="rotate(26 80 116)" />
        <Arrow x1="80" y1="116" x2="97" y2="82" label="N" labelX="100" labelY="87" />
        <Arrow x1="80" y1="116" x2="80" y2="153" label="mg" labelX="58" labelY="147" />
        <Arrow x1="97" y1="128" x2="132" y2="140" label="v" labelX="137" labelY="145" />
        <line x1="110" y1="70" x2="110" y2="148" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <text x="117" y="74" className="fill-slate-700 text-[12px] dark:fill-stone-200">O</text>
      </DiagramFrame>
      <DiagramFrame title="convex bridge">
        <DiagramDefs />
        <path d="M35 145 Q110 74 185 145" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="4" />
        <rect x="61" y="111" width="36" height="18" rx="3" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" transform="rotate(-25 79 120)" />
        <Arrow x1="80" y1="118" x2="64" y2="84" label="N" labelX="52" labelY="88" />
        <Arrow x1="80" y1="118" x2="80" y2="154" label="mg" labelX="58" labelY="150" />
        <Arrow x1="98" y1="111" x2="134" y2="100" label="v" labelX="139" labelY="103" />
        <line x1="112" y1="121" x2="112" y2="176" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <text x="118" y="176" className="fill-slate-700 text-[12px] dark:fill-stone-200">O</text>
      </DiagramFrame>
    </div>
  );
}

function BankedRoadDiagram() {
  return (
    <DiagramFrame title="banked road">
      <DiagramDefs />
      <line x1="42" y1="132" x2="178" y2="88" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="4" />
      <line x1="48" y1="142" x2="180" y2="142" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="1.5" />
      <rect x="88" y="93" width="42" height="20" rx="3" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" transform="rotate(-18 109 103)" />
      <Arrow x1="108" y1="103" x2="92" y2="59" label="N" labelX="80" labelY="64" />
      <Arrow x1="108" y1="103" x2="108" y2="148" label="mg" labelX="113" labelY="139" />
      <Arrow x1="129" y1="98" x2="168" y2="86" label="v" labelX="172" labelY="89" />
      <path d="M76 142 A36 36 0 0 1 109 122" fill="none" className="stroke-amber-500" strokeWidth="2.5" />
      <text x="88" y="139" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">theta</text>
    </DiagramFrame>
  );
}

function VerticalLoopDiagram() {
  return (
    <DiagramFrame title="vertical loop">
      <DiagramDefs />
      <circle cx="104" cy="93" r="50" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="104" cy="93" r="3" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="104" cy="143" r="4" className="fill-amber-500" />
      <circle cx="154" cy="93" r="4" className="fill-amber-500" />
      <circle cx="104" cy="43" r="4" className="fill-amber-500" />
      <text x="100" y="37" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">C</text>
      <text x="158" y="96" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">B</text>
      <text x="101" y="160" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">A</text>
      <line x1="104" y1="93" x2="137" y2="130" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" />
      <Arrow x1="137" y1="130" x2="171" y2="130" label="N" labelX="175" labelY="134" />
      <Arrow x1="137" y1="130" x2="137" y2="92" label="v" labelX="142" labelY="106" />
      <text x="78" y="96" className="fill-slate-700 text-[12px] dark:fill-stone-200">O</text>
      <text x="72" y="118" className="fill-slate-700 text-[12px] dark:fill-stone-200">L</text>
    </DiagramFrame>
  );
}

function ConicalPendulumDiagram() {
  return (
    <DiagramFrame title="conical pendulum">
      <DiagramDefs />
      <line x1="110" y1="28" x2="110" y2="62" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="76" y1="30" x2="144" y2="30" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
      <line x1="110" y1="62" x2="82" y2="126" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="110" y1="62" x2="110" y2="126" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <ellipse cx="110" cy="126" rx="50" ry="14" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <circle cx="82" cy="126" r="5" className="fill-amber-500" />
      <Arrow x1="82" y1="126" x2="82" y2="166" label="mg" labelX="62" labelY="158" />
      <Arrow x1="82" y1="126" x2="102" y2="82" label="T" labelX="88" labelY="94" />
      <line x1="82" y1="126" x2="110" y2="126" className="stroke-slate-600 dark:stroke-stone-400" strokeDasharray="4 4" />
      <text x="94" y="121" className="fill-slate-700 text-[12px] dark:fill-stone-200">r</text>
      <text x="117" y="96" className="fill-slate-700 text-[12px] dark:fill-stone-200">h</text>
      <text x="91" y="67" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
    </DiagramFrame>
  );
}

function ComTwoMassesDiagram() {
  return (
    <DiagramFrame title="two point masses">
      <DiagramDefs />
      <line x1="38" y1="100" x2="182" y2="100" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="46" cy="100" r="5" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="174" cy="100" r="5" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="92" cy="100" r="5" className="fill-amber-500" />
      <line x1="46" y1="78" x2="92" y2="78" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <line x1="92" y1="78" x2="174" y2="78" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <line x1="46" y1="128" x2="174" y2="128" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="34" y="116" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">m1</text>
      <text x="164" y="116" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">m2</text>
      <text x="80" y="116" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">c.m.</text>
      <text x="62" y="73" className="fill-slate-700 text-[12px] dark:fill-stone-200">r1</text>
      <text x="128" y="73" className="fill-slate-700 text-[12px] dark:fill-stone-200">r2</text>
      <text x="108" y="145" className="fill-slate-700 text-[12px] dark:fill-stone-200">L</text>
    </DiagramFrame>
  );
}

function ComPlatesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="rectangular plate">
        <rect x="58" y="52" width="104" height="94" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
        <line x1="58" y1="52" x2="162" y2="146" className="stroke-slate-500 dark:stroke-stone-500" />
        <line x1="162" y1="52" x2="58" y2="146" className="stroke-slate-500 dark:stroke-stone-500" />
        <circle cx="110" cy="99" r="4" className="fill-amber-500" />
        <text x="116" y="104" className="fill-slate-700 text-[12px] dark:fill-stone-200">c.m.</text>
        <text x="104" y="42" className="fill-slate-700 text-[12px] dark:fill-stone-200">b</text>
        <text x="169" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">L</text>
      </DiagramFrame>
      <DiagramFrame title="triangular plate">
        <path d="M110 42 L54 150 H166 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
        <line x1="110" y1="42" x2="110" y2="150" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <line x1="54" y1="150" x2="166" y2="150" className="stroke-slate-500 dark:stroke-stone-500" />
        <circle cx="110" cy="114" r="4" className="fill-amber-500" />
        <text x="116" y="118" className="fill-slate-700 text-[12px] dark:fill-stone-200">c.m.</text>
        <text x="119" y="96" className="fill-slate-700 text-[12px] dark:fill-stone-200">h</text>
        <text x="78" y="136" className="fill-slate-700 text-[12px] dark:fill-stone-200">yc</text>
      </DiagramFrame>
    </div>
  );
}

function ComSemicirclesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="semi-circular ring">
        <path d="M58 132 A52 52 0 0 1 162 132" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
        <line x1="58" y1="132" x2="162" y2="132" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" />
        <line x1="110" y1="52" x2="110" y2="154" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" />
        <circle cx="110" cy="99" r="4" className="fill-amber-500" />
        <text x="117" y="103" className="fill-slate-700 text-[12px] dark:fill-stone-200">c.m.</text>
      </DiagramFrame>
      <DiagramFrame title="semi-circular disc">
        <path d="M58 132 A52 52 0 0 1 162 132 L58 132 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
        <line x1="110" y1="52" x2="110" y2="154" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" />
        <circle cx="110" cy="88" r="4" className="fill-amber-500" />
        <text x="117" y="92" className="fill-slate-700 text-[12px] dark:fill-stone-200">c.m.</text>
      </DiagramFrame>
    </div>
  );
}

function ComCurvedBodiesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="hemisphere">
        <path d="M58 126 A52 52 0 0 1 162 126" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
        <ellipse cx="110" cy="126" rx="52" ry="13" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="110" y1="54" x2="110" y2="150" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" />
        <circle cx="110" cy="102" r="4" className="fill-amber-500" />
        <text x="116" y="106" className="fill-slate-700 text-[12px] dark:fill-stone-200">c.m.</text>
      </DiagramFrame>
      <DiagramFrame title="circular cone">
        <path d="M110 38 L62 148 Q110 162 158 148 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
        <ellipse cx="110" cy="148" rx="48" ry="13" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="110" y1="38" x2="110" y2="160" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" />
        <circle cx="110" cy="120" r="4" className="fill-amber-500" />
        <text x="116" y="124" className="fill-slate-700 text-[12px] dark:fill-stone-200">c.m.</text>
      </DiagramFrame>
    </div>
  );
}

function RigidBodyConstraintDiagram() {
  return (
    <DiagramFrame title="rigid body velocities">
      <DiagramDefs />
      <line x1="80" y1="54" x2="128" y2="142" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
      <circle cx="80" cy="54" r="5" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="128" cy="142" r="5" className="fill-slate-700 dark:fill-stone-300" />
      <Arrow x1="80" y1="54" x2="128" y2="46" label="VA" labelX="132" labelY="50" />
      <Arrow x1="128" y1="142" x2="80" y2="156" label="VB" labelX="59" labelY="162" />
      <Arrow x1="128" y1="142" x2="100" y2="167" label="VBA" labelX="103" labelY="177" />
      <text x="66" y="48" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">A</text>
      <text x="134" y="146" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">B</text>
      <text x="94" y="91" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta1</text>
      <text x="108" y="126" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta2</text>
    </DiagramFrame>
  );
}

function RigidMotionTypesDiagram() {
  return (
    <DiagramFrame title="types of motion">
      <line x1="110" y1="40" x2="110" y2="75" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="42" y1="75" x2="178" y2="75" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="42" y1="75" x2="42" y2="106" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="110" y1="75" x2="110" y2="106" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="178" y1="75" x2="178" y2="106" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <text x="66" y="35" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">Rigid body motion</text>
      <text x="20" y="126" className="fill-slate-700 text-[11px] dark:fill-stone-200">Pure</text>
      <text x="12" y="140" className="fill-slate-700 text-[11px] dark:fill-stone-200">translation</text>
      <text x="87" y="132" className="fill-slate-700 text-[11px] dark:fill-stone-200">Pure</text>
      <text x="82" y="146" className="fill-slate-700 text-[11px] dark:fill-stone-200">rotation</text>
      <text x="148" y="126" className="fill-slate-700 text-[11px] dark:fill-stone-200">Combined</text>
      <text x="142" y="140" className="fill-slate-700 text-[11px] dark:fill-stone-200">motion</text>
    </DiagramFrame>
  );
}

function MoiSpheresRingsDiagram() {
  return (
    <DiagramFrame title="sphere and ring axes">
      <circle cx="58" cy="82" r="30" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="58" y1="36" x2="58" y2="128" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <ellipse cx="154" cy="91" rx="44" ry="12" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="154" y1="38" x2="154" y2="144" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <text x="31" y="143" className="fill-slate-700 text-[12px] dark:fill-stone-200">sphere</text>
      <text x="142" y="143" className="fill-slate-700 text-[12px] dark:fill-stone-200">ring</text>
    </DiagramFrame>
  );
}

function MoiDiscsCylindersDiagram() {
  return (
    <DiagramFrame title="disc and cylinder axes">
      <ellipse cx="66" cy="80" rx="43" ry="12" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="66" y1="32" x2="66" y2="136" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <ellipse cx="154" cy="62" rx="30" ry="10" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="124" y1="62" x2="124" y2="132" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="184" y1="62" x2="184" y2="132" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <ellipse cx="154" cy="132" rx="30" ry="10" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="154" y1="28" x2="154" y2="160" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" />
      <text x="54" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">disc</text>
      <text x="132" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">cylinder</text>
    </DiagramFrame>
  );
}

function MoiRodsPlatesDiagram() {
  return (
    <DiagramFrame title="rods and plates">
      <line x1="44" y1="52" x2="44" y2="126" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="44" y="86" width="76" height="8" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="1.5" />
      <line x1="134" y1="52" x2="134" y2="126" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="98" y="86" width="72" height="8" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="1.5" />
      <rect x="65" y="133" width="50" height="32" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="90" y1="121" x2="90" y2="176" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <path d="M138 132 L180 132 L190 160 L148 160 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="164" y1="118" x2="164" y2="174" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <text x="33" y="144" className="fill-slate-700 text-[11px] dark:fill-stone-200">rod</text>
      <text x="67" y="181" className="fill-slate-700 text-[11px] dark:fill-stone-200">plate</text>
      <text x="144" y="181" className="fill-slate-700 text-[11px] dark:fill-stone-200">plate</text>
    </DiagramFrame>
  );
}

function TorqueLineActionDiagram() {
  return (
    <DiagramFrame title="line of action">
      <DiagramDefs />
      <path d="M44 134 C30 70 60 38 116 45 C176 34 200 82 176 134 C134 160 80 160 44 134 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="82" cy="122" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="134" cy="92" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <Arrow x1="82" y1="122" x2="134" y2="92" label="r" labelX="105" labelY="100" />
      <Arrow x1="134" y1="92" x2="180" y2="72" label="F" labelX="184" labelY="75" />
      <line x1="88" y1="82" x2="170" y2="48" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="72" y="137" className="fill-slate-700 text-[12px] dark:fill-stone-200">Q</text>
      <text x="138" y="87" className="fill-slate-700 text-[12px] dark:fill-stone-200">P</text>
      <text x="92" y="76" className="fill-slate-700 text-[12px] dark:fill-stone-200">line of action</text>
    </DiagramFrame>
  );
}

function AngularMomentumParticleDiagram() {
  return (
    <DiagramFrame title="particle angular momentum">
      <DiagramDefs />
      <line x1="38" y1="148" x2="188" y2="148" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="72" y1="168" x2="72" y2="36" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <Arrow x1="72" y1="148" x2="144" y2="72" label="r" labelX="106" labelY="98" />
      <Arrow x1="144" y1="72" x2="186" y2="72" label="P" labelX="190" labelY="76" />
      <Arrow x1="144" y1="72" x2="170" y2="48" label="P cos theta" labelX="118" labelY="42" />
      <Arrow x1="144" y1="72" x2="168" y2="98" label="P sin theta" labelX="151" labelY="114" />
      <line x1="72" y1="72" x2="144" y2="72" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="57" y="164" className="fill-slate-700 text-[12px] dark:fill-stone-200">O</text>
      <text x="154" y="64" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
      <text x="50" y="110" className="fill-slate-700 text-[12px] dark:fill-stone-200">r_perp</text>
    </DiagramFrame>
  );
}

function CombinedRigidMotionDiagram() {
  return (
    <DiagramFrame title="combined rigid motion">
      <DiagramDefs />
      <path d="M42 128 C32 74 68 44 118 52 C178 40 198 84 174 132 C130 158 72 154 42 128 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="77" cy="118" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="135" cy="80" r="4" className="fill-amber-500" />
      <line x1="77" y1="118" x2="135" y2="80" className="stroke-slate-600 dark:stroke-stone-400" strokeWidth="2" strokeDasharray="4 4" />
      <Arrow x1="77" y1="118" x2="47" y2="101" label="omega" labelX="32" labelY="98" />
      <Arrow x1="135" y1="80" x2="184" y2="80" label="VQ" labelX="188" labelY="84" />
      <Arrow x1="135" y1="80" x2="154" y2="112" label="omega r" labelX="151" labelY="126" />
      <text x="68" y="134" className="fill-slate-700 text-[12px] dark:fill-stone-200">Q</text>
      <text x="139" y="75" className="fill-slate-700 text-[12px] dark:fill-stone-200">P</text>
      <text x="104" y="96" className="fill-slate-700 text-[12px] dark:fill-stone-200">r</text>
    </DiagramFrame>
  );
}

function SpringMassSystemsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="single spring mass">
        <line x1="28" y1="138" x2="180" y2="138" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="52" y1="82" x2="52" y2="138" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
        <path d="M52 106 C61 92 67 120 76 106 C85 92 91 120 100 106 C109 92 115 120 124 106" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
        <rect x="124" y="91" width="36" height="30" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
        <text x="139" y="111" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">m</text>
        <text x="83" y="90" className="fill-slate-700 text-[12px] dark:fill-stone-200">k</text>
      </DiagramFrame>
      <DiagramFrame title="two masses">
        <line x1="32" y1="138" x2="188" y2="138" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <rect x="40" y="100" width="32" height="38" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
        <rect x="148" y="100" width="32" height="38" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
        <path d="M72 117 C81 102 87 132 96 117 C105 102 111 132 120 117 C129 102 135 132 148 117" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
        <text x="45" y="123" className="fill-slate-700 text-[12px] dark:fill-stone-200">m1</text>
        <text x="153" y="123" className="fill-slate-700 text-[12px] dark:fill-stone-200">m2</text>
        <text x="108" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">k</text>
      </DiagramFrame>
    </div>
  );
}

function ShmSuperpositionDiagram() {
  return (
    <DiagramFrame title="phasor triangle">
      <DiagramDefs />
      <Arrow x1="42" y1="144" x2="154" y2="144" label="A1" labelX="160" labelY="148" />
      <Arrow x1="42" y1="144" x2="132" y2="102" label="A" labelX="137" labelY="106" />
      <Arrow x1="42" y1="144" x2="116" y2="60" label="A2" labelX="121" labelY="64" />
      <path d="M68 144 A27 27 0 0 0 91 132" fill="none" className="stroke-slate-500 dark:stroke-stone-400" />
      <path d="M88 122 A38 38 0 0 0 98 102" fill="none" className="stroke-slate-500 dark:stroke-stone-400" />
      <text x="74" y="137" className="fill-slate-700 text-[12px] dark:fill-stone-200">phi</text>
      <text x="101" y="117" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
    </DiagramFrame>
  );
}

function ProgressiveSineWaveDiagram() {
  return (
    <DiagramFrame title="progressive sine wave">
      <DiagramDefs />
      <Axis xLabel="x" yLabel="y" />
      <path d="M34 104 C55 54 76 54 97 104 C118 154 139 154 160 104 C171 78 181 66 190 70" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <line x1="47" y1="104" x2="126" y2="104" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="83" y="98" className="fill-slate-700 text-[12px] dark:fill-stone-200">lambda</text>
    </DiagramFrame>
  );
}

function StandingWaveDiagram() {
  return (
    <DiagramFrame title="standing wave">
      <line x1="32" y1="96" x2="188" y2="96" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.5" />
      <path d="M32 96 C58 52 84 52 110 96 C136 140 162 140 188 96" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <path d="M32 96 C58 140 84 140 110 96 C136 52 162 52 188 96" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" strokeDasharray="5 5" />
      {[32, 110, 188].map((x) => (
        <circle key={x} cx={x} cy="96" r="4" className="fill-slate-700 dark:fill-stone-300" />
      ))}
      <text x="22" y="116" className="fill-slate-700 text-[12px] dark:fill-stone-200">node</text>
      <text x="57" y="48" className="fill-slate-700 text-[12px] dark:fill-stone-200">antinode</text>
    </DiagramFrame>
  );
}

function StringModesDiagram() {
  const wave = (offsetY, loops, free = false) => {
    const d = loops === 1
      ? `M42 ${offsetY} C82 ${offsetY - 35} 122 ${offsetY - 35} 162 ${offsetY}`
      : loops === 2
        ? `M42 ${offsetY} C62 ${offsetY - 28} 82 ${offsetY - 28} 102 ${offsetY} C122 ${offsetY + 28} 142 ${offsetY + 28} 162 ${offsetY}`
        : `M42 ${offsetY} C62 ${offsetY - 24} 82 ${offsetY - 24} 102 ${offsetY} C122 ${offsetY + 24} 142 ${offsetY + 24} 162 ${offsetY}`;
    return (
      <>
        <line x1="42" y1={offsetY} x2="162" y2={offsetY} className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <path d={d} fill="none" className="stroke-amber-500" strokeWidth="2.5" />
        <line x1="38" y1={offsetY - 32} x2="38" y2={offsetY + 32} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />
        {!free && <line x1="166" y1={offsetY - 32} x2="166" y2={offsetY + 32} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="3" />}
      </>
    );
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="fixed at both ends">
        {wave(62, 1)}
        {wave(126, 2)}
        <text x="78" y="106" className="fill-slate-700 text-[12px] dark:fill-stone-200">n = 1, 2, ...</text>
      </DiagramFrame>
      <DiagramFrame title="free at one end">
        {wave(70, 1, true)}
        {wave(132, 2, true)}
        <text x="70" y="110" className="fill-slate-700 text-[12px] dark:fill-stone-200">open end antinode</text>
      </DiagramFrame>
    </div>
  );
}

function ResistorSymbol({ x, y, width = 52 }) {
  const step = width / 6;
  return (
    <polyline
      points={`${x},${y} ${x + step},${y - 8} ${x + 2 * step},${y + 8} ${x + 3 * step},${y - 8} ${x + 4 * step},${y + 8} ${x + 5 * step},${y - 8} ${x + 6 * step},${y}`}
      fill="none"
      className="stroke-slate-700 dark:stroke-stone-300"
      strokeWidth="2"
    />
  );
}

function CapacitorSymbol({ x, y, vertical = true }) {
  return vertical ? (
    <>
      <line x1={x - 10} y1={y - 16} x2={x - 10} y2={y + 16} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1={x + 10} y1={y - 16} x2={x + 10} y2={y + 16} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
    </>
  ) : (
    <>
      <line x1={x - 16} y1={y - 10} x2={x + 16} y2={y - 10} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1={x - 16} y1={y + 10} x2={x + 16} y2={y + 10} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
    </>
  );
}

function HeatEngineDiagram() {
  return (
    <DiagramFrame title="heat engine">
      <DiagramDefs />
      <rect x="56" y="22" width="108" height="28" className="fill-slate-200 stroke-slate-700 dark:fill-stone-800 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="56" y="140" width="108" height="28" className="fill-slate-200 stroke-slate-700 dark:fill-stone-800 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="83" y="70" width="54" height="48" rx="8" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <Arrow x1="110" y1="50" x2="110" y2="70" label="QH" labelX="118" labelY="64" />
      <Arrow x1="110" y1="118" x2="110" y2="140" label="QL" labelX="118" labelY="134" />
      <Arrow x1="137" y1="94" x2="184" y2="94" label="W" labelX="188" labelY="98" />
      <text x="98" y="41" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">TH</text>
      <text x="99" y="158" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">TL</text>
    </DiagramFrame>
  );
}

function CarnotPvDiagram() {
  return (
    <DiagramFrame title="Carnot P-V graph">
      <DiagramDefs />
      <Axis xLabel="V" yLabel="P" />
      <path d="M72 58 C103 75 130 72 158 82" fill="none" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
      <path d="M158 82 C151 108 150 127 166 145" fill="none" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
      <path d="M166 145 C128 132 96 135 72 118" fill="none" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
      <path d="M72 118 C82 96 84 77 72 58" fill="none" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
      <text x="62" y="54" className="fill-slate-700 text-[12px] dark:fill-stone-200">A</text>
      <text x="162" y="82" className="fill-slate-700 text-[12px] dark:fill-stone-200">B</text>
      <text x="170" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">C</text>
      <text x="58" y="122" className="fill-slate-700 text-[12px] dark:fill-stone-200">D</text>
      <text x="105" y="68" className="fill-slate-700 text-[12px] dark:fill-stone-200">Q1</text>
      <text x="124" y="148" className="fill-slate-700 text-[12px] dark:fill-stone-200">Q2</text>
    </DiagramFrame>
  );
}

function RefrigeratorDiagram() {
  return (
    <DiagramFrame title="refrigerator">
      <DiagramDefs />
      <rect x="18" y="74" width="58" height="34" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <circle cx="112" cy="91" r="24" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" strokeDasharray="5 4" />
      <rect x="148" y="74" width="58" height="34" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <Arrow x1="76" y1="91" x2="88" y2="91" label="Q2" labelX="78" labelY="78" />
      <Arrow x1="136" y1="91" x2="148" y2="91" label="Q1" labelX="137" labelY="78" />
      <Arrow x1="112" y1="154" x2="112" y2="116" label="W" labelX="118" labelY="138" />
      <text x="27" y="95" className="fill-slate-700 text-[12px] dark:fill-stone-200">Hot T2</text>
      <text x="157" y="95" className="fill-slate-700 text-[12px] dark:fill-stone-200">Hot T1</text>
      <text x="84" y="37" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">Refrigerator</text>
    </DiagramFrame>
  );
}

function ResistorCombinationsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="series">
        <line x1="26" y1="96" x2="54" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <ResistorSymbol x={54} y={96} />
        <ResistorSymbol x={112} y={96} />
        <line x1="164" y1="96" x2="194" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <text x="72" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200">R1</text>
        <text x="130" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200">R2</text>
      </DiagramFrame>
      <DiagramFrame title="parallel">
        <line x1="48" y1="54" x2="48" y2="140" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="172" y1="54" x2="172" y2="140" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        {[64, 96, 128].map((y, index) => (
          <g key={y}>
            <line x1="48" y1={y} x2="76" y2={y} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
            <ResistorSymbol x={76} y={y} />
            <line x1="128" y1={y} x2="172" y2={y} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
            <text x="93" y={y - 10} className="fill-slate-700 text-[11px] dark:fill-stone-200">R{index + 1}</text>
          </g>
        ))}
      </DiagramFrame>
    </div>
  );
}

function WheatstoneBridgeDiagram() {
  return (
    <DiagramFrame title="Wheatstone bridge">
      <circle cx="110" cy="38" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="110" cy="150" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="48" cy="94" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="172" cy="94" r="4" className="fill-slate-700 dark:fill-stone-300" />
      <line x1="48" y1="94" x2="110" y2="38" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="110" y1="38" x2="172" y2="94" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="48" y1="94" x2="110" y2="150" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="110" y1="150" x2="172" y2="94" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="110" y1="38" x2="110" y2="150" className="stroke-amber-500" strokeWidth="2.5" />
      <text x="82" y="65" className="fill-slate-700 text-[12px] dark:fill-stone-200">P</text>
      <text x="134" y="65" className="fill-slate-700 text-[12px] dark:fill-stone-200">Q</text>
      <text x="80" y="130" className="fill-slate-700 text-[12px] dark:fill-stone-200">R</text>
      <text x="134" y="130" className="fill-slate-700 text-[12px] dark:fill-stone-200">S</text>
      <text x="115" y="98" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">G</text>
    </DiagramFrame>
  );
}

function CellsGroupingDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="cells in series">
        <line x1="28" y1="96" x2="70" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        {[76, 108, 140].map((x) => <CapacitorSymbol key={x} x={x} y={96} vertical />)}
        <line x1="150" y1="96" x2="192" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <text x="76" y="72" className="fill-slate-700 text-[11px] dark:fill-stone-200">E1,r1</text>
        <text x="130" y="72" className="fill-slate-700 text-[11px] dark:fill-stone-200">En,rn</text>
      </DiagramFrame>
      <DiagramFrame title="cells in parallel">
        <line x1="54" y1="52" x2="54" y2="142" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="166" y1="52" x2="166" y2="142" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        {[66, 96, 126].map((y, i) => (
          <g key={y}>
            <line x1="54" y1={y} x2="96" y2={y} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
            <CapacitorSymbol x={110} y={y} vertical />
            <ResistorSymbol x={124} y={y} width={30} />
            <line x1="154" y1={y} x2="166" y2={y} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
            <text x="68" y={y - 7} className="fill-slate-700 text-[10px] dark:fill-stone-200">e{i + 1}</text>
          </g>
        ))}
      </DiagramFrame>
    </div>
  );
}

function MeterDiagram({ type }) {
  const isVoltmeter = type === "voltmeter";
  return (
    <DiagramFrame title={isVoltmeter ? "voltmeter" : "ammeter"}>
      <line x1="26" y1="96" x2="194" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <circle cx="100" cy="96" r="18" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <text x="95" y="101" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">G</text>
      {isVoltmeter ? (
        <>
          <ResistorSymbol x={120} y={96} width={48} />
          <text x="134" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200">Rs</text>
        </>
      ) : (
        <>
          <path d="M72 96 V130 H128 V96" fill="none" className="stroke-amber-500" strokeWidth="2.5" />
          <ResistorSymbol x={82} y={130} width={36} />
          <text x="97" y="151" className="fill-slate-700 text-[12px] dark:fill-stone-200">S</text>
        </>
      )}
      <text x="18" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">A</text>
      <text x="198" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">B</text>
    </DiagramFrame>
  );
}

function PotentiometerBaseDiagram() {
  return (
    <DiagramFrame title="potentiometer">
      <DiagramDefs />
      <rect x="42" y="50" width="132" height="78" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="42" y1="128" x2="174" y2="128" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="5" />
      <line x1="90" y1="50" x2="90" y2="34" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="99" y1="50" x2="99" y2="34" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <Arrow x1="42" y1="146" x2="174" y2="146" label="L" labelX="106" labelY="164" />
      <text x="34" y="141" className="fill-slate-700 text-[12px] dark:fill-stone-200">A</text>
      <text x="178" y="141" className="fill-slate-700 text-[12px] dark:fill-stone-200">B</text>
      <text x="122" y="112" className="fill-slate-700 text-[12px] dark:fill-stone-200">wire R</text>
    </DiagramFrame>
  );
}

function MetreBridgeDiagram() {
  return (
    <DiagramFrame title="metre bridge">
      <DiagramDefs />
      <rect x="32" y="44" width="156" height="112" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="40" y1="126" x2="180" y2="126" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="4" />
      <ResistorSymbol x={48} y={72} width={42} />
      <ResistorSymbol x={128} y={72} width={42} />
      <circle cx="110" cy="104" r="15" className="fill-white stroke-amber-500" strokeWidth="2" />
      <text x="105" y="109" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">G</text>
      <Arrow x1="40" y1="144" x2="110" y2="144" label="l" labelX="73" labelY="160" />
      <Arrow x1="110" y1="144" x2="180" y2="144" label="100-l" labelX="128" labelY="160" />
      <text x="62" y="58" className="fill-slate-700 text-[12px] dark:fill-stone-200">R</text>
      <text x="144" y="58" className="fill-slate-700 text-[12px] dark:fill-stone-200">X</text>
    </DiagramFrame>
  );
}

function CapacitorTypesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="spherical">
        <circle cx="110" cy="96" r="58" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
        <circle cx="110" cy="96" r="28" className="fill-transparent stroke-amber-500" strokeWidth="2.5" />
        <text x="139" y="99" className="fill-slate-700 text-[12px] dark:fill-stone-200">b</text>
        <text x="112" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200">a</text>
      </DiagramFrame>
      <DiagramFrame title="cylindrical">
        <ellipse cx="110" cy="54" rx="42" ry="13" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="68" y1="54" x2="68" y2="142" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="152" y1="54" x2="152" y2="142" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <ellipse cx="110" cy="142" rx="42" ry="13" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <ellipse cx="110" cy="54" rx="18" ry="6" className="fill-transparent stroke-amber-500" strokeWidth="2" />
        <text x="156" y="99" className="fill-slate-700 text-[12px] dark:fill-stone-200">l</text>
        <text x="121" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200">b</text>
      </DiagramFrame>
    </div>
  );
}

function CapacitorRedistributionDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="initial">
        <rect x="42" y="62" width="136" height="74" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <CapacitorSymbol x={110} y={62} vertical />
        <CapacitorSymbol x={110} y={136} vertical />
        <text x="116" y="67" className="fill-slate-700 text-[12px] dark:fill-stone-200">C1</text>
        <text x="116" y="141" className="fill-slate-700 text-[12px] dark:fill-stone-200">C2</text>
      </DiagramFrame>
      <DiagramFrame title="final">
        <rect x="42" y="62" width="136" height="74" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <CapacitorSymbol x={110} y={62} vertical />
        <CapacitorSymbol x={110} y={136} vertical />
        <text x="82" y="50" className="fill-amber-600 text-[12px] dark:fill-amber-300">Q1 prime</text>
        <text x="82" y="154" className="fill-amber-600 text-[12px] dark:fill-amber-300">Q2 prime</text>
      </DiagramFrame>
    </div>
  );
}

function CapacitorCombinationsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="series capacitors">
        <line x1="30" y1="96" x2="70" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        {[82, 120, 158].map((x, i) => (
          <g key={x}>
            <CapacitorSymbol x={x} y={96} vertical />
            <text x={x - 8} y="70" className="fill-slate-700 text-[11px] dark:fill-stone-200">C{i + 1}</text>
          </g>
        ))}
        <line x1="168" y1="96" x2="194" y2="96" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      </DiagramFrame>
      <DiagramFrame title="parallel capacitors">
        <line x1="55" y1="54" x2="55" y2="138" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        <line x1="165" y1="54" x2="165" y2="138" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
        {[66, 96, 126].map((y, i) => (
          <g key={y}>
            <line x1="55" y1={y} x2="98" y2={y} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
            <CapacitorSymbol x={110} y={y} vertical />
            <line x1="122" y1={y} x2="165" y2={y} className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
            <text x="124" y={y - 8} className="fill-slate-700 text-[11px] dark:fill-stone-200">C{i + 1}</text>
          </g>
        ))}
      </DiagramFrame>
    </div>
  );
}

function RcGraphDiagram({ discharge = false }) {
  return (
    <DiagramFrame title={discharge ? "RC discharging" : "RC charging"}>
      <DiagramDefs />
      <Axis xLabel="t" yLabel="q" />
      {discharge ? (
        <path d="M42 62 C74 96 108 122 178 142" fill="none" className="stroke-amber-500" strokeWidth="3" />
      ) : (
        <path d="M42 166 C72 118 112 76 180 66" fill="none" className="stroke-amber-500" strokeWidth="3" />
      )}
      <line x1="96" y1="166" x2="96" y2={discharge ? 113 : 103} className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="34" y1={discharge ? 113 : 103} x2="96" y2={discharge ? 113 : 103} className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="90" y="181" className="fill-slate-700 text-[12px] dark:fill-stone-200">tau</text>
      <text x="5" y={discharge ? 117 : 107} className="fill-slate-700 text-[11px] dark:fill-stone-200">{discharge ? "0.37q0" : "0.63q0"}</text>
      <text x="5" y="66" className="fill-slate-700 text-[11px] dark:fill-stone-200">q0</text>
    </DiagramFrame>
  );
}

function DielectricCapacitorDiagram() {
  return (
    <DiagramFrame title="dielectric capacitor">
      <DiagramDefs />
      <rect x="48" y="58" width="124" height="82" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="56" y="66" width="108" height="66" className="fill-amber-100/70 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="1.5" />
      <line x1="48" y1="50" x2="172" y2="50" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="48" y1="148" x2="172" y2="148" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <Arrow x1="88" y1="78" x2="88" y2="118" label="sigma/e0" labelX="52" labelY="104" />
      <Arrow x1="132" y1="118" x2="132" y2="78" label="sigma_b/e0" labelX="139" labelY="104" />
      <text x="176" y="104" className="fill-slate-700 text-[12px] dark:fill-stone-200">V</text>
    </DiagramFrame>
  );
}

function DielectricForceDiagram() {
  return (
    <DiagramFrame title="force on dielectric">
      <DiagramDefs />
      <path d="M42 74 H174 L194 108 H62 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <path d="M42 132 H174 L194 166 H62 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="80" y="92" width="78" height="62" className="fill-amber-100/70 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2" />
      <Arrow x1="120" y1="123" x2="88" y2="123" label="F" labelX="70" labelY="127" />
      <line x1="80" y1="166" x2="158" y2="166" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="115" y="181" className="fill-slate-700 text-[12px] dark:fill-stone-200">x</text>
    </DiagramFrame>
  );
}

function AcDcWaveformsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="DC">
        <Axis xLabel="t" yLabel="I" />
        <line x1="42" y1="92" x2="178" y2="92" className="stroke-amber-500" strokeWidth="3" />
        <path d="M42 132 C78 146 124 150 178 150" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      </DiagramFrame>
      <DiagramFrame title="AC">
        <Axis xLabel="t" yLabel="I" />
        <path d="M42 116 C58 70 76 70 92 116 C108 162 126 162 142 116 C158 70 176 70 190 116" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <line x1="34" y1="116" x2="190" y2="116" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      </DiagramFrame>
    </div>
  );
}

function AcCircuitDiagram({ kind }) {
  const isCap = kind === "capacitor";
  return (
    <DiagramFrame title={isCap ? "pure capacitive AC" : "pure resistive AC"}>
      <path d="M48 64 H172 V136 H48 Z" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <circle cx="110" cy="64" r="16" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
      <path d="M100 64 C104 54 116 74 120 64" fill="none" className="stroke-amber-500" strokeWidth="2" />
      {isCap ? <CapacitorSymbol x={110} y={136} vertical /> : <ResistorSymbol x={84} y={136} />}
      <text x="128" y="69" className="fill-slate-700 text-[12px] dark:fill-stone-200">Vs</text>
      <text x="106" y="164" className="fill-slate-700 text-[14px] font-bold dark:fill-stone-200">{isCap ? "C" : "R"}</text>
    </DiagramFrame>
  );
}

function AcCapacitivePhaseDiagram() {
  return (
    <DiagramFrame title="capacitive phase">
      <DiagramDefs />
      <line x1="34" y1="80" x2="190" y2="80" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.5" />
      <line x1="34" y1="142" x2="190" y2="142" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.5" />
      <path d="M42 80 C58 42 74 42 90 80 C106 118 122 118 138 80" fill="none" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <path d="M42 112 C58 150 74 150 90 112 C106 74 122 74 138 112" fill="none" className="stroke-amber-500" strokeWidth="2.5" />
      {[58, 90, 122].map((x) => <line key={x} x1={x} y1="38" x2={x} y2="164" className="stroke-slate-400 dark:stroke-stone-600" strokeDasharray="4 4" />)}
      <text x="20" y="74" className="fill-slate-700 text-[12px] dark:fill-stone-200">v</text>
      <text x="20" y="136" className="fill-amber-600 text-[12px] dark:fill-amber-300">i</text>
      <Arrow x1="148" y1="138" x2="148" y2="74" label="pi/2" labelX="154" labelY="110" />
    </DiagramFrame>
  );
}

function MagneticMovingChargeDiagram() {
  return (
    <DiagramFrame title="moving charge field">
      <DiagramDefs />
      <circle cx="58" cy="132" r="10" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/20" strokeWidth="2" />
      <text x="54" y="137" className="fill-amber-700 text-[13px] font-bold dark:fill-amber-200">q</text>
      <Arrow x1="70" y1="132" x2="138" y2="132" label="v" labelX="101" labelY="122" />
      <Arrow x1="58" y1="132" x2="160" y2="58" label="r" labelX="109" labelY="90" />
      <circle cx="168" cy="52" r="4" className="fill-slate-700 dark:fill-stone-200" />
      <text x="174" y="56" className="fill-slate-700 text-[12px] dark:fill-stone-200">P</text>
    </DiagramFrame>
  );
}

function StraightWireFieldDiagram() {
  return (
    <DiagramFrame title="straight wire">
      <DiagramDefs />
      <line x1="54" y1="40" x2="54" y2="154" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" markerEnd="url(#arrow)" />
      <text x="36" y="92" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">I</text>
      <circle cx="148" cy="96" r="4" className="fill-amber-500" />
      <line x1="58" y1="96" x2="148" y2="96" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="96" y="88" className="fill-slate-600 text-[12px] dark:fill-stone-300">r</text>
      <path d="M126 58 C164 74 166 118 128 138" fill="none" className="stroke-amber-500" strokeWidth="2.5" />
      <text x="156" y="99" className="fill-slate-700 text-[12px] dark:fill-stone-200">P</text>
    </DiagramFrame>
  );
}

function CircularLoopFieldDiagram() {
  return (
    <DiagramFrame title="circular loop axis">
      <DiagramDefs />
      <ellipse cx="84" cy="96" rx="24" ry="54" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="84" y1="96" x2="184" y2="96" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <Arrow x1="96" y1="96" x2="162" y2="96" label="x" labelX="128" labelY="87" />
      <Arrow x1="84" y1="96" x2="84" y2="42" label="R" labelX="91" labelY="68" />
      <circle cx="178" cy="96" r="4" className="fill-amber-500" />
      <text x="184" y="100" className="fill-slate-700 text-[12px] dark:fill-stone-200">axis</text>
    </DiagramFrame>
  );
}

function SolenoidAxisDiagram() {
  return (
    <DiagramFrame title="solenoid axis">
      {[48, 62, 76, 90, 104, 118, 132, 146].map((x) => (
        <ellipse key={x} cx={x} cy="96" rx="12" ry="42" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="1.8" />
      ))}
      <line x1="34" y1="96" x2="184" y2="96" className="stroke-amber-500" strokeWidth="2.5" />
      <text x="188" y="100" className="fill-slate-700 text-[12px] dark:fill-stone-200">axis</text>
      <text x="80" y="32" className="fill-amber-600 text-[13px] font-bold dark:fill-amber-300">n turns/length</text>
    </DiagramFrame>
  );
}

function ChargePathDiagram({ helical = false }) {
  return (
    <DiagramFrame title={helical ? "helical path" : "circular path"}>
      <DiagramDefs />
      <line x1="36" y1="36" x2="180" y2="36" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="186" y="40" className="fill-slate-700 text-[12px] dark:fill-stone-200">B</text>
      {helical ? (
        <>
          <path d="M42 124 C58 72 78 72 94 124 C110 176 130 176 146 124 C162 72 180 72 194 124" fill="none" className="stroke-amber-500" strokeWidth="3" />
          <line x1="42" y1="124" x2="194" y2="124" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="4 4" />
          <text x="96" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">pitch</text>
        </>
      ) : (
        <>
          <circle cx="112" cy="108" r="48" className="fill-transparent stroke-amber-500" strokeWidth="3" />
          <Arrow x1="112" y1="108" x2="160" y2="108" label="r" labelX="134" labelY="101" />
          <Arrow x1="160" y1="108" x2="160" y2="72" label="v" labelX="166" labelY="92" />
        </>
      )}
    </DiagramFrame>
  );
}

function MagneticDipoleDiagram() {
  return (
    <DiagramFrame title="loop moment">
      <DiagramDefs />
      <rect x="70" y="62" width="76" height="70" rx="6" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <Arrow x1="108" y1="96" x2="108" y2="38" label="M" labelX="116" labelY="62" />
      <line x1="34" y1="150" x2="184" y2="150" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="190" y="154" className="fill-amber-600 text-[12px] dark:fill-amber-300">B</text>
      <text x="96" y="144" className="fill-slate-700 text-[12px] dark:fill-stone-200">NIA</text>
    </DiagramFrame>
  );
}

function BarMagnetPointDiagram() {
  return (
    <DiagramFrame title="magnet point">
      <DiagramDefs />
      <rect x="38" y="126" width="126" height="22" className="fill-white stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-200" strokeWidth="2" />
      <text x="48" y="142" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">S</text>
      <text x="146" y="142" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">N</text>
      <Arrow x1="88" y1="126" x2="154" y2="58" label="r" labelX="115" labelY="88" />
      <line x1="88" y1="126" x2="178" y2="126" className="stroke-slate-500 dark:stroke-stone-500" />
      <path d="M112 126 A24 24 0 0 1 130 109" fill="none" className="stroke-amber-500" strokeWidth="2" />
      <text x="118" y="121" className="fill-amber-600 text-[12px] dark:fill-amber-300">theta</text>
      <text x="160" y="58" className="fill-slate-700 text-[13px] dark:fill-stone-200">P</text>
    </DiagramFrame>
  );
}

function EmiFluxLoopDiagram() {
  return (
    <DiagramFrame title="magnetic flux">
      <rect x="64" y="56" width="92" height="78" rx="10" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      {[48, 76, 104, 132, 160].map((x) => (
        <g key={x}>
          <circle cx={x} cy="96" r="10" className="fill-transparent stroke-amber-500" strokeWidth="2" />
          <line x1={x - 5} y1="91" x2={x + 5} y2="101" className="stroke-amber-500" strokeWidth="2" />
          <line x1={x + 5} y1="91" x2={x - 5} y2="101" className="stroke-amber-500" strokeWidth="2" />
        </g>
      ))}
      <text x="82" y="154" className="fill-slate-700 text-[12px] dark:fill-stone-200">B through area</text>
    </DiagramFrame>
  );
}

function RotatingDiscDiagram() {
  return (
    <DiagramFrame title="rotating disc">
      <DiagramDefs />
      <circle cx="108" cy="96" r="52" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <Arrow x1="108" y1="96" x2="160" y2="96" label="r" labelX="132" labelY="88" />
      <path d="M90 62 C124 38 158 66 144 103" fill="none" className="stroke-amber-500" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <text x="150" y="72" className="fill-amber-600 text-[13px] dark:fill-amber-300">omega</text>
      <text x="82" y="162" className="fill-slate-700 text-[12px] dark:fill-stone-200">centre to edge</text>
    </DiagramFrame>
  );
}

function VaryingFieldLoopDiagram() {
  return (
    <DiagramFrame title="induced electric field">
      <DiagramDefs />
      <circle cx="110" cy="96" r="58" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <path d="M58 96 A52 52 0 0 1 110 44" fill="none" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
      <text x="116" y="48" className="fill-amber-600 text-[12px] dark:fill-amber-300">E</text>
      <text x="80" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">dB/dt</text>
    </DiagramFrame>
  );
}

function InductorSymbolDiagram() {
  return (
    <DiagramFrame title="inductor">
      <path d="M38 96 H72 C72 76 92 76 92 96 C92 116 112 116 112 96 C112 76 132 76 132 96 C132 116 152 116 152 96 H184" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <text x="100" y="134" className="fill-amber-600 text-[16px] font-bold dark:fill-amber-300">L</text>
    </DiagramFrame>
  );
}

function RlGraphDiagram({ decay = false }) {
  return (
    <DiagramFrame title={decay ? "R-L decay" : "R-L growth"}>
      <Axis xLabel="t" yLabel="I" />
      {decay ? (
        <path d="M42 48 C76 74 104 102 134 130 C152 146 170 154 188 158" fill="none" className="stroke-amber-500" strokeWidth="3" />
      ) : (
        <path d="M42 158 C76 126 104 92 134 70 C154 56 172 50 188 48" fill="none" className="stroke-amber-500" strokeWidth="3" />
      )}
      <line x1="34" y1="48" x2="188" y2="48" className="stroke-slate-400 dark:stroke-stone-600" strokeDasharray="4 4" />
    </DiagramFrame>
  );
}

function TransformerDiagram() {
  return (
    <DiagramFrame title="transformer">
      {[66, 78, 90].map((x) => <path key={x} d={`M${x} 54 C${x - 18} 70 ${x - 18} 120 ${x} 136`} fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />)}
      {[132, 144, 156].map((x) => <path key={x} d={`M${x} 54 C${x + 18} 70 ${x + 18} 120 ${x} 136`} fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />)}
      <rect x="101" y="44" width="18" height="104" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
      <text x="47" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">primary</text>
      <text x="135" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">secondary</text>
    </DiagramFrame>
  );
}

function LcOscillationDiagram() {
  return (
    <DiagramFrame title="LC oscillator">
      <path d="M48 66 H86 C86 50 102 50 102 66 C102 82 118 82 118 66 C118 50 134 50 134 66 H170 V132 H132" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <CapacitorSymbol x={108} y={132} />
      <path d="M84 132 H48 V66" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <text x="104" y="42" className="fill-amber-600 text-[13px] font-bold dark:fill-amber-300">L</text>
      <text x="104" y="162" className="fill-amber-600 text-[13px] font-bold dark:fill-amber-300">C</text>
    </DiagramFrame>
  );
}

function PlaneMirrorDiagram() {
  return (
    <DiagramFrame title="plane mirror">
      <line x1="110" y1="34" x2="110" y2="156" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="48" y1="116" x2="172" y2="116" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="4 4" />
      <circle cx="62" cy="116" r="5" className="fill-amber-500" />
      <circle cx="158" cy="116" r="5" className="fill-transparent stroke-amber-500" strokeDasharray="3 3" strokeWidth="2" />
      <text x="40" y="104" className="fill-slate-700 text-[12px] dark:fill-stone-200">object</text>
      <text x="146" y="104" className="fill-slate-700 text-[12px] dark:fill-stone-200">image</text>
    </DiagramFrame>
  );
}

function SphericalMirrorDiagram() {
  return (
    <DiagramFrame title="spherical mirror">
      <path d="M156 42 C112 62 112 130 156 150" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="34" y1="96" x2="188" y2="96" className="stroke-slate-400 dark:stroke-stone-500" />
      <circle cx="72" cy="96" r="3" className="fill-amber-500" />
      <circle cx="112" cy="96" r="3" className="fill-amber-500" />
      <text x="66" y="112" className="fill-slate-700 text-[12px] dark:fill-stone-200">C</text>
      <text x="107" y="112" className="fill-slate-700 text-[12px] dark:fill-stone-200">F</text>
    </DiagramFrame>
  );
}

function RefractionSnellDiagram() {
  return (
    <DiagramFrame title="refraction">
      <DiagramDefs />
      <line x1="34" y1="96" x2="188" y2="96" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <line x1="110" y1="32" x2="110" y2="160" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="4 4" />
      <Arrow x1="64" y1="44" x2="110" y2="96" />
      <Arrow x1="110" y1="96" x2="154" y2="142" />
      <text x="72" y="82" className="fill-amber-600 text-[12px] dark:fill-amber-300">i</text>
      <text x="122" y="128" className="fill-amber-600 text-[12px] dark:fill-amber-300">r</text>
    </DiagramFrame>
  );
}

function ApparentDepthDiagram() {
  return (
    <DiagramFrame title="apparent depth">
      <DiagramDefs />
      <line x1="34" y1="72" x2="188" y2="72" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <rect x="34" y="72" width="154" height="88" className="fill-amber-100/40 stroke-transparent dark:fill-amber-500/10" />
      <circle cx="108" cy="138" r="5" className="fill-amber-500" />
      <circle cx="108" cy="104" r="5" className="fill-transparent stroke-amber-500" strokeDasharray="3 3" strokeWidth="2" />
      <line x1="126" y1="72" x2="126" y2="138" className="stroke-slate-500 dark:stroke-stone-500" markerEnd="url(#arrow)" />
      <text x="132" y="124" className="fill-slate-700 text-[12px] dark:fill-stone-200">d</text>
      <line x1="92" y1="72" x2="92" y2="104" className="stroke-slate-500 dark:stroke-stone-500" />
      <text x="64" y="98" className="fill-slate-700 text-[12px] dark:fill-stone-200">d&apos;</text>
    </DiagramFrame>
  );
}

function PrismDeviationDiagram() {
  return (
    <DiagramFrame title="prism deviation">
      <DiagramDefs />
      <path d="M86 142 L126 50 L166 142 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <Arrow x1="34" y1="96" x2="96" y2="96" />
      <line x1="96" y1="96" x2="154" y2="104" className="stroke-amber-500" strokeWidth="2.5" />
      <Arrow x1="154" y1="104" x2="194" y2="118" />
      <text x="112" y="76" className="fill-slate-700 text-[12px] dark:fill-stone-200">A</text>
      <text x="172" y="94" className="fill-amber-600 text-[12px] dark:fill-amber-300">delta</text>
    </DiagramFrame>
  );
}

function ThinLensDiagram() {
  return (
    <DiagramFrame title="thin lens">
      <DiagramDefs />
      <path d="M106 36 C130 62 130 130 106 156 C82 130 82 62 106 36 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="34" y1="96" x2="188" y2="96" className="stroke-slate-400 dark:stroke-stone-500" />
      <Arrow x1="40" y1="70" x2="106" y2="96" />
      <Arrow x1="106" y1="96" x2="178" y2="124" />
      <circle cx="72" cy="96" r="3" className="fill-amber-500" />
      <circle cx="140" cy="96" r="3" className="fill-amber-500" />
    </DiagramFrame>
  );
}

function SimpleMicroscopeDiagram() {
  return (
    <DiagramFrame title="simple microscope">
      <DiagramDefs />
      <path d="M106 44 C126 68 126 124 106 148 C86 124 86 68 106 44 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="34" y1="96" x2="188" y2="96" className="stroke-slate-400 dark:stroke-stone-500" />
      <Arrow x1="46" y1="72" x2="106" y2="96" />
      <Arrow x1="106" y1="96" x2="174" y2="120" />
      <text x="96" y="166" className="fill-amber-600 text-[13px] font-bold dark:fill-amber-300">f</text>
    </DiagramFrame>
  );
}

function CompoundMicroscopeDiagram() {
  return (
    <DiagramFrame title="compound microscope">
      <path d="M64 42 C84 66 84 126 64 150 C44 126 44 66 64 42 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.2" />
      <path d="M152 48 C168 70 168 122 152 144 C136 122 136 70 152 48 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.2" />
      <line x1="30" y1="96" x2="190" y2="96" className="stroke-slate-400 dark:stroke-stone-500" />
      <text x="47" y="166" className="fill-slate-700 text-[12px] dark:fill-stone-200">objective</text>
      <text x="134" y="166" className="fill-slate-700 text-[12px] dark:fill-stone-200">eyepiece</text>
    </DiagramFrame>
  );
}

function TelescopeDiagram() {
  return (
    <DiagramFrame title="telescope lenses">
      <path d="M56 36 C82 64 82 128 56 156 C30 128 30 64 56 36 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.2" />
      <path d="M158 54 C172 72 172 120 158 138 C144 120 144 72 158 54 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.2" />
      <line x1="24" y1="96" x2="192" y2="96" className="stroke-slate-400 dark:stroke-stone-500" />
      <text x="40" y="172" className="fill-slate-700 text-[12px] dark:fill-stone-200">fo</text>
      <text x="150" y="172" className="fill-slate-700 text-[12px] dark:fill-stone-200">fe</text>
    </DiagramFrame>
  );
}

function YdseDiagram({ oblique = false } = {}) {
  return (
    <DiagramFrame title={oblique ? "oblique YDSE" : "YDSE"}>
      <DiagramDefs />
      <line x1="60" y1="36" x2="60" y2="156" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <circle cx="60" cy="76" r="3" className="fill-amber-500" />
      <circle cx="60" cy="116" r="3" className="fill-amber-500" />
      <line x1="170" y1="36" x2="170" y2="156" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <Arrow x1="60" y1="76" x2="170" y2={oblique ? 88 : 96} />
      <Arrow x1="60" y1="116" x2="170" y2={oblique ? 88 : 96} />
      {oblique && <Arrow x1="24" y1="98" x2="58" y2="76" label="theta0" labelX="18" labelY="84" />}
      <text x="42" y="79" className="fill-slate-700 text-[12px] dark:fill-stone-200">S1</text>
      <text x="42" y="119" className="fill-slate-700 text-[12px] dark:fill-stone-200">S2</text>
      <text x="178" y="100" className="fill-slate-700 text-[12px] dark:fill-stone-200">screen</text>
    </DiagramFrame>
  );
}

function ThinFilmDiagram() {
  return (
    <DiagramFrame title="thin film">
      <DiagramDefs />
      <rect x="54" y="78" width="112" height="42" className="fill-amber-100/50 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2" />
      <Arrow x1="58" y1="38" x2="94" y2="78" />
      <Arrow x1="94" y1="78" x2="70" y2="44" />
      <Arrow x1="94" y1="78" x2="128" y2="120" />
      <line x1="174" y1="78" x2="174" y2="120" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="180" y="103" className="fill-slate-700 text-[12px] dark:fill-stone-200">d</text>
    </DiagramFrame>
  );
}

function SingleSlitDiffractionDiagram() {
  return (
    <DiagramFrame title="single-slit diffraction">
      <line x1="72" y1="38" x2="72" y2="78" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="4" />
      <line x1="72" y1="114" x2="72" y2="156" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="4" />
      <line x1="170" y1="34" x2="170" y2="158" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <path d="M78 96 C110 58 140 58 170 72 M78 96 C110 96 140 96 170 96 M78 96 C110 134 140 134 170 120" fill="none" className="stroke-amber-500" strokeWidth="2" />
      <text x="52" y="102" className="fill-slate-700 text-[12px] dark:fill-stone-200">a</text>
      <text x="176" y="100" className="fill-slate-700 text-[12px] dark:fill-stone-200">screen</text>
    </DiagramFrame>
  );
}

function GravitationVectorDiagram() {
  return (
    <DiagramFrame title="force pair">
      <DiagramDefs />
      <circle cx="62" cy="96" r="12" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
      <circle cx="158" cy="96" r="16" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
      <Arrow x1="76" y1="96" x2="120" y2="96" label="F12" labelX="88" labelY="84" />
      <Arrow x1="144" y1="96" x2="102" y2="96" label="F21" labelX="124" labelY="116" />
      <line x1="62" y1="132" x2="158" y2="132" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="105" y="148" className="fill-slate-700 text-[12px] dark:fill-stone-200">r</text>
      <text x="54" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">m1</text>
      <text x="150" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">m2</text>
    </DiagramFrame>
  );
}

function GravRingDiscDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="ring axis">
        <DiagramDefs />
        <ellipse cx="82" cy="98" rx="22" ry="52" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
        <line x1="82" y1="98" x2="178" y2="98" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <Arrow x1="82" y1="98" x2="82" y2="46" label="a" labelX="90" labelY="72" />
        <Arrow x1="92" y1="98" x2="150" y2="98" label="r" labelX="120" labelY="88" />
      </DiagramFrame>
      <DiagramFrame title="disc axis">
        <DiagramDefs />
        <ellipse cx="82" cy="98" rx="36" ry="58" className="fill-amber-100/40 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
        <line x1="82" y1="98" x2="180" y2="98" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <Arrow x1="82" y1="98" x2="82" y2="40" label="a" labelX="91" labelY="68" />
        <Arrow x1="94" y1="98" x2="154" y2="98" label="r" labelX="124" labelY="88" />
      </DiagramFrame>
    </div>
  );
}

function GravSphereShellDiagram() {
  return (
    <DiagramFrame title="sphere and shell">
      <circle cx="78" cy="98" r="48" className="fill-amber-100/50 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
      <circle cx="148" cy="98" r="42" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <circle cx="78" cy="98" r="3" className="fill-slate-700 dark:fill-stone-200" />
      <line x1="78" y1="98" x2="126" y2="98" className="stroke-slate-500 dark:stroke-stone-500" />
      <text x="93" y="90" className="fill-slate-700 text-[12px] dark:fill-stone-200">a</text>
      <text x="48" y="164" className="fill-slate-700 text-[12px] dark:fill-stone-200">solid sphere</text>
      <text x="128" y="164" className="fill-slate-700 text-[12px] dark:fill-stone-200">shell</text>
    </DiagramFrame>
  );
}

function SatelliteOrbitDiagram() {
  return (
    <DiagramFrame title="satellite orbit">
      <DiagramDefs />
      <circle cx="104" cy="98" r="34" className="fill-amber-100/50 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
      <circle cx="104" cy="98" r="66" className="fill-transparent stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" strokeWidth="2" />
      <circle cx="169" cy="89" r="5" className="fill-slate-700 dark:fill-stone-200" />
      <Arrow x1="104" y1="98" x2="169" y2="89" label="Re+h" labelX="125" labelY="82" />
      <Arrow x1="169" y1="89" x2="164" y2="62" label="v0" labelX="172" labelY="70" />
    </DiagramFrame>
  );
}

function FluidElevatorDiagram() {
  return (
    <DiagramFrame title="accelerating fluid">
      <DiagramDefs />
      <rect x="54" y="48" width="54" height="94" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <line x1="54" y1="86" x2="108" y2="86" className="stroke-amber-500" strokeWidth="2.5" />
      <line x1="82" y1="86" x2="82" y2="132" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="88" y="113" className="fill-slate-700 text-[12px] dark:fill-stone-200">h</text>
      <Arrow x1="146" y1="132" x2="146" y2="64" label="a0" labelX="154" labelY="92" />
      <rect x="132" y="110" width="28" height="22" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/10" />
    </DiagramFrame>
  );
}

function FluidAccelRotationDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="horizontal acceleration">
        <DiagramDefs />
        <rect x="42" y="72" width="132" height="70" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <path d="M43 118 L174 82" className="stroke-amber-500" strokeWidth="3" />
        <Arrow x1="176" y1="108" x2="202" y2="108" label="a0" labelX="188" labelY="98" />
        <text x="90" y="102" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
      </DiagramFrame>
      <DiagramFrame title="rotating liquid">
        <path d="M46 132 C74 116 100 92 132 92 C158 92 176 112 190 132" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <rect x="46" y="62" width="144" height="70" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <line x1="118" y1="132" x2="118" y2="92" className="stroke-slate-500 dark:stroke-stone-500" />
        <text x="124" y="116" className="fill-slate-700 text-[12px] dark:fill-stone-200">h</text>
      </DiagramFrame>
    </div>
  );
}

function CapillaryBubbleDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="bubble/drop">
        <circle cx="108" cy="96" r="50" className="fill-amber-100/40 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
        <line x1="108" y1="96" x2="158" y2="96" className="stroke-slate-700 dark:stroke-stone-200" />
        <text x="132" y="88" className="fill-slate-700 text-[12px] dark:fill-stone-200">r</text>
        <text x="77" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">excess pressure</text>
      </DiagramFrame>
      <DiagramFrame title="capillary rise">
        <rect x="58" y="56" width="30" height="98" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <rect x="130" y="92" width="30" height="62" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <line x1="34" y1="154" x2="188" y2="154" className="stroke-amber-500" strokeWidth="3" />
        <line x1="58" y1="82" x2="88" y2="82" className="stroke-amber-500" strokeWidth="3" />
        <line x1="98" y1="154" x2="98" y2="82" className="stroke-slate-500 dark:stroke-stone-500" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="104" y="122" className="fill-slate-700 text-[12px] dark:fill-stone-200">h</text>
      </DiagramFrame>
    </div>
  );
}

function OrganPipeModesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="closed pipe">
        <line x1="56" y1="44" x2="56" y2="146" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="4" />
        <line x1="56" y1="146" x2="160" y2="146" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="4" />
        <path d="M58 146 C88 92 126 70 160 44" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <text x="78" y="168" className="fill-slate-700 text-[12px] dark:fill-stone-200">v/4l</text>
      </DiagramFrame>
      <DiagramFrame title="open pipe">
        <line x1="56" y1="62" x2="160" y2="62" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
        <line x1="56" y1="134" x2="160" y2="134" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
        <path d="M56 98 C82 50 132 146 160 98" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <text x="78" y="168" className="fill-slate-700 text-[12px] dark:fill-stone-200">v/2l</text>
      </DiagramFrame>
    </div>
  );
}

function EmWaveOrientationDiagram() {
  return (
    <DiagramFrame title="EM wave orientation">
      <DiagramDefs />
      <Arrow x1="34" y1="132" x2="186" y2="132" label="z" labelX="190" labelY="136" />
      <path d="M42 96 C58 48 74 48 90 96 C106 144 122 144 138 96 C154 48 170 48 186 96" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <path d="M42 132 C58 94 74 94 90 132 C106 170 122 170 138 132 C154 94 170 94 186 132" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <text x="24" y="92" className="fill-amber-600 text-[12px] dark:fill-amber-300">E</text>
      <text x="22" y="154" className="fill-slate-700 text-[12px] dark:fill-stone-200">B</text>
    </DiagramFrame>
  );
}

function CommunicationHorizonDiagram() {
  return (
    <DiagramFrame title="radio horizon">
      <path d="M38 134 C82 82 144 82 188 134 Z" className="fill-amber-100/40 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
      <line x1="54" y1="126" x2="54" y2="72" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="174" y1="126" x2="174" y2="86" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="54" y1="72" x2="174" y2="86" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="46" y="66" className="fill-slate-700 text-[12px] dark:fill-stone-200">hT</text>
      <text x="178" y="83" className="fill-slate-700 text-[12px] dark:fill-stone-200">hR</text>
      <text x="93" y="62" className="fill-amber-600 text-[12px] dark:fill-amber-300">dM</text>
    </DiagramFrame>
  );
}

function AmFmSignalDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="AM">
        <Axis xLabel="t" yLabel="A" />
        <path d="M42 104 C58 70 74 70 90 104 C106 138 122 138 138 104 C154 70 170 70 186 104" fill="none" className="stroke-amber-500" strokeWidth="2.5" />
        <path d="M42 70 C78 42 150 42 186 70 M42 138 C78 166 150 166 186 138" fill="none" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      </DiagramFrame>
      <DiagramFrame title="FM">
        <Axis xLabel="t" yLabel="f" />
        <path d="M42 104 C50 78 58 78 66 104 C74 130 82 130 90 104 C100 72 112 72 122 104 C136 142 154 142 168 104 C174 90 180 90 186 104" fill="none" className="stroke-amber-500" strokeWidth="2.5" />
      </DiagramFrame>
    </div>
  );
}

function TransistorAmplifierDiagram() {
  return (
    <DiagramFrame title="transistor amplifier">
      <DiagramDefs />
      <circle cx="110" cy="96" r="36" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <line x1="42" y1="96" x2="76" y2="96" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="110" y1="68" x2="110" y2="38" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="110" y1="124" x2="110" y2="154" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="76" y1="96" x2="110" y2="72" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="76" y1="96" x2="110" y2="120" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <Arrow x1="110" y1="120" x2="98" y2="112" />
      <text x="32" y="100" className="fill-slate-700 text-[12px] dark:fill-stone-200">B</text>
      <text x="116" y="42" className="fill-slate-700 text-[12px] dark:fill-stone-200">C</text>
      <text x="116" y="158" className="fill-slate-700 text-[12px] dark:fill-stone-200">E</text>
      <ResistorSymbol x={136} y={38} />
      <text x="149" y="26" className="fill-amber-600 text-[12px] dark:fill-amber-300">RL</text>
    </DiagramFrame>
  );
}

function MathPointLineDistanceDiagram() {
  return (
    <DiagramFrame title="point to line">
      <DiagramDefs />
      <line x1="42" y1="138" x2="178" y2="58" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <circle cx="78" cy="58" r="5" className="fill-amber-500" />
      <line x1="78" y1="58" x2="112" y2="97" className="stroke-amber-500" strokeDasharray="4 4" strokeWidth="2.5" />
      <path d="M102 91 L110 84 L118 94" fill="none" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.8" />
      <text x="60" y="50" className="fill-slate-700 text-[12px] dark:fill-stone-200">P(x1,y1)</text>
      <text x="118" y="118" className="fill-slate-700 text-[12px] dark:fill-stone-200">ax+by+c=0</text>
    </DiagramFrame>
  );
}

function MathCircleStandardDiagram() {
  return (
    <DiagramFrame title="circle">
      <Axis xLabel="x" yLabel="y" />
      <circle cx="104" cy="96" r="46" className="fill-transparent stroke-amber-500" strokeWidth="3" />
      <circle cx="104" cy="96" r="3" className="fill-slate-700 dark:fill-stone-200" />
      <line x1="104" y1="96" x2="150" y2="96" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <text x="124" y="88" className="fill-slate-700 text-[12px] dark:fill-stone-200">r</text>
    </DiagramFrame>
  );
}

function MathParabolaStandardDiagram() {
  return (
    <DiagramFrame title="standard parabola">
      <DiagramDefs />
      <Axis xLabel="x" yLabel="y" />
      <path d="M46 152 C74 132 88 112 98 96 C114 70 134 50 178 34" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <circle cx="64" cy="166" r="3" className="fill-slate-700 dark:fill-stone-200" />
      <circle cx="70" cy="166" r="3" className="fill-amber-500" />
      <line x1="22" y1="30" x2="22" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="80" y1="52" x2="80" y2="140" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="1.8" />
      <circle cx="80" cy="96" r="4" className="fill-amber-500" />
      <text x="8" y="26" className="fill-slate-700 text-[12px] dark:fill-stone-200">x=-a</text>
      <text x="88" y="100" className="fill-amber-600 text-[12px] dark:fill-amber-300">focus</text>
      <text x="85" y="56" className="fill-slate-700 text-[12px] dark:fill-stone-200">latus rectum</text>
    </DiagramFrame>
  );
}

function MathEllipseStandardDiagram() {
  return (
    <DiagramFrame title="standard ellipse">
      <Axis xLabel="x" yLabel="y" />
      <ellipse cx="110" cy="96" rx="66" ry="38" className="fill-transparent stroke-amber-500" strokeWidth="3" />
      <line x1="44" y1="96" x2="176" y2="96" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="1.8" />
      <line x1="110" y1="58" x2="110" y2="134" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="1.8" />
      <circle cx="76" cy="96" r="4" className="fill-amber-500" />
      <circle cx="144" cy="96" r="4" className="fill-amber-500" />
      <line x1="30" y1="36" x2="30" y2="156" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="190" y1="36" x2="190" y2="156" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="67" y="86" className="fill-slate-700 text-[12px] dark:fill-stone-200">S&apos;</text>
      <text x="148" y="86" className="fill-slate-700 text-[12px] dark:fill-stone-200">S</text>
      <text x="14" y="30" className="fill-slate-700 text-[12px] dark:fill-stone-200">x=-a/e</text>
      <text x="166" y="30" className="fill-slate-700 text-[12px] dark:fill-stone-200">x=a/e</text>
    </DiagramFrame>
  );
}

function MathHyperbolaStandardDiagram({ asymptotes = false, rectangular = false } = {}) {
  if (rectangular) {
    return (
      <DiagramFrame title="rectangular hyperbola">
        <Axis xLabel="x" yLabel="y" />
        <path d="M54 54 C78 78 94 94 108 108 C124 124 142 142 170 166" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <path d="M54 166 C78 142 94 124 108 108 C124 94 142 78 170 54" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <text x="128" y="72" className="fill-slate-700 text-[12px] dark:fill-stone-200">xy=c^2</text>
      </DiagramFrame>
    );
  }

  return (
    <DiagramFrame title={asymptotes ? "hyperbola asymptotes" : "standard hyperbola"}>
      <Axis xLabel="x" yLabel="y" />
      <line x1="48" y1="150" x2="172" y2="42" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="48" y1="42" x2="172" y2="150" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <path d="M66 52 C92 72 96 92 96 96 C96 100 92 120 66 140" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <path d="M154 52 C128 72 124 92 124 96 C124 100 128 120 154 140" fill="none" className="stroke-amber-500" strokeWidth="3" />
      {!asymptotes && (
        <>
          <circle cx="76" cy="96" r="4" className="fill-amber-500" />
          <circle cx="144" cy="96" r="4" className="fill-amber-500" />
        </>
      )}
    </DiagramFrame>
  );
}

function MathTangentNormalDiagram() {
  return (
    <DiagramFrame title="tangent and normal">
      <DiagramDefs />
      <Axis xLabel="x" yLabel="y" />
      <path d="M42 142 C70 124 86 86 112 78 C138 70 158 92 184 54" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <circle cx="112" cy="78" r="4" className="fill-slate-700 dark:fill-stone-200" />
      <line x1="58" y1="118" x2="178" y2="50" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="86" y1="34" x2="140" y2="132" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" strokeWidth="2" />
      <text x="144" y="56" className="fill-slate-700 text-[12px] dark:fill-stone-200">tangent</text>
      <text x="132" y="126" className="fill-slate-700 text-[12px] dark:fill-stone-200">normal</text>
    </DiagramFrame>
  );
}

function MathSubtangentSubnormalDiagram() {
  return (
    <DiagramFrame title="subtangent geometry">
      <DiagramDefs />
      <line x1="36" y1="144" x2="190" y2="144" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <line x1="108" y1="48" x2="108" y2="144" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <circle cx="108" cy="66" r="4" className="fill-amber-500" />
      <line x1="62" y1="144" x2="108" y2="66" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="3 3" strokeWidth="2" />
      <line x1="108" y1="66" x2="168" y2="144" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <line x1="108" y1="66" x2="86" y2="144" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <text x="102" y="58" className="fill-amber-600 text-[12px] dark:fill-amber-300">P(h,k)</text>
      <text x="59" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">N</text>
      <text x="103" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">M</text>
      <text x="164" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">T</text>
    </DiagramFrame>
  );
}

function MathAngleCurvesDiagram() {
  return (
    <DiagramFrame title="angle between curves">
      <DiagramDefs />
      <Axis xLabel="x" yLabel="y" />
      <path d="M42 140 C78 106 102 86 182 72" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <path d="M54 52 C84 86 116 104 184 128" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <circle cx="112" cy="92" r="4" className="fill-amber-500" />
      <line x1="66" y1="116" x2="162" y2="70" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="72" y1="70" x2="164" y2="122" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <path d="M118 90 A24 24 0 0 1 134 97" fill="none" className="stroke-amber-600 dark:stroke-amber-300" strokeWidth="2" />
      <text x="136" y="98" className="fill-amber-600 text-[12px] dark:fill-amber-300">theta</text>
    </DiagramFrame>
  );
}

function MathArgandDiagram({ rotation = false }) {
  return (
    <DiagramFrame title={rotation ? "complex rotation" : "argand plane"}>
      <DiagramDefs />
      <Axis xLabel="Re" yLabel="Im" />
      {rotation ? (
        <>
          <Arrow x1="34" y1="166" x2="126" y2="118" label="z1-z2" labelX="92" labelY="112" />
          <Arrow x1="34" y1="166" x2="102" y2="70" label="z3-z2" labelX="106" labelY="72" />
          <path d="M82 141 A48 48 0 0 1 62 94" fill="none" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
          <text x="70" y="110" className="fill-amber-600 text-[12px] dark:fill-amber-300">theta</text>
          <circle cx="34" cy="166" r="3" className="fill-slate-700 dark:fill-stone-200" />
          <text x="40" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">z2</text>
        </>
      ) : (
        <>
          <Arrow x1="34" y1="166" x2="142" y2="78" label="z=a+ib" labelX="118" labelY="70" />
          <line x1="142" y1="78" x2="142" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
          <line x1="34" y1="78" x2="142" y2="78" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
          <path d="M58 166 A36 36 0 0 1 65 141" fill="none" className="stroke-amber-600 dark:stroke-amber-300" strokeWidth="2" />
          <text x="67" y="151" className="fill-amber-600 text-[12px] dark:fill-amber-300">arg z</text>
          <text x="138" y="180" className="fill-slate-700 text-[12px] dark:fill-stone-200">a</text>
          <text x="16" y="82" className="fill-slate-700 text-[12px] dark:fill-stone-200">b</text>
        </>
      )}
    </DiagramFrame>
  );
}

function MathVectorDiagram({ volume = false }) {
  return (
    <DiagramFrame title={volume ? "scalar triple product volume" : "vector angle and area"}>
      <DiagramDefs />
      {volume ? (
        <>
          <path d="M54 148 L128 148 L166 112 L91 112 Z" className="fill-amber-100 stroke-slate-700 dark:fill-amber-500/10 dark:stroke-stone-300" strokeWidth="2" />
          <path d="M54 148 L84 72 L158 72 L128 148 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
          <path d="M128 148 L158 72 L196 36 L166 112 Z" className="fill-slate-50 stroke-slate-700 dark:fill-stone-950 dark:stroke-stone-300" strokeWidth="2" />
          <Arrow x1="54" y1="148" x2="128" y2="148" label="a" labelX="92" labelY="164" />
          <Arrow x1="54" y1="148" x2="91" y2="112" label="b" labelX="74" labelY="120" />
          <Arrow x1="54" y1="148" x2="84" y2="72" label="c" labelX="62" labelY="88" />
        </>
      ) : (
        <>
          <Arrow x1="48" y1="150" x2="160" y2="150" label="a" labelX="164" labelY="154" />
          <Arrow x1="48" y1="150" x2="118" y2="68" label="b" labelX="122" labelY="72" />
          <path d="M78 150 A34 34 0 0 1 71 122" fill="none" className="stroke-amber-600 dark:stroke-amber-300" strokeWidth="2" />
          <text x="80" y="135" className="fill-amber-600 text-[12px] dark:fill-amber-300">theta</text>
          <path d="M48 150 L160 150 L190 68 L118 68 Z" className="fill-amber-100/60 stroke-slate-500 dark:fill-amber-500/10 dark:stroke-stone-500" strokeWidth="2" strokeDasharray="4 4" />
          <text x="112" y="104" className="fill-slate-700 text-[12px] dark:fill-stone-200">|a x b|</text>
        </>
      )}
    </DiagramFrame>
  );
}

function MathPointPlaneDiagram() {
  return (
    <DiagramFrame title="point to plane">
      <DiagramDefs />
      <path d="M44 134 L154 98 L194 124 L82 162 Z" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
      <circle cx="118" cy="52" r="4" className="fill-amber-500" />
      <line x1="118" y1="52" x2="118" y2="119" className="stroke-amber-500" strokeDasharray="5 5" strokeWidth="3" />
      <circle cx="118" cy="119" r="3" className="fill-slate-700 dark:fill-stone-200" />
      <Arrow x1="118" y1="119" x2="152" y2="107" label="n" labelX="156" labelY="109" />
      <text x="125" y="54" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">P</text>
      <text x="124" y="92" className="fill-amber-600 text-[12px] dark:fill-amber-300">distance</text>
    </DiagramFrame>
  );
}

function MathSkewLinesDiagram() {
  return (
    <DiagramFrame title="skew lines">
      <DiagramDefs />
      <line x1="42" y1="142" x2="162" y2="90" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="72" y1="58" x2="186" y2="146" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="103" y1="116" x2="131" y2="104" className="stroke-amber-500" strokeWidth="3" strokeDasharray="5 5" />
      <text x="44" y="154" className="fill-slate-700 text-[12px] dark:fill-stone-200">L1</text>
      <text x="170" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">L2</text>
      <text x="110" y="100" className="fill-amber-600 text-[12px] dark:fill-amber-300">d</text>
    </DiagramFrame>
  );
}

function MathSphereDiagram() {
  return (
    <DiagramFrame title="sphere">
      <DiagramDefs />
      <Axis xLabel="x" yLabel="z" />
      <circle cx="112" cy="98" r="52" className="fill-amber-100/50 stroke-slate-700 dark:fill-amber-500/10 dark:stroke-stone-200" strokeWidth="2.5" />
      <ellipse cx="112" cy="98" rx="52" ry="16" className="fill-transparent stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" strokeWidth="2" />
      <circle cx="112" cy="98" r="3" className="fill-slate-700 dark:fill-stone-200" />
      <Arrow x1="112" y1="98" x2="151" y2="65" label="r" labelX="154" labelY="64" />
      <text x="78" y="94" className="fill-slate-700 text-[12px] dark:fill-stone-200">(-u,-v,-w)</text>
    </DiagramFrame>
  );
}

function MathTriangleLabelsDiagram() {
  return (
    <DiagramFrame title="standard triangle labels">
      <DiagramDefs />
      <path d="M42 148 L178 148 L88 48 Z" className="fill-amber-100/50 stroke-slate-700 dark:fill-amber-500/10 dark:stroke-stone-200" strokeWidth="2.5" />
      <text x="84" y="42" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">A</text>
      <text x="28" y="156" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">B</text>
      <text x="183" y="156" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">C</text>
      <text x="128" y="100" className="fill-amber-700 text-[13px] font-bold dark:fill-amber-300">b</text>
      <text x="55" y="95" className="fill-amber-700 text-[13px] font-bold dark:fill-amber-300">c</text>
      <text x="107" y="165" className="fill-amber-700 text-[13px] font-bold dark:fill-amber-300">a</text>
      <path d="M65 148 A24 24 0 0 1 51 129" fill="none" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
      <path d="M155 148 A26 26 0 0 0 169 126" fill="none" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
      <path d="M80 60 A24 24 0 0 0 101 59" fill="none" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
    </DiagramFrame>
  );
}

function MathTriangleCirclesDiagram() {
  return (
    <DiagramFrame title="incircle and circumcircle">
      <DiagramDefs />
      <circle cx="110" cy="100" r="73" className="fill-transparent stroke-slate-400 dark:stroke-stone-500" strokeDasharray="5 5" strokeWidth="2" />
      <path d="M42 148 L178 148 L88 48 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <circle cx="101" cy="115" r="30" className="fill-amber-100/50 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
      <circle cx="110" cy="100" r="3" className="fill-slate-700 dark:fill-stone-200" />
      <circle cx="101" cy="115" r="3" className="fill-amber-500" />
      <Arrow x1="101" y1="115" x2="130" y2="107" label="r" labelX="134" labelY="107" />
      <Arrow x1="110" y1="100" x2="168" y2="57" label="R" labelX="172" labelY="57" />
      <text x="116" y="96" className="fill-slate-700 text-[12px] dark:fill-stone-200">O</text>
      <text x="84" y="113" className="fill-amber-700 text-[12px] dark:fill-amber-300">I</text>
    </DiagramFrame>
  );
}

function MathPedalTriangleDiagram() {
  return (
    <DiagramFrame title="pedal triangle">
      <DiagramDefs />
      <path d="M42 150 L178 150 L92 42 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <circle cx="98" cy="88" r="4" className="fill-amber-500" />
      <line x1="98" y1="88" x2="98" y2="150" className="stroke-amber-500" strokeDasharray="5 5" strokeWidth="2.5" />
      <line x1="98" y1="88" x2="69" y2="84" className="stroke-amber-500" strokeDasharray="5 5" strokeWidth="2.5" />
      <line x1="98" y1="88" x2="138" y2="99" className="stroke-amber-500" strokeDasharray="5 5" strokeWidth="2.5" />
      <path d="M98 150 L69 84 L138 99 Z" className="fill-amber-100/50 stroke-amber-500 dark:fill-amber-500/10" strokeWidth="2.5" />
      <text x="103" y="86" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">P</text>
      <text x="100" y="165" className="fill-amber-700 text-[12px] dark:fill-amber-300">K</text>
      <text x="57" y="82" className="fill-amber-700 text-[12px] dark:fill-amber-300">L</text>
      <text x="142" y="99" className="fill-amber-700 text-[12px] dark:fill-amber-300">M</text>
    </DiagramFrame>
  );
}

function ChemMoleYMapDiagram() {
  return (
    <DiagramFrame title="mole conversion y-map">
      <DiagramDefs />
      <circle cx="110" cy="94" r="28" className="fill-amber-100 stroke-slate-700 dark:fill-amber-500/10 dark:stroke-stone-200" strokeWidth="2.5" />
      <text x="95" y="99" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-200">Mole</text>
      <rect x="24" y="36" width="58" height="25" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="35" y="53" className="fill-slate-700 text-[12px] dark:fill-stone-200">Number</text>
      <rect x="140" y="36" width="58" height="25" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="149" y="53" className="fill-slate-700 text-[12px] dark:fill-stone-200">STP vol.</text>
      <rect x="82" y="150" width="56" height="25" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="96" y="167" className="fill-slate-700 text-[12px] dark:fill-stone-200">Mass</text>
      <Arrow x1="84" y1="58" x2="91" y2="73" label="÷ NA" labelX="48" labelY="80" />
      <Arrow x1="94" y1="70" x2="82" y2="56" label="x NA" labelX="74" labelY="43" />
      <Arrow x1="136" y1="72" x2="152" y2="58" label="x 22.4 L" labelX="140" labelY="78" />
      <Arrow x1="146" y1="58" x2="130" y2="73" label="÷ 22.4 L" labelX="130" labelY="37" />
      <Arrow x1="108" y1="123" x2="108" y2="149" label="x mol. wt." labelX="116" labelY="139" />
      <Arrow x1="116" y1="149" x2="116" y2="123" label="÷ mol. wt." labelX="38" labelY="139" />
    </DiagramFrame>
  );
}

function ChemMoleAnalysisDiagram() {
  return (
    <DiagramFrame title="mole-mole analysis">
      <DiagramDefs />
      <rect x="13" y="78" width="42" height="24" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="22" y="94" className="fill-slate-700 text-[12px] dark:fill-stone-200">Mass</text>
      <rect x="83" y="78" width="42" height="24" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="94" y="94" className="fill-slate-700 text-[12px] dark:fill-stone-200">Mole</text>
      <rect x="142" y="62" width="62" height="50" rx="2" className="fill-amber-100/70 stroke-slate-700 dark:fill-amber-500/10 dark:stroke-stone-300" strokeWidth="2" />
      <text x="151" y="81" className="fill-slate-700 text-[11px] dark:fill-stone-200">Mole-mole</text>
      <text x="153" y="96" className="fill-slate-700 text-[11px] dark:fill-stone-200">equation</text>
      <Arrow x1="55" y1="90" x2="83" y2="90" label="÷ wt." labelX="57" labelY="82" />
      <Arrow x1="125" y1="90" x2="142" y2="90" />
      <Arrow x1="172" y1="112" x2="116" y2="144" label="x wt." labelX="128" labelY="134" />
      <rect x="90" y="145" width="45" height="23" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="100" y="161" className="fill-slate-700 text-[12px] dark:fill-stone-200">Mass</text>
      <Arrow x1="202" y1="92" x2="202" y2="140" label="x 22.4 L" labelX="143" labelY="141" />
      <rect x="158" y="144" width="52" height="24" rx="2" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <text x="166" y="160" className="fill-slate-700 text-[12px] dark:fill-stone-200">STP vol.</text>
    </DiagramFrame>
  );
}

function ChemGasLawsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <DiagramFrame title="Boyle">
        <Axis xLabel="P" yLabel="V" />
        <path d="M48 54 C72 76 102 120 178 154" fill="none" className="stroke-amber-500" strokeWidth="3" />
      </DiagramFrame>
      <DiagramFrame title="Charles">
        <Axis xLabel="T" yLabel="V" />
        <line x1="46" y1="148" x2="178" y2="50" className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" />
      </DiagramFrame>
      <DiagramFrame title="Gay-Lussac">
        <Axis xLabel="T" yLabel="P" />
        <line x1="46" y1="148" x2="178" y2="50" className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" />
      </DiagramFrame>
    </div>
  );
}

function ChemMolecularSpeedsDiagram() {
  return (
    <DiagramFrame title="molecular speed comparison">
      <Axis xLabel="speed" yLabel="fraction" />
      <path d="M42 158 C70 132 84 82 110 74 C140 65 164 104 188 146" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <line x1="96" y1="74" x2="96" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="118" y1="78" x2="118" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="146" y1="100" x2="146" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="72" y="181" className="fill-slate-700 text-[11px] dark:fill-stone-200">MPS</text>
      <text x="108" y="181" className="fill-slate-700 text-[11px] dark:fill-stone-200">avg</text>
      <text x="136" y="181" className="fill-slate-700 text-[11px] dark:fill-stone-200">rms</text>
    </DiagramFrame>
  );
}

function ChemGalvanicCellDiagram() {
  return (
    <DiagramFrame title="galvanic cell concept">
      <DiagramDefs />
      <rect x="28" y="76" width="58" height="76" rx="5" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="134" y="76" width="58" height="76" rx="5" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="56" y1="58" x2="56" y2="130" className="stroke-amber-500" strokeWidth="5" />
      <line x1="164" y1="58" x2="164" y2="130" className="stroke-amber-500" strokeWidth="5" />
      <path d="M56 58 L56 42 L164 42 L164 58" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <Arrow x1="92" y1="42" x2="128" y2="42" label="e-" labelX="105" labelY="34" />
      <path d="M72 91 C95 68 125 68 148 91" fill="none" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" strokeWidth="2" />
      <text x="38" y="166" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">anode</text>
      <text x="146" y="166" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">cathode</text>
      <text x="38" y="96" className="fill-slate-700 text-[11px] dark:fill-stone-200">low R.P.</text>
      <text x="144" y="96" className="fill-slate-700 text-[11px] dark:fill-stone-200">high R.P.</text>
    </DiagramFrame>
  );
}

function ChemConcentrationCellDiagram() {
  return (
    <DiagramFrame title="concentration cell">
      <DiagramDefs />
      <rect x="28" y="78" width="60" height="74" rx="5" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="132" y="78" width="60" height="74" rx="5" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      <line x1="58" y1="58" x2="58" y2="130" className="stroke-amber-500" strokeWidth="5" />
      <line x1="162" y1="58" x2="162" y2="130" className="stroke-amber-500" strokeWidth="5" />
      <path d="M58 58 L58 43 L162 43 L162 58" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2.5" />
      <Arrow x1="94" y1="43" x2="126" y2="43" label="E" labelX="106" labelY="35" />
      <path d="M88 114 C101 98 119 98 132 114" fill="none" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="5 5" strokeWidth="2" />
      <text x="42" y="166" className="fill-slate-700 text-[12px] dark:fill-stone-200">C1</text>
      <text x="148" y="166" className="fill-slate-700 text-[12px] dark:fill-stone-200">C2</text>
      <text x="78" y="28" className="fill-slate-700 text-[12px] dark:fill-stone-200">same electrodes</text>
    </DiagramFrame>
  );
}

function ChemConductivityCellDiagram() {
  return (
    <DiagramFrame title="conductivity cell">
      <DiagramDefs />
      <rect x="44" y="58" width="132" height="92" rx="7" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="82" y1="42" x2="82" y2="138" className="stroke-amber-500" strokeWidth="5" />
      <line x1="138" y1="42" x2="138" y2="138" className="stroke-amber-500" strokeWidth="5" />
      <line x1="82" y1="138" x2="138" y2="138" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" strokeWidth="2" />
      <Arrow x1="82" y1="160" x2="138" y2="160" label="a" labelX="108" labelY="176" />
      <Arrow x1="154" y1="42" x2="154" y2="138" label="l" labelX="163" labelY="93" />
      <text x="66" y="32" className="fill-slate-700 text-[12px] dark:fill-stone-200">electrodes</text>
      <text x="70" y="106" className="fill-slate-700 text-[12px] dark:fill-stone-200">solution</text>
    </DiagramFrame>
  );
}

function ChemVapourPressureIdealDiagram() {
  return (
    <DiagramFrame title="vapour pressure composition">
      <Axis xLabel="XB ->" yLabel="P" />
      <line x1="44" y1="58" x2="178" y2="132" className="stroke-amber-500" strokeWidth="3" />
      <line x1="44" y1="58" x2="178" y2="58" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="44" y1="132" x2="178" y2="132" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="8" y="62" className="fill-slate-700 text-[11px] dark:fill-stone-200">PA0</text>
      <text x="8" y="136" className="fill-slate-700 text-[11px] dark:fill-stone-200">PB0</text>
      <text x="94" y="92" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">PT</text>
    </DiagramFrame>
  );
}

function ChemRaoultDeviationDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="positive deviation">
        <Axis xLabel="XB" yLabel="P" />
        <line x1="44" y1="132" x2="178" y2="58" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" strokeWidth="2" />
        <path d="M44 132 C84 90 122 58 178 58" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <text x="78" y="72" className="fill-amber-600 text-[12px] dark:fill-amber-300">Pexp &gt; ideal</text>
      </DiagramFrame>
      <DiagramFrame title="negative deviation">
        <Axis xLabel="XB" yLabel="P" />
        <line x1="44" y1="132" x2="178" y2="58" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" strokeWidth="2" />
        <path d="M44 132 C88 146 132 96 178 58" fill="none" className="stroke-amber-500" strokeWidth="3" />
        <text x="72" y="146" className="fill-amber-600 text-[12px] dark:fill-amber-300">Pexp &lt; ideal</text>
      </DiagramFrame>
    </div>
  );
}

function CubeFrame({ title, children }) {
  return (
    <DiagramFrame title={title}>
      <path d="M66 72 H140 V146 H66 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <path d="M84 50 H158 V124 H84 Z" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <path d="M66 72 L84 50 M140 72 L158 50 M140 146 L158 124 M66 146 L84 124" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      {[66, 140, 66, 140, 84, 158, 84, 158].map((x, i) => {
        const y = [72, 72, 146, 146, 50, 50, 124, 124][i];
        return <circle key={`${x}-${y}`} cx={x} cy={y} r="4" className="fill-amber-500" />;
      })}
      {children}
    </DiagramFrame>
  );
}

function ChemCubicCellsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <CubeFrame title="SC">
        <text x="96" y="168" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">Z = 1</text>
      </CubeFrame>
      <CubeFrame title="BCC">
        <circle cx="112" cy="98" r="6" className="fill-amber-500" />
        <text x="94" y="168" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">Z = 2</text>
      </CubeFrame>
      <CubeFrame title="FCC">
        {[
          [103, 72],
          [66, 109],
          [140, 109],
          [103, 146],
          [121, 50],
          [84, 87],
          [158, 87],
          [121, 124],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className="fill-amber-500" />
        ))}
        <text x="94" y="168" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">Z = 4</text>
      </CubeFrame>
    </div>
  );
}

function ChemRateCurveDiagram() {
  return (
    <DiagramFrame title="concentration-time rate">
      <Axis xLabel="t" yLabel="[R]" />
      <path d="M44 54 C72 74 98 104 128 128 C148 144 166 152 184 156" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <line x1="82" y1="86" x2="142" y2="138" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <text x="118" y="112" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">slope</text>
      <line x1="66" y1="76" x2="66" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
      <line x1="142" y1="138" x2="142" y2="166" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
    </DiagramFrame>
  );
}

function ChemFirstOrderPlotsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="t vs log C0/Ct">
        <Axis xLabel="log C0/Ct" yLabel="t" />
        <line x1="46" y1="150" x2="178" y2="52" className="stroke-amber-500" strokeWidth="3" />
        <text x="86" y="112" className="fill-amber-600 text-[12px] dark:fill-amber-300">slope 2.303/k</text>
      </DiagramFrame>
      <DiagramFrame title="t vs log Ct">
        <Axis xLabel="log Ct" yLabel="t" />
        <line x1="46" y1="52" x2="178" y2="150" className="stroke-amber-500" strokeWidth="3" />
        <text x="78" y="104" className="fill-amber-600 text-[12px] dark:fill-amber-300">slope -2.303/k</text>
      </DiagramFrame>
    </div>
  );
}

function ChemArrheniusPlotDiagram() {
  return (
    <DiagramFrame title="Arrhenius plot">
      <Axis xLabel="1/T" yLabel="ln k" />
      <line x1="48" y1="56" x2="178" y2="148" className="stroke-amber-500" strokeWidth="3" />
      <text x="78" y="98" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">slope = -Ea/R</text>
      <text x="42" y="48" className="fill-slate-700 text-[12px] dark:fill-stone-200">ln A</text>
    </DiagramFrame>
  );
}

function ChemDiagonalRelationshipDiagram() {
  return (
    <DiagramFrame title="diagonal relationship">
      <DiagramDefs />
      <text x="28" y="48" className="fill-slate-700 text-[12px] dark:fill-stone-200">2nd period</text>
      <text x="28" y="132" className="fill-slate-700 text-[12px] dark:fill-stone-200">3rd period</text>
      {[
        ["Li", 92, 46],
        ["Be", 126, 46],
        ["B", 160, 46],
        ["Na", 92, 132],
        ["Mg", 126, 132],
        ["Al", 160, 132],
        ["Si", 194, 132],
      ].map(([label, x, y]) => (
        <text key={label} x={x} y={y} className="fill-slate-800 text-[14px] font-bold dark:fill-stone-100">{label}</text>
      ))}
      <Arrow x1="101" y1="56" x2="128" y2="116" />
      <Arrow x1="134" y1="56" x2="162" y2="116" />
      <Arrow x1="168" y1="56" x2="194" y2="116" />
    </DiagramFrame>
  );
}

function ChemPeriodicTrendsDiagram() {
  return (
    <DiagramFrame title="periodic trends">
      <DiagramDefs />
      <g opacity="0.95">
        {[0, 1, 2, 3, 4, 5].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={56 + col * 17}
              y={56 + row * 17}
              width="16"
              height="16"
              className="fill-transparent stroke-slate-500 dark:stroke-stone-500"
            />
          )),
        )}
      </g>
      <Arrow x1="50" y1="42" x2="168" y2="42" label="IE, EA, EN" labelX="78" labelY="32" />
      <Arrow x1="50" y1="154" x2="50" y2="54" label="IE, EA" labelX="12" labelY="96" />
      <Arrow x1="168" y1="154" x2="58" y2="154" label="atomic radius" labelX="78" labelY="176" />
      <Arrow x1="86" y1="138" x2="152" y2="106" label="nonmetallic" labelX="112" labelY="98" />
      <Arrow x1="144" y1="132" x2="80" y2="146" label="metallic" labelX="103" labelY="126" />
    </DiagramFrame>
  );
}

function ChemFajanPolarizationDiagram() {
  return (
    <DiagramFrame title="anion polarization">
      <DiagramDefs />
      <circle cx="76" cy="96" r="9" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
      <text x="50" y="88" className="fill-slate-700 text-[12px] dark:fill-stone-200">cation</text>
      <ellipse cx="142" cy="96" rx="36" ry="25" className="fill-transparent stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
      <ellipse cx="132" cy="96" rx="30" ry="23" className="fill-transparent stroke-slate-400 dark:stroke-stone-500" strokeDasharray="3 3" />
      <text x="166" y="101" className="fill-slate-700 text-[12px] dark:fill-stone-200">anion</text>
      <Arrow x1="86" y1="96" x2="118" y2="96" label="polarisation" labelX="86" labelY="78" />
    </DiagramFrame>
  );
}

function ChemOverlapSigmaPiDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="sigma overlap">
        <DiagramDefs />
        <ellipse cx="72" cy="96" rx="26" ry="18" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
        <ellipse cx="126" cy="96" rx="26" ry="18" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
        <line x1="42" y1="96" x2="178" y2="96" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <text x="76" y="132" className="fill-slate-700 text-[12px] dark:fill-stone-200">head-on axis</text>
      </DiagramFrame>
      <DiagramFrame title="pi overlap">
        <ellipse cx="86" cy="68" rx="18" ry="31" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
        <ellipse cx="132" cy="68" rx="18" ry="31" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
        <ellipse cx="86" cy="126" rx="18" ry="31" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
        <ellipse cx="132" cy="126" rx="18" ry="31" className="fill-amber-100 stroke-amber-500 dark:fill-amber-500/15" strokeWidth="2" />
        <line x1="42" y1="96" x2="178" y2="96" className="stroke-slate-500 dark:stroke-stone-500" strokeDasharray="4 4" />
        <text x="66" y="168" className="fill-slate-700 text-[12px] dark:fill-stone-200">parallel p-orbitals</text>
      </DiagramFrame>
    </div>
  );
}

function ChemVseprShapesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <DiagramFrame title="linear">
        <DiagramDefs />
        <circle cx="110" cy="96" r="8" className="fill-amber-500" />
        <Arrow x1="110" y1="96" x2="54" y2="96" />
        <Arrow x1="110" y1="96" x2="166" y2="96" />
        <text x="84" y="130" className="fill-slate-700 text-[12px] dark:fill-stone-200">SN 2</text>
      </DiagramFrame>
      <DiagramFrame title="trigonal planar">
        <DiagramDefs />
        <circle cx="110" cy="96" r="8" className="fill-amber-500" />
        <Arrow x1="110" y1="96" x2="110" y2="42" />
        <Arrow x1="110" y1="96" x2="60" y2="132" />
        <Arrow x1="110" y1="96" x2="160" y2="132" />
        <text x="84" y="164" className="fill-slate-700 text-[12px] dark:fill-stone-200">SN 3</text>
      </DiagramFrame>
      <DiagramFrame title="tetrahedral">
        <DiagramDefs />
        <circle cx="110" cy="96" r="8" className="fill-amber-500" />
        <Arrow x1="110" y1="96" x2="78" y2="55" />
        <Arrow x1="110" y1="96" x2="154" y2="64" />
        <Arrow x1="110" y1="96" x2="72" y2="132" />
        <Arrow x1="110" y1="96" x2="152" y2="140" dashed />
        <text x="84" y="166" className="fill-slate-700 text-[12px] dark:fill-stone-200">SN 4</text>
      </DiagramFrame>
      <DiagramFrame title="trigonal bipyramidal">
        <DiagramDefs />
        <circle cx="110" cy="96" r="8" className="fill-amber-500" />
        <Arrow x1="110" y1="96" x2="110" y2="38" />
        <Arrow x1="110" y1="96" x2="110" y2="154" />
        <Arrow x1="110" y1="96" x2="58" y2="112" />
        <Arrow x1="110" y1="96" x2="162" y2="112" />
        <Arrow x1="110" y1="96" x2="110" y2="58" dashed />
        <text x="84" y="176" className="fill-slate-700 text-[12px] dark:fill-stone-200">SN 5</text>
      </DiagramFrame>
      <DiagramFrame title="octahedral">
        <DiagramDefs />
        <circle cx="110" cy="96" r="8" className="fill-amber-500" />
        <Arrow x1="110" y1="96" x2="110" y2="38" />
        <Arrow x1="110" y1="96" x2="110" y2="154" />
        <Arrow x1="110" y1="96" x2="52" y2="96" />
        <Arrow x1="110" y1="96" x2="168" y2="96" />
        <Arrow x1="110" y1="96" x2="72" y2="132" dashed />
        <Arrow x1="110" y1="96" x2="148" y2="60" dashed />
        <text x="84" y="176" className="fill-slate-700 text-[12px] dark:fill-stone-200">SN 6</text>
      </DiagramFrame>
      <DiagramFrame title="pentagonal bipyramidal">
        <DiagramDefs />
        <circle cx="110" cy="96" r="8" className="fill-amber-500" />
        <Arrow x1="110" y1="96" x2="110" y2="36" />
        <Arrow x1="110" y1="96" x2="110" y2="156" />
        {[18, 90, 162, 234, 306].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return <Arrow key={angle} x1="110" y1="96" x2={110 + Math.cos(rad) * 48} y2={96 + Math.sin(rad) * 31} />;
        })}
        <text x="84" y="176" className="fill-slate-700 text-[12px] dark:fill-stone-200">SN 7</text>
      </DiagramFrame>
    </div>
  );
}

function ChemMoEnergyDiagram() {
  const levels = [
    ["sigma 1s", 158],
    ["sigma* 1s", 142],
    ["sigma 2s", 124],
    ["sigma* 2s", 106],
    ["sigma 2pz", 88],
    ["pi 2px = pi 2py", 72],
    ["pi* 2px = pi* 2py", 56],
    ["sigma* 2pz", 40],
  ];
  return (
    <DiagramFrame title="MO order for O2 and F2">
      <Axis xLabel="" yLabel="E" />
      {levels.map(([label, y]) => (
        <g key={label}>
          <line x1="70" y1={y} x2="132" y2={y} className="stroke-amber-500" strokeWidth="2.5" />
          <text x="138" y={y + 4} className="fill-slate-700 text-[10px] dark:fill-stone-200">{label}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function ChemDipoleResultantDiagram() {
  return (
    <DiagramFrame title="resultant dipole">
      <DiagramDefs />
      <Arrow x1="66" y1="132" x2="152" y2="132" label="Q" labelX="106" labelY="150" />
      <Arrow x1="66" y1="132" x2="128" y2="70" label="P" labelX="102" labelY="82" />
      <Arrow x1="66" y1="132" x2="166" y2="80" label="R" labelX="144" labelY="94" dashed />
      <path d="M88 132 A34 34 0 0 1 101 103" fill="none" className="stroke-slate-500 dark:stroke-stone-500" />
      <text x="98" y="124" className="fill-slate-700 text-[12px] dark:fill-stone-200">theta</text>
    </DiagramFrame>
  );
}

function ChemCoordinationGeometriesDiagram() {
  const ligand = "fill-amber-500 stroke-amber-700 dark:fill-yellow-300 dark:stroke-yellow-100";
  const metal = "fill-slate-900 stroke-slate-900 dark:fill-stone-100 dark:stroke-stone-100";
  const bond = "stroke-slate-500 dark:stroke-stone-400";
  return (
    <DiagramFrame title="coordination geometries">
      <g transform="translate(20 -25) scale(0.82)">
      <g transform="translate(22 44)">
        <line x1="12" y1="24" x2="74" y2="24" className={bond} strokeWidth="2" />
        <circle cx="43" cy="24" r="8" className={metal} />
        <circle cx="12" cy="24" r="5" className={ligand} />
        <circle cx="74" cy="24" r="5" className={ligand} />
        <text x="15" y="62" className="fill-slate-700 text-[12px] dark:fill-stone-200">CN=2 linear</text>
      </g>
      <g transform="translate(128 34)">
        <line x1="42" y1="40" x2="42" y2="8" className={bond} strokeWidth="2" />
        <line x1="42" y1="40" x2="14" y2="58" className={bond} strokeWidth="2" />
        <line x1="42" y1="40" x2="72" y2="58" className={bond} strokeWidth="2" />
        <line x1="42" y1="40" x2="72" y2="22" className={bond} strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="42" cy="40" r="8" className={metal} />
        <circle cx="42" cy="8" r="5" className={ligand} />
        <circle cx="14" cy="58" r="5" className={ligand} />
        <circle cx="72" cy="58" r="5" className={ligand} />
        <circle cx="72" cy="22" r="5" className={ligand} />
        <text x="0" y="86" className="fill-slate-700 text-[12px] dark:fill-stone-200">CN=4 tetrahedral</text>
      </g>
      <g transform="translate(24 142)">
        <line x1="42" y1="10" x2="42" y2="74" className={bond} strokeWidth="2" />
        <line x1="10" y1="42" x2="74" y2="42" className={bond} strokeWidth="2" />
        <circle cx="42" cy="42" r="8" className={metal} />
        <circle cx="42" cy="10" r="5" className={ligand} />
        <circle cx="42" cy="74" r="5" className={ligand} />
        <circle cx="10" cy="42" r="5" className={ligand} />
        <circle cx="74" cy="42" r="5" className={ligand} />
        <text x="0" y="100" className="fill-slate-700 text-[12px] dark:fill-stone-200">CN=4 square planar</text>
      </g>
      <g transform="translate(146 132)">
        <line x1="42" y1="42" x2="42" y2="4" className={bond} strokeWidth="2" />
        <line x1="42" y1="42" x2="42" y2="80" className={bond} strokeWidth="2" />
        <line x1="10" y1="42" x2="74" y2="42" className={bond} strokeWidth="2" />
        <line x1="22" y1="64" x2="62" y2="20" className={bond} strokeWidth="2" />
        <circle cx="42" cy="42" r="8" className={metal} />
        {[ [42,4], [42,80], [10,42], [74,42], [22,64], [62,20] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" className={ligand} />
        ))}
        <text x="8" y="106" className="fill-slate-700 text-[12px] dark:fill-stone-200">CN=6 octahedral</text>
      </g>
      </g>
    </DiagramFrame>
  );
}

function ChemCisTransSquarePlanarDiagram() {
  const bond = "stroke-slate-500 dark:stroke-stone-400";
  const metal = "fill-slate-900 dark:fill-stone-100";
  const ligandA = "fill-sky-500 dark:fill-sky-300";
  const ligandB = "fill-amber-500 dark:fill-yellow-300";
  const renderSquarePlanar = (x, title, trans = false) => (
    <g transform={`translate(${x} 70)`}>
      <line x1="50" y1="10" x2="50" y2="90" className={bond} strokeWidth="2" />
      <line x1="10" y1="50" x2="90" y2="50" className={bond} strokeWidth="2" />
      <circle cx="50" cy="50" r="8" className={metal} />
      <text x="45" y="54" className="fill-white text-[10px] dark:fill-slate-900">Pt</text>
      {trans ? (
        <>
          <circle cx="50" cy="10" r="7" className={ligandB} />
          <circle cx="50" cy="90" r="7" className={ligandB} />
          <circle cx="10" cy="50" r="7" className={ligandA} />
          <circle cx="90" cy="50" r="7" className={ligandA} />
          <text x="43" y="6" className="fill-slate-700 text-[11px] dark:fill-stone-200">Cl</text>
          <text x="43" y="108" className="fill-slate-700 text-[11px] dark:fill-stone-200">Cl</text>
        </>
      ) : (
        <>
          <circle cx="50" cy="10" r="7" className={ligandB} />
          <circle cx="90" cy="50" r="7" className={ligandB} />
          <circle cx="10" cy="50" r="7" className={ligandA} />
          <circle cx="50" cy="90" r="7" className={ligandA} />
          <text x="43" y="6" className="fill-slate-700 text-[11px] dark:fill-stone-200">Cl</text>
          <text x="94" y="54" className="fill-slate-700 text-[11px] dark:fill-stone-200">Cl</text>
        </>
      )}
      <text x="18" y="126" className="fill-slate-700 text-[13px] font-semibold dark:fill-stone-200">{title}</text>
    </g>
  );
  return (
    <DiagramFrame title="square planar cis/trans">
      <g transform="translate(0 -22) scale(0.95)">
        {renderSquarePlanar(30, "cis")}
        {renderSquarePlanar(150, "trans", true)}
      </g>
    </DiagramFrame>
  );
}

function ChemOpticalIsomersDiagram() {
  const bond = "stroke-slate-500 dark:stroke-stone-400";
  const metal = "fill-slate-900 dark:fill-stone-100";
  const ligand = "fill-amber-500 dark:fill-yellow-300";
  const renderIsomer = (x, label, flip = 1) => (
    <g transform={`translate(${x} 60) scale(${flip} 1)`}>
      <line x1="0" y1="70" x2="70" y2="20" className={bond} strokeWidth="2" />
      <line x1="0" y1="20" x2="70" y2="70" className={bond} strokeWidth="2" />
      <line x1="35" y1="5" x2="35" y2="85" className={bond} strokeWidth="2" />
      <circle cx="35" cy="45" r="9" className={metal} />
      {[ [0,20], [0,70], [35,5], [35,85], [70,20], [70,70] ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" className={ligand} />
      ))}
      <text x="12" y="116" transform={`scale(${flip} 1)`} className="fill-slate-700 text-[13px] font-semibold dark:fill-stone-200">{label}</text>
    </g>
  );
  return (
    <DiagramFrame title="optical pair">
      <g transform="translate(14 -10) scale(0.84)">
        {renderIsomer(48, "d-form")}
        <line x1="136" y1="48" x2="136" y2="190" className="stroke-slate-300 dark:stroke-stone-600" strokeWidth="2" strokeDasharray="5 5" />
        {renderIsomer(226, "l-form", -1)}
        <text x="92" y="220" className="fill-slate-700 text-[12px] dark:fill-stone-200">mirror image pair: [Co(en)3]3+</text>
      </g>
    </DiagramFrame>
  );
}

function ChemCftSplittingDiagram() {
  const level = "stroke-amber-500 dark:stroke-yellow-300";
  return (
    <DiagramFrame title="crystal field splitting">
      <g transform="translate(18 0) scale(0.68)">
      <text x="42" y="28" className="fill-slate-700 text-[13px] font-semibold dark:fill-stone-200">octahedral</text>
      <line x1="42" y1="118" x2="116" y2="118" className="stroke-slate-400 dark:stroke-stone-500" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="50" y1="74" x2="82" y2="74" className={level} strokeWidth="3" />
      <line x1="86" y1="74" x2="118" y2="74" className={level} strokeWidth="3" />
      <text x="124" y="78" className="fill-slate-700 text-[12px] dark:fill-stone-200">eg +0.6Δo</text>
      <line x1="50" y1="152" x2="76" y2="152" className={level} strokeWidth="3" />
      <line x1="80" y1="152" x2="106" y2="152" className={level} strokeWidth="3" />
      <line x1="110" y1="152" x2="136" y2="152" className={level} strokeWidth="3" />
      <text x="142" y="156" className="fill-slate-700 text-[12px] dark:fill-stone-200">t2g -0.4Δo</text>
      <text x="44" y="124" className="fill-slate-500 text-[11px] dark:fill-stone-400">barycenter</text>
      <text x="40" y="220" className="fill-slate-700 text-[13px] font-semibold dark:fill-stone-200">tetrahedral: Δt = 4/9 Δo</text>
      <line x1="42" y1="244" x2="116" y2="244" className="stroke-slate-400 dark:stroke-stone-500" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="50" y1="214" x2="76" y2="214" className={level} strokeWidth="3" />
      <line x1="80" y1="214" x2="106" y2="214" className={level} strokeWidth="3" />
      <line x1="110" y1="214" x2="136" y2="214" className={level} strokeWidth="3" />
      <text x="142" y="218" className="fill-slate-700 text-[12px] dark:fill-stone-200">t2g +0.4Δt</text>
      <line x1="50" y1="270" x2="82" y2="270" className={level} strokeWidth="3" />
      <line x1="86" y1="270" x2="118" y2="270" className={level} strokeWidth="3" />
      <text x="124" y="274" className="fill-slate-700 text-[12px] dark:fill-stone-200">eg -0.6Δt</text>
      </g>
    </DiagramFrame>
  );
}

function ChemFrothFlotationDiagram() {
  return (
    <DiagramFrame title="froth flotation">
      <g transform="translate(22 4) scale(0.78)">
      <rect x="58" y="72" width="156" height="132" rx="8" fill="none" className="stroke-slate-600 dark:stroke-stone-300" strokeWidth="3" />
      <path d="M62 112 C90 96, 116 122, 146 106 S194 118, 210 102" fill="none" className="stroke-sky-500 dark:stroke-sky-300" strokeWidth="3" />
      <path d="M66 124 L206 124 L206 200 L66 200 Z" className="fill-sky-100/60 dark:fill-sky-500/20" />
      {[82, 104, 126, 150, 176, 196].map((cx, i) => (
        <circle key={cx} cx={cx} cy={94 - (i % 2) * 10} r="8" className="fill-white stroke-sky-400 dark:fill-stone-900 dark:stroke-sky-300" strokeWidth="2" />
      ))}
      <Arrow x1="136" y1="200" x2="136" y2="146" label="air" labelX="146" labelY="178" />
      <circle cx="96" cy="172" r="8" className="fill-slate-700 dark:fill-stone-300" />
      <circle cx="168" cy="164" r="8" className="fill-slate-700 dark:fill-stone-300" />
      <text x="70" y="224" className="fill-slate-700 text-[12px] dark:fill-stone-200">sulphide ore + pine oil froth</text>
      </g>
    </DiagramFrame>
  );
}

function ChemElectrolyticRefiningDiagram() {
  return (
    <DiagramFrame title="electrolytic refining">
      <g transform="translate(22 2) scale(0.78)">
      <rect x="48" y="76" width="176" height="130" rx="8" fill="none" className="stroke-slate-600 dark:stroke-stone-300" strokeWidth="3" />
      <rect x="82" y="54" width="18" height="112" rx="3" className="fill-amber-700 dark:fill-yellow-500" />
      <rect x="174" y="54" width="18" height="112" rx="3" className="fill-amber-400 dark:fill-yellow-200" />
      <path d="M52 118 L220 118 L220 202 L52 202 Z" className="fill-sky-100/60 dark:fill-sky-500/20" />
      <text x="62" y="44" className="fill-slate-700 text-[12px] dark:fill-stone-200">impure anode</text>
      <text x="156" y="44" className="fill-slate-700 text-[12px] dark:fill-stone-200">pure cathode</text>
      <Arrow x1="110" y1="100" x2="164" y2="100" label="M ions" labelX="122" labelY="90" />
      <text x="88" y="228" className="fill-slate-700 text-[12px] dark:fill-stone-200">Cu, Ni, Al in source list</text>
      </g>
    </DiagramFrame>
  );
}

function ChemZoneRefiningDiagram() {
  return (
    <DiagramFrame title="zone refining">
      <g transform="translate(18 0) scale(0.82)">
      <rect x="42" y="116" width="188" height="34" rx="17" className="fill-slate-200 stroke-slate-500 dark:fill-stone-800 dark:stroke-stone-300" strokeWidth="2" />
      <rect x="104" y="108" width="34" height="50" rx="10" className="fill-amber-400/80 stroke-amber-700 dark:fill-yellow-300/80 dark:stroke-yellow-100" strokeWidth="2" />
      <Arrow x1="86" y1="184" x2="166" y2="184" label="moving molten zone" labelX="80" labelY="206" />
      <text x="44" y="88" className="fill-slate-700 text-[12px] dark:fill-stone-200">impure solid</text>
      <text x="166" y="88" className="fill-slate-700 text-[12px] dark:fill-stone-200">purified solid</text>
      <text x="60" y="232" className="fill-slate-700 text-[12px] dark:fill-stone-200">used for high purity Si and Ge</text>
      </g>
    </DiagramFrame>
  );
}

function ChemPBlockTrendsDiagram() {
  return (
    <DiagramFrame title="p-block trends">
      <DiagramDefs />
      <rect x="56" y="42" width="108" height="92" rx="2" className="fill-slate-100 stroke-slate-600 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
      {["B", "C", "N", "O", "F", "Ne", "Al", "Si", "P", "S", "Cl", "Ar", "Ga", "Ge", "As", "Se", "Br", "Kr", "In", "Sn", "Sb", "Te", "I", "Xe", "Tl", "Pb", "Bi", "Po", "At", "Rn"].map((el, index) => {
        const col = index % 6;
        const row = Math.floor(index / 6);
        return (
          <text key={el} x={65 + col * 17} y={59 + row * 17} className="fill-slate-700 text-[11px] dark:fill-stone-200">
            {el}
          </text>
        );
      })}
      <Arrow x1="64" y1="28" x2="154" y2="28" label="EN, IE, oxidizing power" labelX="44" labelY="20" />
      <Arrow x1="44" y1="46" x2="44" y2="130" label="" />
      <text x="13" y="78" className="fill-slate-700 text-[10px] dark:fill-stone-200">radius</text>
      <text x="6" y="92" className="fill-slate-700 text-[10px] dark:fill-stone-200">metallic</text>
      <text x="11" y="106" className="fill-slate-700 text-[10px] dark:fill-stone-200">character</text>
      <Arrow x1="166" y1="130" x2="166" y2="46" label="" />
      <text x="174" y="76" className="fill-slate-700 text-[10px] dark:fill-stone-200">EN, IE</text>
      <text x="174" y="90" className="fill-slate-700 text-[10px] dark:fill-stone-200">oxidizing</text>
      <text x="174" y="104" className="fill-slate-700 text-[10px] dark:fill-stone-200">power</text>
      <Arrow x1="154" y1="152" x2="64" y2="152" label="radius, metallic character" labelX="43" labelY="171" />
    </DiagramFrame>
  );
}

function ChemSilicateTetrahedraDiagram() {
  return (
    <DiagramFrame title="silicate units">
      <g transform="translate(10 4)">
        <polygon points="54,34 22,98 86,98" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <line x1="54" y1="34" x2="54" y2="122" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
        <circle cx="54" cy="72" r="5" className="fill-slate-900 dark:fill-stone-100" />
        {[ [54,34], [22,98], [86,98], [54,122] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" className="fill-amber-500 dark:fill-yellow-300" />
        ))}
        <text x="44" y="78" className="fill-white text-[9px] dark:fill-slate-900">Si</text>
        <text x="15" y="148" className="fill-slate-700 text-[12px] dark:fill-stone-200">SiO4 tetrahedron</text>
      </g>
      <g transform="translate(118 16)">
        <polygon points="36,34 6,94 66,94" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <polygon points="86,34 56,94 116,94" fill="none" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        <line x1="66" y1="94" x2="56" y2="94" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="2" />
        {[ [36,34], [6,94], [66,94], [86,34], [116,94], [56,94] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" className="fill-amber-500 dark:fill-yellow-300" />
        ))}
        <circle cx="36" cy="70" r="4" className="fill-slate-900 dark:fill-stone-100" />
        <circle cx="86" cy="70" r="4" className="fill-slate-900 dark:fill-stone-100" />
        <text x="18" y="136" className="fill-slate-700 text-[12px] dark:fill-stone-200">shared oxygen</text>
      </g>
    </DiagramFrame>
  );
}

function ChemXef2LinearDiagram() {
  return (
    <DiagramFrame title="XeF2 linear">
      <line x1="50" y1="96" x2="170" y2="96" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="3" />
      <circle cx="50" cy="96" r="18" className="fill-amber-400 stroke-amber-700 dark:fill-yellow-300 dark:stroke-yellow-100" strokeWidth="2" />
      <circle cx="110" cy="96" r="22" className="fill-slate-900 stroke-slate-900 dark:fill-stone-100 dark:stroke-stone-100" strokeWidth="2" />
      <circle cx="170" cy="96" r="18" className="fill-amber-400 stroke-amber-700 dark:fill-yellow-300 dark:stroke-yellow-100" strokeWidth="2" />
      <text x="45" y="101" className="fill-slate-900 text-[14px] font-bold">F</text>
      <text x="100" y="102" className="fill-white text-[14px] font-bold dark:fill-slate-900">Xe</text>
      <text x="165" y="101" className="fill-slate-900 text-[14px] font-bold">F</text>
      <path d="M76 124 A52 52 0 0 0 144 124" fill="none" className="stroke-slate-400 dark:stroke-stone-500" strokeDasharray="4 4" />
      <text x="90" y="150" className="fill-slate-700 text-[12px] dark:fill-stone-200">linear geometry</text>
    </DiagramFrame>
  );
}

function ChemDblockDdTransitionDiagram() {
  const level = "stroke-slate-700 dark:stroke-stone-200";
  const orbital = "fill-slate-200 stroke-slate-500 dark:fill-stone-700 dark:stroke-stone-300";
  return (
    <DiagramFrame title="d-d transition">
      <line x1="32" y1="62" x2="94" y2="62" className={level} strokeWidth="2" />
      <circle cx="50" cy="46" r="16" className={orbital} />
      <circle cx="78" cy="46" r="16" className={orbital} />
      <text x="42" y="84" className="fill-slate-700 text-[10px] dark:fill-stone-200">eg</text>
      <line x1="32" y1="128" x2="112" y2="128" className={level} strokeWidth="2" />
      <circle cx="50" cy="112" r="15" className={orbital} />
      <circle cx="78" cy="112" r="15" className={orbital} />
      <circle cx="106" cy="112" r="15" className={orbital} />
      <text x="40" y="150" className="fill-slate-700 text-[10px] dark:fill-stone-200">t2g</text>
      <Arrow x1="136" y1="116" x2="136" y2="62" label="hν" labelX="146" labelY="90" />
      <line x1="156" y1="62" x2="208" y2="62" className={level} strokeWidth="2" />
      <circle cx="174" cy="46" r="16" className={orbital} />
      <circle cx="202" cy="46" r="16" className={orbital} />
      <text x="172" y="43" className="fill-slate-900 text-[14px] dark:fill-stone-100">↑</text>
      <line x1="156" y1="128" x2="212" y2="128" className={level} strokeWidth="2" />
      <circle cx="174" cy="112" r="15" className={orbital} />
      <circle cx="202" cy="112" r="15" className={orbital} />
      <text x="157" y="170" className="fill-slate-700 text-[12px] dark:fill-stone-200">absorbed colour</text>
    </DiagramFrame>
  );
}

function ChemCationGroupFlowDiagram() {
  return (
    <DiagramFrame title="cation group sequence">
      <DiagramDefs />
      <g transform="translate(8 10) scale(0.92)">
        {[
          ["Original", 78, 10],
          ["I", 18, 48],
          ["II", 138, 48],
          ["III", 18, 86],
          ["IV", 138, 86],
          ["V", 18, 124],
          ["VI", 138, 124],
        ].map(([label, x, y]) => (
          <g key={label}>
            <rect x={x} y={y} width="58" height="23" rx="4" className="fill-slate-100 stroke-slate-700 dark:fill-stone-900 dark:stroke-stone-300" strokeWidth="2" />
            <text x={x + 12} y={y + 16} className="fill-slate-700 text-[11px] font-semibold dark:fill-stone-200">{label}</text>
          </g>
        ))}
        <Arrow x1="106" y1="34" x2="48" y2="48" label="dil. HCl" labelX="36" labelY="38" />
        <Arrow x1="136" y1="34" x2="168" y2="48" label="filtrate" labelX="146" labelY="38" />
        <Arrow x1="168" y1="71" x2="48" y2="86" label="H2S" labelX="96" labelY="78" />
        <Arrow x1="48" y1="109" x2="168" y2="86" label="NH4OH" labelX="84" labelY="102" />
        <Arrow x1="168" y1="109" x2="48" y2="124" label="(NH4)2CO3" labelX="74" labelY="124" />
        <Arrow x1="76" y1="135" x2="138" y2="135" label="filtrate" labelX="96" labelY="153" />
      </g>
    </DiagramFrame>
  );
}

function ChemOrganicInductiveDiagram() {
  return (
    <DiagramFrame title="inductive effect">
      <DiagramDefs />
      <g className="fill-slate-800 text-[15px] font-semibold dark:fill-stone-100">
        <text x="28" y="98">C4</text>
        <text x="74" y="98">C3</text>
        <text x="120" y="98">C2</text>
        <text x="166" y="98">C1</text>
        <text x="196" y="98">Cl</text>
      </g>
      <g className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2">
        <line x1="54" y1="92" x2="72" y2="92" />
        <line x1="100" y1="92" x2="118" y2="92" />
        <line x1="146" y1="92" x2="164" y2="92" />
        <line x1="190" y1="92" x2="196" y2="92" />
      </g>
      <Arrow x1="52" y1="75" x2="72" y2="75" />
      <Arrow x1="98" y1="75" x2="118" y2="75" />
      <Arrow x1="144" y1="75" x2="166" y2="75" />
      <Arrow x1="184" y1="75" x2="200" y2="75" />
      <text x="69" y="55" className="fill-amber-600 text-[11px] font-bold dark:fill-yellow-300">δδδ+</text>
      <text x="116" y="55" className="fill-amber-600 text-[11px] font-bold dark:fill-yellow-300">δδ+</text>
      <text x="164" y="55" className="fill-amber-600 text-[11px] font-bold dark:fill-yellow-300">δ+</text>
      <text x="196" y="55" className="fill-sky-700 text-[11px] font-bold dark:fill-sky-300">δ-</text>
      <text x="34" y="142" className="fill-slate-600 text-[12px] dark:fill-stone-300">electron withdrawal by -Cl through σ bonds</text>
    </DiagramFrame>
  );
}

function ChemOrganicResonanceDiagram() {
  return (
    <DiagramFrame title="resonance">
      <DiagramDefs />
      <g className="fill-slate-800 text-[16px] font-semibold dark:fill-stone-100">
        <text x="16" y="76">CH2=CH-CH=CH2</text>
        <text x="44" y="132">CH2-CH=CH-CH2</text>
      </g>
      <path d="M74 52 C84 34 110 34 120 52" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <path d="M122 52 C132 34 154 34 164 52" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <Arrow x1="88" y1="94" x2="132" y2="94" />
      <text x="34" y="116" className="fill-slate-600 text-[11px] dark:fill-stone-300">canonical forms contribute to hybrid</text>
      <text x="40" y="134" className="fill-sky-700 text-[14px] font-bold dark:fill-sky-300">+</text>
      <text x="174" y="134" className="fill-sky-700 text-[14px] font-bold dark:fill-sky-300">-</text>
    </DiagramFrame>
  );
}

function ChemOrganicHyperconjugationDiagram() {
  return (
    <DiagramFrame title="hyperconjugation">
      <DiagramDefs />
      <g className="fill-slate-800 text-[16px] font-semibold dark:fill-stone-100">
        <text x="22" y="82">H-C-CH=CH2</text>
        <text x="92" y="132">CH2=CH-CH2</text>
      </g>
      <line x1="36" y1="58" x2="36" y2="72" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2" />
      <path d="M42 58 C58 38 83 45 92 64" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <Arrow x1="72" y1="104" x2="112" y2="104" />
      <text x="23" y="45" className="fill-slate-600 text-[11px] dark:fill-stone-300">σ electron delocalises with p-orbital</text>
      <text x="175" y="128" className="fill-sky-700 text-[14px] font-bold dark:fill-sky-300">H+</text>
    </DiagramFrame>
  );
}

function ChemOrganicAromaticityDiagram() {
  const hex = "M75 52 L105 35 L135 52 L135 86 L105 103 L75 86 Z";
  return (
    <DiagramFrame title="aromaticity">
      <path d={hex} fill="none" className="stroke-slate-800 dark:stroke-stone-100" strokeWidth="2" />
      <circle cx="105" cy="69" r="20" fill="none" className="stroke-amber-500" strokeWidth="2" />
      <text x="28" y="132" className="fill-slate-700 text-[12px] font-semibold dark:fill-stone-200">cyclic + planar + sp2 ring</text>
      <text x="38" y="154" className="fill-slate-700 text-[13px] font-bold dark:fill-stone-100">(4n + 2)π electrons</text>
    </DiagramFrame>
  );
}

function ChemOrganicBondFissionDiagram() {
  return (
    <DiagramFrame title="homolytic fission">
      <DiagramDefs />
      <g className="fill-slate-800 text-[17px] font-semibold dark:fill-stone-100">
        <text x="38" y="86">A:B</text>
        <text x="146" y="86">A· + B·</text>
      </g>
      <Arrow x1="78" y1="80" x2="132" y2="80" label="homolysis" labelX="82" labelY="62" />
      <path d="M48 66 C44 48 64 48 60 66" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <path d="M62 66 C66 48 82 50 76 66" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <text x="36" y="124" className="fill-slate-600 text-[12px] dark:fill-stone-300">one electron goes to each fragment</text>
    </DiagramFrame>
  );
}

function ChemOrganicWurtzDiagram() {
  return (
    <DiagramFrame title="Wurtz reaction">
      <DiagramDefs />
      <g className="fill-slate-800 text-[16px] font-semibold dark:fill-stone-100">
        <text x="18" y="88">R-X + 2Na</text>
        <text x="151" y="88">R-R</text>
      </g>
      <Arrow x1="100" y1="82" x2="140" y2="82" label="ether" labelX="108" labelY="65" />
      <text x="40" y="126" className="fill-slate-600 text-[12px] dark:fill-stone-300">1° and 2° alkyl halides</text>
    </DiagramFrame>
  );
}

function ChemOrganicElectrophilicAdditionDiagram() {
  return (
    <DiagramFrame title="electrophilic addition">
      <DiagramDefs />
      <g className="fill-slate-800 text-[16px] font-semibold dark:fill-stone-100">
        <text x="26" y="62">C=C + E+</text>
        <text x="132" y="62">C-C+</text>
        <text x="24" y="132">C-C+ + Nu:</text>
        <text x="142" y="132">C-C</text>
      </g>
      <text x="158" y="82" className="fill-slate-800 text-[13px] font-semibold dark:fill-stone-100">E</text>
      <text x="148" y="153" className="fill-slate-800 text-[13px] font-semibold dark:fill-stone-100">E</text>
      <text x="178" y="153" className="fill-slate-800 text-[13px] font-semibold dark:fill-stone-100">Nu</text>
      <Arrow x1="90" y1="56" x2="124" y2="56" />
      <Arrow x1="112" y1="126" x2="134" y2="126" />
      <path d="M50 42 C66 24 86 28 92 48" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <text x="50" y="100" className="fill-slate-600 text-[11px] dark:fill-stone-300">+ on more substituted carbon</text>
    </DiagramFrame>
  );
}

function ChemOrganicSn2Diagram() {
  return (
    <DiagramFrame title="SN2 transition">
      <DiagramDefs />
      <g className="fill-slate-800 text-[15px] font-semibold dark:fill-stone-100">
        <text x="18" y="92">HO- + R-X</text>
        <text x="95" y="92">HO···R···X</text>
        <text x="166" y="92">HO-R + X-</text>
      </g>
      <Arrow x1="74" y1="86" x2="92" y2="86" />
      <Arrow x1="148" y1="86" x2="164" y2="86" />
      <path d="M31 66 C46 48 64 54 70 73" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <text x="92" y="62" className="fill-sky-700 text-[12px] font-bold dark:fill-sky-300">δ-</text>
      <text x="137" y="62" className="fill-sky-700 text-[12px] font-bold dark:fill-sky-300">δ-</text>
      <text x="54" y="134" className="fill-slate-600 text-[12px] dark:fill-stone-300">dotted transition shown in source</text>
    </DiagramFrame>
  );
}

function ChemOrganicAlcoholHalideDiagram() {
  return (
    <DiagramFrame title="alcohol to alkyl halide">
      <DiagramDefs />
      <g className="fill-slate-800 text-[16px] font-semibold dark:fill-stone-100">
        <text x="16" y="84">R-OH</text>
        <text x="88" y="84">R-OH2+</text>
        <text x="158" y="84">R-X</text>
      </g>
      <Arrow x1="58" y1="78" x2="84" y2="78" label="H+" labelX="65" labelY="61" />
      <Arrow x1="132" y1="78" x2="154" y2="78" label="-H2O, X-" labelX="116" labelY="61" />
      <text x="35" y="124" className="fill-slate-600 text-[12px] dark:fill-stone-300">SN1 route; R may rearrange</text>
    </DiagramFrame>
  );
}

function ChemOrganicWilliamsonDiagram() {
  return (
    <DiagramFrame title="Williamson synthesis">
      <DiagramDefs />
      <g className="fill-slate-800 text-[15px] font-semibold dark:fill-stone-100">
        <text x="16" y="90">R1O- + R2-X</text>
        <text x="146" y="90">R1OR2 + X-</text>
      </g>
      <Arrow x1="104" y1="84" x2="140" y2="84" label="SN2" labelX="112" labelY="67" />
      <path d="M44 62 C58 40 84 45 92 68" fill="none" className="stroke-amber-500" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <text x="42" y="126" className="fill-slate-600 text-[12px] dark:fill-stone-300">alkoxide + alkyl halide</text>
    </DiagramFrame>
  );
}

function ChemOrganicGrignardCarbonylDiagram() {
  return (
    <DiagramFrame title="Grignard alcohol family">
      <DiagramDefs />
      <g className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">
        <text x="15" y="54">H2C=O</text>
        <text x="15" y="96">R-CHO</text>
        <text x="15" y="138">R-CO-R</text>
        <text x="146" y="54">1° alcohol</text>
        <text x="146" y="96">2° alcohol</text>
        <text x="146" y="138">3° alcohol</text>
      </g>
      <Arrow x1="70" y1="48" x2="140" y2="48" label="RMgX, H3O+" labelX="78" labelY="33" />
      <Arrow x1="70" y1="90" x2="140" y2="90" label="RMgX, H3O+" labelX="78" labelY="75" />
      <Arrow x1="70" y1="132" x2="140" y2="132" label="RMgX, H3O+" labelX="78" labelY="117" />
    </DiagramFrame>
  );
}

function ChemOrganicReductionLadderDiagram() {
  return (
    <DiagramFrame title="reduction ladder">
      <DiagramDefs />
      <g className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">
        <text x="22" y="58">acid derivatives</text>
        <text x="40" y="102">carbonyl</text>
        <text x="142" y="102">alcohol</text>
        <text x="152" y="148">alkane</text>
      </g>
      <Arrow x1="86" y1="96" x2="136" y2="96" label="LiAlH4 / NaBH4" labelX="72" labelY="80" />
      <Arrow x1="105" y1="62" x2="142" y2="88" label="LiAlH4" labelX="120" labelY="61" />
      <Arrow x1="162" y1="110" x2="162" y2="138" label="red P + HI" labelX="92" labelY="132" />
    </DiagramFrame>
  );
}

function ChemOrganicOxidationLadderDiagram() {
  return (
    <DiagramFrame title="oxidation ladder">
      <DiagramDefs />
      <g className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">
        <text x="20" y="76">1° alcohol</text>
        <text x="91" y="76">aldehyde</text>
        <text x="164" y="76">acid</text>
        <text x="28" y="132">2° alcohol</text>
        <text x="128" y="132">ketone</text>
      </g>
      <Arrow x1="78" y1="70" x2="88" y2="70" />
      <Arrow x1="146" y1="70" x2="160" y2="70" />
      <Arrow x1="90" y1="126" x2="122" y2="126" />
      <text x="38" y="33" className="fill-slate-600 text-[12px] dark:fill-stone-300">strong oxidants reach acid</text>
      <text x="45" y="160" className="fill-slate-600 text-[12px] dark:fill-stone-300">3° alcohol: no reaction in listed oxidations</text>
    </DiagramFrame>
  );
}

function ChemOrganicAldolDiagram() {
  return (
    <DiagramFrame title="aldol condensation">
      <DiagramDefs />
      <g className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">
        <text x="24" y="68">2 CH3CHO</text>
        <text x="133" y="68">aldol</text>
        <text x="63" y="136">CH3CH=CHCHO</text>
      </g>
      <Arrow x1="92" y1="62" x2="126" y2="62" label="dil. NaOH" labelX="87" labelY="45" />
      <Arrow x1="148" y1="78" x2="112" y2="124" label="H+, Δ" labelX="146" labelY="108" />
      <text x="20" y="104" className="fill-slate-600 text-[12px] dark:fill-stone-300">acidic sp3 alpha-H required</text>
    </DiagramFrame>
  );
}

function ChemOrganicCannizzaroDiagram() {
  return (
    <DiagramFrame title="Cannizzaro">
      <DiagramDefs />
      <g className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">
        <text x="20" y="74">2 RCHO</text>
        <text x="132" y="58">RCH2OH</text>
        <text x="132" y="104">RCOONa</text>
      </g>
      <Arrow x1="84" y1="69" x2="126" y2="55" label="NaOH 50%" labelX="78" labelY="40" />
      <Arrow x1="84" y1="78" x2="126" y2="99" />
      <text x="23" y="138" className="fill-slate-600 text-[12px] dark:fill-stone-300">no sp3 alpha-H in source condition</text>
    </DiagramFrame>
  );
}

function ChemOrganicHaloformDiagram() {
  return (
    <DiagramFrame title="haloform">
      <DiagramDefs />
      <g className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">
        <text x="18" y="75">RCOCH3</text>
        <text x="128" y="60">RCOONa</text>
        <text x="128" y="106">CHX3</text>
      </g>
      <Arrow x1="86" y1="70" x2="122" y2="56" label="X2 / NaOH" labelX="77" labelY="39" />
      <Arrow x1="86" y1="78" x2="122" y2="101" />
      <text x="24" y="142" className="fill-slate-600 text-[12px] dark:fill-stone-300">X = Cl, Br or I in the handbook</text>
    </DiagramFrame>
  );
}

function ChemOrganicCarboxyDerivativesDiagram() {
  return (
    <DiagramFrame title="acid derivatives">
      <DiagramDefs />
      <g className="fill-slate-800 text-[13px] font-semibold dark:fill-stone-100">
        <text x="82" y="96">RCOOH</text>
        <text x="22" y="42">RCOCl</text>
        <text x="152" y="42">RCONH2</text>
        <text x="17" y="156">(RCO)2O</text>
        <text x="148" y="156">RCOOR&apos;</text>
      </g>
      <Arrow x1="88" y1="83" x2="58" y2="48" label="SOCl2" labelX="40" labelY="70" />
      <Arrow x1="132" y1="83" x2="156" y2="48" label="NH3, Δ" labelX="134" labelY="70" />
      <Arrow x1="90" y1="104" x2="58" y2="142" label="P2O5, Δ" labelX="24" labelY="125" />
      <Arrow x1="130" y1="104" x2="156" y2="142" label="R'OH" labelX="147" labelY="124" />
    </DiagramFrame>
  );
}

function BenzeneRing({ cx = 80, cy = 94, r = 30, label }) {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  const path = `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z`;
  return (
    <g>
      <path d={path} fill="none" className="stroke-slate-800 dark:stroke-stone-100" strokeWidth="2.2" />
      <circle cx={cx} cy={cy} r={r * 0.48} fill="none" className="stroke-slate-800 dark:stroke-stone-100" strokeWidth="1.8" />
      {label && <text x={cx - 22} y={cy + r + 20} className="fill-slate-700 text-[12px] font-semibold dark:fill-stone-200">{label}</text>}
    </g>
  );
}

function ChemOrganicEasBenzeneDiagram() {
  return (
    <DiagramFrame title="electrophilic aromatic substitution">
      <DiagramDefs />
      <BenzeneRing cx={62} cy={92} r={28} label="benzene" />
      <g className="fill-slate-800 text-[15px] font-semibold dark:fill-stone-100">
        <text x="27" y="42">E+</text>
        <text x="153" y="82">E</text>
        <text x="142" y="124">+ H+</text>
      </g>
      <Arrow x1="90" y1="90" x2="132" y2="90" label="attack" labelX="96" labelY="72" />
      <BenzeneRing cx={160} cy={92} r={24} />
      <line x1="160" y1="68" x2="160" y2="50" className="stroke-slate-800 dark:stroke-stone-100" strokeWidth="2" />
      <text x="34" y="151" className="fill-slate-600 text-[12px] dark:fill-stone-300">aromaticity is restored after proton loss</text>
    </DiagramFrame>
  );
}

function ChemOrganicSigmaComplexDiagram() {
  return (
    <DiagramFrame title="sigma complex">
      <DiagramDefs />
      <BenzeneRing cx={92} cy={94} r={34} />
      <line x1="122" y1="77" x2="144" y2="62" className="stroke-slate-800 dark:stroke-stone-100" strokeWidth="2" />
      <text x="148" y="64" className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">Br</text>
      <text x="128" y="89" className="fill-slate-800 text-[14px] font-semibold dark:fill-stone-100">H</text>
      <text x="88" y="105" className="fill-amber-600 text-[18px] font-bold dark:fill-amber-300">+</text>
      <Arrow x1="156" y1="116" x2="128" y2="98" label="FeBr4-" labelX="140" labelY="139" />
      <text x="34" y="154" className="fill-slate-600 text-[12px] dark:fill-stone-300">source shows resonance forms of this arenium ion</text>
    </DiagramFrame>
  );
}

function ChemOrganicEasPositionsDiagram() {
  return (
    <DiagramFrame title="ortho / meta / para positions">
      <BenzeneRing cx={108} cy={94} r={40} />
      <line x1="108" y1="54" x2="108" y2="32" className="stroke-slate-800 dark:stroke-stone-100" strokeWidth="2" />
      <text x="99" y="27" className="fill-slate-800 text-[13px] font-semibold dark:fill-stone-100">Et</text>
      <text x="151" y="76" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">ortho</text>
      <text x="151" y="122" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">meta</text>
      <text x="94" y="158" className="fill-amber-600 text-[12px] font-bold dark:fill-amber-300">para</text>
      <text x="28" y="178" className="fill-slate-600 text-[11px] dark:fill-stone-300">source example gives p-ethyl-acetophenone</text>
    </DiagramFrame>
  );
}

function ChemOrganicPolymerRepeatDiagram() {
  return (
    <DiagramFrame title="copolymer repeat idea">
      <DiagramDefs />
      <g className="fill-slate-800 text-[13px] font-semibold dark:fill-stone-100">
        <text x="18" y="68">monomer A</text>
        <text x="18" y="118">monomer B</text>
        <text x="142" y="93">[-A-B-]n</text>
      </g>
      <Arrow x1="82" y1="64" x2="128" y2="88" />
      <Arrow x1="82" y1="114" x2="128" y2="96" />
      <text x="30" y="154" className="fill-slate-600 text-[12px] dark:fill-stone-300">used for the PHBV copolymer card</text>
    </DiagramFrame>
  );
}

function BioNode({ x, y, width = 80, text, tone = "amber" }) {
  const fillClass = tone === "green" ? "fill-emerald-100 dark:fill-emerald-950/40" : "fill-amber-100 dark:fill-amber-950/40";
  const strokeClass = tone === "green" ? "stroke-emerald-500/60" : "stroke-amber-500/60";
  return (
    <g>
      <rect x={x} y={y} width={width} height="25" rx="6" className={`${fillClass} ${strokeClass}`} strokeWidth="1.5" />
      <text x={x + width / 2} y={y + 16} textAnchor="middle" className="fill-slate-800 text-[10px] font-bold dark:fill-stone-100">
        {text}
      </text>
    </g>
  );
}

function BioTaxonomicHierarchyDiagram() {
  const ranks = ["Kingdom", "Phylum/Division", "Class", "Order", "Family", "Genus", "Species"];
  return (
    <DiagramFrame title="taxonomic hierarchy">
      <DiagramDefs />
      {ranks.map((rank, index) => {
        const y = 18 + index * 22;
        return (
          <g key={rank}>
            <BioNode x={57} y={y} width={106} text={rank} tone={index > 4 ? "green" : "amber"} />
            {index < ranks.length - 1 && <Arrow x1="110" y1={y + 25} x2="110" y2={y + 40} />}
          </g>
        );
      })}
      <text x="110" y="181" textAnchor="middle" className="fill-slate-500 text-[11px] font-bold dark:fill-stone-400">
        ascending order in source table
      </text>
    </DiagramFrame>
  );
}

function BioAlgaeComparisonDiagram() {
  return (
    <DiagramFrame title="algae classes">
      <BioNode x={15} y={38} width={62} text="Green" tone="green" />
      <BioNode x={79} y={38} width={62} text="Brown" />
      <BioNode x={143} y={38} width={62} text="Red" />
      <text x="46" y="82" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">a, b</text>
      <text x="110" y="82" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">a, c</text>
      <text x="174" y="82" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">a, d</text>
      <text x="46" y="103" textAnchor="middle" className="fill-emerald-700 text-[10px] dark:fill-emerald-300">starch</text>
      <text x="110" y="103" textAnchor="middle" className="fill-amber-700 text-[10px] dark:fill-amber-300">mannitol</text>
      <text x="174" y="103" textAnchor="middle" className="fill-rose-700 text-[10px] dark:fill-rose-300">floridean</text>
      <line x1="46" y1="116" x2="46" y2="142" className="stroke-emerald-500" strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="116" x2="110" y2="142" className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" />
      <line x1="174" y1="116" x2="174" y2="142" className="stroke-rose-500" strokeWidth="3" strokeLinecap="round" />
      <text x="46" y="158" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">2-8 equal</text>
      <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">2 unequal</text>
      <text x="174" y="158" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">absent</text>
    </DiagramFrame>
  );
}

function BioAlternationFlowDiagram() {
  return (
    <DiagramFrame title="alternation of generations">
      <DiagramDefs />
      <BioNode x={13} y={32} width={76} text="Gametophyte" tone="green" />
      <BioNode x={132} y={32} width={62} text="Gametes" tone="green" />
      <BioNode x={132} y={118} width={58} text="Zygote" />
      <BioNode x={18} y={118} width={70} text="Sporophyte" />
      <Arrow x1="90" y1="45" x2="130" y2="45" label="mitosis" labelX="94" labelY="36" />
      <Arrow x1="165" y1="58" x2="165" y2="116" label="fert." labelX="171" labelY="89" />
      <Arrow x1="130" y1="131" x2="90" y2="131" label="mitosis" labelX="92" labelY="150" />
      <Arrow x1="53" y1="116" x2="53" y2="59" label="meiosis" labelX="59" labelY="88" />
      <text x="110" y="89" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold dark:fill-stone-400">spores return to gametophyte</text>
    </DiagramFrame>
  );
}

function BioLifeCyclePatternsDiagram() {
  return (
    <DiagramFrame title="plant life-cycle patterns">
      {[
        ["Haplontic", "Gametophyte", "zygote only", 28],
        ["Diplontic", "Sporophyte", "few-celled gametophyte", 82],
        ["Haplo-diplontic", "Both multicellular", "often free-living", 136],
      ].map(([name, major, note, y]) => (
        <g key={name}>
          <text x="22" y={y} className="fill-slate-700 text-[11px] font-bold dark:fill-stone-200">{name}</text>
          <rect x="98" y={y - 12} width="88" height="14" rx="7" className="fill-emerald-400/40" />
          <text x="104" y={y - 2} className="fill-slate-700 text-[9px] dark:fill-stone-200">{major}</text>
          <text x="104" y={y + 14} className="fill-slate-500 text-[9px] dark:fill-stone-400">{note}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function BioVertebrataFlowDiagram() {
  return (
    <DiagramFrame title="classification of vertebrata">
      <DiagramDefs />
      <BioNode x={66} y={14} width={88} text="Vertebrata" />
      <BioNode x={18} y={62} width={76} text="Agnatha" />
      <BioNode x={126} y={62} width={84} text="Gnathostomata" />
      <Arrow x1="88" y1="39" x2="58" y2="61" />
      <Arrow x1="132" y1="39" x2="168" y2="61" />
      <BioNode x={18} y={110} width={76} text="Cyclostomata" tone="green" />
      <BioNode x={104} y={110} width={50} text="Pisces" tone="green" />
      <BioNode x={160} y={110} width={50} text="Tetrapoda" tone="green" />
      <Arrow x1="56" y1="87" x2="56" y2="109" />
      <Arrow x1="168" y1="87" x2="130" y2="109" />
      <Arrow x1="168" y1="87" x2="185" y2="109" />
      <text x="127" y="151" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">Chondrichthyes, Osteichthyes</text>
      <text x="184" y="169" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">Amphibia, Reptilia, Aves, Mammalia</text>
    </DiagramFrame>
  );
}

function BioRootSystemsDiagram() {
  return (
    <DiagramFrame title="root systems">
      <path d="M38 32 L38 138" className="stroke-amber-700 dark:stroke-amber-300" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 72 C20 88 20 105 14 124 M38 86 C55 103 58 121 66 143" className="stroke-amber-500" strokeWidth="2.5" fill="none" />
      <path d="M108 40 C94 66 92 106 82 144 M108 40 C108 73 108 104 108 146 M108 40 C122 72 124 109 138 144" className="stroke-emerald-500" strokeWidth="2.5" fill="none" />
      <path d="M172 52 C164 76 160 116 151 145 M170 62 C185 88 191 112 198 145 M171 75 C166 89 181 107 177 141" className="stroke-sky-500" strokeWidth="2.5" fill="none" />
      <text x="38" y="166" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">tap</text>
      <text x="108" y="166" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">fibrous</text>
      <text x="174" y="166" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">adventitious</text>
    </DiagramFrame>
  );
}

function BioRootRegionsDiagram() {
  const regions = [
    ["Maturation", 24, "green"],
    ["Elongation", 57, "amber"],
    ["Meristem", 90, "amber"],
    ["Root cap", 123, "green"],
  ];
  return (
    <DiagramFrame title="regions of root">
      <DiagramDefs />
      {regions.map(([label, y, tone], index) => (
        <g key={label}>
          <BioNode x={68} y={y} width={84} text={label} tone={tone} />
          {index < regions.length - 1 && <Arrow x1="110" y1={y + 25} x2="110" y2={y + 32} />}
        </g>
      ))}
      <path d="M66 30 C42 35 43 50 61 53 M154 31 C182 35 180 51 158 53" className="stroke-emerald-500" fill="none" strokeWidth="2" />
      <text x="110" y="169" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">root hairs behind elongation</text>
    </DiagramFrame>
  );
}

function BioLeafPartsDiagram() {
  return (
    <DiagramFrame title="leaf parts">
      <ellipse cx="110" cy="78" rx="54" ry="28" className="fill-emerald-200 stroke-emerald-600 dark:fill-emerald-950/50" strokeWidth="2" />
      <line x1="56" y1="78" x2="164" y2="78" className="stroke-emerald-700 dark:stroke-emerald-300" strokeWidth="2" />
      <line x1="110" y1="106" x2="110" y2="145" className="stroke-amber-600 dark:stroke-amber-300" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="153" r="8" className="fill-amber-200 stroke-amber-600 dark:fill-amber-950/50" strokeWidth="2" />
      <text x="110" y="50" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">lamina</text>
      <text x="138" y="123" className="fill-slate-700 text-[10px] dark:fill-stone-200">petiole</text>
      <text x="124" y="158" className="fill-slate-700 text-[10px] dark:fill-stone-200">leaf base</text>
      <text x="110" y="82" textAnchor="middle" className="fill-slate-700 text-[9px] dark:fill-stone-200">midrib</text>
    </DiagramFrame>
  );
}

function BioVenationDiagram() {
  return (
    <DiagramFrame title="venation">
      <ellipse cx="66" cy="82" rx="42" ry="54" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <line x1="66" y1="30" x2="66" y2="134" className="stroke-emerald-700 dark:stroke-emerald-300" strokeWidth="2" />
      {[42, 62, 82, 102, 122].map((y) => (
        <path key={y} d={`M66 ${y} C50 ${y + 6} 42 ${y + 12} 32 ${y + 20} M66 ${y} C82 ${y + 6} 90 ${y + 12} 100 ${y + 20}`} className="stroke-emerald-500" fill="none" />
      ))}
      <ellipse cx="158" cy="82" rx="30" ry="54" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
      {[144, 154, 164, 174].map((x) => <line key={x} x1={x} y1="34" x2={x} y2="130" className="stroke-amber-500" strokeWidth="1.5" />)}
      <text x="66" y="160" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">reticulate</text>
      <text x="158" y="160" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">parallel</text>
    </DiagramFrame>
  );
}

function BioPhyllotaxyDiagram() {
  return (
    <DiagramFrame title="phyllotaxy">
      {[42, 110, 178].map((x) => <line key={x} x1={x} y1="36" x2={x} y2="132" className="stroke-amber-700 dark:stroke-amber-300" strokeWidth="3" />)}
      <ellipse cx="30" cy="56" rx="15" ry="7" className="fill-emerald-300" />
      <ellipse cx="54" cy="84" rx="15" ry="7" className="fill-emerald-300" />
      <ellipse cx="30" cy="112" rx="15" ry="7" className="fill-emerald-300" />
      <ellipse cx="94" cy="62" rx="15" ry="7" className="fill-emerald-300" />
      <ellipse cx="126" cy="62" rx="15" ry="7" className="fill-emerald-300" />
      <ellipse cx="94" cy="102" rx="15" ry="7" className="fill-emerald-300" />
      <ellipse cx="126" cy="102" rx="15" ry="7" className="fill-emerald-300" />
      {[150, 162, 194, 206].map((x, index) => <ellipse key={x} cx={x} cy={index < 2 ? 78 : 92} rx="13" ry="7" className="fill-emerald-300" />)}
      <text x="42" y="160" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">alternate</text>
      <text x="110" y="160" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">opposite</text>
      <text x="178" y="160" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">whorled</text>
    </DiagramFrame>
  );
}

function BioFlowerSymmetryDiagram() {
  return (
    <DiagramFrame title="flower symmetry">
      <circle cx="48" cy="82" r="28" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <line x1="48" y1="50" x2="48" y2="114" className="stroke-slate-500" strokeDasharray="3 3" />
      <line x1="18" y1="82" x2="78" y2="82" className="stroke-slate-500" strokeDasharray="3 3" />
      <ellipse cx="110" cy="82" rx="22" ry="34" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
      <line x1="110" y1="44" x2="110" y2="120" className="stroke-slate-500" strokeDasharray="3 3" />
      <path d="M158 62 C190 28 210 98 182 116 C162 130 143 94 158 62" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <text x="48" y="158" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">actinomorphic</text>
      <text x="110" y="158" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">zygomorphic</text>
      <text x="178" y="158" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">asymmetric</text>
    </DiagramFrame>
  );
}

function BioOvaryPositionDiagram() {
  const items = [["Hypogynous", 38, 56, 100], ["Perigynous", 110, 74, 86], ["Epigynous", 178, 96, 64]];
  return (
    <DiagramFrame title="ovary position">
      {items.map(([label, x, ovaryY, partsY]) => (
        <g key={label}>
          <ellipse cx={x} cy={ovaryY} rx="13" ry="20" className="fill-emerald-200 stroke-emerald-600 dark:fill-emerald-950/50" strokeWidth="2" />
          <path d={`M${x - 24} ${partsY} Q${x} ${partsY - 26} ${x + 24} ${partsY}`} className="stroke-amber-500" fill="none" strokeWidth="3" />
          <text x={x} y="152" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">{label}</text>
        </g>
      ))}
      <text x="38" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">superior</text>
      <text x="110" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">half inferior</text>
      <text x="178" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">inferior</text>
    </DiagramFrame>
  );
}

function BioAestivationDiagram() {
  const labels = ["Valvate", "Twisted", "Imbricate", "Vexillary"];
  return (
    <DiagramFrame title="aestivation">
      {labels.map((label, index) => {
        const x = 34 + index * 51;
        return (
          <g key={label}>
            <circle cx={x} cy="76" r="19" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
            {label === "Vexillary" ? (
              <path d={`M${x - 16} 81 C${x - 2} 54 ${x + 18} 54 ${x + 16} 81 M${x - 12} 88 L${x} 68 L${x + 12} 88`} className="stroke-rose-500" fill="none" strokeWidth="2" />
            ) : (
              <path d={`M${x - 16} 76 Q${x} ${label === "Valvate" ? 58 : 52} ${x + 16} 76 Q${x} ${label === "Imbricate" ? 106 : 100} ${x - 16} 76`} className="stroke-rose-500" fill="none" strokeWidth="2" />
            )}
            <text x={x} y="132" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{label}</text>
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioPlacentationDiagram() {
  const labels = ["Marginal", "Axile", "Parietal", "Basal", "Free central"];
  return (
    <DiagramFrame title="placentation">
      {labels.map((label, index) => {
        const x = 30 + index * 40;
        return (
          <g key={label}>
            <circle cx={x} cy="78" r="18" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
            {label === "Marginal" && <path d={`M${x - 6} 62 C${x + 4} 78 ${x - 6} 92 ${x + 5} 98`} className="stroke-amber-600" fill="none" strokeWidth="2" />}
            {label === "Axile" && <><line x1={x} y1="60" x2={x} y2="96" className="stroke-amber-600" /><line x1={x - 16} y1="78" x2={x + 16} y2="78" className="stroke-amber-600" /></>}
            {label === "Parietal" && <path d={`M${x - 14} 72 C${x - 6} 58 ${x + 7} 58 ${x + 14} 72 M${x - 14} 84 C${x - 6} 98 ${x + 7} 98 ${x + 14} 84`} className="stroke-amber-600" fill="none" />}
            {label === "Basal" && <circle cx={x} cy="93" r="4" className="fill-amber-600" />}
            {label === "Free central" && <circle cx={x} cy="78" r="5" className="fill-amber-600" />}
            <text x={x} y="130" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{label}</text>
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioSeedComparisonDiagram() {
  return (
    <DiagramFrame title="seed comparison">
      <ellipse cx="65" cy="78" rx="42" ry="28" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
      <line x1="65" y1="52" x2="65" y2="104" className="stroke-amber-600" strokeWidth="2" />
      <circle cx="65" cy="78" r="5" className="fill-emerald-500" />
      <ellipse cx="158" cy="78" rx="28" ry="48" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <path d="M145 103 C165 96 176 80 172 54" className="stroke-amber-600" fill="none" strokeWidth="3" />
      <circle cx="146" cy="104" r="5" className="fill-rose-500" />
      <text x="65" y="145" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">dicot: 2 cotyledons</text>
      <text x="158" y="145" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">monocot: scutellum</text>
    </DiagramFrame>
  );
}

function BioMeristemPositionsDiagram() {
  return (
    <DiagramFrame title="meristem positions">
      <DiagramDefs />
      <BioNode x={67} y={18} width={86} text="Apical" tone="green" />
      <BioNode x={26} y={80} width={78} text="Intercalary" />
      <BioNode x={122} y={80} width={72} text="Lateral" />
      <Arrow x1="110" y1="44" x2="65" y2="79" />
      <Arrow x1="110" y1="44" x2="158" y2="79" />
      <text x="110" y="140" textAnchor="middle" className="fill-slate-600 text-[10px] dark:fill-stone-300">primary tissues vs secondary tissues</text>
      <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">apical + intercalary are primary</text>
    </DiagramFrame>
  );
}

function BioVascularBundlesDiagram() {
  return (
    <DiagramFrame title="vascular bundles">
      <circle cx="50" cy="78" r="35" className="fill-slate-50 stroke-slate-300 dark:fill-stone-900 dark:stroke-stone-700" strokeWidth="2" />
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <ellipse key={deg} cx={50 + Math.cos(rad) * 20} cy={78 + Math.sin(rad) * 20} rx="8" ry="5" className="fill-rose-500" />;
      })}
      <rect x="92" y="54" width="48" height="48" rx="12" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <line x1="92" y1="78" x2="140" y2="78" className="stroke-amber-600" strokeWidth="3" />
      <rect x="160" y="54" width="48" height="48" rx="12" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
      <text x="50" y="140" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">radial</text>
      <text x="116" y="140" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">conjoint open</text>
      <text x="184" y="140" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">closed</text>
      <text x="116" y="102" textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">cambium</text>
    </DiagramFrame>
  );
}

function BioDicotMonocotRootDiagram() {
  return (
    <DiagramFrame title="root anatomy pattern">
      <circle cx="70" cy="78" r="43" className="fill-emerald-50 stroke-emerald-500 dark:fill-emerald-950/30" strokeWidth="2" />
      <circle cx="70" cy="78" r="15" className="fill-rose-100 stroke-rose-500" strokeWidth="2" />
      <path d="M62 78 H78 M70 70 V86" className="stroke-rose-600" strokeWidth="3" />
      <circle cx="158" cy="78" r="43" className="fill-amber-50 stroke-amber-500 dark:fill-amber-950/30" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={158 + Math.cos(rad) * 17} cy={78 + Math.sin(rad) * 17} r="4" className="fill-rose-500" />;
      })}
      <text x="70" y="146" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">dicot: 2-4 patches</text>
      <text x="158" y="146" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">monocot: polyarch</text>
    </DiagramFrame>
  );
}

function BioDicotMonocotStemDiagram() {
  return (
    <DiagramFrame title="stem bundle pattern">
      <circle cx="70" cy="78" r="43" className="fill-emerald-50 stroke-emerald-500 dark:fill-emerald-950/30" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={70 + Math.cos(rad) * 28} cy={78 + Math.sin(rad) * 28} r="5" className="fill-rose-500" />;
      })}
      <circle cx="158" cy="78" r="43" className="fill-amber-50 stroke-amber-500 dark:fill-amber-950/30" strokeWidth="2" />
      {[[-6, -18], [16, -8], [-20, 8], [8, 18], [0, 0], [23, 20], [-27, -23]].map(([dx, dy]) => <circle key={`${dx}-${dy}`} cx={158 + dx} cy={78 + dy} r="5" className="fill-rose-500" />)}
      <text x="70" y="146" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">dicot: ring/open</text>
      <text x="158" y="146" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">monocot: scattered/closed</text>
    </DiagramFrame>
  );
}

function BioLeafAnatomyDiagram() {
  return (
    <DiagramFrame title="leaf anatomy">
      <rect x="24" y="52" width="72" height="14" className="fill-emerald-300" />
      <rect x="24" y="68" width="72" height="24" className="fill-emerald-100 stroke-emerald-500" />
      <rect x="24" y="96" width="72" height="14" className="fill-emerald-300" />
      <circle cx="60" cy="84" r="9" className="fill-rose-400" />
      <rect x="124" y="52" width="72" height="14" className="fill-amber-300" />
      <rect x="124" y="68" width="72" height="28" className="fill-amber-100 stroke-amber-500" />
      <rect x="124" y="100" width="72" height="14" className="fill-amber-300" />
      <circle cx="160" cy="84" r="9" className="fill-rose-400" />
      <text x="60" y="144" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">dicot: differentiated</text>
      <text x="160" y="144" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">monocot: isobilateral</text>
    </DiagramFrame>
  );
}

function BioSecondaryGrowthDiagram() {
  return (
    <DiagramFrame title="secondary growth">
      <DiagramDefs />
      <BioNode x={16} y={40} width={70} text="Cambium" tone="green" />
      <BioNode x={124} y={22} width={78} text="Sec. phloem" />
      <BioNode x={124} y={78} width={78} text="Sec. xylem" tone="green" />
      <Arrow x1="86" y1="53" x2="122" y2="35" label="outer" labelX="90" labelY="32" />
      <Arrow x1="86" y1="53" x2="122" y2="91" label="inner" labelX="90" labelY="89" />
      <circle cx="110" cy="145" r="22" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
      <circle cx="110" cy="145" r="13" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <text x="110" y="176" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">annual rings from seasonal wood</text>
    </DiagramFrame>
  );
}

function BioEpitheliumTypesDiagram() {
  return (
    <DiagramFrame title="simple epithelium">
      {[
        ["Squamous", 32, 118, 10],
        ["Cuboidal", 94, 104, 22],
        ["Columnar", 158, 82, 44],
      ].map(([label, x, y, h]) => (
        <g key={label}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x + i * 14} y={y - h} width="13" height={h} rx="2" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" />
          ))}
          <text x={x + 20} y="146" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">{label}</text>
        </g>
      ))}
      <path d="M154 35 C164 24 174 24 184 35 M164 35 C174 24 184 24 194 35" className="stroke-amber-500" fill="none" strokeWidth="2" />
      <text x="174" y="52" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">cilia/microvilli cue</text>
    </DiagramFrame>
  );
}

function BioMuscleTypesDiagram() {
  return (
    <DiagramFrame title="muscle tissues">
      <rect x="28" y="54" width="40" height="70" rx="4" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      {[62, 76, 90, 104].map((y) => <line key={y} x1="30" y1={y} x2="66" y2={y} className="stroke-rose-500" />)}
      <path d="M104 50 C84 84 124 94 104 128 M124 50 C104 84 144 94 124 128" className="stroke-emerald-500" fill="none" strokeWidth="4" />
      <path d="M162 52 L188 84 L166 114 M174 52 L198 84 L178 126" className="stroke-amber-500" fill="none" strokeWidth="5" strokeLinecap="round" />
      <text x="48" y="150" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">skeletal</text>
      <text x="114" y="150" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">smooth</text>
      <text x="180" y="150" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">cardiac</text>
    </DiagramFrame>
  );
}

function BioCockroachBodyDiagram() {
  return (
    <DiagramFrame title="cockroach body regions">
      <ellipse cx="48" cy="90" rx="19" ry="25" className="fill-amber-200 stroke-amber-700 dark:fill-amber-950/50" strokeWidth="2" />
      <ellipse cx="94" cy="90" rx="30" ry="38" className="fill-rose-200 stroke-rose-600 dark:fill-rose-950/40" strokeWidth="2" />
      <ellipse cx="152" cy="90" rx="42" ry="52" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <path d="M35 66 C18 38 18 32 8 22 M61 66 C78 38 78 32 88 22" className="stroke-slate-500 dark:stroke-stone-400" fill="none" strokeWidth="2" />
      {[62, 84, 106].map((x) => <path key={x} d={`M${x} 110 L${x - 24} 150 M${x} 72 L${x - 24} 42`} className="stroke-slate-500 dark:stroke-stone-400" fill="none" strokeWidth="2" />)}
      <text x="48" y="165" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">head</text>
      <text x="94" y="165" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">thorax</text>
      <text x="152" y="165" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">abdomen</text>
    </DiagramFrame>
  );
}

function BioProkaryoticCellDiagram() {
  return (
    <DiagramFrame title="prokaryotic cell">
      <ellipse cx="110" cy="92" rx="76" ry="48" className="fill-emerald-50 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      <ellipse cx="110" cy="92" rx="60" ry="35" className="fill-transparent stroke-amber-500" strokeDasharray="4 3" strokeWidth="2" />
      <path d="M84 91 C100 70 123 72 138 92 C124 116 103 116 84 91" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <circle cx="75" cy="74" r="3" className="fill-slate-500" />
      <circle cx="142" cy="112" r="3" className="fill-slate-500" />
      <path d="M184 92 C204 88 204 64 218 62" className="stroke-amber-600" fill="none" strokeWidth="3" />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">cell envelope + nucleoid + flagellum</text>
    </DiagramFrame>
  );
}

function BioPlasmaMembraneDiagram() {
  return (
    <DiagramFrame title="fluid mosaic membrane">
      {[48, 68, 88, 108, 128, 148, 168].map((x) => (
        <g key={x}>
          <circle cx={x} cy="74" r="5" className="fill-amber-400" />
          <circle cx={x} cy="118" r="5" className="fill-amber-400" />
          <line x1={x - 2} y1="80" x2={x - 8} y2="112" className="stroke-amber-500" strokeWidth="2" />
          <line x1={x + 2} y1="80" x2={x + 8} y2="112" className="stroke-amber-500" strokeWidth="2" />
        </g>
      ))}
      <rect x="92" y="70" width="18" height="54" rx="8" className="fill-emerald-500" />
      <path d="M130 58 C150 44 162 52 174 38" className="stroke-rose-500" fill="none" strokeWidth="3" />
      <text x="101" y="145" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">integral protein</text>
      <text x="150" y="35" textAnchor="middle" className="fill-slate-700 text-[9px] dark:fill-stone-200">carbohydrate</text>
    </DiagramFrame>
  );
}

function BioMitochondrionDiagram() {
  return (
    <DiagramFrame title="mitochondrion">
      <ellipse cx="110" cy="92" rx="75" ry="42" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/40" strokeWidth="2" />
      <ellipse cx="110" cy="92" rx="58" ry="29" className="fill-transparent stroke-rose-500" strokeWidth="2" />
      <path d="M62 92 C80 58 96 126 114 92 C132 58 148 126 164 92" className="stroke-rose-500" fill="none" strokeWidth="3" />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">cristae increase surface area</text>
    </DiagramFrame>
  );
}

function BioChloroplastDiagram() {
  return (
    <DiagramFrame title="chloroplast">
      <ellipse cx="110" cy="92" rx="75" ry="42" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      {[72, 102, 132].map((x) => (
        <g key={x}>
          {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={x} cy={78 + i * 8} rx="15" ry="5" className="fill-emerald-400 stroke-emerald-700" />)}
        </g>
      ))}
      <path d="M86 94 C102 118 130 63 150 91" className="stroke-amber-500" fill="none" strokeWidth="2" />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">grana + stroma lamellae</text>
    </DiagramFrame>
  );
}

function BioAxonemeDiagram() {
  return (
    <DiagramFrame title="9+2 axoneme">
      <circle cx="110" cy="90" r="56" className="fill-slate-50 stroke-slate-300 dark:fill-stone-900 dark:stroke-stone-700" strokeWidth="2" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={110 + Math.cos(rad) * 38} cy={90 + Math.sin(rad) * 38} r="7" className="fill-emerald-200 stroke-emerald-600" />;
      })}
      <circle cx="104" cy="90" r="5" className="fill-amber-500" />
      <circle cx="118" cy="90" r="5" className="fill-amber-500" />
      <text x="110" y="164" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">9 peripheral doublets + 2 central</text>
    </DiagramFrame>
  );
}

function BioChromosomeTypesDiagram() {
  const data = [["Meta", 34, 88], ["Sub-meta", 84, 72], ["Acro", 136, 58], ["Telo", 184, 42]];
  return (
    <DiagramFrame title="chromosome types">
      {data.map(([label, x, cy]) => (
        <g key={label}>
          <line x1={x} y1="42" x2={x} y2="140" className="stroke-rose-400" strokeWidth="8" strokeLinecap="round" />
          <circle cx={x} cy={cy} r="5" className="fill-amber-500 stroke-slate-700 dark:stroke-stone-200" />
          <text x={x} y="164" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{label}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function BioCellCycleDiagram() {
  return (
    <DiagramFrame title="cell cycle">
      <DiagramDefs />
      <circle cx="110" cy="92" r="55" className="fill-amber-50 stroke-amber-500 dark:fill-amber-950/30" strokeWidth="2" />
      <path d="M110 37 A55 55 0 0 1 161 113 L110 92 Z" className="fill-emerald-200/70" />
      <path d="M161 113 A55 55 0 0 1 83 140 L110 92 Z" className="fill-amber-200/70" />
      <path d="M83 140 A55 55 0 0 1 61 68 L110 92 Z" className="fill-sky-200/70" />
      <path d="M61 68 A55 55 0 0 1 110 37 L110 92 Z" className="fill-rose-200/70" />
      <text x="130" y="70" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">G1</text>
      <text x="110" y="128" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">S</text>
      <text x="74" y="90" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">G2</text>
      <text x="96" y="56" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">M</text>
      <text x="110" y="169" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">interphase &gt; 95%</text>
    </DiagramFrame>
  );
}

function BioMitosisSequenceDiagram() {
  const labels = ["Pro", "Meta", "Ana", "Telo"];
  return (
    <DiagramFrame title="mitosis sequence">
      <DiagramDefs />
      {labels.map((label, index) => {
        const x = 32 + index * 52;
        return (
          <g key={label}>
            <circle cx={x} cy="82" r="20" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
            <path d={`M${x - 10} 77 C${x} 66 ${x + 10} 77 ${x} 90`} className="stroke-rose-500" fill="none" strokeWidth="3" />
            <text x={x} y="132" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">{label}</text>
            {index < labels.length - 1 && <Arrow x1={x + 20} y1="82" x2={x + 31} y2="82" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioProphaseOneDiagram() {
  return (
    <DiagramFrame title="prophase I">
      <DiagramDefs />
      {["Leptotene", "Zygotene", "Pachytene", "Diplotene", "Diakinesis"].map((label, index) => (
        <g key={label}>
          <BioNode x={54} y={18 + index * 29} width={112} text={label} tone={index === 2 ? "green" : "amber"} />
          {index < 4 && <Arrow x1="110" y1={43 + index * 29} x2="110" y2={47 + index * 29} />}
        </g>
      ))}
      <text x="110" y="180" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">crossing over at pachytene</text>
    </DiagramFrame>
  );
}

function BioMeiosisFlowDiagram() {
  return (
    <DiagramFrame title="meiosis flow">
      <DiagramDefs />
      <BioNode x={24} y={28} width={70} text="Meiosis I" />
      <BioNode x={128} y={28} width={70} text="Meiosis II" tone="green" />
      <Arrow x1="96" y1="41" x2="126" y2="41" />
      <circle cx="60" cy="102" r="16" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <circle cx="44" cy="142" r="14" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" strokeWidth="2" />
      <circle cx="76" cy="142" r="14" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" strokeWidth="2" />
      {[140, 168].map((x) => [120, 158].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="12" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" strokeWidth="2" />))}
      <Arrow x1="60" y1="118" x2="44" y2="128" />
      <Arrow x1="60" y1="118" x2="76" y2="128" />
      <text x="154" y="96" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">4 haploid cells</text>
    </DiagramFrame>
  );
}

function BioApoplastSymplastDiagram() {
  return (
    <DiagramFrame title="apoplast vs symplast">
      <DiagramDefs />
      {[22, 68, 114, 160].map((x) => (
        <rect key={x} x={x} y="62" width="38" height="44" rx="6" className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/40" strokeWidth="2" />
      ))}
      <path d="M12 50 C54 40 100 44 132 38 C164 32 190 38 210 30" className="stroke-amber-500" fill="none" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 86 H203" className="stroke-rose-500" fill="none" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" />
      <rect x="148" y="50" width="8" height="70" className="fill-amber-600" />
      <text x="110" y="32" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">apoplast: walls/spaces</text>
      <text x="110" y="139" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">symplast: cytoplasm/plasmodesmata</text>
      <text x="152" y="126" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">Casparian strip</text>
    </DiagramFrame>
  );
}

function BioTranspirationPullDiagram() {
  return (
    <DiagramFrame title="transpiration pull">
      <DiagramDefs />
      <line x1="54" y1="148" x2="54" y2="42" className="stroke-sky-500" strokeWidth="8" strokeLinecap="round" />
      {[128, 146, 164].map((x) => <ellipse key={x} cx={x} cy="80" rx="36" ry="12" className="fill-emerald-200 stroke-emerald-600 dark:fill-emerald-950/50" strokeWidth="2" />)}
      <Arrow x1="54" y1="145" x2="54" y2="52" label="xylem water" labelX="62" labelY="96" />
      <Arrow x1="112" y1="78" x2="82" y2="58" />
      <path d="M150 48 C150 32 170 28 170 12 M166 48 C166 34 188 30 188 15" className="stroke-sky-400" fill="none" strokeWidth="2" strokeLinecap="round" />
      <text x="158" y="112" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">evaporation through stomata</text>
      <text x="110" y="169" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">cohesion + adhesion + surface tension</text>
    </DiagramFrame>
  );
}

function BioSourceSinkFlowDiagram() {
  return (
    <DiagramFrame title="source to sink">
      <DiagramDefs />
      <BioNode x={18} y={38} width={58} text="Source" tone="green" />
      <BioNode x={82} y={38} width={64} text="Phloem" />
      <BioNode x={154} y={38} width={48} text="Sink" tone="green" />
      <Arrow x1="76" y1="51" x2="80" y2="51" />
      <Arrow x1="146" y1="51" x2="152" y2="51" />
      <BioNode x={18} y={102} width={64} text="Sucrose" tone="green" />
      <BioNode x={87} y={102} width={52} text="Water" />
      <BioNode x={150} y={102} width={56} text="Unload" tone="green" />
      <Arrow x1="50" y1="64" x2="50" y2="100" label="loading" labelX="56" labelY="88" />
      <Arrow x1="112" y1="100" x2="112" y2="66" label="osmosis" labelX="120" labelY="88" />
      <Arrow x1="176" y1="64" x2="176" y2="100" label="use/store" labelX="128" labelY="132" />
      <text x="110" y="165" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">pressure moves sap to lower osmotic pressure</text>
    </DiagramFrame>
  );
}

function BioNitrogenCycleDiagram() {
  return (
    <DiagramFrame title="nitrogen cycle">
      <DiagramDefs />
      <BioNode x={64} y={16} width={92} text="Atmospheric N2" />
      <BioNode x={78} y={62} width={64} text="NH3" tone="green" />
      <BioNode x={78} y={106} width={64} text="NO3-" />
      <BioNode x={20} y={148} width={74} text="Biomass" tone="green" />
      <BioNode x={126} y={148} width={76} text="Denitrify" />
      <Arrow x1="110" y1="42" x2="110" y2="61" label="fixation" labelX="119" labelY="54" />
      <Arrow x1="110" y1="87" x2="110" y2="105" label="nitrification" labelX="119" labelY="99" />
      <Arrow x1="95" y1="131" x2="70" y2="147" label="uptake" labelX="45" labelY="131" />
      <Arrow x1="142" y1="118" x2="164" y2="147" />
      <Arrow x1="166" y1="148" x2="140" y2="42" label="N2" labelX="174" labelY="91" />
    </DiagramFrame>
  );
}

function BioNoduleFormationDiagram() {
  return (
    <DiagramFrame title="nodule formation">
      <DiagramDefs />
      {["Attach", "Curl", "Infect", "Nodule", "Vascular"].map((label, index) => {
        const x = 13 + index * 41;
        return (
          <g key={label}>
            <circle cx={x + 18} cy="82" r="16" className={index === 3 ? "fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" : "fill-amber-100 stroke-amber-500 dark:fill-amber-950/40"} strokeWidth="2" />
            <text x={x + 18} y="124" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{label}</text>
            {index < 4 && <Arrow x1={x + 34} y1="82" x2={x + 39} y2="82" />}
          </g>
        );
      })}
      <text x="110" y="156" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">infection thread carries bacteria into cortex</text>
    </DiagramFrame>
  );
}

function BioLightReactionFlowDiagram() {
  return (
    <DiagramFrame title="light reaction flow">
      <DiagramDefs />
      <BioNode x={18} y={54} width={48} text="PSII" />
      <BioNode x={86} y={54} width={48} text="ETS" tone="green" />
      <BioNode x={154} y={54} width={44} text="PSI" />
      <Arrow x1="66" y1="67" x2="84" y2="67" />
      <Arrow x1="134" y1="67" x2="152" y2="67" />
      <Arrow x1="176" y1="80" x2="176" y2="118" label="NADP+" labelX="137" labelY="103" />
      <text x="42" y="38" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">P680</text>
      <text x="176" y="38" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">P700</text>
      <text x="38" y="128" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">H2O to O2 + e-</text>
      <text x="176" y="143" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">NADPH + H+</text>
    </DiagramFrame>
  );
}

function BioCyclicNoncyclicDiagram() {
  return (
    <DiagramFrame title="photophosphorylation">
      <DiagramDefs />
      <BioNode x={20} y={36} width={56} text="PSII" />
      <BioNode x={88} y={36} width={48} text="PSI" />
      <BioNode x={154} y={36} width={50} text="NADP" tone="green" />
      <Arrow x1="76" y1="49" x2="86" y2="49" />
      <Arrow x1="136" y1="49" x2="152" y2="49" />
      <text x="110" y="82" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">non-cyclic: ATP + NADPH</text>
      <path d="M84 126 C84 94 140 94 140 126 C140 154 84 154 84 126" className="stroke-amber-500" fill="none" strokeWidth="3" markerEnd="url(#arrow)" />
      <BioNode x={91} y={118} width={42} text="PSI" tone="green" />
      <text x="110" y="169" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">cyclic: ATP only</text>
    </DiagramFrame>
  );
}

function BioCalvinCycleDiagram() {
  return (
    <DiagramFrame title="calvin cycle">
      <DiagramDefs />
      <BioNode x={78} y={24} width={64} text="RuBP" tone="green" />
      <BioNode x={150} y={78} width={48} text="3-PGA" />
      <BioNode x={78} y={132} width={64} text="Triose" tone="green" />
      <BioNode x={20} y={78} width={58} text="Regen." />
      <Arrow x1="139" y1="42" x2="158" y2="77" label="CO2" labelX="156" labelY="52" />
      <Arrow x1="166" y1="103" x2="120" y2="131" label="ATP NADPH" labelX="144" labelY="126" />
      <Arrow x1="80" y1="145" x2="58" y2="104" />
      <Arrow x1="50" y1="78" x2="80" y2="45" label="ATP" labelX="35" labelY="61" />
      <text x="110" y="172" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">carboxylation to reduction to regeneration</text>
    </DiagramFrame>
  );
}

function BioC4PathwayDiagram() {
  return (
    <DiagramFrame title="C4 pathway">
      <DiagramDefs />
      <rect x="18" y="36" width="78" height="92" rx="8" className="fill-emerald-50 stroke-emerald-500 dark:fill-emerald-950/30" strokeWidth="2" />
      <rect x="124" y="36" width="78" height="92" rx="8" className="fill-amber-50 stroke-amber-500 dark:fill-amber-950/30" strokeWidth="2" />
      <text x="57" y="58" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">Mesophyll</text>
      <text x="163" y="58" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">Bundle sheath</text>
      <BioNode x={31} y={76} width={50} text="PEP" tone="green" />
      <BioNode x={138} y={76} width={50} text="RuBisCO" />
      <Arrow x1="82" y1="88" x2="136" y2="88" label="C4 acid" labelX="95" labelY="78" />
      <Arrow x1="136" y1="112" x2="82" y2="112" label="C3 back" labelX="92" labelY="130" />
      <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">CO2 released near RuBisCO</text>
    </DiagramFrame>
  );
}

function BioRespirationOverviewDiagram() {
  return (
    <DiagramFrame title="fate of pyruvate">
      <DiagramDefs />
      <BioNode x={70} y={18} width={80} text="Glucose" tone="green" />
      <BioNode x={70} y={66} width={80} text="Glycolysis" />
      <BioNode x={70} y={114} width={80} text="Pyruvate" tone="green" />
      <Arrow x1="110" y1="43" x2="110" y2="65" />
      <Arrow x1="110" y1="91" x2="110" y2="113" />
      <Arrow x1="70" y1="127" x2="28" y2="157" label="ferment" labelX="24" labelY="139" />
      <Arrow x1="150" y1="127" x2="192" y2="157" label="aerobic" labelX="166" labelY="139" />
      <text x="28" y="175" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">lactic/alcoholic</text>
      <text x="192" y="175" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">Krebs cycle</text>
    </DiagramFrame>
  );
}

function BioKrebsEtsDiagram() {
  return (
    <DiagramFrame title="Krebs to ETS">
      <DiagramDefs />
      <circle cx="74" cy="88" r="42" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <text x="74" y="84" textAnchor="middle" className="fill-slate-700 text-[11px] font-bold dark:fill-stone-200">TCA</text>
      <text x="74" y="101" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">NADH FADH2</text>
      <BioNode x={140} y={50} width={56} text="ETS" tone="green" />
      <BioNode x={140} y={106} width={56} text="ATP" />
      <Arrow x1="112" y1="80" x2="138" y2="63" />
      <Arrow x1="168" y1="76" x2="168" y2="105" label="O2" labelX="176" labelY="95" />
      <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">oxygen is final hydrogen acceptor</text>
    </DiagramFrame>
  );
}

function BioGrowthPhasesDiagram() {
  return (
    <DiagramFrame title="growth phases">
      <DiagramDefs />
      {["Meristematic", "Elongation", "Maturation"].map((label, index) => (
        <g key={label}>
          <BioNode x={56} y={28 + index * 44} width={108} text={label} tone={index === 0 ? "green" : "amber"} />
          {index < 2 && <Arrow x1="110" y1={53 + index * 44} x2="110" y2={71 + index * 44} />}
        </g>
      ))}
      <text x="110" y="172" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">root/shoot apex to proximal cells to mature cells</text>
    </DiagramFrame>
  );
}

function BioGrowthCurvesDiagram() {
  return (
    <DiagramFrame title="growth curves">
      <path d="M28 136 H96 M28 136 V48 M34 126 L88 70" className="stroke-slate-500 dark:stroke-stone-400" fill="none" strokeWidth="2" />
      <path d="M124 136 H198 M124 136 V48 M130 130 C142 126 148 124 154 112 C164 92 176 74 194 72" className="stroke-slate-500 dark:stroke-stone-400" fill="none" strokeWidth="2" />
      <text x="62" y="158" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">arithmetic</text>
      <text x="162" y="158" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">geometrical</text>
      <text x="160" y="54" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">lag to log to stationary</text>
    </DiagramFrame>
  );
}

function BioRespiratoryPathwayDiagram() {
  const items = ["Nostrils", "Nasal chamber", "Pharynx", "Larynx", "Trachea", "Bronchi", "Bronchioles", "Alveolar duct"];
  return (
    <DiagramFrame title="respiratory pathway">
      <DiagramDefs />
      {items.map((item, index) => {
        const x = index % 2 === 0 ? 24 : 116;
        const y = 18 + Math.floor(index / 2) * 38;
        return (
          <g key={item}>
            <BioNode x={x} y={y} width={80} text={item} tone={index > 5 ? "green" : "amber"} />
            {index < items.length - 1 && <Arrow x1={x + 80} y1={y + 14} x2={(index % 2 === 0 ? 116 : 104)} y2={index % 2 === 0 ? y + 14 : y + 52} />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioBreathingMechanicsDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="inspiration">
        <DiagramDefs />
        <path d="M55 82 C70 44 150 44 165 82 L158 132 C142 150 78 150 62 132 Z" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
        <path d="M64 138 C90 158 130 158 156 138" className="stroke-emerald-500" fill="none" strokeWidth="3" />
        <Arrow x1={110} y1={33} x2={110} y2={62} label="air in" labelX={124} labelY={48} />
        <text x="110" y="172" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">volume rises, pressure falls</text>
      </DiagramFrame>
      <DiagramFrame title="expiration">
        <DiagramDefs />
        <path d="M62 88 C78 56 142 56 158 88 L150 128 C132 142 88 142 70 128 Z" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
        <path d="M66 134 C92 120 128 120 154 134" className="stroke-amber-500" fill="none" strokeWidth="3" />
        <Arrow x1={110} y1={64} x2={110} y2={34} label="air out" labelX={124} labelY={48} />
        <text x="110" y="172" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">volume falls, pressure rises</text>
      </DiagramFrame>
    </div>
  );
}

function BioAlveolusExchangeDiagram() {
  return (
    <DiagramFrame title="alveolar exchange">
      <DiagramDefs />
      <circle cx="88" cy="92" r="48" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
      <path d="M136 58 C182 58 190 126 144 136" className="stroke-rose-500" fill="none" strokeWidth="10" strokeLinecap="round" />
      <Arrow x1={100} y1={82} x2={140} y2={72} label="O2" labelX={118} labelY={66} />
      <Arrow x1={145} y1={116} x2={106} y2={104} label="CO2" labelX={122} labelY={132} />
      <text x="88" y="96" textAnchor="middle" className="fill-slate-700 text-[11px] font-bold dark:fill-stone-200">alveolus</text>
      <text x="164" y="101" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">capillary</text>
    </DiagramFrame>
  );
}

function BioOxygenDissociationDiagram() {
  return (
    <DiagramFrame title="oxyhaemoglobin curve">
      <Axis xLabel="pO2" yLabel="% sat" />
      <path d="M42 156 C62 154 70 132 82 104 C98 68 128 48 180 42" className="stroke-rose-500" fill="none" strokeWidth="3" />
      <text x="118" y="84" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">sigmoid</text>
      <text x="111" y="178" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">used to study pCO2, H+ and temperature effects</text>
    </DiagramFrame>
  );
}

function BioHeartFlowDiagram() {
  return (
    <DiagramFrame title="heart flow">
      <DiagramDefs />
      <BioNode x={24} y={28} width={66} text="Vena cava" />
      <BioNode x={112} y={28} width={66} text="RA" tone="amber" />
      <BioNode x={112} y={76} width={66} text="RV" tone="amber" />
      <BioNode x={24} y={126} width={74} text="Pulmonary artery" />
      <BioNode x={122} y={126} width={74} text="Lungs" tone="green" />
      <Arrow x1={90} y1={42} x2={110} y2={42} />
      <Arrow x1={145} y1={54} x2={145} y2={74} />
      <Arrow x1={112} y1={90} x2={100} y2={128} />
      <Arrow x1={98} y1={140} x2={120} y2={140} />
      <text x="110" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">right side sends deoxygenated blood to lungs</text>
    </DiagramFrame>
  );
}

function BioCardiacConductionDiagram() {
  return (
    <DiagramFrame title="cardiac conduction">
      <DiagramDefs />
      <path d="M62 38 C42 74 50 132 94 150 C138 132 146 74 126 38 C110 22 78 22 62 38 Z" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <BioNode x={70} y={38} width={52} text="SAN" tone="green" />
      <BioNode x={82} y={76} width={52} text="AVN" tone="amber" />
      <BioNode x={82} y={112} width={52} text="His" />
      <Arrow x1={96} y1={63} x2={104} y2={75} />
      <Arrow x1={108} y1={101} x2={108} y2={111} />
      <path d="M108 138 C86 150 66 154 52 160 M108 138 C132 150 154 154 168 160" className="stroke-sky-500" fill="none" strokeWidth="2" />
      <text x="110" y="176" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">SAN is pacemaker: 70-75/min</text>
    </DiagramFrame>
  );
}

function BioDoubleCirculationDiagram() {
  return (
    <DiagramFrame title="double circulation">
      <DiagramDefs />
      <BioNode x={78} y={24} width={64} text="Lungs" tone="green" />
      <BioNode x={78} y={76} width={64} text="Heart" tone="amber" />
      <BioNode x={78} y={128} width={64} text="Body" />
      <Arrow x1={90} y1={74} x2={90} y2={50} label="pulmonary" labelX={36} labelY={64} />
      <Arrow x1={130} y1={50} x2={130} y2={74} />
      <Arrow x1={90} y1={102} x2={90} y2={128} label="systemic" labelX={38} labelY={118} />
      <Arrow x1={130} y1={128} x2={130} y2={102} />
    </DiagramFrame>
  );
}

function BioEcgDiagram() {
  return (
    <DiagramFrame title="ECG">
      <path d="M28 112 H58 C64 86 72 86 78 112 H96 L104 132 L116 62 L130 112 H148 C158 88 176 88 186 112 H196" className="stroke-rose-500" fill="none" strokeWidth="3" strokeLinejoin="round" />
      <text x="68" y="78" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">P</text>
      <text x="114" y="52" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">QRS</text>
      <text x="166" y="78" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">T</text>
      <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">atria depolarize, ventricles depolarize, ventricles repolarize</text>
    </DiagramFrame>
  );
}

function BioUrinarySystemDiagram() {
  return (
    <DiagramFrame title="urinary system">
      <DiagramDefs />
      <ellipse cx="74" cy="56" rx="20" ry="32" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <ellipse cx="146" cy="56" rx="20" ry="32" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <path d="M78 88 C82 118 98 126 106 144 M142 88 C138 118 122 126 114 144" className="stroke-amber-500" fill="none" strokeWidth="3" />
      <ellipse cx="110" cy="154" rx="24" ry="16" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
      <path d="M110 170 V182" className="stroke-sky-500" strokeWidth="3" />
      <text x="110" y="22" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">kidneys, ureters, bladder, urethra</text>
    </DiagramFrame>
  );
}

function BioNephronFlowDiagram() {
  return (
    <DiagramFrame title="nephron flow">
      <DiagramDefs />
      <circle cx="54" cy="54" r="24" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <text x="54" y="58" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">MB</text>
      <BioNode x={92} y={40} width={44} text="PCT" />
      <BioNode x={146} y={40} width={44} text="Loop" tone="amber" />
      <BioNode x={146} y={96} width={44} text="DCT" />
      <BioNode x={86} y={136} width={70} text="Collecting duct" tone="green" />
      <Arrow x1={78} y1={54} x2={90} y2={54} />
      <Arrow x1={136} y1={54} x2={144} y2={54} />
      <Arrow x1={168} y1={66} x2={168} y2={94} />
      <Arrow x1={146} y1={110} x2={126} y2={136} />
    </DiagramFrame>
  );
}

function BioCounterCurrentDiagram() {
  return (
    <DiagramFrame title="counter current">
      <DiagramDefs />
      <path d="M70 38 V138 C70 158 104 158 104 138 V38" className="stroke-amber-500" fill="none" strokeWidth="5" strokeLinecap="round" />
      <path d="M140 38 V138 C140 158 174 158 174 138 V38" className="stroke-rose-500" fill="none" strokeWidth="5" strokeLinecap="round" />
      <Arrow x1={70} y1={52} x2={70} y2={94} label="filtrate" labelX={35} labelY={78} />
      <Arrow x1={104} y1={116} x2={104} y2={72} />
      <Arrow x1={140} y1={72} x2={140} y2={116} label="blood" labelX={156} labelY={88} />
      <Arrow x1={174} y1={116} x2={174} y2={72} />
      <text x="110" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">300 to 1200 mOsmolL-1 gradient</text>
    </DiagramFrame>
  );
}

function BioSarcomereDiagram() {
  return (
    <DiagramFrame title="sarcomere">
      <line x1="38" y1="48" x2="38" y2="146" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <line x1="182" y1="48" x2="182" y2="146" className="stroke-slate-700 dark:stroke-stone-200" strokeWidth="3" />
      <rect x="78" y="74" width="64" height="46" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <line x1="38" y1="88" x2="132" y2="88" className="stroke-sky-500" strokeWidth="3" />
      <line x1="88" y1="106" x2="182" y2="106" className="stroke-sky-500" strokeWidth="3" />
      <line x1="110" y1="72" x2="110" y2="122" className="stroke-rose-500" strokeWidth="2" />
      <text x="38" y="38" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">Z</text>
      <text x="182" y="38" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">Z</text>
      <text x="110" y="68" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">A band</text>
      <text x="110" y="136" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">H zone at centre, M line through H zone</text>
    </DiagramFrame>
  );
}

function BioSlidingFilamentDiagram() {
  return (
    <DiagramFrame title="sliding filament">
      <DiagramDefs />
      <BioNode x={24} y={20} width={70} text="Impulse" />
      <BioNode x={126} y={20} width={70} text="Ca2+ release" tone="green" />
      <BioNode x={24} y={76} width={70} text="Troponin" tone="amber" />
      <BioNode x={126} y={76} width={70} text="Active sites" />
      <BioNode x={24} y={132} width={70} text="Cross bridge" tone="green" />
      <BioNode x={126} y={132} width={70} text="Power stroke" tone="amber" />
      <Arrow x1={94} y1={34} x2={124} y2={34} />
      <Arrow x1={161} y1={46} x2={64} y2={76} />
      <Arrow x1={94} y1={90} x2={124} y2={90} />
      <Arrow x1={126} y1={104} x2={94} y2={132} />
      <Arrow x1={94} y1={146} x2={124} y2={146} />
    </DiagramFrame>
  );
}

function BioNeuronStructureDiagram() {
  return (
    <DiagramFrame title="neuron">
      <DiagramDefs />
      <circle cx="56" cy="92" r="30" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <circle cx="56" cy="92" r="8" className="fill-rose-400" />
      <path d="M84 92 C112 82 134 82 162 92" className="stroke-sky-500" fill="none" strokeWidth="8" strokeLinecap="round" />
      <path d="M162 92 C176 78 188 72 202 64 M162 92 C180 96 190 108 202 122" className="stroke-sky-500" fill="none" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 72 C24 58 18 46 18 34 M35 104 C20 110 14 124 10 138 M52 62 C48 46 56 34 68 22" className="stroke-emerald-500" fill="none" strokeWidth="3" strokeLinecap="round" />
      <text x="56" y="140" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">cyton</text>
      <text x="124" y="75" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">axon</text>
      <text x="34" y="32" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">dendrites</text>
      <text x="176" y="148" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">synaptic knobs</text>
    </DiagramFrame>
  );
}

function BioActionPotentialFlowDiagram() {
  return (
    <DiagramFrame title="membrane state">
      <DiagramDefs />
      {["Resting", "Depolarization", "Repolarization"].map((label, index) => (
        <g key={label}>
          <BioNode x={28 + index * 64} y={62} width={56} text={label} tone={index === 1 ? "green" : "amber"} />
          {index < 2 && <Arrow x1={84 + index * 64} y1={76} x2={90 + index * 64} y2={76} />}
        </g>
      ))}
      <text x="60" y="126" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">3 Na+ out, 2 K+ in</text>
      <text x="126" y="126" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">Na+ influx</text>
      <text x="180" y="126" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">K+ out</text>
    </DiagramFrame>
  );
}

function BioSynapseFlowDiagram() {
  return (
    <DiagramFrame title="chemical synapse">
      <DiagramDefs />
      <path d="M34 88 C60 48 90 56 92 96 C94 128 58 136 34 100" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <line x1="116" y1="42" x2="116" y2="142" className="stroke-slate-400 dark:stroke-stone-500" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M148 52 C170 80 170 104 148 132" className="stroke-sky-500" fill="none" strokeWidth="6" strokeLinecap="round" />
      <circle cx="72" cy="82" r="4" className="fill-rose-500" />
      <circle cx="82" cy="104" r="4" className="fill-rose-500" />
      <Arrow x1={92} y1={94} x2={138} y2={94} label="transmitter" labelX={104} labelY={76} />
      <text x="116" y="160" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">synaptic cleft</text>
    </DiagramFrame>
  );
}

function BioBrainClassificationDiagram() {
  return (
    <DiagramFrame title="brain divisions">
      <DiagramDefs />
      <BioNode x={74} y={18} width={72} text="Brain" tone="green" />
      <BioNode x={14} y={78} width={58} text="Forebrain" />
      <BioNode x={82} y={78} width={58} text="Midbrain" tone="amber" />
      <BioNode x={150} y={78} width={58} text="Hindbrain" />
      <Arrow x1={110} y1={43} x2={43} y2={78} />
      <Arrow x1={110} y1={43} x2={111} y2={78} />
      <Arrow x1={110} y1={43} x2={179} y2={78} />
      <text x="43" y="132" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">cerebrum, diencephalon</text>
      <text x="111" y="132" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">corpora quadrigemina</text>
      <text x="179" y="132" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">cerebellum, pons, medulla</text>
    </DiagramFrame>
  );
}

function BioReflexArcDiagram() {
  return (
    <DiagramFrame title="reflex arc">
      <DiagramDefs />
      {["Receptor", "Sensory", "CNS", "Motor", "Effector"].map((label, index) => (
        <g key={label}>
          <BioNode x={16 + index * 40} y={76} width={36} text={label} tone={index === 2 ? "green" : "amber"} />
          {index < 4 && <Arrow x1={52 + index * 40} y1={90} x2={54 + index * 40} y2={90} />}
        </g>
      ))}
      <text x="110" y="140" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">rapid, involuntary and unconscious response</text>
    </DiagramFrame>
  );
}

function BioEyeLayoutDiagram() {
  return (
    <DiagramFrame title="eye layout">
      <ellipse cx="108" cy="94" rx="74" ry="50" className="fill-sky-50 stroke-sky-500 dark:fill-sky-950/30" strokeWidth="2" />
      <path d="M43 80 C58 78 70 84 72 94 C70 104 58 110 43 108" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/40" strokeWidth="2" />
      <path d="M172 58 C154 76 154 112 172 130" className="stroke-emerald-500" fill="none" strokeWidth="3" />
      <circle cx="62" cy="94" r="11" className="fill-amber-200 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <text x="62" y="126" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">lens</text>
      <text x="174" y="50" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">retina</text>
      <text x="38" y="72" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">cornea</text>
      <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">sclera, choroid and retina are the three layers</text>
    </DiagramFrame>
  );
}

function BioEarLayoutDiagram() {
  return (
    <DiagramFrame title="ear divisions">
      <DiagramDefs />
      <path d="M38 64 C18 76 18 118 40 128 C54 116 56 78 38 64 Z" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <line x1="58" y1="96" x2="92" y2="96" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="4" />
      <line x1="96" y1="70" x2="96" y2="126" className="stroke-rose-500" strokeWidth="3" />
      <circle cx="122" cy="92" r="5" className="fill-sky-500" />
      <circle cx="138" cy="88" r="5" className="fill-sky-500" />
      <circle cx="154" cy="94" r="5" className="fill-sky-500" />
      <path d="M166 98 C188 74 204 102 182 124 C162 144 150 118 166 98 Z" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" strokeWidth="2" />
      <text x="38" y="152" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">outer</text>
      <text x="126" y="152" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">middle</text>
      <text x="178" y="152" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">inner</text>
    </DiagramFrame>
  );
}

function BioHypothalamusPituitaryDiagram() {
  return (
    <DiagramFrame title="hypothalamus to pituitary">
      <DiagramDefs />
      <BioNode x={52} y={24} width={116} text="Hypothalamus" tone="green" />
      <BioNode x={22} y={92} width={78} text="Adenohypophysis" />
      <BioNode x={120} y={92} width={78} text="Neurohypophysis" tone="amber" />
      <Arrow x1={110} y1={50} x2={61} y2={92} label="releasing / inhibiting" labelX={36} labelY={72} />
      <Arrow x1={110} y1={50} x2={159} y2={92} label="oxytocin, ADH" labelX={146} labelY={72} />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">posterior pituitary stores hypothalamic hormones</text>
    </DiagramFrame>
  );
}

function BioBloodGlucoseRegulationDiagram() {
  return (
    <DiagramFrame title="glucose homeostasis">
      <DiagramDefs />
      <BioNode x={18} y={40} width={70} text="Alpha cells" tone="amber" />
      <BioNode x={132} y={40} width={70} text="Beta cells" tone="green" />
      <BioNode x={18} y={108} width={70} text="Glucagon" />
      <BioNode x={132} y={108} width={70} text="Insulin" />
      <Arrow x1={53} y1={66} x2={53} y2={108} />
      <Arrow x1={167} y1={66} x2={167} y2={108} />
      <text x="52" y="158" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">hyperglycemic</text>
      <text x="168" y="158" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">hypoglycemic</text>
    </DiagramFrame>
  );
}

function BioHormoneReceptorTypesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="membrane-bound">
        <DiagramDefs />
        <line x1="34" y1="100" x2="186" y2="100" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="4" />
        <rect x="96" y="74" width="28" height="52" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
        <circle cx="110" cy="50" r="10" className="fill-amber-400" />
        <Arrow x1={110} y1={62} x2={110} y2={74} label="FSH" labelX={128} labelY={66} />
        <text x="110" y="150" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">second messenger</text>
      </DiagramFrame>
      <DiagramFrame title="intracellular">
        <DiagramDefs />
        <circle cx="110" cy="96" r="52" className="fill-rose-50 stroke-rose-500 dark:fill-rose-950/30" strokeWidth="2" />
        <circle cx="126" cy="100" r="20" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
        <circle cx="68" cy="54" r="8" className="fill-amber-400" />
        <Arrow x1={76} y1={60} x2={111} y2={90} label="steroid" labelX={55} labelY={84} />
        <text x="126" y="152" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">gene expression</text>
      </DiagramFrame>
    </div>
  );
}

function BioReproductionEventsDiagram() {
  return (
    <DiagramFrame title="sexual reproduction events">
      <DiagramDefs />
      <BioNode x={18} y={36} width={74} text="Pre-fertilisation" tone="amber" />
      <BioNode x={74} y={92} width={72} text="Fertilisation" />
      <BioNode x={128} y={148} width={74} text="Post-fertilisation" tone="green" />
      <Arrow x1={92} y1={50} x2={104} y2={92} label="gametes" labelX={124} labelY={72} />
      <Arrow x1={146} y1={106} x2={160} y2={148} label="zygote" labelX={178} labelY={130} />
    </DiagramFrame>
  );
}

function BioFertilisationTypesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="external">
        <DiagramDefs />
        <path d="M28 122 C62 100 86 138 120 114 C150 94 170 118 194 100" className="stroke-sky-500" fill="none" strokeWidth="3" />
        <circle cx="78" cy="86" r="10" className="fill-amber-400" />
        <circle cx="132" cy="86" r="10" className="fill-rose-400" />
        <Arrow x1={88} y1={86} x2={122} y2={86} label="water" labelX={110} labelY={72} />
        <text x="110" y="150" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">zygote outside body</text>
      </DiagramFrame>
      <DiagramFrame title="internal">
        <DiagramDefs />
        <ellipse cx="110" cy="92" rx="58" ry="40" className="fill-rose-50 stroke-rose-500 dark:fill-rose-950/30" strokeWidth="2" />
        <circle cx="92" cy="92" r="10" className="fill-amber-400" />
        <circle cx="128" cy="92" r="10" className="fill-sky-400" />
        <Arrow x1={102} y1={92} x2={118} y2={92} label="inside" labelX={110} labelY={76} />
        <text x="110" y="150" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">zygote develops in organism</text>
      </DiagramFrame>
    </div>
  );
}

function BioAntherMicrosporangiumDiagram() {
  return (
    <DiagramFrame title="bilobed anther">
      <ellipse cx="76" cy="86" rx="40" ry="58" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <ellipse cx="144" cy="86" rx="40" ry="58" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      {[60, 92, 128, 160].map((x) => (
        <circle key={x} cx={x} cy="86" r="13" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
      ))}
      <line x1="110" y1="142" x2="110" y2="172" className="stroke-emerald-500" strokeWidth="4" />
      <text x="110" y="36" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">four microsporangia, two in each lobe</text>
    </DiagramFrame>
  );
}

function BioPollenGrainDiagram() {
  return (
    <DiagramFrame title="pollen grain">
      <circle cx="110" cy="92" r="54" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="4" />
      <circle cx="110" cy="92" r="42" className="fill-sky-50 stroke-sky-500 dark:fill-sky-950/30" strokeWidth="2" />
      <circle cx="96" cy="90" r="18" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" strokeWidth="2" />
      <ellipse cx="134" cy="104" rx="13" ry="8" className="fill-rose-300 stroke-rose-500" strokeWidth="2" />
      <path d="M154 56 C162 66 162 78 154 88" className="stroke-white dark:stroke-stone-900" fill="none" strokeWidth="6" />
      <text x="74" y="154" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">vegetative</text>
      <text x="146" y="154" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">generative</text>
      <text x="166" y="48" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">germ pore</text>
    </DiagramFrame>
  );
}

function BioOvuleDiagram() {
  return (
    <DiagramFrame title="ovule">
      <path d="M76 44 C34 72 42 148 104 156 C156 164 184 112 154 66 C136 40 104 30 76 44 Z" className="fill-emerald-50 stroke-emerald-500 dark:fill-emerald-950/30" strokeWidth="2" />
      <path d="M88 60 C56 82 64 136 108 140 C148 144 166 104 146 76 C132 58 108 52 88 60 Z" className="fill-sky-50 stroke-sky-500 dark:fill-sky-950/30" strokeWidth="2" />
      <ellipse cx="112" cy="98" rx="28" ry="40" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <path d="M56 112 C36 120 30 144 26 164" className="stroke-rose-500" fill="none" strokeWidth="4" />
      <text x="42" y="78" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">micropyle</text>
      <text x="168" y="64" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">chalaza</text>
      <text x="112" y="102" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">embryo sac</text>
    </DiagramFrame>
  );
}

function BioEmbryoSacDiagram() {
  return (
    <DiagramFrame title="7-celled, 8-nucleate">
      <ellipse cx="110" cy="92" rx="54" ry="72" className="fill-sky-50 stroke-sky-500 dark:fill-sky-950/30" strokeWidth="2" />
      <circle cx="88" cy="44" r="9" className="fill-emerald-400" />
      <circle cx="110" cy="42" r="9" className="fill-amber-400" />
      <circle cx="132" cy="44" r="9" className="fill-emerald-400" />
      <circle cx="102" cy="92" r="8" className="fill-rose-400" />
      <circle cx="120" cy="92" r="8" className="fill-rose-400" />
      <circle cx="88" cy="142" r="8" className="fill-slate-400" />
      <circle cx="110" cy="146" r="8" className="fill-slate-400" />
      <circle cx="132" cy="142" r="8" className="fill-slate-400" />
      <text x="110" y="24" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">micropylar end: egg apparatus</text>
      <text x="110" y="176" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">chalazal end: antipodals</text>
    </DiagramFrame>
  );
}

function BioDoubleFertilisationDiagram() {
  return (
    <DiagramFrame title="double fertilisation">
      <DiagramDefs />
      <BioNode x={14} y={54} width={70} text="Male gamete 1" tone="amber" />
      <BioNode x={136} y={34} width={64} text="Egg" tone="green" />
      <BioNode x={136} y={116} width={64} text="Polar nuclei" tone="green" />
      <BioNode x={14} y={120} width={70} text="Male gamete 2" tone="amber" />
      <Arrow x1={84} y1={68} x2={136} y2={48} label="syngamy" labelX={108} labelY={44} />
      <Arrow x1={84} y1={134} x2={136} y2={130} label="triple fusion" labelX={104} labelY={152} />
      <text x="168" y="82" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">zygote</text>
      <text x="168" y="164" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">PEN</text>
    </DiagramFrame>
  );
}

function BioMaleReproductiveRouteDiagram() {
  const items = ["Seminiferous", "Rete testis", "Vasa efferentia", "Epididymis", "Vas deferens", "Urethra"];
  return (
    <DiagramFrame title="sperm route">
      <DiagramDefs />
      {items.map((item, index) => {
        const x = index % 2 === 0 ? 20 : 122;
        const y = 20 + Math.floor(index / 2) * 50;
        return (
          <g key={item}>
            <BioNode x={x} y={y} width={78} text={item} tone={index < 2 ? "amber" : "green"} />
            {index < items.length - 1 && <Arrow x1={x + 78} y1={y + 14} x2={index % 2 === 0 ? 122 : 98} y2={index % 2 === 0 ? y + 14 : y + 64} />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioSpermStructureDiagram() {
  return (
    <DiagramFrame title="sperm structure">
      <ellipse cx="54" cy="92" rx="26" ry="20" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/40" strokeWidth="2" />
      <path d="M32 92 C38 72 58 70 72 82" className="fill-amber-300 stroke-amber-500" strokeWidth="2" />
      <rect x="80" y="84" width="34" height="16" rx="8" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/40" strokeWidth="2" />
      <path d="M114 92 C140 72 160 112 190 90" className="stroke-rose-500" fill="none" strokeWidth="4" strokeLinecap="round" />
      <text x="50" y="136" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">head</text>
      <text x="98" y="124" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">middle</text>
      <text x="164" y="132" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">tail</text>
    </DiagramFrame>
  );
}

function BioMenstrualCycleDiagram() {
  return (
    <DiagramFrame title="menstrual cycle">
      <circle cx="110" cy="92" r="58" className="fill-transparent stroke-slate-300 dark:stroke-stone-700" strokeWidth="8" />
      <path d="M110 34 A58 58 0 0 1 168 92" className="stroke-rose-500" fill="none" strokeWidth="8" />
      <path d="M168 92 A58 58 0 0 1 110 150" className="stroke-amber-500" fill="none" strokeWidth="8" />
      <path d="M110 150 A58 58 0 0 1 52 92" className="stroke-emerald-500" fill="none" strokeWidth="8" />
      <path d="M52 92 A58 58 0 0 1 110 34" className="stroke-sky-500" fill="none" strokeWidth="8" />
      <text x="110" y="30" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">1-5</text>
      <text x="182" y="96" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">5-13</text>
      <text x="110" y="170" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">14 ovulation</text>
      <text x="34" y="96" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">15-28</text>
    </DiagramFrame>
  );
}

function BioFertilisationImplantationDiagram() {
  return (
    <DiagramFrame title="fertilisation to implantation">
      <DiagramDefs />
      <BioNode x={16} y={70} width={54} text="Sperm" tone="amber" />
      <BioNode x={16} y={118} width={54} text="Ovum" tone="green" />
      <BioNode x={92} y={94} width={62} text="Ampulla" />
      <BioNode x={164} y={94} width={42} text="Uterus" tone="green" />
      <Arrow x1={70} y1={84} x2={92} y2={102} />
      <Arrow x1={70} y1={132} x2={92} y2={108} />
      <Arrow x1={154} y1={108} x2={164} y2={108} label="cleavage" labelX={148} labelY={80} />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">morula to blastocyst to implantation</text>
    </DiagramFrame>
  );
}

function BioContraceptiveMethodsDiagram() {
  return (
    <DiagramFrame title="contraceptive groups">
      <DiagramDefs />
      <BioNode x={72} y={18} width={76} text="Contraception" tone="amber" />
      {[
        ["Natural", 12, 82],
        ["Barrier", 82, 82],
        ["IUD", 152, 82],
        ["Hormonal", 44, 142],
        ["Surgical", 116, 142],
      ].map(([label, x, y]) => (
        <g key={label}>
          <BioNode x={x} y={y} width={54} text={label} tone="green" />
          <Arrow x1={110} y1={44} x2={Number(x) + 27} y2={y} />
        </g>
      ))}
    </DiagramFrame>
  );
}

function BioArtFlowDiagram() {
  return (
    <DiagramFrame title="ART routes">
      <DiagramDefs />
      <BioNode x={18} y={38} width={54} text="IVF" tone="amber" />
      <BioNode x={92} y={28} width={54} text="ZIFT" />
      <BioNode x={154} y={28} width={46} text="Tube" tone="green" />
      <BioNode x={92} y={94} width={54} text="IUT" />
      <BioNode x={154} y={94} width={46} text="Uterus" tone="green" />
      <BioNode x={18} y={148} width={54} text="AI/IUI" tone="amber" />
      <Arrow x1={72} y1={52} x2={92} y2={42} label="<=8" labelX={84} labelY={24} />
      <Arrow x1={146} y1={42} x2={154} y2={42} />
      <Arrow x1={72} y1={52} x2={92} y2={108} label=">8" labelX={80} labelY={92} />
      <Arrow x1={146} y1={108} x2={154} y2={108} />
      <Arrow x1={72} y1={162} x2={154} y2={122} label="semen" labelX={110} labelY={156} />
    </DiagramFrame>
  );
}

function BioMonohybridCrossDiagram() {
  return (
    <DiagramFrame title="monohybrid F2">
      <text x="110" y="30" textAnchor="middle" className="fill-slate-700 text-[11px] font-bold dark:fill-stone-200">Tt x Tt</text>
      <line x1="62" y1="56" x2="170" y2="56" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="2" />
      <line x1="62" y1="92" x2="170" y2="92" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="2" />
      <line x1="62" y1="128" x2="170" y2="128" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="2" />
      <line x1="98" y1="56" x2="98" y2="164" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="2" />
      <line x1="134" y1="56" x2="134" y2="164" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="2" />
      {["TT", "Tt", "Tt", "tt"].map((label, index) => (
        <text key={label + index} x={80 + (index % 2) * 36} y={82 + Math.floor(index / 2) * 36} textAnchor="middle" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">{label}</text>
      ))}
      <text x="110" y="178" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">phenotype 3:1, genotype 1:2:1</text>
    </DiagramFrame>
  );
}

function BioDihybridRatioDiagram() {
  return (
    <DiagramFrame title="dihybrid F2">
      <DiagramDefs />
      <BioNode x={22} y={36} width={68} text="Round yellow" tone="green" />
      <BioNode x={130} y={36} width={68} text="Round green" tone="amber" />
      <BioNode x={22} y={112} width={68} text="Wrinkled yellow" tone="amber" />
      <BioNode x={130} y={112} width={68} text="Wrinkled green" />
      <text x="56" y="96" textAnchor="middle" className="fill-slate-700 text-[18px] font-bold dark:fill-stone-200">9</text>
      <text x="164" y="96" textAnchor="middle" className="fill-slate-700 text-[18px] font-bold dark:fill-stone-200">3</text>
      <text x="56" y="172" textAnchor="middle" className="fill-slate-700 text-[18px] font-bold dark:fill-stone-200">3</text>
      <text x="164" y="172" textAnchor="middle" className="fill-slate-700 text-[18px] font-bold dark:fill-stone-200">1</text>
    </DiagramFrame>
  );
}

function BioChromosomalTheoryDiagram() {
  return (
    <DiagramFrame title="chromosome segregation">
      <DiagramDefs />
      <line x1="70" y1="38" x2="94" y2="116" className="stroke-amber-500" strokeWidth="6" strokeLinecap="round" />
      <line x1="150" y1="38" x2="126" y2="116" className="stroke-sky-500" strokeWidth="6" strokeLinecap="round" />
      <BioNode x={30} y={142} width={60} text="Gamete A" tone="amber" />
      <BioNode x={130} y={142} width={60} text="Gamete a" tone="green" />
      <Arrow x1={86} y1={118} x2={60} y2={142} />
      <Arrow x1={132} y1={118} x2={160} y2={142} />
      <text x="110" y="24" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">homologous pair segregates in gamete formation</text>
    </DiagramFrame>
  );
}

function BioLinkageRecombinationDiagram() {
  return (
    <DiagramFrame title="linkage and recombination">
      <line x1="46" y1="66" x2="174" y2="66" className="stroke-amber-500" strokeWidth="8" strokeLinecap="round" />
      <circle cx="82" cy="66" r="7" className="fill-rose-500" />
      <circle cx="108" cy="66" r="7" className="fill-sky-500" />
      <text x="94" y="42" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">tight: 1.3%</text>
      <line x1="46" y1="124" x2="174" y2="124" className="stroke-emerald-500" strokeWidth="8" strokeLinecap="round" />
      <circle cx="70" cy="124" r="7" className="fill-rose-500" />
      <circle cx="148" cy="124" r="7" className="fill-sky-500" />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">loose: 37.2%</text>
    </DiagramFrame>
  );
}

function BioSexDeterminationDiagram() {
  return (
    <DiagramFrame title="sex determination">
      <DiagramDefs />
      <BioNode x={18} y={28} width={56} text="XX-XO" tone="amber" />
      <BioNode x={82} y={28} width={56} text="XX-XY" tone="green" />
      <BioNode x={146} y={28} width={56} text="ZZ-ZW" />
      <BioNode x={18} y={114} width={184} text="honeybee: female 32, male 16" tone="amber" />
      <text x="46" y="78" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">male heterogamety</text>
      <text x="110" y="78" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">male heterogamety</text>
      <text x="174" y="78" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">female</text>
      <Arrow x1={110} y1={54} x2={110} y2={114} />
    </DiagramFrame>
  );
}

function BioDnaDoubleHelixDiagram() {
  return (
    <DiagramFrame title="DNA double helix">
      {[0, 1, 2, 3, 4].map((index) => (
        <g key={index}>
          <path d={`M70 ${36 + index * 28} C92 ${50 + index * 28} 128 ${22 + index * 28} 150 ${36 + index * 28}`} className="stroke-sky-500" fill="none" strokeWidth="3" />
          <path d={`M70 ${50 + index * 28} C92 ${36 + index * 28} 128 ${64 + index * 28} 150 ${50 + index * 28}`} className="stroke-rose-500" fill="none" strokeWidth="3" />
          <line x1="82" y1={43 + index * 28} x2="138" y2={43 + index * 28} className="stroke-amber-500" strokeWidth="2" />
        </g>
      ))}
      <text x="110" y="176" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">antiparallel strands, A=T and C=G</text>
    </DiagramFrame>
  );
}

function BioNucleosomePackagingDiagram() {
  return (
    <DiagramFrame title="nucleosome">
      <circle cx="110" cy="88" r="42" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <path d="M36 88 C66 34 154 142 184 88" className="stroke-sky-500" fill="none" strokeWidth="5" strokeLinecap="round" />
      <text x="110" y="92" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold dark:fill-stone-200">8 histones</text>
      <text x="110" y="154" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">typical nucleosome contains 200 bp</text>
    </DiagramFrame>
  );
}

function BioGriffithExperimentDiagram() {
  const rows = [["S", "die"], ["R", "live"], ["HK S", "live"], ["HK S + R", "die"]];
  return (
    <DiagramFrame title="Griffith result">
      <DiagramDefs />
      {rows.map(([label, result], index) => (
        <g key={label}>
          <BioNode x={28} y={24 + index * 38} width={64} text={label} tone={result === "die" ? "amber" : "green"} />
          <Arrow x1={92} y1={38 + index * 38} x2={134} y2={38 + index * 38} />
          <BioNode x={134} y={24 + index * 38} width={56} text={result} tone={result === "die" ? "amber" : "green"} />
        </g>
      ))}
    </DiagramFrame>
  );
}

function BioCentralDogmaDiagram() {
  return (
    <DiagramFrame title="central dogma">
      <DiagramDefs />
      <BioNode x={24} y={76} width={50} text="DNA" tone="amber" />
      <BioNode x={86} y={76} width={50} text="RNA" />
      <BioNode x={148} y={76} width={50} text="Protein" tone="green" />
      <Arrow x1={74} y1={90} x2={86} y2={90} label="transcription" labelX={90} labelY={66} />
      <Arrow x1={136} y1={90} x2={148} y2={90} label="translation" labelX={150} labelY={66} />
      <path d="M98 118 C76 150 50 136 48 104" className="stroke-rose-500" fill="none" strokeWidth="2" />
      <text x="70" y="156" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">reverse transcription</text>
    </DiagramFrame>
  );
}

function BioReplicationForkDiagram() {
  return (
    <DiagramFrame title="replication fork">
      <DiagramDefs />
      <path d="M42 36 L110 92 L42 148" className="stroke-slate-500 dark:stroke-stone-400" fill="none" strokeWidth="3" />
      <path d="M178 36 L110 92 L178 148" className="stroke-slate-500 dark:stroke-stone-400" fill="none" strokeWidth="3" />
      <Arrow x1={110} y1={92} x2={66} y2={56} label="leading" labelX={58} labelY={80} />
      <Arrow x1={110} y1={92} x2={154} y2={128} label="lagging" labelX={158} labelY={110} />
      <text x="110" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">helicase opens fork; ligase joins Okazaki fragments</text>
    </DiagramFrame>
  );
}

function BioTranscriptionUnitDiagram() {
  return (
    <DiagramFrame title="transcription unit">
      <DiagramDefs />
      <line x1="24" y1="90" x2="196" y2="90" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="3" />
      <BioNode x={28} y={58} width={52} text="Promoter" tone="amber" />
      <BioNode x={88} y={58} width={58} text="Gene" />
      <BioNode x={154} y={58} width={52} text="Terminator" tone="green" />
      <Arrow x1={80} y1={120} x2={154} y2={120} label="RNA 5'->3'" labelX={120} labelY={144} />
    </DiagramFrame>
  );
}

function BioTranslationFlowDiagram() {
  return (
    <DiagramFrame title="translation">
      <DiagramDefs />
      <BioNode x={20} y={50} width={60} text="Charge tRNA" tone="amber" />
      <BioNode x={92} y={50} width={50} text="Initiate" />
      <BioNode x={154} y={50} width={46} text="Elongate" tone="green" />
      <BioNode x={82} y={124} width={58} text="Terminate" tone="amber" />
      <Arrow x1={80} y1={64} x2={92} y2={64} />
      <Arrow x1={142} y1={64} x2={154} y2={64} />
      <Arrow x1={177} y1={76} x2={128} y2={124} />
      <text x="110" y="170" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">AUG starts; release factor stops</text>
    </DiagramFrame>
  );
}

function BioLacOperonDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="no lactose">
        <DiagramDefs />
        <BioNode x={24} y={64} width={58} text="Repressor" tone="amber" />
        <BioNode x={116} y={64} width={58} text="Operator" />
        <Arrow x1={82} y1={78} x2={116} y2={78} />
        <text x="110" y="140" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">RNA polymerase blocked</text>
      </DiagramFrame>
      <DiagramFrame title="lactose present">
        <DiagramDefs />
        <BioNode x={24} y={50} width={58} text="Inducer" tone="green" />
        <BioNode x={96} y={50} width={58} text="Repressor" tone="amber" />
        <BioNode x={92} y={118} width={72} text="z y a transcribed" tone="green" />
        <Arrow x1={82} y1={64} x2={96} y2={64} />
        <Arrow x1={126} y1={76} x2={126} y2={118} />
      </DiagramFrame>
    </div>
  );
}

function BioUreyMillerDiagram() {
  return (
    <DiagramFrame title="Urey-Miller">
      <DiagramDefs />
      <circle cx="104" cy="78" r="36" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/40" strokeWidth="2" />
      <path d="M104 42 C148 34 168 62 148 92" className="stroke-sky-500" fill="none" strokeWidth="3" />
      <path d="M104 114 C72 126 72 154 112 160 C152 154 148 126 104 114" className="fill-sky-50 stroke-sky-500 dark:fill-sky-950/30" strokeWidth="2" />
      <text x="104" y="82" textAnchor="middle" className="fill-slate-700 text-[9px] font-bold dark:fill-stone-200">CH4 NH3 H2O H2</text>
      <text x="110" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">electric discharge at 800°C formed amino acids</text>
    </DiagramFrame>
  );
}

function BioHomologyAnalogyDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DiagramFrame title="homology">
        <path d="M58 132 L92 58 L126 132 M92 58 L160 132" className="stroke-emerald-500" fill="none" strokeWidth="4" strokeLinecap="round" />
        <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">same origin, different function</text>
      </DiagramFrame>
      <DiagramFrame title="analogy">
        <path d="M48 100 C76 56 108 56 136 100 C164 144 190 120 198 92" className="stroke-amber-500" fill="none" strokeWidth="4" />
        <text x="110" y="158" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">same function, different origin</text>
      </DiagramFrame>
    </div>
  );
}

function BioNaturalSelectionFlowDiagram() {
  return (
    <DiagramFrame title="natural selection">
      <DiagramDefs />
      <BioNode x={18} y={30} width={70} text="Variation" tone="amber" />
      <BioNode x={132} y={30} width={70} text="Limited resources" />
      <BioNode x={74} y={94} width={72} text="Struggle" tone="green" />
      <BioNode x={60} y={152} width={100} text="Survival of fittest" tone="amber" />
      <Arrow x1={88} y1={44} x2={104} y2={94} />
      <Arrow x1={132} y1={44} x2={116} y2={94} />
      <Arrow x1={110} y1={120} x2={110} y2={152} />
    </DiagramFrame>
  );
}

function BioHardyWeinbergDiagram() {
  return (
    <DiagramFrame title="Hardy-Weinberg">
      <text x="110" y="76" textAnchor="middle" className="fill-slate-700 text-[20px] font-bold dark:fill-stone-200">p² + 2pq + q² = 1</text>
      <text x="66" y="120" textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-stone-400">AA = p²</text>
      <text x="110" y="140" textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-stone-400">Aa = 2pq</text>
      <text x="154" y="120" textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-stone-400">aa = q²</text>
    </DiagramFrame>
  );
}

function BioHumanEvolutionTimelineDiagram() {
  const labels = ["Dryo", "Rama", "Australo", "habilis", "erectus", "Neander", "sapiens"];
  return (
    <DiagramFrame title="human evolution">
      <DiagramDefs />
      <line x1="28" y1="104" x2="192" y2="104" className="stroke-slate-400 dark:stroke-stone-600" strokeWidth="3" />
      {labels.map((label, index) => {
        const x = 34 + index * 26;
        return (
          <g key={label}>
            <circle cx={x} cy="104" r="6" className="fill-amber-400" />
            <text x={x} y={index % 2 === 0 ? 82 : 132} textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">{label}</text>
          </g>
        );
      })}
      <text x="110" y="164" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">source sequence from Dryopithecus to H. sapiens</text>
    </DiagramFrame>
  );
}

function BioImmuneClassificationDiagram() {
  return (
    <DiagramFrame title="immunity">
      <rect x="76" y="18" width="68" height="24" rx="6" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/60" />
      <text x="110" y="34" textAnchor="middle" className="fill-emerald-900 text-[10px] font-bold dark:fill-emerald-100">Immunity</text>
      <path d="M110 42 V62 M70 62 H150" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" fill="none" />
      {[["Innate", "birth", 30], ["Acquired", "memory", 124]].map(([label, note, x]) => (
        <g key={label}>
          <rect x={x} y="72" width="66" height="36" rx="7" className="fill-white stroke-sky-500 dark:fill-stone-900" />
          <text x={x + 33} y="87" textAnchor="middle" className="fill-slate-800 text-[10px] font-bold dark:fill-stone-100">{label}</text>
          <text x={x + 33} y="101" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">{note}</text>
        </g>
      ))}
      <text x="63" y="133" textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">physical | physiological</text>
      <text x="63" y="146" textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">cellular | cytokine</text>
      <text x="157" y="133" textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">{"primary -> secondary"}</text>
      <text x="157" y="146" textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">B cells + T cells</text>
    </DiagramFrame>
  );
}

function BioAntibodyStructureDiagram() {
  return (
    <DiagramFrame title="antibody H2L2">
      <path d="M110 82 L73 40 M110 82 L147 40 M110 82 V150" className="stroke-violet-600" strokeWidth="8" strokeLinecap="round" />
      <path d="M86 56 L63 31 M134 56 L157 31" className="stroke-pink-500" strokeWidth="5" strokeLinecap="round" />
      <circle cx="110" cy="82" r="7" className="fill-white stroke-violet-700 dark:fill-stone-900" />
      <text x="55" y="24" className="fill-slate-700 text-[9px] dark:fill-stone-200">Light</text>
      <text x="149" y="24" className="fill-slate-700 text-[9px] dark:fill-stone-200">Light</text>
      <text x="49" y="64" className="fill-slate-700 text-[9px] dark:fill-stone-200">Heavy</text>
      <text x="148" y="64" className="fill-slate-700 text-[9px] dark:fill-stone-200">Heavy</text>
      <text x="110" y="171" textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-stone-400">2 heavy chains + 2 light chains</text>
    </DiagramFrame>
  );
}

function BioHivSequenceDiagram() {
  const steps = ["HIV", "Macrophage", "Viral DNA", "Helper T", "Low immunity"];
  return (
    <DiagramFrame title="HIV sequence">
      {steps.map((step, index) => {
        const x = 13 + index * 40;
        return (
          <g key={step}>
            <rect x={x} y="72" width="34" height="28" rx="6" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/60" />
            <text x={x + 17} y="89" textAnchor="middle" className="fill-rose-900 text-[7px] font-bold dark:fill-rose-100">{step}</text>
            {index < steps.length - 1 && <path d={`M${x + 36} 86 H${x + 46}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
      <text x="110" y="126" textAnchor="middle" className="fill-slate-600 text-[8px] dark:fill-stone-300">reverse transcriptase makes viral DNA</text>
    </DiagramFrame>
  );
}

function BioCancerMetastasisDiagram() {
  return (
    <DiagramFrame title="tumour spread">
      <circle cx="62" cy="78" r="28" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/60" />
      <text x="62" y="82" textAnchor="middle" className="fill-emerald-900 text-[10px] font-bold dark:fill-emerald-100">confined</text>
      <circle cx="148" cy="74" r="24" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/60" />
      <path d="M164 88 C180 103 183 124 170 142" className="stroke-rose-500" strokeWidth="2" fill="none" />
      <circle cx="170" cy="148" r="11" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/60" />
      <text x="62" y="126" textAnchor="middle" className="fill-slate-600 text-[9px] dark:fill-stone-300">benign</text>
      <text x="155" y="126" textAnchor="middle" className="fill-slate-600 text-[9px] dark:fill-stone-300">malignant</text>
      <text x="155" y="165" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">metastasis via blood</text>
    </DiagramFrame>
  );
}

function BioPlantBreedingSequenceDiagram() {
  const steps = ["Variability", "Parents", "Hybridise", "Select", "Release"];
  return (
    <DiagramFrame title="plant breeding">
      {steps.map((step, index) => {
        const y = 22 + index * 30;
        return (
          <g key={step}>
            <rect x="58" y={y} width="104" height="20" rx="6" className="fill-lime-100 stroke-lime-600 dark:fill-lime-950/60" />
            <text x="110" y={y + 14} textAnchor="middle" className="fill-lime-900 text-[9px] font-bold dark:fill-lime-100">{step}</text>
            {index < steps.length - 1 && <path d={`M110 ${y + 22} V${y + 30}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioMoetFlowDiagram() {
  const steps = ["FSH", "6-8 eggs", "Mate/AI", "8-32 cells", "Surrogate"];
  return (
    <DiagramFrame title="MOET">
      {steps.map((step, index) => {
        const x = 12 + index * 40;
        return (
          <g key={step}>
            <rect x={x} y="78" width="34" height="28" rx="6" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/60" />
            <text x={x + 17} y="95" textAnchor="middle" className="fill-amber-950 text-[7px] font-bold dark:fill-amber-100">{step}</text>
            {index < steps.length - 1 && <path d={`M${x + 36} 92 H${x + 47}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioSewageTreatmentDiagram() {
  const steps = ["Sewage", "Primary", "Aeration", "Flocs", "Activated sludge", "Effluent"];
  return (
    <DiagramFrame title="sewage treatment">
      {steps.map((step, index) => {
        const y = 18 + index * 26;
        return (
          <g key={step}>
            <rect x="46" y={y} width="128" height="18" rx="5" className="fill-cyan-100 stroke-cyan-600 dark:fill-cyan-950/60" />
            <text x="110" y={y + 12} textAnchor="middle" className="fill-cyan-950 text-[8px] font-bold dark:fill-cyan-100">{step}</text>
            {index < steps.length - 1 && <path d={`M110 ${y + 20} V${y + 26}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
      <text x="110" y="180" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">BOD reduces during biological treatment</text>
    </DiagramFrame>
  );
}

function BioBiogasProcessDiagram() {
  return (
    <DiagramFrame title="biogas">
      <rect x="22" y="70" width="54" height="34" rx="7" className="fill-yellow-100 stroke-yellow-600 dark:fill-yellow-950/60" />
      <text x="49" y="90" textAnchor="middle" className="fill-yellow-950 text-[8px] font-bold dark:fill-yellow-100">Dung slurry</text>
      <path d="M78 87 H105 M156 87 H184" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
      <rect x="106" y="56" width="50" height="62" rx="9" className="fill-stone-100 stroke-stone-500 dark:fill-stone-900" />
      <text x="131" y="80" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">anaerobic</text>
      <text x="131" y="94" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">tank</text>
      <rect x="184" y="70" width="24" height="34" rx="6" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/60" />
      <text x="196" y="90" textAnchor="middle" className="fill-emerald-900 text-[8px] font-bold dark:fill-emerald-100">CH4</text>
      <text x="110" y="142" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">Methanobacterium produces methane</text>
    </DiagramFrame>
  );
}

function BioBiofertiliserMapDiagram() {
  return (
    <DiagramFrame title="biofertilisers">
      <circle cx="110" cy="86" r="28" className="fill-green-100 stroke-green-600 dark:fill-green-950/60" />
      <text x="110" y="90" textAnchor="middle" className="fill-green-950 text-[9px] font-bold dark:fill-green-100">soil nutrients</text>
      {[["Rhizobium", 26, 34], ["Azospirillum", 126, 34], ["Glomus", 28, 134], ["Anabaena", 128, 134]].map(([label, x, y]) => (
        <g key={label}>
          <rect x={x} y={y} width="66" height="22" rx="6" className="fill-white stroke-green-500 dark:fill-stone-900" />
          <text x={x + 33} y={y + 14} textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-100">{label}</text>
        </g>
      ))}
      <path d="M76 55 L92 70 M144 55 L128 70 M76 144 L94 106 M144 144 L128 106" className="stroke-green-500" strokeWidth="2" />
    </DiagramFrame>
  );
}

function BioRestrictionCutDiagram() {
  return (
    <DiagramFrame title="EcoRI cut">
      <text x="110" y="34" textAnchor="middle" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">{"5' GAATTC 3'"}</text>
      <text x="110" y="52" textAnchor="middle" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-200">{"3' CTTAAG 5'"}</text>
      <path d="M52 86 H168 M52 104 H168" className="stroke-sky-600" strokeWidth="4" strokeLinecap="round" />
      <path d="M98 78 L108 112 M122 78 L112 112" className="stroke-rose-500" strokeWidth="2.5" />
      <text x="110" y="134" textAnchor="middle" className="fill-slate-600 text-[9px] dark:fill-stone-300">single stranded sticky ends</text>
      <text x="110" y="150" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">DNA ligase joins complementary ends</text>
    </DiagramFrame>
  );
}

function BioPbr322MapDiagram() {
  const labels = [
    ["ori", 110, 148],
    ["rop", 83, 124],
    ["ampR", 72, 67],
    ["tetR", 151, 76],
    ["BamH I", 168, 103],
  ];
  return (
    <DiagramFrame title="pBR322">
      <circle cx="110" cy="94" r="50" className="fill-pink-100 stroke-pink-600 dark:fill-pink-950/60" strokeWidth="7" />
      <path d="M69 64 A50 50 0 0 1 118 44" className="stroke-cyan-500" strokeWidth="7" fill="none" />
      <path d="M134 49 A50 50 0 0 1 158 103" className="stroke-amber-500" strokeWidth="7" fill="none" />
      <path d="M116 144 A50 50 0 0 1 76 129" className="stroke-emerald-500" strokeWidth="7" fill="none" />
      <text x="110" y="98" textAnchor="middle" className="fill-slate-700 text-[12px] font-bold dark:fill-stone-100">pBR322</text>
      {labels.map(([label, x, y]) => (
        <text key={label} x={x} y={y} textAnchor="middle" className="fill-slate-600 text-[8px] font-bold dark:fill-stone-300">{label}</text>
      ))}
      <text x="110" y="172" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">visible source labels only</text>
    </DiagramFrame>
  );
}

function BioRdnaWorkflowDiagram() {
  const steps = ["Isolate DNA", "Cut", "PCR", "Host", "Product", "DSP"];
  return (
    <DiagramFrame title="rDNA workflow">
      {steps.map((step, index) => {
        const y = 18 + index * 26;
        return (
          <g key={step}>
            <rect x="52" y={y} width="116" height="18" rx="5" className="fill-indigo-100 stroke-indigo-500 dark:fill-indigo-950/60" />
            <text x="110" y={y + 12} textAnchor="middle" className="fill-indigo-950 text-[8px] font-bold dark:fill-indigo-100">{step}</text>
            {index < steps.length - 1 && <path d={`M110 ${y + 20} V${y + 26}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioGelElectrophoresisDiagram() {
  return (
    <DiagramFrame title="agarose gel">
      <rect x="42" y="42" width="136" height="96" rx="7" className="fill-sky-50 stroke-sky-500 dark:fill-sky-950/40" />
      <text x="26" y="92" className="fill-slate-600 text-[10px] font-bold dark:fill-stone-300">-</text>
      <text x="186" y="92" className="fill-slate-600 text-[10px] font-bold dark:fill-stone-300">+</text>
      {[56, 76, 96, 116].map((x, i) => (
        <g key={x}>
          <rect x={x} y="54" width="8" height="20" className="fill-white stroke-slate-400 dark:fill-stone-900" />
          <rect x={x + 1} y={90 + i * 6} width={28 - i * 4} height="4" rx="2" className="fill-orange-500" />
        </g>
      ))}
      <path d="M70 152 H150" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
      <text x="110" y="170" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">smaller fragments move farther to anode</text>
    </DiagramFrame>
  );
}

function BioPcrCycleDiagram() {
  const steps = [["94 C", "Denaturation", 110, 36], ["52 C", "Annealing", 52, 114], ["Taq", "Extension", 168, 114]];
  return (
    <DiagramFrame title="PCR cycle">
      <path d="M110 58 C55 60 42 116 80 142 M140 142 C178 116 165 60 110 58" className="stroke-amber-500" strokeWidth="3" fill="none" />
      {steps.map(([top, bottom, x, y]) => (
        <g key={bottom}>
          <circle cx={x} cy={y} r="24" className="fill-amber-100 stroke-amber-500 dark:fill-amber-950/60" />
          <text x={x} y={y - 2} textAnchor="middle" className="fill-amber-950 text-[9px] font-bold dark:fill-amber-100">{top}</text>
          <text x={x} y={y + 11} textAnchor="middle" className="fill-amber-900 text-[7px] font-bold dark:fill-amber-100">{bottom}</text>
        </g>
      ))}
      <text x="110" y="174" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">repeat to amplify gene of interest</text>
    </DiagramFrame>
  );
}

function BioBioreactorDiagram() {
  return (
    <DiagramFrame title="stirred-tank bioreactor">
      <rect x="78" y="32" width="64" height="116" rx="14" className="fill-cyan-100 stroke-cyan-600 dark:fill-cyan-950/60" />
      <line x1="110" y1="22" x2="110" y2="140" className="stroke-slate-600 dark:stroke-stone-300" strokeWidth="3" />
      {[58, 86, 114].map((y) => <path key={y} d={`M90 ${y} H130 M96 ${y - 7} L124 ${y + 7}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />)}
      <path d="M58 122 C72 112 76 112 86 122" className="stroke-sky-500" strokeWidth="2" fill="none" />
      <text x="52" y="132" className="fill-slate-600 text-[8px] dark:fill-stone-300">air/O2</text>
      <text x="160" y="58" className="fill-slate-600 text-[8px] dark:fill-stone-300">pH</text>
      <text x="156" y="76" className="fill-slate-600 text-[8px] dark:fill-stone-300">temp</text>
      <text x="153" y="94" className="fill-slate-600 text-[8px] dark:fill-stone-300">foam</text>
      <text x="110" y="170" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">agitator + oxygen + control systems</text>
    </DiagramFrame>
  );
}

function BioBtToxinDiagram() {
  const steps = ["Protoxin", "Insect gut", "Active toxin", "Pores", "Death"];
  return (
    <DiagramFrame title="Bt toxin">
      {steps.map((step, index) => {
        const x = 13 + index * 40;
        return (
          <g key={step}>
            <rect x={x} y="78" width="34" height="28" rx="6" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/60" />
            <text x={x + 17} y="95" textAnchor="middle" className="fill-rose-900 text-[7px] font-bold dark:fill-rose-100">{step}</text>
            {index < steps.length - 1 && <path d={`M${x + 36} 92 H${x + 46}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
      <text x="110" y="132" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">alkaline pH activates toxin</text>
    </DiagramFrame>
  );
}

function BioRnaiSequenceDiagram() {
  const steps = ["Nematode DNA", "Agrobacterium", "dsRNA", "mRNA silenced", "No survival"];
  return (
    <DiagramFrame title="RNAi">
      {steps.map((step, index) => {
        const y = 22 + index * 30;
        return (
          <g key={step}>
            <rect x="48" y={y} width="124" height="20" rx="6" className="fill-teal-100 stroke-teal-600 dark:fill-teal-950/60" />
            <text x="110" y={y + 14} textAnchor="middle" className="fill-teal-950 text-[8px] font-bold dark:fill-teal-100">{step}</text>
            {index < steps.length - 1 && <path d={`M110 ${y + 22} V${y + 30}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioRecombinantInsulinDiagram() {
  return (
    <DiagramFrame title="insulin">
      <ellipse cx="110" cy="52" rx="60" ry="16" className="fill-purple-100 stroke-purple-500 dark:fill-purple-950/60" />
      <text x="110" y="56" textAnchor="middle" className="fill-purple-950 text-[9px] font-bold dark:fill-purple-100">Proinsulin + C peptide</text>
      <path d="M110 70 V96" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />
      <rect x="58" y="104" width="42" height="24" rx="6" className="fill-sky-100 stroke-sky-500 dark:fill-sky-950/60" />
      <rect x="120" y="104" width="42" height="24" rx="6" className="fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950/60" />
      <text x="79" y="120" textAnchor="middle" className="fill-sky-900 text-[9px] font-bold dark:fill-sky-100">A chain</text>
      <text x="141" y="120" textAnchor="middle" className="fill-emerald-900 text-[9px] font-bold dark:fill-emerald-100">B chain</text>
      <path d="M100 116 H120" className="stroke-amber-500" strokeWidth="3" strokeDasharray="3 2" />
      <text x="110" y="154" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">disulphide bridges form Humulin</text>
    </DiagramFrame>
  );
}

function BioAdaGeneTherapyDiagram() {
  const steps = ["Lymphocytes", "ADA cDNA", "Retroviral vector", "Return cells", "Repeat"];
  return (
    <DiagramFrame title="ADA gene therapy">
      {steps.map((step, index) => {
        const y = 22 + index * 30;
        return (
          <g key={step}>
            <rect x="47" y={y} width="126" height="20" rx="6" className="fill-fuchsia-100 stroke-fuchsia-500 dark:fill-fuchsia-950/60" />
            <text x="110" y={y + 14} textAnchor="middle" className="fill-fuchsia-950 text-[8px] font-bold dark:fill-fuchsia-100">{step}</text>
            {index < steps.length - 1 && <path d={`M110 ${y + 22} V${y + 30}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioAgePyramidsDiagram() {
  const pyramids = [
    ["Expanding", [18, 30, 42]],
    ["Stable", [32, 34, 36]],
    ["Declining", [44, 32, 20]],
  ];
  return (
    <DiagramFrame title="age pyramids">
      {pyramids.map(([label, widths], index) => {
        const x = 20 + index * 66;
        return (
          <g key={label}>
            {widths.map((width, level) => (
              <rect
                key={`${label}-${level}`}
                x={x + (44 - width) / 2}
                y={54 + level * 20}
                width={width}
                height="14"
                rx="2"
                className="fill-emerald-100 stroke-emerald-600 dark:fill-emerald-950/60"
              />
            ))}
            <text x={x + 22} y="132" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{label}</text>
          </g>
        );
      })}
      <text x="110" y="156" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">pre-reproductive, reproductive, post-reproductive</text>
    </DiagramFrame>
  );
}

function BioPopulationGrowthCurvesDiagram() {
  return (
    <DiagramFrame title="population growth">
      <path d="M38 145 V36 M38 145 H182" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" fill="none" />
      <path d="M44 140 C72 132 95 108 116 72 C132 47 150 40 176 38" className="stroke-emerald-500" strokeWidth="3" fill="none" />
      <path d="M46 140 C72 132 97 113 116 86 C132 60 152 42 176 34" className="stroke-amber-500" strokeWidth="3" fill="none" strokeDasharray="5 4" />
      <path d="M42 58 H182" className="stroke-rose-400" strokeWidth="2" strokeDasharray="4 3" />
      <text x="184" y="61" className="fill-rose-500 text-[8px] font-bold">K</text>
      <text x="154" y="83" className="fill-emerald-700 text-[8px] font-bold dark:fill-emerald-200">S-shaped</text>
      <text x="126" y="36" className="fill-amber-700 text-[8px] font-bold dark:fill-amber-200">J-shaped</text>
      <text x="110" y="168" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">logistic growth levels at carrying capacity</text>
    </DiagramFrame>
  );
}

function BioInteractionMatrixDiagram() {
  const rows = [["Mutualism", "+", "+"], ["Competition", "-", "-"], ["Predation", "+", "-"], ["Commensalism", "+", "0"], ["Amensalism", "-", "0"]];
  return (
    <DiagramFrame title="population interactions">
      <rect x="26" y="26" width="168" height="126" rx="8" className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-stone-700" />
      <text x="100" y="44" className="fill-slate-500 text-[8px] font-bold dark:fill-stone-300">Species A</text>
      <text x="150" y="44" className="fill-slate-500 text-[8px] font-bold dark:fill-stone-300">Species B</text>
      {rows.map(([name, a, b], index) => {
        const y = 64 + index * 18;
        return (
          <g key={name}>
            <text x="40" y={y} className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{name}</text>
            <text x="112" y={y} textAnchor="middle" className="fill-emerald-700 text-[10px] font-bold dark:fill-emerald-200">{a}</text>
            <text x="162" y={y} textAnchor="middle" className="fill-emerald-700 text-[10px] font-bold dark:fill-emerald-200">{b}</text>
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioDecompositionFlowDiagram() {
  const steps = ["Detritus", "Fragmentation", "Leaching", "Catabolism", "Humification", "Mineralisation"];
  return (
    <DiagramFrame title="decomposition">
      {steps.map((step, index) => {
        const y = 20 + index * 25;
        return (
          <g key={step}>
            <rect x="48" y={y} width="124" height="18" rx="6" className="fill-amber-100 stroke-amber-600 dark:fill-amber-950/60" />
            <text x="110" y={y + 13} textAnchor="middle" className="fill-amber-950 text-[8px] font-bold dark:fill-amber-100">{step}</text>
            {index < steps.length - 1 && <path d={`M110 ${y + 19} V${y + 25}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioTrophicEnergyDiagram() {
  const tiers = [
    ["TC", "10 J", 84, 36, 52],
    ["SC", "100 J", 70, 66, 80],
    ["PC", "1000 J", 56, 96, 108],
    ["PP", "10,000 J", 42, 126, 136],
  ];
  return (
    <DiagramFrame title="10% energy flow">
      <text x="110" y="22" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">1,000,000 J sunlight</text>
      {tiers.map(([label, energy, x, y, width]) => (
        <g key={label}>
          <rect x={x} y={y} width={width} height="22" rx="3" className="fill-lime-100 stroke-lime-600 dark:fill-lime-950/60" />
          <text x="82" y={y + 15} textAnchor="middle" className="fill-lime-950 text-[8px] font-bold dark:fill-lime-100">{label}</text>
          <text x="130" y={y + 15} textAnchor="middle" className="fill-lime-950 text-[8px] font-bold dark:fill-lime-100">{energy}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}

function BioEcologicalPyramidsDiagram() {
  const labels = ["Number", "Biomass", "Energy"];
  return (
    <DiagramFrame title="ecological pyramids">
      {labels.map((label, index) => {
        const x = 24 + index * 62;
        return (
          <g key={label}>
            <path d={`M${x + 30} 44 L${x + 4} 124 H${x + 56} Z`} className="fill-sky-100 stroke-sky-600 dark:fill-sky-950/60" />
            <line x1={x + 11} y1="102" x2={x + 49} y2="102" className="stroke-sky-600" />
            <line x1={x + 18} y1="80" x2={x + 42} y2="80" className="stroke-sky-600" />
            <text x={x + 30} y="145" textAnchor="middle" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">{label}</text>
          </g>
        );
      })}
      <text x="110" y="164" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">energy pyramid is always upright in the source</text>
    </DiagramFrame>
  );
}

function BioSuccessionSequenceDiagram() {
  const steps = ["Pioneer", "Seral stages", "Climax"];
  return (
    <DiagramFrame title="succession">
      {steps.map((step, index) => {
        const x = 32 + index * 62;
        return (
          <g key={step}>
            <circle cx={x} cy="88" r="24" className="fill-violet-100 stroke-violet-600 dark:fill-violet-950/60" />
            <text x={x} y="92" textAnchor="middle" className="fill-violet-950 text-[8px] font-bold dark:fill-violet-100">{step}</text>
            {index < steps.length - 1 && <path d={`M${x + 26} 88 H${x + 38}`} className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" />}
          </g>
        );
      })}
      <text x="110" y="136" textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-stone-400">gradual predictable change in species composition</text>
    </DiagramFrame>
  );
}

function BioSpeciesAreaDiagram() {
  return (
    <DiagramFrame title="species-area">
      <path d="M38 144 V34 M38 144 H182" className="stroke-slate-500 dark:stroke-stone-400" strokeWidth="2" fill="none" />
      <path d="M44 136 C72 96 112 68 176 50" className="stroke-cyan-500" strokeWidth="3" fill="none" />
      <text x="54" y="44" className="fill-slate-700 text-[8px] font-bold dark:fill-stone-200">S = CA^Z</text>
      <text x="126" y="74" className="fill-cyan-700 text-[8px] font-bold dark:fill-cyan-200">rectangular hyperbola</text>
      <text x="30" y="32" className="fill-slate-500 text-[8px] dark:fill-stone-400">S</text>
      <text x="184" y="154" className="fill-slate-500 text-[8px] dark:fill-stone-400">A</text>
    </DiagramFrame>
  );
}

function BioEvilQuartetDiagram() {
  const items = ["Habitat loss", "Over-exploitation", "Alien species", "Co-extinction"];
  return (
    <DiagramFrame title="Evil Quartet">
      {items.map((item, index) => {
        const x = index % 2 === 0 ? 34 : 116;
        const y = index < 2 ? 54 : 104;
        return (
          <g key={item}>
            <rect x={x} y={y} width="70" height="28" rx="6" className="fill-rose-100 stroke-rose-500 dark:fill-rose-950/60" />
            <text x={x + 35} y={y + 17} textAnchor="middle" className="fill-rose-900 text-[7px] font-bold dark:fill-rose-100">{item}</text>
          </g>
        );
      })}
    </DiagramFrame>
  );
}

function BioConservationTypesDiagram() {
  const columns = [["In situ", ["National Parks", "Sanctuaries", "Biosphere reserves"]], ["Ex situ", ["Zoological parks", "Botanical gardens", "Gene banks"]]];
  return (
    <DiagramFrame title="conservation">
      {columns.map(([title, items], index) => {
        const x = index === 0 ? 24 : 116;
        return (
          <g key={title}>
            <rect x={x} y="38" width="80" height="108" rx="8" className="fill-teal-100 stroke-teal-600 dark:fill-teal-950/60" />
            <text x={x + 40} y="58" textAnchor="middle" className="fill-teal-950 text-[9px] font-bold dark:fill-teal-100">{title}</text>
            {items.map((item, itemIndex) => (
              <text key={item} x={x + 40} y={82 + itemIndex * 22} textAnchor="middle" className="fill-teal-900 text-[7px] font-bold dark:fill-teal-100">{item}</text>
            ))}
          </g>
        );
      })}
    </DiagramFrame>
  );
}

export default function MotionDiagram({ type, compact = false }) {
  const renderDiagram = () => {
  if (type === "xt") return <PositionTimeDiagram />;
  if (type === "vt") return <VelocityTimeDiagram />;
  if (type === "at") return <AccelerationTimeDiagram />;
  if (type === "projectile-incline") return <ProjectileInclineDiagram />;
  if (type === "river-shortest-time") return <RiverBase />;
  if (type === "river-shortest-path") return <RiverBase shortestPath />;
  if (type === "pulley-system") return <PulleySystemDiagram />;
  if (type === "atwood-machine") return <AtwoodMachineDiagram />;
  if (type === "wedge-constraint") return <WedgeConstraintDiagram />;
  if (type === "friction-graph") return <FrictionGraphDiagram />;
  if (type === "circular-angular-velocity") return <CircularAngularVelocityDiagram />;
  if (type === "circular-acceleration-components") return <CircularAccelerationDiagram />;
  if (type === "bridge-reactions") return <BridgeReactionsDiagram />;
  if (type === "banked-road") return <BankedRoadDiagram />;
  if (type === "vertical-loop") return <VerticalLoopDiagram />;
  if (type === "conical-pendulum") return <ConicalPendulumDiagram />;
  if (type === "com-two-masses") return <ComTwoMassesDiagram />;
  if (type === "com-plates") return <ComPlatesDiagram />;
  if (type === "com-semicircles") return <ComSemicirclesDiagram />;
  if (type === "com-curved-bodies") return <ComCurvedBodiesDiagram />;
  if (type === "rigid-body-constraint") return <RigidBodyConstraintDiagram />;
  if (type === "rigid-motion-types") return <RigidMotionTypesDiagram />;
  if (type === "moi-spheres-rings") return <MoiSpheresRingsDiagram />;
  if (type === "moi-discs-cylinders") return <MoiDiscsCylindersDiagram />;
  if (type === "moi-rods-plates") return <MoiRodsPlatesDiagram />;
  if (type === "torque-line-action") return <TorqueLineActionDiagram />;
  if (type === "angular-momentum-particle") return <AngularMomentumParticleDiagram />;
  if (type === "combined-rigid-motion") return <CombinedRigidMotionDiagram />;
  if (type === "spring-mass-systems") return <SpringMassSystemsDiagram />;
  if (type === "shm-superposition") return <ShmSuperpositionDiagram />;
  if (type === "progressive-sine-wave") return <ProgressiveSineWaveDiagram />;
  if (type === "standing-wave") return <StandingWaveDiagram />;
  if (type === "string-modes") return <StringModesDiagram />;
  if (type === "heat-engine") return <HeatEngineDiagram />;
  if (type === "carnot-pv") return <CarnotPvDiagram />;
  if (type === "refrigerator") return <RefrigeratorDiagram />;
  if (type === "resistor-combinations") return <ResistorCombinationsDiagram />;
  if (type === "wheatstone-bridge") return <WheatstoneBridgeDiagram />;
  if (type === "cells-grouping") return <CellsGroupingDiagram />;
  if (type === "ammeter-shunt") return <MeterDiagram />;
  if (type === "voltmeter-series") return <MeterDiagram type="voltmeter" />;
  if (type === "potentiometer-base") return <PotentiometerBaseDiagram />;
  if (type === "metre-bridge") return <MetreBridgeDiagram />;
  if (type === "capacitor-types") return <CapacitorTypesDiagram />;
  if (type === "capacitor-redistribution") return <CapacitorRedistributionDiagram />;
  if (type === "capacitor-combinations") return <CapacitorCombinationsDiagram />;
  if (type === "rc-charging") return <RcGraphDiagram />;
  if (type === "rc-discharging") return <RcGraphDiagram discharge />;
  if (type === "dielectric-capacitor") return <DielectricCapacitorDiagram />;
  if (type === "dielectric-force") return <DielectricForceDiagram />;
  if (type === "ac-dc-waveforms") return <AcDcWaveformsDiagram />;
  if (type === "ac-resistor") return <AcCircuitDiagram />;
  if (type === "ac-capacitor") return <AcCircuitDiagram kind="capacitor" />;
  if (type === "ac-capacitive-phase") return <AcCapacitivePhaseDiagram />;
  if (type === "magnetic-moving-charge") return <MagneticMovingChargeDiagram />;
  if (type === "straight-wire-field") return <StraightWireFieldDiagram />;
  if (type === "circular-loop-field") return <CircularLoopFieldDiagram />;
  if (type === "solenoid-axis") return <SolenoidAxisDiagram />;
  if (type === "charge-circular-motion") return <ChargePathDiagram />;
  if (type === "charge-helical-motion") return <ChargePathDiagram helical />;
  if (type === "magnetic-dipole") return <MagneticDipoleDiagram />;
  if (type === "bar-magnet-point") return <BarMagnetPointDiagram />;
  if (type === "emi-flux-loop") return <EmiFluxLoopDiagram />;
  if (type === "rotating-disc") return <RotatingDiscDiagram />;
  if (type === "varying-field-loop") return <VaryingFieldLoopDiagram />;
  if (type === "inductor-symbol") return <InductorSymbolDiagram />;
  if (type === "rl-growth") return <RlGraphDiagram />;
  if (type === "rl-decay") return <RlGraphDiagram decay />;
  if (type === "transformer") return <TransformerDiagram />;
  if (type === "lc-oscillation") return <LcOscillationDiagram />;
  if (type === "plane-mirror") return <PlaneMirrorDiagram />;
  if (type === "spherical-mirror") return <SphericalMirrorDiagram />;
  if (type === "refraction-snell") return <RefractionSnellDiagram />;
  if (type === "apparent-depth") return <ApparentDepthDiagram />;
  if (type === "prism-deviation") return <PrismDeviationDiagram />;
  if (type === "thin-lens") return <ThinLensDiagram />;
  if (type === "simple-microscope") return <SimpleMicroscopeDiagram />;
  if (type === "compound-microscope") return <CompoundMicroscopeDiagram />;
  if (type === "telescope") return <TelescopeDiagram />;
  if (type === "ydse") return <YdseDiagram />;
  if (type === "ydse-oblique") return <YdseDiagram oblique />;
  if (type === "thin-film") return <ThinFilmDiagram />;
  if (type === "single-slit-diffraction") return <SingleSlitDiffractionDiagram />;
  if (type === "gravitation-vector") return <GravitationVectorDiagram />;
  if (type === "grav-ring-disc") return <GravRingDiscDiagram />;
  if (type === "grav-sphere-shell") return <GravSphereShellDiagram />;
  if (type === "satellite-orbit") return <SatelliteOrbitDiagram />;
  if (type === "fluid-elevator") return <FluidElevatorDiagram />;
  if (type === "fluid-accel-rotation") return <FluidAccelRotationDiagram />;
  if (type === "capillary-bubble") return <CapillaryBubbleDiagram />;
  if (type === "organ-pipe-modes") return <OrganPipeModesDiagram />;
  if (type === "em-wave-orientation") return <EmWaveOrientationDiagram />;
  if (type === "communication-horizon") return <CommunicationHorizonDiagram />;
  if (type === "am-fm-signal") return <AmFmSignalDiagram />;
  if (type === "transistor-amplifier") return <TransistorAmplifierDiagram />;
  if (type === "math-point-line-distance") return <MathPointLineDistanceDiagram />;
  if (type === "math-circle-standard") return <MathCircleStandardDiagram />;
  if (type === "math-parabola-standard") return <MathParabolaStandardDiagram />;
  if (type === "math-ellipse-standard") return <MathEllipseStandardDiagram />;
  if (type === "math-hyperbola-standard") return <MathHyperbolaStandardDiagram />;
  if (type === "math-hyperbola-asymptotes") return <MathHyperbolaStandardDiagram asymptotes />;
  if (type === "math-rectangular-hyperbola") return <MathHyperbolaStandardDiagram rectangular />;
  if (type === "math-tangent-normal") return <MathTangentNormalDiagram />;
  if (type === "math-subtangent-subnormal") return <MathSubtangentSubnormalDiagram />;
  if (type === "math-angle-curves") return <MathAngleCurvesDiagram />;
  if (type === "math-argand") return <MathArgandDiagram />;
  if (type === "math-complex-rotation") return <MathArgandDiagram rotation />;
  if (type === "math-vector-angle-area") return <MathVectorDiagram />;
  if (type === "math-vector-volume") return <MathVectorDiagram volume />;
  if (type === "math-point-plane") return <MathPointPlaneDiagram />;
  if (type === "math-skew-lines") return <MathSkewLinesDiagram />;
  if (type === "math-sphere") return <MathSphereDiagram />;
  if (type === "math-triangle-labels") return <MathTriangleLabelsDiagram />;
  if (type === "math-triangle-circles") return <MathTriangleCirclesDiagram />;
  if (type === "math-pedal-triangle") return <MathPedalTriangleDiagram />;
  if (type === "chem-mole-y-map") return <ChemMoleYMapDiagram />;
  if (type === "chem-mole-analysis") return <ChemMoleAnalysisDiagram />;
  if (type === "chem-gas-laws") return <ChemGasLawsDiagram />;
  if (type === "chem-molecular-speeds") return <ChemMolecularSpeedsDiagram />;
  if (type === "chem-galvanic-cell") return <ChemGalvanicCellDiagram />;
  if (type === "chem-concentration-cell") return <ChemConcentrationCellDiagram />;
  if (type === "chem-conductivity-cell") return <ChemConductivityCellDiagram />;
  if (type === "chem-vapour-pressure-ideal") return <ChemVapourPressureIdealDiagram />;
  if (type === "chem-raoult-deviations") return <ChemRaoultDeviationDiagram />;
  if (type === "chem-cubic-cells") return <ChemCubicCellsDiagram />;
  if (type === "chem-rate-curve") return <ChemRateCurveDiagram />;
  if (type === "chem-first-order-plots") return <ChemFirstOrderPlotsDiagram />;
  if (type === "chem-arrhenius-plot") return <ChemArrheniusPlotDiagram />;
  if (type === "chem-diagonal-relationship") return <ChemDiagonalRelationshipDiagram />;
  if (type === "chem-periodic-trends") return <ChemPeriodicTrendsDiagram />;
  if (type === "chem-fajan-polarization") return <ChemFajanPolarizationDiagram />;
  if (type === "chem-overlap-sigma-pi") return <ChemOverlapSigmaPiDiagram />;
  if (type === "chem-vsepr-shapes") return <ChemVseprShapesDiagram />;
  if (type === "chem-mo-energy") return <ChemMoEnergyDiagram />;
  if (type === "chem-dipole-resultant") return <ChemDipoleResultantDiagram />;
  if (type === "chem-coordination-geometries") return <ChemCoordinationGeometriesDiagram />;
  if (type === "chem-cis-trans-square-planar") return <ChemCisTransSquarePlanarDiagram />;
  if (type === "chem-optical-isomers") return <ChemOpticalIsomersDiagram />;
  if (type === "chem-cft-splitting") return <ChemCftSplittingDiagram />;
  if (type === "chem-froth-flotation") return <ChemFrothFlotationDiagram />;
  if (type === "chem-electrolytic-refining") return <ChemElectrolyticRefiningDiagram />;
  if (type === "chem-zone-refining") return <ChemZoneRefiningDiagram />;
  if (type === "chem-pblock-trends") return <ChemPBlockTrendsDiagram />;
  if (type === "chem-silicate-tetrahedra") return <ChemSilicateTetrahedraDiagram />;
  if (type === "chem-xef2-linear") return <ChemXef2LinearDiagram />;
  if (type === "chem-dblock-dd-transition") return <ChemDblockDdTransitionDiagram />;
  if (type === "chem-cation-group-flow") return <ChemCationGroupFlowDiagram />;
  if (type === "chem-organic-inductive") return <ChemOrganicInductiveDiagram />;
  if (type === "chem-organic-resonance") return <ChemOrganicResonanceDiagram />;
  if (type === "chem-organic-hyperconjugation") return <ChemOrganicHyperconjugationDiagram />;
  if (type === "chem-organic-aromaticity") return <ChemOrganicAromaticityDiagram />;
  if (type === "chem-organic-bond-fission") return <ChemOrganicBondFissionDiagram />;
  if (type === "chem-organic-wurtz") return <ChemOrganicWurtzDiagram />;
  if (type === "chem-organic-electrophilic-addition") return <ChemOrganicElectrophilicAdditionDiagram />;
  if (type === "chem-organic-sn2") return <ChemOrganicSn2Diagram />;
  if (type === "chem-organic-alcohol-halide") return <ChemOrganicAlcoholHalideDiagram />;
  if (type === "chem-organic-williamson") return <ChemOrganicWilliamsonDiagram />;
  if (type === "chem-organic-grignard-carbonyl") return <ChemOrganicGrignardCarbonylDiagram />;
  if (type === "chem-organic-reduction-ladder") return <ChemOrganicReductionLadderDiagram />;
  if (type === "chem-organic-oxidation-ladder") return <ChemOrganicOxidationLadderDiagram />;
  if (type === "chem-organic-aldol") return <ChemOrganicAldolDiagram />;
  if (type === "chem-organic-cannizzaro") return <ChemOrganicCannizzaroDiagram />;
  if (type === "chem-organic-haloform") return <ChemOrganicHaloformDiagram />;
  if (type === "chem-organic-carboxy-derivatives") return <ChemOrganicCarboxyDerivativesDiagram />;
  if (type === "chem-organic-eas-benzene") return <ChemOrganicEasBenzeneDiagram />;
  if (type === "chem-organic-sigma-complex") return <ChemOrganicSigmaComplexDiagram />;
  if (type === "chem-organic-eas-positions") return <ChemOrganicEasPositionsDiagram />;
  if (type === "chem-organic-polymer-repeat") return <ChemOrganicPolymerRepeatDiagram />;
  if (type === "bio-taxonomic-hierarchy") return <BioTaxonomicHierarchyDiagram />;
  if (type === "bio-algae-comparison") return <BioAlgaeComparisonDiagram />;
  if (type === "bio-alternation-flow") return <BioAlternationFlowDiagram />;
  if (type === "bio-life-cycle-patterns") return <BioLifeCyclePatternsDiagram />;
  if (type === "bio-vertebrata-flow") return <BioVertebrataFlowDiagram />;
  if (type === "bio-root-systems") return <BioRootSystemsDiagram />;
  if (type === "bio-root-regions") return <BioRootRegionsDiagram />;
  if (type === "bio-leaf-parts") return <BioLeafPartsDiagram />;
  if (type === "bio-venation") return <BioVenationDiagram />;
  if (type === "bio-phyllotaxy") return <BioPhyllotaxyDiagram />;
  if (type === "bio-flower-symmetry") return <BioFlowerSymmetryDiagram />;
  if (type === "bio-ovary-position") return <BioOvaryPositionDiagram />;
  if (type === "bio-aestivation") return <BioAestivationDiagram />;
  if (type === "bio-placentation") return <BioPlacentationDiagram />;
  if (type === "bio-seed-comparison") return <BioSeedComparisonDiagram />;
  if (type === "bio-meristem-positions") return <BioMeristemPositionsDiagram />;
  if (type === "bio-vascular-bundles") return <BioVascularBundlesDiagram />;
  if (type === "bio-dicot-monocot-root") return <BioDicotMonocotRootDiagram />;
  if (type === "bio-dicot-monocot-stem") return <BioDicotMonocotStemDiagram />;
  if (type === "bio-leaf-anatomy") return <BioLeafAnatomyDiagram />;
  if (type === "bio-secondary-growth") return <BioSecondaryGrowthDiagram />;
  if (type === "bio-epithelium-types") return <BioEpitheliumTypesDiagram />;
  if (type === "bio-muscle-types") return <BioMuscleTypesDiagram />;
  if (type === "bio-cockroach-body") return <BioCockroachBodyDiagram />;
  if (type === "bio-prokaryotic-cell") return <BioProkaryoticCellDiagram />;
  if (type === "bio-plasma-membrane") return <BioPlasmaMembraneDiagram />;
  if (type === "bio-mitochondrion") return <BioMitochondrionDiagram />;
  if (type === "bio-chloroplast") return <BioChloroplastDiagram />;
  if (type === "bio-axoneme") return <BioAxonemeDiagram />;
  if (type === "bio-chromosome-types") return <BioChromosomeTypesDiagram />;
  if (type === "bio-cell-cycle") return <BioCellCycleDiagram />;
  if (type === "bio-mitosis-sequence") return <BioMitosisSequenceDiagram />;
  if (type === "bio-prophase-one") return <BioProphaseOneDiagram />;
  if (type === "bio-meiosis-flow") return <BioMeiosisFlowDiagram />;
  if (type === "bio-apoplast-symplast") return <BioApoplastSymplastDiagram />;
  if (type === "bio-transpiration-pull") return <BioTranspirationPullDiagram />;
  if (type === "bio-source-sink-flow") return <BioSourceSinkFlowDiagram />;
  if (type === "bio-nitrogen-cycle") return <BioNitrogenCycleDiagram />;
  if (type === "bio-nodule-formation") return <BioNoduleFormationDiagram />;
  if (type === "bio-light-reaction-flow") return <BioLightReactionFlowDiagram />;
  if (type === "bio-cyclic-noncyclic") return <BioCyclicNoncyclicDiagram />;
  if (type === "bio-calvin-cycle") return <BioCalvinCycleDiagram />;
  if (type === "bio-c4-pathway") return <BioC4PathwayDiagram />;
  if (type === "bio-respiration-overview") return <BioRespirationOverviewDiagram />;
  if (type === "bio-krebs-ets") return <BioKrebsEtsDiagram />;
  if (type === "bio-growth-phases") return <BioGrowthPhasesDiagram />;
  if (type === "bio-growth-curves") return <BioGrowthCurvesDiagram />;
  if (type === "bio-respiratory-pathway") return <BioRespiratoryPathwayDiagram />;
  if (type === "bio-breathing-mechanics") return <BioBreathingMechanicsDiagram />;
  if (type === "bio-alveolus-exchange") return <BioAlveolusExchangeDiagram />;
  if (type === "bio-oxygen-dissociation") return <BioOxygenDissociationDiagram />;
  if (type === "bio-heart-flow") return <BioHeartFlowDiagram />;
  if (type === "bio-cardiac-conduction") return <BioCardiacConductionDiagram />;
  if (type === "bio-double-circulation") return <BioDoubleCirculationDiagram />;
  if (type === "bio-ecg") return <BioEcgDiagram />;
  if (type === "bio-urinary-system") return <BioUrinarySystemDiagram />;
  if (type === "bio-nephron-flow") return <BioNephronFlowDiagram />;
  if (type === "bio-counter-current") return <BioCounterCurrentDiagram />;
  if (type === "bio-sarcomere") return <BioSarcomereDiagram />;
  if (type === "bio-sliding-filament") return <BioSlidingFilamentDiagram />;
  if (type === "bio-neuron-structure") return <BioNeuronStructureDiagram />;
  if (type === "bio-action-potential-flow") return <BioActionPotentialFlowDiagram />;
  if (type === "bio-synapse-flow") return <BioSynapseFlowDiagram />;
  if (type === "bio-brain-classification") return <BioBrainClassificationDiagram />;
  if (type === "bio-reflex-arc") return <BioReflexArcDiagram />;
  if (type === "bio-eye-layout") return <BioEyeLayoutDiagram />;
  if (type === "bio-ear-layout") return <BioEarLayoutDiagram />;
  if (type === "bio-hypothalamus-pituitary") return <BioHypothalamusPituitaryDiagram />;
  if (type === "bio-blood-glucose-regulation") return <BioBloodGlucoseRegulationDiagram />;
  if (type === "bio-hormone-receptor-types") return <BioHormoneReceptorTypesDiagram />;
  if (type === "bio-reproduction-events") return <BioReproductionEventsDiagram />;
  if (type === "bio-fertilisation-types") return <BioFertilisationTypesDiagram />;
  if (type === "bio-anther-microsporangium") return <BioAntherMicrosporangiumDiagram />;
  if (type === "bio-pollen-grain") return <BioPollenGrainDiagram />;
  if (type === "bio-ovule") return <BioOvuleDiagram />;
  if (type === "bio-embryo-sac") return <BioEmbryoSacDiagram />;
  if (type === "bio-double-fertilisation") return <BioDoubleFertilisationDiagram />;
  if (type === "bio-male-reproductive-route") return <BioMaleReproductiveRouteDiagram />;
  if (type === "bio-sperm-structure") return <BioSpermStructureDiagram />;
  if (type === "bio-menstrual-cycle") return <BioMenstrualCycleDiagram />;
  if (type === "bio-fertilisation-implantation") return <BioFertilisationImplantationDiagram />;
  if (type === "bio-contraceptive-methods") return <BioContraceptiveMethodsDiagram />;
  if (type === "bio-art-flow") return <BioArtFlowDiagram />;
  if (type === "bio-monohybrid-cross") return <BioMonohybridCrossDiagram />;
  if (type === "bio-dihybrid-ratio") return <BioDihybridRatioDiagram />;
  if (type === "bio-chromosomal-theory") return <BioChromosomalTheoryDiagram />;
  if (type === "bio-linkage-recombination") return <BioLinkageRecombinationDiagram />;
  if (type === "bio-sex-determination") return <BioSexDeterminationDiagram />;
  if (type === "bio-dna-double-helix") return <BioDnaDoubleHelixDiagram />;
  if (type === "bio-nucleosome-packaging") return <BioNucleosomePackagingDiagram />;
  if (type === "bio-griffith-experiment") return <BioGriffithExperimentDiagram />;
  if (type === "bio-central-dogma") return <BioCentralDogmaDiagram />;
  if (type === "bio-replication-fork") return <BioReplicationForkDiagram />;
  if (type === "bio-transcription-unit") return <BioTranscriptionUnitDiagram />;
  if (type === "bio-translation-flow") return <BioTranslationFlowDiagram />;
  if (type === "bio-lac-operon") return <BioLacOperonDiagram />;
  if (type === "bio-urey-miller") return <BioUreyMillerDiagram />;
  if (type === "bio-homology-analogy") return <BioHomologyAnalogyDiagram />;
  if (type === "bio-natural-selection-flow") return <BioNaturalSelectionFlowDiagram />;
  if (type === "bio-hardy-weinberg") return <BioHardyWeinbergDiagram />;
  if (type === "bio-human-evolution-timeline") return <BioHumanEvolutionTimelineDiagram />;
  if (type === "bio-immune-classification") return <BioImmuneClassificationDiagram />;
  if (type === "bio-antibody-structure") return <BioAntibodyStructureDiagram />;
  if (type === "bio-hiv-sequence") return <BioHivSequenceDiagram />;
  if (type === "bio-cancer-metastasis") return <BioCancerMetastasisDiagram />;
  if (type === "bio-plant-breeding-sequence") return <BioPlantBreedingSequenceDiagram />;
  if (type === "bio-moet-flow") return <BioMoetFlowDiagram />;
  if (type === "bio-sewage-treatment") return <BioSewageTreatmentDiagram />;
  if (type === "bio-biogas-process") return <BioBiogasProcessDiagram />;
  if (type === "bio-biofertiliser-map") return <BioBiofertiliserMapDiagram />;
  if (type === "bio-restriction-cut") return <BioRestrictionCutDiagram />;
  if (type === "bio-pbr322-map") return <BioPbr322MapDiagram />;
  if (type === "bio-rdna-workflow") return <BioRdnaWorkflowDiagram />;
  if (type === "bio-gel-electrophoresis") return <BioGelElectrophoresisDiagram />;
  if (type === "bio-pcr-cycle") return <BioPcrCycleDiagram />;
  if (type === "bio-bioreactor") return <BioBioreactorDiagram />;
  if (type === "bio-bt-toxin") return <BioBtToxinDiagram />;
  if (type === "bio-rnai-sequence") return <BioRnaiSequenceDiagram />;
  if (type === "bio-recombinant-insulin") return <BioRecombinantInsulinDiagram />;
  if (type === "bio-ada-gene-therapy") return <BioAdaGeneTherapyDiagram />;
  if (type === "bio-age-pyramids") return <BioAgePyramidsDiagram />;
  if (type === "bio-population-growth-curves") return <BioPopulationGrowthCurvesDiagram />;
  if (type === "bio-interaction-matrix") return <BioInteractionMatrixDiagram />;
  if (type === "bio-decomposition-flow") return <BioDecompositionFlowDiagram />;
  if (type === "bio-trophic-energy") return <BioTrophicEnergyDiagram />;
  if (type === "bio-ecological-pyramids") return <BioEcologicalPyramidsDiagram />;
  if (type === "bio-succession-sequence") return <BioSuccessionSequenceDiagram />;
  if (type === "bio-species-area") return <BioSpeciesAreaDiagram />;
  if (type === "bio-evil-quartet") return <BioEvilQuartetDiagram />;
  if (type === "bio-conservation-types") return <BioConservationTypesDiagram />;
  return null;
  };

  return (
    <DiagramSizeContext.Provider value={{ compact }}>
      <div className={compact ? "mx-auto w-full max-w-[520px]" : undefined}>
        {renderDiagram()}
      </div>
    </DiagramSizeContext.Provider>
  );
}
