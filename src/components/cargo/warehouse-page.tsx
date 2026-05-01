'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Warehouse,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  Search,
  AlertTriangle,
  AlertCircle,
  Clock,
  Truck,
  Calendar,
  CheckCircle2,
  XCircle,
  Timer,
  MapPin,
  TrendingDown,
  TrendingUp,
  Box,
  Pencil,
  Trash2,
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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { warehouseItems, warehouseStatusLabels, formatDate } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

const warehouseStatusColors: Record<string, string> = {
  stored: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  reserved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  outbound: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  damaged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Zone occupation data
const warehouseZones = [
  { id: 'A', name: 'Zone A', usage: 78, capacity: 500, current: 390, color: '#0d9488', label: 'Électronique & High-Tech' },
  { id: 'B', name: 'Zone B', usage: 45, capacity: 400, current: 180, color: '#059669', label: 'Textile & Habillement' },
  { id: 'C', name: 'Zone C', usage: 92, capacity: 350, current: 322, color: '#dc2626', label: 'Alimentaire & Périssable' },
  { id: 'D', name: 'Zone D', usage: 28, capacity: 300, current: 84, color: '#0891b2', label: 'Matériaux & Construction' },
];

// Inbound/Outbound stats for today
const todayStats = {
  inbound: { count: 12, items: 847, weight: 4520, pending: 3, completed: 7, inProgress: 2 },
  outbound: { count: 8, items: 523, weight: 2890, pending: 2, completed: 4, inProgress: 2 },
};

// Inbound records
const inboundRecords = [
  { ref: 'ENT-2026-045', client: 'Sarl TechnoPlus', items: 85, weight: 450, status: 'completed', arrival: '08:30', dock: 'Q1' },
  { ref: 'ENT-2026-046', client: 'SPA HydroServices', items: 120, weight: 890, status: 'in_progress', arrival: '09:15', dock: 'Q3' },
  { ref: 'ENT-2026-047', client: 'EURL BatiPlus', items: 200, weight: 1200, status: 'pending', arrival: '10:00', dock: 'Q2' },
  { ref: 'ENT-2026-048', client: 'Sarl AgriPro', items: 65, weight: 380, status: 'pending', arrival: '11:30', dock: 'Q4' },
  { ref: 'ENT-2026-049', client: 'SPA TextilMaghreb', items: 150, weight: 720, status: 'completed', arrival: '07:45', dock: 'Q1' },
  { ref: 'ENT-2026-050', client: 'Karim Djebbar', items: 42, weight: 210, status: 'in_progress', arrival: '10:30', dock: 'Q2' },
];

const outboundRecords = [
  { ref: 'SOR-2026-038', client: 'Entreprise Bouzidi', items: 95, weight: 560, status: 'completed', departure: '09:00', dock: 'Q1' },
  { ref: 'SOR-2026-039', client: 'Nadia Benmoussa', items: 30, weight: 145, status: 'in_progress', departure: '10:30', dock: 'Q3' },
  { ref: 'SOR-2026-040', client: 'Mohamed Amrani', items: 78, weight: 420, status: 'pending', departure: '12:00', dock: 'Q2' },
  { ref: 'SOR-2026-041', client: 'Sarl ElectroDZ', items: 110, weight: 680, status: 'pending', departure: '14:00', dock: 'Q4' },
];

// Inventory alerts
const inventoryAlerts = [
  { type: 'low_stock', sku: 'WH-ELEC-003', name: 'Câbles HDMI 2m', current: 5, threshold: 50, zone: 'A-02-01', severity: 'critical' },
  { type: 'low_stock', sku: 'WH-TEXT-007', name: 'Tissu coton premium', current: 12, threshold: 30, zone: 'B-01-05', severity: 'warning' },
  { type: 'low_stock', sku: 'WH-ALIM-002', name: 'Huile d\'olive extra vierge', current: 8, threshold: 40, zone: 'C-03-02', severity: 'critical' },
  { type: 'overstock', sku: 'WH-MATR-001', name: 'Ciment Portland 50kg', current: 850, threshold: 500, zone: 'D-01-01', severity: 'warning' },
  { type: 'overstock', sku: 'WH-ELEC-009', name: 'Chargeurs USB-C', current: 1200, threshold: 800, zone: 'A-04-03', severity: 'info' },
  { type: 'damaged', sku: 'WH-ALIM-005', name: 'Confiture figue', current: 15, threshold: 0, zone: 'C-02-04', severity: 'critical' },
  { type: 'expiry', sku: 'WH-ALIM-008', name: 'Lait UHT 1L', current: 200, threshold: 0, zone: 'C-01-02', severity: 'warning' },
];

const alertSeverityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
};

