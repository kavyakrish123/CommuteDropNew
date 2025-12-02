"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { EducationBanner } from "@/components/ui/EducationBanner";

export default function IntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // If user is already logged in, redirect to app
    if (user) {
      router.push("/app");
    }
  }, [user, router]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - mark as seen and go to auth
      localStorage.setItem("hasSeenIntro", "true");
      router.push("/auth");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenIntro", "true");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button
          onClick={handleSkip}
          className="text-[#666666] text-sm font-medium hover:text-[#1A1A1A] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Education Banner */}
        <div className="w-full max-w-md mb-6">
          <EducationBanner
            title="Welcome to Pikkrr"
            content="Connect with commuters to deliver items along their route. Earn money while helping others, and reduce carbon emissions by using existing transportation."
            type="info"
          />
        </div>

        {/* Illustration */}
        <div className="w-64 h-64 bg-[#EFFFEE] rounded-soft-lg flex items-center justify-center mb-8">
          {currentStep === 1 && <span className="text-8xl">🚇</span>}
          {currentStep === 2 && <span className="text-8xl">📱</span>}
          {currentStep === 3 && <span className="text-8xl">🌱</span>}
        </div>

        {/* Content */}
        <div className="text-center mb-8 max-w-md">
          {currentStep === 1 && (
            <>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                Earn on Your Commute
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Make money by delivering items along your existing route. No detours needed.
              </p>
            </>
          )}
          {currentStep === 2 && (
            <>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                Simple & Safe
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Real-time tracking and secure OTP verification for every delivery.
              </p>
            </>
          )}
          {currentStep === 3 && (
            <>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
                Eco-Friendly
              </h2>
              <p className="text-base text-[#666666] leading-relaxed">
                Reduce carbon emissions by using existing transportation routes.
              </p>
            </>
          )}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              currentStep === 1 ? "bg-[#00C57E]" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              currentStep === 2 ? "bg-[#00C57E]" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              currentStep === 3 ? "bg-[#00C57E]" : "bg-gray-300"
            }`}
          ></div>
        </div>

        {/* Next/Get Started button */}
        <button
          onClick={handleNext}
          className="w-full max-w-md bg-[#00C57E] text-white py-4 rounded-soft-lg font-semibold shadow-card hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] transition-all duration-150"
        >
          {currentStep === 3 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
