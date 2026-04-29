'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  BarChart3,
  Award,
  TreePine,
  Sun,
  Droplets,
  Ship,
  Plane,
  Truck,
  Train,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Globe,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  Users,
  Building2,
  Recycle,
  Wind,
  Target,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

// Carbon footprint by mode
const carbonByMode = [
  { name: 'Maritime', value: 1240, color: '#0d9488', icon: Ship },
  { name: 'Aérien', value: 3850, color: '#ef4444', icon: Plane },
  { name: 'Terrestre', value: 1870, color: '#f59e0b', icon: Truck },
  { name: 'Ferroviaire', value: 320, color: '#059669', icon: Train },
];

const totalEmissions = carbonByMode.reduce((a, b) => a + b.value, 0);

// 12 months of emissions data
const monthlyEmissions = [
  { month: 'Jan', emissions: 620, target: 580 },
  { month: 'Fév', emissions: 595, target: 575 },
  { month: 'Mar', emissions: 640, target: 570 },
  { month: 'Avr', emissions: 610, target: 565 },
  { month: 'Mai', emissions: 580, target: 560 },
  { month: 'Jun', emissions: 555, target: 555 },
  { month: 'Jul', emissions: 540, target: 550 },
  { month: 'Aoû', emissions: 520, target: 545 },
  { month: 'Sep', emissions: 510, target: 540 },
  { month: 'Oct', emissions: 530, target: 535 },
  { month: 'Nov', emissions: 505, target: 530 },
  { month: 'Déc', emissions: 490, target: 525 },
];

// 10 shipments with CO2 data
const shipmentEmissions = [
  { id: 'FFP-0001-2026', route: 'Alger → Marseille', mode: 'maritime', co2: 2.4, weight: 12.5, ecoScore: 'A' },
  { id: 'FFP-0002-2026', route: 'Alger → Paris CDG', mode: 'aerien', co2: 18.7, weight: 3.2, ecoScore: 'E' },
  { id: 'FFP-0003-2026', route: 'Casablanca → Dakar', mode: 'terrestre', co2: 6.3, weight: 8.0, ecoScore: 'C' },
  { id: 'FFP-0004-2026', route: 'Shanghai → Alger', mode: 'maritime', co2: 3.1, weight: 22.0, ecoScore: 'A' },
  { id: 'FFP-0005-2026', route: 'Rotterdam → Milan', mode: 'terrestre', co2: 4.8, weight: 6.5, ecoScore: 'B' },
  { id: 'FFP-0006-2026', route: 'Dubaï → Alger', mode: 'aerien', co2: 15.2, weight: 2.8, ecoScore: 'D' },
  { id: 'FFP-0007-2026', route: 'Hambourg → Alger', mode: 'maritime', co2: 2.8, weight: 18.0, ecoScore: 'A' },
  { id: 'FFP-0008-2026', route: 'Istanbul → Le Caire', mode: 'ferroviaire', co2: 1.2, weight: 10.0, ecoScore: 'A' },
  { id: 'FFP-0009-2026', route: 'Marseille → Alger', mode: 'maritime', co2: 2.6, weight: 14.0, ecoScore: 'B' },
  { id: 'FFP-0010-2026', route: 'Londres → New York', mode: 'aerien', co2: 22.4, weight: 4.0, ecoScore: 'E' },
];

// 5 AI-powered modal shift recommendations
const recommendations = [
  {
    id: 1,
    title: 'Transférer 15% du fret aérien vers le maritime',
    description: 'Les routes Alger→Marseille et Dubaï→Alger peuvent être partiellement transférées vers le maritime, réduisant significativement les émissions avec un impact limité sur les délais (+3 jours en moyenne).',
    co2Saving: 120,
    costImpact: '-8%',
    delayImpact: '+3 jours',
    priority: 'high',
    icon: Ship,
  },
  {
    id: 2,
    title: 'Optimiser les rotations maritimes Alger→Marseille',
    description: 'Regrouper les expéditions sur des navires plus récents avec une consommation carburant réduite de 20%. Le navire CMA CGM Marco Polo est disponible sur cette route.',
    co2Saving: 45,
    costImpact: '-5%',
    delayImpact: 'Aucun',
    priority: 'high',
    icon: Recycle,
  },
  {
    id: 3,
    title: 'Développer le transport ferroviaire en Europe',
    description: 'Les routes terrestres Rotterdam→Milan et Hambourg→Algérie peuvent être partiellement remplacées par le rail, réduisant les émissions de 60% par tonne-km.',
    co2Saving: 85,
    costImpact: '+3%',
    delayImpact: '+1 jour',
    priority: 'medium',
    icon: Train,
  },
  {
    id: 4,
    title: 'Regrouper les envois express aériens',
    description: 'Consolider les petits colis aériens en envois groupés hebdomadaires plutôt que quotidiens. Réduction potentielle de 30% des vols cargo nécessaires.',
    co2Saving: 62,
    costImpact: '-12%',
    delayImpact: '+2 jours',
    priority: 'medium',
    icon: Zap,
  },
  {
    id: 5,
    title: 'Adopter les carburants maritimes alternatifs',
    description: 'Souscrire aux options LNG (Gaz Naturel Liquéfié) et biofuel proposées par CMA CGM et Maersk. Réduction de 25-30% des émissions par voyage maritime.',
    co2Saving: 95,
    costImpact: '+6%',
    delayImpact: 'Aucun',
    priority: 'low',
    icon: Droplets,
  },
];

