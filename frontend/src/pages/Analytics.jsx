import React, { useEffect, useState } from "react";
import { BarChart3, Briefcase, Users, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import { contractsApi } from "../api/contracts";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function Analytics() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalContracts: 0,
    totalSpent: 0,
    avgMatchScore: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const [jobs, contracts] = await Promise.all([
        jobsApi.myPosted(),
        contractsApi.list(),
      ]);

      const totalApps = jobs.reduce((sum, j) => sum + (j.application_count || 0), 0);
      const totalSpent = contracts.reduce((sum, c) => sum + (c.TotalAmount || 0), 0);
      const completedContracts = contracts.filter((c) => c.Status === "completed").length;
      const completionRate = contracts.length > 0 ? Math.round((completedContracts / contracts.length) * 100) : 0;

      // Calculate avg match score
      let avgMatch = 0;
      if (jobs.length > 0) {
        const matchPromises = jobs.map(async (job) => {
          try {
            const matchData = await jobsApi.getMatches(job.JobID);
            const scores = (matchData.matches || []).map((m) => m.match_score);
            return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
          } catch {
            return 0;
          }
        });
        const matchScores = await Promise.all(matchPromises);
        const validScores = matchScores.filter((s) => s > 0);
        avgMatch = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
      }

      setStats({
        totalJobs: jobs.length,
        totalApplications: totalApps,
        totalContracts: contracts.length,
        totalSpent,
        avgMatchScore: avgMatch,
        completionRate,
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
          <BarChart3 size={24} /> Analytics
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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "bg-[#133B6C]" },
                { label: "Applications", value: stats.totalApplications, icon: Users, color: "bg-[#5F90D4]" },
                { label: "Contracts", value: stats.totalContracts, icon: TrendingUp, color: "bg-[#FD8566]" },
                { label: "Total Spent", value: `$${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500" },
                { label: "Avg Match Score", value: `${stats.avgMatchScore}%`, icon: BarChart3, color: "bg-purple-500" },
                { label: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "bg-amber-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass-morphism rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-black text-[var(--fg-primary)]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Simple bar chart visualization */}
            <div className="glass-morphism rounded-2xl p-6">
              <h3 className="font-bold text-[var(--fg-primary)] mb-4">Platform Activity</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--fg-secondary)]">Jobs Posted</span>
                    <span className="font-bold">{stats.totalJobs}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#133B6C] rounded-full transition-all" style={{ width: `${Math.min(100, stats.totalJobs * 10)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--fg-secondary)]">Applications Received</span>
                    <span className="font-bold">{stats.totalApplications}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5F90D4] rounded-full transition-all" style={{ width: `${Math.min(100, stats.totalApplications * 5)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--fg-secondary)]">Contracts Active</span>
                    <span className="font-bold">{stats.totalContracts}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FD8566] rounded-full transition-all" style={{ width: `${Math.min(100, stats.totalContracts * 20)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--fg-secondary)]">Completion Rate</span>
                    <span className="font-bold">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}