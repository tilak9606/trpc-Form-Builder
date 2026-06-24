import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { formRouter } from "./routes/form/route";
import { formFieldRouter } from "./routes/form-field/route";
import { formSubmissionRouter } from "./routes/form-submission/route";
import { webhookRouter } from "./routes/webhook/route";
import { formTemplateRouter } from "./routes/form-template/route";
import { folderRouter } from "./routes/folder/route";

export const serverRouter = router({
  health: healthRouter,
  form: formRouter,
  formField: formFieldRouter,
  formSubmission: formSubmissionRouter,
  webhook: webhookRouter,
  formTemplate: formTemplateRouter,
  folder: folderRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;