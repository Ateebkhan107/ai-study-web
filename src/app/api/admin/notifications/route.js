import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL,

  process.env.SUPABASE_SERVICE_ROLE_KEY

);



export async function POST(req) {

  try {


    const body = await req.json();


    const {

      title,

      message,

      href

    } = body;




    const { error } = await supabase

      .from("notifications")

      .insert({

        user_id: "all",

        type: "admin",

        title,

        message,

        href: href || "/dashboard",

        is_read:false

      });




    if(error){

      console.log(error);

      return NextResponse.json(

        {
          success:false,
          error:error.message
        },

        {status:500}

      );

    }




    return NextResponse.json({

      success:true

    });




  } catch(error){


    return NextResponse.json(

      {

        success:false,

        error:error.message

      },

      {status:500}

    );


  }

}