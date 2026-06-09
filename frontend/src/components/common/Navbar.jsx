import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

export default function Navbar({
  showAuthButtons = true,
  isLoggedIn = false,
  setMode,
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseClasses = `
    fixed top-0 left-0 w-full
    z-50
    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
    ${scrolled ? "py-3 px-6" : "bg-transparent py-6 px-10"}
    flex items-center justify-center
  `;

  const innerClasses = `
    w-full max-w-7xl flex justify-between items-center
    transition-all duration-500
    ${scrolled ? "bg-[#FFF8F5]/80 backdrop-blur-md rounded-full px-8 py-3 ring-1 ring-[#FD8566]/20 shadow-xl" : ""}
  `;

  return (
    <nav className={baseClasses}>
      <div className={innerClasses}>
        <div
          className="relative flex items-center group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mr-3 filter drop-shadow-md"
          >
            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </motion.div>
          <span className="text-2xl font-black text-[#133B6C] tracking-tighter">SkillSync AI</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {["Features", "How It Works", "Solutions", "FAQ"].map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[#133B6C]/70 hover:text-[#133B6C] font-bold text-sm tracking-widest uppercase transition-all"
            >
              {link}
            </motion.a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {showAuthButtons && !isLoggedIn && (
            <>
              <Button variant="ghost" onClick={() => setMode?.("login")}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => setMode?.("signup")}>
                Sign Up
              </Button>
            </>
          )}
          {isLoggedIn && (
            <Button variant="primary" className="!px-6 !py-3 !text-sm">
              Log Out
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}