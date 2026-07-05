import { z } from "zod";

export const submissionValueModel = z.object({
    fieldId: z.uuid(),
    value: z.string(),
});

export const createSubmissionInputModel = z.object({
    formId: z.string(),
    values: z.array(submissionValueModel),
    respondentEmail: z.string().email().optional(),
    deviceFingerprint: z.string().optional(),
});

export const createSubmissionOutputModel = z.object({
    id: z.string(),
    createdAt: z.string().nullable(),
});

export const getSubmissionsByFormIdInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    page: z.number().min(1).default(1).optional(),
    limit: z.number().min(1).max(100).default(20).optional(),
    search: z.string().optional(),
});

export const getSubmissionsByFormIdOutputModel = z.object({
    submissions: z.array(
        z.object({
            id: z.string(),
            formId: z.uuid().nullable(),
            respondentEmail: z.string().nullable(),
            respondentIp: z.string().nullable(),
            values: z.array(
                z.object({
                    fieldId: z.uuid(),
                    value: z.string(),
                }),
            ),
            createdAt: z.string().nullable(),
        }),
    ),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const getSubmissionByIdInputModel = z.object({
    submissionId: z.string().describe("UUID of the submission"),
    formId: z.string().describe("UUID of the form"),
});

export const getSubmissionByIdOutputModel = z.object({
    id: z.string(),
    formId: z.string().nullable(),
    respondentEmail: z.string().nullable(),
    respondentIp: z.string().nullable(),
    values: z.array(
        z.object({
            fieldId: z.string(),
            value: z.string(),
        }),
    ),
    createdAt: z.string().nullable(),
});

export const exportSubmissionsInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    format: z.enum(["csv"]).default("csv"),
});

export const exportSubmissionsOutputModel = z.object({
    csv: z.string(),
});

export const getAnalyticsInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
});

export const dailySubmissionModel = z.object({
    date: z.string(),
    count: z.number(),
});

export const fieldBreakdownModel = z.object({
    value: z.string(),
    count: z.number(),
});

export const fieldAnalyticsModel = z.object({
    fieldId: z.string(),
    label: z.string(),
    type: z.string(),
    totalResponses: z.number(),
    breakdown: z.array(fieldBreakdownModel),
});

export const getAnalyticsOutputModel = z.object({
    totalSubmissions: z.number(),
    totalViews: z.number(),
    totalStarts: z.number(),
    completionRate: z.number(),
    dailySubmissions: z.array(dailySubmissionModel),
    dailyViews: z.array(dailySubmissionModel),
    dailyStarts: z.array(dailySubmissionModel),
    fieldAnalytics: z.array(fieldAnalyticsModel),
});

export const trackEventInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    eventType: z.enum(["view", "start", "submit"]).describe("Type of analytics event"),
    sessionId: z.string().optional(),
    deviceFingerprint: z.string().optional(),
});

export const trackEventOutputModel = z.object({
    success: z.boolean(),
});

export const deleteSubmissionInputModel = z.object({
    submissionId: z.string().describe("UUID of the submission"),
    formId: z.string().describe("UUID of the form"),
});

export const deleteSubmissionOutputModel = z.object({
    success: z.boolean(),
});

export type CreateSubmissionInputModel = z.infer<typeof createSubmissionInputModel>;
export type CreateSubmissionOutputModel = z.infer<typeof createSubmissionOutputModel>;
export type GetSubmissionsByFormIdInputModel = z.infer<typeof getSubmissionsByFormIdInputModel>;
export type GetSubmissionsByFormIdOutputModel = z.infer<typeof getSubmissionsByFormIdOutputModel>;
