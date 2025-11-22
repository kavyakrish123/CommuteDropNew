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

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-requests" | "my-tasks" | "available">("my-requests");
  const [myRequests, setMyRequests] = useState<DeliveryRequest[]>([]);
  const [myActiveTasks, setMyActiveTasks] = useState<DeliveryRequest[]>([]);
  const [requestedTasks, setRequestedTasks] = useState<DeliveryRequest[]>([]);
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPincode, setSearchPincode] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab, searchPincode, userLocation]); // Added userLocation to dependencies

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

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Always load "My Requests" (as sender) and "My Active Tasks" (as rider)
      const [requests, activeTasks, requested] = await Promise.all([
        getMyRequests(user.uid),
        getRiderActiveTasks(user.uid),
        getRequestedTasks(user.uid),
      ]);
      
      setMyRequests(requests);
      setMyActiveTasks(activeTasks);
      setRequestedTasks(requested);

      // Load available tasks only when on that tab
      if (activeTab === "available") {
        // Get all available requests (without pincode filter first)
        const allAvailable = await getAvailableRequests(user.uid);
        
        // Apply pincode filter client-side (more flexible)
        let filteredRequests = allAvailable;
        if (searchPincode && searchPincode.trim()) {
          filteredRequests = allAvailable.filter((req) => {
            return req.pickupPincode?.includes(searchPincode.trim()) || 
                   req.dropPincode?.includes(searchPincode.trim());
          });
        }
        
        // Sort by distance if user location is available
        let sortedRequests = filteredRequests;
        if (userLocation) {
          sortedRequests = sortByDistance(
            filteredRequests,
            userLocation.lat,
            userLocation.lng,
            10 // 10km radius
          );
        }
        
        setAvailableRequests(sortedRequests);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
        showToast("Permission denied. Please check Firestore security rules.", "error");
      } else if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
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
      } else {
        showToast("Failed to load data. " + (error?.message || ""), "error");
      }
    } finally {
      setLoading(false);
    }
  };

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
      loadData(); // Reload all data
    } catch (error) {
      console.error("Error requesting task:", error);
      showToast("Failed to request task", "error");
    }
  };

  if (authLoading || loading) {
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">CommuteDrop</h1>
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Tabs - Unified Dashboard */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("my-requests")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "my-requests"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "my-tasks"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Active Tasks ({myActiveTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "available"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Available Tasks
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
                        loadData(); // Reload to sort by distance
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
        {activeTab === "my-tasks" && myActiveTasks.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Active Task:</strong> Complete your current pickup before accepting a new task.
            </p>
            {myActiveTasks.some(
              (t) => t.status === "pickup_otp_pending" || t.status === "waiting_pickup" || t.status === "accepted"
            ) && (
              <p className="text-sm text-orange-800 mt-1">
                ⚠️ You have a task waiting for pickup. Go to the pickup location and verify OTP before accepting new tasks.
              </p>
            )}
          </div>
        )}

        {/* Ethical Warning */}
        {activeTab === "my-requests" && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
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
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No requests yet. Create your first request!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
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
                              loadData();
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
              {myActiveTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No active tasks. Request a task from the Available Tasks tab.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
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
              {availableRequests.length === 0 ? (
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
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button - Mobile optimized */}
      <Link
        href="/requests/create"
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-indigo-700 transition-colors z-50"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        +
      </Link>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

