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
