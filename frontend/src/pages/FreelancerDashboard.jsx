import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { dnaApi } from "../api/dna";
import { baselineApi } from "../api/baseline";
import SkillDNACard from "../components/dashboard/SkillDNACard";
import TrustScoreRing from "../components/dashboard/TrustScoreRing";
import DNATimeline from "../components/dashboard/DNATimeline";
import { Zap, Trophy, ArrowRight } from "lucide-react";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [trustScore, setTrustScore] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [prof, dnaScores, trust, snaps, res] = await Promise.all([
        authApi.profile(),
        dnaApi.getScores(),
        dnaApi.getTrustScore(),
        dnaApi.getSnapshots(),
        baselineApi.getResults(),
      ]);
      setProfile(prof);
      setScores(dnaScores);
      setTrustScore(trust);
      setSnapshots(snaps);
      setResults(res);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-[#133B6C] font-bold">Loading your Skill DNA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex">
      <DashboardSidebar role="freelancer" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-[#133B6C]">Freelancer Dashboard</h1>
            <span className="text-sm font-semibold text-[#4A6582]">
                {profile?.DisplayName}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trust Score */}
            <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-bold text-[#8BA3BE] uppercase tracking-wider mb-4">
                Trust Score
              </h3>
              <TrustScoreRing score={trustScore?.OverallScore || 50} size={140} />
              <p className="mt-3 text-xs text-[#8BA3BE] text-center">
                Based on 5 weighted factors
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#8BA3BE] uppercase tracking-wider mb-4">
                Actions
              </h3>
              <button
                onClick={() => navigate("/baseline-challenge")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#133B6C] text-white hover:bg-[#0D2847] transition mb-3"
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Zap size={16} /> Take Baseline Challenge
                </span>
                <ArrowRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E2D5CF] text-[#133B6C] hover:bg-[#FFF0EC] transition">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Trophy size={16} /> View Jobs
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill DNA */}
            <SkillDNACard scores={scores} />

            {/* Challenge Results */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
                <h3 className="text-lg font-black text-[#133B6C] mb-4">Challenge History</h3>
                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.ResultID}
                      className="flex items-center justify-between p-3 bg-[#FFF8F5] rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#133B6C]">
                          Challenge #{r.ChallengeID}
                        </p>
                        <p className="text-xs text-[#8BA3BE]">
                          {new Date(r.CompletedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#FD8566]">{r.Score}</span>
                        <span className="text-xs text-[#8BA3BE]">/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DNA Timeline */}
            <DNATimeline snapshots={snapshots} />
          </div>
        </div>
      </main>
    </div>
  );
}