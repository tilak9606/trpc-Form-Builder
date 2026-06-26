import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { formsTable } from "@repo/database/models/form";
import { PLAN_LIMITS, type UserPlan } from "@repo/database/constants/user-plan";
import { count } from "drizzle-orm";

export default class UserService {
  public async getUserPlan(userId: string) {
    const users = await db
      .select({ plan: usersTable.plan })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const user = users[0];
    const plan = (user?.plan ?? "free") as UserPlan;

    const formCounts = await db
      .select({ value: count() })
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

    if (!result || result.length === 0) {
      throw new Error("Failed to update user plan");
    }

    return { id: result[0].id, plan };
  }
}
