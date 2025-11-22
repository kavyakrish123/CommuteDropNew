"use client";

import Link from "next/link";
import { PhoneAuthForm } from "@/components/forms/PhoneAuthForm";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function AuthPage() {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CommuteDrop</h1>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
            <Link
              href="/terms"
              className="text-sm text-indigo-600 hover:text-indigo-700 active:text-indigo-800 mt-2 inline-block transition-colors duration-150"
            >
              View Terms & Policies
            </Link>
          </div>

          {/* Phone Auth Form */}
          <div className="mt-6">
            <PhoneAuthForm onError={(msg) => showToast(msg, "error")} />
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

