import React from 'react';
import { ScreenWrapper } from '../screens/ScreenWrapper';

export function RestrictedItemsScreen() {
  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button className="mr-4">
          <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Restricted Items</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="bg-red-50 border-l-4 border-red-400 rounded-soft-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Important</p>
          <p className="text-xs text-red-700">
            The following items are NOT allowed on Pikkrr
          </p>
        </div>
        
        {/* Restricted List */}
        <div className="space-y-3">
          {[
            'Cigarettes and tobacco products',
            'Alcohol and alcoholic beverages',
            'Food and perishable items',
            'Illegal items or substances',
            'Hazardous materials',
            'Items requiring special licenses'
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-soft-lg shadow-card p-4 border border-gray-200 flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-[#1A1A1A] flex-1">{item}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-[#EFFFEE] rounded-soft-lg p-4 mt-6">
          <p className="text-xs text-[#666666]">
            All deliveries must comply with Singapore laws and regulations.
          </p>
        </div>
      </div>
    </ScreenWrapper>
  );
}

