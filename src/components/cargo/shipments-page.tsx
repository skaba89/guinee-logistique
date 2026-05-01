'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Plane,
  Ship,
  Truck,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FileDown,
  Trash2,
  CheckSquare,
  Square,
  MoreHorizontal,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  shipments as initialShipments,
  statusLabels,
  typeLabels,
  formatDate,
  type Shipment,
  type ShipmentType,
  type ShipmentStatus,
} from '@/lib/test-data';
import { useCurrency } from '@/lib/use-currency';
import { useCargoStore } from '@/lib/cargo-store';

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const typeIcons: Record<ShipmentType, React.ElementType> = {
  aerien: Plane,
  maritime: Ship,
  terrestre: Truck,
};

const typeColors: Record<ShipmentType, string> = {
  aerien: 'text-sky-500 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20',
  maritime: 'text-teal-500 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20',
  terrestre: 'text-amber-500 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
};

const allStatuses: ShipmentStatus[] = ['en_attente', 'confirmee', 'en_transit', 'livree', 'retardee', 'annulee'];

const ITEMS_PER_PAGE = 8;

const algerianCities = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Setif', 'Blida',
  'Tizi Ouzou', 'Bejaia', 'Batna', 'Djelfa', 'Biskra', 'Tiaret',
];

export default function ShipmentsPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const [data, setData] = useState<Shipment[]>(initialShipments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const canEditPage = useCargoStore((s) => s.canEdit('shipments'));

  // Add form state
  const [newShipment, setNewShipment] = useState({
    type: 'aerien' as ShipmentType,
    origin: '',
    destination: '',
    clientName: '',
    clientPhone: '',
    weight: '',
    dimensions: '',
    price: '',
    notes: '',
    driverName: '',
    dateLivraisonEstimee: '',
  });

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType !== 'all') {
      result = result.filter((s) => s.type === filterType);
    }
    if (filterStatus !== 'all') {
      result = result.filter((s) => s.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.clientName.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [data, filterType, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleViewDetail = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowDetailDialog(true);
  };

  const handleAddShipment = () => {
    const id = `s${data.length + 1}`;
    const trackingNumber = `FFP-${String(data.length + 1).padStart(4, '0')}-2026`;
    const shipment: Shipment = {
      id,
      trackingNumber,
      type: newShipment.type,
      status: 'en_attente',
      origin: newShipment.origin,
      destination: newShipment.destination,
      clientName: newShipment.clientName,
      clientPhone: newShipment.clientPhone,
      weight: parseFloat(newShipment.weight) || 0,
      dimensions: newShipment.dimensions,
      dateCreation: new Date().toISOString().split('T')[0],
      dateExpedition: '',
      dateLivraisonEstimee: newShipment.dateLivraisonEstimee,
      price: parseFloat(newShipment.price) || 0,
      notes: newShipment.notes,
      driverName: newShipment.driverName,
    };
    setData([shipment, ...data]);
    setShowAddDialog(false);
    setNewShipment({
      type: 'aerien',
      origin: '',
      destination: '',
      clientName: '',
      clientPhone: '',
      weight: '',
      dimensions: '',
      price: '',
      notes: '',
      driverName: '',
      dateLivraisonEstimee: '',
    });
  };

  const handleStatusChange = (shipmentId: string, newStatus: ShipmentStatus) => {
    setData((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleBulkStatusChange = (newStatus: ShipmentStatus) => {
    setData((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, status: newStatus } : s))
    );
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const handleBulkDelete = () => {
    setData((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((s) => s.id)));
    }
  };

  const handleExportPDF = () => {
    const printContent = `
      <html>
      <head>
        <title>LogisWay — Expéditions</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a1a; }
          .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
          .subtitle { font-size: 10px; color: #666; letter-spacing: 2px; text-transform: uppercase; }
          .title { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { background: #0d9488; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
          td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
          .status-en_attente { background: #fef3c7; color: #92400e; }
          .status-confirmee { background: #dbeafe; color: #1e40af; }
          .status-en_transit { background: #ffedd5; color: #9a3412; }
          .status-livree { background: #dcfce7; color: #166534; }
          .status-retardee { background: #fee2e2; color: #991b1b; }
          .status-annulee { background: #f3f4f6; color: #374151; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; text-align: center; }
          .summary { display: flex; gap: 32px; margin-top: 16px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 20px; font-weight: 700; color: #0d9488; }
          .summary-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">LogisWay</div>
            <div class="subtitle">Logistique Internationale</div>
          </div>
          <div style="margin-left: auto; text-align: right;">
            <div class="title">Liste des Expéditions</div>
            <div style="font-size: 12px; color: #666;">${new Date().toLocaleDateString('fr-FR')} — ${filtered.length} expédition${filtered.length > 1 ? 's' : ''}</div>
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${filtered.filter(s => s.status === 'en_transit').length}</div>
            <div class="summary-label">En transit</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${filtered.filter(s => s.status === 'livree').length}</div>
            <div class="summary-label">Livrées</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${filtered.filter(s => s.status === 'retardee').length}</div>
            <div class="summary-label">Retardées</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${filtered.reduce((sum, s) => sum + s.weight, 0).toFixed(1)} kg</div>
            <div class="summary-label">Poids total</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>N° Suivi</th><th>Type</th><th>Client</th><th>Téléphone</th><th>Origine</th><th>Destination</th><th>Statut</th><th>Date Création</th><th>Poids</th><th>Prix (${symbol})</th><th>Chauffeur</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(s => `
              <tr>
                <td style="font-family:monospace;font-weight:600">${s.trackingNumber}</td>
                <td>${typeLabels[s.type] || s.type}</td>
                <td>${s.clientName}</td>
                <td>${s.clientPhone}</td>
                <td>${s.origin}</td>
                <td>${s.destination}</td>
                <td><span class="status status-${s.status}">${statusLabels[s.status] || s.status}</span></td>
                <td>${formatDate(s.dateCreation)}</td>
                <td>${s.weight} kg</td>
                <td style="font-weight:600">${s.price.toLocaleString()}</td>
                <td>${s.driverName || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          LogisWay — Plateforme de Logistique Internationale | Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleExportExcel = () => {
    const headers = ['N° Suivi', 'Type', 'Client', 'Téléphone', 'Origine', 'Destination', 'Statut', 'Date Création', 'Date Expédition', 'Livraison Estimée', 'Poids (kg)', `Prix (${symbol})`, 'Chauffeur', 'Notes'];
    let tableHtml = '<Table><Row>';
    headers.forEach(h => { tableHtml += `<Cell><Data ss:Type="String">${h}</Data></Cell>`; });
    tableHtml += '</Row>';
    filtered.forEach(s => {
      tableHtml += '<Row>';
      const row = [
        s.trackingNumber, typeLabels[s.type] || s.type, s.clientName, s.clientPhone,
        s.origin, s.destination, statusLabels[s.status] || s.status,
        s.dateCreation, s.dateExpedition, s.dateLivraisonEstimee,
        String(s.weight), String(s.price), s.driverName || '', s.notes || ''
      ];
      row.forEach(cell => { tableHtml += `<Cell><Data ss:Type="String">${cell.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</Data></Cell>`; });
      tableHtml += '</Row>';
    });
    tableHtml += '</Table>';

    const excelXml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Expéditions">${tableHtml}</Worksheet></Workbook>`;

    const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-shipments-${new Date().toISOString().slice(0,10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['N° Suivi', 'Type', 'Client', 'Téléphone', 'Origine', 'Destination', 'Statut', 'Date Création', 'Date Expédition', 'Livraison Estimée', 'Poids (kg)', `Prix (${symbol})`, 'Chauffeur', 'Notes'];
    const rows = filtered.map(s => [
      s.trackingNumber,
      typeLabels[s.type] || s.type,
      s.clientName,
      s.clientPhone,
      s.origin,
      s.destination,
      statusLabels[s.status] || s.status,
      s.dateCreation,
      s.dateExpedition,
      s.dateLivraisonEstimee,
      String(s.weight),
      String(s.price),
      s.driverName || '',
      s.notes || '',
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-shipments-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expéditions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos expéditions et colis</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="w-4 h-4 mr-1" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-500" />
                Exporter CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2 text-red-500" />
                Exporter PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileDown className="w-4 h-4 mr-2 text-blue-500" />
                Exporter Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {canEditPage && (
            <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle expédition
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20"
        >
          <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
            {selectedIds.size} sélectionnée{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {canEditPage && (
              <>
                <Select onValueChange={(v) => handleBulkStatusChange(v as ShipmentStatus)}>
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleBulkDelete}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Supprimer
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedIds(new Set())}>
              Annuler
            </Button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par N°, client, ville..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {/* Type filter with icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filterType === 'all'
                    ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Tous
              </button>
              <button
                onClick={() => { setFilterType('maritime'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filterType === 'maritime'
                    ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                Maritime
              </button>
              <button
                onClick={() => { setFilterType('aerien'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filterType === 'aerien'
                    ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                Aérien
              </button>
              <button
                onClick={() => { setFilterType('terrestre'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filterType === 'terrestre'
                    ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Terrestre
              </button>
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirmee">Confirmée</SelectItem>
                <SelectItem value="en_transit">En transit</SelectItem>
                <SelectItem value="livree">Livrée</SelectItem>
                <SelectItem value="retardee">Retardée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-10">
                    <button onClick={toggleSelectAll} className="p-0.5">
                      {selectedIds.size === paginated.length && paginated.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-teal-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-xs">N° Suivi</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Origine</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Destination</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Poids</TableHead>
                  <TableHead className="text-xs text-right">Prix</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      Aucune expédition trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((shipment) => {
                    const TypeIcon = typeIcons[shipment.type];
                    const isSelected = selectedIds.has(shipment.id);
                    return (
                      <TableRow
                        key={shipment.id}
                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}
                        onClick={() => handleViewDetail(shipment)}
                      >
                        <TableCell>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelect(shipment.id); }}
                            className="p-0.5"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-500" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{shipment.trackingNumber}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${typeColors[shipment.type]}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{typeLabels[shipment.type]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{shipment.clientName}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{shipment.origin}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{shipment.destination}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {canEditPage ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="focus:outline-none">
                                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity ${statusColors[shipment.status]}`}>
                                    {statusLabels[shipment.status]}
                                  </Badge>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-1" align="start">
                                <p className="text-xs font-medium text-gray-500 px-2 py-1.5">Changer le statut</p>
                                <div className="space-y-0.5">
                                  {allStatuses.map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(shipment.id, status)}
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                        shipment.status === status ? 'font-semibold text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${
                                        status === 'en_attente' ? 'bg-yellow-500' :
                                        status === 'confirmee' ? 'bg-blue-500' :
                                        status === 'en_transit' ? 'bg-orange-500' :
                                        status === 'livree' ? 'bg-green-500' :
                                        status === 'retardee' ? 'bg-red-500' : 'bg-gray-500'
                                      }`} />
                                      {statusLabels[status]}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[shipment.status]}`}>
                              {statusLabels[shipment.status]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{formatDate(shipment.dateCreation)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{shipment.weight} kg</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatPrice(shipment.price)}</TableCell>
                        <TableCell>
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={(e) => { e.stopPropagation(); handleViewDetail(shipment); }}>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
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
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} — Page {currentPage}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono">{selectedShipment?.trackingNumber}</span>
            </DialogTitle>
            <DialogDescription>Détails de l&apos;expédition</DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {canEditPage ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="focus:outline-none">
                        <Badge className={`${statusColors[selectedShipment.status]} text-sm px-3 py-1 cursor-pointer hover:opacity-80`}>
                          {statusLabels[selectedShipment.status]}
                        </Badge>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start">
                      <p className="text-xs font-medium text-gray-500 px-2 py-1.5">Changer le statut</p>
                      <div className="space-y-0.5">
                        {allStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              handleStatusChange(selectedShipment.id, status);
                              setSelectedShipment({ ...selectedShipment, status });
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                              selectedShipment.status === status ? 'font-semibold text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'en_attente' ? 'bg-yellow-500' :
                              status === 'confirmee' ? 'bg-blue-500' :
                              status === 'en_transit' ? 'bg-orange-500' :
                              status === 'livree' ? 'bg-green-500' :
                              status === 'retardee' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            {statusLabels[status]}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Badge className={`${statusColors[selectedShipment.status]} text-sm px-3 py-1`}>
                    {statusLabels[selectedShipment.status]}
                  </Badge>
                )}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${typeColors[selectedShipment.type]}`}>
                  {React.createElement(typeIcons[selectedShipment.type], { className: 'w-4 h-4' })}
                  <span className="text-sm font-medium">{typeLabels[selectedShipment.type]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Client</p>
                  <p className="font-medium">{selectedShipment.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Téléphone</p>
                  <p className="font-medium">{selectedShipment.clientPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Origine</p>
                  <p className="font-medium">{selectedShipment.origin}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Destination</p>
                  <p className="font-medium">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Poids</p>
                  <p className="font-medium">{selectedShipment.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Dimensions</p>
                  <p className="font-medium">{selectedShipment.dimensions} cm</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date création</p>
                  <p className="font-medium">{formatDate(selectedShipment.dateCreation)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date expédition</p>
                  <p className="font-medium">{formatDate(selectedShipment.dateExpedition)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Livraison estimée</p>
                  <p className="font-medium">{formatDate(selectedShipment.dateLivraisonEstimee)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Prix</p>
                  <p className="font-semibold text-lg" style={{ color: '#0d9488' }}>{formatPrice(selectedShipment.price)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Chauffeur</p>
                  <p className="font-medium">{selectedShipment.driverName || '-'}</p>
                </div>
              </div>

              {selectedShipment.notes && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{selectedShipment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Shipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle expédition</DialogTitle>
            <DialogDescription>Créer une nouvelle expédition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={newShipment.type} onValueChange={(v) => setNewShipment({ ...newShipment, type: v as ShipmentType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aerien">Aérien</SelectItem>
                    <SelectItem value="maritime">Maritime</SelectItem>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Poids (kg)</Label>
                <Input
                  type="number"
                  value={newShipment.weight}
                  onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Origine</Label>
                <Select value={newShipment.origin} onValueChange={(v) => setNewShipment({ ...newShipment, origin: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ville d'origine" />
                  </SelectTrigger>
                  <SelectContent>
                    {algerianCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destination</Label>
                <Select value={newShipment.destination} onValueChange={(v) => setNewShipment({ ...newShipment, destination: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ville de destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {algerianCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom du client</Label>
                <Input
                  value={newShipment.clientName}
                  onChange={(e) => setNewShipment({ ...newShipment, clientName: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone client</Label>
                <Input
                  value={newShipment.clientPhone}
                  onChange={(e) => setNewShipment({ ...newShipment, clientPhone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Dimensions (cm)</Label>
                <Input
                  value={newShipment.dimensions}
                  onChange={(e) => setNewShipment({ ...newShipment, dimensions: e.target.value })}
                  placeholder="LxlxH"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prix (DA)</Label>
                <Input
                  type="number"
                  value={newShipment.price}
                  onChange={(e) => setNewShipment({ ...newShipment, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Chauffeur</Label>
                <Input
                  value={newShipment.driverName}
                  onChange={(e) => setNewShipment({ ...newShipment, driverName: e.target.value })}
                  placeholder="Nom du chauffeur"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Livraison estimée</Label>
                <Input
                  type="date"
                  value={newShipment.dateLivraisonEstimee}
                  onChange={(e) => setNewShipment({ ...newShipment, dateLivraisonEstimee: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={newShipment.notes}
                onChange={(e) => setNewShipment({ ...newShipment, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddShipment} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Créer l&apos;expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
