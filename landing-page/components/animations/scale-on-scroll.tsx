'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ScaleOnScrollProps {
  children: ReactNode;
  delay?: number;
  scale?: number;
  className?: string;
}

export function ScaleOnScroll({
  children,
  delay = 0,
  scale = 0.8,
  className,
}: ScaleOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        scale: scale,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              scale: 1,
            }
          : {}
      }
      transition={{
        duration: 0.5,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
