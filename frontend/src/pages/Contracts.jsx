import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, FileText, DollarSign, Shield, ArrowRight, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { contractsApi } from "../api/contracts";
import { authApi } from "../api/auth";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.me().then(setUser).catch(() => {});
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractsApi.myContracts();
      setContracts(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <Clock className="w-4 h-4 text-[var(--coral)]" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "disputed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-[var(--sky)]" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active": return "bg-[var(--coral)]/10 text-[var(--coral)]";
      case "completed": return "bg-emerald-500/10 text-emerald-500";
      case "disputed": return "bg-red-500/10 text-red-500";
      default: return "bg-[var(--sky)]/10 text-[var(--sky)]";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--coral)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--navy)" }}>
            My Contracts
          </h1>
          <p className="text-[var(--fg-muted)] mt-1">
            Manage your active and completed contracts
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 text-red-600 text-sm">
            {error}
          </div>
        )}

        {contracts.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-4" />
            <h3 className="text-lg font-semibold" style={{ color: "var(--navy)" }}>
              No contracts yet
            </h3>
            <p className="text-[var(--fg-muted)] mt-1">
              {user?.role === "client"
                ? "Accept a freelancer application to create a contract"
                : "Apply to jobs and get accepted to start working"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <div
                key={contract.ContractID}
                onClick={() => navigate(`/contracts/${contract.ContractID}`)}
                className="rounded-2xl border border-[var(--border)] p-6 cursor-pointer hover:shadow-lg transition-all"
                style={{ background: "var(--card)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(contract.Status)}`}>
                        {contract.Status}
                      </span>
                      {getStatusIcon(contract.Status)}
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--navy)" }}>
                      {contract.job_title || "Untitled Contract"}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--fg-muted)]">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${contract.TotalAmount?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Contract #{contract.ContractID}
                      </span>
                      {user?.role === "client" ? (
                        <span>Freelancer: {contract.freelancer_name}</span>
                      ) : (
                        <span>Client: {contract.client_name}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--fg-muted)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}