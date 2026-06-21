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
    } = trpc.formField.getFields.useQuery({ formId });

    return {
        fields,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};