// 4 Green Certifications
const certifications = [
  {
    id: 1,
    name: 'ISO 14001',
    fullName: 'ISO 14001:2015 — Système de Management Environnemental',
    status: 'active',
    validUntil: '2027-09-15',
    lastAudit: '2025-11-20',
    nextAudit: '2026-11-20',
    description: 'Certification du système de management environnemental couvrant toutes les opérations logistiques.',
    coverage: 95,
  },
  {
    id: 2,
    name: 'GREENMARINE',
    fullName: 'Green Marine — Certification Environnementale Maritime',
    status: 'active',
    validUntil: '2027-03-01',
    lastAudit: '2025-06-10',
    nextAudit: '2026-06-10',
    description: 'Programme volontaire de certification environnementale pour les opérations maritimes et portuaires.',
    coverage: 82,
  },
  {
    id: 3,
    name: 'Clean Cargo',
    fullName: 'Clean Cargo Working Group — Norme de Mesure des Émissions',
    status: 'in_progress',
    validUntil: 'En cours',
    lastAudit: '2025-01-15',
    nextAudit: '2026-04-01',
    description: 'Méthodologie standardisée pour la mesure et la déclaration des émissions de gaz à effet de serre du fret maritime.',
    coverage: 60,
  },
  {
    id: 4,
    name: 'SmartWay',
    fullName: 'EPA SmartWay — Transport Durable',
    status: 'pending',
    validUntil: 'Non obtenu',
    lastAudit: '-',
    nextAudit: '2026-Q3',
    description: 'Programme de l\'Agence de Protection de l\'Environnement des États-Unis pour le transport durable.',
    coverage: 25,
  },
];

// 3 Offset programs
const offsetPrograms = [
  {
    id: 1,
    name: 'Reforestation Sahel',
    location: 'Sahel Algérien',
    type: 'Reforestation',
    description: 'Plantation de 50 000 arbres dans la région du Sahel algérien pour la capture de carbone et la lutte contre la désertification.',
    costPerTonne: 12,
    co2Captured: 2400,
    targetCapture: 5000,
    verified: true,
    standard: 'VCS (Verified Carbon Standard)',
    icon: TreePine,
  },
  {
    id: 2,
    name: 'Solaire Sahara',
    location: 'Adrar, Algérie',
    type: 'Énergie Renouvelable',
    description: 'Parc solaire de 20 MW contribuant à la transition énergétique et à la réduction des émissions de CO2 liées aux énergies fossiles.',
    costPerTonne: 18,
    co2Captured: 3800,
    targetCapture: 6000,
    verified: true,
    standard: 'Gold Standard',
    icon: Sun,
  },
  {
    id: 3,
    name: 'Éolien Hauts Plateaux',
    location: 'Tiaret, Algérie',
    type: 'Énergie Renouvelable',
    description: 'Parc éolien de 15 MW sur les Hauts Plateaux pour la production d\'énergie propre et la réduction de l\'empreinte carbone.',
    costPerTonne: 22,
    co2Captured: 1200,
    targetCapture: 4500,
    verified: false,
    standard: 'CDM (Clean Development Mechanism)',
    icon: Wind,
  },
];

// ESG Radar data
const esgData = [
  { subject: 'Environnement', E: 78, fullMark: 100 },
  { subject: 'Social', S: 65, fullMark: 100 },
  { subject: 'Gouvernance', G: 82, fullMark: 100 },
  { subject: 'Émissions CO2', E: 71, fullMark: 100 },
  { subject: 'Biodiversité', E: 58, fullMark: 100 },
  { subject: 'Conformité', G: 88, fullMark: 100 },
  { subject: 'Bien-être employés', S: 72, fullMark: 100 },
  { subject: 'Éthique supply chain', S: 68, fullMark: 100 },
];

