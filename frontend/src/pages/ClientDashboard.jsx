import React, { useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { Plus, Users, Briefcase, FileText, CreditCard } from "lucide-react";
import DashboardSidebar from "../components/common/DashboardSidebar";

const PLACEHOLDERS = [
  { title: "Post a Job", desc: "Create job listings for verified freelancers", icon: Plus },
  { title: "My Jobs", desc: "Manage your active and closed job posts", icon: Briefcase },
  { title: "Applicants", desc: "Review freelancer applications", icon: Users },
  { title: "Contracts", desc: "Track active contracts and milestones", icon: FileText },
  { title: "Payments", desc: "Manage escrow and payment events", icon: CreditCard },
];

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <p className="font-bold text-[var(--fg-primary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[var(--fg-primary)]">Client Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLACEHOLDERS.map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--border)] p-6"
              style={{ background: "var(--card)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--ui-primary-50)] flex items-center justify-center mb-3">
                <Icon size={20} className="text-[var(--ui-primary)]" />
              </div>
              <h3 className="font-bold text-[var(--fg-primary)] mb-1">{title}</h3>
              <p className="text-sm text-[var(--fg-muted)]">{desc}</p>
              <p className="text-xs text-[var(--color-coral)] font-semibold mt-3">Coming soon</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
