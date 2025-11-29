import React from 'react';

// Base wrapper for all mobile screens (390x844)
export function ScreenWrapper({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div 
      className={`w-[390px] h-[844px] bg-white rounded-2xl shadow-card-lg overflow-hidden flex flex-col ${className}`}
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      }}
    >
      {children}
    </div>
  );
}

