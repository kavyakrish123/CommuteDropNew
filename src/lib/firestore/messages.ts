import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface ChatMessage {
  id?: string;
  requestId: string;
  senderId: string;
  receiverId: string;
  message: string;
  photoUrl?: string | null;
  createdAt: Timestamp;
}

export async function sendMessage(
  requestId: string,
  senderId: string,
  receiverId: string,
  message: string,
  photoUrl?: string | null
): Promise<string> {
  const messageData: Omit<ChatMessage, "id"> = {
    requestId,
    senderId,
    receiverId,
    message,
    photoUrl: photoUrl || null,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(collection(db, "messages"), messageData);
  return docRef.id;
}

export async function getMessages(
  requestId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  const q = query(
    collection(db, "messages"),
    where("requestId", "==", requestId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChatMessage)
    )
    .reverse(); // Reverse to show oldest first
}

export function subscribeToMessages(
  requestId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "messages"),
    where("requestId", "==", requestId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ChatMessage)
    );
    callback(messages);
  });
}

