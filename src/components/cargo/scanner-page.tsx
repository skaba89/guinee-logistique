'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  QrCode,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  Search,
  Clock,
  Package,
  Ship,
  Plane,
  Truck,
  Container,
  FileCheck,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Zap,
  X,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Tag,
  Box,
  Hash,
  Globe,
  ArrowRight,
  Eye,
  Layers,
  CheckCheck,
  FileText,
  CircleDot,
  BarChart3,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type ScanType = 'tracking' | 'container' | 'awb' | 'parcel' | 'customs' | 'warehouse';
type ScanStatus = 'verified' | 'pending' | 'anomaly' | 'unknown';

interface ScanRecord {
  id: string;
  code: string;
  type: ScanType;
  status: ScanStatus;
  timestamp: string;
  user: string;
  description: string;
  origin?: string;
  destination?: string;
  client?: string;
  weight?: string;
  reference?: string;
}

interface QRGeneration {
  id: string;
  code: string;
  label: string;
  type: ScanType;
  createdAt: string;
  data: string;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const scanTypeLabels: Record<ScanType, string> = {
  tracking: 'Suivi',
  container: 'Conteneur',
  awb: 'LTA/AWB',
  parcel: 'Colis',
  customs: 'Douane',
  warehouse: 'Entrepôt',
};

const scanTypeIcons: Record<ScanType, React.ElementType> = {
  tracking: Package,
  container: Container,
  awb: Plane,
  parcel: Box,
  customs: FileCheck,
  warehouse: Globe,
};

const scanTypeColors: Record<ScanType, string> = {
  tracking: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  container: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  awb: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  parcel: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  customs: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warehouse: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const scanStatusLabels: Record<ScanStatus, string> = {
  verified: 'Vérifié',
  pending: 'En attente',
  anomaly: 'Anomalie',
  unknown: 'Inconnu',
};

const scanStatusColors: Record<ScanStatus, string> = {
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  anomaly: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const scanStatusIcons: Record<ScanStatus, React.ElementType> = {
  verified: CheckCircle2,
  pending: Clock,
  anomaly: AlertTriangle,
  unknown: CircleDot,
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const recentScans: ScanRecord[] = [
  { id: 's1', code: 'FFP-0001-2026', type: 'tracking', status: 'verified', timestamp: '2026-03-04T14:32:00', user: 'Ahmed B.', description: 'Expédition Alger → Paris', origin: 'Alger', destination: 'Paris', client: 'Sarl TechnoPlus', weight: '450 kg', reference: 'BL-2026-001' },
  { id: 's2', code: 'MSKU-7234561', type: 'container', status: 'verified', timestamp: '2026-03-04T14:28:00', user: 'Ahmed B.', description: 'Conteneur 40ft Marseille', origin: 'Marseille', destination: 'Alger', client: 'SPA HydroServices', weight: '18 500 kg', reference: 'BKG-2026-045' },
  { id: 's3', code: '125-12345678', type: 'awb', status: 'verified', timestamp: '2026-03-04T14:15:00', user: 'Samira K.', description: 'AWB Air Algérie Alger → Dubaï', origin: 'Alger', destination: 'Dubaï', client: 'EURL BatiPlus', weight: '320 kg', reference: 'LTA-2026-012' },
  { id: 's4', code: 'DHL-9876543210', type: 'parcel', status: 'anomaly', timestamp: '2026-03-04T13:58:00', user: 'Ahmed B.', description: 'Colis express — poids non conforme', origin: 'Istanbul', destination: 'Alger', client: 'Karim D.', weight: '5.2 kg', reference: 'PCS-2026-089' },
  { id: 's5', code: 'DD-2026-0003', type: 'customs', status: 'verified', timestamp: '2026-03-04T13:45:00', user: 'Youcef M.', description: 'Déclaration import électronique', origin: 'Shanghai', destination: 'Alger', client: 'Sarl ElectroDZ', weight: '2 800 kg', reference: 'DD-2026-003' },
  { id: 's6', code: 'WH-ELEC-003', type: 'warehouse', status: 'anomaly', timestamp: '2026-03-04T13:30:00', user: 'Samira K.', description: 'Stock bas — câbles HDMI', origin: 'Zone A', destination: 'Alger', client: 'Sarl TechnoPlus', weight: '45 kg', reference: 'WH-A-02-01' },
  { id: 's7', code: 'FFP-0005-2026', type: 'tracking', status: 'verified', timestamp: '2026-03-04T12:55:00', user: 'Ahmed B.', description: 'Expédition Casablanca → Dakar', origin: 'Casablanca', destination: 'Dakar', client: 'Mohamed A.', weight: '1 200 kg', reference: 'BL-2026-005' },
  { id: 's8', code: 'TEMU-9987654', type: 'container', status: 'pending', timestamp: '2026-03-04T12:40:00', user: 'Youcef M.', description: 'Conteneur 20ft Barcelone', origin: 'Barcelone', destination: 'Alger', client: 'Nadia B.', weight: '12 000 kg', reference: 'BKG-2026-052' },
  { id: 's9', code: '020-87654321', type: 'awb', status: 'verified', timestamp: '2026-03-04T12:20:00', user: 'Samira K.', description: 'AWB Turkish Airlines Istanbul → Alger', origin: 'Istanbul', destination: 'Alger', client: 'SPA TextilMaghreb', weight: '680 kg', reference: 'LTA-2026-018' },
  { id: 's10', code: 'FDX-5551234567', type: 'parcel', status: 'verified', timestamp: '2026-03-04T11:50:00', user: 'Ahmed B.', description: 'Colis FedEx New York → Alger', origin: 'New York', destination: 'Alger', client: 'Entreprise Bouzidi', weight: '3.8 kg', reference: 'PCS-2026-042' },
  { id: 's11', code: 'DD-2026-0007', type: 'customs', status: 'pending', timestamp: '2026-03-04T11:35:00', user: 'Youcef M.', description: 'Déclaration export textile', origin: 'Alger', destination: 'Marseille', client: 'SPA TextilMaghreb', weight: '5 600 kg', reference: 'DD-2026-007' },
  { id: 's12', code: 'FFP-0008-2026', type: 'tracking', status: 'unknown', timestamp: '2026-03-04T11:10:00', user: 'Samira K.', description: 'Code non trouvé dans le système', origin: '', destination: '', client: '', weight: '', reference: '' },
  { id: 's13', code: 'CSLU-8912345', type: 'container', status: 'verified', timestamp: '2026-03-04T10:45:00', user: 'Ahmed B.', description: 'Conteneur 40ft HC Shanghai', origin: 'Shanghai', destination: 'Alger', client: 'Sarl ElectroDZ', weight: '22 000 kg', reference: 'BKG-2026-031' },
  { id: 's14', code: 'WH-ALIM-002', type: 'warehouse', status: 'verified', timestamp: '2026-03-04T10:30:00', user: 'Youcef M.', description: 'Huile d\'olive extra vierge', origin: 'Zone C', destination: 'Alger', client: 'Sarl AgriPro', weight: '850 kg', reference: 'WH-C-03-02' },
  { id: 's15', code: 'ARX-7778889900', type: 'parcel', status: 'verified', timestamp: '2026-03-04T10:05:00', user: 'Samira K.', description: 'Colis Aramex Dubaï → Alger', origin: 'Dubaï', destination: 'Alger', client: 'Fatima Z.', weight: '2.1 kg', reference: 'PCS-2026-067' },
];

const qrGenerations: QRGeneration[] = [
  { id: 'qr1', code: 'QR-FFP-0001', label: 'FFP-0001-2026', type: 'tracking', createdAt: '2026-03-04T14:00:00', data: 'FFP-0001-2026|Alger|Paris|Sarl TechnoPlus' },
  { id: 'qr2', code: 'QR-MSKU-723', label: 'MSKU-7234561', type: 'container', createdAt: '2026-03-04T13:30:00', data: 'MSKU-7234561|Marseille|Alger|BKG-2026-045' },
  { id: 'qr3', code: 'QR-125-AWB', label: '125-12345678', type: 'awb', createdAt: '2026-03-04T12:45:00', data: '125-12345678|Alger|Dubaï|LTA-2026-012' },
  { id: 'qr4', code: 'QR-DHL-987', label: 'DHL-9876543210', type: 'parcel', createdAt: '2026-03-04T11:30:00', data: 'DHL-9876543210|Istanbul|Alger|PCS-2026-089' },
  { id: 'qr5', code: 'QR-DD-003', label: 'DD-2026-0003', type: 'customs', createdAt: '2026-03-04T10:15:00', data: 'DD-2026-0003|Shanghai|Alger|Import' },
  { id: 'qr6', code: 'QR-WH-ELEC', label: 'WH-ELEC-003', type: 'warehouse', createdAt: '2026-03-04T09:30:00', data: 'WH-ELEC-003|Zone A|Alger|Stock' },
  { id: 'qr7', code: 'QR-FFP-0005', label: 'FFP-0005-2026', type: 'tracking', createdAt: '2026-03-04T08:45:00', data: 'FFP-0005-2026|Casablanca|Dakar|Mohamed A.' },
  { id: 'qr8', code: 'QR-TEMU-998', label: 'TEMU-9987654', type: 'container', createdAt: '2026-03-03T16:30:00', data: 'TEMU-9987654|Barcelone|Alger|BKG-2026-052' },
];

// Stats by type
const scansByType = [
  { name: 'Suivi', value: 42, color: '#0d9488' },
  { name: 'Conteneur', value: 28, color: '#059669' },
  { name: 'LTA/AWB', value: 18, color: '#0891b2' },
  { name: 'Colis', value: 35, color: '#7c3aed' },
  { name: 'Douane', value: 15, color: '#d97706' },
  { name: 'Entrepôt', value: 22, color: '#dc2626' },
];

// Stats by hour
const scansByHour = [
  { hour: '06h', scans: 2 },
  { hour: '07h', scans: 5 },
  { hour: '08h', scans: 12 },
  { hour: '09h', scans: 18 },
  { hour: '10h', scans: 22 },
  { hour: '11h', scans: 28 },
  { hour: '12h', scans: 15 },
  { hour: '13h', scans: 20 },
  { hour: '14h', scans: 32 },
  { hour: '15h', scans: 25 },
  { hour: '16h', scans: 18 },
  { hour: '17h', scans: 10 },
];

// Scans by user
const scansByUser = [
  { name: 'Ahmed B.', scans: 45 },
  { name: 'Samira K.', scans: 38 },
  { name: 'Youcef M.', scans: 29 },
  { name: 'Nadia B.', scans: 18 },
];

// Weekly trend
const weeklyTrend = [
  { day: 'Lun', scans: 48 },
  { day: 'Mar', scans: 62 },
  { day: 'Mer', scans: 55 },
  { day: 'Jeu', scans: 71 },
  { day: 'Ven', scans: 58 },
  { day: 'Sam', scans: 22 },
  { day: 'Dim', scans: 8 },
];

// ─── QR Code SVG Generator ──────────────────────────────────────────────────

function generateQRPattern(seed: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Simple hash from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          if (row + r < size && col + c < size) grid[row + r][col + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Fill data area with pseudo-random pattern based on seed
  let rng = Math.abs(hash) || 1;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern areas
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= size - 8;
      const inFinder3 = r >= size - 8 && c < 8;
      if (inFinder1 || inFinder2 || inFinder3) continue;
      if (r === 6 || c === 6) continue;

      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      grid[r][c] = (rng % 3) !== 0;
    }
  }

  return grid;
}

function QRCodeSVG({ code, size = 160 }: { code: string; size?: number }) {
  const pattern = useMemo(() => generateQRPattern(code), [code]);
  const gridSize = pattern.length;
  const cellSize = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <rect width={size} height={size} fill="white" rx="4" />
      {pattern.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
              rx="0.5"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── KPI Data ────────────────────────────────────────────────────────────────

const kpis = [
  { title: 'Scans Aujourd\'hui', value: 160, icon: ScanLine, color: 'from-teal-500 to-teal-600', change: '+12%' },
  { title: 'Colis Vérifiés', value: 142, icon: CheckCircle2, color: 'from-emerald-500 to-green-600', change: '+8%' },
  { title: 'Anomalies Détectées', value: 7, icon: AlertTriangle, color: 'from-orange-500 to-amber-600', change: '-3%' },
  { title: 'Taux de Conformité', value: '95.6%', icon: CheckCheck, color: 'from-cyan-500 to-teal-600', change: '+1.2%' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [manualCode, setManualCode] = useState('');
  const [codeType, setCodeType] = useState<ScanType>('tracking');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [scanResult, setScanResult] = useState<ScanRecord | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Bulk scan state
  const [bulkScans, setBulkScans] = useState<ScanRecord[]>([]);
  const [selectedBulkIds, setSelectedBulkIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  // QR generation state
  const [qrLabel, setQrLabel] = useState('');
  const [qrData, setQrData] = useState('');
  const [qrType, setQrType] = useState<ScanType>('tracking');
  const [generatedQR, setGeneratedQR] = useState<QRGeneration | null>(null);

  // History filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');

  // Simulate a scan
  const handleScan = useCallback((code: string, type: ScanType) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const matchedScan = recentScans.find(s => s.code === code);
      const result: ScanRecord = matchedScan || {
        id: `s-${Date.now()}`,
        code,
        type,
        status: code.length > 5 ? 'verified' : 'unknown',
        timestamp: new Date().toISOString(),
        user: 'Ahmed B.',
        description: code.length > 5 ? `Code ${code} scanné avec succès` : 'Code non reconnu',
      };
      setScanResult(result);
      setShowResultDialog(true);
      if (!bulkScans.find(s => s.code === code)) {
        setBulkScans(prev => [result, ...prev]);
      }
    }, 1500);
  }, [bulkScans]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleScan(manualCode.trim(), codeType);
      setManualCode('');
    }
  };

  const handleDemoScan = () => {
    const demoCodes = recentScans.slice(0, 5);
    const randomScan = demoCodes[Math.floor(Math.random() * demoCodes.length)];
    handleScan(randomScan.code, randomScan.type);
  };

  // Bulk operations
  const toggleBulkSelect = (id: string) => {
    setSelectedBulkIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllBulk = () => {
    if (selectedBulkIds.size === bulkScans.length) {
      setSelectedBulkIds(new Set());
    } else {
      setSelectedBulkIds(new Set(bulkScans.map(s => s.id)));
    }
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedBulkIds.size > 0) {
      setBulkScans(prev => prev.filter(s => !selectedBulkIds.has(s.id)));
      setSelectedBulkIds(new Set());
      setBulkAction('');
    }
  };

  // Filtered history
  const filteredHistory = recentScans.filter(s => {
    const matchSearch = historySearch === '' ||
      s.code.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.description.toLowerCase().includes(historySearch.toLowerCase());
    const matchType = historyTypeFilter === 'all' || s.type === historyTypeFilter;
    const matchStatus = historyStatusFilter === 'all' || s.status === historyStatusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Generate QR
  const handleGenerateQR = () => {
    if (qrLabel.trim() && qrData.trim()) {
      const newQR: QRGeneration = {
        id: `qr-${Date.now()}`,
        code: `QR-${Date.now().toString(36).toUpperCase()}`,
        label: qrLabel.trim(),
        type: qrType,
        createdAt: new Date().toISOString(),
        data: qrData.trim(),
      };
      setGeneratedQR(newQR);
    }
  };

  // Format timestamp
  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-teal-500" />
            Scanner & Codes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lecture de codes-barres, QR codes et gestion des scans</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDemoScan} className="h-9">
            <Zap className="w-4 h-4 mr-2 text-amber-500" />
            Scan démo
          </Button>
          <Button className="text-white h-9" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setActiveTab('generate')}>
            <QrCode className="w-4 h-4 mr-2" />
            Générer QR
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                    </p>
                    <p className={`text-[10px] mt-0.5 font-medium ${kpi.change.startsWith('+') ? 'text-green-600' : kpi.change.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                      {kpi.change} vs hier
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="scanner" className="gap-1.5">
            <ScanLine className="w-4 h-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-1.5">
            <QrCode className="w-4 h-4" />
            Générer QR
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="w-4 h-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ SCANNER TAB ═══════════ */}
        <TabsContent value="scanner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel — Scan Interface + Manual Entry */}
            <div className="lg:col-span-2 space-y-6">
              {/* Camera Viewfinder */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-teal-500" />
                    Interface de scan
                  </CardTitle>
                  <CardDescription>Scannez un code-barres ou QR code</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="relative aspect-[4/3] max-h-80 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
                    {/* Viewfinder frame */}
                    <div className="absolute inset-6 sm:inset-10">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-teal-400 rounded-tl-sm" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-teal-400 rounded-tr-sm" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-teal-400 rounded-bl-sm" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-teal-400 rounded-br-sm" />

                      {/* Scanning laser line animation */}
                      <AnimatePresence>
                        {isScanning && (
                          <motion.div
                            className="absolute left-0 right-0 h-0.5"
                            style={{ background: 'linear-gradient(90deg, transparent, #0d9488, #14b8a6, #0d9488, transparent)', boxShadow: '0 0 12px 3px rgba(13,148,136,0.4)' }}
                            initial={{ top: '0%' }}
                            animate={{ top: ['0%', '100%', '0%'] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Center target */}
                      {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 rounded-full border-2 border-teal-400/40 flex items-center justify-center"
                          >
                            <ScanLine className="w-8 h-8 text-teal-400/60" />
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Status text */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <AnimatePresence mode="wait">
                        {isScanning ? (
                          <motion.p
                            key="scanning"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm font-medium text-teal-400"
                          >
                            Scan en cours...
                          </motion.p>
                        ) : (
                          <motion.p
                            key="ready"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-gray-400"
                          >
                            Prêt à scanner — entrez un code ou utilisez le scan démo
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Pulsing overlay when scanning */}
                    {isScanning && (
                      <motion.div
                        className="absolute inset-0 bg-teal-500/5"
                        animate={{ opacity: [0, 0.1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Quick scan buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={handleDemoScan} disabled={isScanning} className="h-8 text-xs">
                      <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                      Scan aléatoire
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleScan('FFP-0001-2026', 'tracking')} disabled={isScanning} className="h-8 text-xs">
                      <Package className="w-3.5 h-3.5 mr-1.5 text-teal-500" />
                      FFP-0001-2026
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleScan('MSKU-7234561', 'container')} disabled={isScanning} className="h-8 text-xs">
                      <Container className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      MSKU-7234561
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleScan('125-12345678', 'awb')} disabled={isScanning} className="h-8 text-xs">
                      <Plane className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                      125-12345678
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Code Entry */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-emerald-500" />
                    Saisie manuelle
                  </CardTitle>
                  <CardDescription>Entrez un numéro de suivi, conteneur ou LTA</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Entrez le code... (ex: FFP-0001-2026)"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                          className="pl-9 h-10 font-mono"
                          disabled={isScanning}
                        />
                      </div>
                    </div>
                    <Select value={codeType} onValueChange={(v) => setCodeType(v as ScanType)}>
                      <SelectTrigger className="w-full sm:w-40 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(scanTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="text-white h-10 px-6"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                      onClick={handleManualSubmit}
                      disabled={isScanning || !manualCode.trim()}
                    >
                      <ScanLine className="w-4 h-4 mr-2" />
                      Scanner
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Scan Section */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-500" />
                      Scan en lot
                    </CardTitle>
                    {bulkScans.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                        {bulkScans.length} élément(s)
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Scannez plusieurs éléments et effectuez des opérations par lot</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {bulkScans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucun élément scanné en lot</p>
                      <p className="text-xs mt-1">Utilisez le scanner ou la saisie manuelle pour ajouter des éléments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Bulk action bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedBulkIds.size === bulkScans.length && bulkScans.length > 0}
                            onCheckedChange={selectAllBulk}
                          />
                          <span className="text-xs text-gray-500">{selectedBulkIds.size} sélectionné(s)</span>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-auto">
                          <Select value={bulkAction} onValueChange={setBulkAction}>
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue placeholder="Action par lot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="status_verified">Marquer vérifié</SelectItem>
                              <SelectItem value="status_pending">Marquer en attente</SelectItem>
                              <SelectItem value="assign">Assigner à expédition</SelectItem>
                              <SelectItem value="delete">Supprimer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="h-8 text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} disabled={!bulkAction || selectedBulkIds.size === 0} onClick={handleBulkAction}>
                            Appliquer
                          </Button>
                        </div>
                      </div>

                      {/* Bulk scan list */}
                      <div className="max-h-60 overflow-y-auto space-y-1.5">
                        {bulkScans.map((scan) => {
                          const TypeIcon = scanTypeIcons[scan.type];
                          const StatusIcon = scanStatusIcons[scan.status];
                          return (
                            <motion.div
                              key={scan.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                                selectedBulkIds.has(scan.id)
                                  ? 'border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                              onClick={() => toggleBulkSelect(scan.id)}
                            >
                              <Checkbox checked={selectedBulkIds.has(scan.id)} onCheckedChange={() => toggleBulkSelect(scan.id)} />
                              <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${scanTypeColors[scan.type]}`}>
                                <TypeIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{scan.code}</p>
                                <p className="text-[10px] text-gray-500 truncate">{scan.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <StatusIcon className={`w-3.5 h-3.5 ${scan.status === 'verified' ? 'text-green-500' : scan.status === 'anomaly' ? 'text-red-500' : scan.status === 'pending' ? 'text-amber-500' : 'text-gray-400'}`} />
                                <span className="text-[9px] text-gray-400">{formatTime(scan.timestamp)}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel — Recent Scans */}
            <div className="space-y-6">
              {/* Recent Scans List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-500" />
                    Scans récents
                  </CardTitle>
                  <CardDescription>Derniers codes scannés</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {recentScans.slice(0, 10).map((scan, index) => {
                      const TypeIcon = scanTypeIcons[scan.type];
                      const StatusIcon = scanStatusIcons[scan.status];
                      return (
                        <motion.div
                          key={scan.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedScan(scan)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${scanTypeColors[scan.type]}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white truncate">{scan.code}</p>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">{scan.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <StatusIcon className={`w-3.5 h-3.5 ${scan.status === 'verified' ? 'text-green-500' : scan.status === 'anomaly' ? 'text-red-500' : scan.status === 'pending' ? 'text-amber-500' : 'text-gray-400'}`} />
                            <span className="text-[9px] text-gray-400">{formatTime(scan.timestamp)}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Résumé du jour
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {scansByType.map((item) => (
                      <div key={item.name} className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">{item.name}</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.value}</span>
                        <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-1.5 rounded-full" style={{ width: `${(item.value / 42) * 100}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════ GENERATE QR TAB ═══════════ */}
        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Generator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-500" />
                  Générateur de QR Code
                </CardTitle>
                <CardDescription>Créez un QR code pour vos expéditions et colis</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Libellé</Label>
                  <Input
                    placeholder="Ex: FFP-0001-2026"
                    value={qrLabel}
                    onChange={(e) => setQrLabel(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <Select value={qrType} onValueChange={(v) => setQrType(v as ScanType)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(scanTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Données encodées</Label>
                  <Input
                    placeholder="Ex: FFP-0001-2026|Alger|Paris|Client"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white h-10"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                    onClick={handleGenerateQR}
                    disabled={!qrLabel.trim() || !qrData.trim()}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Générer le QR Code
                  </Button>
                  {generatedQR && (
                    <Button variant="outline" className="h-10" onClick={() => { setQrLabel(''); setQrData(''); setGeneratedQR(null); }}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Generated QR Code Preview */}
                <AnimatePresence>
                  {generatedQR && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10"
                    >
                      <QRCodeSVG code={generatedQR.data} size={180} />
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{generatedQR.label}</p>
                        <Badge variant="secondary" className={`text-[10px] mt-1 ${scanTypeColors[generatedQR.type]}`}>
                          {scanTypeLabels[generatedQR.type]}
                        </Badge>
                        <p className="text-[10px] text-gray-500 mt-2 font-mono max-w-[200px] truncate">{generatedQR.data}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Previous QR Generations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  QR Codes générés
                </CardTitle>
                <CardDescription>Historique des QR codes créés</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {qrGenerations.map((qr, index) => {
                    const TypeIcon = scanTypeIcons[qr.type];
                    return (
                      <motion.div
                        key={qr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <QRCodeSVG code={qr.data} size={64} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{qr.label}</p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <TypeIcon className="w-3 h-3 text-gray-400" />
                              <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${scanTypeColors[qr.type]}`}>
                                {scanTypeLabels[qr.type]}
                              </Badge>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1">{formatDate(qr.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                            <Copy className="w-3 h-3 mr-1" />
                            Copier
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-red-500">
                            <Trash2 className="w-3 h-3 mr-1" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════ HISTORY TAB ═══════════ */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                Historique des scans
              </CardTitle>
              <CardDescription>Tous les scans effectués récemment</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher code, description..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    {Object.entries(scanTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    {Object.entries(scanStatusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Description</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Utilisateur</TableHead>
                      <TableHead className="text-xs">Heure</TableHead>
                      <TableHead className="text-xs"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((scan) => {
                      const TypeIcon = scanTypeIcons[scan.type];
                      return (
                        <TableRow
                          key={scan.id}
                          className="cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
                          onClick={() => setSelectedScan(scan)}
                        >
                          <TableCell className="font-mono text-xs font-semibold">{scan.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <TypeIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs">{scanTypeLabels[scan.type]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${scanStatusColors[scan.status]}`}>
                              {scanStatusLabels[scan.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell max-w-[200px] truncate">{scan.description}</TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">{scan.user}</TableCell>
                          <TableCell className="text-xs text-gray-500">{formatTime(scan.timestamp)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-1 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">{filteredHistory.length} scan(s) trouvé(s)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ STATISTICS TAB ═══════════ */}
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scans by Type - Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-500" />
                  Scans par type
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scansByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {scansByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [value.toLocaleString('fr-FR'), 'Scans']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {scansByType.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-gray-600 dark:text-gray-300">{item.name}</span>
                      <span className="text-[10px] font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scans by Hour - Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Scans par heure
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scansByHour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [value.toLocaleString('fr-FR'), 'Scans']}
                      />
                      <Bar dataKey="scans" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend - Line Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  Tendance hebdomadaire
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [value.toLocaleString('fr-FR'), 'Scans']}
                      />
                      <Line type="monotone" dataKey="scans" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 4 }} activeDot={{ r: 6, fill: '#0d9488' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Scans by User */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Scans par utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scansByUser} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={75} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [value.toLocaleString('fr-FR'), 'Scans']}
                      />
                      <Bar dataKey="scans" fill="#0891b2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════ SCAN RESULT DIALOG ═══════════ */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md">
          {scanResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {scanResult.status === 'verified' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : scanResult.status === 'anomaly' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : scanResult.status === 'pending' ? (
                    <Clock className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CircleDot className="w-5 h-5 text-gray-400" />
                  )}
                  Résultat du scan
                </DialogTitle>
                <DialogDescription>
                  {scanResult.status === 'verified' ? 'Code vérifié avec succès' : scanResult.status === 'anomaly' ? 'Anomalie détectée' : scanResult.status === 'pending' ? 'En attente de vérification' : 'Code non reconnu'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status banner */}
                <div className={`p-3 rounded-lg ${scanStatusColors[scanResult.status]} flex items-center gap-2`}>
                  {React.createElement(scanStatusIcons[scanResult.status], { className: 'w-4 h-4' })}
                  <span className="text-sm font-medium">{scanStatusLabels[scanResult.status]}</span>
                </div>

                {/* Code info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scanTypeColors[scanResult.type]}`}>
                      {React.createElement(scanTypeIcons[scanResult.type], { className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <p className="text-lg font-bold font-mono text-gray-900 dark:text-white">{scanResult.code}</p>
                      <Badge variant="secondary" className={`text-[10px] ${scanTypeColors[scanResult.type]}`}>
                        {scanTypeLabels[scanResult.type]}
                      </Badge>
                    </div>
                  </div>

                  {scanResult.description && (
                    <div>
                      <Label className="text-xs text-gray-500">Description</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{scanResult.description}</p>
                    </div>
                  )}

                  {scanResult.origin && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Origine</Label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-sm font-medium">{scanResult.origin}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Destination</Label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-sm font-medium">{scanResult.destination}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(scanResult.client || scanResult.weight || scanResult.reference) && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        {scanResult.client && (
                          <div>
                            <p className="text-[10px] text-gray-400">Client</p>
                            <p className="text-sm font-medium">{scanResult.client}</p>
                          </div>
                        )}
                        {scanResult.weight && (
                          <div>
                            <p className="text-[10px] text-gray-400">Poids</p>
                            <p className="text-sm font-medium">{scanResult.weight}</p>
                          </div>
                        )}
                        {scanResult.reference && (
                          <div>
                            <p className="text-[10px] text-gray-400">Référence</p>
                            <p className="text-sm font-mono text-xs">{scanResult.reference}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-gray-400">Scanné par</p>
                          <p className="text-sm font-medium">{scanResult.user}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9"
                    onClick={() => {
                      navigator.clipboard?.writeText(scanResult.code);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le code
                  </Button>
                  <Button
                    className="flex-1 h-9 text-white"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                    onClick={() => setShowResultDialog(false)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Valider
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════ SCAN DETAIL DIALOG ═══════════ */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-lg">
          {selectedScan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(scanTypeIcons[selectedScan.type], { className: 'w-5 h-5 text-teal-500' })}
                  Détail du scan
                </DialogTitle>
                <DialogDescription>{selectedScan.code}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status + Type */}
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`text-xs ${scanTypeColors[selectedScan.type]}`}>
                    {React.createElement(scanTypeIcons[selectedScan.type], { className: 'w-3.5 h-3.5 mr-1 inline' })}
                    {scanTypeLabels[selectedScan.type]}
                  </Badge>
                  <Badge variant="secondary" className={`text-xs ${scanStatusColors[selectedScan.status]}`}>
                    {scanStatusLabels[selectedScan.status]}
                  </Badge>
                </div>

                {/* QR Code of the scanned item */}
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <QRCodeSVG code={selectedScan.code} size={80} />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold font-mono text-gray-900 dark:text-white">{selectedScan.code}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{selectedScan.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-500">{formatDate(selectedScan.timestamp)} à {formatTime(selectedScan.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedScan.origin && (
                    <div>
                      <p className="text-[10px] text-gray-400">Origine</p>
                      <p className="text-sm font-medium">{selectedScan.origin}</p>
                    </div>
                  )}
                  {selectedScan.destination && (
                    <div>
                      <p className="text-[10px] text-gray-400">Destination</p>
                      <p className="text-sm font-medium">{selectedScan.destination}</p>
                    </div>
                  )}
                  {selectedScan.client && (
                    <div>
                      <p className="text-[10px] text-gray-400">Client</p>
                      <p className="text-sm font-medium">{selectedScan.client}</p>
                    </div>
                  )}
                  {selectedScan.weight && (
                    <div>
                      <p className="text-[10px] text-gray-400">Poids</p>
                      <p className="text-sm font-medium">{selectedScan.weight}</p>
                    </div>
                  )}
                  {selectedScan.reference && (
                    <div>
                      <p className="text-[10px] text-gray-400">Référence</p>
                      <p className="text-sm font-mono text-xs">{selectedScan.reference}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400">Utilisateur</p>
                    <p className="text-sm font-medium">{selectedScan.user}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-9" onClick={() => navigator.clipboard?.writeText(selectedScan.code)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                  <Button variant="outline" className="h-9" onClick={() => setSelectedScan(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Missing Icon Fallback ───────────────────────────────────────────────────
// Using a simple keyboard icon substitute since lucide-react might not export Keyboard
function Keyboard(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
      <path d="M6 10h.01" />
      <path d="M10 10h.01" />
      <path d="M14 10h.01" />
      <path d="M18 10h.01" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M7 18h10" />
    </svg>
  );
}
