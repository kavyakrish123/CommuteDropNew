"use client";

import { useEffect, useState, useRef } from "react";
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
  enableTracking,
  disableTracking,
  updateRiderLocation,
  confirmSenderPayment,
  confirmRiderPayment,
  markArrivedAtPickup,
  markArrivedAtDrop,
  extendPickupDeadline,
  checkAndExpirePickupDeadline,
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
// Chat temporarily disabled
// import { ChatWindow } from "@/components/chat/ChatWindow";
import { RiderProfileCard } from "@/components/ui/RiderProfileCard";
import { RequestDetailSkeleton } from "@/components/ui/SkeletonLoader";
import { subscribeToRequest } from "@/lib/firestore/requests";
import { notifyPickupEvent, notifyDropEvent } from "@/lib/notifications/triggers";
import { useNotifications } from "@/hooks/useNotifications";
import { RatingModal } from "@/components/ui/RatingModal";
import { submitRating, hasUserRated } from "@/lib/firestore/ratings";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { DeliveryTracking } from "@/components/ui/DeliveryTracking";
import { getCurrentLocation } from "@/lib/utils/geolocation";
import { LocationDisplay } from "@/components/ui/LocationDisplay";
import { PayNowQRDisplay } from "@/components/ui/PayNowQRDisplay";
import { ShareTracking } from "@/components/ui/ShareTracking";
import { RiderRequestModal } from "@/components/ui/RiderRequestModal";

