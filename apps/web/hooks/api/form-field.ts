import { trpc } from "~/trpc/client";

export const useCreateField = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createFieldAsync,
        mutate: createField,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.formField.createField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return {
        createFieldAsync,
        createField,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    };
};

export const useGetFields = (formId: string) => {
    const {
        data: fields,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.formField.getFields.useQuery({ formId }, { enabled: !!formId });

    return {
        fields,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};

export const useUpdateField = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: updateFieldAsync,
        mutate: updateField,
        error,
        isPending,
        isSuccess,
        status,
    } = trpc.formField.updateField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return {
        updateFieldAsync,
        updateField,
        error,
        isPending,
        isSuccess,
        status,
    };
};

export const useDeleteField = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: deleteFieldAsync,
        mutate: deleteField,
        error,
        isPending,
        isSuccess,
        status,
    } = trpc.formField.deleteField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return {
        deleteFieldAsync,
        deleteField,
        error,
        isPending,
        isSuccess,
        status,
    };
};

export const useDuplicateField = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: duplicateFieldAsync,
        mutate: duplicateField,
        isPending,
    } = trpc.formField.duplicateField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return { duplicateFieldAsync, duplicateField, isPending };
};

export const useReorderFields = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: reorderFieldsAsync,
        mutate: reorderFields,
        error,
        isPending,
        isSuccess,
        status,
    } = trpc.formField.reorderFields.useMutation({
        onMutate: async ({ fieldIds }) => {
            await utils.formField.getFields.cancel({ formId });
            const previous = utils.formField.getFields.getData({ formId });
            if (previous) {
                const fieldMap = new Map(previous.map((f: any) => [f.id, f]));
                const reordered = fieldIds
                    .map((id: string) => fieldMap.get(id))
                    .filter(Boolean);
                const remaining = previous.filter((f: any) => !fieldIds.includes(f.id));
                utils.formField.getFields.setData({ formId }, [...reordered, ...remaining] as any);
            }
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                utils.formField.getFields.setData({ formId }, context.previous);
            }
        },
        onSettled: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return {
        reorderFieldsAsync,
        reorderFields,
        error,
        isPending,
        isSuccess,
        status,
    };
};
