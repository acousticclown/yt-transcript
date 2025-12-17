"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/layout/Sidebar";
import { MobileNav } from "../../components/layout/MobileNav";
import { SearchModal } from "../../components/SearchModal";
import { useUser } from "../../lib/UserContext";
import { useKeyboardShortcuts } from "../../lib/useKeyboardShortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { authState } = useUser();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onClose: () => setSearchOpen(false),
    onYouTube: () => router.push("/youtube"),
    enabled: authState === "authenticated",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authState === "unauthenticated") {
      router.push("/login");
    }
  }, [authState, router]);

  // Show loading while checking auth
  if (authState === "loading") {
    return (
      <div className="h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (authState !== "authenticated") {
    return null;
  }

  return (
    <div className="h-screen bg-[var(--color-bg)] overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Desktop only, fixed height */}
        <div className="hidden lg:block h-full">
          <Sidebar isOpen={true} onClose={() => {}} onSearchClick={() => setSearchOpen(true)} />
        </div>

        {/* Main content - independent scroll */}
        <main className="flex-1 h-full overflow-y-auto">
          <div className="pb-20 lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Global search modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
