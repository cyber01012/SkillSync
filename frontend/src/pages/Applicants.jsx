import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Loader2, Briefcase, CheckCircle, XCircle, Clock } from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function Applicants() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    loadApplicants();
  }, []);

  async function loadApplicants() {
    try {
      setLoading(true);
      const jobsData = await jobsApi.myPosted();
      setJobs(jobsData);

      const appsMap = {};
      await Promise.all(
        jobsData.map(async (job) => {
          try {
            const apps = await jobsApi.getApplicants(job.JobID);
            appsMap[job.JobID] = apps;
          } catch {
            appsMap[job.JobID] = [];
          }
        })
      );
      setApplicantsMap(appsMap);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(jobId, appId, status) {
    try {
      await jobsApi.updateApplicationStatus(appId, status);
      // Refresh applicants for this job
      const apps = await jobsApi.getApplicants(jobId);
      setApplicantsMap((prev) => ({ ...prev, [jobId]: apps }));
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update status");
    }
  }

  const totalApplicants = Object.values(applicantsMap).flat().length;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
          <Users size={24} /> Applicants
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--fg-muted)]" />
          </div>
        ) : totalApplicants === 0 ? (
          <div className="glass-morphism rounded-2xl p-8 text-center">
            <Users size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
            <h3 className="font-bold text-[var(--fg-primary)] mb-2">No applicants yet</h3>
            <p className="text-sm text-[var(--fg-muted)] mb-4">Post jobs and wait for freelancers to apply</p>
            <button type="button" onClick={() => navigate("/post-job")} className="btn-primary">
              Post a Job
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => {
              const apps = applicantsMap[job.JobID] || [];
              if (apps.length === 0) return null;
              return (
                <div key={job.JobID} className="glass-morphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[var(--fg-primary)] flex items-center gap-2">
                      <Briefcase size={18} />
                      {job.Title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.JobID}`)}
                      className="text-sm font-semibold text-[#5F90D4] hover:text-[#133B6C] flex items-center gap-1"
                    >
                      View Job <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {apps.map((app) => (
                      <div key={app.ApplicationID} className="p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[var(--fg-primary)]">
                              Freelancer #{app.FreelancerID}
                            </p>
                            {app.CoverNote && (
                              <p className="text-sm text-[var(--fg-secondary)] mt-1 line-clamp-2">
                                {app.CoverNote}
                              </p>
                            )}
                            <p className="text-xs text-[var(--fg-muted)] mt-1">
                              Applied {app.AppliedAt ? new Date(app.AppliedAt).toLocaleDateString() : "recently"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${STATUS_STYLES[app.Status] || ""}`}>
                              {app.Status}
                            </span>
                            {app.Status === "pending" && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(job.JobID, app.ApplicationID, "accepted")}
                                  className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                                  title="Accept"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(job.JobID, app.ApplicationID, "rejected")}
                                  className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}