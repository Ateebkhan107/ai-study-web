import { validateClassroomLesson } from "./lessonSchema.js";

// Draft teaching copy and diagrams require subject and language sign-off before release.
const projectile = [
  ["launch", "Aim the launch", "The object starts with a speed and a direction. The launch angle is measured above the horizontal.", "Object ek speed aur direction se launch hota hai. Launch angle horizontal line ke upar measure hota hai."],
  ["components", "Split the velocity", "Resolve the launch velocity into a horizontal component and an upward component. The two components describe the same launch.", "Launch velocity ko horizontal aur upward components mein split karo. Dono components ek hi launch ko describe karte hain."],
  ["gravity", "Add gravity", "Gravity points straight down. With no air resistance, horizontal velocity stays constant while vertical velocity changes.", "Gravity seedha neeche lagti hai. Air resistance ke bina horizontal velocity constant rehti hai aur vertical velocity badalti hai."],
  ["trajectory", "Trace the flight", "The object travels equal horizontal distances in equal times. Its vertical motion first rises and then falls, forming a parabola.", "Equal time intervals mein horizontal distance barabar hota hai. Object pehle upar jaata hai, phir neeche aata hai. Path parabola hai."],
  ["apex", "Find the highest point", "At the apex, vertical velocity is momentarily zero. Horizontal velocity is still present and gravity still acts downward.", "Apex par vertical velocity ek pal ke liye zero hoti hai. Horizontal velocity rehti hai aur gravity neeche lagti rehti hai."],
  ["time", "Calculate flight time", "At the launch height again, the nonzero solution of the vertical displacement equation gives the time of flight.", "Jab object launch height par wapas aata hai, vertical displacement equation ka nonzero solution flight time deta hai."],
  ["range", "Measure horizontal range", "Multiply the constant horizontal velocity by the time of flight. Try complementary angles at the same speed and compare their ranges.", "Constant horizontal velocity ko flight time se multiply karo. Same speed par complementary angles try karke range compare karo."],
];
const bonding = [
  ["valence", "Count valence electrons", "Neutral sodium has one valence electron and neutral chlorine has seven. Only the outer electrons are shown.", "Neutral sodium ka ek valence electron hai aur neutral chlorine ke saat hain. Sirf outer electrons dikhaye gaye hain."],
  ["transfer", "Represent electron transfer", "Sodium loses one electron and chlorine gains one. This gives sodium a +1 charge and chlorine a −1 charge. The electron count is conserved.", "Sodium ek electron lose karta hai aur chlorine ek gain karta hai. Sodium ka charge +1 aur chlorine ka −1 ho jata hai. Total electrons same rehte hain."],
  ["lattice", "Connect ions to a lattice", "Oppositely charged ions attract. Solid sodium chloride forms an extended three-dimensional lattice. This board shows a small two-dimensional slice.", "Opposite charges wale ions attract karte hain. Solid sodium chloride ek extended three-dimensional lattice banata hai. Board par uska chhota two-dimensional slice hai."],
  ["sharing", "Compare a covalent bond", "Two hydrogen atoms contribute one electron each to a shared pair. The pair between the nuclei represents a single covalent bond in hydrogen gas.", "Dono hydrogen atoms ek-ek electron contribute karte hain. Nuclei ke beech shared pair hydrogen gas mein ek single covalent bond dikhata hai."],
];
const cell = [
  ["membrane", "Cell membrane", "The cell membrane separates the cell from its surroundings and selectively regulates movement of substances.", "Cell membrane cell ko surroundings se separate karti hai aur select karti hai ki kaun se substances andar ya bahar ja sakte hain."],
  ["cytoplasm", "Cytoplasm", "The cytoplasm includes the cytosol and structures outside the nucleus. Many cellular reactions occur in this region.", "Cytoplasm mein cytosol aur nucleus ke bahar ki structures aati hain. Is region mein kai cellular reactions hoti hain."],
  ["nucleus", "Nucleus", "The nucleus contains most of the cell’s DNA. Its genetic instructions help guide cell activity.", "Nucleus mein cell ka zyadaatar DNA hota hai. Genetic instructions cell ki activity guide karti hain."],
  ["mitochondria", "Mitochondria", "Mitochondria make much of the ATP used by many animal cells during aerobic respiration.", "Aerobic respiration ke dauraan mitochondria kai animal cells ke liye zyadaatar ATP banate hain."],
  ["ribosomes", "Ribosomes", "Ribosomes build proteins using instructions carried by messenger RNA. The dots mark examples of free ribosomes.", "Ribosomes messenger RNA ki instructions se proteins banate hain. Dots kuch free ribosomes ko dikhate hain."],
];

const templates = [
  {
    templateKey: "projectile_motion", title: "Projectile Motion", exam: "JEE Main",
    subject: "Physics", chapter: "Motion in a Plane", parameters: { angleDegrees: 45, initialSpeedMps: 20 },
    lessons: projectile,
  },
  {
    templateKey: "chemical_bonding", title: "Chemical Bonding", exam: "JEE Main",
    subject: "Chemistry", chapter: "Chemical Bonding and Molecular Structure", parameters: {},
    lessons: bonding,
  },
  {
    templateKey: "cell_structure", title: "Cell Structure", exam: "NEET",
    subject: "Biology", chapter: "Cell: The Unit of Life", parameters: {},
    lessons: cell,
  },
];

export const classroomFixtures = templates.flatMap(({ lessons, ...template }) =>
  ["English", "Hinglish"].map((language) => validateClassroomLesson({
    ...template,
    schemaVersion: 1,
    templateRevision: 1,
    lessonId: `fixture-${template.templateKey}-${language.toLowerCase()}`,
    language,
    steps: lessons.map(([sceneKey, title, english, hinglish]) => ({
      id: sceneKey,
      title,
      explanation: language === "English" ? english : hinglish,
      sceneKey,
      ...(template.subject === "Physics" && sceneKey !== "launch" ? { formulaKeys: [sceneKey] } : {}),
      animation: sceneKey === "trajectory"
        ? { type: "motion_path", durationMs: 2500 }
        : { type: "progressive_reveal", durationMs: 800 },
    })),
  })),
).filter(Boolean);
