import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


import { auth } from "@clerk/nextjs/server";

export async function GET(request) {

  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track")?.toUpperCase() || "JEE";
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rawData, error } = await supabase
      .from("pyq_attempts")
      .select("*, pyq_questions(exam, subject)")
      .eq("user_id", userId);

    if (error) {

      console.log(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );

    }


    const data = (rawData || []).filter(a => {
        const ex = a.pyq_questions?.exam;
        if (!ex) return false;
        return ex.toUpperCase().includes(track === "JEE" ? "JEE" : "NEET");
    });

    const totalAttempts = data.length;


    const correctAnswers = data.filter(
      (attempt) => attempt.is_correct === true
    ).length;


    const accuracy =
      totalAttempts > 0
        ? Math.round(
            (correctAnswers / totalAttempts) * 100
          )
        : 0;



    // Subjects Calculation
    const subjectMap = {};
    data.forEach(item => {
      const subject = item.pyq_questions?.subject;
      if (subject) {
        if (!subjectMap[subject]) subjectMap[subject] = { subject, solved: 0, correct: 0 };
        subjectMap[subject].solved++;
        if (item.is_correct) subjectMap[subject].correct++;
      }
    });
    const subjects = Object.values(subjectMap).map(s => ({
      subject: s.subject,
      solved: s.solved,
      accuracy: Math.round((s.correct / s.solved) * 100)
    }));

    // Streak Calculation
    const allDates = data.map(a => new Date(a.attempted_at || a.created_at));
    allDates.sort((a, b) => b - a);
    let streak = 0;
    if (allDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const uniqueDays = [...new Set(allDates.map(d => {
        const copy = new Date(d);
        copy.setHours(0, 0, 0, 0);
        return copy.getTime();
      }))].sort((a, b) => b - a);
      if (uniqueDays.length > 0) {
        const mostRecentDay = new Date(uniqueDays[0]);
        if (mostRecentDay.getTime() === today.getTime() || mostRecentDay.getTime() === yesterday.getTime()) {
          streak = 1;
          let expectedPrevDay = new Date(mostRecentDay);
          expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
          for (let i = 1; i < uniqueDays.length; i++) {
            if (uniqueDays[i] === expectedPrevDay.getTime()) {
              streak++;
              expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
            } else { break; }
          }
        }
      }
    }

    return NextResponse.json({
      attempted: totalAttempts,
      correctAnswers,
      wrongAnswers: totalAttempts - correctAnswers,
      accuracy,
      subjects,
      streak
    });


  } catch (err) {


    return NextResponse.json(
      {
        error: err.message
      },
      {
        status: 500
      }
    );


  }

}