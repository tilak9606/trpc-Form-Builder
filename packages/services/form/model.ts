import { z } from "zod";

export const createFormInput = z.object({
    title: z.string().max(100).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
    slug: z.string().max(100).optional().describe("Custom slug (auto-generated from title if not provided)"),
    createdBy: z.string().describe("ID of the creator"),
    folderId: z.string().nullable().optional().describe("Folder ID to place the form in"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.string().describe("ID of the user"),
    folderId: z.string().nullable().optional().describe("Filter by folder ID"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const updateFormInput = z.object({
    id: z.uuid().describe("UUID of the form to update"),
    userId: z.string().describe("ID of the user requesting the update"),
    title: z.string().max(100).optional().describe("New title"),
    description: z.string().max(300).optional().describe("New description"),
    slug: z.string().max(100).optional().describe("New slug"),
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional().describe("New status"),
    folderId: z.string().nullable().optional().describe("Folder ID to move the form to"),
    notifyEmail: z.boolean().optional().describe("Enable email notifications on submission"),
    notifyEmailTo: z.string().email().optional().describe("Email to send submission notifications to"),
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

export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const deleteFormInput = z.object({
    id: z.uuid().describe("UUID of the form to delete"),
    userId: z.string().describe("ID of the user requesting the deletion"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

export const getFormBySlugInput = z.object({
    slug: z.string().max(100).describe("Slug of the form"),
});

export type GetFormBySlugInputType = z.infer<typeof getFormBySlugInput>;

export const formFieldExportSchema = z.object({
    label: z.string().max(100),
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

export const formExportSchema = z.object({
    title: z.string().max(100),
    description: z.string().max(300).optional(),
    slug: z.string().max(100),
    fields: z.array(formFieldExportSchema),
});

export const importFormInputDataSchema = z.object({
    title: z.string().max(100),
    description: z.string().max(300).optional(),
    slug: z.string().max(100).optional(),
    fields: z.array(formFieldExportSchema),
});

export const importFormInput = z.object({
    data: importFormInputDataSchema,
    userId: z.string().describe("ID of the user importing the form"),
});

export type ImportFormInputType = z.infer<typeof importFormInput>;
