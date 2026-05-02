'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  UserPlus,
  FileText,
  Container,
  Leaf,
  Ship,
  Plane,
  Clock,
  AlertTriangle,
  MapPin,
  Globe,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { shipments, containers, dashboardStats, statusLabels, typeLabels, formatDate, clients } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';
import { useCurrency } from '@/lib/use-currency';
import { useToastAction } from '@/components/cargo/toast-provider';
import { brandGradient } from '@/lib/design-tokens';

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const typeColors: Record<string, string> = {
  aerien: '#0ea5e9',
  maritime: '#0d9488',
  terrestre: '#f59e0b',
  parcels: '#8b5cf6',
};

// Mini sparkline data for KPI cards
const sparklineData = {
  shipments: [12, 15, 11, 18, 22, 19, 24, 21, 26, 28, 25, 30],
  transit: [3, 5, 4, 6, 5, 8, 7, 6, 8, 7, 9, 10],
  onTime: [88, 90, 89, 91, 92, 93, 91, 94, 93, 95, 94, 94.2],
  revenue: [2.1, 2.4, 2.3, 2.8, 3.1, 2.9, 3.4, 3.2, 3.6, 3.8, 3.5, 4.0],
  containers: [3, 4, 5, 4, 6, 5, 7, 6, 8, 7, 6, 7],
  carbon: [18, 16, 17, 15, 14, 15, 13, 14, 13, 12.8, 12.6, 12.4],
};

const recentActivity = [
  { time: '09:45', event: 'Conteneur MSKU-7234561 chargé sur CMA CGM Marco Polo', type: 'maritime' as const },
  { time: '09:30', event: 'Vol AH-2050 en route vers Marseille', type: 'aerien' as const },
  { time: '09:15', event: 'Déclaration DOU-2026-0003 en révision', type: 'customs' as const },
  { time: '08:50', event: 'Colis PC-FP-2026-0003 en livraison à Dubaï', type: 'parcels' as const },
  { time: '08:30', event: 'Route RT-2026-005 démarrée - Casablanca vers Alger', type: 'terrestre' as const },
  { time: '08:00', event: 'Conteneur CSLU-8912345 arrivé au port d\'Alger', type: 'maritime' as const },
  { time: '07:45', event: 'Déclaration DOU-2026-0007 dédouanée', type: 'customs' as const },
  { time: '07:30', event: 'Vol EK-757 retardé - Dubaï vers Alger', type: 'aerien' as const },
];

const activityIcons: Record<string, React.ElementType> = {
  maritime: Ship,
  aerien: Plane,
  terrestre: Truck,
  customs: FileText,
  parcels: Package,
};

const activityColors: Record<string, string> = {
  maritime: 'text-teal-500',
  aerien: 'text-sky-500',
  terrestre: 'text-amber-500',
  customs: 'text-purple-500',
  parcels: 'text-violet-500',
};

// World map route data
const routeLines = [
  { from: { x: '42%', y: '38%' }, to: { x: '48%', y: '32%' } },
  { from: { x: '42%', y: '38%' }, to: { x: '82%', y: '55%' } },
  { from: { x: '42%', y: '38%' }, to: { x: '25%', y: '48%' } },
  { from: { x: '82%', y: '30%' }, to: { x: '42%', y: '38%' } },
  { from: { x: '48%', y: '28%' }, to: { x: '55%', y: '32%' } },
  { from: { x: '38%', y: '60%' }, to: { x: '42%', y: '38%' } },
];

const mapPoints = [
  { x: '42%', y: '38%', label: 'Alger', active: true },
  { x: '48%', y: '32%', label: 'Marseille', active: true },
  { x: '82%', y: '30%', label: 'Shanghai', active: true },
  { x: '82%', y: '55%', label: 'Dubaï', active: true },
  { x: '25%', y: '35%', label: 'New York', active: true },
  { x: '55%', y: '32%', label: 'Djeddah', active: false },
  { x: '48%', y: '28%', label: 'Hambourg', active: true },
  { x: '38%', y: '60%', label: 'Lagos', active: false },
  { x: '30%', y: '42%', label: 'Casablanca', active: true },
  { x: '85%', y: '62%', label: 'Singapour', active: false },
  { x: '75%', y: '45%', label: 'Mumbai', active: false },
  { x: '33%', y: '30%', label: 'Montréal', active: false },
];