const alertTypeIcons: Record<string, typeof AlertTriangle> = {
  low_stock: TrendingDown,
  overstock: TrendingUp,
  damaged: XCircle,
  expiry: Timer,
};

const alertTypeLabels: Record<string, string> = {
  low_stock: 'Stock bas',
  overstock: 'Surstock',
  damaged: 'Endommagé',
  expiry: 'Expiration',
};

// Dock scheduling
const dockSchedule = [
  { dock: 'Quai 1', schedule: [
    { time: '07:45', ref: 'ENT-049', type: 'inbound', status: 'completed', carrier: 'Express Logistics' },
    { time: '08:30', ref: 'ENT-045', type: 'inbound', status: 'completed', carrier: 'FastCargo DZ' },
    { time: '09:00', ref: 'SOR-038', type: 'outbound', status: 'completed', carrier: 'TransMed' },
    { time: '11:00', ref: 'ENT-051', type: 'inbound', status: 'scheduled', carrier: 'Air Freight Express' },
    { time: '14:30', ref: 'SOR-043', type: 'outbound', status: 'scheduled', carrier: 'Maghreb Logistics' },
  ]},
  { dock: 'Quai 2', schedule: [
    { time: '10:00', ref: 'ENT-047', type: 'inbound', status: 'pending', carrier: 'EuroCargo' },
    { time: '10:30', ref: 'ENT-050', type: 'inbound', status: 'in_progress', carrier: 'Local Express' },
    { time: '12:00', ref: 'SOR-040', type: 'outbound', status: 'pending', carrier: 'Sahara Transport' },
    { time: '15:00', ref: 'ENT-052', type: 'inbound', status: 'scheduled', carrier: 'MedShipping' },
  ]},
  { dock: 'Quai 3', schedule: [
    { time: '09:15', ref: 'ENT-046', type: 'inbound', status: 'in_progress', carrier: 'HydroLog' },
    { time: '10:30', ref: 'SOR-039', type: 'outbound', status: 'in_progress', carrier: 'NordExpress' },
    { time: '13:00', ref: 'SOR-042', type: 'outbound', status: 'scheduled', carrier: 'QuickParcel' },
  ]},
  { dock: 'Quai 4', schedule: [
    { time: '11:30', ref: 'ENT-048', type: 'inbound', status: 'pending', carrier: 'AgriTrans' },
    { time: '14:00', ref: 'SOR-041', type: 'outbound', status: 'pending', carrier: 'BuildCargo' },
    { time: '16:00', ref: 'ENT-053', type: 'inbound', status: 'scheduled', carrier: 'DHL Express' },
  ]},
];

const dockStatusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const dockStatusLabels: Record<string, string> = {
  completed: 'Terminé',
  in_progress: 'En cours',
  pending: 'En attente',
  scheduled: 'Programmé',
};

const kpis = [
  { title: 'Total articles', value: warehouseItems.reduce((a, b) => a + b.quantity, 0), icon: Package, color: 'from-teal-500 to-teal-600' },
  { title: 'Espace disponible', value: '33%', icon: Warehouse, color: 'from-emerald-500 to-green-600' },
  { title: 'Entrées aujourd\'hui', value: todayStats.inbound.count, icon: ArrowDownToLine, color: 'from-sky-500 to-blue-600' },
  { title: 'Sorties aujourd\'hui', value: todayStats.outbound.count, icon: ArrowUpFromLine, color: 'from-orange-500 to-amber-600' },
];

