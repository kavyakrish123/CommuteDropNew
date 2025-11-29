import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { NotificationInitializer } from "@/components/NotificationInitializer";

export const metadata: Metadata = {
  title: "Pikkrr - Transform Your Daily Commute Into Passive Income",
  description: "The peer-to-peer delivery platform that connects commuters with package senders for eco-friendly, cost-effective deliveries along existing routes.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <AuthProvider>
          <NotificationInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

