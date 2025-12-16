"use client";

import { Sidebar } from "../../components/layout/Sidebar";
import { MobileNav } from "../../components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          {/* Page content */}
          <div className="pb-20 lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}

