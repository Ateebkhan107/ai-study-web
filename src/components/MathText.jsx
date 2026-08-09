import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function normalizeFlattenedTables(value) {
  let text = String(value ?? "");

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

export default function MathText({ children, className = "" }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          p: ({ children: content }) => <span>{content}</span>,
          table: ({ children: content }) => (
            <div className="my-5 w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm sm:text-base">
                {content}
              </table>
            </div>
          ),
          thead: ({ children: content }) => (
            <thead className="bg-slate-100/90 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              {content}
            </thead>
          ),
          tbody: ({ children: content }) => (
            <tbody className="divide-y divide-slate-200 bg-white/70 dark:divide-slate-700 dark:bg-slate-900/40">
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
        {normalizeFlattenedTables(children)}
      </ReactMarkdown>
    </div>
  );
}
