"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    Plus, ArrowLeft, Type, Hash, Mail, ToggleLeft, Lock, GripVertical,
    Pencil, Trash2, List, Calendar, FileText, TextQuote, ListChecks,
    Eye, Download, BarChart3, Share2, X, Webhook, Save, Bell, Palette, Copy, Folder,
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useGetFormWithFields, useUpdateForm, useExportForm } from "~/hooks/api/form";
import { useCreateField, useUpdateField, useDeleteField, useGetFields, useDuplicateField, useReorderFields } from "~/hooks/api/form-field";
import { usePublishForm } from "~/hooks/api/form";
import { useCreateTemplate } from "~/hooks/api/form-template";
import { useListFolders, useMoveFormToFolder } from "~/hooks/api/folder";

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
import { Checkbox } from "~/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

const fieldTypeConfig: Record<string, { icon: any; label: string; color: string; iconColor: string }> = {
    TEXT: { icon: Type, label: "Text", color: "bg-blue-500/10", iconColor: "text-blue-400" },
    NUMBER: { icon: Hash, label: "Number", color: "bg-emerald-500/10", iconColor: "text-emerald-400" },
    EMAIL: { icon: Mail, label: "Email", color: "bg-purple-500/10", iconColor: "text-purple-400" },
    YES_NO: { icon: ToggleLeft, label: "Yes / No", color: "bg-amber-500/10", iconColor: "text-amber-400" },
    PASSWORD: { icon: Lock, label: "Password", color: "bg-red-500/10", iconColor: "text-red-400" },
    SELECT: { icon: ListChecks, label: "Select", color: "bg-cyan-500/10", iconColor: "text-cyan-400" },
    MULTI_SELECT: { icon: List, label: "Multi Select", color: "bg-pink-500/10", iconColor: "text-pink-400" },
    DATE: { icon: Calendar, label: "Date", color: "bg-orange-500/10", iconColor: "text-orange-400" },
    TEXTAREA: { icon: TextQuote, label: "Textarea", color: "bg-indigo-500/10", iconColor: "text-indigo-400" },
    FILE_UPLOAD: { icon: FileText, label: "File Upload", color: "bg-teal-500/10", iconColor: "text-teal-400" },
};

const statusConfig = {
    DRAFT: { label: "Draft", color: "bg-yellow-500/10 text-yellow-400" },
    PUBLISHED: { label: "Published", color: "bg-green-500/10 text-green-400" },
    CLOSED: { label: "Closed", color: "bg-red-500/10 text-red-400" },
} as const;

const operatorLabels: Record<string, string> = {
    equals: "Equals",
    not_equals: "Not equals",
    contains: "Contains",
};

