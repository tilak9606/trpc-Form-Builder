import { toast as sonner, type ExternalToast } from "sonner";

export const toast = {
  success: (msg: string, opts?: ExternalToast) => sonner.success(msg, opts),
  info: (msg: string, opts?: ExternalToast) => sonner.info(msg, opts),
  warning: (msg: string, opts?: ExternalToast) => sonner.warning(msg, opts),
  error: (msg: string, opts?: ExternalToast) => sonner.error(msg, opts),
};