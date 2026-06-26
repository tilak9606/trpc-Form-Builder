import { z } from "zod";
import { fieldWithDetailsOutputModel } from "../form-field/model";

export const formStatusEnum = z.enum(["DRAFT", "PUBLISHED", "CLOSED"]);

export const createFormInputModel = z.object({
    title: z.string().max(100).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
    folderId: z.string().nullable().optional().describe("Folder ID to place the form in"),
});

export const createFormOutputModel = z.object({
    id: z.string().describe("ID of the created form"),
    slug: z.string().describe("Slug of the created form"),
});

export const listFormsInputModel = z.object({
    folderId: z.string().nullable().optional().describe("Filter by folder ID"),
}).optional();
export const listFormsOutputModel = z.array(
    z.object({
        id: z.string().describe("ID of the form"),
        title: z.string().describe("Title of the form"),
        description: z.string().nullable().optional().describe("Description of the form"),
        slug: z.string().describe("Slug of the form"),
        status: z.string().describe("Status of the form"),
        folderId: z.string().nullable().describe("ID of the folder"),
        createdAt: z.date().nullable().describe("Creation timestamp"),
        updatedAt: z.date().nullable().describe("Last updated timestamp"),
        submissionCount: z.number().describe("Number of submissions"),
    }),
);

export const getFormInputModel = z.object({
    formId: z.string().describe("UUID or slug of the form to fetch"),
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional().describe("Filter by form status"),
});

export const getFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    status: z.string(),
    folderId: z.string().nullable(),
    notifyEmail: z.boolean().optional(),
    notifyEmailTo: z.string().nullable().optional(),
    themePrimaryColor: z.string().nullable().optional(),
    themeBackgroundColor: z.string().nullable().optional(),
    themeTextColor: z.string().nullable().optional(),
    themeLabelColor: z.string().nullable().optional(),
    themeFontFamily: z.string().nullable().optional(),
    themeBorderRadius: z.string().nullable().optional(),
    themeButtonText: z.string().nullable().optional(),
    themeButtonTextColor: z.string().nullable().optional(),
    themeLogoUrl: z.string().nullable().optional(),
    thankYouUrl: z.string().nullable().optional(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    fields: z.array(fieldWithDetailsOutputModel),
});

export const getFormBySlugInputModel = z.object({
    slug: z.string().max(100).describe("Slug of the form to fetch"),
});

export const getFormBySlugOutputModel = getFormOutputModel;

export const updateFormInputModel = z.object({
    formId: z.string().describe("UUID of the form to update"),
    title: z.string().max(100).optional().describe("New title"),
    description: z.string().max(300).optional().describe("New description"),
    slug: z.string().max(100).optional().describe("New slug"),
    folderId: z.string().nullable().optional().describe("Folder ID to move to"),
    status: formStatusEnum.optional().describe("New form status (DRAFT, PUBLISHED, CLOSED)"),
    notifyEmail: z.boolean().optional().describe("Enable email notifications on submission"),
    notifyEmailTo: z.string().email().optional().describe("Email address to send notifications to"),
    themePrimaryColor: z.string().max(7).optional().describe("Primary color hex"),
    themeBackgroundColor: z.string().max(7).optional().describe("Background color hex"),
    themeTextColor: z.string().max(7).optional().describe("Text color hex"),
    themeLabelColor: z.string().max(7).optional().describe("Label color hex"),
    themeFontFamily: z.string().max(50).optional().describe("Font family name"),
    themeBorderRadius: z.string().max(10).optional().describe("Border radius value"),
    themeButtonText: z.string().max(50).optional().describe("Submit button text"),
    themeButtonTextColor: z.string().max(7).optional().describe("Submit button text color hex"),
    themeLogoUrl: z.string().optional().describe("Logo image URL"),
    thankYouUrl: z.string().optional().describe("URL to redirect after submission"),
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
    status: z.enum(["PUBLISHED", "CLOSED"]).describe("New status (PUBLISHED or CLOSED)"),
});

export const publishFormOutputModel = z.object({
    id: z.string(),
    status: z.string(),
});

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
