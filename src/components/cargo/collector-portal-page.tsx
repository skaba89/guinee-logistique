'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  FileText,
  Clock,
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  MapPin,
  Phone,
  Weight,
  Eye,
  DollarSign,
  CreditCard,
  Receipt,
  QrCode,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Timer,
  AlertTriangle,
  Banknote,
  Smartphone,
  Building2,
  BadgeDollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCurrency } from '@/lib/use-currency';
import { useToastAction } from '@/components/cargo/toast-provider';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CollectorBL {
  id: string;
  blNumber: string;
  type: 'ramasse' | 'livraison';
  collectorName: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  packageDescription: string;
  weight: number;
  dimensions: string;
  origin: string;
  destination: string;
  status: 'en_attente' | 'confirme' | 'en_cours' | 'termine' | 'annule';
  createdAt: string;
  completedAt?: string;
  labelGenerated: boolean;
  labelId?: string;
  parcelTrackingNumber?: string;
  price: number;
}

interface CollectorPayment {
  id: string;
  paymentNumber: string;
  blId: string;
  blNumber: string;
  blType: 'ramasse' | 'livraison';
  clientName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullPayment: boolean;
  paymentDate: string;
  paymentMethod: 'especes' | 'mobile_money' | 'virement' | 'cheque';
  invoiceNumber: string;
  status: 'paye' | 'partiel' | 'en_attente';
}

