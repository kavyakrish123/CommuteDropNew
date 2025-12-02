"use client";

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
  itemDescription: z
    .string()
    .min(10, "Item description must be at least 10 characters")
    .max(500, "Item description too long"),
  category: z.enum(
    ["documents", "electronics", "clothing", "books", "personal_items", "other"],
    {
      required_error: "Please select a category",
    }
  ),
  pickupPincode: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location too long"),
  pickupDetails: z
    .string()
    .max(200, "Pickup details too long")
    .default(""),
  dropPincode: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location too long"),
  dropDetails: z
    .string()
    .max(200, "Drop details too long")
    .default(""),
  priceOffered: z
    .number()
    .positive("Tip must be positive")
    .optional()
    .nullable(),
  sendNow: z.boolean().default(true),
  scheduledFor: z
    .date()
    .optional()
    .nullable()
    .refine(
      (date) => {
        if (!date) return true; // Optional
        return date > new Date(); // Must be in the future
      },
      { message: "Scheduled time must be in the future" }
    ),
});

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

