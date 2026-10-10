import fs from "node:fs/promises";
import path from "node:path";
import { parseFragment } from "parse5";

const ROOT = path.resolve("tmp/jee-main-2022/examside");
const OUT = path.resolve("scratch/jee2022/examside-normalized");
const ONLY = process.argv[2] || null;

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const elementChildren = (node) => (node.childNodes || []).filter((child) => child.nodeName !== "#text");
const textChildren = (node) => (node.childNodes || []).filter((child) => child.nodeName === "#text").map((child) => child.value).join("");
function semanticChildren(node) {
  const output = [];
  function visit(current) {
    for (const child of elementChildren(current)) {
      if (attr(child, "data-mml-node")) output.push(child);
      else visit(child);
    }
  }
  visit(node);
  return output;
}

const mathAlpha = new Map([
  [0x1d400, "A"], [0x1d41a, "a"], [0x1d434, "A"], [0x1d44e, "a"],
]);
function normalizeGlyph(character) {
  const code = character.codePointAt(0);
  for (const [start, base] of mathAlpha) {
    const count = base === "A" ? 26 : 26;
    if (code >= start && code < start + count) return String.fromCharCode(base.charCodeAt(0) + code - start);
  }
  return character.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function glyphText(node) {
  const parts = [];
  function visit(current) {
    if (current.nodeName === "use") {
      const hex = attr(current, "data-c");
      if (hex) parts.push(normalizeGlyph(String.fromCodePoint(Number.parseInt(hex, 16))));
      return;
    }
    if (current.nodeName === "text" || current.nodeName === "#text") {
      const value = current.value ?? textChildren(current);
      if (value) parts.push(value);
      return;
    }
    for (const child of current.childNodes || []) visit(child);
  }
  visit(node);
  return parts.join("");
}

function mathNode(node) {
  const type = attr(node, "data-mml-node");
  const children = semanticChildren(node);
  if (["math", "mrow", "mstyle", "TeXAtom", "mtd"].includes(type)) return children.map(mathNode).join(" ");
  if (["mi", "mn", "mo", "mtext"].includes(type)) {
    const value = glyphText(node).replaceAll("−", "-").replaceAll("×", "\\times ").replaceAll("→", "\\to ").replaceAll("⇌", "\\rightleftharpoons ");
    return type === "mtext" ? `\\text{${value}}` : value;
  }
  if (type === "mfrac") return `\\frac{${mathNode(children[0])}}{${mathNode(children[1])}}`;
  if (type === "msup") return `{${mathNode(children[0])}}^{${mathNode(children[1])}}`;
  if (type === "msub") return `{${mathNode(children[0])}}_{${mathNode(children[1])}}`;
  if (type === "msubsup") return `{${mathNode(children[0])}}_{${mathNode(children[2])}}^{${mathNode(children[1])}}`;
  if (type === "msqrt") {
    const body = children[0] && attr(children[0], "data-mml-node") === "mo" && glyphText(children[0]).includes("√") ? children.slice(1) : children;
    return `\\sqrt{${body.map(mathNode).join(" ")}}`;
  }
  if (type === "mroot") return `\\sqrt[${mathNode(children[1])}]{${mathNode(children[0])}}`;
  if (type === "mover") return `\\overset{${mathNode(children[1])}}{${mathNode(children[0])}}`;
  if (type === "munder") return `\\underset{${mathNode(children[1])}}{${mathNode(children[0])}}`;
  if (type === "munderover") return `\\overset{${mathNode(children[2])}}{\\underset{${mathNode(children[1])}}{${mathNode(children[0])}}}`;
  if (type === "mtable") {
    const rows = children.map((row) => semanticChildren(row).map(mathNode).join(" & "));
    return `\\begin{matrix}${rows.join(" \\\\ ")}\\end{matrix}`;
  }
  return children.length ? children.map(mathNode).join(" ") : glyphText(node);
}

function firstSemantic(node, type = null) {
  if (attr(node, "data-mml-node") && (!type || attr(node, "data-mml-node") === type)) return node;
  for (const child of node.childNodes || []) {
    const found = firstSemantic(child, type);
    if (found) return found;
  }
  return null;
}

function htmlToText(html) {
  const images = [];
  const root = parseFragment(html || "");
  function render(node) {
    if (node.nodeName === "#text") return node.value;
    if (node.nodeName === "mjx-container") {
      const math = firstSemantic(node, "math");
      return math ? `$${mathNode(math).replace(/\s+/g, " ").trim()}$` : "";
    }
    if (node.nodeName === "img") {
      images.push({ source_url: attr(node, "data-orsrc") || attr(node, "src"), alt: attr(node, "alt") || "" });
      return ` [IMAGE_${images.length}] `;
    }
    if (node.nodeName === "sub" || node.nodeName === "sup") {
      const content = (node.childNodes || []).map(render).join("").replaceAll("$", "").trim();
      return node.nodeName === "sub" ? `$_{${content}}$` : `$^{${content}}$`;
    }
    const content = (node.childNodes || []).map(render).join("");
    return ["p", "div", "br", "li", "tr"].includes(node.nodeName) ? `${content}\n` : content;
  }
  const text = root.childNodes.map(render).join("")
    .replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, images };
}

function titleCaseSlug(slug) {
  const small = new Set(["and", "of", "the", "in"]);
  return slug.split("-").map((word, index) => index && small.has(word) ? word : word[0].toUpperCase() + word.slice(1)).join(" ");
}

await fs.mkdir(OUT, { recursive: true });
for (const entry of await fs.readdir(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory() || (ONLY && entry.name !== ONLY)) continue;
  const sourceFile = path.join(ROOT, entry.name, "questions.json");
  let source;
  try { source = JSON.parse(await fs.readFile(sourceFile, "utf8")); } catch { continue; }
  const records = source.questions.map((raw) => {
    const english = raw.question?.en || {};
    const question = htmlToText(english.content);
    const options = Object.fromEntries((english.options || []).map((option) => [option.identifier.toLowerCase(), htmlToText(option.content)]));
    const numerical = raw.type !== "mcq" || !(english.options || []).length;
    return {
      source_id: raw.question_id,
      source_url: `${source.source_url}/${raw.question_id}`,
      source_subject: raw.subject,
      subject: raw.subject === "physics" ? "Physics" : raw.subject === "chemistry" ? "Chemistry" : "Mathematics",
      chapter_slug: raw.chapter,
      chapter: titleCaseSlug(raw.chapter),
      question_type: numerical ? "NUMERICAL" : "MCQ",
      question: question.text,
      question_images: question.images,
      option_a: numerical ? "" : (options.a?.text || ""),
      option_b: numerical ? "" : (options.b?.text || ""),
      option_c: numerical ? "" : (options.c?.text || ""),
      option_d: numerical ? "" : (options.d?.text || ""),
      option_a_images: options.a?.images || [],
      option_b_images: options.b?.images || [],
      option_c_images: options.c?.images || [],
      option_d_images: options.d?.images || [],
      correct_option: numerical ? String(english.answer ?? "") : String(english.correct_options?.[0] || "").toLowerCase(),
    };
  }).filter((record) => record.correct_option !== "");
  await fs.writeFile(path.join(OUT, `${entry.name}.json`), `${JSON.stringify(records, null, 2)}\n`);
  console.log(`${entry.name}: ${records.length} source questions normalized`);
}
