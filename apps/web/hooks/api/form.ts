import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createFormAsync,
        mutate: createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.form.createForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
            await utils.folder.invalidate();
        },
    });

    return {
        createFormAsync,
        createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    };
};

export const useListForms = (folderId?: string | null) => {
    const {
        data: forms,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.listForms.useQuery(folderId !== undefined ? { folderId } : undefined);

    return {
        forms,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};

export const useGetFormWithFields = (formId: string, status?: "DRAFT" | "PUBLISHED" | "CLOSED") => {
    const {
        data: form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status: queryStatus,
    } = trpc.form.getFormWithFields.useQuery({ formId, status });

    return {
        form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status: queryStatus,
    };
};

export const useUpdateForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: updateFormAsync,
        mutate: updateForm,
        error,
        isPending,
        isSuccess,
        status,
    } = trpc.form.updateForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return {
        updateFormAsync,
        updateForm,
        error,
        isPending,
        isSuccess,
        status,
    };
};

export const useDeleteForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: deleteFormAsync,
        mutate: deleteForm,
        error,
        isPending,
        isSuccess,
        status,
    } = trpc.form.deleteForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return {
        deleteFormAsync,
        deleteForm,
        error,
        isPending,
        isSuccess,
        status,
    };
};

export const useExportForm = () => {
    const { mutateAsync: exportFormAsync, mutate: exportForm, isPending } = trpc.form.exportForm.useMutation();

    return { exportFormAsync, exportForm, isPending };
};

export const useImportForm = () => {
    const utils = trpc.useUtils();

    const { mutateAsync: importFormAsync, mutate: importForm, isPending, error } = trpc.form.importForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return { importFormAsync, importForm, isPending, error };
};

export const usePublishForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: publishFormAsync,
        mutate: publishForm,
        error,
        isPending,
        isSuccess,
        status,
    } = trpc.form.publishForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return {
        publishFormAsync,
        publishForm,
        error,
        isPending,
        isSuccess,
        status,
    };
};

export const useDuplicateForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: duplicateFormAsync,
        mutate: duplicateForm,
        isPending,
    } = trpc.form.duplicateForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return { duplicateFormAsync, duplicateForm, isPending };
};
