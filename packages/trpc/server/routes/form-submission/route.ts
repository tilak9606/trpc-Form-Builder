import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formSubmissionService } from "../../services";

import {
    createSubmissionInputModel,
    createSubmissionOutputModel,
    getSubmissionsByFormIdInputModel,
    getSubmissionsByFormIdOutputModel,
} from "./model";

const TAGS = ["FormSubmission"];
const getPath = generatePath("/form-submission");

export const formSubmissionRouter = router({
    createSubmission: publicProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createSubmission"), tags: TAGS } })
        .input(createSubmissionInputModel)
        .output(createSubmissionOutputModel)
        .mutation(async ({ input }) => {
            const result = await formSubmissionService.createSubmission(input as any);
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
        .query(async ({ input }) => {
            const { formId } = input;
            const result = await formSubmissionService.getSubmissionsByFormId(formId);
            return result;
        }),
});

export default formSubmissionRouter;
