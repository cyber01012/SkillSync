import React, { useEffect, useState } from "react";
import { CreditCard, DollarSign, Shield, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { authApi } from "../api/auth";
import { contractsApi } from "../api/contracts";
import DashboardSidebar from "../components/common/DashboardSidebar";

export default function Payments() {
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
    loadPayments();
  }, []);

  async function loadPayments() {
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
              allPayments.push({ ...p, contract_title: contract.job_title });
            });
          } catch {}
        })
      );
      allPayments.sort((a, b) => new Date(b.ProcessedAt) - new Date(a.ProcessedAt));
      setPayments(allPayments);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  const totalEscrow = contracts.reduce((sum, c) => sum + (c.TotalAmount || 0), 0);
  const totalReleased = payments
    .filter((p) => p.EventType === "payment_released")
    .reduce((sum, p) => sum + (p.Amount || 0), 0);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar role="client" user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] flex items-center gap-2 mb-6">
          <CreditCard size={24} /> Payments
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-morphism rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#133B6C] flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Total Escrow</span>
            </div>
            <p className="text-2xl font-black text-[var(--fg-primary)]">${totalEscrow.toLocaleString()}</p>
          </div>
          <div className="glass-morphism rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FD8566] flex items-center justify-center">
                <ArrowRight size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Released</span>
            </div>
            <p className="text-2xl font-black text-[var(--fg-primary)]">${totalReleased.toLocaleString()}</p>
          </div>
          <div className="glass-morphism rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#5F90D4] flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Balance</span>
            </div>
            <p className="text-2xl font-black text-[var(--fg-primary)]">${(totalEscrow - totalReleased).toLocaleString()}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--fg-muted)]" />
          </div>
        ) : payments.length === 0 ? (
          <div className="glass-morphism rounded-2xl p-8 text-center">
            <CreditCard size={48} className="mx-auto text-[var(--fg-muted)] mb-3 opacity-50" />
            <p className="text-[var(--fg-muted)]">No payment activity yet</p>
          </div>
        ) : (
          <div className="glass-morphism rounded-2xl p-6">
            <h3 className="font-bold text-[var(--fg-primary)] mb-4">Payment History</h3>
            <div className="space-y-3">
              {payments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                  <div>
                    <p className="font-semibold text-[var(--fg-primary)]">
                      {payment.EventType === "escrow_deposit" ? "Escrow Deposit" : "Payment Released"}
                    </p>
                    <p className="text-xs text-[var(--fg-muted)] mt-1">
                      {payment.contract_title || `Contract #${payment.ContractID}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--fg-primary)]">${payment.Amount?.toLocaleString()}</p>
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