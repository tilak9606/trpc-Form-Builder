"use client";

import { useSession, signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Mail, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    if (isPending) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-4 w-64 bg-muted rounded" />
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
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
            </div>

            <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4">Profile</h2>
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
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4">Account</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Name</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Email</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Role</span>
                            </div>
                            <span className="text-sm text-muted-foreground capitalize">user</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-sm font-medium mb-4">Danger Zone</h2>
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                        <LogOut className="h-4 w-4" />
                        {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </div>
        </div>
    );
}
