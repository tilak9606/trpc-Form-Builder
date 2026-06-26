"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Inbox, Plus } from "lucide-react";
import { useGetTemplates, useDeleteTemplate, useCreateFormFromTemplate, useCreateTemplate } from "~/hooks/api/form-template";
import { Button } from "~/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

export default function TemplatesPage() {
    const router = useRouter();
    const { templates, isLoading } = useGetTemplates();
    const deleteTemplate = useDeleteTemplate();
    const createForm = useCreateFormFromTemplate();
    const { createTemplateAsync, isPending: creatingTemplate } = useCreateTemplate();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [titleOverride, setTitleOverride] = useState("");
    const [open, setOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [newTemplateTitle, setNewTemplateTitle] = useState("");
    const [newTemplateDesc, setNewTemplateDesc] = useState("");

    const handleCreateForm = async () => {
        if (!selectedId) return;
        const result = await createForm.mutateAsync({
            templateId: selectedId,
            title: titleOverride || undefined,
        });
        setOpen(false);
        router.push(`/dashboard/forms/${result.id}`);
    };

    const handleCreateTemplate = async () => {
        try {
            await createTemplateAsync({
                title: newTemplateTitle.trim(),
                description: newTemplateDesc.trim() || undefined,
                fields: [],
            });
            setCreateOpen(false);
            setNewTemplateTitle("");
            setNewTemplateDesc("");
        } catch {
            // error handled by hook
        }
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-surface-2 rounded" />
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-surface-2 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-text-primary">Form Templates</h1>
                    <p className="text-sm text-text-muted">
                        Start from a pre-built template to save time
                    </p>
                </div>
                <Button onClick={() => { setNewTemplateTitle(""); setNewTemplateDesc(""); setCreateOpen(true); }} className="bg-brand text-brand-text hover:bg-brand-hover">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Template
                </Button>
            </div>

            {!templates?.length ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
                    <Inbox className="w-12 h-12 mx-auto mb-3 text-text-muted" />
                    <p className="text-sm font-medium text-text-secondary">No templates yet</p>
                    <p className="text-xs text-text-muted mt-1">
                        Save a form as a template from the form builder to reuse it later
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-2xl border border-border bg-surface p-5 hover:shadow-shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                            onClick={() => {
                                setSelectedId(t.id);
                                setTitleOverride(t.title);
                                setOpen(true);
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="rounded-xl bg-brand/10 p-2.5">
                                    <FileText className="h-5 w-5 text-brand" />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTemplate.mutate({ id: t.id });
                                    }}
                                    className="rounded-lg border border-border p-1.5 text-text-muted hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <h3 className="font-medium text-sm mb-1 text-text-primary">{t.title}</h3>
                            {t.description && (
                                <p className="text-xs text-text-muted mb-2 line-clamp-2">{t.description}</p>
                            )}
                            <p className="text-[10px] text-text-muted">
                                {t.fieldsCount} field{t.fieldsCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-text-primary">Create form from template</DialogTitle>
                        <DialogDescription className="text-text-muted">
                            Give your form a title or keep the template name.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">Form title</label>
                        <Input value={titleOverride} onChange={(e) => setTitleOverride(e.target.value)} placeholder="My form" className="bg-base border-border text-text-primary" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} className="border-border text-text-secondary hover:bg-hover">Cancel</Button>
                        <Button onClick={handleCreateForm} disabled={!titleOverride} className="bg-brand text-brand-text hover:bg-brand-hover">
                            Create form
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create blank template dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-text-primary">Create Template</DialogTitle>
                        <DialogDescription className="text-text-muted">
                            Create a blank template to reuse later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">Title</label>
                            <Input value={newTemplateTitle} onChange={(e) => setNewTemplateTitle(e.target.value)} placeholder="My Template" className="bg-base border-border text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">Description (optional)</label>
                            <Input value={newTemplateDesc} onChange={(e) => setNewTemplateDesc(e.target.value)} placeholder="A brief description" className="bg-base border-border text-text-primary" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-border text-text-secondary hover:bg-hover">Cancel</Button>
                        <Button onClick={handleCreateTemplate} disabled={!newTemplateTitle.trim() || creatingTemplate} className="bg-brand text-brand-text hover:bg-brand-hover">
                            {creatingTemplate ? "Creating..." : "Create Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
