import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

/**
 * Navbar receives setMode from parent (optional).
 * If setMode is not provided, buttons will do nothing (by design).
 */
export default function Navbar({
  showAuthButtons = true,
  isLoggedIn = false,
  setMode, // <-- just receive it; no defaults here
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
    ${scrolled ? "bg-white/10 backdrop-blur-md rounded-full px-8 py-3 ring-1 ring-white/20 shadow-xl" : ""}
  `;

  return (
    <nav className={baseClasses}>
      {/* Container for alignment */}
      <div className={innerClasses}>
        {/* Logo + Brand */}
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
          <span className="text-2xl font-black text-[#3D418A] tracking-tighter">SkillmatriX</span>
        </div>

        {/* Navigation Links - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-10">
          {["Features", "Guide", "Solutions", "FAQ"].map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[#3D418A]/70 hover:text-[#3D418A] font-bold text-sm tracking-widest uppercase transition-all"
            >
              {link}
            </motion.a>
          ))}
        </div>

        {/* Right Side */}
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
