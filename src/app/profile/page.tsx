"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/firestore/users";
import { User } from "@/lib/types";
import Link from "next/link";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { CommuteBadge } from "@/components/ui/CommuteBadge";
import { LifetimeEarnings } from "@/components/ui/LifetimeEarnings";
import { ShareApp } from "@/components/ui/ShareApp";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
          console.error("Error loading profile:", error);
          setLoading(false);
        });
    }
  }, [user]);

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
    <div className="min-h-screen bg-[#EFFFEE]">
      {/* Header */}
      <header className="bg-white shadow-card border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Profile</h1>
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
        {/* Lifetime Earnings - Motivational Section */}
        <div className="mb-6">
          <LifetimeEarnings />
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-soft-lg shadow-card border border-gray-200 p-6 mb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mb-4">
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-indigo-600">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{userData.name}</h2>
            {userData.rating && (
              <div className="flex items-center gap-1 mb-2">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900">{userData.rating.toFixed(1)}</span>
                {userData.totalDeliveries && (
                  <span className="text-sm text-gray-500">
                    ({userData.totalDeliveries} {userData.totalDeliveries === 1 ? "delivery" : "deliveries"})
                  </span>
                )}
              </div>
            )}
            {userData.commuteType && (
              <CommuteBadge commuteType={userData.commuteType} />
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {userData.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Bio</h3>
                <p className="text-gray-900">{userData.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Phone</h3>
                <p className="text-gray-900">{userData.phone || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Email</h3>
                <p className="text-gray-900">{userData.email || "Not provided"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Role</h3>
              <p className="text-gray-900 capitalize">{userData.role}</p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <Link
              href="/profile/edit"
              className="block w-full text-center bg-[#00C57E] text-white py-3 px-4 rounded-soft-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] transition-all duration-150 shadow-card"
            >
              Edit Profile
            </Link>
            <ShareApp variant="button" className="w-full" />
          </div>
        </div>
      </main>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

