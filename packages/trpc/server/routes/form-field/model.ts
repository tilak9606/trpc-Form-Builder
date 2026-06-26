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
    "TIME",
    "RATING",
    "TAGS",
    "TOGGLE",
    "RADIO",
    "CHECKBOX",
    "TEXTAREA",
    "FILE_UPLOAD",
]);

export const fieldConditionSchema = z.object({
    fieldId: z.string(),
    operator: z.enum(["equals", "not_equals", "contains"]),
    value: z.string(),
    targetPage: z.number().int().min(1).optional().describe("Page to skip to when condition is met"),
});

export const createFieldInputModel = z.object({
    label: z.string().max(100).describe("Display label for the field"),
    type: fieldTypeEnum.describe("Type of the field"),
    formId: z.string().describe("UUID of the form this field belongs to"),
    description: z.string().max(1000).nullable().optional().describe("Helper text shown below the field"),
    placeholder: z.string().nullable().optional().describe("Placeholder text for the field"),
    isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
    options: z.array(z.string()).nullable().optional().describe("Options for SELECT/MULTI_SELECT fields"),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        icon: z.string().optional(),
    }).nullable().optional().describe("Validation rules"),
    page: z.number().int().min(1).optional().default(1).describe("Page number"),
    maxFileSize: z.number().nullable().optional().describe("Max file size in bytes for FILE_UPLOAD fields"),
    allowedFileTypes: z.array(z.string()).nullable().optional().describe("Allowed MIME types for FILE_UPLOAD fields"),
    condition: fieldConditionSchema.nullable().optional().describe("Conditional logic"),
});

export const createFieldOutputModel = z.object({
    id: z.string().describe("ID of the created field"),
    labelKey: z.string().describe("Immutable slug key for the field label"),
    index: z.string().describe("Index string for ordering"),
});

export const getFieldsInputModel = z.object({
    formId: z.string().describe("UUID of the form to fetch the fields for"),
});

export const fieldOutputModel = z.object({
    id: z.string(),
    formId: z.uuid().nullable(),
    label: z.string(),
    labelKey: z.string(),
    description: z.string().nullable(),
    placeholder: z.string().nullable(),
    isRequired: z.boolean(),
    index: z.string(),
    type: fieldTypeEnum,
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export const fieldWithDetailsOutputModel = fieldOutputModel.extend({
    options: z.array(z.string()).nullable(),
    maxFileSize: z.number().nullable(),
    allowedFileTypes: z.array(z.string()).nullable(),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        icon: z.string().optional(),
    }).nullable(),
    condition: fieldConditionSchema.nullable(),
    page: z.number(),
});

export const getFieldsOutputModel = z.array(fieldWithDetailsOutputModel);

export const updateFieldInputModel = z.object({
    id: z.uuid().describe("UUID of the field to update"),
    formId: z.string().describe("UUID of the parent form"),
    label: z.string().max(100).optional().describe("New label"),
    type: fieldTypeEnum.optional().describe("New type"),
    description: z.string().nullable().optional().describe("New helper text"),
    placeholder: z.string().nullable().optional().describe("New placeholder"),
    isRequired: z.boolean().optional().describe("Whether the field is required"),
    options: z.array(z.string()).nullable().optional().describe("New options"),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        icon: z.string().optional(),
    }).nullable().optional().describe("New validation rules"),
    page: z.number().int().min(1).optional().describe("New page number"),
    maxFileSize: z.number().nullable().optional().describe("New max file size in bytes"),
    allowedFileTypes: z.array(z.string()).nullable().optional().describe("New allowed MIME types"),
    condition: fieldConditionSchema.nullable().optional().describe("New conditional logic"),
});

export const updateFieldOutputModel = z.object({
    id: z.string().describe("ID of the updated field"),
});

export const deleteFieldInputModel = z.object({
    id: z.uuid().describe("UUID of the field to delete"),
    formId: z.string().describe("UUID of the parent form"),
});

export const deleteFieldOutputModel = z.object({
    id: z.string().describe("ID of the deleted field"),
});

export const duplicateFieldInputModel = z.object({
    id: z.uuid().describe("UUID of the field to duplicate"),
    formId: z.string().describe("UUID of the parent form"),
});

export const duplicateFieldOutputModel = z.object({
    id: z.string().describe("ID of the duplicated field"),
    labelKey: z.string(),
    index: z.string(),
});

export const reorderFieldsInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    fieldIds: z.array(z.uuid()).describe("Field IDs in new order"),
});

export const reorderFieldsOutputModel = z.object({
    success: z.boolean(),
});

export type CreateFieldInputModel = z.infer<typeof createFieldInputModel>;
export type CreateFieldOutputModel = z.infer<typeof createFieldOutputModel>;
export type GetFieldsInputModel = z.infer<typeof getFieldsInputModel>;
export type GetFieldsOutputModel = z.infer<typeof getFieldsOutputModel>;
