import React from "react";
import { FileText, Target, MapPin, Briefcase } from "lucide-react";

export default function Guide() {
  const steps = [
    {
      title: "Verify Your Skills",
      description: "Complete baseline skill verification tasks and live challenges. Our system records every action to build your initial Skill DNA fingerprint.",
      icon: FileText,
      color: "from-[#FD8566] to-[#D05438]",
    },
    {
      title: "Build Trust Score",
      description: "As you complete projects, our Trust Score Agent automatically recalculates your score from delivery consistency, client retention, and performance metrics.",
      icon: Target,
      color: "from-[#133B6C] to-[#5F90D4]",
    },
    {
      title: "Get AI-Matched",
      description: "The Matching Agent reads job requirements and scores your Skill DNA fit against each posting. Clients see you ranked by verified competence.",
      icon: Briefcase,
      color: "from-[#FD8566] to-[#D05438]",
    },
    {
      title: "Deliver & Prove",
      description: "Work in the Virtual Project Office with kanban, chat, and escrow. Every submission is scanned by the Fraud Detection Agent for integrity.",
      icon: MapPin,
      color: "from-[#133B6C] to-[#5F90D4]",
    },
  ];

  return (
    <section id="guide" className="py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-[#133B6C] font-black tracking-widest uppercase text-xs mb-4 !opacity-100">How It Works</h2>
        <h3 className="text-4xl md:text-5xl font-black text-[#133B6C] !opacity-100">From Profile <span className="text-[#FD8566]">to Proof.</span></h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-[#E2D5CF] hover:border-[#FD8566]/30 transition-all hover:shadow-2xl hover:-translate-y-2"
          >
            <div className={`w-16 h-16 rounded-[1.2rem] bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <step.icon className="text-white w-8 h-8" />
            </div>

            <h4 className="text-[#133B6C] text-xl font-black mb-3">{step.title}</h4>
            <p className="text-[#4A6582] text-sm leading-relaxed font-medium">
              {step.description}
            </p>

            <div className="absolute top-4 right-8 text-5xl font-black text-[#133B6C]/5 group-hover:text-[#FD8566]/10 transition-colors pointer-events-none">
              0{index + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}