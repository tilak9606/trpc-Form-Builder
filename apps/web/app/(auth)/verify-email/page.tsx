"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { useVerifyEmail } from "~/hooks/api/auth";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { verifyEmailAsync, isPending, isSuccess, error } = useVerifyEmail();

  useEffect(() => {
    if (token && !isPending && !isSuccess && !error) {
      verifyEmailAsync({ token }).catch(() => {
        // Error handled by hook
      });
    }
  }, [token, isPending, isSuccess, error, verifyEmailAsync]);

  if (isPending) {
    return (
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FormForge</span>
        </Link>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FormForge</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-xl font-semibold mb-2">Email verified!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your email has been successfully verified.
          </p>
          <button
            onClick={() => router.push("/dashboard/forms")}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FormForge</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8">
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-semibold mb-2">Verification failed</h1>
          <p className="text-sm text-destructive mb-6">{error.message}</p>
          <Link
            href="/signin"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-muted-foreground">Invalid verification link.</p>
      <Link href="/signin" className="text-primary hover:underline mt-4 inline-block">
        Sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}