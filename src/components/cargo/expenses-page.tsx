'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileText,
  Calendar,
  Filter,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Building2,
  Car,
  Plane,
  Ship,
  Package,
  ChevronDown,
  MoreHorizontal,
  Download,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCurrency } from '@/lib/use-currency';
import { useToastAction } from '@/components/cargo/toast-provider';

/* ─── Types ─── */
type ExpenseStatus = 'en_attente' | 'approuvee' | 'rejetee';
type ExpenseCategory =
  | 'deplacement'
  | 'carburant'
  | 'repas'
  | 'hotel'
  | 'materiel'
  | 'maintenance'
  | 'telecom'
  | 'assurance';

interface ExpenseEntry {
  id: string;
  employe: string;
  categorie: ExpenseCategory;
  montant: number;
  date: string;
  statut: ExpenseStatus;
  description: string;
  departement: string;
}

/* ─── Constants ─── */
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  deplacement: 'Frais de déplacement',
  carburant: 'Carburant',
  repas: 'Repas client',
  hotel: 'Hôtel & Hébergement',
  materiel: 'Matériel & Fournitures',
  maintenance: 'Maintenance',
  telecom: 'Télécommunications',
  assurance: 'Assurance',
};

const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  deplacement: Car,
  carburant: CreditCard,
  repas: Receipt,
  hotel: Building2,
  materiel: Package,
  maintenance: Ship,
  telecom: FileText,
  assurance: Wallet,
};

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  en_attente: 'En attente',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
};

