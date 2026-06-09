import React, { useEffect, useState } from "react";
import SmartInput, { MailIcon, LockIcon } from "../ui/SmartInput.jsx";

export default function LoginForm({
  appLogoSrc = "/images/logo.png",
  appName = "SkillSync",
  onSubmit,
  onSwitch,
  onForgot,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem("auth:remember");
      const em = localStorage.getItem("auth:email");
      if (r === "1" && em) {
        setRemember(true);
        setEmail(em);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (remember) {
        localStorage.setItem("auth:remember", "1");
        localStorage.setItem("auth:email", email);
      } else {
        localStorage.removeItem("auth:remember");
        localStorage.removeItem("auth:email");
      }

      if (!onSubmit) {
        throw new Error("Login handler not wired.");
      }

      await onSubmit({ email, password });
    } catch (err) {
      const backendMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? "Your email or password is incorrect" : null) ||
        err?.message ||
        "Login failed";
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  }

  const emailStatus = email ? (/\S+@\S+\.\S+/.test(email) ? "valid" : "invalid") : "idle";
  const pwdStatus = password ? (password.length >= 6 ? "valid" : "invalid") : "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <img src={appLogoSrc} alt={`${appName} logo`} className="w-12 h-12 rounded-md object-contain" />
        <span className="text-sm font-semibold text-[#133B6C]/90">{appName}</span>
      </div>
      <h2 className="text-xl font-semibold text-[#133B6C] text-center">Sign in</h2>

      <SmartInput
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        icon={MailIcon}
        status={emailStatus}
        message={email && !/\S+@\S+\.\S+/.test(email) ? "Please enter a valid email" : ""}
      />
      <SmartInput
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        icon={LockIcon}
        status={pwdStatus}
        message={password && password.length < 6 ? "At least 6 characters" : ""}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[#4A6582] cursor-pointer">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#FD8566]" />
          Remember me
        </label>
        <button type="button" onClick={onForgot} className="text-[#FD8566] hover:underline font-semibold">
          Forgot?
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl bg-[#133B6C] text-white py-2.5 font-medium shadow-sm hover:bg-[#0D2847] transition-colors ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="text-xs text-[#4A6582] text-center">
        Don't have an account?{" "}
        <button type="button" className="underline underline-offset-2 text-[#FD8566] font-semibold" onClick={onSwitch}>
          Sign up
        </button>
      </div>
    </form>
  );
}