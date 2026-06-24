"use client";

import { useListForms } from "~/hooks/api/form";
import { FileText, Layers } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
    const { forms, isLoading } = useListForms();
    const published = forms?.filter((f: any) => f.status === "PUBLISHED").length ?? 0;
    const drafts = forms?.filter((f: any) => f.status === "DRAFT").length ?? 0;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-8">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-2xl font-bold">{isLoading ? "..." : forms?.length ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Total forms</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-2xl font-bold">{isLoading ? "..." : published}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-2xl font-bold">{isLoading ? "..." : drafts}</p>
                    <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/forms"
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:bg-accent transition-colors flex-1"
                >
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-medium">Forms</p>
                        <p className="text-xs text-muted-foreground">Manage your forms</p>
                    </div>
                </Link>
                <Link
                    href="/dashboard/templates"
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:bg-accent transition-colors flex-1"
                >
                    <Layers className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-medium">Templates</p>
                        <p className="text-xs text-muted-foreground">Start from a template</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
