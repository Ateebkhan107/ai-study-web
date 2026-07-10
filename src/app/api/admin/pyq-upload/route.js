import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";



// =============================
// CSV PARSER
// =============================

function parseCSV(text) {

  const lines = text
    .split("\n")
    .filter(line => line.trim() !== "");


  const headers = lines[0]
    .split(",")
    .map(h => h.trim());


  return lines.slice(1).map(line => {


    const values = line.match(
      /(".*?"|[^",]+)(?=\s*,|\s*$)/g
    ) || [];


    const row = {};


    headers.forEach((header,index)=>{


      let value = values[index] || null;


      if(value){

        value = value
          .replace(/^"|"$/g,"")
          .trim();

      }


      row[header] =
      value === ""
      ?
      null
      :
      value;


    });


    return row;


  });


}





// =============================
// FORMAT QUESTION DATA
// =============================

function formatQuestion(row){


return {


exam:
row.exam,


exam_type:
row.exam_type,


year:
row.year
?
Number(row.year)
:
null,



attempt:
row.attempt,


shift:
row.shift,


paper_code:
row.paper_code,





subject:
row.subject,


chapter:
row.chapter,






question_type:
row.question_type || "MCQ",



question:
row.question,


question_image:
row.question_image,






option_a:
row.option_a,


option_b:
row.option_b,


option_c:
row.option_c,


option_d:
row.option_d,





option_a_image:
row.option_a_image,


option_b_image:
row.option_b_image,


option_c_image:
row.option_c_image,


option_d_image:
row.option_d_image,







correct_option:
row.correct_option,





correct_options:

row.correct_options

?

row.correct_options
.split(",")
.map(
x=>x.trim()
)

:

null,







numerical_answer:

row.numerical_answer

?

Number(row.numerical_answer)

:

null,




numerical_min:

row.numerical_min

?

Number(row.numerical_min)

:

null,





numerical_max:

row.numerical_max

?

Number(row.numerical_max)

:

null,






explanation:
row.explanation,



explanation_image:
row.explanation_image,







marks_positive:

row.marks_positive

?

Number(row.marks_positive)

:

4,




marks_negative:

row.marks_negative

?

Number(row.marks_negative)

:

0



};


}








// =============================
// UPLOAD PYQ CSV
// =============================

export async function POST(req){


const admin =
await isAdmin();


if(!admin){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}


try{


const formData =
await req.formData();



const file =
formData.get("file");





if(!file){


return NextResponse.json(

{
error:"CSV file missing"
},

{
status:400
}

);


}






const csvText =
await file.text();




const parsedRows =
parseCSV(csvText);






if(parsedRows.length===0){


return NextResponse.json(

{
error:"CSV empty"
},

{
status:400
}

);


}






const questions =
parsedRows.map(
formatQuestion
);








const {error}=await supabase


.from("pyq_questions")


.insert(
questions
);






if(error){



console.error(
"PYQ upload error:",
error.message
);



return NextResponse.json(

{
error:"Failed uploading questions"
},

{
status:500
}

);


}








return NextResponse.json({

success:true,


count:
questions.length


});





}

catch(error){



console.error(
"Upload crashed:",
error
);




return NextResponse.json(

{
error:"Upload failed"
},

{
status:500
}


);



}



}