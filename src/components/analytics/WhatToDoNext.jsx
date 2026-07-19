"use client";


export default function WhatToDoNext({
  weakTopics = []
}) {


const weakest =
[...weakTopics]
.sort(
(a,b)=>a.accuracy-b.accuracy
)
.slice(0,3);



const actions =
weakest.length > 0
?
weakest.map((topic,index)=>({

priority:index+1,

title:`Fix ${topic.topic} first`,

desc:
`Your accuracy is ${topic.accuracy}% in ${topic.topic}. Practice this chapter to improve your score.`,

action:"Start Practice →",

href:
`/test?subject=${encodeURIComponent(topic.subject || "")}&chapter=${encodeURIComponent(topic.topic)}`,

urgent:
topic.accuracy < 60

}))

:

[
{
priority:1,
title:"Take your first test",
desc:"Complete tests to unlock personalized recommendations.",
action:"Start Test →",
href:"/test",
urgent:true
}

];



return (

<div className="glass-card p-5">


<div className="mb-5">

<h2 className="
  text-xs font-bold
  text-slate-800 dark:text-slate-100
  uppercase tracking-widest
  ">

What To Do Next

</h2>


<p className="text-xs text-slate-400 dark:text-slate-500 mt-1">

Based on your latest test performance

</p>


</div>



<div className="space-y-3">


{actions.map(item=>(


<div
key={item.priority}
className="
  flex gap-4 p-4 rounded-xl
  border border-slate-200/60
  dark:border-slate-700/50
  hover:-translate-y-0.5 transition-all duration-300
  "
>


<div className="
w-7 h-7 rounded-full
bg-black dark:bg-white
text-white dark:text-black
flex items-center justify-center
text-xs font-black
">

{item.priority}

</div>



<div>


<p className="
  text-sm font-bold
  text-slate-800 dark:text-slate-100
  ">

{item.title}

</p>



<p className="
text-xs text-gray-500
dark:text-gray-400
my-2
">

{item.desc}

</p>



<a

href={item.href}

className="
  inline-block
  text-xs font-bold
  px-4 py-2
  rounded-lg
  bg-gradient-to-r from-indigo-500 to-violet-500
  text-white
  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20
  transition-all duration-300
  "

>

{item.action}

</a>


</div>


</div>


))}


</div>


</div>

);

}