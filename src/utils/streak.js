"use server";
import {auth} from "@clerk/nextjs/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {reconcileGoalRewards} from "@/lib/goalRewards.mjs";
// Streaks advance only in verified source transactions, never from a client ping.
export async function updateStreak(userId) {
 const {userId:actor}=await auth();
 if(!actor)throw Error("Unauthorized");
 if(actor!==userId)throw Error("Forbidden");
 return reconcileGoalRewards(supabaseAdmin,actor);
}
