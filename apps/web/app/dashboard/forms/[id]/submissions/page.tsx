"use client";

import { useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useGetSubmissionsByFormId, useExportSubmissions } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";

type Submission = {
    id: string;
    formId?: string | null;
    respondentEmail?: string | null;
    values?: { fieldId: string; value: string }[] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export default function DashboardSubmissionsPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { submissions, isLoading: subsLoading, error } = useGetSubmissionsByFormId(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");
    const { exportSubmissions, isExporting } = useExportSubmissions(formId ?? "");

    const rows = useMemo(() => (submissions ?? []) as Submission[], [submissions]);

    const loading = subsLoading || fieldsLoading;

    const handleExport = useCallback(async () => {
        const result = await exportSubmissions();
        if (!result.data?.csv) return;
        const blob = new Blob([result.data.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submissions-${formId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [exportSubmissions, formId]);

    if (loading) return <div className="p-6">Loading submissions...</div>;
    if (error) return <div className="p-6 text-destructive">Error loading submissions</div>;

    const sortedFields = (fields ?? []).slice().sort((a, b) => parseFloat(a.index) - parseFloat(b.index));

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/dashboard/forms/${formId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold">Submissions</h1>
                    <p className="text-sm text-muted-foreground">
                        Total: {rows.length}
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting || rows.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export CSV"}
                </button>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                    <p className="text-muted-foreground">No submissions yet.</p>
                    <p className="text-xs text-muted-foreground mt-2">Share your form to start collecting responses</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                                    {sortedFields.map((f) => (
                                        <th key={f.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {f.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono break-all">
                                            {r.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {r.respondentEmail || "-"}
                                        </td>
                                        {sortedFields.map((f) => {
                                            const v = r.values?.find((x) => x.fieldId === f.id);
                                            const isFileField = f.type === "FILE_UPLOAD";
                                            return (
                                                <td key={f.id} className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">
                                                    {v && v.value ? (
                                                        isFileField ? (
                                                            <a
                                                                href={v.value}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:underline truncate block"
                                                            >
                                                                {v.value.split("/").pop() || "View file"}
                                                            </a>
                                                        ) : (
                                                            <span className="truncate block">{v.value}</span>
                                                        )
                                                    ) : "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
