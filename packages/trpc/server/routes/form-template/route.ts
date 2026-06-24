import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formTemplateService } from "@repo/services";

import {
    createTemplateInputModel,
    createTemplateOutputModel,
    listTemplatesInputModel,
    listTemplatesOutputModel,
    deleteTemplateInputModel,
    deleteTemplateOutputModel,
    createFormFromTemplateInputModel,
    createFormFromTemplateOutputModel,
} from "./model";

const TAGS = ["FormTemplate"];
const getPath = generatePath("/form-template");

export const formTemplateRouter = router({
    createTemplate: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createTemplate"), tags: TAGS, protect: true } })
        .input(createTemplateInputModel)
        .output(createTemplateOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formTemplateService.createTemplate({
                title: input.title,
                description: input.description,
                fields: input.fields,
                userId: ctx.user.id,
            });
            return result;
        }),
    listTemplates: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listTemplates"), tags: TAGS, protect: true } })
        .input(listTemplatesInputModel)
        .output(listTemplatesOutputModel)
        .query(async () => {
            const result = await formTemplateService.listTemplates();
            return result;
        }),
    deleteTemplate: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteTemplate"), tags: TAGS, protect: true } })
        .input(deleteTemplateInputModel)
        .output(deleteTemplateOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formTemplateService.deleteTemplate({
                id: input.id,
                userId: ctx.user.id,
            });
            return result;
        }),
    createFormFromTemplate: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createFormFromTemplate"), tags: TAGS, protect: true } })
        .input(createFormFromTemplateInputModel)
        .output(createFormFromTemplateOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formTemplateService.createFormFromTemplate({
                templateId: input.templateId,
                title: input.title,
                userId: ctx.user.id,
            });
            return result;
        }),
});

export default formTemplateRouter;