// Sparkline mini component
function MiniSparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="opacity-60">
      <defs>
        <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const setPage = useCargoStore((s) => s.setPage);
  const { format: formatPrice } = useCurrency();
  const { toast } = useToastAction();

  const kpiCards = [
    {
      title: 'Total Expéditions',
      value: dashboardStats.totalShipments,
      icon: Package,
      trend: '+12%',
      trendUp: true,
      color: 'from-teal-500 to-teal-600',
      sparkData: sparklineData.shipments,
      sparkColor: '#0d9488',
    },
    {
      title: 'En Transit',
      value: dashboardStats.shipmentsByStatus.find(s => s.status === 'en_transit')?.count || 0,
      icon: Truck,
      trend: '+3',
      trendUp: true,
      color: 'from-orange-500 to-amber-600',
      sparkData: sparklineData.transit,
      sparkColor: '#f59e0b',
    },
    {
      title: 'Livraison À Temps',
      value: '94.2%',
      icon: CheckCircle2,
      trend: '+2.1%',
      trendUp: true,
      color: 'from-emerald-500 to-green-600',
      sparkData: sparklineData.onTime,
      sparkColor: '#10b981',
    },
    {
      title: "Chiffre d'Affaires",
      value: formatPrice(dashboardStats.revenue.reduce((a, b) => a + b.amount, 0)),
      icon: DollarSign,
      trend: '+15%',
      trendUp: true,
      color: 'from-teal-600 to-emerald-700',
      sparkData: sparklineData.revenue,
      sparkColor: '#059669',
    },
    {
      title: 'Conteneurs Actifs',
      value: containers.filter(c => c.status === 'in_transit' || c.status === 'loaded').length,
      icon: Container,
      trend: '',
      trendUp: true,
      color: 'from-cyan-500 to-teal-600',
      sparkData: sparklineData.containers,
      sparkColor: '#06b6d4',
    },
    {
      title: 'Empreinte Carbone',
      value: '12.4t CO2',
      icon: Leaf,
      trend: '-8%',
      trendUp: false,
      color: 'from-green-500 to-emerald-600',
      sparkData: sparklineData.carbon,
      sparkColor: '#22c55e',
    },
  ];

  const recentShipments = [...shipments].sort((a, b) =>
    new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
  ).slice(0, 5);

  const handleExportCSV = () => {
    const headers = ['Indicateur', 'Valeur'];
    const rows = kpiCards.map(card => [card.title, String(card.value)]);
    rows.push([]);
    rows.push(['Expéditions récentes']);
    rows.push(['N° Suivi', 'Type', 'Client', 'Origine', 'Destination', 'Statut', 'Date', 'Prix']);
    recentShipments.forEach(s => {
      rows.push([s.trackingNumber, typeLabels[s.type] || s.type, s.clientName, s.origin, s.destination, statusLabels[s.status] || s.status, formatDate(s.dateCreation), String(s.price)]);
    });
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guinee-logistique-dashboard-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export réussi', 'Le fichier CSV a été téléchargé');
  };

  const pieData = [
    { name: 'Maritime', value: dashboardStats.shipmentsByType.find(s => s.type === 'maritime')?.count || 0, color: '#0d9488' },
    { name: 'Aérien', value: dashboardStats.shipmentsByType.find(s => s.type === 'aerien')?.count || 0, color: '#0ea5e9' },
    { name: 'Terrestre', value: dashboardStats.shipmentsByType.find(s => s.type === 'terrestre')?.count || 0, color: '#f59e0b' },
    { name: 'Colis', value: 10, color: '#8b5cf6' },
  ];

  const topClients = [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

  // Weekly performance data for bar chart
  const weeklyData = [
    { day: 'Lun', expeditions: 8, livrees: 7 },
    { day: 'Mar', expeditions: 12, livrees: 10 },
    { day: 'Mer', expeditions: 10, livrees: 9 },
    { day: 'Jeu', expeditions: 15, livrees: 13 },
    { day: 'Ven', expeditions: 14, livrees: 12 },
    { day: 'Sam', expeditions: 6, livrees: 5 },
    { day: 'Dim', expeditions: 3, livrees: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vue d&apos;ensemble de votre activité logistique internationale</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs btn-press" onClick={handleExportCSV}>
            <TrendingUp className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button
            size="sm"
            className="text-xs text-white btn-press"
            style={{ background: brandGradient }}
            onClick={() => {
              setPage('shipments');
              toast.info('Redirection', 'Création d\'une nouvelle expédition');
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle expédition
          </Button>
        </div>
      </div>

      {/* KPI Cards — Enhanced with sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden card-hover group cursor-default">
              {/* Background decorative gradient */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity rounded-bl-full`} />
              <CardContent className="p-3 sm:p-4 relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 truncate">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                {/* Sparkline */}
                <div className="mt-2 flex items-end justify-between">
                  <MiniSparkline data={card.sparkData} color={card.sparkColor} />
                  {card.trend && (
                    <div className="flex items-center gap-1">
                      {card.trendUp ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-green-500" />
                      )}
                      <span className="text-[10px] sm:text-xs font-medium text-green-500">{card.trend}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row — Enhanced with weekly bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenus mensuels</CardTitle>
                <CardDescription>Évolution du chiffre d&apos;affaires sur 12 mois</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                +15% vs N-1
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.revenue} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), 'Revenu']}
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Shipments by Mode */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expéditions par mode</CardTitle>
            <CardDescription>Répartition des envois</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontSize: '12px', color: 'var(--foreground)' }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Bar Chart + World Map + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Weekly Performance */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance hebdomadaire</CardTitle>
            <CardDescription>Expéditions vs livraisons ce jour</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="expeditions" fill="#0d9488" radius={[4, 4, 0, 0]} name="Expéditions" />
                  <Bar dataKey="livrees" fill="#10b981" radius={[4, 4, 0, 0]} name="Livrées" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* World Map */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Routes actives</CardTitle>
                <CardDescription>Flux de marchandises en temps réel</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                {routeLines.length} routes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative h-56 sm:h-64 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0a2520 50%, #0f172a 100%)' }}>
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute w-full h-px bg-teal-400" style={{ top: `${(i + 1) * 12.5}%` }} />
                ))}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute h-full w-px bg-teal-400" style={{ left: `${(i + 1) * 8.33}%` }} />
                ))}
              </div>

              {/* Route lines */}
              <svg className="absolute inset-0 w-full h-full">
                {routeLines.map((route, i) => (
                  <line
                    key={`line-${i}`}
                    x1={route.from.x} y1={route.from.y}
                    x2={route.to.x} y2={route.to.y}
                    stroke="#0d9488" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"
                  />
                ))}
              </svg>

              {/* Map points */}
              {mapPoints.map((point, i) => (
                <div key={`point-${i}`} className="absolute group" style={{ left: point.x, top: point.y }}>
                  <div className={`w-2 h-2 rounded-full ${point.active ? 'bg-teal-400' : 'bg-teal-600/50'}`}>
                    {point.active && (
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-teal-400 animate-ping opacity-50" />
                    )}
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[9px] text-teal-200 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded">
                      {point.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-2 right-2 flex items-center gap-3 text-[9px] text-teal-300/60">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>Actif</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600/50" />
                  <span>Secondaire</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Activité récente</CardTitle>
                <CardDescription>Derniers événements</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('shipments')}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => {
                const IconComponent = activityIcons[activity.type] || Package;
                const colorClass = activityColors[activity.type] || 'text-gray-500';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800 ${colorClass}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{activity.event}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400">{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row: Top Clients + Quick Actions + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Clients */}
        <Card className="lg:col-span-1 card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Clients</CardTitle>
                <CardDescription>Par chiffre d&apos;affaires</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('clients')}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => setPage('clients')}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-teal-500' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-cyan-500' : 'bg-gray-400'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{client.totalShipments} expéditions</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(client.totalRevenue)}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actions rapides</CardTitle>
            <CardDescription>Raccourcis fréquents</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-2.5">
            <Button
              className="w-full justify-start gap-3 h-10 text-white btn-press"
              style={{ background: brandGradient }}
              onClick={() => setPage('shipments')}
            >
              <Plus className="w-4 h-4" />
              Nouvelle expédition
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-10 btn-press"
              onClick={() => setPage('maritime')}
            >
              <Ship className="w-4 h-4" />
              Nouveau conteneur
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-10 btn-press"
              onClick={() => setPage('clients')}
            >
              <UserPlus className="w-4 h-4" />
              Nouveau client
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-10 btn-press"
              onClick={() => setPage('customs')}
            >
              <FileText className="w-4 h-4" />
              Déclaration douanière
            </Button>

            {/* Mini Stats */}
            <div className="pt-3 space-y-2.5 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Véhicules actifs</span>
                <span className="font-semibold text-gray-900 dark:text-white">{dashboardStats.activeVehicles}/10</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{ background: brandGradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(dashboardStats.activeVehicles / 10) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Clients enregistrés</span>
                <span className="font-semibold text-gray-900 dark:text-white">{dashboardStats.clientsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Alertes</CardTitle>
                <CardDescription>Notifications importantes</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 badge-pulse">
                3 urgentes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-700 dark:text-red-400">Vol EK-757 retardé</p>
                  <p className="text-[10px] text-red-600/70 dark:text-red-400/60">Dubaï vers Alger - Retard de 3h</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Déclaration en attente</p>
                  <p className="text-[10px] text-orange-600/70 dark:text-orange-400/60">DOU-2026-0003 - En révision depuis 48h</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Factures en retard</p>
                  <p className="text-[10px] text-yellow-600/70 dark:text-yellow-400/60">2 factures impayées dépassent l&apos;échéance</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Conteneur arrivé</p>
                  <p className="text-[10px] text-teal-600/70 dark:text-teal-400/60">CSLU-8912345 au port d&apos;Alger</p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
