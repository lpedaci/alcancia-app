import { animate, motion, useInView } from 'motion/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';

const TAGS = { div: motion.div, li: motion.li, section: motion.section } as const;

/**
 * Scroll reveal of the landing (2.6): fades in and rises 16 px once, when 15 % of the element
 * enters the viewport. Lists pass `delay` in steps of 50 ms for the staggered entry. With reduced
 * motion, MotionConfig (reducedMotion="user") keeps only the opacity. Never loops.
 */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: keyof typeof TAGS;
  className?: string;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: duration.long, ease: easing.emphasizedDecelerate, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * A figure that counts up to its value the first time it is seen (2.6, "KPIs"). The final value is
 * always in the text for assistive tech; the counting digits are hidden from it.
 */
export function CountUp({ value }: { value: number }) {
  const reduce = useShouldReduceMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 0.8, ease: easing.emphasizedDecelerate, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref}>
      <span aria-hidden>{inView && !reduce ? shown : value}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
