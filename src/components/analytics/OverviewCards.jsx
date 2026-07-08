"use client";


export default function OverviewCards({stats}) {


const cards = [

{
label:"Tests Taken",
value:stats?.totalTests ?? 0,
sub:"completed tests"
},


{
label:"Average Score",
value:`${stats?.averageScore ?? 0}%`,
sub:"overall performance"
},


{
label:"Accuracy",
value:`${stats?.accuracy ?? 0}%`,
sub:"questions accuracy"
},


{
label:"Study Streak",
value:"0",
sub:"coming soon"
}

];



return (

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">


{cards.map((s)=>(

<div
key={s.label}
className="
bg-white dark:bg-gray-900
border border-gray-100 dark:border-gray-800
rounded-2xl p-5 shadow-sm
hover:shadow-md transition-shadow
"
>


<p className="
text-xs font-bold
text-gray-400 uppercase
tracking-widest mb-3
">
{s.label}
</p>


<p className="
text-3xl font-black
text-black dark:text-white
tracking-tight mb-1
">

{s.value}

</p>


<p className="text-xs text-gray-400">

{s.sub}

</p>


</div>

))}


</div>

);

}