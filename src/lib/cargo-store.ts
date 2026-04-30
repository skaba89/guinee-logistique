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

interface CargoState {
  isAuthenticated: boolean;
  currentPage: PageType;
  user: User | null;
  /** Normalized role key derived from user.role */
  roleKey: RoleKey;
  sidebarOpen: boolean;
  permissionsConfig: PermissionsConfig;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  setPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPermissionsConfig: (config: PermissionsConfig) => void;
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
      }),
    }
  )
);
