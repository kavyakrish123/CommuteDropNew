"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";

export default function SplashPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Wait a bit for splash effect
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (authLoading) return;

      if (!user) {
        // Check if user has seen intro
        const hasSeenIntro = localStorage.getItem("hasSeenIntro");
        if (hasSeenIntro === "true") {
          router.push("/auth");
        } else {
          router.push("/intro");
        }
        return;
      }

      // Check if user has completed onboarding
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (!userData?.onboardingCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/app");
        }
      } catch (error) {
        console.error("Error checking user:", error);
        router.push("/auth");
      }
    };

    checkUserAndRedirect();
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-[#EFFFEE] flex flex-col items-center justify-center p-8">
      {/* Logo/Icon */}
      <div className="mb-8">
        <AnimatedLogo size="lg" />
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4 animate-fadeIn">Pikkrr</h1>

      {/* Tagline */}
      <p className="text-lg text-[#666666] text-center mb-12 animate-fadeIn" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
        Earn from your commute
      </p>

      {/* Loading indicator */}
      <div className="w-12 h-12 border-4 border-[#00C57E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

