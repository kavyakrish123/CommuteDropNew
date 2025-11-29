import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function TrackingScreen() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Live Tracking</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Map Area */}
        <div className="flex-1 bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00C57E] rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#666666]">Map View</p>
            </div>
          </div>
        </div>
        
        {/* Status Card */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-[#00C57E] rounded-full animate-pulse"></div>
            <p className="text-base font-semibold text-[#1A1A1A]">In Transit</p>
          </div>
          <p className="text-sm text-[#666666] mb-4">Estimated arrival: 15 minutes</p>
          <button className="w-full bg-[#00C57E] text-white py-3 rounded-soft-lg font-semibold">
            Contact Commuter
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}

