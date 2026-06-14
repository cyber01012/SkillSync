import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function Timer({ totalSeconds, onExpire, started }) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, onExpire]); // ✅ removed `remaining` — was restarting interval every second

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const isLow = remaining <= 300;

  return (
    <div
      className={`flex items-center gap-2 font-bold ${
        isLow ? "text-red-500 animate-pulse" : "text-[var(--fg-primary)]"
      }`}
    >
      {isLow ? <AlertTriangle size={18} /> : <Clock size={18} />}
      {mm}:{ss}
    </div>
  );
}
