"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check onboarding status for protected routes
        const currentPath = window.location.pathname;
        const publicRoutes = ["/", "/auth", "/terms", "/onboarding"];
        if (!publicRoutes.includes(currentPath)) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
            
            if (!userData?.onboardingCompleted && currentPath !== "/onboarding") {
              router.push("/onboarding");
            }
          } catch (error) {
            console.error("Error checking user data:", error);
          }
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

