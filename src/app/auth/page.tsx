"use client";

import Link from "next/link";
import { PhoneAuthForm } from "@/components/forms/PhoneAuthForm";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";

export default function AuthPage() {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFFFEE] px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-12 mt-8">
          <div className="flex justify-center mb-6">
            <AnimatedLogo size="md" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 animate-fadeIn">Pikkrr</h1>
          <p className="text-[#666666] animate-fadeIn" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>Earn from your commute</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-soft-lg shadow-card-lg p-6 space-y-6">
          {/* Phone Auth Form */}
          <PhoneAuthForm onError={(msg) => showToast(msg, "error")} />

          {/* Terms Link */}
          <p className="text-xs text-center text-[#666666]">
            By continuing, you agree to{" "}
            <Link
              href="/terms"
              className="text-[#00C57E] hover:text-[#00A869] underline"
            >
              Terms & Policies
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

