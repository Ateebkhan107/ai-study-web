import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Helper to safely split text into math tokens ($$...$$ and $...$) and non-math text
function splitMathSegments(text) {
  if (!text) return [];
  // Matches display math ($$...$$) or inline math ($...$)
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]*?\$)/g;
  return String(text).split(mathRegex);
}

function isMathSegment(segment) {
  return (
    (segment.startsWith("$$") && segment.endsWith("$$") && segment.length >= 4) ||
    (segment.startsWith("$") && segment.endsWith("$") && segment.length >= 2)
  );
}

function normalizeBlankPlaceholders(value) {
  let text = String(value ?? "");

  // 1. Clean up legacy \text{_____} patterns
  text = text.replace(/\$\\text\{[_–—\.\s]+\}\\text\{([^}]+)\}\$/g, "_____ $\\text{$1}$");
  text = text.replace(/\$\\text\{[_–—\.\s]+\}\$/g, "_____");
  text = text.replace(/\\text\{[_–—\.\s]+\}/g, "_____");

  // 2. Extract multiple underscores (fill-in blanks) trapped inside math mode to prevent KaTeX subscript parse errors
  text = text.replace(/\$\s*_{2,}\s*(\\text\{[^\}]+\}(?:\^\{?[0-9a-zA-Z\-\+]+\}?)?)\s*\$/g, "_____ $$$1$$");
  text = text.replace(/\$([^$]*?)=\s*_{2,}\s*\$/g, "$$$1=$$ _____");
  text = text.replace(/\$\s*_{2,}\s*(\\[a-zA-Z]+[^\$]*)\$/g, "_____ $$$1$$");
  text = text.replace(/\$\s*_{2,}\s*\$/g, "_____");

  text = text.replace(/(\$\$[\s\S]*?\$\$|\$[^\$]*?\$)/g, (match) => {
    if (/_{2,}/.test(match)) {
      const isDisplay = match.startsWith("$$");
      const inner = isDisplay ? match.slice(2, -2) : match.slice(1, -1);
      const cleaned = inner.replace(/\s*_{2,}\s*/g, isDisplay ? "$$\n_____\n$$" : "$ _____ $");
      return (isDisplay ? `$$${cleaned}$$` : `$${cleaned}$`).replace(/\$\s*\$/g, "");
    }
    return match;
  });

  return text;
}

function normalizeQuestionLayout(value) {
  let text = String(value ?? "");

  // If text contains a markdown table, split out the table blocks first so they are untouched
  const tableRegex = /(\n?\s*\|[^\n]+\|\s*\n\s*\|[\s:\-\|]+\|\s*\n(?:[^\n]*\|[^\n]*\|\s*\n*)+)/g;
  const segments = text.split(tableRegex);

  return segments
    .map((segment) => {
      // If segment is a markdown table, return it as-is with clean bounding newlines
      if (segment.trim().startsWith("|") && segment.includes("---")) {
        return "\n\n" + segment.trim() + "\n\n";
      }

      // Preserve display math ($$...$$)
      const parts = segment.split(/(\$\$[\s\S]*?\$\$)/g);
      return parts
        .map((part) => {
          if (part.startsWith("$$") && part.endsWith("$$")) return part;

          let s = part;

          // Convert preamble colon to period so "Reason R:" in preamble is not mistaken for the statement
          s = s.replace(/(\band the other (?:is )?labelled as \*{0,2}Reason\s*(?:\(?[Rr]\)?)\*{0,2})\s*:/gi, "$1.");

          // Format actual statement declarations (which have a colon) onto distinct paragraphs
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\bStatement\s*(?:\(?([I|V|X]+|[0-9]+|[A-E])\)?)\*{0,2}\s*:\s*/gi, "$1\n\n**Statement $2:** ");
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\bAssertion\s*(?:\(?([Aa])\)?)\*{0,2}\s*:\s*/gi, "$1\n\n**Assertion ($2):** ");
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\bReason\s*(?:\(?([Rr])\)?)\*{0,2}\s*:\s*/gi, "$1\n\n**Reason ($2):** ");
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\((?:S1|s1)\)\s*:\s*/g, "$1\n\n**(S1):** ");
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\((?:S2|s2)\)\s*:\s*/g, "$1\n\n**(S2):** ");

          // Roman numerals only when at start of line or preceded by period: "I. ", "II. "
          s = s.replace(/(?:^|[\.\n])\s*\b((?:I|II|III|IV|V)\.\s+)/g, "\n\n$1");

          // Lettered statements A., B., C., D., E. or (A), (B), (C), (D), (E) in multiple-statement questions
          s = s.replace(/([^\n])\s*\n*\s*\b([A-E])\.\s+/g, "$1\n\n**$2.** ");
          s = s.replace(/([^\n])\s*\n*\s*\(([A-E])\)\s+/g, "$1\n\n**($2)** ");

          // Format instructions on distinct lines
          s = s.replace(/([^\n])\s*\n*\s*(In (?:the )?light of the above statements[^\n:]*:?)/gi, "$1\n\n$2");
          s = s.replace(/([^\n])\s*\n*\s*(?<!In (?:the )?light of the above statements,\s*)(Choose the (?:correct|most appropriate) answer[^\n:]*:?)/gi, (m, p1, p2) => {
            if (/In (?:the )?light of the above statements,\s*$/i.test(p1)) return p1 + " " + p2;
            return p1 + "\n\n" + p2;
          });
          s = s.replace(/([^\n])\s*\n*\s*(From the statements given below\s*:?)/gi, "$1\n\n$2");
          s = s.replace(/([^\n])\s*\n*\s*(Given below are two statements\s*:?)/gi, "$1\n\n$2");

          return s;
        })
        .join("");
    })
    .join("");
}

