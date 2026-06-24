"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { useGetFormWithFields, useUpdateForm } from "~/hooks/api/form";
import { Input } from "~/components/ui/input";

const fonts = [
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat",
    "Playfair Display", "Merriweather", "Fira Code", "JetBrains Mono",
];

const borderRadii = [
    { value: "0", label: "None" },
    { value: "0.25rem", label: "Small" },
    { value: "0.5rem", label: "Medium" },
    { value: "0.75rem", label: "Large" },
    { value: "1rem", label: "XL" },
    { value: "9999px", label: "Full" },
];

export default function ThemePage() {
    const params = useParams();
    const formId = params?.id as string | undefined;
    const { form } = useGetFormWithFields(formId ?? "");
    const { updateFormAsync, isPending } = useUpdateForm();

    const [primaryColor, setPrimaryColor] = useState("#3b82f6");
    const [bgColor, setBgColor] = useState("#000000");
    const [textColor, setTextColor] = useState("#ffffff");
    const [labelColor, setLabelColor] = useState("#ffffff");
    const [fontFamily, setFontFamily] = useState("Inter");
    const [borderRadius, setBorderRadius] = useState("0.5rem");
    const [buttonText, setButtonText] = useState("Submit");
    const [logoUrl, setLogoUrl] = useState("");

    useEffect(() => {
        if (!form) return;
        setPrimaryColor(form.themePrimaryColor ?? "#3b82f6");
        setBgColor(form.themeBackgroundColor ?? "#000000");
        setTextColor(form.themeTextColor ?? "#ffffff");
        setLabelColor(form.themeLabelColor ?? "#ffffff");
        setFontFamily(form.themeFontFamily ?? "Inter");
        setBorderRadius(form.themeBorderRadius ?? "0.5rem");
        setButtonText(form.themeButtonText ?? "Submit");
        setLogoUrl(form.themeLogoUrl ?? "");
    }, [form]);

    const handleSave = async () => {
        if (!formId) return;
        await updateFormAsync({
            formId,
            themePrimaryColor: primaryColor,
            themeBackgroundColor: bgColor,
            themeTextColor: textColor,
            themeLabelColor: labelColor,
            themeFontFamily: fontFamily,
            themeBorderRadius: borderRadius,
            themeButtonText: buttonText,
            themeLogoUrl: logoUrl || undefined,
        });
    };

    const formUrl = typeof window !== "undefined"
        ? `${window.location.origin}/form/${form?.slug || formId}`
        : `/form/${form?.slug || formId}`;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/dashboard/forms/${formId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold">Form Theme</h1>
                    <p className="text-sm text-muted-foreground">Customize the look of your form</p>
                </div>
                <Link
                    href={formUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                </Link>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Colors</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">Primary</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="h-9 w-9 rounded border border-border cursor-pointer"
                                    />
                                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="text-xs font-mono" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">Background</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="h-9 w-9 rounded border border-border cursor-pointer"
                                    />
                                    <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="text-xs font-mono" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">Text</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="h-9 w-9 rounded border border-border cursor-pointer"
                                    />
                                    <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="text-xs font-mono" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">Labels</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={labelColor}
                                        onChange={(e) => setLabelColor(e.target.value)}
                                        className="h-9 w-9 rounded border border-border cursor-pointer"
                                    />
                                    <Input value={labelColor} onChange={(e) => setLabelColor(e.target.value)} className="text-xs font-mono" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Typography</h2>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Font family</label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                style={{ fontFamily }}
                            >
                                {fonts.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Layout</h2>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Border radius</label>
                            <select
                                value={borderRadius}
                                onChange={(e) => setBorderRadius(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            >
                                {borderRadii.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Submit Button</h2>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Button text</label>
                            <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Submit" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Logo</h2>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Logo URL</label>
                            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                        </div>
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo preview" className="h-12 object-contain rounded border border-border" />
                        )}
                    </div>
                </div>

                <div className="sticky top-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Live Preview</h2>
                    <div
                        className="rounded-2xl border p-6 space-y-4"
                        style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            fontFamily,
                            borderRadius,
                        }}
                    >
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
                        )}
                        <div>
                            <h3 className="text-lg font-semibold">{form?.title || "Form Title"}</h3>
                            {form?.description ? (
                                <p style={{ color: textColor, opacity: 0.6 }} className="text-sm mt-1">{form.description}</p>
                            ) : null}
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-sm" style={{ color: labelColor }}>Sample text field <span style={{ color: textColor, opacity: 0.5 }}>*</span></label>
                                <div
                                    className="px-3 py-2 text-sm border"
                                    style={{
                                        borderRadius,
                                        borderColor: primaryColor,
                                        backgroundColor: "transparent",
                                        color: textColor,
                                    }}
                                >
                                    Enter value...
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm" style={{ color: labelColor }}>Sample select</label>
                                <div
                                    className="px-3 py-2 text-sm border"
                                    style={{
                                        borderRadius,
                                        borderColor: `${textColor}20`,
                                        backgroundColor: "transparent",
                                        color: textColor,
                                    }}
                                >
                                    Select...
                                </div>
                            </div>
                        </div>
                        <div
                            className="px-6 py-2.5 text-sm font-medium inline-block"
                            style={{
                                backgroundColor: primaryColor,
                                color: "#ffffff",
                                borderRadius,
                            }}
                        >
                            {buttonText || "Submit"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
