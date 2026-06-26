"use client";

import * as React from "react";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyEmail } from "~/hooks/api/auth";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { verifyEmailAsync, isPending, isSuccess, error } = useVerifyEmail();

  useEffect(() => {
    if (token && !isPending && !isSuccess && !error) {
      verifyEmailAsync({ token }).catch(() => {});
    }
  }, [token, isPending, isSuccess, error, verifyEmailAsync]);

  if (isPending) {
    return (
      <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-foreground" />
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Email verified!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your email has been successfully verified.
          </p>
          <button
            onClick={() => router.push("/dashboard/forms")}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold px-6 hover:bg-primary/90 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Verification failed</h1>
          <p className="text-sm text-destructive mb-6">{error.message}</p>
          <Link
            href="/signin"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold px-6 hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] text-center">
      <p className="text-muted-foreground">Invalid verification link.</p>
      <Link
        href="/signin"
        className="text-foreground font-medium hover:underline mt-4 inline-block"
      >
        Sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-foreground" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
