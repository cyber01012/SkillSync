import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, FileText, FolderKanban, DollarSign, Settings,
  Plus, Users, CreditCard, ChevronLeft, ChevronRight, Shield, BarChart3,
  ArrowLeftCircle
} from "lucide-react";
import AuthMenu from "../dashboard/AuthMenu";
import GradientText from "../design/GradientText";


const FREELANCER_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/freelancer" },
  { label: "Browse Jobs", icon: Briefcase, path: "/jobs" },
  { label: "My Applications", icon: FileText, path: "/applications" },
  { label: "Contracts", icon: Shield, path: "/contracts" },
  { label: "Active Projects", icon: FolderKanban, path: "/contracts" },
  { label: "Earnings", icon: DollarSign, path: "/earnings" },
  { label: "Profile Settings", icon: Settings, path: "/profile-settings" },
  // { label: "Analytics", icon: BarChart3, path: "/analytics" },
];

const CLIENT_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/client" },
  { label: "Post Job", icon: Plus, path: "/post-job" },
  { label: "My Jobs", icon: Briefcase, path: "/my-jobs" },
  { label: "Applicants", icon: Users, path: "/applicants" },
  { label: "Contracts", icon: Shield, path: "/contracts" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  // { label: "Analytics", icon: BarChart3, path: "/analytics" },
  
];

function isNavActive(pathname, path) {
  if (path === "/jobs") return pathname === "/jobs" || /^\/jobs\/\d+$/.test(pathname);
  if (path === "/applications") return pathname === "/applications";
  if (path === "/post-job") return pathname === "/post-job";
  if (path === "/contracts") return pathname === "/contracts" || /^\/contracts\/\d+$/.test(pathname);
  // if (path === "/analytics") return pathname === "/analytics";
  if (path === "/my-jobs") return pathname === "/my-jobs";
  if (path === "/applicants") return pathname === "/applicants";
  if (path === "/payments") return pathname === "/payments";
  if (path === "/earnings") return pathname === "/earnings";
  return pathname === path;
}

export default function DashboardSidebar({ role, user, collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = role === "client" ? CLIENT_NAV : FREELANCER_NAV;

  return (
    <aside
      className={`sidebar-glass-dark min-h-screen flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative z-20 ${
        collapsed ? "w-16 p-2" : "w-64 p-4"
      }`}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#0D2847] border border-white/10 shadow-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all z-30"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div>
        {/* Logo */}
        <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? "justify-center" : ""}`}>
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain shrink-0 animate-dna" />
          {!collapsed && (
            <GradientText className="text-xl font-black tracking-tighter whitespace-nowrap">
              SkillSync
            </GradientText>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon, path }) => {
            const active = isNavActive(location.pathname, path);
            return (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5"
                } ${
                  active
                    ? "bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-light)] text-white shadow-lg shadow-[var(--color-coral)]/20 border border-white/10"
                    : "text-slate-300/80 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={18} className={`shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Auth Menu */}
      <div className={`pb-2 ${collapsed ? "px-0 flex justify-center" : "px-2"}`}>
        <AuthMenu user={user} role={role} collapsed={collapsed} inSidebar={true} />
      </div>
    </aside>
  );
}