"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import { getRequest, subscribeToRequest } from "@/lib/firestore/requests";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ParcelTimeline } from "@/components/ui/ParcelTimeline";
import { LocationDisplay } from "@/components/ui/LocationDisplay";
import { DeliveryTracking } from "@/components/ui/DeliveryTracking";
import { RequestDetailSkeleton } from "@/components/ui/SkeletonLoader";

export default function PublicTrackingPage() {
  const params = useParams();
  const requestId = params.id as string;
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Invalid tracking ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    let unsubscribe: (() => void) | null = null;
    
    // First try to get the request directly (works for unauthenticated users)
    const loadRequest = async () => {
      try {
        // Use getDoc directly to ensure it works without authentication
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase/client");
        
        const docRef = doc(db, "requests", requestId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError("Delivery not found");
          setLoading(false);
          return;
        }
        
        const req = {
          id: docSnap.id,
          ...docSnap.data(),
        } as DeliveryRequest;
        
        setRequest(req);
        setLoading(false);
        setError(null);
        
        // Then subscribe to real-time updates (if user is authenticated, this will work)
        // If not authenticated, we'll just show the initial data
        try {
          unsubscribe = subscribeToRequest(
            requestId,
            (updatedReq) => {
              if (updatedReq) {
                setRequest(updatedReq);
                setError(null);
              } else {
                // Request was deleted
                setError("Delivery not found");
              }
            },
            (err) => {
              // Silently fail for unauthenticated users - they can still see the initial data
              console.warn("Real-time updates not available (this is normal for unauthenticated users):", err);
            }
          );
        } catch (subscribeError) {
          // Subscription failed, but we already have the data from getRequest
          console.warn("Could not subscribe to real-time updates:", subscribeError);
        }
      } catch (err: any) {
        console.error("Error loading tracking:", err);
        // Check for specific Firestore errors
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setError("Access denied. The tracking link may be invalid or the delivery may have been removed. Please check with the sender.");
        } else if (err?.code === "not-found" || err?.message?.includes("not found")) {
          setError("Delivery not found. Please check if the tracking link is correct.");
        } else {
          setError("Failed to load delivery tracking. Please check the tracking link or try again later.");
        }
        setLoading(false);
      }
    };

    loadRequest();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFFFEE]">
        <RequestDetailSkeleton />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#EFFFEE] flex items-center justify-center p-4">
        <div className="bg-white rounded-soft-lg shadow-card-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Delivery Not Found</h1>
          <p className="text-gray-600">{error || "The delivery you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const canShowDropOTP = ["picked", "in_transit", "delivered", "completed"].includes(request.status);

  return (
    <div className="min-h-screen bg-[#EFFFEE]">
      {/* Header */}
      <header className="bg-white shadow-card border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-[#00C57E]">Pikk</span>
                <span className="text-[#1A1A1A]">rr</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">Delivery Tracking</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Item Info */}
        <div className="bg-white rounded-soft-lg shadow-card-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Item Details</h2>
          {request.itemPhoto && (
            <div className="mb-4">
              <img
                src={request.itemPhoto}
                alt={request.itemDescription}
                className="w-full h-48 object-cover rounded-soft-lg"
              />
            </div>
          )}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-base text-[#1A1A1A]">{request.itemDescription}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Category</p>
              <p className="text-base text-[#1A1A1A] capitalize">{request.category}</p>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-white rounded-soft-lg shadow-card-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Delivery Status</h2>
          <ParcelTimeline status={request.status} />
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-soft-lg shadow-card-lg p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Pickup Location</h3>
            <LocationDisplay type="pickup" pincode={request.pickupPincode} details={request.pickupDetails} />
          </div>
          <div className="bg-white rounded-soft-lg shadow-card-lg p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Delivery Location</h3>
            <LocationDisplay type="drop" pincode={request.dropPincode} details={request.dropDetails} />
          </div>
        </div>

        {/* Recipient OTP - Only show when delivery is in progress or completed */}
        {canShowDropOTP && (
          <div className="bg-white rounded-soft-lg shadow-card-lg p-6 mb-6 border-2 border-[#00C57E]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#00C57E] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Recipient Verification Code</h3>
                <p className="text-sm text-gray-600">Share this code with the delivery person to complete delivery</p>
              </div>
            </div>
            <div className="bg-[#EFFFEE] rounded-soft-lg p-6 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Your OTP Code</p>
              <p className="text-5xl font-bold text-[#00C57E] tracking-wider">{request.otpDrop}</p>
              <p className="text-xs text-gray-500 mt-3">
                {request.status === "delivered" || request.status === "completed"
                  ? "Delivery completed"
                  : "Provide this code when the delivery person arrives"}
              </p>
            </div>
          </div>
        )}

        {/* Delivery Tracking Map */}
        {request.trackingEnabled && request.riderLat && request.riderLng && (
          <div className="bg-white rounded-soft-lg shadow-card-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Live Tracking</h2>
            <DeliveryTracking request={request} />
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-soft-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">About This Tracking Page</p>
              <p className="text-sm text-blue-800">
                This is a read-only tracking page. You can view the delivery status and recipient OTP here.
                No account registration is required to view this page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

