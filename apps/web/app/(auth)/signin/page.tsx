"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "~/lib/auth-client";
import { Doodle } from "~/components/chrome";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [socialPending, setSocialPending] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const res = await signIn.email({ email, password });

    setIsPending(false);

    if (res.error) {
      setError(res.error.message || "Invalid credentials");
    } else {
      router.push("/dashboard/forms");
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setError(null);
    setSocialPending(provider);
    const res = await signIn.social({ provider, callbackURL: `${window.location.origin}/dashboard/forms` });
    if (res?.error) {
      setError(res.error.message || `Failed to sign in with ${provider}`);
      setSocialPending(null);
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-10 mx-auto shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-foreground mb-2">
          Welcome back
          <span className="relative inline-block ml-1">
            .
            <Doodle
              name="underline-wave"
              className="absolute -bottom-1 left-0 w-full h-2"
            />
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to continue to FormForge</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          type="button"
          disabled={socialPending !== null}
          onClick={() => handleSocialSignIn("google")}
          className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 active:scale-[0.98]"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          disabled={socialPending !== null}
          onClick={() => handleSocialSignIn("github")}
          className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 active:scale-[0.98]"
        >
          <GithubIcon />
          GitHub
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground uppercase tracking-widest font-medium">
            or email
          </span>
        </div>
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

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-muted-foreground ml-1 mb-2 uppercase tracking-widest"
          >
            Password <span className="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 px-4 rounded-xl text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            required
          />
        </div>

        <div className="flex justify-end mt-2">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 mt-4 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-primary disabled:active:scale-100"
        >
          {isPending ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
