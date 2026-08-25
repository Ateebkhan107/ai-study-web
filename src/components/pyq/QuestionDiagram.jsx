"use client";

import { getQuestionDiagramKey } from "@/lib/questionDiagrams";

const diagramClassName =
  "mx-auto my-4 block h-auto w-full max-w-[760px] text-slate-950 dark:text-slate-100";

function Wire({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} />;
}

function Dot({ cx, cy }) {
  return <circle cx={cx} cy={cy} r="5" fill="currentColor" />;
}

function Resistor({ x, y, length = 76, orientation = "h" }) {
  const points = [];
  const steps = 8;
  const amp = 8;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const along = t * length;
    const off = i === 0 || i === steps ? 0 : i % 2 ? -amp : amp;
    points.push(orientation === "h" ? `${x + along},${y + off}` : `${x + off},${y + along}`);
  }
  return <polyline points={points.join(" ")} fill="none" />;
}

function Diode({ x, y, direction = "right" }) {
  const flip = direction === "left" ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <polygon points="-18,-18 -18,18 14,0" fill="none" />
      <line x1="14" y1="-20" x2="14" y2="20" />
    </g>
  );
}

function Ground({ x, y }) {
  return (
    <g>
      <Wire x1={x} y1={y - 28} x2={x} y2={y} />
      <line x1={x - 22} y1={y} x2={x + 22} y2={y} />
      <line x1={x - 15} y1={y + 10} x2={x + 15} y2={y + 10} />
      <line x1={x - 8} y1={y + 20} x2={x + 8} y2={y + 20} />
    </g>
  );
}

function Battery({ x, y, orientation = "v" }) {
  if (orientation === "h") {
    return (
      <g>
        <line x1={x - 8} y1={y - 22} x2={x - 8} y2={y + 22} />
        <line x1={x + 8} y1={y - 13} x2={x + 8} y2={y + 13} />
      </g>
    );
  }
  return (
    <g>
      <line x1={x - 22} y1={y - 8} x2={x + 22} y2={y - 8} />
      <line x1={x - 13} y1={y + 8} x2={x + 13} y2={y + 8} />
    </g>
  );
}

function ReverseBiasedCircuits() {
  return (
    <svg className={diagramClassName} viewBox="0 0 760 360" role="img" aria-label="Four diode circuit options">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(30 22)">
          <text x="0" y="4" fill="currentColor" stroke="none" fontSize="22">(1)</text>
          <Dot cx="84" cy="16" />
          <Wire x1="84" y1="16" x2="130" y2="16" />
          <Resistor x="130" y="16" length={82} />
          <Wire x1="212" y1="16" x2="250" y2="16" />
          <Diode x="270" y="16" />
          <Wire x1="284" y1="16" x2="330" y2="16" />
          <Ground x="330" y="80" />
          <text x="48" y="74" fill="currentColor" stroke="none" fontSize="27">+2V</text>
        </g>

        <g transform="translate(450 20)">
          <text x="0" y="4" fill="currentColor" stroke="none" fontSize="22">(2)</text>
          <Dot cx="185" cy="16" />
          <text x="208" y="25" fill="currentColor" stroke="none" fontSize="27">-5V</text>
          <Wire x1="185" y1="16" x2="185" y2="52" />
          <Resistor x="185" y="52" length={78} orientation="v" />
          <Wire x1="185" y1="130" x2="128" y2="130" />
          <Diode x="108" y="130" />
          <Wire x1="90" y1="130" x2="66" y2="130" />
          <Dot cx="66" cy="130" />
          <Ground x="66" y="190" />
        </g>

        <g transform="translate(24 205)">
          <text x="0" y="4" fill="currentColor" stroke="none" fontSize="22">(3)</text>
          <Dot cx="90" cy="110" />
          <text x="48" y="154" fill="currentColor" stroke="none" fontSize="27">+2V</text>
          <Wire x1="90" y1="110" x2="90" y2="20" />
          <Wire x1="90" y1="20" x2="150" y2="20" />
          <Diode x="170" y="20" />
          <Wire x1="184" y1="20" x2="246" y2="20" />
          <Wire x1="246" y1="20" x2="246" y2="64" />
          <Resistor x="246" y="64" length={92} orientation="v" />
          <text x="276" y="92" fill="currentColor" stroke="none" fontSize="26">R</text>
          <Wire x1="246" y1="156" x2="246" y2="188" />
          <Dot cx="246" cy="188" />
          <text x="214" y="236" fill="currentColor" stroke="none" fontSize="27">-10V</text>
        </g>

        <g transform="translate(448 213)">
          <text x="0" y="4" fill="currentColor" stroke="none" fontSize="22">(4)</text>
          <Wire x1="82" y1="28" x2="150" y2="28" />
          <text x="58" y="74" fill="currentColor" stroke="none" fontSize="27">+2V</text>
          <Diode x="170" y="28" />
          <Wire x1="184" y1="28" x2="236" y2="28" />
          <Resistor x="236" y="28" length={82} />
          <Wire x1="318" y1="28" x2="394" y2="28" />
          <text x="356" y="18" fill="currentColor" stroke="none" fontSize="27">+4V</text>
        </g>
      </g>
    </svg>
  );
}

