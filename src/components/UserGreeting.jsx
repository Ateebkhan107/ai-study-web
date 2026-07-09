"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserGreeting() {
  const { user } = useUser();

  

const [name, setName] = useState("");

useEffect(() => {

  if (user) {
    loadProfile();
  }

}, [user]);



async function loadProfile() {

  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name")
    .eq("clerk_user_id", user.id)
    .single();

  if (error) {
    console.log(error);
    return;
  }

  setName(data.full_name);

}
  return (
  <h1 className="text-5xl font-bold">
    Hey, {name ? name.split(" ")[0] : "Student"} 👋
  </h1>
);
}