"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getUser, updateUserProfile } from "@/lib/firestore/users";
import { User, CommuteType } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { CommuteBadge } from "@/components/ui/CommuteBadge";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(200, "Bio must be less than 200 characters"),
});

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [payNowQR, setPayNowQR] = useState<File | null>(null);
  const [payNowQRUrl, setPayNowQRUrl] = useState<string | null>(null);
  const [commuteType, setCommuteType] = useState<CommuteType>("other");
  const [menuOpen, setMenuOpen] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getUser(user.uid)
        .then((data) => {
          if (!data) {
            setLoading(false);
            return;
          }
          setUserData(data);
          setCommuteType(data.commuteType || "other");
          form.reset({
            name: data.name,
            bio: data.bio || "",
          });
          setProfileImageUrl(data.profileImage ?? null);
          setPayNowQRUrl(data.payNowQR ?? null);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading profile:", error);
          setLoading(false);
        });
    }
  }, [user, form]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePayNowUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setPayNowQR(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPayNowQRUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;

    try {
      setUploading(true);

      let profileImageUrl_final: string | null = userData?.profileImage || null;
      let payNowQRUrl_final: string | null = userData?.payNowQR || null;

      if (profileImage) {
        profileImageUrl_final = await uploadImage(
          profileImage,
          `users/${user.uid}/profile.jpg`
        );
      }

      if (payNowQR) {
        payNowQRUrl_final = await uploadImage(
          payNowQR,
          `users/${user.uid}/paynow.jpg`
        );
      }

      await updateUserProfile(user.uid, {
        name: data.name,
        bio: data.bio,
        profileImage: profileImageUrl_final,
        payNowQR: payNowQRUrl_final,
        commuteType: commuteType,
      });

      showToast("Profile updated successfully!", "success");
      router.push("/profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="space-y-3">
              {profileImageUrl && (
                <img
                  src={profileImageUrl}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-gray-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Name */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              {...form.register("name")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio *
            </label>
            <textarea
              {...form.register("bio")}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            {form.formState.errors.bio && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.bio.message}</p>
            )}
          </div>

          {/* Commute Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commute Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["mrt", "bus", "both", "other"] as CommuteType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCommuteType(type)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    commuteType === type
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CommuteBadge commuteType={type} />
                </button>
              ))}
            </div>
          </div>

          {/* PayNow QR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PayNow QR Code (Optional)
            </label>
            <div className="space-y-3">
              {payNowQRUrl && (
                <img
                  src={payNowQRUrl}
                  alt="PayNow QR preview"
                  className="w-48 h-48 object-contain mx-auto border-2 border-gray-200 rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePayNowUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/profile"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

