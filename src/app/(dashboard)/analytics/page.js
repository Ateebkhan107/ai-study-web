"use client";

import { useState, useEffect } from "react";

import OverviewCards from "@/components/analytics/OverviewCards";
import { PerformanceTrend } from "@/components/analytics/ChartComponents";
import WeakTopics from "@/components/analytics/WeakTopics";
import WhatToDoNext from "@/components/analytics/WhatToDoNext";

import { getUserAnalytics } from "@/services/analytics";
import { useUser } from "@clerk/nextjs";


export default function AnalyticsPage() {

  const { user } = useUser();


  const [stats, setStats] = useState(null);

  const [dbData, setDbData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [activeTrack, setActiveTrack] =
    useState("jee");



  useEffect(() => {

    if(user){
      loadUserStats();
    }

  },[user]);



  async function loadUserStats(){

    const data =
    await getUserAnalytics(user.id);


    setStats(data);

  }




  useEffect(() => {


    async function fetchAnalytics(){

      try {


        const match =
        document.cookie.match(
          new RegExp("(^| )prepzii_track=([^;]+)")
        );


        const clientTrack =
        match
        ? match[2].toLowerCase()
        : "jee";


        setActiveTrack(clientTrack);



        const response =
        await fetch("/api/analytics");



        if(response.ok){

          const data =
          await response.json();


          setDbData(data);


          if(data.track){

            setActiveTrack(
              data.track.toLowerCase()
            );

          }

        }


      }
      catch(err){

        console.error(
          "Analytics fetch failed:",
          err
        );

      }
      finally{

        setLoading(false);

      }

    }


    fetchAnalytics();


  },[]);




  if(loading){

    return(

      <div className="max-w-5xl mx-auto px-6 py-10">

        Loading analytics...

      </div>

    )

  }





  return (

    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">


      <div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Analytics
        </p>


        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">

          Your Performance

        </h1>


        <p className="mt-1 text-sm text-gray-400">

          Updated today · {activeTrack.toUpperCase()} track

        </p>


      </div>



      <OverviewCards
        track={activeTrack}
        stats={stats}
      />



    <PerformanceTrend
 track={activeTrack}
 data={stats?.performanceTrend || []}
/>



      <WeakTopics
 track={activeTrack}
 dbTopics={stats?.weakTopics}
/>



      <WhatToDoNext
  track={activeTrack}
  weakTopics={stats?.weakTopics}
/>



    </div>

  );

}