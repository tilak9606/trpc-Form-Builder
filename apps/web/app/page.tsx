"use client";

import { useSession, signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, FormInput, BarChart3, Share2, Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FormForge</span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <button
                onClick={() => router.push("/dashboard/forms")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/signin")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="px-6 pt-20 pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Server: {session?.user ? "connected" : "connecting..."}
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Build forms that work
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create beautiful, responsive forms in minutes. Collect responses, analyze data, and share with the world.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push(session?.user ? "/dashboard/forms" : "/signup")}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {session?.user ? "Go to dashboard" : "Get started"}
              <ArrowRight className="h-4 w-4" />
            </button>
            {!session?.user && (
              <button
                onClick={() => router.push("/signin")}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: FormInput,
              title: "Easy Builder",
              desc: "Drag and drop fields to create forms in seconds.",
            },
            {
              icon: BarChart3,
              title: "Real-time Analytics",
              desc: "Track responses and gain insights instantly.",
            },
            {
              icon: Share2,
              title: "One-click Share",
              desc: "Share your forms anywhere with a single link.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 hover:border-border/80 transition-colors"
            >
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}