import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Tag, BarChart3, Pencil, Zap, Briefcase, Shield, Award, Star, MapPin, Calendar, ChevronRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ProfileCard({ profile, onEdit, onPhotoUpload }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const photoUrl = profile?.ProfilePhotoURL
    ? profile.ProfilePhotoURL.startsWith("http")
      ? profile.ProfilePhotoURL
      : `${API_BASE}${profile.ProfilePhotoURL}`
    : null;

  const completionRate = profile?.challenges_total 
    ? Math.round((profile.challenges_completed / profile.challenges_total) * 100) 
    : 0;

  return (
    <div className="rounded-3xl p-8 relative overflow-hidden border border-[var(--color-coral-200)]/40 shadow-[0_8px_32px_-12px_rgba(253,133,102,0.12)] transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(13,40,71,0.12)] group" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 246, 242, 0.9))", backdropFilter: "blur(24px) saturate(180%)" }}>
      {/* Premium ambient layers */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-sky)]/8 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-coral)]/10 blur-[60px] rounded-full -ml-12 -mb-12 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[var(--color-coral-100)]/20 blur-[50px] rounded-full pointer-events-none" />
      
      {/* Subtle mesh overlay */}
      <div className="absolute inset-0 bg-mesh-subtle opacity-30 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Section with Premium Ring + Status */}
        <div className="relative shrink-0 group/avatar">
          {/* Animated gradient ring */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-[var(--color-coral)] via-[var(--color-sky)] to-[var(--color-coral)] rounded-full blur-[3px] opacity-60 group-hover/avatar:opacity-100 transition-all duration-700 animate-[spin_8s_linear_infinite]" style={{ backgroundSize: "200% 200%" }} />
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-[var(--color-coral)] via-[var(--color-sky)] to-[var(--color-coral)] rounded-full opacity-40 group-hover/avatar:opacity-70 transition-all duration-500" />
          
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-32 h-32 rounded-full border-[3px] border-white overflow-hidden bg-[var(--ui-primary-50)] flex items-center justify-center hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-[var(--color-navy)]/10"
          >
            {photoUrl ? (
              <>
                <img 
                  src={photoUrl} 
                  alt="Profile" 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-coral)]/20 border-t-[var(--color-coral)] animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--ui-primary-50)] to-[var(--color-coral-50)]">
                <User size={52} className="text-[var(--ui-primary)] opacity-30" />
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/60 via-transparent to-transparent opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
              <div className="flex items-center gap-1 text-white text-[11px] font-bold">
                <Pencil size={12} /> Change
              </div>
            </div>
          </button>

          {/* Status indicator */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-lg">
            <Shield size={14} className="text-[var(--color-coral)] fill-[var(--color-coral)]/20" />
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onPhotoUpload?.(e.target.files[0])}
        />

        <div className="flex-1 min-w-0">
          {/* Name row with badges */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl font-black text-[var(--fg-primary)] tracking-tight leading-none">{profile?.DisplayName}</h2>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--color-coral)]/10 to-[var(--color-coral-50)] text-[var(--color-coral)] text-[10px] uppercase font-black px-3 py-1 rounded-full border border-[var(--color-coral)]/20 shadow-sm">
              <Award size={12} className="fill-[var(--color-coral)]/20" /> Verified DNA
            </div>
            {profile?.overall_dna != null && profile.overall_dna >= 80 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-600 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-amber-200/60">
                <Star size={10} className="fill-amber-400 text-amber-500" /> Elite
              </div>
            )}
          </div>
          
          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {profile?.category_display_name && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 rounded-full border border-[var(--border)] text-xs font-bold text-[var(--fg-secondary)] shadow-sm hover:shadow-md transition-shadow">
                <Tag size={12} className="text-[var(--color-sky)]" /> {profile.category_display_name}
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 rounded-full border border-[var(--border)] text-xs font-bold text-[var(--fg-secondary)] shadow-sm">
              <MapPin size={12} className="text-[var(--color-coral)]" /> Available
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 rounded-full border border-[var(--border)] text-xs font-bold text-[var(--fg-secondary)] shadow-sm">
              <Calendar size={12} className="text-[var(--color-sky)]" /> Joined {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4 mb-5">
            {profile?.overall_dna != null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-coral)]/10 to-[var(--color-coral-50)] rounded-xl border border-[var(--color-coral)]/15">
                <BarChart3 size={16} className="text-[var(--color-coral)]" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] leading-none">DNA Score</p>
                  <p className="text-xl font-black text-[var(--color-coral)] leading-none mt-1">{profile.overall_dna.toFixed(1)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-xl border border-amber-200/40">
              <Zap size={16} className="text-amber-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] leading-none">Proof</p>
                <p className="text-xl font-black text-amber-600 leading-none mt-1">{profile?.challenges_completed || 0}<span className="text-sm text-[var(--fg-muted)] font-bold">/{profile?.challenges_total || 4}</span></p>
              </div>
            </div>
            {/* Progress mini-bar */}
            <div className="flex-1 min-w-[120px] max-w-[200px]">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">Completion</span>
                <span className="text-[10px] font-black text-[var(--fg-primary)]">{completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--color-navy)]/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--color-navy)] via-[var(--color-sky)] to-[var(--color-coral)] rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {profile?.Bio && (
            <div className="relative p-4 rounded-2xl bg-white/40 border border-white/60 mb-5">
              <div className="absolute -top-2 -left-1 text-4xl text-[var(--color-coral)]/20 font-serif leading-none">"</div>
              <p className="text-[15px] leading-relaxed text-[var(--fg-secondary)] font-medium pl-2">
                {profile.Bio}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              type="button" 
              onClick={onEdit} 
              className="group/btn px-5 py-2.5 rounded-xl border-2 border-[var(--color-navy)]/10 hover:border-[var(--color-navy)]/25 text-sm font-bold text-[var(--fg-primary)] transition-all flex items-center gap-2 hover:bg-white/60 hover:shadow-md"
            >
              <Pencil size={14} /> Edit Profile <ChevronRight size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity -ml-1" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/baseline-challenge")}
              className="btn-primary !rounded-xl !py-2.5 !px-5 flex items-center gap-2 shadow-lg shadow-[var(--color-navy)]/20 hover:shadow-xl hover:shadow-[var(--color-navy)]/30 hover:-translate-y-0.5 transition-all"
            >
              <Zap size={14} className="fill-white" /> Upgrade DNA
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="btn-coral !rounded-xl !py-2.5 !px-5 flex items-center gap-2 shadow-lg shadow-[var(--color-coral)]/20 hover:shadow-xl hover:shadow-[var(--color-coral)]/30 hover:-translate-y-0.5 transition-all"
            >
              <Briefcase size={14} /> Browse Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}