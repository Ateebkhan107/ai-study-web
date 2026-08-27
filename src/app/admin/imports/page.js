"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, FileText, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function ImportPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncReport, setSyncReport] = useState(null);

  async function loadPackages() {
      try {
        setError(null);
        const response = await fetch("/api/admin/import-packages");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to load import packages");
        setPackages(data.packages || []);
      } catch (err) {
        console.error("Failed to load import packages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadPackages();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function syncExistingPapers() {
    setSyncing(true);
    setSyncReport(null);
    try {
      const response = await fetch("/api/admin/import-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_existing_papers" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sync existing papers");
      setSyncReport(data);
      await loadPackages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-black font-display bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-hover">
            Import Packages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review every existing paper without re-importing or duplicating questions.
          </p>
        </div>
        <button
          type="button"
          disabled={syncing}
          onClick={syncExistingPapers}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-indigo-500 dark:text-white sm:w-auto"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sync Existing Papers
        </button>
      </div>

      {syncReport && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-sm">
          Synced {syncReport.totalPapersFound} papers. Created {syncReport.importPackagesCreated} packages, linked {syncReport.questionsLinked} existing questions, duplicated {syncReport.duplicateQuestionsCreated}.
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-800/30">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Could not load packages</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
            <p className="text-xs mt-2 font-mono bg-red-100 dark:bg-red-900/50 p-2 rounded">
              Note: You must run the SQL migration script first to create the table.
            </p>
          </div>
        </div>
      )}

      {!error && packages.length === 0 && (
        <div className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">No Import Packages</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Sync existing papers to create review packages from the questions already in Supabase.
          </p>
          <button
            type="button"
            onClick={syncExistingPapers}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Existing Papers
          </button>
        </div>
      )}

      {!error && packages.length > 0 && (
        <div className="grid gap-4">
          {packages.map(pkg => (
            <Link 
              key={pkg.id} 
              href={`/admin/imports/${pkg.id}`}
              className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[var(--card)] p-4 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-brand/5 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                  ${pkg.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                    pkg.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                    pkg.status === 'REJECTED' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}
                `}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {pkg.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{pkg.exam_type || pkg.exam || "PYQ"}</span>
                    <span>•</span>
                    <span>{pkg.year || "Year unknown"}</span>
                    {pkg.attempt && <span>•</span>}
                    {pkg.attempt && <span>{pkg.attempt}</span>}
                    {pkg.shift && <span>•</span>}
                    {pkg.shift && <span>{pkg.shift}</span>}
                    <span>•</span>
                    <span>{pkg.total_questions || 0} Questions</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-semibold text-gray-500">
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[var(--surface-elevated)]">Reviewed {pkg.reviewed_count || 0}</span>
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">Needs {pkg.needs_review_count || 0}</span>
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">Published {pkg.published_count || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${pkg.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    pkg.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    pkg.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}
                `}>
                  {pkg.status.replace('_', ' ')}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
