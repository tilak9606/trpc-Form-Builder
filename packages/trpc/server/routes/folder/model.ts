import { z } from "zod";

export const createFolderInputModel = z.object({
    name: z.string().max(100).describe("Folder name"),
});

export const createFolderOutputModel = z.object({
    id: z.string(),
    name: z.string(),
});

export const listFoldersOutputModel = z.array(z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string().nullable(),
}));

export const updateFolderInputModel = z.object({
    id: z.string().describe("UUID of the folder"),
    name: z.string().max(100).describe("New folder name"),
});

export const updateFolderOutputModel = z.object({
    id: z.string(),
});

export const deleteFolderInputModel = z.object({
    id: z.string().describe("UUID of the folder"),
});

export const deleteFolderOutputModel = z.object({
    id: z.string(),
});

export const moveFormToFolderInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    folderId: z.string().nullable().describe("UUID of the folder, or null to remove"),
});

export const moveFormToFolderOutputModel = z.object({
    success: z.boolean(),
});
