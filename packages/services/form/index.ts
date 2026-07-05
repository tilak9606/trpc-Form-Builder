import { db, eq, and, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionsTable } from "@repo/database/models/form-submission";
import { formAnalyticsEventsTable } from "@repo/database/models/form-analytics-event";
import { usersTable } from "@repo/database/models/user";
import { TRPCError } from "@trpc/server";
import { SlugService } from "../slug";
const slugService = new SlugService();
import { PLAN_LIMITS, type UserPlan } from "@repo/database/constants/user-plan";

export default class FormService {
    public async getById(formId: string, userId: string) {
        const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId)).limit(1);

        if (!form) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        if (form.deletedAt !== null) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        if (form.createdBy !== userId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        return form;
    }

    public async getByIdWithFields(formId: string, userId: string) {
        const form = await db.query.formsTable.findFirst({
            where: eq(formsTable.id, formId),
            with: {
                fields: {
                    orderBy: (fields: any, { asc }: any) => [asc(fields.index)],
                },
            },
        });

        if (!form) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        if (form.deletedAt !== null) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        if (form.createdBy !== userId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        return form;
    }

    // Bug #4 fix: previously did a plain `select()` from `formsTable`, which has no
    // submission/view/start columns at all — the router was defaulting every one of these
    // to 0 via `?? 0`, so the dashboard permanently showed zero for every form's stats.
    // This now aggregates real counts from form_submissions and form_analytics_events, and
    // computes weeklySubmissions instead of returning the hardcoded 0 that used to live in
    // the router.
    public async list(userId: string, folderId?: string) {
        const filters = [eq(formsTable.createdBy, userId), sql`${formsTable.deletedAt} IS NULL`];
        if (folderId) filters.push(eq(formsTable.folderId, folderId));

        const rows = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                slug: formsTable.slug,
                status: formsTable.status,
                visibility: formsTable.visibility,
                folderId: formsTable.folderId,
                coverImageUrl: formsTable.coverImageUrl,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
                submissionCount: sql<number>`count(distinct ${formSubmissionsTable.id})`,
                totalViews: sql<number>`count(*) filter (where ${formAnalyticsEventsTable.eventType} = 'view')`,
                totalStarts: sql<number>`count(*) filter (where ${formAnalyticsEventsTable.eventType} = 'start')`,
            })
            .from(formsTable)
            .leftJoin(formSubmissionsTable, eq(formSubmissionsTable.formId, formsTable.id))
            .leftJoin(formAnalyticsEventsTable, eq(formAnalyticsEventsTable.formId, formsTable.id))
            .where(and(...filters))
            .groupBy(formsTable.id)
            .orderBy(sql`${formsTable.createdAt} DESC`);

        const forms = rows.map((r) => ({
            ...r,
            submissionCount: Number(r.submissionCount ?? 0),
            totalViews: Number(r.totalViews ?? 0),
            totalStarts: Number(r.totalStarts ?? 0),
        }));

        const [{ weeklySubmissions } = { weeklySubmissions: 0 }] = await db
            .select({ weeklySubmissions: sql<number>`count(*)` })
            .from(formSubmissionsTable)
            .innerJoin(formsTable, eq(formsTable.id, formSubmissionsTable.formId))
            .where(
                and(
                    eq(formsTable.createdBy, userId),
                    sql`${formsTable.deletedAt} IS NULL`,
                    sql`${formSubmissionsTable.createdAt} >= now() - interval '7 days'`,
                ),
            );

        return { forms, weeklySubmissions: Number(weeklySubmissions ?? 0) };
    }

    public async create(userId: string, data: { title: string; description?: string; themeId?: string; folderId?: string }) {
        const slug = await slugService.generateSlug(data.title);

        try {
            return await db.transaction(async (tx) => {
                const [user] = await tx
                    .select({ plan: usersTable.plan })
                    .from(usersTable)
                    .where(eq(usersTable.id, userId))
                    .limit(1);

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
                }

                const plan = (user.plan || "free") as UserPlan;
                const planLimit = PLAN_LIMITS[plan]?.formLimit ?? PLAN_LIMITS.free.formLimit;

                if (planLimit !== -1) {
                    const countResult = await tx
                        .select({ count: sql<number>`count(*)` })
                        .from(formsTable)
                        .where(and(eq(formsTable.createdBy, userId), sql`${formsTable.deletedAt} IS NULL`));

                    const count = countResult[0]?.count ?? 0;

                    if (count >= planLimit) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Form limit reached for your plan. Please upgrade to create more forms.",
                        });
                    }
                }

                const formId = crypto.randomUUID();

                const [newForm] = await tx
                    .insert(formsTable)
                    .values({
                        id: formId,
                        createdBy: userId,
                        title: data.title,
                        description: data.description,
                        slug,
                        themeId: data.themeId,
                        folderId: data.folderId,
                        status: "draft",
                    })
                    .returning();

                return newForm;
            });
        } catch (error: any) {
            if (error.code === "23505") {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Slug is already taken. Please try another one.",
                });
            }
            throw error;
        }
    }

    public async update(
        userId: string,
        formId: string,
        data: {
            title?: string;
            description?: string;
            slug?: string;
            themeId?: string;
            coverImageUrl?: string | null;
            metaTitle?: string;
            metaDescription?: string;
            visibility?: "public" | "unlisted" | "private";
            settings?: Record<string, any>;
        }
    ) {
        const form = await this.getById(formId, userId);

        if (data.slug && data.slug !== form.slug) {
            const slugValidation = slugService.validateCustomSlug(data.slug);
            if (!slugValidation.valid) {
                throw new TRPCError({ code: "BAD_REQUEST", message: slugValidation.error });
            }
            const isAvailable = await slugService.checkAvailability(data.slug);
            if (!isAvailable) {
                throw new TRPCError({ code: "CONFLICT", message: "This slug is already taken" });
            }
        }

        try {
            const [updatedForm] = await db
                .update(formsTable)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(formsTable.id, formId))
                .returning();

            return updatedForm;
        } catch (error: any) {
            if (error.code === "23505") {
                throw new TRPCError({ code: "CONFLICT", message: "This slug is already taken" });
            }
            throw error;
        }
    }

    public async delete(userId: string, formId: string) {
        await this.getById(formId, userId);

        await db.update(formsTable).set({ deletedAt: new Date() }).where(eq(formsTable.id, formId));
    }

    public async publish(userId: string, formId: string) {
        const form = await this.getById(formId, userId);

        const [fieldCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId));

        if (!fieldCount || Number(fieldCount.count) === 0) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "Cannot publish a form with no fields. Please add at least one field first.",
            });
        }

        const [updatedForm] = await db
            .update(formsTable)
            .set({
                status: "published",
                publishedAt: form.publishedAt ?? new Date(),
                updatedAt: new Date(),
            })
            .where(eq(formsTable.id, formId))
            .returning();

        return updatedForm;
    }

    public async unpublish(userId: string, formId: string) {
        await this.getById(formId, userId);

        const [updatedForm] = await db
            .update(formsTable)
            .set({
                status: "draft",
                updatedAt: new Date(),
            })
            .where(eq(formsTable.id, formId))
            .returning();

        return updatedForm;
    }

    public async archive(userId: string, formId: string) {
        await this.getById(formId, userId);

        const [updatedForm] = await db
            .update(formsTable)
            .set({
                status: "archived",
                updatedAt: new Date(),
            })
            .where(eq(formsTable.id, formId))
            .returning();

        return updatedForm;
    }

    public async clone(userId: string, formId: string) {
        const originalForm = await this.getById(formId, userId);

        const [user] = await db
            .select({ plan: usersTable.plan })
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1);

        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const plan = (user.plan || "free") as UserPlan;
        const planLimit = PLAN_LIMITS[plan]?.formLimit ?? PLAN_LIMITS.free.formLimit;

        if (planLimit !== -1) {
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(formsTable)
                .where(and(eq(formsTable.createdBy, userId), sql`${formsTable.deletedAt} IS NULL`));

            const count = countResult[0]?.count ?? 0;

            if (count >= planLimit) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Form limit reached for your plan. Please upgrade to create more forms.",
                });
            }
        }

        return await db.transaction(async (tx) => {
            const newSlug = await slugService.generateSlug(`${originalForm.title} Copy`);
            const newFormId = crypto.randomUUID();

            const [newForm] = await tx
                .insert(formsTable)
                .values({
                    id: newFormId,
                    createdBy: userId,
                    title: `${originalForm.title} (Copy)`,
                    description: originalForm.description,
                    slug: newSlug,
                    themeId: originalForm.themeId,
                    folderId: originalForm.folderId,
                    status: "draft",
                    metaTitle: originalForm.metaTitle,
                    metaDescription: originalForm.metaDescription,
                    visibility: originalForm.visibility,
                    settings: originalForm.settings,
                })
                .returning();

            const originalFields = await tx
                .select()
                .from(formFieldsTable)
                .where(eq(formFieldsTable.formId, formId));

            if (originalFields.length > 0) {
                const newFields = originalFields.map((oldField) => ({
                    id: crypto.randomUUID(),
                    formId: newFormId,
                    type: oldField.type,
                    label: oldField.label,
                    labelKey: oldField.labelKey,
                    description: oldField.description,
                    placeholder: oldField.placeholder,
                    isRequired: oldField.isRequired,
                    index: oldField.index,
                    page: oldField.page,
                    options: oldField.options,
                    validation: oldField.validation,
                    condition: oldField.condition,
                    maxFileSize: oldField.maxFileSize,
                    allowedFileTypes: oldField.allowedFileTypes,
                }));
                await tx.insert(formFieldsTable).values(newFields);
            }

            return newForm;
        });
    }

    public async getPublicBySlug(
        slug: string,
        verifyToken?: (formId: string) => Promise<boolean> | boolean,
    ) {
        const form = await db.query.formsTable.findFirst({
            where: eq(formsTable.slug, slug),
            with: {
                fields: {
                    orderBy: (fields: any, { asc }: any) => [asc(fields.index)],
                },
            },
        });

        if (!form) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        const { resolvePublicForm } = await import("./access-control");
        return resolvePublicForm(form, verifyToken);
    }

    public async setFormPassword(userId: string, formId: string, password?: string) {
        const form = await this.getById(formId, userId);

        let passwordHash = null;
        if (password) {
            const bcrypt = await import("bcryptjs");
            passwordHash = await bcrypt.hash(password, 10);
        }

        await db
            .update(formsTable)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(formsTable.id, formId));
    }

    public async validatePassword(slug: string, password: string): Promise<{ token: string }> {
        const [form] = await db
            .select({
                id: formsTable.id,
                passwordHash: formsTable.passwordHash,
                status: formsTable.status,
                deletedAt: formsTable.deletedAt,
            })
            .from(formsTable)
            .where(eq(formsTable.slug, slug))
            .limit(1);

        if (!form || form.deletedAt !== null || form.status !== "published") {
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        if (!form.passwordHash) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Form is not password protected" });
        }

        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(password, form.passwordHash);
        if (!isValid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
        }

        const { signFormPasswordToken } = await import("../auth/form-token");
        const token = signFormPasswordToken(form.id);

        return { token };
    }
}
