"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Upload, FileText, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function ImportPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPackages() {
      try {
        const { data, error } = await supabase
          .from("pyq_import_packages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error("Failed to load import packages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Import Packages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your AI-imported question batches before they go live.
          </p>
        </div>
        <Link 
          href="/admin/import" 
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          New Import
        </Link>
      </div>

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
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">No Import Packages</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            You haven't created any import packages yet. Use the New Import button to start extracting questions from a PDF.
          </p>
          <Link 
            href="/admin/import"
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Start First Import
          </Link>
        </div>
      )}

      {!error && packages.length > 0 && (
        <div className="grid gap-4">
          {packages.map(pkg => (
            <Link 
              key={pkg.id} 
              href={`/admin/imports/${pkg.id}`}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                  ${pkg.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                    pkg.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                    pkg.status === 'REJECTED' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}
                `}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{new Date(pkg.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{pkg.total_questions} Questions</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${pkg.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    pkg.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    pkg.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}
                `}>
                  {pkg.status.replace('_', ' ')}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
