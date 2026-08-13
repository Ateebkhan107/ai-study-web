"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("ALL");

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/students?search=${encodeURIComponent(search)}&track=${track}`);
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }

    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      loadStudents();
    }, 300);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, track]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
          Student Directory <Users className="w-6 h-6" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage student profiles, XP, and ranks.</p>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border py-3 pl-10 pr-4 rounded-xl bg-transparent"
            />
          </div>
          <div className="relative md:w-64">
            <Filter className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <select 
              value={track} 
              onChange={(e) => setTrack(e.target.value)}
              className="w-full border py-3 pl-10 pr-4 rounded-xl bg-transparent appearance-none"
            >
              <option value="ALL">All Tracks</option>
              <option value="JEE">JEE Track</option>
              <option value="NEET">NEET Track</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="p-3 text-sm font-bold text-gray-500 uppercase">Student</th>
                <th className="p-3 text-sm font-bold text-gray-500 uppercase">Exam</th>
                <th className="p-3 text-sm font-bold text-gray-500 uppercase">XP & Level</th>
                <th className="p-3 text-sm font-bold text-gray-500 uppercase">Activity</th>
                <th className="p-3 text-sm font-bold text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500 border-dashed border-2 rounded-xl">No students found matching your criteria.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold">{student.full_name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{student.email || "No email"}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-bold">
                        {student.exam || "Not Set"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-purple-600 dark:text-purple-400">Level {student.current_level}</div>
                      <div className="text-xs text-gray-500">{student.xp?.toLocaleString()} XP • {student.rank_name || "Unranked"}</div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="font-semibold">{student.badges_count || 0} Badges</div>
                      <div className="text-xs text-gray-500">{student.tests_taken || 0} Tests Taken</div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
