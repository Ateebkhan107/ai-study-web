"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ProfileMenu from "@/components/ProfileMenu";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";

import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";


const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Test",
    href: "/test",
  },
  {
    name: "PYQ",
    href: "/pyq",
  },
  {
    name: "Analytics",
    href: "/analytics",
  },
  {
    name: "Profile",
    href: "/profile",
  },
];



export default function Navbar() {


const pathname = usePathname();


const { user } = useUser();


const [mounted,setMounted] = useState(false);


const [track,setTrack] = useState(null);







useEffect(()=>{


setMounted(true);


},[]);









// LOAD USER EXAM (JEE / NEET)


useEffect(()=>{



if(!user) return;




async function loadTrack(){



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

"Track fetch error:",

error

);


return;


}





if(data?.exam){


setTrack(

data.exam.toUpperCase()

);


}




}




loadTrack();





},[user]);












// PREVENT HYDRATION ERROR


if(!mounted){


return null;


}









const toggleTheme=()=>{



const dark =

document.documentElement

.classList

.contains("dark");






if(dark){



document.documentElement

.classList

.remove("dark");



localStorage.setItem(

"theme",

"light"

);



}

else{



document.documentElement

.classList

.add("dark");



localStorage.setItem(

"theme",

"dark"

);



}




};










const isActive=(href)=>{


return(

pathname===href

||

pathname.startsWith(

href+"/"

)


);



};









return (


<header

className="

sticky

top-0

z-50

w-full

bg-white

dark:bg-gray-950

border-b

border-gray-100

dark:border-gray-800

shadow-sm

"

>



<div

className="

max-w-7xl

mx-auto

px-6

h-16

flex

items-center

justify-between

gap-8

"

>










{/* LOGO */}


<div className="shrink-0">


<Link href="/dashboard">


<Logo size={80}/>


</Link>


</div>









{/* NAV */}


<nav

className="

flex-1

flex

items-center

justify-center

gap-1

"

>


{


navItems.map((item)=>(



<Link

href={item.href}

key={item.href}

>



<button


className={`

relative

px-4

py-2

rounded-lg

text-sm

font-medium

transition-all


${


isActive(item.href)


?


"text-black dark:text-white bg-gray-100 dark:bg-gray-800"


:


"text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"


}

`}


>



{item.name}





{


isActive(item.href)

&&


<span

className="

absolute

bottom-0

left-1/2

-translate-x-1/2

w-5

h-0.5

bg-black

dark:bg-white

rounded-full

"

/>



}




</button>


</Link>



))

}




{/* PRO */}


<Link href="/pro">


<button

className="

px-4

py-2

rounded-lg

bg-[#1e3a5f]

text-white

text-sm

font-bold

hover:opacity-90

"

>


PRO


</button>


</Link>




</nav>










{/* RIGHT SIDE */}


<div

className="

shrink-0

flex

items-center

gap-3

"

>






{/* THEME */}


<button


onClick={toggleTheme}


className="

w-9

h-9

rounded-xl

border

border-gray-200

dark:border-gray-700

flex

items-center

justify-center

bg-gray-50

dark:bg-gray-800

"

>


🌙


</button>









{/* 🔥 NOTIFICATION BELL FIXED */}


<NotificationBell track={track}/>










{/* PROFILE */}


<ProfileMenu/>




</div>




</div>



</header>


);



}