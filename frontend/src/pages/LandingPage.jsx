import { useState } from "react";
import { ArrowRight, Play, Shield, Zap, Users } from "lucide-react";

import Button from "@/components/common/Button";
import Navbar from "@/components/common/Navbar";
import Infographic from "@/components/landing/Infographic";
import Guide from "@/components/landing/Guide";
import Features from "@/components/landing/Features";
import FAQ from "@/components/landing/FAQ";
import Reviews from "@/components/landing/Reviews";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/common/Footer";
import ScrollAnimationWrapper from "@/components/animation/ScrollAnimationWrapper";
import { RightAnimation } from "@/components/landing/RightAnimation";
import { AvatarCircles } from "@/components/landing/AvatarCircles";
import TrustScoreAnimation from "@/components/landing/TrustScoreAnimation";
import GradientText from "@/components/design/GradientText";
import ScrollToTop from "@/components/common/ScrollToTop";
import AuthModal from "@/components/authentication/AuthModal";

export default function LandingPage() {
  const [mode, setMode] = useState(null);

  const onGoogleAuth = (flow) => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/oauth/google/start?flow=${flow}`;
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#FFF8F5] text-[#133B6C] font-sans theme-skillsync">
      <ScrollToTop />
      <Navbar showAuthButtons={true} isLoggedIn={false} setMode={setMode} />

      {/* ── HERO SECTION ── */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/images/bg.png')",
            backgroundBlendMode: "multiply",
            backgroundColor: "#FFF8F5",
            maskImage: "linear-gradient(to bottom, white 40%, transparent 100%)",
          }}
        />

        <ScrollAnimationWrapper>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center h-full px-10 max-w-7xl mx-auto gap-12 pt-16 pb-20 lg:pt-8 lg:pb-0">
            {/* Left Text */}
            <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
              <div className="mt-12 mb-3 ml-4 lg:ml-2 inline-flex self-center lg:self-start items-center bg-[#133B6C]/80 rounded-full p-0.5 pr-4 border-2 border-[#133B6C]/80 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                <span className="bg-[#FD8566] text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full mr-2.5 relative z-10">
                  New
                </span>
                <span className="text-white text-[11px] font-bold tracking-wide relative z-10">
                  AI Trust Score Engine
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[90px] font-black mb-4 tracking-tighter leading-[0.95] text-[#133B6C] flex flex-wrap items-baseline gap-4 justify-center lg:justify-start">
                <GradientText colors={["#133B6C", "#5F90D4", "#FD8566", "#133B6C"]} animationSpeed={3}>
                  SkillSync
                </GradientText>
                <span className="opacity-90 text-3xl md:text-4xl lg:text-[52px]">AI.</span>
              </h1>
              <p className="text-xl md:text-2xl font-bold text-[#4A6582] mb-4">
                Proof-Based Freelancing.
              </p>

              <div className="relative mb-6 text-left left-1">
                <p className="text-base md:text-lg font-medium text-[#4A6582] max-w-2xl leading-relaxed mx-auto lg:mx-0 text-center lg:text-left">
                  Replace fake profiles with verified skill DNA. 
                  Watch proof-of-work replays, verify with live challenges, and hire with confidence 
                  using our AI-powered Trust Score.
                </p>

                {/* Floating Badge */}
                <div className="hidden xl:block absolute -top-50 -right-33">
                  <div className="skillsync-badge leaf-animate flex flex-col justify-center items-center shadow-2xl scale-110 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#5F90D4]/20 via-[#FD8566]/20 to-[#5F90D4]/20 animate-pulse-glow"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-black mb-1 text-white relative z-10 animate-bounce-subtle">Verified.</span>
                    <span className="text-3xl font-black italic tracking-tighter text-white relative z-10 animate-scale-pulse">TRUSTED.</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#133B6C]" />
                  <span className="text-sm font-bold text-[#4A6582]">5 AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FD8566]" />
                  <span className="text-sm font-bold text-[#4A6582]">Live Challenges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#5F90D4]" />
                  <span className="text-sm font-bold text-[#4A6582]">Skill DNA</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 mt-2">
                <Button variant="primary" className="px-4 py-2 text-sm" onClick={() => setMode("signup")}>
                  <ArrowRight size={16} />
                  <span>Join as Freelancer</span>
                </Button>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm"
                  onClick={() => { window.location.href = "/job-recommendation"; }}
                >
                  <Play size={16} />
                  <span>Post a Job</span>
                </Button>
              </div>

              {/* Trust Section */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <AvatarCircles
                  numPeople={50}
                  avatarUrls={[
                    { imageUrl: "/images/avatar1.png", profileUrl: "#" },
                    { imageUrl: "/images/avatar2.png", profileUrl: "#" },
                    { imageUrl: "/images/avatar3.png", profileUrl: "#" },
                    { imageUrl: "/images/avatar4.png", profileUrl: "#" },
                  ]}
                />
                <div className="text-sm md:text-base font-semibold italic text-[#133B6C]/60">
                  Trusted by verified professionals worldwide.
                </div>
              </div>
            </div>

            {/* Right Animation */}
            <div className="flex-1 w-full max-w-xl lg:max-w-md scale-140 lg:scale-111 mt-20">
              <RightAnimation />
            </div>
          </div>
        </ScrollAnimationWrapper>

        {/* Decorative Accents — Navy/Coral */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#5F90D4]/10 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FD8566]/8 blur-[150px] rounded-full pointer-events-none z-0 translate-x-1/3 -translate-y-1/3" />
      </section>

      {/* ── FEATURES ── */}
      <div id="features" className="bg-[#0D2847] py-32">
        <ScrollAnimationWrapper>
          <Features setMode={setMode} />
        </ScrollAnimationWrapper>
      </div>

      {/* ── TRUST SCORE ANIMATION ── */}
      <div className="bg-[#0D2847] backdrop-blur-xl border-y border-[#133B6C]/10">
        <ScrollAnimationWrapper>
          <TrustScoreAnimation />
        </ScrollAnimationWrapper>
      </div>

      {/* ── INFOGRAPHIC + GUIDE ── */}
      <div className="bg-gradient-to-b from-white to-[#FFF0EC]/50">
        <div id="guide">
          <ScrollAnimationWrapper>
            <div className="relative z-10 py-32 bg-transparent">
              <Infographic />
            </div>
          </ScrollAnimationWrapper>
        </div>

        <section className="relative py-32 px-10 max-w-7xl mx-auto overflow-hidden bg-[#FFF0EC] rounded-[4rem] mt-20 mb-0 shadow-2xl">
          <ScrollAnimationWrapper>
            <Guide />
          </ScrollAnimationWrapper>
        </section>
      </div>

      {/* ── REVIEWS ── */}
      <div id="reviews" className="bg-gradient-to-b from-[#FFF0EC]/50 via-[#FEF6F2] to-[#FFF8F5] py-32">
        <ScrollAnimationWrapper>
          <Reviews />
        </ScrollAnimationWrapper>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" className="bg-gradient-to-b from-[#FFF8F5] to-[#FEF6F2] pt-32 pb-0">
        <ScrollAnimationWrapper>
          <FAQ />
        </ScrollAnimationWrapper>
      </div>

      {/* ── CTA ── */}
      <div className="bg-[#FEF6F2] pb-32">
        <ScrollAnimationWrapper>
          <CTA setMode={setMode} />
        </ScrollAnimationWrapper>
      </div>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── AUTH MODAL ── */}
      {mode && (
        <AuthModal
          mode={mode}
          close={() => setMode(null)}
          setMode={setMode}
          onGoogleAuth={onGoogleAuth}
        />
      )}
    </div>
  );
}