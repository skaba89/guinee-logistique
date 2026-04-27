'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge,
  Ship,
  Plane,
  Truck,
  Train,
  ArrowRight,
  Clock,
  DollarSign,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Zap,
  Route,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Package,
  TrendingUp,
  Shield,
  Warehouse,
  Timer,
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type LegStatus = 'completed' | 'in_progress' | 'pending' | 'delayed';
type ChainStatus = 'active' | 'planned' | 'completed' | 'at_risk';
type TransportMode = 'maritime' | 'aerien' | 'rail' | 'terrestre';

interface ChainLeg {
  id: string;
  mode: TransportMode;
  origin: string;
  destination: string;
  carrier: string;
  estimatedTime: string;
  cost: number;
  status: LegStatus;
  distance: number;
}

interface MultimodalChain {
  id: string;
  chainId: string;
  client: string;
  legs: ChainLeg[];
  totalDistance: number;
  totalTime: string;
  totalCost: number;
  co2Saved: number;
  status: ChainStatus;
  progress: number;
  unimodalCost: number;
  unimodalTime: string;
  createdAt: string;
}

interface TransitPoint {
  id: string;
  name: string;
  type: 'port' | 'airport' | 'hub' | 'gare';
  avgTransferTime: string;
  successRate: number;
  storageCapacity: number;
  currentOccupancy: number;
  missedConnections: number;
  totalConnections: number;
}

// ─── Test Data ───────────────────────────────────────────────────────────────

