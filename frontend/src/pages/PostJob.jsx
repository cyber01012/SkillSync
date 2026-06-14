import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, DollarSign, Calendar, Tag, Wrench, Shield, Send,
} from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const TOOL_OPTIONS = [
  "React", "Python", "FastAPI", "Node.js", "PostgreSQL", "MongoDB",
  "Tailwind CSS", "Redis", "TypeScript", "Docker",
];

const initialForm = {
  title: "",
  description: "",
  required_trust_score: 60,
  min_skill_level: "beginner",
  required_tools: [],
  tags: "",
  budget_min: "",
  budget_max: "",
  deadline: "",
};

export default function PostJob() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    }).finally(() => setLoading(false));
  }, []);

  function toggleTool(tool) {
    setForm((prev) => ({
      ...prev,
      required_tools: prev.required_tools.includes(tool)
        ? prev.required_tools.filter((t) => t !== tool)
        : [...prev.required_tools, tool],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await jobsApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        required_trust_score: Number(form.required_trust_score),
        min_skill_level: form.min_skill_level,
        required_tools: form.required_tools,
        tags,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        deadline: form.deadline || null,
      });
      navigate("/dashboard/client");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <p className="font-bold text-[var(--fg-primary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2">
            <Briefcase size={24} /> Post a Job
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            Create a listing for verified freelancers on SkillSync.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-morphism rounded-2xl p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-[var(--color-trust-low)]/30 bg-red-50 px-4 py-3 text-sm text-red-700">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}

          <div>
            <label className="label" htmlFor="title">Job Title</label>
            <input
              id="title"
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Build E-Commerce Dashboard"
              required
              minLength={5}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="input min-h-[140px] resize-y"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the project scope, deliverables, and expectations..."
              required
              minLength={20}
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Shield size={16} /> Required Trust Score: {form.required_trust_score}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.required_trust_score}
              onChange={(e) => setForm({ ...form, required_trust_score: e.target.value })}
              className="w-full accent-[var(--color-navy)]"
            />
          </div>

          <div>
            <label className="label">Minimum Skill Level</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, min_skill_level: level })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                    form.min_skill_level === level
                      ? "bg-[var(--ui-primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--fg-secondary)] hover:bg-[var(--ui-primary-50)]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <DollarSign size={16} /> Budget Min (USD)
              </label>
              <input
                type="number"
                className="input"
                value={form.budget_min}
                onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                placeholder="2000"
                min={0}
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <DollarSign size={16} /> Budget Max (USD)
              </label>
              <input
                type="number"
                className="input"
                value={form.budget_max}
                onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                placeholder="5000"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Calendar size={16} /> Deadline
            </label>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Wrench size={16} /> Required Tools
            </label>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    form.required_tools.includes(tool)
                      ? "bg-[var(--color-coral)] text-white"
                      : "bg-[var(--muted)] text-[var(--fg-secondary)] hover:bg-[var(--color-coral-50)]"
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Tag size={16} /> Tags (comma-separated)
            </label>
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="frontend, backend, dashboard"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
            <Send size={18} />
            {submitting ? "Posting..." : "Post Job"}
          </button>
        </form>
      </main>
    </div>
  );
}
