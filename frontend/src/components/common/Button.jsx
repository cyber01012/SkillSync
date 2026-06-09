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

    setTimeout(() => {
      setRippleArray((prev) => prev.filter((r) => r.key !== newRipple.key));
    }, 600);

    if (typeof onClick === "function") onClick(e);
  };

  const variants = {
    primary:
      "bg-[#133B6C] text-white hover:bg-[#0D2847] shadow-[0_4px_14px_0_rgba(19,59,108,0.39)] hover:shadow-[0_6px_20px_rgba(19,59,108,0.23)]",
    secondary:
      "bg-gradient-to-br from-[#FD8566] via-[#E86A4A] to-[#D05438] text-white hover:from-[#FF9A7D] hover:via-[#F08060] hover:to-[#E07058] shadow-[0_10px_30px_-5px_rgba(253,133,102,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(253,133,102,0.7)] border-t border-white/30",
    outline:
      "bg-transparent border-2 border-[#133B6C] text-[#133B6C] hover:bg-[#133B6C] hover:text-white shadow-none hover:shadow-lg",
    white:
      "bg-white text-[#133B6C] hover:bg-[#FFF8F5] shadow-xl hover:shadow-2xl",
    ghost:
      "bg-transparent text-[#133B6C] hover:bg-[#133B6C] hover:text-white shadow-none",
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

      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
});

export default Button;