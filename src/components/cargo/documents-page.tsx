'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Edit3,
  PenTool,
  Ban,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCargoStore } from '@/lib/cargo-store';

// ── Types ──────────────────────────────────────────────────────────────────
type DocumentType = 'bl' | 'awb' | 'facture' | 'douane' | 'assurance' | 'autre';
type DocumentStatus = 'signe' | 'en_attente' | 'expire' | 'annule';

interface Document {
  id: string;
  documentNumber: string;
  type: DocumentType;
  reference: string;
  clientName: string;
  shipmentRef: string;
  createdAt: string;
  expiresAt: string;
  status: DocumentStatus;
  fileName: string;
  notes?: string;
  signedAt?: string;
  signedBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const typeLabels: Record<DocumentType, string> = {
  bl: 'Connaissement (BL)',
  awb: 'LTA (AWB)',
  facture: 'Facture',
  douane: 'Douane',
  assurance: 'Assurance',
  autre: 'Autre',
};

const statusLabels: Record<DocumentStatus, string> = {
  signe: 'Signe',
  en_attente: 'En attente',
  expire: 'Expire',
  annule: 'Annule',
};

const statusColors: Record<DocumentStatus, string> = {
  signe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  expire: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  annule: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const pieColors: Record<DocumentType, string> = {
  bl: '#0d9488',
  awb: '#3b82f6',
  facture: '#f59e0b',
  douane: '#8b5cf6',
  assurance: '#ef4444',
  autre: '#6b7280',
};

const typeIcons: Record<DocumentType, string> = {
  bl: 'BL',
  awb: 'AWB',
  facture: 'FAC',
  douane: 'DD',
  assurance: 'ASS',
  autre: 'DOC',
};

const ITEMS_PER_PAGE = 8;

// ── Initial test data ──────────────────────────────────────────────────────
const initialDocuments: Document[] = [
  { id: 'doc1', documentNumber: 'BL-2026-0001', type: 'bl', reference: 'MAEU-ALG-78901', clientName: 'Entreprise Bouzidi & Fils', shipmentRef: 'FFP-0002-2026', createdAt: '2026-01-12', expiresAt: '2026-07-12', status: 'signe', fileName: 'BL-Bouzidi-78901.pdf', signedAt: '2026-01-12', signedBy: 'Ahmed Benali' },
  { id: 'doc2', documentNumber: 'AWB-2026-0001', type: 'awb', reference: '124-56789012', clientName: 'Sarl TechnoPlus', shipmentRef: 'FFP-0001-2026', createdAt: '2026-01-06', expiresAt: '', status: 'signe', fileName: 'AWB-TechnoPlus-56789012.pdf', signedAt: '2026-01-06', signedBy: 'Ahmed Benali' },
  { id: 'doc3', documentNumber: 'FAC-DOC-0001', type: 'facture', reference: 'FAC-2026-0001', clientName: 'Sarl TechnoPlus', shipmentRef: 'FFP-0001-2026', createdAt: '2026-01-05', expiresAt: '2026-02-05', status: 'signe', fileName: 'Facture-TechnoPlus-0001.pdf', signedAt: '2026-01-07', signedBy: 'Fatima Khelifi' },
  { id: 'doc4', documentNumber: 'DD-2026-DOC01', type: 'douane', reference: 'DD-2026-0001', clientName: 'Entreprise Bouzidi & Fils', shipmentRef: 'FFP-0002-2026', createdAt: '2026-01-11', expiresAt: '', status: 'en_attente', fileName: 'Declaration-Bouzidi-0001.pdf' },
  { id: 'doc5', documentNumber: 'ASS-2026-0001', type: 'assurance', reference: 'POL-2026-ALG-001', clientName: 'EURL BatiPlus', shipmentRef: 'FFP-0006-2026', createdAt: '2026-02-10', expiresAt: '2027-02-10', status: 'signe', fileName: 'Police-BatiPlus-001.pdf', signedAt: '2026-02-10', signedBy: 'Ahmed Benali' },
  { id: 'doc6', documentNumber: 'BL-2026-0002', type: 'bl', reference: 'MSCU-SHA-45678', clientName: 'EURL BatiPlus', shipmentRef: 'FFP-0006-2026', createdAt: '2026-02-12', expiresAt: '2026-08-12', status: 'en_attente', fileName: 'BL-BatiPlus-45678.pdf' },
  { id: 'doc7', documentNumber: 'AWB-2026-0002', type: 'awb', reference: '176-89012345', clientName: 'Sarl MediaCom', shipmentRef: 'FFP-0004-2026', createdAt: '2026-02-01', expiresAt: '', status: 'en_attente', fileName: 'AWB-MediaCom-89012345.pdf' },
  { id: 'doc8', documentNumber: 'CERT-2026-0001', type: 'autre', reference: 'CERT-ORIG-ALG-001', clientName: 'SPA HydroServices', shipmentRef: 'FFP-0005-2026', createdAt: '2026-02-05', expiresAt: '2026-05-05', status: 'signe', fileName: 'Certificat-Origine-Hydro.pdf', signedAt: '2026-02-05', signedBy: 'Ahmed Benali' },
  { id: 'doc9', documentNumber: 'DD-2026-DOC02', type: 'douane', reference: 'DD-2026-0003', clientName: 'SPA HydroServices', shipmentRef: 'FFP-0010-2026', createdAt: '2026-03-05', expiresAt: '', status: 'en_attente', fileName: 'Declaration-Hydro-0003.pdf' },
  { id: 'doc10', documentNumber: 'ASS-2026-0002', type: 'assurance', reference: 'POL-2026-ALG-002', clientName: 'Sarl AgriPro', shipmentRef: 'FFP-0016-2026', createdAt: '2026-04-05', expiresAt: '2026-04-05', status: 'expire', fileName: 'Police-AgriPro-002.pdf' },
  { id: 'doc11', documentNumber: 'BL-2026-0003', type: 'bl', reference: 'HLCU-HAM-23456', clientName: 'SPA HydroServices', shipmentRef: 'FFP-0010-2026', createdAt: '2026-03-08', expiresAt: '2026-09-08', status: 'signe', fileName: 'BL-HydroServices-23456.pdf', signedAt: '2026-03-08', signedBy: 'Fatima Khelifi' },
  { id: 'doc12', documentNumber: 'AWB-2026-0003', type: 'awb', reference: '057-90123456', clientName: 'Nadia Benmoussa', shipmentRef: 'FFP-0015-2026', createdAt: '2026-04-02', expiresAt: '', status: 'signe', fileName: 'AWB-Benmoussa-90123456.pdf', signedAt: '2026-04-02', signedBy: 'Ahmed Benali' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ── Component ──────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const canEditPage = useCargoStore((s) => s.canEdit('documents'));
  const user = useCargoStore((s) => s.user);

  const [data, setData] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // New doc form
  const [newDoc, setNewDoc] = useState({
    type: '' as DocumentType | '',
    reference: '',
    clientName: '',
    shipmentRef: '',
    notes: '',
  });

  // Edit doc form
  const [editForm, setEditForm] = useState({
    reference: '',
    clientName: '',
    shipmentRef: '',
    notes: '',
  });

  // ── Filtering & pagination ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType !== 'all') result = result.filter((d) => d.type === filterType);
    if (filterStatus !== 'all') result = result.filter((d) => d.status === filterStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.documentNumber.toLowerCase().includes(q) ||
          d.reference.toLowerCase().includes(q) ||
          d.clientName.toLowerCase().includes(q) ||
          d.shipmentRef.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, filterType, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── KPIs ───────────────────────────────────────────────────────────────
  const totalDocs = data.length;
  const signedDocs = data.filter((d) => d.status === 'signe').length;
  const pendingDocs = data.filter((d) => d.status === 'en_attente').length;
  const expiredDocs = data.filter((d) => d.status === 'expire').length;

  // ── Pie chart data ─────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => { counts[d.type] = (counts[d.type] || 0) + 1; });
    return (Object.keys(typeLabels) as DocumentType[])
      .filter((t) => counts[t])
      .map((t) => ({ name: typeLabels[t], value: counts[t], color: pieColors[t] }));
  }, [data]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleUpload = () => {
    if (!newDoc.type || !newDoc.reference || !newDoc.clientName) return;
    const typePrefix: Record<DocumentType, string> = { bl: 'BL', awb: 'AWB', facture: 'FAC-DOC', douane: 'DD', assurance: 'ASS', autre: 'DOC' };
    const doc: Document = {
      id: `doc${Date.now()}`,
      documentNumber: `${typePrefix[newDoc.type as DocumentType]}-2026-${String(data.length + 1).padStart(4, '0')}`,
      type: newDoc.type as DocumentType,
      reference: newDoc.reference,
      clientName: newDoc.clientName,
      shipmentRef: newDoc.shipmentRef,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
      status: 'en_attente',
      fileName: uploadedFileName || `${typePrefix[newDoc.type as DocumentType]}-${newDoc.clientName.replace(/\s+/g, '-')}.pdf`,
      notes: newDoc.notes,
    };
    setData([doc, ...data]);
    setShowUploadDialog(false);
    setNewDoc({ type: '', reference: '', clientName: '', shipmentRef: '', notes: '' });
    setUploadedFileName('');
  };

  const handleDelete = () => {
    if (!selectedDoc) return;
    setData(data.filter((d) => d.id !== selectedDoc.id));
    setShowDeleteDialog(false);
    setSelectedDoc(null);
  };

  const handleSign = () => {
    if (!selectedDoc) return;
    setData(data.map(d =>
      d.id === selectedDoc.id
        ? { ...d, status: 'signe' as DocumentStatus, signedAt: new Date().toISOString().split('T')[0], signedBy: user?.name || 'Utilisateur' }
        : d
    ));
    setShowSignDialog(false);
    setSelectedDoc(null);
  };

  const handleCancel = () => {
    if (!selectedDoc) return;
    setData(data.map(d =>
      d.id === selectedDoc.id
        ? { ...d, status: 'annule' as DocumentStatus, cancelledAt: new Date().toISOString().split('T')[0], cancelReason }
        : d
    ));
    setShowCancelDialog(false);
    setSelectedDoc(null);
    setCancelReason('');
  };

  const handleReactivate = (doc: Document) => {
    setData(data.map(d =>
      d.id === doc.id ? { ...d, status: 'en_attente' as DocumentStatus } : d
    ));
  };

  const handleEdit = () => {
    if (!selectedDoc) return;
    setData(data.map(d =>
      d.id === selectedDoc.id
        ? {
            ...d,
            reference: editForm.reference || d.reference,
            clientName: editForm.clientName || d.clientName,
            shipmentRef: editForm.shipmentRef || d.shipmentRef,
            notes: editForm.notes,
          }
        : d
    ));
    setShowEditDialog(false);
    setSelectedDoc(null);
  };

  const handleDownload = (doc: Document) => {
    // Generate a simulated document download
    const content = [
      `Document: ${doc.documentNumber}`,
      `Type: ${typeLabels[doc.type]}`,
      `Reference: ${doc.reference}`,
      `Client: ${doc.clientName}`,
      `Expedition: ${doc.shipmentRef}`,
      `Date creation: ${doc.createdAt}`,
      `Date expiration: ${doc.expiresAt || 'N/A'}`,
      `Statut: ${statusLabels[doc.status]}`,
      doc.signedAt ? `Signe le: ${doc.signedAt} par ${doc.signedBy}` : '',
      doc.notes ? `Notes: ${doc.notes}` : '',
      '',
      '--- Guinée Logistique - Document officiel ---',
    ].filter(Boolean).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.documentNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFileName(file.name);
  };

  const handleExportCSV = () => {
    const headers = ['N Document', 'Type', 'Reference', 'Client', 'Expedition', 'Date Creation', 'Date Expiration', 'Statut', 'Fichier'];
    const rows = filtered.map(d => [
      d.documentNumber, typeLabels[d.type] || d.type, d.reference, d.clientName,
      d.shipmentRef, d.createdAt, d.expiresAt, statusLabels[d.status] || d.status, d.fileName,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guinee-logistique-documents-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Open dialog helpers ────────────────────────────────────────────────
  const openDetail = (doc: Document) => { setSelectedDoc(doc); setShowDetailDialog(true); };
  const openEdit = (doc: Document) => {
    setSelectedDoc(doc);
    setEditForm({ reference: doc.reference, clientName: doc.clientName, shipmentRef: doc.shipmentRef, notes: doc.notes || '' });
    setShowEditDialog(true);
  };
  const openDelete = (doc: Document) => { setSelectedDoc(doc); setShowDeleteDialog(true); };
  const openSign = (doc: Document) => { setSelectedDoc(doc); setShowSignDialog(true); };
  const openCancel = (doc: Document) => { setSelectedDoc(doc); setCancelReason(''); setShowCancelDialog(true); };

  // ── KPI cards config ───────────────────────────────────────────────────
  const kpiCards = [
    { title: 'Total Documents', value: totalDocs, icon: FolderOpen, color: 'from-blue-500 to-blue-600' },
    { title: 'Signes', value: signedDocs, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { title: 'En attente', value: pendingDocs, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Expires', value: expiredDocs, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
  ];

  // ── Document preview content ───────────────────────────────────────────
  const getPreviewContent = (doc: Document) => {
    const lines = [
      { label: 'N Document', value: doc.documentNumber },
      { label: 'Type', value: typeLabels[doc.type] },
      { label: 'Reference', value: doc.reference },
      { label: 'Client', value: doc.clientName },
      { label: 'Expedition', value: doc.shipmentRef },
      { label: 'Date creation', value: formatDate(doc.createdAt) },
      { label: 'Date expiration', value: formatDate(doc.expiresAt) },
      { label: 'Statut', value: statusLabels[doc.status] },
    ];
    if (doc.signedAt) lines.push({ label: 'Signe le', value: `${formatDate(doc.signedAt)} par ${doc.signedBy}` });
    if (doc.cancelledAt) lines.push({ label: 'Annule le', value: formatDate(doc.cancelledAt) });
    if (doc.cancelReason) lines.push({ label: 'Raison annulation', value: doc.cancelReason });
    if (doc.notes) lines.push({ label: 'Notes', value: doc.notes });
    return lines;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerez vos documents logistiques (BL, AWB, factures, douane, assurance)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          {canEditPage && (
            <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowUploadDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nouveau document
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

      {/* Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Repartition par type de document</CardTitle>
          <CardDescription>Distribution des documents par categorie</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} document${value > 1 ? 's' : ''}`, name]}
                  contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="middle" layout="vertical" align="right" iconType="circle" iconSize={10} formatter={(value: string) => <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>} />
              </PieChart>
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
              <Input placeholder="Rechercher par N document, reference, client, expedition..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Type de document" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="bl">Connaissement (BL)</SelectItem>
                <SelectItem value="awb">LTA (AWB)</SelectItem>
                <SelectItem value="facture">Facture</SelectItem>
                <SelectItem value="douane">Douane</SelectItem>
                <SelectItem value="assurance">Assurance</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="signe">Signe</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="expire">Expire</SelectItem>
                <SelectItem value="annule">Annule</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">N Document</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Reference</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Expedition</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Date creation</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">Aucun document trouve</TableCell>
                  </TableRow>
                ) : (
                  paginated.map((doc) => (
                    <TableRow key={doc.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => openDetail(doc)}>
                      <TableCell className="font-mono text-xs font-semibold">{doc.documentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5" style={{ backgroundColor: `${pieColors[doc.type]}20`, color: pieColors[doc.type] }}>
                          {typeIcons[doc.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono hidden sm:table-cell">{doc.reference}</TableCell>
                      <TableCell className="text-xs font-medium">{doc.clientName}</TableCell>
                      <TableCell className="text-xs font-mono hidden md:table-cell">{doc.shipmentRef}</TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">{formatDate(doc.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[doc.status]}`}>
                          {statusLabels[doc.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Visualiser" onClick={() => openDetail(doc)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20" title="Telecharger" onClick={() => handleDownload(doc)}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {canEditPage && doc.status === 'en_attente' && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Signer" onClick={() => openSign(doc)}>
                              <PenTool className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canEditPage && (doc.status === 'expire') && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="Reactiver" onClick={() => handleReactivate(doc)}>
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canEditPage && doc.status !== 'annule' && doc.status !== 'signe' && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="Annuler" onClick={() => openCancel(doc)}>
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canEditPage && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Modifier" onClick={() => openEdit(doc)}>
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20" title="Supprimer" onClick={() => openDelete(doc)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">{filtered.length} document{filtered.length > 1 ? 's' : ''} — Page {currentPage}/{totalPages}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setCurrentPage(page)}>{page}</Button>
                ))}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL DIALOG — Visualiser un document
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          {selectedDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedDoc.documentNumber}
                </DialogTitle>
                <DialogDescription>{typeLabels[selectedDoc.type]} — {selectedDoc.reference}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={`text-xs px-3 py-1 ${statusColors[selectedDoc.status]}`}>
                    {statusLabels[selectedDoc.status]}
                  </Badge>
                  <p className="text-sm text-gray-500">{selectedDoc.fileName}</p>
                </div>

                <Separator />

                {/* Info lines */}
                <div className="space-y-2">
                  {getPreviewContent(selectedDoc).map((line, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[120px]">{line.label}</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white text-right">{line.value}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleDownload(selectedDoc)}>
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Telecharger
                  </Button>
                  {canEditPage && selectedDoc.status === 'en_attente' && (
                    <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => { setShowDetailDialog(false); openSign(selectedDoc); }}>
                      <PenTool className="w-3.5 h-3.5 mr-1" />
                      Signer
                    </Button>
                  )}
                  {canEditPage && selectedDoc.status === 'expire' && (
                    <Button size="sm" className="text-xs bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { setShowDetailDialog(false); handleReactivate(selectedDoc); }}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reactiver
                    </Button>
                  )}
                  {canEditPage && selectedDoc.status !== 'annule' && selectedDoc.status !== 'signe' && (
                    <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => { setShowDetailDialog(false); openCancel(selectedDoc); }}>
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          UPLOAD DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau document</DialogTitle>
            <DialogDescription>Ajouter un document logistique</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Type de document</Label>
              <Select value={newDoc.type} onValueChange={(v) => setNewDoc({ ...newDoc, type: v as DocumentType })}>
                <SelectTrigger><SelectValue placeholder="Selectionner un type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bl">Connaissement (BL)</SelectItem>
                  <SelectItem value="awb">LTA (AWB)</SelectItem>
                  <SelectItem value="facture">Facture</SelectItem>
                  <SelectItem value="douane">Douane</SelectItem>
                  <SelectItem value="assurance">Assurance</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Reference</Label>
              <Input value={newDoc.reference} onChange={(e) => setNewDoc({ ...newDoc, reference: e.target.value })} placeholder="N de reference du document" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Client</Label>
              <Input value={newDoc.clientName} onChange={(e) => setNewDoc({ ...newDoc, clientName: e.target.value })} placeholder="Nom du client" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Expedition associee</Label>
              <Input value={newDoc.shipmentRef} onChange={(e) => setNewDoc({ ...newDoc, shipmentRef: e.target.value })} placeholder="Reference expedition (ex: FFP-0001-2026)" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fichier</Label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 truncate">{uploadedFileName || 'Choisir un fichier...'}</span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" onChange={handleFileChange} />
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={newDoc.notes} onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })} placeholder="Notes ou commentaires..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Annuler</Button>
            <Button onClick={handleUpload} disabled={!newDoc.type || !newDoc.reference || !newDoc.clientName} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <FileText className="w-4 h-4 mr-1" />
              Ajouter le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          EDIT DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
            <DialogDescription>Modifier les informations du document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Reference</Label>
              <Input value={editForm.reference} onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Client</Label>
              <Input value={editForm.clientName} onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Expedition associee</Label>
              <Input value={editForm.shipmentRef} onChange={(e) => setEditForm({ ...editForm, shipmentRef: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleEdit} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          SIGN DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Signer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmer la signature du document {selectedDoc?.documentNumber} ?
              Le document sera marque comme signe par {user?.name || 'l\'utilisateur connecte'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSign} className="bg-green-600 hover:bg-green-700 text-white">
              Confirmer la signature
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
          CANCEL DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler le document</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir annuler le document {selectedDoc?.documentNumber} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-xs">Raison de l&apos;annulation</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Indiquez la raison de l'annulation..."
              rows={2}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
              Confirmer l&apos;annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
          DELETE DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer le document {selectedDoc?.documentNumber} ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
