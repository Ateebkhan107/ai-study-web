"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";


export default function Leaderboard() {

  const [users, setUsers] = useState([]);



  async function loadLeaderboard() {

    try {

      const res = await fetch("/api/pyq/leaderboard");

      const data = await res.json();

      setUsers(data);


    } catch(error) {

      console.log(
        "Leaderboard error:",
        error
      );

    }

  }




  useEffect(() => {


    loadLeaderboard();



    const channel = supabase
      .channel("user_xp_changes")

      .on(

        "postgres_changes",

        {

          event:"*",

          schema:"public",

          table:"user_xp",

        },


        () => {

          loadLeaderboard();

        }

      )

      .subscribe();



    return () => {

      supabase.removeChannel(channel);

    };


  }, []);






  return (

    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#0b1020]">


      {/* HEADER */}

      <div className="flex items-center gap-2 mb-6">

        <Trophy size={24}/>


        <h2 className="font-black text-2xl text-black dark:text-white">

          Leaderboard

        </h2>

      </div>





      <div className="space-y-4">



        {users.length === 0 && (

          <p className="text-gray-400">

            No rankings yet

          </p>

        )}






        {users.map((user,index)=>(


          <div

            key={user.user_id}

            className="
            p-5 rounded-xl
            bg-gray-50 dark:bg-gray-900
            "

          >



            {/* TOP ROW */}

            <div className="flex items-center justify-between">


              <div className="flex items-center gap-4">


                {/* Rank */}

                <div className="
                w-12 h-12 rounded-full
                bg-white dark:bg-gray-800
                flex items-center justify-center
                text-xl
                font-black
                ">

                  {index===0 && "🥇"}
                  {index===1 && "🥈"}
                  {index===2 && "🥉"}
                  {index>2 && `#${index+1}`}

                </div>





                {/* USER INFO */}

                <div>


                  <h3 className="
                  font-bold text-lg
                  text-black dark:text-white
                  ">

                    {user.name}

                  </h3>



                  <p className="
                  text-sm text-gray-400
                  ">


                    {user.solved} solved • {user.accuracy}% accuracy


                  </p>




                  {/* LEVEL */}

                  <div className="
                  mt-2 inline-flex
                  items-center gap-1
                  px-2 py-1
                  rounded-full

                  bg-gray-200
                  dark:bg-gray-800

                  text-xs
                  font-bold
                  ">

                    {user.badge}

                    {user.level} League

                  </div>




                </div>


              </div>







              {/* XP */}

              <div className="
              font-black text-xl
              text-black dark:text-white
              ">

                {user.xp} XP

              </div>




            </div>






            {/* XP PROGRESS */}

            <div className="mt-4">


              <div className="
              h-2 rounded-full
              bg-gray-200 dark:bg-gray-700
              overflow-hidden
              ">


                <div

                  className="
                  h-full
                  bg-blue-600
                  rounded-full
                  transition-all
                  "

                  style={{

                    width:
                    `${user.progress}%`

                  }}

                />


              </div>




              <p className="
              mt-1 text-xs
              text-gray-400
              ">

                {user.progress}% to next level

              </p>


            </div>




          </div>


        ))}


      </div>


    </div>

  );

}