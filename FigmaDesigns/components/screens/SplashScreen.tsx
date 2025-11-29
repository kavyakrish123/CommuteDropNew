import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';

export function SplashScreen() {
  return (
    <ScreenWrapper className="bg-[#EFFFEE]">
      <div className="flex flex-col items-center justify-center h-full p-8">
        {/* Logo/Icon */}
        <div className="w-32 h-32 bg-[#00C57E] rounded-soft-lg flex items-center justify-center mb-8 shadow-card">
          <span className="text-6xl">📦</span>
        </div>
        
        {/* App Name */}
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Pikkrr</h1>
        
        {/* Tagline */}
        <p className="text-lg text-[#666666] text-center mb-12">
          Earn from your commute
        </p>
        
        {/* Loading indicator */}
        <div className="w-12 h-12 border-4 border-[#00C57E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </ScreenWrapper>
  );
}

