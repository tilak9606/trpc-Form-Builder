"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FormInput, Layers, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FormInput, label: "Forms", href: "/dashboard/forms" },
  { icon: Layers, label: "Templates", href: "/dashboard/templates" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-border flex items-center justify-around md:hidden z-50">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            isActive(item.href)
              ? "text-brand"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
