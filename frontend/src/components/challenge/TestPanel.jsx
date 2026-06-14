import React, { useState } from "react";
import { CheckCircle, XCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_ICON = {
  passed: <CheckCircle size={16} className="text-emerald-500" />,
  failed: <XCircle size={16} className="text-red-500" />,
  not_run: <Circle size={16} className="text-[var(--fg-muted)]" />,
};

export default function TestPanel({ results, loading }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <p className="text-sm text-[var(--fg-muted)]">Running tests...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-4 h-full">
        <h4 className="font-bold text-[var(--fg-primary)] mb-2">Test Results</h4>
        <p className="text-sm text-[var(--fg-muted)]">Run tests to see results</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-[var(--fg-primary)]">Test Results</h4>
        <span className="text-xs font-semibold text-[var(--fg-muted)]">
          {results.passed}/{results.total} passed
        </span>
      </div>
      <div className="space-y-2">
        {(results.details || []).map((t) => (
          <div key={t.name} className="rounded-lg border border-[var(--border)] overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === t.name ? null : t.name)}
              className="w-full flex items-center gap-2 p-2 text-left text-sm hover:bg-[var(--muted)]"
            >
              {STATUS_ICON[t.status] || STATUS_ICON.not_run}
              <span className="flex-1 font-medium text-[var(--fg-primary)]">{t.name}</span>
              {t.duration && (
                <span className="text-xs text-[var(--fg-muted)]">{t.duration}</span>
              )}
              {expanded === t.name ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expanded === t.name && t.error && (
              <div className="px-3 pb-2 text-xs text-red-600 font-mono">{t.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
