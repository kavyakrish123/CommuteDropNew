"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema } from "@/lib/validation/schemas";
import { createRequest } from "@/lib/firestore/requests";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

export default function CreateRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const form = useForm<{
    pickupPincode: string;
    pickupDetails: string;
    dropPincode: string;
    dropDetails: string;
    itemDescription: string;
    priceOffered: number | null;
  }>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      priceOffered: null,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: {
    pickupPincode: string;
    pickupDetails: string;
    dropPincode: string;
    dropDetails: string;
    itemDescription: string;
    priceOffered: number | null;
  }) => {
    if (!user) return;

    try {
      const requestId = await createRequest(user.uid, data);
      showToast("Request created successfully!", "success");
      router.push(`/requests/${requestId}`);
    } catch (error) {
      console.error("Error creating request:", error);
      showToast("Failed to create request. Please try again.", "error");
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
          <h1 className="text-2xl font-bold text-gray-900">Create Request</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-md p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Pincode *
            </label>
            <input
              {...form.register("pickupPincode")}
              type="text"
              placeholder="123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.pickupPincode && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.pickupPincode.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Details *
            </label>
            <textarea
              {...form.register("pickupDetails")}
              rows={3}
              placeholder="Building name, floor, landmark, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.pickupDetails && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.pickupDetails.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Pincode *
            </label>
            <input
              {...form.register("dropPincode")}
              type="text"
              placeholder="123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.dropPincode && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.dropPincode.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Details *
            </label>
            <textarea
              {...form.register("dropDetails")}
              rows={3}
              placeholder="Building name, floor, landmark, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.dropDetails && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.dropDetails.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Description *
            </label>
            <textarea
              {...form.register("itemDescription")}
              rows={3}
              placeholder="Brief description of the item"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.itemDescription && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.itemDescription.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Offered (Optional)
            </label>
            <input
              {...form.register("priceOffered", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {form.formState.errors.priceOffered && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.priceOffered.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Request"}
          </button>
        </form>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

