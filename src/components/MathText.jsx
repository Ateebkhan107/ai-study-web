import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function MathText({ children, className = "" }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          p: ({ children: content }) => <span>{content}</span>,
        }}
      >
        {String(children ?? "")}
      </ReactMarkdown>
    </div>
  );
}
