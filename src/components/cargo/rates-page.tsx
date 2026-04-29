'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ArrowRightLeft,
  Calculator,
  Ship,
  Plane,
  Truck,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  ArrowUpDown,
  Percent,
  Globe,
  Clock,
  BadgeCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────

type TransportMode = 'maritime' | 'aerien' | 'terrestre';

interface RateEntry {
  id: string;
  mode: TransportMode;
  origin: string;
  destination: string;
  carrier: string;
  rate: number;
  unit: string;
  currency: string;
  transitTime: string;
  validFrom: string;
  validTo: string;
  type: 'contract' | 'spot';
}

interface Surcharge {
  id: string;
  code: string;
  name: string;
  description: string;
  rate: number;
  rateType: 'percentage' | 'flat';
  mode: TransportMode | 'all';
  active: boolean;
  validFrom: string;
  validTo: string;
}

interface RateHistoryPoint {
  month: string;
  'Alger → Marseille': number;
  'Shanghai → Alger': number;
  'Casablanca → Dakar': number;
}

interface SpotContractEntry {
  route: string;
  mode: TransportMode;
  spotRate: number;
  contractRate: number;
  savings: number;
  savingsPercent: number;
  unit: string;
  currency: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────

const ratesData: RateEntry[] = [
  { id: 'R-001', mode: 'maritime', origin: 'Alger', destination: 'Marseille', carrier: 'CMA CGM', rate: 1850, unit: 'par conteneur 20ft', currency: 'EUR', transitTime: '5 jours', validFrom: '2026-01-01', validTo: '2026-06-30', type: 'contract' },
  { id: 'R-002', mode: 'maritime', origin: 'Shanghai', destination: 'Alger', carrier: 'Maersk', rate: 3200, unit: 'par conteneur 20ft', currency: 'USD', transitTime: '28 jours', validFrom: '2026-01-01', validTo: '2026-06-30', type: 'contract' },
  { id: 'R-003', mode: 'maritime', origin: 'Hambourg', destination: 'Djeddah', carrier: 'Hapag-Lloyd', rate: 2750, unit: 'par conteneur 20ft', currency: 'EUR', transitTime: '18 jours', validFrom: '2026-02-01', validTo: '2026-07-31', type: 'spot' },
  { id: 'R-004', mode: 'maritime', origin: 'Marseille', destination: 'Alger', carrier: 'CMA CGM', rate: 1650, unit: 'par conteneur 20ft', currency: 'EUR', transitTime: '4 jours', validFrom: '2026-01-01', validTo: '2026-12-31', type: 'contract' },
  { id: 'R-005', mode: 'aerien', origin: 'Alger', destination: 'Paris CDG', carrier: 'Air Algérie', rate: 4.85, unit: 'par kg', currency: 'EUR', transitTime: '4h30', validFrom: '2026-01-01', validTo: '2026-03-31', type: 'contract' },
  { id: 'R-006', mode: 'aerien', origin: 'Dubaï', destination: 'Alger', carrier: 'Emirates SkyCargo', rate: 5.20, unit: 'par kg', currency: 'USD', transitTime: '7h', validFrom: '2026-01-15', validTo: '2026-06-15', type: 'contract' },
  { id: 'R-007', mode: 'aerien', origin: 'Istanbul', destination: 'Alger', carrier: 'Turkish Cargo', rate: 3.95, unit: 'par kg', currency: 'EUR', transitTime: '3h45', validFrom: '2026-02-01', validTo: '2026-04-30', type: 'spot' },
  { id: 'R-008', mode: 'aerien', origin: 'Londres', destination: 'Alger', carrier: 'Lufthansa Cargo', rate: 6.10, unit: 'par kg', currency: 'EUR', transitTime: '6h', validFrom: '2026-01-01', validTo: '2026-12-31', type: 'contract' },
  { id: 'R-009', mode: 'terrestre', origin: 'Casablanca', destination: 'Dakar', carrier: 'SDV Logistics', rate: 1.20, unit: 'par km', currency: 'EUR', transitTime: '5 jours', validFrom: '2026-01-01', validTo: '2026-12-31', type: 'contract' },
  { id: 'R-010', mode: 'terrestre', origin: 'Rotterdam', destination: 'Milan', carrier: 'DHL Freight', rate: 0.95, unit: 'par km', currency: 'EUR', transitTime: '2 jours', validFrom: '2026-01-01', validTo: '2026-06-30', type: 'contract' },
  { id: 'R-011', mode: 'terrestre', origin: 'Istanbul', destination: 'Le Caire', carrier: 'Agility', rate: 1.05, unit: 'par km', currency: 'USD', transitTime: '3 jours', validFrom: '2026-03-01', validTo: '2026-05-31', type: 'spot' },
  { id: 'R-012', mode: 'terrestre', origin: 'Alger', destination: 'Tunis', carrier: 'SDV Logistics', rate: 0.85, unit: 'par km', currency: 'EUR', transitTime: '1 jour', validFrom: '2026-01-01', validTo: '2026-12-31', type: 'contract' },
];

const surchargesData: Surcharge[] = [
  { id: 'S-001', code: 'BAF', name: 'Bunker Adjustment Factor', description: 'Ajustement lié à la fluctuation du prix du carburant maritime', rate: 12.5, rateType: 'percentage', mode: 'maritime', active: true, validFrom: '2026-01-01', validTo: '2026-06-30' },
  { id: 'S-002', code: 'CAF', name: 'Currency Adjustment Factor', description: 'Ajustement lié aux variations de taux de change', rate: 3.8, rateType: 'percentage', mode: 'all', active: true, validFrom: '2026-01-01', validTo: '2026-12-31' },
  { id: 'S-003', code: 'FSC-AIR', name: 'Fuel Surcharge Aérien', description: 'Surcharge carburant pour le fret aérien', rate: 0.45, rateType: 'flat', mode: 'aerien', active: true, validFrom: '2026-01-15', validTo: '2026-04-15' },
  { id: 'S-004', code: 'PSS', name: 'Peak Season Surcharge', description: 'Surcharge applicable en période de pointe (Ramadan, fin d\'année)', rate: 15.0, rateType: 'percentage', mode: 'all', active: false, validFrom: '2026-10-01', validTo: '2026-12-31' },
  { id: 'S-005', code: 'FSC-GND', name: 'Fuel Surcharge Terrestre', description: 'Surcharge carburant pour le transport routier', rate: 8.2, rateType: 'percentage', mode: 'terrestre', active: true, validFrom: '2026-02-01', validTo: '2026-07-31' },
  { id: 'S-006', code: 'THC', name: 'Terminal Handling Charge', description: 'Frais de manutention au terminal portuaire', rate: 250, rateType: 'flat', mode: 'maritime', active: true, validFrom: '2026-01-01', validTo: '2026-12-31' },
];

const rateHistoryData: RateHistoryPoint[] = [
  { month: 'Mars 25', 'Alger → Marseille': 1620, 'Shanghai → Alger': 2850, 'Casablanca → Dakar': 0.95 },
  { month: 'Avr 25', 'Alger → Marseille': 1680, 'Shanghai → Alger': 2950, 'Casablanca → Dakar': 0.98 },
  { month: 'Mai 25', 'Alger → Marseille': 1750, 'Shanghai → Alger': 3100, 'Casablanca → Dakar': 1.02 },
  { month: 'Jun 25', 'Alger → Marseille': 1810, 'Shanghai → Alger': 3250, 'Casablanca → Dakar': 1.05 },
  { month: 'Jul 25', 'Alger → Marseille': 1890, 'Shanghai → Alger': 3400, 'Casablanca → Dakar': 1.08 },
  { month: 'Aoû 25', 'Alger → Marseille': 1950, 'Shanghai → Alger': 3500, 'Casablanca → Dakar': 1.12 },
  { month: 'Sep 25', 'Alger → Marseille': 1920, 'Shanghai → Alger': 3450, 'Casablanca → Dakar': 1.10 },
  { month: 'Oct 25', 'Alger → Marseille': 2050, 'Shanghai → Alger': 3600, 'Casablanca → Dakar': 1.15 },
  { month: 'Nov 25', 'Alger → Marseille': 2100, 'Shanghai → Alger': 3700, 'Casablanca → Dakar': 1.18 },
  { month: 'Déc 25', 'Alger → Marseille': 2200, 'Shanghai → Alger': 3850, 'Casablanca → Dakar': 1.22 },
  { month: 'Jan 26', 'Alger → Marseille': 1850, 'Shanghai → Alger': 3200, 'Casablanca → Dakar': 1.20 },
  { month: 'Fév 26', 'Alger → Marseille': 1790, 'Shanghai → Alger': 3150, 'Casablanca → Dakar': 1.18 },
];

const spotContractData: SpotContractEntry[] = [
  { route: 'Alger → Marseille', mode: 'maritime', spotRate: 2200, contractRate: 1850, savings: 350, savingsPercent: 15.9, unit: 'par conteneur', currency: 'EUR' },
  { route: 'Shanghai → Alger', mode: 'maritime', spotRate: 3900, contractRate: 3200, savings: 700, savingsPercent: 17.9, unit: 'par conteneur', currency: 'USD' },
  { route: 'Alger → Paris CDG', mode: 'aerien', spotRate: 6.50, contractRate: 4.85, savings: 1.65, savingsPercent: 25.4, unit: 'par kg', currency: 'EUR' },
  { route: 'Dubaï → Alger', mode: 'aerien', spotRate: 7.20, contractRate: 5.20, savings: 2.00, savingsPercent: 27.8, unit: 'par kg', currency: 'USD' },
  { route: 'Casablanca → Dakar', mode: 'terrestre', spotRate: 1.55, contractRate: 1.20, savings: 0.35, savingsPercent: 22.6, unit: 'par km', currency: 'EUR' },
  { route: 'Rotterdam → Milan', mode: 'terrestre', spotRate: 1.30, contractRate: 0.95, savings: 0.35, savingsPercent: 26.9, unit: 'par km', currency: 'EUR' },
];

const carrierComparisonData = [
  { carrier: 'CMA CGM', rate: 1850, transit: '5 jours', rating: 4.5, reliability: 94 },
  { carrier: 'Maersk', rate: 2100, transit: '6 jours', rating: 4.7, reliability: 96 },
  { carrier: 'Hapag-Lloyd', rate: 1980, transit: '5 jours', rating: 4.3, reliability: 91 },
  { carrier: 'MSC', rate: 1720, transit: '7 jours', rating: 4.0, reliability: 88 },
];

const carrierComparisonAirData = [
  { carrier: 'Air Algérie', rate: 4.85, transit: '4h30', rating: 3.8, reliability: 85 },
  { carrier: 'Emirates SkyCargo', rate: 5.20, transit: '7h', rating: 4.6, reliability: 95 },
  { carrier: 'Turkish Cargo', rate: 3.95, transit: '3h45', rating: 4.2, reliability: 90 },
  { carrier: 'Lufthansa Cargo', rate: 6.10, transit: '6h', rating: 4.8, reliability: 97 },
];

// ─── Helpers ─────────────────────────────────────────────────────────

const modeLabels: Record<TransportMode, string> = {
  maritime: 'Maritime',
  aerien: 'Aérien',
  terrestre: 'Terrestre',
};

const modeIcons: Record<TransportMode, typeof Ship> = {
  maritime: Ship,
  aerien: Plane,
  terrestre: Truck,
};

const modeColors: Record<TransportMode, { bg: string; text: string; border: string; badge: string }> = {
  maritime: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-300 dark:border-teal-700',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  },
  aerien: {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-300 dark:border-sky-700',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  },
  terrestre: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

function formatRateValue(rate: number, currency: string, unit: string): string {
  if (unit.includes('par kg') || unit.includes('par km')) {
    return `${rate.toFixed(2)} ${currency}`;
  }
  return `${rate.toLocaleString('fr-FR')} ${currency}`;
}

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

// ─── Component ───────────────────────────────────────────────────────

export default function RatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<TransportMode | 'all'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRate, setNewRate] = useState({
    mode: 'maritime' as TransportMode,
    origin: '',
    destination: '',
    carrier: '',
    rate: '',
    currency: 'EUR',
  });

  // KPI calculations
  const activeRates = ratesData.length;
  const activeSurcharges = surchargesData.filter((s) => s.active).length;
  const avgSavings = spotContractData.reduce((a, b) => a + b.savingsPercent, 0) / spotContractData.length;
  const exchangeRate = 1.08;

  // Filtered rates
  const filteredRates = ratesData.filter((r) => {
    const matchSearch =
      searchQuery === '' ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMode = modeFilter === 'all' || r.mode === modeFilter;
    return matchSearch && matchMode;
  });

  const kpis = [
    {
      label: 'Tarifs Actifs',
      value: activeRates,
      icon: DollarSign,
      color: 'text-teal-500',
      bgColor: 'bg-teal-100 dark:bg-teal-900/30',
      detail: `${ratesData.filter((r) => r.type === 'contract').length} contrat / ${ratesData.filter((r) => r.type === 'spot').length} spot`,
    },
    {
      label: 'Surcharges Actives',
      value: activeSurcharges,
      icon: Percent,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      detail: `sur ${surchargesData.length} au total`,
    },
    {
      label: 'Économie vs Spot',
      value: `${avgSavings.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      detail: 'moyenne toutes routes',
    },
    {
      label: 'Taux de Change',
      value: `${exchangeRate.toFixed(2)}`,
      icon: ArrowRightLeft,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      detail: 'EUR → USD',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-teal-500" />
            Gestion des Tarifs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Grille tarifaire, comparatifs et historique des taux
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              <Plus className="w-4 h-4" />
              Ajouter un tarif
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau tarif</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau tarif à la grille tarifaire
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rate-mode">Mode de transport</Label>
                <Select
                  value={newRate.mode}
                  onValueChange={(v) =>
                    setNewRate({ ...newRate, mode: v as TransportMode })
                  }
                >
                  <SelectTrigger id="rate-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maritime">🚢 Maritime</SelectItem>
                    <SelectItem value="aerien">✈️ Aérien</SelectItem>
                    <SelectItem value="terrestre">🚛 Terrestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rate-origin">Origine</Label>
                  <Input
                    id="rate-origin"
                    placeholder="Ville de départ"
                    value={newRate.origin}
                    onChange={(e) =>
                      setNewRate({ ...newRate, origin: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate-destination">Destination</Label>
                  <Input
                    id="rate-destination"
                    placeholder="Ville d'arrivée"
                    value={newRate.destination}
                    onChange={(e) =>
                      setNewRate({
                        ...newRate,
                        destination: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rate-carrier">Transporteur</Label>
                <Input
                  id="rate-carrier"
                  placeholder="Nom du transporteur"
                  value={newRate.carrier}
                  onChange={(e) =>
                    setNewRate({ ...newRate, carrier: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rate-value">Tarif</Label>
                  <Input
                    id="rate-value"
                    type="number"
                    placeholder="0.00"
                    value={newRate.rate}
                    onChange={(e) =>
                      setNewRate({ ...newRate, rate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate-currency">Devise</Label>
                  <Select
                    value={newRate.currency}
                    onValueChange={(v) =>
                      setNewRate({ ...newRate, currency: v })
                    }
                  >
                    <SelectTrigger id="rate-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="DZD">DZD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={() => setAddDialogOpen(false)}
                style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {kpi.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {kpi.value}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                      {kpi.detail}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="grille" className="space-y-4">
        <TabsList className="w-full sm:w-auto flex-wrap">
          <TabsTrigger value="grille" className="gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Grille Tarifaire</span>
            <span className="sm:hidden">Grille</span>
          </TabsTrigger>
          <TabsTrigger value="comparatif" className="gap-1.5">
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Comparatif</span>
            <span className="sm:hidden">Compar.</span>
          </TabsTrigger>
          <TabsTrigger value="surcharges" className="gap-1.5">
            <Percent className="w-4 h-4" />
            Surcharges
          </TabsTrigger>
          <TabsTrigger value="historique" className="gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Historique</span>
            <span className="sm:hidden">Hist.</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab: Grille Tarifaire ─── */}
        <TabsContent value="grille">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Grille Tarifaire
                  </CardTitle>
                  <CardDescription>
                    {filteredRates.length} tarif{filteredRates.length !== 1 ? 's' : ''} disponible{filteredRates.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un tarif..."
                      className="pl-9 h-9 w-full sm:w-56"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={modeFilter}
                    onValueChange={(v) =>
                      setModeFilter(v as TransportMode | 'all')
                    }
                  >
                    <SelectTrigger className="h-9 w-full sm:w-40">
                      <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les modes</SelectItem>
                      <SelectItem value="maritime">🚢 Maritime</SelectItem>
                      <SelectItem value="aerien">✈️ Aérien</SelectItem>
                      <SelectItem value="terrestre">🚛 Terrestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Rate Cards by Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                {filteredRates.map((rate, index) => {
                  const ModeIcon = modeIcons[rate.mode];
                  const colors = modeColors[rate.mode];
                  return (
                    <motion.div
                      key={rate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card className="hover:shadow-md transition-all hover:border-teal-300 dark:hover:border-teal-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}
                              >
                                <ModeIcon
                                  className={`w-4 h-4 ${colors.text}`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {rate.origin} → {rate.destination}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {rate.carrier}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant="secondary"
                                className={`text-[9px] ${colors.badge}`}
                              >
                                {modeLabels[rate.mode]}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={
                                  rate.type === 'contract'
                                    ? 'text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'text-[9px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }
                              >
                                {rate.type === 'contract' ? 'Contrat' : 'Spot'}
                              </Badge>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">
                                Tarif
                              </p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatRateValue(
                                  rate.rate,
                                  rate.currency,
                                  rate.unit
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {rate.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock className="w-3 h-3" />
                                {rate.transitTime}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                <Globe className="w-3 h-3" />
                                {rate.validFrom} → {rate.validTo}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Spot vs Contract Rates */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-teal-500" />
                Spot vs Contrat
              </CardTitle>
              <CardDescription>
                Comparaison des tarifs spot et contrat pour les principales
                routes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Tarif Spot</TableHead>
                    <TableHead className="text-right">Tarif Contrat</TableHead>
                    <TableHead className="text-right">Économie</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spotContractData.map((row, index) => {
                    const ModeIcon = modeIcons[row.mode];
                    const colors = modeColors[row.mode];
                    return (
                      <TableRow key={row.route}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {row.route}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <ModeIcon
                              className={`w-3.5 h-3.5 ${colors.text}`}
                            />
                            <span className="text-xs">
                              {modeLabels[row.mode]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-orange-600 dark:text-orange-400 font-medium">
                          {formatRateValue(
                            row.spotRate,
                            row.currency,
                            row.unit
                          )}
                        </TableCell>
                        <TableCell className="text-right text-teal-600 dark:text-teal-400 font-medium">
                          {formatRateValue(
                            row.contractRate,
                            row.currency,
                            row.unit
                          )}
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400 font-bold">
                          -{formatRateValue(row.savings, row.currency, row.unit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            -{row.savingsPercent.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Comparatif ─── */}
        <TabsContent value="comparatif" className="space-y-4">
          {/* Maritime Comparison */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Ship className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Comparatif Maritime — Alger → Marseille
                  </CardTitle>
                  <CardDescription>
                    Tarifs par conteneur 20ft, 4 transporteurs comparés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {carrierComparisonData.map((carrier, index) => {
                  const isBest = carrier.rate === Math.min(...carrierComparisonData.map((c) => c.rate));
                  const isFastest = carrier.transit === '5 jours';
                  return (
                    <motion.div
                      key={carrier.carrier}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.08 }}
                    >
                      <Card
                        className={`relative overflow-hidden ${
                          isBest
                            ? 'border-teal-400 dark:border-teal-600 shadow-md'
                            : ''
                        }`}
                      >
                        {isBest && (
                          <div
                            className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold text-white rounded-bl-lg"
                            style={{
                              background:
                                'linear-gradient(135deg, #0d9488, #059669)',
                            }}
                          >
                            MEILLEUR PRIX
                          </div>
                        )}
                        <CardContent className="p-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {carrier.carrier}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {carrier.rate.toLocaleString('fr-FR')}{' '}
                            <span className="text-sm font-normal text-gray-400">
                              EUR
                            </span>
                          </p>
                          <Separator className="my-2" />
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                Transit
                              </span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {carrier.transit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                Fiabilité
                              </span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {carrier.reliability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                Note
                              </span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(carrier.rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-[10px] text-gray-400 ml-1">
                                  {carrier.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={isBest ? 'default' : 'outline'}
                            size="sm"
                            className={`w-full mt-3 text-xs ${
                              isBest
                                ? ''
                                : 'hover:border-teal-400 hover:text-teal-600'
                            }`}
                            style={
                              isBest
                                ? {
                                    background:
                                      'linear-gradient(135deg, #0d9488, #059669)',
                                  }
                                : undefined
                            }
                          >
                            Sélectionner
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              {/* Maritime Comparison Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={carrierComparisonData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="carrier"
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'var(--muted-foreground)',
                      }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="rate" fill="#0d9488" radius={[4, 4, 0, 0]} name="Tarif (EUR)" />
                    <Bar dataKey="reliability" fill="#059669" radius={[4, 4, 0, 0]} name="Fiabilité (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Air Comparison */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Comparatif Aérien — Alger → Paris CDG
                  </CardTitle>
                  <CardDescription>
                    Tarifs par kg, 4 transporteurs comparés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {carrierComparisonAirData.map((carrier, index) => {
                  const isBest =
                    carrier.rate ===
                    Math.min(
                      ...carrierComparisonAirData.map((c) => c.rate)
                    );
                  return (
                    <motion.div
                      key={carrier.carrier}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.08 }}
                    >
                      <Card
                        className={`relative overflow-hidden ${
                          isBest
                            ? 'border-sky-400 dark:border-sky-600 shadow-md'
                            : ''
                        }`}
                      >
                        {isBest && (
                          <div
                            className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold text-white rounded-bl-lg"
                            style={{
                              background:
                                'linear-gradient(135deg, #0284c7, #0ea5e9)',
                            }}
                          >
                            MEILLEUR PRIX
                          </div>
                        )}
                        <CardContent className="p-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {carrier.carrier}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {carrier.rate.toFixed(2)}{' '}
                            <span className="text-sm font-normal text-gray-400">
                              EUR/kg
                            </span>
                          </p>
                          <Separator className="my-2" />
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                Transit
                              </span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {carrier.transit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                Fiabilité
                              </span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {carrier.reliability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">
                                Note
                              </span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(carrier.rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-[10px] text-gray-400 ml-1">
                                  {carrier.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={isBest ? 'default' : 'outline'}
                            size="sm"
                            className={`w-full mt-3 text-xs ${
                              isBest
                                ? ''
                                : 'hover:border-sky-400 hover:text-sky-600'
                            }`}
                            style={
                              isBest
                                ? {
                                    background:
                                      'linear-gradient(135deg, #0284c7, #0ea5e9)',
                                  }
                                : undefined
                            }
                          >
                            Sélectionner
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Surcharges ─── */}
        <TabsContent value="surcharges">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-500" />
                Gestion des Surcharges
              </CardTitle>
              <CardDescription>
                BAF, CAF, surcharges carburant et saisonnières
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {surchargesData.map((surcharge, index) => {
                const modeInfo =
                  surcharge.mode === 'all'
                    ? { label: 'Tous', icon: Globe, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' }
                    : {
                        label: modeLabels[surcharge.mode],
                        icon: modeIcons[surcharge.mode],
                        bg: modeColors[surcharge.mode].bg,
                        text: modeColors[surcharge.mode].text,
                      };
                const ModeIcon = modeInfo.icon;
                return (
                  <motion.div
                    key={surcharge.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border transition-colors ${
                      surcharge.active
                        ? 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
                        : 'border-gray-200 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${modeInfo.bg}`}
                        >
                          <ModeIcon className={`w-5 h-5 ${modeInfo.text}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                              {surcharge.code}
                            </Badge>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {surcharge.name}
                            </p>
                            <Badge
                              className={`text-[9px] border-0 ${
                                surcharge.active
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                              }`}
                            >
                              {surcharge.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {surcharge.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 pl-13 sm:pl-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {surcharge.rateType === 'percentage'
                              ? `${surcharge.rate}%`
                              : `${surcharge.rate.toLocaleString('fr-FR')} EUR`}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {surcharge.rateType === 'percentage'
                              ? 'Pourcentage'
                              : 'Montant fixe'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">
                            {modeInfo.label}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {surcharge.validFrom} → {surcharge.validTo}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Surcharges Summary */}
              <Separator className="my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Surcharges actives</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {activeSurcharges}/{surchargesData.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Surcharge max (active)
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {Math.max(
                        ...surchargesData
                          .filter((s) => s.active && s.rateType === 'percentage')
                          .map((s) => s.rate)
                      )}
                      %
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <Info className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Prochaine expiration</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      15 Avr 2026
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Historique ─── */}
        <TabsContent value="historique" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                Historique des Tarifs
              </CardTitle>
              <CardDescription>
                Évolution des tarifs sur 12 mois pour les principales routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rateHistoryData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      angle={-30}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{
                        fontSize: 11,
                        fill: 'var(--muted-foreground)',
                      }}
                      tickFormatter={(v) =>
                        v >= 100 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{
                        fontSize: 11,
                        fill: 'var(--muted-foreground)',
                      }}
                      tickFormatter={(v) => v.toFixed(2)}
                      domain={[0.8, 1.4]}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Alger → Marseille"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ fill: '#0d9488', r: 3 }}
                      name="Alger → Marseille (EUR/conteneur)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="Shanghai → Alger"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ fill: '#059669', r: 3 }}
                      name="Shanghai → Alger (USD/conteneur)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Casablanca → Dakar"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#f59e0b', r: 3 }}
                      name="Casablanca → Dakar (EUR/km)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                  {
                    route: 'Alger → Marseille',
                    trend: -3.2,
                    current: 1790,
                    unit: 'EUR/conteneur',
                    color: 'text-green-500',
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                  },
                  {
                    route: 'Shanghai → Alger',
                    trend: -1.6,
                    current: 3150,
                    unit: 'USD/conteneur',
                    color: 'text-green-500',
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                  },
                  {
                    route: 'Casablanca → Dakar',
                    trend: -1.7,
                    current: 1.18,
                    unit: 'EUR/km',
                    color: 'text-green-500',
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.route}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.08 }}
                    className={`p-3 rounded-lg ${item.bgColor}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.route}
                      </p>
                      <Badge
                        className={`text-[9px] border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}
                      >
                        <TrendingUp className="w-3 h-3 mr-0.5 rotate-180" />
                        {item.trend}%
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.current >= 100
                        ? item.current.toLocaleString('fr-FR')
                        : item.current.toFixed(2)}{' '}
                      <span className="text-xs font-normal text-gray-400">
                        {item.unit}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      vs mois précédent
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rate Forecast Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
                Prévisions & Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10"
                >
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Hausse anticipée BAF
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Le Bunker Adjustment Factor devrait augmenter de 2-3%
                        au T2 2026 suite à la hausse du prix du pétrole.
                        Recommandation : négocier des tarifs lock pour 6 mois.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.08 }}
                  className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Saisonalité Ramadan
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Les tarifs spot augmentent historiquement de 15-20% en
                        pré-Ramadan. Pré-réservez votre capacité avant fin
                        février.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.16 }}
                  className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                >
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Opportunité de change
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        L&apos;EUR se renforce face à l&apos;USD (1.08→1.12
                        prévu). Avantageux pour les contrats libellés en USD.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.24 }}
                  className="p-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-900/10"
                >
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Nouvelle route Casablanca→Lagos
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        SDV Logistics propose un nouveau tarif compétitif à
                        0.88 EUR/km sur cette route. 25% d&apos;économie vs
                        alternatives actuelles.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
