'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  ArrowRightLeft,
  Eye,
  Edit3,
  Send,
  XCircle,
  AlertCircle,
  ArrowRight,
  Ship,
  Plane,
  Truck,
  DollarSign,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
import { useCurrency } from '@/lib/use-currency';
import { useCargoStore } from '@/lib/cargo-store';
import ExportButtons from '@/components/cargo/export-buttons';
import AdvancedFilters from '@/components/cargo/advanced-filters';
import { applyFiltersToArray, type FilterState } from '@/hooks/use-filters';

// ─── Types ───────────────────────────────────────────────────────────────────

type FreightType = 'maritime' | 'aerien' | 'terrestre';
type QuotationStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';

interface Quotation {
  id: string;
  quoteNumber: string;
  clientName: string;
  freightType: FreightType;
  origin: string;
  destination: string;
  weight: number;
  estimatedAmount: number;
  status: QuotationStatus;
  createdAt: string;
  validUntil: string;
  notes: string;
}

// ─── Local Test Data ─────────────────────────────────────────────────────────

const initialQuotations: Quotation[] = [
  { id: 'q1', quoteNumber: 'DEV-2026-0001', clientName: 'SPA HydroServices', freightType: 'maritime', origin: 'Alger', destination: 'Marseille', weight: 3200, estimatedAmount: 4500000, status: 'accepte', createdAt: '2026-01-15', validUntil: '2026-02-15', notes: 'Conteneur 40ft équipements' },
  { id: 'q2', quoteNumber: 'DEV-2026-0002', clientName: 'Sarl TechnoPlus', freightType: 'aerien', origin: 'Dubaï', destination: 'Alger', weight: 45, estimatedAmount: 380000, status: 'envoye', createdAt: '2026-01-20', validUntil: '2026-02-20', notes: 'Matériel informatique urgent' },
  { id: 'q3', quoteNumber: 'DEV-2026-0003', clientName: 'Entreprise Bouzidi & Fils', freightType: 'terrestre', origin: 'Casablanca', destination: 'Alger', weight: 1800, estimatedAmount: 920000, status: 'brouillon', createdAt: '2026-02-01', validUntil: '2026-03-01', notes: 'Produits alimentaires' },
  { id: 'q4', quoteNumber: 'DEV-2026-0004', clientName: 'EURL BatiPlus', freightType: 'maritime', origin: 'Shanghai', destination: 'Alger', weight: 5500, estimatedAmount: 7800000, status: 'accepte', createdAt: '2026-02-10', validUntil: '2026-03-10', notes: 'Matériaux construction' },
  { id: 'q5', quoteNumber: 'DEV-2026-0005', clientName: 'Sarl MédiaCom', freightType: 'aerien', origin: 'Istanbul', destination: 'Alger', weight: 12, estimatedAmount: 95000, status: 'refuse', createdAt: '2026-02-15', validUntil: '2026-03-15', notes: 'Équipements audiovisuels' },
  { id: 'q6', quoteNumber: 'DEV-2026-0006', clientName: 'Mohamed Amrani', freightType: 'terrestre', origin: 'Tunis', destination: 'Alger', weight: 350, estimatedAmount: 280000, status: 'accepte', createdAt: '2026-02-20', validUntil: '2026-03-20', notes: 'Marchandises diverses' },
  { id: 'q7', quoteNumber: 'DEV-2026-0007', clientName: 'Nadia Benmoussa', freightType: 'aerien', origin: 'Paris', destination: 'Alger', weight: 8, estimatedAmount: 72000, status: 'envoye', createdAt: '2026-03-01', validUntil: '2026-04-01', notes: 'Documents et échantillons' },
  { id: 'q8', quoteNumber: 'DEV-2026-0008', clientName: 'SPA HydroServices', freightType: 'maritime', origin: 'Hambourg', destination: 'Djeddah', weight: 4800, estimatedAmount: 6200000, status: 'expire', createdAt: '2026-01-05', validUntil: '2026-02-05', notes: 'Pompes industrielles' },
  { id: 'q9', quoteNumber: 'DEV-2026-0009', clientName: 'Karim Djebbar', freightType: 'terrestre', origin: 'Barcelone', destination: 'Milan', weight: 600, estimatedAmount: 750000, status: 'envoye', createdAt: '2026-03-10', validUntil: '2026-04-10', notes: 'Mobilier de bureau' },
  { id: 'q10', quoteNumber: 'DEV-2026-0010', clientName: 'Sarl AgriPro', freightType: 'maritime', origin: 'Santos', destination: 'Alger', weight: 7000, estimatedAmount: 9500000, status: 'brouillon', createdAt: '2026-03-15', validUntil: '2026-04-15', notes: 'Produits agricoles en vrac' },
  { id: 'q11', quoteNumber: 'DEV-2026-0011', clientName: 'EPC Groupe Construction', freightType: 'terrestre', origin: 'Alger', destination: 'Annaba', weight: 2500, estimatedAmount: 420000, status: 'accepte', createdAt: '2026-03-20', validUntil: '2026-04-20', notes: 'Ciment et granulats' },
  { id: 'q12', quoteNumber: 'DEV-2026-0012', clientName: 'SPA TextilMaghreb', freightType: 'aerien', origin: 'Londres', destination: 'Constantine', weight: 25, estimatedAmount: 195000, status: 'envoye', createdAt: '2026-03-25', validUntil: '2026-04-25', notes: 'Échantillons textiles' },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const freightTypeLabels: Record<FreightType, string> = {
  maritime: 'Maritime',
  aerien: 'Aérien',
  terrestre: 'Terrestre',
};

const freightTypeIcons: Record<FreightType, React.ElementType> = {
  maritime: Ship,
  aerien: Plane,
  terrestre: Truck,
};

const statusLabels: Record<QuotationStatus, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  expire: 'Expiré',
};

