"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/firestore/messages";
import { subscribeToMessages, sendMessage } from "@/lib/firestore/messages";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { format } from "date-fns";

// Request notification permission
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// Show notification for new message
function showMessageNotification(message: ChatMessage, otherUserName: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const title = `New message from ${otherUserName}`;
    const body = message.photoUrl ? "📷 Photo" : message.message;
    
    new Notification(title, {
      body,
      icon: "/favicon.ico", // You can add a custom icon
      badge: "/favicon.ico",
      tag: `chat-${message.requestId}`, // Group notifications by chat
      requireInteraction: false,
    });
  }
}

interface ChatWindowProps {
  requestId: string;
  otherUserId: string;
  otherUserName: string;
}

export function ChatWindow({ requestId, otherUserId, otherUserName }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !requestId) return;

    // Request notification permission on mount
    requestNotificationPermission();

    const seenMessageIds = new Set<string>();

    const unsubscribe = subscribeToMessages(requestId, (updatedMessages) => {
      // Check for new messages (not sent by current user and not seen before)
      updatedMessages.forEach((msg) => {
        if (msg.id && msg.senderId !== user.uid && !seenMessageIds.has(msg.id)) {
          // Show notification like a phone (always, even when page is focused)
          showMessageNotification(msg, otherUserName);
          seenMessageIds.add(msg.id);
        }
      });

      setMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, [user, requestId, otherUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await sendMessage(requestId, user.uid, otherUserId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const storageRef = ref(storage, `chat/${requestId}/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(storageRef);

      await sendMessage(requestId, user.uid, otherUserId, "", photoUrl);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-md border border-gray-200">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Chat with {otherUserName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === user.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.photoUrl && (
                    <img
                      src={msg.photoUrl}
                      alt="Shared photo"
                      className="mb-2 rounded-lg max-w-full h-auto"
                    />
                  )}
                  {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-indigo-100" : "text-gray-500"
                    }`}
                  >
                    {msg.createdAt ? format(msg.createdAt.toDate(), "HH:mm") : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              className="hidden"
            />
            <div className="p-2 text-gray-600 hover:text-indigo-600">
              {uploadingPhoto ? (
                <span className="text-sm">Uploading...</span>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || uploadingPhoto}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

