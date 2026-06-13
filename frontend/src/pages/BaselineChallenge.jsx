import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { baselineApi } from "../api/baseline";
import { ArrowLeft, Clock, Send } from "lucide-react";

export default function BaselineChallenge() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [output, setOutput] = useState("");
  const stepsRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    baselineApi.getChallenges().then((data) => {
      setChallenge(data[0]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  function startChallenge() {
    setStarted(true);
    startTimeRef.current = Date.now();
    setTimeLeft(challenge.time_limit_minutes * 60);
    logStep("start", "Challenge started");
  }

  function logStep(action, content) {
    stepsRef.current.push({
      timestamp: new Date().toISOString(),
      action,
      content,
    });
  }

  async function submitChallenge() {
    setSubmitting(true);
    logStep("submit", "User submitted solution");

    const duration = Date.now() - startTimeRef.current;

    try {
      await baselineApi.submitChallenge({
        challenge_id: challenge.challenge_id,
        steps: stepsRef.current,
        duration_ms: duration,
        output_text: output,
      });
      navigate("/dashboard/freelancer");
    } catch (err) {
      alert("Submission failed: " + (err?.response?.data?.detail || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-[#133B6C] font-bold">Loading challenge...</div>
      </div>
    );
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2D5CF] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/freelancer")}
          className="flex items-center gap-2 text-[#133B6C] font-semibold hover:text-[#FD8566] transition"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        {started && (
          <div className="flex items-center gap-2 text-[#FD8566] font-black">
            <Clock size={18} />
            {mm}:{ss}
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {!started ? (
          <div className="bg-white rounded-2xl border border-[#E2D5CF] p-8 shadow-sm">
            <h2 className="text-2xl font-black text-[#133B6C] mb-2">
              {challenge.title}
            </h2>
            <p className="text-[#4A6582] mb-6">{challenge.description}</p>
            <div className="bg-[#FFF8F5] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#4A6582] font-semibold mb-2">Instructions:</p>
              <p className="text-sm text-[#8BA3BE]">{challenge.instructions}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#8BA3BE] mb-6">
              <span>⏱️ {challenge.time_limit_minutes} minutes</span>
              <span>📝 Baseline Verification</span>
            </div>
            <button
              onClick={startChallenge}
              className="w-full py-3 bg-[#133B6C] text-white rounded-xl font-bold hover:bg-[#0D2847] transition"
            >
              Start Challenge
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2D5CF] p-6 shadow-sm">
              <h3 className="text-lg font-black text-[#133B6C] mb-4">
                {challenge.title}
              </h3>
              <textarea
                value={output}
                onChange={(e) => {
                  setOutput(e.target.value);
                  logStep("type", `Typed ${e.target.value.length} chars`);
                }}
                placeholder="Type your solution here..."
                className="w-full h-64 p-4 rounded-xl border border-[#E2D5CF] bg-[#FFF8F5] text-sm text-[#133B6C] focus:border-[#FD8566] focus:ring-2 focus:ring-[#FD8566]/20 outline-none resize-none"
              />
            </div>

            <button
              onClick={submitChallenge}
              disabled={submitting || timeLeft === 0}
              className="w-full py-3 bg-[#FD8566] text-white rounded-xl font-bold hover:bg-[#E86A4A] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {submitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}