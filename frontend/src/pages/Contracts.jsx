import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Briefcase, FileText, CheckCircle, Clock, AlertCircle,
  ArrowRight, Loader2
} from "lucide-react";
import { authApi } from "../api/auth";
import { contractsApi } from "../api/contracts";
import DashboardSidebar from "../components/common/DashboardSidebar";

const STATUS_CONFIG = {
  active: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  completed: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  disputed: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
};

function getStatusIcon(status) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return <Icon size={14} className="shrink-0" />;
}

function getStatusClass(status) {
  return (STATUS_CONFIG[status] || STATUS_CONFIG.pending).color;
}

export default function Contracts() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    try {
      setLoading(true);
      const data = await contractsApi.list();
      setContracts(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role={profile?.Role || localStorage.getItem("role")} user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2">
            <Shield size={24} /> My Contracts
          </h1>
          <p className="text-sm text-[var(--fg-muted)]">
            Manage your active and completed contracts
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--fg-muted)]" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="premium-glass-card rounded-2xl p-8 text-center">
            <Briefcase size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
            <h3 className="font-bold text-[var(--fg-primary)] mb-2">No contracts yet</h3>
            <p className="text-sm text-[var(--fg-muted)] mb-4">
              {profile?.Role === "client"
                ? "Accept a freelancer application to create a contract"
                : "Apply to jobs and get accepted to start working"
              }
            </p>
            <button
              type="button"
              onClick={() => navigate(profile?.Role === "client" ? "/dashboard/client" : "/jobs")}
              className="btn-primary"
            >
              {profile?.Role === "client" ? "Go to Dashboard" : "Browse Jobs"}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <button
                key={contract.ContractID}
                type="button"
                onClick={() => navigate(`/contracts/${contract.ContractID}`)}
                className="w-full text-left premium-glass-card rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${getStatusClass(contract.Status)}`}>
                        {getStatusIcon(contract.Status)}
                        {contract.Status}
                      </span>
                      <span className="text-xs text-[var(--fg-muted)]">
                        Contract #{contract.ContractID}
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--fg-primary)] text-lg truncate group-hover:text-[#5F90D4] transition-colors">
                      {contract.job_title || "Untitled Contract"}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--fg-muted)]">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {profile?.Role === "client"
                          ? `Freelancer: ${contract.freelancer_name || "Unknown"}`
                          : `Client: ${contract.client_name || "Unknown"}`
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield size={14} />
                        ${contract.TotalAmount?.toLocaleString() || "0"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {contract.CreatedAt
                          ? new Date(contract.CreatedAt).toLocaleDateString()
                          : "Recently"
                        }
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-[var(--fg-muted)] shrink-0 mt-1 group-hover:text-[#5F90D4] transition-colors"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}