"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, LogOut, User } from "lucide-react";
import { useSession, signOut } from "~/lib/auth-client";

export function MarketingHeader() {
  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 bg-[#f0efe3]/85 backdrop-blur-md border-b border-[#e5e5e5]/60">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-[#f0efe3]" />
        </div>
        <span className="text-lg font-semibold text-[#1a1a1a]">FormForge</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        {!isPending && !isLoggedIn && (
          <>
            <Link
              href="/dashboard"
              className="text-sm text-[#737373] hover:text-[#1a1a1a] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/signin"
              className="text-sm text-[#737373] hover:text-[#1a1a1a] transition-colors"
            >
              Login
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {isPending ? (
          <div className="w-20 h-9 rounded-full bg-[#e5e5e5] animate-pulse" />
        ) : isLoggedIn ? (
          <>
            <span className="text-sm text-[#1a1a1a] font-medium hidden sm:inline">
              {session.user.name || session.user.email}
            </span>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-full border border-[#1a1a1a] px-4 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#e6e5d8]"
            >
              <User className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
              className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[#737373] transition-colors hover:text-[#1a1a1a] hover:bg-[#e6e5d8]"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="text-sm text-[#737373] hover:text-[#1a1a1a] transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-full bg-[#1a1a1a] px-5 text-sm font-medium text-[#f0efe3] transition-colors hover:bg-[#333] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
