"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Loader2,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import GroupCard from "./GroupCard";
import CreateGroupForm from "./CreateGroupForm";

const SECTIONS = ["Discover", "My Groups"];

export default function CommunityHub({ examTrack }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("Discover");
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeSection !== "Discover") return;
    const timeout = setTimeout(() => {
      setLoading(true);
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [activeSection, searchInput]);

  useEffect(() => {
    if (activeSection !== "Discover") return;
    const q = search ? `&q=${encodeURIComponent(search)}` : "";
    fetch(`/api/community/groups?type=discover&page=${page}&limit=12${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (page === 1) setGroups(data.groups || []);
        else setGroups((prev) => [...prev, ...(data.groups || [])]);
        setHasMore((data.groups || []).length === 12);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load groups.");
        setLoading(false);
      });
  }, [activeSection, page, search]);

  useEffect(() => {
    if (activeSection !== "My Groups") return;
    fetch("/api/community/groups?type=mine")
      .then((r) => r.json())
      .then((data) => {
        setMyGroups(data.groups || []);
        setLoadingMine(false);
      })
      .catch(() => setLoadingMine(false));
  }, [activeSection]);

  function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleSectionChange(section) {
    setActiveSection(section);
    if (section === "Discover") setLoading(true);
    if (section === "My Groups") setLoadingMine(true);
  }

  const trackLabel = examTrack === "JEE" ? "JEE" : "NEET";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-5 dark:border-[var(--border-subtle)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-brand">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{trackLabel}</span>
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Study Community
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Find focused study groups, compare doubts, and keep your preparation moving with students on the same exam track.
          </p>
        </div>
        <button
          onClick={() => setActiveSection("Create Group")}
          id="community-create-group-btn"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition-colors hover:border-brand/50 hover:text-slate-950 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-100 dark:hover:border-brand/50"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-slate-200/80 dark:border-[var(--border-subtle)]">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => handleSectionChange(section)}
            id={`community-tab-${section.toLowerCase().replace(/\s/g, "-")}`}
            className={`shrink-0 flex items-center gap-2 border-b-2 px-0 pb-3 text-sm font-bold transition-colors ${
              activeSection === section
                ? "border-brand text-slate-950 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {section === "Discover" && <Users className="w-3.5 h-3.5" />}
            {section === "My Groups" && <BookOpen className="w-3.5 h-3.5" />}
            {section}
          </button>
        ))}
      </div>

      {/* ── Discover ──────────────────────────────────────────── */}
      {activeSection === "Discover" && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Popular Groups</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Groups are shown from your {trackLabel} community.
              </p>
            </div>
            <form onSubmit={handleSearch} className="w-full sm:max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search groups…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-brand/60 focus:outline-none dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-white"
              />
            </div>
            </form>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {loading && page === 1 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-brand" />
              <p className="font-bold text-slate-800 dark:text-white">No groups found</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6">Start a focused group for a chapter, mock-test batch, or revision plan.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    myRole={g.myRole}
                    myStatus={g.myStatus}
	                    onJoin={(groupId, status) => {
	                      setGroups((prev) => prev.map((item) => (
	                        item.id === groupId
	                          ? {
	                              ...item,
	                              member_count: status === "joined" ? (item.member_count || 0) + 1 : item.member_count,
	                              myStatus: status === "joined" ? "ACTIVE" : "PENDING",
	                              myRole: status === "joined" ? "MEMBER" : item.myRole,
	                            }
	                          : item
	                      )));
	                    }}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setLoading(true);
                      setPage((p) => p + 1);
                    }}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-brand/50 hover:bg-brand/10 disabled:opacity-60 dark:border-[var(--border-subtle)] dark:text-slate-200"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── My Groups ──────────────────────────────────────────── */}
      {activeSection === "My Groups" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Your Groups</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Continue the discussions you already belong to.
            </p>
          </div>
          {loadingMine ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : myGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-brand" />
              <p className="font-bold text-slate-800 dark:text-white">You haven&apos;t joined any groups yet</p>
              <button
                onClick={() => setActiveSection("Discover")}
                className="mt-3 text-sm font-semibold text-amber-700 hover:underline dark:text-brand"
              >
                Discover groups →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-[var(--border-subtle)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface)]">
              {myGroups.map((g) => (
                <Link
                  key={g.id}
                  href={`/community/groups/${g.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[var(--surface-elevated)]/45"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{g.name}</p>
                      {g.myRole === "OWNER" && (
                        <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-brand">Owner</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{g.member_count ?? 0} members · {g.privacy?.toLowerCase?.() || "group"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Create Group ──────────────────────────────────────── */}
      {activeSection === "Create Group" && (
        <CreateGroupForm
          examTrack={examTrack}
          onSuccess={(group) => router.push(`/community/groups/${group.id}`)}
          onCancel={() => setActiveSection("Discover")}
        />
      )}
    </div>
  );
}
