"use client";

import { useState, useEffect } from "react";
import { InstallAppEducation } from "./InstallAppEducation";

export function InstallAppButton() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    const isStandaloneMode = 
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      document.referrer.includes('android-app://');

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsStandalone(isStandaloneMode);
  }, []);

  if (isStandalone) {
    return null; // Already installed
  }

  if (!isIOS && !isAndroid) {
    return null; // Not mobile
  }

  return (
    <>
      <button
        onClick={() => setShowEducation(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#00C57E] text-white rounded-soft-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] transition-all duration-150 shadow-card text-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Install App
      </button>

      {showEducation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowEducation(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-soft-lg shadow-card-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Install Pikkrr App</h3>
                <button
                  onClick={() => setShowEducation(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-semibold mb-2">
                    📱 Works Like a Native App
                  </p>
                  <p className="text-xs text-blue-800">
                    Once installed, Pikkrr will work just like a native app with full features, offline support, and faster performance.
                  </p>
                </div>

                {isIOS && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                          Tap the Share button
                        </p>
                        <p className="text-xs text-[#666666]">
                          Look for the <span className="font-semibold">Share</span> icon (square with arrow) at the bottom of Safari
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
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#00C57E] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                          Tap the Menu button
                        </p>
                        <p className="text-xs text-[#666666]">
                          Look for the <span className="font-semibold">three dots</span> menu (⋮) in your browser
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

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-[#666666]">
                    <svg className="w-4 h-4 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Once installed, the app will work like a native app with full features and faster performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

