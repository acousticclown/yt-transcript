"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Logo } from "../Logo";
import { useUser } from "../../lib/UserContext";
import { 
  HomeIcon, 
  NotesIcon, 
  YouTubeIcon, 
  TagIcon, 
  SearchIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronDownIcon 
} from "../Icons";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearchClick?: () => void;
};

const navItems = [
  { icon: HomeIcon, label: "Dashboard", href: "/dashboard" },
  { icon: NotesIcon, label: "Notes", href: "/notes" },
  { icon: YouTubeIcon, label: "YouTube", href: "/youtube" },
  { icon: TagIcon, label: "Tags", href: "/tags" },
];

export function Sidebar({ isOpen, onClose, onSearchClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

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
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
          >
            <SearchIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="flex-1 text-left text-sm text-[var(--color-text-subtle)]">Search...</span>
            <kbd className="hidden sm:inline text-xs text-[var(--color-text-subtle)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
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
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-bg)] hover:bg-[var(--color-bg-alt)] transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium text-sm">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <ChevronDownIcon 
                className={cn(
                  "w-4 h-4 text-[var(--color-text-muted)] transition-transform",
                  showUserMenu && "rotate-180"
                )}
              />
            </button>

            {/* User menu dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden"
                >
                  <Link
                    href="/settings"
                    onClick={() => { setShowUserMenu(false); onClose(); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-[var(--color-border)]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
}
