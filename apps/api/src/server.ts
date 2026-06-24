import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import cookieParser from "cookie-parser";
import { auth } from "@repo/services";
import { upload, uploadToCloudinary } from "./upload";

export const app = express();

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "FormForge OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", async (req, res, next) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers.host || "localhost:8000";
    const url = `${protocol}://${host}${req.originalUrl || req.url}`;

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

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Upload failed" });
  }
});

app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

app.use("/docs", apiReference({ url: "/openapi.json" }));

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

export default app;