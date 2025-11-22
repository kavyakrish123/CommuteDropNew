import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { NotificationInitializer } from "@/components/NotificationInitializer";

export const metadata: Metadata = {
  title: "CommuteDrop - Deliver on the way",
  description: "Send or carry items along your commute",
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

