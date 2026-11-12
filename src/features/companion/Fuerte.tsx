import { motion } from 'motion/react';
import { useId } from 'react';
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Fuerte, the wallet companion (CLAUDE.md 5.0.1, D-51). Same design as the safe of the escape
 * room "Tu primer sueldo" (body, visor, eyes, brows, dial and hinges), with FLAT fills instead of
 * the original metal gradients (2.2, D-108). Its orange is the only warm color of the product and
 * lives only here (D-52). Decorative: the message is always text next to it (aria-hidden).
 *
 * Lights: one per completed level of the wallet (levels 1 to 7).
 */
export type FuerteState = 'neutral' | 'greeting' | 'thinking' | 'attention' | 'celebration' | 'sleeping';

export const FUERTE_STATES: FuerteState[] = ['neutral', 'greeting', 'thinking', 'attention', 'celebration', 'sleeping'];

export interface FuerteProps {
  state?: FuerteState;
  /** Completed levels, 0 to 7. Celebration lights them all for a moment. */
  lights?: number;
  /** Size in rem of the width (the drawing keeps its proportion). */
  size?: number;
  className?: string;
}

const LIGHTS = 7;

/** Brow transforms per state, in drawing units. */
const BROWS: Record<FuerteState, { left: string; right: string }> = {
  neutral: { left: '', right: '' },
  greeting: { left: 'translate(0 -3)', right: 'translate(0 -3)' },
  thinking: { left: 'translate(0 1.5) rotate(4 63 53)', right: 'translate(0 -3.5) rotate(-8 97 53)' },
  attention: { left: 'translate(0 -1) rotate(-16 63 53)', right: 'translate(0 -1) rotate(16 97 53)' },
  celebration: { left: 'translate(0 -3)', right: 'translate(0 -3)' },
  sleeping: { left: 'translate(0 2)', right: 'translate(0 2)' },
};

const PUPILS: Partial<Record<FuerteState, string>> = {
  thinking: 'translate(3.5 -4.5)',
  attention: 'translate(0 2.5)',
};

const DIAL: Record<FuerteState, number> = {
  neutral: 0,
  greeting: 40,
  thinking: -40,
  attention: 0,
  celebration: 120,
  sleeping: 0,
};

const star = (x: number) => `M${x} 57l3.4 8.6 8.6 3.4-8.6 3.4-3.4 8.6-3.4-8.6-8.6-3.4 8.6-3.4z`;

export function Fuerte({ state = 'neutral', lights = 0, size = 8, className }: FuerteProps) {
  const reduce = useShouldReduceMotion();
  const clipId = useId();
  const lit = state === 'celebration' ? LIGHTS : Math.max(0, Math.min(LIGHTS, lights));
  const brows = BROWS[state];

  return (
    <motion.svg
      key={state}
      viewBox="0 0 168 152"
      width={`${size}rem`}
      style={{ height: 'auto' }}
      aria-hidden
      focusable="false"
      data-state={state}
      className={cn('shrink-0 overflow-visible', className)}
      initial={reduce ? { opacity: 0.6 } : { opacity: 0.6, scale: 0.94 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: duration.long, ease: easing.emphasizedDecelerate }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="20" y="16" width="120" height="122" rx="46" />
        </clipPath>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="80" cy="145" rx="50" ry="5" className="fill-on-surface opacity-10" />

      {/* Celebration sparks and greeting wave */}
      {state === 'celebration' && (
        <g className="stroke-fuerte-body" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M150 14l5-8M158 28l8-3M138 8l1-8M10 22l-6-6M6 38l-7-1" />
        </g>
      )}
      {state === 'greeting' && (
        <g className="stroke-fuerte-body" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M160 58q5 6 0 12M165 52q8 11 0 24" />
        </g>
      )}
      {state === 'attention' && (
        <g className="fill-fuerte-body">
          <rect x="149" y="6" width="6" height="18" rx="3" />
          <circle cx="152" cy="31" r="3.4" />
        </g>
      )}
      {state === 'sleeping' && (
        <g className="stroke-on-surface-variant" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M146 22h9l-9 10h9M158 6h6l-6 7h6" />
        </g>
      )}

      {/* Hinges */}
      <rect x="11" y="42" width="15" height="20" rx="7" className="fill-outline-variant" />
      <rect x="11" y="92" width="15" height="20" rx="7" className="fill-outline-variant" />

      {/* Body: flat orange with a flat lighter patch and a flat shade, no gradients */}
      <rect x="20" y="16" width="120" height="122" rx="46" className="fill-fuerte-body" />
      <g clipPath={`url(#${clipId})`}>
        <path d="M20 112h120v40H20z" className="fill-fuerte-shade opacity-25" />
        <ellipse cx="48" cy="34" rx="22" ry="12" className="fill-fuerte-light opacity-60" />
      </g>
      <rect x="29" y="25" width="102" height="104" rx="38" fill="none" strokeWidth="2" className="stroke-fuerte-shade opacity-40" />

      {/* Visor */}
      <rect x="36" y="44" width="88" height="50" rx="25" className="fill-on-surface" />
      <path d="M45 60c2-6 7-9.5 13-10.5" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-surface-container-lowest opacity-30" />

      {/* Eyes */}
      {state === 'celebration' ? (
        <path d={star(63) + star(97)} className="fill-surface-container-lowest" />
      ) : state === 'greeting' ? (
        <g fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-surface-container-lowest">
          <path d="M54 73q9-11 18 0M88 73q9-11 18 0" />
        </g>
      ) : state === 'sleeping' ? (
        <g fill="none" strokeWidth="3.4" strokeLinecap="round" className="stroke-surface-container-lowest">
          <path d="M54 69q9 7 18 0M88 69q9 7 18 0" />
        </g>
      ) : (
        <g>
          <circle cx="63" cy="69" r={state === 'attention' ? 12 : 11} className="fill-surface-container-lowest" />
          <circle cx="97" cy="69" r={state === 'attention' ? 12 : 11} className="fill-surface-container-lowest" />
          <g transform={PUPILS[state]}>
            <circle cx="63" cy="70" r="5.6" className="fill-on-surface" />
            <circle cx="97" cy="70" r="5.6" className="fill-on-surface" />
            <circle cx="61" cy="67.6" r="1.7" className="fill-surface-container-lowest" />
            <circle cx="95" cy="67.6" r="1.7" className="fill-surface-container-lowest" />
          </g>
        </g>
      )}

      {/* Brows */}
      <g fill="none" strokeWidth="3.4" strokeLinecap="round" className="stroke-surface-container-lowest">
        <path d="M55.5 53.5q7.5-4.2 15-0.6" transform={brows.left} />
        <path d="M89.5 52.9q7.5-3.6 15 0.6" transform={brows.right} />
      </g>

      {/* Lights panel: one light per completed level */}
      <rect x="38" y="104" width="84" height="14" rx="7" className="fill-on-surface" />
      {Array.from({ length: LIGHTS }, (_, i) => (
        <circle
          key={i}
          cx={44 + i * 12}
          cy="111"
          r="3.6"
          className={i < lit ? 'fill-fuerte-light' : 'fill-surface-container-lowest opacity-15'}
        />
      ))}

      {/* Combination dial, like an ear */}
      <g transform={`rotate(${DIAL[state]} 141 78)`}>
        <circle cx="141" cy="78" r="16" className="fill-outline-variant" />
        <circle cx="141" cy="78" r="9.5" className="fill-outline" />
        <path d="M141 70.5v5" strokeWidth="2.6" strokeLinecap="round" className="stroke-surface-container-lowest" />
      </g>
    </motion.svg>
  );
}
