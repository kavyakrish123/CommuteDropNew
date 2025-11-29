import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function DesignSystemShowcase() {
  return (
    <ScreenWrapper className="bg-white">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Design System</h2>
        
        {/* Colors */}
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#00C57E] rounded-soft-lg p-4 text-white text-center">
              <p className="font-semibold">Primary</p>
              <p className="text-xs">#00C57E</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-soft-lg p-4 text-white text-center">
              <p className="font-semibold">Dark</p>
              <p className="text-xs">#1A1A1A</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-soft-lg p-4 text-center">
              <p className="font-semibold text-[#1A1A1A]">White</p>
              <p className="text-xs text-[#666666]">#FFFFFF</p>
            </div>
            <div className="bg-[#EFFFEE] rounded-soft-lg p-4 text-center">
              <p className="font-semibold text-[#1A1A1A]">Mint</p>
              <p className="text-xs text-[#666666]">#EFFFEE</p>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Buttons</h3>
          <div className="space-y-3">
            <button className="w-full bg-[#00C57E] text-white py-3 rounded-soft-lg font-semibold shadow-card">
              Primary Button
            </button>
            <button className="w-full border-2 border-[#00C57E] text-[#00C57E] py-3 rounded-soft-lg font-semibold">
              Secondary Button
            </button>
          </div>
        </div>
        
        {/* Cards */}
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Cards</h3>
          <div className="bg-white rounded-soft-lg shadow-card p-4 border border-gray-200">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Card Example</p>
            <p className="text-xs text-[#666666]">Soft corners, floating shadow</p>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}

