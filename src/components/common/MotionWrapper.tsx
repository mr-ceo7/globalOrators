import React, { useRef } from 'react';
import { motion, HTMLMotionProps, MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  className?: string;
  viewportOnce?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Scroll-linked entrance: progress runs 0 → 1 while the element travels from the bottom
 * of the viewport to 30% above it, and plays in reverse when scrolling back up.
 * `stagger` (0–0.5) starts the motion a little later in that window.
 */
function useScrollEntrance(ref: React.RefObject<HTMLElement | null>, direction: Direction, distance: number, stagger: number) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.7'] });
  const t: MotionValue<number> = useTransform(scrollYProgress, (v) => easeOutCubic(Math.min(1, Math.max(0, (v - stagger) / (1 - stagger)))));
  const travel = distance * 3;
  const fromX = direction === 'left' ? travel : direction === 'right' ? -travel : 0;
  const fromY = direction === 'up' ? travel : direction === 'down' ? -travel : 0;
  const x = useTransform(t, [0, 1], [fromX, 0]);
  const y = useTransform(t, [0, 1], [fromY, 0]);
  return { opacity: t, x, y };
}

/**
 * Editorial scroll-linked reveal. Uses compositor-only transforms (opacity & translate)
 * and renders statically for reduced-motion users. `duration` and `viewportOnce` are
 * accepted for compatibility; motion now follows scroll position instead of time.
 */
export const RevealOnScroll: React.FC<RevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 20,
  duration: _duration,
  className = '',
  viewportOnce: _viewportOnce,
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const motionStyle = useScrollEntrance(ref, direction as Direction, distance, Math.min(delay * 2, 0.5));

  return (
    <motion.div ref={ref} className={className} style={reduce ? style : { ...style, ...motionStyle }} {...props}>
      {children}
    </motion.div>
  );
};

/** Lays out children and hands each StaggerItem its position, so siblings in a row arrive one after another. */
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.08, className = '' }) => {
  let index = 0;
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === StaggerItem
          ? React.cloneElement(child as React.ReactElement<StaggerItemProps>, { staggerIndex: index++, staggerDelay })
          : child
      )}
    </div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  staggerIndex?: number;
  staggerDelay?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '', distance = 16, staggerIndex = 0, staggerDelay = 0.08 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Columns in the same row share a top edge, so offset their start by position (wraps every 4)
  const motionStyle = useScrollEntrance(ref, 'up', distance, Math.min((staggerIndex % 4) * staggerDelay * 1.6, 0.5));

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : motionStyle}>
      {children}
    </motion.div>
  );
};
