import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { formsTable } from "@repo/database/models/form";
import { PLAN_LIMITS, type UserPlan } from "@repo/database/constants/user-plan";
import { count as drizzleCount } from "@repo/database";
import { TRPCError } from "@trpc/server";

const ALLOWED_SUBSCRIPTION_STATUSES = ["active", "cancelled", "expired", "pending"] as const;
type AllowedSubscriptionStatus = (typeof ALLOWED_SUBSCRIPTION_STATUSES)[number];

export default class UserService {
  public async getUserPlan(userId: string) {
    const users = await db
      .select({ plan: usersTable.plan })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const user = users[0];
    const plan = (user?.plan ?? "free") as UserPlan;

    const formCounts = await db
      .select({ value: drizzleCount() })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId));

    const formCount = formCounts[0]?.value ?? 0;
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    return {
      plan,
      formCount,
      formLimit: limits.formLimit,
    };
  }

  public async updateUserPlan(userId: string, plan: UserPlan) {
    const result = await db
      .update(usersTable)
      .set({ plan })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

        if (!result || result.length === 0 || !result[0]?.id) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update user plan" });
        }

    return { id: result[0].id, plan };
  }

  public async getUserWithRazorpayInfo(userId: string) {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

        if (!users.length) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    return users[0]!;
  }

  public async setRazorpayCustomerId(userId: string, customerId: string) {
    const result = await db
      .update(usersTable)
      .set({ razorpayCustomerId: customerId })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

        if (!result || result.length === 0 || !result[0]?.id) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to set customer ID" });
        }

    return { id: result[0].id };
  }

  public async setRazorpaySubscription(userId: string, subscriptionId: string, status: string) {
        if (!ALLOWED_SUBSCRIPTION_STATUSES.includes(status as AllowedSubscriptionStatus)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid subscription status: ${status}` });
        }

    const result = await db
      .update(usersTable)
      .set({ razorpaySubscriptionId: subscriptionId, subscriptionStatus: status as AllowedSubscriptionStatus })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

        if (!result || result.length === 0 || !result[0]?.id) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update subscription" });
        }

    return { id: result[0].id };
  }
}
