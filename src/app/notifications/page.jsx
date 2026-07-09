"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Bell, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";



export default function NotificationsPage(){


const router = useRouter();

const {user}=useUser();


const [notifications,setNotifications]=useState([]);

const [track,setTrack]=useState("JEE");






// LOAD TRACK


useEffect(()=>{


const cookie = document.cookie

.split("; ")

.find(

row=>row.startsWith("prepzii_track=")

);



if(cookie){


setTrack(

cookie

.split("=")[1]

.toUpperCase()

);


}



},[]);









useEffect(()=>{


if(user){


loadNotifications();


}


},[user,track]);









async function loadNotifications(){



const {data,error}=await supabase


.from("notifications")


.select("*")


.or(

`user_id.eq.${user.id},user_id.eq.all`

)


.in(

"target",

[

track,

"ALL"

]

)


.order(

"created_at",

{

ascending:false

}

);






if(error){


console.log(

"Notification fetch error:",

error

);


return;


}






setNotifications(data || []);



}











// OPEN NOTIFICATION



async function openNotification(item){



const {error}=await supabase


.from("notifications")


.update({

is_read:true

})


.eq(

"id",

item.id

);






if(error){


console.log(

"Read update failed:",

error

);


return;


}








// update UI


setNotifications(

current =>

current.map(

n =>

n.id===item.id

?

{

...n,

is_read:true

}

:

n


)


);








// 🔥 redirect only if href exists


if(item.href){


router.push(item.href);


}



}











// CLEAR ALL



async function clearAll(){



const {error}=await supabase


.from("notifications")


.delete()


.or(

`user_id.eq.${user.id},user_id.eq.all`

);






if(error){


console.log(

"Clear failed:",

error

);


return;


}






setNotifications([]);



}









return(


<div

className="
min-h-screen
bg-[#fafafa]
dark:bg-[#050816]
px-8
py-12
"

>



<div

className="
max-w-3xl
mx-auto
"

>









{/* HEADER */}


<div

className="
flex
items-center
justify-between
mb-8
"

>



<div>



<p

className="
tracking-[4px]
text-[11px]
font-bold
text-gray-400
uppercase
"

>

PrepZii Updates

</p>






<h1

className="
text-2xl
font-black
mt-2
flex
items-center
gap-2
"

>

Notifications 🔔


</h1>






<p

className="
text-gray-400
text-xs
mt-2
"

>


{track} updates, tests and announcements


</p>



</div>









{


notifications.length>0 &&


<button


onClick={clearAll}


className="
flex
items-center
gap-2
bg-red-500
hover:bg-red-600
transition
text-white
px-4
py-2
rounded-xl
text-xs
font-bold
shadow-md
"

>


<Trash2 size={14}/>


Clear All


</button>


}





</div>









{/* LIST */}



<div className="space-y-3">





{


notifications.length===0


?


<div

className="
bg-white
dark:bg-[#0b1020]
rounded-2xl
p-12
text-center
shadow
"

>



<Bell

size={38}

className="
mx-auto
text-gray-300
mb-4
"

/>



<h2 className="font-bold text-base">

No notifications

</h2>



<p className="text-gray-400 text-xs mt-1">


You are all caught up 🚀


</p>



</div>







:


notifications.map(item=>(



<div


key={item.id}


onClick={()=>openNotification(item)}


className="
group
bg-white
dark:bg-[#0b1020]
rounded-2xl
px-5
py-4
shadow-sm
hover:shadow-lg
transition
cursor-pointer
border
border-gray-100
dark:border-gray-800
flex
items-center
gap-4
"

>







<div

className="
w-10
h-10
rounded-xl
bg-blue-100
flex
items-center
justify-center
"

>

🔔

</div>









<div className="flex-1">



<div className="flex items-center gap-2">



<h2

className="
font-bold
text-sm
"

>

{item.title}

</h2>





{

item.is_read &&


<CheckCircle

size={14}

className="text-green-500"

/>


}




</div>







<p

className="
text-gray-400
text-xs
mt-1
"

>


{item.message}


</p>






<p

className="
text-[10px]
text-gray-300
mt-2
"

>


{new Date(item.created_at).toLocaleString()}


</p>




</div>









{


!item.is_read


?


<span

className="
w-2.5
h-2.5
rounded-full
bg-red-500
animate-pulse
"

/>



:


<span

className="
text-[10px]
font-bold
text-green-500
"

>

READ

</span>


}




</div>


))


}



</div>





</div>



</div>



);


}