"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useForgotPassword } from "~/hooks/api/auth";
import { Doodle } from "~/components/chrome";

export default function ForgotPasswordPage() {
  const { forgotPasswordAsync, isPending, isSuccess, error } = useForgotPassword();
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await forgotPasswordAsync({ email });
  };

  if (isSuccess) {
    return (
      <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We&apos;ve sent a password reset link to{" "}
            <span className="text-foreground font-medium">{email}</span>
          </p>
          <Link
            href="/signin"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold px-6 hover:bg-primary/90 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-foreground mb-2">
          Reset password
          <span className="relative inline-block ml-1">
            .
            <Doodle
              name="underline-wave"
              className="absolute -bottom-1 left-0 w-full h-2"
            />
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-muted-foreground ml-1 mb-2 uppercase tracking-widest"
          >
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full h-12 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-primary disabled:active:scale-100"
        >
          {isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-8">
        <Link href="/signin" className="text-foreground font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
