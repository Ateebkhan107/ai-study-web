"use client";

import { useMemo } from "react";
import { useSelfStudy } from "@/context/SelfStudyContext";

const JEE_SUBJECTS = [
  {
    id: "Physics",
    name: "Physics",
    icon: "⚛️",
    chapter: "Mechanics",
    today: "0h 00m",
    color:
      "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    id: "Chemistry",
    name: "Chemistry",
    icon: "🧪",
    chapter: "Organic Chemistry",
    today: "0h 00m",
    color:
      "from-emerald-500 via-green-500 to-teal-500",
  },
  {
    id: "Mathematics",
    name: "Mathematics",
    icon: "📐",
    chapter: "Calculus",
    today: "0h 00m",
    color:
      "from-violet-500 via-purple-500 to-fuchsia-500",
  },
];

const NEET_SUBJECTS = [
  {
    id: "Physics",
    name: "Physics",
    icon: "⚛️",
    chapter: "Mechanics",
    today: "0h 00m",
    color:
      "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    id: "Chemistry",
    name: "Chemistry",
    icon: "🧪",
    chapter: "Organic Chemistry",
    today: "0h 00m",
    color:
      "from-emerald-500 via-green-500 to-teal-500",
  },
  {
    id: "Biology",
    name: "Biology",
    icon: "🧬",
    chapter: "Genetics",
    today: "0h 00m",
    color:
      "from-pink-500 via-rose-500 to-red-500",
  },
];

export default function SubjectGrid() {

  const {
    exam,
    loading,
    subject,
    setSubject,
  } = useSelfStudy();

  const subjects = useMemo(() => {

    if (exam === "NEET") {
      return NEET_SUBJECTS;
    }

    return JEE_SUBJECTS;

  }, [exam]);

  if (loading) {

    return (
      <div className="grid md:grid-cols-3 gap-5">

        {[1,2,3].map((item)=>(
          <div
            key={item}
            className="h-44 rounded-3xl bg-white dark:bg-gray-900 animate-pulse"
          />
        ))}

      </div>
    );

  }

  return (

    <section className="space-y-6">

      <div>

        <p className="uppercase tracking-[4px] text-xs font-bold text-gray-400">

          Subjects

        </p>

        <h2 className="mt-2 text-3xl font-black">

          Continue Studying

        </h2>

        <p className="mt-2 text-gray-500">

          Select the subject you're studying right now.

        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {subjects.map((item)=>{

          const active = subject===item.id;

          return(

            <button
              key={item.id}
              onClick={()=>setSubject(item.id)}
              className={`
                relative
                overflow-hidden
                rounded-[28px]
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl

                ${
                  active
                    ? "bg-slate-900 text-white shadow-2xl"
                    : "bg-white dark:bg-gray-900 shadow-sm"
                }
              `}
            >

              <div
                className={`
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-br
                  ${item.color}
                  flex
                  items-center
                  justify-center
                  text-3xl
                  shadow-lg
                `}
              >
                {item.icon}
              </div>

              <h3 className="mt-6 text-2xl font-black">

                {item.name}

              </h3>

              <p
                className={`mt-2 text-sm ${
                  active
                    ? "text-white/70"
                    : "text-gray-500"
                }`}
              >

                {item.chapter}

              </p>

              <div className="mt-8 flex items-center justify-between">

                <div>

                  <p
                    className={`text-xs uppercase tracking-wider ${
                      active
                        ? "text-white/50"
                        : "text-gray-400"
                    }`}
                  >
                    Today
                  </p>

                  <h4 className="mt-1 font-bold">

                    {item.today}

                  </h4>

                </div>

                {active && (

                  <div className="flex items-center gap-2">

                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"/>

                    <span className="text-sm font-semibold">

                      Active

                    </span>

                  </div>

                )}

              </div>

              {active && (

                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"/>

              )}

            </button>

          );

        })}

      </div>

    </section>

  );

}