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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  formatDZD,
  formatDate,
  type Invoice,
  type InvoiceStatus,
} from '@/lib/test-data';

const statusColors: Record<string, string> = {
  payee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_retard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const ITEMS_PER_PAGE = 8;

export default function BillingPage() {
  const [data, setData] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dateEcheance: '',
  });

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

  // KPIs
  const totalInvoiced = data.filter(i => i.status !== 'annulee').reduce((a, b) => a + b.amount, 0);
  const totalPaid = data.filter(i => i.status === 'payee').reduce((a, b) => a + b.amount, 0);
  const totalPending = data.filter(i => i.status === 'en_attente').reduce((a, b) => a + b.amount, 0);
  const totalOverdue = data.filter(i => i.status === 'en_retard').reduce((a, b) => a + b.amount, 0);

  // Monthly revenue chart data
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

  const handleAddInvoice = () => {
    const invoice: Invoice = {
      id: `inv${data.length + 1}`,
      invoiceNumber: `FAC-2026-${String(data.length + 1).padStart(4, '0')}`,
      clientName: newInvoice.clientName,
      amount: parseFloat(newInvoice.amount) || 0,
      status: 'en_attente',
      dateEmission: new Date().toISOString().split('T')[0],
      dateEcheance: newInvoice.dateEcheance,
      shipments: [],
    };
    setData([invoice, ...data]);
    setShowAddDialog(false);
    setNewInvoice({ clientName: '', amount: '', dateEcheance: '' });
  };

  const handleExportCSV = () => {
    const headers = ['N° Facture', 'Client', 'Montant (DA)', 'Statut', 'Date Émission', 'Date Échéance', 'Expéditions'];
    const rows = filtered.map(inv => [
      inv.invoiceNumber,
      inv.clientName,
      String(inv.amount),
      invoiceStatusLabels[inv.status] || inv.status,
      inv.dateEmission,
      inv.dateEcheance,
      String(inv.shipments.length),
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

  const kpiCards = [
    {
      title: 'Total facturé',
      value: formatDZD(totalInvoiced),
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Payé',
      value: formatDZD(totalPaid),
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'En attente',
      value: formatDZD(totalPending),
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'En retard',
      value: formatDZD(totalOverdue),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos factures et paiements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
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
          <CardTitle className="text-base">Revenus encaissés</CardTitle>
          <CardDescription>Montant des factures payées par mois</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatDZD(value), 'Montant']}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
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
                placeholder="Rechercher par N° facture ou client..."
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
                <SelectItem value="payee">Payée</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_retard">En retard</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
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
                  <TableHead className="text-xs">N° Facture</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Montant</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Date émission</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Date échéance</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Expéditions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs font-semibold">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-xs font-medium">{invoice.clientName}</TableCell>
                      <TableCell className="text-xs font-semibold">{formatDZD(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[invoice.status]}`}>
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
                    </TableRow>
                  ))
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

      {/* Add Invoice Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>Créer une nouvelle facture</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom du client</Label>
              <Input
                value={newInvoice.clientName}
                onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Montant (DA)</Label>
              <Input
                type="number"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date d&apos;échéance</Label>
              <Input
                type="date"
                value={newInvoice.dateEcheance}
                onChange={(e) => setNewInvoice({ ...newInvoice, dateEcheance: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddInvoice} className="text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}>
              Créer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
