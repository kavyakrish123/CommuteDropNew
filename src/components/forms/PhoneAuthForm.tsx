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
  });

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    // Initialize reCAPTCHA
    if (typeof window !== "undefined" && !recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          onError("reCAPTCHA expired. Please try again.");
        },
      });
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, [onError]);

  const sendOTP = async (data: { phone: string }) => {
    try {
      setLoading(true);
      const phoneNumber = data.phone.startsWith("+") ? data.phone : `+${data.phone}`;

      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized");
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
          />
        </div>
        {phoneForm.formState.errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {phoneForm.formState.errors.phone.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Include country code if different from +65
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