const multimodalChains: MultimodalChain[] = [
  {
    id: 'mc1',
    chainId: 'MM-2026-001',
    client: 'EURL BatiPlus',
    legs: [
      { id: 'l1', mode: 'maritime', origin: 'Shanghai', destination: 'Alger', carrier: 'CMA CGM Marco Polo', estimatedTime: '15 jours', cost: 4200000, status: 'completed', distance: 9200 },
      { id: 'l2', mode: 'terrestre', origin: 'Port d\'Alger', destination: 'Béjaïa', carrier: 'Ali Mezdad - Remorque', estimatedTime: '5 heures', cost: 185000, status: 'in_progress', distance: 260 },
    ],
    totalDistance: 9460,
    totalTime: '15j 5h',
    totalCost: 4385000,
    co2Saved: 2.4,
    status: 'active',
    progress: 75,
    unimodalCost: 5200000,
    unimodalTime: '18 jours',
    createdAt: '2026-02-10',
  },
  {
    id: 'mc2',
    chainId: 'MM-2026-002',
    client: 'Sarl TechnoPlus',
    legs: [
      { id: 'l3', mode: 'aerien', origin: 'Istanbul', destination: 'Alger', carrier: 'Turkish Airlines TK-651', estimatedTime: '3h 45m', cost: 320000, status: 'completed', distance: 2800 },
      { id: 'l4', mode: 'terrestre', origin: 'Aéroport Houari Boumediene', destination: 'Blida', carrier: 'Karim Bouzid - Fourgon', estimatedTime: '1h 30m', cost: 35000, status: 'completed', distance: 45 },
    ],
    totalDistance: 2845,
    totalTime: '5h 15m',
    totalCost: 355000,
    co2Saved: 0.3,
    status: 'completed',
    progress: 100,
    unimodalCost: 420000,
    unimodalTime: '3 jours',
    createdAt: '2026-03-07',
  },
  {
    id: 'mc3',
    chainId: 'MM-2026-003',
    client: 'SPA HydroServices',
    legs: [
      { id: 'l5', mode: 'maritime', origin: 'Hambourg', destination: 'Alger', carrier: 'Hapag-Lloyd Berlin', estimatedTime: '12 jours', cost: 3800000, status: 'in_progress', distance: 7800 },
      { id: 'l6', mode: 'rail', origin: 'Gare de Alger', destination: 'Oran', carrier: 'SNTF Cargo Express', estimatedTime: '8 heures', cost: 145000, status: 'pending', distance: 430 },
      { id: 'l7', mode: 'terrestre', origin: 'Gare d\'Oran', destination: 'Sidi Bel Abbès', carrier: 'Bilal Kherrazi - Camion', estimatedTime: '2 heures', cost: 65000, status: 'pending', distance: 90 },
    ],
    totalDistance: 8320,
    totalTime: '12j 10h',
    totalCost: 4010000,
    co2Saved: 4.1,
    status: 'active',
    progress: 45,
    unimodalCost: 5500000,
    unimodalTime: '16 jours',
    createdAt: '2026-03-05',
  },
  {
    id: 'mc4',
    chainId: 'MM-2026-004',
    client: 'Entreprise Bouzidi & Fils',
    legs: [
      { id: 'l8', mode: 'maritime', origin: 'Marseille', destination: 'Alger', carrier: 'CMA CGM Marco Polo', estimatedTime: '3 jours', cost: 950000, status: 'pending', distance: 850 },
      { id: 'l9', mode: 'terrestre', origin: 'Port d\'Alger', destination: 'Oran', carrier: 'Rachid Kaci - Camion', estimatedTime: '6 heures', cost: 125000, status: 'pending', distance: 430 },
    ],
    totalDistance: 1280,
    totalTime: '3j 6h',
    totalCost: 1075000,
    co2Saved: 1.1,
    status: 'planned',
    progress: 0,
    unimodalCost: 1500000,
    unimodalTime: '5 jours',
    createdAt: '2026-03-12',
  },
  {
    id: 'mc5',
    chainId: 'MM-2026-005',
    client: 'Sarl MédiaCom',
    legs: [
      { id: 'l10', mode: 'aerien', origin: 'Dubaï', destination: 'Alger', carrier: 'Emirates EK-757', estimatedTime: '7h 15m', cost: 450000, status: 'delayed', distance: 5200 },
      { id: 'l11', mode: 'terrestre', origin: 'Aéroport Houari Boumediene', destination: 'Blida', carrier: 'Mustapha Djamel - Fourgon', estimatedTime: '1h 15m', cost: 30000, status: 'pending', distance: 40 },
    ],
    totalDistance: 5240,
    totalTime: '8h 30m',
    totalCost: 480000,
    co2Saved: 0.5,
    status: 'at_risk',
    progress: 20,
    unimodalCost: 580000,
    unimodalTime: '10 jours',
    createdAt: '2026-03-08',
  },
  {
    id: 'mc6',
    chainId: 'MM-2026-006',
    client: 'Mohamed Amrani',
    legs: [
      { id: 'l12', mode: 'maritime', origin: 'Casablanca', destination: 'Alger', carrier: 'CMA CGM Titan', estimatedTime: '4 jours', cost: 680000, status: 'completed', distance: 1200 },
      { id: 'l13', mode: 'rail', origin: 'Gare de Alger', destination: 'Constantine', carrier: 'SNTF Cargo', estimatedTime: '6 heures', cost: 95000, status: 'in_progress', distance: 390 },
    ],
    totalDistance: 1590,
    totalTime: '4j 6h',
    totalCost: 775000,
    co2Saved: 1.8,
    status: 'active',
    progress: 60,
    unimodalCost: 1100000,
    unimodalTime: '6 jours',
    createdAt: '2026-03-01',
  },
  {
    id: 'mc7',
    chainId: 'MM-2026-007',
    client: 'SPA TextilMaghreb',
    legs: [
      { id: 'l14', mode: 'maritime', origin: 'Barcelone', destination: 'Alger', carrier: 'COSCO Galaxy', estimatedTime: '2 jours', cost: 520000, status: 'completed', distance: 650 },
      { id: 'l15', mode: 'terrestre', origin: 'Port d\'Alger', destination: 'Constantine', carrier: 'Ali Mezdad - Remorque', estimatedTime: '8 heures', cost: 175000, status: 'completed', distance: 390 },
    ],
    totalDistance: 1040,
    totalTime: '2j 8h',
    totalCost: 695000,
    co2Saved: 0.9,
    status: 'completed',
    progress: 100,
    unimodalCost: 950000,
    unimodalTime: '4 jours',
    createdAt: '2026-02-25',
  },
  {
    id: 'mc8',
    chainId: 'MM-2026-008',
    client: 'Karim Djebbar',
    legs: [
      { id: 'l16', mode: 'aerien', origin: 'Londres', destination: 'Casablanca', carrier: 'Air France AF-1854', estimatedTime: '3h 20m', cost: 280000, status: 'completed', distance: 2100 },
      { id: 'l17', mode: 'terrestre', origin: 'Aéroport Mohammed V', destination: 'Oujda', carrier: 'Yacine Hamdi - Camion', estimatedTime: '8 heures', cost: 165000, status: 'in_progress', distance: 580 },
    ],
    totalDistance: 2680,
    totalTime: '11h 20m',
    totalCost: 445000,
    co2Saved: 0.4,
    status: 'active',
    progress: 55,
    unimodalCost: 560000,
    unimodalTime: '5 jours',
    createdAt: '2026-03-09',
  },
  {
    id: 'mc9',
    chainId: 'MM-2026-009',
    client: 'Nadia Benmoussa',
    legs: [
      { id: 'l18', mode: 'maritime', origin: 'Mumbai', destination: 'Djeddah', carrier: 'Evergreen Ever Given', estimatedTime: '10 jours', cost: 2100000, status: 'in_progress', distance: 4500 },
      { id: 'l19', mode: 'aerien', origin: 'Djeddah', destination: 'Alger', carrier: 'Saudia SV-341', estimatedTime: '5h 30m', cost: 380000, status: 'pending', distance: 3800 },
      { id: 'l20', mode: 'terrestre', origin: 'Aéroport Houari Boumediene', destination: 'Tizi Ouzou', carrier: 'Sofiane Benali - Camion', estimatedTime: '1h 30m', cost: 40000, status: 'pending', distance: 85 },
    ],
    totalDistance: 8385,
    totalTime: '10j 7h',
    totalCost: 2520000,
    co2Saved: 3.6,
    status: 'active',
    progress: 35,
    unimodalCost: 3800000,
    unimodalTime: '15 jours',
    createdAt: '2026-03-10',
  },
];

