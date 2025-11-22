import { z } from "zod";

// Email/Password auth schemas
export const emailPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const createRequestSchema = z.object({
  pickupPincode: z
    .string()
    .min(5, "Pincode must be at least 5 digits")
    .max(6, "Pincode must be at most 6 digits")
    .regex(/^\d+$/, "Pincode must contain only numbers"),
  pickupDetails: z
    .string()
    .min(5, "Pickup details must be at least 5 characters"),
  dropPincode: z
    .string()
    .min(5, "Pincode must be at least 5 digits")
    .max(6, "Pincode must be at most 6 digits")
    .regex(/^\d+$/, "Pincode must contain only numbers"),
  dropDetails: z.string().min(5, "Drop details must be at least 5 characters"),
  itemDescription: z
    .string()
    .min(5, "Item description must be at least 5 characters"),
  priceOffered: z
    .number()
    .positive("Price must be positive")
    .optional()
    .nullable(),
});

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

