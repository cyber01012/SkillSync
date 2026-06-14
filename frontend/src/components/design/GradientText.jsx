import React from "react";

export default function GradientText({
  children,
  colors = ["#133B6C", "#5F90D4", "#FD8566"],
  animationSpeed = 4, 
  className = "",
  style = {},
}) {
  return (
    <span
      className={`text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "300% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        animation: `gradientMove ${animationSpeed}s ease-in-out infinite`,
        ...style, 
      }}
    >
      {children}
    </span>
  );
}