const transitPoints: TransitPoint[] = [
  { id: 'tp1', name: 'Port d\'Alger', type: 'port', avgTransferTime: '8h', successRate: 92, storageCapacity: 2500, currentOccupancy: 1850, missedConnections: 12, totalConnections: 150 },
  { id: 'tp2', name: 'Aéroport Houari Boumediene', type: 'airport', avgTransferTime: '3h', successRate: 96, storageCapacity: 800, currentOccupancy: 520, missedConnections: 5, totalConnections: 125 },
  { id: 'tp3', name: 'Hub de Casablanca', type: 'hub', avgTransferTime: '6h', successRate: 89, storageCapacity: 3200, currentOccupancy: 2100, missedConnections: 18, totalConnections: 165 },
  { id: 'tp4', name: 'Gare SNTF Alger', type: 'gare', avgTransferTime: '4h', successRate: 85, storageCapacity: 600, currentOccupancy: 380, missedConnections: 22, totalConnections: 147 },
  { id: 'tp5', name: 'Port de Marseille', type: 'port', avgTransferTime: '10h', successRate: 88, storageCapacity: 4000, currentOccupancy: 3200, missedConnections: 25, totalConnections: 200 },
  { id: 'tp6', name: 'Aéroport Mohammed V (Casablanca)', type: 'airport', avgTransferTime: '4h', successRate: 94, storageCapacity: 1200, currentOccupancy: 780, missedConnections: 8, totalConnections: 110 },
  { id: 'tp7', name: 'Port de Djeddah', type: 'port', avgTransferTime: '12h', successRate: 83, storageCapacity: 5000, currentOccupancy: 4200, missedConnections: 30, totalConnections: 175 },
  { id: 'tp8', name: 'Hub de Tunis', type: 'hub', avgTransferTime: '5h', successRate: 90, storageCapacity: 1500, currentOccupancy: 900, missedConnections: 10, totalConnections: 100 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const modeIcon: Record<TransportMode, React.ElementType> = {
  maritime: Ship,
  aerien: Plane,
  rail: Train,
  terrestre: Truck,
};

const modeLabel: Record<TransportMode, string> = {
  maritime: 'Maritime',
  aerien: 'Aérien',
  rail: 'Rail',
  terrestre: 'Terrestre',
};

const modeColor: Record<TransportMode, string> = {
  maritime: 'bg-cyan-500',
  aerien: 'bg-purple-500',
  rail: 'bg-amber-500',
  terrestre: 'bg-emerald-500',
};

const modeBgLight: Record<TransportMode, string> = {
  maritime: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  aerien: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  rail: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  terrestre: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const legStatusColors: Record<LegStatus, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const legStatusLabel: Record<LegStatus, string> = {
  completed: 'Terminé',
  in_progress: 'En cours',
  pending: 'En attente',
  delayed: 'Retardé',
};

const chainStatusColors: Record<ChainStatus, string> = {
  active: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  at_risk: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const chainStatusLabel: Record<ChainStatus, string> = {
  active: 'Active',
  planned: 'Planifiée',
  completed: 'Terminée',
  at_risk: 'En risque',
};

const transitTypeIcon: Record<string, React.ElementType> = {
  port: Ship,
  airport: Plane,
  hub: Warehouse,
  gare: Train,
};

const transitTypeLabel: Record<string, string> = {
  port: 'Port',
  airport: 'Aéroport',
  hub: 'Hub logistique',
  gare: 'Gare ferroviaire',
};

// ─── KPI Data ────────────────────────────────────────────────────────────────

const kpis = [
  { title: 'Chaînes multimodales actives', value: multimodalChains.filter(c => c.status === 'active' || c.status === 'at_risk').length, icon: GitMerge, color: 'from-teal-500 to-teal-600' },
  { title: 'Taux de correspondance', value: '91%', icon: Zap, color: 'from-emerald-500 to-green-600' },
  { title: 'Temps moyen de transit', value: '6j 8h', icon: Clock, color: 'from-cyan-500 to-teal-600' },
  { title: 'Économie vs unimodal', value: '23%', icon: DollarSign, color: 'from-amber-500 to-orange-600' },
  { title: 'CO2 économisé', value: `${multimodalChains.reduce((acc, c) => acc + c.co2Saved, 0).toFixed(1)} t`, icon: Leaf, color: 'from-green-500 to-emerald-600' },
];

// ─── Chart Data ──────────────────────────────────────────────────────────────

const reliabilityData = [
  { combination: 'Maritime→Terrestre', successRate: 91, avgDelay: 3.2, missed: 12 },
  { combination: 'Aérien→Terrestre', successRate: 94, avgDelay: 1.5, missed: 5 },
  { combination: 'Maritime→Rail', successRate: 85, avgDelay: 5.1, missed: 22 },
  { combination: 'Maritime→Rail→Terrestre', successRate: 82, avgDelay: 6.8, missed: 28 },
  { combination: 'Aérien→Rail', successRate: 87, avgDelay: 2.8, missed: 9 },
];

const costComparisonData = [
  { name: 'Maritime seul', cout: 5200, temps: 18, co2: 8.5 },
  { name: 'Mar.+Terrestre', cout: 4385, temps: 15.2, co2: 6.1 },
  { name: 'Aérien seul', cout: 6800, temps: 3, co2: 12.2 },
  { name: 'Aér.+Terrestre', cout: 5450, temps: 2.8, co2: 9.8 },
  { name: 'Mar.+Rail+Ter.', cout: 4010, temps: 12.4, co2: 4.2 },
];

const radarData = [
  { metric: 'Coût', unimodal: 85, multimodal: 62 },
  { metric: 'Temps', unimodal: 70, multimodal: 78 },
  { metric: 'Fiabilité', unimodal: 80, multimodal: 72 },
  { metric: 'Écologie', unimodal: 45, multimodal: 82 },
  { metric: 'Flexibilité', unimodal: 55, multimodal: 88 },
  { metric: 'Sécurité', unimodal: 78, multimodal: 75 },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function MultimodalPage() {
  const [expandedChain, setExpandedChain] = useState<string | null>(null);
  const [showPlanningDialog, setShowPlanningDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planLegs, setPlanLegs] = useState<TransportMode[]>(['maritime', 'terrestre']);
  const [planOrigin, setPlanOrigin] = useState('');
  const [planDestination, setPlanDestination] = useState('');

  const filtered = multimodalChains.filter(c => {
    const matchSearch = search === '' ||
      c.chainId.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.legs.some(l => l.origin.toLowerCase().includes(search.toLowerCase()) || l.destination.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleExpand = (id: string) => {
    setExpandedChain(expandedChain === id ? null : id);
  };

  // Planning calculations
  const planModeSequence = planLegs.map(m => modeLabel[m]).join(' → ');
  const totalPlanCost = planLegs.length * 350000;
  const totalPlanTime = planLegs.length === 2 ? '8 jours' : planLegs.length === 3 ? '14 jours' : '5 jours';
  const unimodalPlanCost = totalPlanCost * 1.3;
  const savingsPercent = Math.round(((unimodalPlanCost - totalPlanCost) / unimodalPlanCost) * 100);
  const co2Estimate = planLegs.length * 1.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-teal-500" />
            Transport Multi-Modal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Planification et suivi des chaînes de transport combiné</p>
        </div>
        <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowPlanningDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle chaîne
        </Button>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── Active Multi-Modal Chains ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="w-5 h-5 text-teal-500" />
            Chaînes multimodales actives
          </CardTitle>
          <CardDescription>Routes de transport combiné en cours et planifiées</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Rechercher chaîne, client, ville..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planned">Planifiée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="at_risk">En risque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((chain, index) => {
              const isExpanded = expandedChain === chain.id;
              return (
                <motion.div
                  key={chain.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors overflow-hidden"
                >
                  {/* Chain Header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer"
                    onClick={() => toggleExpand(chain.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <GitMerge className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{chain.chainId}</span>
                          <Badge variant="secondary" className={`text-[10px] ${chainStatusColors[chain.status]}`}>
                            {chainStatusLabel[chain.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{chain.client}</p>
                      </div>
                    </div>

                    {/* Route Visualization */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {chain.legs.map((leg, legIdx) => {
                        const LegIcon = modeIcon[leg.mode];
                        return (
                          <React.Fragment key={leg.id}>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{leg.origin}</span>
                            <div className={`w-6 h-6 rounded-full ${modeColor[leg.mode]} flex items-center justify-center`}>
                              <LegIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{leg.destination}</span>
                            {legIdx < chain.legs.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 mx-1" />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{chain.totalDistance.toLocaleString('fr-FR')} km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{chain.totalTime}</span>
                      <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-green-500" />{chain.co2Saved}t</span>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2 w-24 flex-shrink-0">
                      <Progress value={chain.progress} className="h-2 flex-1" />
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{chain.progress}%</span>
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                          {/* Legs Detail */}
                          {chain.legs.map((leg) => {
                            const LegIcon = modeIcon[leg.mode];
                            return (
                              <div key={leg.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className={`w-8 h-8 rounded-lg ${modeColor[leg.mode]} flex items-center justify-center flex-shrink-0`}>
                                    <LegIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{modeLabel[leg.mode]}</span>
                                      <Badge variant="secondary" className={`text-[9px] ${legStatusColors[leg.status]}`}>
                                        {legStatusLabel[leg.status]}
                                      </Badge>
                                    </div>
                                    <p className="text-[10px] text-gray-500">{leg.carrier}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="font-medium">{leg.origin}</span>
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                  <span className="font-medium">{leg.destination}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{leg.estimatedTime}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{leg.distance.toLocaleString('fr-FR')} km</span>
                                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{(leg.cost / 1000).toFixed(0)}K DA</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Cost Comparison Mini */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                              <p className="text-[10px] text-gray-500">Coût multimodal</p>
                              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{(chain.totalCost / 1000).toFixed(0)}K DA</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <p className="text-[10px] text-gray-500">Coût unimodal</p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{(chain.unimodalCost / 1000).toFixed(0)}K DA</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                              <p className="text-[10px] text-gray-500">Économie</p>
                              <p className="text-sm font-bold text-green-700 dark:text-green-400">{Math.round(((chain.unimodalCost - chain.totalCost) / chain.unimodalCost) * 100)}%</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                              <p className="text-[10px] text-gray-500">CO2 économisé</p>
                              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{chain.co2Saved} tonnes</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Chain Planning Tool ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            Outil de planification de chaîne
          </CardTitle>
          <CardDescription>Construisez votre chaîne multimodale étape par étape</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Mode Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Séquence de transport</Label>
              <div className="flex flex-wrap gap-2">
                {(['maritime', 'aerien', 'rail', 'terrestre'] as TransportMode[]).map((mode) => {
                  const Icon = modeIcon[mode];
                  const isSelected = planLegs.includes(mode);
                  return (
                    <Button
                      key={mode}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 text-xs gap-1.5 ${isSelected ? 'text-white' : ''}`}
                      style={isSelected ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : {}}
                      onClick={() => {
                        if (isSelected) {
                          setPlanLegs(planLegs.filter(l => l !== mode));
                        } else {
                          setPlanLegs([...planLegs, mode]);
                        }
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {modeLabel[mode]}
                    </Button>
                  );
                })}
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] text-gray-500 mb-1">Chaîne sélectionnée</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{planLegs.length > 0 ? planModeSequence : 'Aucun mode sélectionné'}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Origine</Label>
                  <Input placeholder="Ville de départ" value={planOrigin} onChange={(e) => setPlanOrigin(e.target.value)} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Destination</Label>
                  <Input placeholder="Ville d'arrivée" value={planDestination} onChange={(e) => setPlanDestination(e.target.value)} className="h-9" />
                </div>
              </div>
            </div>

            {/* Leg Details */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Détails par segment</Label>
              {planLegs.map((mode, idx) => {
                const Icon = modeIcon[mode];
                return (
                  <motion.div
                    key={`${mode}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-md ${modeColor[mode]} flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">Segment {idx + 1}: {modeLabel[mode]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">Origine</Label><Input placeholder="Ville" className="h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Destination</Label><Input placeholder="Ville" className="h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Transporteur</Label><Input placeholder="Nom" className="h-8 text-xs" /></div>
                      <div><Label className="text-[10px]">Temps estimé</Label><Input placeholder="ex: 5 jours" className="h-8 text-xs" /></div>
                    </div>
                  </motion.div>
                );
              })}
              {planLegs.length === 0 && (
                <p className="text-xs text-gray-400 italic py-4 text-center">Sélectionnez au moins un mode de transport</p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Résumé et comparaison</Label>
              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Temps de transit total</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{planLegs.length > 0 ? totalPlanTime : '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Coût estimé multimodal</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">{planLegs.length > 0 ? `${(totalPlanCost / 1000).toFixed(0)}K DA` : '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Coût estimé unimodal</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{planLegs.length > 0 ? `${(unimodalPlanCost / 1000).toFixed(0)}K DA` : '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Empreinte CO2 estimée</span>
                    <span className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-1"><Leaf className="w-3 h-3" />{planLegs.length > 0 ? `${co2Estimate.toFixed(1)} tonnes` : '-'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Économie estimée</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{planLegs.length > 0 ? `${savingsPercent}%` : '-'}</p>
                <p className="text-[10px] text-green-600 dark:text-green-500">vs transport unimodal équivalent</p>
              </div>

              <Button className="w-full text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} disabled={planLegs.length === 0}>
                <Zap className="w-4 h-4 mr-2" />
                Planifier la chaîne
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Transit Points Management ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-500" />
            Points de transit
          </CardTitle>
          <CardDescription>Gestion des points de correspondance et de transfert</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {transitPoints.map((point, index) => {
              const TypeIcon = transitTypeIcon[point.type];
              const occupancyPercent = Math.round((point.currentOccupancy / point.storageCapacity) * 100);
              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                      <TypeIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{point.name}</p>
                      <Badge variant="secondary" className="text-[9px] mt-0.5">{transitTypeLabel[point.type]}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Temps moyen de transfert</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><Timer className="w-3 h-3" />{point.avgTransferTime}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Taux de réussite</span>
                      <span className={`font-semibold ${point.successRate >= 90 ? 'text-green-600' : point.successRate >= 85 ? 'text-amber-600' : 'text-red-600'}`}>{point.successRate}%</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">Capacité de stockage</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{point.currentOccupancy}/{point.storageCapacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${occupancyPercent}%`,
                            background: occupancyPercent > 85 ? '#ef4444' : occupancyPercent > 70 ? '#f59e0b' : 'linear-gradient(90deg, #0d9488, #059669)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Correspondances manquées</span>
                      <span className="font-medium text-red-500">{point.missedConnections}/{point.totalConnections}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Connection Reliability Dashboard ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-500" />
              Fiabilité des correspondances
            </CardTitle>
            <CardDescription>Taux de réussite et délais par combinaison</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reliabilityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="combination" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Taux de réussite (%)') return [`${value}%`, name];
                      if (name === 'Retard moyen (h)') return [`${value}h`, name];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="successRate" name="Taux de réussite (%)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgDelay" name="Retard moyen (h)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Évaluation des risques
            </CardTitle>
            <CardDescription>Risques par chaîne et points de vigilance</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {multimodalChains.filter(c => c.status === 'active' || c.status === 'at_risk').map((chain) => {
                const riskLevel = chain.status === 'at_risk' ? 'high' : chain.legs.some(l => l.status === 'delayed') ? 'medium' : 'low';
                const riskColor = riskLevel === 'high' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' : riskLevel === 'medium' ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
                const riskLabel = riskLevel === 'high' ? 'Élevé' : riskLevel === 'medium' ? 'Moyen' : 'Faible';
                const missedLegs = chain.legs.filter(l => l.status === 'delayed').length;
                return (
                  <div key={chain.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{chain.chainId}</span>
                        <Badge className={`text-[9px] ${riskColor}`}>{riskLabel}</Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{chain.client} — {chain.legs.map(l => modeLabel[l.mode]).join(' → ')}</p>
                      {missedLegs > 0 && (
                        <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {missedLegs} segment(s) en retard
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-500">Progression</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{chain.progress}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-red-600">{multimodalChains.filter(c => c.status === 'at_risk').length}</p>
                  <p className="text-[10px] text-gray-500">Risque élevé</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{multimodalChains.filter(c => c.status === 'active' && c.legs.some(l => l.status === 'delayed')).length}</p>
                  <p className="text-[10px] text-gray-500">Risque moyen</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{multimodalChains.filter(c => c.status === 'active' && !c.legs.some(l => l.status === 'delayed')).length}</p>
                  <p className="text-[10px] text-gray-500">Faible risque</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Cost Comparison Tool ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" />
            Comparaison des coûts
          </CardTitle>
          <CardDescription>Analyse comparative unimodal vs multimodal</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cost Bar Chart */}
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Coût et temps par mode de transport</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costComparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="cout" name="Coût (K DA)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="co2" name="CO2 (tonnes)" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Analyse multidimensionnelle</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} />
                    <Radar name="Unimodal" dataKey="unimodal" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                    <Radar name="Multimodal" dataKey="multimodal" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recommendation Cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border-2 border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Meilleur coût</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Mar.+Rail+Ter.</p>
              <p className="text-[10px] text-gray-500">4 010K DA — 23% d'économie</p>
            </div>
            <div className="p-3 rounded-lg border-2 border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">Plus rapide</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Aér.+Terrestre</p>
              <p className="text-[10px] text-gray-500">2.8 jours — optimal urgence</p>
            </div>
            <div className="p-3 rounded-lg border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">Plus écologique</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Mar.+Rail+Ter.</p>
              <p className="text-[10px] text-gray-500">4.2t CO2 — 51% de réduction</p>
            </div>
            <div className="p-3 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Plus fiable</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Aérien→Terrestre</p>
              <p className="text-[10px] text-gray-500">94% réussite — 1.5h retard moyen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Chain Planning Dialog ──────────────────────────────────────────── */}
      <Dialog open={showPlanningDialog} onOpenChange={setShowPlanningDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-teal-500" />
              Nouvelle chaîne multimodale
            </DialogTitle>
            <DialogDescription>Planifier une nouvelle chaîne de transport combiné</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Origine</Label>
                <Input placeholder="Shanghai" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destination finale</Label>
                <Input placeholder="Oran" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Client</Label>
                <Input placeholder="Nom du client" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Nombre de segments</Label>
                <Select>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Segments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 segments</SelectItem>
                    <SelectItem value="3">3 segments</SelectItem>
                    <SelectItem value="4">4 segments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 mb-2">Combinaisons recommandées</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start h-9 text-xs gap-2">
                  <Ship className="w-4 h-4 text-cyan-500" />Maritime → <Truck className="w-4 h-4 text-emerald-500" />Terrestre
                  <Badge className="ml-auto text-[9px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">Populaire</Badge>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-9 text-xs gap-2">
                  <Plane className="w-4 h-4 text-purple-500" />Aérien → <Truck className="w-4 h-4 text-emerald-500" />Terrestre
                  <Badge className="ml-auto text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Rapide</Badge>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-9 text-xs gap-2">
                  <Ship className="w-4 h-4 text-cyan-500" />Maritime → <Train className="w-4 h-4 text-amber-500" />Rail → <Truck className="w-4 h-4 text-emerald-500" />Terrestre
                  <Badge className="ml-auto text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Éco</Badge>
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPlanningDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowPlanningDialog(false)}>
                <Zap className="w-4 h-4 mr-2" />
                Créer la chaîne
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
