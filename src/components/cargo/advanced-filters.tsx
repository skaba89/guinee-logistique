/**
 * advanced-filters.tsx — Composant de filtres avancés réutilisable pour Guinée Logistique
 *
 * BRANCHEMENT : Importez AdvancedFilters depuis ce fichier.
 * Les filtres sont émis via onFiltersChange — c'est vous qui décidez
 * où les appliquer. Aucune modification des requêtes existantes.
 *
 * Exemple :
 *   <AdvancedFilters
 *     onFiltersChange={(filters) => setMyFilters(filters)}
 *     availableOrigins={['Alger', 'Paris', 'Marseille']}
 *     availableDestinations={['Alger', 'Dubaï', 'Djeddah']}
 *   />
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  Calendar,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Tag,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useFilters,
  type FilterState,
  type QuickPeriod,
  type UseFiltersOptions,
} from '@/hooks/use-filters';

// ─── Props ──────────────────────────────────────────────────────

export interface AdvancedFiltersProps extends UseFiltersOptions {
  /** Liste des origines disponibles pour l'autocomplete */
  availableOrigins?: string[];
  /** Liste des destinations disponibles */
  availableDestinations?: string[];
  /** Liste des clients disponibles */
  availableClients?: string[];
  /** Afficher le filtre de recherche textuelle */
  showSearch?: boolean;
  /** Afficher les filtres origine/destination */
  showLocationFilters?: boolean;
  /** Afficher le filtre client */
  showClientFilter?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Callback quand les filtres changent */
  onFiltersChange?: (filters: FilterState) => void;
}

// ─── Périodes rapides ──────────────────────────────────────────

const quickPeriods: { value: QuickPeriod; label: string; icon: React.ElementType }[] = [
  { value: '7j', label: '7 jours', icon: Clock },
  { value: '30j', label: '30 jours', icon: Clock },
  { value: '3m', label: '3 mois', icon: Calendar },
  { value: '6m', label: '6 mois', icon: Calendar },
  { value: '1an', label: '1 an', icon: Calendar },
  { value: 'all', label: 'Tout', icon: Filter },
];

// ─── Composant ──────────────────────────────────────────────────

export default function AdvancedFilters({
  availableOrigins = [],
  availableDestinations = [],
  availableClients = [],
  showSearch = true,
  showLocationFilters = true,
  showClientFilter = true,
  className = '',
  onFiltersChange,
  ...filterOptions
}: AdvancedFiltersProps) {
  const {
    filters,
    setFilter,
    resetFilters,
    setQuickPeriod,
    activeFilterCount,
    hasActiveFilters,
    availableCategories,
    availableStatuses,
  } = useFilters({ ...filterOptions, onFiltersChange });

  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`border-dashed ${hasActiveFilters ? 'border-teal-300 dark:border-teal-700' : 'border-gray-200 dark:border-gray-700'} ${className}`}>
      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Barre principale : recherche + boutons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher (N° suivi, client, ville...)"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="pl-8 h-9 text-sm"
              />
              {filters.search && (
                <button
                  onClick={() => setFilter('search', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Périodes rapides */}
            <div className="flex items-center gap-1 flex-wrap">
              {quickPeriods.map(p => (
                <Button
                  key={p.value}
                  variant={filters.quickPeriod === p.value ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[11px] px-2 ${
                    filters.quickPeriod === p.value
                      ? 'text-white'
                      : ''
                  }`}
                  style={
                    filters.quickPeriod === p.value
                      ? { background: 'linear-gradient(135deg, #0d9488, #059669)' }
                      : undefined
                  }
                  onClick={() => setQuickPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* Bouton étendre/réduire */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtres
              {activeFilterCount > 0 && (
                <Badge className="text-[9px] h-4 px-1 bg-teal-500 text-white">{activeFilterCount}</Badge>
              )}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>

            {/* Réinitialiser */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-red-500 hover:text-red-700 gap-1"
                onClick={resetFilters}
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Filtres avancés (dépliables) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                {/* Période personnalisée */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Période personnalisée
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={e => {
                        setFilter('dateFrom', e.target.value);
                        setFilter('quickPeriod', 'custom');
                      }}
                      className="h-8 text-xs"
                    />
                    <span className="text-gray-400 text-xs">→</span>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={e => {
                        setFilter('dateTo', e.target.value);
                        setFilter('quickPeriod', 'custom');
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Catégorie */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Catégorie
                  </label>
                  <Select value={filters.category} onValueChange={v => setFilter('category', v === '__all__' ? '' : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Toutes catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Toutes catégories</SelectItem>
                      {availableCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Statut */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Statut
                  </label>
                  <Select value={filters.status} onValueChange={v => setFilter('status', v === '__all__' ? '' : v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tous statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous statuts</SelectItem>
                      {availableStatuses.map(st => (
                        <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client */}
                {showClientFilter && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Client
                    </label>
                    <Select value={filters.client} onValueChange={v => setFilter('client', v === '__all__' ? '' : v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Tous les clients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tous les clients</SelectItem>
                        {availableClients.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Origine */}
                {showLocationFilters && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Origine
                    </label>
                    <Select value={filters.origin} onValueChange={v => setFilter('origin', v === '__all__' ? '' : v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Toutes origines" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Toutes origines</SelectItem>
                        {availableOrigins.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Destination */}
                {showLocationFilters && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Destination
                    </label>
                    <Select value={filters.destination} onValueChange={v => setFilter('destination', v === '__all__' ? '' : v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Toutes destinations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Toutes destinations</SelectItem>
                        {availableDestinations.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges des filtres actifs */}
        {hasActiveFilters && !expanded && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {filters.quickPeriod !== 'all' && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                <Clock className="w-2.5 h-2.5" />
                {quickPeriods.find(p => p.value === filters.quickPeriod)?.label}
                <button onClick={() => setQuickPeriod('all')}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                {availableCategories.find(c => c.value === filters.category)?.label}
                <button onClick={() => setFilter('category', '')}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                {availableStatuses.find(s => s.value === filters.status)?.label}
                <button onClick={() => setFilter('status', '')}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            )}
            {filters.client && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                {filters.client}
                <button onClick={() => setFilter('client', '')}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                &quot;{filters.search}&quot;
                <button onClick={() => setFilter('search', '')}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
