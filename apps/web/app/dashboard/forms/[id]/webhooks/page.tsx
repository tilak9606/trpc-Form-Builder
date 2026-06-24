"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Webhook } from "lucide-react";
import { useGetWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook } from "~/hooks/api/webhook";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function WebhooksPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { webhooks, isLoading } = useGetWebhooks(formId ?? "");
    const createWebhook = useCreateWebhook();
    const updateWebhook = useUpdateWebhook();
    const deleteWebhook = useDeleteWebhook();

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<{ id: string; name: string; url: string } | null>(null);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");

    const handleOpen = (hook?: any) => {
        if (hook) {
            setEditing({ id: hook.id, name: hook.name, url: hook.url });
            setName(hook.name);
            setUrl(hook.url);
        } else {
            setEditing(null);
            setName("");
            setUrl("");
        }
        setOpen(true);
    };

    const handleSave = async () => {
        if (!formId) return;
        if (editing) {
            await updateWebhook.mutateAsync({ id: editing.id, formId, name, url });
        } else {
            await createWebhook.mutateAsync({ formId, name, url });
        }
        setOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!formId) return;
        await deleteWebhook.mutateAsync({ id, formId });
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/dashboard/forms/${formId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold">Webhooks</h1>
                    <p className="text-sm text-muted-foreground">
                        Send form submission data to external URLs
                    </p>
                </div>
                <button
                    onClick={() => handleOpen()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Webhook
                </button>
            </div>

            {isLoading ? (
                <div className="p-6">Loading...</div>
            ) : !webhooks?.length ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                    <Webhook className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No webhooks configured.</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Add a webhook to receive submission data via POST requests
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {webhooks.map((hook) => (
                        <div key={hook.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{hook.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{hook.url}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    {hook.enabled ? "Active" : "Disabled"} &middot; Event: submission.created
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleOpen(hook)}
                                    className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(hook.id)}
                                    className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit webhook" : "Add webhook"}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Webhooks POST submission data to your URL when a new submission is received.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My webhook" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL</label>
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhook" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!name || !url}>
                            {editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
