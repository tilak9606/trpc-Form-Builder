// apps/web/app/form/[id]/submissions/page.tsx

"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetSubmissionsByFormId } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";

type Submission = {
    id: string;
    formId?: string | null;
    values?: { fieldId: string; value: string }[] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export default function FormSubmissions() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { submissions, isLoading: subsLoading, error } = useGetSubmissionsByFormId(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");

    const rows = useMemo(() => (submissions ?? []) as Submission[], [submissions]);

    const loading = subsLoading || fieldsLoading;

    if (loading) return <div className="p-6">Loading submissions…</div>;
    if (error) return <div className="p-6 text-red-400">Error loading submissions</div>;

    return (
        <main className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-5xl bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-slate-900">Submissions</h2>

                <div className="mb-4 text-sm text-slate-600">Total: {rows.length}</div>

                {/* determine ordered fields to render as columns */}
                {fields && fields.length > 0 && (
                    <div className="mb-4 text-xs text-slate-600">
                        Fields: {fields.map((f) => f.label).join(", ")}
                    </div>
                )}

                {rows.length === 0 ? (
                    <div className="rounded-md bg-white p-4 border">No submissions yet.</div>
                ) : (
                    <div className="overflow-auto rounded-md border">
                        <table className="min-w-full table-fixed text-sm">
                            <thead className="bg-slate-900 text-left text-white">
                                <tr>
                                    <th className="px-4 py-2 w-1/6">ID</th>
                                    <th className="px-4 py-2 w-1/6">Submitted</th>
                                    {/** render a column per field in index order */}
                                    {(fields ?? [])
                                        .slice()
                                        .sort((a, b) => parseFloat(a.index) - parseFloat(b.index))
                                        .map((f) => (
                                            <th key={f.id} className="px-4 py-2 text-left text-sm">
                                                {f.label}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="odd:bg-white even:bg-slate-100">
                                        <td className="px-4 py-3 align-top break-all text-xs text-slate-800">
                                            {r.id}
                                        </td>
                                        <td className="px-4 py-3 align-top text-xs text-slate-600">
                                            {r.createdAt
                                                ? new Date(r.createdAt).toLocaleString()
                                                : "-"}
                                        </td>

                                        {(fields ?? [])
                                            .slice()
                                            .sort(
                                                (a, b) => parseFloat(a.index) - parseFloat(b.index),
                                            )
                                            .map((f) => {
                                                const v = r.values?.find((x) => x.fieldId === f.id);
                                                return (
                                                    <td
                                                        key={f.id}
                                                        className="px-4 py-3 align-top text-xs text-slate-700"
                                                    >
                                                        {v ? v.value : "-"}
                                                    </td>
                                                );
                                            })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
