import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { folderService } from "@repo/services";

import {
    createFolderInputModel,
    createFolderOutputModel,
    listFoldersOutputModel,
    updateFolderInputModel,
    updateFolderOutputModel,
    deleteFolderInputModel,
    deleteFolderOutputModel,
    moveFormToFolderInputModel,
    moveFormToFolderOutputModel,
} from "./model";

const TAGS = ["Folder"];
const getPath = generatePath("/folder");

export const folderRouter = router({
    createFolder: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createFolder"), tags: TAGS, protect: true } })
        .input(createFolderInputModel)
        .output(createFolderOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await folderService.createFolder({ name: input.name, userId: ctx.user.id });
            return result;
        }),

    listFolders: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listFolders"), tags: TAGS, protect: true } })
        .output(listFoldersOutputModel)
        .query(async ({ ctx }) => {
            const result = await folderService.listFolders({ userId: ctx.user.id });
            return result;
        }),

    updateFolder: authenticatedProcedure
        .meta({ openapi: { method: "PATCH", path: getPath("/updateFolder"), tags: TAGS, protect: true } })
        .input(updateFolderInputModel)
        .output(updateFolderOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await folderService.updateFolder({ ...input, userId: ctx.user.id });
            return result;
        }),

    deleteFolder: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteFolder"), tags: TAGS, protect: true } })
        .input(deleteFolderInputModel)
        .output(deleteFolderOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await folderService.deleteFolder({ ...input, userId: ctx.user.id });
            return result;
        }),

    moveFormToFolder: authenticatedProcedure
        .meta({ openapi: { method: "PATCH", path: getPath("/moveFormToFolder"), tags: TAGS, protect: true } })
        .input(moveFormToFolderInputModel)
        .output(moveFormToFolderOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await folderService.moveFormToFolder({ formId: input.formId, folderId: input.folderId, userId: ctx.user.id });
            return result;
        }),
});

export default folderRouter;
