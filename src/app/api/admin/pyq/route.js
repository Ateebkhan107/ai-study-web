import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";


// ==========================
// GET QUESTIONS
// ==========================

export async function GET(req){

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


const {searchParams}=new URL(req.url);


const exam =
searchParams.get("exam");


const subject =
searchParams.get("subject");


const year =
searchParams.get("year");


const search =
searchParams.get("search");



let query =
supabase
.from("pyq_questions")
.select("*")
.order(
"created_at",
{
ascending:false
}
)
.limit(50);




if(exam){


query=query.eq(
"exam",
exam
);


}



if(subject){


query=query.eq(
"subject",
subject
);


}



if(year){


query=query.eq(
"year",
year
);


}



if(search){


query=query.ilike(
"question",
`%${search}%`
);


}




const {data,error}=await query;



if(error){


return NextResponse.json(
{
error:"Failed loading PYQs"
},
{
status:500
}
);


}



return NextResponse.json({

success:true,

questions:data

});





}

catch(error){



return NextResponse.json(
{
error:"Server error"
},
{
status:500
}
);



}



}









// ==========================
// UPDATE QUESTION
// ==========================


export async function PATCH(req){

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


const body =
await req.json();



const {id,...updates}=body;




if(!id){


return NextResponse.json(
{
error:"Missing id"
},
{
status:400
}
);


}





const {error}=await supabase

.from("pyq_questions")

.update(
updates
)

.eq(
"id",
id
);





if(error){


return NextResponse.json(
{
error:"Update failed"
},
{
status:500
}
);


}




return NextResponse.json({

success:true

});





}

catch(error){



return NextResponse.json(
{
error:"Server error"
},
{
status:500
}
);


}


}









// ==========================
// DELETE QUESTION
// ==========================


export async function DELETE(req){

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


const {id}=await req.json();




if(!id){


return NextResponse.json(
{
error:"Missing id"
},
{
status:400
}
);


}




const {error}=await supabase

.from("pyq_questions")

.delete()

.eq(
"id",
id
);





if(error){


return NextResponse.json(
{
error:"Delete failed"
},
{
status:500
}
);


}




return NextResponse.json({

success:true

});






}

catch(error){



return NextResponse.json(
{
error:"Server error"
},
{
status:500
}
);



}



}