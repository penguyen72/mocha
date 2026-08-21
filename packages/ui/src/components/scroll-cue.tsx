"use client";

import { useEffect, useState } from "react";

export type ScrollCueProps = {
  label?: string;
};

export function ScrollCue({ label = "Scroll" }: ScrollCueProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < window.innerHeight * 0.1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-8 left-1/2 z-10 animate-[floatUp_3s_ease-in-out_infinite] text-center text-white">
      <span className="mb-2 block text-xs uppercase tracking-[0.24em] opacity-85">{label}</span>
      <span className="mx-auto block h-10 w-px bg-white/70" />
    </div>
  );
}
