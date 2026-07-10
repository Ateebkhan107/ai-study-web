"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

export default function StatsCards() {

  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState([
    {
      label: "Tests Attempted",
      value: "0",
      sub: "Keep practicing",
      icon: "◈"
    },
    {
      label: "Accuracy",
      value: "0%",
      sub: "Based on answers",
      icon: "◎"
    },
    {
      label: "Rank",
      value: "#--",
      sub: "Keep climbing",
      icon: "◇"
    },
    {
      label: "Study Time",
      value: "0h",
      sub: "This month",
      icon: "◷"
    },
  ]);



  useEffect(() => {

    if (!isLoaded || !user) return;


    async function loadStats(){


      // ==========================
      // TEST ATTEMPTS
      // ==========================

      const { count: testCount } =
        await supabase
        .from("test_attempts")
        .select("*", {
          count:"exact",
          head:true
        })
        .eq(
          "user_id",
          user.id
        );




      // ==========================
      // USER XP + ACCURACY
      // ==========================

      const { data: xpData } =
        await supabase
        .from("user_xp")
        .select(
          "xp, pyq_solved, correct_answers"
        )
        .eq(
          "user_id",
          user.id
        )
        .single();




      let accuracy = 0;


      if(
        xpData &&
        xpData.pyq_solved > 0
      ){

        accuracy =
        Math.round(
          (
            xpData.correct_answers /
            xpData.pyq_solved
          )
          *
          100
        );

      }





      // ==========================
      // RANK BY XP
      // ==========================


      let rank = "--";


      if(xpData){


        const { count } =
        await supabase
        .from("user_xp")
        .select("*",{
          count:"exact",
          head:true
        })
        .gt(
          "xp",
          xpData.xp
        );


        rank =
        (count || 0) + 1;


      }






      // ==========================
      // STUDY TIME
      // (future self-study table)
      // ==========================


      let hours = 0;


      const {data: sessions} =
      await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq(
        "user_id",
        user.id
      );


      if(sessions){

        const total =
        sessions.reduce(
          (sum,item)=>
          sum +
          (item.duration_minutes || 0)
          ,
          0
        );


        hours =
        Math.floor(total/60);

      }







      setStats([

        {
          label:"Tests Attempted",
          value:String(testCount || 0),
          sub:"Total tests given",
          icon:"◈"
        },


        {
          label:"Accuracy",
          value:`${accuracy}%`,
          sub:"Your performance",
          icon:"◎"
        },


        {
          label:"Rank",
          value:`#${rank}`,
          sub:"Based on XP",
          icon:"◇"
        },


        {
          label:"Study Time",
          value:`${hours}h`,
          sub:"This month",
          icon:"◷"
        }


      ]);




    }


    loadStats();



  },[isLoaded,user]);







  return (


    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">


      {stats.map((stat)=>(


        <div

        key={stat.label}

        className="
        bg-white
        dark:bg-gray-900
        border
        border-gray-100
        dark:border-gray-800
        rounded-2xl
        p-5
        shadow-sm
        hover:shadow-md
        transition-shadow
        duration-200
        group
        "

        >



          <div className="flex items-start justify-between mb-4">


            <p className="
            text-xs
            font-medium
            text-gray-400
            uppercase
            tracking-widest
            ">

              {stat.label}

            </p>



            <span className="
            text-gray-300
            dark:text-gray-600
            text-lg
            group-hover:text-gray-500
            transition-colors
            ">

              {stat.icon}

            </span>


          </div>





          <p className="
          text-3xl
          font-black
          text-black
          dark:text-white
          tracking-tight
          mb-1
          ">

            {stat.value}

          </p>




          <p className="text-xs text-gray-400">

            {stat.sub}

          </p>




        </div>


      ))}



    </div>


  );

}