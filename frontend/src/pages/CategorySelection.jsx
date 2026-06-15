import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi } from "../api/categories";
import DomainSelection from "../components/category/DomainSelection";
import SpecialtyGrid from "../components/category/SpecialtyGrid";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function CategorySelection() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState({});
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoriesApi.list().then((data) => {
      setDomains(data.domains || {});
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      await categoriesApi.select(selectedCategory);
      navigate("/baseline-challenge");
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen premium-dashboard-bg flex items-center justify-center">
        <p className="font-bold text-[var(--fg-primary)]">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-dashboard-bg p-6 relative overflow-hidden">
      {/* Deep ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-[#FD8566]/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#133B6C]/18 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-[#5F90D4]/12 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-2xl font-black text-[var(--fg-primary)] mb-2">Choose Your Specialty</h1>
        <p className="text-[var(--fg-muted)] mb-8">Select your domain and specialty to get matched challenges</p>

        <div className="flex gap-2 mb-6">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${step === 1 ? "bg-[var(--ui-primary)] text-white" : "bg-[var(--muted)] text-[var(--fg-muted)]"}`}>
            1. Domain
          </span>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${step === 2 ? "bg-[var(--ui-primary)] text-white" : "bg-[var(--muted)] text-[var(--fg-muted)]"}`}>
            2. Specialty
          </span>
        </div>

        <div className="premium-glass-card rounded-2xl p-6 mb-6">
          {step === 1 ? (
            <DomainSelection
              domains={domains}
              selected={selectedDomain}
              onSelect={(d) => { setSelectedDomain(d); setSelectedCategory(null); }}
            />
          ) : (
            <SpecialtyGrid
              specialties={domains[selectedDomain] || []}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}
        </div>

        <div className="flex justify-between">
          {step === 2 ? (
            <button type="button" onClick={() => setStep(1)} className="btn-ghost flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}
          {step === 1 ? (
            <button
              type="button"
              disabled={!selectedDomain}
              onClick={() => setStep(2)}
              className="btn-primary flex items-center gap-1"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedCategory || saving}
              onClick={handleSave}
              className="btn-primary flex items-center gap-1"
            >
              {saving ? "Saving..." : "Continue to Challenge"} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}