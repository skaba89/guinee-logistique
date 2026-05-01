'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Ship,
  Plane,
  Truck,
  PackageCheck,
  Leaf,
  Clock,
  CheckCircle2,
  DollarSign,
  Brain,
  Lightbulb,
  ArrowRight,
  Zap,
  Target,
  Calendar,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
} from 'lucide-react';
import { useCurrency } from '@/lib/use-currency';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardStats, clients, shipments } from '@/lib/test-data';

const revenueData = dashboardStats.revenue.map((item, index) => ({
  ...item,
  previous: index < 6 ? Math.round(item.amount * 0.82) : Math.round(item.amount * 0.9),
}));

const shipmentsByModeData = [
  { month: 'Jan', Maritime: 12, Aerien: 8, Terrestre: 6 },
  { month: 'Fév', Maritime: 15, Aerien: 10, Terrestre: 8 },
  { month: 'Mar', Maritime: 18, Aerien: 12, Terrestre: 10 },
  { month: 'Avr', Maritime: 22, Aerien: 14, Terrestre: 12 },
  { month: 'Mai', Maritime: 20, Aerien: 11, Terrestre: 9 },
  { month: 'Jun', Maritime: 25, Aerien: 16, Terrestre: 14 },
];

const onTimeRateData = [
  { month: 'Jan', rate: 91 },
  { month: 'Fév', rate: 89 },
  { month: 'Mar', rate: 92 },
  { month: 'Avr', rate: 94 },
  { month: 'Mai', rate: 93 },
  { month: 'Jun', rate: 95 },
  { month: 'Jul', rate: 94 },
  { month: 'Aoû', rate: 92 },
  { month: 'Sep', rate: 96 },
  { month: 'Oct', rate: 94 },
  { month: 'Nov', rate: 95 },
  { month: 'Déc', rate: 96 },
];

const topClientsData = [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 6).map(c => ({
  name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
  revenue: c.totalRevenue,
}));

const carbonData = [
  { name: 'Maritime', value: 8.2, color: '#0d9488' },
  { name: 'Aérien', value: 45.6, color: '#0ea5e9' },
  { name: 'Terrestre', value: 12.8, color: '#f59e0b' },
  { name: 'Colis', value: 3.4, color: '#8b5cf6' },
];

const impactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const impactLabels: Record<string, string> = {
  high: 'Impact élevé',
  medium: 'Impact moyen',
  low: 'Impact faible',
};

// Predictive ETAs data
const predictiveEtas = [
  { shipment: 'FFP-0002-2026', route: 'Alger → Marseille', mode: 'maritime', currentEta: '2026-03-20', predictedEta: '2026-03-19', confidence: 87, trend: 'early', status: 'ahead' },
  { shipment: 'FFP-0005-2026', route: 'Rotterdam → Milan', mode: 'terrestre', currentEta: '2026-03-12', predictedEta: '2026-03-14', confidence: 72, trend: 'late', status: 'delayed' },
  { shipment: 'AH-2050', route: 'Alger → Marseille', mode: 'aerien', currentEta: '2026-03-06', predictedEta: '2026-03-06', confidence: 95, trend: 'on_time', status: 'on_time' },
  { shipment: 'RT-2026-001', route: 'Casablanca → Dakar', mode: 'terrestre', currentEta: '2026-03-11', predictedEta: '2026-03-12', confidence: 68, trend: 'late', status: 'delayed' },
  { shipment: 'FFP-0021-2026', route: 'Alger → Marseille', mode: 'maritime', currentEta: '2026-05-05', predictedEta: '2026-05-03', confidence: 82, trend: 'early', status: 'ahead' },
  { shipment: 'EK-757', route: 'Dubaï → Alger', mode: 'aerien', currentEta: '2026-03-08', predictedEta: '2026-03-09', confidence: 78, trend: 'late', status: 'delayed' },
];

