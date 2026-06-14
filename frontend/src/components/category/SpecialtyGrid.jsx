import React from "react";
import { CheckCircle } from "lucide-react";

export default function SpecialtyGrid({ specialties = [], selected, onSelect }) {
  if (!specialties.length) {
    return <p className="text-[var(--fg-muted)]">No specialties available for this domain.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {specialties.map((s) => (
        <button
          key={s.category_id}
          type="button"
          onClick={() => onSelect(s.category_id)}
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            selected === s.category_id
              ? "border-[var(--ui-primary)] bg-[var(--ui-primary-50)]"
              : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--ui-primary)]"
          }`}
        >
          <span className="font-semibold text-[var(--fg-primary)]">{s.display_name}</span>
          {selected === s.category_id && (
            <CheckCircle size={20} className="text-[var(--ui-primary)]" />
          )}
        </button>
      ))}
    </div>
  );
}
