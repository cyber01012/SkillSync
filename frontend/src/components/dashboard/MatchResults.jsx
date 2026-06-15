import React from "react";
import { Star, Shield, Dna, ArrowRight } from "lucide-react";

function TrustRing({ score, size = 40 }) {
  const circumference = 2 * Math.PI * (size / 2 - 4);
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#5F90D4" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="none"
          stroke="#D8CFC9"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-[var(--fg-primary)]">{Math.round(score)}</span>
    </div>
  );
}

export default function MatchResults({ matches, loading, compact = false }) {
  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="w-8 h-8 border-3 border-[#133B6C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--fg-muted)]">Finding best matches...</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-[var(--fg-muted)]">No matches found yet.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? "" : "max-h-[500px] overflow-y-auto form-scroll pr-2"}`}>
      {matches.map((match, idx) => (
        <div
          key={match.freelancer_id}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-[var(--border)] hover:bg-white/80 hover:shadow-md transition-all"
        >
          {/* Rank */}
          <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[var(--fg-primary)]">{idx + 1}</span>
          </div>

          {/* Trust Ring */}
          <TrustRing score={match.trust_score} size={compact ? 32 : 40} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[var(--fg-primary)] truncate">
                {match.display_name}
              </h4>
              {match.has_baseline_dna && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8F0F8] text-[#133B6C]">
                  DNA
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--fg-muted)] truncate">
              {match.headline || match.category || "Freelancer"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-[#FD8566]">
                <Star size={10} className="inline mr-0.5" />
                {match.match_score.toFixed(1)}% match
              </span>
              {match.overall_dna && (
                <span className="text-xs text-[var(--fg-muted)]">
                  <Dna size={10} className="inline mr-0.5" />
                  DNA {match.overall_dna.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {!compact && (
            <ArrowRight size={16} className="text-[var(--fg-muted)] shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}