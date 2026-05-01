'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  Send,
  ArrowUpRight,
  Edit3,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  XCircle,
  FileWarning,
  Scale,
  Settings2,
  BarChart3,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useCargoStore } from '@/lib/cargo-store';
import { useCurrency } from '@/lib/use-currency';

// ─── Format helpers ─────────────────────────────────────────────

function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

// ─── Types ──────────────────────────────────────────────────────

type ClientCategory = 'standard' | 'silver' | 'gold' | 'platinum' | 'vip';
type ClientStatus = 'actif' | 'bloque' | 'surveillance' | 'inactif';
type DunningLevel = 'relance1' | 'relance2' | 'mise_en_demeure' | 'procedure_juridique';
type DunningStatus = 'en_cours' | 'envoyee' | 'echue' | 'cloturee';
type RiskCategory = 'faible' | 'moyen' | 'eleve' | 'critique';

interface ClientCredit {
  id: string;
  name: string;
  category: ClientCategory;
  creditLimit: number;
  currentOutstanding: number;
  overdueAmount: number;
  utilizationRate: number;
  riskScore: number;
  riskCategory: RiskCategory;
  status: ClientStatus;
  paymentHistory: number;
  outstandingRatio: number;
  daysSalesOutstanding: number;
  disputeRate: number;
  creditUtilization: number;
}

interface OverdueInvoice {
  id: string;
  invoiceRef: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  dunningLevel: DunningLevel;
  dunningStatus: DunningStatus;
}

interface CategoryCreditConfig {
  category: ClientCategory;
  defaultLimit: number;
  maxLimit: number;
  autoBlockThreshold: number;
}

// ─── Labels ─────────────────────────────────────────────────────

const categoryLabels: Record<ClientCategory, string> = {
  standard: 'Standard',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  vip: 'VIP',
};

