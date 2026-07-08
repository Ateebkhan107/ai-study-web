"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardSection({ config }) {
  const [formulaBooks, setFormulaBooks] = useState([]);

  const isNeet = config?.badge?.toLowerCase().includes("neet");

  // LOAD FORMULA BOOKS FROM SUPABASE
  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch("/api/formula-books");
        const data = await res.json();

        setFormulaBooks(data);
      } catch (error) {
        console.error("Formula books loading failed:", error);
      }
    }

    loadBooks();
  }, []);


  // FILTER BASED ON TRACK
  const filteredFormulas = formulaBooks.filter((book) =>
    isNeet ? book.stream === "NEET" : book.stream === "JEE"
  );


  return (
    <div className="grid grid-cols-1 gap-6 items-start">

      {/* FORMULA CARDS */}

      <div className="space-y-4">

        {/* Header */}

        <div className="flex items-center justify-between">

          <h2 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Formula Cards
          </h2>


          <Link
            href="/formula-books"
            className="text-[12px] font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            View all →
          </Link>

        </div>



        {/* Formula Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredFormulas.length > 0 ? (

            filteredFormulas.map((book) => (

              <Link
                href={`/formula-books/${book.id}`}
                key={book.id}
                className="block group"
              >

                <div className="bg-white dark:bg-[#13162a] border border-gray-100 dark:border-[#252840] rounded-xl p-4 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-150 shadow-sm flex flex-col gap-3 min-h-[130px]">


                  {/* Top Row */}

                  <div className="flex items-center justify-between">


                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">

                      {book.subject}

                    </span>



                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1e2238] border border-gray-100 dark:border-[#252840] px-2 py-0.5 rounded-full">

                      {book.tag}

                    </span>


                  </div>



                  {/* Title */}

                  <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-snug">

                    {book.title}

                  </p>




                  {/* Formula Box */}

                  <div className="bg-gray-50 dark:bg-[#1e2238] border border-gray-100 dark:border-[#252840] rounded-lg px-3 py-2">


                    <p className="font-mono text-[12px] font-bold text-gray-900 dark:text-white">

                      {book.formula}

                    </p>


                    {book.sub && (

                      <p className="font-mono text-[10px] text-gray-400 mt-0.5">

                        {book.sub}

                      </p>

                    )}

                  </div>


                </div>

              </Link>

            ))

          ) : (

            <div className="text-sm text-gray-400 py-6">

              No formula cards available

            </div>

          )}


        </div>


      </div>


    </div>
  );
}