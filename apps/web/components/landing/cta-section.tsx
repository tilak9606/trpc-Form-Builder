"use client";

import * as React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useSession } from "~/lib/auth-client";

export function CTASection() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <section className="bg-[#1a1a1a] px-6 pt-32 pb-20">
      <motion.div
        className="max-w-6xl mx-auto bg-[#f0efe3] rounded-[3rem] p-16 md:p-24 text-center shadow-2xl relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-4xl md:text-6xl font-serif text-[#1a1a1a] mb-6 tracking-tight">
          Ready to build <span className="text-[#5B6AF0]">beautiful</span>{" "}
          forms?
        </h2>
        <p className="text-xl text-[#4a4a4a] mb-10 max-w-xl mx-auto leading-relaxed">
          Join thousands of creators who build forms that people actually enjoy
          filling out.
        </p>
        <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
          <button className="bg-[#1a1a1a] text-[#f0efe3] px-8 py-4 rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-xl text-lg">
            {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
          </button>
        </Link>
      </motion.div>

      <div className="max-w-6xl mx-auto mt-40 text-left grid grid-cols-1 md:grid-cols-4 gap-12 text-[#f0efe3]">
        <div className="flex flex-col justify-between h-full">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold font-serif tracking-tight"
            >
              <div className="w-7 h-7 rounded-lg bg-[#f0efe3] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[#1a1a1a]" />
              </div>
              FormForge
            </Link>
          </div>
          <div className="mt-16 md:mt-0">
            <p className="text-sm font-medium">FormForge</p>
            <p className="text-sm text-[#737373] mt-2">
              © 2026 FormForge. All rights reserved.
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-8 text-xs tracking-[0.2em] uppercase text-[#f0efe3]">
            Products
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#a3a3a3]">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Forms
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Themes
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Integrations
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-8 text-xs tracking-[0.2em] uppercase text-[#f0efe3]">
            Resources
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#a3a3a3]">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-8 text-xs tracking-[0.2em] uppercase text-[#f0efe3]">
            Social
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#a3a3a3]">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                X.com
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                GitHub
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                LinkedIn
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Instagram
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
