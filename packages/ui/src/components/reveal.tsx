"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

export type RevealProps = {
  children: ReactNode;
  trigger?: "viewport" | "mount";
  distanceY?: number;
  duration?: number;
  delay?: number;
};

export function Reveal({
  children,
  trigger = "viewport",
  distanceY = 30,
  duration = 1,
  delay = 0,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const hidden = { opacity: 0, y: distanceY };
  const visible = { opacity: 1, y: 0 };

  if (prefersReducedMotion) {
    return (
      <motion.div initial={false} animate={visible}>
        {children}
      </motion.div>
    );
  }

  if (trigger === "mount") {
    return (
      <motion.div initial={hidden} animate={visible} transition={{ duration, delay, ease: EASE }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
