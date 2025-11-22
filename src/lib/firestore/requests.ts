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
  onSnapshot,
  Unsubscribe,
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
    pickupLat?: number | null;
    pickupLng?: number | null;
    dropLat?: number | null;
    dropLng?: number | null;
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
    where("status", "==", "created"), // Only unassigned tasks
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
            // Mark as expired in database (async, don't wait)
            if (req.id && req.status === "created") {
              updateDoc(doc(db, "requests", req.id), {
                status: "expired",
                updatedAt: serverTimestamp(),
              }).catch(console.error);
            }
            return false;
          }
        }
        // Note: Pincode filtering is now done client-side for better flexibility
        // This allows filtering by both pickup and drop pincode
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

export async function requestToDeliver(
  requestId: string,
  commuterId: string
): Promise<void> {
  const request = await getRequest(requestId);
  if (!request) {
    throw new Error("Request not found");
  }

  // Check if already requested
  const requestedRiders = request.requestedRiders || [];
  if (requestedRiders.includes(commuterId)) {
    throw new Error("You have already requested this task");
  }

  // Check if already approved or has a commuter
  if (request.commuterId || request.status !== "created") {
    throw new Error("This task is no longer available");
  }

  const docRef = doc(db, "requests", requestId);
  
  // Add to queue and set status to requested if first request
  const updatedRiders = [...requestedRiders, commuterId];
  await updateDoc(docRef, {
    requestedRiders: updatedRiders,
    requestedBy: updatedRiders[0], // Keep for backward compatibility
    status: "requested",
    updatedAt: serverTimestamp(),
  });
}

export async function approveRiderRequest(
  requestId: string,
  riderId: string
): Promise<void> {
  const request = await getRequest(requestId);
  if (!request) {
    throw new Error("Request not found");
  }

  const requestedRiders = request.requestedRiders || [];
  if (!requestedRiders.includes(riderId)) {
    throw new Error("This rider has not requested this task");
  }

  const docRef = doc(db, "requests", requestId);
  
  // Approve the selected rider and clear the queue
  await updateDoc(docRef, {
    commuterId: riderId,
    requestedRiders: [],
    requestedBy: null, // Clear for backward compatibility
    status: "approved",
    updatedAt: serverTimestamp(),
  });
}

export async function rejectRiderRequest(
  requestId: string,
  riderId?: string
): Promise<void> {
  const request = await getRequest(requestId);
  if (!request) {
    throw new Error("Request not found");
  }

  const docRef = doc(db, "requests", requestId);
  
  if (riderId) {
    // Reject specific rider
    const requestedRiders = request.requestedRiders || [];
    const updatedRiders = requestedRiders.filter(id => id !== riderId);
    
    await updateDoc(docRef, {
      requestedRiders: updatedRiders,
      requestedBy: updatedRiders.length > 0 ? updatedRiders[0] : null,
      status: updatedRiders.length > 0 ? "requested" : "created",
      updatedAt: serverTimestamp(),
    });
  } else {
    // Reject all riders (clear queue)
    await updateDoc(docRef, {
      requestedRiders: [],
      requestedBy: null,
      status: "created", // Return to created so other riders can request
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getRequestedTasks(senderId: string): Promise<DeliveryRequest[]> {
  const q = query(
    collection(db, "requests"),
    where("senderId", "==", senderId),
    where("status", "==", "requested")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as DeliveryRequest)
  );
}

export async function getRiderActiveTasks(commuterId: string): Promise<DeliveryRequest[]> {
  // Get all tasks for this commuter and filter by active statuses
  // Note: Firestore "in" operator supports up to 10 values, but we'll fetch all and filter
  const q = query(
    collection(db, "requests"),
    where("commuterId", "==", commuterId)
  );
  const querySnapshot = await getDocs(q);
  
  // Active statuses: tasks that are not yet completed
  const activeStatuses: RequestStatus[] = ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"];
  
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

export async function getRiderRequestedTasks(commuterId: string): Promise<DeliveryRequest[]> {
  // Get all requests with status "requested" and filter by array-contains
  // Note: Firestore doesn't support array-contains with where on status, so we fetch and filter
  const q = query(
    collection(db, "requests"),
    where("status", "==", "requested")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as DeliveryRequest)
    )
    .filter((req) => {
      // Check both new array field and old single field for backward compatibility
      const requestedRiders = req.requestedRiders || [];
      const requestedBy = req.requestedBy;
      return requestedRiders.includes(commuterId) || requestedBy === commuterId;
    });
}

export async function getRiderCurrentPickup(commuterId: string): Promise<DeliveryRequest | null> {
  // Get the current pickup task (one that hasn't been picked up yet)
  const activeTasks = await getRiderActiveTasks(commuterId);
  
  // Find tasks that are waiting for pickup OTP verification
  const waitingPickup = activeTasks.find(
    (task) => task.status === "approved" || task.status === "waiting_pickup" || task.status === "pickup_otp_pending"
  );
  
  return waitingPickup || null;
}

export async function canRiderRequestTask(commuterId: string): Promise<{ canRequest: boolean; reason?: string }> {
  const activeTasks = await getRiderActiveTasks(commuterId);
  const requestedTasks = await getRiderRequestedTasks(commuterId);
  
  // Check if already requested this task
  if (requestedTasks.length > 0) {
    return {
      canRequest: false,
      reason: "You have already requested to deliver a task. Wait for sender approval.",
    };
  }
  
  // NEW RULE: Only one pickup at a time - must verify pickup OTP before requesting next task
  if (activeTasks.length > 0) {
    // Check if there's a task in pickup phase (not yet picked)
    const currentPickup = await getRiderCurrentPickup(commuterId);
    
    if (currentPickup) {
      return {
        canRequest: false,
        reason: `You have an active pickup. Please go to the pickup location and verify the OTP before requesting a new task.`,
      };
    }
  }
  
  return { canRequest: true };
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
      status: "completed", // Automatically complete when drop OTP is verified
      updatedAt: serverTimestamp(),
    });
    return true;
  }
  return false;
}

