"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Loader2, X, FileIcon, Check } from "lucide-react";

import { trpc } from "~/trpc/client";
import { useCreateSubmission, useTrackEvent } from "~/hooks/api/form-submission";

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

    const { data: form, isLoading } = trpc.form.getBySlug.useQuery(
        { slug: formId ?? "" },
        { enabled: !!formId },
    );
    const { createSubmissionAsync, status } = useCreateSubmission();
    const { trackEventAsync } = useTrackEvent();

    const hasTrackedStart = useRef(false);

    const [values, setValues] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

    const isDark = false;

    // Track "view" event on form load
    useEffect(() => {
        if (form?.id) {
            trackEventAsync({ formId: form.id, eventType: "view" }).catch((err) => console.error("Analytics track failed:", err));
        }
    }, [form?.id, trackEventAsync]);

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
        if (!hasTrackedStart.current && form?.id) {
            hasTrackedStart.current = true;
            trackEventAsync({ formId: form.id, eventType: "start" }).catch((err) => console.error("Analytics start failed:", err));
        }
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

    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form?.id) return;
        setSubmitError(null);

        const emailField = form.fields?.find((f: any) => f.type === "EMAIL");
        const payload = {
            formId: form.id,
            values: Object.entries(values)
                .filter(([fieldId]) => visibleFields.some((f: any) => f.id === fieldId))
                .map(([fieldId, value]) => ({ fieldId, value })),
            ...(emailField && values[emailField.id] ? { respondentEmail: values[emailField.id] } : {}),
        };

        try {
            await createSubmissionAsync(payload);
            if ((form as any)?.settings?.redirectUrl) {
                window.location.href = (form as any).settings.redirectUrl;
            } else {
                setSubmitted(true);
            }
            setValues((s) => Object.fromEntries(Object.keys(s).map((k) => [k, ""])));
        } catch (err: any) {
            setSubmitError(err?.message || "Something went wrong. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
                <Loader2 className="w-6 h-6 animate-spin text-[#6C7CF5]" />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F1117] text-[#F9FAFB]">
                <p className="text-sm opacity-60">Form not found.</p>
            </div>
        );
    }

    if (form.status === "archived") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F1117] text-[#F9FAFB]">
                <p className="text-sm opacity-60">This form is closed.</p>
            </div>
        );
    }

    function adjustColor(hex: string, amount: number): string {
        hex = hex.replace("#", "");
        if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
    }

    const customTheme = (form as any)?.settings?.customTheme;
    const themePrimary = customTheme?.colors?.accent || "#6C7CF5";
    const themeFont = customTheme?.fonts?.body || "Inter";
    const themeRadius = customTheme?.shape?.radius ? `${customTheme.shape.radius}px` : "10px";
    const themeBtnText = (form as any)?.settings?.successMessage || "Submit";
    const themeBtnTextColor = customTheme?.colors?.accentForeground || "#ffffff";

    const themeBg = customTheme?.colors?.background || (isDark ? "#0F1117" : "#F0EDE8");
    const themeText = customTheme?.colors?.foreground || (isDark ? "#F9FAFB" : "#111827");
    const themeLabel = customTheme?.colors?.foregroundSoft || themeText;
    const themeSurface = adjustColor(themeBg, isDark ? 15 : -8);
    const themeBorder = adjustColor(themeBg, isDark ? 30 : -20);
    const themeMuted = adjustColor(themeText, isDark ? -30 : 30);
    const themeSurfaceHover = adjustColor(themeBg, isDark ? 30 : -15);

    return (
        <main
            className="min-h-screen px-6 py-6"
            style={{ backgroundColor: themeBg, color: themeText, fontFamily: themeFont }}
        >
            <div className="mx-auto max-w-2xl">
                {form.coverImageUrl ? (
                    <div className="mb-6 rounded-xl overflow-hidden" style={{ borderRadius: themeRadius }}>
                        <img src={form.coverImageUrl} alt="Form cover" className="w-full h-48 object-cover" />
                    </div>
                ) : null}

                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        {(customTheme?.logoUrl || (form as any)?.settings?.logoUrl) ? (
                            <img src={customTheme?.logoUrl || (form as any)?.settings?.logoUrl} alt="Logo" className="h-10 object-contain mb-4" />
                        ) : null}
                        <h1 className="text-2xl font-semibold mb-1">{form.title}</h1>
                        {form.description ? (
                            <p className="text-sm" style={{ color: themeMuted }}>{form.description}</p>
                        ) : null}
                    </div>
                </div>

                {submitted ? (
                    <div
                        className="mb-6 rounded-xl p-4 flex items-center gap-3"
                        style={{ backgroundColor: `${themePrimary}15`, color: themeText, borderRadius: themeRadius }}
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: themePrimary }}>
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-medium">Thanks — your submission was received.</p>
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {form.fields.map((f: any) => {
                        const visible = evaluateCondition(f.condition, values);
                        return (
                            <div
                                key={f.id}
                                className={`transition-all duration-200 ${visible ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 overflow-hidden pointer-events-none"}`}
                            >
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium" style={{ color: themeLabel }}>
                                        {f.label}
                                        {f.isRequired ? <span className="ml-1" style={{ color: themePrimary }}>*</span> : null}
                                    </label>

                                    {f.type === "TEXT" && (
                                        <input
                                            type="text"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? ""}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "NUMBER" && (
                                        <input
                                            type="number"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? ""}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "EMAIL" && (
                                        <input
                                            type="email"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? ""}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "PASSWORD" && (
                                        <input
                                            type="password"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? ""}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "TEXTAREA" && (
                                        <textarea
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? ""}
                                            rows={4}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "YES_NO" && (
                                        <select
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
                                            style={{ backgroundColor: themeSurface, color: themeText || themeMuted, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
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
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
                                            style={{ backgroundColor: themeSurface, color: themeText || themeMuted, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        >
                                            <option value="">{f.placeholder || "Select..."}</option>
                                            {(f.options || []).map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}

                                    {f.type === "MULTI_SELECT" && (
                                        <div className="space-y-2">
                                            {(f.options || []).map((opt: string) => {
                                                const checked = (values[f.id] ?? "").split(",").includes(opt);
                                                return (
                                                    <label
                                                        key={opt}
                                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                                                        style={{
                                                            backgroundColor: checked ? `${themePrimary}12` : themeSurface,
                                                            border: `1.5px solid ${checked ? themePrimary : themeBorder}`,
                                                            borderRadius: themeRadius,
                                                            color: themeLabel,
                                                        }}
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                                                            style={{
                                                                backgroundColor: checked ? themePrimary : "transparent",
                                                                border: checked ? "none" : `1.5px solid ${themeBorder}`,
                                                            }}
                                                        >
                                                            {checked && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {f.type === "RADIO" && (
                                        <div className="space-y-2">
                                            {(f.options || []).map((opt: string) => {
                                                const checked = (values[f.id] ?? "") === opt;
                                                return (
                                                    <label
                                                        key={opt}
                                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                                                        style={{
                                                            backgroundColor: checked ? `${themePrimary}12` : themeSurface,
                                                            border: `1.5px solid ${checked ? themePrimary : themeBorder}`,
                                                            borderRadius: themeRadius,
                                                            color: themeLabel,
                                                        }}
                                                        onClick={() => handleChange(f.id, opt)}
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors"
                                                            style={{
                                                                border: checked ? `4px solid ${themePrimary}` : `1.5px solid ${themeBorder}`,
                                                            }}
                                                        />
                                                        <span className="text-sm">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {f.type === "CHECKBOX" && (
                                        <div className="space-y-2">
                                            {(f.options || []).map((opt: string) => {
                                                const checked = (values[f.id] ?? "").split(",").includes(opt);
                                                return (
                                                    <label
                                                        key={opt}
                                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                                                        style={{
                                                            backgroundColor: checked ? `${themePrimary}12` : themeSurface,
                                                            border: `1.5px solid ${checked ? themePrimary : themeBorder}`,
                                                            borderRadius: themeRadius,
                                                            color: themeLabel,
                                                        }}
                                                        onClick={() => {
                                                            const current = (values[f.id] ?? "").split(",").filter(Boolean);
                                                            const next = checked
                                                                ? current.filter((v: string) => v !== opt)
                                                                : [...current, opt];
                                                            handleChange(f.id, next.join(","));
                                                        }}
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                                                            style={{
                                                                backgroundColor: checked ? themePrimary : "transparent",
                                                                border: checked ? "none" : `1.5px solid ${themeBorder}`,
                                                            }}
                                                        >
                                                            {checked && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {f.type === "DATE" && (
                                        <input
                                            type="date"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "TIME" && (
                                        <input
                                            type="time"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "RATING" && (
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleChange(f.id, String(star))}
                                                    className="text-2xl transition-colors"
                                                    style={{ color: (parseInt(values[f.id] ?? "0") >= star) ? themePrimary : themeBorder }}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {f.type === "TAGS" && (
                                        <input
                                            type="text"
                                            value={values[f.id] ?? ""}
                                            onChange={(e) => handleChange(f.id, e.target.value)}
                                            placeholder={f.placeholder ?? "Type tags separated by commas"}
                                            className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{ backgroundColor: themeSurface, color: themeText, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                        />
                                    )}

                                    {f.type === "TOGGLE" && (
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={values[f.id] === "true"}
                                                onChange={(e) => handleChange(f.id, e.target.checked ? "true" : "false")}
                                                className="sr-only"
                                            />
                                            <div
                                                className="w-10 h-6 rounded-full transition-colors relative"
                                                style={{
                                                    backgroundColor: values[f.id] === "true" ? themePrimary : themeBorder,
                                                }}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform"
                                                    style={{ transform: values[f.id] === "true" ? "translateX(20px)" : "translateX(4px)" }}
                                                />
                                            </div>
                                            <span className="text-sm" style={{ color: themeLabel }}>{f.placeholder || "Toggle"}</span>
                                        </label>
                                    )}

                                    {f.type === "FILE_UPLOAD" && (
                                        <div className="space-y-2">
                                            {values[f.id] ? (
                                                <div
                                                    className="flex items-center gap-2 p-3"
                                                    style={{ backgroundColor: themeSurface, border: `1.5px solid ${themeBorder}`, borderRadius: themeRadius }}
                                                >
                                                    <FileIcon className="w-4 h-4 shrink-0" style={{ color: themeMuted }} />
                                                    <a
                                                        href={values[f.id] ?? "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm hover:underline truncate flex-1"
                                                        style={{ color: themePrimary }}
                                                    >
                                                        {(values[f.id] ?? "").split("/").pop() || "Uploaded file"}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileUpload(f.id, null)}
                                                        className="transition-colors"
                                                        style={{ color: themeMuted }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
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
                                                        className="w-full px-3 py-2.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:cursor-pointer"
                                                        style={{
                                                            backgroundColor: themeSurface,
                                                            color: themeText,
                                                            border: `1.5px solid ${themeBorder}`,
                                                            borderRadius: themeRadius,
                                                            // @ts-expect-error --file-bg is a CSS custom property
                                                            "--file-bg": themePrimary,
                                                        }}
                                                    />
                                                    {uploadingFields[f.id] && (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center rounded-lg"
                                                            style={{ backgroundColor: `${themeBg}99`, borderRadius: themeRadius }}
                                                        >
                                                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: themePrimary }} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {uploadErrors[f.id] && (
                                                <p className="text-xs" style={{ color: themePrimary }}>{uploadErrors[f.id]}</p>
                                            )}
                                            {f.maxFileSize ? (
                                                <p className="text-xs" style={{ color: themeMuted }}>
                                                    Max size: {(f.maxFileSize / 1024 / 1024).toFixed(1)} MB
                                                </p>
                                            ) : null}
                                        </div>
                                    )}

                                    {f.description ? (
                                        <p className="text-xs" style={{ color: themeMuted }}>{f.description}</p>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {submitError ? (
                        <p className="text-sm" style={{ color: themePrimary }}>{submitError}</p>
                    ) : null}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={status === "pending"}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                            style={{
                                backgroundColor: themePrimary,
                                color: themeBtnTextColor,
                                borderRadius: themeRadius,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                            }}
                        >
                            {status === "pending" && <Loader2 className="w-4 h-4 animate-spin" />}
                            {status === "pending" ? "Submitting..." : themeBtnText}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
