'use client';

/**
 * ══════════════════════════════════════════════════════════════════
 *  Collapsible Sidebar Navigation — Guinée Logistique
 * ══════════════════════════════════════════════════════════════════
 *
 *  Barre latérale avec menus déroulants par catégorie.
 *  Chaque groupe de navigation est un collapsible que l'utilisateur
 *  peut ouvrir/fermer. Supporte le mode icônes uniquement (collapsed).
 *
 *  ─── CARACTÉRISTIQUES ──────────────────────────────────────────
 *  • Menus déroulants animés par catégorie (Collapsible Radix)
 *  • Mode icônes uniquement avec tooltips (collapsed)
 *  • Auto-ouverture du groupe contenant la page active
 *  • Persistance de l'état ouvert/fermé (localStorage)
 *  • Indicateur visuel de page active (barre teal + point animé)
 *  • Compteur d'items par groupe dans l'en-tête
 *  • Chevron animé pour l'état ouvert/fermé
 *  • Compatible avec le système de permissions RBAC existant
 */

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  ArrowRight,
  ChevronDown,
  LogOut,
  X,
  FolderOpen,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCargoStore } from '@/lib/cargo-store';
import { getFilteredNavigation } from '@/lib/permissions';
import { useSidebarCollapse } from '@/hooks/use-sidebar-collapse';
import { brandGradient } from '@/lib/design-tokens';
import type { NavGroupKey } from '@/lib/module-config';

// ─── Icônes de groupe ──────────────────────────────────────────
import {
  LayoutDashboard,
  Ship as ShipIcon,
  Wrench,
  Briefcase,
  Settings2,
  MessageSquare,
  ShieldCheck,
  Globe,
  Server,
} from 'lucide-react';

const groupIconMap: Record<NavGroupKey, React.ElementType> = {
  principal: LayoutDashboard,
  fret: ShipIcon,
  services: Wrench,
  commercial: Briefcase,
  gestion: Settings2,
  communication: MessageSquare,
  conformite: ShieldCheck,
  portail: Globe,
  systeme: Server,
};

// Couleurs d'accentuation par groupe (subtil, pour l'icône du header)
const groupAccentMap: Record<NavGroupKey, string> = {
  principal: 'text-teal-400',
  fret: 'text-sky-400',
  services: 'text-violet-400',
  commercial: 'text-amber-400',
  gestion: 'text-emerald-400',
  communication: 'text-pink-400',
  conformite: 'text-orange-400',
  portail: 'text-cyan-400',
  systeme: 'text-slate-400',
};

interface CollapsibleSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function CollapsibleSidebarNav({ collapsed = false, onNavigate }: CollapsibleSidebarNavProps) {
  const { currentPage, setPage, roleKey, permissionsConfig, clientId, logout } = useCargoStore();
  const { isOpen, toggle, ensureGroupOpen, openAll } = useSidebarCollapse();

  // Construire la navigation filtrée par rôle & permissions (et visibilité client)
  const filteredNavGroups = useMemo(() => {
    return getFilteredNavigation(roleKey, permissionsConfig, clientId || undefined);
  }, [roleKey, permissionsConfig, clientId]);

  // Auto-ouvrir le groupe contenant la page active quand elle change
  useEffect(() => {
    if (collapsed) return;
    const activeGroup = filteredNavGroups.find((group) =>
      group.items.some((item) => item.id === currentPage)
    );
    if (activeGroup) {
      ensureGroupOpen(activeGroup.key as NavGroupKey);
    }
  }, [currentPage, filteredNavGroups, ensureGroupOpen, collapsed]);

  const handleNav = (pageId: string) => {
    setPage(pageId as any);
    onNavigate?.();
  };

