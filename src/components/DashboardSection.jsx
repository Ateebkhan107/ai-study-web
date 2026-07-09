"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


export default function DashboardSection({ config }) {


  const [formulaBooks,setFormulaBooks] = useState([]);

  const [loading,setLoading] = useState(true);

  const [error,setError] = useState("");




  const isNeet = config?.badge
  ?.toLowerCase()
  ?.includes("neet");







  // ==========================
  // LOAD FORMULA BOOKS
  // ==========================


  useEffect(()=>{


    async function loadBooks(){


      try{


        setLoading(true);



        const res = await fetch(
          "/api/formula-books"
        );



        if(!res.ok){


          throw new Error(
            "Failed to load formula books"
          );


        }




        const data = await res.json();



        setFormulaBooks(

          Array.isArray(data)

          ?

          data

          :

          []

        );



      }


      catch(err){


        console.log(
          "Formula book error:",
          err
        );



        setError(
          err.message
        );


      }


      finally{


        setLoading(false);


      }



    }




    loadBooks();



  },[]);









  // ==========================
  // FILTER JEE / NEET
  // ==========================



  const filteredFormulas = formulaBooks.filter(

    (book)=>{


      if(!book.stream){

        return false;

      }



      return isNeet

      ?

      book.stream === "NEET"

      :

      book.stream === "JEE";


    }


  );









return (

<div className="grid grid-cols-1 gap-6 items-start">





{/* FORMULA SECTION */}



<div className="space-y-4">






{/* HEADER */}


<div className="
flex
items-center
justify-between
">


<h2 className="
text-[11px]
font-black
uppercase
tracking-[0.2em]
text-gray-400
">

Formula Cards

</h2>





<Link

href="/formula-books"

className="
text-xs
font-bold
text-indigo-500
hover:text-indigo-700
transition
"

>

View all →

</Link>


</div>









{/* LOADING */}


{

loading &&


<div className="
grid
grid-cols-1
md:grid-cols-3
gap-4
">


{

[1,2,3].map(

(i)=>(


<div

key={i}

className="
h-[130px]
rounded-xl
bg-gray-100
dark:bg-[#13162a]
animate-pulse
"

/>


)

)


}


</div>


}









{/* ERROR */}


{

error && !loading &&


<div className="
p-5
rounded-xl
bg-red-50
text-red-500
text-sm
font-semibold
">

{error}

</div>


}









{/* FORMULA CARDS */}



{

!loading && !error &&


<div className="
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
gap-4
">



{


filteredFormulas.length>0


?


filteredFormulas.map((book)=>(



<Link


href={`/formula-books/${book.id}`}


key={book.id}


className="group"


>




<div

className="
bg-white
dark:bg-[#13162a]

border
border-gray-100
dark:border-[#252840]

rounded-2xl

p-5

min-h-[140px]

shadow-sm

hover:shadow-lg
hover:-translate-y-1

transition-all
duration-200

flex
flex-col
gap-4
"


>








{/* TOP */}


<div className="
flex
items-center
justify-between
">



<span className="
text-[10px]
font-black
uppercase
tracking-widest
text-gray-400
">

{book.subject}

</span>





<span className="
text-[10px]
font-bold
px-2
py-1
rounded-full

bg-gray-100
dark:bg-[#1e2238]

text-gray-500
">

{book.tag}

</span>



</div>









{/* TITLE */}



<h3 className="
text-sm
font-black
text-gray-800
dark:text-white
">

{book.title}

</h3>










{/* FORMULA */}



<div className="
bg-gray-50
dark:bg-[#1e2238]

rounded-xl

px-3
py-2

border
border-gray-100
dark:border-[#252840]
">


<p className="
font-mono
text-xs
font-bold
text-black
dark:text-white
">

{book.formula}

</p>




{

book.sub &&


<p className="
font-mono
text-[10px]
text-gray-400
mt-1
">

{book.sub}

</p>


}


</div>





</div>



</Link>



))


:



<div className="
col-span-full
py-10

text-center

rounded-2xl

bg-white
dark:bg-[#13162a]

text-gray-400

text-sm
font-semibold
">


No formula cards available 📚


</div>



}



</div>


}







</div>


</div>


);


}