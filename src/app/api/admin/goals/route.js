import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

const supabase=createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);




// ========================
// GET ALL GOALS
// ========================

export async function GET(){


const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}

const {data,error}=await supabase

.from("daily_goals")

.select("*")

.order(
"created_at",
{
ascending:false
}
);




if(error){


return NextResponse.json(
{
success:false,
error:error.message
},
{
status:500
}
);


}




return NextResponse.json(
{
success:true,
goals:data
}
);


}







// ========================
// CREATE GOAL
// ========================


export async function POST(req){

const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}

try{


const body=await req.json();


const {

title,
description,
goal_type,
target,
target_value,
xp

}=body;




const {data,error}=await supabase


.from("daily_goals")


.insert({

title,

description:description || "",

goal_type,

target:target || "ALL",

target_value:Number(target_value),

xp:Number(xp),

is_active:true


})


.select();





if(error){

throw error;

}




return NextResponse.json(
{
success:true,
goal:data
}
);



}

catch(error){


return NextResponse.json(
{
success:false,
error:error.message
},
{
status:500
}
);


}


}









// ========================
// UPDATE GOAL
// ========================


export async function PATCH(req){

const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}

try{


const body=await req.json();


const {

id,

target_value,

xp,

is_active


}=body;






const updateData={};



if(target_value!==undefined){

updateData.target_value=Number(target_value);

}



if(xp!==undefined){

updateData.xp=Number(xp);

}




if(is_active!==undefined){

updateData.is_active=is_active;

}






const {error}=await supabase


.from("daily_goals")


.update(updateData)


.eq(
"id",
id
);





if(error){

throw error;

}







return NextResponse.json({

success:true

});





}

catch(error){


return NextResponse.json(
{
success:false,
error:error.message
},
{
status:500
}
);


}



}









// ========================
// DELETE GOAL
// ========================


export async function DELETE(req){

const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}

try{


const {

id

}=await req.json();





const {error}=await supabase


.from("daily_goals")


.delete()


.eq(
"id",
id
);





if(error){

throw error;

}





return NextResponse.json({

success:true

});




}


catch(error){


return NextResponse.json(
{
success:false,
error:error.message
},
{
status:500
}
);


}



}