import { supabase } from "@/lib/supabase";


// convert frontend names → database names

function fixSubject(subject){


if(subject==="Maths"){

return "Mathematics";

}



if(subject==="Biology"){

return [

"Botany",

"Zoology"

];

}



return subject;


}


// difficulty converter

function fixDifficulty(difficulty){

if(!difficulty) return "";

return (
difficulty.charAt(0).toUpperCase()
+
difficulty.slice(1).toLowerCase()
);

}



// ratio

function getDistribution(exam,total){


if(exam==="NEET"){


const phy =
Math.floor(total*0.25);


const chem =
Math.floor(total*0.25);


const botany =
Math.floor(total*0.25);


const zoology =
total
- phy
- chem
- botany;



return {

Physics:phy,

Chemistry:chem,

Botany:botany,

Zoology:zoology

};


}



// JEE


const each=Math.floor(total/3);


return {

Physics:each,

Chemistry:each,

Mathematics:
total-(each*2)

};


}









export async function getQuestions({

exam,
subject,
chapter,
difficulty,
limit=20

}){


try{


console.log("FETCH PARAMS:",{

exam,
subject,
chapter,
difficulty,
limit

});



let finalQuestions=[];





// selected subjects


let subjects=[];



const isAllSubjects =
!subject ||
subject.trim().toLowerCase()==="all" ||
subject.trim().toLowerCase()==="mixed subjects";



if(!isAllSubjects){

subjects =
subject
.split(",")
.map(s=>fixSubject(s.trim()))
.flat();

}

else{


subjects =
Object.keys(
getDistribution(exam,limit)
);


}








for(const sub of subjects){





let subjectLimit = limit;




// apply ratio only if multiple subjects


if(subjects.length>1){


subjectLimit =
getDistribution(
exam,
limit
)[sub];


}







let query=supabase


.from("questions")


.select("*")


.eq(
"exam",
exam
);





if(
sub==="Botany" ||
sub==="Zoology"
){
query=query
.eq(
"subject",
"Biology"
)
.eq(
"biology_type",
sub
);
}
else{
query=query.eq(
"subject",
sub
);
}








// chapters


const isAllChapters =
!chapter ||
chapter.trim().toLowerCase()==="all" ||
chapter.trim().toLowerCase()==="all chapters";



if(!isAllChapters){


const chapters = chapter

.split(",")

.map(c=>c.trim());



query=query.in(

"chapter",

chapters

);


}









// difficulty


if(

difficulty &&

difficulty.toLowerCase()!=="mixed"

){


query=query.eq(

"difficulty",

fixDifficulty(difficulty)

);


}








const {data,error}=await query;







if(error){


console.log(
"SUPABASE ERROR:",
error
);


continue;


}








finalQuestions.push(

...(data || [])

.slice(

0,

subjectLimit

)

);



}









console.log(

"TOTAL QUESTIONS FOUND:",

finalQuestions.length

);










return finalQuestions.map(q=>({



id:q.id,


exam:q.exam,


subject:q.subject,


chapter:q.chapter,


difficulty:q.difficulty,



text:q.question_text,



question_image:q.question_image,





options:[

q.option_a,

q.option_b,

q.option_c,

q.option_d

],






option_images:[

q.option_a_image,

q.option_b_image,

q.option_c_image,

q.option_d_image

],







correct:

["A","B","C","D"]

.indexOf(

q.correct_option

),







explanation:

q.explanation,



explanation_image:

q.explanation_image,



marks:

q.marks || 4,



negative_marks:

q.negative_marks || -1




}));







}

catch(err){


console.log(
"Question error:",
err
);


return [];


}


}