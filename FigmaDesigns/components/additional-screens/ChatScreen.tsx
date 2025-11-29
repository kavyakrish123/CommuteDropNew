import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function ChatScreen() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[#1A1A1A]">John Doe</h1>
          <p className="text-xs text-[#666666]">Online</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Received Message */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-[#EFFFEE] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm">JD</span>
          </div>
          <div className="bg-gray-100 rounded-soft-lg px-4 py-2 max-w-[70%]">
            <p className="text-sm text-[#1A1A1A]">Hi, I'm on my way to pickup</p>
            <p className="text-xs text-[#666666] mt-1">10:30 AM</p>
          </div>
        </div>
        
        {/* Sent Message */}
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-[#00C57E] rounded-soft-lg px-4 py-2 max-w-[70%]">
            <p className="text-sm text-white">Thanks! I'll be ready</p>
            <p className="text-xs text-white/80 mt-1">10:31 AM</p>
          </div>
          <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm text-white">Me</span>
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-soft-lg focus:border-[#00C57E] focus:outline-none"
          />
          <button className="w-10 h-10 bg-[#00C57E] text-white rounded-soft-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}

