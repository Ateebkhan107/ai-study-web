"use client";

import { useState, useEffect } from "react";
import { Award, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";

export default function BadgeManager() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Award");
  const [color, setColor] = useState("text-blue-500");
  const [category, setCategory] = useState("general");
  const [reqType, setReqType] = useState("tests_completed");
  const [reqVal, setReqVal] = useState(10);
  const [xp, setXp] = useState(50);
  const [enabled, setEnabled] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/badges");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBadges(data);
      } else {
        console.warn("API returned error:", data);
        setBadges([]);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(b) {
    setEditingId(b.id);
    setName(b.name);
    setDescription(b.description || "");
    setIcon(b.icon);
    setColor(b.color);
    setCategory(b.category || "general");
    setReqType(b.requirement_type);
    setReqVal(b.requirement_value);
    setXp(b.xp_reward);
    setEnabled(b.enabled);
    setDisplayOrder(b.display_order);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setIcon("Award");
    setColor("text-blue-500");
    setCategory("general");
    setReqType("tests_completed");
    setReqVal(10);
    setXp(50);
    setEnabled(true);
    setDisplayOrder(0);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      name,
      description,
      icon,
      color,
      category,
      requirement_type: reqType,
      requirement_value: parseInt(reqVal),
      xp_reward: parseInt(xp),
      enabled,
      display_order: parseInt(displayOrder)
    };

    try {
      if (editingId) {
        await fetch("/api/admin/badges", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload })
        });
      } else {
        await fetch("/api/admin/badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      resetForm();
      loadBadges();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete badge?")) return;
    try {
      await fetch(`/api/admin/badges?id=${id}`, { method: "DELETE" });
      loadBadges();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="glass-card p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-indigo-500" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Badge Management
        </h2>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Badge Name</label>
          <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
          <input type="text" value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Icon (Lucide Name)</label>
          <input required type="text" value={icon} onChange={e=>setIcon(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Color Class</label>
          <input required type="text" value={color} onChange={e=>setColor(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Requirement Type</label>
          <select value={reqType} onChange={e=>setReqType(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none">
            <option value="tests_completed">Tests Completed</option>
            <option value="pyq_completed">PYQs Completed</option>
            <option value="total_questions">Total Questions</option>
            <option value="total_xp">Total XP</option>
            <option value="streak">Day Streak</option>
            <option value="accuracy">Accuracy (%)</option>
            <option value="leaderboard_rank">Leaderboard Rank</option>
            <option value="mock_tests">Mock Test Ace (%)</option>
            <option value="speed_solver">Speed Solver (s)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Requirement Value</label>
          <input required type="number" value={reqVal} onChange={e=>setReqVal(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">XP Reward</label>
          <input required type="number" value={xp} onChange={e=>setXp(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Display Order</label>
          <input required type="number" value={displayOrder} onChange={e=>setDisplayOrder(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:col-span-2">
          <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} id="enabledCheck" />
          <label htmlFor="enabledCheck" className="text-sm font-bold text-slate-600 dark:text-slate-300">Enabled</label>
        </div>
        
        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-sm">
            {editingId ? "Update Badge" : "Create Badge"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-bold transition-all text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      <div className="space-y-3">
        {loading ? <p>Loading badges...</p> : badges.map(b => (
          <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {b.name} 
                {b.enabled ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </span>
              <span className="text-xs text-slate-500">{b.requirement_type} = {b.requirement_value} | {b.xp_reward} XP</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleEdit(b)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
