"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Logo } from "../Logo";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "📝", label: "Notes", href: "/notes" },
  { icon: "🎬", label: "YouTube", href: "/youtube" },
  { icon: "🏷️", label: "Tags", href: "/tags" },
];

const bottomItems = [
  { icon: "⚙️", label: "Settings", href: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop: always visible, Mobile: slide in/out */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[var(--color-surface)] border-r border-[var(--color-border)]",
          "flex flex-col h-screen",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <Logo size="md" href="/dashboard" />
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
            />
            <kbd className="hidden sm:inline text-xs text-[var(--color-text-subtle)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded">
              /
            </kbd>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom items */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User */}
          <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-bg)]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium text-sm">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">User</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

