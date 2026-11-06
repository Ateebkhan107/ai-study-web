import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const state = { events: [], constructorError: false };
globalThis.__ziStreamAccounting = state;
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === '@google/genai') return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent(`export class GoogleGenAI { constructor(){const s=globalThis.__ziStreamAccounting;s.events.push('initialize');if(s.constructorError)throw Error('Initialization failed');this.models={generateContentStream:async()=>{s.events.push('provider');return (async function*(){yield {text:'response'}})();}};}}`)}` };
  return next(specifier,context);
} });
const { streamZiResponse } = await import('./provider.js');
const originalKey = process.env.GEMINI_API_KEY;
test.beforeEach(()=>{state.events=[];state.constructorError=false;process.env.GEMINI_API_KEY='synthetic-not-a-real-key';});
const request = extra => ({messages:[{role:'user',content:'Explain a concept'}],systemPrompt:'Tutor',signal:new AbortController().signal,
  beforeDispatch:async()=>state.events.push('dispatch'),...extra});
test('missing provider configuration never enters dispatch accounting',async()=>{
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(streamZiResponse(request()),{code:'ZI_PROVIDER_NOT_CONFIGURED'});
  assert.deepEqual(state.events,[]);
});
test('SDK constructor failure never enters dispatch accounting',async()=>{
  state.constructorError=true;await assert.rejects(streamZiResponse(request()),/Initialization failed/);
  assert.deepEqual(state.events,['initialize']);
});
test('already-cancelled request cannot dispatch or debit',async()=>{
  await assert.rejects(streamZiResponse(request({signal:AbortSignal.abort()})),{name:'AbortError'});
  assert.deepEqual(state.events,['initialize']);
});
test('failed durable dispatch prevents all Gemini calls and fallbacks',async()=>{
  await assert.rejects(streamZiResponse(request({beforeDispatch:async()=>{throw Error('Accounting unavailable');}})),/Accounting unavailable/);
  assert.deepEqual(state.events,['initialize']);
});
test('provider invocation follows successful initialization and durable dispatch',async()=>{
  const stream=await streamZiResponse(request());
  assert.deepEqual(state.events,['initialize','dispatch','provider']);
  assert.equal((await stream.next()).value.text,'response');
});
test.after(()=>{hooks.deregister();delete globalThis.__ziStreamAccounting;if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey;});
