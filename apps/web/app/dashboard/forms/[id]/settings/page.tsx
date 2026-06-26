"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "~/lib/toast";
import { Loader2, Save, Trash2, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
// import { Separator } from "~/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  useGetFormWithFields,
  useUpdateForm,
  useDeleteForm,
  useExportForm,
} from "~/hooks/api/form";

const settingsSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(300).optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers, and hyphens"),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
  notifyEmail: z.boolean(),
  notifyEmailTo: z.string().email("Invalid email").optional().or(z.literal("")),
  thankYouUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function FormSettingsPage() {
  const { id: formId } = useParams<{ id: string }>();
  const router = useRouter();
  const { form, isLoading } = useGetFormWithFields(formId, "DRAFT");
  const { updateFormAsync, isPending: updating } = useUpdateForm();
  const { deleteFormAsync, isPending: deleting } = useDeleteForm();
  const { exportFormAsync, isPending: exporting } = useExportForm();

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const form_ = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      status: "DRAFT",
      notifyEmail: false,
      notifyEmailTo: "",
      thankYouUrl: "",
    },
  });

  useEffect(() => {
    if (form) {
      form_.reset({
        title: form.title ?? "",
        description: form.description ?? "",
        slug: form.slug ?? "",
        status: (form.status as "DRAFT" | "PUBLISHED" | "CLOSED") ?? "DRAFT",
        notifyEmail: form.notifyEmail ?? false,
        notifyEmailTo: form.notifyEmailTo ?? "",
        thankYouUrl: form.thankYouUrl ?? "",
      });
    }
  }, [form]);

  const handleSave = async (values: SettingsFormValues) => {
    try {
      await updateFormAsync({
        formId,
        title: values.title,
        description: values.description || undefined,
        slug: values.slug,
        status: values.status,
        notifyEmail: values.notifyEmail,
        notifyEmailTo: values.notifyEmail ? values.notifyEmailTo : undefined,
        thankYouUrl: values.thankYouUrl || undefined,
      });
      toast.success("Settings saved.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save settings.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFormAsync({ formId });
      toast.success("Form deleted.");
      router.push("/dashboard/forms");
    } catch {
      toast.error("Failed to delete form.");
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportFormAsync({ formId });
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form?.title || "form"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Form exported.");
    } catch {
      toast.error("Failed to export form.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Form not found.
      </div>
    );
  }

  const watchedNotifyEmail = form_.watch("notifyEmail");

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-10">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your form&apos;s general settings and notifications.
        </p>
      </div>

      <form onSubmit={form_.handleSubmit(handleSave)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">General</CardTitle>
            <CardDescription>
              Basic information about your form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Form"
                {...form_.register("title")}
              />
              {form_.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form_.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="A short description of your form"
                {...form_.register("description")}
              />
              {form_.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form_.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-0">
                <span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
                  /f/
                </span>
                <Input
                  id="slug"
                  className="rounded-l-none"
                  placeholder="my-form"
                  {...form_.register("slug")}
                />
              </div>
              {form_.formState.errors.slug && (
                <p className="text-sm text-destructive">
                  {form_.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form_.watch("status")}
                onValueChange={(v) =>
                  form_.setValue("status", v as "DRAFT" | "PUBLISHED" | "CLOSED")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Notifications</CardTitle>
            <CardDescription>
              Receive an email alert every time someone submits this form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified on new submissions
                </p>
              </div>
              <Switch
                checked={watchedNotifyEmail}
                onCheckedChange={(v) => form_.setValue("notifyEmail", v)}
              />
            </div>

            {watchedNotifyEmail && (
              <div className="space-y-2">
                <Label htmlFor="notifyEmailTo">Notification email</Label>
                <Input
                  id="notifyEmailTo"
                  type="email"
                  placeholder="you@example.com"
                  {...form_.register("notifyEmailTo", {
                    required: watchedNotifyEmail ? "Email is required" : false,
                  })}
                />
                {form_.formState.errors.notifyEmailTo && (
                  <p className="text-sm text-destructive">
                    {form_.formState.errors.notifyEmailTo.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Thank You Page</CardTitle>
            <CardDescription>
              Redirect respondents to a custom URL after submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="thankYouUrl">Redirect URL (optional)</Label>
              <Input
                id="thankYouUrl"
                placeholder="https://example.com/thank-you"
                {...form_.register("thankYouUrl")}
              />
              {form_.formState.errors.thankYouUrl && (
                <p className="text-sm text-destructive">
                  {form_.formState.errors.thankYouUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Export</CardTitle>
            <CardDescription>
              Download your form definition as a JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export as JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="font-display text-lg text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions. Please be certain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete this form
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{form.title}</strong> and
                    all of its submissions. This action cannot be undone.
                    <br /><br />
                    Type <strong>delete</strong> to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                  <Input
                    placeholder='Type "delete" to confirm'
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteConfirmation !== "delete" || deleting}
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-10">
          <Button type="submit" disabled={updating || !form_.formState.isDirty}>
            {updating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
