import { useCallback, useState, useEffect } from "react";
import { CheckCircle2, ImageIcon, XCircle } from "lucide-react";

export default function ImageManager() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [filterMissing, setFilterMissing] = useState(false);

  const loadExams = useCallback(async function loadExams() {
    try {
      const res = await fetch("/api/admin/exams");
      const data = await res.json();
      if (data.exams) setExams(data.exams);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadQuestions = useCallback(async function loadQuestions() {
    try {
      const res = await fetch(`/api/admin/pyq?exam_id=${selectedExamId}&limit=1000`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setCurrentIndex(0);
      } else if (Array.isArray(data)) {
        setQuestions(data);
        setCurrentIndex(0);
      } else {
        setQuestions([]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedExamId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExamId) {
      loadQuestions();
    } else {
      setQuestions([]);
      setCurrentIndex(0);
    }
  }, [selectedExamId, loadQuestions]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleImageUpload(e, field) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        // Update the question record immediately with the URL
        const currentQ = filteredQuestions[currentIndex];
        await fetch("/api/admin/pyq", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: currentQ.id, [field]: data.url })
        });

        // Update local state
        const newQs = [...questions];
        const qIndex = newQs.findIndex(q => q.id === currentQ.id);
        if (qIndex > -1) {
          newQs[qIndex] = { ...currentQ, [field]: data.url };
          setQuestions(newQs);
        }
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
    setUploading(false);
  }

  const filteredQuestions = filterMissing
    ? questions.filter(q => !q.question_image && !q.option_a_image && !q.option_b_image && !q.option_c_image && !q.option_d_image && !q.explanation_image)
    : questions;

  const currentQ = filteredQuestions[currentIndex];

  function handleSaveAndNext() {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("You have reached the end of the list.");
    }
  }

  return (
    <div className="space-y-5 border rounded-xl p-5">
      <h2 className="font-black text-xl flex items-center gap-2">
        Image Manager <ImageIcon className="w-6 h-6" />
      </h2>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold mb-2">Select Exam</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full border p-3 rounded-xl bg-transparent"
          >
            <option value="">-- Choose Exam --</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.exam} {exam.year} {exam.exam_type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mb-3 border p-3 rounded-xl">
          <input
            type="checkbox"
            id="missingFilter"
            checked={filterMissing}
            onChange={e => {
              setFilterMissing(e.target.checked);
              setCurrentIndex(0);
            }}
            className="w-5 h-5"
          />
          <label htmlFor="missingFilter" className="font-medium cursor-pointer">Only show questions without ANY images</label>
        </div>
      </div>

      {filteredQuestions.length > 0 && currentQ ? (
        <div className="mt-6 p-4 border rounded-xl bg-gray-50/5 dark:bg-[var(--surface)]/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Question {currentIndex + 1} of {filteredQuestions.length}</h3>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="bg-gray-200 dark:bg-[var(--surface-elevated)] px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                className="bg-brand text-white px-4 py-2 rounded"
              >
                Save & Next
              </button>
            </div>
          </div>

          <div className="p-4 bg-[var(--card)] dark:bg-[var(--surface-elevated)] rounded-lg border mb-4 whitespace-pre-wrap">
            {currentQ.question}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['question_image', 'option_a_image', 'option_b_image', 'option_c_image', 'option_d_image', 'explanation_image'].map(field => (
              <div key={field} className="border p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm capitalize">{field.replace(/_/g, ' ')}</span>
                  {currentQ[field] ? (
                    <span className="inline-flex items-center gap-1 text-green-500 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-bold text-sm">
                      <XCircle className="h-4 w-4" />
                      Missing
                    </span>
                  )}
                </div>

                {currentQ[field] && (
                  <div className="mb-3 flex justify-center bg-gray-100 dark:bg-[var(--surface-elevated)] rounded-lg p-2 h-32">
                    <img src={currentQ[field]} alt={field} className="max-h-full object-contain" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, field)}
                  disabled={uploading}
                  className="text-sm border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        selectedExamId && (
          <p className="text-gray-500 p-4">No questions found matching criteria.</p>
        )
      )}
    </div>
  );
}
