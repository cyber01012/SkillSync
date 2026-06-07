import React from "react";

export default function GradientText({
  children,
  colors = ["#3A3A87", "#2383A6", "#A354B5"],

  animationSpeed = 4, 
  className = "",
  style = {},
}) {
  return (
    <span
      className={`inline-block text-transparent ${className}`}
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
