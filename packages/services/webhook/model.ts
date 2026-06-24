import { z } from "zod";

export const createWebhookInput = z.object({
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user creating the webhook"),
    name: z.string().max(100).describe("Name for the webhook"),
    url: z.string().url().describe("Webhook callback URL"),
    events: z.array(z.enum(["submission.created"])).default(["submission.created"]).describe("Events to trigger on"),
    enabled: z.boolean().default(true).describe("Whether the webhook is active"),
});

export type CreateWebhookInputType = z.infer<typeof createWebhookInput>;

export const getWebhooksInput = z.object({
    formId: z.string().describe("UUID of the form"),
});

export type GetWebhooksInputType = z.infer<typeof getWebhooksInput>;

export const updateWebhookInput = z.object({
    id: z.string().describe("UUID of the webhook"),
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user updating the webhook"),
    name: z.string().max(100).optional().describe("New name"),
    url: z.string().url().optional().describe("New URL"),
    events: z.array(z.enum(["submission.created"])).optional().describe("New events"),
    enabled: z.boolean().optional().describe("Whether active"),
});

export type UpdateWebhookInputType = z.infer<typeof updateWebhookInput>;

export const deleteWebhookInput = z.object({
    id: z.string().describe("UUID of the webhook"),
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user deleting the webhook"),
});

export type DeleteWebhookInputType = z.infer<typeof deleteWebhookInput>;
