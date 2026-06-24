import { z } from "zod";

export const templateFieldSchema = z.object({
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
});

export const createTemplateInput = z.object({
    title: z.string().max(100).describe("Template title"),
    description: z.string().max(300).optional().describe("Template description"),
    fields: z.array(templateFieldSchema).describe("Array of field definitions"),
    userId: z.string().describe("ID of the user creating the template"),
});

export type CreateTemplateInputType = z.infer<typeof createTemplateInput>;

export const listTemplatesInput = z.undefined();

export const listTemplatesOutput = z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    fieldsCount: z.number(),
    createdAt: z.string().nullable(),
}));

export const deleteTemplateInput = z.object({
    id: z.string().describe("UUID of the template to delete"),
    userId: z.string().describe("ID of the user deleting the template"),
});

export type DeleteTemplateInputType = z.infer<typeof deleteTemplateInput>;

export const createFormFromTemplateInput = z.object({
    templateId: z.string().describe("UUID of the template"),
    userId: z.string().describe("ID of the user creating the form"),
    title: z.string().max(100).optional().describe("Override title"),
});

export type CreateFormFromTemplateInputType = z.infer<typeof createFormFromTemplateInput>;
