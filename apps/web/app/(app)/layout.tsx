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
          {/* Mobile header */}
          <header className="sticky top-0 z-30 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)] lg:hidden">
            <div className="flex items-center justify-center px-4 py-3">
              <span className="font-bold text-[var(--color-text)]">📝 NotesAI</span>
            </div>
          </header>

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

