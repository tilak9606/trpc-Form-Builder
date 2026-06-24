import { z } from "zod";

export const fieldTypeEnum = z.enum([
    "TEXT",
    "NUMBER",
    "EMAIL",
    "YES_NO",
    "PASSWORD",
    "SELECT",
    "MULTI_SELECT",
    "DATE",
    "TEXTAREA",
    "FILE_UPLOAD",
]);

export const createFieldInput = z.object({
    label: z.string().max(100).describe("Display label for the field"),
    type: fieldTypeEnum.describe("Type of the field"),
    formId: z.string().describe("UUID of the form this field belongs to"),
    userId: z.string().describe("ID of the user creating the field"),
    description: z.string().optional().describe("Helper text shown below the field"),
    placeholder: z.string().optional().describe("Placeholder text for the field"),
    isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
    options: z.array(z.string()).optional().describe("Options for SELECT/MULTI_SELECT fields"),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
    }).optional().describe("Validation rules"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for multi-page forms"),
    maxFileSize: z.number().optional().describe("Max file size in bytes for FILE_UPLOAD fields"),
    allowedFileTypes: z.array(z.string()).optional().describe("Allowed MIME types for FILE_UPLOAD fields"),
    condition: z.object({
        fieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains"]),
        value: z.string(),
        targetPage: z.number().int().min(1).optional().describe("Page to skip to when condition is met"),
    }).nullable().optional().describe("Conditional logic for showing this field"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const getFieldsInput = z.object({
    formId: z.string().describe("UUID of the form to fetch the fields for"),
});

export type GetFieldsInputType = z.infer<typeof getFieldsInput>;

export const updateFieldInput = z.object({
    id: z.uuid().describe("UUID of the field to update"),
    formId: z.string().describe("UUID of the parent form"),
    userId: z.string().describe("ID of the user updating the field"),
    label: z.string().max(100).optional().describe("New label"),
    type: fieldTypeEnum.optional().describe("New type"),
    description: z.string().optional().describe("New helper text"),
    placeholder: z.string().optional().describe("New placeholder"),
    isRequired: z.boolean().optional().describe("Whether the field is required"),
    options: z.array(z.string()).optional().describe("New options"),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
    }).optional().describe("New validation rules"),
    page: z.number().int().min(1).optional().describe("Page number for multi-page forms"),
    maxFileSize: z.number().optional().describe("Max file size in bytes"),
    allowedFileTypes: z.array(z.string()).optional().describe("Allowed MIME types"),
    condition: z.object({
        fieldId: z.string(),
        operator: z.enum(["equals", "not_equals", "contains"]),
        value: z.string(),
        targetPage: z.number().int().min(1).optional().describe("Page to skip to when condition is met"),
    }).nullable().optional().describe("Conditional logic for showing this field"),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
    id: z.uuid().describe("UUID of the field to delete"),
    formId: z.string().describe("UUID of the parent form"),
    userId: z.string().describe("ID of the user deleting the field"),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const duplicateFieldInput = z.object({
    id: z.uuid().describe("UUID of the field to duplicate"),
    formId: z.string().describe("UUID of the parent form"),
    userId: z.string().describe("ID of the user duplicating the field"),
});

export type DuplicateFieldInputType = z.infer<typeof duplicateFieldInput>;

export const reorderFieldsInput = z.object({
    formId: z.string().describe("UUID of the form"),
    fieldIds: z.array(z.uuid()).describe("Field IDs in new order"),
    userId: z.string().describe("ID of the user reordering the fields"),
});

export type ReorderFieldsInputType = z.infer<typeof reorderFieldsInput>;
