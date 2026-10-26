// Offline font specimen comparison; no application server or user account.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire('/Users/ateebmazhar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');const sharp=require('sharp');
const root=new URL('../../../',import.meta.url).pathname;
const evidence='/private/tmp/prepzii-pg176.ujiylN/evidence/release-prep-20261022/font-visual';mkdirSync(evidence,{recursive:true,mode:0o700});
const manifest=JSON.parse(readFileSync(`${root}/public/fonts/manifest.json`));
const baseCss=manifest.families.flatMap(f=>f.baseline_faces).join('\n').replaceAll('url("../media/','url("'+pathToFileURL(`${root}/.next/dev/static/media/`).href);
const newCss=['root','landing'].map(g=>readFileSync(`${root}/src/app/fonts/${g}.module.css`,'utf8')).join('\n').replaceAll('url("/fonts/','url("'+pathToFileURL(`${root}/public/fonts/`).href);
const samples=manifest.families.flatMap(f=>(f.family==='Rajdhani'?[500,600,700]:f.family==='Space Grotesk'?[300,400,500,600,700]:[200,400,700]).map(weight=>`<div class="sample" style="font-family:'${f.family}';font-weight:${weight}">${f.family} ${weight}: PrepZii — JEE &amp; NEET, Momentum Δp = 0, ₹123.45, हिन्दी</div>`)).join('');
for(const [name,css] of [['baseline',baseCss],['vendored',newCss]])writeFileSync(`${evidence}/${name}.html`,`<!doctype html><meta charset="utf-8"><style>${css}\nbody{margin:20px;background:white;color:#122033}.sample{font-size:26px;line-height:1.5;margin-bottom:12px}</style>${samples}`,{flag:'wx',mode:0o600});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files','--disable-background-networking','--host-resolver-rules=MAP * ~NOTFOUND']});
const result=[];
try{
 for(const width of [1200,390]){
  const variants=[];
  for(const name of ['baseline','vendored']){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});let external=0;const errors=[];
   await page.route('**/*',route=>{if(/^(file|data):/.test(route.request().url()))return route.continue();external++;return route.abort();});
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(`${evidence}/${name}.html`).href);await page.evaluate(()=>document.fonts.ready);
   const data=await page.evaluate(()=>({rectangles:[...document.querySelectorAll('.sample')].map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})),loaded:[...new Set([...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replaceAll('"','')))].sort()}));
   for(const family of manifest.families)assert.ok(data.loaded.includes(family.family),`Font did not load: ${family.family}`);
   assert.equal(external,0);assert.deepEqual(errors,[]);
   const screenshot=`${evidence}/${name}-${width}.png`;await page.screenshot({path:screenshot,fullPage:true});
   variants.push({data,pixels:await sharp(screenshot).raw().toBuffer({resolveWithObject:true})});await page.close();
  }
  assert.deepEqual(variants[0].data,variants[1].data);assert.deepEqual(variants[0].pixels.info,variants[1].pixels.info);
  let different=0;for(let i=0;i<variants[0].pixels.data.length;i++)if(variants[0].pixels.data[i]!==variants[1].pixels.data[i])different++;
  assert.equal(different,0);result.push({width,loaded_families:manifest.families.length,different_channels:different,geometry_equal:true,external_requests:0});
 }
 writeFileSync(`${evidence}/results.json`,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
}finally{await browser.close();}
