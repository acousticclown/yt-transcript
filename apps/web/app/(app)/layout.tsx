"use client";

import { Sidebar } from "../../components/layout/Sidebar";
import { MobileNav } from "../../components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-[var(--color-bg)] overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Desktop only, fixed height */}
        <div className="hidden lg:block h-full">
          <Sidebar isOpen={true} onClose={() => {}} />
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
    </div>
  );
}

