import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PAPER = process.argv.find((arg) => arg.startsWith("--paper="))?.split("=")[1] ?? "JEE-MAIN-21-26FEB-S1";
const LOCAL = path.join(ROOT, "scratch/jee2021/local", PAPER);
const OUT = path.join(ROOT, "scratch/jee2021/transcribed");
const IMAGE_DIR = path.join(ROOT, "scratch/jee2021/images", PAPER);
const mastiva = JSON.parse(await fs.readFile(path.join(LOCAL, "mastiva-source.json"), "utf8"));
const jarvis = JSON.parse(await fs.readFile(path.join(LOCAL, "jarvis-source.json"), "utf8"));
const jarvisByNumber = new Map(jarvis.map((row) => [row.source_number, row]));

const configs = {
  "JEE-MAIN-21-26FEB-S1": {
    mappings: {
      Mathematics: [61, 73, 67, 62, 59, 76, 64, 72, 58, 60, 74, 66, 57, 70, 69, 68, 63, 65, 71, 75, 83, 77, 80, 84, 78, 79, 82, null, 85, 81],
      Physics: [9, null, 19, 1, 13, 10, 17, 6, 14, 16, 12, 5, 3, 11, 18, 2, 4, 7, 15, 8, 29, 25, 22, 21, 27, 23, 26, 20, 24, 28],
      Chemistry: [46, 41, null, 43, 42, 37, 33, 31, 45, 39, 32, 40, 38, null, 30, 47, 44, 34, 36, 35, 52, 50, 53, 48, 54, 55, 56, null, 49, 51],
    }, graphical: [32, 35, 36, 45, 46], graphicalQuestion: [32, 36, 45],
  },
  "JEE-MAIN-21-26FEB-S2": {
    mappings: {
      Physics: [11, 18, 17, 1, 7, 2, 3, 19, 12, 20, 13, 4, 10, 14, 9, 6, 8, 16, 15, 5, 29, 21, 24, 25, 23, 28, 30, 27, 22, 26],
      Chemistry: [47, 40, 36, 48, 41, 35, 50, 31, 39, 37, 42, 32, 38, 34, 49, 46, 44, 43, 33, 45, 51, 54, 57, 53, 55, 60, 56, 52, 58, 59],
      Mathematics: [72, 75, 74, 73, 76, 77, 80, 61, 69, 66, 65, 70, 68, 62, 63, 64, 78, 79, 67, 71, 89, 88, 82, 84, 87, 81, 85, 90, 83, 86],
    }, graphical: [9, 32, 42, 44, 49], graphicalQuestion: [9, 32, 42, 44, 49],
  },
  "JEE-MAIN-21-16MAR-S1": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, null, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      Chemistry: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, null, null, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
      Mathematics: [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, null, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    },
    graphical: [16, 33, 36, 40], graphicalQuestion: [16, 33, 40],
    graphicalLocal: ["Physics:14", "Chemistry:15"],
    graphicalQuestionLocal: ["Physics:14"],
  },
  "JEE-MAIN-21-16MAR-S2": {
    mappings: {
      Physics: [1, 2, 3, 4, null, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      Chemistry: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
      Mathematics: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
    },
    graphical: [42, 49], graphicalQuestion: [49],
  },
  "JEE-MAIN-21-17MAR-S1": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      Chemistry: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, null, 44, 45, 46, 47, 48, null, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      Mathematics: [null, 59, null, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    },
    graphical: [32, 33, 36, 41], graphicalQuestion: [33],
    graphicalLocal: ["Chemistry:14"],
    graphicalQuestionLocal: ["Chemistry:14"],
    questionImageLocal: ["Chemistry:20"],
  },
  "JEE-MAIN-21-17MAR-S2": {
    mappings: {
      Physics: [1, 2, null, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, null, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      Chemistry: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, null, null, 55, 56],
      Mathematics: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    },
    graphical: [40, 44], graphicalQuestion: [44],
  },
  "JEE-MAIN-21-18MAR-S1": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      Chemistry: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, null, 47, 48, 49, null, 50, 51, 52, 53, 54, 55, null, 56, 57],
      Mathematics: [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, null, 80, 81, 82, 83, 84, 85, 86],
    },
    graphical: [14, 31, 33, 37, 43, 45], graphicalQuestion: [31, 37, 45],
  },
  "JEE-MAIN-21-18MAR-S2": {
    mappings: {
      Physics: [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, null, 18, 19, 20, 21, 22, 23, null, 24, 25, 26, 27],
      Chemistry: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, null, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
      Mathematics: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, null, 84, 85],
    },
    graphical: [6, 16, 32, 41], graphicalQuestion: [6, 41],
  },
  "JEE-MAIN-21-20JUL-S1": {
    mappings: {
      Physics: [7, 12, 6, 19, 16, 11, 20, 1, 3, 2, 5, 18, 14, 4, 17, 15, 9, 10, 13, 8, 23, 28, 21, 25, 22, null, 26, 27, 24, 29],
      Chemistry: [40, 48, 35, 49, 38, 43, 47, 42, 32, 30, 45, 33, 34, 41, 37, 31, 39, 36, 46, 44, 50, 56, 59, 53, 55, 57, 52, 58, 51, 54],
      Mathematics: [67, 68, 73, 72, 70, 69, 62, 63, 78, 79, 65, 61, 76, 71, 77, 60, 75, 64, 66, 74, 83, 80, 86, 85, 88, null, 82, 84, 81, 87],
    },
    graphical: [48],
    graphicalQuestion: [],
  },
  "JEE-MAIN-21-20JUL-S2": {
    mappings: {
      Physics: [2, 7, 17, 15, 12, 11, 1, 14, 16, 4, 10, 3, 8, 9, 18, 19, 13, 6, 5, 20, 30, 29, 28, 23, 26, 24, 27, 22, 25, 21],
      Chemistry: [43, 33, 48, 47, 35, 49, 32, 45, 37, 42, 38, 44, 34, 41, 39, 31, null, 46, 40, 36, 52, 53, 57, 50, 51, 54, 58, 56, 55, 59],
      Mathematics: [63, 64, 68, 75, 72, 77, 61, 71, 65, 79, 67, 78, 70, 60, 69, 74, 66, 62, 76, 73, 83, 86, 85, 84, 81, 82, 87, null, 80, null],
    },
    graphical: [14, 31, 33, 39, 43, 48],
    graphicalQuestion: [31, 33, 39, 48],
  },
  "JEE-MAIN-21-22JUL-S2": {
    mappings: {
      Physics: [7, 19, 3, 9, 11, 4, 12, 13, 15, 18, 8, 5, 2, 10, 14, 17, 6, 16, 20, 1, 29, 21, 28, 22, 30, 24, 23, 27, 25, 26],
      Chemistry: [49, 48, 50, 31, 36, 44, 43, 33, 35, 32, 41, 39, 45, 40, 37, 46, 42, 38, 47, 34, null, 58, 56, 57, 54, 53, 55, 52, 51, 59],
      Mathematics: [73, 69, 67, 66, 78, 68, null, 72, 76, 61, 64, 74, 63, 60, 62, 71, 75, 70, 65, 77, 79, 85, 84, 88, 86, 83, 80, 87, 81, 82],
    },
    graphical: [7, 31, 38, 47], graphicalQuestion: [7],
    optionImageSources: { 36: ["d"] },
    preferOrderQuestionLocal: ["Physics:14", "Chemistry:6"],
  },
  "JEE-MAIN-21-25JUL-S1": {
    mappings: {
      Physics: [14, 1, 7, 20, 19, 5, 2, 17, 13, 6, 16, 18, 9, 3, 10, 11, 12, 15, 8, 4, 26, 28, 24, 30, 22, 29, 23, 27, 25, 21],
      Chemistry: [39, 42, 37, null, 41, 34, 32, 31, 33, 46, 48, 40, 36, 44, 49, 45, 47, 43, 38, 35, 50, 59, 57, 53, 56, 55, 51, 58, 54, 52],
      Mathematics: [68, 75, 71, 70, 73, 64, 76, 78, 79, 66, 60, 77, 74, 72, 63, 61, 69, 62, 67, 65, 83, 88, 86, 81, 85, 84, 80, 87, 82, null],
    },
    graphical: [32, 37, 44, 48], graphicalQuestion: [32, 37],
  },
  "JEE-MAIN-21-25JUL-S2": {
    mappings: {
      Physics: [8, 20, 11, 9, 15, 2, 12, 7, 3, 13, 10, 6, 14, 17, 19, 4, 16, 1, 18, 5, 28, 26, 27, 24, 25, 21, 22, 23, 29, 30],
      Chemistry: [37, 43, 38, 35, 44, 33, 46, 45, 49, 34, 41, 42, null, 32, 31, 39, null, 47, 48, 40, 58, 52, 53, 54, 56, 50, 55, 59, 57, 51],
      Mathematics: [65, 73, 77, 76, 79, 70, 68, 75, 62, 60, 61, 69, 67, 72, 64, 71, 63, 66, 78, 74, 86, 80, 89, 84, 85, 88, 81, 87, 82, 83],
    },
    graphical: [39, 41, 45, 47], graphicalQuestion: [39, 45, 47],
    optionImageSources: { 40: ["b", "c", "d"] },
  },
  "JEE-MAIN-21-27JUL-S1": {
    mappings: {
      Physics: [3, 10, 8, null, 5, 4, 6, 2, 15, 11, 9, 7, 17, 12, 14, 16, 18, 1, 13, 19, 22, 27, 28, 29, 24, 21, 23, 20, 25, 26],
      Chemistry: [35, 47, 38, 39, 31, 49, 40, 34, 46, 30, 41, 32, 37, 48, 36, 42, 33, 43, 44, 45, 58, 55, 50, 54, 53, 51, 52, 59, 56, 57],
      Mathematics: [79, 70, 62, 76, 60, 71, 69, 72, 65, 61, 67, 64, 68, 63, 73, 77, 75, 78, 74, 66, 81, 85, 89, 88, 84, 83, 82, 87, 80, 86],
    },
    graphical: [35, 36], graphicalQuestion: [36],
  },
  "JEE-MAIN-21-27JUL-S2": {
    mappings: {
      Physics: [10, 17, 2, 8, 11, 7, 16, 12, 15, 9, 14, 3, 5, 6, null, 18, 13, 1, 19, 4, 28, 22, 26, 23, 29, 20, 21, 27, 25, 24],
      Chemistry: [40, 42, 43, 36, 32, 44, 34, 45, 46, 39, 33, 38, 48, 47, 31, 49, 30, 35, 37, 41, null, 56, 51, 57, 54, 55, 50, 53, null, 52],
      Mathematics: [66, 71, 73, 64, 70, 76, 62, 65, 63, 60, 72, 74, 69, 61, 59, 75, 67, 58, 68, 77, 86, 81, 79, 84, 83, 78, 85, 80, 82, null],
    },
    graphical: [3, 14, 17, 35, 42], graphicalQuestion: [3, 14, 35, 42],
    questionImageLocal: ["Physics:15"],
  },
  "JEE-MAIN-21-26AUG-S1": {
    mappings: {
      Physics: [1, null, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, null, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      Chemistry: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      Mathematics: [59, 60, 61, 62, 63, 64, 65, null, 66, 67, 68, 69, 70, 71, 72, null, 73, 74, null, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
    },
    graphical: [32, 33, 34, 37], graphicalQuestion: [32, 33, 34, 37],
    graphicalLocal: ["Physics:13"],
    graphicalQuestionLocal: ["Physics:13"],
    questionImageLocal: ["Physics:2"],
  },
  "JEE-MAIN-21-26AUG-S2": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      Chemistry: [31, 32, 33, 34, 35, 36, 37, null, 38, 39, 40, 41, 42, 43, 44, 45, null, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      Mathematics: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    },
    graphical: [12, 31, 38, 47, 48], graphicalQuestion: [38, 47, 48],
    graphicalLocal: ["Chemistry:17"],
  },
  "JEE-MAIN-21-27AUG-S1": {
    mappings: {
      Physics: [1, 2, 3, 4, null, 5, 6, 7, 8, 9, 10, 11, 12, null, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      Chemistry: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      Mathematics: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, null, 86, 87],
    },
    graphical: [18, 30, 43, 45], graphicalQuestion: [18, 30, 45],
    graphicalLocal: ["Physics:14"],
    graphicalQuestionLocal: ["Physics:14"],
    questionImageLocal: ["Physics:5"],
  },
  "JEE-MAIN-21-27AUG-S2": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      Chemistry: [31, 32, 33, 34, 35, 36, 37, null, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
      Mathematics: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, null, 85, 86, 87, 88],
    },
    graphical: [36, 39, 40, 43, 49], graphicalQuestion: [39, 40, 43, 49],
  },
  "JEE-MAIN-21-31AUG-S1": {
    mappings: {
      Physics: [1, 2, 3, null, 4, 5, 6, 7, 8, 9, null, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      Chemistry: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      Mathematics: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    },
    graphical: [5, 29, 30, 34, 37, 44, 48], graphicalQuestion: [34, 37],
    graphicalLocal: ["Physics:11"],
    graphicalQuestionLocal: ["Physics:11"],
  },
  "JEE-MAIN-21-31AUG-S2": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      Chemistry: [31, 32, 33, null, 34, 35, 36, 37, 38, 39, null, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      Mathematics: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    },
    graphical: [33, 35, 45, 46, 47], graphicalQuestion: [33, 35, 45, 46, 47],
  },
  "JEE-MAIN-21-01SEP-S1": {
    mappings: {
      Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, null, 28, 29],
      Chemistry: [30, 31, 32, 33, 34, 35, 36, 37, 38, null, 39, 40, 41, null, 42, 43, 44, 45, null, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
      Mathematics: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    },
    graphical: [15, 33, 34, 43], graphicalQuestion: [15, 34],
    graphicalLocal: ["Chemistry:10"],
    questionImageLocal: ["Chemistry:14"],
    orderInsertions: {
      Mathematics: [{
        index: 14,
        row: {
          subject: "Maths",
          chapter: "Sequences and Series",
          question: "Let $S_n=1(n-1)+2(n-2)+3(n-3)+\\cdots+(n-1)\\cdot1$, where $n\\ge4$.",
        },
      }],
    },
  },
};
const config = configs[PAPER];
if (!config) throw new Error(`No build configuration for ${PAPER}`);
const mappings = config.mappings;

