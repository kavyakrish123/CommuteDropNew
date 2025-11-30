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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pikkrr" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#00C57E" />
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

