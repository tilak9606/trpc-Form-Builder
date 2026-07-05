"use client";

import { useMemo, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Trash2, Eye } from "lucide-react";
import {
  useGetSubmissionsByFormId,
  useGetSubmissionById,
  useExportSubmissions,
  useDeleteSubmission,
} from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";
import { EmptyState } from "~/components/ui/empty-state";
import { ResponseDetailDrawer } from "~/components/form-builder/response-detail-drawer";
import { Button } from "~/components/ui/button";

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function maskIp(ip?: string | null) {
  if (!ip) return "-";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.xxx.xxx`;
  return ip;
}

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

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { submissions, isLoading: subsLoading, error } = useGetSubmissionsByFormId(formId ?? "", page, limit);
  const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");
  const { exportSubmissions, isExporting } = useExportSubmissions(formId ?? "");
  const { deleteSubmissionAsync, isPending: deletePending } = useDeleteSubmission(formId ?? "");

  const { submission: detail, isLoading: detailLoading } = useGetSubmissionById(
    selectedId ?? "",
    formId ?? ""
  );

  const rows = useMemo(() => ((submissions as any)?.submissions ?? []) as Submission[], [submissions]);
  const totalCount = (submissions as any)?.total ?? rows.length ?? 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const startIdx = ((page - 1) * limit) + 1;
  const endIdx = Math.min(page * limit, totalCount);

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

  const handleDelete = useCallback(
    async (submissionId: string) => {
      if (!confirm("Delete this submission? This cannot be undone.")) return;
      await deleteSubmissionAsync({ submissionId, formId: formId ?? "" });
      if (selectedId === submissionId) setSelectedId(null);
    },
    [deleteSubmissionAsync, formId, selectedId]
  );

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

  const selectedSubmission =
    selectedId && rows.find((r) => r.id === selectedId)
      ? rows.find((r) => r.id === selectedId)
      : selectedId && detail
        ? (detail as any)
        : null;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Total: {totalCount}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || rows.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {rows.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No responses yet"
            description="Share your form to start collecting responses."
          />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Submitted
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-hover/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {formatDate(r.createdAt ?? "")}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {r.respondentEmail || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {maskIp(r.respondentIp)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedId(r.id)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletePending}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Showing {startIdx}–{endIdx} of {totalCount}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          <ResponseDetailDrawer
            submissionId={selectedId}
            onClose={() => setSelectedId(null)}
            submission={selectedSubmission}
            fields={sortedFields}
            onDelete={() => selectedId && handleDelete(selectedId)}
            isDeleting={deletePending}
          />
        </>
      )}
    </div>
  );
}