function CapacitorBridge() {
  return (
    <svg className={diagramClassName} viewBox="0 0 720 300" role="img" aria-label="Capacitor bridge circuit">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <text x="35" y="66" fill="currentColor" stroke="none" fontSize="28">+</text>
        <Wire x1="58" y1="32" x2="58" y2="250" />
        <Wire x1="58" y1="250" x2="298" y2="250" />
        <Battery x="58" y="93" />
        <text x="5" y="132" fill="currentColor" stroke="none" fontSize="30">10 V</text>
        <polygon points="376,24 258,136 376,250 494,136" />
        <Wire x1="298" y1="250" x2="376" y2="250" />
        <Wire x1="58" y1="32" x2="376" y2="24" />
        <Wire x1="494" y1="136" x2="646" y2="136" />
        <Wire x1="376" y1="24" x2="258" y2="136" />
        <Wire x1="258" y1="136" x2="376" y2="250" />
        <Wire x1="376" y1="24" x2="494" y2="136" />
        <Wire x1="494" y1="136" x2="376" y2="250" />
        <Resistor x="314" y="86" length={88} orientation="h" />
        <Resistor x="308" y="186" length={88} orientation="h" />
        <Resistor x="425" y="82" length={88} orientation="h" />
        <Resistor x="424" y="185" length={88} orientation="h" />
        <Wire x1="300" y1="136" x2="362" y2="136" />
        <Battery x="386" y="136" orientation="h" />
        <Wire x1="404" y1="136" x2="454" y2="136" />
      </g>
      <g fill="currentColor" fontSize="26">
        <text x="236" y="147">A</text>
        <text x="505" y="147">B</text>
        <text x="380" y="179">C</text>
        <text x="296" y="34">1 Ω</text>
        <text x="476" y="36">6 Ω</text>
        <text x="306" y="278">2 Ω</text>
        <text x="472" y="278">4 Ω</text>
        <text x="244" y="78">R₁</text>
        <text x="246" y="202">R₂</text>
        <text x="528" y="80">R₃</text>
        <text x="528" y="202">R₄</text>
      </g>
    </svg>
  );
}

function ParallelWires() {
  return (
    <svg className="mx-auto my-4 block h-auto w-full max-w-[360px] text-slate-950 dark:text-slate-100" viewBox="0 0 340 270" role="img" aria-label="Two long straight wires with opposite currents and point P midway">
      <defs>
        <marker id="arrow-up-27jan-s1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 10 L 5 0 L 10 10 z" fill="currentColor" />
        </marker>
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="90" y1="30" x2="90" y2="235" markerStart="url(#arrow-up-27jan-s1)" />
        <line x1="250" y1="30" x2="250" y2="235" markerEnd="url(#arrow-up-27jan-s1)" />
      </g>
      <g fill="currentColor">
        <circle cx="170" cy="130" r="7" />
        <text x="26" y="124" fontSize="34">10 A</text>
        <text x="260" y="124" fontSize="34">10 A</text>
        <text x="154" y="184" fontSize="34">P</text>
      </g>
    </svg>
  );
}

function TwoLiquidBeaker() {
  return (
    <svg className="mx-auto my-4 block h-auto w-full max-w-[470px] text-slate-950 dark:text-slate-100" viewBox="0 0 500 330" role="img" aria-label="Two-liquid beaker with coin at bottom">
      <defs>
        <marker id="arrow-dim-27jan-s1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
        <marker id="arrow-coin-27jan-s1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 20 V238 H450 V20" />
        <line x1="92" y1="20" x2="450" y2="20" />
        <line x1="92" y1="128" x2="450" y2="128" />
        <line x1="74" y1="20" x2="74" y2="128" markerStart="url(#arrow-dim-27jan-s1)" markerEnd="url(#arrow-dim-27jan-s1)" />
        <line x1="74" y1="128" x2="74" y2="238" markerStart="url(#arrow-dim-27jan-s1)" markerEnd="url(#arrow-dim-27jan-s1)" />
        <line x1="86" y1="20" x2="96" y2="20" />
        <line x1="86" y1="128" x2="96" y2="128" />
        <line x1="86" y1="238" x2="96" y2="238" />
        <ellipse cx="225" cy="240" rx="32" ry="6" fill="currentColor" />
        <line x1="232" y1="249" x2="250" y2="292" markerEnd="url(#arrow-coin-27jan-s1)" />
      </g>
      <rect x="94" y="22" width="354" height="104" fill="currentColor" opacity="0.14" />
      <g fill="currentColor" fontSize="29">
        <text x="0" y="84">6 cm</text>
        <text x="0" y="194">6 cm</text>
        <text x="178" y="82">μ₂=3/2</text>
        <text x="178" y="185">μ₁=8/5</text>
        <text x="250" y="315">Coin</text>
      </g>
    </svg>
  );
}

const DIAGRAMS = {
  "JEE-MAIN-24-27JAN-S1:49": ReverseBiasedCircuits,
  "JEE-MAIN-24-27JAN-S1:56": CapacitorBridge,
  "JEE-MAIN-24-27JAN-S1:57": ParallelWires,
  "JEE-MAIN-24-27JAN-S1:59": TwoLiquidBeaker,
};

export default function QuestionDiagram({ question }) {
  const key = getQuestionDiagramKey(question);
  const Diagram = key ? DIAGRAMS[key] : null;
  return Diagram ? <Diagram /> : null;
}
