import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function POST(req){


const body = await req.json();


const {

user_id,

name,

xp,

correct

}=body;



const {data:user}=await supabase
.from("user_xp")
.select("*")
.eq("user_id",user_id)
.single();





if(user){


const solved =
user.pyq_solved + 1;


const correctCount =
correct
?
user.correct_answers + 1
:
user.correct_answers;



await supabase
.from("user_xp")
.update({

xp:user.xp + xp,

pyq_solved:solved,

correct_answers:correctCount,


accuracy:
Math.round(
(correctCount/solved)*100
)


})
.eq("user_id",user_id);



}



else{


await supabase
.from("user_xp")
.insert({

user_id,

name:name || "Student",

xp,

pyq_solved:1,

correct_answers:
correct ? 1 : 0,

accuracy:
correct ? 100 : 0


});



}




return NextResponse.json({

success:true

});


}