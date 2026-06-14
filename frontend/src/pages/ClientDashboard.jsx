import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import {
  Plus, Users, Briefcase, FileText, CreditCard,
  TrendingUp, Clock, ArrowRight, Sparkles,
  BarChart3, Activity
} from "lucide-react";
import DashboardSidebar from "../components/common/DashboardSidebar";
import MatchResults from "../components/dashboard/MatchResults";

function StatCard({ icon: Icon, label, value, color, subtext, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`glass-morphism rounded-2xl p-5 hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-1">{label}</p>
          <h3 className="text-3xl font-black text-[var(--fg-primary)]">{value}</h3>
          {subtext && <p className="text-xs text-[var(--fg-secondary)] mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, icon: Icon, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full glass-morphism rounded-2xl p-4 text-left hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[var(--fg-primary)] text-sm group-hover:text-[#5F90D4] transition-colors">{title}</p>
          <p className="text-xs text-[var(--fg-muted)] truncate">{desc}</p>
        </div>
        <ArrowRight size={16} className="text-[var(--fg-muted)] shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
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
      // Fetch all client jobs from REAL database
      const jobs = await jobsApi.myPosted();
      setRecentJobs(jobs.slice(0, 5));

      // Calculate REAL stats from database data
      const totalApps = jobs.reduce((sum, job) => sum + (job.application_count || 0), 0);
      const active = jobs.filter((j) => j.Status === "open").length;
      const closed = jobs.filter((j) => j.Status === "closed").length;

      // Fetch REAL match data for most recent job
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
        } catch {
          // No matches yet - normal for new jobs
        }
      }
      setTopMatches(matches);

      // Build REAL activity feed from database
      const activities = [];
      jobs.slice(0, 5).forEach(job => {
        if (job.application_count > 0) {
          activities.push({
            type: 'application',
            message: `${job.application_count} application${job.application_count !== 1 ? 's' : ''} for "${job.Title}"`,
            time: job.CreatedAt,
            icon: Users,
            color: 'bg-[#5F90D4]'
          });
        }
      });
      setActivityFeed(activities);

      setStats({
        totalJobs: jobs.length,
        totalApplications: totalApps,
        activeJobs: active,
        closedJobs: closed,
        avgMatchScore: avgMatch,
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#133B6C] border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-[var(--fg-primary)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-[var(--fg-primary)]">Client Dashboard</h1>
            <p className="text-sm text-[var(--fg-muted)] mt-1">
              Welcome back, {profile?.DisplayName || profile?.Email || 'Client'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className="btn-coral flex items-center gap-2"
          >
            <Plus size={18} /> Post New Job
          </button>
        </div>

        {/* Stats Grid - ALL REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Briefcase}
            label="Total Jobs"
            value={stats.totalJobs}
            color="bg-[#133B6C]"
            subtext="All time posted"
          />
          <StatCard
            icon={Users}
            label="Applications"
            value={stats.totalApplications}
            color="bg-[#5F90D4]"
            subtext="Total received"
          />
          <StatCard
            icon={Clock}
            label="Active Jobs"
            value={stats.activeJobs}
            color="bg-[#FD8566]"
            subtext="Currently open"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Match Score"
            value={`${stats.avgMatchScore}%`}
            color="bg-emerald-500"
            subtext="AI matching quality"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs - REAL DATA */}
          <div className="lg:col-span-2">
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--fg-primary)] flex items-center gap-2">
                  <Briefcase size={20} /> Recent Jobs
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/client")}
                  className="text-sm font-semibold text-[#5F90D4] hover:text-[#133B6C] flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight size={16} />
                </button>
              </div>

              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
                  <p className="text-[var(--fg-muted)]">No jobs posted yet</p>
                  <button
                    type="button"
                    onClick={() => navigate("/post-job")}
                    className="btn-primary mt-4"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job.JobID}
                      onClick={() => navigate(`/jobs/${job.JobID}`)}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-[var(--border)] hover:bg-white/80 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[var(--fg-primary)] truncate group-hover:text-[#5F90D4] transition-colors">
                            {job.Title}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            job.Status === 'open' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {job.Status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--fg-muted)]">
                          <span>{job.application_count || 0} applications</span>
                          <span>·</span>
                          <span>Min: {job.MinSkillLevel}</span>
                          <span>·</span>
                          <span>Trust {job.RequiredTrustScore}+</span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-[var(--fg-muted)] shrink-0 ml-3 group-hover:text-[#5F90D4] transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed - REAL DATA */}
            {activityFeed.length > 0 && (
              <div className="glass-morphism rounded-2xl p-6 mt-6">
                <h2 className="text-lg font-bold text-[var(--fg-primary)] flex items-center gap-2 mb-4">
                  <Activity size={20} /> Recent Activity
                </h2>
                <div className="space-y-3">
                  {activityFeed.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/30">
                      <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center`}>
                        <activity.icon size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--fg-primary)]">{activity.message}</p>
                        <p className="text-xs text-[var(--fg-muted)]">
                          {activity.time ? new Date(activity.time).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Matches - REAL DATA */}
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-[#FD8566]" />
                <h2 className="text-lg font-bold text-[var(--fg-primary)]">Top Matches</h2>
              </div>

              {topMatches.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)] text-center py-4">
                  {recentJobs.length === 0 
                    ? "Post a job to see AI-matched freelancers"
                    : "Matches calculating... check back soon"
                  }
                </p>
              ) : (
                <MatchResults matches={topMatches} compact={true} />
              )}

              {recentJobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${recentJobs[0].JobID}`)}
                  className="w-full mt-4 btn-outline !py-2 !text-sm"
                >
                  View All Matches
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-morphism rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[var(--fg-primary)] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionCard
                  title="Post New Job"
                  desc="Create a new job listing"
                  icon={Plus}
                  color="bg-[#FD8566]"
                  onClick={() => navigate("/post-job")}
                />
                <QuickActionCard
                  title="View My Jobs"
                  desc="Manage all your postings"
                  icon={Briefcase}
                  color="bg-[#133B6C]"
                  onClick={() => navigate("/dashboard/client")}
                />
                <QuickActionCard
                  title="Review Applicants"
                  desc="Check pending applications"
                  icon={Users}
                  color="bg-[#5F90D4]"
                  onClick={() => recentJobs.length > 0 && navigate(`/jobs/${recentJobs[0].JobID}`)}
                />
              </div>
            </div>

            {/* Job Status Summary */}
            {stats.totalJobs > 0 && (
              <div className="glass-morphism rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                  <BarChart3 size={20} /> Job Status
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--fg-secondary)]">Active</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${(stats.activeJobs / stats.totalJobs) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[var(--fg-primary)] w-6 text-right">{stats.activeJobs}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--fg-secondary)]">Closed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-400 rounded-full transition-all"
                          style={{ width: `${(stats.closedJobs / stats.totalJobs) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[var(--fg-primary)] w-6 text-right">{stats.closedJobs}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}