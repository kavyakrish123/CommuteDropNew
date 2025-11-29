import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';

export function LoginScreen() {
  return (
    <ScreenWrapper className="bg-[#EFFFEE]">
      <div className="flex flex-col h-full p-8">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="w-20 h-20 bg-[#00C57E] rounded-soft-lg flex items-center justify-center mx-auto mb-4 shadow-card">
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Pikkrr</h1>
          <p className="text-[#666666]">Earn from your commute</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-soft-lg shadow-card-lg p-6 space-y-6">
          {/* Phone Input */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Phone Number
            </label>
            <div className="flex rounded-soft overflow-hidden border-2 border-gray-300 focus-within:border-[#00C57E]">
              <span className="inline-flex items-center px-4 bg-gray-50 text-[#666666] font-semibold border-r-2 border-gray-300">
                +65
              </span>
              <input
                type="tel"
                placeholder="91234567"
                className="flex-1 px-4 py-3 text-base focus:outline-none"
              />
            </div>
          </div>
          
          {/* Send OTP Button */}
          <button className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card">
            Send OTP
          </button>
          
          {/* Terms */}
          <p className="text-xs text-center text-[#666666]">
            By continuing, you agree to Terms & Policies
          </p>
        </div>
      </div>
    </ScreenWrapper>
  );
}

