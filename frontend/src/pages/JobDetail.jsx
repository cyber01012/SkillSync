import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Briefcase, Building2, DollarSign, Shield, Tag, Users, Sparkles, Send,
} from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import DashboardSidebar from "../components/common/DashboardSidebar";
import MatchResults from "../components/dashboard/MatchResults";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[status] || "bg-[var(--muted)] text-[var(--fg-secondary)]"}`}>
      {status}
    </span>
  );
}

function JobDetailsPanel({ job }) {
  return (
    <div className="space-y-4">
      {job.description && (
        <p className="text-[var(--fg-secondary)] leading-relaxed">{job.description}</p>
      )}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ui-primary-50)] text-[var(--ui-primary)] font-semibold">
          <Shield size={14} /> Trust {job.RequiredTrustScore}+
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--muted)] font-semibold capitalize">
          {job.MinSkillLevel}
        </span>
        {job.budget_range && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-coral-50)] text-[var(--color-coral-dark)] font-semibold">
           <DollarSign size={14} />
            ${job.budget_range.min?.toLocaleString()} – ${job.budget_range.max?.toLocaleString()}
          </span>
        )}
      </div>
      {(job.client_name || job.client_company) && (
        <p className="text-sm text-[var(--fg-muted)] flex items-center gap-2">
          <Building2 size={16} />
          {job.client_company || job.client_name}
          {job.client_company && job.client_name ? ` (${job.client_name})` : ""}
        </p>
      )}
      {job.required_tools?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-muted)] mb-2">Tools</p>
          <div className="flex flex-wrap gap-2">
            {job.required_tools.map((tool) => (
              <span key={tool} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-[var(--border)]">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
      {job.tags?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--fg-muted)] mb-2 flex items-center gap-1">
            <Tag size={12} /> Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-sky-50)] text-[var(--color-sky-dark)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isClient = role === "client";

  const [profile, setProfile] = useState(null);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState("details");
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    jobsApi.get(jobId)
      .then((data) => {
        setJob(data);
        if (!isClient && data.has_applied) {
          jobsApi.myApplications().then((apps) => {
            const mine = apps.find((a) => a.JobID === Number(jobId));
            if (mine) setApplicationStatus(mine.Status);
          }).catch(() => {});
        }
      })
      .catch((err) => setError(err?.response?.data?.detail || "Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId, isClient]);

  useEffect(() => {
    if (!isClient || !job) return;

    if (tab === "applicants") {
      setTabLoading(true);
      jobsApi.getApplicants(jobId)
        .then(setApplicants)
        .catch(console.error)
        .finally(() => setTabLoading(false));
    }

    if (tab === "matches") {
      setTabLoading(true);
      jobsApi.getMatches(jobId)
        .then((data) => setMatches(data.matches || []))
        .catch(console.error)
        .finally(() => setTabLoading(false));
    }
  }, [tab, jobId, isClient, job]);

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true);
    setMessage("");
    try {
      await jobsApi.apply(jobId, coverNote);
      setMessage("Application submitted successfully.");
      const updated = await jobsApi.get(jobId);
      setJob(updated);
      setApplicationStatus("pending");
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Application failed");
    } finally {
      setApplying(false);
    }
  }

  async function handleStatusUpdate(appId, status) {
    try {
      await jobsApi.updateApplicationStatus(appId, status);
      setApplicants((prev) =>
        prev.map((a) => (a.ApplicationID === appId ? { ...a, Status: status } : a))
      );
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update status");
    }
  }

  async function handleCloseJob() {
    if (!window.confirm("Close this job post?")) return;
    try {
      await jobsApi.close(jobId);
      const updated = await jobsApi.get(jobId);
      setJob(updated);
      setMessage("Job closed successfully.");
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to close job");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-dashboard-bg">
        <p className="font-bold text-[var(--fg-primary)]">Loading job...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-dashboard-bg">
        <div className="text-center">
          <p className="text-[var(--fg-primary)] font-bold mb-4">{error || "Job not found"}</p>
          <button type="button" onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  const clientTabs = [
    { id: "details", label: "Details", icon: Briefcase },
    { id: "applicants", label: "Applicants", icon: Users },
    { id: "matches", label: "AI Matches", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role={role} user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <button
          type="button"
          onClick={() => navigate(isClient ? "/dashboard/client" : "/jobs")}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="premium-glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[var(--fg-primary)]">{job.Title}</h1>
              <p className="text-sm text-[var(--fg-muted)] mt-1 capitalize">
                {job.Status} · {job.application_count} application{job.application_count !== 1 ? "s" : ""}
              </p>
            </div>
            {isClient && job.Status === "open" && (
              <button type="button" onClick={handleCloseJob} className="btn-outline !py-2 !px-4">
                Close Job
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--color-coral-50)] px-4 py-3 text-sm font-semibold text-[var(--fg-primary)]">
            {message}
          </div>
        )}

        {isClient ? (
          <>
            <div className="flex gap-2 mb-6 border-b border-[var(--border)] pb-2">
              {clientTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    tab === id
                      ? "bg-[var(--ui-primary)] text-white"
                      : "text-[var(--fg-secondary)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            <div className="premium-glass-card rounded-2xl p-6">
              {tab === "details" && <JobDetailsPanel job={job} />}

              {tab === "applicants" && (
                tabLoading ? (
                  <p className="text-[var(--fg-muted)]">Loading applicants...</p>
                ) : applicants.length === 0 ? (
                  <p className="text-[var(--fg-muted)]">No applications yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[var(--fg-muted)] border-b border-[var(--border)]">
                          <th className="pb-3 font-bold">Freelancer</th>
                          <th className="pb-3 font-bold">Trust Score</th>
                          <th className="pb-3 font-bold">Cover Note</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map((app) => (
                          <tr key={app.ApplicationID} className="border-b border-[var(--border)]">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#133B6C] to-[#5F90D4] flex items-center justify-center text-white font-bold text-sm">
                                  {(app.FreelancerName || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-[var(--fg-primary)]">
                                    {app.FreelancerName || `Freelancer #${app.FreelancerID}`}
                                  </p>
                                  <p className="text-xs text-[var(--fg-muted)]">
                                    {app.FreelancerHeadline || "Freelancer"}
                                  </p>
                                  {app.HasBaselineDNA && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#133B6C]/10 text-xs font-bold text-[#133B6C] mt-1">
                                      <Sparkles size={10} /> DNA Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  app.TrustScore >= 80 ? "bg-emerald-500" : 
                                  app.TrustScore >= 60 ? "bg-amber-500" : "bg-red-500"
                                }`} />
                                <span className="font-semibold text-[var(--fg-primary)]">
                                  {app.TrustScore?.toFixed(1) || "0.0"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-[var(--fg-secondary)] max-w-xs truncate">
                              {app.CoverNote || "—"}
                            </td>
                            <td className="py-3"><StatusBadge status={app.Status} /></td>
                            <td className="py-3">
                              {app.Status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(app.ApplicationID, "accepted")}
                                    className="btn-primary !py-1.5 !px-3 !text-xs"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(app.ApplicationID, "rejected")}
                                    className="btn-outline !py-1.5 !px-3 !text-xs"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {tab === "matches" && (
                <MatchResults matches={matches} loading={tabLoading} />
              )}
            </div>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 premium-glass-card rounded-2xl p-6">
              <JobDetailsPanel job={job} />
            </div>
            <div className="premium-glass-card rounded-2xl p-6">
              <h2 className="font-bold text-[var(--fg-primary)] mb-4">Apply for this job</h2>
              {job.has_applied ? (
                <div className="text-center py-6">
                  <StatusBadge status={applicationStatus || "pending"} />
                  <p className="text-sm text-[var(--fg-muted)] mt-3">You have already applied.</p>
                </div>
              ) : job.Status !== "open" ? (
                <p className="text-sm text-[var(--fg-muted)]">This job is no longer accepting applications.</p>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="label" htmlFor="cover">Cover Note</label>
                    <textarea
                      id="cover"
                      className="input min-h-[120px] resize-y"
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Explain why you are a good fit..."
                    />
                  </div>
                  <button type="submit" disabled={applying} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send size={16} />
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}