type WarehouseStatus = 'stored' | 'reserved' | 'outbound' | 'damaged';

export default function WarehousePage() {
  const [data, setData] = useState(warehouseItems);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: '',
    quantity: '',
    location: '',
    clientName: '',
  });

  const [editItem, setEditItem] = useState<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    location: string;
    status: WarehouseStatus;
    clientName: string;
    weight: number;
  }>({
    id: '',
    name: '',
    category: '',
    quantity: 0,
    location: '',
    status: 'stored',
    clientName: '',
    weight: 0,
  });

  const canEditPage = useCargoStore((s) => s.canEdit);
  const pageSize = 8;

  const handleAddItem = () => {
    const item = {
      id: `wh${data.length + 1}-${Date.now()}`,
      sku: newItem.sku || 'WH-NEW-' + Math.random().toString(36).substring(2, 5).toUpperCase(),
      name: newItem.name,
      category: newItem.category,
      quantity: parseInt(newItem.quantity) || 0,
      location: newItem.location,
      entryDate: new Date().toISOString().split('T')[0],
      status: 'stored' as const,
      clientName: newItem.clientName,
      weight: 0,
    };
    setData([item, ...data]);
    setNewItem({ sku: '', name: '', category: '', quantity: '', location: '', clientName: '' });
    setShowAddDialog(false);
    setPage(0);
  };

  const handleOpenEdit = (item: typeof warehouseItems[number]) => {
    setEditItem({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      status: item.status,
      clientName: item.clientName,
      weight: item.weight,
    });
    setShowEditDialog(true);
  };

  const handleEditItem = () => {
    setData((prev) =>
      prev.map((item) =>
        item.id === editItem.id
          ? {
              ...item,
              name: editItem.name,
              category: editItem.category,
              quantity: editItem.quantity,
              location: editItem.location,
              status: editItem.status,
              clientName: editItem.clientName,
              weight: editItem.weight,
            }
          : item
      )
    );
    setShowEditDialog(false);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteItem = () => {
    if (deleteTarget) {
      setData((prev) => prev.filter((item) => item.id !== deleteTarget));
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const categories = [...new Set(data.map(item => item.category))];

  const filtered = data.filter(item => {
    const matchSearch = search === '' ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Render zone occupation SVG map
  const renderZoneMap = () => {
    const mapWidth = 400;
    const mapHeight = 280;
    const padding = 20;
    const zoneGap = 8;

    // Calculate zone positions in a 2x2 grid
    const zoneWidth = (mapWidth - padding * 2 - zoneGap) / 2;
    const zoneHeight = (mapHeight - padding * 2 - zoneGap) / 2;

    const zonePositions = [
      { x: padding, y: padding },
      { x: padding + zoneWidth + zoneGap, y: padding },
      { x: padding, y: padding + zoneHeight + zoneGap },
      { x: padding + zoneWidth + zoneGap, y: padding + zoneHeight + zoneGap },
    ];

    return (
      <svg width="100%" viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="overflow-visible">
        {/* Background */}
        <rect x="0" y="0" width={mapWidth} height={mapHeight} rx="8" fill="var(--muted)" opacity="0.3" />

        {/* Title */}
        <text x={mapWidth / 2} y={padding - 5} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10" fontWeight="600">
          PLAN DE L&apos;ENTREPÔT
        </text>

        {/* Dock area at top */}
        <rect x={padding} y={padding} width={mapWidth - padding * 2} height="16" rx="3" fill="#0d9488" opacity="0.2" />
        <text x={mapWidth / 2} y={padding + 11} textAnchor="middle" fill="#0d9488" fontSize="8" fontWeight="600">
          ZONE DE CHARGEMENT — Q1 Q2 Q3 Q4
        </text>

        {/* Zones */}
        {warehouseZones.map((zone, index) => {
          const pos = zonePositions[index];
          const fillHeight = (zone.usage / 100) * (zoneHeight - 30);
          const isOverCapacity = zone.usage > 80;

          return (
            <g key={zone.id}>
              {/* Zone background */}
              <rect
                x={pos.x}
                y={pos.y + 22}
                width={zoneWidth}
                height={zoneHeight - 22}
                rx="4"
                fill="var(--background)"
                stroke={isOverCapacity ? '#dc2626' : zone.color}
                strokeWidth={isOverCapacity ? 2 : 1}
                strokeDasharray={isOverCapacity ? "4 2" : "none"}
                opacity="0.9"
              />
              {/* Fill level indicator */}
              <rect
                x={pos.x + 2}
                y={pos.y + 22 + (zoneHeight - 22) - fillHeight}
                width={zoneWidth - 4}
                height={fillHeight}
                rx="2"
                fill={zone.color}
                opacity="0.15"
              />
              {/* Zone label */}
              <text x={pos.x + zoneWidth / 2} y={pos.y + 38} textAnchor="middle" fill={zone.color} fontSize="14" fontWeight="700">
                {zone.name}
              </text>
              {/* Usage percentage */}
              <text x={pos.x + zoneWidth / 2} y={pos.y + 52} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="700">
                {zone.usage}%
              </text>
              {/* Category label */}
              <text x={pos.x + zoneWidth / 2} y={pos.y + 64} textAnchor="middle" fill="var(--muted-foreground)" fontSize="7">
                {zone.label}
              </text>
              {/* Current/Capacity */}
              <text x={pos.x + zoneWidth / 2} y={pos.y + 76} textAnchor="middle" fill="var(--muted-foreground)" fontSize="7">
                {zone.current}/{zone.capacity} unités
              </text>
              {/* Warning indicator */}
              {isOverCapacity && (
                <g>
                  <circle cx={pos.x + zoneWidth - 12} cy={pos.y + 34} r="6" fill="#dc2626" opacity="0.9">
                    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={pos.x + zoneWidth - 12} y={pos.y + 37} textAnchor="middle" fill="white" fontSize="8" fontWeight="700">!</text>
                </g>
              )}
              {/* Progress bar at bottom of zone */}
              <rect x={pos.x + 8} y={pos.y + zoneHeight - 8} width={zoneWidth - 16} height="3" rx="1.5" fill="var(--muted)" opacity="0.3" />
              <rect x={pos.x + 8} y={pos.y + zoneHeight - 8} width={(zoneWidth - 16) * (zone.usage / 100)} height="3" rx="1.5" fill={zone.color} />
            </g>
          );
        })}

        {/* Aisle labels */}
        <text x={padding + zoneWidth + zoneGap / 2} y={mapHeight / 2 + 12} textAnchor="middle" fill="var(--muted-foreground)" fontSize="7" transform={`rotate(-90, ${padding + zoneWidth + zoneGap / 2}, ${mapHeight / 2 + 12})`}>
          ALLÉE CENTRALE
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-500" />
            Gestion d&apos;Entrepôt
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inventaire et gestion du stockage</p>
        </div>
        {canEditPage('warehouse') && (
          <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Button>
        )}
      </div>

      {/* KPIs */}
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

      {/* Zone Occupation Map (SVG) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-500" />
            Carte d&apos;occupation des zones
          </CardTitle>
          <CardDescription>Visualisation en temps réel de l&apos;occupation de l&apos;entrepôt</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* SVG Map */}
            <div className="flex-1">
              {renderZoneMap()}
            </div>
            {/* Zone Details */}
            <div className="lg:w-64 space-y-2">
              {warehouseZones.map((zone) => (
                <div key={zone.id} className={`p-3 rounded-lg border ${zone.usage > 80 ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{zone.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${zone.usage > 80 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{zone.usage}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">{zone.label}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${zone.usage}%`, background: zone.usage > 80 ? '#dc2626' : zone.color }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-gray-400">{zone.current} utilisées</span>
                    <span className="text-[9px] text-gray-400">{zone.capacity - zone.current} libres</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inbound/Outbound Today Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Inbound */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-sky-500" />
              Entrées aujourd&apos;hui
            </CardTitle>
            <CardDescription>Réception des marchandises</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-center">
                <p className="text-lg font-bold text-sky-600">{todayStats.inbound.count}</p>
                <p className="text-[9px] text-gray-500">Total</p>
              </div>
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-center">
                <p className="text-lg font-bold text-sky-600">{todayStats.inbound.items}</p>
                <p className="text-[9px] text-gray-500">Articles</p>
              </div>
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-center">
                <p className="text-lg font-bold text-sky-600">{todayStats.inbound.weight.toLocaleString('fr-FR')}</p>
                <p className="text-[9px] text-gray-500">kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-gray-500">Terminé: {todayStats.inbound.completed}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-[10px] text-gray-500">En cours: {todayStats.inbound.inProgress}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] text-gray-500">En attente: {todayStats.inbound.pending}</span>
              </div>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {inboundRecords.map((record) => (
                <div key={record.ref} className="flex items-center justify-between p-1.5 rounded bg-gray-50 dark:bg-gray-800/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-sky-600">{record.ref}</span>
                    <span className="text-gray-500 hidden sm:inline">{record.client}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-400">{record.dock}</span>
                    <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 ${record.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : record.status === 'in_progress' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {record.status === 'completed' ? 'Terminé' : record.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outbound */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpFromLine className="w-5 h-5 text-orange-500" />
              Sorties aujourd&apos;hui
            </CardTitle>
            <CardDescription>Expédition des marchandises</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
                <p className="text-lg font-bold text-orange-600">{todayStats.outbound.count}</p>
                <p className="text-[9px] text-gray-500">Total</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
                <p className="text-lg font-bold text-orange-600">{todayStats.outbound.items}</p>
                <p className="text-[9px] text-gray-500">Articles</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
                <p className="text-lg font-bold text-orange-600">{todayStats.outbound.weight.toLocaleString('fr-FR')}</p>
                <p className="text-[9px] text-gray-500">kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-gray-500">Terminé: {todayStats.outbound.completed}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-[10px] text-gray-500">En cours: {todayStats.outbound.inProgress}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] text-gray-500">En attente: {todayStats.outbound.pending}</span>
              </div>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {outboundRecords.map((record) => (
                <div key={record.ref} className="flex items-center justify-between p-1.5 rounded bg-gray-50 dark:bg-gray-800/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-orange-600">{record.ref}</span>
                    <span className="text-gray-500 hidden sm:inline">{record.client}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-400">{record.dock}</span>
                    <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 ${record.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : record.status === 'in_progress' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {record.status === 'completed' ? 'Terminé' : record.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertes d&apos;inventaire
          </CardTitle>
          <CardDescription>Notifications de stock bas, surstock et articles endommagés</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {inventoryAlerts.map((alert, index) => {
              const AlertIcon = alertTypeIcons[alert.type] || AlertCircle;
              return (
                <motion.div
                  key={alert.sku}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`p-3 rounded-lg border ${alertSeverityColors[alert.severity]} flex items-start gap-2.5`}
                >
                  <AlertIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold">{alertTypeLabels[alert.type]}</span>
                      <span className="text-[9px] font-mono opacity-60">{alert.sku}</span>
                    </div>
                    <p className="text-xs font-medium truncate">{alert.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[9px] opacity-70">
                      <span>Qté: {alert.current}</span>
                      {alert.type === 'low_stock' && <span>Seuil: {alert.threshold}</span>}
                      {alert.type === 'overstock' && <span>Max: {alert.threshold}</span>}
                      <span>{alert.zone}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dock Scheduling */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            Planification des quais
          </CardTitle>
          <CardDescription>Programme de chargement et déchargement</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dockSchedule.map((dock) => (
              <div key={dock.dock} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{dock.dock}</p>
                    <p className="text-[9px] text-gray-400">{dock.schedule.length} opérations</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {dock.schedule.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500 w-9">{slot.time}</span>
                        <div>
                          <span className="text-[9px] font-mono font-medium">{slot.ref}</span>
                          <p className="text-[8px] text-gray-400 truncate max-w-[80px]">{slot.carrier}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className={`text-[7px] px-1 py-0 ${slot.type === 'inbound' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {slot.type === 'inbound' ? 'IN' : 'OUT'}
                        </Badge>
                        <Badge variant="secondary" className={`text-[7px] px-1 py-0 ${dockStatusColors[slot.status]}`}>
                          {dockStatusLabels[slot.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <Input placeholder="Rechercher article, SKU, client..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9" />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="stored">Stocké</SelectItem>
                <SelectItem value="reserved">Réservé</SelectItem>
                <SelectItem value="outbound">En sortie</SelectItem>
                <SelectItem value="damaged">Endommagé</SelectItem>
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
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Article</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Catégorie</TableHead>
                  <TableHead className="text-xs">Quantité</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Emplacement</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Client</TableHead>
                  {canEditPage('warehouse') && <TableHead className="text-xs w-20">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((item) => (
                  <TableRow key={item.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
                    <TableCell className="font-mono text-xs font-semibold">{item.sku}</TableCell>
                    <TableCell className="text-xs font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">
                      <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.quantity === 0 ? (
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="w-3 h-3" />
                          0
                        </span>
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] hidden md:table-cell">{item.location}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${warehouseStatusColors[item.status]}`}>
                        {warehouseStatusLabels[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.clientName}</TableCell>
                    {canEditPage('warehouse') && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => handleOpenEdit(item)}
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => handleOpenDelete(item.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">{filtered.length} article(s) trouvé(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Préc.</Button>
              <span className="text-xs text-gray-500">{page + 1}/{totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Suiv.</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel article</DialogTitle>
            <DialogDescription>Ajouter un article à l&apos;inventaire</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">SKU</Label><Input placeholder="WH-XXXX-001" className="h-9" value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Nom</Label><Input placeholder="Nom de l&apos;article" className="h-9" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Catégorie</Label><Input placeholder="Électronique" className="h-9" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Quantité</Label><Input placeholder="100" type="number" className="h-9" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Emplacement</Label><Input placeholder="A-01-03" className="h-9" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Client</Label><Input placeholder="Nom du client" className="h-9" value={newItem.clientName} onChange={(e) => setNewItem({ ...newItem, clientName: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleAddItem}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;article</DialogTitle>
            <DialogDescription>Modifier les informations de l&apos;article</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom</Label>
                <Input
                  className="h-9"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Catégorie</Label>
                <Input
                  className="h-9"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Quantité</Label>
                <Input
                  type="number"
                  className="h-9"
                  value={editItem.quantity}
                  onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Emplacement</Label>
                <Input
                  className="h-9"
                  value={editItem.location}
                  onChange={(e) => setEditItem({ ...editItem, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Statut</Label>
                <Select
                  value={editItem.status}
                  onValueChange={(v) => setEditItem({ ...editItem, status: v as WarehouseStatus })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stored">Stocké</SelectItem>
                    <SelectItem value="reserved">Réservé</SelectItem>
                    <SelectItem value="outbound">En sortie</SelectItem>
                    <SelectItem value="damaged">Endommagé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Client</Label>
                <Input
                  className="h-9"
                  value={editItem.clientName}
                  onChange={(e) => setEditItem({ ...editItem, clientName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Poids (kg)</Label>
              <Input
                type="number"
                className="h-9"
                value={editItem.weight}
                onChange={(e) => setEditItem({ ...editItem, weight: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleEditItem}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item AlertDialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
