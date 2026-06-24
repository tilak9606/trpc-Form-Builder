import { z } from "zod";

export const createFolderInput = z.object({
    name: z.string().max(100).describe("Folder name"),
    userId: z.string().describe("ID of the user creating the folder"),
});

export type CreateFolderInputType = z.infer<typeof createFolderInput>;

export const listFoldersInput = z.object({
    userId: z.string().describe("ID of the user"),
});

export type ListFoldersInputType = z.infer<typeof listFoldersInput>;

export const updateFolderInput = z.object({
    id: z.uuid().describe("UUID of the folder"),
    name: z.string().max(100).describe("New folder name"),
    userId: z.string().describe("ID of the user"),
});

export type UpdateFolderInputType = z.infer<typeof updateFolderInput>;

export const deleteFolderInput = z.object({
    id: z.uuid().describe("UUID of the folder"),
    userId: z.string().describe("ID of the user"),
});

export type DeleteFolderInputType = z.infer<typeof deleteFolderInput>;

export const moveFormToFolderInput = z.object({
    formId: z.string().describe("UUID of the form"),
    folderId: z.string().nullable().describe("UUID of the folder, or null to remove from folder"),
    userId: z.string().describe("ID of the user"),
});

export type MoveFormToFolderInputType = z.infer<typeof moveFormToFolderInput>;