interface CollectorLabel {
  id: string;
  blId: string;
  blNumber: string;
  blType: 'ramasse' | 'livraison';
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  dimensions: string;
  packageDescription: string;
  createdAt: string;
  printed: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialBLs: CollectorBL[] = [
  {
    id: 'bl1',
    blNumber: 'BL-RAM-2026-0001',
    type: 'ramasse',
    collectorName: 'Moussa Diallo',
    clientName: 'Sarl TechnoPlus',
    clientPhone: '0555123456',
    clientAddress: '23 Rue Didouche Mourad, Alger',
    packageDescription: 'Matériel informatique — 2 cartons',
    weight: 45.5,
    dimensions: '120x80x60',
    origin: 'Alger',
    destination: 'Conakry',
    status: 'termine',
    createdAt: '2026-01-10',
    completedAt: '2026-01-11',
    labelGenerated: true,
    labelId: 'lbl1',
    parcelTrackingNumber: 'GL-RAM-2026-00001',
    price: 350000,
  },
  {
    id: 'bl2',
    blNumber: 'BL-LIV-2026-0001',
    type: 'livraison',
    collectorName: 'Moussa Diallo',
    clientName: 'Entreprise Bouzidi & Fils',
    clientPhone: '0555789012',
    clientAddress: '45 Boulevard de la Soummam, Oran',
    packageDescription: 'Pièces de rechange automobile',
    weight: 120,
    dimensions: '200x150x100',
    origin: 'Conakry',
    destination: 'Oran',
    status: 'en_cours',
    createdAt: '2026-02-05',
    labelGenerated: true,
    labelId: 'lbl2',
    parcelTrackingNumber: 'GL-LIV-2026-00001',
    price: 850000,
  },
  {
    id: 'bl3',
    blNumber: 'BL-RAM-2026-0002',
    type: 'ramasse',
    collectorName: 'Moussa Diallo',
    clientName: 'Mohamed Amrani',
    clientPhone: '0661345678',
    clientAddress: '12 Cité des Frères Abbas, Constantine',
    packageDescription: 'Documents administratifs',
    weight: 2,
    dimensions: '35x25x5',
    origin: 'Constantine',
    destination: 'Conakry',
    status: 'confirme',
    createdAt: '2026-02-20',
    labelGenerated: false,
    price: 45000,
  },
  {
    id: 'bl4',
    blNumber: 'BL-LIV-2026-0002',
    type: 'livraison',
    collectorName: 'Moussa Diallo',
    clientName: 'Nadia Benmoussa',
    clientPhone: '0770890123',
    clientAddress: '67 Rue Mokrani, Constantine',
    packageDescription: 'Colis cadeau — produits artisanaux',
    weight: 8,
    dimensions: '50x40x30',
    origin: 'Conakry',
    destination: 'Constantine',
    status: 'en_attente',
    createdAt: '2026-03-01',
    labelGenerated: false,
    price: 120000,
  },
  {
    id: 'bl5',
    blNumber: 'BL-RAM-2026-0003',
    type: 'ramasse',
    collectorName: 'Moussa Diallo',
    clientName: 'SPA HydroServices',
    clientPhone: '0555678901',
    clientAddress: 'Zone Industrielle Rouiba, Alger',
    packageDescription: 'Échantillons industriels — 5 boîtes',
    weight: 32,
    dimensions: '80x60x40',
    origin: 'Alger',
    destination: 'Conakry',
    status: 'en_cours',
    createdAt: '2026-03-10',
    labelGenerated: true,
    labelId: 'lbl3',
    parcelTrackingNumber: 'GL-RAM-2026-00003',
    price: 280000,
  },
  {
    id: 'bl6',
    blNumber: 'BL-LIV-2026-0003',
    type: 'livraison',
    collectorName: 'Moussa Diallo',
    clientName: 'EURL BatiPlus',
    clientPhone: '0661789012',
    clientAddress: "34 Avenue de l'Indépendance, Béjaïa",
    packageDescription: 'Matériaux de construction — échantillons',
    weight: 250,
    dimensions: '300x200x150',
    origin: 'Conakry',
    destination: 'Béjaïa',
    status: 'termine',
    createdAt: '2026-02-15',
    completedAt: '2026-02-18',
    labelGenerated: true,
    labelId: 'lbl4',
    parcelTrackingNumber: 'GL-LIV-2026-00003',
    price: 1500000,
  },
  {
    id: 'bl7',
    blNumber: 'BL-RAM-2026-0004',
    type: 'ramasse',
    collectorName: 'Moussa Diallo',
    clientName: 'Sarl MédiaCom',
    clientPhone: '0770456789',
    clientAddress: '8 Rue Ahmed Bey, Blida',
    packageDescription: 'Équipements audiovisuels',
    weight: 18,
    dimensions: '70x50x35',
    origin: 'Blida',
    destination: 'Conakry',
    status: 'annule',
    createdAt: '2026-03-15',
    labelGenerated: false,
    price: 180000,
  },
  {
    id: 'bl8',
    blNumber: 'BL-LIV-2026-0004',
    type: 'livraison',
    collectorName: 'Moussa Diallo',
    clientName: 'Amina Zeroual',
    clientPhone: '0662012345',
    clientAddress: '5 Cité 1er Novembre, Tizi Ouzou',
    packageDescription: 'Vêtements et textiles — 3 sacs',
    weight: 15,
    dimensions: '60x45x35',
    origin: 'Conakry',
    destination: 'Tizi Ouzou',
    status: 'confirme',
    createdAt: '2026-03-20',
    labelGenerated: true,
    labelId: 'lbl5',
    parcelTrackingNumber: 'GL-LIV-2026-00004',
    price: 95000,
  },
  {
    id: 'bl9',
    blNumber: 'BL-RAM-2026-0005',
    type: 'ramasse',
    collectorName: 'Moussa Diallo',
    clientName: 'Karim Djebbar',
    clientPhone: '0771123456',
    clientAddress: '19 Rue Ali Boumendjel, Sétif',
    packageDescription: 'Produits alimentaires secs — 4 cartons',
    weight: 60,
    dimensions: '100x80x60',
    origin: 'Sétif',
    destination: 'Conakry',
    status: 'en_attente',
    createdAt: '2026-04-01',
    labelGenerated: false,
    price: 420000,
  },
  {
    id: 'bl10',
    blNumber: 'BL-LIV-2026-0005',
    type: 'livraison',
    collectorName: 'Moussa Diallo',
    clientName: 'Sarl AgriPro',
    clientPhone: '0555901234',
    clientAddress: 'Zone Industrielle El Bouni, Annaba',
    packageDescription: 'Produits agricoles traités',
    weight: 180,
    dimensions: '250x180x120',
    origin: 'Conakry',
    destination: 'Annaba',
    status: 'en_cours',
    createdAt: '2026-04-05',
    labelGenerated: true,
    labelId: 'lbl6',
    parcelTrackingNumber: 'GL-LIV-2026-00005',
    price: 720000,
  },
];

const initialPayments: CollectorPayment[] = [
  {
    id: 'pay1',
    paymentNumber: 'PAI-2026-0001',
    blId: 'bl1',
    blNumber: 'BL-RAM-2026-0001',
    blType: 'ramasse',
    clientName: 'Sarl TechnoPlus',
    totalAmount: 350000,
    paidAmount: 350000,
    remainingAmount: 0,
    isFullPayment: true,
    paymentDate: '2026-01-10',
    paymentMethod: 'especes',
    invoiceNumber: 'FAC-RAM-2026-0001',
    status: 'paye',
  },
  {
    id: 'pay2',
    paymentNumber: 'PAI-2026-0002',
    blId: 'bl2',
    blNumber: 'BL-LIV-2026-0001',
    blType: 'livraison',
    clientName: 'Entreprise Bouzidi & Fils',
    totalAmount: 850000,
    paidAmount: 425000,
    remainingAmount: 425000,
    isFullPayment: false,
    paymentDate: '2026-02-06',
    paymentMethod: 'mobile_money',
    invoiceNumber: 'FAC-LIV-2026-0001',
    status: 'partiel',
  },
  {
    id: 'pay3',
    paymentNumber: 'PAI-2026-0003',
    blId: 'bl5',
    blNumber: 'BL-RAM-2026-0003',
    blType: 'ramasse',
    clientName: 'SPA HydroServices',
    totalAmount: 280000,
    paidAmount: 280000,
    remainingAmount: 0,
    isFullPayment: true,
    paymentDate: '2026-03-10',
    paymentMethod: 'virement',
    invoiceNumber: 'FAC-RAM-2026-0003',
    status: 'paye',
  },
  {
    id: 'pay4',
    paymentNumber: 'PAI-2026-0004',
    blId: 'bl6',
    blNumber: 'BL-LIV-2026-0003',
    blType: 'livraison',
    clientName: 'EURL BatiPlus',
    totalAmount: 1500000,
    paidAmount: 500000,
    remainingAmount: 1000000,
    isFullPayment: false,
    paymentDate: '2026-02-16',
    paymentMethod: 'cheque',
    invoiceNumber: 'FAC-LIV-2026-0003',
    status: 'partiel',
  },
  {
    id: 'pay5',
    paymentNumber: 'PAI-2026-0005',
    blId: 'bl8',
    blNumber: 'BL-LIV-2026-0004',
    blType: 'livraison',
    clientName: 'Amina Zeroual',
    totalAmount: 95000,
    paidAmount: 95000,
    remainingAmount: 0,
    isFullPayment: true,
    paymentDate: '2026-03-20',
    paymentMethod: 'especes',
    invoiceNumber: 'FAC-LIV-2026-0004',
    status: 'paye',
  },
  {
    id: 'pay6',
    paymentNumber: 'PAI-2026-0006',
    blId: 'bl10',
    blNumber: 'BL-LIV-2026-0005',
    blType: 'livraison',
    clientName: 'Sarl AgriPro',
    totalAmount: 720000,
    paidAmount: 360000,
    remainingAmount: 360000,
    isFullPayment: false,
    paymentDate: '2026-04-06',
    paymentMethod: 'mobile_money',
    invoiceNumber: 'FAC-LIV-2026-0005',
    status: 'partiel',
  },
  {
    id: 'pay7',
    paymentNumber: 'PAI-2026-0007',
    blId: 'bl3',
    blNumber: 'BL-RAM-2026-0002',
    blType: 'ramasse',
    clientName: 'Mohamed Amrani',
    totalAmount: 45000,
    paidAmount: 0,
    remainingAmount: 45000,
    isFullPayment: false,
    paymentDate: '',
    paymentMethod: 'especes',
    invoiceNumber: '',
    status: 'en_attente',
  },
];

const initialLabels: CollectorLabel[] = [
  {
    id: 'lbl1', blId: 'bl1', blNumber: 'BL-RAM-2026-0001', blType: 'ramasse',
    trackingNumber: 'GL-RAM-2026-00001',
    senderName: 'Sarl TechnoPlus', senderPhone: '0555123456', senderAddress: '23 Rue Didouche Mourad, Alger',
    receiverName: 'Guinée Logistique', receiverPhone: '', receiverAddress: 'Depot Central, Conakry',
    weight: 45.5, dimensions: '120x80x60', packageDescription: 'Matériel informatique — 2 cartons',
    createdAt: '2026-01-10', printed: true,
  },
  {
    id: 'lbl2', blId: 'bl2', blNumber: 'BL-LIV-2026-0001', blType: 'livraison',
    trackingNumber: 'GL-LIV-2026-00001',
    senderName: 'Guinée Logistique', senderPhone: '', senderAddress: 'Depot Central, Conakry',
    receiverName: 'Entreprise Bouzidi & Fils', receiverPhone: '0555789012', receiverAddress: '45 Boulevard de la Soummam, Oran',
    weight: 120, dimensions: '200x150x100', packageDescription: 'Pièces de rechange automobile',
    createdAt: '2026-02-05', printed: true,
  },
  {
    id: 'lbl3', blId: 'bl5', blNumber: 'BL-RAM-2026-0003', blType: 'ramasse',
    trackingNumber: 'GL-RAM-2026-00003',
    senderName: 'SPA HydroServices', senderPhone: '0555678901', senderAddress: 'Zone Industrielle Rouiba, Alger',
    receiverName: 'Guinée Logistique', receiverPhone: '', receiverAddress: 'Depot Central, Conakry',
    weight: 32, dimensions: '80x60x40', packageDescription: 'Échantillons industriels — 5 boîtes',
    createdAt: '2026-03-10', printed: false,
  },
  {
    id: 'lbl4', blId: 'bl6', blNumber: 'BL-LIV-2026-0003', blType: 'livraison',
    trackingNumber: 'GL-LIV-2026-00003',
    senderName: 'Guinée Logistique', senderPhone: '', senderAddress: 'Depot Central, Conakry',
    receiverName: 'EURL BatiPlus', receiverPhone: '0661789012', receiverAddress: "34 Avenue de l'Indépendance, Béjaïa",
    weight: 250, dimensions: '300x200x150', packageDescription: 'Matériaux de construction — échantillons',
    createdAt: '2026-02-15', printed: true,
  },
  {
    id: 'lbl5', blId: 'bl8', blNumber: 'BL-LIV-2026-0004', blType: 'livraison',
    trackingNumber: 'GL-LIV-2026-00004',
    senderName: 'Guinée Logistique', senderPhone: '', senderAddress: 'Depot Central, Conakry',
    receiverName: 'Amina Zeroual', receiverPhone: '0662012345', receiverAddress: '5 Cité 1er Novembre, Tizi Ouzou',
    weight: 15, dimensions: '60x45x35', packageDescription: 'Vêtements et textiles — 3 sacs',
    createdAt: '2026-03-20', printed: false,
  },
  {
    id: 'lbl6', blId: 'bl10', blNumber: 'BL-LIV-2026-0005', blType: 'livraison',
    trackingNumber: 'GL-LIV-2026-00005',
    senderName: 'Guinée Logistique', senderPhone: '', senderAddress: 'Depot Central, Conakry',
    receiverName: 'Sarl AgriPro', receiverPhone: '0555901234', receiverAddress: 'Zone Industrielle El Bouni, Annaba',
    weight: 180, dimensions: '250x180x120', packageDescription: 'Produits agricoles traités',
    createdAt: '2026-04-05', printed: false,
  },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const blStatusLabels: Record<CollectorBL['status'], string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
};

const blStatusColors: Record<CollectorBL['status'], string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirme: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  termine: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  annule: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const paymentStatusLabels: Record<CollectorPayment['status'], string> = {
  paye: 'Payé',
  partiel: 'Partiel',
  en_attente: 'En attente',
};

const paymentStatusColors: Record<CollectorPayment['status'], string> = {
  paye: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  partiel: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const paymentMethodLabels: Record<CollectorPayment['paymentMethod'], string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  virement: 'Virement',
  cheque: 'Chèque',
};

const paymentMethodIcons: Record<CollectorPayment['paymentMethod'], React.ElementType> = {
  especes: Banknote,
  mobile_money: Smartphone,
  virement: Building2,
  cheque: BadgeDollarSign,
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
};

const ITEMS_PER_PAGE = 6;

// ─── Pagination Component ────────────────────────────────────────────────────

function PaginationControls({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Page {current}/{total}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={current === 1} onClick={() => onChange(current - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
          <Button key={page} variant={page === current ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => onChange(page)}
            style={page === current ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : {}}>
            {page}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={current === total} onClick={() => onChange(current + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CollectorPortalPage() {
  const { format: formatPrice } = useCurrency();
  const { toast } = useToastAction();

  // State
  const [bls, setBls] = useState<CollectorBL[]>(initialBLs);
  const [payments, setPayments] = useState<CollectorPayment[]>(initialPayments);
  const [labels, setLabels] = useState<CollectorLabel[]>(initialLabels);
  const [activeTab, setActiveTab] = useState('bls');

  // Search & Filter
  const [blSearch, setBlSearch] = useState('');
  const [blFilterType, setBlFilterType] = useState('all');
  const [blFilterStatus, setBlFilterStatus] = useState('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('all');
  const [labelSearch, setLabelSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Pagination
  const [blPage, setBlPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [labelPage, setLabelPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);

  // Dialogs
  const [showCreateBL, setShowCreateBL] = useState(false);
  const [showBLDetail, setShowBLDetail] = useState<CollectorBL | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<CollectorBL | null>(null);
  const [showLabelDetail, setShowLabelDetail] = useState<CollectorLabel | null>(null);
  const [showLabelPreview, setShowLabelPreview] = useState<CollectorLabel | null>(null);

  // New BL form
  const [newBL, setNewBL] = useState({
    type: 'ramasse' as 'ramasse' | 'livraison',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    packageDescription: '',
    weight: '',
    dimensions: '',
    origin: '',
    destination: '',
    price: '',
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState<{
    paymentType: 'full' | 'deposit';
    depositAmount: string;
    paymentMethod: CollectorPayment['paymentMethod'];
  }>({
    paymentType: 'full',
    depositAmount: '',
    paymentMethod: 'especes',
  });

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const totalBLs = bls.length;
  const ramasseBLs = bls.filter(b => b.type === 'ramasse').length;
  const livraisonBLs = bls.filter(b => b.type === 'livraison').length;
  const blsEnCours = bls.filter(b => ['en_attente', 'confirme', 'en_cours'].includes(b.status)).length;
  const labelsGenerated = labels.length;
  const totalEncaisse = payments.filter(p => p.status !== 'en_attente').reduce((a, b) => a + b.paidAmount, 0);
  const totalRestant = payments.reduce((a, b) => a + b.remainingAmount, 0);

  const kpiCards = [
    {
      title: 'Total BL',
      value: String(totalBLs),
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      subtitle: `${ramasseBLs} ramasse · ${livraisonBLs} livraison`,
    },
    {
      title: 'BL en Cours',
      value: String(blsEnCours),
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      subtitle: `${bls.filter(b => b.status === 'en_attente').length} en attente`,
    },
    {
      title: 'Étiquettes Générées',
      value: String(labelsGenerated),
      icon: QrCode,
      color: 'from-emerald-500 to-emerald-600',
      subtitle: `${labels.filter(l => l.printed).length} imprimées`,
    },
    {
      title: 'Encaissé / Restant',
      value: formatPrice(totalEncaisse),
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      subtitle: `Reste: ${formatPrice(totalRestant)}`,
    },
  ];

  // ─── Filtered Data ───────────────────────────────────────────────────────

  const filteredBLs = useMemo(() => {
    let result = [...bls];
    if (blFilterType !== 'all') result = result.filter(b => b.type === blFilterType);
    if (blFilterStatus !== 'all') result = result.filter(b => b.status === blFilterStatus);
    if (blSearch) {
      const q = blSearch.toLowerCase();
      result = result.filter(b =>
        b.blNumber.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        b.packageDescription.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bls, blFilterType, blFilterStatus, blSearch]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];
    if (paymentFilterStatus !== 'all') result = result.filter(p => p.status === paymentFilterStatus);
    if (paymentSearch) {
      const q = paymentSearch.toLowerCase();
      result = result.filter(p =>
        p.paymentNumber.toLowerCase().includes(q) ||
        p.blNumber.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.paymentDate || '1970-01-01').getTime() - new Date(a.paymentDate || '1970-01-01').getTime());
  }, [payments, paymentFilterStatus, paymentSearch]);

  const filteredLabels = useMemo(() => {
    let result = [...labels];
    if (labelSearch) {
      const q = labelSearch.toLowerCase();
      result = result.filter(l =>
        l.trackingNumber.toLowerCase().includes(q) ||
        l.blNumber.toLowerCase().includes(q) ||
        l.senderName.toLowerCase().includes(q) ||
        l.receiverName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [labels, labelSearch]);

  const invoices = useMemo(() => {
    return payments
      .filter(p => p.invoiceNumber)
      .sort((a, b) => new Date(b.paymentDate || '1970-01-01').getTime() - new Date(a.paymentDate || '1970-01-01').getTime());
  }, [payments]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    if (invoiceSearch) {
      const q = invoiceSearch.toLowerCase();
      result = result.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.blNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, invoiceSearch]);

  // Paginated
  const paginatedBLs = filteredBLs.slice((blPage - 1) * ITEMS_PER_PAGE, blPage * ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE);
  const paginatedLabels = filteredLabels.slice((labelPage - 1) * ITEMS_PER_PAGE, labelPage * ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice((invoicePage - 1) * ITEMS_PER_PAGE, invoicePage * ITEMS_PER_PAGE);

  const blTotalPages = Math.ceil(filteredBLs.length / ITEMS_PER_PAGE);
  const paymentTotalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const labelTotalPages = Math.ceil(filteredLabels.length / ITEMS_PER_PAGE);
  const invoiceTotalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const generateBLNumber = (type: 'ramasse' | 'livraison') => {
    const prefix = type === 'ramasse' ? 'BL-RAM' : 'BL-LIV';
    const existingCount = bls.filter(b => b.type === type).length;
    return `${prefix}-2026-${String(existingCount + 1).padStart(4, '0')}`;
  };

  const generateTrackingNumber = (type: 'ramasse' | 'livraison') => {
    const prefix = type === 'ramasse' ? 'GL-RAM' : 'GL-LIV';
    const existingCount = bls.filter(b => b.type === type && b.parcelTrackingNumber).length;
    return `${prefix}-2026-${String(existingCount + 1).padStart(5, '0')}`;
  };

  const handleCreateBL = () => {
    if (!newBL.clientName || !newBL.clientPhone || !newBL.packageDescription || !newBL.origin || !newBL.destination || !newBL.price) {
      toast.error('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const blNumber = generateBLNumber(newBL.type);
    const trackingNumber = generateTrackingNumber(newBL.type);
    const newId = `bl${bls.length + 1}`;

    const bl: CollectorBL = {
      id: newId,
      blNumber,
      type: newBL.type,
      collectorName: 'Moussa Diallo',
      clientName: newBL.clientName,
      clientPhone: newBL.clientPhone,
      clientAddress: newBL.clientAddress,
      packageDescription: newBL.packageDescription,
      weight: parseFloat(newBL.weight) || 0,
      dimensions: newBL.dimensions,
      origin: newBL.origin,
      destination: newBL.destination,
      status: 'en_attente',
      createdAt: new Date().toISOString().split('T')[0],
      labelGenerated: false,
      parcelTrackingNumber: trackingNumber,
      price: parseFloat(newBL.price) || 0,
    };

    setBls([bl, ...bls]);
    setShowCreateBL(false);
    setNewBL({
      type: 'ramasse',
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      packageDescription: '',
      weight: '',
      dimensions: '',
      origin: '',
      destination: '',
      price: '',
    });

    toast.success('BL créé', `${blNumber} créé avec succès. Colis ${trackingNumber} ajouté automatiquement.`);
  };

  const handleGenerateLabel = (bl: CollectorBL) => {
    if (bl.labelGenerated) {
      const existingLabel = labels.find(l => l.blId === bl.id);
      if (existingLabel) {
        setShowLabelDetail(existingLabel);
        return;
      }
    }

    const labelId = `lbl${labels.length + 1}`;
    const isRamasse = bl.type === 'ramasse';

    const label: CollectorLabel = {
      id: labelId,
      blId: bl.id,
      blNumber: bl.blNumber,
      blType: bl.type,
      trackingNumber: bl.parcelTrackingNumber || `${isRamasse ? 'GL-RAM' : 'GL-LIV'}-2026-${String(labels.length + 1).padStart(5, '0')}`,
      senderName: isRamasse ? bl.clientName : 'Guinée Logistique',
      senderPhone: isRamasse ? bl.clientPhone : '',
      senderAddress: isRamasse ? bl.clientAddress : 'Depot Central, Conakry',
      receiverName: isRamasse ? 'Guinée Logistique' : bl.clientName,
      receiverPhone: isRamasse ? '' : bl.clientPhone,
      receiverAddress: isRamasse ? 'Depot Central, Conakry' : bl.clientAddress,
      weight: bl.weight,
      dimensions: bl.dimensions,
      packageDescription: bl.packageDescription,
      createdAt: new Date().toISOString().split('T')[0],
      printed: false,
    };

    setLabels([label, ...labels]);
    setBls(bls.map(b => b.id === bl.id ? { ...b, labelGenerated: true, labelId } : b));
    setShowLabelDetail(label);
    toast.success('Étiquette générée', `Étiquette ${label.trackingNumber} créée avec succès.`);
  };

  const handlePrintLabel = (label: CollectorLabel) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Étiquette — ${label.trackingNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          .label-container {
            border: 3px solid #0d9488;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            padding-bottom: 16px;
            border-bottom: 2px dashed #e5e7eb;
            margin-bottom: 16px;
          }
          .header h1 {
            font-size: 20px;
            color: #0d9488;
            font-weight: bold;
          }
          .tracking {
            text-align: center;
            padding: 12px;
            background: #f0fdfa;
            border-radius: 8px;
            margin-bottom: 16px;
          }
          .tracking .number {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 3px;
            font-family: monospace;
            color: #0f172a;
          }
          .tracking .barcode {
            font-size: 32px;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
            margin-top: 8px;
            color: #1e293b;
          }
          .section {
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 6px;
            background: #f8fafc;
          }
          .section-title {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
            letter-spacing: 1px;
          }
          .section .name { font-size: 14px; font-weight: bold; color: #0f172a; }
          .section .detail { font-size: 12px; color: #475569; }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px dashed #e5e7eb;
          }
          .info-item { text-align: center; }
          .info-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; }
          .info-value { font-size: 14px; font-weight: bold; color: #0f172a; }
          .type-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            color: white;
            background: ${label.blType === 'ramasse' ? '#ea580c' : '#0d9488'};
          }
          .qr-placeholder {
            text-align: center;
            margin-top: 12px;
            padding: 16px;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
          }
          .qr-placeholder .qr-text { font-size: 32px; }
          .qr-placeholder .qr-label { font-size: 10px; color: #94a3b8; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">
            <h1>GUINÉE LOGISTIQUE</h1>
            <span class="type-badge">${label.blType === 'ramasse' ? 'RAMASSE' : 'LIVRAISON'}</span>
          </div>
          <div class="tracking">
            <div class="number">${label.trackingNumber}</div>
            <div class="barcode">||||||||||||||||||||||</div>
          </div>
          <div class="section">
            <div class="section-title">Expéditeur</div>
            <div class="name">${label.senderName}</div>
            <div class="detail">${label.senderPhone ? label.senderPhone + ' · ' : ''}${label.senderAddress}</div>
          </div>
          <div class="section">
            <div class="section-title">Destinataire</div>
            <div class="name">${label.receiverName}</div>
            <div class="detail">${label.receiverPhone ? label.receiverPhone + ' · ' : ''}${label.receiverAddress}</div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Poids</div>
              <div class="info-value">${label.weight} kg</div>
            </div>
            <div class="info-item">
              <div class="info-label">Dimensions</div>
              <div class="info-value">${label.dimensions}</div>
            </div>
          </div>
          <div class="qr-placeholder">
            <div class="qr-text">⬛⬜⬛⬜⬛⬜⬛⬜</div>
            <div class="qr-label">QR Code — ${label.trackingNumber}</div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();

    setLabels(labels.map(l => l.id === label.id ? { ...l, printed: true } : l));
    toast.success('Impression lancée', `Étiquette ${label.trackingNumber} envoyée à l'imprimante.`);
  };

  const handlePayment = () => {
    if (!showPaymentDialog) return;

    const totalAmount = showPaymentDialog.price;
    const isFull = paymentForm.paymentType === 'full';
    const paidAmount = isFull ? totalAmount : parseFloat(paymentForm.depositAmount) || 0;

    if (!isFull && (paidAmount <= 0 || paidAmount >= totalAmount)) {
      toast.error('Montant invalide', "L'accompte doit être supérieur à 0 et inférieur au montant total.");
      return;
    }

    const blType = showPaymentDialog.type;
    const existingPaymentsForType = payments.filter(p => p.blType === blType).length;
    const prefix = blType === 'ramasse' ? 'FAC-RAM' : 'FAC-LIV';
    const invoiceNumber = `${prefix}-2026-${String(existingPaymentsForType + 1).padStart(4, '0')}`;
    const paymentNumber = `PAI-2026-${String(payments.length + 1).padStart(4, '0')}`;

    const payment: CollectorPayment = {
      id: `pay${payments.length + 1}`,
      paymentNumber,
      blId: showPaymentDialog.id,
      blNumber: showPaymentDialog.blNumber,
      blType: showPaymentDialog.type,
      clientName: showPaymentDialog.clientName,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      isFullPayment: isFull,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentForm.paymentMethod,
      invoiceNumber,
      status: isFull ? 'paye' : 'partiel',
    };

    setPayments([payment, ...payments]);
    setShowPaymentDialog(null);
    setPaymentForm({ paymentType: 'full', depositAmount: '', paymentMethod: 'especes' });

    toast.success(
      isFull ? 'Paiement complet enregistré' : 'Accompte enregistré',
      `${paymentNumber} — ${formatPrice(paidAmount)} ${isFull ? '(total)' : '(accompte)'} via ${paymentMethodLabels[paymentForm.paymentMethod]}`
    );
  };

  const handleUpdateBLStatus = (blId: string, newStatus: CollectorBL['status']) => {
    setBls(bls.map(b => b.id === blId ? {
      ...b,
      status: newStatus,
      completedAt: newStatus === 'termine' ? new Date().toISOString().split('T')[0] : b.completedAt,
    } : b));
    toast.success('Statut mis à jour', `BL passé en "${blStatusLabels[newStatus]}".`);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ea580c, #0d9488)' }}>
              <PackageSearch className="w-4 h-4 text-white" />
            </div>
            Portail Ramasseurs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">BL ramasse/livraison, étiquettes colis, paiements et factures</p>
        </div>
        <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #ea580c, #0d9488)' }} onClick={() => setShowCreateBL(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nouveau BL
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 truncate">{card.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{card.subtitle}</p>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4" style={{ background: 'rgba(15, 23, 42, 0.05)' }}>
          <TabsTrigger value="bls" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
            BL
          </TabsTrigger>
          <TabsTrigger value="labels" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <QrCode className="w-4 h-4 mr-1 hidden sm:inline" />
            Étiquettes
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-1 hidden sm:inline" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <Receipt className="w-4 h-4 mr-1 hidden sm:inline" />
            Factures
          </TabsTrigger>
        </TabsList>

        {/* ─── BL Tab ────────────────────────────────────────────────────────── */}
        <TabsContent value="bls" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° BL, client, origine, destination..."
                    className="pl-9"
                    value={blSearch}
                    onChange={(e) => { setBlSearch(e.target.value); setBlPage(1); }}
                  />
                </div>
                <Select value={blFilterType} onValueChange={(v) => { setBlFilterType(v); setBlPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="ramasse">Ramasse</SelectItem>
                    <SelectItem value="livraison">Livraison</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={blFilterStatus} onValueChange={(v) => { setBlFilterStatus(v); setBlPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="confirme">Confirmé</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* BL Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° BL</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Trajet</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Colis</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs text-right">Prix</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBLs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Aucun BL trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBLs.map((bl) => (
                        <TableRow key={bl.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setShowBLDetail(bl)}>
                          <TableCell className="text-xs font-mono font-medium">{bl.blNumber}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${bl.type === 'ramasse' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                              {bl.type === 'ramasse' ? 'Ramasse' : 'Livraison'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium">{bl.clientName}</div>
                            <div className="text-gray-400">{bl.clientPhone}</div>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {bl.origin} → {bl.destination}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">
                            <div className="font-mono text-[10px] text-gray-500">{bl.parcelTrackingNumber || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${blStatusColors[bl.status]}`}>
                              {blStatusLabels[bl.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">{formatPrice(bl.price)}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {!bl.labelGenerated && bl.status !== 'annule' && (
                                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleGenerateLabel(bl)}>
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Étiquette
                                </Button>
                              )}
                              {bl.labelGenerated && (
                                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => {
                                  const label = labels.find(l => l.blId === bl.id);
                                  if (label) setShowLabelDetail(label);
                                }}>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Voir
                                </Button>
                              )}
                              {bl.status !== 'annule' && bl.status !== 'termine' && (
                                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowPaymentDialog(bl)}>
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Payer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls current={blPage} total={blTotalPages} onChange={setBlPage} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Labels Tab ──────────────────────────────────────────────────────── */}
        <TabsContent value="labels" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par N° suivi, BL, expéditeur, destinataire..."
                  className="pl-9"
                  value={labelSearch}
                  onChange={(e) => { setLabelSearch(e.target.value); setLabelPage(1); }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedLabels.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                Aucune étiquette trouvée
              </div>
            ) : (
              paginatedLabels.map((label) => (
                <motion.div
                  key={label.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className={`text-[10px] mb-1 ${label.blType === 'ramasse' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                            {label.blType === 'ramasse' ? 'RAMASSE' : 'LIVRAISON'}
                          </Badge>
                          <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{label.trackingNumber}</p>
                          <p className="text-[10px] text-gray-500">{label.blNumber}</p>
                        </div>
                        <Badge className={`text-[9px] ${label.printed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {label.printed ? 'Imprimée' : 'Non imprimée'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3 h-3 text-teal-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-500">De:</span>{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{label.senderName}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-500">À:</span>{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{label.receiverName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="flex items-center gap-1"><Weight className="w-3 h-3" />{label.weight} kg</span>
                          <span>{label.dimensions}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]" onClick={() => setShowLabelPreview(label)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Aperçu
                        </Button>
                        <Button size="sm" className="flex-1 h-8 text-[11px] text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => handlePrintLabel(label)}>
                          <Printer className="w-3 h-3 mr-1" />
                          Imprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          <Card>
            <PaginationControls current={labelPage} total={labelTotalPages} onChange={setLabelPage} />
          </Card>
        </TabsContent>

        {/* ─── Payments Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° paiement, BL, client, facture..."
                    className="pl-9"
                    value={paymentSearch}
                    onChange={(e) => { setPaymentSearch(e.target.value); setPaymentPage(1); }}
                  />
                </div>
                <Select value={paymentFilterStatus} onValueChange={(v) => { setPaymentFilterStatus(v); setPaymentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="paye">Payé</SelectItem>
                    <SelectItem value="partiel">Partiel</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Paiement</TableHead>
                      <TableHead className="text-xs">BL</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Mode</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                      <TableHead className="text-xs">Payé</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Reste</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Aucun paiement trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map((payment) => {
                        const MethodIcon = paymentMethodIcons[payment.paymentMethod];
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="text-xs font-mono font-medium">{payment.paymentNumber}</TableCell>
                            <TableCell className="text-xs font-mono">{payment.blNumber}</TableCell>
                            <TableCell className="text-xs font-medium">{payment.clientName}</TableCell>
                            <TableCell className="text-xs hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <MethodIcon className="w-3 h-3 text-gray-400" />
                                {paymentMethodLabels[payment.paymentMethod]}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{formatPrice(payment.totalAmount)}</TableCell>
                            <TableCell className="text-xs font-medium text-green-600 dark:text-green-400">{formatPrice(payment.paidAmount)}</TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">
                              <span className={payment.remainingAmount > 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                {formatPrice(payment.remainingAmount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${paymentStatusColors[payment.status]}`}>
                                {paymentStatusLabels[payment.status]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls current={paymentPage} total={paymentTotalPages} onChange={setPaymentPage} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Invoices Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="invoices" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par N° facture, client, BL..."
                  className="pl-9"
                  value={invoiceSearch}
                  onChange={(e) => { setInvoiceSearch(e.target.value); setInvoicePage(1); }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedInvoices.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                Aucune facture trouvée
              </div>
            ) : (
              paginatedInvoices.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                          <p className="text-[10px] text-gray-500">{formatDate(invoice.paymentDate)}</p>
                        </div>
                        <Badge className={`text-[10px] ${paymentStatusColors[invoice.status]}`}>
                          {paymentStatusLabels[invoice.status]}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Client:</span>
                          <span className="font-medium">{invoice.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">BL:</span>
                          <span className="font-mono text-[11px]">{invoice.blNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Mode:</span>
                          <span>{paymentMethodLabels[invoice.paymentMethod]}</span>
                        </div>
                      </div>

                      <div className="border-t dark:border-gray-700 pt-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Montant total</span>
                          <span className="font-bold">{formatPrice(invoice.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Montant payé</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(invoice.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Reste à payer</span>
                          <span className={`font-bold ${invoice.remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatPrice(invoice.remainingAmount)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          <Card>
            <PaginationControls current={invoicePage} total={invoiceTotalPages} onChange={setInvoicePage} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Create BL Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showCreateBL} onOpenChange={setShowCreateBL}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau BL</DialogTitle>
            <DialogDescription>
              Créer un Bon de Livraison pour la collecte ou la livraison d&apos;un colis. Un numéro de suivi sera généré automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Type de BL *</Label>
              <Select value={newBL.type} onValueChange={(v) => setNewBL({ ...newBL, type: v as 'ramasse' | 'livraison' })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ramasse">
                    <div className="flex items-center gap-2">
                      <PackageSearch className="w-4 h-4 text-orange-500" />
                      BL de Ramasse (collecte chez le client)
                    </div>
                  </SelectItem>
                  <SelectItem value="livraison">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-teal-500" />
                      BL de Livraison (livraison au client)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Nom du client *</Label>
                <Input
                  className="mt-1"
                  placeholder="Nom complet"
                  value={newBL.clientName}
                  onChange={(e) => setNewBL({ ...newBL, clientName: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Téléphone *</Label>
                <Input
                  className="mt-1"
                  placeholder="0600000000"
                  value={newBL.clientPhone}
                  onChange={(e) => setNewBL({ ...newBL, clientPhone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Adresse du client</Label>
              <Input
                className="mt-1"
                placeholder="Adresse complète"
                value={newBL.clientAddress}
                onChange={(e) => setNewBL({ ...newBL, clientAddress: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Description du colis *</Label>
              <Textarea
                className="mt-1"
                placeholder="Description détaillée du contenu..."
                rows={2}
                value={newBL.packageDescription}
                onChange={(e) => setNewBL({ ...newBL, packageDescription: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Poids (kg)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  placeholder="0"
                  value={newBL.weight}
                  onChange={(e) => setNewBL({ ...newBL, weight: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Dimensions (cm)</Label>
                <Input
                  className="mt-1"
                  placeholder="LxlxH (ex: 120x80x60)"
                  value={newBL.dimensions}
                  onChange={(e) => setNewBL({ ...newBL, dimensions: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">{newBL.type === 'ramasse' ? 'Adresse de collecte *' : 'Origine *'}</Label>
                <Input
                  className="mt-1"
                  placeholder="Ville ou adresse"
                  value={newBL.origin}
                  onChange={(e) => setNewBL({ ...newBL, origin: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-medium">{newBL.type === 'ramasse' ? 'Destination *' : 'Adresse de livraison *'}</Label>
                <Input
                  className="mt-1"
                  placeholder="Ville ou adresse"
                  value={newBL.destination}
                  onChange={(e) => setNewBL({ ...newBL, destination: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Prix *</Label>
              <Input
                className="mt-1"
                type="number"
                placeholder="0"
                value={newBL.price}
                onChange={(e) => setNewBL({ ...newBL, price: e.target.value })}
              />
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-teal-700 dark:text-teal-300">
                  <span className="font-medium">Création automatique :</span> Un numéro de suivi colis sera généré automatiquement lors de la création du BL. Vous pourrez ensuite générer l&apos;étiquette correspondante.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBL(false)}>Annuler</Button>
            <Button className="text-white" style={{ background: 'linear-gradient(135deg, #ea580c, #0d9488)' }} onClick={handleCreateBL}>
              <Plus className="w-4 h-4 mr-1" />
              Créer le BL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── BL Detail Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!showBLDetail} onOpenChange={() => setShowBLDetail(null)}>
        <DialogContent className="max-w-xl">
          {showBLDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={`${showBLDetail.type === 'ramasse' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                    {showBLDetail.type === 'ramasse' ? 'Ramasse' : 'Livraison'}
                  </Badge>
                  {showBLDetail.blNumber}
                </DialogTitle>
                <DialogDescription>Détails du bon de livraison</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Client</p>
                    <p className="text-sm font-medium">{showBLDetail.clientName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{showBLDetail.clientPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Statut</p>
                    <Badge className={`text-xs ${blStatusColors[showBLDetail.status]}`}>{blStatusLabels[showBLDetail.status]}</Badge>
                    <p className="text-[10px] text-gray-400 mt-1">Créé le {formatDate(showBLDetail.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Origine</p>
                    <p className="text-sm">{showBLDetail.origin}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Destination</p>
                    <p className="text-sm">{showBLDetail.destination}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Adresse client</p>
                  <p className="text-sm">{showBLDetail.clientAddress || '-'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Description du colis</p>
                  <p className="text-sm">{showBLDetail.packageDescription}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Poids</p>
                    <p className="text-sm">{showBLDetail.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Dimensions</p>
                    <p className="text-sm">{showBLDetail.dimensions || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Prix</p>
                    <p className="text-sm font-bold">{formatPrice(showBLDetail.price)}</p>
                  </div>
                </div>

                {showBLDetail.parcelTrackingNumber && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">N° Suivi Colis</p>
                    <p className="text-sm font-mono font-bold">{showBLDetail.parcelTrackingNumber}</p>
                  </div>
                )}

                {/* Status Update Buttons */}
                {showBLDetail.status !== 'annule' && showBLDetail.status !== 'termine' && (
                  <div className="flex items-center gap-2 pt-3 border-t dark:border-gray-700">
                    <span className="text-xs text-gray-500">Changer le statut :</span>
                    {showBLDetail.status === 'en_attente' && (
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => { handleUpdateBLStatus(showBLDetail.id, 'confirme'); setShowBLDetail({ ...showBLDetail, status: 'confirme' }); }}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmer
                      </Button>
                    )}
                    {showBLDetail.status === 'confirme' && (
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => { handleUpdateBLStatus(showBLDetail.id, 'en_cours'); setShowBLDetail({ ...showBLDetail, status: 'en_cours' }); }}>
                        <Timer className="w-3 h-3 mr-1" /> En cours
                      </Button>
                    )}
                    {showBLDetail.status === 'en_cours' && (
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => { handleUpdateBLStatus(showBLDetail.id, 'termine'); setShowBLDetail({ ...showBLDetail, status: 'termine' }); }}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Terminer
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-7 text-[10px] text-red-500" onClick={() => { handleUpdateBLStatus(showBLDetail.id, 'annule'); setShowBLDetail({ ...showBLDetail, status: 'annule' }); }}>
                      <XCircle className="w-3 h-3 mr-1" /> Annuler
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBLDetail(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Payment Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!showPaymentDialog} onOpenChange={() => setShowPaymentDialog(null)}>
        <DialogContent className="max-w-md">
          {showPaymentDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Enregistrer un paiement</DialogTitle>
                <DialogDescription>
                  BL : {showPaymentDialog.blNumber} — {showPaymentDialog.clientName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Montant total</span>
                    <span className="font-bold text-lg">{formatPrice(showPaymentDialog.price)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Type de paiement</Label>
                  <RadioGroup
                    value={paymentForm.paymentType}
                    onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentType: v as 'full' | 'deposit' })}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="text-xs cursor-pointer">Paiement total</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="deposit" id="deposit" />
                      <Label htmlFor="deposit" className="text-xs cursor-pointer">Accompte</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentForm.paymentType === 'deposit' && (
                  <div>
                    <Label className="text-xs font-medium">Montant de l&apos;accompte</Label>
                    <Input
                      className="mt-1"
                      type="number"
                      placeholder="0"
                      value={paymentForm.depositAmount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, depositAmount: e.target.value })}
                    />
                    {paymentForm.depositAmount && parseFloat(paymentForm.depositAmount) > 0 && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        Reste à payer : {formatPrice(showPaymentDialog.price - parseFloat(paymentForm.depositAmount))}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label className="text-xs font-medium">Mode de paiement</Label>
                  <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v as CollectorPayment['paymentMethod'] })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="especes">
                        <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> Espèces</div>
                      </SelectItem>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Mobile Money</div>
                      </SelectItem>
                      <SelectItem value="virement">
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Virement</div>
                      </SelectItem>
                      <SelectItem value="cheque">
                        <div className="flex items-center gap-2"><BadgeDollarSign className="w-4 h-4" /> Chèque</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-2">Récapitulatif</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Montant total</span>
                    <span>{formatPrice(showPaymentDialog.price)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Montant payé</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatPrice(paymentForm.paymentType === 'full' ? showPaymentDialog.price : parseFloat(paymentForm.depositAmount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Reste</span>
                    <span className={`font-medium ${paymentForm.paymentType === 'full' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPrice(paymentForm.paymentType === 'full' ? 0 : showPaymentDialog.price - (parseFloat(paymentForm.depositAmount) || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(null)}>Annuler</Button>
                <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handlePayment}>
                  <CreditCard className="w-4 h-4 mr-1" />
                  Confirmer le paiement
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Label Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!showLabelDetail} onOpenChange={() => setShowLabelDetail(null)}>
        <DialogContent className="max-w-md">
          {showLabelDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Étiquette — {showLabelDetail.trackingNumber}
                </DialogTitle>
                <DialogDescription>{showLabelDetail.blNumber}</DialogDescription>
              </DialogHeader>

              <div className="border-2 border-teal-500 rounded-xl p-4 space-y-3">
                <div className="text-center border-b border-dashed border-gray-300 pb-3">
                  <h3 className="text-lg font-bold text-teal-600">GUINÉE LOGISTIQUE</h3>
                  <Badge className={`text-[10px] ${showLabelDetail.blType === 'ramasse' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'}`}>
                    {showLabelDetail.blType === 'ramasse' ? 'RAMASSE' : 'LIVRAISON'}
                  </Badge>
                </div>

                <div className="text-center bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                  <p className="text-xl font-mono font-bold tracking-wider">{showLabelDetail.trackingNumber}</p>
                  <p className="text-2xl font-mono mt-2 text-gray-400">||||||||||||||||||||||</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 mb-0.5">Expéditeur</p>
                    <p className="font-medium">{showLabelDetail.senderName}</p>
                    <p className="text-gray-500">{showLabelDetail.senderPhone && `${showLabelDetail.senderPhone} · `}{showLabelDetail.senderAddress}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 mb-0.5">Destinataire</p>
                    <p className="font-medium">{showLabelDetail.receiverName}</p>
                    <p className="text-gray-500">{showLabelDetail.receiverPhone && `${showLabelDetail.receiverPhone} · `}{showLabelDetail.receiverAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center border-t border-dashed border-gray-300 pt-3">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400">Poids</p>
                    <p className="text-sm font-bold">{showLabelDetail.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400">Dimensions</p>
                    <p className="text-sm font-bold">{showLabelDetail.dimensions}</p>
                  </div>
                </div>

                <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <p className="text-2xl">⬛⬜⬛⬜⬛⬜⬛⬜</p>
                  <p className="text-[10px] text-gray-400 mt-1">QR Code — {showLabelDetail.trackingNumber}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLabelDetail(null)}>Fermer</Button>
                <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => handlePrintLabel(showLabelDetail)}>
                  <Printer className="w-4 h-4 mr-1" />
                  Imprimer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Label Preview Dialog (for card view) ───────────────────────────── */}
      <Dialog open={!!showLabelPreview} onOpenChange={() => setShowLabelPreview(null)}>
        <DialogContent className="max-w-md">
          {showLabelPreview && (
            <>
              <DialogHeader>
                <DialogTitle>Aperçu — {showLabelPreview.trackingNumber}</DialogTitle>
                <DialogDescription>{showLabelPreview.blNumber}</DialogDescription>
              </DialogHeader>

              <div className="border-2 border-teal-500 rounded-xl p-4 space-y-3">
                <div className="text-center border-b border-dashed border-gray-300 pb-3">
                  <h3 className="text-lg font-bold text-teal-600">GUINÉE LOGISTIQUE</h3>
                  <Badge className={`text-[10px] ${showLabelPreview.blType === 'ramasse' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'}`}>
                    {showLabelPreview.blType === 'ramasse' ? 'RAMASSE' : 'LIVRAISON'}
                  </Badge>
                </div>

                <div className="text-center bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                  <p className="text-xl font-mono font-bold tracking-wider">{showLabelPreview.trackingNumber}</p>
                  <p className="text-2xl font-mono mt-2 text-gray-400">||||||||||||||||||||||</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 mb-0.5">Expéditeur</p>
                    <p className="font-medium">{showLabelPreview.senderName}</p>
                    <p className="text-gray-500">{showLabelPreview.senderPhone && `${showLabelPreview.senderPhone} · `}{showLabelPreview.senderAddress}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 mb-0.5">Destinataire</p>
                    <p className="font-medium">{showLabelPreview.receiverName}</p>
                    <p className="text-gray-500">{showLabelPreview.receiverPhone && `${showLabelPreview.receiverPhone} · `}{showLabelPreview.receiverAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center border-t border-dashed border-gray-300 pt-3">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400">Poids</p>
                    <p className="text-sm font-bold">{showLabelPreview.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400">Dimensions</p>
                    <p className="text-sm font-bold">{showLabelPreview.dimensions}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLabelPreview(null)}>Fermer</Button>
                <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => handlePrintLabel(showLabelPreview)}>
                  <Printer className="w-4 h-4 mr-1" />
                  Imprimer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
