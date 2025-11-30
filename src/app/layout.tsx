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
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        
        {/* Apple Touch Icons for iOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon-60x60.png" sizes="60x60" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-76x76.png" sizes="76x76" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-120x120.png" sizes="120x120" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-152x152.png" sizes="152x152" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-167x167.png" sizes="167x167" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" sizes="180x180" />
        
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pikkrr" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#00C57E" />
        <meta name="msapplication-TileColor" content="#00C57E" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
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

