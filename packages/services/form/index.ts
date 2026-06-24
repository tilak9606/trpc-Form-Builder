import { db, eq, and, isNull } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

import {
    createFormInput,
    type CreateFormInputType,
    listFormsByUserIdInput,
    type ListFormsByUserIdInputType,
    updateFormInput,
    type UpdateFormInputType,
    deleteFormInput,
    type DeleteFormInputType,
    getFormBySlugInput,
    type GetFormBySlugInputType,
    formExportSchema,
    importFormInput,
    type ImportFormInputType,
} from "./model";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100);
}

function generateSlug(title: string, suffix?: string): string {
    let slug = slugify(title);
    if (!slug) slug = "untitled";
    if (suffix) slug = `${slug}-${suffix}`;
    return slug;
}

export default class FormService {
    public async createForm(payload: CreateFormInputType) {
        const data = await createFormInput.parseAsync(payload);
        const slug = data.slug || generateSlug(data.title, Date.now().toString(36));

        const result = await db
            .insert(formsTable)
            .values({
                title: data.title,
                description: data.description,
                slug,
                createdBy: data.createdBy,
                folderId: data.folderId ?? null,
            })
            .returning({
                id: formsTable.id,
                slug: formsTable.slug,
            });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the form");

        return {
            id: result[0].id,
            slug: result[0].slug,
        };
    }

    public async updateForm(payload: UpdateFormInputType) {
        const data = await updateFormInput.parseAsync(payload);

        const updateData: Record<string, any> = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.folderId !== undefined) updateData.folderId = data.folderId;
        if (data.notifyEmail !== undefined) updateData.notifyEmail = data.notifyEmail;
        if (data.notifyEmailTo !== undefined) updateData.notifyEmailTo = data.notifyEmailTo;
        if (data.themePrimaryColor !== undefined) updateData.themePrimaryColor = data.themePrimaryColor;
        if (data.themeBackgroundColor !== undefined) updateData.themeBackgroundColor = data.themeBackgroundColor;
        if (data.themeTextColor !== undefined) updateData.themeTextColor = data.themeTextColor;
        if (data.themeLabelColor !== undefined) updateData.themeLabelColor = data.themeLabelColor;
        if (data.themeFontFamily !== undefined) updateData.themeFontFamily = data.themeFontFamily;
        if (data.themeBorderRadius !== undefined) updateData.themeBorderRadius = data.themeBorderRadius;
        if (data.themeButtonText !== undefined) updateData.themeButtonText = data.themeButtonText;
        if (data.themeLogoUrl !== undefined) updateData.themeLogoUrl = data.themeLogoUrl;

        const result = await db
            .update(formsTable)
            .set(updateData)
            .where(and(eq(formsTable.id, data.id), eq(formsTable.createdBy, data.userId)))
            .returning({ id: formsTable.id });

        if (!result || result.length === 0)
            throw new Error(`Form with ID ${data.id} not found or access denied`);

