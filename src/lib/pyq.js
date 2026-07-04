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




// =============================
// GET PYQ ANALYTICS
// =============================

export async function getPYQAnalytics() {

  const res = await fetch("/api/pyq/analytics");


  if (!res.ok) {

    const error = await res.json().catch(() => ({}));

    console.log("REAL ANALYTICS ERROR:", error);

    throw new Error(error.error || "Failed to load PYQ analytics");

  }


  return res.json();

}




// =============================
// GET PYQ OVERVIEW (Question Vault / Index Matrix)
// =============================

export async function getPYQOverview(track) {

  const res = await fetch(`/api/pyq/overview?track=${track}`);


  if (!res.ok) {

    const error = await res.json().catch(() => ({}));

    console.log("REAL OVERVIEW ERROR:", error);

    throw new Error(error.error || "Failed to load PYQ overview");

  }


  return res.json();

}