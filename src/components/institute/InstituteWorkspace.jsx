"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Play,
  Plus,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";

const SUBJECTS = {
  JEE: ["Physics", "Chemistry", "Mathematics", "All Subjects"],
  NEET: ["Physics", "Chemistry", "Biology", "All Subjects"],
};

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "batches", label: "Batches", icon: GraduationCap },
  { id: "tests", label: "Tests", icon: BookOpenCheck },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

const STUDENT_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "assigned", label: "Assigned Tests", icon: BookOpenCheck },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

function formatRole(role) {
  return role === "COACHING_ADMIN" ? "Admin" : "Student";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/40">
      <h3 className="text-sm font-black text-slate-950 dark:text-white">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {helper && <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
      <div className="w-full rounded-t-3xl border border-slate-200 bg-[var(--card)] p-5 shadow-2xl dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-[var(--surface-elevated)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-black text-white transition hover:bg-brand-hover disabled:opacity-60 dark:bg-brand dark:text-white dark:hover:bg-brand-hover ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function ProgressRow({ label, value, meta }) {
  const safe = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="shrink-0 text-xs font-black text-slate-500">{meta || `${safe}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-elevated)]">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export default function InstituteWorkspace({ slug }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentBatch, setStudentBatch] = useState("");
  const [batchForm, setBatchForm] = useState({ name: "", exam: "JEE", target_year: new Date().getFullYear() + 1 });
  const [testForm, setTestForm] = useState({
    mode: "auto", // "auto" or "custom"
    title: "",
    batch_id: "",
    exam: "JEE",
    subject: "Physics",
    chapters: "",
    question_count: 10,
    duration_minutes: 30,
    difficulty: "mixed",
  });
  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderboardTestId, setLeaderboardTestId] = useState("");
  const [saving, setSaving] = useState("");

  const isAdmin = data?.role === "COACHING_ADMIN";
  const tabs = isAdmin ? ADMIN_TABS : STUDENT_TABS;

  const activeStudents = useMemo(
    () => (data?.members || []).filter((member) => member.role === "STUDENT" && member.status !== "REMOVED"),
    [data?.members]
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return activeStudents;
    return activeStudents.filter((member) =>
      [member.email, member.profile?.full_name, member.status].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [activeStudents, studentSearch]);

  const filteredTests = useMemo(() => {
    const tests = data?.tests || [];
    if (testFilter === "all") return tests;
    return tests.filter((test) => String(test.status || "").toLowerCase() === testFilter);
  }, [data?.tests, testFilter]);

  async function loadWorkspace() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/institutes/${slug}`, { cache: "no-store" });
      const nextData = await response.json();
      if (!response.ok) throw new Error(nextData.error || "Failed to load institute");
      setData(nextData);
      if (!testForm.batch_id && nextData.batches?.[0]?.id) {
        setTestForm((current) => ({ ...current, batch_id: nextData.batches[0].id }));
        setStudentBatch(nextData.batches[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function submitJson(path, body, label) {
    setSaving(label);
    setError("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      await loadWorkspace();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSaving("");
    }
  }

  async function addStudent(event) {
    event.preventDefault();
    const result = await submitJson(
      `/api/institutes/${slug}/students`,
      { email: studentEmail, batch_id: studentBatch || null },
      "student"
    );
    if (result) {
      setStudentEmail("");
      setModal(null);
    }
  }

  async function createBatch(event) {
    event.preventDefault();
    const result = await submitJson(`/api/institutes/${slug}/batches`, batchForm, "batch");
    if (result) {
      setBatchForm({ name: "", exam: "JEE", target_year: new Date().getFullYear() + 1 });
      setModal(null);
    }
  }

  async function createTest(event) {
    event.preventDefault();
    const result = await submitJson(
      `/api/institutes/${slug}/tests`,
      {
        ...testForm,
        chapters: testForm.mode === "auto" ? testForm.chapters.split(",").map((chapter) => chapter.trim()).filter(Boolean) : [],
        question_count: testForm.mode === "auto" ? Number(testForm.question_count) : 0,
        duration_minutes: Number(testForm.duration_minutes),
      },
      "test"
    );
    if (result) {
      setTestForm((current) => ({ ...current, title: "", chapters: "" }));
      setModal(null);
      if (testForm.mode === "custom" && result.test?.id) {
        router.push(`/institute/${slug}/tests/${result.test.id}/edit`);
      } else {
        setActiveTab("tests");
      }
    }
  }

  async function loadLeaderboard(testId) {
    if (!testId) {
      setLeaderboard(null);
      return;
    }
    setLeaderboardTestId(testId);
    setLeaderboard({ loading: true });
    try {
      const response = await fetch(`/api/institutes/${slug}/tests/${testId}/results`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load leaderboard");
      setLeaderboard(result);
    } catch (err) {
      setLeaderboard({ error: err.message });
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-[var(--surface-elevated)]" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="h-80 rounded-2xl bg-slate-100 dark:bg-[var(--surface-elevated)]" />
          <div className="h-80 rounded-2xl bg-slate-100 dark:bg-[var(--surface-elevated)]" />
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      </main>
    );
  }

  const institute = data.institute;
  const analytics = data.analytics || {};
  const summary = analytics.summary || {};
  const recentTests = (data.tests || []).slice(0, 5);
  const recentResults = data.recent_results || [];

  const NavButton = ({ tab }) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return (
      <button
        type="button"
        onClick={() => {
          setActiveTab(tab.id);
          setMobileNavOpen(false);
        }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
          active
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-brand-hover/60 dark:hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
        {tab.label}
      </button>
    );
  };

  const renderHeader = () => (
    <header className="mb-5 rounded-2xl border border-slate-200 bg-[var(--card)] p-4 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            {institute.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={institute.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0">
            <Link href="/dashboard" className="mb-1 inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to PrepZii
            </Link>
            <h1 className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white">{institute.name}</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Powered by PrepZii · {formatRole(data.role)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((value) => !value)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 lg:hidden dark:border-[var(--border-subtle)] dark:text-slate-200"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>
    </header>
  );

  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Students" value={data.stats.students} />
        <StatCard icon={GraduationCap} label="Batches" value={data.stats.batches} />
        <StatCard icon={BookOpenCheck} label={isAdmin ? "Tests" : "Assigned Tests"} value={data.stats.tests} />
        <StatCard icon={BarChart3} label="Results" value={data.stats.attempts} />
      </div>

      {isAdmin ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Recent Tests">
            {recentTests.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs font-black uppercase tracking-widest text-slate-400">
                    <tr><th className="py-2">Test</th><th>Subject</th><th>Questions</th><th>Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTests.map((test) => (
                      <tr key={test.id}>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{test.title}</td>
                        <td className="text-slate-500">{test.subject}</td>
                        <td className="text-slate-500">{test.total_questions}</td>
                        <td><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{test.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No tests yet" description="Create a test after adding at least one batch." />
            )}
          </Panel>

          <Panel title="Batch Performance">
            {analytics.batch_breakdown?.length ? (
              <div className="space-y-4">
                {analytics.batch_breakdown.map((batch) => (
                  <ProgressRow key={batch.id} label={batch.name} value={batch.average_score_percent} meta={`${batch.average_score_percent}% · ${batch.submissions} results`} />
                ))}
              </div>
            ) : (
              <EmptyState title="No test results yet" description="Performance analytics will appear after students complete their first test." />
            )}
          </Panel>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          {renderAssignedTests(true)}
          {renderStudentResults(true)}
        </div>
      )}

      {isAdmin && summary.submissions > 0 && (
        <Panel title="Performance Summary">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={BarChart3} label="Avg Score" value={`${summary.average_score_percent || 0}%`} />
            <StatCard icon={CheckCircle2} label="Avg Accuracy" value={`${summary.average_accuracy || 0}%`} />
            <StatCard icon={Trophy} label="Completion" value={`${summary.completion_rate || 0}%`} />
          </div>
        </Panel>
      )}
    </div>
  );

  function renderStudents() {
    return (
      <Panel
        title="Students"
        action={<PrimaryButton onClick={() => setModal("student")}><Plus className="h-4 w-4" /> Add Student</PrimaryButton>}
      >
        <p className="-mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">Manage students enrolled in your institute.</p>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/40">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
            placeholder="Search students..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none dark:text-white"
          />
        </div>
        {filteredStudents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs font-black uppercase tracking-widest text-slate-400">
                <tr><th className="py-2">Student</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{member.profile?.full_name || "Pending signup"}</td>
                    <td className="text-slate-500">{member.email}</td>
                    <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-[var(--surface-elevated)] dark:text-slate-300">{member.status}</span></td>
                    <td className="text-slate-500">{formatDate(member.created_at)}</td>
                    <td className="text-slate-400">...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No students yet"
            description="Add your first student to start assigning tests."
            action={<PrimaryButton onClick={() => setModal("student")}><Plus className="h-4 w-4" /> Add your first student</PrimaryButton>}
          />
        )}
      </Panel>
    );
  }

  function renderBatches() {
    return (
      <Panel
        title="Batches"
        action={<PrimaryButton onClick={() => setModal("batch")}><Plus className="h-4 w-4" /> Create Batch</PrimaryButton>}
      >
        {data.batches.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.batches.map((batch) => (
              <div key={batch.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/40">
                <h3 className="font-black text-slate-950 dark:text-white">{batch.name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{batch.exam} · {batch.target_year || "Target year"}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500">{batch.member_count || 0} students</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-300">View Batch</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No batches yet"
            description="Create a batch before assigning students and tests."
            action={<PrimaryButton onClick={() => setModal("batch")}><Plus className="h-4 w-4" /> Create your first batch</PrimaryButton>}
          />
        )}
      </Panel>
    );
  }

  function renderTests() {
    return (
      <Panel
        title="Tests"
        action={isAdmin ? <PrimaryButton onClick={() => setModal("test")}><Plus className="h-4 w-4" /> Create Test</PrimaryButton> : null}
      >
        {isAdmin && (
          <div className="mb-4 flex flex-wrap gap-2">
            {["all", "draft", "published", "completed"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTestFilter(filter)}
                className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-widest ${
                  testFilter === filter ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-[var(--surface-elevated)] dark:text-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
        {filteredTests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs font-black uppercase tracking-widest text-slate-400">
                <tr><th className="py-2">Test</th><th>Subject</th><th>Questions</th><th>Duration</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{test.title}</td>
                    <td className="text-slate-500">{test.subject}</td>
                    <td className="text-slate-500">{test.total_questions}</td>
                    <td className="text-slate-500">{test.duration_minutes} min</td>
                    <td><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{test.status}</span></td>
                    <td>
                      {isAdmin ? (
                        <button type="button" onClick={() => { setActiveTab("results"); loadLeaderboard(test.id); }} className="font-black text-indigo-600 dark:text-indigo-300">View Results</button>
                      ) : (
                        <Link href={`/test/session?instituteSlug=${slug}&instituteTestId=${test.id}&duration=${test.duration_minutes}&count=${test.total_questions}&mode=institute`} className="font-black text-indigo-600 dark:text-indigo-300">Start Test</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={isAdmin ? "No tests yet" : "No assigned tests yet"}
            description={isAdmin ? "Create a test from your existing PrepZii question bank." : "Assigned tests will appear here when your institute publishes them."}
            action={isAdmin ? <PrimaryButton onClick={() => setModal("test")}><Plus className="h-4 w-4" /> Create your first test</PrimaryButton> : null}
          />
        )}
      </Panel>
    );
  }

  function renderResults() {
    return (
      <Panel title="Results">
        {isAdmin && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Select Test</label>
            <select
              value={leaderboardTestId}
              onChange={(event) => loadLeaderboard(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white sm:max-w-md"
            >
              <option value="">Choose a test</option>
              {data.tests.map((test) => <option key={test.id} value={test.id}>{test.title}</option>)}
            </select>
          </div>
        )}
        {isAdmin ? renderLeaderboardTable("No test results yet", "Results will appear after students submit this test.") : renderStudentResults(false)}
      </Panel>
    );
  }

  function renderLeaderboard() {
    if (!isAdmin) {
      return (
        <Panel title="Leaderboard">
          {data.student_leaderboards?.length ? (
            <div className="space-y-3">
              {data.student_leaderboards.map((board) => renderLeaderboardRows(board.test.title, board.rows))}
            </div>
          ) : (
            <EmptyState title="No leaderboard yet" description="Rankings will appear after your batch starts submitting tests." />
          )}
        </Panel>
      );
    }

    return (
      <Panel title="Leaderboard">
        <div className="mb-4">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Test</label>
          <select
            value={leaderboardTestId}
            onChange={(event) => loadLeaderboard(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white sm:max-w-md"
          >
            <option value="">Choose a test</option>
            {data.tests.map((test) => <option key={test.id} value={test.id}>{test.title}</option>)}
          </select>
        </div>
        {renderLeaderboardTable("No leaderboard yet", "Leaderboard will appear after students submit this test.")}
      </Panel>
    );
  }

  function renderLeaderboardTable(emptyTitle, emptyDescription) {
    if (!leaderboard) return <EmptyState title={emptyTitle} description="Select a test to view submitted results." />;
    if (leaderboard.loading) return <p className="text-sm font-semibold text-slate-500">Loading...</p>;
    if (leaderboard.error) return <p className="text-sm font-semibold text-rose-500">{leaderboard.error}</p>;
    if (!leaderboard.leaderboard?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs font-black uppercase tracking-widest text-slate-400">
            <tr><th className="py-2">Rank</th><th>Student</th><th>Score</th><th>Accuracy</th><th>Time</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard.leaderboard.map((row) => (
              <tr key={row.id}>
                <td className="py-3 font-black text-slate-900 dark:text-white">{row.rank}</td>
                <td className="font-bold text-slate-900 dark:text-white">{row.student?.full_name || row.user_id}</td>
                <td className="text-slate-500">{row.score}/{row.total_marks}</td>
                <td className="text-slate-500">{row.accuracy || 0}%</td>
                <td className="text-slate-500">{Math.round((row.time_taken_seconds || 0) / 60)} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderLeaderboardRows(title, rows) {
    return (
      <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/40">
        <h3 className="mb-3 font-black text-slate-950 dark:text-white">{title}</h3>
        {rows.length ? (
          <div className="space-y-2">
            {rows.slice(0, 6).map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--card)] px-3 py-2 text-sm dark:bg-[var(--surface)]">
                <span className="font-bold text-slate-700 dark:text-slate-200">{row.rank}. {row.student?.full_name || row.user_id}</span>
                <span className="font-black text-indigo-600 dark:text-indigo-300">{row.score}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        )}
      </div>
    );
  }

  function renderAssignedTests(compact = false) {
    return (
      <Panel title="Assigned Tests">
        {data.tests.length ? (
          <div className="grid gap-3">
            {data.tests.map((test) => {
              const completed = test.latest_attempt?.status === "SUBMITTED";
              return (
                <div key={test.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border-subtle)] dark:bg-[var(--background)]/40 sm:flex-row sm:items-center">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950 dark:text-white">{test.title}</p>
                      {completed && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Completed</span>}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{test.subject} · {test.total_questions} questions · {test.duration_minutes} min</p>
                  </div>
                  <Link
                    href={`/test/session?instituteSlug=${slug}&instituteTestId=${test.id}&duration=${test.duration_minutes}&count=${test.total_questions}&mode=institute`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-700"
                  >
                    <Play className="h-4 w-4" />
                    {completed ? "Retake" : "Start Test"}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No assigned tests yet" description="Your institute tests will appear here." />
        )}
        {compact && data.tests.length > 3 && (
          <button type="button" onClick={() => setActiveTab("assigned")} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-indigo-600 dark:text-indigo-300">
            View all tests <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </Panel>
    );
  }

  function renderStudentResults() {
    return (
      <Panel title="Recent Results">
        {recentResults.length ? (
          <div className="space-y-2">
            {recentResults.map((row) => (
              <div key={row.id} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-[var(--background)]/40">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{row.test?.title || "Institute Test"}</p>
                <p className="text-xs font-semibold text-slate-500">Score: {row.test_attempts?.score ?? 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No results yet" description="Your scores will appear after you submit assigned tests." />
        )}
      </Panel>
    );
  }

  const renderContent = () => {
    if (activeTab === "overview") return renderOverview();
    if (activeTab === "students") return renderStudents();
    if (activeTab === "batches") return renderBatches();
    if (activeTab === "tests" || activeTab === "assigned") return renderTests();
    if (activeTab === "results") return renderResults();
    if (activeTab === "leaderboard") return renderLeaderboard();
    return renderOverview();
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      {renderHeader()}

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className={`${mobileNavOpen ? "block" : "hidden"} rounded-2xl border border-slate-200 bg-[var(--card)] p-3 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] lg:block`}>
          <nav className="space-y-1">
            {tabs.map((tab) => <NavButton key={tab.id} tab={tab} />)}
          </nav>
        </aside>
        <div className="min-w-0">
          {renderContent()}
        </div>
      </div>

      {modal === "student" && (
        <Modal title="Add Student" onClose={() => setModal(null)}>
          <form onSubmit={addStudent} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Student email</label>
              <input value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} placeholder="student@email.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Batch</label>
              <select value={studentBatch} onChange={(event) => setStudentBatch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white">
                <option value="">No batch yet</option>
                {data.batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 dark:border-[var(--border-subtle)] dark:text-slate-300">Cancel</button>
              <PrimaryButton disabled={saving === "student"} type="submit">Add Student</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {modal === "batch" && (
        <Modal title="Create Batch" onClose={() => setModal(null)}>
          <form onSubmit={createBatch} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Batch Name</label>
              <input value={batchForm.name} onChange={(event) => setBatchForm({ ...batchForm, name: event.target.value })} placeholder="JEE 2027 Batch A" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Exam</label>
                <select value={batchForm.exam} onChange={(event) => setBatchForm({ ...batchForm, exam: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white">
                  <option value="JEE">JEE</option><option value="NEET">NEET</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Target Year</label>
                <input type="number" value={batchForm.target_year} onChange={(event) => setBatchForm({ ...batchForm, target_year: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 dark:border-[var(--border-subtle)] dark:text-slate-300">Cancel</button>
              <PrimaryButton disabled={saving === "batch"} type="submit">Create Batch</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {modal === "test" && (
        <Modal title="Create Test" onClose={() => setModal(null)}>
          <form onSubmit={createTest} className="space-y-3">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl dark:bg-[var(--surface)] mb-4">
              <button
                type="button"
                onClick={() => setTestForm({ ...testForm, mode: "auto" })}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${testForm.mode === "auto" ? "bg-[var(--card)] text-indigo-600 shadow-sm dark:bg-[var(--surface-elevated)] dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
              >
                Auto-Generate
              </button>
              <button
                type="button"
                onClick={() => setTestForm({ ...testForm, mode: "custom" })}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${testForm.mode === "custom" ? "bg-[var(--card)] text-indigo-600 shadow-sm dark:bg-[var(--surface-elevated)] dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
              >
                Build Custom
              </button>
            </div>

            <input value={testForm.title} onChange={(event) => setTestForm({ ...testForm, title: event.target.value })} placeholder="Test Title (e.g. Physics Mock Test)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" required />
            <select value={testForm.batch_id} onChange={(event) => setTestForm({ ...testForm, batch_id: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" required>
              <option value="">Choose batch</option>
              {data.batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select value={testForm.exam} onChange={(event) => setTestForm({ ...testForm, exam: event.target.value, subject: SUBJECTS[event.target.value][0] })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white">
                <option value="JEE">JEE</option><option value="NEET">NEET</option>
              </select>
              <select value={testForm.subject} onChange={(event) => setTestForm({ ...testForm, subject: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white">
                {SUBJECTS[testForm.exam].map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>

            {testForm.mode === "auto" && (
              <>
                <input value={testForm.chapters} onChange={(event) => setTestForm({ ...testForm, chapters: event.target.value })} placeholder="Chapters, comma separated" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" required />
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" min="1" max="100" value={testForm.question_count} onChange={(event) => setTestForm({ ...testForm, question_count: event.target.value })} placeholder="Questions" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" required />
                  <input type="number" min="5" max="240" value={testForm.duration_minutes} onChange={(event) => setTestForm({ ...testForm, duration_minutes: event.target.value })} placeholder="Duration (min)" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" required />
                  <select value={testForm.difficulty} onChange={(event) => setTestForm({ ...testForm, difficulty: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white">
                    <option value="mixed">Mixed</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
              </>
            )}

            {testForm.mode === "custom" && (
              <div className="grid grid-cols-1 gap-3">
                <input type="number" min="5" max="240" value={testForm.duration_minutes} onChange={(event) => setTestForm({ ...testForm, duration_minutes: event.target.value })} placeholder="Duration (minutes)" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--background)] dark:text-white" required />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 dark:border-[var(--border-subtle)] dark:text-slate-300">Cancel</button>
              <PrimaryButton disabled={saving === "test"} type="submit">
                {testForm.mode === "auto" ? "Publish Test" : "Create & Edit"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
