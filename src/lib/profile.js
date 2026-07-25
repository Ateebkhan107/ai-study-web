import { supabase } from "@/lib/supabaseClient";


// =============================
// GET USER XP PROFILE
// =============================

export async function getUserXP(userId){


const { data, error } = await supabase

.from("user_xp")

.select("*")

.eq(
"user_id",
userId
)

.single();



if(error){


console.log(
"Profile XP error:",
error
);


return null;


}



return data;


}






// =============================
// GET USER GLOBAL RANK
// =============================

export async function getUserRank(userId){


const { data, error } = await supabase

.from("user_xp")

.select(
"user_id,xp"
)

.order(
"xp",
{
ascending:false
}
);



if(error){


console.log(
"Rank error:",
error
);


return null;


}




const index = data.findIndex(

user => user.user_id === userId

);



return index >= 0

?

index + 1

:

null;


}








// =============================
// LEVEL SYSTEM
// =============================

export function getLevelProgress(xp){



if(xp >= 10000){

return {

level:5,

badge:"Legend",

current:xp,

next:20000

};

}





if(xp >= 5000){

return {

level:4,

badge:"Master",

current:xp,

next:10000

};

}




if(xp >= 2000){

return {

level:3,

badge:"Pro",

current:xp,

next:5000

};

}




if(xp >= 500){

return {

level:2,

badge:"Challenger",

current:xp,

next:2000

};

}




return {

level:1,

badge:"Explorer",

current:xp,

next:500

};


}