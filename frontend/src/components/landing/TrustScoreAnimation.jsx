import React from "react";
import { motion } from "framer-motion";
import { Shield, Brain, Search, Lock, Wallet, Fingerprint } from "lucide-react";

export default function TrustScoreAnimation() {
  const agents = [
    {
      icon: Shield,
      title: "Trust Score Agent",
      desc: "Recalculates scores on project completion",
      color: "#133B6C",
      delay: 0
    },
    {
      icon: Lock,
      title: "Fraud Detection",
      desc: "Scans submissions for AI-generated content",
      color: "#D05438",
      delay: 0.1
    },
    {
      icon: Search,
      title: "Matching Agent",
      desc: "Ranks freelancers by Skill DNA fit",
      color: "#5F90D4",
      delay: 0.2
    },
    {
      icon: Brain,
      title: "Skill DNA Agent",
      desc: "Updates behavioral fingerprints live",
      color: "#FD8566",
      delay: 0.3
    },
    {
      icon: Wallet,
      title: "Payment Release",
      desc: "Auto-releases escrow on milestone approval",
      color: "#133B6C",
      delay: 0.4
    }
  ];

  return (
    <section
      id="solutions"
      className="py-32 px-10 max-w-7xl mx-auto overflow-hidden bg-[#FFF0EC] rounded-[4rem] my-20 shadow-2xl border border-[#FD8566]/10"
    >
      <div className="flex flex-col lg:flex-row items-start gap-20">

        {/* LEFT: Trust Score Hub Animation */}
        <div className="flex-1 relative w-full flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[400px] aspect-square">

            {/* Background Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-[#133B6C]/20"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute inset-16 rounded-full border border-[#FD8566]/20"
            />

            {/* Trust Score Hub */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-36 h-36 bg-gradient-to-br from-[#133B6C] to-[#0D2847]
                         shadow-[0_0_40px_rgba(19,59,108,0.3)]
                         rounded-[3rem] flex items-center justify-center z-20
                         border border-white/20"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  >
                    <Fingerprint className="text-[#FD8566] w-10 h-10 drop-shadow-[0_0_8px_rgba(253,133,102,0.5)]" />
                  </motion.div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                  Trust Hub
                </span>
              </div>
            </motion.div>

            {/* Orbiting Agent Nodes */}
            {agents.map((agent, i) => {
              const Icon = agent.icon;
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
                    className="w-16 h-16 bg-white rounded-2xl border-2 border-[#FD8566]/30 shadow-2xl flex items-center justify-center absolute pointer-events-auto"
                    style={{
                      top: i % 2 === 0 ? '-10px' : 'auto',
                      bottom: i % 2 !== 0 ? '-10px' : 'auto',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Icon
                      size={32}
                      style={{ stroke: agent.color, strokeWidth: 2.5 }}
                      className="filter drop-shadow-sm"
                    />
                  </motion.div>
                </motion.div>
              );
            })}

          </div>
        </div>

        {/* RIGHT: Agent List */}
        <div className="flex-1 space-y-8 w-full">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#133B6C]/10 border border-[#133B6C]/20">
              <span className="text-[#133B6C] font-black tracking-widest uppercase text-[10px]">
                5 Autonomous AI Agents
              </span>
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-[#133B6C] leading-[1.05] tracking-tight">
              Agentic AI <span className="text-[#FD8566]">Orchestration</span>
            </h3>

            <p className="text-[#4A6582] text-lg font-medium leading-relaxed max-w-xl">
              Five background agents work autonomously via Celery + Redis. 
              No model training required — just intelligent API-based automation.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: agent.delay }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="relative flex-none w-16 h-16 rounded-2xl border-2 border-[#FD8566]/30 shadow-2xl flex items-center justify-center"
                     style={{ backgroundColor: agent.color }}
                >
                  <agent.icon
                    size={32}
                    className="text-white filter drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                    style={{ strokeWidth: 2.5 }}
                  />
                </div>

                <div>
                  <h4 className="text-[#133B6C] font-black text-lg mb-1">{agent.title}</h4>
                  <p className="text-[#4A6582] text-sm leading-relaxed">{agent.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}