import { normalizeChapterName, getCanonicalChaptersForSubject } from "./src/lib/pyqChapterMapping.js";

const actionObj = {
  type: "prepare_custom_test",
  questionCount: 10,
  subjects: ["Physics"],
  chapters: ["Electrostatics", "Current Electricity", "../../admin", "Kinematics", "Invalid"],
  source: "weak_chapters"
};

let qCount = parseInt(actionObj.questionCount, 10);
if (isNaN(qCount) || qCount < 5) qCount = 5;
if (qCount > 30) qCount = 30;

const safeSubjects = [];
for (const s of (actionObj.subjects || [])) {
   let normSubj = s.toLowerCase() === 'mathematics' || s.toLowerCase() === 'math' || s.toLowerCase() === 'maths' ? 'Maths' : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
   if (['Physics', 'Chemistry', 'Biology', 'Maths'].includes(normSubj)) {
      safeSubjects.push({ id: normSubj.toLowerCase(), name: normSubj });
   }
}
if (safeSubjects.length === 0) safeSubjects.push({ id: "mixed", name: "Mixed Subjects" });

const safeChapters = [];
for (const c of (actionObj.chapters || [])) {
   const requestedChapter = c || "";
   const canonicalRequested = normalizeChapterName(requestedChapter);
   
   for (const subj of safeSubjects) {
      if (subj.name === "Mixed Subjects") continue;
      const pyqChapters = getCanonicalChaptersForSubject(subj.name);
      if (!pyqChapters) continue;
      const exactChap = pyqChapters.find(ch => {
         const cName = ch.toLowerCase();
         const reqName = requestedChapter.toLowerCase();
         if (cName === reqName) return true;
         const canonicalC = normalizeChapterName(ch);
         return canonicalC.toLowerCase() === canonicalRequested.toLowerCase() && canonicalC !== "";
      });
      if (exactChap) {
         safeChapters.push({ id: exactChap.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: exactChap, subject: subj.name });
         break;
      }
   }
}

const safeAction = {
   type: "prepared_custom_test",
   questionCount: qCount,
   subjects: safeSubjects,
   chapters: safeChapters,
   exam: "NEET",
   source: actionObj.source || "custom"
};

console.log(JSON.stringify(safeAction, null, 2));
