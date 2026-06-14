import React from "react";
import { motion } from "framer-motion";
import { Shield, Brain, Target, FileCheck, BarChart3, Lock, ArrowRight } from "lucide-react";

const features = [
    {
        title: "AI Trust Score",
        description: "Multi-factor weighted score replacing star ratings. Computed from delivery consistency, client retention, performance, dispute history, and challenge performance.",
        icon: Shield,
        color: "text-[#133B6C]",
        bg: "bg-[#133B6C]/10",
    },
    {
        title: "Skill DNA Engine",
        description: "Auto-generated behavioral fingerprint built from real work sessions — not self-reported. Tracks reliability, creativity, teamwork, performance, technical accuracy.",
        icon: Brain,
        color: "text-[#FD8566]",
        bg: "bg-[#FD8566]/10",
    },
    {
        title: "Live Challenges",
        description: "Timed sandboxed tasks assigned by clients. System records everything for proof-of-work replay. Challenge results feed directly into Skill DNA recalculation.",
        icon: Target,
        color: "text-[#D05438]",
        bg: "bg-[#D05438]/10",
    },
    {
        title: "Proof-of-Work Replay",
        description: "Step-by-step replay of how a freelancer completed a real task. Clients can watch proof-of-work sessions at variable speed before making hiring decisions.",
        icon: FileCheck,
        color: "text-[#5F90D4]",
        bg: "bg-[#5F90D4]/10",
    },
    {
        title: "AI Matching Agent",
        description: "Autonomous agent reads required skill tags from job posts, queries the freelancer pool, and scores each candidate by Skill DNA fit + Trust Score + category performance.",
        icon: BarChart3,
        color: "text-[#A8BEDD]",
        bg: "bg-[#A8BEDD]/20",
    },
    {
        title: "Fraud Detection",
        description: "Multi-layer AI agent runs on every submission and login. Detects AI-generated content, device fingerprint anomalies, and fake review clusters automatically.",
        icon: Lock,
        color: "text-[#E86A4A]",
        bg: "bg-[#E86A4A]/10",
    },
];

export default function Features({ setMode }) {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto relative">
            <div className="text-center mb-20">
                <h2 className="text-white/60 font-black tracking-widest uppercase text-xs mb-4">Core Capabilities</h2>
                <h3 className="text-4xl md:text-6xl font-black text-white mb-6">
                    Proof-based hiring, <span className="text-[#FD8566] italic">reimagined.</span>
                </h3>
                <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto font-medium">
                    SkillSync AI replaces subjective star ratings with verified behavioral data, live skill challenges, and autonomous AI agents.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative p-10 rounded-[3rem] bg-white/95 border border-white/30 transition-all hover:bg-white shadow-xl shadow-[#0D2847]/10"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FD8566]/5 to-transparent rounded-tr-[3rem] pointer-events-none" />

                        <div className={`w-16 h-16 ${feature.bg} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-lg border border-white/50`}>
                            <feature.icon className={`w-8 h-8 ${feature.color}`} />
                        </div>

                        <h4 className="text-2xl font-black text-[#133B6C] mb-4 tracking-tight">{feature.title}</h4>
                        <p className="text-[#4A6582] leading-relaxed font-medium">
                            {feature.description}
                        </p>

                        <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FD8566] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setMode?.("signup")}>
                           Get Started <ArrowRight size={14} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}