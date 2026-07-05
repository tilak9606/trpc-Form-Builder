import { z } from "zod";
import type { FieldType } from "@repo/database/constants/field-types";
import {
    createFormSchema,
    updateFormSchema,
    FORM_STATUSES,
    FORM_VISIBILITIES,
    type FormStatus,
    type FormVisibility,
} from "@repo/database/schemas/form";

export const createFormInput = createFormSchema.extend({
    createdBy: z.string().describe("ID of the creator"),
    folderId: z.string().nullable().optional().describe("Folder ID to place the form in"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.string().describe("ID of the user"),
    folderId: z.string().nullable().optional().describe("Filter by folder ID"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const updateFormInput = updateFormSchema.extend({
    userId: z.string().describe("ID of the user requesting the update"),
});

export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const deleteFormInput = z.object({
    id: z.uuid().describe("UUID of the form to delete"),
    userId: z.string().describe("ID of the user requesting the deletion"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

export const getFormBySlugInput = z.object({
    slug: z.string().max(64).describe("Slug of the form"),
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
    slug: z.string().max(64),
    fields: z.array(formFieldExportSchema),
});

export const importFormInputDataSchema = z.object({
    title: z.string().max(100),
    description: z.string().max(300).optional(),
    slug: z.string().max(64).optional(),
    fields: z.array(formFieldExportSchema),
});

export const importFormInput = z.object({
    data: importFormInputDataSchema,
    userId: z.string().describe("ID of the user importing the form"),
});

export type ImportFormInputType = z.infer<typeof importFormInput>;