"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showBackground?: boolean;
  className?: string;
}

export function AnimatedLogo({ 
  size = "md", 
  showBackground = true,
  className = "" 
}: AnimatedLogoProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

  const imageSizes = {
    sm: 64,
    md: 80,
    lg: 128,
    xl: 160,
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${showBackground ? "bg-[#00C57E]" : ""}
        rounded-soft-lg
        flex
        items-center
        justify-center
        shadow-card
        relative
        overflow-hidden
        ${className}
        ${isVisible ? "animate-fade-in-scale" : "opacity-0 scale-90"}
      `}
    >
      {/* Animated background gradient */}
      {showBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C57E] via-[#00A869] to-[#00995A] animate-pulse-slow opacity-80" />
      )}
      
      {/* Icon with bounce animation */}
      <div className="relative z-10 animate-bounce-slow">
        <Image
          src="/pikkrr-icon.png"
          alt="Pikkrr"
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="drop-shadow-lg"
          priority
        />
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
    </div>
  );
}

