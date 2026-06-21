import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "../../services";

import {
    createFormInputModel,
    createFormOutputModel,
    listFormsInputModel,
    listFormsOutputModel,
    getFormInputModel,
    getFormOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { title, description } = input;

            const { id } = await formService.createForm({
                title,
                description,
                createdBy: ctx.user.id,
            });

            return { id };
        }),
    listForms: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/listForms"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(listFormsInputModel)
        .output(listFormsOutputModel)
        .query(async ({ ctx }) => {
            const forms = await formService.listFormsByUserId({ userId: ctx.user.id });
            return forms;
        }),
    getFormWithFields: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getForm"),
                tags: TAGS,
            },
        })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({ input }) => {
            const { formId } = input;
            const form = await formService.getFormWithFields(formId);
            return form;
        }),
});