        return { id: result[0]!.id };
    }

    public async deleteForm(payload: DeleteFormInputType) {
        const data = await deleteFormInput.parseAsync(payload);

        const result = await db
            .delete(formsTable)
            .where(and(eq(formsTable.id, data.id), eq(formsTable.createdBy, data.userId)))
            .returning({ id: formsTable.id });

        if (!result || result.length === 0)
            throw new Error(`Form with ID ${data.id} not found or access denied`);

        return { id: result[0]!.id };
    }

    public async publishForm(formId: string, status: "PUBLISHED" | "CLOSED", userId: string) {
        const result = await db
            .update(formsTable)
            .set({ status })
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id, status: formsTable.status });

        if (!result || result.length === 0)
            throw new Error(`Form with ID ${formId} not found or access denied`);

        return { id: result[0]!.id, status: result[0]!.status };
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const data = await listFormsByUserIdInput.parseAsync(payload);
        const conditions = [eq(formsTable.createdBy, data.userId)];
        if (data.folderId !== undefined) {
            if (data.folderId === null) {
                conditions.push(isNull(formsTable.folderId));
            } else {
                conditions.push(eq(formsTable.folderId, data.folderId));
            }
        }
        const forms = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                slug: formsTable.slug,
                status: formsTable.status,
                folderId: formsTable.folderId,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
            })
            .from(formsTable)
            .where(and(...conditions))
            .orderBy(formsTable.createdAt);
        return forms;
    }

    public async getFormById(formId: string) {
        const rows = await db
            .select()
            .from(formsTable)
            .where(eq(formsTable.id, formId));

        if (!rows || rows.length === 0) return null;
        return rows[0]!;
    }

    public async getFormBySlug(payload: GetFormBySlugInputType) {
        const data = await getFormBySlugInput.parseAsync(payload);
        const rows = await db
            .select()
            .from(formsTable)
            .where(
                and(
                    eq(formsTable.slug, data.slug),
                    eq(formsTable.status, "PUBLISHED"),
                ),
            );

        if (!rows || rows.length === 0) return null;
        return rows[0]!;
    }

    public async getFormWithFields(formIdOrSlug: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formIdOrSlug);

        const rows = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                slug: formsTable.slug,
                status: formsTable.status,
                folderId: formsTable.folderId,
                notifyEmail: formsTable.notifyEmail,
                notifyEmailTo: formsTable.notifyEmailTo,
                themePrimaryColor: formsTable.themePrimaryColor,
                themeBackgroundColor: formsTable.themeBackgroundColor,
                themeTextColor: formsTable.themeTextColor,
                themeLabelColor: formsTable.themeLabelColor,
                themeFontFamily: formsTable.themeFontFamily,
                themeBorderRadius: formsTable.themeBorderRadius,
                themeButtonText: formsTable.themeButtonText,
                themeLogoUrl: formsTable.themeLogoUrl,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,

                field_id: formFieldsTable.id,
                field_formId: formFieldsTable.formId,
                field_label: formFieldsTable.label,
                field_labelKey: formFieldsTable.labelKey,
                field_description: formFieldsTable.description,
                field_placeholder: formFieldsTable.placeholder,
                field_isRequired: formFieldsTable.isRequired,
                field_index: formFieldsTable.index,
                field_type: formFieldsTable.type,
                field_options: formFieldsTable.options,
                field_maxFileSize: formFieldsTable.maxFileSize,
                field_allowedFileTypes: formFieldsTable.allowedFileTypes,
                field_validation: formFieldsTable.validation,
                field_condition: formFieldsTable.condition,
                field_page: formFieldsTable.page,
                field_createdAt: formFieldsTable.createdAt,
                field_updatedAt: formFieldsTable.updatedAt,
            })
            .from(formsTable)
            .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
            .where(isUuid ? eq(formsTable.id, formIdOrSlug) : eq(formsTable.slug, formIdOrSlug))
            .orderBy(formFieldsTable.index);

        if (!rows || rows.length === 0) throw new Error(`Form with ID ${formIdOrSlug} not found`);

        const first = rows[0]!;

        const form: any = {
            id: first.id,
            title: first.title,
            description: first.description ?? null,
            slug: first.slug,
            status: first.status,
            folderId: first.folderId ?? null,
            notifyEmail: first.notifyEmail ?? false,
            notifyEmailTo: first.notifyEmailTo ?? null,
            themePrimaryColor: first.themePrimaryColor ?? "#3b82f6",
            themeBackgroundColor: first.themeBackgroundColor ?? "#000000",
            themeTextColor: first.themeTextColor ?? "#ffffff",
            themeLabelColor: first.themeLabelColor ?? "#ffffff",
            themeFontFamily: first.themeFontFamily ?? "Inter",
            themeBorderRadius: first.themeBorderRadius ?? "0.5rem",
            themeButtonText: first.themeButtonText ?? "Submit",
            themeLogoUrl: first.themeLogoUrl ?? null,
            createdAt: first.createdAt ? first.createdAt.toISOString() : null,
            updatedAt: first.updatedAt ? first.updatedAt.toISOString() : null,
            fields: [],
        };

        for (const r of rows) {
            if (!r.field_id) continue;

            form.fields.push({
                id: r.field_id,
                formId: r.field_formId,
                label: r.field_label,
                labelKey: r.field_labelKey,
                description: r.field_description ?? null,
                placeholder: r.field_placeholder ?? null,
                isRequired: r.field_isRequired,
                index: r.field_index!.toString(),
                type: r.field_type,
                options: r.field_options ?? [],
                maxFileSize: r.field_maxFileSize ? Number(r.field_maxFileSize) : null,
                allowedFileTypes: r.field_allowedFileTypes ?? null,
                validation: r.field_validation ?? null,
                condition: r.field_condition ?? null,
                page: r.field_page ? Number(r.field_page) : 1,
                createdAt: r.field_createdAt ? r.field_createdAt.toISOString() : null,
                updatedAt: r.field_updatedAt ? r.field_updatedAt.toISOString() : null,
            });
        }

        return form;
    }

    public async exportForm(formIdOrSlug: string) {
        const form = await this.getFormWithFields(formIdOrSlug);
        const data = {
            title: form.title,
            description: form.description ?? undefined,
            slug: form.slug,
            fields: form.fields.map((f: any) => ({
                label: f.label,
                type: f.type,
                description: f.description ?? undefined,
                placeholder: f.placeholder ?? undefined,
                isRequired: f.isRequired,
                options: f.options?.length ? f.options : undefined,
                validation: f.validation ?? undefined,
                condition: f.condition ? { ...f.condition } : undefined,
                page: f.page,
                maxFileSize: f.maxFileSize ?? undefined,
                allowedFileTypes: f.allowedFileTypes?.length ? f.allowedFileTypes : undefined,
            })),
        };
        return formExportSchema.parseAsync(data);
    }

    public async importForm(payload: ImportFormInputType) {
        const data = await importFormInput.parseAsync(payload);

        const form = await this.createForm({
            title: data.data.title,
            description: data.data.description,
            slug: data.data.slug || undefined,
            createdBy: data.userId,
        });

        const { default: FormFieldService } = await import("../form-field/index");
        const fieldSvc = new FormFieldService();

        for (const field of data.data.fields) {
            await fieldSvc.createField({
                label: field.label,
                type: field.type as any,
                formId: form.id,
                userId: data.userId,
                description: field.description,
                placeholder: field.placeholder,
                isRequired: field.isRequired ?? false,
                options: field.options,
                validation: field.validation as any,
                condition: field.condition ?? null,
                page: field.page ?? 1,
                maxFileSize: field.maxFileSize,
                allowedFileTypes: field.allowedFileTypes,
            });
        }

        return form;
    }
}
