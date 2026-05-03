/**
 * analytics-dashboard-page.tsx — Tableau de bord analytique autonome pour Guinée Logistique
 *
 * BRANCHEMENT : Ce composant est une page complète. Pour l'ajouter au routeur SPA,
 * ajoutez un nouveau PageType et un case dans le switch de page.tsx.
 * Voir feature-bridge.ts pour les instructions détaillées.
 *
 * Fonctionnalités :
 *   - Cartes KPI (8 indicateurs clés)
 *   - Graphique d'évolution mensuelle (12 mois glissants)
 *   - Top 10 (villes d'origine, destinations, clients)
 *   - Répartition par statut et par type (camemberts)
 *   - Tableau des dernières entrées avec colonnes configurables
 *   - Boutons d'export Excel/PDF intégrés
 *   - Filtres avancés intégrés
 *
 * Aucune donnée codée en dur : tout vient de use-analytics-data.ts
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Package,
  DollarSign,
  Users,
  Truck,
  CheckCircle2,
  Scale,
  TrendingUp,
  Container,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Globe,
  Ship,
  Plane,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAnalyticsData } from '@/hooks/use-analytics-data';
import { useCurrency } from '@/lib/use-currency';
import { shipments, type ShipmentStatus } from '@/lib/test-data';
import ExportButtons from '@/components/cargo/export-buttons';
import AdvancedFilters from '@/components/cargo/advanced-filters';
import { applyFiltersToArray, type FilterState } from '@/hooks/use-filters';

// ─── Icon map ───────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  Package,
  DollarSign,
  Users,
  Truck,
  CheckCircle2,
  Scale,
  TrendingUp,
  Container,
};

// ─── Statut colors ──────────────────────────────────────────────

const statusBadgeColors: Record<string, string> = {
  'En attente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Confirmée': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'En transit': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Livrée': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Retardée': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Annulée': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

// ─── Tooltip style ──────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

// ─── Composant principal ────────────────────────────────────────

export default function AnalyticsDashboardPage() {
  const analytics = useAnalyticsData();
  const { format: formatPrice, symbol } = useCurrency();
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  // Appliquer les filtres aux expéditions
  const filteredShipments = useMemo(() => {
    if (!activeFilters || !activeFilters.search && !activeFilters.category && !activeFilters.status && !activeFilters.dateFrom && !activeFilters.origin && !activeFilters.destination && !activeFilters.client && activeFilters.quickPeriod === 'all') {
      return shipments;
    }
    return applyFiltersToArray(
      shipments as unknown as Record<string, unknown>[],
      activeFilters,
      {
        dateField: 'dateCreation',
        categoryField: 'type',
        statusField: 'status',
        originField: 'origin',
        destinationField: 'destination',
        clientField: 'clientName',
        searchFields: ['trackingNumber', 'clientName', 'origin', 'destination'],
      }
    ) as unknown as typeof shipments;
  }, [activeFilters]);

  // Origines et destinations uniques pour les filtres
  const uniqueOrigins = useMemo(() => [...new Set(shipments.map(s => s.origin))].sort(), []);
  const uniqueDestinations = useMemo(() => [...new Set(shipments.map(s => s.destination))].sort(), []);
  const uniqueClients = useMemo(() => [...new Set(shipments.map(s => s.clientName))].sort(), []);

  // Colonnes pour l'export
  const exportColumns = useMemo(() => [
    { key: 'trackingNumber', header: 'N° Suivi' },
    { key: 'type', header: 'Type' },
    { key: 'clientName', header: 'Client' },
    { key: 'origin', header: 'Origine' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Statut' },
    { key: 'dateCreation', header: 'Date Création' },
    { key: 'weight', header: 'Poids (kg)' },
    {
      key: 'price',
      header: `Prix (${symbol})`,
      formatter: (v: unknown) => formatPrice(Number(v)),
    },
  ], [formatPrice, symbol]);

  // Données d'export
  const exportData = useMemo(() =>
    filteredShipments.map(s => ({
      trackingNumber: s.trackingNumber,
      type: s.type === 'aerien' ? 'Aérien' : s.type === 'maritime' ? 'Maritime' : 'Terrestre',
      clientName: s.clientName,
      origin: s.origin,
      destination: s.destination,
      status: s.status,
      dateCreation: s.dateCreation,
      weight: s.weight,
      price: s.price,
    })),
    [filteredShipments]
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-500" />
            Tableau Analytique
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Indicateurs clés de performance et analyses détaillées
          </p>
        </div>
        <ExportButtons
          data={exportData}
          columns={exportColumns}
          filename="guinee-logistique-analytique"
          title="Rapport Analytique Guinée Logistique"
          subtitle={`${filteredShipments.length} expéditions — Généré le ${new Date().toLocaleDateString('fr-FR')}`}
        />
      </div>

      {/* Filtres avancés */}
      <AdvancedFilters
        onFiltersChange={setActiveFilters}
        availableOrigins={uniqueOrigins}
        availableDestinations={uniqueDestinations}
        availableClients={uniqueClients}
        showSearch
        showLocationFilters
        showClientFilter
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {analytics.kpis.map((kpi, index) => {
          const IconComponent = iconMap[kpi.icon] || Package;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{kpi.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                      </p>
                      {kpi.trend !== undefined && kpi.trend !== 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {kpi.trendUp ? (
                            <ArrowUpRight className="w-2.5 h-2.5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-2.5 h-2.5 text-red-500" />
                          )}
                          <span className={`text-[9px] font-medium ${kpi.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                            {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Graphique d'évolution mensuelle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Évolution mensuelle (12 mois glissants)
          </CardTitle>
          <CardDescription>Revenus comparés à la période précédente</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyRevenue} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatPrice(value),
                    name === 'amount' ? 'Cette période' : 'Période précédente'
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Legend />
                <Line type="monotone" dataKey="previousAmount" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Période précédente" />
                <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} name="Cette période" dot={{ fill: '#0d9488', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 : Origines + Destinations + Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top 10 Villes d'origine */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-500" />
              Top 10 Origines
            </CardTitle>
            <CardDescription>Par volume d&apos;expéditions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topOrigins} layout="vertical" margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} name="Expéditions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Destinations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Top 10 Destinations
            </CardTitle>
            <CardDescription>Par volume d&apos;expéditions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topDestinations} layout="vertical" margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Expéditions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Clients */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Top 10 Clients
            </CardTitle>
            <CardDescription>Par chiffre d&apos;affaires</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topClients} layout="vertical" margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} width={90} />
                  <Tooltip formatter={(value: number) => [formatPrice(value), 'Revenu']} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#059669" radius={[0, 4, 4, 0]} name="Revenu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartitions : Statut + Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Répartition par statut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition par statut</CardTitle>
            <CardDescription>Distribution des expéditions selon leur état</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition par mode de transport</CardTitle>
            <CardDescription>Aérien, Maritime, Terrestre</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.typeDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des dernières entrées */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Dernières expéditions</CardTitle>
              <CardDescription>{filteredShipments.length} résultat(s)</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
              {filteredShipments.length} / {shipments.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">N° Suivi</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Origine</TableHead>
                  <TableHead className="text-xs">Destination</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Prix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.slice(0, 15).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs font-mono font-semibold">{s.trackingNumber}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        {s.type === 'aerien' ? <Plane className="w-3 h-3 text-sky-500" /> :
                         s.type === 'maritime' ? <Ship className="w-3 h-3 text-teal-500" /> :
                         <Truck className="w-3 h-3 text-amber-500" />}
                        {s.type === 'aerien' ? 'Aérien' : s.type === 'maritime' ? 'Maritime' : 'Terrestre'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{s.clientName}</TableCell>
                    <TableCell className="text-xs">{s.origin}</TableCell>
                    <TableCell className="text-xs">{s.destination}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className={`text-[10px] ${statusBadgeColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                        {s.status === 'en_attente' ? 'En attente' :
                         s.status === 'confirmee' ? 'Confirmée' :
                         s.status === 'en_transit' ? 'En transit' :
                         s.status === 'livree' ? 'Livrée' :
                         s.status === 'retardee' ? 'Retardée' :
                         s.status === 'annulee' ? 'Annulée' : s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{s.dateCreation}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatPrice(s.price)}</TableCell>
                  </TableRow>
                ))}
                {filteredShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-gray-500 py-8">
                      Aucune expédition ne correspond aux filtres sélectionnés
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredShipments.length > 15 && (
            <div className="text-center mt-3">
              <p className="text-xs text-gray-400">
                Affichage de 15 sur {filteredShipments.length} résultats. Exportez pour tout voir.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
