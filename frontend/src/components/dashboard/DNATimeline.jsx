import React from "react";

export default function DNATimeline({ snapshots = [] }) {
  if (!snapshots.length) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
        <h3 className="text-lg font-black text-[#133B6C] mb-4">DNA History</h3>
        <p className="text-sm text-[#8BA3BE]">Complete a challenge to see your DNA growth.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
      <h3 className="text-lg font-black text-[#133B6C] mb-4">DNA History</h3>
      
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#133B6C] to-[#FD8566]" />
        
        {snapshots.map((snap, i) => (
          <div key={snap.SnapshotID} className="relative mb-6 last:mb-0">
            <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-[#133B6C] border-2 border-white shadow" />
            <div className="text-xs text-[#8BA3BE] mb-1">
              {new Date(snap.TakenAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-[#4A6582] font-mono bg-[#FFF8F5] rounded-lg p-2">
              {snap.SnapshotData}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}