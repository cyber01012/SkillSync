import React from "react";
import { motion } from "framer-motion";
import { Brain, Search, Map, Briefcase, BarChart3, ArrowRight, FileText } from "lucide-react";

const features = [
    {
        title: "AI Resume Parsing",
        description: "Extract core skills and professional experiences from your resume with 99.9% accuracy using our proprietary skill-extraction engine.",
        icon: Search,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
    {
        title: "Skill Gap Analysis",
        description: "Instantly identify what's missing for your dream role and get actionable advice to bridge the gap.",
        icon: BarChart3,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
    },
    {
        title: "Personalized Roadmaps",
        description: "A step-by-step career growth plan tailored specifically to your background and aspirations.",
        icon: Map,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
    },
    {
        title: "Job Recommendations",
        description: "Discover roles that perfectly match your current skill set and potential growth trajectory.",
        icon: Briefcase,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
    },
    {
        title: "AI Career Counseling",
        description: "Chat with our virtual expert for personalized career advice, interview prep, and industry insights.",
        icon: Brain,
        color: "text-pink-400",
        bg: "bg-pink-400/10",
    },
    {
        title: "Intelligent Resume Architect",
        description: "Craft ATS-optimized, executive-grade resumes instantly that perfectly position your unique value proposition.",
        icon: FileText,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
    },
];

export default function Features({ setMode }) {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto relative">
            <div className="text-center mb-20">
                <h2 className="text-white/60 font-black tracking-widest uppercase text-xs mb-4">Core Capabilities</h2>
                <h3 className="text-4xl md:text-6xl font-black text-white mb-6">
                    Everything you need to <span className="text-[#2ed3a6] italic">level up.</span>
                </h3>
                <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto font-medium">
                    SkillmatriX combines cutting-edge AI with career science to give you an unfair advantage in the job market.
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
                        className="group relative p-10 rounded-[3rem] bg-white/80 border border-white transition-all hover:bg-white shadow-xl shadow-[#3D418A]/5"
                    >
                        {/* Unique Decorative Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#b129c9]/5 to-transparent rounded-tr-[3rem] pointer-events-none" />

                        <div className={`w-16 h-16 ${feature.bg} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-lg border border-white/50`}>
                            <feature.icon className={`w-8 h-8 ${feature.color}`} />
                        </div>

                        <h4 className="text-2xl font-black text-[#3D418A] mb-4 tracking-tight">{feature.title}</h4>
                        <p className="text-[#3D418A]/60 leading-relaxed font-medium">
                            {feature.description}
                        </p>

                        {/* Modern Indicator */}
                        <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c86ad9] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setMode?.("signup")}>
                           Login To Explore Feature <ArrowRight size={14} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
