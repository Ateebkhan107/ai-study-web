import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL,

  process.env.SUPABASE_SERVICE_ROLE_KEY

);



export async function POST(req){


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