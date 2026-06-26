"use client";

import { Inbox, FileText, Upload, AlertCircle, FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: "inbox" | "forms" | "upload" | "error" | "folder";
  title: string;
  description: string;
  action?: React.ReactNode;
}

const icons = {
  inbox: Inbox,
  forms: FileText,
  upload: Upload,
  error: AlertCircle,
  folder: FolderOpen,
};

export function EmptyState({ icon = "inbox", title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-2 border border-border mb-4">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted text-center max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
