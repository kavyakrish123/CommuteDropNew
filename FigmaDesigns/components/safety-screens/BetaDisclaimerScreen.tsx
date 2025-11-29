import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function BetaDisclaimerScreen() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Beta Terms</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-soft-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Beta Testing Phase</p>
          <p className="text-xs text-yellow-700">
            Pikkrr is currently in BETA TESTING. This is an experimental platform.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">Platform Model</h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              Pikkrr is a peer-to-peer marketplace that connects senders with commuters. 
              We are NOT a logistics company.
            </p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">User Responsibility</h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              Users interact directly with each other. We facilitate connections but do not 
              handle deliveries, disputes, or payments.
            </p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">Limitations</h3>
            <ul className="text-sm text-[#666666] space-y-1 list-disc list-inside">
              <li>Items must be less than 1kg</li>
              <li>Tasks expire after 60 minutes</li>
              <li>Maximum 3 active pickups at a time</li>
            </ul>
          </div>
        </div>
        
        <button className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card mt-6">
          I Understand
        </button>
      </div>
    </ScreenWrapper>
  );
}

