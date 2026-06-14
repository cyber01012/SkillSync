import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "How does SkillSync verify freelancer skills?",
        answer: "We combine three verification layers: baseline skill tasks on registration, timed live challenges assigned by clients, and continuous behavioral tracking during work sessions. The Skill DNA Agent recalculates your trait scores after every completed session — no self-reporting allowed.",
    },
    {
        question: "What is the Trust Score and how is it calculated?",
        answer: "The Trust Score is a multi-factor weighted score (0-100) that replaces star ratings. It's computed from five factors: Delivery Consistency (25%), Client Retention (20%), Performance Quality (20%), Dispute History (15%), and Challenge Performance (20%). It cannot be gamed because it's based on actual platform behavior.",
    },
    {
        question: "How does Proof-of-Work replay work?",
        answer: "During live challenges and work sessions, we record all actions as step-by-step arrays stored in MongoDB. Clients can replay these sessions at variable speed to see exactly how a freelancer thinks, solves problems, and delivers work — before they ever make a hiring decision.",
    },
    {
        question: "What are the 5 AI agents and what do they do?",
        answer: "1) Trust Score Agent — recalculates scores on project completion. 2) Fraud Detection Agent — scans submissions and logins for anomalies. 3) Matching Agent — ranks freelancers by Skill DNA fit for each job. 4) Skill DNA Agent — updates behavioral fingerprints after every session. 5) Payment Release Agent — auto-releases escrow when milestones are approved.",
    },
    {
        question: "How is SkillSync different from Upwork or Fiverr?",
        answer: "Unlike platforms that rely on self-reported skills and easily-gamed star ratings, SkillSync makes skill verification the core. Every freelancer builds a Skill DNA fingerprint through actual work. Clients watch proof-of-work replays, set Trust Score thresholds, and hire with confidence. We also provide a Virtual Project Office with kanban, chat, and automated escrow payments.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="py-24 px-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="text-[#FD8566] w-6 h-6" />
                <h2 className="text-[#133B6C]/60 font-bold tracking-widest uppercase text-sm">Common Questions</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-[#133B6C] text-center mb-16">
                Got questions? We've got <span className="text-[#FD8566] italic">answers.</span>
            </h3>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-[#133B6C]/10 rounded-[2rem] overflow-hidden bg-white/60 shadow-lg shadow-[#133B6C]/5"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full p-8 text-left flex items-center justify-between hover:bg-white/80 transition-colors"
                        >
                            <span className="text-xl font-black text-[#133B6C] pr-8">{faq.question}</span>
                            <ChevronDown
                                className={`w-6 h-6 text-[#133B6C]/40 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                            />
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-8 pt-0 text-[#4A6582] text-lg leading-relaxed border-t border-[#133B6C]/5 font-medium">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}