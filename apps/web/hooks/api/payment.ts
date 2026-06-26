import { trpc } from "~/trpc/client";

export const useCreateSubscription = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createSubscriptionAsync,
        mutate: createSubscription,
        error,
        isError,
        isIdle,
        isPending,
        isSuccess,
        status,
    } = trpc.payment.createSubscription.useMutation();

    return {
        createSubscriptionAsync,
        createSubscription,
        error,
        isError,
        isIdle,
        isPending,
        isSuccess,
        status,
    };
};

export const useVerifyPayment = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: verifyPaymentAsync,
        mutate: verifyPayment,
        error,
        isError,
        isIdle,
        isPending,
        isSuccess,
        status,
    } = trpc.payment.verifyPayment.useMutation({
        onSuccess: async () => {
            await utils.user.invalidate();
        },
    });

    return {
        verifyPaymentAsync,
        verifyPayment,
        error,
        isError,
        isIdle,
        isPending,
        isSuccess,
        status,
    };
};

export const useSubscriptionStatus = () => {
    const {
        data: subscription,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.payment.getSubscriptionStatus.useQuery();

    return {
        subscription,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};
