import { db, eq, and } from "@repo/database";
import { foldersTable } from "@repo/database/models/folder";
import { formsTable } from "@repo/database/models/form";
import { TRPCError } from "@trpc/server";
import {
    createFolderInput,
    type CreateFolderInputType,
    listFoldersInput,
    type ListFoldersInputType,
    updateFolderInput,
    type UpdateFolderInputType,
    deleteFolderInput,
    type DeleteFolderInputType,
    moveFormToFolderInput,
    type MoveFormToFolderInputType,
} from "./model";

export default class FolderService {
    public async createFolder(payload: CreateFolderInputType) {
        const data = await createFolderInput.parseAsync(payload);

        const result = await db
            .insert(foldersTable)
            .values({ name: data.name, userId: data.userId })
            .returning({ id: foldersTable.id, name: foldersTable.name });

        if (!result || result.length === 0)
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong while creating the folder" });

        return result[0]!;
    }

    public async listFolders(payload: ListFoldersInputType) {
        const data = await listFoldersInput.parseAsync(payload);

        const rows = await db
            .select({
                id: foldersTable.id,
                name: foldersTable.name,
                createdAt: foldersTable.createdAt,
            })
            .from(foldersTable)
            .where(eq(foldersTable.userId, data.userId))
            .orderBy(foldersTable.createdAt);

        return rows.map((r) => ({
            id: r.id,
            name: r.name,
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
        }));
    }

    public async updateFolder(payload: UpdateFolderInputType) {
        const data = await updateFolderInput.parseAsync(payload);

        const result = await db
            .update(foldersTable)
            .set({ name: data.name })
            .where(and(eq(foldersTable.id, data.id), eq(foldersTable.userId, data.userId)))
            .returning({ id: foldersTable.id });

        if (!result || result.length === 0)
            throw new TRPCError({ code: "NOT_FOUND", message: `Folder with ID ${data.id} not found` });

        return result[0]!;
    }

    public async deleteFolder(payload: DeleteFolderInputType) {
        const data = await deleteFolderInput.parseAsync(payload);

        return await db.transaction(async (tx) => {
            await tx
                .update(formsTable)
                .set({ folderId: null })
                .where(eq(formsTable.folderId, data.id));

            const result = await tx
                .delete(foldersTable)
                .where(and(eq(foldersTable.id, data.id), eq(foldersTable.userId, data.userId)))
                .returning({ id: foldersTable.id });

            if (!result || result.length === 0)
                throw new TRPCError({ code: "NOT_FOUND", message: `Folder with ID ${data.id} not found` });

            return result[0]!;
        });
    }

    public async moveFormToFolder(payload: MoveFormToFolderInputType) {
        const data = await moveFormToFolderInput.parseAsync(payload);

        if (data.folderId) {
            const folder = await db
                .select({ id: foldersTable.id })
                .from(foldersTable)
                .where(and(eq(foldersTable.id, data.folderId), eq(foldersTable.userId, data.userId)));
            if (!folder || folder.length === 0)
                throw new TRPCError({ code: "NOT_FOUND", message: "Target folder not found or access denied" });
        }

        const result = await db
            .update(formsTable)
            .set({ folderId: data.folderId })
            .where(and(eq(formsTable.id, data.formId), eq(formsTable.createdBy, data.userId)))
            .returning({ id: formsTable.id });

        if (!result || result.length === 0)
            throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or access denied" });

        return { success: true };
    }
}
