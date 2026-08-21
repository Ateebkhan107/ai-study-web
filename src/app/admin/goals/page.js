"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Trash2 } from "lucide-react";

export default function AdminGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalType, setGoalType] = useState("PYQ");
  const [goalTarget, setGoalTarget] = useState("ALL");
  const [targetValue, setTargetValue] = useState("");
  const [xp, setXp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/goals");
      const data = await res.json();
      if (data.success) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function createGoal(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle,
          description: goalDescription,
          goal_type: goalType,
          target: goalTarget,
          target_value: targetValue,
          xp
        }),
      });
      if (res.ok) {
        alert("Goal created!");
        loadGoals();
        setGoalTitle("");
        setGoalDescription("");
        setTargetValue("");
        setXp("");
      } else {
        alert("Failed to create goal");
      }
    } catch (error) {
      console.error(error);
    }
    setSubmitting(false);
  }

  async function deleteGoal(id) {
    if(!confirm("Delete this goal?")) return;
    try {
      const res = await fetch("/api/admin/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        loadGoals();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
          Daily Goals <Target className="w-6 h-6" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Manage daily challenges to keep students engaged.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus className="w-5 h-5"/> New Goal</h2>
          <form onSubmit={createGoal} className="space-y-4">
            <div>
              <label className="text-xs font-bold mb-1 block">Title</label>
              <input type="text" value={goalTitle} onChange={e=>setGoalTitle(e.target.value)} className="w-full border p-2 rounded-lg bg-transparent text-sm" required />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">Description</label>
              <textarea value={goalDescription} onChange={e=>setGoalDescription(e.target.value)} className="w-full border p-2 rounded-lg bg-transparent text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold mb-1 block">Type</label>
                <select value={goalType} onChange={e=>setGoalType(e.target.value)} className="w-full border p-2 rounded-lg bg-transparent text-sm">
                  <option value="PYQ">Solve PYQs</option>
                  <option value="TEST">Take Test</option>
                  <option value="STREAK">Maintain Streak</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">Track</label>
                <select value={goalTarget} onChange={e=>setGoalTarget(e.target.value)} className="w-full border p-2 rounded-lg bg-transparent text-sm">
                  <option value="ALL">All</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold mb-1 block">Target Count</label>
                <input type="number" value={targetValue} onChange={e=>setTargetValue(e.target.value)} className="w-full border p-2 rounded-lg bg-transparent text-sm" required />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">XP Reward</label>
                <input type="number" value={xp} onChange={e=>setXp(e.target.value)} className="w-full border p-2 rounded-lg bg-transparent text-sm" required />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-brand text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {submitting ? "Saving..." : "Create Goal"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? <p className="text-gray-500">Loading goals...</p> : goals.map(goal => (
            <div key={goal.id} className="bg-[var(--card)] dark:bg-[var(--surface)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <span className="text-xs font-bold bg-gray-100 dark:bg-[var(--surface-elevated)] px-2 py-1 rounded">{goal.target}</span>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">{goal.goal_type}</span>
                </div>
                <h3 className="font-bold text-lg">{goal.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{goal.description}</p>
                <div className="flex gap-4 text-sm font-medium">
                  <span className="text-indigo-600">Target: {goal.target_value}</span>
                  <span className="text-amber-500">XP: +{goal.xp}</span>
                </div>
              </div>
              <button onClick={() => deleteGoal(goal.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {!loading && goals.length === 0 && (
            <div className="text-center p-12 border border-dashed rounded-2xl text-gray-500">
              No daily goals active.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
