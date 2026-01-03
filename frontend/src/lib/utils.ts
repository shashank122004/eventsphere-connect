import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extract an id from an object that may use `id` or `_id`, or be a raw id string.
 */
export function getId(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return String(obj);
  if ('id' in obj && obj.id) return String(obj.id);
  if ('_id' in obj && obj._id) return String(obj._id);
  return null;
}
