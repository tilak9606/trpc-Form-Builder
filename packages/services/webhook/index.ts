import { db, eq, and } from "@repo/database";
import { webhooksTable } from "@repo/database/models/webhook";
import { formsTable } from "@repo/database/models/form";
import { logger } from "@repo/logger";
import {
    createWebhookInput,
    type CreateWebhookInputType,
    getWebhooksInput,
    type GetWebhooksInputType,
    updateWebhookInput,
    type UpdateWebhookInputType,
    deleteWebhookInput,
    type DeleteWebhookInputType,
} from "./model";

export default class WebhookService {
    private async verifyFormOwnership(formId: string, userId: string): Promise<void> {
        const rows = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));
        if (!rows || rows.length === 0)
            throw new Error(`Form with ID ${formId} not found or access denied`);
    }

    public async createWebhook(payload: CreateWebhookInputType) {
        const data = await createWebhookInput.parseAsync(payload);
        await this.verifyFormOwnership(data.formId, data.userId);

        const result = await db
            .insert(webhooksTable)
            .values({
                formId: data.formId,
                name: data.name,
                url: data.url,
                events: data.events,
                enabled: data.enabled,
            })
            .returning({ id: webhooksTable.id });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the webhook");

        return { id: result[0].id };
    }

    public async getWebhooks(payload: GetWebhooksInputType) {
        const data = await getWebhooksInput.parseAsync(payload);
        await this.verifyFormOwnership(data.formId, data.userId);

        const rows = await db
            .select()
            .from(webhooksTable)
            .where(eq(webhooksTable.formId, data.formId));

        return rows.map((r) => ({
            id: r.id,
            formId: r.formId,
            name: r.name,
            url: r.url,
            events: (r.events ?? []) as string[],
            enabled: r.enabled,
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
        }));
    }

    public async updateWebhook(payload: UpdateWebhookInputType) {
        const data = await updateWebhookInput.parseAsync(payload);
        await this.verifyFormOwnership(data.formId, data.userId);

        const updates: Record<string, any> = {};
        if (data.name !== undefined) updates.name = data.name;
        if (data.url !== undefined) updates.url = data.url;
        if (data.events !== undefined) updates.events = data.events;
        if (data.enabled !== undefined) updates.enabled = data.enabled;

        await db
            .update(webhooksTable)
            .set(updates)
            .where(and(eq(webhooksTable.id, data.id), eq(webhooksTable.formId, data.formId)));

        return { id: data.id };
    }

    public async deleteWebhook(payload: DeleteWebhookInputType) {
        const data = await deleteWebhookInput.parseAsync(payload);
        await this.verifyFormOwnership(data.formId, data.userId);

        await db
            .delete(webhooksTable)
            .where(and(eq(webhooksTable.id, data.id), eq(webhooksTable.formId, data.formId)));

        return { id: data.id };
    }

    public async triggerWebhooks(formId: string, submission: any): Promise<void> {
        const rows = await db
            .select()
            .from(webhooksTable)
            .where(and(eq(webhooksTable.formId, formId), eq(webhooksTable.enabled, true)));

        for (const hook of rows) {
            const payload = JSON.stringify({
                event: "submission.created",
                formId,
                submission,
                timestamp: new Date().toISOString(),
            });

            fetch(hook.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
            }).catch((err) => {
                logger.error({
                    service: "webhook",
                    message: `Webhook delivery failed for ${hook.url}`,
                    extra: { webhookId: hook.id, formId, error: String(err) },
                });
            });
        }
    }
}
