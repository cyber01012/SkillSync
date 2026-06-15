import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";
import {
  Briefcase, MapPin, Search, X, Filter,
  DollarSign, Clock, Tag, Star, SlidersHorizontal
} from "lucide-react";

const SKILL_LEVELS = ["all", "beginner", "intermediate", "advanced", "expert"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "trust_high", label: "Highest Trust Required" },
  { value: "trust_low", label: "Lowest Trust Required" },
];

export default function JobBrowser() {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch REAL data from database
  useEffect(() => {
    jobsApi.browse().then((data) => {
      setAllJobs(data);
      setFilteredJobs(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Filter and sort REAL data
  useEffect(() => {
    let result = [...allJobs];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.Title?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q) ||
          job.tags?.some((t) => t.toLowerCase().includes(q)) ||
          job.required_tools?.some((t) => t.toLowerCase().includes(q)) ||
          job.client_name?.toLowerCase().includes(q)
      );
    }

    // Skill level filter
    if (selectedLevel !== "all") {
      result = result.filter((job) => job.MinSkillLevel === selectedLevel);
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    } else if (sortBy === "trust_high") {
      result.sort((a, b) => b.RequiredTrustScore - a.RequiredTrustScore);
    } else if (sortBy === "trust_low") {
      result.sort((a, b) => a.RequiredTrustScore - b.RequiredTrustScore);
    }

    setFilteredJobs(result);
  }, [searchQuery, selectedLevel, sortBy, allJobs]);

  async function handleApply(jobId, e) {
    e.stopPropagation();
    setApplying(jobId);
    try {
      await jobsApi.apply(jobId, "I'm interested in this opportunity.");
      const updated = await jobsApi.browse();
      setAllJobs(updated);
    } catch (err) {
      alert(err?.response?.data?.detail || "Application failed");
    } finally {
      setApplying(null);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedLevel("all");
    setSortBy("newest");
  }

  const hasFilters = searchQuery || selectedLevel !== "all" || sortBy !== "newest";

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role="freelancer" />
      
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[var(--fg-primary)] mb-2">Browse Jobs</h1>
          <p className="text-sm text-[var(--fg-muted)]">Find opportunities matching your skills</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="premium-glass-card rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                type="text"
                placeholder="Search by title, skills, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border)] bg-white/80 text-sm outline-none focus:border-[#FD8566] focus:ring-2 focus:ring-[#FD8566]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                showFilters || hasFilters
                  ? "bg-[#133B6C] text-white"
                  : "bg-white/80 border border-[var(--border)] text-[var(--fg-primary)] hover:bg-white"
              }`}
            >
              <SlidersHorizontal size={16} /> 
              Filters {hasFilters && <span className="ml-1 w-5 h-5 rounded-full bg-[#FD8566] text-white text-xs flex items-center justify-center">!</span>}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
              {/* Skill Level */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Skill Level</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                        selectedLevel === level
                          ? "bg-[#133B6C] text-white shadow-md"
                          : "bg-white/80 border border-[var(--border)] text-[var(--fg-secondary)] hover:bg-white"
                      }`}
                    >
                      {level === "all" ? "All Levels" : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        sortBy === opt.value
                          ? "bg-[#5F90D4] text-white shadow-md"
                          : "bg-white/80 border border-[var(--border)] text-[var(--fg-secondary)] hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-[#FD8566] hover:text-[#E86A4A] flex items-center gap-1 transition-colors"
                >
                  <X size={14} /> Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--fg-muted)]">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
          </p>
          {hasFilters && (
            <span className="text-xs text-[var(--fg-muted)] bg-white/50 px-2 py-1 rounded-full">
              Filtered
            </span>
          )}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#133B6C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="premium-glass-card rounded-2xl p-12 text-center">
            <Briefcase size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
            <p className="text-[var(--fg-muted)] font-semibold">No jobs found</p>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Try adjusting your search or filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-primary mt-4">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.JobID}
                onClick={() => navigate(`/jobs/${job.JobID}`)}
                className="premium-glass-card rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold text-[var(--fg-primary)] text-lg group-hover:text-[#5F90D4] transition-colors">
                        {job.Title}
                      </h3>
                      {job.has_applied && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          Applied
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        job.Status === "open"
                          ? "bg-[#E8F0F8] text-[#133B6C]"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {job.Status}
                      </span>
                    </div>

                    {/* Client Info */}
                    {(job.client_name || job.client_company) && (
                      <p className="text-sm text-[var(--fg-secondary)] mb-2">
                        {job.client_company || job.client_name}
                        {job.client_company && job.client_name ? ` (${job.client_name})` : ""}
                      </p>
                    )}

                    {/* Description */}
                    {job.description && (
                      <p className="text-sm text-[var(--fg-secondary)] mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--fg-muted)] mb-3">
                      <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full">
                        <Star size={12} className="text-[#FD8566]" />
                        {job.MinSkillLevel}
                      </span>
                      <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full">
                        <MapPin size={12} />
                        Trust {job.RequiredTrustScore}+
                      </span>
                      {job.budget_range && (
                        <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full">
                          <DollarSign size={12} />
                          ${job.budget_range.min?.toLocaleString()} - ${job.budget_range.max?.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full">
                        <Clock size={12} />
                        {job.application_count || 0} application{job.application_count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--color-sky-50)] text-[var(--color-sky-dark)]"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.required_tools?.map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--ui-primary-50)] text-[var(--ui-primary)]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="shrink-0">
                    <button
                      type="button"
                      disabled={applying === job.JobID || job.has_applied || job.Status !== "open"}
                      onClick={(e) => handleApply(job.JobID, e)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        job.has_applied
                          ? "bg-emerald-50 text-emerald-600 cursor-default"
                          : job.Status !== "open"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : applying === job.JobID
                          ? "bg-[#133B6C]/70 text-white"
                          : "btn-primary"
                      }`}
                    >
                      {job.has_applied
                        ? "Applied"
                        : applying === job.JobID
                        ? "Applying..."
                        : job.Status !== "open"
                        ? "Closed"
                        : "Apply Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}