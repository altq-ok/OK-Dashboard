import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSnapshotTimestamp(filename: string | undefined) {
  if (!filename || filename === 'latest' || !filename.includes('_')) return '';

  // filename: 20251231_150000.parquet -> 20251231, 150000
  const cleanName = filename.replace('.parquet', '');
  const [datePart, timePart] = cleanName.split('_');

  if (datePart.length !== 8 || timePart.length !== 6) return filename;

  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);
  const hour = timePart.substring(0, 2);
  const min = timePart.substring(2, 4);

  return `${month}/${day} ${hour}:${min}`;
}

/**
 * Check if snapshot is as of today
 * @param filename e.g. "20260101_150000.parquet"
 */
export function isSnapshotToday(filename: string | undefined | null): boolean {
  if (!filename || filename === 'latest') return false;

  // Get the first 8 letters (YYYYMMDD)
  const fileDatePart = filename.split('_')[0];

  // Get local date with YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}${month}${day}`;

  return fileDatePart === todayStr;
}
