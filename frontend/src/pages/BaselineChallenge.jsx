import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { baselineApi } from "../api/baseline";
import { profileApi } from "../api/profile";
import FileTabs from "../components/challenge/FileTabs";
import MonacoIDE from "../components/challenge/MonacoIDE";
import InstructionsPanel from "../components/challenge/InstructionsPanel";
import TestPanel from "../components/challenge/TestPanel";
import Timer from "../components/challenge/Timer";
import ActionBar from "../components/challenge/ActionBar";
import { ArrowLeft } from "lucide-react";

/** Build a realistic test file preview from challenge test_cases */
function buildTestFileContent(challenge) {
  if (!challenge?.test_cases?.length) {
    return `# Auto-generated test file (read-only preview)\nimport pytest\n\n# Tests will run against your submission\n`;
  }

  const lang = (challenge.language || "python").toLowerCase();

  if (lang === "python") {
    const lines = [
      `# Auto-generated test file (read-only preview)`,
      `# Tests will run against your ${challenge.title || "submission"}`,
      `import pytest`,
      ``,
    ];
    challenge.test_cases.forEach((tc) => {
      lines.push(`def ${tc.name}():`);
      if (tc.validation) {
        lines.push(`    # Validates: ${tc.validation}`);
      }
      if (tc.input) {
        lines.push(`    # Input: ${JSON.stringify(tc.input)}`);
      }
      if (tc.expected_status) {
        lines.push(`    # Expected status: ${tc.expected_status}`);
      }
      lines.push(`    pass  # implementation hidden — runs against your code`);
      lines.push(``);
    });
    return lines.join("\n");
  }

  // JavaScript / TypeScript
  const lines = [
    `// Auto-generated test file (read-only preview)`,
    `// Tests will run against your ${challenge.title || "submission"}`,
    ``,
  ];
  challenge.test_cases.forEach((tc) => {
    lines.push(`test("${tc.name}", async () => {`);
    if (tc.validation) lines.push(`  // Validates: ${tc.validation}`);
    if (tc.input)      lines.push(`  // Input: ${JSON.stringify(tc.input)}`);
    lines.push(`  // implementation hidden`);
    lines.push(`});`);
    lines.push(``);
  });
  return lines.join("\n");
}

