import { useId, useMemo } from "react";
import ZiGraphControls from "@/components/zi/visuals/ZiGraphControls";
import { angleSchema } from "@/lib/zi/classroom/lessonSchema";
import { calculateProjectile, GRAVITY } from "@/lib/zi/classroom/projectile";

const angleControl = [{ key: "angleDegrees", label: "Launch angle", min: 15, max: 75, step: 1 }];
const cellColors = { membrane: "#34d399", cytoplasm: "#38bdf8", nucleus: "#c4b5fd", mitochondria: "#fb923c", ribosomes: "#f9a8d4" };
const cellNames = { membrane: "Cell membrane", cytoplasm: "Cytoplasm", nucleus: "Nucleus", mitochondria: "Mitochondria", ribosomes: "Ribosomes" };

function Scene({ title, description, children, arrowId }) {
  const id = useId();
  return (
    <svg viewBox="0 0 480 250" className="max-h-full w-full" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-desc`}>{description}</desc>
      {arrowId ? (
        <defs>
          <marker id={arrowId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 8 4 0 8Z" fill="context-stroke" />
          </marker>
        </defs>
      ) : null}
      {children}
    </svg>
  );
}

function Arrow({ x, y, endX, endY, color, marker, dashed = false }) {
  return <line x1={x} y1={y} x2={endX} y2={endY} stroke={color} strokeWidth="2.6"
    strokeDasharray={dashed ? "4 5" : undefined} markerEnd={`url(#${marker})`} />;
}

function Label({ x, y, children, color = "#dbeafe", anchor = "start", size = 15 }) {
  return <text x={x} y={y} fill={color} fontSize={size} fontWeight="600" textAnchor={anchor}>{children}</text>;
}

function Projectile({ lesson, scene, parameters, onAngle, progress }) {
  const marker = useId();
  const angle = parameters.angleDegrees;
  const speed = lesson.parameters.initialSpeedMps;
  const motion = useMemo(() => {
    const values = calculateProjectile(angle, speed);
    const scale = Math.min(395 / (speed ** 2 / GRAVITY), 152 / (speed ** 2 / (2 * GRAVITY)));
    const screen = ({ x, y }) => [Number((50 + x * scale).toFixed(2)), Number((205 - y * scale).toFixed(2))];
    const points = Array.from({ length: 61 }, (_, index) => screen(values.atTime(values.flightTime * index / 60)).join(","));
    return { ...values, screen, points, path: points.join(" ") };
  }, [angle, speed]);

  const showPath = ["trajectory", "apex", "time", "range"].includes(scene);
  const showGravity = scene === "gravity" || scene === "apex";
  const [apexX, apexY] = motion.screen(motion.atTime(motion.apexTime));
  const [endX] = motion.screen(motion.atTime(motion.flightTime));
  const [ballX, ballY] = motion.screen(motion.atTime(motion.flightTime * progress));
  const tracedPath = scene === "trajectory"
    ? [...motion.points.slice(0, Math.floor(progress * 60) + 1), `${ballX},${ballY}`].join(" ")
    : motion.path;
  const velocityX = 50 + 91 * motion.vx / speed;
  const velocityY = 205 - 91 * motion.vy / speed;
  const currentMeasure = {
    launch: ["Launch speed", `${speed} m/s`],
    components: ["Initial velocity components", `${motion.vx.toFixed(2)} right · ${motion.vy.toFixed(2)} up (m/s)`],
    gravity: ["Vertical acceleration", "−9.81 m/s²"],
    trajectory: ["Launch speed", `${speed} m/s`],
    apex: ["Maximum height", `${motion.height.toFixed(2)} m`],
    time: ["Time of flight", `${motion.flightTime.toFixed(2)} s`],
    range: ["Horizontal range", `${motion.range.toFixed(2)} m`],
  }[scene];

  return (
    <>
      <div className="zi-board-canvas">
        <Scene title="Projectile motion" description={`Launch at ${angle} degrees. ${currentMeasure.join(": ")}. Launch and landing heights are equal.`} arrowId={marker}>
          <path d="M50 30V205H456" fill="none" stroke="#64748b" strokeWidth="1.4" />
          <Label x={50} y={23} color="#94a3b8" size={12}>Height (m)</Label>
          <Label x={456} y={227} color="#94a3b8" size={12} anchor="end">Horizontal distance (m)</Label>
          {showPath ? (
            <>
              <polyline points={motion.path} fill="none" stroke="#334155" strokeWidth="3" />
              <polyline points={tracedPath} fill="none" stroke="#facc15" strokeWidth="3" />
              {scene === "trajectory" ? <circle cx={ballX} cy={ballY} r="6" fill="#fef08a" /> : null}
              {scene === "apex" ? (
                <g opacity={0.5 + 0.5 * progress}>
                  <circle cx={apexX} cy={apexY} r="6" fill="#facc15" />
                  <Label x={apexX} y={apexY - 16} anchor="middle">Apex · vᵧ = 0</Label>
                  <Arrow x={apexX + 9} y={apexY} endX={apexX + 65} endY={apexY} color="#7dd3fc" marker={marker} />
                </g>
              ) : null}
              {scene === "time" || scene === "range" ? (
                <g opacity={0.5 + 0.5 * progress}>
                  <circle cx={endX} cy="205" r="5" fill="#facc15" />
                  <Label x={endX} y={188} anchor={endX > 370 ? "end" : "middle"} color="#fde68a">
                    {scene === "time" ? `T = ${motion.flightTime.toFixed(2)} s` : `R = ${motion.range.toFixed(2)} m`}
                  </Label>
                </g>
              ) : null}
            </>
          ) : (
            <g opacity={0.55 + 0.45 * progress}>
              <Arrow x={50} y={205} endX={velocityX} endY={velocityY} color="#facc15" marker={marker} />
              <Label x={velocityX + 7} y={velocityY - 5} color="#fde68a">v₀</Label>
              <Label x={62} y={225} color="#fde68a">{angle}°</Label>
              {scene !== "launch" ? (
                <>
                  <Arrow x={50} y={201} endX={velocityX} endY={201} color="#7dd3fc" marker={marker} dashed />
                  <Arrow x={50} y={205} endX={50} endY={velocityY} color="#86efac" marker={marker} dashed />
                  <Label x={velocityX + 8} y={199} color="#7dd3fc">vₓ</Label>
                  <Label x={38} y={velocityY + 8} color="#86efac" anchor="end">v₀ᵧ</Label>
                </>
              ) : null}
            </g>
          )}
          {showGravity ? (
            <g opacity={0.55 + 0.45 * progress}>
              <Arrow x={408} y={79} endX={408} endY={141} color="#fda4af" marker={marker} />
              <Label x={420} y={112} color="#fda4af">g</Label>
            </g>
          ) : null}
        </Scene>
      </div>
      <div className="zi-board-metric">
        <span>{currentMeasure[0]}</span><strong>{currentMeasure[1]}</strong>
      </div>
      <ZiGraphControls parameters={angleControl} values={parameters} onChange={(_, value) => {
        if (angleSchema.safeParse(value).success) onAngle(value);
      }} />
      <p className="mt-2 text-xs text-[var(--text-muted)]">Equal launch and landing heights · constant gravity · negligible air resistance</p>
    </>
  );
}

const electronPositions = [[-6, -37], [6, -37], [37, -6], [37, 6], [-6, 37], [6, 37], [-37, -6], [-37, 6]];

function Atom({ x, y, symbol, count, charge, donated = false, singleRight = false }) {
  const positions = singleRight ? [[37, 0]] : electronPositions.slice(0, count);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="29" fill="#172554" stroke={charge === "−" ? "#86efac" : "#93c5fd"} strokeWidth="2" />
      <Label x={0} y={7} anchor="middle" size={22}>{symbol}{charge}</Label>
      {positions.map(([dx, dy], index) => (
        <circle key={index} cx={dx} cy={dy} r="3.5" fill={donated && index === 7 ? "#facc15" : "#e0f2fe"} />
      ))}
    </g>
  );
}

function Bonding({ scene, progress }) {
  const marker = useId();
  const transferred = scene === "transfer";
  const lattice = scene === "lattice";
  const sharing = scene === "sharing";
  const descriptions = {
    valence: "Neutral sodium has one outer electron. Neutral chlorine has seven.",
    transfer: "Sodium ion has a plus one charge. Chloride has a minus one charge and eight outer electrons. The transferred electron is yellow.",
    lattice: "A small two-dimensional slice of the sodium chloride lattice shows alternating sodium and chloride ions.",
    sharing: "Two hydrogen nuclei flank a shared pair of electrons.",
  };
  return (
    <div className="zi-board-canvas">
      <Scene title="Chemical bonding" description={descriptions[scene]} arrowId={marker}>
        {lattice ? (
          <g opacity={0.45 + 0.55 * progress}>
            {Array.from({ length: 12 }, (_, index) => {
              const row = Math.floor(index / 4);
              const column = index % 4;
              const sodium = (row + column) % 2 === 0;
              const x = 124 + column * 77;
              const y = 50 + row * 68;
              return <g key={index}>
                <circle cx={x} cy={y} r="23" fill={sodium ? "#172554" : "#134e4a"} stroke={sodium ? "#93c5fd" : "#86efac"} />
                <Label x={x} y={y + 5} anchor="middle">{sodium ? "Na⁺" : "Cl⁻"}</Label>
              </g>;
            })}
            <Label x={240} y={222} anchor="middle" size={13} color="#94a3b8">2D slice of an extended ionic lattice</Label>
          </g>
        ) : sharing ? (
          <>
            <ellipse cx="240" cy="105" rx="104" ry="42" fill="#172554" stroke="#93c5fd" strokeWidth="2" />
            <Label x={176} y={112} anchor="middle" size={23}>H</Label>
            <Label x={304} y={112} anchor="middle" size={23}>H</Label>
            <g opacity={0.45 + 0.55 * progress}>
              <circle cx="233" cy="105" r="5" fill="#facc15" />
              <circle cx="247" cy="105" r="5" fill="#7dd3fc" />
              <Label x={240} y={177} anchor="middle">Shared electron pair · H₂</Label>
            </g>
          </>
        ) : (
          <>
            <Atom x={124} y={105} symbol="Na" count={transferred ? 0 : 1} charge={transferred ? "+" : undefined} singleRight={!transferred} />
            <Atom x={356} y={105} symbol="Cl" count={transferred ? 8 : 7} charge={transferred ? "−" : undefined} donated={transferred} />
            {transferred ? <g opacity={0.45 + 0.55 * progress}>
              <Arrow x={172} y={105} endX={300} endY={105} color="#facc15" marker={marker} dashed />
              <Label x={236} y={83} color="#fde68a" anchor="middle">1 electron transferred</Label>
            </g> : null}
            <Label x={124} y={172} anchor="middle" size={13}>{transferred ? "Na⁺ · outer shell omitted" : "Sodium · 1 outer electron"}</Label>
            <Label x={356} y={172} anchor="middle" size={13}>{transferred ? "Cl⁻ · 8 outer electrons" : "Chlorine · 7 outer electrons"}</Label>
            <Label x={240} y={219} anchor="middle" size={12} color="#94a3b8">Lewis-style electron bookkeeping</Label>
          </>
        )}
      </Scene>
    </div>
  );
}

function Cell({ scene, progress, steps, onStep }) {
  const opacity = (part) => part === scene ? 0.55 + 0.45 * progress : 0.42;
  const color = cellColors[scene];
  return (
    <>
      <div className="zi-board-canvas">
        <Scene title="Animal cell schematic" description={`${cellNames[scene]} highlighted. The organelle shapes and sizes are schematic.`}>
          <path d="M90 100C98 48 177 25 238 30C301 17 360 59 369 113C387 170 319 202 254 199C194 221 113 186 95 151C85 132 82 119 90 100Z"
            fill={scene === "cytoplasm" ? "#164e63" : "#172554"} stroke={cellColors.membrane}
            strokeOpacity={opacity("membrane")} strokeWidth={scene === "membrane" ? 5 : 2} />
          <g opacity={opacity("nucleus")}>
            <ellipse cx="223" cy="114" rx="49" ry="42" fill="#4c1d95" stroke={cellColors.nucleus} strokeWidth="3" />
            <ellipse cx="223" cy="114" rx="43" ry="36" fill="none" stroke={cellColors.nucleus} />
          </g>
          <g opacity={opacity("mitochondria")} stroke={cellColors.mitochondria} strokeWidth="2.4">
            <path d="M280 152C285 130 330 127 339 147C348 172 295 182 284 171Q278 165 280 152Z" fill="#431407" />
            <path d="M288 156q9-17 15-1t14-3t14-3" fill="none" />
            <path d="M121 89C129 70 170 64 174 84C178 103 145 115 128 104Q119 99 121 89Z" fill="#431407" />
            <path d="M128 93q9-18 14-3t12-3t13-4" fill="none" />
          </g>
          <g opacity={opacity("ribosomes")} fill={cellColors.ribosomes}>
            {[[145, 139], [155, 152], [165, 136], [172, 155], [293, 77], [308, 85], [320, 71]].map(([x, y]) =>
              <circle key={x} cx={x} cy={y} r="3.8" />)}
          </g>
          <Label x={240} y={232} color={color} anchor="middle">{cellNames[scene]} · schematic, not to scale</Label>
        </Scene>
      </div>
      <div className="zi-board-labels" aria-label="Explore cell labels" role="group">
        {steps.map((step, index) => (
          <button key={step.id} type="button" aria-pressed={step.sceneKey === scene}
            onClick={() => onStep(index)}>{cellNames[step.sceneKey]}</button>
        ))}
      </div>
    </>
  );
}

export default function ZiBoard({ lesson, scene, parameters, onAngle, onStep, progress }) {
  switch (lesson.templateKey) {
    case "projectile_motion":
      return <Projectile lesson={lesson} scene={scene} parameters={parameters} onAngle={onAngle} progress={progress} />;
    case "chemical_bonding":
      return <Bonding scene={scene} progress={progress} />;
    case "cell_structure":
      return <Cell scene={scene} steps={lesson.steps} onStep={onStep} progress={progress} />;
    default:
      return <p>Whiteboard scene unavailable.</p>;
  }
}
