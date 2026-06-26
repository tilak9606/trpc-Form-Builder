import { trpc } from "~/trpc/client";

export const useUserPlan = () => {
    const {
        data: plan,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.user.getUserPlan.useQuery();

    return {
        plan,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};
