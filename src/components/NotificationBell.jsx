"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";


export default function NotificationBell(){

const router = useRouter();

const {user,isLoaded}=useUser();

const [open,setOpen]=useState(false);

const [notifications,setNotifications]=useState([]);

const [stream,setStream]=useState(null);




// ===============================
// LOAD USER STREAM (JEE / NEET)
// ===============================


useEffect(()=>{


if(!isLoaded || !user) return;


async function getStream(){


const {data,error}=await supabase

.from("user_profiles")

.select("exam")

.eq(

"clerk_user_id",

user.id

)

.single();




if(error){


console.log(

"Exam fetch error:",

error

);


return;

}



if(data?.exam){


setStream(

data.exam.toUpperCase()

);


}



}



getStream();



},[isLoaded,user]);











// ===============================
// LOAD NOTIFICATIONS
// ===============================


useEffect(()=>{


if(!user || !stream) return;



async function loadNotifications(){



const {data,error}=await supabase


.from("notifications")


.select(`

*,

notification_reads(

user_id,

is_cleared,

is_read

)

`)


.or(

`user_id.eq.${user.id},user_id.eq.all`

)


.in(

"stream",

[

stream,

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

"Notification error:",

error

);


return;


}







const visible = (data || [])


.filter((item)=>{


const cleared = item.notification_reads?.some(

(read)=>

read.user_id===user.id &&

read.is_cleared===true

);



return !cleared;


})


.map((item)=>{



const readData = item.notification_reads?.find(

(read)=>

read.user_id===user.id

);



return {

...item,

is_read: readData?.is_read || false

};



});





setNotifications(visible);



}




loadNotifications();









// ===============================
// REALTIME
// ===============================



const channel = supabase


.channel("notification-channel")


.on(

"postgres_changes",


{

event:"INSERT",

schema:"public",

table:"notifications"

},



(payload)=>{



const item = payload.new;




if(

(

item.user_id===user.id

||

item.user_id==="all"

)

&&

(

item.stream===stream

||

item.stream==="ALL"

)

){



setNotifications(

prev=>[

{

...item,

is_read:false

},

...prev

]

);



}



}


)


.subscribe();






return()=>{


supabase.removeChannel(channel);


};




},[user,stream]);












// ===============================
// OPEN NOTIFICATION
// ===============================



async function openNotification(item){



setNotifications(

prev=>

prev.map(

n=>

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





await supabase


.from("notification_reads")


.upsert({


user_id:user.id,


notification_id:item.id,


is_read:true


});






setOpen(false);





if(

item.href &&

item.href.trim() !== ""

){


router.push(

item.href

);


}



}









const unread = notifications.filter(

n=>!n.is_read

).length;










return(

<div className="relative">





{/* BUTTON */}


<button

onClick={()=>setOpen(!open)}

className="

relative

w-9

h-9

rounded-xl

border

border-gray-200

bg-white

flex

items-center

justify-center

shadow-sm

"

>


<Bell size={17}/>





{

unread>0 &&


<span

className="

absolute

-top-2

-right-2

bg-red-500

text-white

text-xs

px-2

rounded-full

"

>


{unread}


</span>

}




</button>









{/* DROPDOWN */}


{

open &&


<div

className="

absolute

right-0

mt-4

w-[380px]

bg-white

rounded-3xl

shadow-2xl

overflow-hidden

z-50

"

>



<div

className="

p-5

font-black

border-b

"

>

Notifications

</div>






<div className="max-h-[420px] overflow-y-auto">



{

notifications.length===0

?


<p className="p-5 text-gray-400 text-sm">

No notifications

</p>


:


notifications.map(item=>(



<div

key={item.id}

onClick={()=>openNotification(item)}

className="

p-5

flex

gap-4

items-center

border-b

cursor-pointer

hover:bg-gray-50

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


<h3 className="font-bold text-sm">

{item.title}

</h3>



<p className="text-xs text-gray-400">

{item.message}

</p>


</div>





{

!item.is_read &&


<div

className="

w-2

h-2

bg-red-500

rounded-full

"

/>

}



</div>


))

}


</div>






<div

onClick={()=>{

setOpen(false);

router.push("/notifications");

}}

className="

p-4

text-center

text-xs

font-bold

cursor-pointer

"

>


View all notifications →


</div>




</div>

}


</div>

);


}