export default function BaselineChallenge() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState("main.py");
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const startTimeRef = useRef(null);
  const cursorRef = useRef({ line: 1, col: 1 });
  const intervalRef = useRef(null);

  const recordStep = useCallback(
    (action, content = "") => {
      if (!sessionId) return;
      baselineApi.step({
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        action,
        content,
        file: activeFile,
        cursor_line: cursorRef.current.line,
        cursor_col: cursorRef.current.col,
      }).catch(() => {});
    },
    [sessionId, activeFile]
  );

  useEffect(() => {
    async function init() {
      try {
        // 1. Check profile status — redirect if no category selected
        const status = await profileApi.getStatus();
        if (!status.has_category) {
          navigate("/category-selection");
          return;
        }

        // 2. Fetch next challenge
        const ch = await baselineApi.getChallenge();
        setChallenge(ch);

        // 3. Build file map from challenge data
        const lang = ch.language || "python";
        const mainFileName = lang === "python" ? "main.py"
          : lang === "javascript" ? "main.js"
          : lang === "typescript" ? "main.ts"
          : `main.${lang}`;

        const testFileName = lang === "python" ? "test_main.py"
          : lang === "javascript" ? "main.test.js"
          : lang === "typescript" ? "main.test.ts"
          : `test_main.${lang}`;

        const testContent = buildTestFileContent(ch);

        setFiles({
          [mainFileName]: ch.starter_code || "",
          [testFileName]: testContent,
        });
        setActiveFile(mainFileName);

        // 4. Only start a session if challenges remain
        if (!ch.all_completed) {
          const session = await baselineApi.start(ch.challenge_id);
          setSessionId(session.session_id);
          startTimeRef.current = Date.now();
          setStarted(true);
        }
      } catch (err) {
        console.error("Failed to initialise baseline challenge:", err);
        setError(
          err?.response?.data?.detail ||
          "Failed to load challenge. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [navigate]);

  // Proof-of-work: record on actual code changes (debounced 3s), not every 2s
  const lastRecordedRef = useRef("");
  const debounceTimerRef = useRef(null);

  const debouncedRecordStep = useCallback(
    (content) => {
      if (!sessionId || content === lastRecordedRef.current) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        recordStep("code_write", content.slice(-300));
        lastRecordedRef.current = content;
      }, 3000);
    },
    [sessionId, recordStep]
  );

  // Record on tab visibility changes
  useEffect(() => {
    if (!started || !sessionId) return;
    function onVisibility() {
      if (document.hidden) recordStep("pause", "tab hidden");
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [started, sessionId, recordStep]);

  async function handleRun() {
    if (!sessionId) return;
    setRunning(true);
    recordStep("test_run", "Running tests");
    const mainKey = Object.keys(files).find((f) => !f.startsWith("test")) || "main.py";
    try {
      const result = await baselineApi.run({
        session_id: sessionId,
        code: files[mainKey],
        file: mainKey,
      });
      setTestResults(result);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = detail || err?.message || "Run failed — check console for details";
      console.error("Run test error:", err);
      setTestResults({
        passed: 0,
        failed: 1,
        total: 1,
        details: [{ name: "execution_error", status: "failed", error: msg }],
        stdout: "",
        stderr: msg,
      });
    } finally {
      setRunning(false);
    }
  }

  function handleSave() {
    const mainKey = Object.keys(files).find((f) => !f.startsWith("test")) || "main.py";
    recordStep("save_draft", files[mainKey]?.slice(0, 100));
  }

  async function handleSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    setShowConfirm(false);
    recordStep("submit", "Final submission");

    const duration = Date.now() - (startTimeRef.current || Date.now());
    const timeLimitMs = (challenge?.time_limit_minutes || 45) * 60 * 1000;
    const onTime = duration <= timeLimitMs;
    const overtimeMin = onTime ? 0 : Math.ceil((duration - timeLimitMs) / 60000);
    const mainKey = Object.keys(files).find((f) => !f.startsWith("test")) || "main.py";

    try {
      await baselineApi.submit({
        session_id: sessionId,
        code: files[mainKey],
        duration_ms: duration,
        on_time: onTime,
        overtime_minutes: overtimeMin,
      });
      setProcessing(true);
      pollDna(sessionId);
    } catch (err) {
      alert(err?.response?.data?.detail || "Submit failed");
      setSubmitting(false);
    }
  }

  // BaselineChallenge.jsx mein pollDna function:
async function pollDna(sid) {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const status = await baselineApi.getSessionStatus(sid);
      if (status.dna_calculated) {
        // Hard redirect instead of navigate
        window.location.href = "/dashboard/freelancer";
        return;
      }
    } catch {
      /* retry */
    }
  }
  // Fallback: redirect anyway after timeout
  window.location.href = "/dashboard/freelancer";
}

  function handleExpire() {
    if (!submitting) handleSubmit();
  }

  function handleFileSwitch(name) {
    setActiveFile(name);
    recordStep("file_switch", name);
  }

  function handleNewFile() {
    const lang = challenge?.language || "python";
    const ext = lang === "javascript" ? "js" : lang === "typescript" ? "ts" : "py";
    const name = `file_${Object.keys(files).length}.${ext}`;
    setFiles({ ...files, [name]: "# New file\n" });
    setActiveFile(name);
  }

  /* ── States ───────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#133B6C] border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-[var(--fg-primary)]">Loading challenge…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-[var(--bg-base)]">
        <p className="text-red-600 font-semibold text-center max-w-md">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
        <div className="w-12 h-12 border-4 border-[#133B6C] border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-[var(--fg-primary)]">AI Scoring in progress…</p>
        <p className="text-sm text-[var(--fg-muted)]">Your Skill DNA is being calculated</p>
      </div>
    );
  }

  if (challenge?.all_completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-[var(--bg-base)]">
        <h2 className="text-xl font-black text-[var(--fg-primary)]">All challenges completed! 🎉</h2>
        <p className="text-[var(--fg-muted)]">You can retake from the dashboard for a higher difficulty.</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/freelancer")}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const testFileKey = Object.keys(files).find((f) => f.startsWith("test") || f.includes(".test."));

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-base)]">
      {/* ── Top Bar ── */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => navigate("/dashboard/freelancer")}
          className="flex items-center gap-2 text-[var(--fg-primary)] font-semibold hover:text-[var(--fg-secondary)] transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center flex-1 px-4">
          <h2 className="font-bold text-[var(--fg-primary)] truncate">{challenge?.title}</h2>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{ background: "#E8F0F8", color: "#133B6C" }}
            >
              {challenge?.category}
            </span>
            <span className="text-xs text-[var(--fg-muted)] capitalize">
              {challenge?.difficulty}
            </span>
          </div>
        </div>

        <Timer
          totalSeconds={(challenge?.time_limit_minutes || 45) * 60}
          started={started}
          onExpire={handleExpire}
        />
      </header>

      {/* ── Editor Area ── */}
      <div className="flex flex-1 min-h-0">
        <FileTabs
          files={files}
          activeFile={activeFile}
          onSwitch={handleFileSwitch}
          onNewFile={handleNewFile}
        />
        <div className="flex-1 min-w-0">
          <MonacoIDE
            value={files[activeFile] || ""}
            onChange={(v) => {
              setFiles((prev) => ({ ...prev, [activeFile]: v || "" }));
              debouncedRecordStep(v || "");
            }}
            language={challenge?.language || "python"}
            readOnly={activeFile === testFileKey}
            onCursorChange={(c) => {
              cursorRef.current = c;
            }}
          />
        </div>
      </div>

      {/* ── Bottom Panels: Instructions + Test Results ── */}
      <div
        className="grid grid-cols-2 border-t h-52 flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="border-r overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <InstructionsPanel challenge={challenge} />
        </div>
        <TestPanel results={testResults} loading={running} />
      </div>

      {/* ── Action Bar ── */}
      <ActionBar
        onRun={handleRun}
        onSave={handleSave}
        onSubmit={() => setShowConfirm(true)}
        running={running}
        submitting={submitting}
      />

      {/* ── Submit Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl border p-6 max-w-md w-full shadow-2xl"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="font-black text-[var(--fg-primary)] mb-2 text-lg">Submit Solution?</h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6 leading-relaxed">
              This will end the challenge. You cannot retake until 24 hours later.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-coral flex-1"
              >
                Yes, Submit
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}