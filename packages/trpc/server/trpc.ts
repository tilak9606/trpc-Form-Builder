import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape, error }) {
      const isServerError = error.code === "INTERNAL_SERVER_ERROR";
      if (isServerError && error.cause instanceof Error) {
        const msg = error.cause.message.toLowerCase();
        if (msg.includes("not found")) {
          return { ...shape, code: "NOT_FOUND" as const, message: error.cause.message };
        }
        if (msg.includes("access denied") || msg.includes("not found or access denied")) {
          return { ...shape, code: "FORBIDDEN" as const, message: error.cause.message };
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