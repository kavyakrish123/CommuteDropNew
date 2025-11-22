"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailPasswordSchema } from "@/lib/validation/schemas";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

interface EmailAuthFormProps {
  onError: (message: string) => void;
}

export function EmailAuthForm({ onError }: EmailAuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<{ email: string; password: string }>({
    resolver: zodResolver(emailPasswordSchema),
  });

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setLoading(true);
      let user;

      if (mode === "register") {
        const result = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        user = result.user;

        // Create user document
        await setDoc(
          doc(db, "users", user.uid),
          {
            phone: null,
            email: user.email,
            name: user.email?.split("@")[0] || `User ${user.uid.slice(0, 6)}`,
            role: "both",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        user = result.user;
      }

      router.push("/app");
    } catch (error: any) {
      console.error("Auth error:", error);
      onError(
        error.message || `Failed to ${mode}. Please check your credentials.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-center text-sm font-medium ${
            mode === "login"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-2 text-center text-sm font-medium ${
            mode === "register"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...form.register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...form.register("password")}
            type="password"
            placeholder="••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? mode === "login"
              ? "Logging in..."
              : "Registering..."
            : mode === "login"
            ? "Login"
            : "Register"}
        </button>
      </form>
    </div>
  );
}

