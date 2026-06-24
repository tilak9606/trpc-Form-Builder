import { useState, useCallback } from "react";
import { authClient } from "~/lib/auth-client";

export const useSession = () => authClient.useSession();

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;

export function useVerifyEmail() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verifyEmailAsync = useCallback(async ({ token }: { token: string }) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await authClient.verifyEmail({ query: { token } });
      if (res.error) throw new Error(res.error.message || "Verification failed");
      setIsSuccess(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Verification failed"));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { verifyEmailAsync, isPending, isSuccess, error };
}

export function useForgotPassword() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const forgotPasswordAsync = useCallback(async ({ email }: { email: string }) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await authClient.requestPasswordReset({ email, redirectTo: window.location.origin + "/reset-password" });
      if (res.error) throw new Error(res.error.message || "Failed to send reset link");
      setIsSuccess(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send reset link"));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { forgotPasswordAsync, isPending, isSuccess, error };
}

export function useGoogleAuth() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const googleAuthAsync = useCallback(async ({ idToken }: { idToken: string }) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await authClient.signIn.social({ provider: "google", idToken: { token: idToken } });
      if (res.error) throw new Error(res.error.message || "Google sign-in failed");
      setIsSuccess(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Google sign-in failed"));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { googleAuthAsync, isPending, isSuccess, error };
}

export function useResetPassword() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetPasswordAsync = useCallback(
    async ({ token, newPassword }: { token: string; newPassword: string }) => {
      setIsPending(true);
      setError(null);
      setIsSuccess(false);
      try {
        const res = await authClient.resetPassword({ token, newPassword });
        if (res.error) throw new Error(res.error.message || "Failed to reset password");
        setIsSuccess(true);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to reset password"));
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { resetPasswordAsync, isPending, isSuccess, error };
}