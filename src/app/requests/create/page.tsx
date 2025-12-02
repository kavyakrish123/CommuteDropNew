"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import { createRequest } from "@/lib/firestore/requests";
import { ItemCategory } from "@/lib/types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { geocodePostalCode } from "@/lib/utils/geolocation";
import { validateLocation, debounce, LocationValidationResult } from "@/lib/utils/locationValidation";
import Link from "next/link";

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "documents", label: "Documents" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "personal_items", label: "Personal Items" },
  { value: "other", label: "Other" },
];

export default function CreateRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [itemPhoto, setItemPhoto] = useState<File | null>(null);
  const [itemPhotoUrl, setItemPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Location validation states
  const [pickupValidation, setPickupValidation] = useState<{
    status: "idle" | "validating" | "valid" | "invalid";
    result?: LocationValidationResult;
  }>({ status: "idle" });
  
  const [dropValidation, setDropValidation] = useState<{
    status: "idle" | "validating" | "valid" | "invalid";
    result?: LocationValidationResult;
  }>({ status: "idle" });

  const form = useForm<z.infer<typeof createRequestSchema>>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      priceOffered: 5,
      pickupDetails: "",
      dropDetails: "",
      sendNow: true,
      scheduledFor: null,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Debounced validation functions
  const debouncedValidatePickup = debounce(async (value: string) => {
    if (!value || value.trim().length === 0) {
      setPickupValidation({ status: "idle" });
      return;
    }

    setPickupValidation({ status: "validating" });
    const result = await validateLocation(value);
    
    if (result.isValid) {
      setPickupValidation({ status: "valid", result });
      // Update form with validated coordinates
      form.setValue("pickupPincode", value);
    } else {
      setPickupValidation({ status: "invalid", result });
    }
  }, 500);

  const debouncedValidateDrop = debounce(async (value: string) => {
    if (!value || value.trim().length === 0) {
      setDropValidation({ status: "idle" });
      return;
    }

    setDropValidation({ status: "validating" });
    const result = await validateLocation(value);
    
    if (result.isValid) {
      setDropValidation({ status: "valid", result });
      // Update form with validated coordinates
      form.setValue("dropPincode", value);
    } else {
      setDropValidation({ status: "invalid", result });
    }
  }, 500);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setItemPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setItemPhotoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    const storageRef = ref(storage, `requests/${user.uid}/${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleStepContinue = () => {
    if (step === 1) {
      const itemDescription = form.getValues("itemDescription");
      const category = form.getValues("category");
      
      if (!itemDescription || itemDescription.length < 10) {
        showToast("Please enter an item description (at least 10 characters)", "error");
        return;
      }
      if (!category) {
        showToast("Please select a category", "error");
        return;
      }
      if (!itemPhoto) {
        showToast("Please upload an item photo", "error");
        return;
      }
      // Reset pickup validation when entering step 2
      setPickupValidation({ status: "idle" });
      setStep(2);
      return;
    }

    if (step === 2) {
      const pickupPincode = form.getValues("pickupPincode");
      if (!pickupPincode || pickupPincode.trim().length === 0) {
        showToast("Please enter a pickup location", "error");
        return;
      }
      if (pickupValidation.status !== "valid") {
        showToast("Please enter a valid Singapore location (postal code or address)", "error");
        return;
      }
      // Reset drop validation when entering step 3
      setDropValidation({ status: "idle" });
      setStep(3);
      return;
    }

    if (step === 3) {
      const dropPincode = form.getValues("dropPincode");
      if (!dropPincode || dropPincode.trim().length === 0) {
        showToast("Please enter a drop location", "error");
        return;
      }
      if (dropValidation.status !== "valid") {
        showToast("Please enter a valid Singapore location (postal code or address)", "error");
        return;
      }
      setStep(4);
      return;
    }
  };

  const onSubmit = async (data: z.infer<typeof createRequestSchema>) => {
    if (!user) return;

    // Final submit - step 4
    try {
      setUploading(true);

      // Upload item photo
      let itemPhotoUrl_final: string | null = null;
      if (itemPhoto) {
        itemPhotoUrl_final = await uploadImage(itemPhoto);
      }

      // Use validated coordinates if available, otherwise try to geocode
      let pickupLat: number | null = pickupValidation.result?.lat ?? null;
      let pickupLng: number | null = pickupValidation.result?.lng ?? null;
      let dropLat: number | null = dropValidation.result?.lat ?? null;
      let dropLng: number | null = dropValidation.result?.lng ?? null;

      // Fallback to geocoding if validation didn't provide coordinates
      if (!pickupLat || !pickupLng) {
        const pickupLocation = await geocodePostalCode(data.pickupPincode);
        pickupLat = pickupLocation?.lat ?? null;
        pickupLng = pickupLocation?.lng ?? null;
      }

      if (!dropLat || !dropLng) {
        const dropLocation = await geocodePostalCode(data.dropPincode);
        dropLat = dropLocation?.lat ?? null;
        dropLng = dropLocation?.lng ?? null;
      }

      // Final validation - ensure we have valid coordinates
      if (!pickupLat || !pickupLng) {
        showToast("Invalid pickup location. Please enter a valid Singapore address or postal code.", "error");
        setUploading(false);
        return;
      }

      if (!dropLat || !dropLng) {
        showToast("Invalid drop location. Please enter a valid Singapore address or postal code.", "error");
        setUploading(false);
        return;
      }

      const requestId = await createRequest(user.uid, {
        ...data,
        priceOffered: data.priceOffered ?? null,
        itemPhoto: itemPhotoUrl_final,
        pickupLat,
        pickupLng,
        dropLat,
        dropLng,
        sendNow: data.sendNow ?? true,
        scheduledFor: data.sendNow === false ? data.scheduledFor || null : null,
      });

      showToast("Request created successfully!", "success");
      router.push(`/requests/${requestId}`);
    } catch (error) {
      console.error("Error creating request:", error);
      showToast("Failed to create request. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EFFFEE]">
      {/* Mobile App Style Header */}
      <header className="bg-white shadow-card border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link
            href="/app"
            className="text-gray-600 hover:text-gray-900 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Create Delivery Request</h1>
            <p className="text-xs text-[#666666]">Step {step} of 4</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-24">
                {/* SG Compliance Warning */}
                {step === 1 && (
                  <div className="space-y-3 mb-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Singapore Compliance:</strong> Ensure your item complies with
                            Singapore laws. Prohibited items include cigarettes, alcohol, food, and
                            illegal substances.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            <strong>⚠️ Ethical Reminder:</strong> It is unethical to create requests and not show up when someone comes to help. 
                            Please only create requests you genuinely need. No-shows may result in account restrictions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#666666]">Progress</span>
            <span className="text-xs font-medium text-[#00C57E]">{step}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#00C57E] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-soft-lg shadow-card-lg p-5 space-y-5"
        >
          {/* Step 1: Item Details */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Item Description *
                </label>
                <textarea
                  {...form.register("itemDescription")}
                  rows={4}
                  placeholder="Describe the item clearly..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold resize-none"
                  style={{ color: "#000000", fontWeight: 700 }}
                />
                {form.formState.errors.itemDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.itemDescription.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Category *
                </label>
                <select
                  {...form.register("category")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold bg-white"
                  style={{ color: "#000000", fontWeight: 700 }}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Item Photo *
                </label>
                <div className="space-y-3">
                  {itemPhotoUrl && (
                    <div className="relative">
                      <img
                        src={itemPhotoUrl}
                        alt="Item preview"
                        className="w-full h-48 object-cover rounded-soft-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setItemPhoto(null);
                          setItemPhotoUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        aria-label="Remove photo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <label className="block">
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-soft-lg text-center cursor-pointer hover:border-[#00C57E] transition-colors">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">Tap to upload photo</p>
                      <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStepContinue}
                disabled={!itemPhoto || !form.watch("category") || !form.watch("itemDescription")}
                className="w-full bg-[#00C57E] text-white py-4 px-4 rounded-soft-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-card"
              >
                Continue
              </button>
            </>
          )}

          {/* Step 2: Pickup Location */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Pickup Location * (Postal Code or Address)
                </label>
                <input
                  {...form.register("pickupPincode")}
                  type="text"
                  placeholder="123456 or Orchard Road, Singapore"
                  onChange={(e) => {
                    form.setValue("pickupPincode", e.target.value);
                    debouncedValidatePickup(e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold ${
                    pickupValidation.status === "valid"
                      ? "border-green-500 bg-green-50"
                      : pickupValidation.status === "invalid"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  style={{ color: "#000000", fontWeight: 700 }}
                />
                {pickupValidation.status === "validating" && (
                  <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Validating location...
                  </p>
                )}
                {pickupValidation.status === "valid" && pickupValidation.result?.address && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {pickupValidation.result.address}
                  </p>
                )}
                {pickupValidation.status === "invalid" && pickupValidation.result?.error && (
                  <p className="mt-1 text-sm text-red-600">
                    {pickupValidation.result.error}
                  </p>
                )}
                {form.formState.errors.pickupPincode && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.pickupPincode.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter a Singapore postal code (6 digits) or address
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Pickup Details (Optional)
                </label>
                <textarea
                  {...form.register("pickupDetails")}
                  rows={3}
                  placeholder="Building name, floor, landmark, etc. (Optional for privacy)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold resize-none"
                  style={{ color: "#000000", fontWeight: 700 }}
                />
                {form.formState.errors.pickupDetails && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.pickupDetails.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Additional details are optional for privacy
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-soft-lg font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStepContinue}
                  disabled={pickupValidation.status !== "valid"}
                  className="flex-1 bg-[#00C57E] text-white py-4 px-4 rounded-soft-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-card"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step 3: Drop Location */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Drop Location * (Postal Code or Address)
                </label>
                <input
                  {...form.register("dropPincode")}
                  type="text"
                  placeholder="123456 or Marina Bay, Singapore"
                  onChange={(e) => {
                    form.setValue("dropPincode", e.target.value);
                    debouncedValidateDrop(e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold ${
                    dropValidation.status === "valid"
                      ? "border-green-500 bg-green-50"
                      : dropValidation.status === "invalid"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  style={{ color: "#000000", fontWeight: 700 }}
                />
                {dropValidation.status === "validating" && (
                  <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Validating location...
                  </p>
                )}
                {dropValidation.status === "valid" && dropValidation.result?.address && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {dropValidation.result.address}
                  </p>
                )}
                {dropValidation.status === "invalid" && dropValidation.result?.error && (
                  <p className="mt-1 text-sm text-red-600">
                    {dropValidation.result.error}
                  </p>
                )}
                {form.formState.errors.dropPincode && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.dropPincode.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter a Singapore postal code (6 digits) or address
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Drop Details (Optional)
                </label>
                <textarea
                  {...form.register("dropDetails")}
                  rows={3}
                  placeholder="Building name, floor, landmark, etc. (Optional for privacy)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold resize-none"
                  style={{ color: "#000000", fontWeight: 700 }}
                />
                {form.formState.errors.dropDetails && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.dropDetails.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Additional details are optional for privacy
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-soft-lg font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStepContinue}
                  disabled={dropValidation.status !== "valid"}
                  className="flex-1 bg-[#00C57E] text-white py-4 px-4 rounded-soft-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-card"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step 4: Scheduling & Pricing */}
          {step === 4 && (
            <>
              {/* Scheduling Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When to Send?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-soft-lg cursor-pointer hover:border-[#00C57E] active:scale-[0.98] transition-all">
                    <input
                      type="radio"
                      {...form.register("sendNow")}
                      value="true"
                      checked={form.watch("sendNow") === true}
                      onChange={() => form.setValue("sendNow", true)}
                      className="w-5 h-5 text-[#00C57E] focus:ring-[#00C57E]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A1A]">Send Now</p>
                      <p className="text-sm text-[#666666]">Riders can pick up immediately</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-soft-lg cursor-pointer hover:border-[#00C57E] active:scale-[0.98] transition-all">
                    <input
                      type="radio"
                      {...form.register("sendNow")}
                      value="false"
                      checked={form.watch("sendNow") === false}
                      onChange={() => form.setValue("sendNow", false)}
                      className="w-5 h-5 text-[#00C57E] focus:ring-[#00C57E]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A1A]">Schedule for Later</p>
                      <p className="text-sm text-[#666666]">Riders will know this is for a specific time</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Scheduled Date/Time */}
              {form.watch("sendNow") === false && (
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      if (e.target.value) {
                        form.setValue("scheduledFor", new Date(e.target.value));
                      } else {
                        form.setValue("scheduledFor", null);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-base text-black font-bold"
                    style={{ color: "#000000", fontWeight: 700 }}
                  />
                  {form.formState.errors.scheduledFor && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.scheduledFor.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Select when you need this delivered
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                  Tip Amount (SGD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#1A1A1A]">$</span>
                  <input
                    {...form.register("priceOffered", { valueAsNumber: true })}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="5.00"
                    className="w-full pl-8 pr-4 py-3.5 border-2 border-gray-300 rounded-soft-lg focus:ring-2 focus:ring-[#00C57E] focus:border-[#00C57E] text-lg text-black font-bold"
                    style={{ color: "#000000", fontWeight: 700 }}
                  />
                </div>
                {form.formState.errors.priceOffered && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.priceOffered.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-[#666666]">
                  💡 Tip amount helps attract riders. Default is $5.
                </p>
              </div>

              {/* Review Summary */}
              <div className="bg-[#EFFFEE] border-2 border-[#00C57E] p-4 rounded-soft-lg space-y-3">
                <h3 className="font-bold text-[#1A1A1A] text-base">Review Your Request</h3>
                <div className="text-sm text-[#1A1A1A] space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-[#666666]">Item:</span>
                    <span className="font-semibold">{form.watch("itemDescription")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#666666]">Category:</span>
                    <span className="font-semibold">{CATEGORIES.find((c) => c.value === form.watch("category"))?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#666666]">Pickup:</span>
                    <span className="font-semibold">{form.watch("pickupPincode")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#666666]">Drop:</span>
                    <span className="font-semibold">{form.watch("dropPincode")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#666666]">Timing:</span>
                    <span className="font-semibold">{form.watch("sendNow") ? "Send Now" : form.watch("scheduledFor") ? `Scheduled for ${form.watch("scheduledFor")?.toLocaleString()}` : "Not set"}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#00C57E] pt-2">
                    <span className="font-medium text-[#666666]">Tip:</span>
                    <span className="font-bold text-[#00C57E] text-lg">${form.watch("priceOffered") || 5}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-soft-lg font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-[#00C57E] text-white py-4 px-4 rounded-soft-lg font-semibold hover:bg-[#00A869] active:bg-[#00995A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-card"
                >
                  {uploading ? "Creating..." : "Create Request"}
                </button>
              </div>
            </>
          )}
        </form>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
