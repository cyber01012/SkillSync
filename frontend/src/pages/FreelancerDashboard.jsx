import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../api/profile";
import { dnaApi } from "../api/dna";
import ProfileCard from "../components/dashboard/ProfileCard";
import SkillDNACard from "../components/dashboard/SkillDNACard";
import DNATimeline from "../components/dashboard/DNATimeline";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import AuthMenu from "../components/dashboard/AuthMenu";
import DashboardSidebar from "../components/common/DashboardSidebar";
import GradientText from "../components/design/GradientText";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

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
  const [greeting, setGreeting] = useState(getGreeting());

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-coral)]/20 border-t-[var(--color-coral)] animate-spin" />
          <p className="text-[var(--fg-primary)] font-bold animate-pulse">Loading your Skill DNA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg-base)" }}>
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-500 font-bold">{error}</p>
        <button type="button" onClick={loadData} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden font-sans" style={{ background: "var(--bg-base)" }}>
      {/* Premium ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] bg-[var(--color-sky)]/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-[var(--color-coral)]/6 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] bg-[var(--color-coral-100)]/10 blur-[150px] rounded-full" />
      </div>

      <DashboardSidebar
        role="freelancer"
        user={profile}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="relative z-10 flex-1 p-6 overflow-y-auto transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 max-w-7xl">
          <div className="pt-1">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none">
              <GradientText animationSpeed={5} className="font-italic">
                {greeting}
              </GradientText>
            </h1>
            <p className="text-xl md:text-4xl font-bold italic text-[var(--fg-secondary)] mt-3">
              <span className="text-[var(--color-coral)] font-black">{profile?.DisplayName?.split(' ')[0]}</span>
            </p>
          </div>
          <div className="pt-2">
            <AuthMenu user={profile} role="freelancer" />
          </div>
        </div>

        <div className="space-y-8 max-w-7xl">
          {/* Profile Card - Full Width */}
          <ProfileCard
            profile={profile}
            onEdit={() => navigate("/profile-settings")}
            onPhotoUpload={handlePhotoUpload}
          />

          {/* DNA Cards Grid - Equal Height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <SkillDNACard
              scores={scores}
              weights={weights}
              overallDna={profile?.overall_dna}
              categoryName={profile?.category_display_name}
            />
            <DNATimeline snapshots={snapshots} />
          </div>

          {/* Activity Feed - Full Width */}
          <ActivityFeed items={activity} />
        </div>
      </main>
    </div>
  );
}
