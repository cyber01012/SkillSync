import React from "react";
import { authApi, oauthApi } from '@/api/auth';
import { passwordApi } from '@/api/dashboard';
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./form/LoginForm";
import SignupForm from "./form/SignupForm";
import ForgotWindow from "./ForgotWindow";

export default function AuthLayout({
  mode = "login",
  setMode,
  onGoogleAuth,
  appLogoSrc = "/logo.png",
  appName = "SkillmatriX",
}) {
  const isLogin = mode === "login";
  const isSignup = mode === "signup";

  const formOnLeft = isSignup;
  const overlayOnLeft = isLogin;

  const overlayVariants = {
    initial: (login) => ({ left: login ? "100%" : "-50%", opacity: 1 }),
    animate: (login) => ({
      left: login ? "0%" : "50%",
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
    exit: (login) => ({
      left: login ? "-50%" : "100%",
      opacity: 1,
      transition: { duration: 0.35, ease: "easeIn" },
    }),
  };

async function handleLogin({ email, password }) {
  try {
    const data = await authApi.login({ email, password });
    if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
    if (data?.sessionId) localStorage.setItem("session_id", data.sessionId);
    localStorage.setItem("sessionActive", String(data.sessionActive ?? true));
    window.location.href = "/dashboard";
  } catch (err) {
    const backendMsg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      (err?.response?.status === 401 ? "Your email or password is incorrect" : null) ||
      err?.message ||
      "Login failed, please try again.";
    throw new Error(backendMsg);
  }
}

async function handleSignup(payload) {
  try {
    await authApi.signup(payload);
    setMode?.("login");
  } catch (err) {
    console.error("Signup failed:", err?.message || err);
  }
}

  return (
    <div className="relative w-full h-full">
      {/* Grid: spacer + form column */}
      <div className="grid grid-cols-2 w-full h-full relative">
        {/* Spacer — order flips based on desired form side */}
        <div className={formOnLeft ? "order-2" : "order-1"} />

        {/* FORM COLUMN — order flips */}
        <div
          className={(formOnLeft ? "order-1" : "order-2") + " relative h-full p-8 overflow-y-auto z-30"}
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          <div className="w-full max-w-sm mx-auto">
            

{mode === "login" && (
  <LoginForm
    onSubmit={handleLogin}
    onForgot={() => setMode("forgot")}
    onGoogle={() => oauthApi.startGoogle()}
    onSwitch={() => setMode("signup")}
    appLogoSrc={appLogoSrc}
    appName={appName}
  />
)}

{mode === "signup" && (
  <SignupForm
    onSubmit={handleSignup}
    onGoogle={() => oauthApi.startGoogle()}
    onSwitch={() => setMode("login")}
    appLogoSrc={appLogoSrc}
    appName={appName}
  />
)}
          </div>
        </div>
      </div>

      {/* WELCOME OVERLAY (only for login/signup) */}
      <motion.div
        custom={overlayOnLeft}
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`
          absolute top-0 bottom-0 w-1/2 z-10 pointer-events-none
          bg-gradient-to-br from-[#6be7cf] via-[#7cbddc] to-[#adb6e5]
          ${overlayOnLeft ? "rounded-r-2xl border-r border-white/30" : "rounded-l-2xl border-l border-white/30"}
          backdrop-blur-xl
        `}
        style={{ boxShadow: "0 10px 26px rgba(124,189,220,0.15)" }}
      >
        <div className="absolute inset-0 bg-white/24 pointer-events-none rounded-inherit" />
        <div className="h-full w-full flex items-center justify-center">
          <div className="px-10 text-center select-none max-w-md">
            {/* LOGO + name */}
            <div className="mx-auto -mt-2 mb-2 flex items-center justify-center">
              <motion.img
                src={appLogoSrc}
                alt={`${appName} logo`}
                className="h-[72px] w-[72px] rounded-md object-contain"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-sm sm:text-base font-semibold text-[#2A2771]/90 mb-3">{appName}</p>

            <h2 className="mt-2 text-2xl sm:text-2xl font-bold tracking-wide text-[#2A2771] whitespace-nowrap inline">
              {isLogin ? "Welcome back to" : "Create your"}
              <span className="text-[#26B291]">
                {"\u00A0"}{appName}
              </span>
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#2A2771]/70">
              Professional, secure & modern authentication experience.
            </p>

            {/* CTA block */}
            <div className="mt-6 mx-auto w-full pointer-events-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
                <h3 className="mt-1 text-sm sm:text-base font-semibold text-[#2A2771]">
                  Get your right job and right place
                </h3>
                <p className="mt-1 text-[13px] text-[#2A2771]/80 leading-snug">
                  Discover the best features of {appName}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 opacity-80">
                <span className="inline-block h-px w-10 bg-[#26B291]/35" />
                <span className="inline-block h-px w-20 bg-[#7cbddc]/30" />
                <span className="inline-block h-px w-6 bg-[#26B291]/35" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* === FORGOT PASSWORD WINDOW (center modal) === */}

<AnimatePresence>
  {mode === "forgot" && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md">
        <ForgotWindow
          appLogoSrc={appLogoSrc}
          appName={appName}
          onClose={() => setMode?.("login")}
          onBackToLogin={() => setMode?.("login")}
          onSendOtp={(email) => authApi.sendOtp(email)}
          onResetPassword={async (data) => {
            try {
              await authApi.resetWithOtp(data);
              setMode?.("login");
            } catch (e) {
              throw e;
            }
          }}
        />
      </div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
}
