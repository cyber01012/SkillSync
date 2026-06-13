import React from "react";
import { useNavigate } from "react-router-dom";
import { authApi, oauthApi } from '@/api/auth';
import { passwordApi } from '@/api/dashboard';
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./form/LoginForm";
import SignupForm from "./form/SignupForm";
import ForgotWindow from "./ForgotWindow";
import RoleSelection from "./RoleSelection";

export default function AuthLayout({
  mode = "login",
  setMode,
  onGoogleAuth,
  appLogoSrc = "/images/logo.png",
  appName = "SkillSync",
}) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = React.useState(null);
  const isLogin = mode === "login";
  const isSignup = mode === "signup";

  const formOnLeft = isSignup;
  const overlayOnLeft = isLogin;

  // Reset role selection if mode changes away from signup
  React.useEffect(() => {
    if (!isSignup) setSelectedRole(null);
  }, [isSignup]);

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

      // Store token and role from backend (snake_case)
      if (data?.access_token) localStorage.setItem("accessToken", data.access_token);
      if (data?.role) localStorage.setItem("role", data.role);

      // Redirect based on role
      const target = data.role === "freelancer" 
        ? "/dashboard/freelancer" 
        : "/dashboard/client";
      navigate(target);

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
      const data = await authApi.signup({ ...payload, role: selectedRole });

      if (data?.access_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("role", data.role);

        const target = data.role === "freelancer" 
          ? "/dashboard/freelancer" 
          : "/dashboard/client";
        navigate(target);
      }
    } catch (err) {
      console.error("Signup failed:", err?.message || err);
      throw err;
    }
  }

  if (isSignup && !selectedRole) {
    return (
      <RoleSelection 
        onSelectRole={(role) => setSelectedRole(role)}
        onLoginClick={() => setMode?.("login")}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-[#FFF8F5]">
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
          bg-gradient-to-br from-[#133B6C] via-[#5F90D4] to-[#FD8566]
          ${overlayOnLeft ? "rounded-r-2xl border-r border-white/30" : "rounded-l-2xl border-l border-white/30"}
          backdrop-blur-xl
        `}
        style={{ boxShadow: "0 10px 26px rgba(19,59,108,0.15)" }}
      >
        <div className="absolute inset-0 bg-white/10 pointer-events-none rounded-inherit" />
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
            <p className="text-sm sm:text-base font-semibold text-white/90 mb-3">{appName}</p>

            <h2 className="mt-2 text-2xl sm:text-2xl font-bold tracking-wide text-white whitespace-nowrap inline">
              {isLogin ? (
                <>
                  Welcome back to
                  <span className="text-[#FD8566]">
                    {"\u00A0"}{appName}
                  </span>
                </>
              ) : (
                "Hello there."
              )}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-white/80">
              Professional, secure & modern authentication experience.
            </p>

            {/* CTA block */}
            <div className="mt-6 mx-auto w-full pointer-events-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center shadow-sm border border-white/20">
                <h3 className="mt-1 text-sm sm:text-base font-semibold text-white">
                  Get your right job and right place
                </h3>
                <p className="mt-1 text-[13px] text-white/70 leading-snug">
                  Discover the best features of {appName}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 opacity-80">
                <span className="inline-block h-px w-10 bg-white/30" />
                <span className="inline-block h-px w-20 bg-[#FD8566]/40" />
                <span className="inline-block h-px w-6 bg-white/30" />
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