const offsets = { Physics: 0, Chemistry: 30, Mathematics: 60 };
const mastivaSubject = { Mathematics: "Maths", Physics: "Physics", Chemistry: "Chemistry" };
const graphicalSources = new Set(config.graphical);
const graphicalQuestionSources = new Set(config.graphicalQuestion);
const graphicalLocals = new Set(config.graphicalLocal ?? []);
const graphicalQuestionLocals = new Set(config.graphicalQuestionLocal ?? []);
const questionImageLocals = new Set(config.questionImageLocal ?? []);
const preferOrderQuestionLocals = new Set(config.preferOrderQuestionLocal ?? []);
const optionImageSources = config.optionImageSources ?? {};

const aliases = {
  "Probability": "Probability – I", "Sequences and Series": "Sequences and Series", "Applications of Derivatives": "Application of Derivatives",
  "Straight Lines and Pair of Straight Lines": "Straight Lines", "Relations and Functions": "Relations and Functions – I",
  "Basics Of Mathematics": "Sets", "Applications of Integrals": "Applications of Integrals",
  "Electrostatic Potential and Capacitance": "Electrostatics & Capacitance", "Electric Charges and Fields": "Electrostatics & Capacitance",
  "Physical World, Units and Measurements": "Physical World & Units of Measurement", "Atoms": "Atoms & Nuclei",
  "Ray Optics and Optical Instruments": "Ray Optics & Optical Instruments", "Oscillations": "Kinetic Theory of Gases & Oscillations (SHM)",
  "Alternating Current": "Electromagnetic Induction & Alternating Current", "Mechanical Properties of Solids": "Mechanical Properties of Solids & Fluids",
  "Mechanical Properties of Fluids": "Mechanical Properties of Solids & Fluids", "Work, Energy and Power": "Work, Energy & Power",
  "System of Particles and Rotational Motion": "System of Particles & Rotational Motion", "Experimental Physics": "Physical World & Units of Measurement",
  "Semiconductor Electronics: Materials, Devices and Simple Circuits": "Semiconductor Electronics & Devices", "Laws of Motion": "Laws of Motion & Friction",
  "Motion in a Plane": "Kinematics (Motion in a Straight Line & Plane)", "Kinetic Theory": "Kinetic Theory of Gases & Oscillations (SHM)",
  "Waves": "Waves & Sound", "The p-Block Elements (Group 15, 16, 17 & 18)": "p-Block Elements (Groups 13 to 18)",
  "The p-Block Elements (Group-13 and 14)": "p-Block Elements (Groups 13 to 18)", "Classification of Elements and Periodicity in Properties": "Classification of Elements & Periodicity",
  "Chemical Bonding and Molecular Structure": "Chemical Bonding & Molecular Structure", "General Principles and Processes of Isolation of Elements": "General Principles of Extraction (Metallurgy)",
  "Alcohols, Phenols and Ethers": "Alcohols, Phenols & Ethers", "Organic Chemistry — Some Basic Principles & Techniques": "General Organic Chemistry (GOC) & Nomenclature",
  "Haloalkanes and Haloarenes": "Haloalkanes & Haloarenes", "The d-and f-Block Elements": "d and f-Block Elements",
  "Hydrocarbons": "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)", "Amines": "Amines & Organic Nitrogen Compounds",
  "Thermodynamics": "Chemical Thermodynamics & Energetics", "Some Basic Concepts of Chemistry": "Some Basic Concepts of Chemistry (Mole Concept)",
  "Chemical Kinetics and Nuclear Chemistry": "Chemical Kinetics", "Electrochemistry": "Redox Reactions & Electrochemistry",
  "States of Matter": "States of Matter: Gases & Liquids", "Equilibrium": "Chemical & Ionic Equilibrium", "Redox Reactions": "Redox Reactions & Electrochemistry",
  "Solutions": "Solutions & Colligative Properties", "Co-ordination Compounds": "Coordination Compounds",
};

