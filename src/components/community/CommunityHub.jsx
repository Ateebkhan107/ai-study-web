"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  MessageSquare,
  Plus,
  Search,
  Loader2,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import GroupCard from "./GroupCard";
import CreateGroupForm from "./CreateGroupForm";
import DMInbox from "./DMInbox";

const SECTIONS = ["Discover", "My Groups", "Messages", "Create Group"];

export default function CommunityHub({ examTrack, currentUserId }) {
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

  // Load discover groups
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

  // Load my groups
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
    setSearch(searchInput);
    setPage(1);
  }

  const trackLabel = examTrack === "JEE" ? "⚗️ JEE" : "🧬 NEET";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {trackLabel} Community
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Study Community
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect with fellow {examTrack} aspirants.
          </p>
        </div>
        <button
          onClick={() => setActiveSection("Create Group")}
          id="community-create-group-btn"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl overflow-x-auto">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            id={`community-tab-${section.toLowerCase().replace(/\s/g, "-")}`}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSection === section
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {section === "Discover" && <Users className="w-3.5 h-3.5" />}
            {section === "My Groups" && <BookOpen className="w-3.5 h-3.5" />}
            {section === "Messages" && <MessageSquare className="w-3.5 h-3.5" />}
            {section === "Create Group" && <Plus className="w-3.5 h-3.5" />}
            {section}
          </button>
        ))}
      </div>

      {/* ── Discover ──────────────────────────────────────────── */}
      {activeSection === "Discover" && (
        <div className="space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search groups…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {loading && page === 1 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No groups found.</p>
              <p className="text-sm mt-1">Be the first to create one!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    myRole={g.myRole}
                    myStatus={g.myStatus}
                    onJoin={() => {}}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors disabled:opacity-60"
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
        <div className="space-y-4">
          {loadingMine ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : myGroups.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">You haven&apos;t joined any groups yet.</p>
              <button
                onClick={() => setActiveSection("Discover")}
                className="mt-3 text-sm text-indigo-500 hover:underline"
              >
                Discover groups →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((g) => (
                <Link
                  key={g.id}
                  href={`/community/groups/${g.id}`}
                  className="glass-card p-5 flex items-center justify-between gap-3 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{g.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.myRole}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Messages ──────────────────────────────────────────── */}
      {activeSection === "Messages" && (
        <DMInbox currentUserId={currentUserId} />
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
