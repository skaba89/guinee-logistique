/**
 * use-analytics-data.ts — Hook de données pour le tableau analytique LogisWay
 *
 * BRANCHEMENT : Ce hook lit les données depuis test-data.ts.
 * Pour le connecter à une vraie API/DB, remplacez les imports de test-data
 * par des appels API (fetch/axios) ou des requêtes Prisma.
 *
 * Interface de remplacement :
 *   - getKpis() → { totalShipments, totalRevenue, activeClients, ... }
 *   - getMonthlyRevenue() → { month, amount }[]
 *   - getTopCities() → { city, count }[]
 *   - etc.
 */

'use client';

import { useMemo } from 'react';
import {
  shipments,
  clients,
  invoices,
  vehicles,
  containers,
  parcels,
  type Shipment,
  type ShipmentStatus,
  type ShipmentType,
  type Client,
  type Invoice,
} from '@/lib/test-data';
import { useCurrency } from '@/lib/use-currency';

// ─── Types exportés ─────────────────────────────────────────────

export interface KpiData {
  label: string;
  value: number | string;
  previousValue?: number | string;
  trend?: number; // pourcentage de variation
  trendUp?: boolean;
  icon: string; // nom Lucide
  color: string; // classe gradient
}

export interface MonthlyRevenuePoint {
  month: string;
  amount: number;
  previousAmount: number;
}

export interface TopItem {
  name: string;
  value: number;
  count?: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RecentEntry {
  id: string;
  trackingNumber: string;
  type: string;
  clientName: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
  price: number;
}

export interface AnalyticsData {
  kpis: KpiData[];
  monthlyRevenue: MonthlyRevenuePoint[];
  topOrigins: TopItem[];
  topDestinations: TopItem[];
  topClients: TopItem[];
  statusDistribution: StatusDistribution[];
  typeDistribution: StatusDistribution[];
  recentEntries: RecentEntry[];
  totalWeight: number;
  averagePrice: number;
}

// ─── Labels et couleurs ─────────────────────────────────────────

const statusLabels: Record<ShipmentStatus, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_transit: 'En transit',
  livree: 'Livrée',
  retardee: 'Retardée',
  annulee: 'Annulée',
};

const statusColors: Record<ShipmentStatus, string> = {
  en_attente: '#eab308',
  confirmee: '#3b82f6',
  en_transit: '#f97316',
  livree: '#22c55e',
  retardee: '#ef4444',
  annulee: '#6b7280',
};

const typeLabels: Record<ShipmentType, string> = {
  aerien: 'Aérien',
  maritime: 'Maritime',
  terrestre: 'Terrestre',
};

const typeColors: Record<ShipmentType, string> = {
  aerien: '#0ea5e9',
  maritime: '#0d9488',
  terrestre: '#f59e0b',
};

// ─── Helper : générer les 12 derniers mois ─────────────────────

function getLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    );
  }
  return months;
}

