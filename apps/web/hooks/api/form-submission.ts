import { trpc } from "~/trpc/client";

export const useTrackEvent = () => {
    const {
        mutateAsync: trackEventAsync,
    } = trpc.formSubmission.trackEvent.useMutation({});

    return { trackEventAsync };
};

export const useGetSubmissionById = (submissionId: string, formId: string) => {
    const {
        data: submission,
        error,
        isLoading,
        status,
    } = trpc.formSubmission.getSubmissionById.useQuery(
        { submissionId, formId },
        { enabled: !!submissionId && !!formId },
    );

    return { submission, error, isLoading, status };
};

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

export const useExportSubmissions = (formId: string) => {
    const {
        data: exportData,
        refetch: exportSubmissions,
        isFetching: isExporting,
        error,
    } = trpc.formSubmission.exportSubmissions.useQuery(
        { formId },
        { enabled: false },
    );

    return {
        exportData,
        exportSubmissions,
        isExporting,
        error,
    };
};

export const useGetAnalytics = (formId: string) => {
    const {
        data: analytics,
        error,
        isFetching,
        isLoading,
        status,
    } = trpc.formSubmission.getAnalytics.useQuery({ formId });

    return {
        analytics,
        error,
        isFetching,
        isLoading,
        status,
    };
};

export const useDeleteSubmission = (formId: string) => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: deleteSubmissionAsync,
        mutate: deleteSubmission,
        error,
        isPending,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.formSubmission.deleteSubmission.useMutation({
        onSuccess: () => {
            utils.formSubmission.getSubmissionsByFormId.invalidate({ formId });
        },
    });

    return {
        deleteSubmissionAsync,
        deleteSubmission,
        error,
        isPending,
        isError,
        isIdle,
        isSuccess,
        status,
    };
};
