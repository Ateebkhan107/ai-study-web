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

export default function GroupPage({ groupId, currentUserId }) {
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Chat");
  const [error, setError] = useState(null);
  const [leaving, setLeaving] = useState(false);

  // Settings state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrivacy, setEditPrivacy] = useState("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    fetch(`/api/community/groups/${groupId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.group) {
          setGroup(data.group);
          setMembership(data.membership);
          setEditName(data.group.name);
          setEditDesc(data.group.description || "");
          setEditPrivacy(data.group.privacy);
        } else {
          setError(data.error || "Group not found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load group.");
        setLoading(false);
      });
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

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-5rem)]">
      {/* Group header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center gap-3">
        <Link href="/community" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 dark:text-white truncate">{group.name}</h1>
            <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              group.privacy === "PUBLIC"
                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}>
              {group.privacy === "PUBLIC" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {group.privacy}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Users className="w-3 h-3" /> {group.member_count} members
            {myRole && <span className="ml-2 text-indigo-500">· {myRole}</span>}
          </p>
        </div>

        {isMember && !isOwner && (
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="shrink-0 flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Leave
          </button>
        )}
      </div>

      {/* If not a member of a PRIVATE group */}
      {!isMember && group.privacy === "PRIVATE" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Private Group</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Request to join to see messages and members.
          </p>
          <GroupCard group={group} myRole={null} myStatus={null} />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="px-4 border-b border-slate-200 dark:border-slate-800 flex gap-1 overflow-x-auto bg-white/40 dark:bg-slate-900/40">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                id={`group-tab-${tab.toLowerCase()}`}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
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

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "Chat" && isMember && (
              <GroupChat groupId={groupId} currentUserId={currentUserId} />
            )}
            {activeTab === "Chat" && !isMember && (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Join this group to chat.</p>
              </div>
            )}
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
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      maxLength={300}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Privacy</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["PUBLIC", "PRIVATE"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setEditPrivacy(opt)}
                          className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                            editPrivacy === opt
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
  );
}
