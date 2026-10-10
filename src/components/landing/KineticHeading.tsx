import React, { useRef } from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';

type HeadingTag = 'h1' | 'h2' | 'h3';

interface KineticHeadingProps {
  as?: HeadingTag;
  text: string;
  /** Word or phrase in `text` that gets a hand-drawn gold stroke once the heading lands */
  highlight?: string;
  className?: string;
}

const Word: React.FC<{ word: string; index: number; progress: MotionValue<number>; reduce: boolean }> = ({ word, index, progress, reduce }) => {
  const start = Math.min(index * 0.07, 0.5);
  const y = useTransform(progress, [start, start + 0.45], ['105%', '0%'], { clamp: true });
  return (
    <span className="relative z-[1] inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
      <motion.span className="inline-block" style={reduce ? undefined : { y }}>
        {word}
      </motion.span>
    </span>
  );
};

/**
 * Section heading whose words rise one by one out of a mask as it scrolls into view,
 * then a gold highlighter stroke draws itself under the highlighted phrase.
 * Fully scroll-linked: scrolling back up plays it in reverse.
 */
export const KineticHeading: React.FC<KineticHeadingProps> = ({ as = 'h2', text, highlight, className = '' }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const stroke = useTransform(scrollYProgress, [0.6, 0.98], [0, 1], { clamp: true });

  const hasHighlight = !!highlight && text.includes(highlight);
  const [before, after] = hasHighlight ? text.split(highlight!) : [text, ''];
  let index = 0;
  const words = (chunk: string) =>
    chunk
      .split(' ')
      .filter(Boolean)
      .flatMap((w, i) => [i > 0 ? ' ' : null, <Word key={`${w}-${index}`} word={w} index={index++} progress={scrollYProgress} reduce={reduce} />]);

  const Tag = motion[as];

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words(before)}
        {hasHighlight && (
          <>
            {before.endsWith(' ') && ' '}
            <span className="relative inline-block">
              <svg className="absolute -left-[3%] w-[106%] bottom-[0.02em] h-[0.5em] z-0 overflow-visible pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                <motion.path
                  d="M3 13 C 22 9, 45 15, 68 11 S 92 10, 97 12"
                  fill="none"
                  stroke="#C89630"
                  strokeOpacity={0.55}
                  strokeWidth={15}
                  strokeLinecap="round"
                  style={{ pathLength: reduce ? 1 : stroke }}
                />
              </svg>
              {words(highlight!)}
            </span>
            {after.startsWith(' ') && ' '}
          </>
        )}
        {words(after)}
      </span>
    </Tag>
  );
};
