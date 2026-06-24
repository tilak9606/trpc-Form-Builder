import FormService from "./form/index";
import FormFieldService from "./form-field/index";
import FormSubmissionService from "./form-submission/index";
import WebhookService from "./webhook/index";
import FormTemplateService from "./form-template/index";
import FolderService from "./folder/index";

export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formSubmissionService = new FormSubmissionService();
export const webhookService = new WebhookService();
export const formTemplateService = new FormTemplateService();
export const folderService = new FolderService();

export { sendEmail } from "./email/index";
export { auth } from "./auth/index";
