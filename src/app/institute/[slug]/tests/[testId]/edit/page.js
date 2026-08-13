"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Check, Loader2, Save, X, Upload,
  Camera, FileSpreadsheet, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500";
const labelCls = "mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400";

const CSV_TEMPLATE_HEADERS = "question_text,option_a,option_b,option_c,option_d,correct_option,difficulty,subject,chapter,marks,negative_marks";
const CSV_TEMPLATE_EXAMPLE = `What is Newton's second law?,F=ma,F=mv,F=ma²,F=m/a,A,Medium,Physics,Laws of Motion,4,1
What is H2O?,Water,Oxygen,Hydrogen,Air,A,Easy,Chemistry,Chemical Formulas,4,1`;

function downloadCsvTemplate() {
  const content = CSV_TEMPLATE_HEADERS + "\n" + CSV_TEMPLATE_EXAMPLE;
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function TestEditorPage({ params }) {
  const { slug, testId } = use(params);
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Modal state
  const [modal, setModal] = useState(null); // "add" | "csv"

  // Add Question form
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    question_image: null,
    option_a: "", option_a_image: null,
    option_b: "", option_b_image: null,
    option_c: "", option_c_image: null,
    option_d: "", option_d_image: null,
    correct_option: "A",
    marks: 4,
    negative_marks: 1,
    difficulty: "Medium",
    subject: "",
    chapter: "",
  });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [uploadingImage, setUploadingImage] = useState({});

  // CSV import
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const csvInputRef = useRef(null);

  useEffect(() => {
    async function loadTest() {
      setLoading(true);
      try {
        const res = await fetch(`/api/institutes/${slug}/tests/${testId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load test");
        setTest(data.test);
        setQuestionForm(prev => ({ ...prev, subject: data.test.subject || "" }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, testId]);

  async function uploadImage(field, file) {
    if (!file) return;
    setUploadingImage(prev => ({ ...prev, [field]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/institutes/${slug}/upload-image`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setQuestionForm(prev => ({ ...prev, [field]: data.url }));
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(prev => ({ ...prev, [field]: false }));
    }
  }

  async function addQuestion(e) {
    e.preventDefault();
    setAddingQuestion(true);
    try {
      const res = await fetch(`/api/institutes/${slug}/tests/${testId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...questionForm,
          exam: test.exam,
          subject: questionForm.subject || test.subject,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add question");
      setModal(null);
      setQuestionForm(prev => ({
        ...prev,
        question_text: "", question_image: null,
        option_a: "", option_a_image: null,
        option_b: "", option_b_image: null,
        option_c: "", option_c_image: null,
        option_d: "", option_d_image: null,
        correct_option: "A", marks: 4, negative_marks: 1, difficulty: "Medium",
      }));
      loadTest();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingQuestion(false);
    }
  }

  async function importCsv(e) {
    e.preventDefault();
    if (!csvFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch(`/api/institutes/${slug}/tests/${testId}/import-csv`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportResult({ success: true, count: data.imported });
      setCsvFile(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
      loadTest();
    } catch (err) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  }

  async function publishTest() {
    if (!test?.questions?.length) {
      alert("Add at least one question before publishing.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/institutes/${slug}/tests/${testId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      router.push(`/institute/${slug}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  if (error || !test) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-[#0a0a0a]">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-red-500 font-semibold">{error || "Test not found"}</p>
      <Link href={`/institute/${slug}`} className="text-indigo-600 hover:underline text-sm">← Go back to dashboard</Link>
    </div>
  );

  const questions = test.questions || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/institute/${slug}`} className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-black text-slate-900 dark:text-white sm:text-lg">{test.title}</h1>
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Draft</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{test.exam} • {test.subject} • {test.duration_minutes} mins • {questions.length} questions</p>
            </div>
          </div>
          <button
            onClick={publishTest}
            disabled={publishing || questions.length === 0}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Questions <span className="text-slate-400">({questions.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModal("csv")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              Import CSV
            </button>
            <button
              onClick={() => setModal("add")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Empty state */}
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Plus className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mb-2 text-base font-black text-slate-700 dark:text-slate-200">No questions yet</h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Add questions manually or import them from a CSV file.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal("csv")} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />Import CSV
              </button>
              <button onClick={() => setModal("add")} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                <Plus className="h-4 w-4" />Add Question
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard key={q.id} q={q} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {modal === "add" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Add Question</h2>
              <button onClick={() => setModal(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addQuestion} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">
                  {/* Question Text */}
                  <div>
                    <label className={labelCls}>Question Text</label>
                    <textarea
                      required
                      rows={4}
                      value={questionForm.question_text}
                      onChange={e => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                      placeholder="Enter question here..."
                      className={inputCls}
                    />
                  </div>

                  {/* Question Image */}
                  <ImageUploadField
                    label="Question Image (optional)"
                    field="question_image"
                    value={questionForm.question_image}
                    uploading={uploadingImage.question_image}
                    onUpload={uploadImage}
                  />

                  {/* Options */}
                  <div>
                    <label className={labelCls}>Options</label>
                    <div className="space-y-3">
                      {["a", "b", "c", "d"].map(opt => (
                        <div key={opt} className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${questionForm.correct_option === opt.toUpperCase() ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                              {opt.toUpperCase()}
                            </span>
                            <input
                              required
                              value={questionForm[`option_${opt}`]}
                              onChange={e => setQuestionForm(prev => ({ ...prev, [`option_${opt}`]: e.target.value }))}
                              placeholder={`Option ${opt.toUpperCase()}`}
                              className={inputCls}
                            />
                          </div>
                          <div className="ml-9">
                            <ImageUploadField
                              label=""
                              field={`option_${opt}_image`}
                              value={questionForm[`option_${opt}_image`]}
                              uploading={uploadingImage[`option_${opt}_image`]}
                              onUpload={uploadImage}
                              compact
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Option */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelCls}>Correct Option</label>
                      <select
                        value={questionForm.correct_option}
                        onChange={e => setQuestionForm(prev => ({ ...prev, correct_option: e.target.value }))}
                        className={inputCls}
                      >
                        {["A", "B", "C", "D"].map(o => <option key={o} value={o}>Option {o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Marks</label>
                      <input type="number" min="1" value={questionForm.marks} onChange={e => setQuestionForm(prev => ({ ...prev, marks: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Negative Marks</label>
                      <input type="number" min="0" value={questionForm.negative_marks} onChange={e => setQuestionForm(prev => ({ ...prev, negative_marks: e.target.value }))} className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Subject</label>
                      <input value={questionForm.subject} onChange={e => setQuestionForm(prev => ({ ...prev, subject: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Chapter</label>
                      <input value={questionForm.chapter} onChange={e => setQuestionForm(prev => ({ ...prev, chapter: e.target.value }))} placeholder="e.g. Kinematics" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <button type="button" onClick={() => setModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button
                  type="submit"
                  disabled={addingQuestion}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {modal === "csv" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Import from CSV</h2>
              <button onClick={() => { setModal(null); setImportResult(null); setCsvFile(null); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/20">
                <p className="mb-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">Required CSV columns:</p>
                <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
                  question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, subject, chapter, marks, negative_marks
                </p>
                <button onClick={downloadCsvTemplate} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Download template CSV
                </button>
              </div>

              <form onSubmit={importCsv} className="space-y-4">
                <div
                  className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
                  onClick={() => csvInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  {csvFile ? (
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{csvFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to select CSV file</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">or drag and drop</p>
                    </>
                  )}
                  <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files[0] || null)} />
                </div>

                {importResult && (
                  <div className={`flex items-start gap-3 rounded-xl p-4 ${importResult.success ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                    {importResult.success ? (
                      <>
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          Successfully imported {importResult.count} question{importResult.count !== 1 ? "s" : ""}!
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                        <p className="text-sm font-bold text-red-700 dark:text-red-300">{importResult.error}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setModal(null); setImportResult(null); setCsvFile(null); }} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                  <button
                    type="submit"
                    disabled={!csvFile || importing}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ImageUploadField({ label, field, value, uploading, onUpload, compact }) {
  return (
    <div className={compact ? "" : "space-y-1.5"}>
      {label && <label className={labelCls}>{label}</label>}
      <div className="flex items-center gap-2">
        {value ? (
          <img src={value} alt="" className="h-10 w-16 rounded-lg border border-slate-200 object-contain dark:border-slate-700" />
        ) : null}
        <label className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-500 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          {value ? "Change" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={e => e.target.files[0] && onUpload(field, e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
}

function QuestionCard({ q, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        className="flex w-full items-start gap-4 p-5 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{q.question_text}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">{q.difficulty || "Medium"}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">+{q.marks}</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">-{q.negative_marks}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-5 dark:border-slate-800">
          {q.question_image && (
            <img src={q.question_image} alt="Question" className="mb-4 mt-3 max-h-48 rounded-xl border border-slate-200 object-contain dark:border-slate-700" />
          )}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {["a", "b", "c", "d"].map(opt => {
              const isCorrect = q.correct_option?.toUpperCase() === opt.toUpperCase();
              return (
                <div
                  key={opt}
                  className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${isCorrect ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20" : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"}`}
                >
                  <span className={`shrink-0 text-xs font-black ${isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>{opt.toUpperCase()}.</span>
                  <div className="min-w-0">
                    <p className={`text-sm ${isCorrect ? "font-bold text-emerald-800 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>{q[`option_${opt}`]}</p>
                    {q[`option_${opt}_image`] && (
                      <img src={q[`option_${opt}_image`]} alt={`Option ${opt}`} className="mt-1.5 max-h-20 rounded-lg object-contain" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
