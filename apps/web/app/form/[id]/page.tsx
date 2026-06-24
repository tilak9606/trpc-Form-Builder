"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Loader2, X, FileIcon } from "lucide-react";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useCreateSubmission } from "~/hooks/api/form-submission";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { env } from "~/env";

const apiBaseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/trpc$/, "");

function evaluateCondition(condition: any, values: Record<string, string>): boolean {
    if (!condition) return true;
    const triggerValue = values[condition.fieldId] || "";
    switch (condition.operator) {
        case "equals":
            return triggerValue === condition.value;
        case "not_equals":
            return triggerValue !== condition.value;
        case "contains":
            return triggerValue.includes(condition.value);
        default:
            return true;
    }
}

export default function PublicFormPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { form, isLoading } = useGetFormWithFields(formId ?? "");
    const { createSubmissionAsync, status, error } = useCreateSubmission();

    const [values, setValues] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!form?.fields) return;
        const initial: Record<string, string> = {};
        for (const f of form.fields) initial[f.id] = "";
        setValues(initial);
    }, [form?.fields]);

    const visibleFields = useMemo(() => {
        if (!form?.fields) return [];
        return form.fields.filter((f: any) => evaluateCondition(f.condition, values));
    }, [form?.fields, values]);

    const handleChange = (fieldId: string, v: string) => {
        setValues((s) => ({ ...s, [fieldId]: v }));
    };

    const handleFileUpload = async (fieldId: string, file: File | null) => {
        if (!file) {
            setValues((s) => ({ ...s, [fieldId]: "" }));
            return;
        }

        setUploadingFields((s) => ({ ...s, [fieldId]: true }));
        setUploadErrors((s) => ({ ...s, [fieldId]: "" }));

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${apiBaseUrl}/api/upload`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Upload failed" }));
                throw new Error(err.error || "Upload failed");
            }

            const data = await res.json();
            setValues((s) => ({ ...s, [fieldId]: data.url }));
        } catch (err: any) {
            setUploadErrors((s) => ({ ...s, [fieldId]: err.message || "Upload failed" }));
        } finally {
            setUploadingFields((s) => ({ ...s, [fieldId]: false }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form?.id) return;

        const payload = {
            formId: form.id,
            values: Object.entries(values)
                .filter(([fieldId]) => visibleFields.some((f: any) => f.id === fieldId))
                .map(([fieldId, value]) => ({ fieldId, value })),
        };

        await createSubmissionAsync(payload);
        setSubmitted(true);
        setValues((s) => Object.fromEntries(Object.keys(s).map((k) => [k, ""])));
    };

    if (isLoading) return <div className="p-6">Loading form...</div>;
    if (!form) return <div className="p-6">Form not found.</div>;
    if (form.status === "CLOSED") return <div className="p-6">This form is closed.</div>;

    const themeBg = form.themeBackgroundColor || "#000000";
    const themeText = form.themeTextColor || "#ffffff";
    const themeLabel = form.themeLabelColor || "#ffffff";
    const themePrimary = form.themePrimaryColor || "#3b82f6";
    const themeFont = form.themeFontFamily || "Inter";
    const themeRadius = form.themeBorderRadius || "0.5rem";
    const themeBtnText = form.themeButtonText || "Submit";

    return (
        <main
            className="min-h-screen px-6 py-6"
            style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
        >
            <div className="mx-auto max-w-2xl">
                {form.themeLogoUrl ? (
                    <img src={form.themeLogoUrl} alt="Logo" className="h-10 object-contain mb-4" />
                ) : null}
                <h1 className="text-2xl font-semibold mb-2">{form.title}</h1>
                {form.description ? (
                    <p className="mb-6" style={{ color: themeText, opacity: 0.6 }}>{form.description}</p>
                ) : null}

                {submitted ? (
                    <div
                        className="mb-6 rounded-md p-4"
                        style={{ backgroundColor: `${themePrimary}15`, color: themeText }}
                    >
                        Thanks &mdash; your submission was received.
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {form.fields.map((f: any) => {
                        const visible = evaluateCondition(f.condition, values);
                        return (
                            <div
                                key={f.id}
                                className={`transition-all duration-300 ${visible ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden pointer-events-none"}`}
                            >
                                <div className="space-y-1">
                                    <label className="block text-sm" style={{ color: themeLabel }}>
                                        {f.label}
                                        {f.isRequired ? <span className="ml-1" style={{ color: themePrimary }}>*</span> : null}
                                    </label>

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

                                    {f.type === "TEXTAREA" && (
                                        <Textarea
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? ""}
                                        />
                                    )}

                                    {f.type === "YES_NO" && (
                                        <select
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                                                    style={{ color: themeText, borderRadius: themeRadius }}
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                    )}

                                    {f.type === "SELECT" && (
                                        <select
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                                            style={{ color: themeText, borderRadius: themeRadius }}
                                        >
                                            <option value="">{f.placeholder || "Select..."}</option>
                                            {(f.options || []).map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}

                                    {f.type === "MULTI_SELECT" && (
                                        <div className="space-y-2">
                                            {(f.options || []).map((opt: string) => (
                                                <label key={opt} className="flex items-center gap-2 text-sm" style={{ color: themeLabel }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(values[f.id] ?? "").split(",").includes(opt)}
                                                        onChange={(e) => {
                                                            const current = (values[f.id] ?? "").split(",").filter(Boolean);
                                                            const next = e.target.checked
                                                                ? [...current, opt]
                                                                : current.filter((x) => x !== opt);
                                                            handleChange(f.id, next.join(","));
                                                        }}
                                                        className="rounded border-border"
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {f.type === "DATE" && (
                                        <Input
                                            type="date"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                        />
                                    )}

                                    {f.type === "FILE_UPLOAD" && (
                                        <div className="space-y-2">
                                            {values[f.id] ? (
                                                <div className="flex items-center gap-2 rounded-md border border-border bg-white/5 p-3">
                                                    <FileIcon className="h-4 w-4 text-white/60 shrink-0" />
                                                    <a
                                                        href={values[f.id] ?? "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-400 hover:underline truncate flex-1"
                                                    >
                                                        {(values[f.id] ?? "").split("/").pop() || "Uploaded file"}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileUpload(f.id, null)}
                                                        className="text-white/40 hover:text-white transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        disabled={uploadingFields[f.id]}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(f.id, file);
                                                        }}
                                                        accept={
                                                            f.allowedFileTypes?.length
                                                                ? f.allowedFileTypes.join(",")
                                                                : "image/*,.pdf,.doc,.docx,.csv,.zip"
                                                        }
                                                    />
                                                    {uploadingFields[f.id] && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {uploadErrors[f.id] && (
                                                <p className="text-xs" style={{ color: themePrimary }}>{uploadErrors[f.id]}</p>
                                            )}
                                            {f.maxFileSize ? (
                                                <p className="text-xs" style={{ color: themeText, opacity: 0.4 }}>
                                                    Max size: {(f.maxFileSize / 1024 / 1024).toFixed(1)} MB
                                                </p>
                                            ) : null}
                                        </div>
                                    )}

                                    {f.description ? (
                                        <div className="text-sm" style={{ color: themeText, opacity: 0.6 }}>{f.description}</div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {error ? <div className="text-sm" style={{ color: themePrimary }}>{error.message}</div> : null}

                    <div>
                        <Button
                            type="submit"
                            disabled={status === "pending"}
                            style={{ backgroundColor: themePrimary, color: "#ffffff", borderRadius: themeRadius }}
                        >
                            {status === "pending" ? "Submitting..." : themeBtnText}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
