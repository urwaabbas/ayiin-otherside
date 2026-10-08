"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** A number that counts up to its value once it scrolls into view, then follows changes smoothly. */
export function CountUp({
  value,
  format,
  decimals = 0,
  suffix = "",
  className,
  duration = 1.1,
}: {
  value: number;
  /** Client callers can format themselves (currency); server pages use `decimals` / `suffix`. */
  format?: (n: number) => string;
  decimals?: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const show = (n: number) => (format ? format(n) : `${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, show);
  useEffect(() => {
    if (!seen) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration, ease: EASE });
    return () => c.stop();
  }, [seen, value, reduce, duration, mv]);
  // Server and first paint show the real figure; the count-up only replays from zero after hydration.
  return (
    <motion.span ref={ref} className={className} suppressHydrationWarning>
      {seen ? text : show(value)}
    </motion.span>
  );
}

/** Rises and fades in when scrolled to. */
export function FadeUp({ delay = 0, y = 22, className, children, ...rest }: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers its `StaggerItem` children as it enters view. */
export function Stagger({ gap = 0.07, delay = 0, className, children, as = "div" }: { gap?: number; delay?: number; className?: string; children: React.ReactNode; as?: "div" | "ul" | "ol" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ className, children, as = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "li" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
      {children}
    </Tag>
  );
}
