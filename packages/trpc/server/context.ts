import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { auth } from "@repo/services";

export interface TRPCContext {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  session?: {
    id: string;
    expiresAt: Date;
  };
  respondentIp?: string;
}

export async function createContext({ req }: CreateExpressContextOptions) {
  const headers = new Headers(req.headers as Record<string, string>);
  const session = await auth.api.getSession({ headers });

  const respondentIp =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown";

  return {
    user: session?.user,
    session: session?.session,
    respondentIp,
  } satisfies TRPCContext;
}

export type Context = Awaited<ReturnType<typeof createContext>>;