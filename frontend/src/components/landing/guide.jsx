import React from "react";
import { FileText, Target, MapPin, Briefcase } from "lucide-react";

export default function Guide() {
  const steps = [
    {
      title: "Intelligent Extraction",
      description: "Our AI engine automatically parses your profile to identify unique skill signatures and expertise.",
      icon: FileText,
      color: "from-[#c86ad6] to-[#a135b4]",
      iconColor: "text-[#c86ad6]",
    },
    {
      title: "Gap Identification",
      description: "Instantly compare your current profile against global industry standards to pinpoint growth areas.",
      icon: Target,
      color: "from-[#2ed386] to-[#26B291]",
      iconColor: "text-[#2ed386]",
    },
    {
      title: "Strategic Matching",
      description: "Advanced algorithms prioritize career paths and opportunities that maximize your long-term success.",
      icon: Briefcase,
      color: "from-[#c86ad6] to-[#a135b4]",
      iconColor: "text-[#c86ad6]",
    },
    {
      title: "Interactive Roadmap",
      description: "Receive a step-by-step career acceleration plan featuring high-impact milestones and technical goals.",
      icon: MapPin,
      color: "from-[#2ed386] to-[#26B291]",
      iconColor: "text-[#2ed386]",
    },
  ];

  return (
    <section id="guide" className="py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-[#3D418A] font-black tracking-widest uppercase text-xs mb-4 !opacity-100">The Logic Layer</h2>
        <h3 className="text-4xl md:text-5xl font-black text-[#3D418A] !opacity-100">Technical <span className="text-[#2ed386]">Workflow</span></h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-white hover:border-white transition-all hover:shadow-2xl hover:-translate-y-2"
          >
            <div className={`w-16 h-16 rounded-[1.2rem] bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <step.icon className="text-white w-8 h-8" />
            </div>

            <h4 className="text-[#3D418A] text-xl font-black mb-3">{step.title}</h4>
            <p className="text-[#3D418A] text-sm leading-relaxed font-medium">
              {step.description}
            </p>

            {/* Step Number Overlay */}
            <div className="absolute top-4 right-8 text-5xl font-black text-[#3D418A]/5 group-hover:text-[#3D418A]/10 transition-colors pointer-events-none">
              0{index + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
