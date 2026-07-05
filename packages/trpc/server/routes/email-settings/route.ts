import { z } from "zod";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { emailSettingsService } from "@repo/services";
import { updateEmailSettingsInputModel } from "./model";

const TAGS = ["Email Settings"];
const getPath = generatePath("/email-settings");

export const emailSettingsRouter = router({
  get: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getEmailSettings"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      return emailSettingsService.getSettings(ctx.user.id, input.formId);
    }),

  update: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateEmailSettings"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateEmailSettingsInputModel)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return emailSettingsService.updateSettings(
        ctx.user.id,
        input.formId,
        input
      );
    }),
});

export default emailSettingsRouter;