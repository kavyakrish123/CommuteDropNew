import { z } from "zod";

// Email/Password auth schemas
export const emailPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => {
        const trimmed = val.trim();
        // If starts with +, validate as full international number
        if (trimmed.startsWith("+")) {
          return /^\+[1-9]\d{8,14}$/.test(trimmed);
        }
        // Otherwise, validate as local number (8-15 digits, will be combined with +65)
        return /^\d{8,15}$/.test(trimmed);
      },
      {
        message: "Enter 8-15 digits (or full number with country code starting with +)",
      }
    ),
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

