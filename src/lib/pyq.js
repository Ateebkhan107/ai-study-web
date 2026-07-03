// =============================
// GET PYQ QUESTIONS
// =============================

export async function getPYQ(exam, subject) {

  const res = await fetch(
    `/api/pyq?exam=${exam}&subject=${subject}`
  );


  if (!res.ok) {

  const error = await res.json();

  console.log("REAL SAVE ERROR:", error);

  throw new Error(error.error);

}


  return res.json();

}




// =============================
// SAVE PYQ ATTEMPT
// =============================

export async function savePYQAttempt(attempt) {

  const res = await fetch("/api/pyq-attempts", {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },


    body: JSON.stringify({

      question_id: attempt.question_id,

      selected_option: attempt.selected_option,

      is_correct: attempt.is_correct,

      chapter: attempt.chapter,

      subject: attempt.subject,

      exam: attempt.exam,

    }),

  });



  if (!res.ok) {

    const errorBody = await res.json().catch(() => ({}));

    console.log("REAL SAVE ATTEMPT ERROR:", errorBody);

    throw new Error(errorBody.error || "Failed to save PYQ attempt");

  }


  return res.json();

}