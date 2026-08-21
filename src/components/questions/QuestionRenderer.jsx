"use client";

import MathText from "@/components/MathText";

const OPTION_IDS = ["A", "B", "C", "D"];

function asObject(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeBlocks(content) {
  if (!content) return [];
  if (Array.isArray(content)) return content.filter(Boolean);
  if (typeof content === "string") return [{ type: "text", content }];
  return [content];
}

function normalizeQuestionContent(question) {
  const structured = asObject(question?.question_content ?? question?.questionContent);
  if (!structured) return null;

  const blocks = [
    ...normalizeBlocks(structured.content ?? structured.blocks),
    ...(structured.questionText ? [{ type: "text", content: structured.questionText }] : []),
    ...normalizeBlocks(structured.media),
  ].filter(Boolean);

  if (blocks.length === 0 && !Array.isArray(structured.options)) return null;
  return { ...structured, blocks };
}

export function hasNativeQuestionContent(question) {
  return Boolean(normalizeQuestionContent(question));
}

export function getStructuredOptions(question) {
  const structured = normalizeQuestionContent(question);
  if (!structured || !Array.isArray(structured.options)) return [];
  return structured.options;
}

function contentText(block) {
  return block?.content ?? block?.text ?? block?.value ?? "";
}

function QuestionImage({ block }) {
  const url = block?.url ?? block?.src ?? block?.image;
  if (!url) return null;

  return (
    <figure className="my-4 w-full">
      <div className="mx-auto w-fit max-w-full rounded-xl border border-slate-200/70 bg-[var(--card)] p-2 dark:border-[var(--border)]/60 dark:bg-[var(--background)]/40">
        <img
          src={url}
          alt={block.alt || "Question diagram"}
          className="max-h-[55vh] w-auto max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      {block.caption ? (
        <figcaption className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <MathText>{block.caption}</MathText>
        </figcaption>
      ) : null}
    </figure>
  );
}

function QuestionTable({ block }) {
  const headers = Array.isArray(block?.headers) ? block.headers : [];
  const rows = Array.isArray(block?.rows) ? block.rows : [];
  if (headers.length === 0 && rows.length === 0) return null;

  return (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-200/70 dark:border-[var(--border)]/60">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm text-slate-800 dark:text-slate-100">
        {headers.length > 0 ? (
          <thead className="bg-slate-100/90 dark:bg-[var(--surface-elevated)]">
            <tr>
              {headers.map((header, index) => (
                <th key={index} scope="col" className="border-r border-slate-200 px-4 py-3 font-bold last:border-r-0 dark:border-[var(--border)]">
                  <MathText>{header}</MathText>
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody className="divide-y divide-slate-200 bg-[var(--card)]/70 dark:divide-slate-700 dark:bg-[var(--surface)]/40">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="divide-x divide-slate-200 dark:divide-slate-700">
              {(Array.isArray(row) ? row : [row]).map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top leading-relaxed">
                  <MathText>{cell}</MathText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentBlock({ block }) {
  if (!block) return null;
  const type = String(block.type || "text").toLowerCase();

  if (type === "image" || type === "figure" || type === "diagram" || type === "graph") {
    return <QuestionImage block={block} />;
  }

  if (type === "table") {
    return <QuestionTable block={block} />;
  }

  if (type === "latex" || type === "math") {
    const value = contentText(block);
    return (
      <MathText className="my-3 text-slate-900 dark:text-white">
        {block.display === false ? `$${value}$` : `$$\n${value}\n$$`}
      </MathText>
    );
  }

  return (
    <MathText className="my-2 text-slate-900 dark:text-white">
      {contentText(block)}
    </MathText>
  );
}

export function QuestionContentRenderer({
  question,
  legacyText,
  legacyImage,
  legacyImageAlt = "Question visual",
  className = "",
  legacyImageClassName = "max-h-[55vh] w-auto max-w-full rounded-lg border border-slate-200/70 object-contain dark:border-[var(--border)]/60",
  showLegacyImage = true,
}) {
  const structured = normalizeQuestionContent(question);

  if (structured) {
    return (
      <div className={`min-w-0 max-w-full ${className}`}>
        {structured.blocks.map((block, index) => (
          <ContentBlock key={index} block={block} />
        ))}
      </div>
    );
  }

  return (
    <div className={`min-w-0 max-w-full ${className}`}>
      {legacyText ? (
        <MathText className="text-slate-900 dark:text-white">
          {legacyText}
        </MathText>
      ) : null}
      {showLegacyImage && legacyImage ? (
        <img
          src={legacyImage}
          alt={legacyImageAlt}
          className={`${legacyImageClassName} mt-3`}
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
  );
}

export function OptionContentRenderer({
  option,
  fallbackText,
  fallbackImage,
  optionId,
  className = "",
}) {
  const structured = asObject(option);
  const optionImage = structured?.image ?? structured?.url ?? fallbackImage;
  const optionBlocks = normalizeBlocks(structured?.content ?? structured?.blocks);
  const optionText = structured?.text ?? structured?.label ?? fallbackText;
  const resolvedId = optionId || structured?.id || "";

  return (
    <div className={`block min-w-0 ${className}`}>
      {optionBlocks.length > 0 ? (
        optionBlocks.map((block, index) => <ContentBlock key={index} block={block} />)
      ) : optionText ? (
        <MathText className="text-inherit">{optionText}</MathText>
      ) : null}
      {optionImage ? (
        <img
          src={optionImage}
          alt={structured?.alt || `Option ${resolvedId || "visual"}`}
          className="mt-2 max-h-[42vh] w-auto max-w-full rounded-lg border border-slate-200/70 object-contain dark:border-[var(--border)]/60"
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
  );
}

export function normalizeStructuredOptionId(option, index) {
  return String(option?.id || OPTION_IDS[index] || "").toUpperCase();
}
