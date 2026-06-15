import React, { useState } from "react";
import { Trophy, TrendingUp, Zap, Award, Star, Target, Clock, ArrowUpRight, Terminal, CheckCircle2, ShieldCheck, ChevronRight } from "lucide-react";

const ICONS = {
  challenge_complete: Trophy,
  dna_snapshot: TrendingUp,
  dna_upgrade: Award,
  skill_unlocked: Star,
  milestone: Target,
  default: Zap,
};

const TYPE_COLORS = {
  challenge_complete: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  dna_snapshot: "text-[var(--color-sky)] bg-[var(--color-sky)]/10 border-[var(--color-sky)]/20",
  dna_upgrade: "text-[var(--color-coral)] bg-[var(--color-coral)]/10 border-[var(--color-coral)]/20",
  skill_unlocked: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  milestone: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  default: "text-[var(--color-sky)] bg-[var(--color-sky)]/10 border-[var(--color-sky)]/20",
};

const TYPE_LABELS = {
  challenge_complete: "CHALLENGE_COMPLETE",
  dna_snapshot: "DNA_SNAPSHOT_GEN",
  dna_upgrade: "DNA_INDEX_UPGRADE",
  skill_unlocked: "SKILL_UNLOCKED",
  milestone: "MILESTONE_REACHED",
  default: "SYSTEM_EVENT",
};

export default function ActivityFeed({ items = [] }) {
  const [activeItem, setActiveItem] = useState(null);

  const getFakeHash = (title, index) => {
    const chars = "abcdef0123456789";
    let hash = "";
    for (let i = 0; i < 8; i++) {
      hash += chars[Math.abs(title.charCodeAt(i % title.length) + index * i) % chars.length];
    }
    return `0x${hash}...${chars[(index + 5) % 16]}${chars[(index + 12) % 16]}`;
  };

  return (
    <div className="rounded-3xl p-8 relative overflow-hidden border border-[var(--color-coral-200)]/60 shadow-[0_8px_32px_-12px_rgba(253,133,102,0.15)] premium-glass-card animate-in fade-in duration-500">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--color-coral)]/6 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[var(--color-sky)]/6 blur-[60px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-[var(--fg-primary)] tracking-tight uppercase flex items-center gap-2">
              <Terminal size={18} className="text-[var(--color-coral)]" /> Real-Time Proof Ledger
            </h3>
            <p className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">Cryptographic Activity Stream</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 font-mono">NODE_ONLINE</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white/50 rounded-2xl border border-dashed border-[var(--border)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ui-primary-50)] flex items-center justify-center mb-4 shadow-inner">
              <Zap size={28} className="text-[var(--fg-muted)] opacity-30" />
            </div>
            <p className="text-sm font-bold text-[var(--fg-muted)]">No recent activity detected</p>
            <p className="text-[11px] font-medium text-[var(--fg-muted)] opacity-60 mt-1">Complete challenges to see your proof feed</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map((item, i) => {
              const Icon = ICONS[item.type] || ICONS.default;
              const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.default;
              const typeLabel = TYPE_LABELS[item.type] || TYPE_LABELS.default;
              const hash = getFakeHash(item.title, i);
              const isHovered = activeItem === i;

              return (
                <div 
                  key={i} 
                  className={`group relative rounded-2xl border p-4 transition-all duration-300 cursor-default ${
                    isHovered 
                      ? "border-[var(--color-coral)]/40 bg-white/90 shadow-xl shadow-[var(--color-navy)]/5 scale-[1.01]" 
                      : "border-white/60 bg-white/50 hover:bg-white/70"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                  onMouseEnter={() => setActiveItem(i)}
                  onMouseLeave={() => setActiveItem(null)}
                >
                  <div className="flex items-start gap-4">
                    {/* Glowing status line */}
                    <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[var(--color-coral)] to-[var(--color-sky)] opacity-40 group-hover:opacity-100 transition-opacity" />

                    <div className="flex-1 min-w-0">
                      {/* Top metadata header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${typeColor}`}>
                            {typeLabel}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono">
                            {hash}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.score_change != null && (
                            <span className="flex items-center gap-0.5 text-[11px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <ArrowUpRight size={10} />
                              +{item.score_change.toFixed?.(1) ?? item.score_change}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Title & Description */}
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={15} className="text-[var(--color-navy)] shrink-0" />
                        <h4 className="text-[14px] font-black text-[var(--fg-primary)] group-hover:text-[var(--color-coral)] transition-colors leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[12px] font-medium text-[var(--fg-secondary)] opacity-85 pl-5 leading-normal">
                        {item.description}
                      </p>

                      {/* Expandable tech details */}
                      <div className={`mt-3 pl-5 border-l border-slate-200/80 space-y-1 transition-all duration-300 ${
                        isHovered ? "max-h-24 opacity-100 py-1" : "max-h-0 opacity-0 overflow-hidden"
                      }`}>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-slate-400">
                          <CheckCircle2 size={9} className="text-emerald-500" />
                          VERIFICATION_STATUS: <span className="text-emerald-600 uppercase">Passed</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-slate-400">
                          <ShieldCheck size={9} className="text-[var(--color-sky)]" />
                          VETTED_BY: <span className="text-[var(--color-navy)]">SkillSync-AI-Agent-v3.0</span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      {item.timestamp && (
                        <div className="flex items-center gap-2 mt-2.5 pl-5">
                          <Clock size={10} className="text-[var(--color-sky)]" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--fg-muted)]">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}