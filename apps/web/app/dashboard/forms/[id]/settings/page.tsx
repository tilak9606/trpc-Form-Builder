"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "~/lib/toast";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
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
import { Badge } from "~/components/ui/badge";
import { FormPreviewRenderer } from "~/components/form-builder/form-preview-renderer";
import { EditorialCard } from "~/components/chrome";
import { trpc } from "~/trpc/client";
import { useFormEditorStore } from "~/lib/stores/form-editor-store";
import { useFormContext } from "../layout";

const settingsSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  visibility: z.enum(["public", "unlisted", "private"]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  settings: z
    .object({
      successMessage: z.string().max(500).optional(),
      redirectUrl: z.string().url().optional().nullable(),
      showProgressBar: z.boolean().optional(),
      allowMultipleSubmissions: z.boolean().optional(),
      showFieldIcons: z.boolean().optional(),
      customTheme: z.any().optional(),
    })
    .optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function FormSettingsPage() {
  const { id: formId } = useParams<{ id: string }>();
  const router = useRouter();
  const { form, isLoading, refetch } = useFormContext();
  const store = useFormEditorStore();

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "valid" | "invalid" | "reserved">("idle");

  const utils = trpc.useUtils();

  const methods = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      visibility: "public",
      metaTitle: "",
      metaDescription: "",
      coverImageUrl: null,
      settings: {
        successMessage: "",
        redirectUrl: null,
        showProgressBar: true,
        allowMultipleSubmissions: false,
        showFieldIcons: false,
        customTheme: null,
      },
    },
  });

  useEffect(() => {
    if (!form) return;
    const formData = form as any;

    methods.reset({
      title: formData.title ?? "",
      description: formData.description ?? "",
      slug: formData.slug ?? "",
      visibility: formData.visibility ?? "public",
      metaTitle: formData.metaTitle ?? "",
      metaDescription: formData.metaDescription ?? "",
      coverImageUrl: formData.coverImageUrl ?? null,
      settings: {
        successMessage: formData.settings?.successMessage ?? "",
        redirectUrl: formData.settings?.redirectUrl ?? null,
        showProgressBar: formData.settings?.showProgressBar ?? true,
        allowMultipleSubmissions: formData.settings?.allowMultipleSubmissions ?? false,
        showFieldIcons: formData.settings?.showFieldIcons ?? false,
        customTheme: formData.settings?.customTheme ?? null,
      },
    });

    setSlugValue(formData.slug ?? "");

    if (store.formId !== formId) {
      store.setFormData({
        formId,
        title: formData.title ?? "",
        description: formData.description ?? "",
        fields: (formData.fields ?? []).map((f: any) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder ?? undefined,
          helpText: f.helpText ?? undefined,
          required: f.required ?? false,
          pageNumber: f.pageNumber,
          options: f.options ?? undefined,
          validations: f.validations ?? undefined,
          settings: f.settings ?? undefined,
        })),
        themeId: formData.themeId,
        coverImageUrl: formData.coverImageUrl,
        customTheme: formData.settings?.customTheme,
        showFieldIcons: formData.settings?.showFieldIcons ?? false,
      });
    } else {
      const serverTitle = formData.title ?? "";
      const serverDesc = formData.description ?? "";
      if (store.title !== serverTitle) store.setTitle(serverTitle);
      if (store.description !== serverDesc) store.setDescription(serverDesc);
    }
  }, [form, formId, refetch, store]);

  const updateMutation = trpc.form.updateForm.useMutation({
    onSuccess: () => {
      utils.form.getByIdWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
      toast.success("Settings saved.");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to save settings.");
    },
  });

  const deleteMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      utils.form.listForms.invalidate();
      toast.success("Form deleted.");
      router.push("/dashboard/forms");
    },
    onError: () => toast.error("Failed to delete form."),
  });

  const validateSlug = (value: string) => {
    if (!value) {
      setSlugStatus("idle");
      return;
    }
    const reserved = [
      "api",
      "auth",
      "admin",
      "login",
      "register",
      "dashboard",
      "settings",
      "forms",
      "workspace",
      "templates",
      "pricing",
      "about",
      "contact",
      "privacy",
      "terms",
    ];
    if (reserved.includes(value)) {
      setSlugStatus("reserved");
      return;
    }
    if (!/^[a-z0-9-]{3,50}$/.test(value)) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("valid");
  };

  useEffect(() => {
    if (form) {
      setSlugValue((form as any).slug ?? "");
    }
  }, [form]);

  const handleSave: SubmitHandler<SettingsFormValues> = async (values) => {
    updateMutation.mutate({
      formId,
      title: values.title,
      description: values.description || undefined,
      slug: values.slug,
      visibility: values.visibility,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      settings: values.settings,
    });
    store.setTitle(values.title);
    store.setDescription(values.description || "");
    methods.reset(values);
  };

  const handleDelete = () => {
    deleteMutation.mutate({ formId });
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

  const watchedShowFieldIcons = methods.watch("settings.showFieldIcons");
  const watchedShowProgressBar = methods.watch("settings.showProgressBar");
  const watchedAllowMultiple = methods.watch("settings.allowMultipleSubmissions");
  const formTitle = (form as any)?.title ?? "";

  const RESERVED_SLUGS = [
    "api",
    "auth",
    "admin",
    "login",
    "register",
    "dashboard",
    "settings",
    "forms",
    "workspace",
    "templates",
    "pricing",
    "about",
    "contact",
    "privacy",
    "terms",
  ];

  const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

  return (
    <div className="flex flex-1 min-h-0 h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={methods.handleSubmit(handleSave)} className="max-w-3xl mx-auto space-y-6">
          <div className="sticky top-0 z-30 flex justify-end py-2 bg-background/95 backdrop-blur">
            <Button
              type="submit"
              disabled={!methods.formState.isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {methods.formState.isDirty ? "Save changes" : "No changes"}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your form&apos;s general settings and notifications.
              </p>
            </div>
            <Badge variant={form.status === "draft" ? "draft" : form.status === "published" ? "published" : "outline"}>
              {form.status}
            </Badge>
          </div>

          <EditorialCard className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Form"
                {...methods.register("title")}
              />
              {methods.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="A short description of your form"
                {...methods.register("description")}
              />
              {methods.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.description.message}
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
                  value={slugValue}
                  onChange={(e) => {
                    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setSlugValue(cleaned);
                    methods.setValue("slug", cleaned, { shouldDirty: true, shouldValidate: true });
                    validateSlug(cleaned);
                  }}
                />
              </div>
              {slugStatus === "invalid" && (
                <p className="text-sm text-destructive">Invalid slug format</p>
              )}
              {slugStatus === "reserved" && (
                <p className="text-sm text-destructive">This slug is reserved</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={methods.watch("visibility")}
                onValueChange={(v) => methods.setValue("visibility", v as "public" | "unlisted" | "private")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </EditorialCard>

          <EditorialCard className="space-y-5">
            <h3 className="font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Email notifications are managed in the dedicated{" "}
              <a href={`/dashboard/forms/${formId}/email-settings`} className="underline hover:text-foreground">
                Email Settings
              </a>{" "}
              page.
            </p>
          </EditorialCard>

          <EditorialCard className="space-y-5">
            <h3 className="font-medium">Behavior</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Show progress bar</Label>
                <Switch
                  checked={watchedShowProgressBar}
                  onCheckedChange={(v) => methods.setValue("settings.showProgressBar", v, { shouldDirty: true })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow multiple submissions</Label>
                <Switch
                  checked={watchedAllowMultiple}
                  onCheckedChange={(v) => methods.setValue("settings.allowMultipleSubmissions", v, { shouldDirty: true })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show field icons</Label>
                <Switch
                  checked={watchedShowFieldIcons}
                  onCheckedChange={(v) => methods.setValue("settings.showFieldIcons", v, { shouldDirty: true })}
                />
              </div>
            </div>
          </EditorialCard>

          <EditorialCard>
            <div className="space-y-2">
              <Label htmlFor="thankYouUrl">Redirect URL (optional)</Label>
              <Input
                id="thankYouUrl"
                placeholder="https://example.com/thank-you"
                {...methods.register("settings.redirectUrl")}
              />
              {methods.formState.errors?.settings && (methods.formState.errors as any).redirectUrl && (
                <p className="text-sm text-destructive">
                  {((methods.formState.errors as any).redirectUrl as any)?.message}
                </p>
              )}
            </div>
          </EditorialCard>

          <EditorialCard className="border-destructive/30">
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
                    This will permanently delete <strong>{formTitle}</strong> and
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
                    disabled={deleteConfirmation !== "delete" || deleteMutation.isPending}
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </EditorialCard>
        </form>
      </div>

      <div className="w-96 hidden lg:block sticky top-0 h-svh overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          <FormPreviewRenderer
            fields={(form as any).fields ?? []}
            formTitle={methods.watch("title") || (form.title ?? "")}
            formDescription={methods.watch("description") || ((form as any).description ?? undefined)}
            coverImageUrl={(form as any).coverImageUrl ?? undefined}
            themeConfig={(form as any)?.settings?.customTheme ?? undefined}
            className="rounded-2xl border"
          />
        </div>
      </div>
    </div>
  );
}
