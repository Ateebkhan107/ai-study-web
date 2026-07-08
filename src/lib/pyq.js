// =============================
// GET PYQ QUESTIONS
// =============================

export async function getPYQ(exam, subject) {

  const res = await fetch(
    `/api/pyq?exam=${exam}&subject=${subject}`
  );


  if (!res.ok) {

    const error = await res.json().catch(() => ({}));

    console.log("PYQ FETCH ERROR:", error);

    throw new Error(
      error.error || "Failed to load PYQ"
    );

  }


  return res.json();

}




// =============================
// SAVE PYQ ATTEMPT + XP UPDATE
// =============================

export async function savePYQAttempt(attempt) {


  // 1️⃣ Save Attempt

  const res = await fetch(
    "/api/pyq-attempts",
    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },


      body:JSON.stringify({

        question_id:
        attempt.question_id,


        selected_option:
        attempt.selected_option,


        is_correct:
        attempt.is_correct,


        chapter:
        attempt.chapter,


        subject:
        attempt.subject,


        exam:
        attempt.exam


      })


    }
  );




  if(!res.ok){


    const error =
    await res.json()
    .catch(()=>({}));


    console.log(
      "SAVE ATTEMPT ERROR:",
      error
    );


    throw new Error(
      error.error ||
      "Failed to save attempt"
    );


  }




  const attemptData =
  await res.json();






  // 2️⃣ Update XP System

  try{


    await fetch(
      "/api/xp",
      {

        method:"POST",


        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({


          user_id:
          attempt.user_id ||
          "guest_user",



          name:
          attempt.name ||
          "Student",



          xp:
          attempt.is_correct
          ? 10
          : 2,



          correct:
          attempt.is_correct



        })


      }
    );



  }


  catch(error){


    console.log(
      "XP UPDATE FAILED:",
      error
    );


  }




  return attemptData;


}






// =============================
// GET PYQ ANALYTICS
// =============================


export async function getPYQAnalytics(){


  const res =
  await fetch(
    "/api/pyq/analytics"
  );



  if(!res.ok){


    const error =
    await res.json()
    .catch(()=>({}));


    console.log(
      "ANALYTICS ERROR:",
      error
    );


    throw new Error(
      error.error ||
      "Analytics failed"
    );


  }



  return res.json();


}






// =============================
// GET PYQ OVERVIEW
// =============================


export async function getPYQOverview(track){


  const res =
  await fetch(
    `/api/pyq/overview?track=${track}`
  );



  if(!res.ok){


    const error =
    await res.json()
    .catch(()=>({}));


    console.log(
      "OVERVIEW ERROR:",
      error
    );


    throw new Error(
      error.error ||
      "Overview failed"
    );


  }



  return res.json();


}