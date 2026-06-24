import { db, eq, count, and, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionsTable } from "@repo/database/models/form-submission";
import { sendEmail } from "../email/index";
import { checkRateLimit } from "../rate-limiter/index";
import {
    createSubmissionInput,
    type CreateSubmissionInputType,
    exportSubmissionsInput,
    type ExportSubmissionsInputType,
    getAnalyticsInput,
    type GetAnalyticsInputType,
} from "./model";

export default class FormSubmissionService {
    private async verifyFormOwnership(formId: string, userId: string): Promise<void> {
        const rows = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

        if (!rows || rows.length === 0)
            throw new Error(`Form with ID ${formId} not found or access denied`);
    }

    public async createSubmission(payload: CreateSubmissionInputType) {
        const data = await createSubmissionInput.parseAsync(payload);

        // Rate limiting by IP (+ device fingerprint for extra granularity)
        const rateLimitKey = data.deviceFingerprint
            ? `${data.formId}:${data.respondentIp || "unknown"}:${data.deviceFingerprint}`
            : `${data.formId}:${data.respondentIp || "unknown"}`;
        const { allowed } = checkRateLimit(rateLimitKey);
        if (!allowed) throw new Error("Too many submissions. Please try again later.");

        const values: Record<string, any> = { formId: data.formId, values: data.values, respondentIp: data.respondentIp ?? null };
        if (data.respondentEmail) values.respondentEmail = data.respondentEmail;

        const result = await db
            .insert(formSubmissionsTable)
            .values(values)
            .returning({ id: formSubmissionsTable.id, createdAt: formSubmissionsTable.createdAt });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the submission");

        const submission = {
            id: result[0].id,
            createdAt: result[0].createdAt ? result[0].createdAt.toISOString() : null,
        };

        // Fire webhooks
        const { default: WebhookService } = await import("../webhook/index");
        const webhookSvc = new WebhookService();
        webhookSvc.triggerWebhooks(data.formId, submission).catch(() => {});

        // Send email notification if configured
        try {
            const formRows = await db
                .select({ title: formsTable.title, notifyEmail: formsTable.notifyEmail, notifyEmailTo: formsTable.notifyEmailTo })
                .from(formsTable)
                .where(eq(formsTable.id, data.formId));

            const form = formRows[0];
            if (form?.notifyEmail && form?.notifyEmailTo) {
                await sendEmail({
                    to: form.notifyEmailTo,
                    subject: `New submission: ${form.title}`,
                    html: `<p>A new submission was received for <strong>${form.title}</strong>.</p><p>View it at: <a href="${process.env.WEB_URL || "http://localhost:3000"}/dashboard/forms/${data.formId}/submissions">Submissions page</a></p>`,
                });
            }
        } catch {
            // email failure should not block submission
        }

        return submission;
    }

    public async getSubmissionsByFormId(formId: string, userId: string) {
        await this.verifyFormOwnership(formId, userId);

        const rows = await db
            .select({
                id: formSubmissionsTable.id,
                formId: formSubmissionsTable.formId,
                respondentEmail: formSubmissionsTable.respondentEmail,
                values: formSubmissionsTable.values,
                createdAt: formSubmissionsTable.createdAt,
                updatedAt: formSubmissionsTable.updatedAt,
            })
            .from(formSubmissionsTable)
            .where(eq(formSubmissionsTable.formId, formId))
            .orderBy(formSubmissionsTable.createdAt);

        return rows.map((r) => ({
            id: r.id,
            formId: r.formId,
            respondentEmail: r.respondentEmail ?? null,
            values: r.values ?? [],
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
        }));
    }

    public async exportSubmissions(payload: ExportSubmissionsInputType) {
        const data = await exportSubmissionsInput.parseAsync(payload);
        await this.verifyFormOwnership(data.formId, data.userId);

        const submissions = await this.getSubmissionsByFormId(data.formId, data.userId);

        if (submissions.length === 0) return { csv: "No submissions" };

        const headers = ["ID", "Submitted At", "Respondent Email"];
        const rows = submissions.map((sub) => {
            const fieldValues: Record<string, string> = {};
            for (const v of sub.values ?? []) {
                fieldValues[v.fieldId] = v.value;
            }
            return {
                id: sub.id,
                createdAt: sub.createdAt ?? "",
                respondentEmail: sub.respondentEmail ?? "",
                ...fieldValues,
            };
        });

        const allFieldIds = new Set<string>();
        for (const r of rows) {
            for (const key of Object.keys(r)) {
                if (!headers.includes(key) && key !== "id" && key !== "createdAt" && key !== "respondentEmail") {
                    allFieldIds.add(key);
                }
            }
        }

        const csvHeaders = [...headers, ...Array.from(allFieldIds)];
        const csvRows = rows.map((r: any) =>
            csvHeaders.map((h) => {
                const val = r[h] ?? "";
                const escaped = String(val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(","),
        );

        const csv = [csvHeaders.join(","), ...csvRows].join("\n");
        return { csv };
    }

    public async getAnalytics(payload: GetAnalyticsInputType) {
        const data = await getAnalyticsInput.parseAsync(payload);
        await this.verifyFormOwnership(data.formId, data.userId);

        const totalSubmissions = await db
            .select({ value: count() })
            .from(formSubmissionsTable)
            .where(eq(formSubmissionsTable.formId, data.formId));

        const dailyRows = await db.execute(sql`
            SELECT date_trunc('day', created_at)::date as date, count(*)::int as count
            FROM form_submissions
            WHERE form_id = ${data.formId}
            GROUP BY 1
            ORDER BY 1
        `);

        const dailySubmissions = dailyRows.rows.map((r: any) => ({
            date: r.date,
            count: r.count,
        }));

        const fields = await db
            .select({ id: formFieldsTable.id, label: formFieldsTable.label, type: formFieldsTable.type, options: formFieldsTable.options })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, data.formId))
            .orderBy(formFieldsTable.index);

        const submissionRows = await db
            .select({ values: formSubmissionsTable.values })
            .from(formSubmissionsTable)
            .where(eq(formSubmissionsTable.formId, data.formId));

        const allValues: { fieldId: string; value: string }[] = [];
        for (const row of submissionRows) {
            if (Array.isArray(row.values)) {
                for (const v of row.values as any[]) {
                    allValues.push({ fieldId: v.fieldId, value: v.value });
                }
            }
        }

        const fieldAnalytics = fields.map((f) => {
            const fieldValues = allValues.filter((v) => v.fieldId === f.id).map((v) => v.value);
            const isCategorical = f.type === "SELECT" || f.type === "MULTI_SELECT" || f.type === "YES_NO";
            const breakdown = isCategorical
                ? Object.entries(
                    fieldValues.reduce<Record<string, number>>((acc, v) => {
                        acc[v] = (acc[v] || 0) + 1;
                        return acc;
                    }, {}),
                ).map(([value, count]) => ({ value, count }))
                : [];

            return {
                fieldId: f.id,
                label: f.label,
                type: f.type,
                totalResponses: fieldValues.length,
                breakdown,
            };
        });

        return {
            totalSubmissions: Number(totalSubmissions[0]?.value ?? 0),
            dailySubmissions,
            fieldAnalytics,
        };
    }
}
