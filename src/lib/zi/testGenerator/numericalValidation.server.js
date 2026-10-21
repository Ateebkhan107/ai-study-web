import "server-only";

// Audited, fixed formula catalog. There is no eval, Function, generated code,
// user-defined expression evaluator, or model-provided executable formula.
const UNITS = {
  "1": { dimension: "scalar", factor: 1 }, rad: { dimension: "angle", factor: 1 },
  kg: { dimension: "mass", factor: 1 }, g: { dimension: "mass", factor: 0.001 },
  m: { dimension: "length", factor: 1 }, cm: { dimension: "length", factor: 0.01 },
  s: { dimension: "time", factor: 1 },
  "kgm^2": { dimension: "inertia", factor: 1 },
  nm: { dimension: "torque", factor: 1 },
  j: { dimension: "energy", factor: 1 },
  w: { dimension: "power", factor: 1 },
  "rad/s": { dimension: "angularVelocity", factor: 1 },
  "rad/s^2": { dimension: "angularAcceleration", factor: 1 },
  "kgm^2/s": { dimension: "angularMomentum", factor: 1 },
  "m/s": { dimension: "velocity", factor: 1 }, "m/s^2": { dimension: "acceleration", factor: 1 },
};
function plain(value) {
  return String(value).replace(/\\(?:mathrm|text)\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:,|;|!|quad|qquad|cdot)|\\ /g, " ")
    .replace(/\$|\\[()[\]]|[{}]/g, "").trim();
}
function unit(value) {
  const key = plain(value).toLowerCase().replace(/[\s*·]/g, "");
  return Object.hasOwn(UNITS, key) ? UNITS[key] : null;
}
export function parseNumericOption(value) {
  const match = plain(value).match(/^([-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\s*(.*)$/);
  if (!match) return null;
  const units = unit(match[2] || "1");
  if (!units || !Number.isFinite(Number(match[1]))) return null;
  return { value: Number(match[1]) * units.factor, dimension: units.dimension };
}

const GEOMETRIES = {
  solid_disc: { coefficient: 0.5, evidence: /(?:uniform|solid)\s+(?:disc|disk|cylinder)/i },
  solid_sphere: { coefficient: 0.4, evidence: /(?:uniform\s+)?solid\s+sphere/i },
  hoop: { coefficient: 1, evidence: /(?:thin\s+(?:ring|hoop)|hoop)/i },
  rod_center: { coefficient: 1 / 12, evidence: /(?:uniform|thin)\s+rod/i },
  rod_end: { coefficient: 1 / 3, evidence: /(?:uniform|thin)\s+rod/i },
};
const FAMILIES = {
  torque_acceleration: { inputs: { torque: "torque", inertia: "inertia" }, output: "angularAcceleration", solve: (v) => v.torque / v.inertia },
  body_inertia: { inputs: { mass: "mass", size: "length" }, output: "inertia", geometry: true, solve: (v, k) => k * v.mass * v.size ** 2 },
  rotational_energy: { inputs: { inertia: "inertia", omega: "angularVelocity" }, output: "energy", solve: (v) => 0.5 * v.inertia * v.omega ** 2 },
  angular_momentum: { inputs: { inertia: "inertia", omega: "angularVelocity" }, output: "angularMomentum", solve: (v) => v.inertia * v.omega },
  angular_velocity: { inputs: { initialOmega: "angularVelocity", alpha: "angularAcceleration", time: "time" }, output: "angularVelocity", solve: (v) => v.initialOmega + v.alpha * v.time },
  parallel_axis: { inputs: { centerInertia: "inertia", mass: "mass", offset: "length" }, output: "inertia", solve: (v) => v.centerInertia + v.mass * v.offset ** 2 },
  momentum_conservation: { inputs: { initialInertia: "inertia", initialOmega: "angularVelocity", finalInertia: "inertia" }, output: "angularVelocity", solve: (v) => v.initialInertia * v.initialOmega / v.finalInertia },
  rolling_speed: { inputs: { height: "length", gravity: "acceleration" }, output: "velocity", geometry: true, solve: (v, k) => Math.sqrt(2 * v.gravity * v.height / (1 + k)) },
  torque_spinup_energy: { inputs: { mass: "mass", size: "length", torque: "torque", time: "time" }, output: "energy", geometry: true, solve: (v, k) => {
    const inertia = k * v.mass * v.size ** 2;
    const omega = v.torque * v.time / inertia;
    return 0.5 * inertia * omega ** 2;
  } },
  braking_angle: { inputs: { mass: "mass", size: "length", initialOmega: "angularVelocity", brakingTorque: "torque" }, output: "angle", geometry: true, solve: (v, k) => v.brakingTorque > 0 ? k * v.mass * v.size ** 2 * v.initialOmega ** 2 / (2 * v.brakingTorque) : NaN },
  spinup_power: { inputs: { mass: "mass", size: "length", torque: "torque", time: "time" }, output: "power", geometry: true, solve: (v, k) => v.torque ** 2 * v.time / (k * v.mass * v.size ** 2) },
  conserved_momentum_energy_change: { inputs: { initialInertia: "inertia", initialOmega: "angularVelocity", finalInertia: "inertia" }, output: "energy", solve: (v) => 0.5 * v.initialInertia ** 2 * v.initialOmega ** 2 / v.finalInertia - 0.5 * v.initialInertia * v.initialOmega ** 2 },
  attached_mass_speed: { inputs: { inertia: "inertia", initialOmega: "angularVelocity", attachedMass: "mass", offset: "length" }, output: "angularVelocity", solve: (v) => v.inertia * v.initialOmega / (v.inertia + v.attachedMass * v.offset ** 2) },
  rolling_total_energy: { inputs: { mass: "mass", speed: "velocity" }, output: "energy", geometry: true, solve: (v, k) => 0.5 * v.mass * v.speed ** 2 * (1 + k) },
};
const MODEL_STEPS = { rolling_speed: 2, torque_spinup_energy: 3, braking_angle: 2, spinup_power: 3, conserved_momentum_energy_change: 3, attached_mass_speed: 2, rolling_total_energy: 2 };

export function verifyNumericalQuestion(question, proof) {
  const family = proof && Object.hasOwn(FAMILIES, proof.family) ? FAMILIES[proof.family] : null;
  const fail = (code) => ({ passed: false, code, method: "fixed_formula_catalog" });
  if (!family || question.subject !== "Physics") return fail("UNSUPPORTED_CALCULATION");
  const required = Object.keys(family.inputs);
  if (proof.inputs.length !== required.length || new Set(proof.inputs.map((v) => v.name)).size !== required.length || proof.inputs.some((v) => !required.includes(v.name))) return fail("UNBOUND_CALCULATION_INPUT");
  const values = {};
  for (const input of proof.inputs) {
    // Each input must literally occur in the question (including its units).
    // The independently derived value cannot be taken from an answer option.
    if (!question.statement.includes(input.sourceText)) return fail("UNBOUND_CALCULATION_INPUT");
    const source = parseNumericOption(input.sourceText);
    const declaredUnit = unit(input.unit);
    if (!source || !declaredUnit || source.dimension !== family.inputs[input.name] || declaredUnit.dimension !== source.dimension) return fail("UNIT_MISMATCH");
    if (Math.abs(source.value - input.value * declaredUnit.factor) > 1e-9 * Math.max(1, Math.abs(source.value))) return fail("UNBOUND_CALCULATION_INPUT");
    if (["mass", "length", "inertia", "time", "acceleration"].includes(source.dimension) && source.value <= 0) return fail("INVALID_PHYSICAL_INPUT");
    values[input.name] = source.value;
  }
  let coefficient;
  if (family.geometry) {
    const geometry = Object.hasOwn(GEOMETRIES, proof.geometry) ? GEOMETRIES[proof.geometry] : null;
    if (!geometry || !proof.geometryEvidence || !question.statement.includes(proof.geometryEvidence) || !geometry.evidence.test(plain(proof.geometryEvidence))) return fail("UNBOUND_GEOMETRY");
    if (proof.family.startsWith("rolling_") && ["rod_center", "rod_end"].includes(proof.geometry)) return fail("UNSUPPORTED_CALCULATION");
    coefficient = geometry.coefficient;
  }
  const computedAnswer = family.solve(values, coefficient);
  if (!Number.isFinite(computedAnswer)) return fail("NONFINITE_CALCULATION");
  const options = question.options.map(parseNumericOption);
  if (options.some((value) => !value || value.dimension !== family.output)) return fail("UNSUPPORTED_NUMERIC_OPTIONS");
  const relativeTolerance = /approximately|nearest|approximate/i.test(question.statement) ? 0.005 : 1e-6;
  const matches = options.map((value, index) => Math.abs(value.value - computedAnswer) <= relativeTolerance * Math.max(Math.abs(computedAnswer), 1e-9) ? index : -1).filter((i) => i >= 0);
  if (matches.length !== 1) return fail(matches.length > 1 ? "AMBIGUOUS_NUMERICAL_ANSWER" : "INCORRECT_CALCULATION");
  if (matches[0] !== question.correctAnswer) return fail("INCORRECT_ANSWER_KEY");
  return { passed: true, method: "fixed_formula_catalog", family: proof.family, substantiveSteps: MODEL_STEPS[proof.family] || 1, computedAnswer, dimension: family.output, matchedOption: matches[0], limitation: "Arithmetic and input-unit binding checked; interpretation of the physical model, axis and completeness of assumptions also require independent review." };
}

export const NUMERICAL_CATALOG_INSTRUCTIONS = `For requiresCalculation=true, supply a supported fixed-formula proof or family=unsupported. Do not invent an expression or executable code.
Physics catalog (exact input names, units and intended result):
torque_acceleration: torque N m, inertia kg m^2 -> angular acceleration rad/s^2.
body_inertia: mass kg, size m (radius; full rod length for rods) -> inertia kg m^2, requires geometry.
rotational_energy: inertia kg m^2, omega rad/s -> energy J.
angular_momentum: inertia kg m^2, omega rad/s -> angular momentum kg m^2/s.
angular_velocity: initialOmega rad/s, alpha rad/s^2, time s -> final angular velocity rad/s.
parallel_axis: centerInertia kg m^2, mass kg, offset m -> inertia kg m^2.
momentum_conservation: initialInertia kg m^2, initialOmega rad/s, finalInertia kg m^2 -> final angular velocity rad/s.
rolling_speed: height m, gravity m/s^2 -> speed m/s, requires geometry, starts from rest, rolls without slip.
torque_spinup_energy: mass kg, size m (radius or full rod length), torque N m, time s -> rotational energy J, constant torque from rest, requires geometry.
braking_angle: mass kg, size m, initialOmega rad/s, brakingTorque N m (positive magnitude) -> angle rad until rest under a constant opposing net torque, requires geometry.
spinup_power: mass kg, size m, torque N m, time s -> instantaneous power W after time, constant torque from rest, requires geometry.
conserved_momentum_energy_change: initialInertia kg m^2, initialOmega rad/s, finalInertia kg m^2 -> change in total rotational kinetic energy J, no external torque.
attached_mass_speed: inertia kg m^2, initialOmega rad/s, attachedMass kg, offset m -> final speed rad/s after a stationary point mass attaches at given radius, zero external angular impulse.
rolling_total_energy: mass kg, speed m/s -> TOTAL translational plus rotational energy J, rolling without slip, requires geometry.
For Medium numerical questions use one of rolling_speed, torque_spinup_energy, braking_angle, spinup_power, conserved_momentum_energy_change, attached_mass_speed, rolling_total_energy (at least two substantive steps). Direct single-equation substitutions are Easy, even with long explanations.
Geometry: solid_disc (uniform disc/disk or solid cylinder, symmetry axis), solid_sphere (diameter axis), hoop (central symmetry axis), rod_center (perpendicular through center), rod_end (perpendicular through end).
Each sourceText must be an EXACT substring of the statement containing only its explicit numeric value and unit, including LaTeX delimiters if present. Bind every input. geometryEvidence must be an EXACT descriptive substring of the statement. Never extract numeric inputs from options, explanations, or unstated assumptions. No unsupported unit conventions or symbolic answer options. Use geometry=null and geometryEvidence="" when not required. For noncalculation questions, calculation=null.`;
