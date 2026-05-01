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

export type PageType = 'dashboard' | 'shipments' | 'tracking' | 'clients' | 'billing' | 'fleet' | 'settings' | 'maritime' | 'air-freight' | 'ground-transport' | 'parcels' | 'customs' | 'analytics' | 'warehouse' | 'quotations' | 'documents' | 'insurance' | 'partners' | 'incoterms' | 'reports' | 'drivers' | 'integrations' | 'claims' | 'multimodal' | 'contracts' | 'tasks' | 'calendar' | 'customer-portal' | 'rates' | 'sustainability' | 'users' | 'chat' | 'scanner' | 'dangerous-goods' | 'temperature-controlled' | 'credit-management' | 'compliance' | 'hr' | 'expenses' | 'analytics-kpi' | 'validation' | 'messaging';

// ─── Currency system ──────────────────────────────────────────────
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  rate: number; // Exchange rate relative to DZD (base currency)
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  // ─── Dinar du Maghreb ───────────────────────────────────────
  DZD: { code: 'DZD', name: 'Dinar Algérien', symbol: 'DA', locale: 'fr-DZ', rate: 1 },
  MAD: { code: 'MAD', name: 'Dirham Marocain', symbol: 'MAD', locale: 'fr-MA', rate: 0.073 },
  TND: { code: 'TND', name: 'Dinar Tunisien', symbol: 'TND', locale: 'fr-TN', rate: 0.023 },
  LYD: { code: 'LYD', name: 'Dinar Libyen', symbol: 'LYD', locale: 'ar-LY', rate: 0.037 },
  // ─── Devises internationales ─────────────────────────────────
  USD: { code: 'USD', name: 'Dollar US', symbol: '$', locale: 'en-US', rate: 0.0075 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'fr-FR', rate: 0.0068 },
  GBP: { code: 'GBP', name: 'Livre Sterling', symbol: '£', locale: 'en-GB', rate: 0.0058 },
  JPY: { code: 'JPY', name: 'Yen Japonais', symbol: '¥', locale: 'ja-JP', rate: 1.13 },
  CNY: { code: 'CNY', name: 'Yuan Chinois', symbol: '¥', locale: 'zh-CN', rate: 0.054 },
  // ─── Devises africaines ─────────────────────────────────────
  XOF: { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'CFA', locale: 'fr-SN', rate: 4.46 },
  GNF: { code: 'GNF', name: 'Franc Guinéen', symbol: 'FG', locale: 'fr-GN', rate: 64.5 },
  NGN: { code: 'NGN', name: 'Naira Nigérian', symbol: '₦', locale: 'en-NG', rate: 11.5 },
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
  /** Whether sidebar is collapsed to icon-only mode on desktop */
  sidebarCollapsed: boolean;
  permissionsConfig: PermissionsConfig;
  /** Active currency code */
  currency: string;
  /** Navigation history for breadcrumbs */
  pageHistory: PageType[];
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  setPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
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
      sidebarCollapsed: false,
      permissionsConfig: loadPermissionsConfig(),
      currency: 'DZD',
      pageHistory: [],

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
          set({
            currentPage: page,
            sidebarOpen: false,
            pageHistory: [...state.pageHistory.slice(-9), state.currentPage],
          });
        }
        // If user can't view the page, silently ignore the navigation
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
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
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
