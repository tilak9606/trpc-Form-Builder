import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import crypto from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csurf";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import cookieParser from "cookie-parser";
import { auth } from "@repo/services";
import { upload, uploadToCloudinary } from "./upload";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { checkRateLimit } from "@repo/services/rate-limiter/index";

export const app = express();

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "FormForge OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: "deny" },
}));

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many auth requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bug #3 fix: this limiter was defined but never passed to app.use() anywhere. It's now
// mounted on the REST/OpenAPI payment surface below. (The tRPC-link surface for the same
// procedures is covered separately by `paymentProcedure` in packages/trpc/server/trpc.ts,
// since Express path-based rate limiting can't see inside a batched "/trpc/payment.x" call.)
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many payment requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bug #3 fix: this was defined but never passed to app.use() anywhere, so CSRF protection
// did not exist at runtime despite CORS being configured to accept an X-CSRF-Token header.
// Now applied to the cookie-authenticated /api/auth bridge below.
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

app.use(globalRateLimiter);

app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((req, res, next) => {
  req.setTimeout(30000);
  next();
});

// GET requests (session checks, OAuth redirects) don't carry a CSRF-vulnerable side effect
// and better-auth's own GET flows don't submit a csrf token, so we only gate state-changing
// verbs. This mirrors the standard csurf usage pattern.
function csrfForMutations(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  return csrfProtection(req, res, next);
}

app.use("/api/auth", authRateLimiter, csrfForMutations, async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress || "unknown";
    const rateLimitKey = `auth:${ip}`;
    const { allowed } = checkRateLimit(rateLimitKey, 20, 60_000);
    if (!allowed) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    const forwardedProto = req.headers["x-forwarded-proto"] as string;
    const host = req.headers.host as string;
    
    const trustedProxy = process.env.NODE_ENV === "production";
    const protocol = trustedProxy && (forwardedProto === "http" || forwardedProto === "https") 
      ? forwardedProto 
      : req.protocol;
    
    const allowedHosts = (process.env.ALLOWED_HOSTS || "localhost:8000,localhost:3000").split(",");
    const validatedHost = host && allowedHosts.some(h => h.trim() === host) ? host : allowedHosts[0];
    
    const url = `${protocol}://${validatedHost}${req.originalUrl || req.url}`;

    const request = new Request(url, {
      method: req.method,
      headers: new Headers(
        Object.entries(req.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(", ") : value || "",
        ]) as [string, string][],
      ),
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    const response = await auth.handler(request);

    res.status(response.status);
    const setCookieHeaders: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookieHeaders.push(value);
      } else {
        res.setHeader(key, value);
      }
    });
    if (setCookieHeaders.length > 0) {
      res.setHeader("Set-Cookie", setCookieHeaders);
    }

    const body = await response.text();
    res.end(body);
  } catch (err) {
    next(err);
  }
});

app.get("/", (req, res) => {
  return res.json({ message: "FormForge API is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "FormForge server is healthy", healthy: true });
});

app.post("/api/upload", async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    (req as any).userId = session.user.id;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}, (req, res, next) => {
  upload.single("file")(req as any, res as any, (err: any) => {
    if (err) {
      return res.status(400).json({ error: "Upload failed" });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    return res.json(result);
  } catch {
    return res.status(400).json({ error: "Upload failed" });
  }
});

const PLAN_ID_TO_NAME: Record<string, string> = {
  "plan_T6XDicxtJ8sYzg": "pro",
  "plan_T6XH4MOa1t7BNk": "enterprise",
};

const ALLOWED_SUBSCRIPTION_STATUSES = ["active", "cancelled", "expired", "pending"] as const;
type AllowedSubscriptionStatus = (typeof ALLOWED_SUBSCRIPTION_STATUSES)[number];

app.post("/api/webhooks/razorpay", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const body = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = typeof req.body === "string" ? JSON.parse(req.body) : typeof req.body === "object" && Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString("utf8")) : req.body;

  try {
    switch (event.event) {
      case "subscription.activated":
      case "subscription.completed": {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          const planName = PLAN_ID_TO_NAME[subscription.plan_id] || "pro";
          await db.update(usersTable)
            .set({ plan: planName, subscriptionStatus: "active" })
            .where(eq(usersTable.id, userId));
        }
        break;
      }
      case "subscription.cancelled":
      case "subscription.expired": {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          await db.update(usersTable)
            .set({ plan: "free", subscriptionStatus: "cancelled" })
            .where(eq(usersTable.id, userId));
        }
        break;
      }
      case "subscription.updated": {
        const subscription = event.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          const status = subscription.status;
          if (ALLOWED_SUBSCRIPTION_STATUSES.includes(status as AllowedSubscriptionStatus)) {
            await db.update(usersTable)
              .set({ subscriptionStatus: status })
              .where(eq(usersTable.id, userId));
          }
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

app.use("/docs", apiReference({ url: "/openapi.json" }));

// Bug #3 fix: dedicated payment rate limit, applied to the REST/OpenAPI surface for the
// payment router (mounted below under /api). 10 req/60s per IP, matching the tRPC-level
// `paymentProcedure` limit.
app.use("/api/payment", paymentRateLimiter);

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
