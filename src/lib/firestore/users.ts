import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { User } from "@/lib/types";

export async function getUser(uid: string): Promise<User | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as User;
}

