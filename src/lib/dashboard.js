import { supabase } from "./supabaseClient";


export async function getDashboardData(userId){


const [
goals,
tests,
xp,
study
] = await Promise.all([


supabase
.from("daily_goals")
.select("*")
.eq("user_id",userId),


supabase
.from("test_attempts")
.select("*")
.eq("user_id",userId),


supabase
.from("user_xp")
.select("*")
.eq("user_id",userId)
.single(),


supabase
.from("study_sessions")
.select("*")
.eq("user_id",userId)


]);





const totalStudy =
study.data?.reduce(
(a,b)=>a+(b.duration_minutes||0)
,0) || 0;



return {


goals:goals.data || [],


testsAttempted:
tests.data?.length || 0,


xp:
xp.data?.xp || 0,


accuracy:
xp.data?.correct_answers && xp.data?.questions_solved

?
Math.round(
(xp.data.correct_answers/
xp.data.questions_solved)*100
)

:
0,



studyHours:
Math.round(totalStudy/60)


};



}