export async function cancelRequest(requestId: string, senderId: string): Promise<void> {
  const request = await getRequest(requestId);
  if (!request) {
    throw new Error("Request not found");
  }
  
  if (request.senderId !== senderId) {
    throw new Error("Only the sender can cancel this request");
  }
  
  // Only allow cancellation if no rider has requested or been approved yet
  if (request.status !== "created") {
    throw new Error("Cannot cancel request. A rider has already requested or been approved.");
  }
  
  const docRef = doc(db, "requests", requestId);
  await updateDoc(docRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

// Real-time subscription functions
export function subscribeToRequest(
  requestId: string,
  callback: (request: DeliveryRequest | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, "requests", requestId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({
          id: docSnap.id,
          ...docSnap.data(),
        } as DeliveryRequest);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error subscribing to request:", error);
      if (onError) {
        onError(error);
      }
    }
  );
}

export function subscribeToMyRequests(
  senderId: string,
  callback: (requests: DeliveryRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "requests"), where("senderId", "==", senderId));
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const requests = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as DeliveryRequest)
        )
        .filter((req) => req.status !== "completed" && req.status !== "cancelled" && req.status !== "expired"); // Exclude completed/cancelled/expired from dashboard
      callback(requests);
    },
    (error) => {
      console.error("Error subscribing to my requests:", error);
      if (onError) {
        onError(error);
      }
    }
  );
}

export function subscribeToAvailableRequests(
  currentUserId: string,
  callback: (requests: DeliveryRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "requests"),
    where("status", "==", "created"),
    where("senderId", "!=", currentUserId)
  );
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const now = new Date();
      const requests = querySnapshot.docs
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
              // Mark as expired in database (async, don't wait)
              if (req.id && req.status === "created") {
                updateDoc(doc(db, "requests", req.id), {
                  status: "expired",
                  updatedAt: serverTimestamp(),
                }).catch(console.error);
              }
              return false;
            }
          }
          return true;
        });
      callback(requests);
    },
    (error: any) => {
      console.error("Error subscribing to available requests:", error);
      if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
        const indexUrlMatch = error?.message?.match(/https:\/\/[^\s\)]+/);
        if (indexUrlMatch) {
          console.error("🔗 Create Firestore index here:", indexUrlMatch[0]);
          (error as any).indexUrl = indexUrlMatch[0];
        }
      }
      if (onError) {
        onError(error);
      }
    }
  );
}

export function subscribeToRiderActiveTasks(
  commuterId: string,
  callback: (tasks: DeliveryRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "requests"), where("commuterId", "==", commuterId));
  const activeStatuses: RequestStatus[] = ["approved", "waiting_pickup", "pickup_otp_pending", "picked", "in_transit"];
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const tasks = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as DeliveryRequest)
        )
        .filter((req) => activeStatuses.includes(req.status));
      callback(tasks);
    },
    (error) => {
      console.error("Error subscribing to rider active tasks:", error);
      if (onError) {
        onError(error);
      }
    }
  );
}

// Subscribe to completed requests for history
export function subscribeToCompletedRequests(
  userId: string,
  callback: (requests: DeliveryRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // Get requests where user is either sender or commuter and status is completed
  const senderQuery = query(
    collection(db, "requests"),
    where("senderId", "==", userId),
    where("status", "==", "completed")
  );
  
  const commuterQuery = query(
    collection(db, "requests"),
    where("commuterId", "==", userId),
    where("status", "==", "completed")
  );
  
  let senderUnsubscribe: (() => void) | null = null;
  let commuterUnsubscribe: (() => void) | null = null;
  const allRequests: DeliveryRequest[] = [];
  
  const updateCallback = () => {
    // Remove duplicates by ID
    const unique = allRequests.filter((req, index, self) => 
      index === self.findIndex((r) => r.id === req.id)
    );
    callback(unique);
  };
  
  senderUnsubscribe = onSnapshot(
    senderQuery,
    (querySnapshot) => {
      const senderRequests = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as DeliveryRequest)
      );
      
      // Remove old sender requests and add new ones
      const filtered = allRequests.filter((req) => req.senderId !== userId || req.status !== "completed");
      allRequests.length = 0;
      allRequests.push(...filtered, ...senderRequests);
      updateCallback();
    },
    (error) => {
      console.error("Error subscribing to completed sender requests:", error);
      if (onError) {
        onError(error);
      }
    }
  );
  
  commuterUnsubscribe = onSnapshot(
    commuterQuery,
    (querySnapshot) => {
      const commuterRequests = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as DeliveryRequest)
      );
      
      // Remove old commuter requests and add new ones
      const senderRequests = allRequests.filter((req) => req.senderId === userId && req.status === "completed");
      allRequests.length = 0;
      allRequests.push(...senderRequests, ...commuterRequests);
      updateCallback();
    },
    (error) => {
      console.error("Error subscribing to completed commuter requests:", error);
      if (onError) {
        onError(error);
      }
    }
  );
  
  return () => {
    if (senderUnsubscribe) senderUnsubscribe();
    if (commuterUnsubscribe) commuterUnsubscribe();
  };
}

