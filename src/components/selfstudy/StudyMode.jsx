"use client";

import { useMemo } from "react";
import { useSelfStudy } from "@/context/SelfStudyContext";

const JEE_MODES = [
  {
    id: "theory",
    title: "Theory Reading",
    icon: "📖",
    desc: "Read concepts & notes",
  },
  {
    id: "questions",
    title: "Question Solving",
    icon: "✍️",
    desc: "Practice questions",
  },
  {
    id: "revision",
    title: "Revision",
    icon: "🔄",
    desc: "Quick revision",
  },
  {
    id: "pyq",
    title: "PYQ Practice",
    icon: "🎯",
    desc: "Previous year questions",
  },
  {
    id: "analysis",
    title: "Mock Analysis",
    icon: "📊",
    desc: "Review mistakes",
  },
];

const NEET_MODES = [
  {
    id: "ncert",
    title: "NCERT Reading",
    icon: "📖",
    desc: "Read NCERT thoroughly",
  },
  {
    id: "questions",
    title: "MCQ Practice",
    icon: "✍️",
    desc: "Practice MCQs",
  },
  {
    id: "revision",
    title: "Revision",
    icon: "🔄",
    desc: "Quick revision",
  },
  {
    id: "pyq",
    title: "PYQ Practice",
    icon: "🎯",
    desc: "Previous year questions",
  },
  {
    id: "analysis",
    title: "Mock Analysis",
    icon: "📊",
    desc: "Review mistakes",
  },
];

export default function StudyMode() {

  const {
    exam,
    mode,
    setMode,
  } = useSelfStudy();

  const modes = useMemo(() => {

    return exam === "NEET"
      ? NEET_MODES
      : JEE_MODES;

  }, [exam]);

  return (

    <section className="space-y-5">

      <div>

        <p className="text-sm uppercase tracking-widest font-bold text-gray-400">

          Study Mode

        </p>

        <h2 className="text-2xl font-black mt-2">

          What are you doing?

        </h2>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">

        {modes.map((item) => {

          const active = mode === item.title;

          return (

            <button
              key={item.id}
              onClick={() => setMode(item.title)}
              className={`
                rounded-3xl
                p-5
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
                ${
                  active
                    ? "bg-indigo-600 text-white shadow-xl"
                    : "bg-white dark:bg-gray-900 shadow-sm"
                }
              `}
            >

              <div className="text-3xl">

                {item.icon}

              </div>

              <h3 className="mt-5 font-bold">

                {item.title}

              </h3>

              <p
                className={`mt-2 text-sm ${
                  active
                    ? "text-white/80"
                    : "text-gray-400"
                }`}
              >
                {item.desc}
              </p>

            </button>

          );

        })}

      </div>

    </section>

  );

}