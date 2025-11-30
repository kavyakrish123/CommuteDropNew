"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import { subscribeToCompletedRequests } from "@/lib/firestore/requests";
import { RequestCard } from "@/components/ui/RequestCard";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { DashboardSkeleton, RequestCardSkeleton } from "@/components/ui/SkeletonLoader";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { format } from "date-fns";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [completedRequests, setCompletedRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Real-time subscription to completed requests
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    const unsubscribe = subscribeToCompletedRequests(
      user.uid,
      (requests) => {
        // Sort by completion date (most recent first)
        const sorted = requests.sort((a, b) => {
          const aDate = a.updatedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
          const bDate = b.updatedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        setCompletedRequests(sorted);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to completed requests:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">History</h1>
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
        <main className="max-w-4xl mx-auto px-4 py-6">
          <DashboardSkeleton />
        </main>
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">History</h1>
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

      <main className="max-w-4xl mx-auto px-6 py-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {[1, 2, 3].map((i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        ) : completedRequests.length === 0 ? (
          <div className="bg-white rounded-soft-lg shadow-card p-12 text-center">
            <div className="w-16 h-16 bg-[#EFFFEE] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#00C57E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-[#1A1A1A] mb-2">No history yet</p>
            <p className="text-sm text-[#666666]">Completed and expired requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-soft-lg shadow-card p-4">
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {completedRequests.length} {completedRequests.length === 1 ? "item" : "items"} in history
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {completedRequests.map((request) =>
                request.id ? (
                  <RequestCard
                    key={request.id}
                    request={request}
                    currentUserId={user.uid}
                  />
                ) : null
              )}
            </div>
          </div>
        )}
      </main>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

