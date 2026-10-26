import network from './demo-network.cjs';
import { mkdtempSync, readFileSync, writeFileSync, lstatSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { DEMO, demoMaximumCost, authorizeDemo } from './demo-policy.mjs';
import { assertEnvironment, digest, refuse, requestBody } from './live-policy.mjs';
import { ledger } from './accounting.mjs';
import { requestOnce } from './gemini-once.mjs';
import { CandidateQuestionSchema, NumericProofSchema, generationResponseSchema, geminiSchema } from '../../src/lib/zi/testGenerator/questionSchema.server.js';
import { validateQuestionStructure } from '../../src/lib/zi/testGenerator/questionValidation.server.js';
import { verifyNumericalQuestion } from '../../src/lib/zi/testGenerator/numericalValidation.server.js';
import { GENERATE_QUESTIONS_PROMPT } from '../../src/lib/zi/testGenerator/questionPrompts.server.js';
import { config, candidate } from './fixtures.mjs';

const Envelope = z.object({ questions: z.array(CandidateQuestionSchema).length(1), calculation: NumericProofSchema }).strict();
const sourceNames = ['demo.mjs', 'demo-policy.mjs', 'demo-network.cjs', 'accounting.mjs', 'live-policy.mjs', 'gemini-once.mjs', 'fixtures.mjs',
  '../../src/lib/zi/testGenerator/questionSchema.server.js', '../../src/lib/zi/testGenerator/questionValidation.server.js',
  '../../src/lib/zi/testGenerator/numericalValidation.server.js', '../../src/lib/zi/testGenerator/questionPrompts.server.js'];
const sourceHash = () => digest(sourceNames.map(n => [n, readFileSync(new URL(n, import.meta.url), 'utf8')]));
function rootGuard(root) {
  if (!/^\/private\/tmp\/prepzii-gemini-pilot-[A-Za-z0-9]+$/.test(root) || realpathSync(root) !== root) refuse('UNSAFE_ROOT');
  const st = lstatSync(root);
  if (st.uid !== process.getuid() || (st.mode & 0o777) !== 0o700 || !st.isDirectory()) refuse('UNSAFE_ROOT');
}
function readPrivate(file) {
  const st = lstatSync(file);
  if (!st.isFile() || st.isSymbolicLink() || st.uid !== process.getuid() || (st.mode & 0o777) !== 0o600 || st.size > 100000) refuse('UNSAFE_PRIVATE_FILE');
  return JSON.parse(readFileSync(file, 'utf8'));
}
const writePrivate = (file, value) => writeFileSync(file, value, { flag: 'wx', mode: 0o600 });
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function display(result, mode) {
  const q = result?.question;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>PrepZii private question demo</title><style>body{font:18px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px;color:#18232e;background:#fffcf3}article{background:white;border:1px solid #ddd;padding:25px;border-radius:16px}li,p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#635831}</style><h1>Private JEE Main Physics demo</h1><p>${mode === 'demo-live' ? 'Real Gemini response — local numerical checks passed; human review required.' : mode === 'dry-run' ? 'OFFLINE FIXTURE — not real AI output.' : 'Waiting for separate execution approval. No question has been generated.'}</p>${q ? `<article><h2>Rotational Motion · Easy</h2><p>${escape(q.statement)}</p><ol type="A">${q.options.map(o => `<li>${escape(o)}</li>`).join('')}</ol><h2>Answer: ${'ABCD'[q.correctAnswer]}</h2><p>${escape(q.options[q.correctAnswer])}</p><h2>Explanation</h2>${q.explanation.map(x => `<p>${escape(x)}</p>`).join('')}<small>Model: ${escape(result.model)}. No PYQ reference pack or independent AI audit was used. Originality and syllabus relevance require human review. This is not a student test or an XP event.</small></article>` : ''}</html>`;
}
export function validateDemo(data) {
  const envelope = Envelope.parse(data);
  const checked = validateQuestionStructure(envelope.questions[0], config);
  if (!checked.passed) refuse(checked.code);
  if (envelope.calculation.family !== 'torque_acceleration') refuse('DEMO_CALCULATION_SCOPE');
  const numerical = verifyNumericalQuestion(checked.question, envelope.calculation);
  if (!numerical.passed || numerical.matchedOption !== checked.question.correctAnswer) refuse('DEMO_NUMERICAL_DISAGREEMENT');
  return { question: checked.question, numerical, model: DEMO.model, humanReviewRequired: true, independentAiAudit: false, originalityEstablished: false };
}
async function main() {
  assertEnvironment(process.env);
  const [action = '--prepare', suppliedRoot] = process.argv.slice(2);
  if (process.argv.length > 4 || !['--prepare', '--dry-run', '--execute'].includes(action)) refuse('INVALID_ARGUMENT');
  if (action === '--prepare') {
    if (suppliedRoot) refuse('PREPARE_REQUIRES_FRESH_ROOT');
    const root = mkdtempSync('/private/tmp/prepzii-gemini-pilot-');
    const schema = generationResponseSchema(config, ['Easy']);
    schema.properties.calculation = geminiSchema(NumericProofSchema); schema.required.push('calculation');
    const body = requestBody(`${GENERATE_QUESTIONS_PROMPT}\nFor this private first demo produce exactly ONE Easy Rotational Motion MCQ in torque_acceleration family. Include calculation proof with literal SI givens bound to the statement. No official references supplied: never claim PYQ provenance or certified originality. Return questions and calculation only.`, { configuration: config, count: 1, referencesSupplied: false }, schema);
    const plan = { version: 1, profile: DEMO.profile, authorizationId: 'first-real-demo', evidenceRoot: root, model: DEMO.model,
      allowanceNanoUsd: DEMO.allowanceNanoUsd, maxRequests: 1, policy: DEMO, maximumTokenCostNanoUsd: demoMaximumCost(), implementationHash: sourceHash(), requestHash: digest(body) };
    writePrivate(`${root}/plan.json`, JSON.stringify(plan, null, 2)); writePrivate(`${root}/request.json`, JSON.stringify(body));
    writePrivate(`${root}/display.html`, display(null, 'waiting'));
    console.log(JSON.stringify({ status: 'prepared_no_authorization', root, manifestHash: digest(plan), model: DEMO.model, maximumEstimatedUsd: demoMaximumCost() / 1e9, reservedUsd: 0.39, allowanceUsd: 0.40, liveRequests: 0 }));
    return;
  }
  rootGuard(suppliedRoot);
  const plan = readPrivate(`${suppliedRoot}/plan.json`), body = readPrivate(`${suppliedRoot}/request.json`);
  if (plan.evidenceRoot !== suppliedRoot || plan.profile !== DEMO.profile || plan.model !== DEMO.model || digest(plan.policy) !== digest(DEMO)
    || plan.implementationHash !== sourceHash() || plan.requestHash !== digest(body) || plan.allowanceNanoUsd !== DEMO.allowanceNanoUsd || plan.maxRequests !== 1) refuse('PLAN_CHANGED');
  const mode = action === '--execute' ? 'demo-live' : 'dry-run';
  let approval, io;
  if (mode === 'demo-live') {
    approval = readPrivate(`${suppliedRoot}/approval.json`);
    authorizeDemo(plan, approval, process.env);
    if (!process.env.GEMINI_API_KEY || /[\r\n]/.test(process.env.GEMINI_API_KEY)) refuse('DEVELOPMENT_GEMINI_KEY_REQUIRED');
    io = network.sender(() => authorizeDemo(plan, approval, process.env));
  }
  const log = ledger(suppliedRoot, mode === 'demo-live' ? plan.authorizationId : 'offline-check', { ...plan, mode });
  try {
    log.dispatch('generation-demo', body);
    let response;
    if (mode === 'demo-live') {
      response = await requestOnce({ body, key: process.env.GEMINI_API_KEY, model: DEMO.model, io });
      if (!response.returnedModelVersion || !response.returnedModelVersion.startsWith(DEMO.model)) refuse('MODEL_VERSION_UNCONFIRMED');
    } else {
      const q = candidate(); delete q.questionCount;
      response = { data: { questions: [q], calculation: { family: 'torque_acceleration', geometry: null, geometryEvidence: '', inputs: [
        { name: 'torque', value: 6, unit: 'Nm', sourceText: '6 Nm' }, { name: 'inertia', value: 2, unit: 'kgm^2', sourceText: '2 kgm^2' },
      ] } }, usage: { inputTokens: 100, outputTokens: 50, thoughtTokens: 0, totalTokens: 150 } };
    }
    log.ack(response.usage);
    const result = { ...validateDemo(response.data), returnedModelVersion: response.returnedModelVersion || null, mode, requestHash: digest(body) };
    log.artifact(result); writePrivate(`${log.dir}/review.html`, display(result, mode)); log.finish(true);
    console.log(JSON.stringify({ status: 'human_review_required', mode, display: `${log.dir}/review.html`, ...log.snapshot() }));
  } catch (e) { log.finish(false, e.safeCode || 'PRIVATE_DEMO_FAILURE'); console.log(JSON.stringify({ status: log.snapshot().pending ? 'held' : 'failed', ...log.snapshot() })); process.exitCode = 1; }
  finally { log.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(e => { console.error(JSON.stringify({ status: 'refused', code: e.safeCode || 'PRIVATE_DEMO_REFUSED' })); process.exitCode = 1; });
