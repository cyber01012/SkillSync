import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Wallet, Loader2, ArrowRight, Briefcase } from "lucide-react";
import { authApi } from "../api/auth";
import { contractsApi } from "../api/contracts";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function Earnings() {
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    try {
      setLoading(true);
      const contractsData = await contractsApi.list();
      setContracts(contractsData);

      const allPayments = [];
      await Promise.all(
        contractsData.map(async (contract) => {
          try {
            const contractPayments = await contractsApi.getPayments(contract.ContractID);
            contractPayments.forEach((p) => {
              if (p.EventType === "payment_released") {
                allPayments.push({ ...p, contract_title: contract.job_title });
              }
            });
          } catch {}
        })
      );
      allPayments.sort((a, b) => new Date(b.ProcessedAt) - new Date(a.ProcessedAt));
      setPayments(allPayments);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load earnings");
    } finally {
      setLoading(false);
    }
  }

  const totalEarned = payments.reduce((sum, p) => sum + (p.Amount || 0), 0);
  const completedContracts = contracts.filter((c) => c.Status === "completed").length;
  const activeContracts = contracts.filter((c) => c.Status === "active").length;

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role="freelancer" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
          <DollarSign size={24} /> Earnings
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="premium-glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#133B6C] flex items-center justify-center">
                <Wallet size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Total Earned</span>
            </div>
            <p className="text-2xl font-black text-[var(--fg-primary)]">${totalEarned.toLocaleString()}</p>
          </div>
          <div className="premium-glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FD8566] flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Active Contracts</span>
            </div>
            <p className="text-2xl font-black text-[var(--fg-primary)]">{activeContracts}</p>
          </div>
          <div className="premium-glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Completed</span>
            </div>
            <p className="text-2xl font-black text-[var(--fg-primary)]">{completedContracts}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--fg-muted)]" />
          </div>
        ) : payments.length === 0 ? (
          <div className="premium-glass-card rounded-2xl p-8 text-center">
            <DollarSign size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
            <p className="text-[var(--fg-muted)]">No earnings yet</p>
            <p className="text-sm text-[var(--fg-muted)] mt-2">Complete contracts to start earning</p>
          </div>
        ) : (
          <div className="premium-glass-card rounded-2xl p-6">
            <h3 className="font-bold text-[var(--fg-primary)] mb-4">Payment History</h3>
            <div className="space-y-3">
              {payments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                  <div>
                    <p className="font-semibold text-[var(--fg-primary)]">Payment Received</p>
                    <p className="text-xs text-[var(--fg-muted)] mt-1">
                      {payment.contract_title || `Contract #${payment.ContractID}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+${payment.Amount?.toLocaleString()}</p>
                    <p className="text-xs text-[var(--fg-muted)]">
                      {payment.ProcessedAt ? new Date(payment.ProcessedAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}