"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "~/hooks/api/auth";
import { env } from "~/env";
import { toast } from "~/lib/toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export function GoogleAuthButton() {
  const router = useRouter();
  const { googleAuthAsync } = useGoogleAuth();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleCredential = useCallback(async (response: { credential: string }) => {
    try {
      await googleAuthAsync({ idToken: response.credential });
      router.push("/dashboard/forms");
    } catch (err) {
      toast.error("Google sign-in failed. Please try again.");
    }
  }, [googleAuthAsync, router]);

  useEffect(() => {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    if (window.google) {
      setScriptLoaded(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [handleCredential]);

  const handleClick = () => {
    if (!scriptLoaded) return;
    window.google?.accounts.id.prompt();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!scriptLoaded}
      className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent disabled:opacity-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </button>
  );
}