import { trpc } from "~/trpc/client";

export const useGetTemplates = () => {
    const { data: templates, ...rest } = trpc.formTemplate.listTemplates.useQuery();
    return { templates, ...rest };
};

export const useCreateTemplate = () => {
    const utils = trpc.useUtils();
    const { mutateAsync: createTemplateAsync, mutate: createTemplate, ...rest } = trpc.formTemplate.createTemplate.useMutation({
        onSuccess: () => { utils.formTemplate.invalidate(); },
    });
    return { createTemplateAsync, createTemplate, ...rest };
};

export const useDeleteTemplate = () => {
    const utils = trpc.useUtils();
    const mutation = trpc.formTemplate.deleteTemplate.useMutation({
        onSuccess: () => { utils.formTemplate.invalidate(); },
    });
    return mutation;
};

export const useCreateFormFromTemplate = () => {
    const utils = trpc.useUtils();
    const mutation = trpc.formTemplate.createFormFromTemplate.useMutation({
        onSuccess: () => { utils.form.invalidate(); },
    });
    return mutation;
};
