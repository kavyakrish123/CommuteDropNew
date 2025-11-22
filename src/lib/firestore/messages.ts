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
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "messages"),
    where("requestId", "==", requestId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage)
      );
      callback(messages);
    },
    (error) => {
      console.error("Error subscribing to messages:", error);
      if (error.code === "failed-precondition" || error.message?.includes("index")) {
        const indexUrlMatch = error.message?.match(/https:\/\/[^\s\)]+/);
        if (indexUrlMatch) {
          console.error("🔗 Create Firestore index here:", indexUrlMatch[0]);
          if (onError) {
            onError(new Error(`Firestore index required. Check console for link: ${indexUrlMatch[0]}`));
          }
        } else {
          console.error("Firestore index required for messages collection. Query: requestId == X, orderBy createdAt");
          if (onError) {
            onError(new Error("Firestore index required. Check console for details."));
          }
        }
      } else if (onError) {
        onError(error);
      }
    }
  );
}

