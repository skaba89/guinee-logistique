'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NavGroupKey } from '@/lib/module-config';

/**
 * Hook: use-sidebar-collapse
 * ──────────────────────────────────────────────────────────────
 * Gère l'état ouvert/fermé de chaque groupe de navigation dans la sidebar.
 * L'état est persisté dans localStorage pour conserver les préférences
 * de l'utilisateur entre les sessions.
 *
 * ─── Fonctionnalités ──────────────────────────────────────────
 * - Persistance localStorage (clé: guinee-logistique-sidebar-collapse)
 * - Auto-ouverture du groupe contenant la page active
 * - Toggle individuel par groupe
 * - Ouvrir / Fermer tous les groupes
 * - Reset à l'état par défaut (tous ouverts)
 */

const STORAGE_KEY = 'guinee-logistique-sidebar-collapse';

/** État d'ouverture de chaque groupe — true = ouvert, false = fermé */
export type CollapseState = Partial<Record<NavGroupKey, boolean>>;

/** Valeur par défaut : tous les groupes sont ouverts */
const DEFAULT_ALL_OPEN: CollapseState = {};

/**
 * Charge l'état depuis localStorage.
 * Retourne {} (tous ouverts) si aucune donnée persistée.
 */
function loadState(): CollapseState {
  if (typeof window === 'undefined') return DEFAULT_ALL_OPEN;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as CollapseState;
      }
    }
  } catch {
    // Silently ignore parse errors
  }
  return DEFAULT_ALL_OPEN;
}

/**
 * Sauvegarde l'état dans localStorage.
 */
function saveState(state: CollapseState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently ignore storage errors
  }
}

export interface UseSidebarCollapseReturn {
  /** État d'ouverture de chaque groupe */
  collapseState: CollapseState;
  /** Vérifie si un groupe est ouvert (défaut: true) */
  isOpen: (group: NavGroupKey) => boolean;
  /** Toggle l'état d'un groupe */
  toggle: (group: NavGroupKey) => void;
  /** Ouvre un groupe spécifique */
  open: (group: NavGroupKey) => void;
  /** Ferme un groupe spécifique */
  close: (group: NavGroupKey) => void;
  /** Ouvre tous les groupes */
  openAll: () => void;
  /** Ferme tous les groupes */
  closeAll: () => void;
  /** Reset à l'état par défaut (tous ouverts) */
  reset: () => void;
  /** Auto-ouvre le groupe contenant la page active */
  ensureGroupOpen: (group: NavGroupKey) => void;
}

export function useSidebarCollapse(): UseSidebarCollapseReturn {
  const [storedState, setCollapseState] = useState<CollapseState | null>(null);
  const collapseState = storedState ?? DEFAULT_ALL_OPEN;

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const timer = window.setTimeout(() => setCollapseState(prev => prev ?? loadState()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Persister chaque changement
  useEffect(() => {
    if (storedState !== null) saveState(storedState);
  }, [storedState]);

  const isOpen = useCallback(
    (group: NavGroupKey): boolean => {
      // Par défaut, un groupe est ouvert si non spécifié
      return collapseState[group] !== false;
    },
    [collapseState]
  );

  const toggle = useCallback((group: NavGroupKey) => {
    setCollapseState((prev) => ({
      ...(prev ?? loadState()),
      [group]: (prev ?? loadState())[group] === false ? true : false,
    }));
  }, []);

  const open = useCallback((group: NavGroupKey) => {
    setCollapseState((prev) => ({
      ...(prev ?? loadState()),
      [group]: true,
    }));
  }, []);

  const close = useCallback((group: NavGroupKey) => {
    setCollapseState((prev) => ({
      ...(prev ?? loadState()),
      [group]: false,
    }));
  }, []);

  const openAll = useCallback(() => {
    setCollapseState(DEFAULT_ALL_OPEN);
  }, []);

  const closeAll = useCallback(() => {
    setCollapseState((prev) => {
      const allClosed: CollapseState = {};
      // Fermer tous les groupes connus
      const groups: NavGroupKey[] = [
        'principal', 'fret', 'services', 'commercial',
        'gestion', 'communication', 'conformite', 'portail', 'systeme',
      ];
      groups.forEach((g) => {
        allClosed[g] = false;
      });
      return allClosed;
    });
  }, []);

  const reset = useCallback(() => {
    setCollapseState(DEFAULT_ALL_OPEN);
  }, []);

  const ensureGroupOpen = useCallback((group: NavGroupKey) => {
    setCollapseState((prev) => {
      if ((prev ?? loadState())[group] === false) {
        return { ...(prev ?? loadState()), [group]: true };
      }
      return prev; // Pas de changement si déjà ouvert
    });
  }, []);

  return {
    collapseState,
    isOpen,
    toggle,
    open,
    close,
    openAll,
    closeAll,
    reset,
    ensureGroupOpen,
  };
}
