"use client";

import { useState, useEffect } from "react";
import { Crown, Shield, User, UserX, Loader2 } from "lucide-react";
import BlockReportMenu from "./BlockReportMenu";

const ROLE_ICONS = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
};

export default function MembersPanel({ groupId, myRole, currentUserId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState(null);

  const isOwner = myRole === "OWNER";
  const isAdmin = myRole === "ADMIN" || myRole === "OWNER";

  useEffect(() => {
    fetch(`/api/community/groups/${groupId}/members`)
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load members.");
        setLoading(false);
      });
  }, [groupId]);

  async function changeRole(targetUserId, role) {
    setProcessing((p) => ({ ...p, [targetUserId]: true }));
    try {
      const res = await fetch(`/api/community/groups/${groupId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, role }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.user_id === targetUserId ? { ...m, role } : m))
        );
      } else {
        const d = await res.json();
        setError(d.error || "Failed to update role.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setProcessing((p) => ({ ...p, [targetUserId]: false }));
    }
  }

  async function removeMember(targetUserId) {
    setProcessing((p) => ({ ...p, [targetUserId]: true }));
    try {
      const res = await fetch(`/api/community/groups/${groupId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId));
      } else {
        const d = await res.json();
        setError(d.error || "Failed to remove member.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setProcessing((p) => ({ ...p, [targetUserId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
        Members ({members.length})
      </h3>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="space-y-1.5">
        {members.map((m) => {
          const RoleIcon = ROLE_ICONS[m.role] || User;
          const isSelf = m.user_id === currentUserId;
          const canRemove = isAdmin && !isSelf && m.role !== "OWNER" && (isOwner || m.role === "MEMBER");
          const canPromote = isOwner && !isSelf && m.role !== "OWNER";

          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(m.profile?.full_name || "?")[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {m.profile?.full_name || "Unknown"}
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-indigo-500 font-normal">(you)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <RoleIcon className="w-3 h-3" />
                    <span>{m.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {processing[m.user_id] ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : (
                  <>
                    {canPromote && (
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.user_id, e.target.value)}
                        className="text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                    {canRemove && (
                      <button
                        onClick={() => removeMember(m.user_id)}
                        title="Remove member"
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                    {!isSelf && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <BlockReportMenu targetUserId={m.user_id} targetType="user" targetId={m.user_id} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
