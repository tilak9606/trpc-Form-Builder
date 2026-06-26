import { z } from "zod";

export const getUserPlanOutputModel = z.object({
  plan: z.string().describe("Current user plan (free, pro, enterprise)"),
  formCount: z.number().describe("Number of forms created by user"),
  formLimit: z.number().describe("Maximum forms allowed on current plan (-1 = unlimited)"),
});

export const updateUserPlanInputModel = z.object({
  plan: z.enum(["free", "pro", "enterprise"]).describe("New plan for the user"),
});

export const updateUserPlanOutputModel = z.object({
  id: z.string(),
  plan: z.string(),
});
