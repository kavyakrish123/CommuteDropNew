/**
 * Status change notification utilities
 * Sends notifications to both sender and helper on status changes
 */

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DeliveryRequest, User } from "@/lib/types";

export interface NotificationData {
  title: string;
  body: string;
  requestId: string;
  type: "status_change" | "nearby_request" | "payment" | "arrival";
}

/**
 * Get notification message for status change
 */
export function getStatusNotification(
  status: string,
  isSender: boolean,
  request: DeliveryRequest
): { title: string; body: string } {
  switch (status) {
    case "approved":
      return isSender
        ? {
            title: "Helper Approved! 🎉",
            body: "Your helper has been approved and is ready to pick up.",
          }
        : {
            title: "You're Approved! ✅",
            body: "The sender approved your request. You can now proceed to pickup.",
          };

    case "waiting_pickup":
      return isSender
        ? {
            title: "Helper Arriving Soon 📍",
            body: "Your helper is on the way to the pickup location.",
          }
        : {
            title: "Almost There! 🚶",
            body: "You're near the pickup location. Get ready to verify OTP.",
          };

    case "pickup_otp_pending":
      return isSender
        ? {
            title: "OTP Verification Started 🔐",
            body: "Your helper is verifying the pickup OTP. Provide the code when asked.",
          }
        : {
            title: "Enter Pickup OTP 🔑",
            body: "Enter the OTP provided by the sender to complete pickup.",
          };

    case "picked":
      return isSender
        ? {
            title: "Item Picked Up! 📦",
            body: "Your helper has picked up the item and is starting delivery.",
          }
        : {
            title: "Pickup Complete! ✅",
            body: "Item picked up successfully. Start your delivery now.",
          };

    case "in_transit":
      return isSender
        ? {
            title: "Delivery In Progress 🚚",
            body: "Your helper is on the way to the drop-off location.",
          }
        : {
            title: "On Your Way 🚶",
            body: "You're delivering the item. Head to the drop-off location.",
          };

    case "delivered":
      return isSender
        ? {
            title: "Item Delivered! 🎉",
            body: "Your helper has arrived at the drop-off location.",
          }
        : {
            title: "Arrived at Drop-off 📍",
            body: "You've arrived. Verify the drop-off OTP to complete delivery.",
          };

    case "completed":
      const tipText = request.priceOffered ? ` Tip: $${request.priceOffered}` : "";
      return isSender
        ? {
            title: "Delivery Completed! ✅",
            body: `Your delivery is complete!${tipText}`,
          }
        : {
            title: "Delivery Complete! 🎉",
            body: `Great job! Delivery completed.${tipText}`,
          };

    case "paymentConfirmed":
      return isSender
        ? {
          title: "Payment Confirmed! 💰",
          body: "The tip payment has been confirmed.",
        }
        : {
          title: "Payment Received! 💰",
          body: `You received $${request.priceOffered || 0} tip!`,
        };

    default:
      return {
        title: "Status Updated",
        body: `Your delivery status has been updated to ${status}.`,
      };
  }
}

/**
 * Get arrival notification
 */
export function getArrivalNotification(
  location: "pickup" | "drop",
  isSender: boolean
): { title: string; body: string } {
  if (location === "pickup") {
    return isSender
      ? {
          title: "Helper Arrived! 📍",
          body: "Your helper has arrived at the pickup location.",
        }
      : {
          title: "You've Arrived! 📍",
          body: "You're at the pickup location. Request OTP verification.",
        };
  } else {
    return isSender
      ? {
          title: "Helper Arrived at Drop-off! 📍",
          body: "Your helper has arrived at the drop-off location.",
        }
      : {
          title: "Arrived at Drop-off! 📍",
          body: "You're at the drop-off location. Verify OTP to complete.",
        };
  }
}

