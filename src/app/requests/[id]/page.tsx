"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { DeliveryRequest, User } from "@/lib/types";
import {
  getRequest,
  requestToDeliver,
  approveRiderRequest,
  rejectRiderRequest,
  verifyPickupOTP,
  verifyDropOTP,
  initiatePickupOTP,
  startTransit,
} from "@/lib/firestore/requests";
import { getUser } from "@/lib/firestore/users";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ParcelTimeline } from "@/components/ui/ParcelTimeline";
import { MapLinkButton } from "@/components/ui/MapLinkButton";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerificationSchema } from "@/lib/validation/schemas";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { RiderProfileCard } from "@/components/ui/RiderProfileCard";

export default function RequestDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const { toasts, showToast, removeToast } = useToast();

  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [senderName, setSenderName] = useState<string>("");
  const [commuterName, setCommuterName] = useState<string>("");
  const [requestedRider, setRequestedRider] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOTPs, setShowOTPs] = useState(false);
  const [showChat, setShowChat] = useState(false);
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

      // Load requested rider if status is "requested"
      if (req.status === "requested" && req.requestedBy) {
        const rider = await getUser(req.requestedBy);
        setRequestedRider(rider);
      }

      // Load requested rider if status is "requested"
      if (req.status === "requested" && req.requestedBy) {
        const rider = await getUser(req.requestedBy);
        setRequestedRider(rider);
      }
    } catch (error) {
      console.error("Error loading request:", error);
      showToast("Failed to load request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!user || !request) return;

    if (!confirm("Request to deliver this task? The sender will review your profile before approval.")) {
      return;
    }

    try {
      await requestToDeliver(requestId, user.uid);
      showToast("Request sent! Waiting for sender approval.", "success");
      loadRequest();
    } catch (error) {
      console.error("Error requesting task:", error);
      showToast("Failed to request task", "error");
    }
  };

  const handleApprove = async () => {
    if (!request) return;

    try {
      await approveRiderRequest(requestId);
      showToast("Rider approved! They can now proceed with pickup.", "success");
      loadRequest();
    } catch (error) {
      console.error("Error approving rider:", error);
      showToast("Failed to approve rider", "error");
    }
  };

  const handleReject = async () => {
    if (!request) return;

    if (!confirm("Are you sure you want to reject this rider's request?")) {
      return;
    }

    try {
      await rejectRiderRequest(requestId);
      showToast("Rider request rejected.", "success");
      loadRequest();
    } catch (error) {
      console.error("Error rejecting rider:", error);
      showToast("Failed to reject rider", "error");
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
  const isRequestedBy = request.requestedBy === user.uid;
  const canRequest = !isSender && request.status === "created";
  const canApprove = isSender && request.status === "requested" && requestedRider;
  const canPickup = isCommuter && request.status === "approved";
  const canVerifyPickupOTP = isCommuter && request.status === "waiting_pickup";
  const canStartTransit = isCommuter && request.status === "picked";
  const canDeliver = isCommuter && request.status === "in_transit";
  // Chat only available from approved status until delivery (disabled once delivered/completed)
  const canChat = Boolean((isSender && request.commuterId) || isCommuter);
  const chatAvailable = canChat && ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"].includes(request.status);
  const chatDisabled = canChat && (request.status === "delivered" || request.status === "completed");

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

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ParcelTimeline status={request.status} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Status */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={request.status} />
              {request.status === "created" && request.expiresAt && (
                <CountdownTimer expiresAt={request.expiresAt} />
              )}
            </div>
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
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pickup Location</h3>
              <MapLinkButton
                pincode={request.pickupPincode}
                details={request.pickupDetails}
                type="pickup"
              />
            </div>
            <p className="font-semibold text-lg">{request.pickupPincode}</p>
            {request.pickupDetails && (
              <p className="text-gray-700 text-sm">{request.pickupDetails}</p>
            )}
          </div>

          {/* Drop */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-600">Drop Location</h3>
              <MapLinkButton
                pincode={request.dropPincode}
                details={request.dropDetails}
                type="drop"
              />
            </div>
            <p className="font-semibold text-lg">{request.dropPincode}</p>
            {request.dropDetails && (
              <p className="text-gray-700 text-sm">{request.dropDetails}</p>
            )}
          </div>

          {/* Item */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Item</h3>
            <p className="text-gray-700 mb-2">{request.itemDescription}</p>
            {request.category && (
              <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                {request.category}
              </span>
            )}
            {request.itemPhoto && (
              <img
                src={request.itemPhoto}
                alt="Item"
                className="mt-2 w-full h-48 object-cover rounded-lg"
              />
            )}
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

          {/* Rider Request Card (for sender to approve/reject) */}
          {canApprove && requestedRider && (
            <div className="pt-4 border-t border-gray-200">
              <RiderProfileCard
                rider={requestedRider}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          )}

          {/* Chat Toggle - Show if chat is available or was available (for viewing history) */}
          {(chatAvailable || chatDisabled) && (
            <div className="pt-4 border-t border-gray-200">
              {chatDisabled ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-center mb-2">
                    Chat is disabled. Delivery has been completed.
                  </p>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                    disabled
                  >
                    {showChat ? "Hide Chat History" : "View Chat History (Read-only)"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  {showChat ? "Hide Chat" : "Open Chat"}
                </button>
              )}
            </div>
          )}

          {/* Chat Window - Show if available or disabled (for viewing history) */}
          {showChat && (chatAvailable || chatDisabled) && (
            <div className="pt-4 border-t border-gray-200">
              <ChatWindow
                requestId={requestId}
                otherUserId={isSender ? (request.commuterId || "") : request.senderId}
                otherUserName={isSender ? commuterName : senderName}
                disabled={chatDisabled}
              />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {canRequest && (
              <button
                onClick={handleRequest}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Request to Deliver
              </button>
            )}

                    {canPickup && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Ready to pick up? Request OTP from sender:
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              await initiatePickupOTP(requestId);
                              showToast("OTP verification initiated. Ask sender for OTP via chat.", "success");
                              loadRequest();
                            } catch (error) {
                              showToast("Failed to initiate OTP", "error");
                            }
                          }}
                          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700"
                        >
                          Request Pickup OTP
                        </button>
                      </div>
                    )}

            {canVerifyPickupOTP && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Enter Pickup OTP (from sender):
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

            {canStartTransit && (
              <button
                onClick={async () => {
                  try {
                    await startTransit(requestId);
                    showToast("Started transit", "success");
                    loadRequest();
                  } catch (error) {
                    showToast("Failed to start transit", "error");
                  }
                }}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Start Delivery
              </button>
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

