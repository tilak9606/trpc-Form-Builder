"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useListForms, useCreateForm, usePublishForm, useUnpublishForm, useDeleteForm } from "~/hooks/api/form";
import { useSession } from "~/lib/auth-client";
import { trpc } from "~/trpc/client";
import { useUserPlan } from "~/hooks/api/user";
import { PLAN_LIMITS } from "@repo/database/constants/user-plan";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Plus, MoreVertical, X } from "lucide-react";
import {
  TintCard,
  NumberTicker,
  Doodle,
  EditorialCard,
  StatusBadge,
  EmptyState,
} from "~/components/chrome";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { toast } from "~/lib/toast";

type FormStatus = "all" | "draft" | "published" | "archived";

export default function DashboardPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<FormStatus>("all");
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const { data: session } = useSession();
  const { plan: userPlan, isLoading: planLoading } = useUserPlan();
  const userPlanType = (userPlan?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const planLimits = PLAN_LIMITS[userPlanType];
  const isApproachingLimit =
    !planLoading &&
    userPlan != null &&
    planLimits.formLimit > 0 &&
    userPlan.formCount >= planLimits.formLimit * 0.8;
  const { forms: listForms, isLoading, weeklySubmissions } = useListForms();
  const forms = listForms ?? [];
  const { createFormAsync, status: createStatus } = useCreateForm();
  const { publishFormAsync } = usePublishForm();
  const { unpublishFormAsync } = useUnpublishForm();
  const { deleteFormAsync } = useDeleteForm();

  const analyticsQueries = trpc.useQueries((t) =>
    forms.map((f) => t.formSubmission.getAnalytics({ formId: f.id })),
  );

  const analyticsMap = React.useMemo(() => {
    const map = new Map<string, any>();
    analyticsQueries.forEach((query, i) => {
      const formId = forms[i]?.id;
      if (query.data && formId) map.set(formId, query.data);
    });
    return map;
  }, [analyticsQueries, forms]);

  const filteredForms = statusFilter === "all"
    ? forms
    : forms.filter((f: any) => f.status?.toLowerCase() === statusFilter);

  const totalForms = forms.length;
  const totalResponses = forms.reduce((sum, f: any) => sum + (f.submissionCount ?? 0), 0);
  const totalStarts = forms.reduce((sum, f: any) => sum + (f.totalStarts ?? 0), 0);
  const avgCompletion = totalStarts > 0 ? Math.min(100, Math.round((totalResponses / totalStarts) * 100)) : 0;

  const handleCreateForm = async () => {
    try {
      const result = await createFormAsync({ title: "Untitled Form" });
      if (result?.id) router.push(`/dashboard/forms/${result.id}`);
    } catch {
      toast.error("Failed to create form.");
    }
  };

  const handlePublish = async (formId: string, currentStatus: string) => {
    try {
      if (currentStatus?.toUpperCase() === "PUBLISHED") {
        await unpublishFormAsync({ formId });
        toast.success("Form unpublished.");
      } else {
        await publishFormAsync({ formId });
        toast.success("Form published!");
      }
    } catch {
      toast.error("Failed to update form status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFormAsync({ formId: deleteTarget.id });
      toast.success("Form deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete form.");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-lg text-foreground">
            Your forms,
            <br />
            in{" "}
            <span className="text-tint-blush-ink relative inline-block">
              one
              <Doodle
                name="underline-wave"
                className="absolute left-0 -bottom-1 w-full h-2"
              />
            </span>{" "}
            place.
          </h1>
        </div>
        <Button
          variant="forest"
          onClick={handleCreateForm}
          disabled={createStatus === "pending"}
        >
          {createStatus === "pending" ? "Creating..." : "Create form"}
          {createStatus !== "pending" && <Plus className="size-4 ml-2" />}
        </Button>
      </div>

      {isApproachingLimit && !dismissed && (
        <Alert
          variant="default"
          className="bg-warning/10 border-warning/30 text-foreground dark:bg-warning/10 dark:border-warning/30 [&>svg]:text-warning"
        >
          <AlertTitle className="text-foreground">Plan limit warning</AlertTitle>
          <AlertDescription className="text-muted-foreground flex items-center justify-between gap-4">
            <span>
              You&apos;re approaching your plan limit ({userPlan.formCount}/{planLimits.formLimit} forms). Upgrade for unlimited forms.
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setDismissed(true)}
            >
              <X className="size-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-display text-foreground mb-1 flex items-center">
            <NumberTicker value={totalForms} />
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Forms</div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-display text-foreground mb-1">
            <NumberTicker value={totalResponses} />
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total responses</div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-display text-foreground mb-1">
            <NumberTicker value={avgCompletion} suffix="%" />
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Avg completion</div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="text-3xl md:text-4xl font-display text-foreground mb-1">
            <NumberTicker value={weeklySubmissions ?? 0} />
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">This week</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as FormStatus)}
          className="gap-2"
        >
          {(["all", "draft", "published", "archived"] as const).map((s) => (
            <ToggleGroupItem
              key={s}
              value={s}
              className="rounded-full border border-border bg-card hover:bg-secondary text-foreground font-medium h-9 px-4 data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && filteredForms.length === 0 && (
        <EmptyState
          headline="Nothing here yet."
          description="Create your first form to start collecting."
          action={
            <Button
              variant="forest"
              onClick={handleCreateForm}
              disabled={createStatus === "pending"}
            >
              {createStatus === "pending" ? "Creating..." : "Create form"}
              {createStatus !== "pending" && <Plus className="size-4 ml-2" />}
            </Button>
          }
        />
      )}

      {!isLoading && filteredForms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form: any) => (
            <div key={form.id} className="block h-full group">
              <EditorialCard interactive className="h-full flex flex-col relative overflow-hidden">
                <Link href={`/dashboard/forms/${form.id}`} className="absolute inset-0 z-0" />

                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/${form.id}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/${form.id}/analytics`)}>
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublish(form.id, form.status)}>
                        {form.status?.toUpperCase() === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10"
                        onClick={() => setDeleteTarget({ id: form.id, title: form.title })}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {form.coverImageUrl ? (
                  <div className="h-32 -mx-6 -mt-6 mb-4 shrink-0 relative z-0 pointer-events-none overflow-hidden">
                    <img src={form.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="h-32 -mx-6 -mt-6 mb-4 shrink-0 relative z-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, var(--tint-mint), var(--tint-peach))`,
                    }}
                  />
                )}

                <div className="flex items-center gap-2 flex-wrap relative z-0 pointer-events-none px-1">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {form.title}
                  </h3>
                  <StatusBadge status={form.status?.toLowerCase() ?? "draft"} />
                </div>

                {form.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1 relative z-0 pointer-events-none px-1">
                    {form.description}
                  </p>
                )}

                <div className="mt-auto pt-4 text-mono-sm text-muted-foreground relative z-0 pointer-events-none px-1">
                  {analyticsMap.get(form.id)?.totalSubmissions ?? form.submissionCount ?? 0} submissions
                </div>
              </EditorialCard>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All responses and analytics for this form will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}