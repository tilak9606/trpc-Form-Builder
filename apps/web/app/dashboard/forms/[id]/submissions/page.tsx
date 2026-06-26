"use client";

import { useMemo, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Trash2, X } from "lucide-react";
import { useGetSubmissionsByFormId, useGetSubmissionById, useExportSubmissions, useDeleteSubmission } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";
import { EmptyState } from "~/components/ui/empty-state";

type Submission = {
    id: string;
    formId?: string | null;
    respondentEmail?: string | null;
    respondentIp?: string | null;
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
    const { deleteSubmissionAsync, isPending: deletePending } = useDeleteSubmission(formId ?? "");

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { submission: detail, isLoading: detailLoading } = useGetSubmissionById(selectedId ?? "", formId ?? "");

    const rows = useMemo(() => ((submissions as any)?.submissions ?? []) as Submission[], [submissions]);

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

    const handleDelete = useCallback(async (submissionId: string) => {
        if (!confirm("Delete this submission? This cannot be undone.")) return;
        await deleteSubmissionAsync({ submissionId, formId: formId ?? "" });
        if (selectedId === submissionId) setSelectedId(null);
    }, [deleteSubmissionAsync, formId, selectedId]);

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-secondary rounded" />
                    <div className="h-4 w-64 bg-secondary rounded" />
                    <div className="h-64 bg-secondary rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                    <p className="text-sm text-destructive">Error loading submissions</p>
                </div>
            </div>
        );
    }

    const sortedFields = (fields ?? []).slice().sort((a, b) => parseFloat(a.index) - parseFloat(b.index));

    const selectedSubmission = selectedId ? rows.find((r) => r.id === selectedId) ?? (detail as any) ?? null : null;

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-foreground">Submissions</h1>
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

            <div className="flex gap-6">
                <div className={selectedId ? "flex-1 min-w-0" : "w-full"}>
                    {rows.length === 0 ? (
                        <EmptyState
                            icon="inbox"
                            title="No submissions yet"
                            description="Share your form to start collecting responses"
                        />
                    ) : (
                        <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="overflow-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-secondary/50">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                                            {sortedFields.map((f) => (
                                                <th key={f.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    {f.label}
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((r) => (
                                            <tr
                                                key={r.id}
                                                onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                                                className={`hover:bg-accent/50 transition-colors cursor-pointer ${r.id === selectedId ? "bg-accent/50" : ""}`}
                                            >
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
                                                                        className="text-primary hover:underline truncate block"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {v.value.split("/").pop() || "View file"}
                                                                    </a>
                                                                ) : (
                                                                    <span className="truncate block">{v.value}</span>
                                                                )
                                                            ) : <span className="text-muted-foreground">-</span>}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                                        disabled={deletePending}
                                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                                        title="Delete submission"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail panel */}
                {selectedId && (
                    <div className="w-96 shrink-0">
                        <div className="rounded-2xl border border-border bg-card p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-foreground">Submission Details</h3>
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {detailLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : selectedSubmission ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ID</p>
                                        <p className="text-xs font-mono text-foreground break-all">{selectedSubmission.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Submitted</p>
                                        <p className="text-xs text-foreground">
                                            {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : "-"}
                                        </p>
                                    </div>
                                    {selectedSubmission.respondentEmail && (
                                        <div>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                                            <p className="text-xs text-foreground">{selectedSubmission.respondentEmail}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.respondentIp && (
                                        <div>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">IP Address</p>
                                            <p className="text-xs text-foreground">{selectedSubmission.respondentIp}</p>
                                        </div>
                                    )}
                                    <div className="border-t border-border pt-3">
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Responses</p>
                                        <div className="space-y-3">
                                            {sortedFields.map((f) => {
                                                const v = selectedSubmission.values?.find((x: any) => x.fieldId === f.id);
                                                const isFileField = f.type === "FILE_UPLOAD";
                                                return (
                                                    <div key={f.id}>
                                                        <p className="text-[10px] font-medium text-muted-foreground">{f.label}</p>
                                                        {v && v.value ? (
                                                            isFileField ? (
                                                                <a
                                                                    href={v.value}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline break-all"
                                                                >
                                                                    {v.value.split("/").pop() || "View file"}
                                                                </a>
                                                            ) : (
                                                                <p className="text-xs text-foreground break-words">{v.value}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No response</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No data available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
