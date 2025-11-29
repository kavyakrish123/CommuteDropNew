import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function AcceptedTaskScreen() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Task Details</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Status Banner */}
        <div className="bg-[#EFFFEE] rounded-soft-lg p-4 border border-[#00C57E]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#00C57E] rounded-full"></div>
            <p className="text-sm font-semibold text-[#00C57E]">Accepted</p>
          </div>
          <p className="text-xs text-[#666666]">Waiting for pickup confirmation</p>
        </div>
        
        {/* Task Info */}
        <div className="bg-white rounded-soft-lg shadow-card p-6 space-y-4 border border-gray-200">
          <div>
            <p className="text-xs text-[#666666] mb-1">Item</p>
            <p className="text-base font-semibold text-[#1A1A1A]">Documents</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-[#666666] mb-2">Pickup</p>
            <p className="text-base font-semibold text-[#1A1A1A] mb-1">123456</p>
            <p className="text-xs text-[#666666]">Building name, unit number</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-[#666666] mb-2">Drop-off</p>
            <p className="text-base font-semibold text-[#1A1A1A] mb-1">789012</p>
            <p className="text-xs text-[#666666]">Building name, unit number</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-[#666666] mb-1">Payment</p>
            <p className="text-2xl font-bold text-[#00C57E]">$5.00</p>
          </div>
        </div>
        
        {/* Action Button */}
        <button className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card">
          Start Pickup
        </button>
      </div>
    </ScreenWrapper>
  );
}

