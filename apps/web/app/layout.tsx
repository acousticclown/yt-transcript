import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { UserProvider } from "../lib/UserContext";
import { ToastProvider } from "../components/ui";
import { QueryProvider } from "../lib/QueryProvider";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Notely - Smart Notes, Effortlessly",
  description: "Transform YouTube videos into smart notes. Organize your thoughts with AI assistance.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Notely",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F5A623",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <UserProvider>
              <ToastProvider>
                {children}
                <ServiceWorkerRegistration />
              </ToastProvider>
            </UserProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
