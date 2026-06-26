import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formSubmissionService } from "@repo/services";

import {
    createSubmissionInputModel,
    createSubmissionOutputModel,
    getSubmissionsByFormIdInputModel,
    getSubmissionsByFormIdOutputModel,
    getSubmissionByIdInputModel,
    getSubmissionByIdOutputModel,
    exportSubmissionsInputModel,
    exportSubmissionsOutputModel,
    getAnalyticsInputModel,
    getAnalyticsOutputModel,
    trackEventInputModel,
    trackEventOutputModel,
    deleteSubmissionInputModel,
    deleteSubmissionOutputModel,
} from "./model";

const TAGS = ["FormSubmission"];
const getPath = generatePath("/form-submission");

export const formSubmissionRouter = router({
    deleteSubmission: authenticatedProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: getPath("/deleteSubmission"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(deleteSubmissionInputModel)
        .output(deleteSubmissionOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formSubmissionService.deleteSubmission(
                input.submissionId,
                input.formId,
                ctx.user.id
            );
            return result;
        }),
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
            const result = await formSubmissionService.getSubmissionsByFormId({
                formId: input.formId,
                userId: ctx.user.id,
                page: input.page,
                limit: input.limit,
                search: input.search,
            });
            return result;
        }),
    getSubmissionById: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getSubmissionById"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getSubmissionByIdInputModel)
        .output(getSubmissionByIdOutputModel)
        .query(async ({ input, ctx }) => {
            const result = await formSubmissionService.getSubmissionById({
                submissionId: input.submissionId,
                formId: input.formId,
                userId: ctx.user.id,
            });
            return result;
        }),
    trackEvent: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/trackEvent"), tags: TAGS } })
        .input(trackEventInputModel)
        .output(trackEventOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formSubmissionService.trackEvent({
                ...input,
                respondentIp: ctx.respondentIp,
            });
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
