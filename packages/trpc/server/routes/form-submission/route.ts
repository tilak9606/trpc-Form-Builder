import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formSubmissionService } from "@repo/services";

import {
    createSubmissionInputModel,
    createSubmissionOutputModel,
    getSubmissionsByFormIdInputModel,
    getSubmissionsByFormIdOutputModel,
    exportSubmissionsInputModel,
    exportSubmissionsOutputModel,
    getAnalyticsInputModel,
    getAnalyticsOutputModel,
} from "./model";

const TAGS = ["FormSubmission"];
const getPath = generatePath("/form-submission");

export const formSubmissionRouter = router({
    createSubmission: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createSubmission"), tags: TAGS } })
        .input(createSubmissionInputModel)
        .output(createSubmissionOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formSubmissionService.createSubmission({
                ...input,
                respondentIp: ctx.respondentIp,
            });
            return result;
        }),
    getSubmissionsByFormId: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getSubmissionsByFormId"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getSubmissionsByFormIdInputModel)
        .output(getSubmissionsByFormIdOutputModel)
        .query(async ({ input, ctx }) => {
            const { formId } = input;
            const result = await formSubmissionService.getSubmissionsByFormId(formId, ctx.user.id);
            return result;
        }),
    exportSubmissions: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/exportSubmissions"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(exportSubmissionsInputModel)
        .output(exportSubmissionsOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await formSubmissionService.exportSubmissions({ formId: input.formId, format: input.format, userId: ctx.user.id });
            return result;
        }),
    getAnalytics: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getAnalytics"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getAnalyticsInputModel)
        .output(getAnalyticsOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await formSubmissionService.getAnalytics({ formId: input.formId, userId: ctx.user.id });
            return result;
        }),
});

export default formSubmissionRouter;