  // ─── COLLAPSED MODE: Icon-only sidebar ──────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center py-4 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center relative"
            style={{ background: brandGradient }}
          >
            <Ship className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Icon navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="space-y-1 px-2">
            {filteredNavGroups.map((group) => {
              const groupKey = group.key as NavGroupKey;
              const GroupIcon = groupIconMap[groupKey] || FolderOpen;
              const accentColor = groupAccentMap[groupKey] || 'text-teal-400';
              const isGroupActive = group.items.some((item) => item.id === currentPage);

              return (
                <React.Fragment key={groupKey}>
                  {/* Group icon as section divider */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center justify-center py-1.5 ${isGroupActive ? accentColor : 'text-slate-600'}`}>
                        <GroupIcon className="w-3.5 h-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {group.label}
                    </TooltipContent>
                  </Tooltip>

                  {/* Items as icon buttons */}
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id;
                    const IconComponent = item.icon;
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNav(item.id)}
                            className={`
                              w-full flex items-center justify-center py-2 rounded-lg transition-all duration-200 relative
                              ${isActive
                                ? 'bg-teal-500/15 text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                              }
                            `}
                          >
                            <IconComponent className={`w-4.5 h-4.5 ${isActive ? 'text-teal-400' : ''}`} />
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active-bar-collapsed"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-r-full"
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                              />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-2 pb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center py-2.5 rounded-lg text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Déconnexion
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // ─── EXPANDED MODE: Full sidebar with collapsible groups ─────────
  return (
    <div className="flex flex-col h-full">
      {/* ─── En-tête sidebar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center relative"
            style={{ background: brandGradient }}
          >
            <Ship className="w-5 h-5 text-white" />
            <div
              className="absolute -right-0.5 -top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: '#0f172a', border: '1.5px solid #0d9488' }}
            >
              <ArrowRight className="w-2 h-2 text-teal-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Guinée Logistique</h1>
            <p className="text-[9px] text-teal-300/50 uppercase tracking-widest">Logistique</p>
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="lg:hidden text-white/60 hover:text-white p-1"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Navigation déroulante par catégorie ─────────────── */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {filteredNavGroups.map((group) => {
          const groupKey = group.key as NavGroupKey;
          const open = isOpen(groupKey);
          const GroupIcon = groupIconMap[groupKey] || FolderOpen;
          const accentColor = groupAccentMap[groupKey] || 'text-teal-400';
          const isGroupActive = group.items.some((item) => item.id === currentPage);

          return (
            <Collapsible
              key={groupKey}
              open={open}
              onOpenChange={() => toggle(groupKey)}
            >
              {/* ── En-tête du groupe (cliquable) ── */}
              <CollapsibleTrigger asChild>
                <button
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 group/trigger
                    ${
                      isGroupActive
                        ? 'bg-white/5 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }
                  `}
                  aria-expanded={open}
                  aria-label={`${group.label} — ${open ? 'Fermer' : 'Ouvrir'}`}
                >
                  {/* Icône du groupe */}
                  <GroupIcon className={`w-4 h-4 flex-shrink-0 ${isGroupActive ? accentColor : 'text-slate-500 group-hover/trigger:text-slate-400'}`} />

                  {/* Label du groupe */}
                  <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
                    {group.label}
                  </span>

                  {/* Compteur d'items */}
                  <span className="text-[10px] text-slate-500 tabular-nums mr-1">
                    {group.items.length}
                  </span>

                  {/* Chevron animé */}
                  <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-colors ${open ? 'text-teal-400' : 'text-slate-600 group-hover/trigger:text-slate-400'}`} />
                  </motion.div>
                </button>
              </CollapsibleTrigger>

              {/* ── Contenu déroulant (items du groupe) ── */}
              <CollapsibleContent forceMount>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 pl-2 py-1">
                        {group.items.map((item) => {
                          const isActive = currentPage === item.id;
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleNav(item.id)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                                transition-all duration-200 group/item
                                ${
                                  isActive
                                    ? 'bg-teal-500/15 text-white shadow-sm border-l-2 border-teal-400'
                                    : 'text-slate-300/70 hover:bg-white/5 hover:text-white'
                                }
                              `}
                            >
                              <IconComponent
                                className={`w-4 h-4 flex-shrink-0 ${
                                  isActive ? 'text-teal-400' : 'text-slate-500 group-hover/item:text-slate-300'
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-indicator-collapsible"
                                  className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"
                                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* ─── Pied de sidebar ──────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
