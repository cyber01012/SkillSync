import React from "react";
import { motion } from "framer-motion";
import { Target, Brain, MessageSquare } from "lucide-react";

export default function Infographic() {
  const features = [
    {
      title: "Precision Career Targeting",
      desc: "Identifying and securing high-impact opportunities with surgical accuracy based on your unique skill matrix.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-[#2ed386]/30 rounded-full border-dashed"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-4 border border-[#2ed386]/40 rounded-full"
          />
          <Target className="w-8 h-8 text-[#2ed386]" />
        </div>
      )
    },
    {
      title: "AI Career Mentorship",
      desc: "Receive real-time, context-aware professional guidance that evolves with industry trends and your personal growth.",
      bg: "bg-[#c86ad6]/10",
      visual: (
        <div className="relative w-full h-full flex items-center justify-between px-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-6 h-6 text-[#c86ad6]" />
          </motion.div>

          <div className="flex-1 mx-2 h-[2px] bg-[#c86ad6]/20 relative overflow-hidden rounded-full">
            <motion.div
              animate={{ x: [-20, 30] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-2 bg-[#c86ad6] rounded-full blur-[2px]"
            />
          </div>

          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <MessageSquare className="w-6 h-6 text-[#c86ad6]" />
          </motion.div>
        </div>
      )
    },
    {
      title: "Strategic Profile Optimization",
      desc: "Transforming your professional narrative into a high-performance profile that captures attention and builds authority.",
      bg: "bg-[#2ed386]/10",
      visual: (
        <div className="relative w-full h-full flex items-end justify-center gap-1 pb-3 px-3">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ height: "20%" }}
              animate={{ height: ["20%", "40%", "80%", "50%"] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
              className="w-2 bg-[#2ed386]/60 rounded-t-sm"
            />
          ))}
        </div>
      )
    },
  ];

  return (
    <section id="features" className="relative px-6 max-w-7xl mx-auto py-24">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-[#3D418A] font-black tracking-widest uppercase text-xs mb-4">Core Platform Capabilities</h2>
        <h3 className="text-4xl md:text-5xl font-black text-[#3D418A] leading-tight">
          Engineered for <br className="md:hidden" /> <span className="text-[#a135b4]">Professional Success.</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {/* Connection Line (Desktop) */}
        <div className="hidden md:block absolute top-[88px] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#2ed386]/20 via-[#c86ad6]/20 to-[#2ed386]/20 border-t border-dashed border-[#3D418A]/30 -z-10" />

        {/* Blue Gradient Bloom behind cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/25 blur-[100px] -z-20 rounded-full pointer-events-none" />

        {features.map((feature, index) => (
          <div key={index} className="p-10 rounded-[3rem] bg-white/80 backdrop-blur-md border border-white hover:border-white transition-all hover:shadow-2xl group flex flex-col items-center text-center">
            <div className={`w-24 h-24 ${feature.bg} rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white/50 relative overflow-hidden`}>
              {feature.visual}
            </div>
            <h4 className="text-2xl font-black text-[#3D418A] mb-4">{feature.title}</h4>
            <p className="text-[#3D418A]/70 leading-relaxed font-medium">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