function SortableField({ f, config, Icon, fieldPreceding, onEdit, onDuplicate, onDelete }: {
    f: any;
    config: { icon: any; label: string; color: string; iconColor: string };
    Icon: any;
    fieldPreceding: any[];
    onEdit: (field: any) => void;
    onDuplicate: () => void;
    onDelete: (fieldId: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-border/80 transition-colors"
        >
            <div
                {...attributes}
                {...listeners}
                className="text-muted-foreground group-hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <div className={`h-10 w-10 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{f.label}</span>
                    {f.isRequired && (
                        <span className="text-[10px] font-medium text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                            Required
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                    {f.description || f.placeholder || config.label}
                </p>
                {f.condition && (
                    <p className="text-xs text-amber-400/80 mt-0.5">
                        Shows when &ldquo;
                        {fieldPreceding.find((pf: any) => pf.id === f.condition.fieldId)?.label || "Unknown"}&rdquo;{' '}
                        {operatorLabels[f.condition.operator] || f.condition.operator} &ldquo;{f.condition.value}&rdquo;
                    </p>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(f)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={onDuplicate}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <Copy className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(f.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {config.label}
            </div>
        </div>
    );
}

export default function FormBuilder() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState(false);
    const [notifyEmailTo, setNotifyEmailTo] = useState("");
    const [editFieldId, setEditFieldId] = useState<string | null>(null);
    const [label, setLabel] = useState("");
    const [type, setType] = useState<string>("TEXT");
    const [description, setDescription] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [optionsText, setOptionsText] = useState("");

    const [conditionEnabled, setConditionEnabled] = useState(false);
    const [conditionFieldId, setConditionFieldId] = useState("");
    const [conditionOperator, setConditionOperator] = useState<"equals" | "not_equals" | "contains">("equals");
    const [conditionValue, setConditionValue] = useState("");
    const [conditionTargetPage, setConditionTargetPage] = useState<number>(1);

    const [maxFileSize, setMaxFileSize] = useState<number>(5);
    const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);

    const [folderOpen, setFolderOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingPage, setEditingPage] = useState(1);

    const { form, isLoading: formLoading } = useGetFormWithFields(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");
    const { createFieldAsync, status: createStatus, error: createError } = useCreateField(formId ?? "");
    const { updateFieldAsync, status: updateStatus, error: updateError } = useUpdateField(formId ?? "");
    const { deleteFieldAsync } = useDeleteField(formId ?? "");
    const { duplicateFieldAsync } = useDuplicateField(formId ?? "");
    const { reorderFieldsAsync } = useReorderFields(formId ?? "");
    const { publishFormAsync } = usePublishForm();
    const { updateFormAsync } = useUpdateForm();
    const { createTemplateAsync } = useCreateTemplate();
    const { exportFormAsync } = useExportForm();
    const { folders } = useListFolders();
    const { moveFormToFolderAsync } = useMoveFormToFolder();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = currentPageFields.findIndex((f: any) => f.id === active.id);
        const newIndex = currentPageFields.findIndex((f: any) => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(currentPageFields, oldIndex, newIndex);
        const orderedIds = reordered.map((f: any) => f.id);
        await reorderFieldsAsync({ formId: formId ?? "", fieldIds: orderedIds });
    };

    useEffect(() => {
        if (form) {
            setNotifyEmail(form.notifyEmail ?? false);
            setNotifyEmailTo(form.notifyEmailTo ?? "");
        }
    }, [form]);

    const statusInfo = statusConfig[(form?.status ?? "DRAFT") as keyof typeof statusConfig];
    const visibleFields = fields ?? form?.fields ?? [];
    const totalPages = visibleFields.length > 0 ? Math.max(...visibleFields.map((f: any) => f.page ?? 1)) : 1;
    const currentPageFields = visibleFields.filter((f: any) => (f.page ?? 1) === currentPage);

    const precedingFields = (fields ?? form?.fields ?? []).filter(
        (f: any) => editFieldId ? Number(f.index) < Number(visibleFields.find((vf: any) => vf.id === editFieldId)?.index ?? 999) : true
    );

    const triggerField = conditionFieldId
        ? (fields ?? form?.fields ?? []).find((f: any) => f.id === conditionFieldId)
        : null;

    const resetAddForm = () => {
        setLabel("");
        setType("TEXT");
        setDescription("");
        setPlaceholder("");
        setIsRequired(false);
        setOptionsText("");
        setConditionEnabled(false);
        setConditionFieldId("");
        setConditionOperator("equals");
        setConditionValue("");
        setConditionTargetPage(1);
        setMaxFileSize(5);
        setAllowedFileTypes([]);
        setEditingPage(currentPage);
    };

    const buildCondition = () => {
        if (!conditionEnabled || !conditionFieldId || !conditionValue) return null;
        const cond: any = { fieldId: conditionFieldId, operator: conditionOperator, value: conditionValue };
        if (conditionTargetPage > 1) cond.targetPage = conditionTargetPage;
        return cond;
    };

    const handleAddSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formId) return;

        await createFieldAsync({
            label: label.trim(),
            type: type as any,
            formId,
            page: editingPage,
            description: description.trim() || undefined,
            placeholder: placeholder.trim() || undefined,
            isRequired,
            options: type === "SELECT" || type === "MULTI_SELECT"
                ? optionsText.split("\n").map((s) => s.trim()).filter(Boolean)
                : undefined,
            condition: buildCondition(),
            maxFileSize: type === "FILE_UPLOAD" ? maxFileSize * 1024 * 1024 : undefined,
            allowedFileTypes: type === "FILE_UPLOAD" ? allowedFileTypes : undefined,
        });

        setAddOpen(false);
        resetAddForm();
    };

    const openEditDialog = (field: any) => {
        setEditFieldId(field.id);
        setLabel(field.label);
        setType(field.type);
        setDescription(field.description || "");
        setPlaceholder(field.placeholder || "");
        setIsRequired(field.isRequired);
        setOptionsText(Array.isArray(field.options) ? field.options.join("\n") : "");
        if (field.condition) {
            setConditionEnabled(true);
            setConditionFieldId(field.condition.fieldId);
            setConditionOperator(field.condition.operator);
            setConditionValue(field.condition.value);
            setConditionTargetPage(field.condition.targetPage ?? 1);
        } else {
            setConditionEnabled(false);
            setConditionFieldId("");
            setConditionOperator("equals");
            setConditionValue("");
            setConditionTargetPage(1);
        }
        setMaxFileSize(field.maxFileSize ? Math.round(field.maxFileSize / 1024 / 1024) : 5);
        setAllowedFileTypes(field.allowedFileTypes ?? []);
        setEditingPage(field.page ?? 1);
        setEditOpen(true);
    };

    const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editFieldId) return;

        const payload: any = {
            id: editFieldId,
            label: label.trim(),
            type: type as any,
            description: description.trim() || undefined,
            placeholder: placeholder.trim() || undefined,
            isRequired,
            options: type === "SELECT" || type === "MULTI_SELECT"
                ? optionsText.split("\n").map((s) => s.trim()).filter(Boolean)
                : undefined,
            page: editingPage,
        };

        payload.condition = conditionEnabled ? buildCondition() : null;
        payload.maxFileSize = type === "FILE_UPLOAD" ? maxFileSize * 1024 * 1024 : undefined;
        payload.allowedFileTypes = type === "FILE_UPLOAD" ? allowedFileTypes : undefined;

        await updateFieldAsync(payload);

        setEditOpen(false);
        setEditFieldId(null);
        resetAddForm();
    };

    const handleDelete = async (fieldId: string) => {
        if (!formId || !confirm("Delete this field?")) return;
        await deleteFieldAsync({ id: fieldId, formId });
    };

    const handlePublish = async () => {
        if (!formId) return;
        const newStatus = form?.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED";
        await publishFormAsync({ formId, status: newStatus as any });
    };

    const [copied, setCopied] = useState(false);
    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formUrl = typeof window !== "undefined"
        ? `${window.location.origin}/form/${form?.slug || formId}`
        : `/form/${form?.slug || formId}`;
    const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`;

    return (
        <div className="p-8">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/forms"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{form?.title || "Form Builder"}</h1>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Add and manage form fields</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShareOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </button>
                    <Link
                        href={`/form/${formId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                    </Link>
                    <Link
                        href={`/dashboard/forms/${formId}/analytics`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <BarChart3 className="h-3.5 w-3.5" />
                        Analytics
                    </Link>
                    <Link
                        href={`/dashboard/forms/${formId}/submissions`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Submissions
                    </Link>
                    <Link
                        href={`/dashboard/forms/${formId}/webhooks`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Webhook className="h-3.5 w-3.5" />
                        Webhooks
                    </Link>
                    <Link
                        href={`/dashboard/forms/${formId}/theme`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Palette className="h-3.5 w-3.5" />
                        Theme
                    </Link>
                    <button
                        onClick={() => {
                            setNotifyEmail(form?.notifyEmail ?? false);
                            setNotifyEmailTo(form?.notifyEmailTo ?? "");
                            setSettingsOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Bell className="h-3.5 w-3.5" />
                        Notifications
                    </button>
                    <button
                        onClick={async () => {
                            if (!form || !form.fields) return;
                            const fieldsData = form.fields.map((f: any) => ({
                                label: f.label,
                                type: f.type,
                                description: f.description || undefined,
                                placeholder: f.placeholder || undefined,
                                isRequired: f.isRequired,
                                options: f.options?.length ? f.options : undefined,
                                validation: f.validation || undefined,
                            }));
                            await createTemplateAsync({
                                title: form.title,
                                description: form.description || undefined,
                                fields: fieldsData,
                            });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save as Template
                    </button>
                    <button
                        onClick={async () => {
                            if (!formId) return;
                            const result = await exportFormAsync({ formId });
                            const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${form?.slug || "form"}-export.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export JSON
                    </button>
                    <button
                        onClick={() => setFolderOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                        <Folder className="h-3.5 w-3.5" />
                        {form?.folderId ? "Move" : "Folder"}
                    </button>
                    <button
                        onClick={handlePublish}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        {form?.status === "PUBLISHED" ? "Close" : "Publish"}
                    </button>
                </div>
            </div>

            {/* Move to Folder Dialog */}
            <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
                <DialogContent className="border-border bg-card text-card-foreground sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Move to folder</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Organize your form in a folder
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1 py-2">
                        <button
                            onClick={async () => {
                                if (!formId) return;
                                await moveFormToFolderAsync({ formId, folderId: null });
                                setFolderOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                !form?.folderId ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                        >
                            <Folder className="h-4 w-4" />
                            No folder
                        </button>
                        {folders?.map((f) => (
                            <button
                                key={f.id}
                                onClick={async () => {
                                    if (!formId) return;
                                    await moveFormToFolderAsync({ formId, folderId: f.id });
                                    setFolderOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                    form?.folderId === f.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                            >
                                <Folder className="h-4 w-4" />
                                {f.name}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share form</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Share your form with respondents
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 mt-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Direct link</label>
                            <div className="flex gap-2">
                                <Input value={formUrl} readOnly className="flex-1 text-xs" />
                                <button
                                    onClick={() => handleCopy(formUrl)}
                                    className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Embed code</label>
                            <div className="flex gap-2">
                                <Textarea value={embedCode} readOnly rows={3} className="flex-1 text-xs font-mono" />
                                <button
                                    onClick={() => handleCopy(embedCode)}
                                    className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors self-start"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">QR Code</label>
                            <div className="flex items-center justify-center rounded-lg border border-border bg-background p-4">
                                <img src={qrUrl} alt="QR Code" className="h-40 w-40" />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Notifications Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Email Notifications</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Receive an email when someone submits this form.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.checked)}
                                className="h-4 w-4 rounded border-border"
                            />
                            <span className="text-sm">Enable email notifications</span>
                        </label>
                        {notifyEmail && (
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Send notifications to
                                </label>
                                <Input
                                    type="email"
                                    value={notifyEmailTo}
                                    onChange={(e) => setNotifyEmailTo(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(false)}
                            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                if (!formId) return;
                                await updateFormAsync({
                                    formId,
                                    notifyEmail,
                                    notifyEmailTo: notifyEmailTo || undefined,
                                });
                                setSettingsOpen(false);
                            }}
                            className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Save
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {totalPages > 1 && (
                        <Tabs value={`page-${currentPage}`} onValueChange={(v) => setCurrentPage(Number(v.split("-")[1]))} className="w-full">
                            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${totalPages}, 1fr)` }}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <TabsTrigger key={pageNum} value={`page-${pageNum}`} className="text-xs">
                                        Page {pageNum}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    )}

                    {fieldsLoading ? (
                        <div className="rounded-2xl border border-border bg-card p-6 animate-pulse h-20" />
                    ) : currentPageFields.length > 0 ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={currentPageFields.map((f: any) => f.id)} strategy={verticalListSortingStrategy}>
                                {currentPageFields.map((f: any) => {
                                    const config = fieldTypeConfig[f.type]!;
                                    const Icon = config.icon;
                                    const fieldPreceding = (fields ?? form?.fields ?? []).filter(
                                        (pf: any) => pf.id !== f.id && Number(pf.index) < Number(f.index)
                                    );
                                    return (
                                        <SortableField
                                            key={f.id}
                                            f={f}
                                            config={config}
                                            Icon={Icon}
                                            fieldPreceding={fieldPreceding}
                                            onEdit={openEditDialog}
                                            onDuplicate={() => duplicateFieldAsync({ id: f.id, formId: formId ?? "" })}
                                            onDelete={handleDelete}
                                        />
                                    );
                                })}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="rounded-2xl border border-border bg-card p-8 text-center">
                            <p className="text-sm text-muted-foreground mb-4">No fields on this page</p>
                            <p className="text-xs text-muted-foreground">Click &quot;Add Field&quot; to add fields to page {currentPage}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetAddForm(); }}>
                        <DialogTrigger asChild>
                            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                <Plus className="h-4 w-4" />
                                Add Field
                            </button>
                        </DialogTrigger>

                        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Add new field</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Configure your form field
                                </DialogDescription>
                            </DialogHeader>

                            <form className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4" onSubmit={handleAddSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Label</label>
                                    <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Full Name" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Placeholder</label>
                                    <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Optional placeholder" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Required</label>
                                    <label className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 cursor-pointer">
                                        <Checkbox checked={isRequired} onCheckedChange={(v) => setIsRequired(Boolean(v))} />
                                        <span className="text-xs text-muted-foreground">Make required</span>
                                    </label>
                                </div>

                                <div className="space-y-2 sm:col-span-3">
                                    <label className="text-sm font-medium">Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(fieldTypeConfig).map(([key, config]) => {
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setType(key)}
                                                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${type === key
                                                        ? "border-primary bg-primary/10 text-foreground"
                                                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2 sm:col-span-3">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional helper text" />
                                </div>

                                {(type === "SELECT" || type === "MULTI_SELECT") && (
                                    <div className="space-y-2 sm:col-span-3">
                                        <label className="text-sm font-medium">Options (one per line)</label>
                                        <Textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="Option 1&#10;Option 2&#10;Option 3" />
                                    </div>
                                )}

                                {type === "FILE_UPLOAD" && (
                                    <div className="sm:col-span-3 rounded-lg border border-border bg-card p-3 space-y-3">
                                        <p className="text-sm font-medium">File Upload Settings</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground">Max file size (MB)</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={maxFileSize}
                                                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground">Allowed file types</label>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { value: "image/*", label: "Images" },
                                                        { value: "application/pdf", label: "PDF" },
                                                        { value: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word" },
                                                        { value: "text/csv", label: "CSV" },
                                                        { value: "application/zip,application/x-rar-compressed", label: "ZIP/RAR" },
                                                    ].map(({ value, label }) => (
                                                        <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={allowedFileTypes.length === 0 || value.split(",").some((v) => allowedFileTypes.includes(v.trim()))}
                                                                onChange={(e) => {
                                                                    const types = value.split(",").map((v) => v.trim());
                                                                    if (e.target.checked) {
                                                                        setAllowedFileTypes((prev) => [...prev, ...types.filter((t) => !prev.includes(t))]);
                                                                    } else {
                                                                        setAllowedFileTypes((prev) => prev.filter((t) => !types.includes(t)));
                                                                    }
                                                                }}
                                                                className="h-3.5 w-3.5 rounded border-border"
                                                            />
                                                            <span className="text-xs text-muted-foreground">{label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {createError ? <p className="text-sm text-destructive sm:col-span-3">{createError.message}</p> : null}

                                <DialogFooter className="sm:col-span-3">
                                    <button type="button" onClick={() => setAddOpen(false)} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                    <button type="submit" disabled={createStatus === "pending" || !label.trim()} className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                                        {createStatus === "pending" ? "Adding..." : "Add Field"}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditFieldId(null); resetAddForm(); } }}>
                        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Edit field</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Update field properties
                                </DialogDescription>
                            </DialogHeader>

                            <form className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4" onSubmit={handleEditSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Label</label>
                                    <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Full Name" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Placeholder</label>
                                    <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Optional placeholder" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Required</label>
                                    <label className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 cursor-pointer">
                                        <Checkbox checked={isRequired} onCheckedChange={(v) => setIsRequired(Boolean(v))} />
                                        <span className="text-xs text-muted-foreground">Make required</span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Page</label>
                                    <select
                                        value={editingPage}
                                        onChange={(e) => setEditingPage(Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    >
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <option key={pageNum} value={pageNum}>Page {pageNum}</option>
                                        ))}
                                        <option value={totalPages + 1}>Page {totalPages + 1} (New)</option>
                                    </select>
                                </div>

                                <div className="space-y-2 sm:col-span-3">
                                    <label className="text-sm font-medium">Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(fieldTypeConfig).map(([key, config]) => {
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setType(key)}
                                                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${type === key
                                                        ? "border-primary bg-primary/10 text-foreground"
                                                        : "border-border bg-card text-muted-foreground hover:border-border/80"
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2 sm:col-span-3">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional helper text" />
                                </div>

                                {(type === "SELECT" || type === "MULTI_SELECT") && (
                                    <div className="space-y-2 sm:col-span-3">
                                        <label className="text-sm font-medium">Options (one per line)</label>
                                        <Textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="Option 1&#10;Option 2&#10;Option 3" />
                                    </div>
                                )}

                                {type === "FILE_UPLOAD" && (
                                    <div className="sm:col-span-3 rounded-lg border border-border bg-card p-3 space-y-3">
                                        <p className="text-sm font-medium">File Upload Settings</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground">Max file size (MB)</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={maxFileSize}
                                                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground">Allowed file types</label>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { value: "image/*", label: "Images" },
                                                        { value: "application/pdf", label: "PDF" },
                                                        { value: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word" },
                                                        { value: "text/csv", label: "CSV" },
                                                        { value: "application/zip,application/x-rar-compressed", label: "ZIP/RAR" },
                                                    ].map(({ value, label }) => (
                                                        <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={allowedFileTypes.length === 0 || value.split(",").some((v) => allowedFileTypes.includes(v.trim()))}
                                                                onChange={(e) => {
                                                                    const types = value.split(",").map((v) => v.trim());
                                                                    if (e.target.checked) {
                                                                        setAllowedFileTypes((prev) => [...prev, ...types.filter((t) => !prev.includes(t))]);
                                                                    } else {
                                                                        setAllowedFileTypes((prev) => prev.filter((t) => !types.includes(t)));
                                                                    }
                                                                }}
                                                                className="h-3.5 w-3.5 rounded border-border"
                                                            />
                                                            <span className="text-xs text-muted-foreground">{label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-lg border border-border bg-card p-3 sm:col-span-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Conditional Logic</span>
                                        {conditionEnabled ? (
                                            <button
                                                type="button"
                                                onClick={() => { setConditionEnabled(false); setConditionFieldId(""); setConditionOperator("equals"); setConditionValue(""); setConditionTargetPage(1); }}
                                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Remove
                                            </button>
                                        ) : null}
                                    </div>
                                    {!conditionEnabled ? (
                                        <button
                                            type="button"
                                            onClick={() => setConditionEnabled(true)}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            + Add condition
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">Show this field only when...</p>
                                            <select
                                                value={conditionFieldId}
                                                onChange={(e) => { setConditionFieldId(e.target.value); setConditionValue(""); }}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Select trigger field</option>
                                                {(fields ?? form?.fields ?? [])
                                                    .filter((pf: any) => pf.id !== editFieldId && Number(pf.index) < Number(
                                                        visibleFields.find((vf: any) => vf.id === editFieldId)?.index ?? 999
                                                    ))
                                                    .map((pf: any) => (
                                                        <option key={pf.id} value={pf.id}>{pf.label}</option>
                                                    ))}
                                            </select>
                                            <select
                                                value={conditionOperator}
                                                onChange={(e) => setConditionOperator(e.target.value as "equals" | "not_equals" | "contains")}
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="equals">Equals</option>
                                                <option value="not_equals">Not equals</option>
                                                <option value="contains">Contains</option>
                                            </select>
                                            <div className="relative">
                                                {triggerField && (triggerField.type === "SELECT" || triggerField.type === "MULTI_SELECT" || triggerField.type === "YES_NO") ? (
                                                    <select
                                                        value={conditionValue}
                                                        onChange={(e) => setConditionValue(e.target.value)}
                                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Select value...</option>
                                                        {triggerField.type === "YES_NO"
                                                            ? ["true", "false"].map((opt) => (
                                                                <option key={opt} value={opt}>{opt === "true" ? "Yes" : "No"}</option>
                                                            ))
                                                            : (triggerField.options || []).map((opt: string) => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))
                                                        }
                                                    </select>
                                                ) : (
                                                    <Input
                                                        value={conditionValue}
                                                        onChange={(e) => setConditionValue(e.target.value)}
                                                        placeholder={triggerField?.type === "NUMBER" ? "Enter a number..." : "Enter a value..."}
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-1.5 pt-2">
                                                <label className="text-xs text-muted-foreground">Skip to page (optional)</label>
                                                <select
                                                    value={conditionTargetPage}
                                                    onChange={(e) => setConditionTargetPage(Number(e.target.value))}
                                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                                >
                                                    <option value={1}>No skip</option>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 2).map((pageNum) => (
                                                        <option key={pageNum} value={pageNum}>Skip to page {pageNum}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {updateError ? <p className="text-sm text-destructive sm:col-span-3">{updateError.message}</p> : null}

                                <DialogFooter className="sm:col-span-3">
                                    <button type="button" onClick={() => { setEditOpen(false); setEditFieldId(null); resetAddForm(); }} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                    <button type="submit" disabled={updateStatus === "pending" || !label.trim()} className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                                        {updateStatus === "pending" ? "Saving..." : "Save"}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h3 className="text-sm font-medium mb-4">Form Stats</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total fields</span>
                                <span className="text-sm font-medium">{visibleFields.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Required fields</span>
                                <span className="text-sm font-medium">
                                    {visibleFields.filter((f: any) => f.isRequired).length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
