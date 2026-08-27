"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [href, setHref] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendNotification(e) {
    e.preventDefault();
    if (!title || !message) return alert("Fill title and message");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, target, href }),
      });
      if (res.ok) {
        alert("Notification sent successfully!");
        setTitle("");
        setMessage("");
        setHref("");
      } else {
        alert("Failed to send notification.");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending notification.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black font-display mb-2 flex items-center gap-2">
          Notifications <Bell className="w-6 h-6" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Push announcements and updates to your students.</p>
      </div>
      
      <form onSubmit={sendNotification} className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold mb-2">Target Audience</label>
          <select 
            value={target} 
            onChange={e => setTarget(e.target.value)}
            className="w-full border p-3 rounded-xl bg-transparent"
          >
            <option value="ALL">All Users</option>
            <option value="JEE">JEE Track Only</option>
            <option value="NEET">NEET Track Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Title</label>
          <input 
            type="text" 
            placeholder="e.g. New Mock Test Available!"
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full border p-3 rounded-xl bg-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Message</label>
          <textarea 
            placeholder="Write your announcement here..."
            value={message} 
            onChange={e => setMessage(e.target.value)}
            className="w-full border p-3 rounded-xl bg-transparent min-h-[120px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Action Link (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. /tests/mock-1"
            value={href} 
            onChange={e => setHref(e.target.value)}
            className="w-full border p-3 rounded-xl bg-transparent"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Notification"}
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
