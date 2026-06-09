import React from "react";
import { motion } from "framer-motion";
import { Shield, Brain, Fingerprint } from "lucide-react";

export default function Infographic() {
  const features = [
    {
      title: "Trust Score Verification",
      desc: "Replace star ratings with a weighted, multi-factor score that cannot be gamed. Built from real delivery data, not opinions.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-[#FD8566]/30 rounded-full border-dashed"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-4 border border-[#FD8566]/40 rounded-full"
          />
          <Shield className="w-8 h-8 text-[#FD8566]" />
        </div>
      )
    },
    {
      title: "Autonomous AI Agents",
      desc: "Five background agents handle Trust Scoring, Fraud Detection, Matching, Skill DNA analysis, and Payment Release — all without human intervention.",
      bg: "bg-[#5F90D4]/10",
      visual: (
        <div className="relative w-full h-full flex items-center justify-between px-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-6 h-6 text-[#5F90D4]" />
          </motion.div>

          <div className="flex-1 mx-2 h-[2px] bg-[#5F90D4]/20 relative overflow-hidden rounded-full">
            <motion.div
              animate={{ x: [-20, 30] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-2 bg-[#5F90D4] rounded-full blur-[2px]"
            />
          </div>

          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Fingerprint className="w-6 h-6 text-[#5F90D4]" />
          </motion.div>
        </div>
      )
    },
    {
      title: "Skill DNA Fingerprint",
      desc: "Every work session and live challenge feeds into a behavioral fingerprint. Clients see who you really are — not who you claim to be.",
      bg: "bg-[#133B6C]/10",
      visual: (
        <div className="relative w-full h-full flex items-end justify-center gap-1 pb-3 px-3">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ height: "20%" }}
              animate={{ height: ["20%", "40%", "80%", "50%"] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
              className="w-2 bg-[#133B6C]/60 rounded-t-sm"
            />
          ))}
        </div>
      )
    },
  ];

  return (
    <section id="features" className="relative px-6 max-w-7xl mx-auto py-24">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-[#133B6C] font-black tracking-widest uppercase text-xs mb-4">Core Platform Capabilities</h2>
        <h3 className="text-4xl md:text-5xl font-black text-[#133B6C] leading-tight">
          Engineered for <br className="md:hidden" /> <span className="text-[#FD8566]">Verified Trust.</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        <div className="hidden md:block absolute top-[88px] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#FD8566]/20 via-[#5F90D4]/20 to-[#FD8566]/20 border-t border-dashed border-[#133B6C]/30 -z-10" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FD8566]/10 blur-[100px] -z-20 rounded-full pointer-events-none" />

        {features.map((feature, index) => (
          <div key={index} className="p-10 rounded-[3rem] bg-white/90 backdrop-blur-md border border-[#E2D5CF] hover:border-[#FD8566]/20 transition-all hover:shadow-2xl group flex flex-col items-center text-center">
            <div className={`w-24 h-24 ${feature.bg || 'bg-[#FD8566]/10'} rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white/50 relative overflow-hidden`}>
              {feature.visual}
            </div>
            <h4 className="text-2xl font-black text-[#133B6C] mb-4">{feature.title}</h4>
            <p className="text-[#4A6582] leading-relaxed font-medium">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}