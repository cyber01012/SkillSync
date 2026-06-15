import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Briefcase, Users, DollarSign, TrendingUp, Loader2,
  Activity, Award, Clock, Target, ChevronRight, FileText, Zap,
  Wallet, CheckCircle2, AlertCircle, XCircle, PieChart, ArrowUpRight,
  ArrowDownRight, BarChart2, LineChart, RefreshCw
} from "lucide-react";
import { authApi } from "../api/auth";
import { jobsApi } from "../api/jobs";
import { contractsApi } from "../api/contracts";
import DashboardSidebar from "../components/common/DashboardSidebar";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell, Legend
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw { response: { status: 401 } };
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw { response: { status: res.status, data: err } };
  }
  return res.json();
}

const analyticsApi = {
  clientSummary: () => apiFetch("/api/analytics/client/summary"),
  jobsPerformance: () => apiFetch("/api/analytics/client/jobs-performance"),
  spendingBreakdown: () => apiFetch("/api/analytics/client/spending-breakdown"),
  topFreelancers: () => apiFetch("/api/analytics/client/top-freelancers"),
};

const COLORS = {
  navy: "#133B6C", coral: "#FD8566", sky: "#5F90D4", emerald: "#10B981",
  amber: "#F59E0B", purple: "#8B5CF6", rose: "#F43F5E", teal: "#14B8A6",
};

