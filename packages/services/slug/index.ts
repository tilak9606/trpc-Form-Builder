import { db, eq, inArray } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { nanoid } from "nanoid";

export class SlugService {
    private reservedSlugs = new Set([
        "api",
        "auth",
        "admin",
        "login",
        "register",
        "dashboard",
        "settings",
        "forms",
        "workspace",
        "templates",
        "pricing",
        "about",
        "contact",
        "privacy",
        "terms",
    ]);

    private generateBaseSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/[\s-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    async checkAvailability(slug: string): Promise<boolean> {
        if (this.reservedSlugs.has(slug)) {
            return false;
        }

        const [existing] = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(eq(formsTable.slug, slug))
            .limit(1);

        return !existing;
    }

    validateCustomSlug(slug: string): { valid: boolean; error?: string } {
        if (slug.length < 3 || slug.length > 64) {
            return { valid: false, error: "Slug must be between 3 and 64 characters" };
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            return {
                valid: false,
                error: "Slug can only contain lowercase letters, numbers, and hyphens",
            };
        }

        if (this.reservedSlugs.has(slug)) {
            return { valid: false, error: "This slug is reserved and cannot be used" };
        }

        return { valid: true };
    }

    async generateSlug(title: string): Promise<string> {
        let baseSlug = this.generateBaseSlug(title);

        if (!baseSlug || baseSlug.length < 2) {
            baseSlug = nanoid(10).toLowerCase();
        }

        baseSlug = baseSlug.slice(0, 64);

        const candidates: string[] = [baseSlug];
        for (let i = 1; i <= 10; i++) {
            candidates.push(`${baseSlug.slice(0, 61)}-${i}`);
        }
        candidates.push(`${baseSlug.slice(0, 57)}-${nanoid(6).toLowerCase()}`);

        const existingRows = await db
            .select({ slug: formsTable.slug })
            .from(formsTable)
            .where(inArray(formsTable.slug, candidates));

        const existing = new Set(existingRows.map((r) => r.slug));

        for (const candidate of candidates) {
            if (!existing.has(candidate)) {
                return candidate;
            }
        }

        return `${baseSlug.slice(0, 57)}-${nanoid(6).toLowerCase()}`;
    }
}