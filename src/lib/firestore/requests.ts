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
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DeliveryRequest } from "@/lib/types";
import { generateOTP } from "@/lib/utils/otp";

export async function createRequest(
  senderId: string,
  data: {
    pickupPincode: string;
    pickupDetails: string;
    dropPincode: string;
    dropDetails: string;
    itemDescription: string;
    priceOffered: number | null;
  }
): Promise<string> {
  const otpPickup = generateOTP();
  const otpDrop = generateOTP();

  const requestData: Omit<DeliveryRequest, "id"> = {
    senderId,
    commuterId: null,
    ...data,
    status: "open",
    otpPickup,
    otpDrop,
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
  currentUserId: string
): Promise<DeliveryRequest[]> {
  const q = query(
    collection(db, "requests"),
    where("status", "==", "open"),
    where("senderId", "!=", currentUserId)
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

