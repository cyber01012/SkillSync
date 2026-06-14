import React from "react";
import { FileCode, Plus, Lock } from "lucide-react";

export default function FileTabs({ files, activeFile, onSwitch, onNewFile }) {
  // test files are read-only
  const isReadOnly = (name) =>
    name.startsWith("test") || name.includes(".test.");

  return (
    <div
      className="flex flex-col gap-1 p-2 min-w-[150px] flex-shrink-0 border-r overflow-y-auto"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <p
        className="text-xs font-bold uppercase tracking-wider px-2 mb-1"
        style={{ color: "var(--fg-muted)" }}
      >
        Files
      </p>

      {Object.keys(files).map((name) => {
        const isActive  = activeFile === name;
        const readOnly  = isReadOnly(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSwitch(name)}
            title={readOnly ? `${name} (read-only)` : name}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors"
            style={{
              background: isActive ? "#E8F0F8" : "transparent",
              color: isActive ? "#133B6C" : "var(--fg-secondary)",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            <FileCode size={14} style={{ flexShrink: 0 }} />
            <span className="truncate flex-1">{name}</span>
            {readOnly && <Lock size={11} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onNewFile}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm mt-1 transition-colors hover:opacity-80"
        style={{ color: "var(--fg-muted)" }}
        title="Add new file"
      >
        <Plus size={14} />
        New
      </button>
    </div>
  );
}
