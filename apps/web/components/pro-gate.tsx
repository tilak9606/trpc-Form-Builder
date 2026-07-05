"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useUserPlan } from "~/hooks/api/user";
import { CheckoutButton } from "~/components/checkout-button";

interface ProGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

export function ProGate({ children, feature, description }: ProGateProps) {
  const { plan, isLoading } = useUserPlan();

  if (isLoading) {
    return null;
  }

  if (plan?.plan === "pro" || plan?.plan === "enterprise") {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center max-w-sm p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{feature}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description || `Upgrade to Pro to unlock ${feature}`}
          </p>
          <CheckoutButton
            plan="pro"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro
          </CheckoutButton>
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">{children}</div>
    </div>
  );
}
