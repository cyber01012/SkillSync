import React from "react";
import TrustScoreRing from "./TrustScoreRing";
import { Sparkles } from "lucide-react";

export default function MatchResults({ matches = [], loading = false, compact = false }) {
  if (loading) {
    return <p className="text-sm text-[var(--fg-muted)]">Loading matches...</p>;
  }

  if (!matches.length) {
    return (
      <p className="text-sm text-[var(--fg-muted)]">
        No matched freelancers yet. Matches are calculated when a job is posted.
      </p>
    );
  }

  const list = compact ? matches.slice(0, 3) : matches;

  return (
    <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
      {list.map((match) => (
        <div
          key={match.freelancer_id}
          className="glass-morphism rounded-2xl p-5 flex items-center gap-4"
        >
          <TrustScoreRing score={match.trust_score} size={compact ? 80 : 100} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-[var(--fg-primary)] truncate">
                {match.display_name}
              </h4>
              {match.has_baseline_dna && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-coral)]">
                  <Sparkles size={12} /> DNA
                </span>
              )}
            </div>
            {match.headline && (
              <p className="text-sm text-[var(--fg-muted)] truncate">{match.headline}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold text-[var(--fg-secondary)]">
              {match.category && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--ui-primary-50)]">
                  {match.category}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-coral-50)] text-[var(--color-coral-dark)]">
                Match {Math.round(match.match_score)}%
              </span>
              {match.overall_dna != null && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-sky-50)] text-[var(--color-sky-dark)]">
                  DNA {Math.round(match.overall_dna)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
