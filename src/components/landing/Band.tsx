import React from 'react';
import { SectionCurve } from './SectionCurve';

export type BandTone = 'cream' | 'ink' | 'gold';

interface BandProps {
  tone: BandTone;
  /** Tone of the band that follows; draws a curved edge into it. Omit for no curve. */
  next?: BandTone;
  children: React.ReactNode;
}

/**
 * Full-width color band for landing sections. Ink and gold bands carry the `dark`
 * class so existing `dark:` colors inside them stay readable in both themes.
 */
export const Band: React.FC<BandProps> = ({ tone, next, children }) => {
  const themeClass = tone === 'cream' ? 'band-cream' : `band-${tone} dark`;
  return (
    <div className={`band ${themeClass} relative overflow-x-clip ${next ? 'pb-16 sm:pb-24' : ''}`}>
      {children}
      {next && <SectionCurve fill={`var(--band-${next})`} />}
    </div>
  );
};
