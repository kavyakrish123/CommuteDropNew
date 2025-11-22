"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import { 
  getMyRequests, 
  getRiderActiveTasks, 
  getAvailableRequests,
  canRiderRequestTask,
  requestToDeliver,
  getRequestedTasks,
  approveRiderRequest,
  rejectRiderRequest,
  cancelRequest,
} from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import { sortByDistance, getCurrentLocation } from "@/lib/utils/geolocation";
import Link from "next/link";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { DashboardSkeleton, RequestCardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  subscribeToMyRequests,
  subscribeToAvailableRequests,
  subscribeToRiderActiveTasks,
} from "@/lib/firestore/requests";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-requests" | "my-tasks" | "available">("my-requests");
  const [myRequests, setMyRequests] = useState<DeliveryRequest[]>([]);
  const [myActiveTasks, setMyActiveTasks] = useState<DeliveryRequest[]>([]);
  const [requestedTasks, setRequestedTasks] = useState<DeliveryRequest[]>([]);
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [allAvailableRequests, setAllAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPincode, setSearchPincode] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Subscribe to my requests (includes both regular requests and requested tasks)
    const unsubscribeMyRequests = subscribeToMyRequests(
      user.uid,
      (requests) => {
        setMyRequests(requests);
        const requested = requests.filter((r) => r.status === "requested");
        setRequestedTasks(requested);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to my requests:", error);
        setLoading(false);
      }
    );

    // Subscribe to my active tasks (as rider)
    const unsubscribeActiveTasks = subscribeToRiderActiveTasks(
      user.uid,
      (tasks) => {
        setMyActiveTasks(tasks);
      },
      (error) => {
        console.error("Error subscribing to active tasks:", error);
      }
    );

    // Subscribe to available requests (only when on available tab)
    let unsubscribeAvailable: (() => void) | null = null;
    if (activeTab === "available") {
      unsubscribeAvailable = subscribeToAvailableRequests(
        user.uid,
        (requests) => {
          setAllAvailableRequests(requests);
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
        }
      );
    }

    return () => {
      unsubscribeMyRequests();
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

      if (!confirm("Request to deliver this task? The sender will review your profile before approval.")) {
        return;
      }

      await requestToDeliver(requestId, user.uid);
      showToast("Request sent! Waiting for sender approval.", "success");
      // Real-time listener will update automatically
    } catch (error) {
      console.error("Error requesting task:", error);
      showToast("Failed to request task", "error");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-[#00B14F]">Commute</span>
            <span className="text-gray-900">Drop</span>
          </h1>
          <button
            onClick={signOut}
            className="text-sm text-gray-600 active:text-gray-900 py-1 px-2 rounded-lg active:bg-gray-100 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 pb-24">
        {/* Tabs - Unified Dashboard */}
        <div className="flex border-b border-gray-200 mb-4 -mx-4 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("my-requests")}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200 ${
              activeTab === "my-requests"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 active:text-gray-700"
            }`}
          >
            My Requests ({myRequests.length})
            {requestedTasks.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
                {requestedTasks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200 ${
              activeTab === "my-tasks"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 active:text-gray-700"
            }`}
          >
            My Tasks ({myActiveTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors duration-200 ${
              activeTab === "available"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 active:text-gray-700"
            }`}
          >
            Available
          </button>
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
                  <span>Location detected - showing tasks sorted by distance (within 10km)</span>
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
                    className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all duration-150 text-sm font-medium"
                  >
                    Use My Location
                  </button>
                  {locationError && (
                    <p className="text-xs text-red-600">{locationError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enable location to see tasks sorted by distance from you
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-base"
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
        {activeTab === "my-tasks" && myActiveTasks.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Active Task:</strong> Complete your current pickup before accepting a new task.
            </p>
            {myActiveTasks.some(
              (t) => t.status === "pickup_otp_pending" || t.status === "waiting_pickup" || t.status === "approved"
            ) && (
              <p className="text-sm text-orange-800 mt-1">
                ⚠️ You have a task waiting for pickup. Go to the pickup location and verify OTP before accepting new tasks.
              </p>
            )}
          </div>
        )}

        {/* Ethical Warning */}
        {activeTab === "my-requests" && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-xl">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>⚠️ Important:</strong> It is unethical to create tasks and not show up when a rider arrives. 
                  Please only create tasks you genuinely need delivered. No-shows may result in account restrictions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab - Grid Card Layout */}
        <div>
          {activeTab === "my-requests" && (
            <>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                  {[1, 2, 3].map((i) => (
                    <RequestCardSkeleton key={i} />
                  ))}
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No requests yet. Create your first request!</p>
                </div>
              ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                  {myRequests.map((request) =>
                    request.id ? (
                      <RequestCard 
                        key={request.id} 
                        request={request} 
                        currentUserId={user.uid}
                        onCancel={request.status === "created" ? async () => {
                          if (confirm("Are you sure you want to cancel this request?")) {
                            try {
                              await cancelRequest(request.id!, user.uid);
                              showToast("Request cancelled successfully", "success");
                              // Real-time listener will update automatically
                            } catch (error: any) {
                              showToast(error.message || "Failed to cancel request", "error");
                            }
                          }
                        } : undefined}
                      />
                    ) : null
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "my-tasks" && (
            <>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                  {[1, 2, 3].map((i) => (
                    <RequestCardSkeleton key={i} />
                  ))}
                </div>
              ) : myActiveTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No active tasks. Request a task from the Available Tasks tab.</p>
                </div>
              ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                  {myActiveTasks.map((task) =>
                    task.id ? (
                      <RequestCard key={task.id} request={task} currentUserId={user.uid} />
                    ) : null
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "available" && (
            <>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                  {[1, 2, 3, 4].map((i) => (
                    <RequestCardSkeleton key={i} />
                  ))}
                </div>
              ) : availableRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No available tasks at the moment.</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
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
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button - Mobile optimized */}
      <Link
        href="/requests/create"
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-md hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 transition-all duration-150 z-50"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        +
      </Link>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

