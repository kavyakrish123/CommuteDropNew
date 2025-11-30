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
  cancelRiderRequest,
} from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import { sortByDistance, getCurrentLocation } from "@/lib/utils/geolocation";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { DashboardSkeleton, RequestCardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  subscribeToMyRequests,
  subscribeToAvailableRequests,
  subscribeToRiderActiveTasks,
  subscribeToRiderRequestedTasks,
} from "@/lib/firestore/requests";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { ActiveJobBanner } from "@/components/ui/ActiveJobBanner";
import { EducationBanner } from "@/components/ui/EducationBanner";
import { LifetimeEarnings } from "@/components/ui/LifetimeEarnings";
import { InstallAppEducation } from "@/components/ui/InstallAppEducation";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-requests" | "my-tasks" | "available">("my-requests");
  const [myRequests, setMyRequests] = useState<DeliveryRequest[]>([]);
  const [myActiveTasks, setMyActiveTasks] = useState<DeliveryRequest[]>([]);
  const [myRequestedTasks, setMyRequestedTasks] = useState<DeliveryRequest[]>([]); // Tasks where rider has requested
  const [requestedTasks, setRequestedTasks] = useState<DeliveryRequest[]>([]); // Tasks where sender has requests
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [allAvailableRequests, setAllAvailableRequests] = useState<DeliveryRequest[]>([]);
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

    // Subscribe to tasks where rider has requested to deliver (status "requested")
    const unsubscribeRequestedTasks = subscribeToRiderRequestedTasks(
      user.uid,
      (tasks) => {
        setMyRequestedTasks(tasks);
      },
      (error) => {
        console.error("Error subscribing to requested tasks:", error);
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
      unsubscribeRequestedTasks();
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
    if (activeTab === "available" && user && !userLocation) {
      const fetchLocation = async () => {
        try {
          const location = await getCurrentLocation();
          if (location) {
            setUserLocation(location);
            setLocationError(null);
            // Update user's location in Firestore for nearby notifications
            try {
              const { updateUserLocation } = await import("@/lib/firestore/userLocation");
              await updateUserLocation(user.uid);
            } catch (error) {
              console.error("Error updating user location:", error);
            }
          } else {
            setLocationError("Location access denied. Please enable location to see nearby requests.");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          setLocationError("Unable to get your location. Showing all requests.");
        }
      };

      fetchLocation();
      
      // Update location periodically (every 5 minutes) when on available tab
      const locationInterval = setInterval(() => {
        fetchLocation();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(locationInterval);
    }
  }, [activeTab, user, userLocation]);


  const handleRequest = async (requestId: string) => {
    if (!user) return;

    try {
      // Check eligibility
        const eligibility = await canRiderRequestTask(user.uid);
        if (!eligibility.canRequest) {
          showToast(eligibility.reason || "Cannot help with this right now", "error");
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
      {/* Header */}
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
        {/* Install App Education */}
        <InstallAppEducation />

        {/* Lifetime Earnings - Motivational Section */}
        <div className="mb-6">
          <LifetimeEarnings />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-soft-lg shadow-card mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("my-requests")}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-colors duration-200 ${
              activeTab === "my-requests"
                ? "text-[#00C57E] border-b-2 border-[#00C57E] bg-[#EFFFEE]"
                : "text-[#666666] active:text-[#1A1A1A]"
            }`}
          >
            Requests ({myRequests.length})
            {requestedTasks.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
                {requestedTasks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-colors duration-200 ${
              activeTab === "my-tasks"
                ? "text-[#00C57E] border-b-2 border-[#00C57E] bg-[#EFFFEE]"
                : "text-[#666666] active:text-[#1A1A1A]"
            }`}
          >
            Helping ({myActiveTasks.length + myRequestedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-4 text-center font-semibold text-sm transition-colors duration-200 ${
              activeTab === "available"
                ? "text-[#00C57E] border-b-2 border-[#00C57E] bg-[#EFFFEE]"
                : "text-[#666666] active:text-[#1A1A1A]"
            }`}
          >
            Available
          </button>
          </div>
        </div>

        {/* Active Job Banner - Show at top when job is taken */}
        {myActiveTasks.length > 0 && (
          <div className="mb-4">
            {myActiveTasks.map((task) =>
              task.id ? (
                <ActiveJobBanner key={task.id} request={task} isRider={true} />
              ) : null
            )}
          </div>
        )}

        {/* Active Requests Banner - Show for senders when rider is assigned */}
        {activeTab === "my-requests" && myRequests.some(
          (r) => r.commuterId && ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"].includes(r.status)
        ) && (
          <div className="mb-4">
            {myRequests
              .filter(
                (r) => r.commuterId && ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"].includes(r.status)
              )
              .map((request) =>
                request.id ? (
                  <ActiveJobBanner key={request.id} request={request} isRider={false} />
                ) : null
              )}
          </div>
        )}

        {/* Filters */}
        {activeTab === "available" && (
          <div className="bg-white rounded-soft-lg shadow-card p-4 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Location
              </label>
              {userLocation ? (
                  <div className="flex items-center gap-2 text-sm text-[#00C57E]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Location detected - showing nearby requests</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      const location = await getCurrentLocation();
                      if (location) {
                        setUserLocation(location);
                        setLocationError(null);
                      } else {
                        setLocationError("Location access denied. Please enable location in your browser settings.");
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-[#00C57E] text-white rounded-soft hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] transition-all duration-150 text-sm font-semibold shadow-card"
                  >
                    Use My Location
                  </button>
                  {locationError && (
                    <p className="text-xs text-red-600">{locationError}</p>
                  )}
                  <p className="text-xs text-[#666666]">
                    Enable location to see requests along your route
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Filter by Pincode
              </label>
              <input
                type="text"
                placeholder="Enter pincode..."
                value={searchPincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setSearchPincode(value);
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-soft-lg focus:border-[#00C57E] focus:outline-none focus:ring-2 focus:ring-[#00C57E]/20 text-base"
              />
              {searchPincode && (
                <button
                  onClick={() => setSearchPincode("")}
                  className="mt-1 text-sm text-[#00C57E] hover:text-[#00A869]"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}


        {/* Education Banner */}
        {activeTab === "my-requests" && (
          <EducationBanner
            title="Create Requests Thoughtfully"
            content="Only create requests you genuinely need. No-shows may result in account restrictions. Requests expire after 1 day if not accepted."
            type="warning"
          />
        )}
        {activeTab === "available" && (
          <EducationBanner
            title="How It Works"
            content="Help out along your commute route. You can have up to 3 active deliveries at a time. Use location to find nearby requests."
            type="info"
          />
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
                <div className="bg-white rounded-soft-lg shadow-card p-12 text-center">
                  <div className="w-16 h-16 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-[#1A1A1A] mb-2">No requests yet</p>
                  <p className="text-sm text-[#666666] mb-4">Create your first request!</p>
                  <button
                    onClick={() => router.push("/requests/create")}
                    className="px-6 py-2.5 bg-[#00C57E] text-white rounded-soft-lg font-semibold shadow-card"
                  >
                    Create Request
                  </button>
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
              ) : myActiveTasks.length === 0 && myRequestedTasks.length === 0 ? (
                <div className="bg-white rounded-soft-lg shadow-card p-12 text-center">
                  <div className="w-16 h-16 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-[#1A1A1A] mb-2">Not helping anyone yet</p>
                  <p className="text-sm text-[#666666]">Find requests in Available tab</p>
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
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                  {[1, 2, 3, 4].map((i) => (
                    <RequestCardSkeleton key={i} />
                  ))}
                </div>
              ) : availableRequests.length === 0 ? (
                <div className="bg-white rounded-soft-lg shadow-card p-12 text-center">
                  <div className="w-16 h-16 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-[#1A1A1A] mb-2">No requests nearby</p>
                  <p className="text-sm text-[#666666] mb-4">Check back later or adjust filters</p>
                  {searchPincode && (
                    <button
                      onClick={() => setSearchPincode("")}
                      className="px-4 py-2 text-sm text-[#00C57E] hover:text-[#00A869] font-semibold"
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

      {/* Floating Action Button */}
      <button
        onClick={() => router.push("/requests/create")}
        className="fixed bottom-6 right-6 bg-[#00C57E] text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-card-lg hover:bg-[#00A869] active:bg-[#00995A] active:scale-95 transition-all duration-150 z-50"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Create new request"
      >
        +
      </button>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

