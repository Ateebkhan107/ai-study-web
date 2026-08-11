import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";



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
error:"No file"
},
{
status:400
}
);


}



const bytes =
await file.arrayBuffer();



const buffer =
Buffer.from(bytes);




const fileName =
`admin-uploads/${Date.now()}-${file.name}`;





const {error}=await supabaseAdmin
.storage
.from("pyq-images")
.upload(
fileName,
buffer,
{
contentType:file.type
}
);





if(error){


console.log(
"Image upload error",
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





const {data}=supabaseAdmin
.storage
.from("pyq-images")
.getPublicUrl(
fileName
);





return NextResponse.json({

success:true,

url:data.publicUrl

});




}

catch(error){


// console.log(error);


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
