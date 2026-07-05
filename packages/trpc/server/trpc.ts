import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { checkRateLimit } from "@repo/services";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape, error }) {
      const isServerError = error.code === "INTERNAL_SERVER_ERROR";
      if (isServerError && error.cause instanceof Error) {
        const cause = error.cause as Error & { cause?: unknown };
        const underlyingMessage = cause.cause instanceof Error ? cause.cause.message : null;
        const msg = error.cause.message.toLowerCase();
        if (msg.includes("not found")) {
          return { ...shape, code: "NOT_FOUND" as const, message: error.cause.message };
        }
        if (msg.includes("access denied") || msg.includes("not found or access denied")) {
          return { ...shape, code: "FORBIDDEN" as const, message: error.cause.message };
        }
        if (underlyingMessage) {
          return { ...shape, message: `Database error: ${underlyingMessage}` };
        }
      }
      return shape;
    },
  });

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
  const { ctx } = options;

  if (!ctx.user || !ctx.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not logged in" });
  }

  return options.next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = authenticatedProcedure;

// Bug #3 fix: `paymentRateLimiter` in apps/api/src/server.ts was defined but never mounted,
// and Express-level rate limiting can't reach payment mutations invoked through the batched
// tRPC link anyway (they arrive as a single "/trpc/payment.createSubscription"-style path
// segment, not a matchable Express sub-route). Rate-limiting at the procedure level covers
// both the REST/OpenAPI surface and the tRPC link surface with one implementation.
export const paymentProcedure = authenticatedProcedure.use(async (options) => {
  const { ctx } = options;
  const key = `payment:${ctx.user.id}`;
  const { allowed } = checkRateLimit(key, 10, 60_000);

  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many payment requests. Please try again later.",
    });
  }

  return options.next({ ctx });
});
