import { z } from "zod";

export const createTemplateInputModel = z.object({
    title: z.string().max(100).describe("Template title"),
    description: z.string().max(300).optional().describe("Template description"),
    fields: z.array(z.object({
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
    })).describe("Array of field definitions"),
});

export const createTemplateOutputModel = z.object({
    id: z.string(),
});

export const listTemplatesInputModel = z.undefined();

export const listTemplatesOutputModel = z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    fieldsCount: z.number(),
    createdAt: z.string().nullable(),
}));

export const deleteTemplateInputModel = z.object({
    id: z.string().describe("UUID of the template to delete"),
});

export const deleteTemplateOutputModel = z.object({
    id: z.string(),
});

export const createFormFromTemplateInputModel = z.object({
    templateId: z.string().describe("UUID of the template"),
    title: z.string().max(100).optional().describe("Override title"),
});

export const createFormFromTemplateOutputModel = z.object({
    id: z.string(),
    slug: z.string(),
});
