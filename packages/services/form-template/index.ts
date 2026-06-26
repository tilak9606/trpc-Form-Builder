import { db, eq, and } from "@repo/database";
import { formTemplatesTable } from "@repo/database/models/form-template";
import FormService from "../form/index";
import FormFieldService from "../form-field/index";
import {
    createTemplateInput,
    type CreateTemplateInputType,
    listTemplatesInput,
    deleteTemplateInput,
    type DeleteTemplateInputType,
    createFormFromTemplateInput,
    type CreateFormFromTemplateInputType,
} from "./model";

export default class FormTemplateService {
    public async createTemplate(payload: CreateTemplateInputType) {
        const data = await createTemplateInput.parseAsync(payload);

        const result = await db
            .insert(formTemplatesTable)
            .values({
                title: data.title,
                description: data.description ?? null,
                fields: data.fields,
                createdBy: data.userId,
            })
            .returning({ id: formTemplatesTable.id });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the template");

        return { id: result[0].id };
    }

    public async listTemplates() {
        await listTemplatesInput.parseAsync(undefined);

        const rows = await db
            .select({
                id: formTemplatesTable.id,
                title: formTemplatesTable.title,
                description: formTemplatesTable.description,
                fields: formTemplatesTable.fields,
                createdAt: formTemplatesTable.createdAt,
            })
            .from(formTemplatesTable)
            .orderBy(formTemplatesTable.createdAt);

        return rows.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description ?? null,
            fieldsCount: (r.fields as any[])?.length ?? 0,
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
        }));
    }

    public async deleteTemplate(payload: DeleteTemplateInputType) {
        const data = await deleteTemplateInput.parseAsync(payload);

        const result = await db
            .delete(formTemplatesTable)
            .where(and(eq(formTemplatesTable.id, data.id), eq(formTemplatesTable.createdBy, data.userId)))
            .returning({ id: formTemplatesTable.id });

        if (!result || result.length === 0)
            throw new Error("Template not found or access denied");

        return { id: data.id };
    }

    public async createFormFromTemplate(payload: CreateFormFromTemplateInputType) {
        const data = await createFormFromTemplateInput.parseAsync(payload);

        const templates = await db
            .select()
            .from(formTemplatesTable)
            .where(eq(formTemplatesTable.id, data.templateId));

        if (!templates || templates.length === 0 || !templates[0])
            throw new Error("Template not found");

        const template = templates[0];
        const formSvc = new FormService();
        const fieldSvc = new FormFieldService();

        const form = await formSvc.createForm({
            title: data.title ?? template.title,
            description: template.description ?? undefined,
            createdBy: data.userId,
        });

        const fields = (template.fields as any[]) ?? [];
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            await fieldSvc.createField({
                formId: form.id,
                userId: data.userId,
                label: f.label,
                type: f.type,
                description: f.description,
                placeholder: f.placeholder,
                isRequired: f.isRequired ?? false,
                options: f.options,
                validation: f.validation,
                page: f.page ?? 1,
            });
        }

        return { id: form.id, slug: form.slug };
    }
}
