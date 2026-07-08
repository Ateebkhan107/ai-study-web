import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET(){

  const {data,error}=await supabase
  .from("pyq_attempts")
  .select("*");


  if(error){

    return NextResponse.json(
      {error:error.message},
      {status:500}
    );

  }


  const users={};


  data.forEach((attempt)=>{


    if(!users[attempt.user_id]){

      users[attempt.user_id]={

        user_id:attempt.user_id,

        name:"Student",

        solved:0,

        correct:0,

        xp:0

      };

    }



    users[attempt.user_id].solved++;


    if(attempt.is_correct){

      users[attempt.user_id].correct++;

      users[attempt.user_id].xp += 15;

    }

    else{

      users[attempt.user_id].xp +=5;

    }



  });



  const leaderboard =
  Object.values(users)
  .map(user=>({

    ...user,

    accuracy:
    Math.round(
      (user.correct/user.solved)*100
    )

  }))
  .sort((a,b)=>b.xp-a.xp)
  .map((user,index)=>({

      rank:index+1,
      ...user

  }));


  return NextResponse.json(
    leaderboard
  );

}