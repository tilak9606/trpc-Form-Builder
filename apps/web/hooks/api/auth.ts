import { trpc } from "~/trpc/client";

export function useSignUp() {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createUserWithEmailAndPasswordAsync,
        mutate: createUserWithEmailAndPassword,
        error,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    } = trpc.auth.createUserWithEmailAndPassword.useMutation({
        onSuccess() {
            utils.auth.getLoggedInUserInfo.invalidate();
        },
    });

    return {
        createUserWithEmailAndPasswordAsync,
        createUserWithEmailAndPassword,
        error,
        isError,
        isSuccess,
        isIdle,
        isPending,
        status,
    };
}

export function useSignIn() {
    const utils = trpc.useUtils();
    const {
        mutateAsync: signInUserWithEmailAndPasswordAsync,
        mutate: signInUserWithEmailAndPassword,
        error,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    } = trpc.auth.createUserWithEmailAndPassword.useMutation({
        onSuccess() {
            utils.auth.getLoggedInUserInfo.invalidate();
        },
    });

    return {
        signInUserWithEmailAndPasswordAsync,
        signInUserWithEmailAndPassword,
        error,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    };
}

export function useUser() {
    const {
        data: user,
        error,
        isError,
        isFetching,
        isFetched,
        isPending,
        status,
    } = trpc.auth.getLoggedInUserInfo.useQuery();

    return {
        user,
        error,
        isError,
        isFetching,
        isFetched,
        isPending,
        status,
    };
}
