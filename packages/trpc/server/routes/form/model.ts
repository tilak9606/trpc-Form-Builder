import { z } from "zod";
import { fieldWithDetailsOutputModel } from "../form-field/model";

export const FORM_VISIBILITIES = ["public", "unlisted", "private"] as const;
export const FORM_STATUSES = ["draft", "published", "archived"] as const;

export const formVisibilityEnum = z.enum(FORM_VISIBILITIES);
export const formStatusEnum = z.enum(FORM_STATUSES);

export const createFormInputModel = z.object({
    title: z.string().max(255).describe("Title of the form"),
    description: z.string().max(2000).optional().describe("Description of the form"),
    folderId: z.string().nullable().optional().describe("Folder ID to place the form in"),
    visibility: formVisibilityEnum.default("public").describe("Form visibility"),
});

export const createFormOutputModel = z.object({
    id: z.string().describe("ID of the created form"),
    slug: z.string().describe("Slug of the created form"),
});

export const listFormsInputModel = z.object({
    folderId: z.string().nullable().optional().describe("Filter by folder ID"),
}).optional();

export const listFormsOutputModel = z.object({
    forms: z.array(
        z.object({
            id: z.string().describe("ID of the form"),
            title: z.string().describe("Title of the form"),
            description: z.string().nullable().optional().describe("Description of the form"),
            slug: z.string().describe("Slug of the form"),
            status: z.string().describe("Status of the form"),
            visibility: z.string().describe("Visibility of the form"),
            folderId: z.string().nullable().describe("ID of the folder"),
            coverImageUrl: z.string().nullable().optional().describe("Cover image URL"),
            createdAt: z.date().nullable().describe("Creation timestamp"),
            updatedAt: z.date().nullable().describe("Last updated timestamp"),
            submissionCount: z.number().describe("Number of submissions"),
            totalViews: z.number().describe("Total views"),
            totalStarts: z.number().describe("Total starts"),
            totalSubmissions: z.number().describe("Total submissions"),
        }),
    ),
    weeklySubmissions: z.number().describe("Submissions in the last 7 days"),
});

export const getFormInputModel = z.object({
    formId: z.string().describe("UUID of the form to fetch"),
});

export const getFormBasicOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    status: z.string(),
    visibility: z.string(),
    folderId: z.string().nullable(),
    coverImageUrl: z.string().nullable().optional(),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    themeId: z.string().nullable().optional(),
    settings: z.any(),
    publishedAt: z.string().nullable().optional(),
    archivedAt: z.string().nullable().optional(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export const getFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    status: z.string(),
    visibility: z.string(),
    folderId: z.string().nullable(),
    coverImageUrl: z.string().nullable().optional(),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    themeId: z.string().nullable().optional(),
    settings: z.any(),
    publishedAt: z.string().nullable().optional(),
    archivedAt: z.string().nullable().optional(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    fields: z.array(fieldWithDetailsOutputModel),
});

export const getFormBySlugInputModel = z.object({
    slug: z.string().max(64).describe("Slug of the form to fetch"),
});

export const getFormBySlugOutputModel = getFormOutputModel;

export const updateFormInputModel = z.object({
    formId: z.string().describe("UUID of the form to update"),
    title: z.string().max(255).optional().describe("New title"),
    description: z.string().max(2000).optional().describe("New description"),
    slug: z.string().max(64).optional().describe("New slug"),
    themeId: z.string().max(255).optional().describe("Theme ID"),
    visibility: formVisibilityEnum.optional().describe("New form visibility"),
    coverImageUrl: z.string().url().optional().nullable().describe("Cover/banner image URL"),
    metaTitle: z.string().max(60).optional().describe("Meta title for SEO"),
    metaDescription: z.string().max(160).optional().describe("Meta description for SEO"),
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

export const updateFormOutputModel = z.object({
    id: z.string().describe("ID of the updated form"),
});

export const deleteFormInputModel = z.object({
    formId: z.string().describe("UUID of the form to delete"),
});

export const deleteFormOutputModel = z.object({
    id: z.string().describe("ID of the deleted form"),
});

export const publishFormInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
});

export const publishFormOutputModel = z.object({
    id: z.string(),
    status: z.string(),
    slug: z.string(),
});

export const unpublishFormInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
});

export const unpublishFormOutputModel = z.object({
    id: z.string(),
    status: z.string(),
});

export const archiveFormInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
});

export const archiveFormOutputModel = z.object({
    id: z.string(),
    status: z.string(),
});

// cloneFormInputModel / cloneFormOutputModel intentionally removed — the `clone` procedure
// was a dead duplicate of `duplicateForm` below and has been dropped from route.ts.

export type GetFormBySlugInput = z.infer<typeof getFormBySlugInputModel>;

export const exportFormInputModel = z.object({
    formId: z.string().describe("UUID or slug of the form to export"),
});

export const formFieldExportModel = z.object({
    label: z.string(),
    type: z.string(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    isRequired: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional(),
    }).optional(),
    page: z.number().optional(),
    condition: z.object({
        fieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains"]),
        value: z.string(),
        targetPage: z.number().optional(),
    }).nullable().optional(),
    maxFileSize: z.number().optional(),
    allowedFileTypes: z.array(z.string()).optional(),
});

export const exportFormOutputModel = z.object({
    title: z.string(),
    description: z.string().optional(),
    slug: z.string(),
    fields: z.array(formFieldExportModel),
});

export const importFormInputModel = z.object({
    data: z.object({
        title: z.string(),
        description: z.string().optional(),
        slug: z.string().optional(),
        fields: z.array(formFieldExportModel),
    }),
});

export const importFormOutputModel = z.object({
    id: z.string(),
    slug: z.string(),
});

export const duplicateFormInputModel = z.object({
    formId: z.string().describe("UUID of the form to duplicate"),
});

export const duplicateFormOutputModel = z.object({
    id: z.string().describe("ID of the duplicated form"),
    slug: z.string().describe("Slug of the duplicated form"),
});
