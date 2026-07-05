"use client";

import { useSession, signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Mail, Shield, LogOut, Moon, Sun, CreditCard, Sparkles, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserPlan } from "~/hooks/api/user";
import { useSubscriptionStatus } from "~/hooks/api/payment";
import { CheckoutButton } from "~/components/checkout-button";

export default function SettingsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);
    const { theme, setTheme } = useTheme();
    const { plan: userPlan } = useUserPlan();
    const { subscription } = useSubscriptionStatus();

    if (isPending) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-secondary rounded" />
                    <div className="h-4 w-64 bg-secondary rounded" />
                </div>
            </div>
        );
    }

    if (!session?.user) {
        router.push("/signin");
        return null;
    }

    const user = session.user;

    const handleSignOut = async () => {
        setSigningOut(true);
        await signOut();
        router.push("/signin");
    };

    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
            </div>

            <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4 text-foreground">Profile</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="h-16 w-16 rounded-full object-cover" />
                                ) : (
                                    user.name?.[0]?.toUpperCase() || "U"
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4 text-foreground">Account</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">Name</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">Email</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">Role</span>
                            </div>
                            <span className="text-sm text-muted-foreground capitalize">user</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4 text-foreground">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm text-foreground">Theme</span>
                        </div>
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-border"
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4 text-foreground">Billing</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <span className="text-sm text-foreground">Current Plan</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {subscription?.status === "active" ? "Your subscription is active" : "No active subscription"}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-foreground capitalize">
                                {userPlan?.plan || "free"}
                            </span>
                        </div>
                        {subscription?.currentPeriodEnd && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-muted-foreground">Renews</span>
                                <span className="text-sm text-foreground">
                                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {(userPlan?.plan === "free" || !userPlan?.plan) && (
                            <div className="pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-3">
                                    Upgrade to unlock unlimited forms, custom themes, webhooks, and more.
                                </p>
                                <CheckoutButton
                                    plan="pro"
                                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Upgrade to Pro — ₹199/month
                                </CheckoutButton>
                            </div>
                        )}
                        {(userPlan?.plan === "pro" || userPlan?.plan === "enterprise") && (
                            <div className="pt-2 border-t border-border">
                                <div className="flex items-center gap-2 text-sm text-success">
                                    <Check className="w-4 h-4" />
                                    <span>You&apos;re on the <span className="font-medium capitalize">{userPlan.plan}</span> plan</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4 text-foreground">Danger Zone</h2>
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                        <LogOut className="h-4 w-4" />
                        {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </div>
        </div>
    );
}
