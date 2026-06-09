import React from "react";
import { Globe, Shield, Brain, Zap } from "lucide-react";

export default function Footer() {
  const creators = [
    { name: "Suhaima Khan", linkedin: "https://www.linkedin.com/in/suhaima-khan-714a92333/" },
    { name: "Hafsa Ather Khan", linkedin: "https://www.linkedin.com/in/hafsa-ather-khan/" },
    { name: "Hafsa Yousuf", linkedin: "https://www.linkedin.com/in/hafsa-yousuf-6bb107334/" },
    { name: "Maryam Yasir", linkedin: "https://www.linkedin.com/in/maryam-yasir/"}
  ];

  return (
    <footer className="w-full bg-[#0D2847] text-white/70 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-4 border border-white/10 backdrop-blur-md">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">SkillSync AI</span>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
              A proof-based freelancing platform powered by 5 autonomous AI agents. 
              Replace fake profiles with verified Skill DNA and Trust Scores.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FD8566]">
                <Shield className="w-4 h-4" /> Trust Score
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#5F90D4]">
                <Brain className="w-4 h-4" /> Skill DNA
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FD8566]">
                <Zap className="w-4 h-4" /> Live Challenges
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-8">
            <h4 className="text-[#FD8566] font-black uppercase text-xs tracking-[0.2em]">Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#features" className="hover:text-white transition-colors">Skill Verification</a></li>
              <li><a href="#guide" className="hover:text-white transition-colors">Trust Score</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Live Challenges</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Proof-of-Work</a></li>
            </ul>
          </div>

          {/* Team */}
          <div className="space-y-8">
            <h4 className="text-[#A8BEDD] font-black uppercase text-xs tracking-[0.2em]">The Engineering Team</h4>
            <ul className="space-y-4">
              {creators.map((creator, i) => (
                <li key={i}>
                  <a
                    href={creator.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-white transition-colors text-sm font-bold group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#133B6C]/40 transition-colors">
                      <Globe className="w-4 h-4 text-white/50 group-hover:text-[#FD8566]" />
                    </div>
                    {creator.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <div>© 2025 SkillSync AI Engineering. All rights reserved.</div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}