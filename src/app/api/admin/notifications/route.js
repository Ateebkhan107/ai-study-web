import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";



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


const body = await req.json();



const {
  title,
  message,
  href,
  target
}=body;

const stream = target || "ALL";





if(!title || !message){


return NextResponse.json(

{
error:"Missing fields"
},

{
status:400
}

);


}









const {data,error}=await supabase


.from("notifications")


.insert({


user_id:"all",


type:"announcement",


title:title,


message:message,


href:href || "/dashboard",


// JEE / NEET FILTER

stream: stream,


is_read:false



})


.select();








if(error){


console.log(

"Notification insert failed:",

error

);




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










return NextResponse.json({


success:true,


notification:data


});








}


catch(error){



return NextResponse.json(

{

success:false,

error:error.message

},

{

status:500}

);



}



}
