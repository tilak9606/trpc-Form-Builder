import { db, eq, max, and } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import {
    createFieldInput,
    type CreateFieldInputType,
    updateFieldInput,
    type UpdateFieldInputType,
    deleteFieldInput,
    type DeleteFieldInputType,
    duplicateFieldInput,
    type DuplicateFieldInputType,
    reorderFieldsInput,
    type ReorderFieldsInputType,
} from "./model";

function toLabelKey(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

export default class FormFieldService {
    private async getNextIndex(formId: string): Promise<string> {
        const result = await db
            .select({ maxIndex: max(formFieldsTable.index) })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId));

        const current = result[0]?.maxIndex;
        const next = current ? Number(current) + 1 : 1;

        return next.toString();
    }

    public async verifyFormOwnership(formId: string, userId: string): Promise<void> {
        const rows = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

        if (!rows || rows.length === 0)
            throw new Error(`Form with ID ${formId} not found or access denied`);
    }

    public async createField(payload: CreateFieldInputType) {
        const data = await createFieldInput.parseAsync(payload);

        await this.verifyFormOwnership(data.formId, data.userId);

        const labelKey = toLabelKey(data.label);
        const index = await this.getNextIndex(data.formId);

        const result = await db
            .insert(formFieldsTable)
            .values({
                label: data.label,
                labelKey,
                type: data.type,
                formId: data.formId,
                description: data.description,
                placeholder: data.placeholder,
                isRequired: data.isRequired ?? false,
                options: data.options ?? [],
                maxFileSize: data.maxFileSize ? data.maxFileSize.toString() : null,
                allowedFileTypes: data.allowedFileTypes ?? null,
                validation: data.validation ?? null,
                condition: data.condition ?? null,
                page: (data.page ?? 1).toString(),
                index,
            })
            .returning({ id: formFieldsTable.id });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the field");

        return { id: result[0].id, labelKey, index };
    }

    public async updateField(payload: UpdateFieldInputType) {
        const data = await updateFieldInput.parseAsync(payload);

        await this.verifyFormOwnership(data.formId, data.userId);

        const updateData: Record<string, any> = {};
        if (data.label !== undefined) {
            updateData.label = data.label;
            updateData.labelKey = toLabelKey(data.label);
        }
        if (data.type !== undefined) updateData.type = data.type;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.placeholder !== undefined) updateData.placeholder = data.placeholder;
        if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
        if (data.options !== undefined) updateData.options = data.options;
        if (data.maxFileSize !== undefined) updateData.maxFileSize = data.maxFileSize.toString();
        if (data.allowedFileTypes !== undefined) updateData.allowedFileTypes = data.allowedFileTypes;
        if (data.validation !== undefined) updateData.validation = data.validation;
        if (data.condition !== undefined) updateData.condition = data.condition;
        if (data.page !== undefined) updateData.page = data.page.toString();

        const result = await db
            .update(formFieldsTable)
            .set(updateData)
            .where(and(eq(formFieldsTable.id, data.id), eq(formFieldsTable.formId, data.formId)))
            .returning({ id: formFieldsTable.id });

        if (!result || result.length === 0)
            throw new Error(`Field with ID ${data.id} not found`);

        return { id: result[0]!.id };
    }

    public async deleteField(payload: DeleteFieldInputType) {
        const data = await deleteFieldInput.parseAsync(payload);

        await this.verifyFormOwnership(data.formId, data.userId);

        const result = await db
            .delete(formFieldsTable)
            .where(
                and(
                    eq(formFieldsTable.id, data.id),
                    eq(formFieldsTable.formId, data.formId),
                ),
            )
            .returning({ id: formFieldsTable.id });

        if (!result || result.length === 0)
            throw new Error(`Field with ID ${data.id} not found`);

        await this.reindexFields(data.formId);

        return { id: result[0]!.id };
    }

    public async duplicateField(payload: DuplicateFieldInputType) {
        const data = await duplicateFieldInput.parseAsync(payload);

        await this.verifyFormOwnership(data.formId, data.userId);

        const fields = await db
            .select()
            .from(formFieldsTable)
            .where(and(eq(formFieldsTable.id, data.id), eq(formFieldsTable.formId, data.formId)));

        if (!fields || fields.length === 0)
            throw new Error(`Field with ID ${data.id} not found`);

        const original = fields[0]!;
        const index = await this.getNextIndex(data.formId);

        const result = await db
            .insert(formFieldsTable)
            .values({
                label: `Copy of ${original.label}`,
                labelKey: `${toLabelKey(`Copy of ${original.label}`)}`,
                type: original.type,
                formId: original.formId,
                description: original.description,
                placeholder: original.placeholder,
                isRequired: original.isRequired,
                options: original.options,
                maxFileSize: original.maxFileSize,
                allowedFileTypes: original.allowedFileTypes,
                validation: original.validation,
                condition: original.condition,
                page: original.page,
                index,
            })
            .returning({ id: formFieldsTable.id });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while duplicating the field");

        return { id: result[0].id, labelKey: `copy_of_${original.label}`, index };
    }

    public async reorderFields(payload: ReorderFieldsInputType) {
        const data = await reorderFieldsInput.parseAsync(payload);

        await this.verifyFormOwnership(data.formId, data.userId);

        await db.transaction(async (tx) => {
            for (let i = 0; i < data.fieldIds.length; i++) {
                await tx
                    .update(formFieldsTable)
                    .set({ index: (i + 1).toString() })
                    .where(
                        and(
                            eq(formFieldsTable.id, data.fieldIds[i]!),
                            eq(formFieldsTable.formId, data.formId),
                        ),
                    );
            }
        });

        return { success: true };
    }

    private async reindexFields(formId: string) {
        const fields = await db
            .select({ id: formFieldsTable.id })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(formFieldsTable.index);

        await db.transaction(async (tx) => {
            for (let i = 0; i < fields.length; i++) {
                await tx
                    .update(formFieldsTable)
                    .set({ index: (i + 1).toString() })
                    .where(eq(formFieldsTable.id, fields[i]!.id));
            }
        });
    }

    public async getFields(formId: string) {
        const result = await db
            .select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(formFieldsTable.index);

        return result.map((r) => ({
            id: r.id,
            formId: r.formId,
            label: r.label,
            labelKey: r.labelKey,
            description: r.description ?? null,
            placeholder: r.placeholder ?? null,
            isRequired: r.isRequired,
            index: r.index.toString(),
            type: r.type,
            options: r.options ?? [],
            maxFileSize: r.maxFileSize ? Number(r.maxFileSize) : null,
            allowedFileTypes: r.allowedFileTypes ?? null,
            validation: r.validation ?? null,
            condition: r.condition ?? null,
            page: r.page ? Number(r.page) : 1,
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
        }));
    }
}
