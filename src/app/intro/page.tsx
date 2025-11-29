"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save that user has seen intro
      localStorage.setItem("hasSeenIntro", "true");
      router.push("/auth");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenIntro", "true");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentStep === 1 && (
          <div className="flex flex-col h-[600px] p-8">
            <div className="flex justify-end mb-8">
              <button
                onClick={handleSkip}
                className="text-[#666666] text-sm font-medium"
              >
                Skip
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center mb-8">
              <div className="w-64 h-64 bg-[#EFFFEE] rounded-soft-lg flex items-center justify-center">
                <span className="text-8xl">🚇</span>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                Earn on Your Commute
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Make money by delivering items along your existing route. No detours needed.
              </p>
            </div>
            
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-2 h-2 bg-[#00C57E] rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card hover:bg-[#00A869] active:bg-[#00995A] transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col h-[600px] p-8">
            <div className="flex justify-end mb-8">
              <button
                onClick={handleSkip}
                className="text-[#666666] text-sm font-medium"
              >
                Skip
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center mb-8">
              <div className="w-64 h-64 bg-[#EFFFEE] rounded-soft-lg flex items-center justify-center">
                <span className="text-8xl">📱</span>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                Simple & Safe
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Real-time tracking and secure OTP verification for every delivery.
              </p>
            </div>
            
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-[#00C57E] rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card hover:bg-[#00A869] active:bg-[#00995A] transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col h-[600px] p-8">
            <div className="flex justify-end mb-8">
              <button
                onClick={handleSkip}
                className="text-[#666666] text-sm font-medium"
              >
                Skip
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center mb-8">
              <div className="w-64 h-64 bg-[#EFFFEE] rounded-soft-lg flex items-center justify-center">
                <span className="text-8xl">🌱</span>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                Eco-Friendly
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Reduce carbon emissions by using existing transportation routes.
              </p>
            </div>
            
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-[#00C57E] rounded-full"></div>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card hover:bg-[#00A869] active:bg-[#00995A] transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

