"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Layers } from "lucide-react";
import { useGetTemplates, useDeleteTemplate, useCreateFormFromTemplate } from "~/hooks/api/form-template";
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

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [titleOverride, setTitleOverride] = useState("");
    const [open, setOpen] = useState(false);

    const handleCreateForm = async () => {
        if (!selectedId) return;
        const result = await createForm.mutateAsync({
            templateId: selectedId,
            title: titleOverride || undefined,
        });
        setOpen(false);
        router.push(`/dashboard/forms/${result.id}`);
    };

    if (isLoading) return <div className="p-8">Loading templates...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold">Form Templates</h1>
                    <p className="text-sm text-muted-foreground">
                        Start from a pre-built template to save time
                    </p>
                </div>
            </div>

            {!templates?.length ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                    <Layers className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No templates yet.</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Save a form as a template from the form builder to reuse it later
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors cursor-pointer group"
                            onClick={() => {
                                setSelectedId(t.id);
                                setTitleOverride(t.title);
                                setOpen(true);
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="rounded-lg bg-primary/10 p-2.5">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTemplate.mutate({ id: t.id });
                                    }}
                                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <h3 className="font-medium text-sm mb-1">{t.title}</h3>
                            {t.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{t.description}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                                {t.fieldsCount} field{t.fieldsCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create form from template</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Give your form a title or keep the template name.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Form title</label>
                        <Input value={titleOverride} onChange={(e) => setTitleOverride(e.target.value)} placeholder="My form" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateForm} disabled={!titleOverride}>
                            Create form
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
