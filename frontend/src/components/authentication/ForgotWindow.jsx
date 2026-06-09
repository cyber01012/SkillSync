import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartInput, { MailIcon, LockIcon } from "./ui/SmartInput.jsx";
import { getPasswordStrength } from "./form/PasswordStrength";

const shellGradient = "bg-gradient-to-br from-[#6be7cf] via-[#7cbddc] to-[#adb6e5]";        
const cardCls = `rounded-2xl bg-white/50 backdrop-blur-md shadow-xl border border-white/40 px-6 sm:px-7 py-6 sm:py-7`;

const stepVariants = {
  initial: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },  
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }),
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.94, y: 18 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.94, y: 18, transition: { duration: 0.25, ease: "easeIn" } }, 
};

export default function ForgotWindow({
  appLogoSrc = "/images/logo.png",
  appName = "SkillSync",
  onClose,
  onBackToLogin,
  onSendOtp,
  onVerifyOtp,
  onResetPassword,
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showClose, setShowClose] = useState(false);
  const closeTimer = useRef(null);

  const revealClose = () => {
    setShowClose(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShowClose(false), 1200);
  };

  const OTP_WINDOW_SECS = 15 * 60;
  const [secsLeft, setSecsLeft] = useState(OTP_WINDOW_SECS);
  const timerRef = useRef(null);

  const mmss = useMemo(() => {
    const m = String(Math.floor(secsLeft / 60)).padStart(2, "0");
    const s = String(secsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secsLeft]);

  useEffect(() => {
    if (step === 1) {
      clearInterval(timerRef.current);
      setSecsLeft(OTP_WINDOW_SECS);
      timerRef.current = setInterval(() => {
        setSecsLeft((t) => (t <= 1 ? 0 : t - 1));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setMsg({ type: "", text: "" });
  };

  const RESEND_COOLDOWN_SECS = 60 * 60;
  const normalizeEmail = (e) => (e || "").trim().toLowerCase();
  const [resendMeta, setResendMeta] = useState({ count: 0, lastResendAt: null });
  const [resendLeft, setResendLeft] = useState(0);

  const loadMeta = (em) => {
    if (!em) return { count: 0, lastResendAt: null };
    try {
      const raw = localStorage.getItem(`fp_resend_meta:${em}`);
      return raw ? JSON.parse(raw) : { count: 0, lastResendAt: null };
    } catch { return { count: 0, lastResendAt: null }; }
  };

  const saveMeta = (em, meta) => { if (em) localStorage.setItem(`fp_resend_meta:${em}`, JSON.stringify(meta)); };

  const normEmail = normalizeEmail(email);
  useEffect(() => { setResendMeta(loadMeta(normEmail)); }, [normEmail]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!normEmail || resendMeta.count < 2 || !resendMeta.lastResendAt) {
        setResendLeft(0); return;
      }
      const elapsed = Math.floor((Date.now() - resendMeta.lastResendAt) / 1000);
      setResendLeft(Math.max(RESEND_COOLDOWN_SECS - elapsed, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [normEmail, resendMeta]);

  const fmtHMS = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setMsg({ type: "error", text: "Please enter a valid email." }); return; }
      setLoading(true);
      try {
        await onSendOtp?.(email);
        setMsg({ type: "success", text: "OTP sent. Expires in 15 minutes." });
        const current = loadMeta(normEmail);
        const updated = { ...current, count: Math.max(1, (current.count || 0) + 1) };       
        setResendMeta(updated); saveMeta(normEmail, updated);
        go(1);
      } catch (e) { setMsg({ type: "error", text: e?.message ?? "Failed to send OTP." }); } finally { setLoading(false); }
    } else if (step === 1) {
      if (!otp || otp.length < 4) { setMsg({ type: "error", text: "Please enter the OTP code." }); return; }
      if (secsLeft === 0) { setMsg({ type: "error", text: "OTP expired. Please resend." }); return; }
      setLoading(true);
      try {
        await onVerifyOtp?.({ email, otp });
        setMsg({ type: "success", text: "OTP verified." });
        go(2);
      } catch (e) { setMsg({ type: "error", text: e?.message ?? "Invalid OTP." }); } finally { setLoading(false); }
    }
  };

  const handleBack = () => { if (step === 1) go(0); else if (step === 2) go(1); };

  const resendOtp = async () => {
    const current = loadMeta(normEmail);
    if (current.count >= 2 && current.lastResendAt && (RESEND_COOLDOWN_SECS - Math.floor((Date.now() - current.lastResendAt) / 1000)) > 0) {
      setMsg({ type: "error", text: "Sorry, try after an hour." }); return;
    }
    setLoading(true);
    try {
      await onSendOtp?.(email);
      const updated = current.count < 2 ? { ...current, count: current.count + 1 } : { ...current, count: current.count + 1, lastResendAt: Date.now() };
      setMsg({ type: "success", text: current.count < 2 ? "New OTP sent." : "New OTP sent. Cooldown: 1 hour." });
      setResendMeta(updated); saveMeta(normEmail, updated);
      setSecsLeft(OTP_WINDOW_SECS);
    } catch (e) { setMsg({ type: "error", text: e?.message ?? "Failed to resend OTP." }); } finally { setLoading(false); }
  };

  const updatePassword = async () => {
    if (!newPwd || newPwd.length < 8) { setMsg({ type: "error", text: "Password must be at least 8 characters." }); return; }
    if (newPwd !== confirmPwd) { setMsg({ type: "error", text: "Passwords do not match." }); return; }
    setLoading(true);
    try {
      await onResetPassword?.({ email, otp, newPassword: newPwd });
      setMsg({ type: "success", text: "Password updated. You can log in now." });
    } catch (e) { setMsg({ type: "error", text: e?.message ?? "Failed to update password." }); } finally { setLoading(false); }
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[12px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center" onMouseMove={revealClose}>
        <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" className={`relative w-[94%] sm:w-[420px] md:w-[480px] bg-gradient-to-br from-[#133B6C] via-[#5F90D4] to-[#FD8566] rounded-2xl shadow-2xl overflow-visible`}>
          <button onClick={onClose} className={`absolute -top-3 -right-3 rounded-full bg-white/90 text-[#133B6C] shadow-md transition ${showClose ? "opacity-100" : "opacity-0"} hover:scale-105`} style={{ padding: "6px 8px" }}>✕</button>
          <div className="px-6 pb-6 pt-3">
            <div className={cardCls}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src={appLogoSrc} alt="logo" className="h-9 w-9 rounded-md object-contain" />
                <span className="text-lg sm:text-xl font-semibold text-[#133B6C]">{appName}</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="text-2xl sm:text-[28px] font-semibold text-[#133B6C] tracking-tight">Reset password</div>
                <button type="button" onClick={handleBack} disabled={step === 0} className={`text-sm font-semibold ${step === 0 ? "text-[#133B6C]/40" : "text-[#133B6C]/80 hover:text-[#133B6C]"}`}>← Back</button>
              </div>
              {msg.text && <div className={`mb-3 text-sm rounded-lg px-3 py-2 ${msg.type === "error" ? "bg-red-50/70 text-red-700" : "bg-emerald-50/70 text-emerald-700"}`}>{msg.text}</div>}
              <AnimatePresence custom={dir} mode="wait">
                {step === 0 && (
                  <motion.div key="step-email" custom={dir} variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <SmartInput id="fp-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={MailIcon} status={email ? (/^\S+@\S+\.\S+$/.test(email) ? "valid" : "invalid") : "idle"} />
                    <button onClick={handleNext} disabled={loading} className="w-full rounded-xl bg-[#133B6C] text-white font-semibold py-2.5 hover:bg-[#0D2847] transition">{loading ? "Sending..." : "Send OTP"}</button>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="step-otp" custom={dir} variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <SmartInput id="fp-otp" label="OTP Code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} icon={LockIcon} status={otp.length === 6 ? "valid" : otp ? "invalid" : "idle"} />
                    <div className="flex items-center justify-between text-xs text-[#133B6C]/80">
                      <span>Expires in: <span className="font-semibold">{mmss}</span></span>
                      <button onClick={resendOtp} disabled={loading || (resendMeta.count >= 2 && resendLeft > 0)} className="font-semibold hover:underline text-[#FD8566]">{(resendMeta.count >= 2 && resendLeft > 0) ? `Resend in ${fmtHMS(resendLeft)}` : "Resend OTP"}</button>
                    </div>
                    <button onClick={handleNext} disabled={loading || otp.length < 6} className="w-full rounded-xl bg-[#133B6C] text-white font-semibold py-2.5 hover:bg-[#0D2847] transition">{loading ? "Verifying..." : "Verify OTP"}</button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="step-reset" custom={dir} variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <SmartInput id="fp-new-password" label="New Password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} icon={LockIcon} status={newPwd.length >= 8 ? "valid" : newPwd ? "invalid" : "idle"} />
                    <SmartInput id="fp-confirm-password" label="Confirm Password" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} icon={LockIcon} status={confirmPwd ? (confirmPwd === newPwd ? "valid" : "invalid") : "idle"} />
                    <button onClick={updatePassword} disabled={loading} className="w-full rounded-xl bg-[#133B6C] text-white font-semibold py-2.5 hover:bg-[#0D2847] transition">{loading ? "Updating..." : "Update Password"}</button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-4 flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => <div key={i} className={`h-2.5 w-2.5 rounded-full ${i === step ? "bg-[#133B6C]" : "bg-white/70"}`} />)}
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <div className="text-[#133B6C]/80">Remember? <button onClick={onBackToLogin} className="font-semibold text-[#FD8566] hover:underline">Login</button></div>
                <button onClick={handleNext} disabled={step === 2 || loading} className="font-semibold text-[#133B6C] hover:underline">Next →</button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
