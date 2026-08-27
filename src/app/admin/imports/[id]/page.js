"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  FileImage, 
  FileText, 
  Target, 
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";

export default function ImportPackageDashboard() {
  const { id } = useParams();
  const router = useRouter();
  
  const [pkg, setPkg] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [packageResponse, questionsResponse] = await Promise.all([
          fetch(`/api/admin/import-packages/${id}`),
          fetch(`/api/admin/pyq?import_package_id=${id}&limit=1000`),
        ]);

        const packageData = await packageResponse.json();
        const questionData = await questionsResponse.json();

        if (!packageResponse.ok) throw new Error(packageData.error || "Failed to load package");
        if (!questionsResponse.ok) throw new Error(questionData.error || "Failed to load package questions");

        setPkg(packageData.package);
        const qData = questionData.questions || [];

        // Calculate stats
        const total = qData.length;
        const images = qData.filter(q => q.question_image).length;
        const solutions = qData.filter(q => q.explanation || q.explanation_image).length;
        const imageOnly = qData.filter(q => q.image_mode === "IMAGE_ONLY").length;
        const textRequiredImage = qData.filter(q => q.image_mode === "TEXT_WITH_REQUIRED_IMAGE").length;
        const textOnly = qData.filter(q => q.image_mode === "TEXT_ONLY").length;
        const missingImages = qData.filter(q => !q.question_image && q.question_type !== 'TEXT' && !q.question).length;
        const missingChapters = qData.filter(q => !q.chapter || q.chapter.includes('Core')).length;
        const missingAnswers = qData.filter(q => !q.correct_option).length;
        const reviewed = qData.filter(q => !["NEEDS_REVIEW", "REJECTED"].includes(String(q.status || "").toUpperCase())).length;
        const needsReview = qData.filter(q => ["NEEDS_REVIEW", "REJECTED"].includes(String(q.status || "").toUpperCase())).length;
        const published = qData.filter(q => String(q.status || "").toUpperCase() === "PUBLISHED").length;
        
        // Validation Score roughly based on missing fields
        const issues = missingImages + missingChapters + missingAnswers;
        const validationScore = total === 0 ? 0 : Math.max(0, Math.round(((total * 3 - issues) / (total * 3)) * 100));

        setStats({
          total, images, solutions, missingImages, missingChapters, missingAnswers, validationScore,
          reviewed, needsReview, published, imageOnly, textRequiredImage, textOnly,
        });

      } catch (err) {
        console.error("Failed to load import package data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const updatePackageStatus = async (status) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/import-packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update package status");
      setPkg(prev => ({ ...prev, status }));
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const deletePackage = async () => {
    if (!confirm("Remove this import package link? Existing questions will stay in the database.")) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/import-packages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete package");
      router.push("/admin/imports");
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!pkg) {
    return <div>Package not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/imports" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-display bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-hover">
              {pkg.name}
            </h1>
            <span className={`
              px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
              ${pkg.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                pkg.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                pkg.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}
            `}>
              {pkg.status.replace('_', ' ')}
            </span>
          </div>
            <p className="text-sm text-gray-500 mt-1">
              {[pkg.exam_type || pkg.exam, pkg.year, pkg.attempt, pkg.shift, pkg.exam_date].filter(Boolean).join(" • ")}
            </p>
        </div>
        
        <Link 
          href={`/admin/imports/${id}/review`}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-brand/30"
        >
          <Play className="w-4 h-4" />
          Enter Review Queue
        </Link>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
          <FileText className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-3xl font-black font-display">{stats.total}</p>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Total Questions</p>
        </div>
        
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
          <FileImage className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-3xl font-black font-display">{stats.images}</p>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Images</p>
        </div>

        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-3xl font-black font-display">{stats.solutions}</p>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Solutions</p>
        </div>

        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
          <Target className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-3xl font-black font-display">{stats.validationScore}%</p>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Validation</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reviewed</p>
          <p className="text-2xl font-black font-display mt-1">{stats.reviewed}</p>
        </div>
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Needs Review</p>
          <p className="text-2xl font-black font-display mt-1 text-amber-600">{stats.needsReview}</p>
        </div>
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Published</p>
          <p className="text-2xl font-black font-display mt-1 text-green-600">{stats.published}</p>
        </div>
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Image Only</p>
          <p className="text-2xl font-black font-display mt-1">{stats.imageOnly}</p>
        </div>
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Text + Image</p>
          <p className="text-2xl font-black font-display mt-1">{stats.textRequiredImage}</p>
        </div>
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-5 rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Text Only</p>
          <p className="text-2xl font-black font-display mt-1">{stats.textOnly}</p>
        </div>
      </div>

      {/* Issues Panel */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
        <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" />
          Validation Issues
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">Missing Images</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.missingImages}</p>
          </div>
          <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unmapped Chapters</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.missingChapters}</p>
          </div>
          <div className="bg-[var(--card)] dark:bg-[var(--surface)] p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">Missing Answers</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.missingAnswers}</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5" />
          Bulk Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button 
            disabled={actionLoading || pkg.status === 'PUBLISHED'}
            onClick={() => updatePackageStatus('PUBLISHED')}
            className="flex items-center gap-2 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 dark:hover:bg-green-500/20 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Publish Package
          </button>
          
          <button 
            disabled={actionLoading || pkg.status === 'REJECTED'}
            onClick={() => updatePackageStatus('REJECTED')}
            className="flex items-center gap-2 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-500/20 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject Package
          </button>
          
          <button 
            disabled={actionLoading}
            onClick={deletePackage}
            className="flex items-center gap-2 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Remove Package Link
          </button>
        </div>
      </div>
    </div>
  );
}
