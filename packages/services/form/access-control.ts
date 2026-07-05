import { TRPCError } from "@trpc/server";
import type { SelectForm } from "@repo/database/models/form";

interface FormWithFields extends SelectForm {
    fields?: any[];
}

type SafeForm = Omit<FormWithFields, "passwordHash" | "deletedAt" | "createdBy">;

export async function resolvePublicForm(
    form: FormWithFields,
    verifyToken?: (formId: string) => Promise<boolean> | boolean,
): Promise<SafeForm> {
    if (form.status !== "published") {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form not found",
        });
    }

    if (form.visibility === "private") {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form not found",
        });
    }

    if (form.passwordHash && verifyToken) {
        const valid = await verifyToken(form.id);
        if (!valid) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Password required",
            });
        }
    }

    const { passwordHash, deletedAt, createdBy: _, ...safeForm } = form;
    return safeForm as SafeForm;
}
