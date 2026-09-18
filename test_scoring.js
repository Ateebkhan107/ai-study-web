import { calculateNEETScore, validateNEETInputs } from "./src/lib/neet/scoring.js";

const cases = [
  { c: 180, i: 0, u: 0, expected: 720 },
  { c: 150, i: 30, u: 0, expected: 570 },
  { c: 150, i: 0, u: 30, expected: 600 },
  { c: 0, i: 180, u: 0, expected: -180 },
  { c: 90, i: 45, u: 45, expected: 315 },
];

let passed = 0;
for (const tc of cases) {
  const result = calculateNEETScore(tc.c, tc.i, tc.u);
  if (result.score === tc.expected) {
    passed++;
  } else {
    console.error(`FAILED: ${tc.c} correct, ${tc.i} incorrect. Expected ${tc.expected}, got ${result.score}`);
  }
}
console.log(`${passed}/${cases.length} passed.`);

// Test validation
console.log(validateNEETInputs(-1, 0, 0));
console.log(validateNEETInputs(100, 100, 0));
