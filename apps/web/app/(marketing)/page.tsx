"use client";

import * as React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { LenisProvider } from "~/components/landing/lenis-provider";
import { HeroHeadline } from "~/components/landing/hero-headline";
import { NeomorphicForm } from "~/components/landing/neomorphic-form";
import { HowItWorks } from "~/components/landing/how-it-works";
import { StatsSection } from "~/components/landing/stats-section";
import { PricingSection } from "~/components/landing/pricing-section";
import { CTASection } from "~/components/landing/cta-section";
import dynamic from "next/dynamic";

const DragDemo = dynamic(
  () => import("~/components/landing/drag-demo").then((mod) => mod.DragDemo),
  { ssr: false }
);
import { ThemeShowcase } from "~/components/landing/theme-showcase";
import { useSession } from "~/lib/auth-client";

function HeroCTAButtons() {
  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <motion.div
      className="flex items-center gap-4 mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={isLoggedIn ? "/dashboard" : "/signup"}
        className="inline-flex h-12 items-center rounded-full bg-[#1a1a1a] px-8 text-sm font-medium text-[#f0efe3] transition-all hover:bg-[#333] hover:scale-105 active:scale-95 shadow-xl"
      >
        {isLoggedIn ? "Go to Dashboard" : "Start building"}
      </Link>
      <Link
        href={isLoggedIn ? "/dashboard" : "/signin"}
        className="inline-flex h-12 items-center rounded-full border border-[#1a1a1a] px-8 text-sm font-medium text-[#1a1a1a] transition-all hover:bg-[#e6e5d8] bg-transparent"
      >
        {isLoggedIn ? "See how it works" : "Learn more"}
      </Link>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="bg-[#f0efe3] min-h-screen text-[#1a1a1a] selection:bg-[#5B6AF0] selection:text-[#f0efe3]">
        {/* HERO */}
        <section className="relative pt-32 pb-40 px-6 overflow-hidden flex flex-col items-center">
          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <HeroHeadline />
              <HeroCTAButtons />
            </div>
            <div className="hidden lg:flex justify-end w-full">
              <NeomorphicForm />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <div className="bg-[#1a1a1a] text-[#f0efe3]">
          <HowItWorks />
        </div>

        {/* DRAG DEMO */}
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-display-md text-center mb-4">Drag. Drop. Done.</h2>
            <p className="text-center text-muted-foreground mb-12">Building forms is as intuitive as rearranging sticky notes.</p>
            <DragDemo />
          </div>
        </section>

        {/* STATS */}
        <StatsSection />

        {/* THEME SHOWCASE */}
        <ThemeShowcase />

        {/* PRICING */}
        <PricingSection />

        {/* CTA */}
        <CTASection />
      </div>
    </LenisProvider>
  );
}
