import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { UserProvider } from "../lib/UserContext";
import { ToastProvider } from "../components/ui";
import { QueryProvider } from "../lib/QueryProvider";

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
  },
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
              </ToastProvider>
            </UserProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
