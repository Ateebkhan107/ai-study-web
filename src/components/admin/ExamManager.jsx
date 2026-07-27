import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

export default function ExamManager() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    exam: "JEE",
    year: "",
    exam_type: "MAIN",
    attempt: "",
    exam_date: "",
    shift: "",
    paper_code: "",
    duration: 180,
    total_marks: 300,
    instructions: "",
    status: "PUBLISHED"
  });

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exams");
      const data = await res.json();
      if (data.exams) setExams(data.exams);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function createExam(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert("Exam created!");
        loadExams();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create exam");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  async function deleteExam(id) {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await fetch("/api/admin/exams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        loadExams();
      } else {
        alert("Failed to delete exam");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-5 border rounded-xl p-5">
      <h2 className="font-black text-xl flex items-center gap-2">
        Exam Manager <BookOpen className="w-6 h-6" />
      </h2>
      
      <form onSubmit={createExam} className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="Exam (e.g. JEE)" value={form.exam} onChange={e => setForm({...form, exam: e.target.value})} className="border p-3 rounded-xl bg-transparent" required />
        <input type="number" placeholder="Year (e.g. 2024)" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="border p-3 rounded-xl bg-transparent" required />
        <input type="text" placeholder="Exam Type (MAIN, ADVANCED, UG)" value={form.exam_type} onChange={e => setForm({...form, exam_type: e.target.value})} className="border p-3 rounded-xl bg-transparent" required />
        <input type="text" placeholder="Attempt (e.g. Session 1)" value={form.attempt} onChange={e => setForm({...form, attempt: e.target.value})} className="border p-3 rounded-xl bg-transparent" />
        <input type="text" placeholder="Shift (e.g. SHIFT 1)" value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} className="border p-3 rounded-xl bg-transparent" />
        <input type="date" placeholder="Exam Date" value={form.exam_date} onChange={e => setForm({...form, exam_date: e.target.value})} className="border p-3 rounded-xl bg-transparent" />
        <input type="text" placeholder="Paper Code" value={form.paper_code} onChange={e => setForm({...form, paper_code: e.target.value})} className="border p-3 rounded-xl bg-transparent" />
        <input type="number" placeholder="Duration (mins)" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="border p-3 rounded-xl bg-transparent" />
        <input type="number" placeholder="Total Marks" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} className="border p-3 rounded-xl bg-transparent" />
        <button type="submit" className="col-span-2 bg-blue-600 text-white font-bold py-3 rounded-xl">Create Exam</button>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="font-bold text-lg">Existing Exams</h3>
        {loading ? <p>Loading exams...</p> : (
          exams.map(exam => (
            <div key={exam.id} className="border p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold">{exam.exam} {exam.year} - {exam.exam_type}</p>
                <p className="text-sm text-gray-500">
                  {exam.shift && `Shift: ${exam.shift} | `}
                  {exam.exam_date && `Date: ${exam.exam_date} | `}
                  Status: {exam.status} | Questions: {exam.question_count} | 
                  Last Updated: {new Date(exam.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => deleteExam(exam.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
