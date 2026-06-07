import React, { useState, forwardRef } from "react";
import { motion } from "framer-motion";

const Button = forwardRef(function Button(
  { children, className = "", variant = "primary", onClick, ...props },
  ref
) {
  const [rippleArray, setRippleArray] = useState([]);

  const createRipple = (e) => {
    const button = e.currentTarget;
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = e.nativeEvent.offsetX - size / 2;
    const y = e.nativeEvent.offsetY - size / 2;

    const newRipple = { x, y, size, key: Date.now() };
    setRippleArray((prev) => [...prev, newRipple]);

    // ripple cleanup
    setTimeout(() => {
      setRippleArray((prev) => prev.filter((r) => r.key !== newRipple.key));
    }, 600);

    // parent onClick (sync) — popup blockers friendly
    if (typeof onClick === "function") onClick(e);
  };

  const variants = {
    primary:
      "bg-[#4144a3] text-white hover:bg-[#343782] shadow-[0_4px_14px_0_rgba(65,68,163,0.39)] hover:shadow-[0_6px_20px_rgba(65,68,163,0.23)]",
    secondary:
      "bg-gradient-to-br from-[#5D5FEF] via-[#7B7FE0] to-[#4144A3] text-white hover:from-[#6B6DFF] hover:via-[#8C8FFF] hover:to-[#4D50B5] shadow-[0_10px_30px_-5px_rgba(93,95,239,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(93,95,239,0.7)] border-t border-white/30",
    outline:
      "bg-transparent border-2 border-[#4144a3] text-[#3D418A] hover:bg-[#4144a3] hover:text-white shadow-none hover:shadow-lg",
    white:
      "bg-white text-[#3D418A] hover:bg-[#f0fff9] shadow-xl hover:shadow-2xl",
    ghost:
      "bg-transparent text-[#3D418A] hover:bg-[#4144A3] hover:text-white shadow-none",
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      {...props}
      onClick={createRipple}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        relative overflow-hidden px-8 py-4 font-bold rounded-full
        transition-all duration-300 active:scale-95
        flex items-center justify-center gap-2
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {/* ripple effect */}
      {rippleArray.map((ripple) => (
        <span
          key={ripple.key}
          className="absolute bg-white/20 rounded-full animate-ripple"
          style={{
            width: ripple.size,
            height: ripple.size,
            top: ripple.y,
            left: ripple.x,
          }}
        />
      ))}

      {/* Glossy Overlay */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
});

export default Button;