export default function RequestDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const { toasts, showToast, removeToast } = useToast();
  const { isEnabled: notificationsEnabled } = useNotifications();

  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [senderName, setSenderName] = useState<string>("");
  const [commuterName, setCommuterName] = useState<string>("");
  const [senderData, setSenderData] = useState<User | null>(null);
  const [riderData, setRiderData] = useState<User | null>(null);
  const [requestedRider, setRequestedRider] = useState<User | null>(null);
  const [requestedRiders, setRequestedRiders] = useState<Array<{ rider: User; uid: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showOTPs, setShowOTPs] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  // Chat temporarily disabled
  // const [showChat, setShowChat] = useState(false);
  const [otpType, setOtpType] = useState<"pickup" | "drop" | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpVerificationSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Real-time subscription to request
  useEffect(() => {
    if (!user || !requestId) return;

    setLoading(true);
    
    const unsubscribe = subscribeToRequest(
      requestId,
      async (req) => {
        if (!req) {
          showToast("Request not found", "error");
          router.push("/app");
          return;
        }

        setRequest(req);
        setLoading(false);

        // Load sender data
        const sender = await getUser(req.senderId);
        setSenderName(sender?.name || "Unknown");
        setSenderData(sender);

        // Load commuter/rider data if exists
        if (req.commuterId) {
          const commuter = await getUser(req.commuterId);
          setCommuterName(commuter?.name || "Unknown");
          setRiderData(commuter);
        } else {
          setRiderData(null);
        }

        // Load all requested riders if status is "requested"
        if (req.status === "requested") {
          const riderIds = req.requestedRiders || (req.requestedBy ? [req.requestedBy] : []);
          if (riderIds.length > 0) {
            const ridersWithIds = await Promise.all(
              riderIds.map(async (id) => {
                const rider = await getUser(id).catch(() => null);
                return rider ? { rider, uid: id } : null;
              })
            );
            const validRiders = ridersWithIds.filter((r): r is { rider: User; uid: string } => r !== null);
            setRequestedRiders(validRiders);
            // Keep first rider for backward compatibility
            setRequestedRider(validRiders[0]?.rider || null);
          } else {
            setRequestedRiders([]);
            setRequestedRider(null);
          }
        } else {
          setRequestedRiders([]);
          setRequestedRider(null);
        }
      },
      (error) => {
        console.error("Error loading request:", error);
        showToast("Failed to load request", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, requestId, router, showToast]);

  // Check if user has rated when request is completed
  useEffect(() => {
    if (request && user && request.status === "completed") {
      hasUserRated(requestId, user.uid)
        .then((rated) => {
          setHasRated(rated);
          // Auto-show rating modal if not rated yet (only once)
          if (!rated && !showRatingModal) {
            // Small delay to let page render first
            setTimeout(() => {
              setShowRatingModal(true);
            }, 1000);
          }
        })
        .catch((error) => {
          console.error("Error checking rating status:", error);
        });
    }
  }, [request, user, requestId, showRatingModal]);

  const handleRequestClick = () => {
    setRequestModalOpen(true);
  };

  const handleRequestConfirm = async (message?: string) => {
    if (!user || !request) return;

    try {
      await requestToDeliver(requestId, user.uid, message);
      showToast("Request sent! Waiting for sender approval.", "success");
      setRequestModalOpen(false);
      // Real-time listener will update automatically
    } catch (error: any) {
      console.error("Error requesting task:", error);
      showToast(error.message || "Failed to request delivery", "error");
      setRequestModalOpen(false);
    }
  };

  const handleExtendPickupDeadline = async () => {
    if (!user || !request) return;

    if (!confirm("Extend pickup deadline by 30 minutes?")) {
      return;
    }

    try {
      await extendPickupDeadline(requestId, user.uid);
      showToast("Pickup deadline extended by 30 minutes", "success");
    } catch (error: any) {
      console.error("Error extending deadline:", error);
      showToast(error.message || "Failed to extend deadline", "error");
    }
  };

  const handleApprove = async (riderId: string) => {
    if (!request) return;

    try {
      await approveRiderRequest(requestId, riderId);
      showToast("Helper approved! They can now proceed with pickup.", "success");
      // Real-time listener will update automatically
    } catch (error: any) {
      console.error("Error approving rider:", error);
      showToast(error.message || "Failed to approve helper", "error");
    }
  };

  const handleReject = async (riderId?: string) => {
    if (!request) return;

      const message = riderId 
        ? "Are you sure you want to reject this helper's request?"
        : "Are you sure you want to reject all helper requests?";
    
    if (!confirm(message)) {
      return;
    }

    try {
      await rejectRiderRequest(requestId, riderId);
      showToast(riderId ? "Helper request rejected." : "All helper requests rejected.", "success");
      // Real-time listener will update automatically
    } catch (error: any) {
      console.error("Error rejecting rider:", error);
      showToast(error.message || "Failed to reject helper", "error");
    }
  };

  const handleOTPSubmit = async (data: { otp: string }) => {
    if (!request || !otpType) return;

    try {
      if (otpType === "pickup") {
        const success = await verifyPickupOTP(requestId, data.otp);
        if (success) {
          showToast("OTP verified successfully!", "success");
          otpForm.reset();
          setOtpType(null);
          
          // Send notification
          if (notificationsEnabled && user && request) {
            await notifyPickupEvent(request, user.uid);
            if (request.commuterId) {
              await notifyPickupEvent(request, request.commuterId);
            }
          }
        } else {
          showToast("Invalid OTP. Please check and try again.", "error");
        }
      } else {
        // Drop OTP - now returns { success, error }
        const result = await verifyDropOTP(requestId, data.otp);
        if (result.success) {
          showToast("OTP verified successfully! Delivery completed.", "success");
          otpForm.reset();
          setOtpType(null);
          
          // Send notification
          if (notificationsEnabled && user && request) {
            await notifyDropEvent(request, user.uid);
            if (request.senderId) {
              await notifyDropEvent(request, request.senderId);
            }
          }
        } else {
          showToast(result.error || "Invalid OTP. Please check and try again.", "error");
        }
      }
      // Real-time listener will update automatically
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      showToast(error.message || "Failed to verify OTP", "error");
    }
  };

  const handleConfirmSenderPayment = async () => {
    if (!user || !request) return;

    if (!confirm("Confirm that you have made the payment? This will notify the rider.")) {
      return;
    }

    try {
      await confirmSenderPayment(requestId, user.uid);
      showToast("Payment confirmation sent! Waiting for rider to acknowledge receipt.", "success");
    } catch (error: any) {
      console.error("Error confirming sender payment:", error);
      showToast(error.message || "Failed to confirm payment", "error");
    }
  };

  const handleConfirmRiderPayment = async () => {
    if (!user || !request) return;

    if (!confirm("Confirm that you have received the payment? This will complete the payment confirmation.")) {
      return;
    }

    try {
      await confirmRiderPayment(requestId, user.uid);
      showToast("Payment received confirmed! Delivery can now be completed.", "success");
    } catch (error: any) {
      console.error("Error confirming rider payment:", error);
      showToast(error.message || "Failed to confirm payment", "error");
    }
  };

  const handleArrivedAtPickup = async () => {
    if (!user || !request) return;

    try {
      await markArrivedAtPickup(requestId, user.uid);
      showToast("Arrival at pickup location marked", "success");
    } catch (error: any) {
      console.error("Error marking arrival:", error);
      showToast(error.message || "Failed to mark arrival", "error");
    }
  };

  const handleArrivedAtDrop = async () => {
    if (!user || !request) return;

    try {
      await markArrivedAtDrop(requestId, user.uid);
      showToast("Arrival at drop location marked", "success");
    } catch (error: any) {
      console.error("Error marking arrival:", error);
      showToast(error.message || "Failed to mark arrival", "error");
    }
  };

  const handleEnableTracking = async () => {
    if (!user || !request) return;

    try {
      setIsUpdatingLocation(true);
      await enableTracking(requestId, user.uid);
      
      // Get initial location and update
      const location = await getCurrentLocation();
      if (location) {
        await updateRiderLocation(requestId, user.uid, location.lat, location.lng);
      }
      
      showToast("Location tracking enabled", "success");
    } catch (error: any) {
      console.error("Error enabling tracking:", error);
      showToast(error.message || "Failed to enable tracking", "error");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDisableTracking = async () => {
    if (!user || !request) return;

    try {
      await disableTracking(requestId, user.uid);
      showToast("Location tracking disabled", "success");
    } catch (error: any) {
      console.error("Error disabling tracking:", error);
      showToast(error.message || "Failed to disable tracking", "error");
    }
  };

  // Auto-update location when tracking is enabled
  useEffect(() => {
    if (!user || !request) {
      // Clear interval if conditions not met
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
      return;
    }
    if (!request.trackingEnabled) {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
      return;
    }
    if (request.commuterId !== user.uid) {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
      return;
    }
    if (request.status !== "picked" && request.status !== "in_transit") {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
      return;
    }

    const updateLocation = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          await updateRiderLocation(requestId, user.uid, location.lat, location.lng);
        }
      } catch (error) {
        console.error("Error updating location:", error);
      }
    };

    // Update immediately
    updateLocation();

    // Update every 30 seconds
    locationUpdateIntervalRef.current = setInterval(updateLocation, 30000);

    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
        locationUpdateIntervalRef.current = null;
      }
    };
  }, [user, request?.trackingEnabled, request?.commuterId, request?.status, requestId]);

  if (authLoading) {
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
  const canVerifyPickupOTP = isCommuter && (request.status === "waiting_pickup" || request.status === "pickup_otp_pending");
  const canStartTransit = isCommuter && request.status === "picked";
  const canDeliver = isCommuter && request.status === "in_transit";
  const canMarkArrivedPickup = isCommuter && ["approved", "waiting_pickup", "pickup_otp_pending"].includes(request.status) && !request.arrivedAtPickup;
  const canMarkArrivedDrop = isCommuter && request.status === "in_transit" && !request.arrivedAtDrop;
  const canConfirmSenderPayment = isSender && request.status === "in_transit" && !request.senderPaymentMade;
  const canConfirmRiderPayment = isCommuter && request.status === "in_transit" && request.senderPaymentMade && !request.riderPaymentReceived;
  const showPaymentWarning = request.status === "in_transit" && (!request.senderPaymentMade || !request.riderPaymentReceived);
  const paymentFullyConfirmed = request.senderPaymentMade && request.riderPaymentReceived;
  // Chat temporarily disabled
  // const canChat = Boolean((isSender && request.commuterId) || isCommuter);
  // const chatAvailable = canChat && ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"].includes(request.status);
  // const chatDisabled = canChat && (request.status === "delivered" || request.status === "completed");

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
        {loading && !request ? (
          <RequestDetailSkeleton />
        ) : request ? (
          <>
            {/* Timeline - Compact horizontal */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <ParcelTimeline status={request.status} />
            </div>

            {/* Delivery Tracking - Show for senders when tracking is enabled */}
            {isSender && request.trackingEnabled && (request.status === "picked" || request.status === "in_transit") && (
              <DeliveryTracking request={request} />
            )}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Status - Prominent display for riders */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={request.status} />
                {request.status === "created" && request.expiresAt && (
                  <CountdownTimer expiresAt={request.expiresAt} />
                )}
              </div>
              {isSender && (
                <button
                  onClick={() => setShowOTPs(!showOTPs)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 active:text-indigo-800"
                >
                  {showOTPs ? "Hide" : "Show"} OTPs
                </button>
              )}
            </div>
            {/* Status message for riders */}
            {isCommuter && (
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <p className="text-sm font-semibold text-gray-900 mb-1">Current Status:</p>
                <p className="text-base text-gray-700">
                  {request.status === "approved" && "✅ You've been approved! Ready to pick up the item."}
                  {request.status === "waiting_pickup" && "📍 Waiting for pickup. Enter the pickup OTP below."}
                  {request.status === "pickup_otp_pending" && "⏳ Pickup OTP verification pending. Enter OTP below."}
                  {request.status === "picked" && "✅ Item picked up! Start delivery when ready."}
                  {request.status === "in_transit" && "🚚 In transit. Enter drop OTP when you arrive."}
                  {(request.status === "delivered" || request.status === "completed") && "✅ Delivery completed!"}
                  {request.status === "requested" && "⏳ Waiting for sender approval."}
                  {request.status === "rejected" && "❌ Your request was rejected."}
                  {!["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit", "delivered", "completed", "requested", "rejected"].includes(request.status) && 
                    `Status: ${request.status}`}
                </p>
              </div>
            )}
            {/* Status message for senders */}
            {isSender && (
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <p className="text-sm font-semibold text-gray-900 mb-1">Current Status:</p>
                <p className="text-base text-gray-700">
                  {request.status === "created" && "📦 Request created. Waiting for someone to help."}
                  {request.status === "requested" && "⏳ Someone wants to help. Review and approve."}
                  {request.status === "approved" && "✅ Helper approved. Waiting for pickup."}
                  {request.status === "waiting_pickup" && "📍 Helper is ready to pick up. Provide pickup OTP."}
                  {request.status === "pickup_otp_pending" && "⏳ Pickup OTP verification in progress."}
                  {request.status === "picked" && "✅ Item picked up! Delivery in progress."}
                  {request.status === "in_transit" && "🚚 Item in transit. Waiting for delivery."}
                  {(request.status === "delivered" || request.status === "completed") && "✅ Delivery completed!"}
                  {request.status === "cancelled" && "❌ Request cancelled."}
                  {!["created", "requested", "approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit", "delivered", "completed", "cancelled"].includes(request.status) && 
                    `Status: ${request.status}`}
                </p>
              </div>
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

          {/* Share Tracking with Recipient (for sender) */}
          {isSender && request.commuterId && ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit", "delivered", "completed"].includes(request.status) && (
            <ShareTracking request={request} />
          )}

          {/* Pickup - Grab Style */}
          <LocationDisplay
            type="pickup"
            pincode={request.pickupPincode}
            details={request.pickupDetails || undefined}
            showMapButton={true}
          />

          {/* Drop - Grab Style */}
          <LocationDisplay
            type="drop"
            pincode={request.dropPincode}
            details={request.dropDetails || undefined}
            showMapButton={true}
          />

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

          {/* Scheduled Delivery Info */}
          {request.sendNow === false && request.scheduledFor && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-orange-900">Scheduled Delivery</h3>
              </div>
              <p className="text-base font-medium text-orange-800">
                📅 {request.scheduledFor.toDate().toLocaleString()}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                This delivery is scheduled for a specific time. Riders will know this is not for immediate pickup.
              </p>
            </div>
          )}

          {/* Pickup Deadline Timer (for approved requests) */}
          {request.status === "approved" && request.pickupDeadline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-yellow-900">Pickup Deadline</h3>
                </div>
                {isSender && (
                  <button
                    onClick={handleExtendPickupDeadline}
                    className="text-xs text-yellow-700 hover:text-yellow-800 font-medium underline"
                  >
                    Extend +30 min
                  </button>
                )}
              </div>
              <CountdownTimer expiresAt={request.pickupDeadline} />
              <p className="text-xs text-yellow-700 mt-2">
                {isCommuter 
                  ? "You have 30 minutes to pick up the item. If you don't, the request will become available again."
                  : "Rider has 30 minutes to pick up. You can extend the deadline if needed."}
              </p>
            </div>
          )}

          {/* Tip */}
          {request.priceOffered && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Tip</h3>
              <p className="text-2xl font-bold text-indigo-600">
                ${request.priceOffered}
              </p>
            </div>
          )}

          {/* PayNow QR Codes - Show when delivery is active and has tip */}
          {request.priceOffered && request.priceOffered > 0 && 
           request.commuterId && 
           ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"].includes(request.status) && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Information</h3>
              {/* Show sender's QR if user is rider */}
              {isCommuter && senderData?.payNowQR && (
                <PayNowQRDisplay
                  qrCodeUrl={senderData.payNowQR}
                  userName={senderName}
                  isSender={true}
                />
              )}
              {/* Show rider's QR if user is sender */}
              {isSender && riderData?.payNowQR && (
                <PayNowQRDisplay
                  qrCodeUrl={riderData.payNowQR}
                  userName={commuterName}
                  isSender={false}
                />
              )}
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

          {/* Rider Request Cards (for sender to approve/reject) */}
          {canApprove && requestedRiders.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  People Who Want to Help ({requestedRiders.length})
                </h3>
                {requestedRiders.length > 1 && (
                  <button
                    onClick={() => handleReject()}
                    className="text-sm text-red-600 hover:text-red-700 active:text-red-800"
                  >
                    Reject All
                  </button>
                )}
              </div>
              {requestedRiders.map(({ rider, uid }) => {
                const riderMessage = request.riderRequestMessages?.[uid];
                return (
                  <div key={uid} className="space-y-2">
                    <RiderProfileCard
                      rider={rider}
                      onApprove={() => handleApprove(uid)}
                      onReject={() => handleReject(uid)}
                    />
                    {riderMessage && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 ml-4">
                        <p className="text-xs font-medium text-blue-900 mb-1">Message from {rider.name}:</p>
                        <p className="text-sm text-blue-800 italic">"{riderMessage}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Chat temporarily disabled */}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {canRequest && (
              <button
                onClick={handleRequestClick}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Request to Deliver
              </button>
            )}

                    {/* Arrived at Pickup Button */}
                    {canMarkArrivedPickup && (
                      <button
                        onClick={handleArrivedAtPickup}
                        className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        I've Arrived at Pickup Location
                      </button>
                    )}

                    {/* Arrival Status */}
                    {request.arrivedAtPickup && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Arrived at pickup location</span>
                      </div>
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
                              showToast("OTP verification initiated. Ask sender for OTP.", "success");
                              // Real-time listener will update automatically
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

            {(canVerifyPickupOTP || canPickup) && (
              <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Enter Pickup OTP:
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Get the 4-digit OTP from the sender to verify pickup.
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-center font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all duration-150"
                  >
                    Verify
                  </button>
                </form>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-600 mt-2">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
            )}

            {canStartTransit && (
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      await startTransit(requestId);
                      showToast("Started transit", "success");
                      // Real-time listener will update automatically
                    } catch (error) {
                      showToast("Failed to start transit", "error");
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
                >
                  Start Delivery
                </button>

                {/* Tracking Option */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    📍 Enable Location Tracking
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Allow the sender to track your location during delivery. Your location will update automatically every 30 seconds.
                  </p>
                  {!request.trackingEnabled ? (
                    <button
                      onClick={handleEnableTracking}
                      disabled={isUpdatingLocation}
                      className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingLocation ? "Enabling..." : "Enable Tracking"}
                    </button>
                  ) : (
                    <button
                      onClick={handleDisableTracking}
                      className="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700"
                    >
                      Disable Tracking
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Controls for in_transit status */}
            {isCommuter && request.status === "in_transit" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      📍 Location Tracking
                    </p>
                    <p className="text-xs text-gray-600">
                      {request.trackingEnabled 
                        ? "Your location is being shared with the sender. Updates every 30 seconds."
                        : "Enable tracking to let the sender see your location during delivery."}
                    </p>
                  </div>
                  {request.trackingEnabled && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                      Active
                    </span>
                  )}
                </div>
                {!request.trackingEnabled ? (
                  <button
                    onClick={handleEnableTracking}
                    disabled={isUpdatingLocation}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingLocation ? "Enabling..." : "Enable Tracking"}
                  </button>
                ) : (
                  <button
                    onClick={handleDisableTracking}
                    className="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700"
                  >
                    Disable Tracking
                  </button>
                )}
              </div>
            )}

            {/* Arrived at Drop Button */}
            {canMarkArrivedDrop && (
              <button
                onClick={handleArrivedAtDrop}
                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                I've Arrived at Drop Location
              </button>
            )}

            {/* Arrival Status at Drop */}
            {request.arrivedAtDrop && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">Arrived at drop location</span>
              </div>
            )}

            {/* Payment Confirmation Message */}
            {showPaymentWarning && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-900 mb-1">
                        Payment Confirmation Required
                      </p>
                      <p className="text-sm text-yellow-800 mb-3">
                        <strong>Important:</strong> Both sender and rider must confirm payment before delivery can be completed.
                      </p>
                      
                      {/* Payment Status */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          {request.senderPaymentMade ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className={`text-sm ${request.senderPaymentMade ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                            Sender: {request.senderPaymentMade ? 'Payment made ✓' : 'Waiting for sender to confirm payment'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.riderPaymentReceived ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className={`text-sm ${request.riderPaymentReceived ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                            Rider: {request.riderPaymentReceived ? 'Payment received ✓' : request.senderPaymentMade ? 'Waiting for rider to confirm receipt' : 'Waiting for sender confirmation first'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {canConfirmSenderPayment && (
                          <button
                            onClick={handleConfirmSenderPayment}
                            className="w-full bg-[#00C57E] text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-[#00A869] active:bg-[#00995A] transition-all duration-150 shadow-card"
                          >
                            ✓ I Have Made The Payment
                          </button>
                        )}
                        {canConfirmRiderPayment && (
                          <button
                            onClick={handleConfirmRiderPayment}
                            className="w-full bg-[#00C57E] text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-[#00A869] active:bg-[#00995A] transition-all duration-150 shadow-card"
                          >
                            ✓ I Have Received The Payment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PayNow QR Codes */}
                {request.priceOffered && request.priceOffered > 0 && (
                  <div className="space-y-3">
                    {/* Show sender's QR if user is rider */}
                    {isCommuter && senderData?.payNowQR && (
                      <PayNowQRDisplay
                        qrCodeUrl={senderData.payNowQR}
                        userName={senderName}
                        isSender={true}
                      />
                    )}
                    {/* Show rider's QR if user is sender */}
                    {isSender && riderData?.payNowQR && (
                      <PayNowQRDisplay
                        qrCodeUrl={riderData.payNowQR}
                        userName={commuterName}
                        isSender={false}
                      />
                    )}
                    {/* Show both if user is neither (shouldn't happen, but just in case) */}
                    {!isSender && !isCommuter && (
                      <>
                        {senderData?.payNowQR && (
                          <PayNowQRDisplay
                            qrCodeUrl={senderData.payNowQR}
                            userName={senderName}
                            isSender={true}
                          />
                        )}
                        {riderData?.payNowQR && (
                          <PayNowQRDisplay
                            qrCodeUrl={riderData.payNowQR}
                            userName={commuterName}
                            isSender={false}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Fully Confirmed Status */}
            {paymentFullyConfirmed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-800">
                    Payment Fully Confirmed
                  </span>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <p>✓ Sender confirmed payment made</p>
                  <p>✓ Rider confirmed payment received</p>
                  <p className="font-medium mt-2">You can now complete the delivery with OTP.</p>
                </div>
              </div>
            )}

            {canDeliver && (
              <div className="space-y-2 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Enter Drop OTP:
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  {paymentFullyConfirmed 
                    ? "Enter the 4-digit OTP to complete delivery."
                    : "⚠️ Payment must be confirmed by both sender and rider before completing delivery."}
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-center font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 active:scale-[0.98] transition-all duration-150"
                  >
                    Verify
                  </button>
                </form>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-600 mt-2">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
          </>
        ) : null}
      </main>

      {/* Rating Modal */}
      {request && user && request.status === "completed" && (
        <>
          {!hasRated && (
            <div className="fixed bottom-6 left-4 right-4 z-40 md:left-auto md:right-6 md:w-80">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Rate your experience
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Help build trust in the community by rating this {isSender ? "helper" : "sender"}
                </p>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                  Rate Now
                </button>
              </div>
            </div>
          )}
          <RatingModal
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            onRate={async (rating, comment) => {
              if (!request || !user) return;
              const ratedUserId = isSender ? request.commuterId : request.senderId;
              if (!ratedUserId) throw new Error("User to rate not found");
              
              await submitRating(
                requestId,
                user.uid,
                ratedUserId,
                rating,
                comment
              );
              setHasRated(true);
            }}
            userName={isSender ? commuterName : senderName}
            userRole={isSender ? "commuter" : "sender"}
          />
        </>
      )}

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <RiderRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onConfirm={handleRequestConfirm}
        requestDescription={request?.itemDescription}
      />
    </div>
  );
}

