"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

let booted = false;

/**
 * Every route after the first eases in. The first load is server-rendered and shown as is, so
 * nothing waits on JavaScript to become visible. Opacity only: a transform here would trap fixed
 * bars and drawers inside the page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [first] = useState(() => !booted);
  useEffect(() => {
    booted = true;
  }, []);
  return (
    <motion.div initial={first ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
