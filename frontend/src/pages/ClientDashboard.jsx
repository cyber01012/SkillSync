import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { Plus, Users, Briefcase } from "lucide-react";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-[#133B6C] font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex">
      <DashboardSidebar role="client" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-[#133B6C]">Client Dashboard</h1>
            <span className="text-sm font-semibold text-[#4A6582]">
                {profile?.Email}
            </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#133B6C]/10 flex items-center justify-center">
                <Briefcase size={20} className="text-[#133B6C]" />
              </div>
              <span className="text-2xl font-black text-[#133B6C]">0</span>
            </div>
            <p className="text-xs text-[#8BA3BE] font-semibold">Active Jobs</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FD8566]/10 flex items-center justify-center">
                <Users size={20} className="text-[#FD8566]" />
              </div>
              <span className="text-2xl font-black text-[#133B6C]">0</span>
            </div>
            <p className="text-xs text-[#8BA3BE] font-semibold">Applications</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm flex items-center justify-center">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#133B6C] text-white rounded-xl font-semibold hover:bg-[#0D2847] transition">
              <Plus size={18} /> Post a Job
            </button>
          </div>
        </div>

        {/* Placeholder for Member 2 */}
        <div className="bg-white rounded-2xl border border-[#E2D5CF] p-12 shadow-sm text-center">
          <Briefcase size={48} className="text-[#E2D5CF] mx-auto mb-4" />
          <h3 className="text-lg font-black text-[#133B6C] mb-2">No jobs posted yet</h3>
          <p className="text-sm text-[#8BA3BE] mb-4">
            Post your first job to start hiring verified freelancers.
          </p>
          <p className="text-xs text-[#FD8566] font-semibold">
            Member 2 will build the job posting & matching system here.
          </p>
        </div>
      </main>
    </div>
  );
}