function chapter(name) { return aliases[name] ?? name; }
function option(value) {
  const text = String(value ?? "").trim();
  return /^(?:[A-Da-d]|[+\-]?\d+(?:\.\d+)?)$/.test(text) ? `$${text}$` : text;
}
function missing(subject, localNumber, source) {
  if (PAPER === "JEE-MAIN-21-16MAR-S1") {
    if (subject === "Physics" && localNumber === 14) return { ...source, correct: "a" };
    if (subject === "Chemistry" && localNumber === 14) return { ...source, correct: "b" };
    if (subject === "Chemistry" && localNumber === 15) return { ...source, correct: "c" };
    if (subject === "Mathematics" && localNumber === 16) return {
      ...source,
      question: "Let $[x]$ denote the greatest integer less than or equal to $x$. If, for $n \\in \\mathbb{N}$, $(1-x+x^3)^n=\\sum_{j=0}^{3n}a_jx^j$, then $\\sum_{j=0}^{\\left\\lfloor 3n/2 \\right\\rfloor}a_{2j}+4\\sum_{j=0}^{\\left\\lfloor (3n-1)/2 \\right\\rfloor}a_{2j+1}$ is equal to:",
      correct: "c",
    };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-16MAR-S2") {
    if (subject === "Physics" && localNumber === 5) return { ...source, correct: "b" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-17MAR-S1") {
    if (subject === "Chemistry" && localNumber === 14) return {
      ...source,
      question: "The major product $A$ in the following reaction is:",
      correct: "d",
    };
    if (subject === "Chemistry" && localNumber === 20) return { ...source, correct: "a" };
    if (subject === "Mathematics" && localNumber === 1) return { ...source, correct: "b" };
    if (subject === "Mathematics" && localNumber === 3) return { ...source, correct: "b" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-17MAR-S2") {
    if (subject === "Physics" && localNumber === 3) return { ...source, correct: "c" };
    if (subject === "Physics" && localNumber === 15) return { ...source, correct: "d" };
    if (subject === "Chemistry" && localNumber === 27) return { ...source, correct: "1" };
    if (subject === "Chemistry" && localNumber === 28) return { ...source, correct: "5" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-18MAR-S1") {
    if (subject === "Chemistry" && localNumber === 17) return { ...source, correct: "d" };
    if (subject === "Chemistry" && localNumber === 21) return { ...source, correct: "15" };
    if (subject === "Chemistry" && localNumber === 28) return { ...source, correct: "50" };
    if (subject === "Mathematics" && localNumber === 23) return {
      ...source,
      question: "Let $f(x)$ and $g(x)$ be two functions satisfying $f(x^2)+g(4-x)=4x^3$ and $g(4-x)+g(x)=0$. Then the value of $\\int_0^4 f(x^2)\\,dx$ is:",
      correct: "256",
    };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-18MAR-S2") {
    if (subject === "Physics" && localNumber === 1) return { ...source, correct: "a" };
    if (subject === "Physics" && localNumber === 19) return { ...source, correct: "c" };
    if (subject === "Physics" && localNumber === 26) return { ...source, correct: "34" };
    if (subject === "Chemistry" && localNumber === 15) return {
      ...source,
      question: "Match the elements in List I with their uses in List II: $(a)$ Be, $(b)$ Mg, $(c)$ Ca, $(d)$ Ra; $(i)$ treatment of cancer, $(ii)$ extraction of metals, $(iii)$ incendiary bombs and signals, $(iv)$ windows of X-ray tubes, $(v)$ bearings for motor engines. Choose the correct matching:",
      correct: "b",
    };
    if (subject === "Mathematics" && localNumber === 28) return {
      ...source,
      question: "Let ${}^{10}C_k$ denote the binomial coefficient of $x^k$ in $(1+x)^{10}$. If $\\sum_{k=0}^{10}(2^2+3k){}^{10}C_k=\\alpha\\cdot3^{10}+\\beta\\cdot2^{10}$, where $\\alpha,\\beta\\in\\mathbb{R}$, then $\\alpha+\\beta$ is equal to:",
      correct: "19",
    };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-20JUL-S1") {
    if (subject === "Physics" && localNumber === 26) return { ...source, correct: "2" };
    if (subject === "Mathematics" && localNumber === 26) return { ...source, correct: "1.25" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-20JUL-S2") {
    if (subject === "Chemistry" && localNumber === 17) return { ...source, correct: "c" };
    if (subject === "Mathematics" && localNumber === 28) return { ...source, correct: "9" };
    if (subject === "Mathematics" && localNumber === 30) return { ...source, correct: "-75" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-22JUL-S2") {
    if (subject === "Chemistry" && localNumber === 21) return { ...source, correct: "3" };
    if (subject === "Mathematics" && localNumber === 7) return { ...source, correct: "a" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-25JUL-S1") {
    if (subject === "Chemistry" && localNumber === 4) return { ...source, correct: "c" };
    if (subject === "Mathematics" && localNumber === 30) return { ...source, correct: "11" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-25JUL-S2") {
    if (subject === "Chemistry" && localNumber === 13) return { ...source, correct: "a" };
    if (subject === "Chemistry" && localNumber === 17) return { ...source, correct: "d" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-27JUL-S1") {
    if (subject === "Physics" && localNumber === 4) return {
      ...source,
      question: "Match List I with List II. List I: $(a)$ moment of inertia of a rod of length $L$ and mass $M$ about an axis perpendicular to the rod through its midpoint; $(b)$ moment of inertia of a rod of length $L$ and mass $2M$ about an axis perpendicular to the rod through one end; $(c)$ moment of inertia of a rod of length $2L$ and mass $M$ about an axis perpendicular to the rod through its midpoint; $(d)$ moment of inertia of a rod of length $2L$ and mass $2M$ about an axis perpendicular to the rod through one end. List II: $(i)\;8ML^2/3$, $(ii)\;ML^2/3$, $(iii)\;ML^2/12$, $(iv)\;2ML^2/3$. Choose the correct matching:",
      correct: "c",
    };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-27JUL-S2") {
    if (subject === "Physics" && localNumber === 15) return { ...source, correct: "b" };
    if (subject === "Chemistry" && localNumber === 21) return { ...source, correct: "16" };
    if (subject === "Chemistry" && localNumber === 29) return { ...source, correct: "300" };
    if (subject === "Mathematics" && localNumber === 30) return { ...source, correct: "2020" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-26AUG-S1") {
    if (subject === "Physics" && localNumber === 2) return { ...source, correct: "a" };
    if (subject === "Physics" && localNumber === 13) return { ...source, correct: "a" };
    if (subject === "Mathematics" && localNumber === 8) return { ...source, correct: "d" };
    if (subject === "Mathematics" && localNumber === 16) return { ...source, correct: "b" };
    if (subject === "Mathematics" && localNumber === 19) return { ...source, correct: "c" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-26AUG-S2") {
    if (subject === "Chemistry" && localNumber === 8) return { ...source, correct: "a" };
    if (subject === "Chemistry" && localNumber === 17) return { ...source, correct: "c" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-27AUG-S1") {
    if (subject === "Physics" && localNumber === 5) return { ...source, correct: "a" };
    if (subject === "Physics" && localNumber === 14) return { ...source, correct: "c" };
    if (subject === "Mathematics" && localNumber === 28) return { ...source, correct: "2" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-27AUG-S2") {
    if (subject === "Chemistry" && localNumber === 8) return { ...source, correct: "d" };
    if (subject === "Mathematics" && localNumber === 26) return { ...source, correct: "36" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-31AUG-S1") {
    if (subject === "Physics" && localNumber === 4) return { ...source, correct: "a" };
    if (subject === "Physics" && localNumber === 11) return { ...source, correct: "c" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-31AUG-S2") {
    if (subject === "Chemistry" && localNumber === 4) return { ...source, correct: "c" };
    if (subject === "Chemistry" && localNumber === 11) return { ...source, correct: "a" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (PAPER === "JEE-MAIN-21-01SEP-S1") {
    if (subject === "Physics" && localNumber === 28) return { ...source, correct: "6" };
    if (subject === "Chemistry" && localNumber === 10) return { ...source, correct: "d" };
    if (subject === "Chemistry" && localNumber === 14) return { ...source, correct: "d" };
    if (subject === "Chemistry" && localNumber === 19) return { ...source, correct: "a" };
    throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
  }
  if (subject === "Mathematics" && localNumber === 28) return { ...source, correct: "8" };
  if (subject === "Physics" && localNumber === 2) return { ...source, correct: "d" };
  if (subject === "Chemistry" && localNumber === 3) return { ...source, correct: "a" };
  if (subject === "Chemistry" && localNumber === 14) return { ...source, correct: "c" };
  if (subject === "Chemistry" && localNumber === 28) return { ...source, correct: "12" };
  throw new Error(`Unexpected missing source ${subject} Q${localNumber}`);
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(IMAGE_DIR, { recursive: true });
for (const [subject, map] of Object.entries(mappings)) {
  const ordered = mastiva.filter((row) => row.subject === mastivaSubject[subject]);
  for (const insertion of config.orderInsertions?.[subject] ?? []) {
    ordered.splice(insertion.index, 0, insertion.row);
  }
  if (ordered.length !== 30) throw new Error(`${subject}: expected 30 Mastiva rows`);
  const rows = map.map((sourceNumber, index) => {
    const localNumber = index + 1;
    const globalNumber = offsets[subject] + localNumber;
    const orderSource = ordered[index];
    const raw = sourceNumber == null ? missing(subject, localNumber, orderSource) : jarvisByNumber.get(sourceNumber);
    if (!raw) throw new Error(`${subject} Q${localNumber}: missing Jarvis ${sourceNumber}`);
    const numerical = localNumber > 20;
    const localKey = `${subject}:${localNumber}`;
    const graphical = graphicalSources.has(sourceNumber) || graphicalLocals.has(localKey);
    const graphicalQuestion = graphical && (graphicalQuestionSources.has(sourceNumber) || graphicalQuestionLocals.has(localKey));
    const hasImage = Boolean(raw.source_image) || graphicalLocals.has(localKey) || questionImageLocals.has(localKey);
    let options = numerical || graphical ? ["", "", "", ""] : raw.options.map(option);
    if (PAPER === "JEE-MAIN-21-20JUL-S1" && sourceNumber === 20) {
      options = ["Curve $(c)$", "Curve $(a)$", "Curve $(b)$", "Curve $(d)$"];
    }
    const partialImageLetters = new Set(optionImageSources[sourceNumber] ?? []);
    for (const letter of partialImageLetters) options["abcd".indexOf(letter)] = "";
    return {
      local_number: localNumber,
      question_type: numerical ? "NUMERICAL" : "MCQ",
      chapter: chapter(orderSource.chapter),
      question: preferOrderQuestionLocals.has(localKey) ? orderSource.question : raw.question,
      option_a: options[0] ?? "", option_b: options[1] ?? "", option_c: options[2] ?? "", option_d: options[3] ?? "",
      correct_option: String(raw.correct).toLowerCase(),
      needs_question_image: hasImage && partialImageLetters.size === 0 && (!graphical || graphicalQuestion),
      option_a_needs_image: graphical || partialImageLetters.has("a"), option_b_needs_image: graphical || partialImageLetters.has("b"), option_c_needs_image: graphical || partialImageLetters.has("c"), option_d_needs_image: graphical || partialImageLetters.has("d"),
      question_number: globalNumber, display_order: globalNumber, subject,
      question_image: hasImage && partialImageLetters.size === 0 && (!graphical || graphicalQuestion) ? path.join(IMAGE_DIR, `q${globalNumber}.png`) : null,
      option_a_image: graphical || partialImageLetters.has("a") ? path.join(IMAGE_DIR, `q${globalNumber}_opt_a.png`) : null,
      option_b_image: graphical || partialImageLetters.has("b") ? path.join(IMAGE_DIR, `q${globalNumber}_opt_b.png`) : null,
      option_c_image: graphical || partialImageLetters.has("c") ? path.join(IMAGE_DIR, `q${globalNumber}_opt_c.png`) : null,
      option_d_image: graphical || partialImageLetters.has("d") ? path.join(IMAGE_DIR, `q${globalNumber}_opt_d.png`) : null,
      source_image: raw.source_image ?? null, source_number: sourceNumber,
    };
  });
  await fs.writeFile(path.join(OUT, `${PAPER}_${subject}.json`), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`${subject}: ${rows.length}`);
}
