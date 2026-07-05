"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Star, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";

interface ResponseDetailDrawerProps {
  submissionId: string | null;
  onClose: () => void;
  submission: any | null;
  fields: any[];
  onDelete?: () => void;
  isDeleting?: boolean;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function maskIp(ip?: string | null) {
  if (!ip) return "-";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.xxx.xxx`;
  return ip;
}

interface MetaItemProps {
  label: string;
  value: string | null;
}

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

interface AnswerValueProps {
  field: any;
  value: string | undefined;
}

function AnswerValue({ field, value }: AnswerValueProps) {
  if (!value) return <span className="text-muted-foreground">No answer</span>;

  const fieldType = (field.type || "").toUpperCase();

  if (fieldType === "CHECKBOX" || fieldType === "YES_NO") {
    const boolVal = value === "true" || value === "yes";
    return (
      <div className="flex items-center gap-2">
        {boolVal ? (
          <><CheckCircle2 className="size-4 text-green-500" /> <span>Yes</span></>
        ) : (
          <><XCircle className="size-4 text-red-500" /> <span>No</span></>
        )}
      </div>
    );
  }

  if (fieldType === "RATING") {
    const rating = parseInt(value, 10);
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({value})</span>
      </div>
    );
  }

  if (fieldType === "MULTI_SELECT") {
    const values = value.split(",").map((v: string) => v.trim());
    return (
      <div className="flex flex-wrap gap-1.5">
        {values.map((v: string, i: number) => (
          <Badge key={i} variant="secondary" className="rounded-full">
            {v}
          </Badge>
        ))}
      </div>
    );
  }

  if (fieldType === "URL") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand hover:underline break-all"
      >
        {value}
      </a>
    );
  }

  if (fieldType === "FILE_UPLOAD") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand hover:underline"
      >
        {value.split("/").pop() || "View file"}
      </a>
    );
  }

  return <span className="text-sm">{value}</span>;
}

export function ResponseDetailDrawer({
  submissionId,
  onClose,
  submission,
  fields = [],
  onDelete,
  isDeleting = false,
}: ResponseDetailDrawerProps) {
  if (!submission) {
    return null;
  }

  const sortedFields = fields.slice().sort((a: any, b: any) => parseFloat(a.index) - parseFloat(b.index));
  const selectedSubmission = submission;

  return (
    <Sheet open={!!submissionId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Response Details</SheetTitle>
          <SheetDescription>
            Submission ID: {selectedSubmission.id?.slice(0, 8)}...
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          <MetaItem
            label="Submitted"
            value={formatDate(selectedSubmission.createdAt)}
          />

          <MetaItem
            label="Email"
            value={selectedSubmission.respondentEmail || "-"}
          />
          <MetaItem
            label="IP Address"
            value={maskIp(selectedSubmission.respondentIp)}
          />
        </div>

        <Separator />

        <div className="p-4 space-y-4">
          {sortedFields.map((field: any) => {
            const answer = selectedSubmission.values?.find(
              (v: any) => v.fieldId === field.id
            );
            return (
              <div
                key={field.id}
                className="rounded-xl border border-border/60 p-4"
              >
                <p className="text-sm font-medium mb-2">{field.label}</p>
                <AnswerValue field={field} value={answer?.value} />
              </div>
            );
          })}
          {sortedFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No fields found.</p>
          )}
        </div>

        {onDelete && (
          <>
            <Separator />
            <div className="p-4">
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 size-4" />
                Delete Response
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}