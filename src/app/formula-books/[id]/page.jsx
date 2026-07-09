"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormulaBook, getPdfUrl } from "@/lib/formulaBooks";
import { useUser } from "@clerk/nextjs";
import { updateGoalProgress } from "@/lib/goals";


export default function FormulaBookPage() {

  const { id } = useParams();

  const router = useRouter();

  const { user } = useUser();

  const goalUpdated = useRef(false);


  const [book, setBook] = useState(null);

  const [loading, setLoading] = useState(true);





  useEffect(() => {


    async function loadBook() {


      try {


        const data = await getFormulaBook(id);


        setBook(data);


      } 
      
      catch (err) {


        console.error(err);


      } 
      
      finally {


        setLoading(false);


      }


    }



    if (id) loadBook();



  }, [id]);









// =============================
// FORMULA DAILY GOAL + XP
// =============================


useEffect(()=>{


if(

!user ||

!book ||

goalUpdated.current

) return;





async function updateFormulaGoal(){



try{



goalUpdated.current=true;




await updateGoalProgress(

user.id,

"FORMULA",

1

);





console.log(

"FORMULA GOAL UPDATED 📚"

);




}


catch(error){



goalUpdated.current=false;



console.log(

"Formula goal error:",

error

);



}



}




updateFormulaGoal();




},[user,book]);











  if (loading) {


    return (

      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">


        <div className="flex flex-col items-center gap-3">


          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />


          <p className="text-sm text-gray-400 font-medium">

            Loading handbook...

          </p>


        </div>


      </div>

    );


  }








  if (!book) {


    return (

      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-gray-950">


        <p className="text-4xl">

          📭

        </p>



        <h2 className="text-xl font-black text-black dark:text-white">

          Handbook not found

        </h2>



        <p className="text-sm text-gray-400">

          This formula book doesn&apos;t exist or was removed.

        </p>




        <button


          onClick={() => router.back()}


          className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity"


        >


          ← Go Back


        </button>


      </div>

    );


  }









  const subjectMeta = {


    Chemistry: { 
      color:"#10B981",
      bg:"rgba(16,185,129,0.08)",
      label:"⚗️"
    },


    Mathematics:{
      color:"#6366F1",
      bg:"rgba(99,102,241,0.08)",
      label:"📐"
    },


    Physics:{
      color:"#F59E0B",
      bg:"rgba(245,158,11,0.08)",
      label:"⚡"
    },


  };




  const meta =

  subjectMeta[book.subject]

  ||

  {

    color:"#6366F1",

    bg:"rgba(99,102,241,0.08)",

    label:"📖"

  };










  return (

    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950">





      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-3 flex-shrink-0 shadow-sm">






        <button


          onClick={() => router.back()}


          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-shrink-0"


        >

          ←

        </button>







        <span


          className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0"


          style={{


            color:meta.color,


            background:meta.bg


          }}


        >


          {meta.label} {book.subject}


        </span>








        <div className="flex-1 min-w-0">


          <h1 className="text-sm font-black text-black dark:text-white leading-tight truncate">

            {book.title}

          </h1>



          {


          book.tag &&


          <p className="text-[11px] text-gray-400 mt-0.5">


            {book.tag}


          </p>


          }



        </div>



      </div>








      <iframe


        src={`${getPdfUrl(book.file_name)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}


        className="flex-1 w-full border-0"


        title={book.title}


      />



    </div>


  );


}