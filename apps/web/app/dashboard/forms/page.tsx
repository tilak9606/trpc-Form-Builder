"use client";

import { Suspense, useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Eye, PencilLine, Calendar, MoreHorizontal, FileText, Layers, Upload, Folder, FolderOpen } from "lucide-react";

import { useCreateForm, useListForms, useImportForm } from "~/hooks/api/form";
import { useListFolders } from "~/hooks/api/folder";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const statusConfig = {
    DRAFT: { label: "Draft", dot: "bg-yellow-500" },
    PUBLISHED: { label: "Published", dot: "bg-green-500" },
    CLOSED: { label: "Closed", dot: "bg-red-500" },
} as const;

function DashboardFormsContent() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [importOpen, setImportOpen] = useState(false);
    const [importData, setImportData] = useState<any>(null);
    const [importError, setImportError] = useState("");
    const searchParams = useSearchParams();
    const activeFolder = searchParams.get("folder") || undefined;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { createFormAsync, error, status } = useCreateForm();
    const { importFormAsync, isPending: importPending } = useImportForm();
    const { folders } = useListFolders();
    const { forms, isLoading } = useListForms(activeFolder);

    const activeFolderName = activeFolder ? folders?.find(f => f.id === activeFolder)?.name : null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await createFormAsync({
            title: title.trim(),
            description: description.trim() ? description.trim() : undefined,
            folderId: activeFolder ?? null,
        });

        setOpen(false);
        setTitle("");
        setDescription("");
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        {activeFolderName ? (
                            <>
                                <FolderOpen className="h-5 w-5 text-primary" />
                                {activeFolderName}
                            </>
                        ) : "Your Forms"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {activeFolderName ? `Forms in "${activeFolderName}"` : "Manage and track your forms"}
                    </p>
                </div>

                <Link
                    href="/dashboard/templates"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                    <Layers className="h-4 w-4" />
                    Templates
                </Link>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            try {
                                const json = JSON.parse(ev.target?.result as string);
                                setImportData(json);
                                setImportError("");
                                setImportOpen(true);
                            } catch {
                                setImportError("Invalid JSON file");
                            }
                        };
                        reader.readAsText(file);
                        e.target.value = "";
                    }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                    <Upload className="h-4 w-4" />
                    Import
                </button>

                <Dialog open={importOpen} onOpenChange={setImportOpen}>
                    <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Import form</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {importData ? `"${importData.title || "Untitled"}" will be imported with ${importData.fields?.length || 0} fields.` : ""}
                            </DialogDescription>
                        </DialogHeader>
                        {importError ? <p className="text-sm text-destructive">{importError}</p> : null}
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => { setImportOpen(false); setImportData(null); }}
                                className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!importData) return;
                                    const result = await importFormAsync({ data: importData });
                                    if (result?.id) {
                                        setImportOpen(false);
                                        setImportData(null);
                                        window.location.href = `/dashboard/forms/${result.id}`;
                                    }
                                }}
                                disabled={importPending || !importData}
                                className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {importPending ? "Importing..." : "Import"}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            Create Form
                        </button>
                    </DialogTrigger>
                    <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create new form</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Add a title and optional description.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">
                                    Title
                                </label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="Form title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>

                            {error ? (
                                <p className="text-sm text-destructive">{error.message}</p>
                            ) : null}

                            <DialogFooter>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={status === "pending" || title.trim().length === 0}
                                    className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {status === "pending" ? "Creating..." : "Create"}
                                </button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />
                    ))}
                </div>
            ) : forms && forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forms.map((form) => {
                        const sc = statusConfig[form.status as keyof typeof statusConfig] ?? statusConfig.DRAFT;
                        return (
                            <div
                                key={form.id}
                                className="group rounded-2xl border border-border bg-card p-5 hover:border-border/80 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                            {sc.label}
                                        </span>
                                    </div>
                                    <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{form.title}</h3>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                                    {form.description || "No description"}
                                </p>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                                    <Calendar className="h-3 w-3" />
                                    {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "Recently"}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/forms/${form.id}`}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                                    >
                                        <PencilLine className="h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                    <Link
                                        href={`/form/${form.slug}`}
                                        target="_blank"
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl border border-border bg-card flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No forms yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        Create your first form to start collecting responses
                    </p>
                    <button
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Create your first form
                    </button>
                </div>
            )}
        </div>
    );
}

export default function DashboardForms() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <DashboardFormsContent />
        </Suspense>
    );
}