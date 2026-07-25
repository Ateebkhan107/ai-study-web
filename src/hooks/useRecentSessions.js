"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function useRecentSessions() {

  const { user } = useUser();

  const [loading,setLoading]=useState(true);

  const [sessions,setSessions]=useState([]);

  useEffect(()=>{

    if(user){

      loadSessions();

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user]);

  async function loadSessions(){

    const {data,error}=await supabase

      .from("study_sessions")

      .select("*")

      .eq("clerk_user_id",user.id)

      .order("started_at",{

        ascending:false

      })

      .limit(5);

    if(!error){

      setSessions(data||[]);

    }

    setLoading(false);

  }

  return{

    loading,

    sessions,

    refreshSessions:loadSessions,

  };

}