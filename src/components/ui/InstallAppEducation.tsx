"use client";

import { useState, useEffect } from "react";

export function InstallAppEducation() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    // Check if app is already installed (standalone mode)
    const isStandaloneMode = 
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      document.referrer.includes('android-app://');

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsStandalone(isStandaloneMode);
    
    // Show instructions if not installed and on mobile
    if (!isStandaloneMode && (isIOSDevice || isAndroidDevice)) {
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowInstructions(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowInstructions(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (isStandalone || !showInstructions) {
    return null;
  }

  return (
    <div className="bg-white rounded-soft-lg shadow-card-lg p-6 mb-6 border-2 border-[#00C57E]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#EFFFEE] rounded-soft-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
              Install Pikkrr App
            </h3>
            <p className="text-sm text-[#666666]">
              Get the full app experience on your phone
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[#666666] hover:text-[#1A1A1A] transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isIOS && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Tap the Share button
              </p>
              <p className="text-xs text-[#666666]">
                Look for the <span className="font-semibold">Share</span> icon at the bottom of your Safari browser
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Select "Add to Home Screen"
              </p>
              <p className="text-xs text-[#666666]">
                Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Confirm installation
              </p>
              <p className="text-xs text-[#666666]">
                Tap <span className="font-semibold">"Add"</span> in the top right corner
              </p>
            </div>
          </div>
        </div>
      )}

      {isAndroid && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Tap the Menu button
              </p>
              <p className="text-xs text-[#666666]">
                Look for the <span className="font-semibold">three dots</span> menu in your browser
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Select "Install App" or "Add to Home Screen"
              </p>
              <p className="text-xs text-[#666666]">
                Look for <span className="font-semibold">"Install app"</span> or <span className="font-semibold">"Add to Home screen"</span> option
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                Confirm installation
              </p>
              <p className="text-xs text-[#666666]">
                Tap <span className="font-semibold">"Install"</span> to add Pikkrr to your home screen
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <svg className="w-4 h-4 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Once installed, the app will work like a native app with full features</span>
        </div>
      </div>
    </div>
  );
}

