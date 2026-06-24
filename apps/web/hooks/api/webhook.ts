import { trpc } from "~/trpc/client";

export const useGetWebhooks = (formId: string) => {
    const { data: webhooks, ...rest } = trpc.webhook.listWebhooks.useQuery({ formId });
    return { webhooks, ...rest };
};

export const useCreateWebhook = () => {
    const utils = trpc.useUtils();
    const mutation = trpc.webhook.createWebhook.useMutation({
        onSuccess: () => { utils.webhook.invalidate(); },
    });
    return mutation;
};

export const useUpdateWebhook = () => {
    const utils = trpc.useUtils();
    const mutation = trpc.webhook.updateWebhook.useMutation({
        onSuccess: () => { utils.webhook.invalidate(); },
    });
    return mutation;
};

export const useDeleteWebhook = () => {
    const utils = trpc.useUtils();
    const mutation = trpc.webhook.deleteWebhook.useMutation({
        onSuccess: () => { utils.webhook.invalidate(); },
    });
    return mutation;
};
