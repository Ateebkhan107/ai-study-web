"use client";

const ACTIONS_JEE = [
  {
    priority: "1",
    title: "Fix Integration first",
    desc: "Appears in 3–4 JEE Advanced questions every year and you're at 38%. Start with basic definite integrals — 20 questions today.",
    action: "Start Integration PYQs →",
    href: "/pyq?subject=Maths&topic=Integration",
    urgent: true,
  },
  {
    priority: "2",
    title: "Revise Kinematics this week",
    desc: "44% accuracy on a topic that's easy to fix. One focused 30-min session will push this above 70%.",
    action: "Take Kinematics Test →",
    href: "/test?subject=Physics&chapter=Kinematics",
    urgent: true,
  },
  {
    priority: "3",
    title: "Study more on Sundays",
    desc: "Your Sunday average is under 1h — your lowest day. Even 2h on Sundays closes 12% of your readiness gap.",
    action: "Set a Sunday reminder",
    href: null,
    urgent: false,
  },
];

const ACTIONS_NEET = [
  {
    priority: "1",
    title: "Fix Genetics Maps first",
    desc: "At 38%, this is your biggest gap. Genetics accounts for 20% of NEET Biology marks. Do 15 PYQs today.",
    action: "Start Genetics PYQs →",
    href: "/pyq?subject=Biology&topic=Genetics",
    urgent: true,
  },
  {
    priority: "2",
    title: "Revise Organic Reactions",
    desc: "42% accuracy with high NEET frequency. Cover Aldol condensation and esterification this week.",
    action: "Take Chemistry Test →",
    href: "/test?subject=Chemistry&chapter=Organic+Reactions",
    urgent: true,
  },
  {
    priority: "3",
    title: "Study more on Sundays",
    desc: "Your Sunday average is under 1h. Even 2h on Sundays closes 12% of your readiness gap.",
    action: "Set a Sunday reminder",
    href: null,
    urgent: false,
  },
];


export default function WhatToDoNext({ track = "jee" }) {

  const actions =
    track === "neet"
      ? ACTIONS_NEET
      : ACTIONS_JEE;


  return (

    <div className="
    bg-white dark:bg-gray-900
    border border-gray-100 dark:border-gray-800
    rounded-2xl p-5
    ">


      <div className="mb-5">

        <h2 className="
        text-xs font-bold
        text-black dark:text-white
        uppercase tracking-widest
        ">
          What To Do Next
        </h2>


        <p className="text-xs text-gray-400 mt-1">
          3 things that will move your score the most right now
        </p>

      </div>




      <div className="space-y-3">


        {actions.map((item)=>(


          <div
          key={item.priority}
          className={`
          flex gap-4 p-4 rounded-xl border
          transition-colors
          ${
            item.urgent
            ?
            "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
            :
            "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          }
          `}
          >


            <div
            className={`
            w-7 h-7 rounded-full
            flex items-center justify-center
            text-xs font-black
            flex-shrink-0 mt-0.5
            ${
              item.urgent
              ?
              "bg-black dark:bg-white text-white dark:text-black"
              :
              "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }
            `}
            >

              {item.priority}

            </div>





            <div className="flex-1 min-w-0">


              <p className="
              text-sm font-bold
              text-black dark:text-white mb-1
              ">
                {item.title}
              </p>



              <p className="
              text-xs text-gray-500 dark:text-gray-400
              leading-relaxed mb-3
              ">
                {item.desc}
              </p>





              {item.href ? (


                <a

                href={item.href}

                className={`
                inline-block
                text-xs font-bold
                px-4 py-1.5 rounded-lg
                hover:opacity-80
                transition-opacity
                ${
                  item.urgent
                  ?
                  "bg-black dark:bg-white text-white dark:text-black"
                  :
                  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }
                `}
                >

                  {item.action}

                </a>


              ):(


                <button

                onClick={()=>
                  alert("Set a study reminder in your calendar")
                }

                className="
                inline-block
                text-xs font-bold
                px-4 py-1.5 rounded-lg
                bg-gray-100 dark:bg-gray-800
                text-gray-700 dark:text-gray-300
                hover:opacity-80 transition-opacity
                "
                >

                  {item.action}

                </button>


              )}


            </div>


          </div>


        ))}


      </div>


    </div>

  );

}