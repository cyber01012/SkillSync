import React from "react";
import { Play, Save, Send } from "lucide-react";

export default function ActionBar({ onRun, onSave, onSubmit, running, submitting }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]">
      <button
        type="button"
        onClick={onRun}
        disabled={running}
        className="btn-primary !rounded-xl flex items-center gap-2 !py-2 !px-4"
      >
        <Play size={16} /> {running ? "Running..." : "Run Tests"}
      </button>
      <button
        type="button"
        onClick={onSave}
        className="btn-outline !rounded-xl flex items-center gap-2 !py-2 !px-4"
      >
        <Save size={16} /> Save Draft
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="btn-coral !rounded-xl flex items-center gap-2 !py-2 !px-4 ml-auto"
      >
        <Send size={16} /> {submitting ? "Submitting..." : "Submit Solution"}
      </button>
    </div>
  );
}
