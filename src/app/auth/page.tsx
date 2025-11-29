"use client";

import Link from "next/link";
import { PhoneAuthForm } from "@/components/forms/PhoneAuthForm";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function AuthPage() {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl shadow-lg mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pikkrr</h1>
          <p className="text-gray-600">Earn from your commute</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100">
          {/* Phone Auth Form */}
          <PhoneAuthForm onError={(msg) => showToast(msg, "error")} />

          {/* Terms Link */}
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/terms"
              className="text-sm text-center text-gray-600 hover:text-green-600 active:text-green-700 block transition-colors duration-150"
            >
              By continuing, you agree to Terms & Policies
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

