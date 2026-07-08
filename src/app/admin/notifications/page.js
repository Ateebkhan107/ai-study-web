"use client";

import { useState } from "react";

export default function AdminNotifications() {

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [href, setHref] = useState("");

  const [loading, setLoading] = useState(false);


  async function sendNotification() {

    if(!title || !message){

      alert("Fill all fields");
      return;

    }


    try {

      setLoading(true);


      const res = await fetch("/api/admin/notifications", {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          title:title,

          message:message,

          href:href || "/dashboard",

          type:"admin"

        })

      });



      const data = await res.json();


      if(!res.ok){

        console.log(data);
        alert("Failed");

        return;

      }


      alert("Notification sent 🔔");


      setTitle("");
      setMessage("");
      setHref("");



    } catch(error){

      console.log(error);

      alert("Error sending notification");

    }

    finally{

      setLoading(false);

    }

  }




  return (

    <div
    className="
    min-h-screen
    flex
    justify-center
    pt-32
    "
    >


      <div className="w-[500px]">


        <h1
        className="
        text-3xl
        font-black
        mb-10
        text-center
        "
        >

          PrepZii Admin 🚀

        </h1>



        <input

        value={title}

        onChange={(e)=>setTitle(e.target.value)}

        placeholder="Notification title"

        className="
        w-full
        border
        rounded-xl
        p-4
        mb-5
        "

        />



        <textarea

        value={message}

        onChange={(e)=>setMessage(e.target.value)}

        placeholder="Notification message"

        className="
        w-full
        h-32
        border
        rounded-xl
        p-4
        mb-5
        "

        />



        <input

        value={href}

        onChange={(e)=>setHref(e.target.value)}

        placeholder="/dashboard"

        className="
        w-full
        border
        rounded-xl
        p-4
        mb-5
        "

        />



        <button

        disabled={loading}

        onClick={sendNotification}

        className="
        bg-black
        text-white
        px-8
        py-4
        rounded-xl
        font-bold
        disabled:opacity-50
        "

        >


        {
          loading
          ?
          "Sending..."
          :
          "Send Notification"
        }


        </button>


      </div>


    </div>

  );

}