import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import {
  Plus, Users, Briefcase, FileText,
  TrendingUp, Clock, ArrowRight, Sparkles,
  BarChart3, Activity, Zap
} from "lucide-react";
import DashboardSidebar from "../components/common/DashboardSidebar";
import MatchResults from "../components/dashboard/MatchResults";

function StatCard({ icon: Icon, label, value, gradient, subtext, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`premium-glass-card rounded-2xl p-5 animate-slide-up transition-all duration-300 group ${onClick ? "cursor-pointer hover:-translate-y-0.5" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="dashboard-section-label mb-3">{label}</p>
          <h3 className="text-3xl font-black text-[var(--fg-primary)] tracking-tight">{value}</h3>
          {subtext && (
            <p className="text-xs text-[var(--fg-muted)] mt-1 font-medium">{subtext}</p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: gradient, boxShadow: `0 8px 20px -6px ${gradient.includes("FD8566") ? "rgba(253,133,102,0.35)" : gradient.includes("133B6C") ? "rgba(19,59,108,0.30)" : gradient.includes("5F90D4") ? "rgba(95,144,212,0.30)" : "rgba(16,185,129,0.30)"}` }}
        >
          <Icon size={20} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      {onClick && (
        <div className="flex items-center gap-1 mt-3 text-xs font-bold text-[var(--fg-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          View details <ArrowRight size={12} />
        </div>
      )}
    </div>
  );
}

function QuickActionCard({ title, desc, icon: Icon, gradient, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full premium-glass-card rounded-xl p-4 text-left hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: gradient }}
        >
          <Icon size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[var(--fg-primary)] text-sm group-hover:text-[#5F90D4] transition-colors">{title}</p>
          <p className="text-xs text-[var(--fg-muted)] truncate mt-0.5">{desc}</p>
        </div>
        <ArrowRight size={15} className="text-[var(--fg-muted)] shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    closedJobs: 0,
    avgMatchScore: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const jobs = await jobsApi.myPosted();
      setRecentJobs(jobs.slice(0, 5));

      const totalApps = jobs.reduce((sum, job) => sum + (job.application_count || 0), 0);
      const active = jobs.filter((j) => j.Status === "open").length;
      const closed = jobs.filter((j) => j.Status === "closed").length;

      let avgMatch = 0;
      let matches = [];
      if (jobs.length > 0 && jobs[0].JobID) {
        try {
          const matchData = await jobsApi.getMatches(jobs[0].JobID);
          const allMatches = matchData.matches || [];
          matches = allMatches.slice(0, 3);
          const scores = allMatches.map((m) => m.match_score);
          avgMatch = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
        } catch { /* no matches yet */ }
      }
      setTopMatches(matches);

      const activities = [];
      jobs.slice(0, 5).forEach(job => {
        if (job.application_count > 0) {
          activities.push({
            type: "application",
            message: `${job.application_count} application${job.application_count !== 1 ? "s" : ""} for "${job.Title}"`,
            time: job.CreatedAt,
            icon: Users,
            gradient: "linear-gradient(135deg, #5F90D4, #133B6C)",
          });
        }
      });
      setActivityFeed(activities);

      setStats({ totalJobs: jobs.length, totalApplications: totalApps, activeJobs: active, closedJobs: closed, avgMatchScore: avgMatch });
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-dashboard-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#FD8566]/10" />
            <svg className="absolute inset-0 animate-spin" viewBox="0 0 50 50">
              <circle
                className="opacity-100"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#FD8566"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.4, 31.4"
              />
            </svg>
          </div>
          <p className="font-bold text-[var(--fg-primary)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      {/* Deep ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[#FD8566]/24 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#133B6C]/24 blur-[160px] rounded-full" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] bg-[#5F90D4]/16 blur-[140px] rounded-full" />
        <div className="absolute top-[8%] right-[12%] w-[25%] h-[25%] bg-[#FD8566]/14 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] bg-[#1E4E85]/18 blur-[120px] rounded-full" />
      </div>

      <DashboardSidebar
        role="client"
        user={profile}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="relative z-10 flex-1 p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
        {/* Top Actions Row */}
        <div className="flex justify-end mb-6 animate-slide-up">
          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className="btn-coral flex items-center gap-2 shadow-lg shadow-[#FD8566]/25 hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={18} strokeWidth={2.5} /> Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Briefcase}
            label="Total Jobs"
            value={stats.totalJobs}
            gradient="linear-gradient(135deg, #133B6C, #1E4E85)"
            subtext="All time posted"
          />
          <StatCard
            icon={Users}
            label="Applications"
            value={stats.totalApplications}
            gradient="linear-gradient(135deg, #5F90D4, #4A78B8)"
            subtext="Total received"
          />
          <StatCard
            icon={Clock}
            label="Active Jobs"
            value={stats.activeJobs}
            gradient="linear-gradient(135deg, #FD8566, #E86A4A)"
            subtext="Currently open"
            onClick={() => navigate("/my-jobs")}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Match"
            value={`${stats.avgMatchScore}%`}
            gradient="linear-gradient(135deg, #10B981, #059669)"
            subtext="AI matching quality"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* Posted Jobs */}
            <div className="premium-glass-card rounded-2xl p-6 animate-slide-up flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="dashboard-section-label mb-1">Workforce</p>
                  <h2 className="text-lg font-black text-[var(--fg-primary)] flex items-center gap-2">
                    <Briefcase size={18} className="text-[#FD8566]" strokeWidth={2.5} /> Posted Jobs
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/my-jobs")}
                  className="flex items-center gap-1 text-xs font-bold text-[#5F90D4] hover:text-[#133B6C] transition-colors px-3 py-1.5 rounded-full bg-[#5F90D4]/10 hover:bg-[#5F90D4]/15"
                >
                  View All <ArrowRight size={12} strokeWidth={2.5} />
                </button>
              </div>

              {recentJobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 rounded-xl bg-white/30 border border-dashed border-[var(--border)]">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--ui-primary-50)] flex items-center justify-center mb-5 shadow-inner">
                    <Briefcase size={36} className="text-[var(--fg-muted)] opacity-40" strokeWidth={1.5} />
                  </div>
                  <p className="text-[var(--fg-muted)] font-bold text-base">No jobs posted yet</p>
                  <p className="text-[var(--fg-muted)] text-sm mt-1 opacity-70">Start hiring by creating your first job listing</p>
                  <button
                    type="button"
                    onClick={() => navigate("/post-job")}
                    className="btn-primary mt-5 !py-2.5 !px-6 !text-sm"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentJobs.map((job) => (
                    <div
                      key={job.JobID}
                      onClick={() => navigate(`/jobs/${job.JobID}`)}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/60 hover:bg-white/65 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[var(--fg-primary)] truncate group-hover:text-[#5F90D4] transition-colors text-sm">
                            {job.Title}
                          </h4>
                          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            job.Status === "open"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}>
                            {job.Status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--fg-muted)]">
                          <span className="flex items-center gap-1"><Users size={11} strokeWidth={2} />{job.application_count || 0} apps</span>
                          <span>·</span>
                          <span>Min: {job.MinSkillLevel}</span>
                          <span>·</span>
                          <span>Trust {job.RequiredTrustScore}+</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[var(--fg-muted)] shrink-0 ml-3 opacity-0 group-hover:opacity-100 group-hover:text-[#5F90D4] transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
            {activityFeed.length > 0 && (
              <div className="premium-glass-card rounded-2xl p-6 animate-slide-up">
                <div className="mb-5">
                  <p className="dashboard-section-label mb-1">Live Updates</p>
                  <h2 className="text-lg font-black text-[var(--fg-primary)] flex items-center gap-2">
                    <Activity size={18} className="text-[#5F90D4]" strokeWidth={2.5} /> Recent Activity
                  </h2>
                </div>
                <div className="space-y-3">
                  {activityFeed.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/40 border border-white/60">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ background: activity.gradient }}
                      >
                        <activity.icon size={14} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--fg-primary)] truncate">{activity.message}</p>
                        <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                          {activity.time ? new Date(activity.time).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 flex flex-col">
            {/* AI Matches */}
            <div className="premium-glass-card rounded-2xl p-6 animate-slide-up">
              <div className="mb-5">
                <p className="dashboard-section-label mb-1">AI-Powered</p>
                <h2 className="text-lg font-black text-[var(--fg-primary)] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#FD8566]" strokeWidth={2.5} /> Top Matches
                </h2>
              </div>

              {topMatches.length === 0 ? (
                <div className="text-center py-6 rounded-xl bg-white/30 border border-dashed border-[var(--border)]">
                  <Sparkles size={28} className="mx-auto text-[var(--fg-muted)] mb-2 opacity-40" strokeWidth={1.5} />
                  <p className="text-sm text-[var(--fg-muted)] font-medium">
                    {recentJobs.length === 0
                      ? "Post a job to see AI-matched freelancers"
                      : "Matches calculating…"
                    }
                  </p>
                </div>
              ) : (
                <MatchResults matches={topMatches} compact={true} />
              )}

              {recentJobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${recentJobs[0].JobID}`)}
                  className="w-full mt-4 btn-outline !py-2 !text-xs !rounded-xl"
                >
                  View All Matches
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="premium-glass-card rounded-2xl p-6 animate-slide-up">
              <div className="mb-5">
                <p className="dashboard-section-label mb-1">Actions</p>
                <h2 className="text-lg font-black text-[var(--fg-primary)] flex items-center gap-2">
                  <Zap size={18} className="text-[#5F90D4]" strokeWidth={2.5} /> Quick Actions
                </h2>
              </div>
              <div className="space-y-2.5">
                <QuickActionCard
                  title="Post New Job"
                  desc="Create a new listing"
                  icon={Plus}
                  gradient="linear-gradient(135deg, #FD8566, #E86A4A)"
                  onClick={() => navigate("/post-job")}
                />
                <QuickActionCard
                  title="View My Jobs"
                  desc="Manage all postings"
                  icon={Briefcase}
                  gradient="linear-gradient(135deg, #133B6C, #1E4E85)"
                  onClick={() => navigate("/my-jobs")}
                />
                <QuickActionCard
                  title="Review Applicants"
                  desc="Check pending applications"
                  icon={Users}
                  gradient="linear-gradient(135deg, #5F90D4, #4A78B8)"
                  onClick={() => recentJobs.length > 0 && navigate(`/jobs/${recentJobs[0].JobID}`)}
                />
                <QuickActionCard
                  title="Contracts"
                  desc="Track active agreements"
                  icon={FileText}
                  gradient="linear-gradient(135deg, #10B981, #059669)"
                  onClick={() => navigate("/contracts")}
                />
              </div>
            </div>

            {/* Job Status Summary */}
            {stats.totalJobs > 0 && (
              <div className="premium-glass-card rounded-2xl p-6 animate-slide-up">
                <div className="mb-5">
                  <p className="dashboard-section-label mb-1">Overview</p>
                  <h2 className="text-lg font-black text-[var(--fg-primary)] flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#5F90D4]" strokeWidth={2.5} /> Job Status
                  </h2>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Active", count: stats.activeJobs, color: "from-emerald-400 to-emerald-500" },
                    { label: "Closed", count: stats.closedJobs, color: "from-slate-300 to-slate-400" },
                  ].map(({ label, count, color }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-[var(--fg-secondary)]">{label}</span>
                        <span className="text-xs font-black text-[var(--fg-primary)]">{count}</span>
                      </div>
                      <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-white/80">
                        <div
                          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${stats.totalJobs > 0 ? (count / stats.totalJobs) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}