import { TRPCError } from "@trpc/server";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "@repo/services";

import {
    createFormInputModel,
    createFormOutputModel,
    listFormsInputModel,
    listFormsOutputModel,
    getFormInputModel,
    getFormOutputModel,
    getFormBySlugInputModel,
    getFormBySlugOutputModel,
    updateFormInputModel,
    updateFormOutputModel,
    deleteFormInputModel,
    deleteFormOutputModel,
    publishFormInputModel,
    publishFormOutputModel,
    exportFormInputModel,
    exportFormOutputModel,
    importFormInputModel,
    importFormOutputModel,
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
            const { title, description, folderId } = input;

            const result = await formService.createForm({
                title,
                description,
                createdBy: ctx.user.id,
                folderId: folderId ?? undefined,
            });

            return { id: result.id, slug: result.slug };
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
        .query(async ({ ctx, input }) => {
            const forms = await formService.listFormsByUserId({ userId: ctx.user.id, folderId: input?.folderId ?? undefined });
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
    getFormBySlug: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFormBySlug"),
                tags: TAGS,
            },
        })
        .input(getFormBySlugInputModel)
        .output(getFormBySlugOutputModel)
        .query(async ({ input }) => {
            const { slug } = input;
            const form = await formService.getFormBySlug({ slug });
            if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
            return formService.getFormWithFields(form.id);
        }),
    updateForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: getPath("/updateForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(updateFormInputModel)
        .output(updateFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { formId, ...data } = input;
            await formService.updateForm({ id: formId, userId: ctx.user.id, ...data });
            return { id: formId };
        }),
    deleteForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: getPath("/deleteForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(deleteFormInputModel)
        .output(deleteFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { formId } = input;
            await formService.deleteForm({ id: formId, userId: ctx.user.id });
            return { id: formId };
        }),
    exportForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/exportForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(exportFormInputModel)
        .output(exportFormOutputModel)
        .mutation(async ({ input }) => {
            const result = await formService.exportForm(input.formId);
            return result;
        }),

    importForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/importForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(importFormInputModel)
        .output(importFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formService.importForm({ data: input.data, userId: ctx.user.id });
            return result;
        }),

    publishForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: getPath("/publishForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(publishFormInputModel)
        .output(publishFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { formId, status } = input;
            const result = await formService.publishForm(formId, status, ctx.user.id);
            return result;
        }),
});
