"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Lock,
  Globe,
  Loader2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import GroupChat from "./GroupChat";
import MembersPanel from "./MembersPanel";
import JoinRequestsPanel from "./JoinRequestsPanel";
import GroupCard from "./GroupCard";

const TABS = ["Chat", "Members", "Requests", "Settings"];

export default function GroupPage({ groupId, currentUserId, currentUserName }) {
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Chat");
  const [error, setError] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [myGroups, setMyGroups] = useState([]);

  const [onlineCount, setOnlineCount] = useState(null);

  // Settings state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrivacy, setEditPrivacy] = useState("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    async function loadGroup() {
      try {
        const [groupResponse, mineResponse] = await Promise.all([
          fetch(`/api/community/groups/${groupId}`),
          fetch("/api/community/groups?type=mine&limit=50"),
        ]);
        const data = await groupResponse.json();
        const mineData = await mineResponse.json();
        if (data.group) {
          setGroup(data.group);
          setMembership(data.membership);
          setEditName(data.group.name);
          setEditDesc(data.group.description || "");
          setEditPrivacy(data.group.privacy);
        } else {
          setError(data.error || "Group not found.");
        }
        setMyGroups(mineData.groups || []);
        setLoading(false);
      } catch {
        setError("Failed to load group.");
        setLoading(false);
      }
    }
    loadGroup();
  }, [groupId]);

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this group?")) return;
    setLeaving(true);
    const res = await fetch(`/api/community/groups/${groupId}/leave`, { method: "POST" });
    if (res.ok) router.push("/community");
    else {
      const d = await res.json();
      alert(d.error || "Failed to leave.");
    }
    setLeaving(false);
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const res = await fetch(`/api/community/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc, privacy: editPrivacy }),
    });
    const data = await res.json();
    if (res.ok) {
      setGroup(data.group);
      setSaveMsg("Saved!");
    } else {
      setSaveMsg(data.error || "Failed to save.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-semibold">{error}</p>
        <Link href="/community" className="mt-3 text-sm text-indigo-500 hover:underline block">
          ← Back to Community
        </Link>
      </div>
    );
  }

  const myRole = membership?.role || null;
  const isOwner = myRole === "OWNER";
  const isAdmin = myRole === "ADMIN" || myRole === "OWNER";
  const isMember = !!membership;

  const visibleTabs = TABS.filter((t) => {
    if (t === "Requests") return isAdmin;
    if (t === "Settings") return isOwner;
    return true;
  });

  const managementTabs = visibleTabs.filter((tab) => tab !== "Chat");

  return (
    <div className="mx-auto flex h-[calc(100dvh-5.25rem)] max-h-[calc(100dvh-5.25rem)] w-full max-w-6xl overflow-hidden rounded-none border-slate-200 bg-white shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] md:h-[calc(100dvh-8rem)] md:max-h-[calc(100dvh-8rem)] md:rounded-xl md:border">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-50/90 p-3 dark:border-[var(--border-subtle)] dark:bg-[var(--background)] md:block">
        <Link href="/community" className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-950 dark:hover:bg-[var(--surface)] dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Community
        </Link>
        <div className="mb-3 px-2">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">My Groups</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Study rooms you belong to</p>
        </div>
        <div className="max-h-[calc(100%-5.5rem)] space-y-1 overflow-y-auto pr-1">
          {myGroups.map((item) => (
            <Link
              key={item.id}
              href={`/community/groups/${item.id}`}
              className={`relative block rounded-lg border px-3 py-2.5 transition-colors ${
                item.id === groupId
                  ? "border-brand/40 bg-white text-slate-950 dark:bg-[var(--surface)] dark:text-white"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:border-[var(--border-subtle)] dark:hover:bg-[var(--surface)] dark:hover:text-white"
              }`}
            >
              {item.id === groupId && <span className="absolute left-0 top-2.5 h-8 w-1 rounded-r-full bg-brand" />}
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold">{item.name}</span>
                {item.myRole === "OWNER" && <span className="text-[10px] font-bold text-amber-700 dark:text-brand">Owner</span>}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">{item.member_count ?? 0} members</p>
            </Link>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-[var(--surface)]">
      {/* Group header */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:gap-3 sm:px-4">
        <Link href="/community" className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[var(--surface-elevated)] dark:hover:text-white md:hidden">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-bold text-slate-900 dark:text-white">{group.name}</h1>
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
              group.privacy === "PUBLIC"
                ? "border-slate-200 bg-slate-50 text-slate-600 dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-slate-300"
                : "border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            }`}>
              {group.privacy === "PUBLIC" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {group.privacy === "PUBLIC" ? "Public" : "Private"}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count ?? 0} members</span>
            {onlineCount !== null && onlineCount > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount} online
              </span>
            )}
            {myRole && <span className="text-slate-400">· {myRole.toLowerCase()}</span>}
          </p>
        </div>

        {isMember && !isOwner && (
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 dark:hover:border-red-500/30 dark:hover:bg-red-900/20 min-[390px]:flex"
          >
            {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Leave
          </button>
        )}
      </div>

      {/* If not a member of a PRIVATE group */}
      {!isMember && group.privacy === "PRIVATE" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Lock className="w-12 h-12 text-brand mb-4" />
          <h2 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Private Group</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Request to join to see messages and members.
          </p>
          <GroupCard group={group} myRole={null} myStatus={null} />
        </div>
      ) : (
        <>
          {managementTabs.length > 0 && (
          <div className="flex gap-5 overflow-x-auto border-b border-slate-200 bg-white px-3 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] sm:px-4">
            {["Chat", ...managementTabs].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                id={`group-tab-${tab.toLowerCase()}`}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-0 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-brand text-slate-950 dark:text-white"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab === "Chat" && <MessageSquare className="w-3.5 h-3.5" />}
                {tab === "Members" && <Users className="w-3.5 h-3.5" />}
                {tab === "Requests" && <ChevronRight className="w-3.5 h-3.5" />}
                {tab === "Settings" && <Settings className="w-3.5 h-3.5" />}
                {tab}
              </button>
            ))}
          </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-hidden relative">
            <div className={`h-full ${activeTab === "Chat" ? "block" : "hidden"}`}>
              {isMember ? (
                <GroupChat
                  groupId={groupId}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onPresenceChange={setOnlineCount}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-slate-400">
                  <p className="text-sm font-semibold">Join this group to chat.</p>
                </div>
              )}
            </div>

            {activeTab === "Members" && (
              <div className="overflow-y-auto h-full p-4">
                <MembersPanel groupId={groupId} myRole={myRole} currentUserId={currentUserId} />
              </div>
            )}
            {activeTab === "Requests" && isAdmin && (
              <div className="overflow-y-auto h-full p-4">
                <JoinRequestsPanel groupId={groupId} />
              </div>
            )}
            {activeTab === "Settings" && isOwner && (
              <div className="overflow-y-auto h-full p-4 max-w-md">
                <h2 className="font-bold text-slate-900 dark:text-white mb-5">Group Settings</h2>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={60}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand/60 focus:outline-none dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      maxLength={300}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand/60 focus:outline-none dark:border-[var(--border)] dark:bg-[var(--surface-elevated)] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Privacy</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {["PUBLIC", "PRIVATE"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setEditPrivacy(opt)}
                          className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                            editPrivacy === opt
                              ? "border-brand/60 bg-brand/10 text-slate-900 dark:text-white"
                              : "border-slate-200 dark:border-[var(--border)] text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  {saveMsg && (
                    <p className={`text-sm ${saveMsg === "Saved!" ? "text-emerald-500" : "text-red-500"}`}>
                      {saveMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-bold text-black transition-colors hover:bg-brand-hover disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
