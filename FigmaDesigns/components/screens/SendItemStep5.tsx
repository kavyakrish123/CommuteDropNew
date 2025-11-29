import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';

export function SendItemStep5() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Step 5 of 5</h1>
      </div>
      
      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#00C57E] rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Review & Confirm</h2>
          <p className="text-sm text-[#666666]">Check your details before posting</p>
        </div>
        
        {/* Review Card */}
        <div className="bg-[#EFFFEE] rounded-soft-lg p-6 space-y-4">
          <div>
            <p className="text-xs text-[#666666] mb-1">Item</p>
            <p className="text-base font-semibold text-[#1A1A1A]">Documents</p>
            <p className="text-xs text-[#666666]">~200g</p>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <p className="text-xs text-[#666666] mb-1">Pickup</p>
            <p className="text-base font-semibold text-[#1A1A1A]">123456</p>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <p className="text-xs text-[#666666] mb-1">Drop-off</p>
            <p className="text-base font-semibold text-[#1A1A1A]">789012</p>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <p className="text-xs text-[#666666] mb-1">Payment</p>
            <p className="text-2xl font-bold text-[#00C57E]">$5.00</p>
          </div>
        </div>
        
        {/* Confirm Button */}
        <button className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card mt-auto">
          Post Request
        </button>
      </div>
    </ScreenWrapper>
  );
}

