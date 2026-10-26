import {registerHooks} from 'node:module';
const original=new URL('./pg176Lab.mjs',import.meta.url).href;
const release=new URL('./pg176ReleaseLab.mjs',import.meta.url).href;
if(process.env.ZI_PHASE5_RELEASE_CONTRACT_LOCAL!=='1')throw Error('Release test hook requires explicit local opt-in');
registerHooks({resolve(specifier,context,next){
 const resolved=next(specifier,context);return resolved.url===original?{...resolved,url:release}:resolved;
}});
