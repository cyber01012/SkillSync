import React from "react";
import { motion } from "framer-motion";
import Button from "../common/Button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA({ setMode }) {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="relative rounded-[4rem] overflow-hidden bg-gradient-to-br from-[#3D418A] to-[#4144A3] p-12 md:p-24 text-center shadow-[0_40px_100px_-20px_rgba(30,33,86,0.5)] border border-white/10">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#933393]/20 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#a8e6cf]/20 blur-[120px] translate-y-1/2 -translate-x-1/2 rounded-full" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="relative z-10"
                >
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Sparkles className="text-[#2ed386] w-8 h-8 animate-pulse" />
                        <span className="text-white/80 font-black tracking-[0.3em] uppercase text-xs">Start your journey today</span>
                    </div>

                    <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tight leading-tight">
                        Ready to unlock your <br /> <span className="text-[#2ed386] underline decoration-white/20 underline-offset-8 italic">full potential?</span>
                    </h2>

                    <p className="text-white/80 text-base md:text-lg max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
                        Join thousands of professionals already using SkillmatriX to navigate their careers with AI-powered insights.
                    </p>

                    
<div className="flex flex-col sm:flex-row justify-center items-center gap-8">
        
<Button
  variant="secondary"
  onClick={() => setMode?.("signup")}
  className="!px-14 !py-6 !text-2xl shadow-2xl shadow-[#5D5FEF]/30 hover:shadow-[#5D5FEF]/50 transition-all duration-300 group flex items-center gap-3"
>
  Create Free Account
  <ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
</Button>

                        
                        <motion.button
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-2 py-1 text-xl font-bold text-white transition-all border-b-2 border-[#2ed386] hover:text-[#2ed386]"
                        >
                            Explore Enterprise Path
                        </motion.button>
                    </div>

                    <p className="mt-10 text-white/50 text-sm font-bold tracking-widest uppercase">
                        No credit card required • Free forever basic plan
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
