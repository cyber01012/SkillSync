import React, { useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { Zap, Target, TrendingUp } from "lucide-react";

const TRAIT_COLORS = {
  "Technical Accuracy": "#133B6C",
  Creativity: "#FD8566",
  Reliability: "#5F90D4",
  Performance: "#10B981",
  Speed: "#F59E0B",
  Deadline: "#8B5CF6",
};

export default function SkillDNACard({ scores = [], weights = {}, overallDna = null, categoryName = "" }) {
  const [hoveredTrait, setHoveredTrait] = useState(null);
  
  const chartData = scores.map((s) => ({
    trait: s.TraitName.replace(" Technical Accuracy", "").replace(" Adherence", ""),
    score: s.Score,
    fullMark: 100,
  }));

  return (
    <div className="rounded-3xl p-8 relative overflow-hidden border border-[var(--color-coral-200)]/60 shadow-[0_8px_32px_-12px_rgba(253,133,102,0.15)]" style={{ background: "linear-gradient(145deg, rgba(255, 240, 236, 0.9), rgba(255, 232, 225, 0.85))", backdropFilter: "blur(24px) saturate(180%)" }}>
      {/* Richer ambient lighting */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-sky)]/12 blur-[60px] rounded-full -mr-8 -mt-8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-coral)]/15 blur-[50px] rounded-full -ml-8 -mb-8 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--color-coral-100)]/25 blur-[90px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-[var(--fg-primary)] tracking-tight uppercase">Skill DNA</h3>
            {categoryName && (
              <p className="text-[11px] font-black tracking-widest text-[var(--color-sky)] uppercase mt-1 flex items-center gap-1.5">
                <Target size={10} /> {categoryName}
              </p>
            )}
          </div>
          {overallDna != null && (
            <div className="flex flex-col items-end bg-white/60 rounded-2xl px-4 py-2 border border-white/80 shadow-sm">
              <span className="text-4xl font-black text-[var(--color-coral)] leading-none tracking-tighter">
                {overallDna.toFixed(1)}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--fg-muted)] mt-1">
                Overall Index
              </span>
            </div>
          )}
        </div>

        {chartData.length > 0 ? (
          <div className="relative group/chart">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sky)]/8 to-[var(--color-coral)]/5 rounded-full blur-3xl opacity-0 group-hover/chart:opacity-100 transition-opacity duration-700" />
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="rgba(19, 59, 108, 0.12)" />
                <PolarAngleAxis 
                  dataKey="trait" 
                  tick={{ fill: "#4A6582", fontSize: 10, fontWeight: 700 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="url(#radarGradient)"
                  fill="url(#radarGradient)"
                  fillOpacity={0.35}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#133B6C" />
                    <stop offset="50%" stopColor="#5F90D4" />
                    <stop offset="100%" stopColor="#FD8566" />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    const w = weights[d.trait?.toLowerCase()] || weights[d.trait];
                    return (
                      <div className="rounded-xl p-3.5 text-[11px] shadow-xl border border-white/60 animate-in fade-in zoom-in duration-200" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)" }}>
                        <p className="font-black text-[var(--fg-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <TrendingUp size={10} className="text-[var(--color-coral)]" /> {d.trait}
                        </p>
                        <div className="flex items-center justify-between gap-6 mb-1">
                          <span className="font-bold text-[var(--fg-muted)]">Raw Score</span>
                          <span className="font-black text-[var(--color-coral)] text-lg">{d.score}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-navy)]/5 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-coral)] rounded-full" style={{ width: `${d.score}%` }} />
                        </div>
                        {w && (
                          <div className="flex items-center justify-between gap-6 pt-2 border-t border-[var(--border)]">
                            <span className="font-bold text-[var(--fg-muted)]">Impact Weight</span>
                            <span className="font-black text-[var(--color-sky)]">{(w * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-2xl border border-dashed border-[var(--border)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ui-primary-50)] flex items-center justify-center mb-4 shadow-inner">
              <Zap size={28} className="text-[var(--color-sky)]" />
            </div>
            <p className="text-sm font-bold text-[var(--fg-muted)]">
              Generation Pending
            </p>
            <p className="text-[11px] font-medium text-[var(--fg-muted)] opacity-60 mt-1">Complete your baseline challenge</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-6">
          {scores.map((trait) => {
            const w = weights[trait.TraitName?.split(" ")[0]?.toLowerCase()] || 0.15;
            const maxWeighted = (w * 100).toFixed(1);
            const scoreVal = ((trait.Score / 100) * w * 100).toFixed(1);
            const isHovered = hoveredTrait === trait.TraitName;
            return (
              <div 
                key={trait.TraitName} 
                className={`p-3.5 bg-white/50 rounded-xl border transition-all duration-300 cursor-default ${isHovered ? 'border-[var(--color-sky)]/40 shadow-md shadow-[var(--color-sky)]/5 bg-white/80' : 'border-white/60 hover:border-[var(--color-sky)]/30'}`}
                onMouseEnter={() => setHoveredTrait(trait.TraitName)}
                onMouseLeave={() => setHoveredTrait(null)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-secondary)] truncate pr-2">
                    {trait.TraitName.replace(" Technical Accuracy", "").replace(" Adherence", "")}
                  </span>
                  <span className="text-[10px] font-black text-[var(--color-coral)] bg-[var(--color-coral)]/10 px-1.5 py-0.5 rounded-md">
                    {scoreVal}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--color-navy)]/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-sky)] rounded-full transition-all duration-1000"
                    style={{ width: `${trait.Score}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] font-bold text-[var(--fg-muted)]">{trait.Score}% raw</span>
                  <span className="text-[9px] font-bold text-[var(--fg-muted)]">{(w * 100).toFixed(0)}% weight</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}