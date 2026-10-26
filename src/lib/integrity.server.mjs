import "server-only";
export function integrityEnabled() { return process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED === "true"; }
export async function integrityCall(db, rpc, args) {
  if (!integrityEnabled()) throw Object.assign(new Error("Integrity contract awaits approved cutover"),{status:503});
  const {data,error}=await db.rpc(rpc,args);
  if(error) throw Object.assign(new Error(error.code==="PZ409"?"Saved activity conflicts with this request":"Activity persistence unavailable"),{status:error.code==="PZ409"?409:503,cause:error});
  return data;
}
export const initializeXp=(db,userId,name="Student")=>integrityCall(db,"prepzii_init_xp",{p_user:userId,p_name:name});
export const claimBadge=(db,userId,badgeId)=>integrityCall(db,"prepzii_claim_badge",{p_user:userId,p_badge:badgeId});
export const commitBank=(db,userId,sessionId,answers)=>integrityCall(db,"prepzii_commit_test",{
 p_user:userId,p_session:sessionId,p_answers:answers.map(({question_id,selected_option})=>({question_id,selected_option})),
});
