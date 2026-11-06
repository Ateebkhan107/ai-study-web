import test from 'node:test';
import assert from 'node:assert/strict';
import { streamZiResponse } from './provider.js';
const originalKey=process.env.GEMINI_API_KEY;
const originalModel=process.env.ZI_AI_MODEL;
test.beforeEach(()=>{process.env.GEMINI_API_KEY='synthetic-stream-key';process.env.ZI_AI_MODEL='synthetic-stream-model';});
test('real installed SDK establishes provider HTTP stream before returning to accounting',async t=>{
  const events=[];
  const controller=new AbortController();
  t.mock.method(globalThis,'fetch',async(_url,options)=>{
    events.push('http');assert.ok(options.signal instanceof AbortSignal);
    return new Response('data: {"candidates":[{"content":{"parts":[{"text":"A concept explanation."}]},"finishReason":"STOP"}]}\n\n',{headers:{'Content-Type':'text/event-stream'}});
  });
  const stream=await streamZiResponse({messages:[{role:'user',content:'Explain a concept'}],systemPrompt:'Tutor',signal:controller.signal,beforeDispatch:async()=>events.push('dispatch')});
  assert.deepEqual(events,['dispatch','http']);
  let text='';for await(const chunk of stream)text+=chunk.text;
  assert.equal(text,'A concept explanation.');
});
test('real SDK startup rejection does not return a stream for consumption',async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({error:{code:400,message:'Synthetic bad request',status:'INVALID_ARGUMENT'}},{status:400});});
  await assert.rejects(streamZiResponse({messages:[{role:'user',content:'Explain'}],systemPrompt:'Tutor',signal:new AbortController().signal,beforeDispatch:async()=>{}}));
  assert.equal(calls,1);
});
test.after(()=>{if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey;if(originalModel===undefined)delete process.env.ZI_AI_MODEL;else process.env.ZI_AI_MODEL=originalModel;});
