/**
 * ══════════════════════════════════════════════════════════════════
 *  Design Tokens — Guinée Logistique
 * ══════════════════════════════════════════════════════════════════
 *
 *  Centralized design tokens for status colors, type colors,
 *  gradients, and other shared visual constants.
 *
 *  Eliminates duplication across 6+ page components.
 */

// ─── Status Colors (Tailwind classes) ──────────────────────────
export const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  // Container statuses
  available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  loaded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  arrived: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  empty: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  // Invoice statuses
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  // Vehicle statuses
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  out_of_service: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  // Flight statuses
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  boarding: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  departed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  landed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  delayed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// ─── Status Dot Colors (for indicators) ────────────────────────
export const statusDotColors: Record<string, string> = {
  en_attente: 'bg-yellow-400',
  confirmee: 'bg-blue-400',
  en_transit: 'bg-orange-400',
  livree: 'bg-green-400',
  retardee: 'bg-red-400',
  annulee: 'bg-gray-400',
  active: 'bg-green-400',
  maintenance: 'bg-amber-400',
  out_of_service: 'bg-red-400',
  paid: 'bg-green-400',
  unpaid: 'bg-red-400',
  overdue: 'bg-red-400',
};

// ─── Type Colors (for charts and icons) ────────────────────────
export const typeColors: Record<string, string> = {
  aerien: '#0ea5e9',
  maritime: '#0d9488',
  terrestre: '#f59e0b',
  parcels: '#8b5cf6',
  multimodal: '#ec4899',
};

export const typeColorsTw: Record<string, string> = {
  aerien: 'text-sky-500',
  maritime: 'text-teal-500',
  terrestre: 'text-amber-500',
  parcels: 'text-violet-500',
  multimodal: 'text-pink-500',
};

export const typeBgColors: Record<string, string> = {
  aerien: 'bg-sky-100 dark:bg-sky-900/30',
  maritime: 'bg-teal-100 dark:bg-teal-900/30',
  terrestre: 'bg-amber-100 dark:bg-amber-900/30',
  parcels: 'bg-violet-100 dark:bg-violet-900/30',
  multimodal: 'bg-pink-100 dark:bg-pink-900/30',
};

// ─── Brand Gradient ────────────────────────────────────────────
export const brandGradient = 'linear-gradient(135deg, #0d9488, #059669)';
export const brandGradientClass = 'bg-gradient-to-br from-teal-500 to-emerald-600';

// ─── Sidebar gradient ─────────────────────────────────────────
export const sidebarGradient = 'linear-gradient(180deg, #0f172a 0%, #0a2520 100%)';

// ─── Priority Colors ──────────────────────────────────────────
export const priorityColors: Record<string, string> = {
  haute: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  moyenne: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  basse: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

// ─── Chart Palette ────────────────────────────────────────────
export const chartPalette = ['#0d9488', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#10b981'];
