import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const slugSchema = z.string().min(1).max(64);