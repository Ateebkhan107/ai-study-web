import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";


export async function GET() {

try {


    // ==========================
    // CLERK USER
    // ==========================

    const { userId } = await auth();


    if (!userId) {

        return NextResponse.json(
            {
                error:"Unauthorized"
            },
            {
                status:401
            }
        );

    }



    const user =
    await currentUser();



    const username =
    user?.firstName ||
    user?.username ||
    "Student";





    // ==========================
    // PYQ ATTEMPTS
    // ==========================


    const {data:pyqAttempts,error:pyqError} =
    await supabase
    .from("pyq_attempts")
    .select("*")
    .eq("user_id",userId);



    if(pyqError)
    throw pyqError;





    // ==========================
    // TEST ATTEMPTS
    // ==========================


    const {data:testAttempts,error:testError} =
    await supabase
    .from("test_attempts")
    .select("*")
    .eq("user_id",userId);



    if(testError)
    throw testError;







    // ==========================
    // CALCULATIONS
    // ==========================


    const pyqSolved =
    pyqAttempts.length;


    const testsAttempted =
    testAttempts.length;



    const totalAttempts =
    pyqSolved + testsAttempted;




    const pyqCorrect =
    pyqAttempts.filter(
        item=>item.is_correct
    ).length;




    const testCorrect =
    testAttempts.filter(
        item=>item.is_correct
    ).length;




    const correctAnswers =
    pyqCorrect + testCorrect;




    const accuracy =
    totalAttempts > 0

    ? Math.round(
        (correctAnswers/totalAttempts)*100
    )

    : 0;





    // ==========================
    // XP FORMULA
    // ==========================


    const xp =
    (correctAnswers * 10)
    +
    (totalAttempts * 2);








    // ==========================
    // UPDATE USER XP
    // ==========================


    const {error:xpError} =
    await supabase
    .from("user_xp")
    .upsert(

        {

            user_id:userId,


            name:username,


            xp:xp,


            pyq_solved:pyqSolved,


            correct_answers:correctAnswers,


            accuracy:accuracy


        },


        {
            onConflict:"user_id"
        }


    );



    if(xpError)
    throw xpError;







    // ==========================
    // RESPONSE
    // ==========================


    return NextResponse.json({

        totalAttempts,

        correctAnswers,


        wrongAnswers:
        totalAttempts-correctAnswers,


        accuracy,


        xp,


        pyqSolved,


        testsAttempted,


        topics:[]

    });






}catch(error){



console.log(
"ANALYTICS ERROR:",
error
);



return NextResponse.json(

{
    error:error.message
},

{
    status:500
}

);



}


}