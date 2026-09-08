"use client";

export function computeGraphPoints(graphKind, params, sampleCount = 41) {
  const safeParams = params || {};
  const points = [];
  const minX = -5;
  const maxX = 5;
  const step = (maxX - minX) / (sampleCount - 1);

  for (let index = 0; index < sampleCount; index += 1) {
    const x = minX + step * index;
    let y = 0;

    if (graphKind === "quadratic") {
      y = (safeParams.a ?? 1) * x * x + (safeParams.b ?? 0) * x + (safeParams.c ?? 0);
    } else if (graphKind === "linear") {
      y = (safeParams.m ?? 1) * x + (safeParams.b ?? 0);
    } else if (graphKind === "exponential") {
      y = (safeParams.a ?? 1) * Math.exp((safeParams.b ?? 1) * x) + (safeParams.c ?? 0);
    } else if (graphKind === "sine") {
      y = (safeParams.a ?? 1) * Math.sin((safeParams.b ?? 1) * x) + (safeParams.c ?? 0);
    }

    if (Number.isFinite(y)) points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }

  return points;
}

export default function ZiGraphControls({ parameters, values, onChange }) {
  if (!parameters?.length) return null;

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      {parameters.map((param) => (
        <label key={param.key} className="block">
          <span className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>{param.label}</span>
            <span className="text-brand">{values[param.key]}</span>
          </span>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={values[param.key]}
            onChange={(event) => {
              onChange(param.key, Number(event.target.value));
            }}
            className="w-full accent-brand"
            aria-label={`Adjust ${param.label}`}
          />
        </label>
      ))}
    </div>
  );
}
