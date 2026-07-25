import { supabase } from "./supabaseClient";
import { evaluateUserBadges } from "./badgeEngine";


// ==============================
// LEVEL SYSTEM
// ==============================

import { getLevelFromXP } from "@/lib/levelEngine";

// Helper for title badge based on level
function getLevelBadge(level) {
  if (level >= 10) return "Grandmaster";
  if (level >= 8) return "Master";
  if (level >= 6) return "Elite";
  if (level >= 4) return "Expert";
  if (level >= 2) return "Challenger";
  return "Explorer";
}



// ==============================
// ADD XP FUNCTION
// ==============================

export async function addXP(
userId,
amount,
name="Student",
skipBadgeEval = false,
stats = {}
){


if(!userId || amount<=0){
return;
}


// get current user xp

const {data,error}=await supabase

.from("user_xp")

.select("*")

.eq(
"user_id",
userId
)

.single();




if(error && error.code !== "PGRST116"){

console.log(
"XP FETCH ERROR",
error
);

return;

}





let newXP =
(data?.xp || 0)
+
amount;



const levelStats = getLevelFromXP(newXP);
const badgeTitle = getLevelBadge(levelStats.currentLevel);

// update / create xp row
const {error:updateError}=await supabase
.from("user_xp")
.upsert(
{
user_id:userId,
name: data?.name || name,
xp:newXP,
level:levelStats.currentLevel,
badge:badgeTitle,
...stats

},

{

onConflict:"user_id"

}

);




if(updateError){

console.log(
"XP UPDATE ERROR",
updateError
);

}


// Evaluate badges asynchronously if not skipped
if (!skipBadgeEval) {
  evaluateUserBadges(userId).catch(console.error);
}

return {
xp:newXP,
level: levelStats.currentLevel,
badge: badgeTitle
};


}