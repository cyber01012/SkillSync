import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Tag, BarChart3, Pencil, Zap, Briefcase, Shield, Award, Star, MapPin, Calendar, ChevronRight, Camera } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ProfileCard({ profile, onEdit, onPhotoUpload }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const photoUrl = profile?.ProfilePhotoURL && !imgError
    ? profile.ProfilePhotoURL.startsWith("http")
      ? profile.ProfilePhotoURL
      : `${API_BASE}${profile.ProfilePhotoURL}`
    : null;

  const completionRate = profile?.challenges_total
    ? Math.round((profile.challenges_completed / profile.challenges_total) * 100)
    : 0;

  const trustScore = profile?.TrustScore ?? 96;
  const dna = profile?.overall_dna;

  return (
    <div
      className="rounded-3xl p-6 md:p-8 relative overflow-hidden premium-glass-card"
    >
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#5F90D4]/10 blur-[90px] rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FD8566]/12 blur-[70px] rounded-full -ml-16 -mb-16 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* ── Avatar column ── */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          {/* Avatar with spinning ring */}
          <div className="relative group/avatar cursor-pointer" onClick={() => fileRef.current?.click()}>
            {/* Gradient ring */}
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-[#FD8566] via-[#5F90D4] to-[#133B6C] animate-[spin_8s_linear_infinite] opacity-70 group-hover/avatar:opacity-100 transition-opacity" />
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-[3px] border-white overflow-hidden bg-gradient-to-br from-[#E8F0F8] to-[#FFF0EC] shadow-xl shadow-[#133B6C]/10">
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImgError(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FD8566]/20 border-t-[#FD8566] animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={48} className="text-[#133B6C] opacity-25" />
                </div>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex items-end justify-center pb-2">
                <Camera size={16} className="text-white" />
              </div>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onPhotoUpload?.(e.target.files[0])}
          />

          {/* Trust score pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border animate-glow-pulse"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.05))",
              borderColor: "rgba(16,185,129,0.3)",
              color: "#059669",
            }}>
            <Shield size={11} />
            {trustScore}% Trust
          </div>
        </div>

        {/* ── Main content column ── */}
        <div className="flex-1 min-w-0">
          {/* Name + Badges */}
          <div className="flex items-start gap-3 flex-wrap mb-2">
            <h2 className="text-2xl md:text-3xl font-black text-[var(--fg-primary)] tracking-tight leading-tight">
              {profile?.DisplayName || "Your Name"}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border"
                style={{ background: "rgba(253,133,102,0.1)", borderColor: "rgba(253,133,102,0.25)", color: "#E86A4A" }}>
                <Award size={10} /> Verified DNA
              </span>
              {dna != null && dna >= 80 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border"
                  style={{ background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.25)", color: "#D97706" }}>
                  <Star size={10} className="fill-amber-400" /> Elite
                </span>
              )}
            </div>
          </div>

          {/* Headline */}
          {profile?.Headline && (
            <p className="text-sm font-semibold text-[var(--fg-secondary)] mb-3">{profile.Headline}</p>
          )}

          {/* Meta pills row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile?.category_display_name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-white/60"
                style={{ borderColor: "rgba(19,59,108,0.12)", color: "var(--fg-secondary)" }}>
                <Tag size={11} className="text-[#5F90D4]" /> {profile.category_display_name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-white/60"
              style={{ borderColor: "rgba(19,59,108,0.12)", color: "var(--fg-secondary)" }}>
              <MapPin size={11} className="text-[#FD8566]" /> Available
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-white/60"
              style={{ borderColor: "rgba(19,59,108,0.12)", color: "var(--fg-secondary)" }}>
              <Calendar size={11} className="text-[#5F90D4]" /> Joined {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {dna != null && (
              <div className="rounded-2xl p-3 text-center border premium-glass-card"
                style={{ background: "linear-gradient(135deg, rgba(253,133,102,0.10), rgba(253,133,102,0.04))", borderColor: "rgba(253,133,102,0.18)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-1">DNA Score</p>
                <p className="text-2xl font-black text-[#FD8566] leading-none">{dna.toFixed(1)}</p>
              </div>
            )}
            <div className="rounded-2xl p-3 text-center border premium-glass-card"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04))", borderColor: "rgba(245,158,11,0.18)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-1">Proof</p>
              <p className="text-2xl font-black text-amber-500 leading-none">
                {profile?.challenges_completed || 0}
                <span className="text-sm text-[var(--fg-muted)] font-bold">/{profile?.challenges_total || 4}</span>
              </p>
            </div>
            <div className="rounded-2xl p-3 text-center border premium-glass-card"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04))", borderColor: "rgba(16,185,129,0.18)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-1">Trust</p>
              <p className="text-2xl font-black text-emerald-500 leading-none">{trustScore}%</p>
            </div>
          </div>

          {/* Completion bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">Challenge Completion</span>
              <span className="text-[10px] font-black text-[var(--fg-primary)]">{completionRate}%</span>
            </div>
            <div className="h-2 w-full bg-[#133B6C]/6 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#133B6C] via-[#5F90D4] to-[#FD8566] rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Bio */}
          {profile?.Bio && (
            <div className="relative p-4 rounded-2xl mb-5 border premium-glass-card"
              style={{ background: "rgba(255,255,255,0.50)", borderColor: "rgba(255,255,255,0.7)" }}>
              <span className="absolute -top-3 -left-1 text-5xl text-[#FD8566]/15 font-serif leading-none select-none">"</span>
              <p className="text-sm leading-relaxed text-[var(--fg-secondary)] font-medium pl-2">
                {profile.Bio}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 text-sm font-bold text-[var(--fg-primary)] hover:bg-white/60 hover:shadow-md transition-all"
              style={{ borderColor: "rgba(19,59,108,0.14)" }}
            >
              <Pencil size={13} /> Edit Profile
            </button>
            <button
              type="button"
              onClick={() => navigate("/baseline-challenge")}
              className="btn-primary !rounded-xl !py-2.5 !px-4 flex items-center gap-1.5 !text-sm hover:-translate-y-0.5 transition-transform"
            >
              <Zap size={13} className="fill-white" /> Upgrade DNA
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="btn-coral !rounded-xl !py-2.5 !px-4 flex items-center gap-1.5 !text-sm hover:-translate-y-0.5 transition-transform"
            >
              <Briefcase size={13} /> Browse Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}