import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const manifest=JSON.parse(read('public/fonts/manifest.json'));
test('all five original font families retain exact cached bytes and complete font-face descriptors',()=>{
 assert.deepEqual(manifest.families.map(f=>f.family),['Rajdhani','Space Grotesk','JetBrains Mono','Fraunces','Source Sans 3']);
 for(const family of manifest.families){
  const css=read(`src/app/fonts/${['Fraunces','Source Sans 3'].includes(family.family)?'landing':'root'}.module.css`);
  let i=0;
  for(const face of family.baseline_faces){
   const expected=face.replace(/url\("\.\.\/media\/[^"\)]+"\)/g,()=>`url("/fonts/${family.files[i++].sha256.slice(0,24)}.woff2")`);
   assert.ok(css.includes(expected),`Changed font-face metrics/weight/coverage for ${family.family}`);
  }
  assert.equal(i,family.files.length);assert.ok(css.includes(family.variable_declaration));
  for(const file of family.files){
   const bytes=readFileSync(new URL(file.file,root));assert.equal(bytes.subarray(0,4).toString(),'wOF2');
   assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);assert.equal(bytes.length,file.bytes);
  }
 }
});
test('font preloads preserve exactly the original Latin subset assets',()=>{
 const preloads=JSON.parse(read('src/app/fonts/preloads.json'));
 for(const group of ['root','landing']){
  const families=manifest.families.filter(f=>['Fraunces','Source Sans 3'].includes(f.family)===(group==='landing'));
  const expected=[...new Set(families.flatMap(f=>f.files.filter(x=>x.preload).map(x=>'/fonts/'+x.sha256.slice(0,24)+'.woff2')))].sort();
  assert.deepEqual(preloads[group],expected);
 }
});
test('build entries use local pinned CSS without Google font loader requests',()=>{
 for(const path of ['src/app/layout.js','src/app/page.js','src/app/global-error.js'])assert.doesNotMatch(read(path),/next\/font\/google|fonts\.googleapis\.com/);
});
test('each family has its official pinned license notice',()=>{
 const licenses=JSON.parse(read('public/fonts/licenses/manifest.json'));assert.equal(licenses.licenses.length,5);
 for(const item of licenses.licenses){
  const bytes=readFileSync(new URL(`public/fonts/licenses/${item.family_directory}-OFL.txt`,root));
  assert.match(bytes.toString(),/SIL OPEN FONT LICENSE/);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  assert.ok(item.source.includes(`/google/fonts/${licenses.repository_commit}/ofl/`));
 }
});
