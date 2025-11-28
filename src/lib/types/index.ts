import { Timestamp } from "firebase/firestore";

export type UserRole = "sender" | "commuter" | "both";

export type CommuteType = "mrt" | "bus" | "both" | "other";

export interface User {
  phone: string | null;
  email: string | null;
  name: string;
  role: UserRole;
  profileImage?: string | null;
  bio?: string | null;
  payNowQR?: string | null;
  policiesAccepted: boolean;
  onboardingCompleted: boolean;
  rating?: number | null; // Average rating (1-5)
  totalDeliveries?: number; // Total completed deliveries
  commuteType?: CommuteType; // MRT, Bus, Both, or Other
  fcmToken?: string | null; // Firebase Cloud Messaging token for push notifications
  notificationEnabled?: boolean; // Whether user wants nearby task notifications
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type RequestStatus =
  | "created"
  | "requested" // Rider has requested to deliver
  | "approved" // Sender approved the rider
  | "waiting_pickup"
  | "pickup_otp_pending"
  | "picked"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "expired"
  | "rejected"; // Sender rejected the rider's request

export type ItemCategory =
  | "documents"
  | "electronics"
  | "clothing"
  | "books"
  | "personal_items"
  | "other";

export const RESTRICTED_CATEGORIES: ItemCategory[] = []; // Can be extended later

export interface DeliveryRequest {
  id?: string;
  senderId: string;
  commuterId: string | null;
  requestedBy?: string | null; // DEPRECATED: Use requestedRiders array instead
  requestedRiders?: string[]; // Array of rider IDs who requested (queue)
  pickupPincode: string;
  pickupDetails: string;
  dropPincode: string;
  dropDetails: string;
  itemDescription: string;
  itemPhoto?: string | null;
  category: ItemCategory;
  priceOffered: number | null;
  status: RequestStatus;
  otpPickup: number;
  otpDrop: number;
  expiresAt: Timestamp; // Auto-expire after 60 minutes
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Location for distance calculation
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
  // Ratings
  senderRating?: number | null; // Rating given by sender to commuter
  commuterRating?: number | null; // Rating given by commuter to sender
  senderRatingComment?: string | null;
  commuterRatingComment?: string | null;
  // Delivery Tracking
  trackingEnabled?: boolean; // Whether rider has enabled location tracking
  riderLat?: number | null; // Rider's current latitude
  riderLng?: number | null; // Rider's current longitude
  lastLocationUpdate?: Timestamp | null; // Last time rider location was updated
}

