import { TRPCError } from "@trpc/server";
import { authenticatedProcedure, paymentProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { UserService } from "@repo/services";
import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../env";

import {
    createSubscriptionInputModel,
    createSubscriptionOutputModel,
    verifyPaymentInputModel,
    verifyPaymentOutputModel,
    getSubscriptionStatusOutputModel,
} from "./model";

function createRazorpayInstance() {
    const keyId = env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Payment is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.",
        });
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

const PLAN_PRICES: Record<string, { amount: number; currency: string; planId: string }> = {
    pro: { amount: 19900, currency: "INR", planId: "plan_T6XDicxtJ8sYzg" },
    enterprise: { amount: 49900, currency: "INR", planId: "plan_T6XH4MOa1t7BNk" },
};

const PLAN_ID_TO_NAME: Record<string, string> = {
    "plan_T6XDicxtJ8sYzg": "pro",
    "plan_T6XH4MOa1t7BNk": "enterprise",
};

const TAGS = ["Payment"];
const getPath = generatePath("/payment");
const userService = new UserService();

export const paymentRouter = router({
    // Bug #3 fix: was `authenticatedProcedure`, now `paymentProcedure`, which adds a 10
    // requests/60s-per-user rate limit (same limit the dead `paymentRateLimiter` in
    // server.ts was supposed to provide, now actually enforced).
    createSubscription: paymentProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createSubscription"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createSubscriptionInputModel)
        .output(createSubscriptionOutputModel)
        .mutation(async ({ input, ctx }) => {
            const razorpay = createRazorpayInstance();
            const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
            const { plan } = input;
            const planConfig = PLAN_PRICES[plan];
            if (!planConfig) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan" });
            }

            const user = await userService.getUserWithRazorpayInfo(ctx.user.id);
            let customerId = user.razorpayCustomerId;

            if (!customerId) {
                try {
                    const customer = await razorpay.customers.create({
                        name: user.name,
                        email: user.email,
                        notes: { userId: ctx.user.id },
                    });
                    customerId = customer.id;
                    await userService.setRazorpayCustomerId(ctx.user.id, customerId);
                } catch (err: any) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: `Failed to create Razorpay customer: ${err.message || err}`,
                    });
                }
            }

            let subscription;
            try {
                subscription = await razorpay.subscriptions.create({
                    plan_id: planConfig.planId,
                    customer_id: customerId,
                    total_count: 12,
                    notes: { userId: ctx.user.id, plan },
                } as any);
            } catch (err: any) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create Razorpay subscription: ${err.message || err}`,
                });
            }

            const status = subscription.status === "created" ? "pending" : subscription.status;
            await userService.setRazorpaySubscription(ctx.user.id, subscription.id, status);

            return {
                subscriptionId: subscription.id,
                razorpayKeyId: keyId,
                amount: planConfig.amount,
                currency: planConfig.currency,
            } as any;
        }),

    verifyPayment: paymentProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/verifyPayment"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(verifyPaymentInputModel)
        .output(verifyPaymentOutputModel)
        .mutation(async ({ input, ctx }) => {
            const razorpay = createRazorpayInstance();
            const keySecret = process.env.RAZORPAY_KEY_SECRET!;
            const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = input;

            const body = razorpayPaymentId + "|" + razorpaySubscriptionId;
            const expectedSignature = crypto
                .createHmac("sha256", keySecret)
                .update(body)
                .digest("hex");

            const sigBuffer = Buffer.from(expectedSignature, "hex");
            const providedBuffer = Buffer.from(razorpaySignature, "hex");

            if (sigBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(sigBuffer, providedBuffer)) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid payment signature" });
            }

            const subscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId);
            const planId = subscription.plan_id;
            const plan = PLAN_ID_TO_NAME[planId];
            if (!plan) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown subscription plan" });
            }

            const status = subscription.status === "created" ? "pending" : subscription.status;
            await userService.setRazorpaySubscription(ctx.user.id, razorpaySubscriptionId, status);
            await userService.updateUserPlan(ctx.user.id, plan as any);

            return { success: true, plan } as any;
        }),

    // Read-only — left on authenticatedProcedure, no rate limit needed.
    getSubscriptionStatus: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/subscriptionStatus"),
                tags: TAGS,
                protect: true,
            },
        })
        .output(getSubscriptionStatusOutputModel)
        .query(async ({ ctx }) => {
            const razorpay = createRazorpayInstance();
            const user = await userService.getUserWithRazorpayInfo(ctx.user.id);

            let currentPeriodEnd: string | null = null;

            if (user.razorpaySubscriptionId) {
                try {
                    const subscription = await razorpay.subscriptions.fetch(user.razorpaySubscriptionId);
                    currentPeriodEnd = subscription.current_end
                        ? new Date(subscription.current_end * 1000).toISOString()
                        : null;
                } catch {
                    // Subscription might have been cancelled or not found
                }
            }

            return {
                plan: user.plan || "free",
                status: user.subscriptionStatus || "inactive",
                subscriptionId: user.razorpaySubscriptionId || null,
                currentPeriodEnd,
            } as any;
        }),
});

export default paymentRouter;
