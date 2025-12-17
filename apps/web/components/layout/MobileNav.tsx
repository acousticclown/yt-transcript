"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { HomeIcon, NotesIcon, YouTubeIcon, TagIcon, SettingsIcon } from "../Icons";

const navItems = [
  { icon: HomeIcon, label: "Home", href: "/dashboard" },
  { icon: NotesIcon, label: "Notes", href: "/notes" },
  { icon: YouTubeIcon, label: "YouTube", href: "/youtube" },
  { icon: TagIcon, label: "Tags", href: "/tags" },
  { icon: SettingsIcon, label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-border)] lg:hidden safe-area-pb">
      <ul className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[64px]",
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
