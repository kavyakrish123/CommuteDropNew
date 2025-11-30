"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getUser, updateUserProfile } from "@/lib/firestore/users";
import { User } from "@/lib/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { requestNotificationPermission } from "@/lib/notifications/fcm";
import { ShareApp } from "@/components/ui/ShareApp";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isEnabled: notificationsEnabled } = useNotifications();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getUser(user.uid)
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading user data:", error);
          setLoading(false);
        });
    }
  }, [user]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationEnabled: enabled,
      });
      setUserData((prev) => prev ? { ...prev, notificationEnabled: enabled } : null);
      
      if (enabled) {
        await requestNotificationPermission();
        showToast("Notifications enabled", "success");
      } else {
        showToast("Notifications disabled", "success");
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      showToast("Failed to update notification settings", "error");
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
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
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
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive notifications for pickups, deliveries, and nearby requests
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(!userData.notificationEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  userData.notificationEnabled ? "bg-[#00C57E]" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={userData.notificationEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    userData.notificationEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">User ID</p>
                <p className="text-sm text-gray-900 font-mono">{user.uid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{userData.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{userData.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-sm text-gray-900 capitalize">{userData.role}</p>
              </div>
            </div>
          </div>

          {/* Share App */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ShareApp variant="card" />
          </div>

          {/* App Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Pikkrr v1.0.0</p>
              <p>Transform your daily commute into passive income</p>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Need help? Visit our support page for FAQs and contact information.
              </p>
              <a
                href="/support"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C57E] hover:text-[#00A869] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Go to Support & Help
              </a>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Support Email</p>
                <a
                  href="mailto:admin@myfluja.com?subject=Support Request - Pikkrr"
                  className="text-sm text-[#00C57E] hover:text-[#00A869] font-medium"
                >
                  admin@myfluja.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

