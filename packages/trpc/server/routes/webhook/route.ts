import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { webhookService } from "@repo/services";

import {
    createWebhookInputModel,
    createWebhookOutputModel,
    listWebhooksInputModel,
    listWebhooksOutputModel,
    updateWebhookInputModel,
    updateWebhookOutputModel,
    deleteWebhookInputModel,
    deleteWebhookOutputModel,
} from "./model";

const TAGS = ["Webhook"];
const getPath = generatePath("/webhook");

export const webhookRouter = router({
    createWebhook: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createWebhook"), tags: TAGS, protect: true } })
        .input(createWebhookInputModel)
        .output(createWebhookOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await webhookService.createWebhook({
                formId: input.formId,
                userId: ctx.user.id,
                name: input.name,
                url: input.url,
                events: input.events,
                enabled: input.enabled,
            });
            return result;
        }),
    listWebhooks: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listWebhooks"), tags: TAGS, protect: true } })
        .input(listWebhooksInputModel)
        .output(listWebhooksOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await webhookService.getWebhooks({ formId: input.formId, userId: ctx.user.id });
            return result;
        }),
    updateWebhook: authenticatedProcedure
        .meta({ openapi: { method: "PATCH", path: getPath("/updateWebhook"), tags: TAGS, protect: true } })
        .input(updateWebhookInputModel)
        .output(updateWebhookOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await webhookService.updateWebhook({
                id: input.id,
                formId: input.formId,
                userId: ctx.user.id,
                name: input.name,
                url: input.url,
                events: input.events,
                enabled: input.enabled,
            });
            return result;
        }),
    deleteWebhook: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteWebhook"), tags: TAGS, protect: true } })
        .input(deleteWebhookInputModel)
        .output(deleteWebhookOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await webhookService.deleteWebhook({
                id: input.id,
                formId: input.formId,
                userId: ctx.user.id,
            });
            return result;
        }),
});

export default webhookRouter;
