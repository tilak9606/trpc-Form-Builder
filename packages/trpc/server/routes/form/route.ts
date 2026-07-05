import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { formService, formFieldService } from "@repo/services";

import {
    createFormInputModel,
    createFormOutputModel,
    listFormsInputModel,
    listFormsOutputModel,
    getFormInputModel,
    getFormBasicOutputModel,
    getFormOutputModel,
    getFormBySlugInputModel,
    getFormBySlugOutputModel,
    updateFormInputModel,
    updateFormOutputModel,
    deleteFormInputModel,
    deleteFormOutputModel,
    publishFormInputModel,
    publishFormOutputModel,
    unpublishFormInputModel,
    unpublishFormOutputModel,
    archiveFormInputModel,
    archiveFormOutputModel,
    duplicateFormInputModel,
    duplicateFormOutputModel,
    exportFormInputModel,
    exportFormOutputModel,
    importFormInputModel,
    importFormOutputModel,
} from "./model";

const TAGS = ["Form"];

// NOTE: every procedure below follows the `<verb><Entity>` convention used by every other
// router in this codebase (createWebhook, createTemplate, createField, ...). The previous
// version used bare verbs (create/update/delete/list/publish/unpublish) which collided with
// the frontend's already-renamed calls (createForm/updateForm/...) and made every form CRUD
// action in the dashboard call a procedure that didn't exist. See Bug #1 in the audit report.
export const formRouter = router({
    createForm: protectedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/forms",
                tags: TAGS,
                summary: "Create a new form",
                description: "Creates a new form in draft state. Automatically generates a unique URL slug from the title. Enforces per-plan form limits. The form must be published before it can accept responses.",
                protect: true,
            },
        })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.create(ctx.user.id, {
                title: input.title,
                description: input.description,
                folderId: input.folderId ?? undefined,
            });
            return { id: form!.id, slug: form!.slug };
        }),

    updateForm: protectedProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: "/forms/{formId}",
                tags: TAGS,
                summary: "Update a form",
                description: "Updates form metadata (title, description, slug, theme). Custom slugs are validated for format (lowercase, alphanumeric, hyphens) and uniqueness. Invalidates public cache on slug change.",
                protect: true,
            },
        })
        .input(updateFormInputModel)
        .output(updateFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const { formId, ...data } = input;
            await formService.update(ctx.user.id, formId, data);
            return { id: formId };
        }),

    deleteForm: protectedProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: "/forms/{formId}",
                tags: TAGS,
                summary: "Delete a form (soft)",
                description: "Soft-deletes a form by setting `deletedAt`. The form becomes inaccessible publicly and via API but data is retained for potential recovery.",
                protect: true,
            },
        })
        .input(deleteFormInputModel)
        .output(deleteFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            await formService.delete(ctx.user.id, input.formId);
            return { id: input.formId };
        }),

    publishForm: protectedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/forms/{formId}/publish",
                tags: TAGS,
                summary: "Publish a form",
                description: "Transitions a form from draft to published state, making it accessible to respondents via its public slug URL. Sets `publishedAt` timestamp on first publish.",
                protect: true,
            },
        })
        .input(publishFormInputModel)
        .output(publishFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.publish(ctx.user.id, input.formId);
            return { id: form!.id, status: form!.status, slug: form!.slug };
        }),

    unpublishForm: protectedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/forms/{formId}/unpublish",
                tags: TAGS,
                summary: "Unpublish a form",
                description: "Reverts a published form back to draft state. The form immediately stops accepting new responses. Existing responses are preserved. Invalidates public cache.",
                protect: true,
            },
        })
        .input(unpublishFormInputModel)
        .output(unpublishFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.unpublish(ctx.user.id, input.formId);
            return { id: form!.id, status: form!.status };
        }),

    archiveForm: protectedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/forms/{formId}/archive",
                tags: TAGS,
                summary: "Archive a form",
                description: "Moves a form to archived state. Archived forms are closed for submissions but remain visible in the creator's dashboard for historical reference. Invalidates public cache.",
                protect: true,
            },
        })
        .input(archiveFormInputModel)
        .output(archiveFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.archive(ctx.user.id, input.formId);
            return { id: form!.id, status: form!.status };
        }),

    // `clone` (the old bare-verb alias) has been removed — it was 100% identical to
    // duplicateForm below and was dead OpenAPI surface nobody called. duplicateForm is the
    // only name kept, matching the frontend and the naming convention.
    duplicateForm: protectedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/forms/{formId}/duplicate",
                tags: TAGS,
                summary: "Duplicate a form",
                description: "Creates a deep copy of a form including all fields, options, and settings. The clone is created in draft state with a new slug (appends ' Copy'). Does not copy responses or analytics data.",
                protect: true,
            },
        })
        .input(duplicateFormInputModel)
        .output(duplicateFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.clone(ctx.user.id, input.formId);
            return { id: form!.id, slug: form!.slug };
        }),

    listForms: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/forms",
                tags: TAGS,
                summary: "List user's forms",
                description: "Returns all non-deleted forms owned by the authenticated user, ordered by creation date (newest first). Includes real submission/view counters aggregated from form_submissions and form_analytics_events.",
                protect: true,
            },
        })
        .input(listFormsInputModel)
        .output(listFormsOutputModel)
        .query(async ({ ctx, input }) => {
            const { forms, weeklySubmissions } = await formService.list(ctx.user.id, input?.folderId ?? undefined);
            return {
                forms: forms.map((f: any) => ({
                    id: f.id,
                    title: f.title,
                    description: f.description ?? undefined,
                    slug: f.slug,
                    status: f.status,
                    visibility: f.visibility,
                    folderId: f.folderId,
                    createdAt: f.createdAt,
                    updatedAt: f.updatedAt,
                    // These now come from a real SQL aggregation in formService.list(),
                    // not a stubbed `?? 0` fallback against columns that don't exist. See Bug #4.
                    coverImageUrl: f.coverImageUrl ?? undefined,
                    submissionCount: f.submissionCount,
                    totalViews: f.totalViews,
                    totalStarts: f.totalStarts,
                    totalSubmissions: f.submissionCount,
                })),
                weeklySubmissions,
            };
        }),

    getById: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/forms/{formId}",
                tags: TAGS,
                summary: "Get form by ID",
                description: "Returns full form details including all settings, counters, and metadata. Verifies ownership — returns 403 if the form belongs to another user. Returns 404 if the form is soft-deleted.",
                protect: true,
            },
        })
        .input(getFormInputModel)
        .output(getFormBasicOutputModel)
        .query(async ({ ctx, input }) => {
            const form = await formService.getById(input.formId, ctx.user.id);
            return {
                id: form.id,
                title: form.title,
                description: form.description,
                slug: form.slug,
                status: form.status,
                visibility: form.visibility,
                folderId: form.folderId,
                coverImageUrl: form.coverImageUrl ?? undefined,
                metaTitle: form.metaTitle ?? undefined,
                metaDescription: form.metaDescription ?? undefined,
                themeId: form.themeId ?? undefined,
                settings: form.settings,
                publishedAt: form.publishedAt ? String(form.publishedAt) : undefined,
                archivedAt: form.archivedAt ? String(form.archivedAt) : undefined,
                createdAt: form.createdAt ? String(form.createdAt) : null,
                updatedAt: form.updatedAt ? String(form.updatedAt) : null,
            };
        }),

    getByIdWithFields: protectedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/forms/{formId}/full",
                tags: TAGS,
                summary: "Get form with fields and theme",
                description: "Returns full form details with all fields (sorted by order) and theme configuration. Used by the form editor, theme designer, and preview pages.",
                protect: true,
            },
        })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({ ctx, input }) => {
            const form = await formService.getByIdWithFields(input.formId, ctx.user.id);
            if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
            return {
                id: form.id,
                title: form.title,
                description: form.description,
                slug: form.slug,
                status: form.status,
                visibility: form.visibility,
                folderId: form.folderId,
                coverImageUrl: form.coverImageUrl ?? undefined,
                metaTitle: form.metaTitle ?? undefined,
                metaDescription: form.metaDescription ?? undefined,
                themeId: form.themeId ?? undefined,
                settings: form.settings,
                publishedAt: form.publishedAt ? String(form.publishedAt) : undefined,
                archivedAt: form.archivedAt ? String(form.archivedAt) : undefined,
                createdAt: form.createdAt ? String(form.createdAt) : null,
                updatedAt: form.updatedAt ? String(form.updatedAt) : null,
                // `index`/`page` are Postgres `numeric` columns — the pg driver returns numeric
                // as a string. Cast explicitly instead of relying on implicit coercion, so the
                // zod output model (which expects `number`) never silently receives a string
                // and so page-tab grouping in the frontend never does string comparisons
                // ("10" < "2") instead of numeric ones. See §5 of the audit report.
                fields: (form.fields ?? []).map((f: any) => ({
                    id: f.id,
                    formId: f.formId,
                    label: f.label,
                    labelKey: f.labelKey,
                    description: f.description ?? undefined,
                    placeholder: f.placeholder ?? undefined,
                    isRequired: f.isRequired,
                    index: f.index.toString(),
                    type: f.type,
                    options: f.options ?? undefined,
                    validation: f.validation ?? undefined,
                    condition: f.condition ?? undefined,
                    maxFileSize: f.maxFileSize ? Number(f.maxFileSize) : undefined,
                    allowedFileTypes: f.allowedFileTypes ?? undefined,
                    page: f.page ? Number(f.page) : 1,
                    createdAt: f.createdAt ? String(f.createdAt) : null,
                    updatedAt: f.updatedAt ? String(f.updatedAt) : null,
                })),
            };
        }),

    getBySlug: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/forms/slug/{slug}",
                tags: TAGS,
                summary: "Get public form by slug",
                description: "Returns published form by slug for public access.",
            },
        })
        .input(getFormBySlugInputModel)
        .output(getFormBySlugOutputModel)
        .query(async ({ input }) => {
            const form = await formService.getPublicBySlug(input.slug);
            if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
            return {
                id: form.id,
                title: form.title,
                description: form.description ?? null,
                slug: form.slug,
                status: form.status ?? "draft",
                visibility: form.visibility ?? "public",
                folderId: form.folderId ?? null,
                coverImageUrl: form.coverImageUrl ?? undefined,
                metaTitle: form.metaTitle ?? undefined,
                metaDescription: form.metaDescription ?? undefined,
                themeId: form.themeId ?? undefined,
                settings: form.settings ?? {},
                publishedAt: form.publishedAt ? String(form.publishedAt) : undefined,
                archivedAt: form.archivedAt ? String(form.archivedAt) : undefined,
                createdAt: form.createdAt ? String(form.createdAt) : null,
                updatedAt: form.updatedAt ? String(form.updatedAt) : null,
                fields: (form.fields ?? []).map((f: any) => ({
                    id: f.id,
                    formId: f.formId,
                    label: f.label,
                    labelKey: f.labelKey,
                    description: f.description ?? undefined,
                    placeholder: f.placeholder ?? undefined,
                    isRequired: f.isRequired,
                    index: f.index.toString(),
                    type: f.type,
                    options: f.options ?? undefined,
                    validation: f.validation ?? undefined,
                    condition: f.condition ?? undefined,
                    maxFileSize: f.maxFileSize ? Number(f.maxFileSize) : undefined,
                    allowedFileTypes: f.allowedFileTypes ?? undefined,
                    page: f.page ? Number(f.page) : 1,
                    createdAt: f.createdAt ? String(f.createdAt) : null,
                    updatedAt: f.updatedAt ? String(f.updatedAt) : null,
                })),
            } as any;
        }),

    exportForm: protectedProcedure
        .input(exportFormInputModel)
        .output(exportFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.getByIdWithFields(input.formId, ctx.user.id);
            if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
            return {
                title: form.title,
                description: form.description ?? undefined,
                slug: form.slug,
                fields: ((form as any).fields ?? []).map((f: any) => ({
                    label: f.label,
                    type: f.type,
                    description: f.description ?? undefined,
                    placeholder: f.placeholder ?? undefined,
                    isRequired: f.isRequired ?? undefined,
                    options: f.options ?? undefined,
                    validation: f.validation ?? undefined,
                    page: f.page ? Number(f.page) : undefined,
                    condition: f.condition ?? undefined,
                    maxFileSize: f.maxFileSize ? Number(f.maxFileSize) : undefined,
                    allowedFileTypes: f.allowedFileTypes ?? undefined,
                })),
            };
        }),

    importForm: protectedProcedure
        .input(importFormInputModel)
        .output(importFormOutputModel)
        .mutation(async ({ ctx, input }) => {
            const form = await formService.create(ctx.user.id, {
                title: input.data.title,
                description: input.data.description,
            });
            if (!form) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create form" });

            if (input.data.fields && input.data.fields.length > 0) {
                for (let i = 0; i < input.data.fields.length; i++) {
                    const f = input.data.fields[i]!;
                    await formFieldService.createField({
                        formId: form.id,
                        userId: ctx.user.id,
                        label: f.label,
                        type: f.type as any,
                        description: f.description,
                        placeholder: f.placeholder,
                        isRequired: f.isRequired ?? false,
                        options: f.options as any,
                        validation: f.validation as any,
                        page: f.page ?? 1,
                        condition: f.condition as any,
                        maxFileSize: f.maxFileSize,
                        allowedFileTypes: f.allowedFileTypes as any,
                    });
                }
            }

            return { id: form.id, slug: form.slug };
        }),
});

export default formRouter;
