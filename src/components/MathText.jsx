import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Helper to safely split text into math tokens ($$...$$ and $...$), markdown images/links, URLs, and non-math text
function splitMathSegments(text) {
  if (!text) return [];
  // Matches display math ($$...$$), inline math ($...$), markdown images/links, or URLs
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]*?\$|!\[[^\]]*\]\([^\)]*\)|https?:\/\/[^\s\)]+)/g;
  return String(text).split(mathRegex);
}

function isPreservedSegment(segment) {
  return (
    (segment.startsWith("$$") && segment.endsWith("$$") && segment.length >= 4) ||
    (segment.startsWith("$") && segment.endsWith("$") && segment.length >= 2) ||
    (segment.startsWith("![") && segment.endsWith(")")) ||
    segment.startsWith("http://") ||
    segment.startsWith("https://")
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
          s = s.replace(/(^|[^\n])\s*\n*\s*\*{0,2}\bStatement\s*[-–—]?\s*(?:\(?([IVX]+|[0-9]+|[A-E])\)?)\*{0,2}\s*:\s*/gi, (match, prefix, num) => {
            return (prefix ? prefix + "\n\n" : "") + `**Statement ${num}:** `;
          });
          s = s.replace(/(^|[^\n])\s*\n*\s*\*{0,2}\bAssertion\s*(?:\(?([Aa])\)?)\*{0,2}\s*:\s*/gi, (match, prefix, letter) => {
            return (prefix ? prefix + "\n\n" : "") + `**Assertion (${letter.toUpperCase()}):** `;
          });
          s = s.replace(/(^|[^\n])\s*\n*\s*\*{0,2}\bReason\s*(?:\(?([Rr])\)?)\*{0,2}\s*:\s*/gi, (match, prefix, letter) => {
            return (prefix ? prefix + "\n\n" : "") + `**Reason (${letter.toUpperCase()}):** `;
          });
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\((?:S1|s1)\)\s*:\s*/g, "$1\n\n**(S1):** ");
          s = s.replace(/([^\n])\s*\n*\s*\*{0,2}\((?:S2|s2)\)\s*:\s*/g, "$1\n\n**(S2):** ");

          // Lettered statements A., B., C., D., E. or (A), (B), (C), (D), (E) only when starting a line or preceded by period/colon
          s = s.replace(/(^|[\.\:\n])\s*\b([A-E])\.\s+/g, "$1\n\n**$2.** ");
          s = s.replace(/(^|[\.\:\n])\s*\(([A-E])\)\s+/g, "$1\n\n**($2)** ");

          // Roman numeral sub-statements (i), (ii), (iii), (iv), (v) only when starting a line
          s = s.replace(/(^|\n)\s*\(([ivx]+)\)\s+/gi, "$1**($2)** ");

          // Format instructions on distinct lines
          s = s.replace(/([^\n])\s*\n*\s*(In (?:the )?light of the above statements[^\n:]*:?)/gi, "$1\n\n$2");
          s = s.replace(/([^\n])\s*\n*\s*(?<!In (?:the )?light of the above statements,\s*)(Choose the (?:correct|most appropriate) answer[^\n:]*:?)/gi, (m, p1, p2) => {
            if (/In (?:the )?light of the above statements,\s*$/i.test(p1)) return p1 + " " + p2;
            return p1 + "\n\n" + p2;
          });
          s = s.replace(/([^\n])\s*\n*\s*(From the statements given below\s*:?)/gi, "$1\n\n$2");
          s = s.replace(/([^\n])\s*\n*\s*(Given below are two statements\s*:?)/gi, "$1\n\n$2");
          s = s.replace(/([^\n])\s*\n*\s*\b(Identify the (?:correct|incorrect) statements?[^\n:]*:?)/g, "$1\n\n$2");
          s = s.replace(/([^\n])\s*\n*\s*\b(The (?:correct|most likely|major|final) (?:name|structure|product|statement|order|value)[^\n:]*:?)/g, "$1\n\n$2");

          // Format inline systems of equations like:
          // "Consider the following system of equations : x + 2y - 3z = a 2x + 6y - 11 z = b x - 2y + 7z = c, Where a, b and c are real constants."
          s = s.replace(/((?:system of equations|equations)\s*:\s*)([a-zA-Z0-9\s\+\-\u2212\*\/\.\,\=]+?)(\s*,\s*(?:[Ww]here|[Ff]or|[Ii]f|[Tt]hen)\b)/g, (match, prefix, eqsStr, suffix) => {
            const parts = eqsStr.split(/\s*=\s*/);
            if (parts.length < 3) return match;

            const equations = [];
            let currentLhs = parts[0].trim();

            for (let i = 1; i < parts.length; i++) {
              const seg = parts[i].trim();
              if (i === parts.length - 1) {
                const cleanLhs = currentLhs.replace(/\u2212/g, "-").replace(/(\d+)\s+([a-zA-Z])/g, "$1$2").trim();
                equations.push(`${cleanLhs} &= ${seg}`);
              } else {
                const spaceIdx = seg.indexOf(" ");
                if (spaceIdx !== -1) {
                  const rhs = seg.slice(0, spaceIdx).trim();
                  const nextLhs = seg.slice(spaceIdx + 1).trim();
                  const cleanLhs = currentLhs.replace(/\u2212/g, "-").replace(/(\d+)\s+([a-zA-Z])/g, "$1$2").trim();
                  equations.push(`${cleanLhs} &= ${rhs}`);
                  currentLhs = nextLhs;
                }
              }
            }

            if (equations.length >= 2) {
              const mathBlock = "\n\n$$\\begin{aligned}\n" + equations.join(" \\\\\n") + "\n\\end{aligned}$$\n\n";
              const cleanSuffix = suffix.replace(/^[\s,]+/, "").replace(/^Where\b/, "where");
              return `${prefix.trim()}${mathBlock}${cleanSuffix}`;
            }
            return match;
          });

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
      if (isPreservedSegment(segment)) {
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

  // Parse flattened match-the-following questions into structured markdown tables
  if (/(?:List|Column)[\s\-–−]*[I1]\s*(?:with|and|&)?\s*\|?\s*(?:List|Column)[\s\-–−]*[II2]+/i.test(text) && !/\|[^\n]+\|\s*\n\s*\|[\s:\-\|]+\|/.test(text)) {
    let s = text;
    s = s.replace(/([^\n])\s+((?:List|Column)[\s\-–−]*[I1]\s*\|?\s*(?:List|Column)[\s\-–−]*[II2]+)/i, "$1\n$2");
    s = s.replace(/([^\n])\s+(\([a-eA-E]\)\s+[^\(\n]+\s*\|\s*\(?[ivx1-5p-tIVX]+\)?)/g, "$1\n$2");
    s = s.replace(/([^\n])\s+(Choose the (?:correct|most appropriate) answer)/gi, "$1\n\n$2");

    const lines = s.split("\n");
    const tableRows = [];
    let col1Title = "List-I";
    let col2Title = "List-II";
    let headerIndex = -1;
    let firstRowIndex = -1;
    let lastRowIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const headerMatch = line.match(/^(?:\|\s*)?(List[\s\-–−]*[I1]|Column[\s\-–−]*[I1])\s*(?:with|and|&)?\s*\|?\s*(List[\s\-–−]*[II2]+|Column[\s\-–−]*[II2]+)(?:\s*\|)?$/i);
      if (headerMatch && !line.includes("Match")) {
        col1Title = headerMatch[1].replace(/\s+/g, "-");
        col2Title = headerMatch[2].replace(/\s+/g, "-");
        headerIndex = i;
        continue;
      }

      const rowMatch = line.match(/^\(?([a-eA-E])\)?\s*([^\|]+?)\s*\|\s*\(?([ivx1-5p-tIVX]+)\)?\s*(.+)$/);
      if (rowMatch) {
        if (firstRowIndex === -1) firstRowIndex = i;
        lastRowIndex = i;
        tableRows.push({
          letter: rowMatch[1],
          left: rowMatch[2].trim(),
          num: rowMatch[3],
          right: rowMatch[4].trim(),
        });
      }
    }

    if (tableRows.length >= 2) {
      const markdownTable = [
        "",
        `| ${col1Title} | ${col2Title} |`,
        "| :--- | :--- |",
        ...tableRows.map((r) => `| (${r.letter}) ${r.left} | (${r.num}) ${r.right} |`),
        "",
      ].join("\n");

      const start = headerIndex !== -1 ? Math.min(headerIndex, firstRowIndex) : firstRowIndex;
      const before = lines.slice(0, start).join("\n").trim();
      const after = lines.slice(lastRowIndex + 1).join("\n").trim();

      text = [before, markdownTable, after].filter(Boolean).join("\n\n");
    } else {
      // Pattern A: Sequential lists: List-I (header1) (a) item1 (b) item2 ... List-II (header2) (i) itemA (ii) itemB ...
      const seqMatch = text.match(/(?:Match\s+)?(?:the\s+)?(List|Column)[\s\-–−]*[I1]\s*(?:with|and|&)?\s*(List|Column)[\s\-–−]*[II2]+[\s\.:]*(?:(?:List|Column)[\s\-–−]*[I1]\s*(?::\s*([^\(]+?)|(\([^\)]+\)))?[\s\.:]*)?\s*(\([a-eA-E]\)[\s\S]+?)((?:List|Column)[\s\-–−]*[II2]+\s*(?::\s*([^\(]+?)|(\([^\)]+\)))?)[\s\.:]*\s*(\(?[ivx1-9IVX]+\)[\s\S]+?)(?=(?:Choose the correct|From the options|In the light|\n\n|$))/i);
      
      const parseItems = (listStr, isLetter) => {
        const itemRegex = isLetter 
          ? /(?:\(([a-eA-E])\)|\b([a-eA-E])\.)\s*([\s\S]*?)(?=(?:\([a-eA-E]\)|\b[a-eA-E]\.|$))/g
          : /(?:\(([ivx1-9IVX]+)\)|\b([ivx1-9IVX]+)\.|\b([ivx1-9IVX]+)\b)\s*([\s\S]*?)(?=(?:\([ivx1-9IVX]+\)|\b[ivx1-9IVX]+\.|$))/g;
        const items = [];
        let m;
        while ((m = itemRegex.exec(listStr)) !== null) {
          const key = m[1] || m[2] || m[3];
          const val = (m[m.length - 1] || "").trim();
          if (key && val) items.push({ key: key.toLowerCase(), text: val });
        }
        return items;
      };

      if (seqMatch) {
        const col1Detail = seqMatch[3] || seqMatch[4];
        const col2Detail = seqMatch[7] || seqMatch[8];
        const col1Header = "List-I" + (col1Detail ? ` (${col1Detail.trim().replace(/^\(|\)$/g, "")})` : "");
        const col2Header = "List-II" + (col2Detail ? ` (${col2Detail.trim().replace(/^\(|\)$/g, "")})` : "");
        const items1 = parseItems(seqMatch[5], true);
        const items2 = parseItems(seqMatch[9], false);
        const maxLen = Math.max(items1.length, items2.length);

        if (maxLen >= 2) {
          const rows = [];
          for (let k = 0; k < maxLen; k++) {
            const c1 = items1[k] ? `(${items1[k].key}) ${items1[k].text}` : "";
            const c2 = items2[k] ? `(${items2[k].key}) ${items2[k].text}` : "";
            rows.push(`| ${c1} | ${c2} |`);
          }

          const tableMd = [
            "",
            `| ${col1Header} | ${col2Header} |`,
            "| :--- | :--- |",
            ...rows,
            "",
          ].join("\n");

          const matchIndex = seqMatch.index;
          const before = text.slice(0, matchIndex).trim();
          const after = text.slice(matchIndex + seqMatch[0].length).trim();
          const preamble = "Match List-I with List-II:";
          text = [before || preamble, tableMd, after].filter(Boolean).join("\n\n");
        }
      } else {
        // Pattern B: Interleaved pairs: List-I (header1) List-II (header2) (a) item1 (i) item2 (b) item3 (ii) item4
        const intMatch = text.match(/(?:Match\s+)?(?:the\s+)?(List|Column)[\s\-–−]*[I1]\s*(?:with|and|&)?\s*(List|Column)[\s\-–−]*[II2]+[\s\.:]*(?:(?:List|Column)[\s\-–−]*[I1]\s*(?::\s*([^\(]+?)|(\([^\)]+\)))?[\s\.:]*)?\s*(?:(?:List|Column)[\s\-–−]*[II2]+\s*(?::\s*([^\(]+?)|(\([^\)]+\)))?[\s\.:]*)?\s*(\([a-eA-E]\)[\s\S]+?)(?=(?:Choose the correct|From the options|In the light|\n\n|$))/i);
        if (intMatch) {
          const col1Detail = intMatch[3] || intMatch[4];
          const col2Detail = intMatch[5] || intMatch[6];
          const col1Header = "List-I" + (col1Detail ? ` (${col1Detail.trim().replace(/^\(|\)$/g, "")})` : "");
          const col2Header = "List-II" + (col2Detail ? ` (${col2Detail.trim().replace(/^\(|\)$/g, "")})` : "");
          const bodyStr = intMatch[7];
          const pairRegex = /\(([a-eA-E])\)\s*([\s\S]*?)\s*\(([ivxIVX]+|[0-9]+)\)\s*([\s\S]*?)(?=(?:\([a-eA-E]\)|$))/g;
          const rows = [];
          let p;
          while ((p = pairRegex.exec(bodyStr)) !== null) {
            const letter = p[1].toLowerCase();
            const leftVal = p[2].trim().replace(/\s*[—–−-]\s*$/, "");
            const num = p[3].toLowerCase();
            const rightVal = p[4].trim();
            rows.push(`| (${letter}) ${leftVal} | (${num}) ${rightVal} |`);
          }

          if (rows.length >= 2) {
            const tableMd = [
              "",
              `| ${col1Header} | ${col2Header} |`,
              "| :--- | :--- |",
              ...rows,
              "",
            ].join("\n");

            const matchIndex = intMatch.index;
            const before = text.slice(0, matchIndex).trim();
            const after = text.slice(matchIndex + intMatch[0].length).trim();
            const preamble = "Match List-I with List-II:";
            text = [before || preamble, tableMd, after].filter(Boolean).join("\n\n");
          }
        }
      }
    }
  }

  return text;
}

function sanitizeListsAndMarkdownSymbols(value) {
  let text = String(value ?? "");

  // Prevent leading +/- signs (like -I effect, +R effect, -5 V) from becoming markdown unordered lists
  text = splitMathSegments(text)
    .map((segment) => {
      if (isPreservedSegment(segment)) return segment;
      let s = segment;
      // Convert "+ I effect", "- I effect", "+ R effect", "- R effect" etc. to math mode
      s = s.replace(/(^|[\s\(\[\{])([+-])\s*([IRMEH]|Inductive|Resonance|Mesomeric|Electromeric)\s+effect\b/gi, (match, prefix, sign, effect) => {
        return `${prefix}$${sign}${effect}\\text{ effect}$`;
      });
      // Convert leading "+ " or "- " at the very start of string/line to escaped "\+ " or "\- "
      s = s.replace(/(^|\n)\s*([+-])\s+(?=[0-9A-Za-z\$\\\(])/g, "$1\\$2 ");
      // Clean stray bullet symbols at start of lines
      s = s.replace(/(^|\n)\s*[•·]\s*(?=[0-9A-Za-z\$\\\(])/g, "$1");
      return s;
    })
    .join("");

  return text;
}

function normalizeLegacyScientificNotation(value) {
  const symbols = {
    "π": "\\pi", "μ": "\\mu", "Δ": "\\Delta", "Ω": "\\Omega",
    "α": "\\alpha", "β": "\\beta", "λ": "\\lambda", "ρ": "\\rho",
  };

  const processed = splitMathSegments(value)
    .map((segment) => {
      // PRESERVE ALL MATH & IMAGE/LINK SEGMENTS EXACTLY AS THEY ARE
      if (isPreservedSegment(segment)) return segment;

      let text = segment;
      // Only apply substitutions to genuine non-math variables (excluding English articles 'a' and 'I')
      text = text.replace(/\b([b-hj-z])\s*([2-9]|\d{2,3})\b/g, (_, variable, power) => `$${variable}^{${power}}$`);
      text = text.replace(/\b([b-hj-z])_([0-9]+)\b/g, (_, variable, subscript) => `$${variable}_{${subscript}}$`);
      text = text.replace(/\bd([1-6])sp([1-6])\b/gi, (_, first, second) => `$d^{${first}}sp^{${second}}$`);
      text = text.replace(/\b(sp|dsp|d)([1-6])d([1-6])\b/gi, (_, prefix, first, second) => `$${prefix}^{${first}}d^{${second}}$`);
      text = text.replace(/\b(sp|dsp|d)([1-6])\b/gi, (_, prefix, power) => `$${prefix}^{${power}}$`);

      // Common spaced chemical formulas: CO 2, H 2O, CaCl 2, KO 2, etc.
      text = text.replace(/\b(XeF|XeO|XeOF|H|O|N|CO|SO|NO|NH|CH|CrO|FADH|CaCl|MgCl|NaCl|BaO|Fe|Cu|KO|SiO|SnO|PbO)\s+([2-9])\b/g, (_, formula, subscript) => `$\\mathrm{${formula}_${subscript}}$`);
      text = text.replace(/\b(XeF|XeO|XeOF|H|O|N|CO|SO|NO|NH|CH|CrO|FADH|KO|SiO|SnO|PbO)\s*([2-9])\b/g, (_, formula, subscript) => `$\\mathrm{${formula}_${subscript}}$`);

      // Negative exponents & units like 10 -3 s-1, 10-7 C, 10 2V, 10 4V
      text = text.replace(/\b10\s*-\s*([1-9]\d*)\s*(s-1|s\s*-\s*1|m-1|m\s*-\s*1|mol-1|mol\s*-\s*1|rad|N\/C|C|M|V|T|cm)?\b/g, (_, power, unit) => {
        return `$10^{-${power}}${unit ? `\\text{ ${unit.replace(/\s+/g, "")}}` : ""}$`;
      });
      text = text.replace(/\b10\s+([2-9])\s*V\b/g, (_, power) => `$10^{${power}}\\text{ V}$`);

      // Units with negative powers like g mol -1, kg mol -1, m s -1, ms -1, ms -2, kg/m3, rad s-1
      text = text.replace(/\b(g|kg|J|kJ|cal|kcal)\s+mol\s*-\s*1\b/gi, (_, mass) => `$\\text{${mass} mol}^{-1}$`);
      text = text.replace(/\b(m\s+s|ms)\s*-\s*1\b/gi, "$\\text{m s}^{-1}$");
      text = text.replace(/\b(m\s+s|ms)\s*-\s*2\b/gi, "$\\text{m s}^{-2}$");
      text = text.replace(/\brad\s*s\s*-\s*1\b/gi, "$\\text{rad s}^{-1}$");
      text = text.replace(/\brad\s*s\s*-\s*2\b/gi, "$\\text{rad s}^{-2}$");
      text = text.replace(/\bV\s+m\s*-\s*1\b/gi, "$\\text{V m}^{-1}$");
      text = text.replace(/\bkg\/m3\b/gi, "$\\text{kg/m}^3$");
      text = text.replace(/\bg\s*cm\s*-\s*3\b/gi, "$\\text{g cm}^{-3}$");

      // Exponents formatted as 10^-N or 10⁻³
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

  // Merge adjacent math tokens (e.g. $\Delta$$_r$H$ or $a$$b$) to prevent unintended $$ display math
  return processed.replace(/\$\s*\$/g, "");
}

function normalizeDisplayMathDelimiters(value) {
  let text = String(value ?? "");
  // Heal stray single $ inside $$ ... $$ blocks
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    if (inner.includes("$")) {
      const parts = inner.split(/\s*\$\s*/).map((p) => p.trim()).filter(Boolean);
      return parts.map((p) => `$$\n${p}\n$$`).join("\n\n");
    }
    return match;
  });

  // If $$ is used inline inside text (e.g. "If $$math$$, then ..."), convert to clean inline $math$
  text = text.replace(/([^\n])\s*\$\$([^\n]+?)\$\$\s*([^\n])/g, (match, before, math, after) => {
    return `${before} $${math.trim()}$ ${after}`;
  });

  // For genuine standalone or multi-line $$...$$, format properly with single bounding newlines
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    const trimmed = inner.trim();
    if (!trimmed) return "";
    return `\n\n$$\n${trimmed}\n$$\n\n`;
  });

  // Clean trailing spaces before punctuation (e.g. "$math$ ," -> "$math$,")
  text = text.replace(/\$\s+([,.\?!:])/g, "$$$1");

  // Ensure no more than 2 consecutive newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

function autoFormatBareLatex(value) {
  let text = String(value ?? "");

  return splitMathSegments(text)
    .map((segment) => {
      if (isPreservedSegment(segment)) return segment;

      let s = segment;

      // 1. Convert bare LaTeX commands like \hat{\imath}, \sigma, \omega, \theta, \varepsilon, \frac, \sqrt, \text outside math
      s = s.replace(/(\(?\s*\\(?:hat|vec|mathrm|mathbf|text|sigma|omega|theta|lambda|alpha|beta|gamma|mu|Delta|Omega|varepsilon|in|times|approx|le|ge|ne|pm|mp|frac|sqrt)[a-zA-Z0-9\s\^_\{\}\(\)\+\-\*\/\=\.,]*?\)?)/g, (match) => {
        const trimmed = match.trim();
        if (!trimmed) return match;
        return ` $${trimmed}$ `;
      });

      // 2. Wrap bare algebraic expressions like "y = x - 5x^{2}" or "4y = 2x - 25x^{2}"
      s = s.replace(/([0-9]*[a-zA-Z]\s*=\s*[0-9a-zA-Z\s\+\-\*\/\^_\{\}]+(?:\^\{[0-9a-zA-Z\+\-]+\}|_\{[0-9a-zA-Z\+\-]+\})[0-9a-zA-Z\s\+\-\*\/\^_\{\}]*)/g, (match) => {
        return ` $${match.trim()}$ `;
      });

      // Wrap bare multi-term equations: "5a = 2b + c" or "5a = 2b +c"
      s = s.replace(/(\b[0-9]*[a-zA-Z]\s*=\s*[0-9a-zA-Z\s\+\-\*\/\(\)]+[\+\-\*\/][0-9a-zA-Z\s\+\-\*\/\(\)]+)/g, (match) => {
        return ` $${match.trim().replace(/\s*([+\-])\s*/g, " $1 ")}$ `;
      });

      // Wrap variable sets like "for all a, b and c"
      s = s.replace(/\bfor all ([a-z]),\s*([a-z])\s*and\s*([a-z])\b/gi, (match, v1, v2, v3) => {
        return `for all $${v1}$, $${v2}$ and $${v3}$`;
      });

      // 3. Fix adjacent variables and words: "$L$and" -> "$L$ and", "area$A$is" -> "area $A$ is"
      s = s.replace(/([a-zA-Z0-9,\.\?\)])\$([^\$]+)\$/g, "$1 $$2$");
      s = s.replace(/\$([^\$]+)\$([a-zA-Z0-9\(])/g, "$$$1$ $2");

      return s;
    })
    .join("");
}

export default function MathText({ children, className = "" }) {
  const preparedText = normalizeDisplayMathDelimiters(
    normalizeQuestionLayout(
      autoFormatBareLatex(
        normalizeLegacyScientificNotation(
          normalizeFlattenedTables(
            normalizeBlankPlaceholders(
              sanitizeListsAndMarkdownSymbols(children)
            )
          )
        )
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
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || "Diagram"}
              className="my-2 h-auto max-h-32 sm:max-h-36 max-w-[340px] sm:max-w-[400px] rounded-xl border border-slate-200 bg-white object-contain p-1.5 sm:p-2 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]"
              loading="lazy"
            />
          ),
        }}
      >
        {preparedText}
      </ReactMarkdown>
    </div>
  );
}
