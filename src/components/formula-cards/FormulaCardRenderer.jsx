import MathText from "@/components/MathText";
import MotionDiagram from "./MotionDiagram";

function FormulaBlock({ formula }) {
  const latex = typeof formula === "string" ? formula : formula?.latex;
  if (!latex) return null;

  return (
    <div className="rounded-xl border border-amber-300/40 bg-amber-50/70 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
      {formula?.label && (
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
          {formula.label}
        </div>
      )}
      <MathText className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
        {`$$${latex}$$`}
      </MathText>
    </div>
  );
}

function DataTable({ table }) {
  if (!table) return null;

  const sections = table.sections || [table];

  return (
    <div className="space-y-3">
      {sections.map((section, sectionIndex) => (
        <div key={`${section.title || "table"}-${sectionIndex}`} className="overflow-hidden rounded-xl border border-slate-200 dark:border-stone-700">
          {section.title && (
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
              {section.title}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead className="bg-white text-slate-700 dark:bg-stone-950 dark:text-stone-200">
                <tr>
                  {(section.columns || []).map((column) => (
                    <th key={column} className="border-b border-slate-200 px-3 py-2 font-black dark:border-stone-700">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70 dark:divide-stone-800 dark:bg-stone-950/30">
                {(section.rows || []).map((row, rowIndex) => (
                  <tr key={`${section.title || "row"}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 text-slate-700 dark:text-stone-200">
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
      <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-stone-400">
        Variables
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {variables.map((item) => (
          <div key={`${item.latex || item.symbol}-${item.meaning}`} className="flex gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 dark:border-stone-700 dark:bg-stone-950/30">
            <MathText className="shrink-0 font-black text-slate-950 dark:text-white">
              {item.latex ? `$${item.latex}$` : item.symbol}
            </MathText>
            <span className="text-sm text-slate-600 dark:text-stone-300">{item.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Conditions({ conditions }) {
  if (!Array.isArray(conditions) || conditions.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-stone-700 dark:bg-stone-900/60">
      <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-stone-400">
        Notes
      </h3>
      <ul className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-stone-200">
        {conditions.map((condition) => (
          <li key={condition} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <MathText>{condition}</MathText>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FormulaCardRenderer({ card }) {
  return (
    <article className="relative min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,253,242,0.98))] shadow-[0_18px_50px_rgba(15,23,42,0.10)] dark:border-stone-700 dark:bg-[linear-gradient(180deg,rgba(24,24,24,0.98),rgba(11,11,11,0.98))] dark:shadow-none">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_31px,var(--prepzii-paper-line)_32px)] bg-[length:100%_32px]" aria-hidden="true" />
      <div className="absolute bottom-0 left-7 top-0 w-px bg-red-500/15 dark:bg-red-400/20" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[520px] flex-col p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-100/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">
            {card.card_type}
          </div>
          <div className="text-[11px] font-bold text-slate-400 dark:text-stone-500">
            Source page {card.source_page}
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          {card.title}
        </h2>

        {card.body && (
          <MathText className="mt-3 text-[15px] font-medium leading-7 text-slate-700 dark:text-stone-300 sm:text-base">
            {card.body}
          </MathText>
        )}

        <div className="mt-6 flex flex-1 flex-col gap-5">
          {Array.isArray(card.formulas) && card.formulas.length > 0 && (
            <div className="grid gap-3">
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
