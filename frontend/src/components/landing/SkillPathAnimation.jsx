import React from "react";
import { motion } from "framer-motion";
import { List, Grid, Layers, GitBranch } from "lucide-react";

export default function SkillPathAnimation() {
  const steps = [
    {
      icon: List,
      title: "Expert Resume Extraction",
      desc: "Advanced AI identifies and categorizes your unique professional expertise with precision.",
      color: "#3D418A",
      delay: 0
    },
    {
      icon: Grid,
      title: "Intelligent Gap Analysis",
      desc: "Dynamic mapping of your current skillset against top-tier industry standards and requirements.",
      color: "#c86ad6",
      delay: 0.1
    },
    {
      icon: Layers,
      title: "Strategic Job Matching",
      desc: "Proprietary algorithms prioritize and rank opportunities that perfectly align with your career goals.",
      color: "#26B291",
      delay: 0.2
    },
    {
      icon: GitBranch,
      title: "Personalized Roadmap",
      desc: "Visualizing high-impact milestones and strategic steps to accelerate your professional journey.",
      color: "#3D418A",
      delay: 0.3
    }
  ];

  return (
    <section
      id="solutions"
      className="py-32 px-10 max-w-7xl mx-auto overflow-hidden bg-[#a8e6cf] rounded-[4rem] my-20 shadow-2xl border border-white/20"
    >
      <div className="flex flex-col lg:flex-row items-start gap-20">

        {/* LEFT: Skill Engine Animation */}
        <div className="flex-1 relative w-full flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[400px] aspect-square">

            {/* Background Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-[#3D418A]/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute inset-16 rounded-full border border-[#c86ad9]/30"
            />

            {/* Skill Engine (smaller) */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-36 h-36 bg-gradient-to-br from-[#3D418A] to-[#4144A3]
                         shadow-[0_0_40px_rgba(30,33,86,0.3)]
                         rounded-[3rem] flex items-center justify-center z-20
                         border border-white/20"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  >
                    <Layers className="text-[#a8e6cf] w-10 h-10 drop-shadow-[0_0_8px_rgba(168,230,207,0.5)]" />
                  </motion.div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                  Skill Engine
                </span>
              </div>
            </motion.div>

            {/* Orbiting Nodes */}
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-white rounded-2xl border-2 border-[#a8e6cf] shadow-2xl flex items-center justify-center absolute pointer-events-auto"
                    style={{
                      top: i % 2 === 0 ? '-10px' : 'auto',
                      bottom: i % 2 !== 0 ? '-10px' : 'auto',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Icon
                      size={32}
                      style={{ stroke: step.color, strokeWidth: 2.5 }}
                      className="filter drop-shadow-sm"
                    />
                  </motion.div>
                </motion.div>
              );
            })}

          </div>
        </div>

        {/* RIGHT: Vertical Rectangle Boxes */}
        <div className="flex-1 space-y-8 w-full">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#3D418A]/10 border border-[#3D418A]/20">
              <span className="text-[#3D418A] font-black tracking-widest uppercase text-[10px]">
                Strategic Skill Architecture
              </span>
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-[#3D418A] leading-[1.05] tracking-tight">
              Optimized for <span className="text-[#A135B4]">Precision</span>
            </h3>

            <p className="text-[#3D418A]/70 text-lg font-medium leading-relaxed max-w-xl">
              SkillmatriX leverages robust methodology to efficiently analyze, compare, and rank career data points, providing you with a scientifically accurate roadmap.
            </p>
          </div>

         
    <div className="flex flex-col gap-6">
  {steps.map((step, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: step.delay }}
      viewport={{ once: true }}
      className="flex items-center gap-4"
    >
      {/* Exact same container as left nodes */}
      <div className="relative flex-none w-16 h-16 rounded-2xl border-2 border-[#a8e6cf] shadow-2xl flex items-center justify-center"
           style={{ backgroundColor: step.color }}
      >
        <step.icon
          size={32} // Same as left
          className="text-white filter drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]"
          style={{ strokeWidth: 2.5 }}
        />
      </div>

      {/* Text */}
      <div>
        <h4 className="text-[#3D418A] font-black text-lg mb-1">{step.title}</h4>
        <p className="text-[#3D418A]/70 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  ))}
</div>


        </div>

      </div>
    </section>
  );
}
