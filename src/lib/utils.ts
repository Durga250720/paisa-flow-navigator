import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIndianNumber = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount);
};

export const toTitleCase = (str = '') => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getCibilColor = (cibil: number | undefined) => {
  if (!cibil) return 'text-gray-600';
  const score = cibil;
  if (isNaN(score)) return 'text-gray-600';
  if (score >= 750) return 'text-green-600';
  if (score >= 650) return 'text-yellow-600';
  return 'text-red-600';
};

 export const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };