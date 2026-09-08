"use client";

import { useMemo, useState } from "react";

import ZiGraphControls, { computeGraphPoints } from "@/components/zi/visuals/ZiGraphControls";
import ZiQuickQuiz from "@/components/zi/visuals/ZiQuickQuiz";

function VisualShell({ title, children, ariaLabel }) {
  return (
    <section
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-slate-100"
      aria-label={ariaLabel || title}
    >
      <div className="border-b border-slate-200/70 px-3 py-2 text-sm font-black dark:border-white/10">
        {title}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function RevealAllButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 transition-colors hover:border-brand/50 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-white/10 dark:text-slate-300"
    >
      Reveal all
    </button>
  );
}

function VisualInteraction({ interaction }) {
  if (interaction?.type !== "quick_quiz") return null;
  return <ZiQuickQuiz questions={interaction.questions} />;
}

function ComparisonVisual({ visual }) {
  const isRowReveal = visual.interaction?.type === "row_reveal";
  const [revealedRows, setRevealedRows] = useState(() => new Set());
  const rowLabels = visual.columns[0]?.items.map((item) => item.label) || [];

  return (
    <VisualShell title={visual.title} ariaLabel={`Comparison visual: ${visual.title}`}>
      {isRowReveal ? (
        <div className="mb-3 flex justify-end">
          <RevealAllButton onClick={() => setRevealedRows(new Set(rowLabels))} />
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {visual.columns.map((column) => (
          <div key={column.label} className="rounded-xl border border-slate-200 p-2.5 dark:border-white/10">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-brand">
              {column.label}
            </div>
            <dl className="space-y-2">
              {column.items.map((item) => (
                <div key={`${column.label}-${item.label}`}>
                  <dt className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {item.label}
                  </dt>
                  {isRowReveal && !revealedRows.has(item.label) ? (
                    <dd>
                      <button
                        type="button"
                        aria-expanded="false"
                        onClick={() => setRevealedRows((current) => new Set([...current, item.label]))}
                        className="mt-1 min-h-8 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 hover:border-brand/50 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-white/10 dark:text-slate-300"
                      >
                        Reveal
                      </button>
                    </dd>
                  ) : (
                    <dd className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.value}</dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <VisualInteraction interaction={visual.interaction} />
    </VisualShell>
  );
}

function FlowVisual({ visual }) {
  const isStepReveal = visual.interaction?.type === "step_reveal";
  const isNodeInspect = visual.interaction?.type === "node_inspect";
  const [visibleCount, setVisibleCount] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const edgeLabels = new Map(visual.edges.map((edge) => [`${edge.from}->${edge.to}`, edge.label]));
  const visibleNodes = isStepReveal ? visual.nodes.slice(0, visibleCount) : visual.nodes;
  const selectedNode = visual.nodes.find((node) => node.id === selectedNodeId);
  const selectedDetail = selectedNode
    ? visual.interaction?.details?.[selectedNode.id] || selectedNode.detail
    : "";

  return (
    <VisualShell title={visual.title} ariaLabel={`Flow visual: ${visual.title}`}>
      <div className="flex flex-wrap items-center gap-2">
        {visibleNodes.map((node, index) => {
          const next = visibleNodes[index + 1];
          const edgeLabel = next ? edgeLabels.get(`${node.id}->${next.id}`) : null;
          return (
            <div key={node.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isNodeInspect}
                aria-pressed={selectedNodeId === node.id}
                onClick={() => {
                  if (isNodeInspect) setSelectedNodeId(node.id);
                }}
                className="rounded-xl border border-brand/30 bg-brand/5 px-3 py-2 text-xs font-bold disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {node.label}
              </button>
              {next ? (
                <div className="flex items-center gap-1 text-[0.68rem] font-semibold text-slate-400">
                  {edgeLabel ? <span>{edgeLabel}</span> : null}
                  <span aria-hidden="true">-&gt;</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {isStepReveal && visibleCount < visual.nodes.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + 1, visual.nodes.length))}
            className="min-h-8 rounded-lg bg-brand px-3 py-1 text-xs font-bold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Next
          </button>
          <RevealAllButton onClick={() => setVisibleCount(visual.nodes.length)} />
        </div>
      ) : null}
      {selectedNode && selectedDetail ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedNode.label}</div>
          <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">{selectedDetail}</div>
        </div>
      ) : null}
      {visual.edges.length > visual.nodes.length - 1 ? (
        <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
          {visual.edges.map((edge) => (
            <li key={`${edge.from}-${edge.to}-${edge.label || ""}`}>
              {edge.from} -&gt; {edge.to}{edge.label ? ` / ${edge.label}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </VisualShell>
  );
}

function TimelineVisual({ visual }) {
  const isStepReveal = visual.interaction?.type === "step_reveal";
  const [visibleCount, setVisibleCount] = useState(1);
  const visibleEvents = isStepReveal ? visual.events.slice(0, visibleCount) : visual.events;

  return (
    <VisualShell title={visual.title} ariaLabel={`Timeline visual: ${visual.title}`}>
      <ol className="space-y-3">
        {visibleEvents.map((event, index) => (
          <li key={`${event.label}-${index}`} className="grid grid-cols-[1.5rem_1fr] gap-2">
            <span className="mt-1 h-3 w-3 rounded-full border border-brand bg-brand/20" aria-hidden="true" />
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-100">{event.label}</div>
              <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">{event.description}</div>
            </div>
          </li>
        ))}
      </ol>
      {isStepReveal && visibleCount < visual.events.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + 1, visual.events.length))}
            className="min-h-8 rounded-lg bg-brand px-3 py-1 text-xs font-bold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Next
          </button>
          <RevealAllButton onClick={() => setVisibleCount(visual.events.length)} />
        </div>
      ) : null}
    </VisualShell>
  );
}

function ProcessStepsVisual({ visual }) {
  const isStepReveal = visual.interaction?.type === "step_reveal";
  const [visibleCount, setVisibleCount] = useState(1);
  const visibleSteps = isStepReveal ? visual.steps.slice(0, visibleCount) : visual.steps;

  return (
    <VisualShell title={visual.title} ariaLabel={`Process steps visual: ${visual.title}`}>
      <ol className="space-y-2">
        {visibleSteps.map((step) => (
          <li key={`${step.number}-${step.label}`} className="flex gap-2">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand/30 text-xs font-black text-brand">
              {step.number}
            </span>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-100">{step.label}</div>
              <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">{step.detail}</div>
            </div>
          </li>
        ))}
      </ol>
      {isStepReveal && visibleCount < visual.steps.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + 1, visual.steps.length))}
            className="min-h-8 rounded-lg bg-brand px-3 py-1 text-xs font-bold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Next
          </button>
          <RevealAllButton onClick={() => setVisibleCount(visual.steps.length)} />
        </div>
      ) : null}
      <VisualInteraction interaction={visual.interaction} />
    </VisualShell>
  );
}

function ConceptMapVisual({ visual }) {
  const isNodeInspect = visual.interaction?.type === "node_inspect";
  const [selectedKey, setSelectedKey] = useState(null);
  const selectedBranch = visual.branches.find((branch) => branch.label === selectedKey);
  const selectedDetail = selectedKey
    ? visual.interaction?.details?.[selectedKey] || selectedBranch?.detail
    : "";

  return (
    <VisualShell title={visual.title} ariaLabel={`Concept map visual: ${visual.title}`}>
      <button
        type="button"
        disabled={!isNodeInspect}
        aria-pressed={selectedKey === visual.center}
        onClick={() => {
          if (isNodeInspect) setSelectedKey(visual.center);
        }}
        className="mb-3 inline-flex rounded-xl border border-brand/30 bg-brand/5 px-3 py-2 text-sm font-black disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {visual.center}
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        {visual.branches.map((branch) => (
          <div key={branch.label} className="rounded-xl border border-slate-200 p-2.5 dark:border-white/10">
            <button
              type="button"
              disabled={!isNodeInspect}
              aria-pressed={selectedKey === branch.label}
              onClick={() => {
                if (isNodeInspect) setSelectedKey(branch.label);
              }}
              className="mb-1.5 text-left text-xs font-black text-slate-800 disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-slate-100"
            >
              {branch.label}
            </button>
            <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              {branch.children.map((child) => (
                <li key={`${branch.label}-${child}`} className="flex gap-1.5">
                  <span className="text-brand" aria-hidden="true">*</span>
                  <span>{child}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {selectedKey && selectedDetail ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedKey}</div>
          <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">{selectedDetail}</div>
        </div>
      ) : null}
      <VisualInteraction interaction={visual.interaction} />
    </VisualShell>
  );
}

function SimpleGraphVisual({ visual }) {
  const isParameterGraph = visual.interaction?.type === "graph_parameter" && visual.graphKind;
  const initialParamValues = useMemo(() => {
    if (!isParameterGraph) return {};
    return Object.fromEntries(
      visual.interaction.parameters.map((param) => [param.key, param.default])
    );
  }, [isParameterGraph, visual.interaction]);
  const [paramValues, setParamValues] = useState(initialParamValues);
  const graphPoints = isParameterGraph
    ? computeGraphPoints(visual.graphKind, { ...(visual.params || {}), ...paramValues })
    : visual.points;
  const width = 320;
  const height = 190;
  const padding = 28;
  const xs = graphPoints.map((point) => point.x);
  const ys = graphPoints.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const plotted = graphPoints.map((point) => ({
    ...point,
    px: padding + ((point.x - minX) / xRange) * (width - padding * 2),
    py: height - padding - ((point.y - minY) / yRange) * (height - padding * 2),
  }));
  const linePoints = plotted.map((point) => `${point.px},${point.py}`).join(" ");

  return (
    <VisualShell title={visual.title} ariaLabel={`Graph visual: ${visual.title}`}>
      <div className="overflow-x-auto">
        <svg
          className="h-auto w-full min-w-[260px] max-w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${visual.title}, ${visual.xLabel} versus ${visual.yLabel}`}
        >
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" opacity="0.35" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" opacity="0.35" />
          <polyline points={linePoints} fill="none" stroke="rgb(191 128 35)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {plotted.map((point) => (
            <circle key={`${point.x}-${point.y}-${point.label || ""}`} cx={point.px} cy={point.py} r="3.5" fill="rgb(191 128 35)" />
          ))}
          <text x={width / 2} y={height - 5} textAnchor="middle" className="fill-current text-[10px]">
            {visual.xLabel}
          </text>
          <text x="8" y={height / 2} textAnchor="middle" className="fill-current text-[10px]" transform={`rotate(-90 8 ${height / 2})`}>
            {visual.yLabel}
          </text>
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[0.68rem] text-slate-500 dark:text-slate-400">
        <span>{visual.xLabel}: {minX} to {maxX}</span>
        <span>{visual.yLabel}: {minY} to {maxY}</span>
      </div>
      {isParameterGraph ? (
        <ZiGraphControls
          parameters={visual.interaction.parameters}
          values={paramValues}
          onChange={(key, value) => setParamValues((current) => ({ ...current, [key]: value }))}
        />
      ) : null}
    </VisualShell>
  );
}

function LabeledDiagramVisual({ visual }) {
  const isLabelReveal = visual.interaction?.type === "label_reveal";
  const [revealedLabels, setRevealedLabels] = useState(() => new Set());
  const layoutClass = {
    radial: "items-center justify-center",
    layered: "flex-col items-stretch",
    horizontal: "items-center",
    vertical: "flex-col items-stretch",
  }[visual.diagramKind];

  return (
    <VisualShell title={visual.title} ariaLabel={`Labeled diagram: ${visual.title}`}>
      <div className={`flex flex-wrap gap-2 ${layoutClass}`}>
        <div className="rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-center text-sm font-black">
          {visual.centerLabel}
        </div>
        {visual.labels.map((item, index) => {
          const key = `${item.position}-${item.label}`;
          const isRevealed = !isLabelReveal || revealedLabels.has(key);

          return (
            <button
              key={key}
              type="button"
              disabled={!isLabelReveal}
              aria-expanded={isRevealed}
              onClick={() => setRevealedLabels((current) => new Set([...current, key]))}
              className="min-h-9 rounded-xl border border-slate-200 px-3 py-2 text-xs disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-white/10"
            >
              <span className="font-black text-brand">{item.position}</span>
              <span className="mx-1 text-slate-300">/</span>
              <span className="font-semibold">{isRevealed ? item.label : `Label ${index + 1}`}</span>
            </button>
          );
        })}
      </div>
      {isLabelReveal ? (
        <div className="mt-3 flex justify-end">
          <RevealAllButton
            onClick={() => {
              setRevealedLabels(new Set(visual.labels.map((item) => `${item.position}-${item.label}`)));
            }}
          />
        </div>
      ) : null}
      <VisualInteraction interaction={visual.interaction} />
    </VisualShell>
  );
}

function DataTableVisual({ visual }) {
  const isRowReveal = visual.interaction?.type === "row_reveal";
  const [revealedRows, setRevealedRows] = useState(() => new Set());

  return (
    <VisualShell title={visual.title} ariaLabel={`Data table: ${visual.title}`}>
      {isRowReveal ? (
        <div className="mb-3 flex justify-end">
          <RevealAllButton onClick={() => setRevealedRows(new Set(visual.rows.map((_, index) => index)))} />
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              {visual.headers.map((header) => (
                <th key={header} scope="col" className="border-b border-slate-200 px-2 py-2 font-black text-slate-700 dark:border-white/10 dark:text-slate-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="border-b border-slate-100 px-2 py-2 text-slate-500 dark:border-white/5 dark:text-slate-400">
                    {isRowReveal && !revealedRows.has(rowIndex) && cellIndex > 0 ? (
                      <button
                        type="button"
                        aria-expanded="false"
                        onClick={() => setRevealedRows((current) => new Set([...current, rowIndex]))}
                        className="min-h-8 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 hover:border-brand/50 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-white/10 dark:text-slate-300"
                      >
                        Reveal
                      </button>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <VisualInteraction interaction={visual.interaction} />
    </VisualShell>
  );
}

export default function ZiVisual({ visual }) {
  if (!visual?.visualType) return null;

  if (visual.visualType === "comparison") return <ComparisonVisual visual={visual} />;
  if (visual.visualType === "flow") return <FlowVisual visual={visual} />;
  if (visual.visualType === "timeline") return <TimelineVisual visual={visual} />;
  if (visual.visualType === "process_steps") return <ProcessStepsVisual visual={visual} />;
  if (visual.visualType === "concept_map") return <ConceptMapVisual visual={visual} />;
  if (visual.visualType === "simple_graph") return <SimpleGraphVisual visual={visual} />;
  if (visual.visualType === "labeled_diagram") return <LabeledDiagramVisual visual={visual} />;
  if (visual.visualType === "data_table") return <DataTableVisual visual={visual} />;

  return null;
}
