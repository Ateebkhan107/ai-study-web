import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function normalizeFlattenedTables(value) {
  let text = String(value ?? "");

  // The Wiley source uses U+20D7 COMBINING RIGHT ARROW ABOVE for vectors.
  // Most browser UI fonts render that combining mark as a missing-glyph box
  // (for example `A□`). Convert it to KaTeX vector notation. Existing math
  // spans keep their delimiters; prose receives a small inline-math span.
  text = text
    .split(/(\$[^$]*\$)/g)
    .map((segment) => {
      if (!segment.includes("\u20d7")) return segment;
      if (segment.startsWith("$") && segment.endsWith("$")) {
        return `$${segment.slice(1, -1).replace(/([A-Za-z])\u20d7([₀-₉]*)/g, (_, letter, subscript) => {
          const digits = subscript.replace(/[₀-₉]/g, (digit) => "₀₁₂₃₄₅₆₇₈₉".indexOf(digit));
          return `\\vec{${letter}}${digits ? `_{${digits}}` : ""}`;
        })}$`;
      }
      return segment.replace(/([A-Za-z])\u20d7([₀-₉]*)/g, (_, letter, subscript) => {
        const digits = subscript.replace(/[₀-₉]/g, (digit) => "₀₁₂₃₄₅₆₇₈₉".indexOf(digit));
        return `$\\vec{${letter}}${digits ? `_{${digits}}` : ""}$`;
      });
    })
    .join("");

  // Some imported matching questions contain a valid Markdown table whose
  // line breaks were flattened by PDF extraction, for example:
  // `| List I | List II | |---|---| | (a) ... | (i) ... |`.
  // Restore only these explicit row boundaries; a single pipe may be part of
  // mathematical notation and must remain untouched.
  if (/\|\s*List[\s-]*I\s*\|\s*List[\s-]*II\s*\|/i.test(text)) {
    text = text
      .replace(/\s*\|\s*(List[\s-]*I\s*\|\s*List[\s-]*II\s*\|)/i, "\n\n| $1")
      .replace(/\|\s+\|(?=\s*(?:\:?---|\(?[a-zivx]+\)?\b))/gi, "|\n|");
  }

  return text;
}

function normalizeLegacyScientificNotation(value) {
  const symbols = {
    "π": "\\pi", "μ": "\\mu", "Δ": "\\Delta", "Ω": "\\Omega",
    "α": "\\alpha", "β": "\\beta", "λ": "\\lambda", "ρ": "\\rho",
  };

  return String(value ?? "")
    .split(/(\$[^$]*\$)/g)
    .map((segment) => {
      if (segment.startsWith("$") && segment.endsWith("$")) return segment;
      let text = segment;
      text = text.replace(/\bd([1-6])sp([1-6])\b/gi, (_, first, second) => `$d^{${first}}sp^{${second}}$`);
      text = text.replace(/\b(sp|dsp|d)([1-6])d([1-6])\b/gi, (_, prefix, first, second) => `$${prefix}^{${first}}d^{${second}}$`);
      text = text.replace(/\b(sp|dsp|d)([1-6])\b/gi, (_, prefix, power) => `$${prefix}^{${power}}$`);
      text = text.replace(/\b(XeF|XeO|XeOF|H|O|N|CO|SO|NO|NH|CH|CrO|FADH)\s*([2-9])\b/g, (_, formula, subscript) => `$\\mathrm{${formula}_${subscript}}$`);
      text = text.replace(/10\s*[-−]\s*([1-9]\d*)/g, (_, power) => `$10^{-${power}}$`);
      text = text.replace(/√\s*([A-Za-z0-9]+)/g, (_, radicand) => `$\\sqrt{${radicand}}$`);
      for (const [symbol, latex] of Object.entries(symbols)) text = text.replaceAll(symbol, `$${latex}$`);
      return text;
    })
    .join("");
}

export default function MathText({ children, className = "" }) {
  return (
    <div className={`min-w-0 max-w-full overflow-wrap-anywhere ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          p: ({ children: content }) => <span>{content}</span>,
          table: ({ children: content }) => (
            <div className="my-5 w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-[var(--border)]">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm sm:text-base">
                {content}
              </table>
            </div>
          ),
          thead: ({ children: content }) => (
            <thead className="bg-slate-100/90 text-slate-800 dark:bg-[var(--surface-elevated)] dark:text-slate-100">
              {content}
            </thead>
          ),
          tbody: ({ children: content }) => (
            <tbody className="divide-y divide-slate-200 bg-[var(--card)]/70 dark:divide-slate-700 dark:bg-[var(--surface)]/40">
              {content}
            </tbody>
          ),
          tr: ({ children: content }) => (
            <tr className="divide-x divide-slate-200 dark:divide-slate-700">{content}</tr>
          ),
          th: ({ children: content }) => (
            <th className="px-4 py-3 font-bold align-top">{content}</th>
          ),
          td: ({ children: content }) => (
            <td className="px-4 py-3 align-top leading-relaxed">{content}</td>
          ),
          ul: ({ children: content }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">{content}</ul>
          ),
          ol: ({ children: content }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">{content}</ol>
          ),
        }}
      >
        {normalizeLegacyScientificNotation(normalizeFlattenedTables(children))}
      </ReactMarkdown>
    </div>
  );
}