const STATUS_COLORS: Record<ExpenseStatus, string> = {
  en_attente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approuvee: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejetee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_DOT: Record<ExpenseStatus, string> = {
  en_attente: 'bg-amber-500',
  approuvee: 'bg-emerald-500',
  rejetee: 'bg-red-500',
};

const TEAL = '#0d9488';
const TEAL_LIGHT = '#2dd4bf';
const EMERALD = '#059669';
const CHART_COLORS = ['#0d9488', '#2dd4bf', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#14b8a6', '#0f766e'];

/* ─── Mock Data ─── */
const expenses: ExpenseEntry[] = [
  { id: 'EXP-001', employe: 'Karim Benali', categorie: 'deplacement', montant: 24500, date: '2026-02-28', statut: 'approuvee', description: 'Déplacement Alger - Oran aller-retour', departement: 'Opérations' },
  { id: 'EXP-002', employe: 'Amina Khelifi', categorie: 'carburant', montant: 8500, date: '2026-02-27', statut: 'en_attente', description: 'Plein carburant flotte Février', departement: 'Logistique' },
  { id: 'EXP-003', employe: 'Yacine Meddour', categorie: 'repas', montant: 12000, date: '2026-02-26', statut: 'approuvee', description: 'Dîner client SRT Logistics', departement: 'Commercial' },
  { id: 'EXP-004', employe: 'Sara Mokrani', categorie: 'hotel', montant: 32000, date: '2026-02-25', statut: 'en_attente', description: 'Hôtel 3 nuits mission Constantine', departement: 'Opérations' },
  { id: 'EXP-005', employe: 'Mourad Boudiaf', categorie: 'materiel', montant: 67500, date: '2026-02-24', statut: 'approuvee', description: 'Équipements GPS pour flotte', departement: 'IT' },
  { id: 'EXP-006', employe: 'Leila Hadj-Ali', categorie: 'maintenance', montant: 18700, date: '2026-02-23', statut: 'rejetee', description: 'Réparation porte entrepôt B', departement: 'Logistique' },
  { id: 'EXP-007', employe: 'Rachid Cherif', categorie: 'telecom', montant: 4200, date: '2026-02-22', statut: 'approuvee', description: 'Forfaits télécoms équipe terrain', departement: 'IT' },
  { id: 'EXP-008', employe: 'Nadia Benmoussa', categorie: 'assurance', montant: 125000, date: '2026-02-21', statut: 'en_attente', description: 'Prime assurance flotte Q1 2026', departement: 'Finance' },
  { id: 'EXP-009', employe: 'Karim Benali', categorie: 'carburant', montant: 11200, date: '2026-02-20', statut: 'approuvee', description: 'Carburant camions longue distance', departement: 'Logistique' },
  { id: 'EXP-010', employe: 'Amina Khelifi', categorie: 'deplacement', montant: 15800, date: '2026-02-19', statut: 'approuvee', description: 'Vol Alger - Tunis conférence', departement: 'Direction' },
  { id: 'EXP-011', employe: 'Yacine Meddour', categorie: 'repas', montant: 5600, date: '2026-02-18', statut: 'rejetee', description: 'Repas équipe non pré-approuvé', departement: 'Commercial' },
  { id: 'EXP-012', employe: 'Sara Mokrani', categorie: 'hotel', montant: 19500, date: '2026-02-17', statut: 'approuvee', description: 'Hôtel séminaire Annaba', departement: 'RH' },
  { id: 'EXP-013', employe: 'Mourad Boudiaf', categorie: 'materiel', montant: 8300, date: '2026-02-16', statut: 'en_attente', description: 'Cartouches encre & papier bureau', departement: 'IT' },
  { id: 'EXP-014', employe: 'Leila Hadj-Ali', categorie: 'maintenance', montant: 34500, date: '2026-02-15', statut: 'approuvee', description: 'Maintenance annuelle chariots élévateurs', departement: 'Logistique' },
  { id: 'EXP-015', employe: 'Rachid Cherif', categorie: 'telecom', montant: 3800, date: '2026-02-14', statut: 'en_attente', description: 'Abonnement logiciel tracking', departement: 'IT' },
];

const monthlyExpensesData = [
  { month: 'Sep', montant: 285000 },
  { month: 'Oct', montant: 312000 },
  { month: 'Nov', montant: 278000 },
  { month: 'Dec', montant: 345000 },
  { month: 'Jan', montant: 298000 },
  { month: 'Fév', montant: 385000 },
];

const categoryPieData = [
  { name: 'Déplacement', value: 40300 },
  { name: 'Carburant', value: 19700 },
  { name: 'Repas', value: 17600 },
  { name: 'Hôtel', value: 51500 },
  { name: 'Matériel', value: 75800 },
  { name: 'Maintenance', value: 53200 },
  { name: 'Télécom', value: 8000 },
  { name: 'Assurance', value: 125000 },
];

const trendData = [
  { week: 'S1', depenses: 42000, budget: 55000 },
  { week: 'S2', depenses: 58000, budget: 55000 },
  { week: 'S3', depenses: 51000, budget: 55000 },
  { week: 'S4', depenses: 63000, budget: 55000 },
  { week: 'S5', depenses: 47000, budget: 55000 },
  { week: 'S6', depenses: 54000, budget: 55000 },
  { week: 'S7', depenses: 61000, budget: 55000 },
  { week: 'S8', depenses: 49000, budget: 55000 },
];

const budgets = [
  { departement: 'Logistique', alloue: 850000, depense: 612000, couleur: '#0d9488' },
  { departement: 'Opérations', alloue: 620000, depense: 498000, couleur: '#2dd4bf' },
  { departement: 'Commercial', alloue: 380000, depense: 345000, couleur: '#059669' },
  { departement: 'IT', alloue: 290000, depense: 198000, couleur: '#14b8a6' },
  { departement: 'Finance', alloue: 210000, depense: 165000, couleur: '#0f766e' },
  { departement: 'RH', alloue: 180000, depense: 132000, couleur: '#34d399' },
  { departement: 'Direction', alloue: 400000, depense: 287000, couleur: '#6ee7b7' },
];

const formatPct = (v: number) => `${v.toFixed(1)}%`;

/* ─── Tab Definition ─── */
const TABS = [
  { key: 'overview', label: 'Vue d\'ensemble' },
  { key: 'notes', label: 'Notes de Frais' },
  { key: 'budgets', label: 'Budgets' },
  { key: 'approbations', label: 'Approbations' },
  { key: 'rapports', label: 'Rapports' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/* ─── Component ─── */
export default function ExpensesPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const { toast } = useToastAction();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseEntry[]>(expenses);
  const [newExpense, setNewExpense] = useState({ employe: '', categorie: 'deplacement' as ExpenseCategory, montant: '', description: '', departement: '' });

  // Expense detail/view dialog
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntry | null>(null);

  /* KPI calculations */
  const totalDepenses = expenseData.reduce((a, b) => a + b.montant, 0);
  const totalBudget = budgets.reduce((a, b) => a + b.alloue, 0);
  const totalDepense = budgets.reduce((a, b) => a + b.depense, 0);
  const budgetRestant = totalBudget - totalDepense;
  const enAttente = expenseData.filter(e => e.statut === 'en_attente').length;
  const approuvees = expenseData.filter(e => e.statut === 'approuvee').length;
  const tauxApprobation = expenseData.length > 0 ? (approuvees / expenseData.length) * 100 : 0;

  /* Filtered expenses for Notes de Frais tab */
  const filteredExpenses = expenseData.filter(e => {
    const matchSearch = !searchQuery ||
      e.employe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || e.categorie === filterCategory;
    const matchStatus = filterStatus === 'all' || e.statut === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  /* Pending approvals */
  const pendingApprovals = expenseData.filter(e => e.statut === 'en_attente');

  /* Handler: add expense */
  const handleAddExpense = () => {
    if (!newExpense.employe || !newExpense.montant) return;
    const entry: ExpenseEntry = {
      id: `EXP-${String(expenseData.length + 1).padStart(3, '0')}`,
      employe: newExpense.employe,
      categorie: newExpense.categorie,
      montant: parseFloat(newExpense.montant) || 0,
      date: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
      description: newExpense.description,
      departement: newExpense.departement || 'Autre',
    };
    setExpenseData([entry, ...expenseData]);
    setShowAddModal(false);
    setNewExpense({ employe: '', categorie: 'deplacement', montant: '', description: '', departement: '' });
    toast.success('Dépense ajoutée', `Note de frais ${entry.id} créée avec succès.`);
  };

  /* Handler: approve / reject */
  const handleApprove = (id: string) => {
    setExpenseData(prev => prev.map(e => e.id === id ? { ...e, statut: 'approuvee' as ExpenseStatus } : e));
    toast.success('Dépense approuvée', `Note de frais ${id} approuvée.`);
  };
  const handleReject = (id: string) => {
    setExpenseData(prev => prev.map(e => e.id === id ? { ...e, statut: 'rejetee' as ExpenseStatus } : e));
    toast.error('Dépense rejetée', `Note de frais ${id} rejetée.`);
  };

  const handleExportCSV = () => {
    const headers = ['N°', 'Employé', 'Catégorie', `Montant (${symbol})`, 'Date', 'Statut', 'Description', 'Département'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.employe,
      CATEGORY_LABELS[e.categorie] || e.categorie,
      String(e.montant),
      e.date,
      STATUS_LABELS[e.statut] || e.statut,
      e.description,
      e.departement,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-expenses-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Chart Tooltip Styling ─── */
  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
  };

  /* ─── KPI Cards ─── */
  const kpiCards = [
    { title: 'Dépenses Totales', value: formatPrice(totalDepenses), icon: TrendingUp, color: 'from-teal-500 to-teal-600', trend: '+8.2%', up: true },
    { title: 'Budget Restant', value: formatPrice(budgetRestant), icon: Wallet, color: 'from-emerald-500 to-emerald-600', trend: '-3.1%', up: false },
    { title: 'Notes en Attente', value: String(enAttente), icon: Clock, color: 'from-amber-500 to-amber-600', trend: '', up: false },
    { title: 'Taux d\'Approbation', value: formatPct(tauxApprobation), icon: CheckCircle2, color: 'from-green-500 to-green-600', trend: '+2.4%', up: true },
  ];

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-teal-600" />
            Gestion des Dépenses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suivez, contrôlez et optimisez les dépenses de LogisWay</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button size="sm" className="text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle dépense
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 text-teal-700 dark:text-teal-300 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >

          {/* ═══════════ VUE D'ENSEMBLE ═══════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                  <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                          {card.trend && (
                            <div className={`flex items-center gap-1 mt-1 text-xs ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                              {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {card.trend}
                            </div>
                          )}
                        </div>
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                          <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Bar Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Dépenses mensuelles</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Évolution des dépenses sur 6 mois</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyExpensesData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => [formatPrice(value), 'Dépenses']} contentStyle={tooltipStyle} />
                        <Bar dataKey="montant" fill={TEAL} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Par catégorie</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Répartition des dépenses</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {categoryPieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [formatPrice(value), 'Montant']} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                    {categoryPieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trend Line Chart */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tendance hebdomadaire</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Dépenses vs budget alloué par semaine</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number, name: string) => [formatPrice(value), name === 'depenses' ? 'Dépenses' : 'Budget']} contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="depenses" stroke={TEAL} strokeWidth={2.5} dot={{ r: 4, fill: TEAL }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="budget" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ NOTES DE FRAIS ═══════════ */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par employé, description, N°..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="h-9 w-full sm:w-44 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 pr-8 appearance-none"
                      >
                        <option value="all">Toutes catégories</option>
                        {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(k => (
                          <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="h-9 w-full sm:w-36 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 pr-8 appearance-none"
                      >
                        <option value="all">Tous statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="approuvee">Approuvée</option>
                        <option value="rejetee">Rejetée</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Table */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm z-10">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Employé</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Catégorie</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Montant</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3 hidden sm:table-cell">Date</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Statut</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3 hidden md:table-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucune note de frais trouvée</td>
                        </tr>
                      ) : (
                        filteredExpenses.map((exp, i) => {
                          const CatIcon = CATEGORY_ICONS[exp.categorie];
                          return (
                            <tr
                              key={exp.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-xs">{exp.employe}</p>
                                  <p className="text-[10px] text-gray-400">{exp.id} · {exp.departement}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                                    <CatIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  <span className="text-xs text-gray-700 dark:text-gray-300">{CATEGORY_LABELS[exp.categorie]}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatPrice(exp.montant)}</span>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(exp.date).toLocaleDateString('fr-FR')}</span>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${STATUS_COLORS[exp.statut]}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${STATUS_DOT[exp.statut]}`} />
                                  {STATUS_LABELS[exp.statut]}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem className="text-xs" onClick={() => { setSelectedExpense(exp); setShowDetailDialog(true); toast.info('Détails de la dépense', `Consultation de ${exp.id} — ${exp.employe}`); }}>
                                      <Eye className="w-3.5 h-3.5 mr-2" />
                                      Voir les détails
                                    </DropdownMenuItem>
                                    {exp.statut === 'en_attente' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-xs text-emerald-600" onClick={() => handleApprove(exp.id)}>
                                          <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                          Approuver
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-xs text-red-600" onClick={() => handleReject(exp.id)}>
                                          <XCircle className="w-3.5 h-3.5 mr-2" />
                                          Rejeter
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {exp.statut !== 'rejetee' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-xs" onClick={() => {
                                          const content = `NOTE DE FRAIS - ${exp.id}\n${'='.repeat(40)}\n\nEmployé: ${exp.employe}\nCatégorie: ${CATEGORY_LABELS[exp.categorie]}\nMontant: ${formatPrice(exp.montant)}\nDate: ${new Date(exp.date).toLocaleDateString('fr-FR')}\nStatut: ${STATUS_LABELS[exp.statut]}\nDescription: ${exp.description}\nDépartement: ${exp.departement}`;
                                          const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
                                          const url = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = `note-frais-${exp.id}.txt`;
                                          a.click();
                                          URL.revokeObjectURL(url);
                                          toast.success('Téléchargement', `Note de frais ${exp.id} téléchargée.`);
                                        }}>
                                          <Download className="w-3.5 h-3.5 mr-2" />
                                          Télécharger
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{filteredExpenses.length} note{filteredExpenses.length > 1 ? 's' : ''} de frais</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Total: {formatPrice(filteredExpenses.reduce((a, b) => a + b.montant, 0))}</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ BUDGETS ═══════════ */}
          {activeTab === 'budgets' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget Total Alloué</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(totalBudget)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Dépensé</p>
                  <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{formatPrice(totalDepense)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Taux d&apos;Utilisation</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatPct((totalDepense / totalBudget) * 100)}</p>
                </motion.div>
              </div>

              {/* Department Budgets */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Allocation par département</h3>
                <div className="space-y-5">
                  {budgets.map((b, i) => {
                    const pct = (b.depense / b.alloue) * 100;
                    const remaining = b.alloue - b.depense;
                    return (
                      <motion.div key={b.departement} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: b.couleur }} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{b.departement}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Dépensé: <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(b.depense)}</span></span>
                            <span className="text-gray-500 dark:text-gray-400">Reste: <span className={`font-semibold ${pct > 85 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{formatPrice(remaining)}</span></span>
                            <span className={`font-bold ${pct > 85 ? 'text-red-500' : pct > 65 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatPct(pct)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.08 + 0.3 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: b.couleur }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ APPROBATIONS ═══════════ */}
          {activeTab === 'approbations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notes de frais en attente d&apos;approbation</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pendingApprovals.length} note{pendingApprovals.length > 1 ? 's' : ''} à traiter</p>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  {pendingApprovals.length} en attente
                </Badge>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 shadow-sm text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Tout est à jour!</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune note de frais en attente d&apos;approbation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApprovals.map((exp, i) => {
                    const CatIcon = CATEGORY_ICONS[exp.categorie];
                    return (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                              <CatIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{exp.employe}</p>
                              <p className="text-[10px] text-gray-400">{exp.id} · {exp.departement}</p>
                            </div>
                          </div>
                          <span className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(exp.montant)}</span>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 dark:text-gray-300">{exp.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><Receipt className="w-3 h-3" />{CATEGORY_LABELS[exp.categorie]}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(exp.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 h-8 text-xs" onClick={() => handleApprove(exp.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30" onClick={() => handleReject(exp.id)}>
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ RAPPORTS ═══════════ */}
          {activeTab === 'rapports' && (
            <div className="space-y-4">
              {/* Summary Table */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Rapport récapitulatif des dépenses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Catégorie</th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Total</th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Nb Notes</th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Approuvées</th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">En attente</th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Rejetées</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(cat => {
                        const items = expenseData.filter(e => e.categorie === cat);
                        const total = items.reduce((a, b) => a + b.montant, 0);
                        const approved = items.filter(e => e.statut === 'approuvee').length;
                        const pending = items.filter(e => e.statut === 'en_attente').length;
                        const rejected = items.filter(e => e.statut === 'rejetee').length;
                        if (items.length === 0) return null;
                        return (
                          <tr key={cat} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-white">{CATEGORY_LABELS[cat]}</td>
                            <td className="px-3 py-2 text-xs font-semibold text-right text-gray-900 dark:text-white">{formatPrice(total)}</td>
                            <td className="px-3 py-2 text-xs text-right text-gray-600 dark:text-gray-400">{items.length}</td>
                            <td className="px-3 py-2 text-xs text-right"><Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">{approved}</Badge></td>
                            <td className="px-3 py-2 text-xs text-right"><Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{pending}</Badge></td>
                            <td className="px-3 py-2 text-xs text-right"><Badge variant="secondary" className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{rejected}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 text-xs font-bold text-gray-900 dark:text-white">TOTAL</td>
                        <td className="px-3 py-2 text-xs font-bold text-right text-teal-600 dark:text-teal-400">{formatPrice(totalDepenses)}</td>
                        <td className="px-3 py-2 text-xs font-bold text-right text-gray-900 dark:text-white">{expenseData.length}</td>
                        <td className="px-3 py-2 text-xs font-bold text-right text-emerald-600">{approuvees}</td>
                        <td className="px-3 py-2 text-xs font-bold text-right text-amber-500">{enAttente}</td>
                        <td className="px-3 py-2 text-xs font-bold text-right text-red-500">{expenseData.filter(e => e.statut === 'rejetee').length}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Dépenses par catégorie</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Montant total par catégorie de dépense</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryPieData} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={85} />
                        <Tooltip formatter={(value: number) => [formatPrice(value), 'Montant']} contentStyle={tooltipStyle} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {categoryPieData.map((_, index) => (
                            <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Statut des notes de frais</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Répartition par statut</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Approuvées', value: approuvees, fill: EMERALD },
                            { name: 'En attente', value: enAttente, fill: '#f59e0b' },
                            { name: 'Rejetées', value: expenseData.filter(e => e.statut === 'rejetee').length, fill: '#ef4444' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          <Cell fill={EMERALD} />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Approuvées ({approuvees})</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />En attente ({enAttente})</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Rejetées ({expenseData.filter(e => e.statut === 'rejetee').length})</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Dépense Moyenne', value: formatPrice(totalDepenses / Math.max(expenseData.length, 1)), icon: DollarSign, color: 'from-teal-500 to-teal-600' },
                  { label: 'Plus Haute Dépense', value: formatPrice(Math.max(...expenseData.map(e => e.montant))), icon: ArrowUpRight, color: 'from-amber-500 to-amber-600' },
                  { label: 'Plus Basse Dépense', value: formatPrice(Math.min(...expenseData.map(e => e.montant))), icon: ArrowDownRight, color: 'from-emerald-500 to-emerald-600' },
                  { label: 'Total Approuvé', value: formatPrice(expenseData.filter(e => e.statut === 'approuvee').reduce((a, b) => a + b.montant, 0)), icon: CheckCircle2, color: 'from-green-500 to-green-600' },
                ].map((m, i) => (
                  <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{m.label}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{m.value}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0`}>
                          <m.icon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Add Expense Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nouvelle dépense</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ajouter une note de frais</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Employé</label>
                  <Input
                    placeholder="Nom de l'employé"
                    value={newExpense.employe}
                    onChange={e => setNewExpense({ ...newExpense, employe: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Département</label>
                  <Input
                    placeholder="Département"
                    value={newExpense.departement}
                    onChange={e => setNewExpense({ ...newExpense, departement: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Catégorie</label>
                  <div className="relative">
                    <select
                      value={newExpense.categorie}
                      onChange={e => setNewExpense({ ...newExpense, categorie: e.target.value as ExpenseCategory })}
                      className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 pr-8 appearance-none"
                    >
                      {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(k => (
                        <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">{`Montant (${symbol})`}</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newExpense.montant}
                    onChange={e => setNewExpense({ ...newExpense, montant: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                  <Input
                    placeholder="Description de la dépense"
                    value={newExpense.description}
                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Annuler</Button>
                <Button
                  className="flex-1 text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                  onClick={handleAddExpense}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Expense Detail Dialog ──────────────────────────────────── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-teal-500" />
              Détails de la note de frais
            </DialogTitle>
            <DialogDescription>Informations complètes sur la dépense</DialogDescription>
          </DialogHeader>
          {selectedExpense && (() => {
            const CatIcon = CATEGORY_ICONS[selectedExpense.categorie];
            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CatIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">{selectedExpense.id}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedExpense.employe}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs px-2.5 py-1 ${STATUS_COLORS[selectedExpense.statut]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${STATUS_DOT[selectedExpense.statut]}`} />
                    {STATUS_LABELS[selectedExpense.statut]}
                  </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="text-xs text-gray-500">Montant</span>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{formatPrice(selectedExpense.montant)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="text-xs text-gray-500">Catégorie</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{CATEGORY_LABELS[selectedExpense.categorie]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="text-xs text-gray-500">Date</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{new Date(selectedExpense.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="text-xs text-gray-500">Département</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{selectedExpense.departement}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="text-xs text-gray-500">Description</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">{selectedExpense.description}</p>
                </div>

                {/* Actions */}
                {selectedExpense.statut === 'en_attente' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 h-9 text-xs" onClick={() => { handleApprove(selectedExpense.id); setShowDetailDialog(false); }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approuver
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-9 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30" onClick={() => { handleReject(selectedExpense.id); setShowDetailDialog(false); }}>
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
