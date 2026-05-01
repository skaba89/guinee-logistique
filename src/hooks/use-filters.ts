/**
 * use-filters.ts — Hook de filtres avancés pour LogisWay
 *
 * BRANCHEMENT : Importez useFilters() depuis n'importe quel composant.
 * Les filtres sont émis via le callback onFiltersChange — c'est vous
 * qui décidez comment les appliquer à vos données.
 *
 * Exemple :
 *   const { filters, setFilter, resetFilters, quickPeriod } = useFilters({
 *     onFiltersChange: (f) => { /* filtrer vos données *\/ },
 *   });
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────

export type QuickPeriod = '7j' | '30j' | '3m' | '6m' | '1an' | 'all' | 'custom';

export interface FilterState {
  /** Période rapide sélectionnée */
  quickPeriod: QuickPeriod;
  /** Date de début personnalisée */
  dateFrom: string;
  /** Date de fin personnalisée */
  dateTo: string;
  /** Filtre par catégorie (ex: type d'expédition) */
  category: string;
  /** Filtre par statut */
  status: string;
  /** Filtre par ville/pays d'origine */
  origin: string;
  /** Filtre par ville/pays de destination */
  destination: string;
  /** Filtre par client */
  client: string;
  /** Recherche textuelle */
  search: string;
  /** Filtres personnalisés dynamiques */
  custom: Record<string, string>;
}

export interface UseFiltersOptions {
  /** Callback appelé quand les filtres changent */
  onFiltersChange?: (filters: FilterState) => void;
  /** Valeurs initiales */
  initialFilters?: Partial<FilterState>;
  /** Liste des catégories disponibles */
  availableCategories?: { value: string; label: string }[];
  /** Liste des statuts disponibles */
  availableStatuses?: { value: string; label: string }[];
}

export interface UseFiltersReturn {
  /** État actuel des filtres */
  filters: FilterState;
  /** Mettre à jour un filtre individuel */
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  /** Réinitialiser tous les filtres */
  resetFilters: () => void;
  /** Appliquer une période rapide */
  setQuickPeriod: (period: QuickPeriod) => void;
  /** Nombre de filtres actifs (non vides) */
  activeFilterCount: number;
  /** Indique si des filtres sont actifs */
  hasActiveFilters: boolean;
  /** Catégories disponibles */
  availableCategories: { value: string; label: string }[];
  /** Statuts disponibles */
  availableStatuses: { value: string; label: string }[];
}

// ─── Valeurs par défaut ────────────────────────────────────────

const defaultFilters: FilterState = {
  quickPeriod: 'all',
  dateFrom: '',
  dateTo: '',
  category: '',
  status: '',
  origin: '',
  destination: '',
  client: '',
  search: '',
  custom: {},
};

const defaultCategories = [
  { value: 'aerien', label: 'Aérien' },
  { value: 'maritime', label: 'Maritime' },
  { value: 'terrestre', label: 'Terrestre' },
  { value: 'colis', label: 'Colis & Courier' },
];

const defaultStatuses = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'en_transit', label: 'En transit' },
  { value: 'livree', label: 'Livrée' },
  { value: 'retardee', label: 'Retardée' },
  { value: 'annulee', label: 'Annulée' },
];

// ─── Helper : calculer les dates d'une période rapide ──────────

function getQuickPeriodDates(period: QuickPeriod): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);

  switch (period) {
    case '7j': {
      const from = new Date(now.getTime() - 7 * 24 * 3600000).toISOString().slice(0, 10);
      return { from, to };
    }
    case '30j': {
      const from = new Date(now.getTime() - 30 * 24 * 3600000).toISOString().slice(0, 10);
      return { from, to };
    }
    case '3m': {
      const from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().slice(0, 10);
      return { from, to };
    }
    case '6m': {
      const from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().slice(0, 10);
      return { from, to };
    }
    case '1an': {
      const from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().slice(0, 10);
      return { from, to };
    }
    case 'all':
    default:
      return { from: '', to: '' };
  }
}

// ─── Helper : compter les filtres actifs ────────────────────────

function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.quickPeriod !== 'all') count++;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.category) count++;
  if (filters.status) count++;
  if (filters.origin) count++;
  if (filters.destination) count++;
  if (filters.client) count++;
  if (filters.search) count++;
  Object.values(filters.custom).forEach(v => { if (v) count++; });
  return count;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const {
    onFiltersChange,
    initialFilters,
    availableCategories: propCategories,
    availableStatuses: propStatuses,
  } = options;

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const availableCategories = propCategories || defaultCategories;
  const availableStatuses = propStatuses || defaultStatuses;

  // Notifier le parent quand les filtres changent
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...defaultFilters, ...initialFilters });
  }, [initialFilters]);

  const setQuickPeriod = useCallback((period: QuickPeriod) => {
    if (period === 'custom') {
      setFilters(prev => ({ ...prev, quickPeriod: 'custom' }));
    } else {
      const { from, to } = getQuickPeriodDates(period);
      setFilters(prev => ({
        ...prev,
        quickPeriod: period,
        dateFrom: from,
        dateTo: to,
      }));
    }
  }, []);

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilter,
    resetFilters,
    setQuickPeriod,
    activeFilterCount,
    hasActiveFilters,
    availableCategories,
    availableStatuses,
  };
}

// ─── Helper : filtrer des données génériques ────────────────────

export function applyFiltersToArray<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterState,
  options?: {
    dateField?: string;
    categoryField?: string;
    statusField?: string;
    originField?: string;
    destinationField?: string;
    clientField?: string;
    searchFields?: string[];
  }
): T[] {
  let result = [...data];

  const {
    dateField = 'dateCreation',
    categoryField = 'type',
    statusField = 'status',
    originField = 'origin',
    destinationField = 'destination',
    clientField = 'clientName',
    searchFields = ['trackingNumber', 'clientName', 'origin', 'destination'],
  } = options || {};

  // Filtre par date
  if (filters.dateFrom) {
    result = result.filter(item => {
      const date = String(item[dateField] || '');
      return date >= filters.dateFrom;
    });
  }
  if (filters.dateTo) {
    result = result.filter(item => {
      const date = String(item[dateField] || '');
      return date <= filters.dateTo;
    });
  }

  // Filtre par catégorie
  if (filters.category) {
    result = result.filter(item => String(item[categoryField] || '') === filters.category);
  }

  // Filtre par statut
  if (filters.status) {
    result = result.filter(item => String(item[statusField] || '') === filters.status);
  }

  // Filtre par origine
  if (filters.origin) {
    result = result.filter(item =>
      String(item[originField] || '').toLowerCase().includes(filters.origin.toLowerCase())
    );
  }

  // Filtre par destination
  if (filters.destination) {
    result = result.filter(item =>
      String(item[destinationField] || '').toLowerCase().includes(filters.destination.toLowerCase())
    );
  }

  // Filtre par client
  if (filters.client) {
    result = result.filter(item =>
      String(item[clientField] || '').toLowerCase().includes(filters.client.toLowerCase())
    );
  }

  // Recherche textuelle
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(item =>
      searchFields.some(field => {
        const val = String(item[field] || '').toLowerCase();
        return val.includes(searchLower);
      })
    );
  }

  // Filtres personnalisés
  Object.entries(filters.custom).forEach(([key, value]) => {
    if (value) {
      result = result.filter(item =>
        String(item[key] || '').toLowerCase().includes(value.toLowerCase())
      );
    }
  });

  return result;
}
