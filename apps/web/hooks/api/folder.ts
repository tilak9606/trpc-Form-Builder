import { trpc } from "~/trpc/client";

export const useCreateFolder = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createFolderAsync,
        mutate: createFolder,
        isPending,
    } = trpc.folder.createFolder.useMutation({
        onSuccess: async () => {
            await utils.folder.invalidate();
        },
    });

    return { createFolderAsync, createFolder, isPending };
};

export const useListFolders = () => {
    const { data: folders, isLoading } = trpc.folder.listFolders.useQuery();

    return { folders, isLoading };
};

export const useUpdateFolder = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: updateFolderAsync,
        mutate: updateFolder,
        isPending,
    } = trpc.folder.updateFolder.useMutation({
        onSuccess: async () => {
            await utils.folder.invalidate();
        },
    });

    return { updateFolderAsync, updateFolder, isPending };
};

export const useDeleteFolder = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: deleteFolderAsync,
        mutate: deleteFolder,
        isPending,
    } = trpc.folder.deleteFolder.useMutation({
        onSuccess: async () => {
            await utils.folder.invalidate();
            await utils.form.invalidate();
        },
    });

    return { deleteFolderAsync, deleteFolder, isPending };
};

export const useMoveFormToFolder = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: moveFormToFolderAsync,
        mutate: moveFormToFolder,
        isPending,
    } = trpc.folder.moveFormToFolder.useMutation({
        onSuccess: async () => {
            await utils.folder.listFolders.invalidate();
            await utils.form.listForms.invalidate();
            await utils.form.invalidate();
        },
    });

    return { moveFormToFolderAsync, moveFormToFolder, isPending };
};
