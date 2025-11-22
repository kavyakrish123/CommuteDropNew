"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { z } from "zod";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";


export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [payNowQR, setPayNowQR] = useState<File | null>(null);
  const [payNowQRUrl, setPayNowQRUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<{ name: string; bio: string }>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
        bio: z
          .string()
          .min(10, "Bio must be at least 10 characters")
          .max(200, "Bio must be less than 200 characters"),
      })
    ),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "paynow") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    if (type === "profile") {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPayNowQR(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPayNowQRUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (data: { name: string; bio: string }) => {
    if (!user) return;

    if (step === 1) {
      // Validate step 1 fields
      if (!data.name || data.name.length < 2) {
        showToast("Please enter a valid name (at least 2 characters)", "error");
        return;
      }
      if (!profileImage) {
        showToast("Please upload a profile image", "error");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      // Validate step 2 fields
      if (!data.bio || data.bio.length < 10) {
        showToast("Please enter a bio (at least 10 characters)", "error");
        return;
      }
      setStep(3);
      return;
    }

    // Step 3: Final submit
    try {
      setUploading(true);

      let profileImageUrl_final: string | null = null;
      let payNowQRUrl_final: string | null = null;

      // Upload profile image
      if (profileImage) {
        profileImageUrl_final = await uploadImage(
          profileImage,
          `users/${user.uid}/profile.jpg`
        );
      }

      // Upload PayNow QR (optional)
      if (payNowQR) {
        payNowQRUrl_final = await uploadImage(
          payNowQR,
          `users/${user.uid}/paynow.jpg`
        );
      }

      // Update user document
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: data.name,
          bio: data.bio,
          profileImage: profileImageUrl_final,
          payNowQR: payNowQRUrl_final,
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      showToast("Profile setup complete!", "success");
      router.push("/app");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      showToast("Failed to complete setup. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  {...form.register("name")}
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image *
                </label>
                <div className="space-y-3">
                  {profileImageUrl && (
                    <img
                      src={profileImageUrl}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-gray-500">
                    Upload a clear photo of yourself (max 5MB)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const nameValue = form.getValues("name");
                  if (!nameValue || nameValue.length < 2) {
                    showToast("Please enter a valid name (at least 2 characters)", "error");
                    return;
                  }
                  if (!profileImage) {
                    showToast("Please upload a profile image", "error");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio *
                </label>
                <textarea
                  {...form.register("bio")}
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {form.watch("bio")?.length || 0}/200 characters
                </p>
                {form.formState.errors.bio && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const bioValue = form.getValues("bio");
                    if (!bioValue || bioValue.length < 10) {
                      showToast("Please enter a bio (at least 10 characters)", "error");
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayNow QR Code (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Upload your PayNow QR code to receive payments. You can add this later in your profile.
                </p>
                <div className="space-y-3">
                  {payNowQRUrl && (
                    <img
                      src={payNowQRUrl}
                      alt="PayNow QR preview"
                      className="w-48 h-48 object-contain border-2 border-gray-200 rounded-lg"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "paynow")}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Setting up..." : "Complete Setup"}
                </button>
              </div>
            </>
          )}
        </form>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

