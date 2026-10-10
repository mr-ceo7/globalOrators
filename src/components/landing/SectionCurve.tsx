import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/**
 * Curved bottom edge (fill may be a CSS variable: it is applied via style, which resolves var()).
 * Curved bottom edge filled with the next band's color. Two wave layers drift
 * sideways in opposite directions as the page scrolls.
 */
export const SectionCurve: React.FC<{ fill: string }> = ({ fill }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const backX = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const frontX = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <div ref={ref} aria-hidden="true" className="absolute -bottom-px left-0 right-0 h-[70px] sm:h-[110px] overflow-hidden pointer-events-none">
      <motion.svg
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        className="absolute inset-y-0 -left-[15%] w-[130%] h-full"
        style={reduce ? undefined : { x: backX }}
      >
        <path d="M 0,130 L 0,40 C 220,0 420,10 700,40 C 980,70 1200,30 1440,50 L 1440,130 Z" style={{ fill }} opacity="0.45" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        className="absolute inset-y-0 -left-[15%] w-[130%] h-full"
        style={reduce ? undefined : { x: frontX }}
      >
        <path d="M 0,130 L 0,58 C 160,14 360,0 620,22 C 900,46 1140,108 1440,80 L 1440,130 Z" style={{ fill }} />
      </motion.svg>
    </div>
  );
};