const etaStatusColors: Record<string, string> = {
  ahead: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  on_time: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const etaStatusLabels: Record<string, string> = {
  ahead: 'En avance',
  on_time: 'À l\'heure',
  delayed: 'En retard',
};

const modeIcons: Record<string, typeof Ship> = {
  maritime: Ship,
  aerien: Plane,
  terrestre: Truck,
};

// Cost optimization data
const costOptimizations = [
  { category: 'Fret maritime', current: 12400000, optimized: 10800000, savings: 1600000, savingsPercent: 12.9, action: 'Regroupement conteneurs + négociation tarif volume' },
  { category: 'Fret aérien', current: 8900000, optimized: 8100000, savings: 800000, savingsPercent: 9.0, action: 'Pré-réservation capacité + optimisation LTA' },
  { category: 'Transport terrestre', current: 5200000, optimized: 4700000, savings: 500000, savingsPercent: 9.6, action: 'Optimisation itinéraires + réduction temps d\'attente' },
  { category: 'Douanes & droits', current: 3400000, optimized: 3100000, savings: 300000, savingsPercent: 8.8, action: 'Optimisation codes HS + zones franches' },
  { category: 'Entreposage', current: 2100000, optimized: 1800000, savings: 300000, savingsPercent: 14.3, action: 'Rotation stock + optimisation zones' },
];

// Seasonal trends data
const seasonalTrendsData = [
  { month: 'Jan', fret_maritime: 65, fret_aerien: 40, terrestre: 30, colis: 15 },
  { month: 'Fév', fret_maritime: 70, fret_aerien: 45, terrestre: 35, colis: 18 },
  { month: 'Mar', fret_maritime: 85, fret_aerien: 55, terrestre: 42, colis: 22 },
  { month: 'Avr', fret_maritime: 110, fret_aerien: 75, terrestre: 58, colis: 35 },
  { month: 'Mai', fret_maritime: 95, fret_aerien: 65, terrestre: 48, colis: 28 },
  { month: 'Jun', fret_maritime: 80, fret_aerien: 50, terrestre: 38, colis: 20 },
  { month: 'Jul', fret_maritime: 75, fret_aerien: 45, terrestre: 35, colis: 18 },
  { month: 'Aoû', fret_maritime: 65, fret_aerien: 40, terrestre: 30, colis: 15 },
  { month: 'Sep', fret_maritime: 90, fret_aerien: 60, terrestre: 45, colis: 25 },
  { month: 'Oct', fret_maritime: 100, fret_aerien: 70, terrestre: 52, colis: 32 },
  { month: 'Nov', fret_maritime: 120, fret_aerien: 85, terrestre: 65, colis: 45 },
  { month: 'Déc', fret_maritime: 130, fret_aerien: 95, terrestre: 72, colis: 55 },
];

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function AnalyticsPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const [appliedInsights, setAppliedInsights] = useState<Set<number>>(new Set());

  const performanceMetrics = [
    { label: 'Temps moyen de transit', value: '5.2 jours', icon: Clock, color: 'text-teal-500' },
    { label: 'Taux de livraison réussi', value: '94.2%', icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Coût moyen par km', value: `142 ${symbol}/km`, icon: DollarSign, color: 'text-amber-500' },
    { label: 'Réduction CO2 (trim.)', value: '-8.3%', icon: Leaf, color: 'text-emerald-500' },
  ];

  const aiInsights = [
    {
      id: 1,
      title: 'Optimiser les rotations maritimes',
      description: 'Regrouper les expéditions Alger→Marseille sur le navire Marco Polo pourrait réduire les coûts de 12% et améliorer le taux de remplissage de 78% à 91%.',
      impact: 'high',
      savings: `~1.2M ${symbol}/mois`,
      icon: Ship,
    },
    {
      id: 2,
      title: 'Anticiper le pic saisonnier Ramadan',
      description: 'Historiquement, les volumes augmentent de 35% en pré-Ramadan. Recommandation: réserver 4 conteneurs supplémentaires et 2 vols cargo pour les semaines 10-14.',
      impact: 'high',
      savings: 'Prévention ruptures',
      icon: Calendar,
    },
    {
      id: 3,
      title: 'Diversifier les routes terrestres',
      description: 'La route Casablanca→Dakar via Nouakchott présente des retards fréquents. Alternative via Bamako: +200km mais -8h de transit moyen.',
      impact: 'medium',
      savings: `~320K ${symbol}/mois`,
      icon: Truck,
    },
    {
      id: 4,
      title: 'Négocier les tarifs DHL Express',
      description: 'Avec 47% des colis express via DHL, un volume minimum garanti de 200 colis/mois permettrait d\'obtenir une remise de 15% sur le tarif standard.',
      impact: 'medium',
      savings: `~480K ${symbol}/mois`,
      icon: PackageCheck,
    },
  ];

  const handleApplyInsight = (insightId: number) => {
    setAppliedInsights(prev => {
      const next = new Set(prev);
      if (next.has(insightId)) {
        next.delete(insightId);
      } else {
        next.add(insightId);
      }
      return next;
    });
  };

  const totalCurrentCost = costOptimizations.reduce((a, b) => a + b.current, 0);
  const totalOptimizedCost = costOptimizations.reduce((a, b) => a + b.optimized, 0);
  const totalSavings = totalCurrentCost - totalOptimizedCost;
  const totalSavingsPercent = ((totalSavings / totalCurrentCost) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-500" />
          Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analyses avancées et indicateurs de performance</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {performanceMetrics.map((metric, index) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${metric.color}`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-500" />
            Recommandations IA
          </CardTitle>
          <CardDescription>Analyses prédictives et recommandations d&apos;optimisation</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight, index) => {
              const InsightIcon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <InsightIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</p>
                        <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 ${impactColors[insight.impact]}`}>
                          {impactLabels[insight.impact]}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-teal-500" />
                          <span className="text-[10px] font-medium text-teal-600">{insight.savings}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-teal-500 hover:text-teal-700 p-0" onClick={() => handleApplyInsight(insight.id)}>
                          {appliedInsights.has(insight.id) ? (
                            <><Check className="w-3 h-3 mr-1" />Appliqué</>
                          ) : (
                            <><>Appliquer</><ArrowRight className="w-3 h-3 ml-1" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Predictive ETAs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            ETAs prédictifs
          </CardTitle>
          <CardDescription>Prévisions d&apos;arrivée basées sur l&apos;IA et les données historiques</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-2">
            {predictiveEtas.map((eta, index) => {
              const ModeIcon = modeIcons[eta.mode] || Truck;
              return (
                <motion.div
                  key={eta.shipment}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${eta.mode === 'maritime' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' : eta.mode === 'aerien' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                      <ModeIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{eta.shipment}</p>
                      <p className="text-[10px] text-gray-400 truncate">{eta.route}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-center">
                      <p className="text-[8px] text-gray-400">ETA actuel</p>
                      <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{eta.currentEta}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <div className="text-center">
                      <p className="text-[8px] text-gray-400">ETA prédit</p>
                      <p className={`text-[10px] font-bold ${eta.status === 'delayed' ? 'text-red-500' : eta.status === 'ahead' ? 'text-green-500' : 'text-teal-600'}`}>{eta.predictedEta}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12">
                        <Progress value={eta.confidence} className="h-1.5" />
                      </div>
                      <span className="text-[9px] text-gray-500">{eta.confidence}%</span>
                    </div>
                    <Badge variant="secondary" className={`text-[9px] ${etaStatusColors[eta.status]}`}>
                      {etaStatusLabels[eta.status]}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Opportunities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Opportunités d&apos;optimisation des coûts
          </CardTitle>
          <CardDescription>Économies potentielles identifiées par catégorie</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Coût actuel</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{(totalCurrentCost / 1000000).toFixed(1)}M {symbol}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Coût optimisé</p>
              <p className="text-sm font-bold text-teal-600">{(totalOptimizedCost / 1000000).toFixed(1)}M {symbol}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Économie totale</p>
              <p className="text-sm font-bold text-emerald-600">{(totalSavings / 1000000).toFixed(1)}M {symbol} ({totalSavingsPercent}%)</p>
            </div>
          </div>

          <div className="space-y-3">
            {costOptimizations.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.category}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatPrice(item.current)}</span>
                    <ArrowRight className="w-3 h-3 text-teal-500" />
                    <span className="text-xs font-medium text-teal-600">{formatPrice(item.optimized)}</span>
                    <Badge className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                      -{item.savingsPercent}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full" style={{ width: `${item.savingsPercent * 5}%`, background: 'linear-gradient(90deg, #0d9488, #059669)' }} />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  <Lightbulb className="w-3 h-3 inline mr-1 text-amber-500" />
                  {item.action}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tendance des revenus</CardTitle>
          <CardDescription>Évolution du chiffre d&apos;affaires vs année précédente</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number, name: string) => [formatPrice(value), name === 'amount' ? 'Cette année' : 'Année précédente']} contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Année précédente" />
                <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} name="Cette année" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Trends Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            Tendances saisonnières
          </CardTitle>
          <CardDescription>Volume d&apos;expéditions par mode — pics et creux saisonniers</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonalTrendsData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="fret_maritime" stackId="1" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} name="Fret Maritime" />
                <Area type="monotone" dataKey="fret_aerien" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} name="Fret Aérien" />
                <Area type="monotone" dataKey="terrestre" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Terrestre" />
                <Area type="monotone" dataKey="colis" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Colis" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 px-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-gray-500">Pic: Avr & Nov-Déc (pré-Ramadan & fin d&apos;année)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowDownToLine className="w-3 h-3 text-sky-500" />
              <span className="text-[10px] text-gray-500">Creux: Juil-Aoû (saison estivale)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments by Mode Bar Chart + On-Time Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expéditions par mode</CardTitle>
            <CardDescription>Comparaison mensuelle</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shipmentsByModeData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="Maritime" fill="#0d9488" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Aerien" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Terrestre" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Taux de livraison à temps</CardTitle>
            <CardDescription>Pourcentage de livraisons dans les délais</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={onTimeRateData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Taux']} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients + Carbon Emissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top clients par revenus</CardTitle>
            <CardDescription>Les plus grands comptes</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientsData} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={110} />
                  <Tooltip formatter={(value: number) => [formatPrice(value), 'Revenu']} contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Émissions CO2 par mode</CardTitle>
            <CardDescription>Empreinte carbone en tonnes</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carbonData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}t`}
                  >
                    {carbonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} tonnes CO2`, 'Émissions']} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
