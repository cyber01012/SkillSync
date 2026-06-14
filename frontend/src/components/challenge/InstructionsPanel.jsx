import React, { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

const DIFFICULTY_STYLES = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100  text-amber-700",
  advanced:     "bg-orange-100 text-orange-700",
  expert:       "bg-red-100    text-red-700",
};

/** Derive hint text from the challenge's preinstalled packages / language. */
function deriveHint(challenge) {
  const pkgs  = challenge.preinstalled_packages || [];
  const lang  = (challenge.language || "").toLowerCase();
  const hints = [];

  if (pkgs.includes("bcrypt"))      hints.push("Use bcrypt.hashpw() for password hashing.");
  if (pkgs.includes("python-jose")) hints.push("Use python-jose for JWT generation.");
  if (pkgs.includes("fastapi"))     hints.push("Raise HTTPException for error responses.");
  if (lang === "javascript" || lang === "typescript") {
    hints.push("Use jsonwebtoken for JWT and bcryptjs for hashing.");
  }
  if (pkgs.includes("pytest") || pkgs.includes("httpx")) {
    hints.push("Run pytest to check your implementation.");
  }
  if (hints.length === 0) hints.push("Read the test cases carefully before coding.");
  return hints;
}

/** Build requirement bullets from test_cases + starter_code hints. */
function deriveRequirements(challenge) {
  const reqs = [];

  // Pull from test_cases names
  (challenge.test_cases || []).forEach((tc) => {
    const name = tc.name || "";
    if (name.includes("register"))   reqs.push("Implement the /register endpoint");
    if (name.includes("hash"))       reqs.push("Hash passwords before storing them");
    if (name.includes("jwt") || name.includes("token")) reqs.push("Return a JWT token on success");
    if (name.includes("login"))      reqs.push("Implement the /login endpoint");
    if (name.includes("invalid"))    reqs.push("Handle invalid input gracefully");
    if (name.includes("duplicate"))  reqs.push("Reject duplicate registrations");
  });

  // De-duplicate
  const seen = new Set();
  const unique = reqs.filter((r) => {
    if (seen.has(r)) return false;
    seen.add(r);
    return true;
  });

  // Fallback
  if (unique.length === 0) {
    unique.push("Implement all required endpoints");
    unique.push("Handle errors gracefully");
    unique.push("Follow the starter code structure");
  }

  return unique;
}

export default function InstructionsPanel({ challenge }) {
  const [hintsOpen, setHintsOpen] = useState(false);
  if (!challenge) return null;

  const requirements = deriveRequirements(challenge);
  const hints        = deriveHint(challenge);

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
            DIFFICULTY_STYLES[challenge.difficulty] || "bg-[var(--muted)] text-[var(--fg-secondary)]"
          }`}
        >
          {challenge.difficulty}
        </span>
        <span className="text-xs text-[var(--fg-muted)]">
          {challenge.time_limit_minutes} min limit
        </span>
        {challenge.language && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--fg-secondary)] capitalize">
            {challenge.language}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-bold text-[var(--fg-primary)] mb-1">Instructions</h4>

      {/* Description */}
      <p className="text-sm text-[var(--fg-secondary)] mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Requirements from test cases */}
      <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">
        Requirements
      </h5>
      <ul className="text-sm text-[var(--fg-secondary)] space-y-1 list-disc pl-4 mb-4">
        {requirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>

      {/* Collapsible Hints */}
      <button
        type="button"
        onClick={() => setHintsOpen(!hintsOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--fg-primary)] hover:text-[var(--fg-secondary)] transition-colors"
      >
        <Lightbulb size={14} />
        Hints {hintsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {hintsOpen && (
        <ul className="mt-2 p-3 rounded-lg bg-[#E8F0F8] text-sm text-[var(--fg-secondary)] space-y-1 list-disc pl-6">
          {hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
