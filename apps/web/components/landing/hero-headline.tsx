"use client";

import * as React from "react";
import { motion } from "motion/react";

export function HeroHeadline() {
  return (
    <div className="text-left max-w-2xl">
      <motion.h1
        className="text-[5rem] leading-[1.05] tracking-tight text-[#1a1a1a] font-serif"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        Build forms
        <br />
        that <span className="text-[#e78a53]">work</span>.
      </motion.h1>

      <motion.p
        className="mt-8 text-xl text-[#4a4a4a] leading-relaxed max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        Create beautiful, responsive forms in minutes. Collect responses,
        analyze data, and share with the world.
      </motion.p>
    </div>
  );
}
