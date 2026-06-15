import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Briefcase, DollarSign, Shield, Tag, Wrench, Calendar,
  Sparkles, Loader2
} from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const COMMON_TOOLS = ["React", "Node.js", "Python", "Figma", "AWS", "Docker", "SQL", "MongoDB", "TypeScript", "Tailwind"];
const COMMON_TAGS = ["Web Development", "Mobile App", "UI/UX Design", "Data Science", "DevOps", "AI/ML", "Blockchain", "Content Writing"];

export default function PostJob() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    required_trust_score: 0,
    min_skill_level: "beginner",
    required_tools: [],
    tags: [],
    budget_min: "",
    budget_max: "",
    deadline: "",
    custom_tool: "",
    custom_tag: "",
  });

  React.useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const toggleTool = (tool) => {
    setForm((prev) => ({
      ...prev,
      required_tools: prev.required_tools.includes(tool)
        ? prev.required_tools.filter((t) => t !== tool)
        : [...prev.required_tools, tool],
    }));
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTool = () => {
    if (form.custom_tool.trim() && !form.required_tools.includes(form.custom_tool.trim())) {
      setForm((prev) => ({
        ...prev,
        required_tools: [...prev.required_tools, prev.custom_tool.trim()],
        custom_tool: "",
      }));
    }
  };

  const addCustomTag = () => {
    if (form.custom_tag.trim() && !form.tags.includes(form.custom_tag.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.custom_tag.trim()],
        custom_tag: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (form.title.length < 5) {
      setError("Title must be at least 5 characters");
      setLoading(false);
      return;
    }
    if (form.description.length < 20) {
      setError("Description must be at least 20 characters");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      required_trust_score: Number(form.required_trust_score),
      min_skill_level: form.min_skill_level,
      required_tools: form.required_tools,
      tags: form.tags,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      deadline: form.deadline || null,
    };

    try {
      await jobsApi.create(payload);
      setSuccess("Job posted successfully! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard/client"), 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <button
          type="button"
          onClick={() => navigate("/dashboard/client")}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="glass-morphism rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FD8566] flex items-center justify-center">
                <Briefcase size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[var(--fg-primary)]">Post a New Job</h1>
                <p className="text-sm text-[var(--fg-muted)]">Create a job listing and find the perfect freelancer</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="label" htmlFor="title">Job Title</label>
                <input
                  id="title"
                  type="text"
                  className="input"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g., Full-Stack Web Developer for E-commerce Platform"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="input min-h-[140px] resize-y"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the project, requirements, deliverables, and expectations..."
                  required
                />
              </div>

              {/* Trust Score & Skill Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <Shield size={14} /> Required Trust Score
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={form.required_trust_score}
                      onChange={(e) => handleChange("required_trust_score", e.target.value)}
                      className="flex-1 accent-[#FD8566]"
                    />
                    <span className="text-sm font-bold text-[var(--fg-primary)] w-10 text-right">
                      {form.required_trust_score}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label">Minimum Skill Level</label>
                  <div className="flex gap-2">
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleChange("min_skill_level", level)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          form.min_skill_level === level
                            ? "bg-[#133B6C] text-white"
                            : "bg-white border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[#FD8566]"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <DollarSign size={14} /> Budget Min ($)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={form.budget_min}
                    onChange={(e) => handleChange("budget_min", e.target.value)}
                    placeholder="500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <DollarSign size={14} /> Budget Max ($)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={form.budget_max}
                    onChange={(e) => handleChange("budget_max", e.target.value)}
                    placeholder="5000"
                    min="0"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar size={14} /> Deadline
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                />
              </div>

              {/* Required Tools */}
              <div>
                <label className="label flex items-center gap-2">
                  <Wrench size={14} /> Required Tools
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_TOOLS.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        form.required_tools.includes(tool)
                          ? "bg-[#133B6C] text-white"
                          : "bg-white border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[#5F90D4]"
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={form.custom_tool}
                    onChange={(e) => handleChange("custom_tool", e.target.value)}
                    placeholder="Add custom tool..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTool())}
                  />
                  <button type="button" onClick={addCustomTool} className="btn-outline !py-2 !px-4">
                    Add
                  </button>
                </div>
                {form.required_tools.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.required_tools.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#133B6C] text-white"
                      >
                        {tool}
                        <button
                          type="button"
                          onClick={() => toggleTool(tool)}
                          className="hover:text-[#FD8566]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="label flex items-center gap-2">
                  <Tag size={14} /> Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        form.tags.includes(tag)
                          ? "bg-[#FD8566] text-white"
                          : "bg-white border border-[var(--border)] text-[var(--fg-secondary)] hover:border-[#FD8566]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={form.custom_tag}
                    onChange={(e) => handleChange("custom_tag", e.target.value)}
                    placeholder="Add custom tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  />
                  <button type="button" onClick={addCustomTag} className="btn-outline !py-2 !px-4">
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FD8566] text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="hover:text-[#133B6C]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-coral w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Posting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Post Job
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}