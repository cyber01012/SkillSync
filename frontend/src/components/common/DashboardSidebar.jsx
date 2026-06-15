import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, FileText, FolderKanban, DollarSign, Settings,
  Plus, Users, CreditCard, ChevronLeft, ChevronRight, Shield, BarChart3,
  ArrowLeftCircle
} from "lucide-react";
import AuthMenu from "../dashboard/AuthMenu";

const FREELANCER_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/freelancer" },
  { label: "Browse Jobs", icon: Briefcase, path: "/jobs" },
  { label: "My Applications", icon: FileText, path: "/applications" },
  { label: "Contracts", icon: Shield, path: "/contracts" },
  { label: "Active Projects", icon: FolderKanban, path: "/contracts" },
  { label: "Earnings", icon: DollarSign, path: "/earnings" },
  { label: "Profile Settings", icon: Settings, path: "/profile-settings" },
];

const CLIENT_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/client" },
  { label: "Post Job", icon: Plus, path: "/post-job" },
  { label: "My Jobs", icon: Briefcase, path: "/my-jobs" },
  { label: "Applicants", icon: Users, path: "/applicants" },
  { label: "Contracts", icon: Shield, path: "/contracts" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
];

function isNavActive(pathname, path) {
  if (path === "/jobs") return pathname === "/jobs" || /^\/jobs\/\d+$/.test(pathname);
  if (path === "/applications") return pathname === "/applications";
  if (path === "/post-job") return pathname === "/post-job";
  if (path === "/contracts") return pathname === "/contracts" || /^\/contracts\/\d+$/.test(pathname);
  if (path === "/analytics") return pathname === "/analytics";
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
      className={`border-r border-[var(--border)] min-h-screen flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative ${
        collapsed ? "w-16 p-2" : "w-64 p-4"
      }`}
      style={{ background: "var(--color-coral-light, #FFA88F)" }}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-[var(--border)] shadow-sm flex items-center justify-center hover:bg-[var(--muted)] transition-colors z-10"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Logo */}
        <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? "justify-center" : ""}`}>
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          {!collapsed && (
            <span className="text-xl font-black text-[var(--fg-primary)] tracking-tighter whitespace-nowrap">
              SkillSync
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-colors ${
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } ${
                isNavActive(location.pathname, path)
                  ? "bg-[var(--ui-primary-50)] text-[var(--ui-primary)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--muted)] hover:text-[var(--fg-primary)]"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Auth Menu */}
      <div className={`pb-2 ${collapsed ? "px-0 flex justify-center" : "px-2"}`}>
        <AuthMenu user={user} role={role} collapsed={collapsed} />
      </div>
    </aside>
  );
}