"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PlatformDisclaimer } from "@/components/ui/PlatformDisclaimer";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Always redirect to splash first
    if (!loading) {
      router.push("/splash");
    }
  }, [loading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#EFFFEE] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <AnimatedLogo size="lg" />
        </div>
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4 animate-fadeIn">Pikkrr</h1>
        <p className="text-lg text-[#666666] mb-12 animate-fadeIn" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>Earn from your commute</p>
        <div className="w-12 h-12 border-4 border-[#00C57E] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

