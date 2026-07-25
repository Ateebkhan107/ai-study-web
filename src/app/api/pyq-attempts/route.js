import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { addXP } from "@/lib/xp";


export async function POST(req) {


try {


const { userId } = await auth();


if(!userId){

return new NextResponse(
"Unauthorized",
{status:401}
);

}



const user =
await currentUser();



const name =
user?.firstName ||
user?.username ||
"Student";





const body =
await req.json();





// save attempt

const {error} =
await supabase
.from("pyq_attempts")
.insert({

user_id:userId,

question_id:
body.question_id,


selected_option:
body.selected_option,


is_correct:
body.is_correct

});



if(error)
throw error;







// get all attempts


const {data:attempts} =
await supabase
.from("pyq_attempts")
.select("*")
.eq(
"user_id",
userId
);




const solved =
attempts.length;


const correct =
attempts.filter(
a=>a.is_correct
).length;



const accuracy =
Math.round(
(correct/solved)*100
);



// XP RULE - only calculate for THIS attempt
const attemptXP = body.is_correct ? 10 : 2;

// update leaderboard centrally
const xpResult = await addXP(
  userId, 
  attemptXP, 
  name, 
  false, 
  {
    pyq_solved: solved,
    correct_answers: correct,
    accuracy
  }
);

return NextResponse.json({
  success:true,
  xp: xpResult?.xp || attemptXP
});






}

catch(err){


console.log(err);



return NextResponse.json(
{
error:err.message
},
{
status:500
}
);


}


}