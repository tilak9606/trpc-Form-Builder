import { z } from "zod";

export const submissionValue = z.object({
    fieldId: z.uuid().describe("UUID of the form field"),
    value: z.string().describe("Submitted value as string"),
});

export const createSubmissionInput = z.object({
    formId: z.string().describe("UUID of the form"),
    values: z.array(submissionValue).describe("Array of field/value pairs"),
    respondentEmail: z.string().email().optional().describe("Respondent email address"),
    respondentIp: z.string().optional().describe("Respondent IP address"),
    deviceFingerprint: z.string().optional().describe("Device fingerprint for rate limiting"),
});

export const createSubmissionOutput = z.object({
    id: z.string().describe("ID of the created submission"),
    createdAt: z.string().nullable().describe("Creation timestamp"),
});

export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;
export type CreateSubmissionOutputType = z.infer<typeof createSubmissionOutput>;

export const exportSubmissionsInput = z.object({
    formId: z.string().describe("UUID of the form"),
    format: z.enum(["csv"]).default("csv").describe("Export format"),
    userId: z.string().describe("ID of the user exporting submissions"),
});

export type ExportSubmissionsInputType = z.infer<typeof exportSubmissionsInput>;

export const getAnalyticsInput = z.object({
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user requesting analytics"),
});

export type GetAnalyticsInputType = z.infer<typeof getAnalyticsInput>;

export const deleteSubmissionInput = z.object({
    submissionId: z.string().describe("UUID of the submission"),
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user deleting the submission"),
});

export type DeleteSubmissionInputType = z.infer<typeof deleteSubmissionInput>;

export const getSubmissionsByFormIdInput = z.object({
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user"),
    page: z.number().min(1).default(1).optional(),
    limit: z.number().min(1).max(100).default(20).optional(),
    search: z.string().optional(),
});

export type GetSubmissionsByFormIdInputType = z.infer<typeof getSubmissionsByFormIdInput>;

export const getSubmissionByIdInput = z.object({
    submissionId: z.string().describe("UUID of the submission"),
    formId: z.string().describe("UUID of the form"),
    userId: z.string().describe("ID of the user"),
});

export type GetSubmissionByIdInputType = z.infer<typeof getSubmissionByIdInput>;

export const trackEventInput = z.object({
    formId: z.string().describe("UUID of the form"),
    eventType: z.enum(["view", "start", "submit"]).describe("Type of analytics event"),
    sessionId: z.string().optional(),
    deviceFingerprint: z.string().optional(),
    respondentIp: z.string().optional(),
});

export type TrackEventInputType = z.infer<typeof trackEventInput>;
