import { supabase } from "./supabaseClient";


// =============================
// GET GLOBAL LEADERBOARD
// =============================

export async function getLeaderboard(){


const {data,error}=await supabase

.from("user_xp")

.select(`
id,
user_id,
name,
xp,
level,
badge
`)

.order(
"xp",
{
ascending:false
}

)

.limit(50);




if(error){


console.log(
"Leaderboard error",
error
);


return [];

}



return data || [];


}