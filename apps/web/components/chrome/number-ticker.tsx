"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  suffix?: string;
  duration?: number;
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function NumberTicker({ value, suffix = "", duration = 700, className, ...props }: NumberTickerProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          setHasAnimated(true);

          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 5);
            setDisplayValue(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, reducedMotion, hasAnimated]);

  const formatted = new Intl.NumberFormat().format(displayValue);

  return (
    <span ref={ref} className={cn("tabular-nums", className)} {...props}>
      {formatted}{suffix}
    </span>
  );
}
