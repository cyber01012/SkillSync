import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";

import Button from "@/components/common/Button";
import Navbar from "@/components/common/Navbar";
import Infographic from "@/components/landing/infographic";
import Guide from "@/components/landing/guide";
import Features from "@/components/landing/Features";
import FAQ from "@/components/landing/FAQ";
import Reviews from "@/components/landing/Reviews";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/common/Footer";
import ScrollAnimationWrapper from "@/components/animation/ScrollAnimationWrapper";
import { RightAnimation } from "@/components/landing/RightAnimation";
import { AvatarCircles } from "@/components/landing/avatar-circles";
import SkillPathAnimation from "@/components/landing/SkillPathAnimation";
import GradientText from "@/components/design/GradientText";
import ScrollToTop from "@/components/common/ScrollToTop";
import AuthModal from "@/components/authentication/AuthModal";

export default function LandingPage() {
  const [mode, setMode] = useState(null); // "login" | "signup" | "forgot"

  const onGoogleAuth = (flow) => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/oauth/google/start?flow=${flow}`;
  };

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground font-sans theme-mint">
      <ScrollToTop />

      {/* Navbar */}
      <Navbar showAuthButtons={true} isLoggedIn={false} setMode={setMode} />

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/images/bg.jpg')",
            backgroundBlendMode: "multiply",
            backgroundColor: "#a8e6cf",
            maskImage: "linear-gradient(to bottom, white 40%, transparent 100%)",
          }}
        />

        {/* Content */}
        <ScrollAnimationWrapper>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center h-full px-10 max-w-7xl mx-auto gap-12 pt-16 pb-20 lg:pt-8 lg:pb-0">
            {/* Left Text */}
            <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
              <div className="mt-12 mb-3 ml-4 lg:ml-2 inline-flex self-center lg:self-start items-center bg-[#3D418A]/70 rounded-full p-0.5 pr-4 border-2 border-[#3D418A]/80 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                <span className="bg-[#26B291] text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full mr-2.5 relative z-10">
                  New
                </span>
                <span className="text-white text-[11px] font-bold tracking-wide relative z-10">
                  AI Career Coach
                </span>
              </div>

              <h1 className="text-8xl md:text-8xl lg:text-[110px] font-black mb-4 tracking-tighter leading-[0.9] text-[#2A2771] flex flex-wrap items-baseline gap-4 justify-center lg:justify-start">
                <GradientText colors={["#4144A3", "#933393", "#26B291", "#4144A3"]} animationSpeed={3}>Career</GradientText>
                <span className="opacity-90 text-3xl md:text-4xl lg:text-[58px]">Growth, Simplified.</span>
              </h1>

              <div className="relative mb-6 text-left left-1">
                <p className="text-base md:text-lg font-medium text-slate-700 max-w-2xl leading-relaxed mx-auto lg:mx-0 text-center lg:text-left">
                  Power your career growth with intelligent insights.
                  Analyze resumes, identify skill gaps, and rank opportunities with exceptional accuracy.
                </p>

                {/* Floating Badge */}
                <div className="hidden xl:block absolute -top-50 -right-33">
                  <div className="leaf-shape leaf-animate flex flex-col justify-center items-center shadow-2xl scale-110 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 animate-pulse-glow"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-black mb-1 text-white relative z-10 animate-bounce-subtle">Ready. Set.</span>
                    <span className="text-3xl font-black italic tracking-tighter text-white relative z-10 animate-scale-pulse">HIRED!</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 mt-2">
                <Button variant="primary" className="px-4 py-2 text-sm" onClick={() => setMode("signup")}>
                  <ArrowRight size={16} />
                  <span>Try For Free</span>
                </Button>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm"
                  onClick={() => { window.location.href = "/job-recommendation"; }}
                >
                  <Play size={16} />
                  <span>Preview</span>
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
                <div className="text-sm md:text-base font-semibold italic text-[#4144A3]/60">
                  Trusted by 50,000+ professionals worldwide.
                </div>
              </div>
            </div>

            {/* Right Animation */}
            <div className="flex-1 w-full max-w-xl lg:max-w-md scale-140 lg:scale-111 mt-20">
              <RightAnimation />
            </div>
          </div>
        </ScrollAnimationWrapper>

        {/* Decorative Accents */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#c86ad9]/10 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2ed3a6]/10 blur-[150px] rounded-full pointer-events-none z-0 translate-x-1/3 -translate-y-1/3" />
      </section>

      {/* Features */}
      <div id="features" className="bg-[#2A2771] py-32">
        <ScrollAnimationWrapper>
          <Features setMode={setMode} />
        </ScrollAnimationWrapper>
      </div>

      {/* Skill Path Animation */}
      <div className="bg-[#2A2771] backdrop-blur-xl border-y border-[#3D418A]/5">
        <ScrollAnimationWrapper>
          <SkillPathAnimation />
        </ScrollAnimationWrapper>
      </div>

      {/* Merged Background Wrapper */}
      <div className="bg-gradient-to-b from-white to-[#a8e6cf]/30">
        <div id="guide">
          <ScrollAnimationWrapper>
            <div className="relative z-10 py-32 bg-transparent">
              <Infographic />
            </div>
          </ScrollAnimationWrapper>
        </div>

        <section className="relative py-32 px-10 max-w-7xl mx-auto overflow-hidden bg-[#a8e6cf] rounded-[4rem] mt-20 mb-0 shadow-2xl">
          <ScrollAnimationWrapper>
            <Guide />
          </ScrollAnimationWrapper>
        </section>
      </div>

      {/* Reviews */}
      <div id="reviews" className="bg-gradient-to-b from-[#a8e6cf]/30 via-[#7ce6c0] to-[#f0fff9] py-32">
        <ScrollAnimationWrapper>
          <Reviews />
        </ScrollAnimationWrapper>
      </div>

      {/* FAQ */}
      <div id="faq" className="bg-gradient-to-b from-[#f0fff9] to-[#7ce6c0] pt-32 pb-0">
        <ScrollAnimationWrapper>
          <FAQ />
        </ScrollAnimationWrapper>
      </div>

      {/* CTA */}
      <div className="bg-[#7ce6c0] pb-32">
        <ScrollAnimationWrapper>
          <CTA setMode={setMode} />
        </ScrollAnimationWrapper>
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
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
