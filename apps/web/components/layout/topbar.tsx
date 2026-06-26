"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronLeft } from "lucide-react";
import { CommandPalette } from "~/components/chrome/command-palette";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
}

export function Topbar({
  title = "FormForge",
  subtitle = "Add and customize forms for your needs",
  showBack = false,
  backHref = "/dashboard",
}: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 flex items-center gap-3 px-5 bg-surface border-b border-border shadow-shadow-sm z-50">
      {showBack ? (
        <Link
          href={backHref}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-hover transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </Link>
      ) : (
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-brand-text font-bold text-sm">F</span>
          </div>
        </Link>
      )}

      <div className="flex flex-col mr-auto">
        <span className="font-display font-bold text-md text-brand leading-tight tracking-tight">
          {title}
        </span>
        <span className="text-xs text-text-muted leading-tight">{subtitle}</span>
      </div>

      <div className="flex items-center gap-2">
        <CommandPalette />
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-hover transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-text-secondary" />
          ) : (
            <Moon className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>
    </header>
  );
}
