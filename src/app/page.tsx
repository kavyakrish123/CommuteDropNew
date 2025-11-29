"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformDisclaimer } from "@/components/ui/PlatformDisclaimer";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState(true);

  useEffect(() => {
    // Check if user has seen intro
    const seen = localStorage.getItem("hasSeenIntro");
    setHasSeenIntro(seen === "true");
    
    // If logged in, redirect to app
    if (user) {
      router.push("/app");
      return;
    }
    
    // If not seen intro, redirect to intro
    if (!seen) {
      router.push("/intro");
      return;
    }
  }, [user, router]);

  // Show splash/loading while checking
  if (!hasSeenIntro || !user) {
    return (
      <div className="min-h-screen bg-[#EFFFEE] flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-[#00C57E] rounded-soft-lg flex items-center justify-center mx-auto mb-8 shadow-card">
            <span className="text-6xl">📦</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Pikkrr</h1>
          <p className="text-lg text-[#666666] mb-12">Earn from your commute</p>
          <div className="w-12 h-12 border-4 border-[#00C57E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFFFEE]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] leading-tight">
            Earn from<br />
            <span className="text-[#00C57E]">Your Commute</span>
          </h1>
          <p className="text-lg md:text-xl text-[#1A1A1A] max-w-2xl mx-auto">
            Connect commuters with senders. Deliver on your way.
          </p>
        </div>

        {/* Three Column Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* For Commuters */}
          <div className="bg-white rounded-soft shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Earn</h2>
            <p className="text-sm text-[#666666]">
              Make money on your route
            </p>
          </div>

          {/* For Senders */}
          <div className="bg-white rounded-soft shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Send</h2>
            <p className="text-sm text-[#666666]">
              Affordable delivery options
            </p>
          </div>

          {/* For Environment */}
          <div className="bg-white rounded-soft shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Eco-Friendly</h2>
            <p className="text-sm text-[#666666]">
              Use existing routes
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <PlatformDisclaimer />
          <Link
            href="/auth"
            className="inline-block bg-[#00C57E] text-white px-8 py-3.5 rounded-soft text-base font-semibold hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] transition-all duration-150 shadow-card"
          >
            Start →
          </Link>
        </div>
      </div>
    </div>
  );
}

