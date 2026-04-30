'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  RotateCcw,
  Plus,
  Search,
  Clock,
  Tag,
  Printer,
  QrCode,
  MapPin,
  Phone,
  BarChart3,
  Camera,
  ImageIcon,
  Download,
  Copy,
  Settings,
  Wifi,
  WifiOff,
  Usb,
  Bluetooth,
  Ruler,
  Weight,
  DollarSign,
  Shield,
  ChevronRight,
  X,
  Eye,
  Zap,
  Globe,
  Home,
  FileText,
  BoxSelect,
  Layers,
  Hash,
  AlertTriangle,
  Send,
  CheckboxIcon,
  CheckSquare,
  Square,
  FileCheck,
  ChevronDown,
  Info,
  ThumbsUp,
  ThumbsDown,
  ScrollText,
  LayoutTemplate,
  Verified,
  GalleryHorizontalEnd,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { parcels, parcelStatusLabels, formatDate, formatDZD, type Parcel } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';
import {
  evaluateRules,
  getAvailableTransitions,
  canTransitionStatus,
  allBusinessRules,
  isRuleEnabled,
  toggleRule as toggleRuleLib,
  type RuleContext,
  type RuleEvaluationSummary,
  type RuleResult,
} from '@/lib/business-rules';
import {
  addAuditEntry,
} from '@/lib/audit-trail';
import {
  createApprovalRequest,
  getPendingApprovals,
} from '@/lib/notifications';
import {
  createBatchJob,
  updateBatchJobProgress,
  loadPrintHistory,
  addPrintHistoryEntry,
  loadLabelTemplates,
  getTemplatesForFormat,
  addProofPhoto,
  getPhotosForParcel,
  verifyProofPhoto,
  generatePhotoHash,
  photoTypeLabels,
  photoTypeColors,
  type ProofPhoto,
  type PrintHistoryEntry,
  type LabelTemplate,
  type BatchPrintJob,
} from '@/lib/label-advanced';
import {
  labelFormats,
  parcelFormats,
  defaultPrinters,
  connectionLabels,
  connectionColors,
  statusLabels,
  statusColors,
  statusDotColors,
  generateZPL,
  generateLabelPreviewSVG,
  calculateParcelPrice,
  formatPrice,
  loadPrinters,
  savePrinters,
  loadLabelSettings,
  saveLabelSettings,
  type ZebraPrinter,
  type LabelFormat,
  type ParcelFormat,
  type PriceBreakdown,
  type ZPLLabelData,
  type LabelSettings,
  type PrinterDPI,
} from '@/lib/label-config';

