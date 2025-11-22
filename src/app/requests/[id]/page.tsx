"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { DeliveryRequest } from "@/lib/types";
import {
  getRequest,
  acceptRequest,
  verifyPickupOTP,
  verifyDropOTP,
} from "@/lib/firestore/requests";
import { getUser } from "@/lib/firestore/users";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerificationSchema } from "@/lib/validation/schemas";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

export default function RequestDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const { toasts, showToast, removeToast } = useToast();

  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [senderName, setSenderName] = useState<string>("");
  const [commuterName, setCommuterName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showOTPs, setShowOTPs] = useState(false);
  const [otpType, setOtpType] = useState<"pickup" | "drop" | null>(null);

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpVerificationSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && requestId) {
      loadRequest();
    }
  }, [user, requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const req = await getRequest(requestId);
      if (!req) {
        showToast("Request not found", "error");
        router.push("/app");
        return;
      }

      setRequest(req);

      // Load sender name
      const sender = await getUser(req.senderId);
      setSenderName(sender?.name || "Unknown");

      // Load commuter name if exists
      if (req.commuterId) {
        const commuter = await getUser(req.commuterId);
        setCommuterName(commuter?.name || "Unknown");
      }
    } catch (error) {
      console.error("Error loading request:", error);
      showToast("Failed to load request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !request) return;

    if (!confirm("Are you sure you want to accept this request?")) {
      return;
    }

    try {
      await acceptRequest(requestId, user.uid);
      showToast("Request accepted successfully!", "success");
      loadRequest();
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast("Failed to accept request", "error");
    }
  };

  const handleOTPSubmit = async (data: { otp: string }) => {
    if (!request || !otpType) return;

    try {
      let success = false;
      if (otpType === "pickup") {
        success = await verifyPickupOTP(requestId, data.otp);
      } else {
        success = await verifyDropOTP(requestId, data.otp);
      }

      if (success) {
        showToast("OTP verified successfully!", "success");
        otpForm.reset();
        setOtpType(null);
        loadRequest();
      } else {
        showToast("Invalid OTP. Please check and try again.", "error");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast("Failed to verify OTP", "error");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !request) {
    return null;
  }

  const isSender = request.senderId === user.uid;
  const isCommuter = request.commuterId === user.uid;
  const canAccept = !isSender && request.status === "open";
  const canPickup = isCommuter && request.status === "accepted";
  const canDeliver = isCommuter && request.status === "picked";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/app"
            className="text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Status */}
          <div className="flex justify-between items-center">
            <StatusBadge status={request.status} />
            {isSender && (
              <button
                onClick={() => setShowOTPs(!showOTPs)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showOTPs ? "Hide" : "Show"} OTPs
              </button>
            )}
          </div>

          {/* OTPs (for sender) */}
          {isSender && showOTPs && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <p className="text-sm text-gray-600">Pickup OTP</p>
                <p className="text-2xl font-mono font-bold">
                  {request.otpPickup.toString().padStart(4, "0")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Drop OTP</p>
                <p className="text-2xl font-mono font-bold">
                  {request.otpDrop.toString().padStart(4, "0")}
                </p>
              </div>
            </div>
          )}

          {/* Pickup */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Pickup</h3>
            <p className="font-semibold text-lg">{request.pickupPincode}</p>
            <p className="text-gray-700">{request.pickupDetails}</p>
          </div>

          {/* Drop */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Drop</h3>
            <p className="font-semibold text-lg">{request.dropPincode}</p>
            <p className="text-gray-700">{request.dropDetails}</p>
          </div>

          {/* Item */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Item</h3>
            <p className="text-gray-700">{request.itemDescription}</p>
          </div>

          {/* Price */}
          {request.priceOffered && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Price</h3>
              <p className="text-2xl font-bold text-indigo-600">
                ${request.priceOffered}
              </p>
            </div>
          )}

          {/* Sender Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Posted by</h3>
            <p className="text-gray-700">
              {isSender ? "You" : senderName}
            </p>
          </div>

          {/* Commuter Info */}
          {request.commuterId && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Accepted by
              </h3>
              <p className="text-gray-700">
                {isCommuter ? "You" : commuterName}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {canAccept && (
              <button
                onClick={handleAccept}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Accept this Request
              </button>
            )}

            {canPickup && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Enter Pickup OTP:
                </p>
                <form
                  onSubmit={(e) => {
                    setOtpType("pickup");
                    otpForm.handleSubmit(handleOTPSubmit)(e);
                  }}
                  className="flex gap-2"
                >
                  <input
                    {...otpForm.register("otp")}
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                  >
                    Verify
                  </button>
                </form>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
            )}

            {canDeliver && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Enter Drop OTP:
                </p>
                <form
                  onSubmit={(e) => {
                    setOtpType("drop");
                    otpForm.handleSubmit(handleOTPSubmit)(e);
                  }}
                  className="flex gap-2"
                >
                  <input
                    {...otpForm.register("otp")}
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                  >
                    Verify
                  </button>
                </form>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

