import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DeliveryRequest, RequestStatus } from "@/lib/types";
import { generateOTP } from "@/lib/utils/otp";
import { ItemCategory } from "@/lib/types";

export async function createRequest(
  senderId: string,
  data: {
    pickupPincode: string;
    pickupDetails: string;
    dropPincode: string;
    dropDetails: string;
    itemDescription: string;
    category: ItemCategory;
    itemPhoto?: string | null;
    priceOffered: number | null;
  }
): Promise<string> {
  const otpPickup = generateOTP();
  const otpDrop = generateOTP();

  // Set expiry to 60 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 60);

  const requestData: Omit<DeliveryRequest, "id"> = {
    senderId,
    commuterId: null,
    ...data,
    status: "created",
    otpPickup,
    otpDrop,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(collection(db, "requests"), requestData);
  return docRef.id;
}

export async function getRequest(requestId: string): Promise<DeliveryRequest | null> {
  const docRef = doc(db, "requests", requestId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as DeliveryRequest;
}

export async function getMyRequests(senderId: string): Promise<DeliveryRequest[]> {
  const q = query(collection(db, "requests"), where("senderId", "==", senderId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as DeliveryRequest)
  );
}

export async function getAvailableRequests(
  currentUserId: string,
  filterPincode?: string
): Promise<DeliveryRequest[]> {
  // Note: This query requires a composite index in Firestore
  // If you get an error, Firebase will provide a link to create the index
  const q = query(
    collection(db, "requests"),
    where("status", "==", "created"), // Updated status
    where("senderId", "!=", currentUserId)
  );
  
  try {
    const querySnapshot = await getDocs(q);
    const now = new Date();
    
    let requests = querySnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as DeliveryRequest)
      )
      .filter((req) => {
        // Filter out expired requests
        if (req.expiresAt) {
          const expiryDate = req.expiresAt.toDate();
          if (expiryDate < now) {
            return false;
          }
        }
        // Filter by pincode if provided
        if (filterPincode && req.pickupPincode) {
          return req.pickupPincode.includes(filterPincode);
        }
        return true;
      });

    return requests;
  } catch (error: any) {
    // If index error, extract and log the index creation URL
    if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
      const indexUrlMatch = error?.message?.match(/https:\/\/[^\s\)]+/);
      if (indexUrlMatch) {
        console.error("🔗 Create Firestore index here:", indexUrlMatch[0]);
        // Store URL in error for easy access
        error.indexUrl = indexUrlMatch[0];
      } else {
        console.error(
          "Firestore index required. Check the error message above for the index creation link."
        );
      }
    }
    throw error;
  }
}

export async function acceptRequest(
  requestId: string,
  commuterId: string
): Promise<void> {
  const docRef = doc(db, "requests", requestId);
  await updateDoc(docRef, {
    commuterId,
    status: "accepted",
    updatedAt: serverTimestamp(),
  });
}

export async function getRiderActiveTasks(commuterId: string): Promise<DeliveryRequest[]> {
  // Get all tasks for this commuter and filter by active statuses
  // Note: Firestore "in" operator supports up to 10 values, but we'll fetch all and filter
  const q = query(
    collection(db, "requests"),
    where("commuterId", "==", commuterId)
  );
  const querySnapshot = await getDocs(q);
  
  const activeStatuses: RequestStatus[] = ["accepted", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"];
  
  return querySnapshot.docs
    .map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as DeliveryRequest)
    )
    .filter((req) => activeStatuses.includes(req.status));
}

export async function canRiderAcceptTask(commuterId: string): Promise<{ canAccept: boolean; reason?: string }> {
  const activeTasks = await getRiderActiveTasks(commuterId);
  
  // Check max 3 active tasks
  if (activeTasks.length >= 3) {
    return {
      canAccept: false,
      reason: "You have reached the maximum of 3 active pickups",
    };
  }
  
  // Check if any task is waiting for OTP verification
  const waitingOTP = activeTasks.some(
    (task) => task.status === "pickup_otp_pending" || task.status === "waiting_pickup"
  );
  
  if (waitingOTP) {
    return {
      canAccept: false,
      reason: "Please verify OTP for your current pickup before accepting new tasks",
    };
  }
  
  return { canAccept: true };
}

export async function verifyPickupOTP(
  requestId: string,
  otp: string
): Promise<boolean> {
  const request = await getRequest(requestId);
  if (!request) return false;

  if (request.otpPickup.toString() === otp) {
    const docRef = doc(db, "requests", requestId);
    await updateDoc(docRef, {
      status: "picked",
      updatedAt: serverTimestamp(),
    });
    return true;
  }
  return false;
}

export async function initiatePickupOTP(requestId: string): Promise<void> {
  const docRef = doc(db, "requests", requestId);
  await updateDoc(docRef, {
    status: "pickup_otp_pending",
    updatedAt: serverTimestamp(),
  });
}

export async function startTransit(requestId: string): Promise<void> {
  const docRef = doc(db, "requests", requestId);
  await updateDoc(docRef, {
    status: "in_transit",
    updatedAt: serverTimestamp(),
  });
}

export async function verifyDropOTP(
  requestId: string,
  otp: string
): Promise<boolean> {
  const request = await getRequest(requestId);
  if (!request) return false;

  if (request.otpDrop.toString() === otp) {
    const docRef = doc(db, "requests", requestId);
    await updateDoc(docRef, {
      status: "delivered",
      updatedAt: serverTimestamp(),
    });
    return true;
  }
  return false;
}

