import * as React from "react";
import { cn } from "~/lib/utils";

interface EditorialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function EditorialCard({
  interactive = false,
  className,
  children,
  ...props
}: EditorialCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-6 transition-all duration-200",
        interactive &&
          "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_oklch(0.22_0.04_180/0.15)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SurfaceCard({ className, children, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cn("bg-card border border-border/80 rounded-xl p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
