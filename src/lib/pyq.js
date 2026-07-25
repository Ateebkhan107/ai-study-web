// =============================
// GET PYQ QUESTIONS
// =============================

// options:
//   year     - optional, filter by exam year
//   chapter  - optional, filter by chapter
//   mode     - optional, practice mode
//   userId   - optional, required for mode=mistakes
//   examType - optional, filter by exam type (e.g., MAIN)
//   attempt  - optional, filter by attempt (e.g., JANUARY)
//   shift    - optional, filter by shift (e.g., 22 JAN SHIFT 1)
//
// mode=full:      complete paper
// mode=chapter:   chapter filtering
// mode=random:    randomized questions
// mode=mistakes:  wrong question revision (needs userId)
//
// Actual database logic for these modes will be implemented
// inside the /api/pyq route later.

// TODO:
// replace userId param with server auth check

export async function getPYQ(exam, subject, options = {}) {

  const params = new URLSearchParams();

  params.set("exam", exam);
  params.set("subject", subject);

  if (options.year)
    params.set("year", options.year);

  if (options.chapter)
    params.set("chapter", options.chapter);

  if (options.mode)
    params.set("mode", options.mode);

  if (options.userId)
    params.set("userId", options.userId);

  if (options.examType)
    params.set("exam_type", options.examType);

  if (options.attempt)
    params.set("attempt", options.attempt);

  if (options.shift)
    params.set("shift", options.shift);

  const res = await fetch(
    `/api/pyq?${params.toString()}`
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






  // 2️⃣ XP System is now handled in /api/pyq-attempts on the server!
  return attemptData;


}






// =============================
// GET PYQ ANALYTICS
// =============================


export async function getPYQAnalytics(track = "JEE"){


  const res =
  await fetch(
    `/api/pyq/analytics?track=${track}`
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