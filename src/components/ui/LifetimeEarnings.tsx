"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DeliveryRequest } from "@/lib/types";

export function LifetimeEarnings() {
  const { user } = useAuth();
  const [lifetimeEarnings, setLifetimeEarnings] = useState<number>(0);
  const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const calculateEarnings = async () => {
      try {
        // Get all completed deliveries where user is the commuter
        const completedQuery = query(
          collection(db, "requests"),
          where("commuterId", "==", user.uid),
          where("status", "==", "completed")
        );

        const querySnapshot = await getDocs(completedQuery);
        let totalEarnings = 0;
        let deliveryCount = 0;

        querySnapshot.forEach((doc) => {
          const request = { id: doc.id, ...doc.data() } as DeliveryRequest;
          if (request.priceOffered && request.priceOffered > 0) {
            totalEarnings += request.priceOffered;
          }
          deliveryCount++;
        });

        setLifetimeEarnings(totalEarnings);
        setTotalDeliveries(deliveryCount);
      } catch (error) {
        console.error("Error calculating lifetime earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateEarnings();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#00C57E] to-[#00A869] rounded-soft-lg shadow-card-lg p-6 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
          <div className="h-8 bg-white/20 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#00C57E] to-[#00A869] rounded-soft-lg shadow-card-lg p-6 text-white relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-white/90 mb-1">Lifetime Earnings</p>
            <p className="text-3xl font-bold">${lifetimeEarnings.toFixed(2)}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-white/80">
              {totalDeliveries} {totalDeliveries === 1 ? "delivery" : "deliveries"}
            </span>
          </div>
          {totalDeliveries > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm text-white/80">
                ${totalDeliveries > 0 ? (lifetimeEarnings / totalDeliveries).toFixed(2) : "0.00"} avg
              </span>
            </div>
          )}
        </div>
        
        {lifetimeEarnings === 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 text-center">
              Start earning by accepting your first delivery! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