// ESG score components
const esgScores = [
  { label: 'Score Environnemental (E)', value: 78, color: '#059669', icon: Leaf },
  { label: 'Score Social (S)', value: 65, color: '#0d9488', icon: Users },
  { label: 'Score de Gouvernance (G)', value: 82, color: '#22c55e', icon: Building2 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ecoScoreConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  A: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700', label: 'Excellent' },
  B: { color: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-300 dark:border-teal-700', label: 'Bon' },
  C: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700', label: 'Moyen' },
  D: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700', label: 'Faible' },
  E: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', label: 'Critique' },
};

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Priorité haute' },
  medium: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Priorité moyenne' },
  low: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Priorité basse' },
};

const certStatusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  active: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle2, label: 'Actif' },
  in_progress: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock, label: 'En cours' },
  pending: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: AlertTriangle, label: 'En attente' },
};

const modeIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  maritime: { icon: Ship, color: 'text-teal-600 dark:text-teal-400' },
  aerien: { icon: Plane, color: 'text-sky-600 dark:text-sky-400' },
  terrestre: { icon: Truck, color: 'text-amber-600 dark:text-amber-400' },
  ferroviaire: { icon: Train, color: 'text-green-600 dark:text-green-400' },
};

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SustainabilityPage() {
  const avgCo2PerShipment = (shipmentEmissions.reduce((a, b) => a + b.co2, 0) / shipmentEmissions.length).toFixed(1);
  const activeCertifications = certifications.filter((c) => c.status === 'active').length;
  const totalCo2Savings = recommendations.reduce((a, b) => a + b.co2Saving, 0);
  const esgGlobalScore = Math.round(esgScores.reduce((a, b) => a + b.value, 0) / esgScores.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-500" />
          Durabilité & RSE
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tableau de bord ESG — Conformité CSRD et stratégie bas-carbone
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Empreinte Carbone Totale', value: `${(totalEmissions / 1000).toFixed(1)} kt`, sub: 'CO2 eq / an', icon: Globe, trend: '-8.3%', trendUp: false, color: 'from-emerald-500 to-green-600' },
          { label: 'CO2/Expédition (moy)', value: `${avgCo2PerShipment} t`, sub: 'par expédition', icon: BarChart3, trend: '-5.1%', trendUp: false, color: 'from-teal-500 to-emerald-600' },
          { label: 'Score ESG', value: `${esgGlobalScore}/100`, sub: 'Global RSE', icon: Award, trend: '+4.2%', trendUp: true, color: 'from-green-500 to-teal-600' },
          { label: 'Certifications Actives', value: `${activeCertifications}/${certifications.length}`, sub: 'Normes environnementales', icon: BadgeCheck, trend: '+1', trendUp: true, color: 'from-emerald-600 to-green-500' },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{kpi.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trendUp ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-500" />
                  )}
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">{kpi.trend}</span>
                  <span className="text-[10px] text-gray-400 ml-1">vs trim. préc.</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Leaf className="w-3.5 h-3.5 mr-1.5" />
            Tableau de Bord
          </TabsTrigger>
          <TabsTrigger value="emissions" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Émissions Détaillées
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Recommandations
          </TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Certifications & Offsets
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Tableau de Bord ────────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
          {/* Carbon Footprint Donut + Monthly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Donut Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  Empreinte Carbone par Mode
                </CardTitle>
                <CardDescription>Répartition des émissions CO2 en tonnes</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={carbonByMode}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}t`}
                      >
                        {carbonByMode.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} tonnes CO2`, name]}
                        contentStyle={tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {carbonByMode.map((mode) => {
                    const pct = ((mode.value / totalEmissions) * 100).toFixed(1);
                    return (
                      <div key={mode.name} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: mode.color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{mode.name}</p>
                          <p className="text-[10px] text-gray-500">{mode.value}t ({pct}%)</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Emissions Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-500" />
                  Tendance Mensuelle des Émissions
                </CardTitle>
                <CardDescription>Émissions CO2 vs objectif annuel (tonnes)</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyEmissions} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="emissions"
                        stroke="#059669"
                        fill="#059669"
                        fillOpacity={0.2}
                        name="Émissions réelles"
                      />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
                        name="Objectif"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-3 px-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] text-gray-500">
                      Baisse de {((monthlyEmissions[0].emissions - monthlyEmissions[11].emissions) / monthlyEmissions[0].emissions * 100).toFixed(1)}% sur l&apos;année
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-gray-500">Objectif CSRD atteint depuis Juin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ESG Score Card + Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* ESG Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  Score ESG — Radar
                </CardTitle>
                <CardDescription>Évaluation RSE selon les critères CSRD</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={esgData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <Radar
                        name="Score Actuel"
                        dataKey="E"
                        stroke="#059669"
                        fill="#059669"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Score Social"
                        dataKey="S"
                        stroke="#0d9488"
                        fill="#0d9488"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Score Gouvernance"
                        dataKey="G"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ESG Score Breakdown */}
            <div className="space-y-4">
              {esgScores.map((score, index) => (
                <motion.div
                  key={score.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: score.color + '20' }}
                        >
                          <score.icon className="w-5 h-5" style={{ color: score.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{score.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {score.value >= 80 ? 'Performance excellente' : score.value >= 65 ? 'Performance satisfaisante' : 'Amélioration requise'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: score.color }}>{score.value}</p>
                          <p className="text-[10px] text-gray-400">/ 100</p>
                        </div>
                      </div>
                      <Progress value={score.value} className="h-2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Global Score Summary */}
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Score ESG Global</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Conformité CSRD</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-emerald-600">{esgGlobalScore}</div>
                      <div className="text-sm text-gray-400">/100</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Conforme CSRD
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +4.2 pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Émissions Détaillées ───────────────────────────────────── */}
        <TabsContent value="emissions" className="space-y-4 sm:space-y-6">
          {/* Emissions by mode bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Émissions CO2 par Mode de Transport
              </CardTitle>
              <CardDescription>Comparaison des émissions en tonnes CO2 équivalent</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carbonByMode} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} tonnes CO2`, 'Émissions']}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {carbonByMode.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Emissions Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-500" />
                Émissions par Expédition
              </CardTitle>
              <CardDescription>CO2 par envoi avec éco-score (A = meilleur, E = critique)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs">Référence</TableHead>
                      <TableHead className="text-xs">Route</TableHead>
                      <TableHead className="text-xs">Mode</TableHead>
                      <TableHead className="text-xs text-right">Poids (t)</TableHead>
                      <TableHead className="text-xs text-right">CO2 (t)</TableHead>
                      <TableHead className="text-xs text-center">Éco-Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentEmissions.map((shipment, index) => {
                      const eco = ecoScoreConfig[shipment.ecoScore];
                      const modeInfo = modeIconMap[shipment.mode];
                      const ModeIcon = modeInfo?.icon || Truck;
                      return (
                        <motion.tr
                          key={shipment.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: index * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <TableCell className="text-xs font-mono font-semibold text-gray-900 dark:text-white">
                            {shipment.id}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                            {shipment.route}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <ModeIcon className={`w-3.5 h-3.5 ${modeInfo?.color}`} />
                              <span className="text-xs capitalize text-gray-700 dark:text-gray-300">{shipment.mode}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-right text-gray-600 dark:text-gray-300">
                            {shipment.weight}
                          </TableCell>
                          <TableCell className="text-xs text-right font-semibold text-gray-900 dark:text-white">
                            {shipment.co2}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold border ${eco.bg} ${eco.color} ${eco.border}`}>
                              {shipment.ecoScore}
                            </span>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Eco-score legend */}
              <div className="flex flex-wrap items-center gap-3 mt-3 px-1">
                <span className="text-[10px] text-gray-400 font-medium">Éco-Score :</span>
                {Object.entries(ecoScoreConfig).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {key}
                    </span>
                    <span className="text-[10px] text-gray-500">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 3: Recommandations ─────────────────────────────────────────── */}
        <TabsContent value="recommendations" className="space-y-4 sm:space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Recommandations IA — Transfert Modal
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Optimisations identifiées pour réduire votre empreinte carbone
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalCo2Savings}t</p>
                    <p className="text-[10px] text-gray-500">CO2 économisable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{((totalCo2Savings / totalEmissions) * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-500">Réduction potentielle</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations List */}
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const RecIcon = rec.icon;
              const priority = priorityConfig[rec.priority];
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <Card className="hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                          <RecIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {rec.title}
                            </h4>
                            <Badge variant="secondary" className={`text-[10px] w-fit ${priority.bg} ${priority.color}`}>
                              {priority.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                            {rec.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20">
                              <Leaf className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                -{rec.co2Saving}t CO2
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800">
                              <span className="text-[10px] text-gray-500">Coût :</span>
                              <span className={`text-xs font-semibold ${rec.costImpact.startsWith('-') ? 'text-green-600' : 'text-amber-600'}`}>
                                {rec.costImpact}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-300">{rec.delayImpact}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden sm:flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex-shrink-0"
                        >
                          Appliquer
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Impact Simulation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Simulation d&apos;Impact — Application des Recommandations
              </CardTitle>
              <CardDescription>Projection des émissions après transfert modal</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {carbonByMode.map((mode) => {
                  const reduction = mode.name === 'Aérien' ? 15 : mode.name === 'Terrestre' ? 10 : 0;
                  const newValue = Math.round(mode.value * (1 - reduction / 100));
                  const saved = mode.value - newValue;
                  return (
                    <div key={mode.name} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      <mode.icon className="w-5 h-5 mx-auto mb-1" style={{ color: mode.color }} />
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{mode.name}</p>
                      <p className="text-[10px] text-gray-400">{mode.value}t → {newValue}t</p>
                      {saved > 0 && (
                        <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[10px]">
                          -{saved}t
                        </Badge>
                      )}
                      {saved === 0 && (
                        <Badge className="mt-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 text-[10px]">
                          Stable
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Économie totale projetée</span>
                  <span className="text-lg font-bold text-emerald-600">-{totalCo2Savings}t CO2/an</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 4: Certifications & Offsets ────────────────────────────────── */}
        <TabsContent value="certifications" className="space-y-4 sm:space-y-6">
          {/* Green Certifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                Certifications Vertes
              </CardTitle>
              <CardDescription>Suivi des certifications environnementales et conformité CSRD</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {certifications.map((cert, index) => {
                  const statusCfg = certStatusConfig[cert.status];
                  const StatusIcon = statusCfg.icon;
                  return (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.06 }}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusCfg.bg}`}>
                            <StatusIcon className={`w-6 h-6 ${statusCfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{cert.name}</h4>
                              <Badge variant="secondary" className={`text-[10px] ${statusCfg.bg} ${statusCfg.color}`}>
                                {statusCfg.label}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                              {cert.fullName}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              {cert.description}
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 pl-15 sm:pl-0">
                          <div>
                            <p className="text-[10px] text-gray-400">Valide jusqu&apos;au</p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{cert.validUntil}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Prochain audit</p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{cert.nextAudit}</p>
                          </div>
                        </div>
                      </div>
                      {/* Coverage bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 w-16">Couverture</span>
                        <div className="flex-1">
                          <Progress value={cert.coverage} className="h-2" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{cert.coverage}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Carbon Offset Programs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TreePine className="w-5 h-5 text-green-500" />
                Programmes de Compensation Carbone
              </CardTitle>
              <CardDescription>Projets certifiés de compensation et neutralité carbone</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {offsetPrograms.map((program, index) => {
                  const ProgramIcon = program.icon;
                  const capturePct = Math.round((program.co2Captured / program.targetCapture) * 100);
                  return (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-colors">
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                              <ProgramIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{program.name}</h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Globe className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] text-gray-500">{program.location}</span>
                              </div>
                            </div>
                          </div>

                          <Badge variant="secondary" className="w-fit text-[10px] mb-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                            {program.type}
                          </Badge>

                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                            {program.description}
                          </p>

                          {/* Capture Progress */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-gray-400">Capture CO2</span>
                              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                                {program.co2Captured.toLocaleString()} / {program.targetCapture.toLocaleString()} t
                              </span>
                            </div>
                            <Progress value={capturePct} className="h-2" />
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div>
                              <p className="text-[10px] text-gray-400">Coût / tonne</p>
                              <p className="text-sm font-bold text-emerald-600">{program.costPerTonne}€</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Standard</p>
                              <div className="flex items-center gap-1">
                                {program.verified && (
                                  <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                                )}
                                <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                  {program.standard.split(' ')[0]}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Souscrire
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Offset Summary */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Recycle className="w-5 h-5 text-green-500" />
                    Résumé Compensation Carbone
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Statut de neutralité carbone et objectifs annuels
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">
                      {offsetPrograms.reduce((a, b) => a + b.co2Captured, 0).toLocaleString()}t
                    </p>
                    <p className="text-[10px] text-gray-500">CO2 compensé</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-600">
                      {offsetPrograms.reduce((a, b) => a + b.targetCapture, 0).toLocaleString()}t
                    </p>
                    <p className="text-[10px] text-gray-500">Objectif</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-teal-600">
                      {offsetPrograms.reduce((a, b) => a + b.co2Captured, 0) > 0
                        ? Math.round(
                            (offsetPrograms.reduce((a, b) => a + b.co2Captured, 0) /
                              offsetPrograms.reduce((a, b) => a + b.targetCapture, 0)) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-[10px] text-gray-500">Atteint</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
