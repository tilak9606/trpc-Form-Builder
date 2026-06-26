import { z } from "zod";

export const createSubscriptionInputModel = z.object({
    plan: z.enum(["pro", "enterprise"]).describe("Plan to subscribe to"),
});

export const createSubscriptionOutputModel = z.object({
    subscriptionId: z.string().describe("Razorpay subscription ID"),
    razorpayKeyId: z.string().describe("Razorpay key ID for frontend checkout"),
    amount: z.number().describe("Amount in paise"),
    currency: z.string().describe("Currency code"),
});

export const verifyPaymentInputModel = z.object({
    razorpayPaymentId: z.string().describe("Razorpay payment ID"),
    razorpaySubscriptionId: z.string().describe("Razorpay subscription ID"),
    razorpaySignature: z.string().describe("Razorpay signature for verification"),
});

export const verifyPaymentOutputModel = z.object({
    success: z.boolean(),
    plan: z.string(),
});

export const getSubscriptionStatusOutputModel = z.object({
    plan: z.string(),
    status: z.string(),
    subscriptionId: z.string().nullable(),
    currentPeriodEnd: z.string().nullable(),
});
