"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ArrowRight, Save, CheckCircle, XCircle, 
  AlertTriangle, Image as ImageIcon, Layout, Type, 
  Loader2, FileText, Trash2, ShieldCheck
} from "lucide-react";

export default function ReviewQueuePage() {
  const { id } = useParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // Form state for current question
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/admin/pyq?import_package_id=${id}&limit=1000`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to load questions");
        const data = result.questions || [];
        setQuestions(data || []);
        if (data && data.length > 0) {
          setFormData(data[0]);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (questions.length > 0) {
      setFormData(questions[currentIndex]);
      setCompareMode(false);
    }
  }, [currentIndex, questions]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const imageMode = (() => {
    const text = String(formData?.question || "").trim();
    const hasStructuredText = text && !/refer to (the )?(source|question) image/i.test(text);
    if (hasStructuredText && formData?.question_image) return "TEXT + REQUIRED IMAGE";
    if (hasStructuredText) return "TEXT ONLY";
    return formData?.question_image ? "IMAGE ONLY" : "TEXT ONLY";
  })();

  const removeImage = async (field) => {
    const label = field === "question_image" ? "question image" : "solution image";
    if (!confirm(`Remove this ${label} from the question? The storage file will not be deleted yet.`)) return;

    const previousUrl = formData[field];
    try {
      const response = await fetch("/api/admin/pyq/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: formData.id, field }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Failed to remove ${label}`);

      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = { ...updatedQuestions[currentIndex], [field]: null };
      setQuestions(updatedQuestions);
      setFormData(prev => ({ ...prev, [field]: null }));

      if (result.canDeleteStorage && previousUrl) {
        const shouldDelete = confirm("This storage object has zero remaining question references. Permanently delete it from Supabase Storage?");
        if (shouldDelete) {
          const deleteResponse = await fetch("/api/admin/pyq/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: formData.id,
              field,
              imageUrl: previousUrl,
              deleteStorage: true,
              confirmDelete: true,
            }),
          });
          const deleteResult = await deleteResponse.json();
          if (!deleteResponse.ok) throw new Error(deleteResult.error || "Storage deletion failed");
          alert("Image unlinked and storage object deleted.");
        }
      } else if (result.referencesRemaining > 0) {
        alert(`Image unlinked. Storage was kept because ${result.referencesRemaining} other reference(s) still use it.`);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || `Failed to remove ${label}`);
    }
  };

  const saveQuestion = async (newStatus = null) => {
    setSaving(true);
    const dataToSave = { ...formData };
    if (newStatus) dataToSave.status = newStatus;

    try {
      const response = await fetch("/api/admin/pyq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save question");

      // Update local state
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = dataToSave;
      setQuestions(updatedQuestions);
      setFormData(dataToSave);
      
      return true;
    } catch (e) {
      console.error(e);
      alert("Failed to save question");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    const success = await saveQuestion();
    if (success && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleApprove = async () => {
    const success = await saveQuestion("APPROVED");
    if (success && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleReject = async () => {
    const success = await saveQuestion("REJECTED");
    if (success && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNeedsReview = async () => {
    const success = await saveQuestion("NEEDS_REVIEW");
    if (success && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-xl font-bold">No questions found in this package</h2>
        <Link href={`/admin/imports/${id}`} className="text-purple-600 mt-4 inline-block">Go Back</Link>
      </div>
    );
  }

  if (!formData) return null;

  // Validation logic
  const hasImage = !!formData.question_image;
  const hasText = !!formData.question && formData.question.trim().length > 0;
  const hasOptions = !!formData.option_a && !!formData.option_b && !!formData.option_c && !!formData.option_d;
  const hasCorrect = !!formData.correct_option;
  const hasSubject = !!formData.subject;
  const hasChapter = !!formData.chapter && !formData.chapter.includes("Core");
  const hasSolution = (!!formData.explanation && formData.explanation.trim().length > 0) || !!formData.explanation_image;
  
  const issues = [];
  if (!hasImage && !hasText) issues.push("Missing Question Image and Text");
  if (!hasOptions) issues.push("Missing one or more Options");
  if (!hasCorrect) issues.push("Missing Correct Option");
  if (!hasSubject) issues.push("Missing Subject");
  if (!hasChapter) issues.push("Unmapped Chapter");
  if (!hasSolution) issues.push("Missing Solution (Image or Text)");

  // Intelligent Chapter mapping logic (simple keyword matcher based on previous scripts)
  const suggestChapter = () => {
    const txt = (formData.question || "") + " " + (formData.explanation || "");
    const comb = txt.toLowerCase();
    if (formData.subject === 'Physics') {
      if (comb.includes('capacitor') || comb.includes('electric field')) return 'Electrostatics & Capacitance';
      if (comb.includes('current') || comb.includes('resistance')) return 'Current Electricity';
      if (comb.includes('optics') || comb.includes('lens')) return 'Ray & Wave Optics';
      if (comb.includes('thermodynamic')) return 'Thermal Properties of Matter & Thermodynamics';
    }
    if (formData.subject === 'Chemistry') {
      if (comb.includes('organic') || comb.includes('acid') || comb.includes('benzene')) return 'General Organic Chemistry (GOC) & Nomenclature';
      if (comb.includes('mole') || comb.includes('stoichiometry')) return 'Some Basic Concepts of Chemistry (Mole Concept)';
      if (comb.includes('bond')) return 'Chemical Bonding & Molecular Structure';
    }
    if (formData.subject === 'Biology') {
      if (comb.includes('cell') || comb.includes('mitosis')) return 'Cell Structure, Biomolecules & Cell Division';
      if (comb.includes('plant') || comb.includes('photosynthesis')) return 'Plant Physiology (Photosynthesis & Respiration)';
      if (comb.includes('gene') || comb.includes('dna')) return 'Genetics & Principles of Inheritance';
    }
    return null;
  };
  const suggestedChapter = suggestChapter();

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] -m-4 md:-m-6 xl:-m-8 lg:h-[calc(100vh-64px)] lg:flex-row">
      {/* Left Sidebar - Nav & Validation */}
      <div className="w-full bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 flex flex-col lg:w-80 lg:border-b-0 lg:border-r">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <Link href={`/admin/imports/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-sm">
            {currentIndex + 1} of {questions.length}
          </span>
          <div className="w-9"></div>
        </div>

        <div className="max-h-[45vh] flex-1 overflow-y-auto p-4 space-y-6 lg:max-h-none">
          {/* Status Badge */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Status</p>
            <span className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${formData.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                formData.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                formData.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'}
            `}>
              {formData.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Validation Panel */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Validation</p>
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Ready to Publish</span>
              </div>
            ) : (
              <div className="space-y-2">
                {issues.map((iss, i) => (
                  <div key={i} className="flex items-start gap-2 text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{iss}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          {!hasChapter && suggestedChapter && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-xl">
              <p className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-2">AI Suggestion</p>
              <p className="text-sm text-indigo-900 dark:text-indigo-200 mb-3 font-medium">Chapter: {suggestedChapter}</p>
              <button 
                onClick={() => handleInputChange('chapter', suggestedChapter)}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Apply Suggestion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Editor */}
      <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        
        {/* Top Actions */}
        <div className="flex flex-col gap-4 mb-6 bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:gap-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={compareMode}
                onChange={e => setCompareMode(e.target.checked)}
                className="rounded text-purple-600"
              />
              Compare Mode
            </label>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

            <button onClick={() => saveQuestion()} disabled={saving} className="flex min-h-10 items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>

            <button onClick={handleSaveAndNext} disabled={saving} className="flex min-h-10 items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <ArrowRight className="w-4 h-4" /> Save & Next
            </button>

            <button onClick={handleNeedsReview} disabled={saving} className="flex min-h-10 items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
              <AlertTriangle className="w-4 h-4" /> Needs Review
            </button>
            
            <button onClick={handleReject} disabled={saving} className="flex min-h-10 items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
              <XCircle className="w-4 h-4" /> Reject
            </button>

            <button onClick={handleApprove} disabled={saving} className="flex min-h-10 items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 shadow-md">
              <CheckCircle className="w-4 h-4" /> Approve & Next
            </button>
          </div>
        </div>

        {/* Editor Grid */}
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          
          {/* Left Column: Visuals / Compare Mode */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Question Image</h3>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{imageMode}</span>
              </div>
              {formData.question_image ? (
                <div className="relative group">
                  <img src={formData.question_image} alt="Question" className="h-auto max-h-[70vh] w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700" style={{ filter: "url(#remove-orange)" }} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white rounded-lg shadow text-gray-700 hover:text-red-600" onClick={() => removeImage('question_image')} title="Remove Question Image">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No Image Uploaded</p>
                </div>
              )}
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-500">Image URL</label>
                <input 
                  type="text" 
                  value={formData.question_image || ""}
                  onChange={e => handleInputChange("question_image", e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-transparent"
                  placeholder="https://..."
                />
              </div>
              {formData.question_image && (
                <button
                  type="button"
                  onClick={() => removeImage("question_image")}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Remove Question Image
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold flex items-center gap-2 mb-4"><FileText className="w-5 h-5" /> Solution Image</h3>
              {formData.explanation_image ? (
                <div className="relative group">
                  <img src={formData.explanation_image} alt="Solution" className="h-auto max-h-[70vh] w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700" style={{ filter: "url(#remove-orange)" }} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white rounded-lg shadow text-gray-700 hover:text-red-600" onClick={() => removeImage('explanation_image')} title="Remove Solution Image">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No Solution Image</p>
                </div>
              )}
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-500">Image URL</label>
                <input 
                  type="text" 
                  value={formData.explanation_image || ""}
                  onChange={e => handleInputChange("explanation_image", e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-transparent"
                  placeholder="https://..."
                />
              </div>
              {formData.explanation_image && (
                <button
                  type="button"
                  onClick={() => removeImage("explanation_image")}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Remove Solution Image
                </button>
              )}
            </div>
            
          </div>

          {/* Right Column: Text & Meta Edit */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold flex items-center gap-2 mb-4"><Layout className="w-5 h-5" /> Metadata</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Question Number</label>
                  <input
                    type="number"
                    value={formData.question_number || ""}
                    onChange={e => handleInputChange('question_number', Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Subject</label>
                  <select 
                    value={formData.subject || ""} 
                    onChange={e => handleInputChange('subject', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  >
                    <option value="">Select Subject</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Maths">Maths</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Question Type</label>
                  <select 
                    value={formData.question_type || "MCQ"} 
                    onChange={e => handleInputChange('question_type', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="NUMERICAL">NUMERICAL</option>
                    <option value="MULTIPLE_CORRECT">MULTIPLE_CORRECT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Difficulty</label>
                  <select 
                    value={formData.difficulty || "MEDIUM"} 
                    onChange={e => handleInputChange('difficulty', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Chapter</label>
                  <input 
                    type="text" 
                    value={formData.chapter || ""}
                    onChange={e => handleInputChange("chapter", e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Numerical Answer</label>
                  <input 
                    type="number"
                    value={formData.numerical_answer ?? ""}
                    onChange={e => handleInputChange("numerical_answer", e.target.value === "" ? null : Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Status</label>
                  <select
                    value={formData.status || "NEEDS_REVIEW"}
                    onChange={e => handleInputChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  >
                    <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Marks Positive</label>
                  <input
                    type="number"
                    value={formData.marks_positive ?? 4}
                    onChange={e => handleInputChange('marks_positive', Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Marks Negative</label>
                  <input
                    type="number"
                    value={formData.marks_negative ?? 0}
                    onChange={e => handleInputChange('marks_negative', Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Exam</label>
                  <input
                    type="text"
                    value={formData.exam || ""}
                    onChange={e => handleInputChange('exam', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Exam Type</label>
                  <input
                    type="text"
                    value={formData.exam_type || ""}
                    onChange={e => handleInputChange('exam_type', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Year</label>
                  <input
                    type="number"
                    value={formData.year || ""}
                    onChange={e => handleInputChange('year', e.target.value === "" ? null : Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Paper Code</label>
                  <input
                    type="text"
                    value={formData.paper_code || ""}
                    onChange={e => handleInputChange('paper_code', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold flex items-center gap-2 mb-4"><Type className="w-5 h-5" /> Question Text</h3>
              <textarea 
                rows={compareMode ? 8 : 4}
                value={formData.question || ""}
                onChange={e => handleInputChange('question', e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent font-mono"
                placeholder="Question text..."
              />
            </div>

            <div className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold mb-4">Options</h3>
              <div className="space-y-3">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt} className={`flex items-start gap-3 p-3 border rounded-xl ${formData.correct_option?.toLowerCase() === opt ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input 
                      type="radio" 
                      name="correct_option"
                      checked={formData.correct_option?.toLowerCase() === opt}
                      onChange={() => handleInputChange('correct_option', opt)}
                      className="mt-2"
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={formData[`option_${opt}`] || ""}
                        onChange={e => handleInputChange(`option_${opt}`, e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent mb-1"
                        placeholder={`Option ${opt.toUpperCase()}`}
                      />
                      <input
                        type="text"
                        value={formData[`option_${opt}_image`] || ""}
                        onChange={e => handleInputChange(`option_${opt}_image`, e.target.value)}
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-transparent"
                        placeholder={`Option ${opt.toUpperCase()} image URL`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold flex items-center gap-2 mb-4"><FileText className="w-5 h-5" /> Solution Text</h3>
              <textarea 
                rows={4}
                value={formData.explanation || ""}
                onChange={e => handleInputChange('explanation', e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent font-mono"
                placeholder="Explanation text..."
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
