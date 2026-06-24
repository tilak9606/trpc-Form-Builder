import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formFieldService } from "@repo/services";

import {
    createFieldInputModel,
    createFieldOutputModel,
    getFieldsInputModel,
    getFieldsOutputModel,
    updateFieldInputModel,
    updateFieldOutputModel,
    deleteFieldInputModel,
    deleteFieldOutputModel,
    duplicateFieldInputModel,
    duplicateFieldOutputModel,
    reorderFieldsInputModel,
    reorderFieldsOutputModel,
} from "./model";

const TAGS = ["FormField"];
const getPath = generatePath("/form-field");

export const formFieldRouter = router({
    createField: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFieldInputModel)
        .output(createFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { label, type, formId, description, placeholder, isRequired, options, validation, condition, maxFileSize, allowedFileTypes, page } = input;

            const result = await formFieldService.createField({
                label,
                type,
                formId,
                userId: ctx.user.id,
                description,
                placeholder,
                isRequired,
                options,
                validation,
                condition,
                page,
                maxFileSize,
                allowedFileTypes,
            });

            return result;
        }),

    updateField: authenticatedProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: getPath("/updateField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(updateFieldInputModel)
        .output(updateFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formFieldService.updateField({ ...input, userId: ctx.user.id });
            return result;
        }),

    deleteField: authenticatedProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: getPath("/deleteField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(deleteFieldInputModel)
        .output(deleteFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formFieldService.deleteField({ ...input, userId: ctx.user.id });
            return result;
        }),

    duplicateField: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/duplicateField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(duplicateFieldInputModel)
        .output(duplicateFieldOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formFieldService.duplicateField({ ...input, userId: ctx.user.id });
            return result;
        }),

    reorderFields: authenticatedProcedure
        .meta({
            openapi: {
                method: "PATCH",
                path: getPath("/reorderFields"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(reorderFieldsInputModel)
        .output(reorderFieldsOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formFieldService.reorderFields({ ...input, userId: ctx.user.id });
            return result;
        }),

    getFields: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFields"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getFieldsInputModel)
        .output(getFieldsOutputModel)
        .query(async ({ input, ctx }) => {
            const { formId } = input;
            await formFieldService.verifyFormOwnership(formId, ctx.user.id);
            const result = await formFieldService.getFields(formId);
            return result;
        }),
});
