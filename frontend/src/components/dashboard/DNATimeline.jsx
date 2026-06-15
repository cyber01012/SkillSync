import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart,
} from "recharts";
import { TrendingUp, Sparkles } from "lucide-react";

export default function DNATimeline({ snapshots = [] }) {
  const chartData = snapshots.map((s, i) => {
    let overall = 0, technical = 0, reliability = 0;
    try {
      const data = JSON.parse(s.SnapshotData);
      overall = data.overall || 0;
      technical = data.raw?.technical || 0;
      reliability = data.raw?.reliability || 0;
    } catch {
      /* legacy format */
    }
    return {
      name: `C${i + 1}`,
      Overall: overall,
      Technical: technical,
      Reliability: reliability,
    };
  });

  const hasData = chartData.length > 0;

  return (
    <div className="rounded-3xl p-8 relative overflow-hidden border border-[var(--color-coral-200)]/60 shadow-[0_8px_32px_-12px_rgba(253,133,102,0.15)] premium-glass-card">
      {/* Richer peach ambient glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-coral)]/18 blur-[60px] rounded-full -mr-8 -mt-8 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-sky)]/12 blur-[50px] rounded-full -ml-8 -mb-8 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-coral-100)]/25 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-[var(--fg-primary)] tracking-tight uppercase">Growth Trajectory</h3>
            <p className="text-[11px] font-bold tracking-widest text-[var(--fg-muted)] uppercase mt-1">Skill evolution over time</p>
          </div>
          {hasData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-coral)]/10 rounded-full border border-[var(--color-coral)]/20">
              <Sparkles size={12} className="text-[var(--color-coral)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-coral)]">{snapshots.length} Snapshots</span>
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white/50 rounded-2xl border border-dashed border-[var(--border)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ui-primary-50)] flex items-center justify-center mb-4 shadow-inner">
              <TrendingUp size={28} className="text-[var(--fg-muted)] opacity-30" />
            </div>
            <p className="text-sm font-bold text-[var(--fg-muted)]">Complete challenges to see growth</p>
            <p className="text-[11px] font-medium text-[var(--fg-muted)] opacity-60 mt-1">Your DNA trajectory will appear here</p>
          </div>
        ) : (
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={280}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="overallArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FD8566" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FD8566" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="technicalArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#133B6C" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#133B6C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(19, 59, 108, 0.08)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#133B6C", fontSize: 11, fontWeight: 800 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: "#133B6C", fontSize: 10, fontWeight: 800 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-5}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(253, 133, 102, 0.15)', strokeWidth: 2, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="rounded-2xl p-4 text-[11px] shadow-2xl border border-white/40 animate-in fade-in zoom-in duration-200" style={{ background: "rgba(255, 255, 255, 0.92)", backdropFilter: "blur(20px)" }}>
                        <p className="font-black text-[var(--color-navy)] uppercase tracking-wider mb-2">Snapshot {label}</p>
                        <div className="space-y-1.5">
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between gap-6">
                              <span className="font-bold text-[var(--fg-muted)] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                              </span>
                              <span className="font-black text-[var(--fg-primary)]">{Number(entry.value).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  iconType="circle"
                  iconSize={8}
                />

                {/* Area fills for depth */}
                <Area 
                  type="monotone" 
                  dataKey="Overall" 
                  fill="url(#overallArea)" 
                  stroke="none"
                />
                <Area 
                  type="monotone" 
                  dataKey="Technical" 
                  fill="url(#technicalArea)" 
                  stroke="none"
                />

                <Line 
                  type="monotone" 
                  dataKey="Overall" 
                  stroke="#FD8566" 
                  strokeWidth={4} 
                  dot={{ r: 6, strokeWidth: 3, fill: 'white', stroke: '#FD8566' }} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#FD8566' }}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
                <Line 
                  type="monotone" 
                  dataKey="Technical" 
                  stroke="#133B6C" 
                  strokeWidth={3} 
                  strokeDasharray="6 4"
                  dot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: '#133B6C' }} 
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#133B6C' }}
                  animationDuration={2000}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
                <Line 
                  type="monotone" 
                  dataKey="Reliability" 
                  stroke="#5F90D4" 
                  strokeWidth={3} 
                  strokeDasharray="3 3"
                  dot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: '#5F90D4' }} 
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#5F90D4' }}
                  animationDuration={2000}
                  animationEasing="ease-out"
                  animationBegin={600}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats row when data exists */}
        {hasData && (
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[var(--border)]">
            {[
              { label: "Latest Overall", value: chartData[chartData.length - 1]?.Overall?.toFixed(1) || "0.0", color: "text-[var(--color-coral)]", bg: "bg-[var(--color-coral)]/10" },
              { label: "Peak Technical", value: Math.max(...chartData.map(d => d.Technical)).toFixed(1), color: "text-[var(--color-navy)]", bg: "bg-[var(--color-navy)]/10" },
              { label: "Avg Reliability", value: (chartData.reduce((a, b) => a + b.Reliability, 0) / chartData.length).toFixed(1), color: "text-[var(--color-sky)]", bg: "bg-[var(--color-sky)]/10" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-white/50 border border-white/60">
                <p className={`text-2xl font-black ${stat.color} leading-none`}>{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--fg-muted)] mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}