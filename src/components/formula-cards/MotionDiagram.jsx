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
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-stone-700 dark:bg-stone-950/30">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-stone-400">
        {title}
      </div>
      <svg viewBox="0 0 220 190" role="img" aria-label={title} className="h-auto w-full">
        <rect x="1" y="1" width="218" height="188" rx="12" className="fill-transparent stroke-slate-100 dark:stroke-stone-800" />
        {children}
      </svg>
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
      <line x1="32" y1="146" x2="186" y2="70" className="stroke-slate-700 dark:stroke-stone-300" strokeWidth="2.5" />
      <line x1="72" y1="126" x2="182" y2="126" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" />
      <line x1="72" y1="126" x2="46" y2="72" className="stroke-slate-500 dark:stroke-stone-500" strokeWidth="2" />
      <path d="M78 121 C94 90 128 80 164 66" fill="none" className="stroke-amber-500" strokeWidth="3" />
      <Arrow x1="73" y1="125" x2="101" y2="72" label="u" labelX="104" labelY="76" />
      <path d="M83 122 A26 26 0 0 1 101 105" fill="none" className="stroke-slate-500 dark:stroke-stone-400" />
      <text x="93" y="116" className="fill-slate-700 text-[12px] dark:fill-stone-200">alpha</text>
      <path d="M112 126 A42 42 0 0 0 151 88" fill="none" className="stroke-slate-500 dark:stroke-stone-400" />
      <text x="123" y="116" className="fill-slate-700 text-[12px] dark:fill-stone-200">beta</text>
      <Arrow x1="50" y1="138" x2="28" y2="160" label="x" labelX="23" labelY="174" />
      <Arrow x1="54" y1="130" x2="38" y2="82" label="y" labelX="32" labelY="79" />
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

export default function MotionDiagram({ type }) {
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
  return null;
}
