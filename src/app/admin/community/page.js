"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  Users,
  MessageSquare,
  Shield,
  Trash2,
  Loader2,
  RefreshCw,
  EyeOff,
  UserX,
  Snowflake,
  CheckCircle,
} from "lucide-react";

const STATUS_FILTERS = ["open", "dismissed", "actioned"];
const TARGET_TYPE_ICONS = {
  user: Users,
  message: MessageSquare,
  group: Shield,
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminCommunityPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type, targetId }
  const [actionReason, setActionReason] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);

  function loadReports(status = statusFilter) {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/community/reports?status=${status}`)
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load reports.");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadReports(statusFilter);
  }, [statusFilter]);

  async function reviewReport(reportId, action) {
    setProcessing((p) => ({ ...p, [reportId]: true }));
    try {
      const res = await fetch("/api/admin/community/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        const d = await res.json();
        setError(d.error || "Failed.");
      }
    } finally {
      setProcessing((p) => ({ ...p, [reportId]: false }));
    }
  }

  async function moderate(action, targetType, targetId, extra = {}) {
    setActionSubmitting(true);
    try {
      const res = await fetch("/api/admin/community/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetType, targetId, reason: actionReason, extra }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionModal(null);
        setActionReason("");
        alert(`Action "${action}" applied successfully.`);
      } else {
        alert(data.error || "Failed.");
      }
    } finally {
      setActionSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black mb-1">Community Moderation</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Review reports, moderate content, and manage community health.
        </p>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <h2 className="font-bold mb-4 text-sm text-gray-500 uppercase tracking-wider">Admin Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Suspend User", icon: UserX, action: "suspend_user", targetType: "user" },
            { label: "Hide Message", icon: EyeOff, action: "hide_message", targetType: "message" },
            { label: "Freeze Group", icon: Snowflake, action: "freeze_group", targetType: "group" },
            { label: "Delete Group", icon: Trash2, action: "delete_group", targetType: "group" },
          ].map((item) => (
            <button
              key={item.action}
              onClick={() => setActionModal(item)}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all gap-2"
            >
              <item.icon className="w-6 h-6 text-gray-400" />
              <span className="text-xs font-bold text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold">Reports</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
                    statusFilter === s
                      ? "bg-white dark:bg-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => loadReports(statusFilter)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {error && (
          <p className="px-6 py-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Flag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {statusFilter} reports.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reports.map((report) => {
              const Icon = TARGET_TYPE_ICONS[report.target_type] || Flag;
              return (
                <div key={report.id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          {report.target_type}
                        </span>
                        <span className="text-xs text-gray-400 font-mono truncate">{report.target_id}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mt-1 line-clamp-2">{report.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        by <span className="font-mono">{report.reporter_id}</span> · {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>

                  {statusFilter === "open" && (
                    <div className="flex items-center gap-2 shrink-0">
                      {processing[report.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      ) : (
                        <>
                          <button
                            onClick={() => reviewReport(report.id, "dismissed")}
                            title="Dismiss"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => reviewReport(report.id, "actioned")}
                            title="Mark actioned"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                          >
                            Action Taken
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#111] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-1">{actionModal.label}</h3>
            <p className="text-sm text-gray-500 mb-4">
              Target type: <strong>{actionModal.targetType}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Target ID</label>
                <input
                  id="moderate-target-id"
                  type="text"
                  placeholder="Paste the user/message/group ID"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => setActionModal((m) => ({ ...m, resolvedId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Reason (optional)</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for this action (will be logged)"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setActionModal(null); setActionReason(""); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  moderate(
                    actionModal.action,
                    actionModal.targetType,
                    actionModal.resolvedId || "",
                    {}
                  )
                }
                disabled={actionSubmitting || !actionModal.resolvedId}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
