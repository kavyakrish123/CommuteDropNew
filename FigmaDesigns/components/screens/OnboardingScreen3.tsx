import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';

export function OnboardingScreen3() {
  return (
    <ScreenWrapper className="bg-white">
      <div className="flex flex-col h-full p-8">
        {/* Skip button */}
        <div className="flex justify-end mb-8">
          <button className="text-[#666666] text-sm">Skip</button>
        </div>
        
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="w-64 h-64 bg-[#EFFFEE] rounded-soft-lg flex items-center justify-center">
            <span className="text-8xl">🌱</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
            Eco-Friendly
          </h2>
          <p className="text-base text-[#666666] leading-relaxed">
            Reduce carbon emissions by using existing transportation routes.
          </p>
        </div>
        
        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-[#00C57E] rounded-full"></div>
        </div>
        
        {/* Get Started button */}
        <button className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card">
          Get Started
        </button>
      </div>
    </ScreenWrapper>
  );
}

