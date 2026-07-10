"use client";

import {
  Clock3,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import useRecentSessions from "@/hooks/useRecentSessions";

function formatDuration(seconds) {

  if (!seconds) return "0m";

  const hrs = Math.floor(seconds / 3600);

  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs === 0) return `${mins}m`;

  return `${hrs}h ${mins}m`;

}

function formatDate(dateString) {

  if (!dateString) return "";

  const date = new Date(dateString);

  const today = new Date();

  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {

    return "Today";

  }

  if (date.toDateString() === yesterday.toDateString()) {

    return "Yesterday";

  }

  return date.toLocaleDateString();

}

export default function RecentSessions() {

  const {

    loading,

    sessions,

  } = useRecentSessions();

  return (

    <section className="rounded-[30px] bg-white dark:bg-gray-900 shadow-sm p-7">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">

            History

          </p>

          <h2 className="text-2xl font-black mt-2">

            Recent Sessions

          </h2>

        </div>

      </div>

      {loading ? (

        <div className="space-y-4 mt-7">

          {[1,2,3].map((i)=>(

            <div
              key={i}
              className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />

          ))}

        </div>

      ) : sessions.length === 0 ? (

        <div className="text-center py-12">

          <BookOpen
            size={42}
            className="mx-auto text-gray-300"
          />

          <h3 className="font-bold mt-4">

            No study sessions yet

          </h3>

          <p className="text-gray-500 text-sm mt-2">

            Start your first focus session to build your history.

          </p>

        </div>

      ) : (

        <div className="space-y-4 mt-7">

          {sessions.map((session)=>(

            <div
              key={session.id}
              className="group rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-5 hover:bg-white dark:hover:bg-gray-800 transition-all"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-xl">

                  📚

                </div>

                <div className="flex-1">

                  <div className="flex justify-between">

                    <h3 className="font-bold">

                      {session.subject}

                    </h3>

                    <ChevronRight
                      size={18}
                      className="opacity-0 group-hover:opacity-100 transition"
                    />

                  </div>

                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">

                    <BookOpen size={14} />

                    {session.study_mode}

                  </div>

                </div>

              </div>

              <div className="flex items-center justify-between mt-5">

                <div className="flex items-center gap-2 text-sm text-gray-500">

                  <Clock3 size={14} />

                  {formatDuration(session.duration_seconds)}

                </div>

                <span className="text-xs text-gray-400">

                  {formatDate(session.started_at)}

                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>

  );

}