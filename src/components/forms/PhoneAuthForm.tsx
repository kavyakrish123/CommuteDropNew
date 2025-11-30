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
import { doc, setDoc, getDoc, query, where, collection, getDocs, serverTimestamp } from "firebase/firestore";
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
      const phoneNumber = user.phoneNumber;

      if (!phoneNumber) {
        throw new Error("Phone number not available");
      }

      // Normalize phone number for consistent comparison (remove spaces, ensure + prefix)
      const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

      // First, check if user document exists by UID
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      // Also check if a user with this phone number already exists (to handle cases where Firebase creates new UID)
      let existingUserByPhone = null;
      let existingUserDocId = null;
      
      // Always check by phone number to find existing users, regardless of UID match
      try {
        const phoneQuery = query(
          collection(db, "users"),
          where("phone", "==", normalizedPhone)
        );
        const phoneQuerySnapshot = await getDocs(phoneQuery);
        if (!phoneQuerySnapshot.empty) {
          // Get the first matching user (should only be one per phone number)
          const existingDoc = phoneQuerySnapshot.docs[0];
          existingUserByPhone = existingDoc.data();
          existingUserDocId = existingDoc.id;
          console.log("Found existing user by phone:", existingUserDocId, existingUserByPhone?.onboardingCompleted);
        }
      } catch (error: any) {
        // If query fails (e.g., missing index), log but continue
        console.warn("Error querying users by phone:", error);
        if (error?.code === "failed-precondition") {
          console.error("Firestore index required for phone query. Check console for link.");
        }
      }

      // Determine if user has completed onboarding (check both UID-based and phone-based)
      // Priority: 1) Check by UID first, 2) Then check by phone number
      const hasCompletedOnboarding = 
        (userDoc.exists() && userData?.onboardingCompleted === true) ||
        (existingUserByPhone?.onboardingCompleted === true);
      
      console.log("Onboarding check:", {
        uid: user.uid,
        phone: normalizedPhone,
        uidExists: userDoc.exists(),
        uidOnboardingCompleted: userData?.onboardingCompleted,
        phoneUserFound: !!existingUserByPhone,
        phoneUserDocId: existingUserDocId,
        phoneUserOnboardingCompleted: existingUserByPhone?.onboardingCompleted,
        hasCompletedOnboarding
      });

      if (hasCompletedOnboarding) {
        // Existing user with completed onboarding: migrate their data to current UID
        const existingData = existingUserByPhone || userData;
        await setDoc(
          userDocRef,
          {
            phone: normalizedPhone,
            email: existingData?.email || null,
            name: existingData?.name || user.displayName || `User ${user.uid.slice(0, 6)}`,
            role: existingData?.role || "both",
            profileImage: existingData?.profileImage || null,
            bio: existingData?.bio || null,
            payNowQR: existingData?.payNowQR || null,
            policiesAccepted: true,
            onboardingCompleted: true, // Preserve onboarding status
            rating: existingData?.rating || null,
            totalDeliveries: existingData?.totalDeliveries || 0,
            createdAt: existingData?.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        
        // If we found an existing user with a different UID, we keep both documents
        // (the old one will remain but the new one will be used going forward)
        // This is safer than deleting, in case there are references to the old UID
        
        router.push("/app");
      } else {
        // New user or user without completed onboarding: create/update with default values
        await setDoc(
          userDocRef,
          {
            phone: normalizedPhone,
            email: null,
            name: userData?.name || existingUserByPhone?.name || user.displayName || `User ${user.uid.slice(0, 6)}`,
            role: userData?.role || existingUserByPhone?.role || "both",
            policiesAccepted: true, // User must have viewed terms before reaching here
            onboardingCompleted: false, // Will be set after onboarding
            createdAt: userData?.createdAt || existingUserByPhone?.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        router.push("/onboarding");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      onError("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Big OTP Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#00C57E] rounded-full flex items-center justify-center shadow-card">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Enter Code</h2>
          <p className="text-gray-600 text-sm">
            Code sent to<br />
            <span className="font-semibold text-gray-900">
              {phoneForm.getValues("phone") || "your phone"}
            </span>
          </p>
        </div>

        <form onSubmit={otpForm.handleSubmit(verifyOTP)} className="space-y-6">
          {/* OTP Input - Large and Modern */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
              Code
            </label>
            <input
              {...otpForm.register("otp")}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              autoFocus
              className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest border-2 border-gray-300 rounded-soft-lg focus:ring-4 focus:ring-[#00C57E]/20 focus:border-[#00C57E] transition-all duration-200 bg-white text-black"
              style={{ letterSpacing: "0.5em", color: "#000000", fontWeight: 700 }}
              onInput={(e) => {
                // Only allow digits
                const value = (e.target as HTMLInputElement).value.replace(/\D/g, "");
                (e.target as HTMLInputElement).value = value;
              }}
            />
            {otpForm.formState.errors.otp && (
              <p className="mt-2 text-sm text-red-600 text-center">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00C57E] text-white py-4 px-6 rounded-soft-lg font-bold text-lg hover:bg-[#00A869] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 shadow-card"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify"
            )}
          </button>

          {/* Change Phone Number */}
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-gray-600 hover:text-gray-900 active:text-gray-700 transition-colors duration-150 py-2"
          >
            ← Change number
          </button>
        </form>
        <div id="recaptcha-container"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Big Phone Icon */}
      <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#00C57E] rounded-full flex items-center justify-center shadow-card">
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
      </div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Phone Number</h2>
          <p className="text-gray-600 text-sm">
            We'll send a code via SMS
          </p>
        </div>

      <form onSubmit={phoneForm.handleSubmit(sendOTP)} className="space-y-6">
        {/* Phone Input - Large and Modern */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Phone Number
          </label>
          <div className="flex rounded-soft-lg overflow-hidden border-2 border-gray-300 focus-within:border-[#00C57E] focus-within:ring-4 focus-within:ring-[#00C57E]/20 transition-all duration-200 bg-white">
            <span className="inline-flex items-center px-4 bg-gray-50 text-gray-700 font-semibold text-lg border-r-2 border-gray-300">
              +65
            </span>
            <input
              {...phoneForm.register("phone")}
              type="tel"
              inputMode="tel"
              placeholder="91234567"
              className="flex-1 px-6 py-4 text-lg font-bold focus:outline-none bg-transparent text-black"
              style={{ color: "#000000", fontWeight: 700 }}
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
            <p className="mt-2 text-sm text-red-600">
              {phoneForm.formState.errors.phone.message}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            8 digits for Singapore, or full number
          </p>
        </div>

        {/* Send OTP Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00C57E] text-white py-4 px-6 rounded-soft-lg font-bold text-lg hover:bg-[#00A869] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 shadow-card"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>
      <div id="recaptcha-container"></div>
    </div>
  );
}

