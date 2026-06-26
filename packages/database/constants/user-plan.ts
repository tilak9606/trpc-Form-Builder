export const USER_PLANS = ["free", "pro", "enterprise"] as const;

export type UserPlan = (typeof USER_PLANS)[number];

export interface PlanLimits {
  formLimit: number;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    formLimit: 10,
  },
  pro: {
    formLimit: 50,
  },
  enterprise: {
    formLimit: -1,
  },
} as const;