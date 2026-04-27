'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  Calendar,
  LayoutTemplate,
  DollarSign,
  BarChart3,
  Users,
  Truck,
  ShieldCheck,
  Leaf,
  Shield,
  Warehouse,
  Download,
  Eye,
  Trash2,
  Play,
  Timer,
  FileSpreadsheet,
  FileDown,
  File,
  Loader2,
  Plus,
  ChevronDown,
  Ship,
  Plane,
  X,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCargoStore } from '@/lib/cargo-store';
import { clients, shipments, invoices, formatDZD } from '@/lib/test-data';

// ─── Static Data ───────────────────────────────────────────────────────────

const reportTypes = [
  { id: 'revenus', label: 'Revenus', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'performance', label: 'Performance expéditions', icon: BarChart3, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'clients', label: 'Activité clients', icon: Users, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { id: 'flotte', label: 'Utilisation flotte', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'douane', label: 'Conformité douanière', icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  { id: 'carbone', label: 'Empreinte carbone', icon: Leaf, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'sinistres', label: 'Sinistres assurance', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'entrepot', label: 'Opérations entrepôt', icon: Warehouse, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
];

const reportTemplates = [
  {
    id: 'tpl1',
    title: 'Rapport Revenus Mensuels',
    description: 'Analyse détaillée des revenus par mois, client et mode de transport avec comparaison N-1.',
    type: 'revenus',
    frequency: 'Mensuel',
    lastGenerated: '2026-03-01',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'tpl2',
    title: 'Performance Expéditions',
    description: 'Taux de livraison à temps, délais de transit, et analyse des retards par corridor.',
    type: 'performance',
    frequency: 'Hebdomadaire',
    lastGenerated: '2026-03-03',
    icon: BarChart3,
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'tpl3',
    title: 'Activité Clients',
    description: 'Classement clients par volume, revenu et évolution mensuelle des comptes.',
    type: 'clients',
    frequency: 'Mensuel',
    lastGenerated: '2026-03-01',
    icon: Users,
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'tpl4',
    title: 'Utilisation Flotte',
    description: 'Taux d\'utilisation des véhicules, kilométrage, maintenance et coûts opérationnels.',
    type: 'flotte',
    frequency: 'Hebdomadaire',
    lastGenerated: '2026-03-04',
    icon: Truck,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'tpl5',
    title: 'Conformité Douanière',
    description: 'Délais de dédouanement, taux de conformité, et analyse des rejets par catégorie.',
    type: 'douane',
    frequency: 'Trimestriel',
    lastGenerated: '2026-01-15',
    icon: ShieldCheck,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'tpl6',
    title: 'Empreinte Carbone',
    description: 'Émissions CO2 par mode, corridor et évolution de l\'empreinte environnementale.',
    type: 'carbone',
    frequency: 'Mensuel',
    lastGenerated: '2026-03-01',
    icon: Leaf,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'tpl7',
    title: 'Sinistres & Assurance',
    description: 'Historique des sinistres, taux de résolution, coûts des réclamations et couverture.',
    type: 'sinistres',
    frequency: 'Mensuel',
    lastGenerated: '2026-02-28',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'tpl8',
    title: 'Opérations Entrepôt',
    description: 'Rotation stock, taux d\'occupation, entrées/sorties et performance logistique.',
    type: 'entrepot',
    frequency: 'Hebdomadaire',
    lastGenerated: '2026-03-04',
    icon: Warehouse,
    color: 'from-orange-500 to-red-600',
  },
];

type ReportStatus = 'termine' | 'en_generation' | 'echoue';

interface RecentReport {
  id: string;
  name: string;
  type: string;
  date: string;
  format: 'PDF' | 'Excel' | 'CSV';
  size: string;
  status: ReportStatus;
}

const recentReports: RecentReport[] = [
  { id: 'r1', name: 'Rapport Revenus Février 2026', type: 'revenus', date: '2026-03-01', format: 'PDF', size: '2.4 MB', status: 'termine' },
  { id: 'r2', name: 'Performance Expéditions S10', type: 'performance', date: '2026-03-04', format: 'Excel', size: '1.8 MB', status: 'termine' },
  { id: 'r3', name: 'Activité Clients Q1 2026', type: 'clients', date: '2026-03-02', format: 'PDF', size: '3.1 MB', status: 'termine' },
  { id: 'r4', name: 'Rapport Flotte Février', type: 'flotte', date: '2026-03-03', format: 'Excel', size: '1.2 MB', status: 'termine' },
  { id: 'r5', name: 'Conformité Douanière Q4 2025', type: 'douane', date: '2026-01-15', format: 'PDF', size: '4.5 MB', status: 'termine' },
  { id: 'r6', name: 'Empreinte Carbone Février', type: 'carbone', date: '2026-03-01', format: 'CSV', size: '0.6 MB', status: 'termine' },
  { id: 'r7', name: 'Sinistres Février 2026', type: 'sinistres', date: '2026-03-05', format: 'PDF', size: '1.9 MB', status: 'en_generation' },
  { id: 'r8', name: 'Opérations Entrepôt S10', type: 'entrepot', date: '2026-03-04', format: 'Excel', size: '2.1 MB', status: 'termine' },
  { id: 'r9', name: 'Rapport Revenus Janvier 2026', type: 'revenus', date: '2026-02-01', format: 'PDF', size: '2.2 MB', status: 'termine' },
  { id: 'r10', name: 'Rapport Intégré Annuel', type: 'performance', date: '2026-03-05', format: 'PDF', size: '8.7 MB', status: 'echoue' },
];

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  format: string;
  recipients: string[];
  enabled: boolean;
}

const initialScheduledReports: ScheduledReport[] = [
  { id: 'sch1', name: 'Rapport Revenus Mensuel', frequency: 'Mensuel (1er)', nextRun: '2026-04-01', format: 'PDF', recipients: ['ahmed.benali@freightflow.pro', 'direction@freightflow.pro'], enabled: true },
  { id: 'sch2', name: 'Performance Hebdomadaire', frequency: 'Hebdomadaire (Lundi)', nextRun: '2026-03-10', format: 'Excel', recipients: ['fatima.khelifi@freightflow.pro'], enabled: true },
  { id: 'sch3', name: 'Rapport Flotte', frequency: 'Hebdomadaire (Vendredi)', nextRun: '2026-03-07', format: 'PDF', recipients: ['ahmed.benali@freightflow.pro', 'ops@freightflow.pro'], enabled: true },
  { id: 'sch4', name: 'Empreinte Carbone', frequency: 'Mensuel (15)', nextRun: '2026-04-15', format: 'CSV', recipients: ['rse@freightflow.pro'], enabled: false },
  { id: 'sch5', name: 'Conformité Douanière', frequency: 'Trimestriel', nextRun: '2026-06-30', format: 'PDF', recipients: ['legal@freightflow.pro', 'direction@freightflow.pro'], enabled: true },
  { id: 'sch6', name: 'Activité Clients', frequency: 'Mensuel (5)', nextRun: '2026-04-05', format: 'Excel', recipients: ['commercial@freightflow.pro'], enabled: true },
];

// Chart data for preview dialog
const revenueChartData = [
  { month: 'Sep', revenu: 8200000, precedent: 7100000 },
  { month: 'Oct', revenu: 9500000, precedent: 8300000 },
  { month: 'Nov', revenu: 11200000, precedent: 9800000 },
  { month: 'Déc', revenu: 12800000, precedent: 10500000 },
  { month: 'Jan', revenu: 10500000, precedent: 9200000 },
  { month: 'Fév', revenu: 11800000, precedent: 9800000 },
];

const shipmentsModeData = [
  { name: 'Maritime', value: 42, color: '#0d9488' },
  { name: 'Aérien', value: 28, color: '#0ea5e9' },
  { name: 'Terrestre', value: 30, color: '#f59e0b' },
];

const onTimeBarData = [
  { month: 'Oct', rate: 94 },
  { month: 'Nov', rate: 91 },
  { month: 'Déc', rate: 93 },
  { month: 'Jan', rate: 95 },
  { month: 'Fév', rate: 94 },
  { month: 'Mar', rate: 96 },
];

const topClientsPreview = [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

const previewSummaryMetrics = [
  { label: 'Revenu total', value: '11.8M DA', change: '+12.3%', positive: true },
  { label: 'Expéditions', value: '48', change: '+8.2%', positive: true },
  { label: 'Taux à temps', value: '96%', change: '+2.1%', positive: true },
  { label: 'Clients actifs', value: '12', change: '-1', positive: false },
];

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

const statusConfig: Record<ReportStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  termine: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  en_generation: { label: 'En génération', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Loader2 },
  echoue: { label: 'Échoué', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

const formatIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  Excel: FileSpreadsheet,
  CSV: FileDown,
};

const frequencyColors: Record<string, string> = {
  'Mensuel': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Hebdomadaire': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'Trimestriel': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { currentPage } = useCargoStore();

  // Report generator state
  const [selectedType, setSelectedType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Scheduled reports state
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(initialScheduledReports);

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<RecentReport | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
  };

  const handlePreview = (report: RecentReport) => {
    setPreviewReport(report);
    setPreviewOpen(true);
  };

  const toggleScheduled = (id: string) => {
    setScheduledReports((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const getTypeInfo = (typeId: string) => reportTypes.find((t) => t.id === typeId) || reportTypes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-500" />
          Rapports
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Génération, planification et suivi de vos rapports
        </p>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Rapports générés ce mois', value: '24', icon: FileText, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
          { label: 'Rapports planifiés', value: '6', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Dernière génération', value: 'Il y a 2h', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Modèles disponibles', value: '8', icon: LayoutTemplate, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── Report Generator ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-500" />
              Générateur de rapport
            </CardTitle>
            <CardDescription>Créez un nouveau rapport personnalisé en quelques clics</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Report Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Type de rapport</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Date début</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Date fin</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Format</Label>
                <div className="flex gap-2">
                  {(['PDF', 'Excel', 'CSV'] as const).map((fmt) => {
                    const FormatIcon = formatIcons[fmt];
                    const isSelected = selectedFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <FormatIcon className="w-3.5 h-3.5" />
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Client <span className="text-gray-400">(optionnel)</span>
                </Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transport Mode */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Mode de transport <span className="text-gray-400">(optionnel)</span>
                </Label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maritime">
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4 text-teal-500" /> Maritime
                      </div>
                    </SelectItem>
                    <SelectItem value="aerien">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-sky-500" /> Aérien
                      </div>
                    </SelectItem>
                    <SelectItem value="terrestre">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-500" /> Terrestre
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedType}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Générer le rapport
                  </>
                )}
              </Button>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  className="flex items-center gap-2"
                >
                  <Progress value={66} className="w-32 h-2" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">66%</span>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Report Templates ─── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-teal-500" />
          Modèles de rapports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {reportTemplates.map((tpl, index) => {
            const TplIcon = tpl.icon;
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Card className="hover:border-teal-300 dark:hover:border-teal-700 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tpl.color} flex items-center justify-center flex-shrink-0`}>
                        <TplIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tpl.title}</p>
                        <Badge variant="secondary" className={`text-[9px] mt-1 ${frequencyColors[tpl.frequency] || 'bg-gray-100 text-gray-600'}`}>
                          {tpl.frequency}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
                      {tpl.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400">
                        Dernier: {new Date(tpl.lastGenerated).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-teal-600 hover:text-teal-800 dark:text-teal-400">
                          <Play className="w-3 h-3 mr-1" />
                          Générer
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                          <Timer className="w-3 h-3 mr-1" />
                          Planifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Recent Reports Table ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <File className="w-5 h-5 text-teal-500" />
              Rapports récents
            </CardTitle>
            <CardDescription>Historique des 10 derniers rapports générés</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Format</TableHead>
                    <TableHead className="text-xs">Taille</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report, index) => {
                    const typeInfo = getTypeInfo(report.type);
                    const StatusIcon = statusConfig[report.status].icon;
                    const FormatIcon = formatIcons[report.format];
                    return (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="py-2.5">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{report.name}</p>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded ${typeInfo.bg} flex items-center justify-center`}>
                              <typeInfo.icon className={`w-3 h-3 ${typeInfo.color}`} />
                            </div>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {new Date(report.date).toLocaleDateString('fr-FR')}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge variant="secondary" className="text-[9px] gap-1">
                            <FormatIcon className="w-2.5 h-2.5" />
                            {report.format}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{report.size}</span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge variant="secondary" className={`text-[9px] gap-1 ${statusConfig[report.status].color}`}>
                            <StatusIcon className={`w-2.5 h-2.5 ${report.status === 'en_generation' ? 'animate-spin' : ''}`} />
                            {statusConfig[report.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-teal-600"
                              onClick={() => handlePreview(report)}
                              title="Aperçu"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-emerald-600"
                              title="Télécharger"
                              disabled={report.status !== 'termine'}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Scheduled Reports ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.35 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Rapports planifiés
            </CardTitle>
            <CardDescription>Gestion des rapports générés automatiquement</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {scheduledReports.map((sched, index) => (
                <motion.div
                  key={sched.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
                    sched.enabled
                      ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{sched.name}</p>
                      <Badge variant="secondary" className={`text-[9px] ${frequencyColors[sched.frequency.split(' ')[0]] || 'bg-gray-100 text-gray-600'}`}>
                        {sched.frequency}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Prochain: {new Date(sched.nextRun).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        {React.createElement(formatIcons[sched.format] || FileText, { className: 'w-3 h-3' })}
                        {sched.format}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {sched.recipients.length} destinataire{sched.recipients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {sched.recipients.map((r) => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] text-teal-600 hover:text-teal-800"
                      disabled={!sched.enabled}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Exécuter
                    </Button>
                    <Switch
                      checked={sched.enabled}
                      onCheckedChange={() => toggleScheduled(sched.id)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Report Preview Dialog ─── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="w-5 h-5 text-teal-500" />
              Aperçu du rapport
            </DialogTitle>
            <DialogDescription>
              {previewReport?.name || 'Aperçu'}
            </DialogDescription>
          </DialogHeader>

          {previewReport && (
            <div className="space-y-5 mt-2">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previewSummaryMetrics.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{metric.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    <p className={`text-[9px] font-medium ${metric.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {metric.change}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Revenue Area Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tendance des revenus</CardTitle>
                  <CardDescription>Évolution du CA vs année précédente</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip formatter={(value: number, name: string) => [formatDZD(value), name === 'revenu' ? 'Cette année' : 'Année précédente']} contentStyle={tooltipStyle} />
                        <Legend />
                        <Area type="monotone" dataKey="precedent" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeDasharray="5 5" name="Année précédente" />
                        <Area type="monotone" dataKey="revenu" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} name="Cette année" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Shipments by Mode (Donut) + On-time Rate (Bar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Expéditions par mode</CardTitle>
                    <CardDescription>Répartition par mode de transport</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={shipmentsModeData}
                            cx="50%"
                            cy="45%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {shipmentsModeData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value}%`, 'Part']} contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Livraison à temps</CardTitle>
                    <CardDescription>Taux de ponctualité mensuel</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={onTimeBarData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value: number) => [`${value}%`, 'Taux']} contentStyle={tooltipStyle} />
                          <Bar dataKey="rate" fill="#059669" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Clients List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top clients</CardTitle>
                  <CardDescription>Les 5 plus grands comptes par revenu</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {topClientsPreview.map((client, idx) => {
                      const maxRevenue = topClientsPreview[0].totalRevenue;
                      const pct = Math.round((client.totalRevenue / maxRevenue) * 100);
                      return (
                        <div key={client.id} className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 w-4 text-right">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{client.name}</p>
                              <span className="text-[10px] font-semibold text-teal-600 ml-2">{formatDZD(client.totalRevenue)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0d9488, #059669)' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Fermer
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger {previewReport.format}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
