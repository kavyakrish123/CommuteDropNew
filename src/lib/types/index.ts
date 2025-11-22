import { Timestamp } from "firebase/firestore";

export type UserRole = "sender" | "commuter" | "both";

export interface User {
  phone: string | null;
  email: string | null;
  name: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type RequestStatus =
  | "open"
  | "accepted"
  | "picked"
  | "delivered"
  | "cancelled";

export interface DeliveryRequest {
  id?: string;
  senderId: string;
  commuterId: string | null;
  pickupPincode: string;
  pickupDetails: string;
  dropPincode: string;
  dropDetails: string;
  itemDescription: string;
  priceOffered: number | null;
  status: RequestStatus;
  otpPickup: number;
  otpDrop: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

