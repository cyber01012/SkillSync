import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../api/profile";
import { authApi } from "../api/auth";
import DashboardSidebar from "../components/common/DashboardSidebar";
import { User, FileText, AlignLeft, Camera, ArrowLeft, Save, CheckCircle2 } from "lucide-react";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ display_name: "", headline: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {});
    profileApi.get().then((p) => {
      setProfile(p);
      setForm({ display_name: p.DisplayName || "", headline: p.Headline || "", bio: p.Bio || "" });
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await profileApi.update(form);
      setMessage("Profile updated successfully!");
      setIsError(false);
    } catch {
      setMessage("Update failed. Please try again.");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await profileApi.uploadPhoto(file);
      const p = await profileApi.get();
      setProfile(p);
      setMessage("Photo updated!");
      setIsError(false);
    } catch {
      setMessage("Photo upload failed.");
      setIsError(true);
    }
  }

  const fields = [
    { key: "display_name", label: "Display Name", icon: User, placeholder: "Your full name", type: "input" },
    { key: "headline", label: "Headline", icon: FileText, placeholder: "e.g. Senior React Developer", type: "input" },
    { key: "bio", label: "Bio", icon: AlignLeft, placeholder: "Tell clients about yourself…", type: "textarea", maxLength: 500 },
  ];

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#FD8566]/12 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-[#133B6C]/10 blur-[130px] rounded-full" />
      </div>

      <DashboardSidebar role="freelancer" user={profile} />

      <main className="relative z-10 flex-1 p-6 lg:p-8 overflow-y-auto flex items-start justify-center">
        <div className="w-full max-w-xl animate-slide-up">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/freelancer")}
            className="flex items-center gap-2 text-sm font-bold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-6">
            <p className="dashboard-section-label mb-1">Account</p>
            <h1 className="text-2xl font-black text-[var(--fg-primary)]">Profile Settings</h1>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Update your public profile information</p>
          </div>

          {/* Photo card */}
          <div className="premium-glass-card rounded-2xl p-5 mb-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8F0F8] to-[#FFF0EC] flex items-center justify-center border border-white/80 shadow-sm">
              <Camera size={22} className="text-[#5F90D4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--fg-primary)] mb-0.5">Profile Photo</p>
              <p className="text-xs text-[var(--fg-muted)]">JPG, PNG or GIF. Recommended 400×400px.</p>
            </div>
            <label className="shrink-0 btn-outline !py-2 !px-4 !text-xs !rounded-xl cursor-pointer">
              Upload
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>

          {/* Form card */}
          <form onSubmit={handleSave} className="premium-glass-card rounded-2xl p-6 space-y-5">
            {fields.map(({ key, label, icon: Icon, placeholder, type, maxLength }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--fg-muted)] mb-2">
                  <Icon size={11} /> {label}
                </label>
                {type === "textarea" ? (
                  <div className="relative">
                    <textarea
                      className="input min-h-[110px] resize-none"
                      maxLength={maxLength}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] font-bold text-[var(--fg-muted)]">
                      {form[key].length}/{maxLength}
                    </span>
                  </div>
                ) : (
                  <input
                    className="input"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}

            {message && (
              <div className={`flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-3 border ${
                isError
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}>
                {!isError && <CheckCircle2 size={14} />}
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 !rounded-xl"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
