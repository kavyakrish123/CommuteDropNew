"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PlatformDisclaimer } from "@/components/ui/PlatformDisclaimer";

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

