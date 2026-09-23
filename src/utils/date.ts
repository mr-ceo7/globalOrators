/**
 * Today's date as YYYY-MM-DD in the user's own timezone.
 * (toISOString() gives the UTC date, which is "yesterday" for the first hours of the day
 * in Nairobi and other zones ahead of UTC.)
 */
export const localDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Display time for a chat message. ISO timestamps are shown as local HH:MM; anything else
 * (e.g. seeded "Today, 09:30 AM") is shown as-is. Returns '' when there is no timestamp.
 */
export const formatMessageTime = (timestamp?: string | null): string => {
  if (!timestamp) return '';
  if (/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  return timestamp;
};

/** Sort key for messages: real timestamps in time order, unparseable ones (seed data) first. */
export const messageTimeValue = (timestamp?: string | null): number => {
  if (!timestamp) return 0;
  const value = /^\d{4}-\d{2}-\d{2}T/.test(timestamp) ? new Date(timestamp).getTime() : NaN;
  return Number.isNaN(value) ? 0 : value;
};

/** Oldest first; a stable sort, so messages without a real timestamp keep their order. */
export const sortByMessageTime = <T extends { timestamp?: string | null }>(messages: T[]): T[] =>
  [...messages].sort((a, b) => messageTimeValue(a.timestamp) - messageTimeValue(b.timestamp));
