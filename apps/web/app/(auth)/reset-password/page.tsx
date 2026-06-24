"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

import { useResetPassword } from "~/hooks/api/auth";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { resetPasswordAsync, isPending, isSuccess, error } = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-primary hover:underline mt-4 inline-block">
          Request new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMatchError("");

    if (newPassword !== confirmPassword) {
      setMatchError("Passwords do not match");
      return;
    }

    await resetPasswordAsync({ token, newPassword });
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FormForge</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-xl font-semibold mb-2">Password updated</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your password has been reset successfully.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Link href="/" className="inline-flex items-center gap-2 mb-8">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">FormForge</span>
      </Link>

      <h1 className="text-2xl font-semibold mb-2">New password</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">
            New password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {matchError ? <p className="text-sm text-destructive">{matchError}</p> : null}
        {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Resetting..." : "Reset password"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}