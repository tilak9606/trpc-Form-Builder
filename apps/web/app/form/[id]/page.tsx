// apps/web/app/form/[id]/page.tsx

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useCreateSubmission } from "~/hooks/api/form-submission";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function PublicFormPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { form, isLoading } = useGetFormWithFields(formId ?? "");
    const { createSubmissionAsync, status, error } = useCreateSubmission();

    const [values, setValues] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!form?.fields) return;
        const initial: Record<string, string> = {};
        for (const f of form.fields) initial[f.id] = "";
        setValues(initial);
    }, [form?.fields]);

    const handleChange = (fieldId: string, v: string) => {
        setValues((s) => ({ ...s, [fieldId]: v }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formId) return;

        const payload = {
            formId,
            values: Object.entries(values).map(([fieldId, value]) => ({ fieldId, value })),
        };

        await createSubmissionAsync(payload);
        setSubmitted(true);
        // optional: clear values
        setValues((s) => Object.fromEntries(Object.keys(s).map((k) => [k, ""])));
    };

    if (isLoading) return <div className="p-6">Loading form…</div>;
    if (!form) return <div className="p-6">Form not found.</div>;

    return (
        <main className="min-h-screen bg-black text-white px-6 py-6">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-semibold mb-2">{form.title}</h1>
                {form.description ? <p className="text-white/60 mb-6">{form.description}</p> : null}

                {submitted ? (
                    <div className="mb-6 rounded-md bg-white/5 p-4 text-white/80">
                        Thanks — your submission was received.
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {form.fields.map((f) => (
                        <div key={f.id} className="space-y-1">
                            <label className="block text-sm text-white/80">{f.label}</label>
                            {f.type === "TEXT" && (
                                <Input
                                    value={values[f.id] ?? ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                />
                            )}

                            {f.type === "NUMBER" && (
                                <Input
                                    type="number"
                                    value={values[f.id] ?? ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                />
                            )}

                            {f.type === "EMAIL" && (
                                <Input
                                    type="email"
                                    value={values[f.id] ?? ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                />
                            )}

                            {f.type === "PASSWORD" && (
                                <Input
                                    type="password"
                                    value={values[f.id] ?? ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                />
                            )}

                            {f.type === "YES_NO" && (
                                <select
                                    value={values[f.id] ?? ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white"
                                >
                                    <option value="">Select...</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            )}

                            {f.description ? (
                                <div className="text-sm text-white/60">{f.description}</div>
                            ) : null}
                        </div>
                    ))}

                    {error ? <div className="text-sm text-red-400">{error.message}</div> : null}

                    <div>
                        <Button
                            type="submit"
                            disabled={status === "pending"}
                            className="bg-white text-black"
                        >
                            {status === "pending" ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
