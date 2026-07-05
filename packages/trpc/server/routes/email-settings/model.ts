import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const getEmailSettingsInputModel = z.object({
  formId: uuidSchema,
});

export const getEmailSettingsOutputModel = z.object({
  id: uuidSchema.optional(),
  formId: uuidSchema,
  creatorNotifyOnSubmission: z.boolean(),
  creatorNotifyEmail: z.string().nullable().optional(),
  creatorEmailSubject: z.string().nullable().optional(),
  creatorEmailTemplate: z.string().nullable().optional(),
  respondentConfirmationEnabled: z.boolean(),
  respondentEmailFieldId: uuidSchema.nullable().optional(),
  respondentEmailSubject: z.string().nullable().optional(),
  respondentEmailTemplate: z.string().nullable().optional(),
  weeklyDigestEnabled: z.boolean(),
});

export const updateEmailSettingsInputModel = z.object({
  formId: uuidSchema,
  creatorNotifyOnSubmission: z.boolean().optional(),
  creatorNotifyEmail: z.string().email().optional().nullable(),
  creatorEmailSubject: z.string().max(200).trim().optional(),
  creatorEmailTemplate: z.string().max(5000).trim().optional(),
  respondentConfirmationEnabled: z.boolean().optional(),
  respondentEmailFieldId: uuidSchema.optional().nullable(),
  respondentEmailSubject: z.string().max(200).trim().optional(),
  respondentEmailTemplate: z.string().max(5000).trim().optional(),
  weeklyDigestEnabled: z.boolean().optional(),
});

export const updateEmailSettingsOutputModel = getEmailSettingsOutputModel;