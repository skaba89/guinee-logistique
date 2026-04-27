'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users, type User } from './test-data';

export type PageType = 'dashboard' | 'shipments' | 'tracking' | 'clients' | 'billing' | 'fleet' | 'settings' | 'maritime' | 'air-freight' | 'ground-transport' | 'parcels' | 'customs' | 'analytics' | 'warehouse' | 'quotations' | 'documents' | 'insurance' | 'partners' | 'incoterms' | 'reports' | 'drivers' | 'integrations' | 'claims' | 'multimodal' | 'contracts' | 'tasks' | 'calendar';

interface CargoState {
  isAuthenticated: boolean;
  currentPage: PageType;
  user: User | null;
  sidebarOpen: boolean;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  setPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useCargoStore = create<CargoState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentPage: 'dashboard' as PageType,
      user: null,
      sidebarOpen: false,
      login: (phone: string, password: string) => {
        const found = users.find(
          (u) => u.phone === phone && u.password === password
        );
        if (found) {
          set({
            isAuthenticated: true,
            user: found,
            currentPage: 'dashboard' as PageType,
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          currentPage: 'dashboard' as PageType,
          sidebarOpen: false,
        });
      },
      setPage: (page: PageType) => {
        set({ currentPage: page, sidebarOpen: false });
      },
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
    }),
    {
      name: 'freightflow-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        currentPage: state.currentPage,
      }),
    }
  )
);
