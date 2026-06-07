import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "How does SkillmatriX extract skills from my resume?",
        answer: "We use Natural Language Processing (NLP) and our proprietary skill-extraction engine to scan your resume text, identifying not just keywords but context, impact, and hierarchy of skills to build a comprehensive profile.",
    },
    {
        question: "Is my personal data and resume secure?",
        answer: "Absolutely. We employ industry-standard encryption. Your resume is processed to extract skills and then encrypted. We do not sell your data to third parties.",
    },
    {
        question: "How does the Intelligent Resume Architect work?",
        answer: "Our AI scans your existing profile and career goals to automatically generate a polished, ATS-friendly resume. It highlights your key achievements and tailors the language to match top industry standards, helping you stand out to recruiters immediately.",
    },
    {
        question: "Can I use the AI Career Counselor for interview prep?",
        answer: "Yes! Our AI counselor is trained on thousands of real-world interview scenarios. You can ask for role-specific questions and get feedback on your answers.",
    },
    {
        question: "What makes SkillmatriX different from LinkedIn or Indeed?",
        answer: "While those platforms focus on listing jobs, SkillmatriX focuses on YOU. We provide the 'Why' and the 'How'—identifying what you lack and giving you a roadmap to get there, rather than just showing you jobs you might not be ready for yet.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="py-24 px-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="text-[#2ed386] w-6 h-6" />
                <h2 className="text-[#3D418A]/60 font-bold tracking-widest uppercase text-sm">Common Questions</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-[#3D418A] text-center mb-16">
                Got questions? We've got <span className="text-[#2ed386] italic">answers.</span>
            </h3>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-[#4b4faf]/10 rounded-[2rem] overflow-hidden bg-white/40 shadow-lg shadow-[#4b4faf]/5"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full p-8 text-left flex items-center justify-between hover:bg-white/60 transition-colors"
                        >
                            <span className="text-xl font-black text-[#4b4faf] pr-8">{faq.question}</span>
                            <ChevronDown
                                className={`w-6 h-6 text-[#4b4faf]/40 transition-transform ${openIndex === index ? "rotate-180" : ""
                                    }`}
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
                                    <div className="p-8 pt-0 text-[#2a2ea0]/70 text-lg leading-relaxed border-t border-[#4b4faf]/5 font-medium">
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
