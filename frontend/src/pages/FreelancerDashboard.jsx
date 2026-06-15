import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../api/profile";
import { dnaApi } from "../api/dna";
import ProfileCard from "../components/dashboard/ProfileCard";
import SkillDNACard from "../components/dashboard/SkillDNACard";
import DNATimeline from "../components/dashboard/DNATimeline";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [activity, setActivity] = useState([]);
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const status = await profileApi.getStatus();
      console.log("Profile status:", status);

      if (!status.has_category) {
        navigate("/category-selection");
        return;
      }
      if (!status.has_baseline_dna) {
        console.log("No baseline DNA, redirecting to challenge");
        navigate("/baseline-challenge");
        return;
      }

      const [prof, dnaScores, snaps, act, w] = await Promise.all([
        profileApi.get(),
        dnaApi.getScores(),
        dnaApi.getSnapshots(),
        dnaApi.getActivity(),
        dnaApi.getProfileWeights(),
      ]);
      console.log("Profile loaded:", prof);
      setProfile(prof);
      setScores(dnaScores);
      setSnapshots(snaps);
      setActivity(act);
      setWeights(w.weights || {});
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    function onFocus() { loadData(); }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [navigate]);

  async function handlePhotoUpload(file) {
    try {
      await profileApi.uploadPhoto(file);
      loadData();
    } catch {
      alert("Photo upload failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-dashboard-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-coral)]/10" />
            <svg className="absolute inset-0 animate-spin" viewBox="0 0 50 50">
              <circle
                className="opacity-100"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="var(--color-coral)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="31.4, 31.4"
              />
            </svg>
          </div>
          <p className="text-[var(--fg-primary)] font-bold animate-pulse">Loading your Skill DNA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 premium-dashboard-bg">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-500 font-bold">{error}</p>
        <button type="button" onClick={loadData} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden font-sans premium-dashboard-bg">
      {/* Deep vibrant ambient background orbs — significantly more saturated */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#FD8566]/32 blur-[160px] rounded-full animate-orb-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-[#133B6C]/30 blur-[160px] rounded-full animate-orb-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[25%] left-[35%] w-[50%] h-[50%] bg-[#5F90D4]/22 blur-[140px] rounded-full animate-orb-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[10%] right-[15%] w-[30%] h-[30%] bg-[#FD8566]/20 blur-[100px] rounded-full animate-orb-pulse" style={{ animationDelay: '4.5s' }} />
        <div className="absolute bottom-[25%] left-[20%] w-[35%] h-[35%] bg-[#1E4E85]/24 blur-[130px] rounded-full animate-orb-pulse" style={{ animationDelay: '0.75s' }} />
      </div>

      <DashboardSidebar
        role="freelancer"
        user={profile}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="relative z-10 flex-1 p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
        <div className="space-y-8 max-w-7xl">
          {/* Profile Card */}
          <div className="animate-slide-up">
            <ProfileCard
              profile={profile}
              onEdit={() => navigate("/profile-settings")}
              onPhotoUpload={handlePhotoUpload}
            />
          </div>

          {/* DNA Cards Grid */}
          <div className="animate-slide-up">
            <p className="dashboard-section-label mb-4">Skill Intelligence</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <SkillDNACard
                scores={scores}
                weights={weights}
                overallDna={profile?.overall_dna}
                categoryName={profile?.category_display_name}
              />
              <DNATimeline snapshots={snapshots} />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="animate-slide-up">
            <p className="dashboard-section-label mb-4">Proof Ledger</p>
            <ActivityFeed items={activity} />
          </div>
        </div>
      </main>
    </div>
  );
}