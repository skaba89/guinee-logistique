'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users, type User } from './test-data';
import { type RoleKey, mapRoleString, canViewPage, canEditPage } from './permissions';
import { loadPermissionsConfig, type PermissionsConfig } from './permissions';

// ─── Migration: rename old localStorage key ───────────────────────
// Migrate data from the old 'freightflow-storage' key to 'logisway-storage'
// so existing user sessions are preserved after the rebrand.
if (typeof window !== 'undefined') {
  try {
    const OLD_KEY = 'freightflow-storage';
    const NEW_KEY = 'logisway-storage';
    const oldData = localStorage.getItem(OLD_KEY);
    if (oldData && !localStorage.getItem(NEW_KEY)) {
      localStorage.setItem(NEW_KEY, oldData);
      localStorage.removeItem(OLD_KEY);
    } else if (oldData) {
      // New key already exists — just remove the old one
      localStorage.removeItem(OLD_KEY);
    }
  } catch {
    // Silently ignore migration errors (e.g. storage not accessible)
  }
}

export type PageType = 'dashboard' | 'shipments' | 'tracking' | 'clients' | 'billing' | 'fleet' | 'settings' | 'maritime' | 'air-freight' | 'ground-transport' | 'parcels' | 'customs' | 'analytics' | 'warehouse' | 'quotations' | 'documents' | 'insurance' | 'partners' | 'incoterms' | 'reports' | 'drivers' | 'integrations' | 'claims' | 'multimodal' | 'contracts' | 'tasks' | 'calendar' | 'customer-portal' | 'rates' | 'sustainability' | 'users' | 'chat' | 'scanner' | 'dangerous-goods' | 'temperature-controlled' | 'credit-management' | 'compliance' | 'hr' | 'expenses';

// ─── Currency system ──────────────────────────────────────────────
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  rate: number; // Exchange rate relative to DZD (base currency)
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  DZD: { code: 'DZD', name: 'Dinar Algérien', symbol: 'DA', locale: 'fr-DZ', rate: 1 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'fr-FR', rate: 0.0068 },
  USD: { code: 'USD', name: 'Dollar US', symbol: '$', locale: 'en-US', rate: 0.0075 },
  GBP: { code: 'GBP', name: 'Livre Sterling', symbol: '£', locale: 'en-GB', rate: 0.0058 },
  MAD: { code: 'MAD', name: 'Dirham Marocain', symbol: 'MAD', locale: 'fr-MA', rate: 0.073 },
  TND: { code: 'TND', name: 'Dinar Tunisien', symbol: 'TND', locale: 'fr-TN', rate: 0.023 },
  CNY: { code: 'CNY', name: 'Yuan Chinois', symbol: '¥', locale: 'zh-CN', rate: 0.054 },
  AED: { code: 'AED', name: 'Dirham EAU', symbol: 'AED', locale: 'ar-AE', rate: 0.0275 },
  SAR: { code: 'SAR', name: 'Riyal Saoudien', symbol: 'SAR', locale: 'ar-SA', rate: 0.028 },
  TRY: { code: 'TRY', name: 'Livre Turque', symbol: '₺', locale: 'tr-TR', rate: 0.25 },
  EGP: { code: 'EGP', name: 'Livre Égyptienne', symbol: 'E£', locale: 'ar-EG', rate: 0.37 },
  XOF: { code: 'XOF', name: 'Franc CFA', symbol: 'CFA', locale: 'fr-SN', rate: 4.46 },
  KRW: { code: 'KRW', name: 'Won Sud-Coréen', symbol: '₩', locale: 'ko-KR', rate: 10.9 },
  JPY: { code: 'JPY', name: 'Yen Japonais', symbol: '¥', locale: 'ja-JP', rate: 1.13 },
};

/** Format an amount in the given currency */
export function formatCurrency(amount: number, currencyCode: string = 'DZD'): string {
  const info = CURRENCIES[currencyCode] || CURRENCIES.DZD;
  const converted = amount * info.rate;
  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: converted < 1 ? 2 : 0,
    }).format(Math.round(converted)) + ' ' + info.symbol;
  } catch {
    return Math.round(converted).toLocaleString() + ' ' + info.symbol;
  }
}

/** Format amount in DZD (backward compat) */
export function formatDZD(amount: number): string {
  return formatCurrency(amount, 'DZD');
}

interface CargoState {
  isAuthenticated: boolean;
  currentPage: PageType;
  user: User | null;
  /** Normalized role key derived from user.role */
  roleKey: RoleKey;
  sidebarOpen: boolean;
  permissionsConfig: PermissionsConfig;
  /** Active currency code */
  currency: string;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  setPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPermissionsConfig: (config: PermissionsConfig) => void;
  setCurrency: (code: string) => void;
  /** Check if current user can view a page */
  canView: (page: PageType) => boolean;
  /** Check if current user can edit on a page */
  canEdit: (page: PageType) => boolean;
}

export const useCargoStore = create<CargoState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentPage: 'dashboard' as PageType,
      user: null,
      roleKey: 'viewer' as RoleKey,
      sidebarOpen: false,
      permissionsConfig: loadPermissionsConfig(),
      currency: 'DZD',

      login: (phone: string, password: string) => {
        const found = users.find(
          (u) => u.phone === phone && u.password === password
        );
        if (found) {
          const roleKey = mapRoleString(found.role);
          set({
            isAuthenticated: true,
            user: found,
            roleKey,
            currentPage: 'dashboard' as PageType,
            permissionsConfig: loadPermissionsConfig(),
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          roleKey: 'viewer' as RoleKey,
          currentPage: 'dashboard' as PageType,
          sidebarOpen: false,
        });
      },

      setPage: (page: PageType) => {
        const state = get();
        // Enforce permission check before navigating
        if (state.canView(page)) {
          set({ currentPage: page, sidebarOpen: false });
        }
        // If user can't view the page, silently ignore the navigation
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setPermissionsConfig: (config: PermissionsConfig) => {
        set({ permissionsConfig: config });
      },

      setCurrency: (code: string) => {
        if (CURRENCIES[code]) {
          set({ currency: code });
        }
      },

      canView: (page: PageType) => {
        const state = get();
        return canViewPage(page, state.roleKey, state.permissionsConfig);
      },

      canEdit: (page: PageType) => {
        const state = get();
        return canEditPage(page, state.roleKey, state.permissionsConfig);
      },
    }),
    {
      name: 'logisway-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        currentPage: state.currentPage,
        roleKey: state.roleKey,
        currency: state.currency,
      }),
    }
  )
);
