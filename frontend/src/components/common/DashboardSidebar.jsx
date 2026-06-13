import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { LayoutDashboard, LogOut, Lock, LogOutIcon } from 'lucide-react';

export default function DashboardSidebar({ role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  const handleLogoutAll = async () => {
    await authApi.logoutAll();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#FFF8F5] border-r border-[#E2D5CF] min-h-screen p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-black text-[#133B6C] tracking-tighter">SkillSync</span>
        </div>
        <nav className="space-y-4">
          <button onClick={() => navigate(`/dashboard/${role}`)} className="flex items-center gap-3 text-[#133B6C] font-semibold hover:text-[#FD8566] transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => {/* TODO: Implement Reset Password Modal */}} className="flex items-center gap-3 text-[#133B6C] font-semibold hover:text-[#FD8566] transition-colors">
            <Lock size={20} /> Reset Password
          </button>
        </nav>
      </div>
      <div className="space-y-4">
        <button onClick={handleLogout} className="flex items-center gap-3 text-[#133B6C] font-semibold hover:text-red-600 transition-colors">
          <LogOut size={20} /> Log Out
        </button>
        <button onClick={handleLogoutAll} className="flex items-center gap-3 text-[#4A6582] text-sm hover:text-red-600 transition-colors">
          <LogOutIcon size={16} /> Log out all devices
        </button>
      </div>
    </div>
  );
}
