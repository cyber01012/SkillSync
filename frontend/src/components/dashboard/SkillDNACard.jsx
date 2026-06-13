import React from "react";

const TRAIT_COLORS = {
  Reliability: "#133B6C",
  Creativity: "#FD8566",
  Teamwork: "#5F90D4",
  Communication: "#10B981",
  "Deadline Adherence": "#F59E0B",
  "Technical Accuracy": "#8B5CF6",
};

export default function SkillDNACard({ scores = [] }) {
  const maxScore = 100;

  return (
    <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
      <h3 className="text-lg font-black text-[#133B6C] mb-4">Skill DNA</h3>
      
      <div className="space-y-4">
        {scores.map((trait) => (
          <div key={trait.TraitName}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-[#4A6582]">{trait.TraitName}</span>
              <span className="font-bold text-[#133B6C]">{trait.Score}/100</span>
            </div>
            <div className="h-2.5 w-full bg-[#FFF0EC] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(trait.Score / maxScore) * 100}%`,
                  backgroundColor: TRAIT_COLORS[trait.TraitName] || "#133B6C",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}