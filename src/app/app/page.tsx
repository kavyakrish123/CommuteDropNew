"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import { getMyRequests } from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import Link from "next/link";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [myRequests, setMyRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const requests = await getMyRequests(user.uid);
      setMyRequests(requests);
    } catch (error: any) {
      console.error("Error loading requests:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
        showToast("Permission denied. Please check Firestore security rules.", "error");
      } else {
        showToast("Failed to load requests. " + (error?.message || ""), "error");
      }
    } finally {
      setLoading(false);
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
        {/* Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link
            href="/app"
            className="flex-1 py-3 text-center font-medium text-indigo-600 border-b-2 border-indigo-600"
          >
            My Requests
          </Link>
          <Link
            href="/rider"
            className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700"
          >
            Rider Dashboard
          </Link>
        </div>

        {/* Requests List - Sender View Only */}
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No requests yet. Create your first request!</p>
            </div>
          ) : (
            myRequests.map((request) =>
              request.id ? (
                <RequestCard key={request.id} request={request} />
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

