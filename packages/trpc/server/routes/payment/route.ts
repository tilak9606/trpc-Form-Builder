import { TRPCError } from "@trpc/server";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import Razorpay from "razorpay";
import crypto from "crypto";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";

import {
    createSubscriptionInputModel,
    createSubscriptionOutputModel,
    verifyPaymentInputModel,
    verifyPaymentOutputModel,
    getSubscriptionStatusOutputModel,
} from "./model";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLAN_PRICES: Record<string, { amount: number; currency: string; planId: string }> = {
    pro: { amount: 1900, currency: "INR", planId: "plan_Pro_Monthly" },
    enterprise: { amount: 4900, currency: "INR", planId: "plan_Enterprise_Monthly" },
};

const TAGS = ["Payment"];
const getPath = generatePath("/payment");

export const paymentRouter = router({
    createSubscription: authenticatedProcedure
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
            const { plan } = input;
            const planConfig = PLAN_PRICES[plan];
            if (!planConfig) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan" });
            }

            const user = await db.select().from(usersTable).where(eq(usersTable.id, ctx.user.id));
            if (!user.length) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            let customerId = user[0]!.razorpayCustomerId;

            if (!customerId) {
                const customer = await razorpay.customers.create({
                    name: user[0]!.name,
                    email: user[0]!.email,
                    notes: { userId: ctx.user.id },
                });
                customerId = customer.id;
                await db.update(usersTable)
                    .set({ razorpayCustomerId: customerId })
                    .where(eq(usersTable.id, ctx.user.id));
            }

            const subscription = await razorpay.subscriptions.create({
                plan_id: planConfig.planId,
                customer_id: customerId,
                total_count: 12,
                notes: { userId: ctx.user.id, plan },
            });

            await db.update(usersTable)
                .set({
                    razorpaySubscriptionId: subscription.id,
                    subscriptionStatus: subscription.status,
                })
                .where(eq(usersTable.id, ctx.user.id));

            return {
                subscriptionId: subscription.id,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
                amount: planConfig.amount,
                currency: planConfig.currency,
            };
        }),

    verifyPayment: authenticatedProcedure
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
            const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = input;

            const body = razorpayPaymentId + "|" + razorpaySubscriptionId;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(body)
                .digest("hex");

            if (expectedSignature !== razorpaySignature) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid payment signature" });
            }

            const subscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId);
            const plan = (subscription.notes as any)?.plan || "pro";

            await db.update(usersTable)
                .set({
                    plan,
                    subscriptionStatus: subscription.status,
                    razorpaySubscriptionId,
                })
                .where(eq(usersTable.id, ctx.user.id));

            return { success: true, plan };
        }),

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
            const user = await db.select().from(usersTable).where(eq(usersTable.id, ctx.user.id));
            if (!user.length) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            const u = user[0]!;
            let currentPeriodEnd: string | null = null;

            if (u.razorpaySubscriptionId) {
                try {
                    const subscription = await razorpay.subscriptions.fetch(u.razorpaySubscriptionId);
                    currentPeriodEnd = subscription.current_end
                        ? new Date(subscription.current_end * 1000).toISOString()
                        : null;
                } catch {
                    // Subscription might have been cancelled or not found
                }
            }

            return {
                plan: u.plan || "free",
                status: u.subscriptionStatus || "inactive",
                subscriptionId: u.razorpaySubscriptionId || null,
                currentPeriodEnd,
            };
        }),
});

export default paymentRouter;
