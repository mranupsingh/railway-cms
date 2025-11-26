import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractFirstPart = (inputString: string) => {
  const parts = inputString.split('/')
  const firstPart = parts[1]

  return firstPart
}

export const getInitials = (name: string): string => {
  if (!name) return '';
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  const firstInitial = words[0][0];
  const lastInitial = words[words.length - 1][0];
  return (firstInitial + lastInitial).toUpperCase();
};
