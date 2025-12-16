"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: "🏠", label: "Home", href: "/dashboard" },
  { icon: "📝", label: "Notes", href: "/notes" },
  { icon: "🎬", label: "YouTube", href: "/youtube" },
  { icon: "⚙️", label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-border)] lg:hidden safe-area-pb">
      <ul className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

