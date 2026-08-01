import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth, currentUser } from "@clerk/nextjs/server";


export async function GET(request) {

try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track")?.toUpperCase() || "JEE";


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


    const {data:pyqAttemptsRaw,error:pyqError} =
    await supabaseAdmin
    .from("pyq_attempts")
    .select("*, pyq_questions(exam)")
    .eq("user_id",userId);

    if(pyqError) throw pyqError;

    // Filter pyq attempts by track
    const pyqAttempts = (pyqAttemptsRaw || []).filter(a => {
        const ex = a.pyq_questions?.exam;
        if (!ex) return false;
        return ex.toUpperCase().includes(track === "JEE" ? "JEE" : "NEET");
    });





    // ==========================
    // TEST ATTEMPTS
    // ==========================


    const {data:testAttemptsRaw,error:testError} =
    await supabaseAdmin
    .from("test_attempts")
    .select("*, tests(exam), user_answers(questions(exam))")
    .eq("user_id",userId);

    if(testError) throw testError;

    // Filter test attempts by track
    const testAttempts = (testAttemptsRaw || []).filter(a => {
        let attemptExam = null;
        if (a.tests?.exam) {
            attemptExam = a.tests.exam;
        } else if (a.user_answers && a.user_answers.length > 0) {
            const firstAns = a.user_answers.find(ans => ans.questions?.exam);
            if (firstAns) attemptExam = firstAns.questions.exam;
        }
        
        if (!attemptExam) return false;
        return attemptExam.toUpperCase().includes(track === "JEE" ? "JEE" : "NEET");
    });







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
    // RESPONSE
    // ==========================


    return NextResponse.json({

        totalAttempts,

        correctAnswers,


        wrongAnswers:
        totalAttempts-correctAnswers,


        accuracy,


        track,

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