const categoryColors: Record<ClientCategory, string> = {
  standard: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  silver: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  gold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  platinum: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  vip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusLabels: Record<ClientStatus, string> = {
  actif: 'Actif',
  bloque: 'Bloqué',
  surveillance: 'Surveillance',
  inactif: 'Inactif',
};

const statusColors: Record<ClientStatus, string> = {
  actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  bloque: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  surveillance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  inactif: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const dunningLevelLabels: Record<DunningLevel, string> = {
  relance1: '1ère relance',
  relance2: '2ème relance',
  mise_en_demeure: 'Mise en demeure',
  procedure_juridique: 'Procédure juridique',
};

const dunningLevelColors: Record<DunningLevel, string> = {
  relance1: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  relance2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  mise_en_demeure: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  procedure_juridique: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
};

const dunningStatusLabels: Record<DunningStatus, string> = {
  en_cours: 'En cours',
  envoyee: 'Envoyée',
  echue: 'Échue',
  cloturee: 'Clôturée',
};

const riskCategoryLabels: Record<RiskCategory, string> = {
  faible: 'Faible',
  moyen: 'Moyen',
  eleve: 'Élevé',
  critique: 'Critique',
};

const riskCategoryColors: Record<RiskCategory, string> = {
  faible: 'text-emerald-600 dark:text-emerald-400',
  moyen: 'text-amber-600 dark:text-amber-400',
  eleve: 'text-orange-600 dark:text-orange-400',
  critique: 'text-red-600 dark:text-red-400',
};

const riskCategoryBgColors: Record<RiskCategory, string> = {
  faible: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  moyen: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  eleve: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  critique: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
};

// ─── Mock Data ──────────────────────────────────────────────────

const clientCredits: ClientCredit[] = [
  {
    id: 'cc1', name: 'SPA HydroServices', category: 'platinum', creditLimit: 5000000,
    currentOutstanding: 3200000, overdueAmount: 180000, utilizationRate: 64.0, riskScore: 28,
    riskCategory: 'faible', status: 'actif', paymentHistory: 95, outstandingRatio: 12,
    daysSalesOutstanding: 32, disputeRate: 2, creditUtilization: 64,
  },
  {
    id: 'cc2', name: 'SARL Maghreb Transit', category: 'gold', creditLimit: 3000000,
    currentOutstanding: 2400000, overdueAmount: 520000, utilizationRate: 80.0, riskScore: 55,
    riskCategory: 'moyen', status: 'surveillance', paymentHistory: 72, outstandingRatio: 38,
    daysSalesOutstanding: 48, disputeRate: 8, creditUtilization: 80,
  },
  {
    id: 'cc3', name: 'EURL Atlas Cargo', category: 'silver', creditLimit: 1500000,
    currentOutstanding: 1350000, overdueAmount: 720000, utilizationRate: 90.0, riskScore: 78,
    riskCategory: 'eleve', status: 'surveillance', paymentHistory: 55, outstandingRatio: 53,
    daysSalesOutstanding: 67, disputeRate: 14, creditUtilization: 90,
  },
  {
    id: 'cc4', name: 'SONATRACH Division Logistics', category: 'vip', creditLimit: 10000000,
    currentOutstanding: 4100000, overdueAmount: 0, utilizationRate: 41.0, riskScore: 12,
    riskCategory: 'faible', status: 'actif', paymentHistory: 99, outstandingRatio: 5,
    daysSalesOutstanding: 21, disputeRate: 0.5, creditUtilization: 41,
  },
  {
    id: 'cc5', name: 'Cevital Transport', category: 'platinum', creditLimit: 7000000,
    currentOutstanding: 5600000, overdueAmount: 1100000, utilizationRate: 80.0, riskScore: 52,
    riskCategory: 'moyen', status: 'actif', paymentHistory: 75, outstandingRatio: 32,
    daysSalesOutstanding: 44, disputeRate: 6, creditUtilization: 80,
  },
  {
    id: 'cc6', name: 'SARL Sahara Express', category: 'standard', creditLimit: 800000,
    currentOutstanding: 780000, overdueAmount: 620000, utilizationRate: 97.5, riskScore: 92,
    riskCategory: 'critique', status: 'bloque', paymentHistory: 30, outstandingRatio: 79,
    daysSalesOutstanding: 95, disputeRate: 22, creditUtilization: 97.5,
  },
  {
    id: 'cc7', name: 'EURL Tell Express', category: 'silver', creditLimit: 1200000,
    currentOutstanding: 600000, overdueAmount: 80000, utilizationRate: 50.0, riskScore: 35,
    riskCategory: 'faible', status: 'actif', paymentHistory: 88, outstandingRatio: 13,
    daysSalesOutstanding: 28, disputeRate: 3, creditUtilization: 50,
  },
  {
    id: 'cc8', name: 'Groupe Med Logistic', category: 'gold', creditLimit: 4000000,
    currentOutstanding: 3800000, overdueAmount: 2100000, utilizationRate: 95.0, riskScore: 85,
    riskCategory: 'critique', status: 'surveillance', paymentHistory: 42, outstandingRatio: 55,
    daysSalesOutstanding: 78, disputeRate: 18, creditUtilization: 95,
  },
  {
    id: 'cc9', name: 'SARL Port Services', category: 'standard', creditLimit: 600000,
    currentOutstanding: 240000, overdueAmount: 0, utilizationRate: 40.0, riskScore: 18,
    riskCategory: 'faible', status: 'actif', paymentHistory: 94, outstandingRatio: 8,
    daysSalesOutstanding: 25, disputeRate: 1, creditUtilization: 40,
  },
  {
    id: 'cc10', name: 'EURL Kabylie Transport', category: 'silver', creditLimit: 1000000,
    currentOutstanding: 870000, overdueAmount: 340000, utilizationRate: 87.0, riskScore: 68,
    riskCategory: 'eleve', status: 'surveillance', paymentHistory: 60, outstandingRatio: 39,
    daysSalesOutstanding: 55, disputeRate: 10, creditUtilization: 87,
  },
];

const overdueInvoices: OverdueInvoice[] = [
  {
    id: 'oi1', invoiceRef: 'FAC-2026-0042', clientId: 'cc6', clientName: 'SARL Sahara Express',
    amount: 320000, dueDate: '2025-12-15', daysOverdue: 74, dunningLevel: 'mise_en_demeure', dunningStatus: 'envoyee',
  },
  {
    id: 'oi2', invoiceRef: 'FAC-2026-0038', clientId: 'cc6', clientName: 'SARL Sahara Express',
    amount: 180000, dueDate: '2025-11-20', daysOverdue: 99, dunningLevel: 'procedure_juridique', dunningStatus: 'en_cours',
  },
  {
    id: 'oi3', invoiceRef: 'FAC-2026-0051', clientId: 'cc8', clientName: 'Groupe Med Logistic',
    amount: 950000, dueDate: '2026-01-10', daysOverdue: 48, dunningLevel: 'relance2', dunningStatus: 'envoyee',
  },
  {
    id: 'oi4', invoiceRef: 'FAC-2026-0055', clientId: 'cc8', clientName: 'Groupe Med Logistic',
    amount: 620000, dueDate: '2026-01-20', daysOverdue: 38, dunningLevel: 'relance2', dunningStatus: 'en_cours',
  },
  {
    id: 'oi5', invoiceRef: 'FAC-2026-0048', clientId: 'cc3', clientName: 'EURL Atlas Cargo',
    amount: 420000, dueDate: '2026-01-05', daysOverdue: 53, dunningLevel: 'relance2', dunningStatus: 'envoyee',
  },
  {
    id: 'oi6', invoiceRef: 'FAC-2026-0060', clientId: 'cc3', clientName: 'EURL Atlas Cargo',
    amount: 300000, dueDate: '2026-02-01', daysOverdue: 26, dunningLevel: 'relance1', dunningStatus: 'envoyee',
  },
  {
    id: 'oi7', invoiceRef: 'FAC-2026-0053', clientId: 'cc5', clientName: 'Cevital Transport',
    amount: 580000, dueDate: '2026-01-15', daysOverdue: 43, dunningLevel: 'relance2', dunningStatus: 'en_cours',
  },
  {
    id: 'oi8', invoiceRef: 'FAC-2026-0057', clientId: 'cc5', clientName: 'Cevital Transport',
    amount: 520000, dueDate: '2026-01-25', daysOverdue: 33, dunningLevel: 'relance1', dunningStatus: 'envoyee',
  },
  {
    id: 'oi9', invoiceRef: 'FAC-2026-0045', clientId: 'cc2', clientName: 'SARL Maghreb Transit',
    amount: 310000, dueDate: '2026-01-08', daysOverdue: 50, dunningLevel: 'relance2', dunningStatus: 'envoyee',
  },
  {
    id: 'oi10', invoiceRef: 'FAC-2026-0062', clientId: 'cc2', clientName: 'SARL Maghreb Transit',
    amount: 210000, dueDate: '2026-02-05', daysOverdue: 22, dunningLevel: 'relance1', dunningStatus: 'en_cours',
  },
  {
    id: 'oi11', invoiceRef: 'FAC-2026-0064', clientId: 'cc10', clientName: 'EURL Kabylie Transport',
    amount: 190000, dueDate: '2026-01-28', daysOverdue: 30, dunningLevel: 'relance1', dunningStatus: 'envoyee',
  },
  {
    id: 'oi12', invoiceRef: 'FAC-2026-0058', clientId: 'cc10', clientName: 'EURL Kabylie Transport',
    amount: 150000, dueDate: '2026-02-08', daysOverdue: 19, dunningLevel: 'relance1', dunningStatus: 'en_cours',
  },
  {
    id: 'oi13', invoiceRef: 'FAC-2026-0035', clientId: 'cc1', clientName: 'SPA HydroServices',
    amount: 180000, dueDate: '2026-02-12', daysOverdue: 15, dunningLevel: 'relance1', dunningStatus: 'en_cours',
  },
];

const riskTrendData = [
  { month: 'Sep', risqueMoyen: 38, clientsRisque: 2, encoursRetard: 1200000 },
  { month: 'Oct', risqueMoyen: 42, clientsRisque: 3, encoursRetard: 1850000 },
  { month: 'Nov', risqueMoyen: 48, clientsRisque: 3, encoursRetard: 2400000 },
  { month: 'Dec', risqueMoyen: 52, clientsRisque: 4, encoursRetard: 3100000 },
  { month: 'Jan', risqueMoyen: 55, clientsRisque: 5, encoursRetard: 3800000 },
  { month: 'Fév', risqueMoyen: 51, clientsRisque: 4, encoursRetard: 3500000 },
];

const categoryConfigs: CategoryCreditConfig[] = [
  { category: 'standard', defaultLimit: 500000, maxLimit: 2000000, autoBlockThreshold: 90 },
  { category: 'silver', defaultLimit: 1500000, maxLimit: 5000000, autoBlockThreshold: 85 },
  { category: 'gold', defaultLimit: 3000000, maxLimit: 8000000, autoBlockThreshold: 80 },
  { category: 'platinum', defaultLimit: 5000000, maxLimit: 15000000, autoBlockThreshold: 75 },
  { category: 'vip', defaultLimit: 10000000, maxLimit: 50000000, autoBlockThreshold: 70 },
];

// ─── Utility ────────────────────────────────────────────────────

function getUtilizationColor(rate: number): string {
  if (rate < 50) return 'text-emerald-600 dark:text-emerald-400';
  if (rate < 80) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getUtilizationBgColor(rate: number): string {
  if (rate < 50) return 'bg-emerald-500';
  if (rate < 80) return 'bg-amber-500';
  return 'bg-red-500';
}

function getRiskScoreColor(score: number): string {
  if (score < 30) return 'text-emerald-600 dark:text-emerald-400';
  if (score < 60) return 'text-amber-600 dark:text-amber-400';
  if (score < 80) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function getRiskScoreBg(score: number): string {
  if (score < 30) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700';
  if (score < 60) return 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700';
  if (score < 80) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
  return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
}

// ─── Main Component ─────────────────────────────────────────────

export default function CreditManagementPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const canEdit = useCargoStore((s) => s.canEdit('credit-management'));

  // ── Overview Tab state
  const totalOutstanding = useMemo(() => clientCredits.reduce((s, c) => s + c.currentOutstanding, 0), []);
  const totalOverdue = useMemo(() => clientCredits.reduce((s, c) => s + c.overdueAmount, 0), []);
  const totalCreditLimit = useMemo(() => clientCredits.reduce((s, c) => s + c.creditLimit, 0), []);
  const avgUtilization = useMemo(() => clientCredits.reduce((s, c) => s + c.utilizationRate, 0) / clientCredits.length, []);
  const clientsAtRisk = useMemo(() => clientCredits.filter((c) => c.riskCategory === 'eleve' || c.riskCategory === 'critique').length, []);
  const pendingReminders = useMemo(() => overdueInvoices.filter((i) => i.dunningStatus === 'en_cours').length, []);

  // ── Encours Client Tab state
  const [clientSearch, setClientSearch] = useState('');
  const [clientCategoryFilter, setClientCategoryFilter] = useState<string>('all');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [clientPage, setClientPage] = useState(1);
  const [editingClient, setEditingClient] = useState<ClientCredit | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [detailClient, setDetailClient] = useState<ClientCredit | null>(null);
  const [clientsData, setClientsData] = useState<ClientCredit[]>(clientCredits);

  const CLIENTS_PER_PAGE = 6;

  const filteredClients = useMemo(() => {
    let result = [...clientsData];
    if (clientCategoryFilter !== 'all') {
      result = result.filter((c) => c.category === clientCategoryFilter);
    }
    if (clientStatusFilter !== 'all') {
      result = result.filter((c) => c.status === clientStatusFilter);
    }
    if (clientSearch) {
      const q = clientSearch.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b.riskScore - a.riskScore);
  }, [clientsData, clientCategoryFilter, clientStatusFilter, clientSearch]);

  const clientTotalPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE);
  const paginatedClients = filteredClients.slice((clientPage - 1) * CLIENTS_PER_PAGE, clientPage * CLIENTS_PER_PAGE);

  const handleSaveCreditLimit = () => {
    if (editingClient && newCreditLimit) {
      const newLimit = parseFloat(newCreditLimit);
      if (!isNaN(newLimit) && newLimit > 0) {
        setClientsData((prev) =>
          prev.map((c) =>
            c.id === editingClient.id
              ? {
                  ...c,
                  creditLimit: newLimit,
                  utilizationRate: (c.currentOutstanding / newLimit) * 100,
                  creditUtilization: (c.currentOutstanding / newLimit) * 100,
                }
              : c
          )
        );
      }
      setEditingClient(null);
      setNewCreditLimit('');
    }
  };

  // ── Relances Tab state
  const [dunningLevelFilter, setDunningLevelFilter] = useState<string>('all');
  const [daysOverdueFilter, setDaysOverdueFilter] = useState<string>('all');
  const [dunningSearch, setDunningSearch] = useState('');
  const [dunningPage, setDunningPage] = useState(1);
  const [invoicesData, setInvoicesData] = useState<OverdueInvoice[]>(overdueInvoices);
  const [escalateDialog, setEscalateDialog] = useState<OverdueInvoice | null>(null);

  const DUNNING_PER_PAGE = 6;

  const filteredInvoices = useMemo(() => {
    let result = [...invoicesData];
    if (dunningLevelFilter !== 'all') {
      result = result.filter((i) => i.dunningLevel === dunningLevelFilter);
    }
    if (daysOverdueFilter !== 'all') {
      const days = parseInt(daysOverdueFilter);
      if (days === 30) result = result.filter((i) => i.daysOverdue <= 30);
      else if (days === 60) result = result.filter((i) => i.daysOverdue > 30 && i.daysOverdue <= 60);
      else if (days === 90) result = result.filter((i) => i.daysOverdue > 60 && i.daysOverdue <= 90);
      else if (days === 999) result = result.filter((i) => i.daysOverdue > 90);
    }
    if (dunningSearch) {
      const q = dunningSearch.toLowerCase();
      result = result.filter(
        (i) => i.clientName.toLowerCase().includes(q) || i.invoiceRef.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [invoicesData, dunningLevelFilter, daysOverdueFilter, dunningSearch]);

  const dunningTotalPages = Math.ceil(filteredInvoices.length / DUNNING_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice((dunningPage - 1) * DUNNING_PER_PAGE, dunningPage * DUNNING_PER_PAGE);

  const handleSendReminder = (invoiceId: string) => {
    setInvoicesData((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId && inv.dunningStatus === 'en_cours'
          ? { ...inv, dunningStatus: 'envoyee' as DunningStatus }
          : inv
      )
    );
  };

  const handleEscalate = (invoice: OverdueInvoice) => {
    const levelOrder: DunningLevel[] = ['relance1', 'relance2', 'mise_en_demeure', 'procedure_juridique'];
    const currentIdx = levelOrder.indexOf(invoice.dunningLevel);
    if (currentIdx < levelOrder.length - 1) {
      const nextLevel = levelOrder[currentIdx + 1];
      setInvoicesData((prev) =>
        prev.map((inv) =>
          inv.id === invoice.id ? { ...inv, dunningLevel: nextLevel, dunningStatus: 'en_cours' as DunningStatus } : inv
        )
      );
    }
    setEscalateDialog(null);
  };

  // ── Paramètres Tab state
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [autoBlockDays, setAutoBlockDays] = useState('60');
  const [notifOverdue, setNotifOverdue] = useState(true);
  const [notifLimitBreach, setNotifLimitBreach] = useState(true);
  const [notifRiskChange, setNotifRiskChange] = useState(true);
  const [notifPayment, setNotifPayment] = useState(false);
  const [dunningAutoRelance1, setDunningAutoRelance1] = useState(true);
  const [dunningAutoRelance1Days, setDunningAutoRelance1Days] = useState('15');
  const [dunningAutoRelance2Days, setDunningAutoRelance2Days] = useState('30');
  const [dunningAutoMEDays, setDunningAutoMEDays] = useState('60');

  // ─── KPI Cards for Overview ─────────────────────────────────

  const kpiCards = [
    {
      title: 'Total encours client',
      value: formatPrice(totalOutstanding),
      icon: CreditCard,
      gradient: 'from-teal-500 to-emerald-600',
      subtitle: `${clientCredits.length} clients actifs`,
    },
    {
      title: 'Montant en retard',
      value: formatPrice(totalOverdue),
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      subtitle: `${((totalOverdue / totalOutstanding) * 100).toFixed(1)}% de l'encours`,
    },
    {
      title: 'Limite de crédit totale',
      value: formatPrice(totalCreditLimit),
      icon: Shield,
      gradient: 'from-sky-500 to-cyan-600',
      subtitle: `Taux utilisation: ${formatPercent(avgUtilization)}`,
    },
    {
      title: 'Taux d\'utilisation moyen',
      value: formatPercent(avgUtilization),
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-600',
      subtitle: avgUtilization > 70 ? 'Attention : seuil élevé' : 'Dans les normes',
    },
    {
      title: 'Clients en risque',
      value: String(clientsAtRisk),
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-pink-600',
      subtitle: `Élevé + Critique`,
    },
    {
      title: 'Relances en attente',
      value: String(pendingReminders),
      icon: Clock,
      gradient: 'from-violet-500 to-purple-600',
      subtitle: `${overdueInvoices.length} factures en retard`,
    },
  ];

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-teal-600" />
            Crédit &amp; Risque
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion des encours clients, relances et scoring risque
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="encours" className="text-xs gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Encours Client
            </TabsTrigger>
            <TabsTrigger value="relances" className="text-xs gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Relances
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-xs gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Scoring Risque
            </TabsTrigger>
            <TabsTrigger value="parametres" className="text-xs gap-1.5">
              <Settings2 className="w-3.5 h-3.5" />
              Paramètres
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Vue d'ensemble Tab ──────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.07 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{card.title}</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{card.value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate">{card.subtitle}</p>
                      </div>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 ml-2`}>
                        <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Risk Trend Chart + Top Risk Clients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Évolution du risque</CardTitle>
                <CardDescription>Tendance du score de risque moyen et encours en retard</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'risqueMoyen') return [`${value}`, 'Score risque moyen'];
                          if (name === 'clientsRisque') return [`${value}`, 'Clients à risque'];
                          return [formatPrice(value), 'Encours retard'];
                        }}
                      />
                      <Line type="monotone" dataKey="risqueMoyen" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                      <Line type="monotone" dataKey="clientsRisque" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Clients à risque élevé</CardTitle>
                <CardDescription>Top clients avec le score de risque le plus élevé</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {clientsData
                    .filter((c) => c.riskCategory === 'eleve' || c.riskCategory === 'critique')
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((client) => (
                      <div key={client.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getRiskScoreBg(client.riskScore)} border`}>
                          <span className={getRiskScoreColor(client.riskScore)}>{client.riskScore}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{client.name}</p>
                          <p className="text-xs text-gray-500">{formatPrice(client.overdueAmount)} en retard</p>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] ${riskCategoryColors[client.riskCategory]}`}>
                          {riskCategoryLabels[client.riskCategory]}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Utilization Overview Bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Répartition des taux d&apos;utilisation</CardTitle>
              <CardDescription>Utilisation du crédit par client</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientsData.map((c) => ({ name: c.name.split(' ')[0] + (c.name.split(' ')[1] ? ' ' + c.name.split(' ')[1]?.substring(0, 4) + '.' : ''), taux: c.utilizationRate }))} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux d\'utilisation']}
                    />
                    <Bar dataKey="taux" radius={[4, 4, 0, 0]} fill="#0d9488" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Encours Client Tab ──────────────────────────── */}
        <TabsContent value="encours" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom de client..."
                    className="pl-9"
                    value={clientSearch}
                    onChange={(e) => { setClientSearch(e.target.value); setClientPage(1); }}
                  />
                </div>
                <Select value={clientCategoryFilter} onValueChange={(v) => { setClientCategoryFilter(v); setClientPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientStatusFilter} onValueChange={(v) => { setClientStatusFilter(v); setClientPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="bloque">Bloqué</SelectItem>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Client Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Catégorie</TableHead>
                      <TableHead className="text-xs text-right">Limite crédit</TableHead>
                      <TableHead className="text-xs text-right">Encours</TableHead>
                      <TableHead className="text-xs text-right hidden md:table-cell">Retard</TableHead>
                      <TableHead className="text-xs text-center">Utilisation</TableHead>
                      <TableHead className="text-xs text-center hidden sm:table-cell">Score risque</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          Aucun client trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">{client.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}</span>
                              </div>
                              <span className="text-sm font-medium truncate max-w-[140px]">{client.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${categoryColors[client.category]}`}>
                              {categoryLabels[client.category]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">{formatPrice(client.creditLimit)}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-medium">{formatPrice(client.currentOutstanding)}</TableCell>
                          <TableCell className="text-xs text-right font-mono hidden md:table-cell">
                            <span className={client.overdueAmount > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-400'}>
                              {client.overdueAmount > 0 ? formatPrice(client.overdueAmount) : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-semibold ${getUtilizationColor(client.utilizationRate)}`}>
                                {formatPercent(client.utilizationRate)}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                  className={`h-full rounded-full ${getUtilizationBgColor(client.utilizationRate)}`}
                                  style={{ width: `${Math.min(client.utilizationRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border font-bold text-sm ${getRiskScoreBg(client.riskScore)}`}>
                              <span className={getRiskScoreColor(client.riskScore)}>{client.riskScore}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[client.status]}`}>
                              {statusLabels[client.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => setDetailClient(client)}
                                title="Voir détail"
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                              {canEdit && (
                                <button
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                  onClick={() => { setEditingClient(client); setNewCreditLimit(String(client.creditLimit)); }}
                                  title="Modifier limite"
                                >
                                  <Edit3 className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {clientTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-gray-500">
                    {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} — Page {clientPage}/{clientTotalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={clientPage === 1} onClick={() => setClientPage(clientPage - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: clientTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === clientPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setClientPage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={clientPage === clientTotalPages} onClick={() => setClientPage(clientPage + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Relances Tab ─────────────────────────────────── */}
        <TabsContent value="relances" className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatPrice(totalOverdue)}</p>
                <p className="text-[10px] text-gray-500">Total en retard</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{invoicesData.filter((i) => i.dunningLevel === 'relance1').length}</p>
                <p className="text-[10px] text-gray-500">1ère relance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{invoicesData.filter((i) => i.dunningLevel === 'relance2' || i.dunningLevel === 'mise_en_demeure').length}</p>
                <p className="text-[10px] text-gray-500">2ème / Mise en demeure</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{invoicesData.filter((i) => i.dunningLevel === 'procedure_juridique').length}</p>
                <p className="text-[10px] text-gray-500">Procédure juridique</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par client ou N° facture..."
                    className="pl-9"
                    value={dunningSearch}
                    onChange={(e) => { setDunningSearch(e.target.value); setDunningPage(1); }}
                  />
                </div>
                <Select value={dunningLevelFilter} onValueChange={(v) => { setDunningLevelFilter(v); setDunningPage(1); }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Niveau relance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="relance1">1ère relance</SelectItem>
                    <SelectItem value="relance2">2ème relance</SelectItem>
                    <SelectItem value="mise_en_demeure">Mise en demeure</SelectItem>
                    <SelectItem value="procedure_juridique">Procédure juridique</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={daysOverdueFilter} onValueChange={(v) => { setDaysOverdueFilter(v); setDunningPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Jours retard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="30">≤ 30 jours</SelectItem>
                    <SelectItem value="60">31 — 60 jours</SelectItem>
                    <SelectItem value="90">61 — 90 jours</SelectItem>
                    <SelectItem value="999">&gt; 90 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Réf. Facture</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs text-right">Montant</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Échéance</TableHead>
                      <TableHead className="text-xs text-center">Jours retard</TableHead>
                      <TableHead className="text-xs">Niveau relance</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Statut</TableHead>
                      <TableHead className="text-xs w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Aucune facture en retard trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-xs font-semibold">{invoice.invoiceRef}</TableCell>
                          <TableCell className="text-xs font-medium">{invoice.clientName}</TableCell>
                          <TableCell className="text-xs text-right font-mono font-semibold text-red-600 dark:text-red-400">{formatPrice(invoice.amount)}</TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 font-bold ${
                                invoice.daysOverdue > 60
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : invoice.daysOverdue > 30
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {invoice.daysOverdue}j
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${dunningLevelColors[invoice.dunningLevel]}`}>
                              {dunningLevelLabels[invoice.dunningLevel]}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${
                              invoice.dunningStatus === 'en_cours'
                                ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                                : invoice.dunningStatus === 'envoyee'
                                ? 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400'
                                : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400'
                            }`}>
                              {dunningStatusLabels[invoice.dunningStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {canEdit && invoice.dunningStatus === 'en_cours' && (
                                <button
                                  className="p-1 rounded hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                  onClick={() => handleSendReminder(invoice.id)}
                                  title="Envoyer relance"
                                >
                                  <Send className="w-4 h-4 text-sky-500" />
                                </button>
                              )}
                              {canEdit && invoice.dunningLevel !== 'procedure_juridique' && (
                                <button
                                  className="p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  onClick={() => setEscalateDialog(invoice)}
                                  title="Escalader"
                                >
                                  <ArrowUpRight className="w-4 h-4 text-orange-500" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {dunningTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-gray-500">
                    {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} — Page {dunningPage}/{dunningTotalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={dunningPage === 1} onClick={() => setDunningPage(dunningPage - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: dunningTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === dunningPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setDunningPage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={dunningPage === dunningTotalPages} onClick={() => setDunningPage(dunningPage + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Scoring Risque Tab ──────────────────────────── */}
        <TabsContent value="scoring" className="space-y-4">
          {/* Risk Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['faible', 'moyen', 'eleve', 'critique'] as RiskCategory[]).map((cat) => {
              const count = clientsData.filter((c) => c.riskCategory === cat).length;
              return (
                <Card key={cat} className={`border ${riskCategoryBgColors[cat]}`}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${riskCategoryColors[cat]}`}>{count}</p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{riskCategoryLabels[cat]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Risk Assessment Grid */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Grille d&apos;évaluation du risque client</CardTitle>
              <CardDescription>Score global de risque basé sur 5 facteurs pondérés</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs text-center">Historique paiement</TableHead>
                      <TableHead className="text-xs text-center hidden sm:table-cell">Ratio encours</TableHead>
                      <TableHead className="text-xs text-center hidden md:table-cell">DSO (jours)</TableHead>
                      <TableHead className="text-xs text-center hidden lg:table-cell">Taux litige</TableHead>
                      <TableHead className="text-xs text-center">Utilisation crédit</TableHead>
                      <TableHead className="text-xs text-center">Score global</TableHead>
                      <TableHead className="text-xs text-center">Niveau</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientsData.sort((a, b) => b.riskScore - a.riskScore).map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="text-sm font-medium">{client.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs font-semibold ${client.paymentHistory >= 80 ? 'text-emerald-600 dark:text-emerald-400' : client.paymentHistory >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                              {client.paymentHistory}%
                            </span>
                            <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div className={`h-full rounded-full ${client.paymentHistory >= 80 ? 'bg-emerald-500' : client.paymentHistory >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${client.paymentHistory}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <span className={`text-xs font-semibold ${client.outstandingRatio < 30 ? 'text-emerald-600 dark:text-emerald-400' : client.outstandingRatio < 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {client.outstandingRatio}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          <span className={`text-xs font-semibold ${client.daysSalesOutstanding <= 30 ? 'text-emerald-600 dark:text-emerald-400' : client.daysSalesOutstanding <= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {client.daysSalesOutstanding}j
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <span className={`text-xs font-semibold ${client.disputeRate <= 3 ? 'text-emerald-600 dark:text-emerald-400' : client.disputeRate <= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {client.disputeRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs font-semibold ${getUtilizationColor(client.creditUtilization)}`}>
                              {formatPercent(client.creditUtilization)}
                            </span>
                            <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div className={`h-full rounded-full ${getUtilizationBgColor(client.creditUtilization)}`} style={{ width: `${Math.min(client.creditUtilization, 100)}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border font-bold text-sm ${getRiskScoreBg(client.riskScore)}`}>
                            <span className={getRiskScoreColor(client.riskScore)}>{client.riskScore}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${riskCategoryColors[client.riskCategory]}`}>
                            {riskCategoryLabels[client.riskCategory]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations + Historical Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recommandations par niveau de risque</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {([
                  { cat: 'faible' as RiskCategory, icon: CheckCircle2, items: ['Maintenir les conditions actuelles', 'Offrir des facilités de paiement étendues', 'Proposer une augmentation de limite de crédit'] },
                  { cat: 'moyen' as RiskCategory, icon: Info, items: ['Surveiller mensuellement l\'encours', 'Négocier des conditions de paiement plus strictes', 'Envisager des garanties complémentaires'] },
                  { cat: 'eleve' as RiskCategory, icon: AlertTriangle, items: ['Bloquer toute nouvelle commande', 'Lancer une procédure de relance accélérée', 'Exiger un paiement anticipé pour toute commande'] },
                  { cat: 'critique' as RiskCategory, icon: XCircle, items: ['Bloquer immédiatement le compte client', 'Engager une procédure de recouvrement', 'Signaler au service contentieux pour action juridique'] },
                ]).map(({ cat, icon: Icon, items }) => (
                  <div key={cat} className={`p-3 rounded-lg border ${riskCategoryBgColors[cat]}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${riskCategoryColors[cat]}`} />
                      <span className={`text-sm font-semibold ${riskCategoryColors[cat]}`}>{riskCategoryLabels[cat]}</span>
                    </div>
                    <ul className="space-y-1">
                      {items.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                          <span className="text-gray-400 mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Historical Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tendance historique du risque</CardTitle>
                <CardDescription>Évolution sur 6 mois du score moyen et du nombre de clients à risque</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'risqueMoyen') return [`${value}`, 'Score risque moyen'];
                          if (name === 'clientsRisque') return [`${value}`, 'Clients à risque'];
                          return [formatPrice(value), 'Encours retard'];
                        }}
                      />
                      <Line type="monotone" dataKey="risqueMoyen" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="risqueMoyen" />
                      <Line type="monotone" dataKey="clientsRisque" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} name="clientsRisque" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-gray-500">Score risque moyen</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-500">Clients à risque</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Paramètres Tab ──────────────────────────────── */}
        <TabsContent value="parametres" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Credit Limit by Category */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  Limites de crédit par catégorie
                </CardTitle>
                <CardDescription>Configuration des plafonds de crédit par type de client</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {categoryConfigs.map((config) => (
                  <div key={config.category} className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${categoryColors[config.category]}`}>
                        {categoryLabels[config.category]}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Limite par défaut</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(config.defaultLimit)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Limite maximale</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(config.maxLimit)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Auto-Block Settings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Blocage automatique
                </CardTitle>
                <CardDescription>Configuration du blocage automatique des comptes clients</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Blocage automatique</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bloquer les clients dépassant le seuil</p>
                  </div>
                  <Switch checked={autoBlockEnabled} onCheckedChange={setAutoBlockEnabled} />
                </div>

                <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Seuil de jours de retard pour blocage</Label>
                    <Select value={autoBlockDays} onValueChange={setAutoBlockDays} disabled={!autoBlockEnabled}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 jours</SelectItem>
                        <SelectItem value="45">45 jours</SelectItem>
                        <SelectItem value="60">60 jours (recommandé)</SelectItem>
                        <SelectItem value="90">90 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Règle actuelle</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        {autoBlockEnabled
                          ? `Tout client avec plus de ${autoBlockDays} jours de retard sera automatiquement bloqué. Les nouvelles commandes seront refusées.`
                          : 'Le blocage automatique est désactivé. Le blocage doit être effectué manuellement.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dunning Workflow */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-amber-500" />
                  Workflow de relance
                </CardTitle>
                <CardDescription>Configuration des étapes et délais de relance</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Relance automatique (1er niveau)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Envoyer la 1ère relance automatiquement</p>
                  </div>
                  <Switch checked={dunningAutoRelance1} onCheckedChange={setDunningAutoRelance1} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">1ère relance</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">Après</span>
                      <Select value={dunningAutoRelance1Days} onValueChange={setDunningAutoRelance1Days}>
                        <SelectTrigger className="h-7 w-16 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7j</SelectItem>
                          <SelectItem value="10">10j</SelectItem>
                          <SelectItem value="15">15j</SelectItem>
                          <SelectItem value="20">20j</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">2ème relance</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">Après</span>
                      <Select value={dunningAutoRelance2Days} onValueChange={setDunningAutoRelance2Days}>
                        <SelectTrigger className="h-7 w-16 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20j</SelectItem>
                          <SelectItem value="30">30j</SelectItem>
                          <SelectItem value="45">45j</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">Mise en demeure</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">Après</span>
                      <Select value={dunningAutoMEDays} onValueChange={setDunningAutoMEDays}>
                        <SelectTrigger className="h-7 w-16 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="45">45j</SelectItem>
                          <SelectItem value="60">60j</SelectItem>
                          <SelectItem value="90">90j</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Scale className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">Procédure juridique</p>
                    </div>
                    <span className="text-[10px] text-gray-400">Manuel</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Rules */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-violet-500" />
                  Règles de notification
                </CardTitle>
                <CardDescription>Configurer les alertes pour les événements crédit</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  {
                    label: 'Facture en retard de paiement',
                    description: 'Notification quand une facture dépasse la date d\'échéance',
                    checked: notifOverdue,
                    onChange: setNotifOverdue,
                    icon: Clock,
                  },
                  {
                    label: 'Dépassement de limite de crédit',
                    description: 'Alerte quand un client dépasse son plafond autorisé',
                    checked: notifLimitBreach,
                    onChange: setNotifLimitBreach,
                    icon: AlertTriangle,
                  },
                  {
                    label: 'Changement de niveau de risque',
                    description: 'Notification quand le score risque d\'un client change de catégorie',
                    checked: notifRiskChange,
                    onChange: setNotifRiskChange,
                    icon: Shield,
                  },
                  {
                    label: 'Paiement reçu',
                    description: 'Confirmation de réception de paiement',
                    checked: notifPayment,
                    onChange: setNotifPayment,
                    icon: CheckCircle2,
                  },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start gap-2.5">
                      <rule.icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{rule.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rule.description}</p>
                      </div>
                    </div>
                    <Switch checked={rule.checked} onCheckedChange={rule.onChange} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Edit Credit Limit Dialog ────────────────────────── */}
      <Dialog open={!!editingClient} onOpenChange={(open) => { if (!open) setEditingClient(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la limite de crédit</DialogTitle>
            <DialogDescription>Ajuster le plafond de crédit pour {editingClient?.name}</DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Limite actuelle</span>
                  <span className="font-semibold">{formatPrice(editingClient.creditLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Encours actuel</span>
                  <span className="font-semibold">{formatPrice(editingClient.currentOutstanding)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taux d&apos;utilisation</span>
                  <span className={`font-semibold ${getUtilizationColor(editingClient.utilizationRate)}`}>
                    {formatPercent(editingClient.utilizationRate)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{`Nouvelle limite de crédit (${symbol})`}</Label>
                <Input
                  type="number"
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(e.target.value)}
                  placeholder="Entrez le nouveau montant"
                />
              </div>
              {newCreditLimit && parseFloat(newCreditLimit) > 0 && (
                <div className="p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10">
                  <p className="text-xs text-teal-700 dark:text-teal-300">
                    Nouveau taux d&apos;utilisation : <span className="font-bold">{formatPercent((editingClient.currentOutstanding / parseFloat(newCreditLimit)) * 100)}</span>
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClient(null)}>Annuler</Button>
            <Button onClick={handleSaveCreditLimit} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Client Credit Detail Dialog ─────────────────────── */}
      <Dialog open={!!detailClient} onOpenChange={(open) => { if (!open) setDetailClient(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail crédit client</DialogTitle>
            <DialogDescription>Position crédit détaillée de {detailClient?.name}</DialogDescription>
          </DialogHeader>
          {detailClient && (
            <div className="space-y-4">
              {/* Client Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{detailClient.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{detailClient.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${categoryColors[detailClient.category]}`}>
                      {categoryLabels[detailClient.category]}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[detailClient.status]}`}>
                      {statusLabels[detailClient.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Credit Position */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-xs text-gray-500 mb-1">Limite de crédit</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(detailClient.creditLimit)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-xs text-gray-500 mb-1">Encours actuel</p>
                  <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{formatPrice(detailClient.currentOutstanding)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-xs text-gray-500 mb-1">Montant en retard</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatPrice(detailClient.overdueAmount)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-xs text-gray-500 mb-1">Disponible</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(detailClient.creditLimit - detailClient.currentOutstanding)}</p>
                </div>
              </div>

              {/* Utilization Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Taux d&apos;utilisation</span>
                  <span className={`text-sm font-bold ${getUtilizationColor(detailClient.utilizationRate)}`}>{formatPercent(detailClient.utilizationRate)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all ${getUtilizationBgColor(detailClient.utilizationRate)}`}
                    style={{ width: `${Math.min(detailClient.utilizationRate, 100)}%` }}
                  />
                </div>
              </div>

              <Separator />

              {/* Risk Factors */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Facteurs de risque</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Historique paiement', value: detailClient.paymentHistory, max: 100, unit: '%' },
                    { label: 'Ratio encours', value: detailClient.outstandingRatio, max: 100, unit: '%' },
                    { label: 'DSO', value: detailClient.daysSalesOutstanding, max: 120, unit: 'j' },
                    { label: 'Taux de litige', value: detailClient.disputeRate, max: 30, unit: '%' },
                    { label: 'Utilisation crédit', value: detailClient.creditUtilization, max: 100, unit: '%' },
                  ].map((factor) => (
                    <div key={factor.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{factor.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full rounded-full ${
                            factor.value / factor.max < 0.3
                              ? 'bg-emerald-500'
                              : factor.value / factor.max < 0.6
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((factor.value / factor.max) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold w-12 text-right ${
                        factor.value / factor.max < 0.3
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : factor.value / factor.max < 0.6
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {factor.value}{factor.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Risk Score */}
              <div className={`p-4 rounded-lg border ${getRiskScoreBg(detailClient.riskScore)} text-center`}>
                <p className="text-xs text-gray-500 mb-1">Score de risque global</p>
                <p className={`text-3xl font-bold ${getRiskScoreColor(detailClient.riskScore)}`}>{detailClient.riskScore}/100</p>
                <Badge variant="secondary" className={`text-xs mt-1 ${riskCategoryColors[detailClient.riskCategory]}`}>
                  Risque {riskCategoryLabels[detailClient.riskCategory]}
                </Badge>
              </div>

              {/* Overdue Invoices for this client */}
              {invoicesData.filter((i) => i.clientId === detailClient.id).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Factures en retard</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {invoicesData
                      .filter((i) => i.clientId === detailClient.id)
                      .map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs">
                          <div>
                            <span className="font-mono font-semibold">{inv.invoiceRef}</span>
                            <span className="text-gray-500 ml-2">{inv.daysOverdue}j retard</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${dunningLevelColors[inv.dunningLevel]}`}>
                              {dunningLevelLabels[inv.dunningLevel]}
                            </Badge>
                            <span className="font-semibold text-red-600 dark:text-red-400">{formatPrice(inv.amount)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Escalate Confirmation Dialog ────────────────────── */}
      <Dialog open={!!escalateDialog} onOpenChange={(open) => { if (!open) setEscalateDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Escalader la relance</DialogTitle>
            <DialogDescription>
              {escalateDialog && (() => {
                const levelOrder: DunningLevel[] = ['relance1', 'relance2', 'mise_en_demeure', 'procedure_juridique'];
                const nextIdx = levelOrder.indexOf(escalateDialog.dunningLevel) + 1;
                const nextLevel = levelOrder[nextIdx];
                return `Passer la facture ${escalateDialog.invoiceRef} de "${dunningLevelLabels[escalateDialog.dunningLevel]}" à "${dunningLevelLabels[nextLevel]}" ?`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Cette action est irréversible. Le client recevra une notification du changement de niveau de relance.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialog(null)}>Annuler</Button>
            <Button onClick={() => escalateDialog && handleEscalate(escalateDialog)} className="text-white bg-orange-600 hover:bg-orange-700">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Confirmer l&apos;escalade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
