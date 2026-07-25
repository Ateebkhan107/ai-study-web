import { supabase } from "./supabaseClient";


// ==============================
// LEVEL SYSTEM
// ==============================

function calculateLevel(xp){

if(xp >= 10000){
return {
level:5,
badge:"Master"
};
}


if(xp >= 5000){
return {
level:4,
badge:"Expert"
};
}


if(xp >= 2000){
return {
level:3,
badge:"Achiever"
};
}


if(xp >= 500){
return {
level:2,
badge:"Challenger"
};
}



return {
level:1,
badge:"Explorer"
};


}



// ==============================
// ADD XP FUNCTION
// ==============================

export async function addXP(
userId,
amount,
name="Student"
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



const levelInfo =
calculateLevel(newXP);




// update / create xp row

const {error:updateError}=await supabase

.from("user_xp")

.upsert(

{

user_id:userId,


name:


data?.name || name,


xp:newXP,


level:levelInfo.level,


badge:levelInfo.badge

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



return {

xp:newXP,

...levelInfo

};


}