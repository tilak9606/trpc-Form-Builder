import { trpc } from "~/trpc/client";

export function useGetEmailSettings(formId: string) {
  const { data, isLoading, error } = trpc.emailSettings.get.useQuery(
    { formId },
    { enabled: !!formId }
  );
  return { settings: data, isLoading, error };
}

export function useUpdateEmailSettings(formId: string) {
  const utils = trpc.useUtils();
  const { mutateAsync: updateAsync, isPending } = trpc.emailSettings.update.useMutation({
    onSuccess: () => {
      utils.emailSettings.get.invalidate({ formId });
    },
  });
  return { updateEmailSettingsAsync: updateAsync, isPending };
}