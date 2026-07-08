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

      console.log("Leaderboard error:", error);

    }

  }





  useEffect(() => {


    loadLeaderboard();



    const channel = supabase
      .channel("user_xp_changes")

      .on(

        "postgres_changes",

        {

          event: "*",

          schema: "public",

          table: "user_xp",

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

            className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-gray-900"

          >




            <div className="flex items-center gap-4">


              <div className="text-xl">

                {index===0 && "🥇"}
                {index===1 && "🥈"}
                {index===2 && "🥉"}
                {index>2 && `#${index+1}`}

              </div>




              <div>


                <h3 className="font-bold text-lg text-black dark:text-white">

                  {user.name}

                </h3>



                <p className="text-sm text-gray-400">


                  {user.pyq_solved} solved • {user.accuracy}% accuracy


                </p>



              </div>


            </div>







            <div className="font-black text-xl text-black dark:text-white">

              {user.xp} XP

            </div>





          </div>


        ))}



      </div>



    </div>

  );


}