import { useState, useEffect } from "react";
import { BookOpen, Edit2, Check, X } from "lucide-react";

export default function QuestionManager({ defaultTab = "import" }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'import' or 'manage'
  
  // IMPORT STATES
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);

  // MANAGE STATES
  const [questions, setQuestions] = useState([]);
  const [loadingQs, setLoadingQs] = useState(false);
  
  // Filters
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterImageStatus, setFilterImageStatus] = useState(""); // 'all', 'missing', 'complete'
  const [filterSearch, setFilterSearch] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (activeTab === "manage" && selectedExamId) {
      loadQuestions();
    }
  }, [activeTab, selectedExamId]);

  async function loadExams() {
    try {
      const res = await fetch("/api/admin/exams");
      const data = await res.json();
      if (data.exams) setExams(data.exams);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCsvUpload(e) {
    e.preventDefault();
    if (!csvFile) return alert("Please select a CSV file");
    if (!selectedExamId) return alert("Please select an Exam first");

    setUploading(true);
    setSummary(null);

    try {
      console.log("=== CSV IMPORT EXAM VALIDATION ===");
      const selectedExam = exams.find(e => e.id === selectedExamId);
      console.log("Selected exam:", selectedExam);
      console.log("Sending exam_id:", selectedExamId);
      
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("exam_id", selectedExamId);
      
      console.log("FormData being sent:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch("/api/admin/pyq-upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setSummary({
          count: data.count,
          skipped: data.skipped,
          missingImages: data.missingImages
        });
        setCsvFile(null);
        if (activeTab === "manage") loadQuestions();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Frontend caught error:", error);
      alert(`Error: ${error.message || "Something went wrong"}`);
    }

    setUploading(false);
  }

  async function loadQuestions() {
    setLoadingQs(true);
    try {
      console.log(`[QuestionManager] Fetching questions for exam_id: ${selectedExamId}`);
      const res = await fetch(`/api/admin/pyq?exam_id=${selectedExamId}&limit=1000`);
      const data = await res.json();
      console.log("[QuestionManager] API Response:", data);
      
      if (data.questions && Array.isArray(data.questions)) {
        console.log(`[QuestionManager] Setting ${data.questions.length} questions from data.questions`);
        setQuestions(data.questions);
      } else if (Array.isArray(data)) {
        console.log(`[QuestionManager] Setting ${data.length} questions from raw array`);
        setQuestions(data);
      } else {
        console.warn("[QuestionManager] Unexpected data format:", data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingQs(false);
  }

  async function saveQuestion(id) {
    try {
      const res = await fetch("/api/admin/pyq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm })
      });
      if (res.ok) {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...editForm } : q));
        setEditingId(null);
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving");
    }
  }

  const filteredQuestions = questions.filter(q => {
    if (filterSubject && q.subject?.toLowerCase() !== filterSubject.toLowerCase()) return false;
    if (filterChapter && !q.chapter?.toLowerCase().includes(filterChapter.toLowerCase())) return false;
    if (filterType && q.question_type !== filterType) return false;
    if (filterSearch && !q.question?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    
    if (filterImageStatus === "missing") {
      const missing = !q.question_image && !q.option_a_image && !q.option_b_image && !q.option_c_image && !q.option_d_image && !q.explanation_image;
      if (!missing) return false;
    }
    if (filterImageStatus === "complete") {
      const missing = !q.question_image && !q.option_a_image && !q.option_b_image && !q.option_c_image && !q.option_d_image && !q.explanation_image;
      if (missing) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-5 border rounded-xl p-5">
      <div className="flex justify-between items-center hidden">
        <h2 className="font-black text-xl flex items-center gap-2">
          Question Manager <BookOpen className="w-6 h-6" />
        </h2>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            className={`px-4 py-1 rounded-md text-sm font-bold ${activeTab === 'import' ? 'bg-white dark:bg-black shadow' : 'text-gray-500'}`}
            onClick={() => setActiveTab('import')}
          >
            Import CSV
          </button>
          <button 
            className={`px-4 py-1 rounded-md text-sm font-bold ${activeTab === 'manage' ? 'bg-white dark:bg-black shadow' : 'text-gray-500'}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Questions
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Target Exam</label>
        <select 
          value={selectedExamId} 
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="w-full border p-3 rounded-xl bg-transparent"
        >
          <option value="">-- Select an Exam First --</option>
          {exams.map(exam => (
            <option key={exam.id} value={exam.id}>
              {exam.exam} {exam.year} {exam.exam_type}
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'import' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Upload a simplified CSV file containing ONLY question data. It will automatically inherit all metadata from the selected Exam above.
          </p>

          <form onSubmit={handleCsvUpload} className="space-y-4">
            <div className="border-2 border-dashed p-6 rounded-xl text-center">
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="w-full"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading || !selectedExamId}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {uploading ? "Importing..." : "Import Questions"}
            </button>
          </form>

          {summary && (
            <div className="mt-6 p-6 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl space-y-4">
              <h3 className="font-black text-green-700 dark:text-green-400 text-lg">Import Successful</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Imported:</strong> {summary.count}</p>
                <p><strong>Skipped Duplicates:</strong> {summary.skipped}</p>
                <p><strong>Failed:</strong> 0</p>
                <p className="text-red-500 font-bold"><strong>Questions Missing Images:</strong> {summary.missingImages || 0}</p>
              </div>
              
              <button 
                onClick={() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="bg-black dark:bg-white dark:text-black text-white px-5 py-2 rounded-lg font-bold"
              >
                Go to Image Manager ↓
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <input 
              placeholder="Search text..." 
              value={filterSearch} 
              onChange={e => setFilterSearch(e.target.value)}
              className="border p-2 rounded bg-transparent text-sm"
            />
            <input 
              placeholder="Subject" 
              value={filterSubject} 
              onChange={e => setFilterSubject(e.target.value)}
              className="border p-2 rounded bg-transparent text-sm"
            />
            <input 
              placeholder="Chapter" 
              value={filterChapter} 
              onChange={e => setFilterChapter(e.target.value)}
              className="border p-2 rounded bg-transparent text-sm"
            />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="border p-2 rounded bg-transparent text-sm"
            >
              <option value="">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="NUMERICAL">Numerical</option>
            </select>
            <select 
              value={filterImageStatus} 
              onChange={e => setFilterImageStatus(e.target.value)}
              className="border p-2 rounded bg-transparent text-sm"
            >
              <option value="all">Any Image Status</option>
              <option value="missing">Missing Images</option>
              <option value="complete">Has Images</option>
            </select>
          </div>

          <div className="text-sm font-bold text-gray-500">
            Showing {filteredQuestions.length} questions
          </div>

          <div className="space-y-4">
            {loadingQs ? <p>Loading questions...</p> : filteredQuestions.map(q => (
              <div key={q.id} className="border p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                {editingId === q.id ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input className="border p-2 rounded flex-1 text-sm bg-white dark:bg-black" value={editForm.subject || ''} onChange={e => setEditForm({...editForm, subject: e.target.value})} placeholder="Subject" />
                      <input className="border p-2 rounded flex-1 text-sm bg-white dark:bg-black" value={editForm.chapter || ''} onChange={e => setEditForm({...editForm, chapter: e.target.value})} placeholder="Chapter" />
                      <select className="border p-2 rounded text-sm bg-white dark:bg-black" value={editForm.question_type || ''} onChange={e => setEditForm({...editForm, question_type: e.target.value})}>
                        <option value="MCQ">MCQ</option>
                        <option value="NUMERICAL">NUMERICAL</option>
                      </select>
                    </div>
                    <textarea 
                      className="w-full border p-2 rounded text-sm bg-white dark:bg-black min-h-[100px]" 
                      value={editForm.question || ''} 
                      onChange={e => setEditForm({...editForm, question: e.target.value})} 
                      placeholder="Question Text"
                    />
                    
                    {editForm.question_type === 'MCQ' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input className="border p-2 rounded text-sm bg-white dark:bg-black" value={editForm.option_a || ''} onChange={e => setEditForm({...editForm, option_a: e.target.value})} placeholder="Option A" />
                        <input className="border p-2 rounded text-sm bg-white dark:bg-black" value={editForm.option_b || ''} onChange={e => setEditForm({...editForm, option_b: e.target.value})} placeholder="Option B" />
                        <input className="border p-2 rounded text-sm bg-white dark:bg-black" value={editForm.option_c || ''} onChange={e => setEditForm({...editForm, option_c: e.target.value})} placeholder="Option C" />
                        <input className="border p-2 rounded text-sm bg-white dark:bg-black" value={editForm.option_d || ''} onChange={e => setEditForm({...editForm, option_d: e.target.value})} placeholder="Option D" />
                        <input className="border p-2 rounded text-sm bg-white dark:bg-black col-span-2 font-bold text-green-600" value={editForm.correct_option || ''} onChange={e => setEditForm({...editForm, correct_option: e.target.value})} placeholder="Correct Option (A, B, C, D)" />
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input className="border p-2 rounded flex-1 text-sm bg-white dark:bg-black" value={editForm.numerical_answer || ''} onChange={e => setEditForm({...editForm, numerical_answer: e.target.value})} placeholder="Numerical Answer" />
                      </div>
                    )}

                    <textarea 
                      className="w-full border p-2 rounded text-sm bg-white dark:bg-black" 
                      value={editForm.explanation || ''} 
                      onChange={e => setEditForm({...editForm, explanation: e.target.value})} 
                      placeholder="Explanation"
                    />

                    <div className="flex gap-2">
                      <input className="border p-2 rounded w-24 text-sm bg-white dark:bg-black" value={editForm.marks_positive || ''} onChange={e => setEditForm({...editForm, marks_positive: e.target.value})} placeholder="+ Marks" />
                      <input className="border p-2 rounded w-24 text-sm bg-white dark:bg-black" value={editForm.marks_negative || ''} onChange={e => setEditForm({...editForm, marks_negative: e.target.value})} placeholder="- Marks" />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => saveQuestion(q.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-300 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 text-xs font-bold text-gray-500 uppercase">
                        <span className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{q.subject}</span>
                        <span className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{q.chapter}</span>
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-1 rounded">{q.question_type}</span>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">+{q.marks_positive} / -{q.marks_negative}</span>
                      </div>
                      <button 
                        onClick={() => { setEditingId(q.id); setEditForm(q); }} 
                        className="text-blue-500 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium text-sm mb-2">{q.question}</p>
                    {q.question_type === 'MCQ' && (
                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                        <p>A: {q.option_a}</p>
                        <p>B: {q.option_b}</p>
                        <p>C: {q.option_c}</p>
                        <p>D: {q.option_d}</p>
                        <p className="font-bold text-green-600">Correct: {q.correct_option}</p>
                      </div>
                    )}
                    {q.question_type === 'NUMERICAL' && (
                      <p className="text-xs font-bold text-green-600">Answer: {q.numerical_answer}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
