"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import { getMyRequests, getAvailableRequests } from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import Link from "next/link";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "available">("my");
  const [myRequests, setMyRequests] = useState<DeliveryRequest[]>([]);
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPincode, setSearchPincode] = useState("");
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, activeTab]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (activeTab === "my") {
        const requests = await getMyRequests(user.uid);
        setMyRequests(requests);
      } else {
        const requests = await getAvailableRequests(user.uid);
        setAvailableRequests(requests);
      }
    } catch (error: any) {
      console.error("Error loading requests:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
        showToast("Permission denied. Please check Firestore security rules.", "error");
      } else if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
        // Extract the index creation URL from the error message or error object
        const indexUrl = error?.indexUrl || error?.message?.match(/https:\/\/[^\s\)]+/)?.[0];
        if (indexUrl) {
          console.error("🔗 Create Firestore index here:", indexUrl);
          showToast(
            "Firestore index required. Check console for link, then refresh after creating.",
            "error"
          );
          // Optionally open the link automatically
          setTimeout(() => {
            if (confirm("Open Firestore index creation page?\n\nAfter creating, wait 1-2 minutes for it to build, then refresh.")) {
              window.open(indexUrl, "_blank");
            }
          }, 1500);
        } else {
          showToast("Firestore index required. Check console for details.", "error");
        }
      } else {
        showToast("Failed to load requests. " + (error?.message || ""), "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!user) return;

    try {
      const { acceptRequest } = await import("@/lib/firestore/requests");
      await acceptRequest(requestId, user.uid);
      showToast("Request accepted successfully!", "success");
      loadRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast("Failed to accept request", "error");
    }
  };

  const filteredAvailableRequests = availableRequests.filter((req) => {
    if (!searchPincode) return true;
    return req.pickupPincode.includes(searchPincode);
  });

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
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "my"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "available"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Available Requests
          </button>
        </div>

        {/* Search for available requests */}
        {activeTab === "available" && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by pickup pincode..."
              value={searchPincode}
              onChange={(e) => setSearchPincode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {activeTab === "my" ? (
            myRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No requests yet. Create your first request!</p>
              </div>
            ) : (
              myRequests.map((request) =>
                request.id ? (
                  <RequestCard key={request.id} request={request} />
                ) : null
              )
            )
          ) : filteredAvailableRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No available requests at the moment.</p>
            </div>
          ) : (
            filteredAvailableRequests.map((request) =>
              request.id ? (
                <RequestCard
                  key={request.id}
                  request={request}
                  showActions
                  onAccept={() => request.id && handleAccept(request.id)}
                />
              ) : null
            )
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

