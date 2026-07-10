"use client";

import { CalendarDays, Clock3, BookOpen, Flame } from "lucide-react";
import useStudyStats from "@/hooks/useStudyStats";

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs === 0) return `${mins}m`;

  return `${hrs}h ${mins}m`;
}

export default function StatsCards() {

  const {
    loading,
    todaySeconds,
    weekSeconds,
    totalSeconds,
  } = useStudyStats();

  if (loading) {

    return (

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {[1,2,3,4].map((item)=>(

          <div
            key={item}
            className="h-40 rounded-3xl bg-white dark:bg-gray-900 animate-pulse"
          />

        ))}

      </section>

    );

  }

  const stats = [

    {
      title: "Today's Study",
      value: formatTime(todaySeconds),
      subtitle: "Today's total study time",
      icon: <Clock3 size={24}/>,
      color: "from-blue-500 to-cyan-500",
    },

    {
      title: "This Week",
      value: formatTime(weekSeconds),
      subtitle: "Last 7 days",
      icon: <CalendarDays size={24}/>,
      color: "from-violet-500 to-fuchsia-500",
    },

    {
      title: "Total Study",
      value: formatTime(totalSeconds),
      subtitle: "All sessions",
      icon: <BookOpen size={24}/>,
      color: "from-emerald-500 to-green-500",
    },

    {
      title: "Current Streak",
      value: "Coming Soon",
      subtitle: "Will unlock after session tracking",
      icon: <Flame size={24}/>,
      color: "from-orange-500 to-red-500",
    },

  ];

  return (

    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

      {stats.map((item)=>(

        <div
          key={item.title}
          className="
          group
          rounded-3xl
          bg-white
          dark:bg-gray-900
          p-6
          shadow-sm
          hover:shadow-xl
          transition-all
          duration-300
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">

                {item.title}

              </p>

              <h2 className="mt-3 text-3xl font-black">

                {item.value}

              </h2>

            </div>

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                bg-gradient-to-br
                ${item.color}
                flex
                items-center
                justify-center
                text-white
                shadow-lg
              `}
            >

              {item.icon}

            </div>

          </div>

          <p className="mt-5 text-sm text-gray-400">

            {item.subtitle}

          </p>

        </div>

      ))}

    </section>

  );

}