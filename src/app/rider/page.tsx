"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import {
  getAvailableRequests,
  getRiderActiveTasks,
  canRiderRequestTask,
  requestToDeliver,
} from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import { sortByDistance, getCurrentLocation } from "@/lib/utils/geolocation";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { RequestCardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  subscribeToAvailableRequests,
  subscribeToRiderActiveTasks,
} from "@/lib/firestore/requests";
import { MobileMenu } from "@/components/ui/MobileMenu";

export default function RiderDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"available" | "active">("available");
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [allAvailableRequests, setAllAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [activeTasks, setActiveTasks] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPincode, setSearchPincode] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Subscribe to active tasks
    const unsubscribeActiveTasks = subscribeToRiderActiveTasks(
      user.uid,
      (tasks) => {
        setActiveTasks(tasks);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to active tasks:", error);
        setLoading(false);
      }
    );

    // Subscribe to available requests (only when on available tab)
    let unsubscribeAvailable: (() => void) | null = null;
    if (activeTab === "available") {
      unsubscribeAvailable = subscribeToAvailableRequests(
        user.uid,
        (requests) => {
          setAllAvailableRequests(requests);
          setLoading(false);
        },
        (error: any) => {
          console.error("Error subscribing to available requests:", error);
          if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
            const indexUrl = error?.indexUrl || error?.message?.match(/https:\/\/[^\s\)]+/)?.[0];
            if (indexUrl) {
              console.error("🔗 Create Firestore index here:", indexUrl);
              showToast(
                "Firestore index required. Check console for link, then refresh after creating.",
                "error"
              );
            } else {
              showToast("Firestore index required. Check console for details.", "error");
            }
          }
          setLoading(false);
        }
      );
    }

    return () => {
      unsubscribeActiveTasks();
      if (unsubscribeAvailable) unsubscribeAvailable();
    };
  }, [user, activeTab, showToast]);

  // Filter and sort available requests when searchPincode or userLocation changes
  useEffect(() => {
    if (activeTab === "available") {
      let filtered = allAvailableRequests;
      
      if (searchPincode && searchPincode.trim()) {
        filtered = allAvailableRequests.filter((req) => {
          return req.pickupPincode?.includes(searchPincode.trim()) || 
                 req.dropPincode?.includes(searchPincode.trim());
        });
      }
      
      if (userLocation) {
        filtered = sortByDistance(filtered, userLocation.lat, userLocation.lng, 10);
      }
      
      setAvailableRequests(filtered);
    }
  }, [allAvailableRequests, searchPincode, userLocation, activeTab]);

  // Get user's current location when on available tasks tab
  useEffect(() => {
    if (activeTab === "available" && !userLocation) {
      getCurrentLocation()
        .then((location) => {
          if (location) {
            setUserLocation(location);
            setLocationError(null);
          } else {
            setLocationError("Location access denied. Please enable location to see nearby tasks.");
          }
        })
        .catch((error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to get your location. Showing all tasks.");
        });
    }
  }, [activeTab, userLocation]);


  const handleRequest = async (requestId: string) => {
    if (!user) return;

    try {
      // Check eligibility
      const eligibility = await canRiderRequestTask(user.uid);
      if (!eligibility.canRequest) {
        showToast(eligibility.reason || "Cannot request this task", "error");
        return;
      }

      if (!confirm("Help deliver this? The sender will review your profile before approval.")) {
        return;
      }

      await requestToDeliver(requestId, user.uid);
      showToast("Request sent! Waiting for sender approval.", "success");
      // Real-time listener will update automatically
    } catch (error) {
      console.error("Error requesting task:", error);
        showToast("Failed to request delivery", "error");
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
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EFFFEE]">
      <header className="bg-white shadow-card border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-[#00C57E]">Pikk</span>
            <span className="text-[#1A1A1A]">rr</span>
          </h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition-colors duration-150"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 pb-24">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-soft-lg shadow-card mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <Link
              href="/app"
              className="flex-1 py-4 text-center font-semibold text-sm text-[#666666] hover:text-[#1A1A1A]"
            >
              My Requests
            </Link>
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-4 text-center font-semibold text-sm ${
                activeTab === "active"
                  ? "text-[#00C57E] border-b-2 border-[#00C57E] bg-[#EFFFEE]"
                  : "text-[#666666] hover:text-[#1A1A1A]"
              }`}
            >
              Helping Out ({activeTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`flex-1 py-4 text-center font-semibold text-sm ${
                activeTab === "available"
                  ? "text-[#00C57E] border-b-2 border-[#00C57E] bg-[#EFFFEE]"
                  : "text-[#666666] hover:text-[#1A1A1A]"
              }`}
            >
              Available Requests
            </button>
          </div>
        </div>

        {/* Filters for Available Tasks */}
        {activeTab === "available" && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Location
              </label>
              {userLocation ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Location detected - showing requests along your route</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      const location = await getCurrentLocation();
                      if (location) {
                        setUserLocation(location);
                        setLocationError(null);
                        // Real-time listener will update automatically
                      } else {
                        setLocationError("Location access denied. Please enable location in your browser settings.");
                      }
                    }}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                  >
                    Use My Location
                  </button>
                  {locationError && (
                    <p className="text-xs text-red-600">{locationError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enable location to see requests along your commute
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Pickup Pincode
              </label>
              <input
                type="text"
                placeholder="Filter by pickup pincode (e.g., 123456)..."
                value={searchPincode}
                onChange={(e) => {
                  // Allow full pincode input (digits only, max 6 digits)
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setSearchPincode(value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchPincode && (
                <button
                  onClick={() => setSearchPincode("")}
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Tasks Info */}
        {activeTab === "active" && activeTasks.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Active Delivery:</strong> Complete your current pickup before helping with another.
            </p>
            {activeTasks.some(
              (t) => t.status === "pickup_otp_pending" || t.status === "waiting_pickup" || t.status === "approved"
            ) && (
              <p className="text-sm text-orange-800 mt-1">
                ⚠️ You have a delivery waiting for pickup. Go to the pickup location and verify OTP before helping with another.
              </p>
            )}
          </div>
        )}

        {/* Requests List - Grid Card Layout */}
        <div>
          {activeTab === "available" ? (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {[1, 2, 3, 4].map((i) => (
                  <RequestCardSkeleton key={i} />
                ))}
              </div>
            ) : availableRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No requests nearby at the moment.</p>
                {searchPincode && (
                  <button
                    onClick={() => setSearchPincode("")}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {availableRequests.map((request) =>
                  request.id ? (
                    <RequestCard
                      key={request.id}
                      request={request}
                      showActions
                      onAccept={() => request.id && handleRequest(request.id)}
                      currentUserId={user.uid}
                    />
                  ) : null
                )}
              </div>
            )
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {[1, 2, 3].map((i) => (
                <RequestCardSkeleton key={i} />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Not helping anyone yet. Find requests in the Available Requests tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {activeTasks.map((task) =>
                task.id ? (
                  <RequestCard key={task.id} request={task} currentUserId={user.uid} />
                ) : null
              )}
            </div>
          )}
        </div>
      </main>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

