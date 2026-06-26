"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "~/lib/auth-client";
import { useUserStore } from "~/lib/stores/user-store";
import { Skeleton } from "~/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending, error } = useSession();
  const setUser = useUserStore((state) => state.setUser);

  React.useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    } else if (session?.user) {
      setUser(session.user as any);
    }
  }, [session, isPending, router, pathname, setUser]);

  if (isPending) {
    return (
      <div className="p-6 space-y-4" data-testid="auth-guard-loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
