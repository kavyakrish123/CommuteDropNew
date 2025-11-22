"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneAuthSchema, otpSchema } from "@/lib/validation/schemas";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

interface PhoneAuthFormProps {
  onError: (message: string) => void;
}

export function PhoneAuthForm({ onError }: PhoneAuthFormProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();

  const phoneForm = useForm<{ phone: string }>({
    resolver: zodResolver(phoneAuthSchema),
    defaultValues: {
      phone: "",
    },
  });

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
  });

  // Cleanup effect - only runs on unmount
  useEffect(() => {
    return () => {
      // Safely cleanup recaptcha verifier on unmount
      if (recaptchaVerifierRef.current) {
        try {
          const verifier = recaptchaVerifierRef.current;
          if (verifier && typeof verifier.clear === "function") {
            verifier.clear();
          }
        } catch (error) {
          // Ignore errors during cleanup
          console.warn("Error clearing reCAPTCHA verifier:", error);
        } finally {
          recaptchaVerifierRef.current = null;
        }
      }
      // Clear the container
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  const sendOTP = async (data: { phone: string }) => {
    try {
      setLoading(true);
      // Combine country code with phone number
      // If user entered full number with country code, use it; otherwise prepend +65
      let phoneNumber = data.phone.trim();
      
      if (phoneNumber.startsWith("+")) {
        // User included country code
        phoneNumber = phoneNumber;
      } else {
        // Default to +65 (Singapore) if no country code
        phoneNumber = `+65${phoneNumber}`;
      }

      // Validate the combined phone number
      if (phoneNumber.length < 10 || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
        throw new Error("Invalid phone number format");
      }

      // Initialize recaptcha only when needed (lazy initialization)
      // This prevents CORS issues when port changes
      if (!recaptchaVerifierRef.current) {
        // Clear any existing reCAPTCHA scripts and state
        // This fixes CORS issues when port changes
        const existingScripts = document.querySelectorAll('script[src*="recaptcha"]');
        existingScripts.forEach((script) => script.remove());
        
        // Clear any existing grecaptcha from window
        if (typeof window !== "undefined" && (window as any).grecaptcha) {
          try {
            (window as any).grecaptcha = undefined;
          } catch (e) {
            // Ignore
          }
        }

        // Ensure container exists
        let container = document.getElementById("recaptcha-container");
        if (!container) {
          // Create container if it doesn't exist
          container = document.createElement("div");
          container.id = "recaptcha-container";
          document.body.appendChild(container);
        } else {
          // Clear any existing content
          container.innerHTML = "";
        }

        try {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved
            },
            "expired-callback": () => {
              onError("reCAPTCHA expired. Please try again.");
            },
          });
        } catch (error: any) {
          console.error("reCAPTCHA initialization error:", error);
          // Clear any partial initialization
          if (recaptchaVerifierRef.current) {
            try {
              recaptchaVerifierRef.current.clear();
            } catch (e) {
              // Ignore
            }
            recaptchaVerifierRef.current = null;
          }
          // Clear container
          if (container) {
            container.innerHTML = "";
          }
          throw new Error(
            "Failed to initialize reCAPTCHA. Please refresh the page and try again."
          );
        }
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierRef.current
      );

      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      // Reset recaptcha on error so it can be re-initialized
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
      onError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (data: { otp: string }) => {
    try {
      setLoading(true);
      if (!confirmationResult) {
        throw new Error("No confirmation result");
      }

      const result = await confirmationResult.confirm(data.otp);
      const user = result.user;

      // Create or update user document
      await setDoc(
        doc(db, "users", user.uid),
        {
          phone: user.phoneNumber,
          email: null,
          name: user.displayName || `User ${user.uid.slice(0, 6)}`,
          role: "both",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push("/app");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      onError("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <form onSubmit={otpForm.handleSubmit(verifyOTP)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter OTP
          </label>
          <input
            {...otpForm.register("otp")}
            type="text"
            maxLength={6}
            placeholder="000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {otpForm.formState.errors.otp && (
            <p className="mt-1 text-sm text-red-600">
              {otpForm.formState.errors.otp.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="w-full text-sm text-indigo-600 hover:text-indigo-700"
        >
          Change phone number
        </button>
        <div id="recaptcha-container"></div>
      </form>
    );
  }

  return (
    <form onSubmit={phoneForm.handleSubmit(sendOTP)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            +65
          </span>
          <input
            {...phoneForm.register("phone")}
            type="tel"
            placeholder="91234567"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onInput={(e) => {
              // Remove any non-digit characters except + at the start
              const value = (e.target as HTMLInputElement).value;
              if (value.startsWith("+")) {
                // Allow + and digits
                (e.target as HTMLInputElement).value = value.replace(/[^\d+]/g, "");
              } else {
                // Only digits if no +
                (e.target as HTMLInputElement).value = value.replace(/\D/g, "");
              }
            }}
          />
        </div>
        {phoneForm.formState.errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {phoneForm.formState.errors.phone.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter 8 digits for Singapore (+65), or include full number with country code
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
      <div id="recaptcha-container"></div>
    </form>
  );
}

