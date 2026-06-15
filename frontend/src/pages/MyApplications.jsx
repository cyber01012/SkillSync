import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Briefcase, ArrowRight } from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function MyApplications() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobTitles, setJobTitles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    jobsApi.myApplications()
      .then(async (apps) => {
        setApplications(apps);
        const titles = {};
        await Promise.all(
          apps.map(async (app) => {
            try {
              const job = await jobsApi.get(app.JobID);
              titles[app.JobID] = job.Title;
            } catch {
              titles[app.JobID] = `Job #${app.JobID}`;
            }
          })
        );
        setJobTitles(titles);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role="freelancer" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
          <FileText size={24} /> My Applications
        </h1>

        {loading ? (
          <p className="text-[var(--fg-muted)]">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="premium-glass-card rounded-2xl p-8 text-center">
            <Briefcase size={40} className="mx-auto text-[var(--fg-muted)] mb-3" />
            <p className="text-[var(--fg-muted)] mb-4">You have not applied to any jobs yet.</p>
            <button type="button" onClick={() => navigate("/jobs")} className="btn-primary">
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <button
                key={app.ApplicationID}
                type="button"
                onClick={() => navigate(`/jobs/${app.JobID}`)}
                className="premium-glass-card rounded-2xl p-5 text-left w-full hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-[var(--fg-primary)] truncate">
                      {jobTitles[app.JobID] || `Job #${app.JobID}`}
                    </h3>
                    <p className="text-sm text-[var(--fg-muted)] mt-1">
                      Applied {app.AppliedAt ? new Date(app.AppliedAt).toLocaleDateString() : "recently"}
                    </p>
                    {app.CoverNote && (
                      <p className="text-sm text-[var(--fg-secondary)] mt-2 line-clamp-2">
                        {app.CoverNote}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${STATUS_STYLES[app.Status] || ""}`}>
                      {app.Status}
                    </span>
                    <ArrowRight size={18} className="text-[var(--fg-muted)] group-hover:text-[var(--ui-primary)] transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
