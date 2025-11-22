"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import { 
  getMyRequests, 
  getRiderActiveTasks, 
  getAvailableRequests,
  canRiderAcceptTask,
  acceptRequest,
} from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import { sortByDistance } from "@/lib/utils/distance";
import Link from "next/link";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-requests" | "my-tasks" | "available">("my-requests");
  const [myRequests, setMyRequests] = useState<DeliveryRequest[]>([]);
  const [myActiveTasks, setMyActiveTasks] = useState<DeliveryRequest[]>([]);
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPincode, setSearchPincode] = useState("");
  const [userPincode, setUserPincode] = useState("");
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
  }, [user, activeTab, searchPincode]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Always load "My Requests" (as sender) and "My Active Tasks" (as rider)
      const [requests, activeTasks] = await Promise.all([
        getMyRequests(user.uid),
        getRiderActiveTasks(user.uid),
      ]);
      
      setMyRequests(requests);
      setMyActiveTasks(activeTasks);

      // Load available tasks only when on that tab
      if (activeTab === "available") {
        const available = await getAvailableRequests(
          user.uid,
          searchPincode || undefined
        );
        
        // Sort by distance if user pincode provided
        let sortedRequests = available;
        if (userPincode) {
          sortedRequests = sortByDistance(available, userPincode);
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

  const handleAccept = async (requestId: string) => {
    if (!user) return;

    try {
      // Check eligibility
      const eligibility = await canRiderAcceptTask(user.uid);
      if (!eligibility.canAccept) {
        showToast(eligibility.reason || "Cannot accept this task", "error");
        return;
      }

      if (!confirm("Are you sure you want to accept this request?")) {
        return;
      }

      await acceptRequest(requestId, user.uid);
      showToast("Request accepted successfully!", "success");
      loadData(); // Reload all data
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast("Failed to accept request", "error");
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

      <main className="max-w-4xl mx-auto px-4 py-6">
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
                Your Location (Postal Code)
              </label>
              <input
                type="text"
                placeholder="123456"
                value={userPincode}
                onChange={(e) => setUserPincode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your postal code to see tasks sorted by distance (within 1km)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Pickup Pincode
              </label>
              <input
                type="text"
                placeholder="Filter by pickup pincode..."
                value={searchPincode}
                onChange={(e) => setSearchPincode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
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

        {/* Content based on active tab */}
        <div className="space-y-4">
          {activeTab === "my-requests" && (
            <>
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No requests yet. Create your first request!</p>
                </div>
              ) : (
                myRequests.map((request) =>
                  request.id ? (
                    <RequestCard key={request.id} request={request} currentUserId={user.uid} />
                  ) : null
                )
              )}
            </>
          )}

          {activeTab === "my-tasks" && (
            <>
              {myActiveTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No active tasks. Accept a task from the Available Tasks tab.</p>
                </div>
              ) : (
                myActiveTasks.map((task) =>
                  task.id ? (
                    <RequestCard key={task.id} request={task} currentUserId={user.uid} />
                  ) : null
                )
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
                availableRequests.map((request) =>
                  request.id ? (
                    <RequestCard
                      key={request.id}
                      request={request}
                      showActions
                      onAccept={() => request.id && handleAccept(request.id)}
                      currentUserId={user.uid}
                    />
                  ) : null
                )
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link
        href="/requests/create"
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
      >
        +
      </Link>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

