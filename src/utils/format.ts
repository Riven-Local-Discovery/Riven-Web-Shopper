import type { OrderStatus, PaymentMethod } from '@/api/types';

export function formatPrice(amount: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const start = `${MONTHS[s.getMonth()]} ${s.getDate()}`;
  const end = s.getMonth() === e.getMonth() ? `${e.getDate()}` : `${MONTHS[e.getMonth()]} ${e.getDate()}`;
  return `${start} – ${end}, ${e.getFullYear()}`;
}

export function formatDistance(km?: number) {
  if (km === undefined) return '';
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName?: string) {
  return fullName?.split(' ')[0] ?? '';
}

export function initials(name?: string) {
  return (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral' }> = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'neutral' },
  shipped: { label: 'Shipped', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card: 'Credit / Debit Card',
  wallet: 'Mobile Wallet',
  fawry: 'Fawry',
  apple_pay: 'Apple Pay',
  cash_on_delivery: 'Cash on Delivery',
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
export const isValidPassword = (password: string) => password.length >= 8 && /\d/.test(password);
