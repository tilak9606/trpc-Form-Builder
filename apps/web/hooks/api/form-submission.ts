import { trpc } from "~/trpc/client";

export const useCreateSubmission = () => {
    const {
        mutateAsync: createSubmissionAsync,
        mutate: createSubmission,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.formSubmission.createSubmission.useMutation({});

    return {
        createSubmissionAsync,
        createSubmission,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    };
};

export const useGetSubmissionsByFormId = (formId: string) => {
    const {
        data: submissions,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.formSubmission.getSubmissionsByFormId.useQuery({ formId });

    return {
        submissions,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};
