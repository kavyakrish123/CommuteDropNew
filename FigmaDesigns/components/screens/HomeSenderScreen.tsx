import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';

export function HomeSenderScreen() {
  return (
    <ScreenWrapper className="bg-[#EFFFEE]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            <span className="text-[#00C57E]">Pikk</span>
            <span className="text-[#1A1A1A]">rr</span>
          </h1>
          <button className="p-2">
            <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-soft-lg shadow-card p-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Send an Item</h2>
          <p className="text-sm text-[#666666] mb-4">
            Create a delivery request and find a commuter
          </p>
          <button className="w-full bg-[#00C57E] text-white py-3 rounded-soft-lg font-semibold shadow-card">
            + Create Request
          </button>
        </div>
        
        {/* My Requests */}
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">My Requests</h3>
          <div className="space-y-3">
            {/* Request Card Example */}
            <div className="bg-white rounded-soft-lg shadow-card p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-1 bg-[#EFFFEE] text-[#00C57E] rounded-full font-medium">
                  Open
                </span>
                <span className="text-xs text-[#666666]">2h ago</span>
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Document Delivery</p>
              <p className="text-xs text-[#666666]">123456 → 789012</p>
              <p className="text-sm font-bold text-[#00C57E] mt-2">$5</p>
            </div>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}

