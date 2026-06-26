"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useResetPassword } from "~/hooks/api/auth";
import { Doodle } from "~/components/chrome";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { resetPasswordAsync, isPending, isSuccess, error } = useResetPassword();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [matchError, setMatchError] = React.useState("");

  if (!token) {
    return (
      <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] text-center">
        <p className="text-muted-foreground">Invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="text-foreground font-medium hover:underline mt-4 inline-block"
        >
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
      <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Password updated</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your password has been reset successfully.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold px-6 hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-foreground mb-2">
          New password
          <span className="relative inline-block ml-1">
            .
            <Doodle
              name="underline-wave"
              className="absolute -bottom-1 left-0 w-full h-2"
            />
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-medium text-muted-foreground ml-1 mb-2 uppercase tracking-widest"
          >
            New password <span className="text-destructive">*</span>
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 px-4 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            required
            minLength={6}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-muted-foreground ml-1 mb-2 uppercase tracking-widest"
          >
            Confirm password <span className="text-destructive">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 px-4 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            required
            minLength={6}
          />
        </div>

        {matchError && (
          <p className="text-sm text-destructive" role="alert">
            {matchError}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-primary disabled:active:scale-100"
        >
          {isPending ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
