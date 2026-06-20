import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;
export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
    const { ctx } = options;
    
    const userToken = ctx.getCookie("token");
    if (!userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not logged In" });
    }
    const {id} = await userService.verifyUserToken(userToken);
    return options.next({
        ctx: {
            ...ctx,
            userId: {id},
        },
    });
});