const CHART_COLORS = [COLORS.navy, COLORS.coral, COLORS.sky, COLORS.emerald, COLORS.amber, COLORS.purple];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-[var(--border)] shadow-2xl px-4 py-3">
      <p className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="font-semibold text-[var(--fg-primary)]">
            {entry.name}: {entry.value?.toLocaleString?.() || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function AnimatedCounter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) || 0 : value;
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [jobsPerformance, setJobsPerformance] = useState([]);
  const [spending, setSpending] = useState(null);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  // ── FALLBACK: Load from existing APIs ──
  const loadFallbackData = useCallback(async () => {
    try {
      const [postedJobs, contracts] = await Promise.all([
        jobsApi.myPosted(),
        contractsApi.list(),
      ]);

      const totalApps = postedJobs.reduce((sum, j) => sum + (j.application_count || 0), 0);
      const totalSpent = contracts.reduce((sum, c) => sum + (c.TotalAmount || 0), 0);
      const completedContracts = contracts.filter((c) => c.Status === "completed").length;
      const completionRate = contracts.length > 0 ? Math.round((completedContracts / contracts.length) * 100) : 0;
      const activeJobs = postedJobs.filter((j) => j.Status === "open").length;
      const closedJobs = postedJobs.filter((j) => j.Status === "closed").length;

      // Calculate match scores
      let avgMatch = 0;
      const matchScores = [];
      for (const job of postedJobs) {
        try {
          const matchData = await jobsApi.getMatches(job.JobID);
          const scores = (matchData.matches || []).map((m) => m.match_score);
          if (scores.length > 0) {
            matchScores.push(scores.reduce((a, b) => a + b, 0) / scores.length);
          }
        } catch { /* ignore */ }
      }
      avgMatch = matchScores.length > 0 ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length) : 0;

      // Build jobs performance from postedJobs
      const jobsPerf = postedJobs.map(job => ({
        job_id: job.JobID,
        title: job.Title,
        status: job.Status,
        required_trust_score: job.RequiredTrustScore,
        min_skill_level: job.MinSkillLevel,
        created_at: job.CreatedAt,
        applications: { total: job.application_count || 0, pending: 0, accepted: 0 },
        matches: { total: 0, top_score: 0 },
        contract_status: null,
        budget: job.budget_range || {},
      }));

      // Build spending from contracts
      const spendingData = {
        contracts: contracts.map(c => ({
          contract_id: c.ContractID,
          job_title: "Contract " + c.ContractID,
          freelancer_id: c.FreelancerID,
          status: c.Status,
          total_amount: c.TotalAmount,
          total_paid: c.Status === "completed" ? c.TotalAmount : c.TotalAmount * 0.3,
          remaining_escrow: c.Status === "active" ? c.TotalAmount * 0.7 : 0,
          milestones: [],
        })),
        monthly_summary: [],
      };

      setSummary({
        jobs: { total: postedJobs.length, active: activeJobs, closed: closedJobs },
        applications: { total: totalApps, pending: Math.floor(totalApps * 0.4), accepted: Math.floor(totalApps * 0.3), rejected: Math.floor(totalApps * 0.3) },
        contracts: { total: contracts.length, active: contracts.filter(c => c.Status === "active").length, completed: completedContracts, disputed: contracts.filter(c => c.Status === "disputed").length, completion_rate: completionRate },
        spending: { total_spent: totalSpent, escrow_balance: totalSpent * 0.5, released: totalSpent * 0.5 },
        ai_matches: { avg_match_score: avgMatch, total_jobs_with_matches: matchScores.length },
      });
      setJobsPerformance(jobsPerf);
      setSpending(spendingData);
      setTopFreelancers([]);
      setUsingFallback(true);
      setError("");
    } catch (err) {
      setError("Failed to load analytics data");
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      setRefreshing(true);
      setUsingFallback(false);
      const [summaryData, jobsData, spendingData, freelancersData] = await Promise.all([
        analyticsApi.clientSummary().catch(() => null),
        analyticsApi.jobsPerformance().catch(() => []),
        analyticsApi.spendingBreakdown().catch(() => null),
        analyticsApi.topFreelancers().catch(() => []),
      ]);

      if (!summaryData) {
        await loadFallbackData();
        return;
      }

      setSummary(summaryData);
      setJobsPerformance(jobsData);
      setSpending(spendingData);
      setTopFreelancers(freelancersData);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      await loadFallbackData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFallbackData]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const statCards = summary ? [
    {
      label: "Total Jobs", value: summary.jobs?.total || 0, rawValue: summary.jobs?.total || 0,
      icon: Briefcase, gradient: "from-[#133B6C] to-[#1E4E85]", lightColor: "bg-[#133B6C]/8", textColor: "text-[#133B6C]",
      sparkline: [1, 2, 2, 3, 4, 5, summary.jobs?.total || 0],
    },
    {
      label: "Applications", value: summary.applications?.total || 0, rawValue: summary.applications?.total || 0,
      icon: Users, gradient: "from-[#5F90D4] to-[#7DA8E0]", lightColor: "bg-[#5F90D4]/8", textColor: "text-[#5F90D4]",
      sparkline: [3, 5, 8, 10, 12, 15, summary.applications?.total || 0],
    },
    {
      label: "Contracts", value: summary.contracts?.total || 0, rawValue: summary.contracts?.total || 0,
      icon: FileText, gradient: "from-[#FD8566] to-[#FFA88F]", lightColor: "bg-[#FD8566]/8", textColor: "text-[#FD8566]",
      sparkline: [1, 1, 2, 2, 3, 4, summary.contracts?.total || 0],
    },
    {
      label: "Total Spent", value: `$${(summary.spending?.total_spent || 0).toLocaleString()}`, rawValue: summary.spending?.total_spent || 0,
      icon: DollarSign, gradient: "from-emerald-500 to-emerald-400", lightColor: "bg-emerald-500/8", textColor: "text-emerald-600",
      sparkline: [500, 1200, 2500, 3000, 4500, 6000, summary.spending?.total_spent || 0],
    },
    {
      label: "Avg Match Score", value: `${summary.ai_matches?.avg_match_score || 0}%`, rawValue: summary.ai_matches?.avg_match_score || 0,
      icon: Target, gradient: "from-purple-500 to-purple-400", lightColor: "bg-purple-500/8", textColor: "text-purple-600",
      sparkline: [50, 55, 60, 65, 70, 75, summary.ai_matches?.avg_match_score || 0],
    },
    {
      label: "Completion Rate", value: `${summary.contracts?.completion_rate || 0}%`, rawValue: summary.contracts?.completion_rate || 0,
      icon: TrendingUp, gradient: "from-amber-500 to-amber-400", lightColor: "bg-amber-500/8", textColor: "text-amber-600",
      sparkline: [10, 20, 35, 45, 55, 65, summary.contracts?.completion_rate || 0],
    },
  ] : [];

  const applicationChartData = summary ? [
    { name: "Pending", value: summary.applications?.pending || 0, color: COLORS.amber },
    { name: "Accepted", value: summary.applications?.accepted || 0, color: COLORS.emerald },
    { name: "Rejected", value: summary.applications?.rejected || 0, color: COLORS.rose },
  ] : [];

  const contractChartData = summary ? [
    { name: "Active", value: summary.contracts?.active || 0, color: COLORS.sky },
    { name: "Completed", value: summary.contracts?.completed || 0, color: COLORS.emerald },
    { name: "Disputed", value: summary.contracts?.disputed || 0, color: COLORS.rose },
  ] : [];

  const jobStatusData = summary ? [
    { name: "Active", value: summary.jobs?.active || 0, fill: COLORS.navy },
    { name: "Closed", value: summary.jobs?.closed || 0, fill: COLORS.coral },
  ] : [];

  const spendingChartData = spending?.contracts?.map(c => ({
    name: c.job_title?.substring(0, 15) || `C${c.contract_id}`,
    total: c.total_amount,
    paid: c.total_paid,
    remaining: c.total_amount - c.total_paid,
  })) || [];

  const matchScoreData = jobsPerformance.map(j => ({
    name: j.title?.substring(0, 12) || `J${j.job_id}`,
    score: j.matches?.top_score || 0,
    applications: j.applications?.total || 0,
  }));

  const monthlySpendingData = spending?.monthly_summary?.map(m => ({
    month: m.month,
    amount: m.amount,
  })) || [];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--fg-primary)] flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#133B6C] to-[#FD8566] flex items-center justify-center shadow-lg shadow-[#133B6C]/20">
                <BarChart3 size={24} className="text-white" />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-[var(--fg-muted)] text-sm font-medium">
              Track your hiring performance, spending, and AI match quality
            </p>
          </div>
          <div className="flex items-center gap-3">
            {usingFallback && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                ⚡ Fallback Mode
              </span>
            )}
            <span className="text-xs text-[var(--fg-muted)] font-medium">
              {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={loadAnalytics}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-[var(--border)] text-sm font-bold text-[var(--fg-primary)] hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "overview", label: "Overview", icon: PieChart },
            { id: "jobs", label: "Jobs", icon: Briefcase },
            { id: "spending", label: "Spending", icon: Wallet },
            { id: "freelancers", label: "Freelancers", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#133B6C] to-[#1E4E85] text-white shadow-lg shadow-[#133B6C]/25"
                  : "bg-white/60 text-[var(--fg-secondary)] hover:bg-white border border-[var(--border)]"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#133B6C] to-[#FD8566] flex items-center justify-center animate-pulse">
                <BarChart3 size={32} className="text-white" />
              </div>
              <p className="text-[var(--fg-muted)] text-sm font-medium">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {statCards.map((stat, idx) => (
                    <div key={stat.label} className="glass-morphism rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className={`w-11 h-11 rounded-xl ${stat.lightColor} flex items-center justify-center`}>
                          <stat.icon size={20} className={stat.textColor} />
                        </div>
                        <div className="w-20 h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stat.sparkline.map((v, i) => ({ i, v }))}>
                              <Area type="monotone" dataKey="v" stroke={CHART_COLORS[idx]} fill={CHART_COLORS[idx]} fillOpacity={0.15} strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <p className="text-2xl font-black text-[var(--fg-primary)] mb-1 relative z-10">
                        <AnimatedCounter value={stat.rawValue} prefix={stat.value.startsWith("$") ? "$" : ""} suffix={stat.value.includes("%") ? "%" : ""} />
                      </p>
                      <p className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider relative z-10">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Donut Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="glass-morphism rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2">
                        <Users size={20} className="text-[#5F90D4]" />
                        Application Status
                      </h3>
                      <span className="text-xs font-bold text-[var(--fg-muted)] bg-[var(--muted)] px-3 py-1 rounded-full">{summary?.applications?.total || 0} Total</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie data={applicationChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                              {applicationChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <ReTooltip content={<CustomTooltip />} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-3">
                        {applicationChartData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm font-semibold text-[var(--fg-secondary)]">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[var(--fg-primary)]">{item.value}</span>
                              <span className="text-xs text-[var(--fg-muted)]">({summary?.applications?.total > 0 ? Math.round((item.value / summary.applications.total) * 100) : 0}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-morphism rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2">
                        <FileText size={20} className="text-[#FD8566]" />
                        Contract Status
                      </h3>
                      <span className="text-xs font-bold text-[var(--fg-muted)] bg-[var(--muted)] px-3 py-1 rounded-full">{summary?.contracts?.total || 0} Total</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie data={contractChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                              {contractChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <ReTooltip content={<CustomTooltip />} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-3">
                        {contractChartData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm font-semibold text-[var(--fg-secondary)]">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[var(--fg-primary)]">{item.value}</span>
                              <span className="text-xs text-[var(--fg-muted)]">({summary?.contracts?.total > 0 ? Math.round((item.value / summary.contracts.total) * 100) : 0}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Score Bar Chart */}
                {matchScoreData.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6 mb-8">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-4">
                      <Zap size={20} className="text-[#FD8566]" />
                      AI Match Scores by Job
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={matchScoreData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(19,59,108,0.08)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <ReTooltip content={<CustomTooltip />} />
                          <Bar dataKey="score" name="Match Score %" radius={[8, 8, 0, 0]} barSize={40}>
                            {matchScoreData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.score >= 80 ? COLORS.emerald : entry.score >= 60 ? COLORS.sky : COLORS.amber} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Platform Activity */}
                <div className="glass-morphism rounded-2xl p-6">
                  <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
                    <Activity size={20} className="text-[#FD8566]" />
                    Platform Activity Overview
                  </h3>
                  <div className="space-y-5">
                    {[
                      { label: "Jobs Posted", value: summary?.jobs?.total || 0, max: Math.max((summary?.jobs?.total || 0) * 2, 10), color: "bg-[#133B6C]", icon: Briefcase },
                      { label: "Applications Received", value: summary?.applications?.total || 0, max: Math.max((summary?.applications?.total || 0) * 1.5, 20), color: "bg-[#5F90D4]", icon: Users },
                      { label: "Contracts Active", value: summary?.contracts?.active || 0, max: Math.max((summary?.contracts?.total || 0) * 2, 5), color: "bg-[#FD8566]", icon: FileText },
                      { label: "Completion Rate", value: `${summary?.contracts?.completion_rate || 0}%`, percent: summary?.contracts?.completion_rate || 0, color: "bg-emerald-500", icon: TrendingUp },
                      { label: "Avg Match Quality", value: `${summary?.ai_matches?.avg_match_score || 0}%`, percent: summary?.ai_matches?.avg_match_score || 0, color: "bg-purple-500", icon: Target },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <item.icon size={14} className="text-[var(--fg-muted)]" />
                            <span className="text-sm font-semibold text-[var(--fg-secondary)]">{item.label}</span>
                          </div>
                          <span className="text-sm font-black text-[var(--fg-primary)]">{item.value}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: item.percent !== undefined ? `${item.percent}%` : `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* JOBS TAB */}
            {activeTab === "jobs" && (
              <div className="space-y-6">
                {jobStatusData.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-4">
                      <PieChart size={20} className="text-[#5F90D4]" />
                      Job Status Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(19,59,108,0.08)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} />
                          <ReTooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]} barSize={60}>
                            {jobStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="glass-morphism rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2">
                      <Briefcase size={20} className="text-[#133B6C]" />
                      Jobs Performance
                    </h3>
                    <button onClick={() => navigate("/post-job")} className="btn-primary text-xs py-2 px-4">Post New Job</button>
                  </div>
                  {jobsPerformance.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase size={48} className="text-[var(--fg-muted)] mx-auto mb-4 opacity-40" />
                      <p className="text-[var(--fg-muted)] font-medium">No jobs posted yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th className="text-left text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider py-3 px-4">Job</th>
                            <th className="text-left text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider py-3 px-4">Status</th>
                            <th className="text-left text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider py-3 px-4">Apps</th>
                            <th className="text-left text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider py-3 px-4">Matches</th>
                            <th className="text-left text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider py-3 px-4">Budget</th>
                            <th className="text-right text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider py-3 px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobsPerformance.map((job) => (
                            <tr key={job.job_id} className="border-b border-[var(--border)]/50 hover:bg-white/40 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-[var(--fg-primary)] text-sm">{job.title}</p>
                                <p className="text-xs text-[var(--fg-muted)]">Trust {job.required_trust_score}+ · {job.min_skill_level}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${job.status === "open" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                                  {job.status === "open" ? <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />Active</> : "Closed"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <Users size={14} className="text-[var(--fg-muted)]" />
                                  <span className="text-sm font-semibold">{job.applications?.total || 0}</span>
                                  <span className="text-xs text-[var(--fg-muted)]">({job.applications?.pending || 0} pending)</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <Zap size={14} className="text-[#FD8566]" />
                                  <span className="text-sm font-semibold">{job.matches?.total || 0}</span>
                                  <span className="text-xs text-[var(--fg-muted)]">(top: {job.matches?.top_score || 0}%)</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-semibold">${job.budget?.max?.toLocaleString() || "N/A"}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button onClick={() => navigate(`/jobs/${job.job_id}`)} className="text-xs font-bold text-[#5F90D4] hover:text-[#133B6C] flex items-center gap-1 ml-auto transition-colors">Details <ChevronRight size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SPENDING TAB */}
            {activeTab === "spending" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="glass-morphism rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/10" />
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><DollarSign size={20} className="text-emerald-600" /></div>
                      <div>
                        <p className="text-xs font-bold text-[var(--fg-muted)] uppercase">Total Spent</p>
                        <p className="text-xl font-black text-[var(--fg-primary)]">${(summary?.spending?.total_spent || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="glass-morphism rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#5F90D4]/10" />
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-[#5F90D4]/10 flex items-center justify-center"><Wallet size={20} className="text-[#5F90D4]" /></div>
                      <div>
                        <p className="text-xs font-bold text-[var(--fg-muted)] uppercase">In Escrow</p>
                        <p className="text-xl font-black text-[var(--fg-primary)]">${(summary?.spending?.escrow_balance || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="glass-morphism rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#FD8566]/10" />
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-[#FD8566]/10 flex items-center justify-center"><ArrowUpRight size={20} className="text-[#FD8566]" /></div>
                      <div>
                        <p className="text-xs font-bold text-[var(--fg-muted)] uppercase">Released</p>
                        <p className="text-xl font-black text-[var(--fg-primary)]">${(summary?.spending?.released || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {monthlySpendingData.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-4">
                      <LineChart size={20} className="text-[#5F90D4]" />
                      Monthly Spending Trend
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={COLORS.navy} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={COLORS.navy} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(19,59,108,0.08)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                          <ReTooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="amount" name="Spent" stroke={COLORS.navy} fill="url(#spendingGradient)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {spendingChartData.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-4">
                      <BarChart2 size={20} className="text-[#FD8566]" />
                      Contract Spending Breakdown
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={spendingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(19,59,108,0.08)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8BA3BE" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                          <ReTooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="paid" name="Paid" stackId="a" fill={COLORS.emerald} radius={[0, 0, 4, 4]} />
                          <Bar dataKey="remaining" name="Remaining" stackId="a" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {spending?.contracts?.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
                      <FileText size={20} className="text-[#133B6C]" />
                      Contract Spending Details
                    </h3>
                    <div className="space-y-4">
                      {spending.contracts.map((contract) => (
                        <div key={contract.contract_id} className="rounded-xl border border-[var(--border)] bg-white/60 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-bold text-[var(--fg-primary)] text-sm">{contract.job_title}</p>
                              <p className="text-xs text-[var(--fg-muted)]">Contract #{contract.contract_id} · {contract.status}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-[var(--fg-primary)]">${contract.total_paid.toLocaleString()}</p>
                              <p className="text-xs text-[var(--fg-muted)]">of ${contract.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#133B6C] to-[#FD8566] rounded-full transition-all" style={{ width: `${contract.total_amount > 0 ? (contract.total_paid / contract.total_amount) * 100 : 0}%` }} />
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-[var(--fg-muted)]">
                            <span>{Math.round((contract.total_paid / Math.max(contract.total_amount, 1)) * 100)}% complete</span>
                            <span>${contract.remaining_escrow.toLocaleString()} in escrow</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FREELANCERS TAB */}
            {activeTab === "freelancers" && (
              <div className="space-y-6">
                {topFreelancers.length > 0 && (
                  <div className="glass-morphism rounded-2xl p-6">
                    <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-4">
                      <BarChart2 size={20} className="text-[#5F90D4]" />
                      Freelancer Trust Scores
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topFreelancers.map(f => ({ name: f.display_name?.substring(0, 10) || "Unknown", score: f.trust_score, completed: f.completed_count * 10 }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(19,59,108,0.08)" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#8BA3BE" }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#8BA3BE" }} axisLine={false} tickLine={false} width={100} />
                          <ReTooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="score" name="Trust Score" fill={COLORS.navy} radius={[0, 8, 8, 0]} barSize={20} />
                          <Bar dataKey="completed" name="Completed x10" fill={COLORS.coral} radius={[0, 8, 8, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="glass-morphism rounded-2xl p-6">
                  <h3 className="font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
                    <Award size={20} className="text-[#FD8566]" />
                    Top Freelancers
                  </h3>
                  {topFreelancers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={48} className="text-[var(--fg-muted)] mx-auto mb-4 opacity-40" />
                      <p className="text-[var(--fg-muted)] font-medium">No freelancer data yet. Start hiring to see top performers.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topFreelancers.map((freelancer, idx) => (
                        <div key={freelancer.freelancer_id} className="rounded-xl border border-[var(--border)] bg-white/60 p-4 hover:shadow-lg hover:border-[#5F90D4]/30 transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#133B6C] to-[#5F90D4] flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {freelancer.display_name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[var(--fg-primary)] text-sm truncate">{freelancer.display_name}</p>
                              <p className="text-xs text-[var(--fg-muted)] truncate">{freelancer.headline || freelancer.category || "General"}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-black text-[var(--fg-muted)]">#{idx + 1}</div>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${freelancer.trust_score >= 80 ? "bg-emerald-500" : freelancer.trust_score >= 60 ? "bg-amber-500" : "bg-red-500"}`} />
                              <span className="text-sm font-bold text-[var(--fg-primary)]">Trust {freelancer.trust_score?.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-xs text-[var(--fg-muted)]">{freelancer.completed_count} done</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${freelancer.trust_score}%`, backgroundColor: freelancer.trust_score >= 80 ? COLORS.emerald : freelancer.trust_score >= 60 ? COLORS.amber : COLORS.rose }} />
                          </div>
                          <div className="flex items-center justify-between">
                            {freelancer.has_baseline_dna && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#133B6C]/10 text-xs font-bold text-[#133B6C]"><Zap size={12} /> DNA Verified</div>
                            )}
                            <span className="text-xs text-[var(--fg-muted)] font-medium">{freelancer.contracts_count} contract{freelancer.contracts_count > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}