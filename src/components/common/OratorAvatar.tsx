import React, { useState, useEffect } from 'react';

export interface OratorAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
  title?: string;
}

/**
 * Extract clean, high-contrast initials from person's name,
 * filtering out common academic and coaching honorifics.
 */
export const getOratorInitials = (name: string): string => {
  if (!name || !name.trim()) return 'GO';
  const cleaned = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Coach)\s+/i, '').trim();
  const parts = (cleaned || name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'GO';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * OratorAvatar
 * Resilient, zero-slop avatar component that gracefully renders profile photos with
 * referrerPolicy protection, and immediately falls back to high-contrast editorial
 * monograms on missing images, 404s, network blocks, or empty avatar fields.
 */
export const OratorAvatar: React.FC<OratorAvatarProps> = ({
  src,
  name,
  className = 'h-10 w-10 rounded-xl',
  imageClassName = '',
  fallbackClassName = '',
  alt,
  title,
}) => {
  const [hasError, setHasError] = useState(false);
  const trimmedSrc = src?.trim();

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [trimmedSrc]);

  const initials = getOratorInitials(name);

  // If no source or failed to load, render solid high-contrast editorial monogram
  if (!trimmedSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center font-mono font-bold select-none shrink-0 bg-slate-800 text-slate-200 border border-slate-700/80 ${className} ${fallbackClassName}`}
        title={title || name}
        aria-label={alt || name}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={alt || name}
      title={title || name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover shrink-0 ${className} ${imageClassName}`}
    />
  );
};
