import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ArrowRight, Plus, Loader2, Users, Clock } from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function MyJobs() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await jobsApi.myPosted();
      setJobs(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2">
            <Briefcase size={24} /> My Jobs
          </h1>
          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className="btn-coral flex items-center gap-2"
          >
            <Plus size={18} /> Post New Job
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--fg-muted)]" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="premium-glass-card rounded-2xl p-8 text-center">
            <Briefcase size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
            <h3 className="font-bold text-[var(--fg-primary)] mb-2">No jobs posted yet</h3>
            <p className="text-sm text-[var(--fg-muted)] mb-4">Create your first job listing to find talented freelancers</p>
            <button type="button" onClick={() => navigate("/post-job")} className="btn-primary">
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <button
                key={job.JobID}
                type="button"
                onClick={() => navigate(`/jobs/${job.JobID}`)}
                className="w-full text-left premium-glass-card rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        job.Status === "open"
                          ? "bg-emerald-50 text-emerald-600"
                          : job.Status === "contracted"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {job.Status}
                      </span>
                      <span className="text-xs text-[var(--fg-muted)]">Job #{job.JobID}</span>
                    </div>
                    <h3 className="font-bold text-[var(--fg-primary)] text-lg truncate group-hover:text-[#5F90D4] transition-colors">
                      {job.Title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--fg-muted)]">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {job.application_count || 0} applications
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {job.CreatedAt ? new Date(job.CreatedAt).toLocaleDateString() : "Recently"}
                      </span>
                      <span>Min: {job.MinSkillLevel}</span>
                      <span>Trust {job.RequiredTrustScore}+</span>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-[var(--fg-muted)] shrink-0 mt-1 group-hover:text-[#5F90D4] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}