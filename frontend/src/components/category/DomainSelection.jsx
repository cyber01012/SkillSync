import React from "react";
import { Code, Server, Layers } from "lucide-react";

const DOMAINS = [
  { id: "frontend", label: "Frontend", icon: Code, desc: "React, Vue, CSS/Tailwind" },
  { id: "backend", label: "Backend", icon: Server, desc: "Python, Java, Node.js" },
  { id: "fullstack", label: "Full Stack", icon: Layers, desc: "MERN, Python + React" },
];

export default function DomainSelection({ domains, selected, onSelect }) {
  const available = DOMAINS.filter((d) => domains[d.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {available.map(({ id, label, icon: Icon, desc }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`p-6 rounded-2xl border text-left transition-all ${
            selected === id
              ? "border-[var(--ui-primary)] bg-[var(--ui-primary-50)] shadow-md"
              : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--ui-primary)]"
          }`}
        >
          <Icon size={28} className="text-[var(--ui-primary)] mb-3" />
          <h3 className="font-bold text-[var(--fg-primary)]">{label}</h3>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{desc}</p>
        </button>
      ))}
    </div>
  );
}
