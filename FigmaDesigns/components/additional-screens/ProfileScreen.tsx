import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function ProfileScreen() {
  return (
    <ScreenWrapper className="bg-[#EFFFEE]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Profile</h1>
        <button className="text-[#00C57E] text-sm font-semibold">Edit</button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-soft-lg shadow-card p-6 text-center">
          <div className="w-24 h-24 bg-[#00C57E] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-white">JD</span>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">John Doe</h2>
          <p className="text-sm text-[#666666] mb-4">+65 9123 4567</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs px-2 py-1 bg-[#EFFFEE] text-[#00C57E] rounded-full font-medium">
              ⭐ 4.8
            </span>
            <span className="text-xs text-[#666666]">12 deliveries</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-soft-lg shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-[#00C57E]">12</p>
            <p className="text-xs text-[#666666] mt-1">Deliveries</p>
          </div>
          <div className="bg-white rounded-soft-lg shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-[#00C57E]">$120</p>
            <p className="text-xs text-[#666666] mt-1">Earned</p>
          </div>
          <div className="bg-white rounded-soft-lg shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-[#00C57E]">4.8</p>
            <p className="text-xs text-[#666666] mt-1">Rating</p>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="bg-white rounded-soft-lg shadow-card divide-y divide-gray-200">
          <button className="w-full px-6 py-4 flex items-center justify-between text-left">
            <span className="text-base text-[#1A1A1A]">My Requests</span>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-6 py-4 flex items-center justify-between text-left">
            <span className="text-base text-[#1A1A1A]">Settings</span>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-6 py-4 flex items-center justify-between text-left">
            <span className="text-base text-[#1A1A1A]">Help & Support</span>
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}

