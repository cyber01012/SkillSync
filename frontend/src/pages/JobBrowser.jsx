import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";
import { Briefcase, MapPin } from "lucide-react";

export default function JobBrowser() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    jobsApi.browse().then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleApply(jobId) {
    setApplying(jobId);
    try {
      await jobsApi.apply(jobId, "I'm interested in this opportunity.");
      alert("Application submitted!");
    } catch (err) {
      alert(err?.response?.data?.detail || "Application failed");
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="freelancer" />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] mb-6">Browse Jobs</h1>
        {loading ? (
          <p className="text-[var(--fg-muted)]">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-[var(--fg-muted)]">No matching jobs found</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job.JobID} className="rounded-2xl border border-[var(--border)] p-5 flex items-center justify-between" style={{ background: "var(--card)" }}>
                <div>
                  <h3 className="font-bold text-[var(--fg-primary)] flex items-center gap-2">
                    <Briefcase size={18} /> {job.Title}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] mt-1 flex items-center gap-1">
                    <MapPin size={14} /> Min skill: {job.MinSkillLevel} · Trust: {job.RequiredTrustScore}+
                  </p>
                </div>
                <button
                  type="button"
                  disabled={applying === job.JobID}
                  onClick={() => handleApply(job.JobID)}
                  className="btn-primary !rounded-xl !py-2 !px-4"
                >
                  {applying === job.JobID ? "Applying..." : "Apply"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
