import * as React from "react";
import { MarketingHeader } from "~/components/marketing-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0efe3]">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
