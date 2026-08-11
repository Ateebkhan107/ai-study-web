"use client";

import { useState, useEffect } from "react";
import { BookOpen, Image as ImageIcon, Search, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, Upload, Save, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function ManagePYQs() {
  // Filters
  const [filters, setFilters] = useState({
    exam: "",
    exam_type: "",
    year: "",
    attempt: "",
    shift: "",
    subject: "",
    chapter: "",
    question_type: "",
    image_status: "",
    search: ""
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Data
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // To keep track of the current question's index in the list for Next/Prev
  const currentIndex = editingQuestion ? questions.findIndex(q => q.id === editingQuestion.id) : -1;

  useEffect(() => {
    loadQuestions();
  }, [page, limit]); // Deliberately not auto-fetching on every keystroke in filters

  async function loadQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`/api/admin/pyq?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setTotalCount(data.totalCount || 0);
      } else {
        alert(data.error || "Failed to load questions");
      }
    } catch (e) {
      alert("Error loading questions");
    }
    setLoading(false);
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset to page 1 when filter changes but don't auto load to avoid spamming API
    setPage(1);
  }

  // Edit Drawer specific
  function openEditDrawer(q) {
    setEditingQuestion({ ...q }); // clone to avoid direct mutation
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setEditingQuestion(null);
  }

  async function saveQuestion(next = false) {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pyq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion)
      });
      const data = await res.json();
      if (data.success) {
        // Update in place
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? editingQuestion : q));
        
        if (next && currentIndex < questions.length - 1) {
          setEditingQuestion({ ...questions[currentIndex + 1] });
        } else {
          // just saved, keep it open or notify
          // toast could go here
        }
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch (e) {
      alert("Error saving");
    }
    setSaving(false);
  }

  function navigateDrawer(dir) {
    if (dir === 'prev' && currentIndex > 0) {
      setEditingQuestion({ ...questions[currentIndex - 1] });
    } else if (dir === 'next' && currentIndex < questions.length - 1) {
      setEditingQuestion({ ...questions[currentIndex + 1] });
    }
  }

  async function uploadImageDirect(field, file) {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setEditingQuestion(prev => ({ ...prev, [field]: data.url }));
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (e) {
      alert("Error uploading image");
    }
  }

  const renderBadge = (label, hasImg) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mr-1 ${hasImg ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
      {hasImg ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );

  return (
    <div className="space-y-6">
      
      {/* FILTERS */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-5 rounded-2xl border dark:border-gray-800 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-black text-lg sm:text-xl flex items-center gap-2">Manage PYQs (CMS) <BookOpen className="w-6 h-6" /></h2>
          <button onClick={loadQuestions} disabled={loading} className="min-h-11 w-full rounded-lg bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black sm:w-auto">
            {loading ? "Searching..." : "Apply Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select value={filters.exam} onChange={e => handleFilterChange('exam', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm">
            <option value="">All Exams</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
          </select>
          <input placeholder="Exam Type" value={filters.exam_type} onChange={e => handleFilterChange('exam_type', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm" />
          <input type="number" placeholder="Year" value={filters.year} onChange={e => handleFilterChange('year', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm" />
          <input type="date" value={filters.attempt} onChange={e => handleFilterChange('attempt', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm text-gray-500" title="Exam Date" />
          <input placeholder="Shift" value={filters.shift} onChange={e => handleFilterChange('shift', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm" />
          <input placeholder="Subject" value={filters.subject} onChange={e => handleFilterChange('subject', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm" />
          <input placeholder="Chapter" value={filters.chapter} onChange={e => handleFilterChange('chapter', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm" />
          <select value={filters.question_type} onChange={e => handleFilterChange('question_type', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm">
            <option value="">All Question Types</option>
            <option value="MCQ">MCQ</option>
            <option value="Multiple Correct">Multiple Correct</option>
            <option value="Numerical">Numerical</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <select value={filters.image_status} onChange={e => handleFilterChange('image_status', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 w-full bg-transparent text-sm">
            <option value="">All Image Statuses</option>
            <option value="missing_any">Questions Missing Any Images</option>
            <option value="has_all">Questions With All Images</option>
            <option value="missing_question">Missing Question Image</option>
            <option value="missing_options">Missing Option Images</option>
            <option value="missing_explanation">Missing Explanation Image</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input placeholder="Search ID, text, subject..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="border dark:border-gray-700 rounded-xl p-2 pl-9 w-full bg-transparent text-sm" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="border dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0A0D1A]">
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Exam Details</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Type</th>
                <th className="p-4 min-w-[200px]">Image Status</th>
                <th className="p-4 sticky right-0 bg-gray-50 dark:bg-gray-900 z-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>}
              {!loading && questions.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No questions found.</td></tr>}
              {!loading && questions.map(q => (
                <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="p-4 font-mono text-xs">{q.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{q.exam} {q.year}</div>
                    <div className="text-xs text-gray-500">{[q.exam_type, q.attempt, q.shift, q.paper_code].filter(Boolean).join(" • ")}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold truncate max-w-[150px]">{q.subject}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{q.chapter}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{q.question_type}</span>
                  </td>
                  <td className="p-4">
                    {renderBadge("Q", !!q.question_image)}
                    {q.question_type !== 'Numerical' && renderBadge("Opts", !!(q.option_a_image || q.option_b_image || q.option_c_image || q.option_d_image))}
                    {renderBadge("Exp", !!q.explanation_image)}
                  </td>
                  <td className="p-4 sticky right-0 bg-white dark:bg-[#0A0D1A] group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 transition-colors">
                    <button onClick={() => openEditDrawer(q)} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="p-4 border-t dark:border-gray-800 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">Total: {totalCount}</span>
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="border dark:border-gray-700 bg-transparent rounded p-1 text-sm">
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="p-1 border rounded disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
            <span className="text-sm px-2">Page {page}</span>
            <button disabled={page * limit >= totalCount} onClick={() => setPage(p=>p+1)} className="p-1 border rounded disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      {/* QUICK EDIT DRAWER OVERLAY */}
      {isDrawerOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[800px] bg-white dark:bg-[#050816] h-full shadow-2xl flex flex-col animate-slideLeft border-l dark:border-gray-800">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b dark:border-gray-800 flex items-start justify-between gap-3 sticky top-0 bg-white dark:bg-[#050816] z-10">
              <div className="min-w-0">
                <h3 className="break-words font-black text-base sm:text-lg">Edit Question #{editingQuestion.id}</h3>
                <p className="text-xs text-gray-500">{editingQuestion.exam} {editingQuestion.year} • {editingQuestion.subject}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button disabled={currentIndex <= 0} onClick={() => navigateDrawer('prev')} className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                <button disabled={currentIndex >= questions.length - 1} onClick={() => navigateDrawer('next')} className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2"></div>
                <button onClick={closeDrawer} className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><X className="w-4 h-4"/></button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
              
              {/* Preview Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-5 rounded-xl border dark:border-gray-800">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Student Preview</h4>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{editingQuestion.question || "*No question text*"}</ReactMarkdown>
                  {editingQuestion.question_image && <img src={editingQuestion.question_image} alt="Q" className="max-h-48 rounded my-2 object-contain" />}
                  
                  {editingQuestion.question_type !== 'Numerical' && (
                    <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2">
                      {['a','b','c','d'].map(opt => {
                        const txt = editingQuestion[`option_${opt}`];
                        const img = editingQuestion[`option_${opt}_image`];
                        if (!txt && !img) return null;
                        return (
                          <div key={opt} className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-[#0A0D1A]">
                            <span className="font-bold mr-2 uppercase">{opt}.</span>
                            {txt && <span className="inline"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{txt}</ReactMarkdown></span>}
                            {img && <img src={img} alt={opt} className="max-h-24 rounded mt-2 object-contain" />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg text-xs">
                    <strong>Correct Answer: </strong> 
                    {editingQuestion.question_type === 'Numerical' 
                      ? `${editingQuestion.numerical_answer} (Min: ${editingQuestion.numerical_min}, Max: ${editingQuestion.numerical_max})` 
                      : (editingQuestion.correct_option || (editingQuestion.correct_options && editingQuestion.correct_options.join(", ")))}
                  </div>
                </div>
              </div>

              {/* Editor Section */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edit Content & Images</h4>
                
                {/* Question */}
                <div className="space-y-2">
                  <label className="text-sm font-bold">Question Text</label>
                  <textarea value={editingQuestion.question || ""} onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})} className="w-full border dark:border-gray-700 rounded-lg p-3 bg-transparent h-24 text-sm" />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <input type="file" accept="image/*" onChange={e => uploadImageDirect('question_image', e.target.files[0])} className="text-xs w-full max-w-xs" />
                    {editingQuestion.question_image && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Image Uploaded</span>}
                  </div>
                </div>

                {/* Options (if not numerical) */}
                {editingQuestion.question_type !== 'Numerical' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {['a','b','c','d'].map(opt => (
                      <div key={opt} className="space-y-2 p-4 border dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                        <label className="text-sm font-bold uppercase">Option {opt}</label>
                        <textarea value={editingQuestion[`option_${opt}`] || ""} onChange={e => setEditingQuestion({...editingQuestion, [`option_${opt}`]: e.target.value})} className="w-full border dark:border-gray-700 rounded-lg p-2 bg-transparent text-sm h-16" />
                        <div className="flex flex-col gap-2">
                          <input type="file" accept="image/*" onChange={e => uploadImageDirect(`option_${opt}_image`, e.target.files[0])} className="text-xs" />
                          {editingQuestion[`option_${opt}_image`] && <span className="text-xs text-green-500">Image Uploaded</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                <div className="space-y-2">
                  <label className="text-sm font-bold">Explanation</label>
                  <textarea value={editingQuestion.explanation || ""} onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})} className="w-full border dark:border-gray-700 rounded-lg p-3 bg-transparent h-24 text-sm" />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <input type="file" accept="image/*" onChange={e => uploadImageDirect('explanation_image', e.target.files[0])} className="text-xs w-full max-w-xs" />
                    {editingQuestion.explanation_image && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Image Uploaded</span>}
                  </div>
                </div>

              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-5 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky bottom-0 z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={closeDrawer} className="min-h-11 px-5 py-2 rounded-lg font-bold text-sm">Cancel</button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={() => saveQuestion(false)} disabled={saving} className="min-h-11 justify-center bg-gray-200 dark:bg-gray-800 px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2">
                  <Save className="w-4 h-4"/> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => saveQuestion(true)} disabled={saving || currentIndex >= questions.length - 1} className="min-h-11 justify-center bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4"/> {saving ? "Saving..." : "Save & Next"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
