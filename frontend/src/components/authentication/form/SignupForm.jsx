import React, { useEffect, useState } from "react";
import SmartInput, { MailIcon, UserIcon, LockIcon } from "../ui/SmartInput.jsx";
import { getPasswordStrength } from "./PasswordStrength";

export default function SignupForm({
  appLogoSrc = "/images/logo.png",
  appName = "SkillSync",
  onSubmit,
  onSwitch,
  onGoogle,
  onCheckUsernameUnique,
}) {
  const [username, setUsername]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");

  const [checkingUser, setCheckingUser] = useState(false);
  const [isUserUnique, setIsUserUnique] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      setIsUserUnique(null);
      if (!username?.trim()) return;
      setCheckingUser(true);
      try {
        const ok = (await onCheckUsernameUnique?.(username.trim())) ?? true;
        if (active) setIsUserUnique(ok);
      } catch {
        if (active) setIsUserUnique(false);
      } finally {
        if (active) setCheckingUser(false);
      }
    };
    const id = setTimeout(check, 450);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [username, onCheckUsernameUnique]);

  const emailStatus    = email ? (/\S+@\S+\.\S+/.test(email) ? "valid" : "invalid") : "idle";
  const pwdStatus      = password ? (password.length >= 6 ? "valid" : "invalid") : "idle";
  const confirmStatus  = confirm ? (confirm === password ? "valid" : "invalid") : "idle";
  const usernameStatus = !username ? "idle" : checkingUser ? "loading" : isUserUnique === false ? "invalid" : "valid";
  const usernameMsg    = isUserUnique === false ? "Username already taken" : "";

  const strength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username?.trim()) { setError("Please enter a username."); return; }
    if (isUserUnique === false) { setError("Username already taken."); return; }
    if (!firstName?.trim() || !lastName?.trim()) { setError("Please fill first name and last name."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (confirm !== password) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await onSubmit?.({
        username: username.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      setError(err?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <img src={appLogoSrc} alt={`${appName} logo`} className="w-12 h-12 rounded-md object-contain" />
        <span className="text-sm font-semibold text-[#133B6C]/90">{appName}</span>
      </div>
      <h2 className="text-xl font-semibold text-[#133B6C] text-center">Create account</h2>

      <div className="grid grid-cols-2 gap-3">
        <SmartInput id="signup-first" label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name" icon={UserIcon} status={firstName ? "valid" : "idle"} />
        <SmartInput id="signup-last" label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name" icon={UserIcon} status={lastName ? "valid" : "idle"} />
      </div>

      <SmartInput id="signup-username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username" icon={UserIcon} status={usernameStatus} message={usernameMsg} />
      <SmartInput id="signup-email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" icon={MailIcon} status={emailStatus}
                  message={email && !/\S+@\S+\.\S+/.test(email) ? "Please enter a valid email" : ""} />
      
      <div className="grid grid-cols-2 gap-3">
        <SmartInput id="signup-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password" icon={LockIcon} status={pwdStatus}
                    message={password && password.length < 6 ? "At least 6 characters" : ""} />
        <SmartInput id="signup-confirm" label="Confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password" icon={LockIcon} status={confirmStatus} />
      </div>

      <StrengthBar label={strength.label} color={strength.color} score={strength.score} />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#133B6C] text-white py-2.5 font-medium shadow-sm hover:bg-[#0D2847] transition-colors"
      >
        {loading ? "Creating..." : "Create account"}
      </button>

      <div className="text-xs text-[#4A6582] text-center">
        Already have an account?{" "}
        <button type="button" className="underline underline-offset-2 text-[#FD8566] font-semibold" onClick={onSwitch}>
          Sign in
        </button>
      </div>
    </form>
  );
}

function StrengthBar({ score, label, color }) {
  const pct = [0, 25, 50, 75, 100][score];
  return (
    <div className="mt-1">
      <div className="h-1.5 w-full rounded bg-black/10 overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1 text-[11px] text-[#4A6582]">{label}</div>
    </div>
  );
}