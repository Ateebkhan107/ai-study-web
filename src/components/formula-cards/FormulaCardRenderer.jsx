import MathText from "@/components/MathText";
import MotionDiagram from "./MotionDiagram";

function FormulaBlock({ formula }) {
  const latex = typeof formula === "string" ? formula : formula?.latex;
  if (!latex) return null;

  return (
    <div className="rounded-lg border border-amber-400/25 bg-amber-500/[0.03] p-3 sm:p-4 text-center dark:border-amber-500/20 dark:bg-amber-400/[0.03]">
      {formula?.label && (
        <div className="mb-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400/90">
          {formula.label}
        </div>
      )}
      <div className="overflow-x-auto py-1 text-center scrollbar-thin">
        <MathText className="inline-block text-base sm:text-lg md:text-xl font-bold text-slate-950 dark:text-stone-100">
          {`$$${latex}$$`}
        </MathText>
      </div>
    </div>
  );
}

function DataTable({ table }) {
  if (!table) return null;

  const sections = table.sections || [table];

  return (
    <div className="space-y-3">
      {sections.map((section, sectionIndex) => (
        <div
          key={`${section.title || "table"}-${sectionIndex}`}
          className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/50 dark:border-stone-800/80 dark:bg-stone-900/20"
        >
          {section.title && (
            <div className="border-b border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:border-stone-800/80 dark:bg-stone-900/60 dark:text-amber-400/90">
              {section.title}
            </div>
          )}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[24rem] border-collapse text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/50 text-slate-700 dark:border-stone-800/80 dark:bg-stone-900/40 dark:text-stone-300">
                <tr>
                  {(section.columns || []).map((column, colIdx) => (
                    <th key={column || colIdx} className="px-3 py-2 font-bold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800/60">
                {(section.rows || []).map((row, rowIndex) => (
                  <tr key={`${section.title || "row"}-${rowIndex}`} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/20">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        className={`px-3 py-2 ${
                          cellIndex === 0
                            ? "font-semibold text-slate-900 dark:text-stone-100"
                            : "text-slate-600 dark:text-stone-300"
                        }`}
                      >
                        <MathText>{String(cell)}</MathText>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Variables({ variables }) {
  if (!Array.isArray(variables) || variables.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-stone-400">
        Variables & Notation
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {variables.map((item, index) => (
          <div
            key={`${item.latex || item.symbol || index}-${item.meaning}`}
            className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 dark:border-stone-800/80 dark:bg-stone-900/30"
          >
            <span className="shrink-0 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              <MathText>{item.latex ? `$${item.latex}$` : item.symbol}</MathText>
            </span>
            <span className="text-xs text-slate-600 dark:text-stone-300 line-clamp-2">
              {item.meaning}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Conditions({ conditions }) {
  if (!Array.isArray(conditions) || conditions.length === 0) return null;

  const validConditions = conditions.filter((condition) => {
    if (typeof condition !== "string") return Boolean(condition);
    const trimmed = condition.trim();
    if (!trimmed) return false;
    if (/^source\s*:/i.test(trimmed)) return false;
    return true;
  });

  if (validConditions.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-stone-800/80 dark:bg-stone-900/40">
      <h3 className="mb-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-stone-400">
        Notes
      </h3>
      <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-stone-200">
        {validConditions.map((condition) => (
          <li key={condition} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/80" />
            <MathText>{condition}</MathText>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecallSection({ card }) {
  const recall = card.recall_data || {};
  const recallQuestion = card.recall_question || recall.recall_question;
  const revealAnswer = card.reveal_answer || recall.reveal_answer;
  const keyPoints = card.key_points || recall.key_points;
  const examples = card.examples || recall.examples;
  const neetTraps = card.neet_traps || recall.neet_traps;

  if (!recallQuestion && !revealAnswer && !Array.isArray(keyPoints) && !Array.isArray(examples) && !Array.isArray(neetTraps)) {
    return null;
  }

  const listGroups = [
    ["Key Points", keyPoints, "bg-slate-500/80"],
    ["Examples", examples, "bg-emerald-500/80"],
    ["NEET Trap", neetTraps, "bg-rose-500/80"],
  ].filter(([, items]) => Array.isArray(items) && items.length > 0);

  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3 dark:border-emerald-400/20 dark:bg-emerald-400/[0.04]">
      {recallQuestion && (
        <div>
          <h3 className="mb-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Recall Question
          </h3>
          <MathText className="text-sm sm:text-base font-bold leading-relaxed text-slate-950 dark:text-stone-100">
            {recallQuestion}
          </MathText>
        </div>
      )}

      {revealAnswer && (
        <div className="rounded-md border border-white/70 bg-white/70 p-2.5 dark:border-stone-800/70 dark:bg-stone-950/30">
          <h3 className="mb-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-stone-400">
            Reveal Answer
          </h3>
          <MathText className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 dark:text-stone-200">
            {revealAnswer}
          </MathText>
        </div>
      )}

      {listGroups.map(([title, items, markerClass]) => (
        <div key={title}>
          <h3 className="mb-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-stone-400">
            {title}
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-stone-200">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${markerClass}`} />
                <MathText>{String(item)}</MathText>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function FormulaCardRenderer({ card }) {
  return (
    <article className="relative min-h-[260px] sm:min-h-[300px] overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/90 bg-[#FFFDF8] dark:border-stone-800/90 dark:bg-[#151515] shadow-sm dark:shadow-none">
      {/* Soft notebook guide lines */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_27px,rgba(30,42,68,0.035)_28px)] dark:bg-[linear-gradient(to_bottom,transparent_27px,rgba(255,255,255,0.02)_28px)] bg-[length:100%_28px]"
        aria-hidden="true"
      />
      {/* Refined notebook left margin line */}
      <div
        className="pointer-events-none absolute bottom-0 top-0 left-5 sm:left-7 w-px bg-red-500/20 dark:bg-red-400/25"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col pl-8 pr-4 py-4 sm:pl-12 sm:pr-6 sm:py-6">
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
            {card.card_type}
          </span>
          {card.source_page && (
            <span className="font-mono text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-stone-500">
              Page {card.source_page}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-stone-100 font-display">
          {card.title}
        </h2>

        {card.body && (
          <MathText className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-stone-300">
            {card.body}
          </MathText>
        )}

        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-150 mt-4 sm:mt-5 space-y-4">
          <RecallSection card={card} />

          {Array.isArray(card.formulas) && card.formulas.length > 0 && (
            <div className="space-y-2.5">
              {card.formulas.map((formula, index) => (
                <FormulaBlock key={`${card.id}-formula-${index}`} formula={formula} />
              ))}
            </div>
          )}

          <DataTable table={card.table_data} />

          {card.diagram_data?.type && <MotionDiagram type={card.diagram_data.type} />}

          <Variables variables={card.variables} />
          <Conditions conditions={card.conditions} />
        </div>
      </div>
    </article>
  );
}
