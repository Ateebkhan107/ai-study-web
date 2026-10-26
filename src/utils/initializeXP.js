"use server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { initializeXp, integrityEnabled } from "@/lib/integrity.server.mjs";
export async function initializeXP(userId,name="Student") {
 const {userId:actor}=await auth();
 if(!actor)throw Error("Unauthorized");
 if(userId!==actor)throw Error("Forbidden");
 if(!integrityEnabled())return {status:"pending_migration"};
 return initializeXp(supabaseAdmin,actor,name);
}
