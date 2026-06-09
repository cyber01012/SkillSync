import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Laptop, ArrowRight } from "lucide-react";

export default function RoleSelection({ onSelectRole, onLoginClick }) {
  const roles = [
    {
      id: "client",
      title: "Client",
      subtitle: "Post jobs and hire verified talent",
      icon: Briefcase,
      gradient: "from-[#133B6C]/10 to-[#5F90D4]/10",
      hoverGradient: "from-[#133B6C]/20 to-[#5F90D4]/20",
      iconColor: "#133B6C",
    },
    {
      id: "freelancer",
      title: "Freelancer",
      subtitle: "Verify skills and get hired",
      icon: Laptop,
      gradient: "from-[#FD8566]/10 to-[#FFA88F]/10",
      hoverGradient: "from-[#FD8566]/20 to-[#FFA88F]/20",
      iconColor: "#FD8566",
    },
  ];

  return (
    <div className="w-full h-full bg-[#FFF8F5] flex flex-col items-center justify-center px-6 py-8">
      {/* Title Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black text-[#133B6C] mb-2">
          Welcome to SkillSync
        </h1>
        <p className="text-[#4A6582] font-medium">
          Which describes you best?
        </p>
      </motion.div>

      {/* Role Cards */}
      <div className="flex flex-col md:flex-row gap-6 max-w-2xl w-full">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole(role.id)}
            className="flex-1 group relative bg-white rounded-3xl border border-[#E2D5CF] hover:border-[#FD8566]/40 
                       p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-[#FD8566]/10"
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${role.gradient} group-hover:${role.hoverGradient} transition-all duration-300`} />

            <div className="relative z-10">
              {/* Icon container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFF8F5] to-[#FEF6F2] 
                              border border-[#E2D5CF] flex items-center justify-center mb-4
                              group-hover:border-[#FD8566]/30 transition-all duration-300">
                <role.icon 
                  className="w-8 h-8 transition-colors duration-300" 
                  style={{ color: role.iconColor }}
                />
              </div>

              {/* Title with arrow */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-[#133B6C] group-hover:text-[#FD8566] transition-colors">
                  {role.title}
                </h3>
                <ArrowRight className="w-4 h-4 text-[#133B6C]/40 group-hover:text-[#FD8566] group-hover:translate-x-1 transition-all" />
              </div>

              {/* Subtitle */}
              <p className="text-xs text-[#4A6582] font-medium leading-relaxed">
                {role.subtitle}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-sm text-[#4A6582]"
      >
        Already have an account?{" "}
        <button 
          onClick={onLoginClick}
          className="text-[#FD8566] font-bold hover:underline underline-offset-2 transition-colors"
        >
          Log in
        </button>
      </motion.p>
    </div>
  );
}