function getMonthKey(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

// ─── Hook principal ─────────────────────────────────────────────

export function useAnalyticsData(): AnalyticsData {
  const { format: formatPrice } = useCurrency();

  return useMemo(() => {
    // ── KPIs ────────────────────────────────────────────
    const totalShipments = shipments.length;
    const totalRevenue = shipments.reduce((sum, s) => sum + s.price, 0);
    const activeClients = clients.filter(c => c.totalShipments > 0).length;
    const inTransit = shipments.filter(s => s.status === 'en_transit').length;
    const delivered = shipments.filter(s => s.status === 'livree').length;
    const deliveryRate = totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 0;
    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
    const averagePrice = totalShipments > 0 ? Math.round(totalRevenue / totalShipments) : 0;

    // Calculs de variation (simulés avec les données existantes)
    const firstHalf = shipments.filter(s => {
      const m = new Date(s.dateCreation).getMonth();
      return m < 6;
    });
    const secondHalf = shipments.filter(s => {
      const m = new Date(s.dateCreation).getMonth();
      return m >= 6;
    });
    const revFirst = firstHalf.reduce((s, sh) => s + sh.price, 0);
    const revSecond = secondHalf.reduce((s, sh) => s + sh.price, 0);
    const revenueTrend = revFirst > 0 ? Math.round(((revSecond - revFirst) / revFirst) * 100) : 0;

    const kpis: KpiData[] = [
      {
        label: 'Total Expéditions',
        value: totalShipments,
        previousValue: totalShipments - 4,
        trend: 12,
        trendUp: true,
        icon: 'Package',
        color: 'from-teal-500 to-teal-600',
      },
      {
        label: 'Chiffre d\'Affaires',
        value: formatPrice(totalRevenue),
        previousValue: formatPrice(Math.round(totalRevenue * 0.85)),
        trend: revenueTrend,
        trendUp: revenueTrend > 0,
        icon: 'DollarSign',
        color: 'from-emerald-500 to-green-600',
      },
      {
        label: 'Clients Actifs',
        value: activeClients,
        previousValue: activeClients - 2,
        trend: 15,
        trendUp: true,
        icon: 'Users',
        color: 'from-cyan-500 to-blue-600',
      },
      {
        label: 'En Transit',
        value: inTransit,
        previousValue: inTransit - 1,
        trend: 8,
        trendUp: true,
        icon: 'Truck',
        color: 'from-orange-500 to-amber-600',
      },
      {
        label: 'Taux de Livraison',
        value: `${deliveryRate}%`,
        previousValue: `${deliveryRate - 2}%`,
        trend: 2,
        trendUp: true,
        icon: 'CheckCircle2',
        color: 'from-green-500 to-emerald-600',
      },
      {
        label: 'Poids Total (kg)',
        value: totalWeight.toLocaleString('fr-FR'),
        previousValue: Math.round(totalWeight * 0.9).toLocaleString('fr-FR'),
        trend: 10,
        trendUp: true,
        icon: 'Scale',
        color: 'from-violet-500 to-purple-600',
      },
      {
        label: 'Prix Moyen',
        value: formatPrice(averagePrice),
        previousValue: formatPrice(Math.round(averagePrice * 0.95)),
        trend: 5,
        trendUp: true,
        icon: 'TrendingUp',
        color: 'from-pink-500 to-rose-600',
      },
      {
        label: 'Véhicules Actifs',
        value: vehicles.filter(v => v.status === 'actif').length,
        previousValue: 6,
        trend: 14,
        trendUp: true,
        icon: 'Container',
        color: 'from-sky-500 to-indigo-600',
      },
    ];

    // ── Revenus mensuels (12 mois glissants) ────────────
    const months = getLast12Months();
    const monthlyRevenue: MonthlyRevenuePoint[] = months.map(month => {
      const monthShipments = shipments.filter(s => getMonthKey(s.dateCreation) === month);
      const amount = monthShipments.reduce((sum, s) => sum + s.price, 0);
      // Simuler l'année précédente (80-95% du montant actuel)
      const previousAmount = Math.round(amount * (0.80 + Math.random() * 0.15));
      return { month, amount, previousAmount };
    });

    // ── Top 10 Origines ─────────────────────────────────
    const originMap = new Map<string, number>();
    shipments.forEach(s => {
      originMap.set(s.origin, (originMap.get(s.origin) || 0) + 1);
    });
    const topOrigins: TopItem[] = [...originMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // ── Top 10 Destinations ─────────────────────────────
    const destMap = new Map<string, number>();
    shipments.forEach(s => {
      destMap.set(s.destination, (destMap.get(s.destination) || 0) + 1);
    });
    const topDestinations: TopItem[] = [...destMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // ── Top 10 Clients par revenu ───────────────────────
    const topClients: TopItem[] = [...clients]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        value: c.totalRevenue,
        count: c.totalShipments,
      }));

    // ── Répartition par statut ──────────────────────────
    const statusMap = new Map<ShipmentStatus, number>();
    shipments.forEach(s => {
      statusMap.set(s.status, (statusMap.get(s.status) || 0) + 1);
    });
    const statusDistribution: StatusDistribution[] = [...statusMap.entries()]
      .map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        color: statusColors[status] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);

    // ── Répartition par type ────────────────────────────
    const typeMap = new Map<ShipmentType, number>();
    shipments.forEach(s => {
      typeMap.set(s.type, (typeMap.get(s.type) || 0) + 1);
    });
    const typeDistribution: StatusDistribution[] = [...typeMap.entries()]
      .map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count,
        color: typeColors[type] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);

    // ── Dernières entrées ───────────────────────────────
    const recentEntries: RecentEntry[] = [...shipments]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 10)
      .map(s => ({
        id: s.id,
        trackingNumber: s.trackingNumber,
        type: typeLabels[s.type] || s.type,
        clientName: s.clientName,
        origin: s.origin,
        destination: s.destination,
        status: statusLabels[s.status] || s.status,
        date: s.dateCreation,
        price: s.price,
      }));

    return {
      kpis,
      monthlyRevenue,
      topOrigins,
      topDestinations,
      topClients,
      statusDistribution,
      typeDistribution,
      recentEntries,
      totalWeight,
      averagePrice,
    };
  }, [formatPrice]);
}
