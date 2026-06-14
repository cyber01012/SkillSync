import React from "react";
import { Trophy, TrendingUp, Zap, Award, Star, Target, Clock, ArrowUpRight } from "lucide-react";

const ICONS = {
  challenge_complete: Trophy,
  dna_snapshot: TrendingUp,
  dna_upgrade: Award,
  skill_unlocked: Star,
  milestone: Target,
  default: Zap,
};

const TYPE_COLORS = {
  challenge_complete: "from-amber-500 to-orange-500",
  dna_snapshot: "from-[var(--color-sky)] to-[var(--color-navy-light)]",
  dna_upgrade: "from-[var(--color-coral)] to-[var(--color-burnt)]",
  skill_unlocked: "from-emerald-400 to-teal-500",
  milestone: "from-violet-500 to-purple-600",
  default: "from-[var(--color-sky)] to-[var(--color-peri)]",
};

export default function ActivityFeed({ items = [] }) {
  return (
    <div className="rounded-3xl p-8 relative overflow-hidden border border-[var(--color-coral-200)]/60 shadow-[0_8px_32px_-12px_rgba(253,133,102,0.15)]" style={{ background: "linear-gradient(145deg, rgba(255, 248, 245, 0.95), rgba(254, 246, 242, 0.9))", backdropFilter: "blur(24px) saturate(180%)" }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--color-coral)]/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[var(--color-sky)]/5 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-[var(--fg-primary)] tracking-tight uppercase">Real-Time Proof Feed</h3>
            <p className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">Live activity stream</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-coral)]/10 rounded-full border border-[var(--color-coral)]/20">
            <div className="w-2 h-2 rounded-full bg-[var(--color-coral)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-coral)]">Live</span>
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
          <div className="space-y-3">
            {items.map((item, i) => {
              const Icon = ICONS[item.type] || ICONS.default;
              const gradient = TYPE_COLORS[item.type] || TYPE_COLORS.default;
              return (
                <div 
                  key={i} 
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white/50 hover:border-[var(--color-sky)]/20 hover:bg-white/90 hover:shadow-lg hover:shadow-[var(--color-navy)]/5 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg shadow-[var(--color-navy)]/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={20} className="text-white drop-shadow-sm" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[15px] font-black text-[var(--fg-primary)] truncate tracking-tight group-hover:text-[var(--color-navy)] transition-colors">{item.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.score_change != null && (
                          <span className="flex items-center gap-1 text-sm font-black text-[var(--color-coral)] bg-[var(--color-coral)]/10 px-2.5 py-1 rounded-lg border border-[var(--color-coral)]/20">
                            <ArrowUpRight size={12} />
                            {item.score_change > 0 ? '+' : ''}{item.score_change.toFixed?.(1) ?? item.score_change}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[13px] font-medium text-[var(--fg-secondary)] opacity-80 leading-relaxed">{item.description}</p>
                    {item.timestamp && (
                      <div className="flex items-center gap-2 mt-2.5">
                        <Clock size={10} className="text-[var(--color-sky)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">
                          {new Date(item.timestamp).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    )}
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