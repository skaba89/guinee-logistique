'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Ban,
  CreditCard,
  AlertCircle,
  FileText,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  invoices as initialInvoices,
  invoiceStatusLabels,
  formatDate,
  type Invoice,
  type InvoiceStatus,
} from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';
import { useCurrency } from '@/lib/use-currency';

// ── Status styling ──────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  payee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_retard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const statusIcons: Record<string, React.ElementType> = {
  payee: CheckCircle2,
  en_attente: Clock,
  en_retard: AlertTriangle,
  annulee: XCircle,
};

// ── Payment timeline type ───────────────────────────────────────────────
interface PaymentEvent {
  date: string;
  label: string;
  description: string;
  type: 'created' | 'paid' | 'late' | 'cancelled' | 'reminder' | 'partial';
}

// ── Constants ───────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8;

// ── Component ───────────────────────────────────────────────────────────
export default function BillingPage() {
  const canEditPage = useCargoStore((s) => s.canEdit('billing'));
  const { format: formatPrice } = useCurrency();

  // Data state
  const [data, setData] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Selected invoice for actions
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pendingStatus, setPendingStatus] = useState<InvoiceStatus | null>(null);

  // New invoice form
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dateEcheance: '',
    shipments: '',
  });

  // Edit invoice form
  const [editForm, setEditForm] = useState({
    clientName: '',
    amount: '',
    dateEcheance: '',
    shipments: '',
  });

  // ── Filtering & pagination ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...data];
    if (filterStatus !== 'all') {
      result = result.filter((inv) => inv.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime());
  }, [data, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── KPIs ───────────────────────────────────────────────────────────
  const totalInvoiced = data.filter(i => i.status !== 'annulee').reduce((a, b) => a + b.amount, 0);
  const totalPaid = data.filter(i => i.status === 'payee').reduce((a, b) => a + b.amount, 0);
  const totalPending = data.filter(i => i.status === 'en_attente').reduce((a, b) => a + b.amount, 0);
  const totalOverdue = data.filter(i => i.status === 'en_retard').reduce((a, b) => a + b.amount, 0);

  // ── Monthly revenue chart data ─────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    data.filter(i => i.status === 'payee').forEach((inv) => {
      const month = inv.dateEmission.substring(0, 7);
      months[month] = (months[month] || 0) + inv.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        amount,
      }));
  }, [data]);

  // ── Payment timeline generator ─────────────────────────────────────
  const getPaymentTimeline = (inv: Invoice): PaymentEvent[] => {
    const timeline: PaymentEvent[] = [
      {
        date: inv.dateEmission,
        label: 'Facture émise',
        description: `Facture ${inv.invoiceNumber} créée pour ${inv.clientName}`,
        type: 'created',
      },
    ];

    if (inv.status === 'en_attente') {
      const daysUntilDue = Math.ceil((new Date(inv.dateEcheance).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 0) {
        timeline.push({
          date: inv.dateEcheance,
          label: 'Échéance dépassée',
          description: `Échéance dépassée de ${Math.abs(daysUntilDue)} jours`,
          type: 'late',
        });
      } else if (daysUntilDue <= 7) {
        timeline.push({
          date: inv.dateEcheance,
          label: 'Échéance proche',
          description: `Échéance dans ${daysUntilDue} jours`,
          type: 'reminder',
        });
      } else {
        timeline.push({
          date: inv.dateEcheance,
          label: 'En attente de paiement',
          description: `Échéance le ${formatDate(inv.dateEcheance)}`,
          type: 'reminder',
        });
      }
    } else if (inv.status === 'en_retard') {
      const daysLate = Math.ceil((Date.now() - new Date(inv.dateEcheance).getTime()) / (1000 * 60 * 60 * 24));
      timeline.push({
        date: inv.dateEcheance,
        label: 'Échéance dépassée',
        description: `En retard de ${daysLate} jours`,
        type: 'late',
      });
    } else if (inv.status === 'payee') {
      timeline.push({
        date: inv.dateEcheance,
        label: 'Paiement reçu',
        description: `Montant de ${formatPrice(inv.amount)} encaissé`,
        type: 'paid',
      });
    } else if (inv.status === 'annulee') {
      timeline.push({
        date: new Date().toISOString().split('T')[0],
        label: 'Facture annulée',
        description: 'Facture annulée',
        type: 'cancelled',
      });
    }

    return timeline;
  };

  // ── Handlers ───────────────────────────────────────────────────────
  const handleAddInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.amount) return;
    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: `FAC-2026-${String(data.length + 1).padStart(4, '0')}`,
      clientName: newInvoice.clientName,
      amount: parseFloat(newInvoice.amount) || 0,
      status: 'en_attente',
      dateEmission: new Date().toISOString().split('T')[0],
      dateEcheance: newInvoice.dateEcheance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments: newInvoice.shipments ? newInvoice.shipments.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    setData([invoice, ...data]);
    setShowAddDialog(false);
    setNewInvoice({ clientName: '', amount: '', dateEcheance: '', shipments: '' });
  };

  const handleEditInvoice = () => {
    if (!selectedInvoice) return;
    setData(data.map(inv =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            clientName: editForm.clientName || inv.clientName,
            amount: parseFloat(editForm.amount) || inv.amount,
            dateEcheance: editForm.dateEcheance || inv.dateEcheance,
            shipments: editForm.shipments ? editForm.shipments.split(',').map(s => s.trim()).filter(Boolean) : inv.shipments,
          }
        : inv
    ));
    setShowEditDialog(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = () => {
    if (!selectedInvoice) return;
    setData(data.filter(inv => inv.id !== selectedInvoice.id));
    setShowDeleteDialog(false);
    setSelectedInvoice(null);
  };

  const handleStatusChange = () => {
    if (!selectedInvoice || !pendingStatus) return;
    setData(data.map(inv =>
      inv.id === selectedInvoice.id ? { ...inv, status: pendingStatus } : inv
    ));
    setShowStatusDialog(false);
    setSelectedInvoice(null);
    setPendingStatus(null);
  };

  const openDetailDialog = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowDetailDialog(true);
  };

  const openEditDialog = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setEditForm({
      clientName: inv.clientName,
      amount: String(inv.amount),
      dateEcheance: inv.dateEcheance,
      shipments: inv.shipments.join(', '),
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowDeleteDialog(true);
  };

  const openStatusDialog = (inv: Invoice, status: InvoiceStatus) => {
    setSelectedInvoice(inv);
    setPendingStatus(status);
    setShowStatusDialog(true);
  };

  const handleExportCSV = () => {
    const headers = ['N Facture', 'Client', 'Montant (DA)', 'Statut', 'Date Emission', 'Date Echeance', 'Expeditions'];
    const rows = filtered.map(inv => [
      inv.invoiceNumber,
      inv.clientName,
      String(inv.amount),
      invoiceStatusLabels[inv.status] || inv.status,
      inv.dateEmission,
      inv.dateEcheance,
      inv.shipments.join(' | '),
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-billing-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── KPI cards config ───────────────────────────────────────────────
  const kpiCards = [
    { title: 'Total facture', value: formatPrice(totalInvoiced), icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { title: 'Paye', value: formatPrice(totalPaid), icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { title: 'En attente', value: formatPrice(totalPending), icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'En retard', value: formatPrice(totalOverdue), icon: AlertTriangle, color: 'from-red-500 to-red-600' },
  ];

  // ── Timeline dot colors ────────────────────────────────────────────
  const timelineDotColors: Record<string, string> = {
    created: 'bg-blue-500',
    paid: 'bg-green-500',
    late: 'bg-red-500',
    cancelled: 'bg-gray-400',
    reminder: 'bg-yellow-500',
    partial: 'bg-purple-500',
  };

  // ── Available status transitions ────────────────────────────────────
  const getStatusActions = (inv: Invoice): { label: string; status: InvoiceStatus; icon: React.ElementType; variant: string }[] => {
    const actions: { label: string; status: InvoiceStatus; icon: React.ElementType; variant: string }[] = [];
    if (inv.status === 'en_attente' || inv.status === 'en_retard') {
      actions.push({ label: 'Marquer payee', status: 'payee', icon: CreditCard, variant: 'green' });
    }
    if (inv.status === 'en_attente') {
      actions.push({ label: 'Marquer en retard', status: 'en_retard', icon: AlertCircle, variant: 'orange' });
    }
    if (inv.status !== 'annulee' && inv.status !== 'payee') {
      actions.push({ label: 'Annuler', status: 'annulee', icon: Ban, variant: 'red' });
    }
    if (inv.status === 'payee') {
      actions.push({ label: 'Reouvrir', status: 'en_attente', icon: TrendingUp, variant: 'blue' });
    }
    return actions;
  };

  const getVariantClass = (variant: string) => {
    switch (variant) {
      case 'green': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'orange': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'red': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 text-white';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerez vos factures et paiements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          {canEditPage && (
            <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle facture
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  </div>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenus encaisses</CardTitle>
          <CardDescription>Montant des factures payees par mois</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), 'Montant']}
                  contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#00c9a7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par N facture ou client..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="payee">Payee</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_retard">En retard</SelectItem>
                <SelectItem value="annulee">Annulee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">N Facture</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Montant</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Date emission</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Date echeance</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Expeditions</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Aucune facture trouvee
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((invoice) => {
                    const StatusIcon = statusIcons[invoice.status] || Clock;
                    return (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => openDetailDialog(invoice)}>
                        <TableCell className="font-mono text-xs font-semibold">{invoice.invoiceNumber}</TableCell>
                        <TableCell className="text-xs font-medium">{invoice.clientName}</TableCell>
                        <TableCell className="text-xs font-semibold">{formatPrice(invoice.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[invoice.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {invoiceStatusLabels[invoice.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{formatDate(invoice.dateEmission)}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{formatDate(invoice.dateEcheance)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">
                          {invoice.shipments.length > 0 ? (
                            <span className="font-mono">{invoice.shipments.length} colis</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Voir les details" onClick={() => openDetailDialog(invoice)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {canEditPage && (
                              <>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20" title="Modifier" onClick={() => openEditDialog(invoice)}>
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20" title="Supprimer" onClick={() => openDeleteDialog(invoice)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">
                {filtered.length} facture{filtered.length > 1 ? 's' : ''} — Page {currentPage}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL DIALOG — Vue détaillée avec timeline de paiement
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedInvoice.invoiceNumber}
                </DialogTitle>
                <DialogDescription>Details de la facture</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status + Montant */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={`text-xs px-3 py-1 ${statusColors[selectedInvoice.status]}`}>
                    {invoiceStatusLabels[selectedInvoice.status]}
                  </Badge>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(selectedInvoice.amount)}
                  </p>
                </div>

                <Separator />

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Montant</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(selectedInvoice.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date emission</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.dateEmission)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date echeance</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.dateEcheance)}</p>
                  </div>
                </div>

                {/* Expeditions liees */}
                {selectedInvoice.shipments.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expeditions liees</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedInvoice.shipments.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Payment Timeline */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Historique de paiement</p>
                  <div className="space-y-0">
                    {getPaymentTimeline(selectedInvoice).map((event, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${timelineDotColors[event.type] || 'bg-gray-400'} flex-shrink-0 mt-1`} />
                          {index < getPaymentTimeline(selectedInvoice).length - 1 && (
                            <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{event.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{event.description}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(event.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status action buttons */}
                {canEditPage && getStatusActions(selectedInvoice).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Actions</p>
                      <div className="flex flex-wrap gap-2">
                        {getStatusActions(selectedInvoice).map((action) => (
                          <Button
                            key={action.status}
                            size="sm"
                            className={`text-xs h-8 ${getVariantClass(action.variant)}`}
                            onClick={() => openStatusDialog(selectedInvoice, action.status)}
                          >
                            <action.icon className="w-3.5 h-3.5 mr-1" />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          ADD INVOICE DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>Creer une nouvelle facture</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom du client</Label>
              <Input value={newInvoice.clientName} onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })} placeholder="Nom du client" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Montant (DA)</Label>
              <Input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date d&apos;echeance</Label>
              <Input type="date" value={newInvoice.dateEcheance} onChange={(e) => setNewInvoice({ ...newInvoice, dateEcheance: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Expeditions liees (separees par virgules)</Label>
              <Input value={newInvoice.shipments} onChange={(e) => setNewInvoice({ ...newInvoice, shipments: e.target.value })} placeholder="FFP-0001-2026, FFP-0002-2026" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddInvoice} disabled={!newInvoice.clientName || !newInvoice.amount} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Creer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          EDIT INVOICE DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la facture</DialogTitle>
            <DialogDescription>Modifier les informations de la facture</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom du client</Label>
              <Input value={editForm.clientName} onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Montant (DA)</Label>
              <Input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date d&apos;echeance</Label>
              <Input type="date" value={editForm.dateEcheance} onChange={(e) => setEditForm({ ...editForm, dateEcheance: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Expeditions liees (separees par virgules)</Label>
              <Input value={editForm.shipments} onChange={(e) => setEditForm({ ...editForm, shipments: e.target.value })} placeholder="FFP-0001-2026, FFP-0002-2026" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleEditInvoice} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer la facture {selectedInvoice?.invoiceNumber} ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice} className="bg-red-600 hover:bg-red-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
          STATUS CHANGE CONFIRMATION DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le statut</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === 'payee' && `Confirmer le paiement de la facture ${selectedInvoice?.invoiceNumber} (${selectedInvoice ? formatPrice(selectedInvoice.amount) : ''}) ?`}
              {pendingStatus === 'en_retard' && `Marquer la facture ${selectedInvoice?.invoiceNumber} comme en retard ?`}
              {pendingStatus === 'annulee' && `Annuler la facture ${selectedInvoice?.invoiceNumber} ? Cette action peut etre reversee.`}
              {pendingStatus === 'en_attente' && `Reouvrir la facture ${selectedInvoice?.invoiceNumber} et la remettre en attente ?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} className={pendingStatus === 'payee' ? 'bg-green-600 hover:bg-green-700 text-white' : pendingStatus === 'annulee' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
