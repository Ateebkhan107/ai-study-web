"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, GraduationCap, Plus, X } from "lucide-react";

function roleLabel(role) {
  return role === "COACHING_ADMIN" ? "Admin" : "Student";
}

function roleClasses(role) {
  return role === "COACHING_ADMIN"
    ? "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20"
    : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
}

export default function InstituteHome() {
  const router = useRouter();
  const [institutes, setInstitutes] = useState([]);
  const [accountType, setAccountType] = useState("STUDENT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", logo_url: "" });
  const canCreateInstitute = accountType === "INSTITUTE_ADMIN";

  async function loadInstitutes() {
    setLoading(true);
    setError("");
    try {
      const [institutesResponse, accessResponse] = await Promise.all([
        fetch("/api/institutes", { cache: "no-store" }),
        fetch("/api/access", { cache: "no-store" }),
      ]);
      const data = await institutesResponse.json();
      if (!institutesResponse.ok) throw new Error(data.error || "Failed to load institutes");
      setInstitutes(data.institutes || []);

      if (accessResponse.ok) {
        const access = await accessResponse.json();
        setAccountType(access.accountType || "STUDENT");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createInstitute(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/institutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create institute");
      setModalOpen(false);
      setForm({ name: "", slug: "", logo_url: "" });
      router.push(`/institute/${data.institute.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInstitutes();
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Institutes</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage or access your coaching workspaces.
          </p>
        </div>
        {canCreateInstitute && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create Institute
          </button>
        )}
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">My Institutes</h2>
            {!loading && institutes.length > 0 && (
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {institutes.length} active workspace{institutes.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : institutes.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {institutes.map((institute) => (
              <Link
                key={institute.id}
                href={`/institute/${institute.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-indigo-500/30 dark:hover:bg-slate-950"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    {institute.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={institute.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${roleClasses(institute.role)}`}>
                    {roleLabel(institute.role)}
                  </span>
                </div>
                <h3 className="truncate text-base font-black text-slate-950 dark:text-white">{institute.name}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {institute.role === "COACHING_ADMIN" ? "Manage students, tests and results" : "View tests and performance"}
                </p>
                <div className="mt-5 flex items-center justify-between text-sm font-black text-indigo-600 dark:text-indigo-300">
                  Open Workspace
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-900">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-950 dark:text-white">No institutes yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {canCreateInstitute
                ? "Create your institute workspace to start managing batches, tests and results."
                : "Your coaching workspace will appear here after you are added to an institute."}
            </p>
            {canCreateInstitute && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Create Institute
              </button>
            )}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
          <div className="w-full rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-w-lg sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Create Institute</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set up your coaching workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={createInstitute} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Institute Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ateeb Coaching"
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  placeholder="ateeb-coaching"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <p className="mt-1 text-xs font-medium text-slate-400">Optional. If empty, PrepZii will create one from the name.</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Logo URL</label>
                <input
                  value={form.logo_url}
                  onChange={(event) => setForm({ ...form, logo_url: event.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Institute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
