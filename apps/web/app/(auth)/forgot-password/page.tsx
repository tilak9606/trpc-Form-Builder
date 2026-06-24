"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

import { useForgotPassword } from "~/hooks/api/auth";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ForgotPasswordPage() {
  const { forgotPasswordAsync, isPending, isSuccess, error } = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await forgotPasswordAsync({ email });
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
          <h1 className="text-xl font-semibold mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
          </p>
          <Link
            href="/signin"
            className="text-sm text-primary hover:underline"
          >
            Back to sign in
          </Link>
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

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Reset password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <button
            type="submit"
            disabled={isPending || isSuccess}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send reset link"}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/signin" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}