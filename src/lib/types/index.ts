import { Timestamp } from "firebase/firestore";

export type UserRole = "sender" | "commuter" | "both";

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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type RequestStatus =
  | "created"
  | "accepted"
  | "waiting_pickup"
  | "pickup_otp_pending"
  | "picked"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "expired";

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
  // Location for distance calculation (optional, can be added later)
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
}

