// apps/web/app/dashboard/forms/[id]/page.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

import { useCreateField, useGetFields } from "~/hooks/api/form-field";

import { Button } from "~/components/ui/button";
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

export default function FormBuilder() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [type, setType] = useState<"TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD">("TEXT");
    const [description, setDescription] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [isRequired, setIsRequired] = useState(false);

    const { createFieldAsync, status, error } = useCreateField(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formId) return;

        await createFieldAsync({
            label: label.trim(),
            type,
            formId,
            description: description.trim() ? description.trim() : undefined,
            placeholder: placeholder.trim() ? placeholder.trim() : undefined,
            isRequired,
        });

        setOpen(false);
        setLabel("");
        setType("TEXT");
        setDescription("");
        setPlaceholder("");
        setIsRequired(false);
    };

    return (
        <main className="min-h-screen bg-black px-6 py-6 text-white">
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Form Builder</h1>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white text-black">Create Field</Button>
                        </DialogTrigger>

                        <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Field</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Add a field to this form.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="text-sm text-white/70 block mb-1">
                                        Label
                                    </label>
                                    <Input
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        placeholder="Field label"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-white/70 block mb-1">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) =>
                                            setType(
                                                e.target.value as
                                                    | "TEXT"
                                                    | "NUMBER"
                                                    | "EMAIL"
                                                    | "YES_NO"
                                                    | "PASSWORD",
                                            )
                                        }
                                        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white"
                                    >
                                        <option value="TEXT">Text</option>
                                        <option value="NUMBER">Number</option>
                                        <option value="EMAIL">Email</option>
                                        <option value="YES_NO">Yes / No</option>
                                        <option value="PASSWORD">Password</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-white/70 block mb-1">
                                        Description
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional helper text"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-white/70 block mb-1">
                                        Placeholder
                                    </label>
                                    <Input
                                        value={placeholder}
                                        onChange={(e) => setPlaceholder(e.target.value)}
                                        placeholder="Optional placeholder"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={isRequired}
                                        onCheckedChange={(v) => setIsRequired(Boolean(v))}
                                    />
                                    <span className="text-sm text-white/70">Required</span>
                                </div>

                                {error ? (
                                    <p className="text-sm text-red-400">{error.message}</p>
                                ) : null}

                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={status === "pending" || !label.trim()}
                                        className="bg-white text-black"
                                    >
                                        {status === "pending" ? "Creating..." : "Create Field"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <section className="grid gap-3">
                    <div className="border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                        Form canvas
                    </div>

                    {fieldsLoading ? (
                        <div className="border border-white/10 bg-white/5 p-4 text-sm text-white/50">
                            Loading fields...
                        </div>
                    ) : fields && fields.length > 0 ? (
                        fields.map((f) => (
                            <div
                                key={f.id}
                                className="border border-white/10 bg-white/5 p-4 flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-white font-medium">{f.label}</div>
                                    <div className="text-white/60 text-sm">
                                        {f.description || f.placeholder || ""}
                                    </div>
                                </div>

                                <div className="text-sm text-white/60">{f.type}</div>
                            </div>
                        ))
                    ) : (
                        <div className="border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                            No fields yet.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