function normalizeFlattenedTables(value) {
  let text = String(value ?? "");

  // Convert U+20D7 COMBINING RIGHT ARROW ABOVE for vectors outside math
  text = splitMathSegments(text)
    .map((segment) => {
      if (!segment.includes("\u20d7")) return segment;
      if (isMathSegment(segment)) {
        const isDisplay = segment.startsWith("$$");
        const inner = isDisplay ? segment.slice(2, -2) : segment.slice(1, -1);
        const replaced = inner.replace(/([A-Za-z])\u20d7([₀-₉]*)/g, (_, letter, subscript) => {
          const digits = subscript.replace(/[₀-₉]/g, (digit) => "₀₁₂₃₄₅₆₇₈₉".indexOf(digit));
          return `\\vec{${letter}}${digits ? `_{${digits}}` : ""}`;
        });
        return isDisplay ? `$$${replaced}$$` : `$${replaced}$`;
      }
      return segment.replace(/([A-Za-z])\u20d7([₀-₉]*)/g, (_, letter, subscript) => {
        const digits = subscript.replace(/[₀-₉]/g, (digit) => "₀₁₂₃₄₅₆₇₈₉".indexOf(digit));
        return `$\\vec{${letter}}${digits ? `_{${digits}}` : ""}$`;
      });
    })
    .join("");

  // Restore markdown table boundaries if flattened by PDF extraction
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

  return splitMathSegments(value)
    .map((segment) => {
      // PRESERVE ALL MATH SEGMENTS EXACTLY AS THEY ARE
      if (isMathSegment(segment)) return segment;

      let text = segment;
      // Only apply substitutions to genuine non-math prose
      text = text.replace(/\b([a-z])\s*([2-9]|\d{2,3})\b/g, (_, variable, power) => `$${variable}^{${power}}$`);
      text = text.replace(/\b([a-z])_([0-9]+)\b/g, (_, variable, subscript) => `$${variable}_{${subscript}}$`);
      text = text.replace(/\bd([1-6])sp([1-6])\b/gi, (_, first, second) => `$d^{${first}}sp^{${second}}$`);
      text = text.replace(/\b(sp|dsp|d)([1-6])d([1-6])\b/gi, (_, prefix, first, second) => `$${prefix}^{${first}}d^{${second}}$`);
      text = text.replace(/\b(sp|dsp|d)([1-6])\b/gi, (_, prefix, power) => `$${prefix}^{${power}}$`);
      text = text.replace(/\b(XeF|XeO|XeOF|H|O|N|CO|SO|NO|NH|CH|CrO|FADH)\s*([2-9])\b/g, (_, formula, subscript) => `$\\mathrm{${formula}_${subscript}}$`);
      // Only match 10^-N when explicitly formatted as exponent (e.g. 10^-3 or 10⁻³), never ranges like "10 - 15"
      text = text.replace(/\b10\s*\^\s*[-−]?\s*([1-9]\d*)\b/g, (_, power) => `$10^{-${power}}$`);
      text = text.replace(/\b10[⁻]([¹²³⁴⁵⁶⁷⁸⁹0-9]+)\b/g, (_, p) => {
        const digits = p.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(d));
        return `$10^{-${digits}}$`;
      });
      text = text.replace(/√\s*([A-Za-z0-9]+)/g, (_, radicand) => `$\\sqrt{${radicand}}$`);
      for (const [symbol, latex] of Object.entries(symbols)) text = text.replaceAll(symbol, `$${latex}$`);
      return text;
    })
    .join("");
}

function normalizeDisplayMathDelimiters(value) {
  let text = String(value ?? "");
  // In JS string replacement, '$$$$' inserts '$$'
  text = text.replace(/([^\n])\s*\$\$/g, "$1\n\n$$$$");
  text = text.replace(/\$\$\s*([^\n\s$])/g, "$$$$\n$1");
  text = text.replace(/([^\n\s$])\s*\$\$/g, "$1\n$$$$");
  text = text.replace(/\$\$\s*([^\n])/g, "$$$$\n\n$1");
  return text;
}

export default function MathText({ children, className = "" }) {
  const preparedText = normalizeDisplayMathDelimiters(
    normalizeQuestionLayout(
      normalizeLegacyScientificNotation(
        normalizeFlattenedTables(normalizeBlankPlaceholders(children))
      )
    )
  );

  return (
    <div className={`min-w-0 max-w-full overflow-wrap-anywhere ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          p: ({ children: content }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed block text-inherit">{content}</p>
          ),
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
            <ul className="my-3 list-disc space-y-1.5 pl-6">{content}</ul>
          ),
          ol: ({ children: content }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-6">{content}</ol>
          ),
        }}
      >
        {preparedText}
      </ReactMarkdown>
    </div>
  );
}
