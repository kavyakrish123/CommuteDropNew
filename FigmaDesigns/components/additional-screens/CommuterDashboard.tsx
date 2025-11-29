import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function CommuterDashboard() {
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
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex">
        <button className="flex-1 py-3 text-center font-semibold text-[#00C57E] border-b-2 border-[#00C57E]">
          Available
        </button>
        <button className="flex-1 py-3 text-center font-medium text-[#666666]">
          My Tasks
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Available Task Card */}
        <div className="bg-white rounded-soft-lg shadow-card p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs px-2 py-1 bg-[#EFFFEE] text-[#00C57E] rounded-full font-medium">
              Open
            </span>
            <span className="text-xs text-[#666666]">5 min ago</span>
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Document Delivery</p>
          <p className="text-xs text-[#666666] mb-2">123456 → 789012</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-[#00C57E]">$5</p>
            <button className="px-4 py-2 bg-[#00C57E] text-white rounded-soft-lg text-sm font-semibold">
              Accept
            </button>
          </div>
        </div>
        
        {/* Another Task Card */}
        <div className="bg-white rounded-soft-lg shadow-card p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs px-2 py-1 bg-[#EFFFEE] text-[#00C57E] rounded-full font-medium">
              Open
            </span>
            <span className="text-xs text-[#666666]">12 min ago</span>
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Small Package</p>
          <p className="text-xs text-[#666666] mb-2">456789 → 123456</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-[#00C57E]">$8</p>
            <button className="px-4 py-2 bg-[#00C57E] text-white rounded-soft-lg text-sm font-semibold">
              Accept
            </button>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}

