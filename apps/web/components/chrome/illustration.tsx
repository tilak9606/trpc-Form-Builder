"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Inbox } from "lucide-react";

export const ILLUSTRATIONS = [
  "ship-form", "collect", "analyze", "share",
  "empty-mailbox", "celebration", "locked", "broken",
] as const;

export type IllustrationName = (typeof ILLUSTRATIONS)[number];

interface IllustrationProps extends React.HTMLAttributes<HTMLDivElement> {
  name: IllustrationName;
  tint?: "mint" | "peach" | "blush" | "butter" | "sky" | "lilac";
}

export function Illustration({ name, tint = "mint", className, ...props }: IllustrationProps) {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  if (imgError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-24 h-24 mx-auto rounded-2xl bg-muted/50",
          className,
        )}
        {...props}
      >
        <Inbox className="w-10 h-10 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-[280px] md:max-w-[360px] mx-auto",
        !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-400",
        className,
      )}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/illustrations/illust-${name}.svg`}
        alt=""
        className={cn("size-full", `text-tint-${tint}-ink`)}
        onError={() => setImgError(true)}
      />
    </div>
  );
}
