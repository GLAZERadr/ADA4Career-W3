import { DateTime } from 'luxon';

/**
 * Returns a string representation of time - either relative time for recent dates
 * or formatted time for older dates
 * @param dateString ISO date string
 * @param recentFormat What to display for dates less than 24 hours old
 * @returns Formatted time string
 */
export function smartTimeFormat(
  dateString: string,
  recentFormat = 'New'
): string {
  const date = DateTime.fromISO(dateString);
  const now = DateTime.now();

  // Calculate the difference in hours
  const diffInHours = now.diff(date, 'hours').hours;

  // If less than 24 hours, return the "recent" format
  if (diffInHours < 24) {
    return recentFormat;
  }

  // Otherwise return relative time (3 days ago, etc.)
  return date.toRelative() || 'unknown time';
}

/**
 * Checks if a date is less than 24 hours old
 * @param dateString ISO date string
 * @returns boolean - true if less than 24 hours old
 */
export function isRecent(dateString: string): boolean {
  const date = DateTime.fromISO(dateString);
  const now = DateTime.now();

  const diffInHours = now.diff(date, 'hours').hours;
  return diffInHours < 24;
}