const statusColors: Record<QuotationStatus, string> = {
  brouillon: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  envoye: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  accepte: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refuse: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  expire: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const statusIcons: Record<QuotationStatus, React.ElementType> = {
  brouillon: FileText,
  envoye: Send,
  accepte: CheckCircle2,
  refuse: XCircle,
  expire: AlertCircle,
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

const ITEMS_PER_PAGE = 8;

// ─── Status timeline event type ──────────────────────────────────────────────

interface StatusEvent {
  date: string;
  label: string;
  description: string;
  type: 'created' | 'sent' | 'accepted' | 'refused' | 'expired';
}

const timelineDotColors: Record<string, string> = {
  created: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  refused: 'bg-red-500',
  expired: 'bg-orange-500',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuotationsPage() {
  const canEditQuotations = useCargoStore((s) => s.canEdit('quotations'));
  const { format: formatPrice, symbol } = useCurrency();

  // Data state
  const [data, setData] = useState<Quotation[]>(initialQuotations);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Selected quotation for actions
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [pendingStatus, setPendingStatus] = useState<QuotationStatus | null>(null);

  // New quotation form
  const [newQuotation, setNewQuotation] = useState({
    clientName: '',
    freightType: 'maritime' as FreightType,
    origin: '',
    destination: '',
    weight: '',
    estimatedAmount: '',
    validUntil: '',
    notes: '',
  });

  // Edit quotation form
  const [editForm, setEditForm] = useState({
    clientName: '',
    freightType: 'maritime' as FreightType,
    origin: '',
    destination: '',
    weight: '',
    estimatedAmount: '',
    validUntil: '',
    notes: '',
  });

  // ─── Advanced filters ─────────────────────────────────────────────────

  const filteredQuotations = useMemo(() => {
    if (!activeFilters) return data;
    return applyFiltersToArray(data, activeFilters, {
      dateField: 'createdAt',
      categoryField: 'freightType',
      statusField: 'status',
      originField: 'origin',
      destinationField: 'destination',
      clientField: 'clientName',
      searchFields: ['quoteNumber', 'clientName', 'origin', 'destination'],
    });
  }, [data, activeFilters]);

  // ─── Filtered & Paginated Data ───────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...filteredQuotations];
    if (filterStatus !== 'all') {
      result = result.filter((q) => q.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.quoteNumber.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredQuotations, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const totalQuotations = data.length;
  const totalAmount = data.reduce((a, b) => a + b.estimatedAmount, 0);
  const acceptedCount = data.filter((q) => q.status === 'accepte').length;
  const acceptedAmount = data.filter((q) => q.status === 'accepte').reduce((a, b) => a + b.estimatedAmount, 0);
  const pendingCount = data.filter((q) => q.status === 'envoye' || q.status === 'brouillon').length;
  const pendingAmount = data.filter((q) => q.status === 'envoye' || q.status === 'brouillon').reduce((a, b) => a + b.estimatedAmount, 0);
  const conversionRate = totalQuotations > 0 ? Math.round((acceptedCount / totalQuotations) * 100) : 0;

  // ─── Monthly Chart Data ──────────────────────────────────────────────────

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    data.forEach((q) => {
      const month = q.createdAt.substring(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        count,
      }));
  }, [data]);

  // ─── Status timeline generator ──────────────────────────────────────────

  const getStatusTimeline = (quotation: Quotation): StatusEvent[] => {
    const timeline: StatusEvent[] = [
      {
        date: quotation.createdAt,
        label: 'Devis créé',
        description: `Devis ${quotation.quoteNumber} créé pour ${quotation.clientName}`,
        type: 'created',
      },
    ];

    if (quotation.status === 'envoye') {
      timeline.push({
        date: quotation.createdAt,
        label: 'Devis envoyé',
        description: 'Devis envoyé au client',
        type: 'sent',
      });
    } else if (quotation.status === 'accepte') {
      timeline.push({
        date: quotation.createdAt,
        label: 'Devis envoyé',
        description: 'Devis envoyé au client',
        type: 'sent',
      });
      timeline.push({
        date: new Date().toISOString().split('T')[0],
        label: 'Devis accepté',
        description: `Montant de ${formatPrice(quotation.estimatedAmount)} accepté`,
        type: 'accepted',
      });
    } else if (quotation.status === 'refuse') {
      timeline.push({
        date: quotation.createdAt,
        label: 'Devis envoyé',
        description: 'Devis envoyé au client',
        type: 'sent',
      });
      timeline.push({
        date: new Date().toISOString().split('T')[0],
        label: 'Devis refusé',
        description: 'Le client a refusé le devis',
        type: 'refused',
      });
    } else if (quotation.status === 'expire') {
      timeline.push({
        date: quotation.validUntil,
        label: 'Devis expiré',
        description: `Validité dépassée depuis le ${formatDate(quotation.validUntil)}`,
        type: 'expired',
      });
    }

    return timeline;
  };

  // ─── Available status transitions ──────────────────────────────────────

  const getStatusActions = (quotation: Quotation): { label: string; status: QuotationStatus; icon: React.ElementType; variant: string }[] => {
    const actions: { label: string; status: QuotationStatus; icon: React.ElementType; variant: string }[] = [];
    if (quotation.status === 'brouillon') {
      actions.push({ label: 'Envoyer le devis', status: 'envoye', icon: Send, variant: 'blue' });
    }
    if (quotation.status === 'envoye') {
      actions.push({ label: 'Accepter', status: 'accepte', icon: CheckCircle2, variant: 'green' });
      actions.push({ label: 'Refuser', status: 'refuse', icon: XCircle, variant: 'red' });
    }
    if (quotation.status !== 'expire' && quotation.status !== 'refuse') {
      actions.push({ label: 'Marquer expiré', status: 'expire', icon: AlertCircle, variant: 'orange' });
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

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAddQuotation = () => {
    const quotation: Quotation = {
      id: `q${Date.now()}`,
      quoteNumber: `DEV-2026-${String(data.length + 1).padStart(4, '0')}`,
      clientName: newQuotation.clientName,
      freightType: newQuotation.freightType,
      origin: newQuotation.origin,
      destination: newQuotation.destination,
      weight: parseFloat(newQuotation.weight) || 0,
      estimatedAmount: parseFloat(newQuotation.estimatedAmount) || 0,
      status: 'brouillon',
      createdAt: new Date().toISOString().split('T')[0],
      validUntil: newQuotation.validUntil,
      notes: newQuotation.notes,
    };
    setData([quotation, ...data]);
    setShowAddDialog(false);
    setNewQuotation({
      clientName: '',
      freightType: 'maritime',
      origin: '',
      destination: '',
      weight: '',
      estimatedAmount: '',
      validUntil: '',
      notes: '',
    });
  };

  const handleEditQuotation = () => {
    if (!selectedQuotation) return;
    setData(data.map(q =>
      q.id === selectedQuotation.id
        ? {
            ...q,
            clientName: editForm.clientName || q.clientName,
            freightType: editForm.freightType || q.freightType,
            origin: editForm.origin || q.origin,
            destination: editForm.destination || q.destination,
            weight: parseFloat(editForm.weight) || q.weight,
            estimatedAmount: parseFloat(editForm.estimatedAmount) || q.estimatedAmount,
            validUntil: editForm.validUntil || q.validUntil,
            notes: editForm.notes !== undefined ? editForm.notes : q.notes,
          }
        : q
    ));
    setShowEditDialog(false);
    setSelectedQuotation(null);
  };

  const handleDuplicate = (id: string) => {
    const original = data.find((q) => q.id === id);
    if (!original) return;
    const duplicate: Quotation = {
      ...original,
      id: `q${Date.now()}`,
      quoteNumber: `DEV-2026-${String(data.length + 1).padStart(4, '0')}`,
      status: 'brouillon',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData([duplicate, ...data]);
  };

  const handleDeleteQuotation = () => {
    if (!selectedQuotation) return;
    setData(data.filter((q) => q.id !== selectedQuotation.id));
    setShowDeleteDialog(false);
    setSelectedQuotation(null);
  };

  const handleStatusChange = () => {
    if (!selectedQuotation || !pendingStatus) return;
    setData(data.map(q =>
      q.id === selectedQuotation.id ? { ...q, status: pendingStatus } : q
    ));
    setShowStatusDialog(false);
    // Update the selected quotation if detail dialog is still open
    if (showDetailDialog) {
      setSelectedQuotation({ ...selectedQuotation, status: pendingStatus });
    }
    setPendingStatus(null);
  };

  const handleConvertToShipment = (id: string) => {
    setData(
      data.map((q) =>
        q.id === id ? { ...q, status: 'accepte' as QuotationStatus } : q
      )
    );
  };

  const openDetailDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailDialog(true);
  };

  const openEditDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setEditForm({
      clientName: quotation.clientName,
      freightType: quotation.freightType,
      origin: quotation.origin,
      destination: quotation.destination,
      weight: String(quotation.weight),
      estimatedAmount: String(quotation.estimatedAmount),
      validUntil: quotation.validUntil,
      notes: quotation.notes,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDeleteDialog(true);
  };

  const openStatusDialog = (quotation: Quotation, status: QuotationStatus) => {
    setSelectedQuotation(quotation);
    setPendingStatus(status);
    setShowStatusDialog(true);
  };

  const handleExportCSV = () => {
    const headers = ['N° Devis', 'Client', 'Type Fret', 'Origine', 'Destination', 'Poids (kg)', `Montant Estimé (${symbol})`, 'Statut', 'Date Création', 'Valide Jusqu\'au', 'Notes'];
    const rows = filtered.map(q => [
      q.quoteNumber,
      q.clientName,
      freightTypeLabels[q.freightType] || q.freightType,
      q.origin,
      q.destination,
      String(q.weight),
      String(q.estimatedAmount),
      statusLabels[q.status] || q.status,
      q.createdAt,
      q.validUntil,
      q.notes,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-quotations-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Quick status button config ──────────────────────────────────────

  const getQuickStatusButtons = (quotation: Quotation): { status: QuotationStatus; icon: React.ElementType; color: string; title: string }[] => {
    const buttons: { status: QuotationStatus; icon: React.ElementType; color: string; title: string }[] = [];
    if (quotation.status === 'brouillon') {
      buttons.push({ status: 'envoye', icon: Send, color: 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20', title: 'Envoyer le devis' });
    }
    if (quotation.status === 'envoye') {
      buttons.push({ status: 'accepte', icon: CheckCircle2, color: 'text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20', title: 'Accepter' });
      buttons.push({ status: 'refuse', icon: XCircle, color: 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20', title: 'Refuser' });
    }
    if (quotation.status !== 'expire' && quotation.status !== 'refuse') {
      buttons.push({ status: 'expire', icon: AlertCircle, color: 'text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20', title: 'Marquer expiré' });
    }
    return buttons;
  };

  // ─── KPI Cards Config ────────────────────────────────────────────────────

  const kpiCards = [
    {
      title: 'Montant Total Devis',
      value: formatPrice(totalAmount),
      icon: DollarSign,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Montant Accepté',
      value: formatPrice(acceptedAmount),
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Montant En Attente',
      value: formatPrice(pendingAmount),
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Taux Conversion',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Devis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos devis et quotations</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={filtered as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'quoteNumber', header: 'N° Devis' },
              { key: 'clientName', header: 'Client' },
              { key: 'freightType', header: 'Type Fret' },
              { key: 'origin', header: 'Origine' },
              { key: 'destination', header: 'Destination' },
              { key: 'weight', header: 'Poids (kg)' },
              { key: 'estimatedAmount', header: 'Montant Estimé' },
              { key: 'status', header: 'Statut' },
              { key: 'createdAt', header: 'Date Création' },
              { key: 'validUntil', header: 'Validité' },
            ]}
            filename="logisway-devis"
            title="Rapport des Devis"
          />
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          {canEditQuotations && (
            <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nouveau devis
            </Button>
          )}
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
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{card.value}</p>
                  </div>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 ml-2`}>
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Devis par mois</CardTitle>
          <CardDescription>Nombre de devis créés par mois</CardDescription>
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
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, 'Devis']}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00c9a7" radius={[4, 4, 0, 0]} />
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
                placeholder="Rechercher par N° devis ou client..."
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
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="envoye">Envoyé</SelectItem>
                <SelectItem value="accepte">Accepté</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
                <SelectItem value="expire">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AdvancedFilters
        onFiltersChange={setActiveFilters}
        availableClients={[...new Set(data.map(q => q.clientName))].sort()}
        availableOrigins={[...new Set(data.map(q => q.origin))].sort()}
        availableDestinations={[...new Set(data.map(q => q.destination))].sort()}
        availableCategories={[
          { value: 'maritime', label: 'Maritime' },
          { value: 'aerien', label: 'Aérien' },
          { value: 'terrestre', label: 'Terrestre' },
        ]}
        availableStatuses={[
          { value: 'brouillon', label: 'Brouillon' },
          { value: 'envoye', label: 'Envoyé' },
          { value: 'accepte', label: 'Accepté' },
          { value: 'refuse', label: 'Refusé' },
          { value: 'expire', label: 'Expiré' },
        ]}
        showLocationFilters={true}
      />

      {/* Quotations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">N° Devis</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Type Fret</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Trajet</TableHead>
                  <TableHead className="text-xs">Montant</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Validité</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Aucun devis trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((quotation) => {
                    const FreightIcon = freightTypeIcons[quotation.freightType];
                    const StatusIcon = statusIcons[quotation.status];
                    return (
                      <TableRow
                        key={quotation.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => openDetailDialog(quotation)}
                      >
                        <TableCell className="font-mono text-xs font-semibold">{quotation.quoteNumber}</TableCell>
                        <TableCell className="text-xs font-medium">{quotation.clientName}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <FreightIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                            <span>{freightTypeLabels[quotation.freightType]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <span>{quotation.origin}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span>{quotation.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{formatPrice(quotation.estimatedAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[quotation.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[quotation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{formatDate(quotation.validUntil)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                            {/* Quick status buttons */}
                            {canEditQuotations && getQuickStatusButtons(quotation).map((btn) => (
                              <Button
                                key={btn.status}
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ${btn.color}`}
                                title={btn.title}
                                onClick={() => openStatusDialog(quotation, btn.status)}
                              >
                                <btn.icon className="w-3 h-3" />
                              </Button>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              title="Voir les détails"
                              onClick={() => openDetailDialog(quotation)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {canEditQuotations && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                  title="Modifier"
                                  onClick={() => openEditDialog(quotation)}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                {quotation.status === 'accepte' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                                    title="Convertir en expédition"
                                    onClick={() => handleConvertToShipment(quotation.id)}
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                  title="Dupliquer"
                                  onClick={() => handleDuplicate(quotation.id)}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  title="Supprimer"
                                  onClick={() => openDeleteDialog(quotation)}
                                >
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
                {filtered.length} devis — Page {currentPage}/{totalPages}
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
          DETAIL DIALOG — Vue détaillée avec timeline de statut
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedQuotation && (() => {
            const FreightIcon = freightTypeIcons[selectedQuotation.freightType];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedQuotation.quoteNumber}
                  </DialogTitle>
                  <DialogDescription>Détails du devis</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Status + Montant */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`text-xs px-3 py-1 ${statusColors[selectedQuotation.status]}`}>
                      {statusLabels[selectedQuotation.status]}
                    </Badge>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(selectedQuotation.estimatedAmount)}
                    </p>
                  </div>

                  <Separator />

                  {/* Client */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedQuotation.clientName}</p>
                  </div>

                  <Separator />

                  {/* Freight type with icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                      <FreightIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Type de fret</p>
                      <p className="font-medium text-gray-900 dark:text-white">{freightTypeLabels[selectedQuotation.freightType]}</p>
                    </div>
                  </div>

                  {/* Origin → Destination */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Origine</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedQuotation.origin}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedQuotation.destination}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Poids</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedQuotation.weight.toLocaleString('fr-FR')} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Montant estimé</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(selectedQuotation.estimatedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date de création</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedQuotation.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Valide jusqu&apos;au</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedQuotation.validUntil)}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedQuotation.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          {selectedQuotation.notes}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Status Timeline */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Historique du devis</p>
                    <div className="space-y-0">
                      {getStatusTimeline(selectedQuotation).map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${timelineDotColors[event.type] || 'bg-gray-400'} flex-shrink-0 mt-1`} />
                            {index < getStatusTimeline(selectedQuotation).length - 1 && (
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
                  {canEditQuotations && getStatusActions(selectedQuotation).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Actions</p>
                        <div className="flex flex-wrap gap-2">
                          {getStatusActions(selectedQuotation).map((action) => (
                            <Button
                              key={action.status}
                              size="sm"
                              className={`text-xs h-8 ${getVariantClass(action.variant)}`}
                              onClick={() => openStatusDialog(selectedQuotation, action.status)}
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
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          ADD QUOTATION DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau devis</DialogTitle>
            <DialogDescription>Créer un nouveau devis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Client</Label>
              <Input
                value={newQuotation.clientName}
                onChange={(e) => setNewQuotation({ ...newQuotation, clientName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type de fret</Label>
              <Select
                value={newQuotation.freightType}
                onValueChange={(v) => setNewQuotation({ ...newQuotation, freightType: v as FreightType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de fret" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maritime">Maritime</SelectItem>
                  <SelectItem value="aerien">Aérien</SelectItem>
                  <SelectItem value="terrestre">Terrestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Origine</Label>
                <Input
                  value={newQuotation.origin}
                  onChange={(e) => setNewQuotation({ ...newQuotation, origin: e.target.value })}
                  placeholder="Ville d'origine"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destination</Label>
                <Input
                  value={newQuotation.destination}
                  onChange={(e) => setNewQuotation({ ...newQuotation, destination: e.target.value })}
                  placeholder="Ville de destination"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Poids (kg)</Label>
                <Input
                  type="number"
                  value={newQuotation.weight}
                  onChange={(e) => setNewQuotation({ ...newQuotation, weight: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{`Montant estimé (${symbol})`}</Label>
                <Input
                  type="number"
                  value={newQuotation.estimatedAmount}
                  onChange={(e) => setNewQuotation({ ...newQuotation, estimatedAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date validité</Label>
              <Input
                type="date"
                value={newQuotation.validUntil}
                onChange={(e) => setNewQuotation({ ...newQuotation, validUntil: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={newQuotation.notes}
                onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddQuotation} disabled={!newQuotation.clientName} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Créer le devis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          EDIT QUOTATION DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le devis</DialogTitle>
            <DialogDescription>Modifier les informations du devis {selectedQuotation?.quoteNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Client</Label>
              <Input
                value={editForm.clientName}
                onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type de fret</Label>
              <Select
                value={editForm.freightType}
                onValueChange={(v) => setEditForm({ ...editForm, freightType: v as FreightType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de fret" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maritime">Maritime</SelectItem>
                  <SelectItem value="aerien">Aérien</SelectItem>
                  <SelectItem value="terrestre">Terrestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Origine</Label>
                <Input
                  value={editForm.origin}
                  onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })}
                  placeholder="Ville d'origine"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destination</Label>
                <Input
                  value={editForm.destination}
                  onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                  placeholder="Ville de destination"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Poids (kg)</Label>
                <Input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{`Montant estimé (${symbol})`}</Label>
                <Input
                  type="number"
                  value={editForm.estimatedAmount}
                  onChange={(e) => setEditForm({ ...editForm, estimatedAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date validité</Label>
              <Input
                type="date"
                value={editForm.validUntil}
                onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleEditQuotation} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
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
            <AlertDialogTitle>Supprimer le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le devis {selectedQuotation?.quoteNumber} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuotation} className="bg-red-600 hover:bg-red-700 text-white">
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
              {pendingStatus === 'envoye' && `Confirmer l'envoi du devis ${selectedQuotation?.quoteNumber} au client ${selectedQuotation?.clientName} ?`}
              {pendingStatus === 'accepte' && `Confirmer l'acceptation du devis ${selectedQuotation?.quoteNumber} (${selectedQuotation ? formatPrice(selectedQuotation.estimatedAmount) : ''}) ?`}
              {pendingStatus === 'refuse' && `Refuser le devis ${selectedQuotation?.quoteNumber} ? Le client sera notifié.`}
              {pendingStatus === 'expire' && `Marquer le devis ${selectedQuotation?.quoteNumber} comme expiré ? Cette action est irréversible.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              className={
                pendingStatus === 'accepte'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : pendingStatus === 'refuse'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : pendingStatus === 'expire'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : pendingStatus === 'envoye'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : ''
              }
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
