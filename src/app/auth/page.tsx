"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneAuthForm } from "@/components/forms/PhoneAuthForm";
import { EmailAuthForm } from "@/components/forms/EmailAuthForm";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CommuteDrop</h1>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
            <Link
              href="/terms"
              className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
            >
              View Terms & Policies
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setAuthMode("phone")}
              className={`flex-1 py-2 text-center font-medium ${
                authMode === "phone"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Phone Login
            </button>
            <button
              onClick={() => setAuthMode("email")}
              className={`flex-1 py-2 text-center font-medium ${
                authMode === "email"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Email (Dev)
            </button>
          </div>

          {/* Forms */}
          <div className="mt-6">
            {authMode === "phone" ? (
              <PhoneAuthForm onError={(msg) => showToast(msg, "error")} />
            ) : (
              <EmailAuthForm onError={(msg) => showToast(msg, "error")} />
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

