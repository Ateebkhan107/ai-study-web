"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";


export default function NotificationBell() {


  const router = useRouter();


  const [mounted,setMounted] = useState(false);

  const [open,setOpen] = useState(false);

  const [notifications,setNotifications] = useState([]);




  useEffect(()=>{

    setMounted(true);

  },[]);







  useEffect(()=>{


    if(!mounted) return;




    async function loadNotifications(){


      const {data,error} = await supabase

      .from("notifications")

      .select("*")

      .order(
        "created_at",
        {
          ascending:false
        }
      );



      if(error){

        console.log(error);

        return;

      }



      setNotifications(data || []);


    }




    loadNotifications();







    // REALTIME


    const channel = supabase


    .channel("realtime-notifications")


    .on(

      "postgres_changes",


      {

        event:"INSERT",

        schema:"public",

        table:"notifications"

      },



      (payload)=>{


        setNotifications(

          (current)=>[

            payload.new,

            ...current

          ]

        );


      }

    )


    .subscribe();






    return()=>{


      supabase.removeChannel(channel);


    };



  },[mounted]);










  async function openNotification(item){



    // update UI instantly


    setNotifications(

      current=>

      current.map(

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







    // update database


    await supabase

    .from("notifications")

    .update({

      is_read:true

    })

    .eq(
      "id",
      item.id
    );





    setOpen(false);



    router.push(

      item.href || "/dashboard"

    );


  }









  if(!mounted){

    return null;

  }





  const unread = notifications.filter(

    n=>!n.is_read

  ).length;









return (

<div className="relative">







{/* BELL BUTTON */}


<button


onClick={()=>setOpen(!open)}


className="
relative
w-9 h-9
rounded-xl
border
border-gray-200
dark:border-gray-700
bg-white
dark:bg-[#0b1020]
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
text-[10px]
font-bold
rounded-full
px-2
"

>

{unread}

</span>


}



</button>










{


open &&



<div

className="
absolute
right-0
mt-4
w-[380px]
bg-white
dark:bg-[#0b1020]
rounded-3xl
border
border-gray-100
dark:border-gray-800
shadow-2xl
overflow-hidden
z-50
"

>





{/* HEADER */}


<div

className="
p-5
flex
justify-between
items-center
border-b
border-gray-100
dark:border-gray-800
"

>


<h2 className="font-black">

Notifications

</h2>




{


unread>0 &&


<span

className="
bg-red-500
text-white
text-xs
rounded-full
px-2
"

>

{unread}

</span>


}


</div>










{/* LIST */}


<div className="max-h-[420px] overflow-y-auto">


{


notifications.length===0


?


<p className="p-5 text-sm text-gray-400">


No notifications


</p>



:



notifications.map((item)=>(




<div


key={item.id}


onClick={()=>openNotification(item)}


className="
p-5
flex
gap-4
items-center
cursor-pointer
hover:bg-gray-50
dark:hover:bg-gray-900
transition
border-b
border-gray-100
dark:border-gray-800
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



<p className="text-xs text-gray-400 mt-1">


{item.message}


</p>


</div>








{


!item.is_read &&


<div

className="
w-2
h-2
rounded-full
bg-red-500
"

/>


}




</div>



))


}



</div>









<div

onClick={()=>router.push("/notifications")}

className="
p-4
text-center
text-xs
font-semibold
text-gray-500
cursor-pointer
hover:bg-gray-50
"

>


View all notifications →


</div>





</div>


}




</div>


);

}