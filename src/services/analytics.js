import { supabase } from "@/lib/supabase";


export async function getUserAnalytics(userId){


/* =========================
   TEST ATTEMPTS ANALYTICS
========================= */


const {data:attempts,error}=await supabase
.from("test_attempts")
.select("*")
.eq("user_id",userId)
.order("created_at",{
ascending:true
});


if(error) throw error;




const totalTests = attempts.length;




const totalScore =
attempts.reduce(
(sum,test)=>
sum + (test.score || 0),
0
);




const totalMarks =
attempts.reduce(
(sum,test)=>{


// support old attempts
const marks =
test.total_marks ||
((test.total_questions || 0) * 4);


return sum + marks;


},0);





const averageScore =
totalMarks > 0
?
Math.round(
(totalScore / totalMarks) * 100
)
:
0;






const totalCorrect =
attempts.reduce(
(sum,test)=>
sum + (test.correct_answers || 0),
0
);




const totalAttempted =
attempts.reduce(
(sum,test)=>
sum + (test.attempted || 0),
0
);




const accuracy =
totalAttempted > 0
?
Math.round(
(totalCorrect / totalAttempted) * 100
)
:
0;








/* =========================
   PERFORMANCE TREND
========================= */


const performanceTrend =
attempts.map((test,index)=>{


let maxMarks =
test.total_marks;



// fallback for previous tests
if(!maxMarks){

maxMarks =
(test.total_questions || 0) * 4;

}




const percentage =
maxMarks > 0
?
Math.round(
((test.score || 0) / maxMarks) * 100
)
:
0;




return {

label:`Test ${index + 1}`,

score:percentage

};



});








/* =========================
   WEAK TOPICS ANALYTICS
========================= */



const {
data:answers,
error:answerError
}
=
await supabase
.from("user_answers")
.select(`

is_correct,

questions(

subject,

chapter

)

`);





if(answerError) throw answerError;






const chapterMap={};




answers.forEach((item)=>{


const chapter =
item.questions?.chapter;



const subject =
item.questions?.subject;



if(!chapter) return;





if(!chapterMap[chapter]){


chapterMap[chapter]={


topic:chapter,

subject:subject,

total:0,

correct:0


};


}





chapterMap[chapter].total++;




if(item.is_correct){


chapterMap[chapter].correct++;


}




});







const weakTopics =
Object.values(chapterMap)
.map((chapter)=>{


const chapterAccuracy =
chapter.total > 0
?
Math.round(
(chapter.correct / chapter.total) * 100
)
:
0;





return {


topic:chapter.topic,


subject:chapter.subject,


accuracy:chapterAccuracy,



severity:

chapterAccuracy < 50

? "critical"

:

chapterAccuracy < 70

? "warn"

:

"good"



};



})


// weakest first
.sort(
(a,b)=>a.accuracy - b.accuracy
);








console.log(
"ANALYTICS DATA 👉",
{

totalTests,

averageScore,

accuracy,

performanceTrend,

weakTopics

}

);








return {


totalTests,


averageScore,


accuracy,


performanceTrend,


weakTopics



};



}