const parcelStatusColors: Record<string, string> = {
  picked_up: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_warehouse: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  out_for_delivery: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  returned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const serviceLevelLabels: Record<string, string> = {
  express: 'Express',
  standard: 'Standard',
  economy: 'Économique',
};

const serviceLevelColors: Record<string, string> = {
  express: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  standard: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  economy: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const formatColorMap: Record<string, string> = {
  xs: 'from-sky-400 to-blue-500',
  s: 'from-teal-400 to-emerald-500',
  m: 'from-amber-400 to-orange-500',
  l: 'from-orange-400 to-red-500',
  xl: 'from-red-400 to-rose-600',
  xxl: 'from-purple-400 to-indigo-600',
  custom: 'from-gray-400 to-gray-600',
};

// Carrier rate comparison data
const carrierRates = [
  { carrier: 'DHL Express', logo: 'DHL', color: '#FFCC00', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-300 dark:border-yellow-700', express: { price: 12500, eta: '1-2 jours', tracked: true, insurance: true }, standard: { price: 7500, eta: '3-5 jours', tracked: true, insurance: false }, economy: { price: 4200, eta: '7-10 jours', tracked: false, insurance: false }, rating: 4.7 },
  { carrier: 'FedEx', logo: 'FDX', color: '#4D148C', bgColor: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-300 dark:border-purple-700', express: { price: 11800, eta: '1-3 jours', tracked: true, insurance: true }, standard: { price: 6800, eta: '3-5 jours', tracked: true, insurance: false }, economy: { price: 3900, eta: '7-12 jours', tracked: true, insurance: false }, rating: 4.5 },
  { carrier: 'UPS', logo: 'UPS', color: '#351C15', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-300 dark:border-amber-700', express: { price: 13200, eta: '1-2 jours', tracked: true, insurance: true }, standard: { price: 7900, eta: '3-6 jours', tracked: true, insurance: true }, economy: { price: 4500, eta: '8-12 jours', tracked: true, insurance: false }, rating: 4.6 },
  { carrier: 'Aramex', logo: 'ARX', color: '#0066CC', bgColor: 'bg-sky-50 dark:bg-sky-900/20', borderColor: 'border-sky-300 dark:border-sky-700', express: { price: 9800, eta: '2-3 jours', tracked: true, insurance: true }, standard: { price: 5500, eta: '4-7 jours', tracked: true, insurance: false }, economy: { price: 3200, eta: '10-14 jours', tracked: true, insurance: false }, rating: 4.3 },
];

// Last-mile tracking data
const lastMileTracking = [
  { id: 'p1', trackingNumber: 'PC-FP-2026-0001', courier: 'Karim Bouzid', courierPhone: '0555555666', estimatedArrival: '14:30', status: 'out_for_delivery', distance: '2.3 km' },
  { id: 'p2', trackingNumber: 'PC-FP-2026-0003', courier: 'Mustapha Djamel', courierPhone: '0555777888', estimatedArrival: '16:00', status: 'out_for_delivery', distance: '5.1 km' },
  { id: 'p3', trackingNumber: 'PC-FP-2026-0005', courier: 'Hichem Rouabah', courierPhone: '0555202122', estimatedArrival: '17:45', status: 'out_for_delivery', distance: '8.7 km' },
];

// Return management data
const returnRecords = [
  { id: 'r1', trackingNumber: 'PC-FP-2026-0002', reason: 'Colis endommagé', requestDate: '2026-03-08', status: 'approved', returnCarrier: 'DHL Express', refundAmount: 6500 },
  { id: 'r2', trackingNumber: 'PC-FP-2026-0006', reason: 'Article incorrect', requestDate: '2026-03-10', status: 'pending', returnCarrier: '-', refundAmount: 3200 },
  { id: 'r3', trackingNumber: 'PC-FP-2026-0008', reason: 'Non réclamé', requestDate: '2026-03-12', status: 'in_transit', returnCarrier: 'Aramex', refundAmount: 4800 },
];

const returnStatusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const returnStatusLabels: Record<string, string> = {
  approved: 'Approuvé',
  pending: 'En attente',
  in_transit: 'En transit',
  rejected: 'Rejeté',
};

export default function ParcelsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState<typeof parcels[0] | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('parcels');
  const pageSize = 8;

  // Mutable parcels state
  const [parcelsList, setParcelsList] = useState<Parcel[]>(parcels);

  // Handle adding a new parcel
  const handleAddParcel = () => {
    if (!newParcel.senderName || !newParcel.receiverName || !newParcel.carrier) return;
    const trackingNumber = `PRC-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const newP: Parcel = {
      id: `pc${Date.now()}`,
      trackingNumber,
      senderName: newParcel.senderName,
      senderPhone: newParcel.senderPhone,
      senderAddress: newParcel.senderAddress,
      receiverName: newParcel.receiverName,
      receiverPhone: newParcel.receiverPhone,
      receiverAddress: newParcel.receiverAddress,
      weight: newParcel.weight,
      dimensions: `${newParcel.lengthCm}x${newParcel.widthCm}x${newParcel.heightCm}`,
      lengthCm: newParcel.lengthCm,
      widthCm: newParcel.widthCm,
      heightCm: newParcel.heightCm,
      format: newParcel.format,
      status: 'picked_up',
      carrier: newParcel.carrier,
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      price: priceBreakdown.totalPrice,
      serviceLevel: newParcel.serviceLevel,
      isInternational: newParcel.isInternational,
      barcode: trackingNumber,
      labelPrinted: false,
      labelCopies: 0,
      insuranceAmount: newParcel.insuranceAmount,
      declaredValue: newParcel.declaredValue,
    };
    setParcelsList(prev => [...prev, newP]);
    setNewParcel({
      senderName: '', senderPhone: '', senderAddress: '',
      receiverName: '', receiverPhone: '', receiverAddress: '',
      weight: 1, lengthCm: 30, widthCm: 20, heightCm: 15,
      format: 'm', serviceLevel: 'standard' as 'express' | 'standard' | 'economy',
      isInternational: true, carrier: '', insuranceAmount: 0, declaredValue: 0,
    });
    setShowAddDialog(false);
  };

  // Store for auth state
  const roleKey = useCargoStore((s) => s.roleKey);
  const canEdit = useCargoStore((s) => s.canEdit);
  const user = useCargoStore((s) => s.user);

  // Batch printing state
  const [selectedParcelIds, setSelectedParcelIds] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; active: boolean }>({ current: 0, total: 0, active: false });

  // Business rules state
  const [ruleSummary, setRuleSummary] = useState<RuleEvaluationSummary | null>(null);
  const [rulesForParcel, setRulesForParcel] = useState<typeof parcels[0] | null>(null);

  // Photo state - enhanced
  const [photoType, setPhotoType] = useState<ProofPhoto['type']>('pickup');
  const [photoComment, setPhotoComment] = useState('');
  const [parcelPhotos, setParcelPhotos] = useState<ProofPhoto[]>([]);

  // Print history and templates
  const [printHistory, setPrintHistory] = useState<PrintHistoryEntry[]>([]);
  const [labelTemplates, setLabelTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Status transition state
  const [transitionError, setTransitionError] = useState<string>('');

  // Printers state
  const [printers, setPrinters] = useState<ZebraPrinter[]>(loadPrinters());
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(loadLabelSettings());

  // New parcel form state
  const [newParcel, setNewParcel] = useState({
    senderName: '', senderPhone: '', senderAddress: '',
    receiverName: '', receiverPhone: '', receiverAddress: '',
    weight: 1, lengthCm: 30, widthCm: 20, heightCm: 15,
    format: 'm', serviceLevel: 'standard' as 'express' | 'standard' | 'economy',
    isInternational: true, carrier: '', insuranceAmount: 0, declaredValue: 0,
  });

  // Label printing state
  const [labelPreviewFormat, setLabelPreviewFormat] = useState<string>('4x6');
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(labelSettings.defaultPrinterId);
  const [labelCopies, setLabelCopies] = useState<number>(1);
  const [showZPLCode, setShowZPLCode] = useState(false);
  const [generatedZPL, setGeneratedZPL] = useState<string>('');
  const [zplCopied, setZplCopied] = useState(false);

  // Photo state
  const [proofPhotos, setProofPhotos] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load print history & templates on mount
  useEffect(() => {
    setPrintHistory(loadPrintHistory());
    setLabelTemplates(loadLabelTemplates());
  }, []);

  // Load photos when selected parcel changes
  useEffect(() => {
    if (selectedParcel) {
      setParcelPhotos(getPhotosForParcel(selectedParcel.id));
    }
  }, [selectedParcel]);

  // Evaluate business rules for a parcel
  const evaluateParcelRules = (parcel: typeof parcels[0]) => {
    const ctx: RuleContext = {
      data: {
        format: parcel.format,
        lengthCm: parseFloat(parcel.dimensions.split('x')[0]) || 30,
        widthCm: parseFloat(parcel.dimensions.split('x')[1]) || 20,
        heightCm: parseFloat(parcel.dimensions.split('x')[2]) || 15,
        weightKg: parcel.weight,
        isInternational: parcel.isInternational,
        carrier: parcel.carrier,
        declaredValue: parcel.price,
        status: parcel.status,
        proofPhoto: parcel.proofPhoto || proofPhotos[parcel.id],
        description: '',
        serviceLevel: 'standard',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
        copies: 1,
        printerStatus: 'online',
      },
      userRole: roleKey,
      module: 'parcels',
      action: 'update',
    };
    const summary = evaluateRules(ctx);
    setRuleSummary(summary);
    setRulesForParcel(parcel);
  };

  // Batch print handler
  const handleBatchPrint = () => {
    const ids = Array.from(selectedParcelIds);
    if (ids.length === 0) return;
    const job = createBatchJob({
      name: `Lot ${new Date().toLocaleString('fr-FR')}`,
      parcelIds: ids,
      labelFormatId: labelPreviewFormat,
      printerId: selectedPrinterId,
      copiesPerLabel: 1,
      createdBy: user?.name || 'Utilisateur',
    });
    setBatchProgress({ current: 0, total: ids.length, active: true });
    // Simulate progress
    let printed = 0;
    const interval = setInterval(() => {
      printed++;
      setBatchProgress(prev => ({ ...prev, current: printed }));
      updateBatchJobProgress(job.id, printed, 0, []);
      if (printed >= ids.length) {
        clearInterval(interval);
        setBatchProgress(prev => ({ ...prev, active: false }));
        setSelectedParcelIds(new Set());
        // Refresh print history
        setPrintHistory(loadPrintHistory());
      }
    }, 800);
  };

  // Handle enhanced photo upload
  const handleEnhancedPhotoUpload = (parcelId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const photo = addProofPhoto({
        parcelId,
        type: photoType,
        dataUrl,
        metadata: {
          capturedAt: new Date().toISOString(),
          fileSize: file.size,
          width: 800,
          height: 600,
          hash: generatePhotoHash(dataUrl),
        },
        capturedBy: user?.name || 'Utilisateur',
        comment: photoComment || undefined,
        verified: false,
      });
      setParcelPhotos(getPhotosForParcel(parcelId));
      setProofPhotos(prev => ({ ...prev, [parcelId]: dataUrl }));
      setPhotoComment('');
    };
    reader.readAsDataURL(file);
  };

  const filtered = parcelsList.filter(p => {
    const matchSearch = search === '' ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.senderName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      p.carrier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchFormat = formatFilter === 'all' || p.format === formatFilter;
    return matchSearch && matchStatus && matchFormat;
  });

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Calculate price for new parcel
  const priceBreakdown = useMemo(() => {
    return calculateParcelPrice({
      formatId: newParcel.format,
      weightKg: newParcel.weight,
      lengthCm: newParcel.lengthCm,
      widthCm: newParcel.widthCm,
      heightCm: newParcel.heightCm,
      isInternational: newParcel.isInternational,
      serviceLevel: newParcel.serviceLevel,
      insuranceAmount: newParcel.insuranceAmount,
    });
  }, [newParcel]);

  // Handle format selection for new parcel
  const handleFormatSelect = (formatId: string) => {
    const fmt = parcelFormats.find(f => f.id === formatId);
    if (fmt && formatId !== 'custom') {
      setNewParcel({
        ...newParcel,
        format: formatId,
        lengthCm: fmt.maxLength,
        widthCm: fmt.maxWidth,
        heightCm: fmt.maxHeight,
        weight: Math.min(newParcel.weight, fmt.maxWeight),
      });
    } else {
      setNewParcel({ ...newParcel, format: formatId });
    }
  };

  // Generate ZPL for a parcel
  const handleGenerateLabel = (parcel: typeof parcels[0]) => {
    const labelData: ZPLLabelData = {
      trackingNumber: parcel.trackingNumber,
      senderName: parcel.senderName,
      senderPhone: parcel.senderPhone,
      senderAddress: parcel.senderAddress,
      receiverName: parcel.receiverName,
      receiverPhone: parcel.receiverPhone,
      receiverAddress: parcel.receiverAddress,
      weight: parcel.weight,
      dimensions: parcel.dimensions,
      formatName: parcelFormats.find(f => f.id === parcel.format)?.name ?? parcel.format,
      carrier: parcel.carrier,
      price: parcel.price,
      barcode: parcel.barcode,
      qrData: `https://logisway.pro/track/${parcel.trackingNumber}`,
      date: new Date().toLocaleDateString('fr-FR'),
      companyName: 'LogisWay',
    };

    const printer = printers.find(p => p.id === selectedPrinterId);
    const dpi: PrinterDPI = printer?.dpi ?? 300;
    const zpl = generateZPL(labelData, labelPreviewFormat, dpi);
    setGeneratedZPL(zpl);
    setShowLabelDialog(true);
  };

  // Copy ZPL to clipboard
  const copyZPL = () => {
    navigator.clipboard.writeText(generatedZPL).then(() => {
      setZplCopied(true);
      setTimeout(() => setZplCopied(false), 2000);
    });
  };

  // Simulate printing
  const handlePrint = () => {
    const printer = printers.find(p => p.id === selectedPrinterId);
    if (printer) {
      const updatedPrinters = printers.map(p =>
        p.id === selectedPrinterId
          ? { ...p, labelsPrinted: p.labelsPrinted + labelCopies, status: 'printing' as const }
          : p
      );
      setPrinters(updatedPrinters);
      savePrinters(updatedPrinters);
      // Reset to idle after "printing"
      setTimeout(() => {
        setPrinters(prev => prev.map(p =>
          p.id === selectedPrinterId ? { ...p, status: 'idle' as const } : p
        ));
      }, 3000);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (parcelId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProofPhotos(prev => ({ ...prev, [parcelId]: result }));
    };
    reader.readAsDataURL(file);
  };

  // KPIs
  const kpis = [
    { title: 'Colis aujourd\'hui', value: parcelsList.length, icon: PackageCheck, color: 'from-violet-500 to-purple-600' },
    { title: 'En livraison', value: parcelsList.filter(p => p.status === 'out_for_delivery').length, icon: Truck, color: 'from-teal-500 to-teal-600' },
    { title: 'Livrés aujourd\'hui', value: parcelsList.filter(p => p.status === 'delivered').length, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { title: 'Retours', value: parcelsList.filter(p => p.status === 'returned').length, icon: RotateCcw, color: 'from-red-500 to-rose-600' },
    { title: 'Étiquettes imprimées', value: parcelsList.filter(p => p.labelPrinted).length, icon: Printer, color: 'from-blue-500 to-indigo-600' },
    { title: 'Avec preuve photo', value: parcelsList.filter(p => p.proofPhoto || proofPhotos[p.id]).length, icon: Camera, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-violet-500" />
            Colis & Courier
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des colis, étiquettes Zebra et preuves photo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowPrinterDialog(true)}>
            <Printer className="w-4 h-4 mr-1" />
            Imprimantes ({printers.filter(p => p.status === 'online' || p.status === 'idle').length})
          </Button>
          <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau colis
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, index) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{kpi.value}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="parcels" className="text-xs">Colis</TabsTrigger>
          <TabsTrigger value="labels" className="text-xs">Étiquettes Zebra</TabsTrigger>
          <TabsTrigger value="formats" className="text-xs">Formats & Prix</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs">Suivi & Retours</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs">Règles Métier</TabsTrigger>
        </TabsList>

        {/* ─── PARCELS TAB ─── */}
        <TabsContent value="parcels" className="space-y-4 mt-4">
          {/* Carrier Rate Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                Comparaison des tarifs transporteurs
              </CardTitle>
              <CardDescription>Tarifs indicatifs pour un colis de 5kg — Algérie vers France</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {carrierRates.map((carrier, index) => (
                  <motion.div
                    key={carrier.carrier}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-3 rounded-lg border-2 ${selectedCarrier === carrier.carrier ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-all`}
                    onClick={() => setSelectedCarrier(carrier.carrier)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: carrier.color }}>{carrier.logo}</div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{carrier.carrier}</p>
                      </div>
                      {selectedCarrier === carrier.carrier && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                    </div>
                    <div className="space-y-1.5">
                      {(['express', 'standard', 'economy'] as const).map(level => (
                        <div key={level} className="p-1.5 rounded bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{level === 'express' ? 'Express' : level === 'standard' ? 'Standard' : 'Éco'}</span>
                          <span className="text-[10px] font-bold text-gray-900 dark:text-white">{formatDZD(carrier[level].price)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Rechercher colis, expéditeur, destinataire..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="picked_up">Collecté</SelectItem>
                    <SelectItem value="in_warehouse">En entrepôt</SelectItem>
                    <SelectItem value="in_transit">En transit</SelectItem>
                    <SelectItem value="out_for_delivery">En livraison</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="returned">Retourné</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formatFilter} onValueChange={(v) => { setFormatFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous formats</SelectItem>
                    {parcelFormats.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name.split(' — ')[0]}</SelectItem>
                    ))}
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
                        <button onClick={() => {
                          if (selectedParcelIds.size === paged.length && paged.length > 0) {
                            setSelectedParcelIds(new Set());
                          } else {
                            setSelectedParcelIds(new Set(paged.map(p => p.id)));
                          }
                        }} className="p-0.5">
                          {selectedParcelIds.size === paged.length && paged.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-teal-500" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs">N° Suivi</TableHead>
                      <TableHead className="text-xs">Format</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Expéditeur</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Destinataire</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Transporteur</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Poids/Dim</TableHead>
                      <TableHead className="text-xs text-right">Prix</TableHead>
                      <TableHead className="text-xs text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((parcel) => {
                      const fmt = parcelFormats.find(f => f.id === parcel.format);
                      const isSelected = selectedParcelIds.has(parcel.id);
                      return (
                        <TableRow key={parcel.id} className={`cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/10 ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`} onClick={() => setSelectedParcel(parcel)}>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => {
                              const next = new Set(selectedParcelIds);
                              if (next.has(parcel.id)) next.delete(parcel.id); else next.add(parcel.id);
                              setSelectedParcelIds(next);
                            }} className="p-0.5">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-teal-500" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] font-semibold">{parcel.trackingNumber}</TableCell>
                          <TableCell>
                            <Badge className={`text-[9px] bg-gradient-to-r ${formatColorMap[parcel.format] ?? 'from-gray-400 to-gray-600'} text-white border-0 px-1.5 py-0.5`}>
                              {parcel.format.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">{parcel.senderName}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">{parcel.receiverName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0.5 ${parcelStatusColors[parcel.status]}`}>
                              {parcelStatusLabels[parcel.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">{parcel.carrier}</TableCell>
                          <TableCell className="text-[10px] text-gray-500 hidden lg:table-cell">
                            {parcel.weight}kg / {parcel.dimensions}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatDZD(parcel.price)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                title="Imprimer étiquette"
                                onClick={() => handleGenerateLabel(parcel)}
                              >
                                <Printer className="w-3 h-3 text-teal-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                title="Photo de preuve"
                                onClick={() => {
                                  setSelectedParcel(parcel);
                                  setShowPhotoDialog(true);
                                }}
                              >
                                <Camera className={`w-3 h-3 ${parcel.proofPhoto || proofPhotos[parcel.id] ? 'text-green-500' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">{filtered.length} colis trouvé(s)</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Préc.</Button>
                  <span className="text-xs text-gray-500">{page + 1}/{totalPages || 1}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Suiv.</Button>
                </div>
              </div>
              {/* Batch print floating button */}
              {selectedParcelIds.size > 0 && !batchProgress.active && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                    <Button
                      className="text-white shadow-lg shadow-teal-500/30 h-12 px-6 text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                      onClick={handleBatchPrint}
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Imprimer {selectedParcelIds.size} étiquette{selectedParcelIds.size > 1 ? 's' : ''}
                    </Button>
                  </motion.div>
                </div>
              )}
              {batchProgress.active && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border p-4 min-w-[300px]">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Impression en cours... {batchProgress.current}/{batchProgress.total}
                  </p>
                  <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="labels" className="space-y-4 mt-4">
          {/* Label Formats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-violet-500" />
                Formats d&apos;étiquettes autocollantes
              </CardTitle>
              <CardDescription>Formats compatibles imprimantes Zebra et équivalentes</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {labelFormats.map((format, index) => (
                  <motion.div
                    key={format.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      labelPreviewFormat === format.id
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                    onClick={() => setLabelPreviewFormat(format.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${format.zebraStandard ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                        {format.zebraStandard ? <Printer className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{format.name}</p>
                        <div className="flex items-center gap-1">
                          {format.zebraStandard && (
                            <Badge className="text-[7px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-1 py-0">Zebra</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Ruler className="w-3 h-3" />
                        <span>{format.widthMm} x {format.heightMm} mm</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Layers className="w-3 h-3" />
                        <span>{format.paperType}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">{format.usage}</p>
                    </div>
                    {labelPreviewFormat === format.id && (
                      <div className="mt-2 pt-2 border-t border-teal-200 dark:border-teal-800">
                        <p className="text-[9px] text-teal-600 dark:text-teal-400 font-medium">Format sélectionné</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Label Preview & ZPL */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-500" />
                Aperçu étiquette & code ZPL
              </CardTitle>
              <CardDescription>Prévisualisez l&apos;étiquette et générez le code ZPL pour votre imprimante Zebra</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Printer selection */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Imprimante</Label>
                    <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {printers.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusDotColors[p.status]}`} />
                              {p.name} ({p.dpi} DPI)
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Nombre de copies</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={20} value={labelCopies} onChange={(e) => setLabelCopies(parseInt(e.target.value) || 1)} className="w-20 h-9" />
                      <span className="text-xs text-gray-500">copies</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Colis</Label>
                    <Select onValueChange={(v) => {
                      const parcel = parcelsList.find(p => p.id === v);
                      if (parcel) handleGenerateLabel(parcel);
                    }}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner un colis..." /></SelectTrigger>
                      <SelectContent>
                        {parcelsList.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.trackingNumber} — {p.receiverName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick print for pending labels */}
                  <div className="space-y-2 mt-4">
                    <Label className="text-xs text-gray-500">Colis sans étiquette imprimée</Label>
                    <div className="space-y-2">
                      {parcelsList.filter(p => !p.labelPrinted).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{p.trackingNumber}</span>
                          </div>
                          <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => handleGenerateLabel(p)}>
                            <Printer className="w-3 h-3 mr-1" />
                            Imprimer
                          </Button>
                        </div>
                      ))}
                      {parcelsList.filter(p => !p.labelPrinted).length === 0 && (
                        <p className="text-xs text-gray-400">Toutes les étiquettes ont été imprimées</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ZPL Code display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Code ZPL généré</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowZPLCode(!showZPLCode)}>
                        {showZPLCode ? 'Masquer' : 'Afficher'} ZPL
                      </Button>
                      {generatedZPL && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={copyZPL}>
                          {zplCopied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          {zplCopied ? 'Copié!' : 'Copier'}
                        </Button>
                      )}
                    </div>
                  </div>
                  {showZPLCode && generatedZPL ? (
                    <Textarea
                      readOnly
                      value={generatedZPL}
                      className="font-mono text-[10px] h-48 bg-gray-50 dark:bg-gray-900"
                    />
                  ) : showZPLCode ? (
                    <div className="flex items-center justify-center h-48 rounded border border-dashed border-gray-300 dark:border-gray-700">
                      <p className="text-xs text-gray-400">Sélectionnez un colis pour générer le ZPL</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 rounded border border-dashed border-gray-300 dark:border-gray-700">
                      <div className="text-center">
                        <Printer className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Le code ZPL sera affiché ici</p>
                      </div>
                    </div>
                  )}

                  {generatedZPL && (
                    <div className="flex items-center gap-2">
                      <Button className="flex-1 text-white h-9" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-1" />
                        Envoyer à l&apos;imprimante
                      </Button>
                      <Button variant="outline" className="h-9" onClick={() => {
                        const blob = new Blob([generatedZPL], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `label-${labelPreviewFormat}.zpl`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Printers Overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Printer className="w-5 h-5 text-teal-500" />
                    Imprimantes Zebra configurées
                  </CardTitle>
                  <CardDescription>Statut et configuration des imprimantes</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowPrinterDialog(true)}>
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Configurer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {printers.map(printer => {
                  const ConnectionIcon = printer.connection === 'network' ? Wifi : printer.connection === 'usb' ? Usb : Bluetooth;
                  return (
                    <div key={printer.id} className={`p-3 rounded-lg border-2 transition-all ${
                      printer.isDefault ? 'border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10' : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Printer className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-950 ${statusDotColors[printer.status]}`} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{printer.name}</p>
                            <p className="text-[9px] text-gray-400">{printer.model}</p>
                          </div>
                        </div>
                        {printer.isDefault && (
                          <Badge className="text-[8px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-1 py-0">Défaut</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <ConnectionIcon className="w-3 h-3" />
                            <span>{printer.connection === 'network' ? printer.ipAddress : printer.usbPort}</span>
                          </div>
                          <Badge className={`text-[9px] px-1.5 py-0 ${statusColors[printer.status]}`}>
                            {statusLabels[printer.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{printer.dpi} DPI | Noircir: {printer.darkness} | Vitesse: {printer.speed}&quot;/s</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Papier: {printer.mediaType}</span>
                          <span>{printer.labelsPrinted} étiquettes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Print History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-teal-500" />
                Historique d&apos;impression
              </CardTitle>
              <CardDescription>Dernières impressions réalisées</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {printHistory.length > 0 ? printHistory.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Printer className="w-3.5 h-3.5 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{entry.trackingNumber}</p>
                        <p className="text-[10px] text-gray-400">{entry.labelFormatName} — {entry.printerName} — {entry.copies} copie(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[8px] ${entry.result === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {entry.result === 'success' ? 'Succès' : 'Échoué'}
                      </Badge>
                      <span className="text-[9px] text-gray-400">{new Date(entry.printedAt).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 text-center py-4">Aucun historique d&apos;impression</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Label Templates */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-violet-500" />
                Modèles d&apos;étiquettes
              </CardTitle>
              <CardDescription>Modèles personnalisables pour vos étiquettes</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {labelTemplates.map(tpl => (
                  <div key={tpl.id} className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTemplate === tpl.id ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                  }`} onClick={() => setSelectedTemplate(tpl.id)}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: tpl.colors.header }}>
                        <LayoutTemplate className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{tpl.name}</p>
                        <Badge className="text-[7px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-1 py-0">{tpl.type}</Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500">{tpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tpl.compatibleFormats.map(f => (
                        <span key={f} className="text-[8px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FORMATS & PRICING TAB ─── */}
        <TabsContent value="formats" className="space-y-4 mt-4">
          {/* Parcel Format Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BoxSelect className="w-5 h-5 text-violet-500" />
                Catégories de formats colis
              </CardTitle>
              <CardDescription>Formats de colis avec poids, dimensions maximales et tarifs associés</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {parcelFormats.map((fmt, index) => (
                  <motion.div
                    key={fmt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${fmt.color} flex items-center justify-center`}>
                        <PackageCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmt.name.split(' — ')[0]}</p>
                        <p className="text-[10px] text-gray-400">{fmt.name.split(' — ')[1]}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Weight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">Max {fmt.maxWeight} kg</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Ruler className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{fmt.maxLength} x {fmt.maxWidth} x {fmt.maxHeight} cm</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">Étiquette: {labelFormats.find(l => l.id === fmt.suggestedLabelFormat)?.name ?? fmt.suggestedLabelFormat}</span>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">National</span>
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{formatPrice(fmt.basePriceDomestic)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">International</span>
                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{formatPrice(fmt.basePriceInternational)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Suppl. /kg</span>
                        <span className="text-[10px] text-gray-500">{formatPrice(fmt.pricePerKg)}</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-gray-400 mt-2">{fmt.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Calculator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-500" />
                Calculateur de prix
              </CardTitle>
              <CardDescription>Estimez le prix d&apos;expédition en fonction du format, poids et service</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Format du colis</Label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {parcelFormats.map(fmt => (
                        <button
                          key={fmt.id}
                          onClick={() => handleFormatSelect(fmt.id)}
                          className={`p-1.5 rounded border text-center transition-all ${
                            newParcel.format === fmt.id
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                          }`}
                        >
                          <span className="text-[10px] font-semibold text-gray-900 dark:text-white">{fmt.id.toUpperCase()}</span>
                          <p className="text-[8px] text-gray-400">{fmt.maxWeight}kg</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Poids (kg)</Label>
                      <Input type="number" min={0.1} step={0.1} value={newParcel.weight} onChange={e => setNewParcel({ ...newParcel, weight: parseFloat(e.target.value) || 0 })} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Service</Label>
                      <Select value={newParcel.serviceLevel} onValueChange={v => setNewParcel({ ...newParcel, serviceLevel: v as 'express' | 'standard' | 'economy' })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="express">Express (x1.6)</SelectItem>
                          <SelectItem value="standard">Standard (x1.0)</SelectItem>
                          <SelectItem value="economy">Économique (x0.7)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Longueur (cm)</Label>
                      <Input type="number" value={newParcel.lengthCm} onChange={e => setNewParcel({ ...newParcel, lengthCm: parseInt(e.target.value) || 0 })} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Largeur (cm)</Label>
                      <Input type="number" value={newParcel.widthCm} onChange={e => setNewParcel({ ...newParcel, widthCm: parseInt(e.target.value) || 0 })} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hauteur (cm)</Label>
                      <Input type="number" value={newParcel.heightCm} onChange={e => setNewParcel({ ...newParcel, heightCm: parseInt(e.target.value) || 0 })} className="h-9" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Destination</Label>
                      <Select value={newParcel.isInternational ? 'international' : 'domestic'} onValueChange={v => setNewParcel({ ...newParcel, isInternational: v === 'international' })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domestic"><span className="flex items-center gap-1"><Home className="w-3 h-3" /> National</span></SelectItem>
                          <SelectItem value="international"><span className="flex items-center gap-1"><Globe className="w-3 h-3" /> International</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Assurance (DZD)</Label>
                      <Input type="number" min={0} step={5000} value={newParcel.insuranceAmount} onChange={e => setNewParcel({ ...newParcel, insuranceAmount: parseInt(e.target.value) || 0 })} className="h-9" />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prix total estimé</p>
                    <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">{formatPrice(priceBreakdown.totalPrice)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {newParcel.isInternational ? 'International' : 'National'} — {serviceLevelLabels[newParcel.serviceLevel]}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-xs text-gray-500">Prix de base</span>
                      <span className="text-xs font-medium">{formatPrice(priceBreakdown.basePrice)}</span>
                    </div>
                    {priceBreakdown.weightSurcharge > 0 && (
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-xs text-gray-500">Supplément poids</span>
                        <span className="text-xs font-medium text-amber-600">+{formatPrice(priceBreakdown.weightSurcharge)}</span>
                      </div>
                    )}
                    {priceBreakdown.volumeSurcharge > 0 && (
                      <div className="flex items-center justify-between p-2 rounded bg-amber-50 dark:bg-amber-900/10">
                        <span className="text-xs text-amber-600">Supplément volume (dépassement)</span>
                        <span className="text-xs font-medium text-amber-600">+{formatPrice(priceBreakdown.volumeSurcharge)}</span>
                      </div>
                    )}
                    {priceBreakdown.servicePrice !== 0 && (
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-xs text-gray-500">Service ({serviceLevelLabels[newParcel.serviceLevel]})</span>
                        <span className={`text-xs font-medium ${priceBreakdown.servicePrice > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          {priceBreakdown.servicePrice > 0 ? '+' : ''}{formatPrice(priceBreakdown.servicePrice)}
                        </span>
                      </div>
                    )}
                    {priceBreakdown.insurancePrice > 0 && (
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-xs text-gray-500">Assurance (2%)</span>
                        <span className="text-xs font-medium text-blue-600">+{formatPrice(priceBreakdown.insurancePrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Volume check */}
                  {(() => {
                    const vol = newParcel.lengthCm * newParcel.widthCm * newParcel.heightCm;
                    const fmt = parcelFormats.find(f => f.id === newParcel.format);
                    const maxVol = (fmt?.maxLength ?? 40) * (fmt?.maxWidth ?? 30) * (fmt?.maxHeight ?? 25);
                    const isOver = vol > maxVol;
                    return isOver ? (
                      <div className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">Le volume dépasse les dimensions du format {newParcel.format.toUpperCase()}. Un supplément de 15% sera appliqué.</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TRACKING & RETURNS TAB ─── */}
        <TabsContent value="tracking" className="space-y-4 mt-4">
          {/* Last-Mile Tracking */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                Suivi dernier kilomètre
              </CardTitle>
              <CardDescription>Livraisons en cours vers les destinataires</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {lastMileTracking.map((delivery, index) => (
                  <motion.div
                    key={delivery.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{delivery.trackingNumber}</p>
                        <p className="text-[10px] text-gray-400">{delivery.distance} restants</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
                          {delivery.courier.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{delivery.courier}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        ETA: {delivery.estimatedArrival}
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${parcelStatusColors[delivery.status]}`}>En livraison</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Return Management */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-500" />
                Gestion des retours
              </CardTitle>
              <CardDescription>Demandes de retour et remboursements</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Suivi</TableHead>
                      <TableHead className="text-xs">Motif</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Date demande</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Transporteur retour</TableHead>
                      <TableHead className="text-xs text-right">Remboursement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                        <TableCell className="font-mono text-xs font-semibold">{record.trackingNumber}</TableCell>
                        <TableCell className="text-xs">{record.reason}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{formatDate(record.requestDate)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${returnStatusColors[record.status]}`}>
                            {returnStatusLabels[record.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{record.returnCarrier}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatDZD(record.refundAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Proof Photos Grid */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-violet-500" />
                Preuves photo
              </CardTitle>
              <CardDescription>Photos de preuve pour chaque colis (dépot et livraison)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {parcelsList.map(parcel => {
                  const hasPhoto = parcel.proofPhoto || proofPhotos[parcel.id];
                  return (
                    <div
                      key={parcel.id}
                      className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        hasPhoto
                          ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
                      }`}
                      onClick={() => {
                        setSelectedParcel(parcel);
                        setShowPhotoDialog(true);
                      }}
                    >
                      <div className="aspect-square rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2 overflow-hidden">
                        {proofPhotos[parcel.id] ? (
                          <img src={proofPhotos[parcel.id]} alt="Preuve" className="w-full h-full object-cover" />
                        ) : hasPhoto ? (
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-green-400 mx-auto" />
                            <p className="text-[8px] text-green-500 mt-1">Photo enregistrée</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto" />
                            <p className="text-[8px] text-gray-400 mt-1">Ajouter</p>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300 truncate">{parcel.trackingNumber}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="secondary" className={`text-[8px] px-1 py-0 ${parcelStatusColors[parcel.status]}`}>
                          {parcelStatusLabels[parcel.status]}
                        </Badge>
                        {parcel.deliveryProofPhoto && (
                          <Badge className="text-[7px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1 py-0">Livré</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── BUSINESS RULES TAB ─── */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-500" />
                Évaluation des règles métier
              </CardTitle>
              <CardDescription>Sélectionnez un colis pour évaluer les règles métier applicables</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div className="flex items-center gap-3">
                <Select onValueChange={(v) => {
                  const parcel = parcelsList.find(p => p.id === v);
                  if (parcel) evaluateParcelRules(parcel);
                }}>
                  <SelectTrigger className="h-9 w-64"><SelectValue placeholder="Sélectionner un colis..." /></SelectTrigger>
                  <SelectContent>
                    {parcelsList.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.trackingNumber} — {p.receiverName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {ruleSummary && rulesForParcel && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <p className="text-[10px] text-green-600 dark:text-green-400">Réussies</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">{ruleSummary.passed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                      <p className="text-[10px] text-red-600 dark:text-red-400">Échouées</p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-300">{ruleSummary.failed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">Critiques</p>
                      <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{ruleSummary.critical}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
                      <p className="text-[10px] text-sky-600 dark:text-sky-400">Peut continuer</p>
                      <p className="text-xl font-bold text-sky-700 dark:text-sky-300">{ruleSummary.canProceed ? 'Oui' : 'Non'}</p>
                    </div>
                  </div>

                  {/* Rule results */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ruleSummary.results.map((result, idx) => {
                      const rule = allBusinessRules.find(r => r.id === result.ruleId);
                      return (
                        <div key={result.ruleId} className={`p-3 rounded-lg border ${
                          result.passed ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/5' :
                          result.severity === 'critical' ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' :
                          'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/5'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {result.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : result.severity === 'critical' ? (
                                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                )}
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">{rule?.name || result.ruleId}</p>
                                <Badge className={`text-[8px] ${
                                  result.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  result.severity === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {result.severity === 'critical' ? 'Critique' : result.severity === 'warning' ? 'Avertissement' : 'Info'}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">{result.message}</p>
                              {result.suggestions && result.suggestions.length > 0 && (
                                <div className="mt-1.5 space-y-0.5">
                                  {result.suggestions.map((s, i) => (
                                    <p key={i} className="text-[10px] text-gray-500 dark:text-gray-500">• {s}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            {!result.passed && roleKey === 'admin' && (
                              <Button variant="outline" size="sm" className="h-6 text-[9px] flex-shrink-0" onClick={() => {
                                addAuditEntry({
                                  userId: user?.id || '1',
                                  userName: user?.name || 'Admin',
                                  userRole: 'admin',
                                  action: 'rule_override',
                                  module: 'parcels',
                                  entityId: rulesForParcel.id,
                                  entityType: 'parcel',
                                  details: `Contournement de la règle ${result.ruleId} pour ${rulesForParcel.trackingNumber}`,
                                  result: 'success',
                                  severity: 'critical',
                                });
                              }}>
                                Contourner
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Status Transitions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-teal-500" />
                Transitions de statut
              </CardTitle>
              <CardDescription>Transitions autorisées selon votre rôle</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {parcelsList.slice(0, 5).map(parcel => {
                  const transitions = getAvailableTransitions(parcel.status, roleKey);
                  return (
                    <div key={parcel.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 w-36">{parcel.trackingNumber}</span>
                      <Badge variant="secondary" className={`text-[9px] ${parcelStatusColors[parcel.status]}`}>
                        {parcelStatusLabels[parcel.status]}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {transitions.length > 0 ? transitions.map(t => (
                          <Badge key={t.to} className="text-[8px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 cursor-pointer hover:bg-teal-200 dark:hover:bg-teal-900/50">
                            {parcelStatusLabels[t.to as keyof typeof parcelStatusLabels] || t.to}
                            {t.requiresPhoto && ' 📷'}
                            {t.requiresApproval && ' ✋'}
                          </Badge>
                        )) : (
                          <span className="text-[10px] text-gray-400">Aucune transition</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {transitionError && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">{transitionError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={!!selectedParcel && !showPhotoDialog} onOpenChange={() => setSelectedParcel(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedParcel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-violet-500" />
                  {selectedParcel.trackingNumber}
                </DialogTitle>
                <DialogDescription>Détails du colis</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status & Format */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Statut</Label>
                    <p><Badge variant="secondary" className={`text-[10px] ${parcelStatusColors[selectedParcel.status]}`}>{parcelStatusLabels[selectedParcel.status]}</Badge></p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Format</Label>
                    <p><Badge className={`text-[10px] bg-gradient-to-r ${formatColorMap[selectedParcel.format] ?? 'from-gray-400 to-gray-600'} text-white border-0`}>{selectedParcel.format.toUpperCase()}</Badge></p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Service</Label>
                    <p><Badge className={`text-[10px] ${serviceLevelColors[selectedParcel.serviceLevel]}`}>{serviceLevelLabels[selectedParcel.serviceLevel]}</Badge></p>
                  </div>
                </div>

                <Separator />

                {/* Sender / Receiver */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Expéditeur</Label>
                    <p className="text-sm font-medium">{selectedParcel.senderName}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.senderPhone}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.senderAddress}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Destinataire</Label>
                    <p className="text-sm font-medium">{selectedParcel.receiverName}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.receiverPhone}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.receiverAddress}</p>
                  </div>
                </div>

                <Separator />

                {/* Physical details */}
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    Caractéristiques physiques
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Poids</p>
                      <p className="text-sm font-semibold">{selectedParcel.weight} kg</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Dimensions</p>
                      <p className="text-sm font-semibold">{selectedParcel.dimensions} cm</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Volume</p>
                      <p className="text-sm font-semibold">{(selectedParcel.lengthCm * selectedParcel.widthCm * selectedParcel.heightCm / 1000).toFixed(1)} L</p>
                    </div>
                    <div className="p-2 rounded bg-teal-50 dark:bg-teal-900/10">
                      <p className="text-[10px] text-gray-400">Prix</p>
                      <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{formatDZD(selectedParcel.price)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Label & Printing */}
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <Printer className="w-3 h-3" />
                    Étiquette & Impression
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Format étiquette</p>
                      <p className="text-xs font-semibold">{labelFormats.find(l => l.id === selectedParcel.labelFormatId)?.name ?? '-'}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Imprimée</p>
                      <p className="text-xs font-semibold flex items-center gap-1">
                        {selectedParcel.labelPrinted ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-400" />}
                        {selectedParcel.labelPrinted ? `Oui (${selectedParcel.labelCopies}x)` : 'Non'}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Barcode</p>
                      <p className="text-xs font-mono font-semibold">{selectedParcel.barcode}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Transporteur</p>
                      <p className="text-xs font-semibold">{selectedParcel.carrier}</p>
                    </div>
                  </div>
                  {selectedParcel.labelPrintedAt && (
                    <p className="text-[10px] text-gray-400 mt-1">Imprimée le: {new Date(selectedParcel.labelPrintedAt).toLocaleString('fr-FR')}</p>
                  )}
                </div>

                <Separator />

                {/* Insurance & Value */}
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Assurance & Valeur
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Valeur déclarée</p>
                      <p className="text-xs font-semibold">{formatDZD(selectedParcel.declaredValue)}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Assurance</p>
                      <p className="text-xs font-semibold">{selectedParcel.insuranceAmount > 0 ? formatDZD(selectedParcel.insuranceAmount) : 'Non assurée'}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400">Destination</p>
                      <p className="text-xs font-semibold">{selectedParcel.isInternational ? 'International' : 'National'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Proof Photos in detail */}
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    Preuves photo
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] text-gray-400 mb-2">Photo du colis (dépôt)</p>
                      {proofPhotos[selectedParcel.id] ? (
                        <img src={proofPhotos[selectedParcel.id]} alt="Preuve colis" className="w-full h-24 object-cover rounded" />
                      ) : selectedParcel.proofPhoto ? (
                        <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-green-400 mx-auto" />
                            <p className="text-[9px] text-green-500 mt-1">Photo enregistrée</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gray-50 dark:bg-gray-800/50 rounded flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <Camera className="w-5 h-5 text-gray-300 mx-auto" />
                            <p className="text-[9px] text-gray-400 mt-1">Pas de photo</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] text-gray-400 mb-2">Photo de livraison (POD)</p>
                      {selectedParcel.deliveryProofPhoto ? (
                        <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <div className="text-center">
                            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
                            <p className="text-[9px] text-green-500 mt-1">Preuve de livraison</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gray-50 dark:bg-gray-800/50 rounded flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <Camera className="w-5 h-5 text-gray-300 mx-auto" />
                            <p className="text-[9px] text-gray-400 mt-1">En attente</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button className="flex-1 text-white h-9" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => handleGenerateLabel(selectedParcel)}>
                    <Printer className="w-4 h-4 mr-1" />
                    Imprimer étiquette
                  </Button>
                  <Button variant="outline" className="h-9" onClick={() => {
                    setShowPhotoDialog(true);
                  }}>
                    <Camera className="w-4 h-4 mr-1" />
                    Photo
                  </Button>
                </div>

                {/* Tracking Timeline */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Suivi</Label>
                  <div className="mt-2 space-y-3">
                    {[
                      { label: 'Colis collecté', done: true },
                      { label: 'En entrepôt', done: ['in_warehouse', 'in_transit', 'out_for_delivery', 'delivered'].includes(selectedParcel.status) },
                      { label: 'En transit', done: ['in_transit', 'out_for_delivery', 'delivered'].includes(selectedParcel.status) },
                      { label: 'En livraison', done: ['out_for_delivery', 'delivered'].includes(selectedParcel.status) },
                      { label: 'Livré', done: selectedParcel.status === 'delivered' },
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.done ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {step.done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-gray-400" />}
                        </div>
                        <span className={`text-xs ${step.done ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── LABEL PRINTING DIALOG ─── */}
      <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-teal-500" />
              Impression étiquette
            </DialogTitle>
            <DialogDescription>Configurez et imprimez l&apos;étiquette d&apos;expédition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Format & Printer Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Format étiquette</Label>
                <Select value={labelPreviewFormat} onValueChange={setLabelPreviewFormat}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {labelFormats.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Imprimante</Label>
                <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {printers.filter(p => p.status !== 'offline' && p.status !== 'error').map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusDotColors[p.status]}`} />
                          {p.name} — {p.dpi} DPI
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Copies</Label>
                <Input type="number" min={1} max={20} value={labelCopies} onChange={e => setLabelCopies(parseInt(e.target.value) || 1)} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Noircir (darkness)</Label>
                <Input type="number" min={1} max={30} value={printers.find(p => p.id === selectedPrinterId)?.darkness ?? 15} className="h-9" disabled />
              </div>
            </div>

            {/* ZPL Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Code ZPL</Label>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={copyZPL}>
                    {zplCopied ? <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {zplCopied ? 'Copié' : 'Copier'}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowZPLCode(!showZPLCode)}>
                    {showZPLCode ? 'Masquer' : 'Afficher'}
                  </Button>
                </div>
              </div>
              {showZPLCode && generatedZPL && (
                <Textarea readOnly value={generatedZPL} className="font-mono text-[9px] h-32 bg-gray-50 dark:bg-gray-900" />
              )}
            </div>

            {/* Print / Download */}
            <div className="flex items-center gap-2">
              <Button className="flex-1 text-white h-10" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Envoyer à l&apos;imprimante ({labelCopies}x)
              </Button>
              <Button variant="outline" className="h-10" onClick={() => {
                const blob = new Blob([generatedZPL], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `label-${labelPreviewFormat}.zpl`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-1" />
                .ZPL
              </Button>
              <Button variant="outline" className="h-10" onClick={() => setShowLabelDialog(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── PHOTO PROOF DIALOG ─── */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedParcel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-violet-500" />
                  Preuves photo — {selectedParcel.trackingNumber}
                </DialogTitle>
                <DialogDescription>Ajoutez des photos avec type et commentaire</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Photo Type Selection */}
                <div className="space-y-2">
                  <Label className="text-xs">Type de photo</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['pickup', 'warehouse', 'transit', 'delivery', 'damage', 'return'] as const).map(t => (
                      <button key={t} onClick={() => setPhotoType(t)} className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        photoType === t
                          ? 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {photoTypeLabels[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label className="text-xs">Commentaire</Label>
                  <Input placeholder="Ajouter un commentaire..." value={photoComment} onChange={(e) => setPhotoComment(e.target.value)} className="h-8 text-xs" />
                </div>

                {/* Upload buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1 h-9" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-1" />
                    Prendre une photo
                  </Button>
                  <Button variant="outline" className="flex-1 h-9" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Charger une image
                  </Button>
                </div>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEnhancedPhotoUpload(selectedParcel.id, file);
                }} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEnhancedPhotoUpload(selectedParcel.id, file);
                }} />

                {/* Photo Gallery */}
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1.5">
                    <GalleryHorizontalEnd className="w-3.5 h-3.5" />
                    Galerie ({parcelPhotos.length} photo{parcelPhotos.length > 1 ? 's' : ''})
                  </Label>
                  {parcelPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {parcelPhotos.map(photo => (
                        <div key={photo.id} className="relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <img src={photo.dataUrl} alt={photoTypeLabels[photo.type]} className="w-full h-24 object-cover" />
                          <div className="p-1.5">
                            <div className="flex items-center gap-1">
                              <Badge className={`text-[7px] px-1 py-0 ${photoTypeColors[photo.type]}`}>
                                {photoTypeLabels[photo.type]}
                              </Badge>
                              {photo.verified && (
                                <Verified className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                            <p className="text-[9px] text-gray-400 mt-0.5">{new Date(photo.metadata.capturedAt).toLocaleString('fr-FR')}</p>
                            {photo.comment && <p className="text-[9px] text-gray-500 truncate">{photo.comment}</p>}
                            <div className="flex items-center gap-1 mt-1">
                              {roleKey === 'admin' && !photo.verified && (
                                <Button variant="ghost" size="sm" className="h-5 text-[8px] p-0 text-green-600" onClick={() => {
                                  verifyProofPhoto(photo.id, user?.name || 'Admin');
                                  setParcelPhotos(getPhotosForParcel(selectedParcel.id));
                                }}>
                                  <Verified className="w-3 h-3 mr-0.5" /> Vérifier
                                </Button>
                              )}
                              <span className="text-[8px] text-gray-400">{photo.capturedBy}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Camera className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Aucune photo pour ce colis</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── ADD PARCEL DIALOG ─── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-500" />
              Nouveau colis
            </DialogTitle>
            <DialogDescription>Enregistrer un nouveau colis avec calcul automatique du prix</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Format du colis</Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {parcelFormats.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => handleFormatSelect(fmt.id)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      newParcel.format === fmt.id
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${fmt.color} flex items-center justify-center mx-auto mb-1`}>
                      <PackageCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-900 dark:text-white block">{fmt.id.toUpperCase()}</span>
                    <span className="text-[8px] text-gray-400">{fmt.maxWeight}kg</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sender / Receiver */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Expéditeur</Label>
                <Input placeholder="Nom" className="h-9" value={newParcel.senderName} onChange={e => setNewParcel({ ...newParcel, senderName: e.target.value })} />
                <Input placeholder="Téléphone" className="h-9" value={newParcel.senderPhone} onChange={e => setNewParcel({ ...newParcel, senderPhone: e.target.value })} />
                <Input placeholder="Adresse" className="h-9" value={newParcel.senderAddress} onChange={e => setNewParcel({ ...newParcel, senderAddress: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destinataire</Label>
                <Input placeholder="Nom" className="h-9" value={newParcel.receiverName} onChange={e => setNewParcel({ ...newParcel, receiverName: e.target.value })} />
                <Input placeholder="Téléphone" className="h-9" value={newParcel.receiverPhone} onChange={e => setNewParcel({ ...newParcel, receiverPhone: e.target.value })} />
                <Input placeholder="Adresse" className="h-9" value={newParcel.receiverAddress} onChange={e => setNewParcel({ ...newParcel, receiverAddress: e.target.value })} />
              </div>
            </div>

            <Separator />

            {/* Physical Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1"><Weight className="w-3 h-3" /> Poids (kg)</Label>
                <Input type="number" min={0.1} step={0.1} value={newParcel.weight} onChange={e => setNewParcel({ ...newParcel, weight: parseFloat(e.target.value) || 0 })} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Longueur (cm)</Label>
                <Input type="number" value={newParcel.lengthCm} onChange={e => setNewParcel({ ...newParcel, lengthCm: parseInt(e.target.value) || 0 })} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Largeur (cm)</Label>
                <Input type="number" value={newParcel.widthCm} onChange={e => setNewParcel({ ...newParcel, widthCm: parseInt(e.target.value) || 0 })} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hauteur (cm)</Label>
                <Input type="number" value={newParcel.heightCm} onChange={e => setNewParcel({ ...newParcel, heightCm: parseInt(e.target.value) || 0 })} className="h-9" />
              </div>
            </div>

            <Separator />

            {/* Service & Destination */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Service</Label>
                <Select value={newParcel.serviceLevel} onValueChange={v => setNewParcel({ ...newParcel, serviceLevel: v as 'express' | 'standard' | 'economy' })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="express"><span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Express</span></SelectItem>
                    <SelectItem value="standard"><span className="flex items-center gap-1"><Send className="w-3 h-3" /> Standard</span></SelectItem>
                    <SelectItem value="economy"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Économique</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Destination</Label>
                <Select value={newParcel.isInternational ? 'international' : 'domestic'} onValueChange={v => setNewParcel({ ...newParcel, isInternational: v === 'international' })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Transporteur</Label>
                <Select value={newParcel.carrier} onValueChange={v => setNewParcel({ ...newParcel, carrier: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DHL Express">DHL Express</SelectItem>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="Aramex">Aramex</SelectItem>
                    <SelectItem value="EMS Algérie">EMS Algérie</SelectItem>
                    <SelectItem value="Yalidine">Yalidine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Valeur déclarée (DZD)</Label>
                <Input type="number" min={0} step={5000} value={newParcel.declaredValue} onChange={e => setNewParcel({ ...newParcel, declaredValue: parseInt(e.target.value) || 0 })} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Assurance (DZD)</Label>
                <Input type="number" min={0} step={5000} value={newParcel.insuranceAmount} onChange={e => setNewParcel({ ...newParcel, insuranceAmount: parseInt(e.target.value) || 0 })} className="h-9" />
              </div>
            </div>

            <Separator />

            {/* Price Preview */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prix calculé</span>
                <span className="text-xl font-bold text-teal-700 dark:text-teal-400">{formatPrice(priceBreakdown.totalPrice)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Base ({newParcel.isInternational ? 'International' : 'National'})</span>
                  <span>{formatPrice(priceBreakdown.basePrice)}</span>
                </div>
                {priceBreakdown.weightSurcharge > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Supplément poids</span>
                    <span>+{formatPrice(priceBreakdown.weightSurcharge)}</span>
                  </div>
                )}
                {priceBreakdown.servicePrice !== 0 && (
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Service {serviceLevelLabels[newParcel.serviceLevel]}</span>
                    <span>{priceBreakdown.servicePrice > 0 ? '+' : ''}{formatPrice(priceBreakdown.servicePrice)}</span>
                  </div>
                )}
                {priceBreakdown.insurancePrice > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Assurance (2%)</span>
                    <span>+{formatPrice(priceBreakdown.insurancePrice)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleAddParcel}>
                <PackageCheck className="w-4 h-4 mr-1" />
                Enregistrer — {formatPrice(priceBreakdown.totalPrice)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── PRINTER CONFIGURATION DIALOG ─── */}
      <Dialog open={showPrinterDialog} onOpenChange={setShowPrinterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-teal-500" />
              Configuration des imprimantes Zebra
            </DialogTitle>
            <DialogDescription>Gérez vos imprimantes d&apos;étiquettes et paramètres d&apos;impression</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {printers.map(printer => {
              const ConnectionIcon = printer.connection === 'network' ? Wifi : printer.connection === 'usb' ? Usb : Bluetooth;
              return (
                <div key={printer.id} className={`p-4 rounded-lg border-2 ${printer.isDefault ? 'border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                          <Printer className="w-5 h-5 text-white" />
                        </div>
                        <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 ${statusDotColors[printer.status]}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{printer.name}</p>
                          {printer.isDefault && (
                            <Badge className="text-[9px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">Par défaut</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{printer.model} — {printer.dpi} DPI</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${statusColors[printer.status]}`}>{statusLabels[printer.status]}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <ConnectionIcon className="w-3 h-3" />
                      <span>{connectionLabels[printer.connection]}</span>
                    </div>
                    <div className="text-gray-500">
                      {printer.connection === 'network' ? `${printer.ipAddress}:${printer.port}` : printer.usbPort}
                    </div>
                    <div className="text-gray-500">
                      Noircir: {printer.darkness} | Vitesse: {printer.speed}&quot;/s
                    </div>
                    <div className="text-gray-500">Papier: {printer.mediaType}</div>
                    <div className="text-gray-500">Format défaut: {labelFormats.find(l => l.id === printer.defaultLabelFormat)?.name ?? printer.defaultLabelFormat}</div>
                    <div className="text-gray-500">{printer.labelsPrinted} étiquettes imprimées</div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-7"
                      onClick={() => {
                        const updated = printers.map(p => ({ ...p, isDefault: p.id === printer.id }));
                        setPrinters(updated);
                        savePrinters(updated);
                      }}
                    >
                      {printer.isDefault ? 'Défaut actuel' : 'Définir par défaut'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-7"
                      onClick={() => {
                        const updated = printers.map(p =>
                          p.id === printer.id ? { ...p, status: (p.status === 'offline' ? 'idle' : 'offline') as ZebraPrinter['status'] } : p
                        );
                        setPrinters(updated);
                        savePrinters(updated);
                      }}
                    >
                      {printer.status === 'offline' ? 'Connecter' : 'Déconnecter'}
                    </Button>
                  </div>
                </div>
              );
            })}

            <Separator />

            {/* Label Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Paramètres d&apos;impression par défaut</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Format étiquette par défaut</Label>
                  <Select value={labelSettings.defaultLabelFormat} onValueChange={v => {
                    const updated = { ...labelSettings, defaultLabelFormat: v };
                    setLabelSettings(updated);
                    saveLabelSettings(updated);
                  }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {labelFormats.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Imprimante par défaut</Label>
                  <Select value={labelSettings.defaultPrinterId} onValueChange={v => {
                    const updated = { ...labelSettings, defaultPrinterId: v };
                    setLabelSettings(updated);
                    saveLabelSettings(updated);
                  }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {printers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Impression automatique à la création</Label>
                  <Switch checked={labelSettings.autoPrintOnCreate} onCheckedChange={v => {
                    const updated = { ...labelSettings, autoPrintOnCreate: v };
                    setLabelSettings(updated);
                    saveLabelSettings(updated);
                  }} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Afficher le prix sur l&apos;étiquette</Label>
                  <Switch checked={labelSettings.includePriceOnLabel} onCheckedChange={v => {
                    const updated = { ...labelSettings, includePriceOnLabel: v };
                    setLabelSettings(updated);
                    saveLabelSettings(updated);
                  }} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Inclure le code QR</Label>
                  <Switch checked={labelSettings.includeQRCode} onCheckedChange={v => {
                    const updated = { ...labelSettings, includeQRCode: v };
                    setLabelSettings(updated);
                    saveLabelSettings(updated);
                  }} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Inclure le code-barres</Label>
                  <Switch checked={labelSettings.includeBarcode} onCheckedChange={v => {
                    const updated = { ...labelSettings, includeBarcode: v };
                    setLabelSettings(updated);
                    saveLabelSettings(updated);
                  }} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
