"use client";

import { useEffect, useState } from "react";


export default function AdminNotifications(){


const [mounted,setMounted] = useState(false);


const [title,setTitle] = useState("");

const [message,setMessage] = useState("");

const [href,setHref] = useState("");

const [target,setTarget] = useState("ALL");

const [loading,setLoading] = useState(false);







useEffect(()=>{


setMounted(true);


},[]);







if(!mounted){


return null;


}









async function sendNotification(){



if(!title || !message){


alert("Fill title and message");

return;


}






setLoading(true);





try{



const res = await fetch(

"/api/admin/notifications",

{

method:"POST",


headers:{


"Content-Type":"application/json"


},




body:JSON.stringify({



title,


message,


// IMPORTANT
// empty = no redirect

href: href.trim() || null,


target



})



}


);









const data = await res.json();



console.log(

"Notification response:",

data

);









if(res.ok){



alert("Notification sent 🔔");



setTitle("");

setMessage("");

setHref("");

setTarget("ALL");



}


else{



alert("Failed");


console.log(data);



}




}



catch(error){


console.log(

"Send error:",

error

);


alert("Something went wrong");



}








setLoading(false);




}











return (


<div

className="
min-h-screen
flex
justify-center
pt-28
bg-white
dark:bg-[#050816]
"

>



<div className="w-[520px]">







<h1

className="
text-3xl
font-black
mb-10
"

>


PrepZii Admin 🚀


</h1>









<div className="space-y-5">









<input


value={title}


onChange={(e)=>setTitle(e.target.value)}


placeholder="Notification title"


className="
w-full
border
rounded-xl
p-4
bg-transparent
"


/>









<textarea


value={message}


onChange={(e)=>setMessage(e.target.value)}


placeholder="Message"


className="
w-full
border
rounded-xl
p-4
h-32
bg-transparent
"


/>











<input


value={href}


onChange={(e)=>setHref(e.target.value)}


placeholder="Redirect link (optional)  e.g /test"


className="
w-full
border
rounded-xl
p-4
bg-transparent
"


/>









<select


value={target}


onChange={(e)=>setTarget(e.target.value)}


className="
w-full
border
rounded-xl
p-4
font-bold
bg-transparent
"


>



<option value="ALL">


Everyone


</option>




<option value="JEE">


JEE Students


</option>





<option value="NEET">


NEET Students


</option>



</select>











<button


onClick={sendNotification}


disabled={loading}


className="
bg-black
text-white
px-8
py-4
rounded-xl
font-bold
disabled:opacity-50
"


>



{


loading


?


"Sending..."


:


"Send Notification"



}



</button>







</div>


</div>


</div>


);



}