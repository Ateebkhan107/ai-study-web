"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

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
    try {
      const response = await fetch("/api/study-sessions/recent", {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      // ignore and keep existing fallback behavior
    }

    setLoading(false);

  }

  return{

    loading,

    sessions,

    refreshSessions:loadSessions,

  };

}
