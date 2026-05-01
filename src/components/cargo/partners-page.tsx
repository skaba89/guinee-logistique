'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake,
  Ship,
  Plane,
  Truck,
  Search,
  Plus,
  LayoutGrid,
  List,
  Star,
  Mail,
  Phone,
  MapPin,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useCargoStore } from '@/lib/cargo-store';
import { useCurrency } from '@/lib/use-currency';

// ─── Types ───────────────────────────────────────────────────────────
type PartnerType = 'maritime' | 'aerien' | 'terrestre' | 'multi';
type PartnerStatus = 'actif' | 'en_attente' | 'inactif';

interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  country: string;
  volume: number;
  onTimeRate: number;
  rating: number;
  contact: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  totalShipments: number;
  revenue: number;
}

// ─── Test Data ───────────────────────────────────────────────────────
const partners: Partner[] = [
  { id: 'p1', name: 'CMA CGM', type: 'maritime', country: 'France', volume: 285, onTimeRate: 92, rating: 4, contact: 'Jean-Pierre Martin', email: 'jp.martin@cmacgm.com', phone: '+33 4 88 91 90 00', status: 'actif', totalShipments: 48, revenue: 15200000 },
  { id: 'p2', name: 'Maersk Line', type: 'maritime', country: 'Danemark', volume: 320, onTimeRate: 88, rating: 4, contact: 'Lars Andersen', email: 'l.andersen@maersk.com', phone: '+45 33 63 33 63', status: 'actif', totalShipments: 52, revenue: 18500000 },
  { id: 'p3', name: 'Air Algérie Cargo', type: 'aerien', country: 'Algérie', volume: 150, onTimeRate: 75, rating: 3, contact: 'Karim Hadj-Ali', email: 'kh.ali@airalgerie.dz', phone: '+213 21 69 22 22', status: 'actif', totalShipments: 35, revenue: 4200000 },
  { id: 'p4', name: 'Emirates SkyCargo', type: 'aerien', country: 'EAU', volume: 180, onTimeRate: 95, rating: 5, contact: 'Ahmed Al-Rashid', email: 'a.rashid@emirates.com', phone: '+971 4 708 1111', status: 'actif', totalShipments: 28, revenue: 8900000 },
  { id: 'p5', name: 'MSC', type: 'maritime', country: 'Suisse', volume: 290, onTimeRate: 90, rating: 4, contact: 'Marco Rossi', email: 'm.rossi@msc.com', phone: '+41 22 703 8888', status: 'actif', totalShipments: 44, revenue: 14200000 },
  { id: 'p6', name: 'Trans-Afrique Logistics', type: 'terrestre', country: 'Algérie', volume: 420, onTimeRate: 82, rating: 3, contact: 'Rachid Boumediene', email: 'r.boumediene@transafrique.dz', phone: '+213 21 50 50 50', status: 'actif', totalShipments: 85, revenue: 6800000 },
  { id: 'p7', name: 'DHL Express', type: 'aerien', country: 'Allemagne', volume: 95, onTimeRate: 97, rating: 5, contact: 'Hans Mueller', email: 'h.mueller@dhl.com', phone: '+49 228 182 0', status: 'actif', totalShipments: 120, revenue: 3200000 },
  { id: 'p8', name: 'SNTV', type: 'terrestre', country: 'Algérie', volume: 380, onTimeRate: 70, rating: 2, contact: 'Mourad Zeroual', email: 'm.zeroual@sntv.dz', phone: '+213 21 73 33 33', status: 'en_attente', totalShipments: 62, revenue: 4500000 },
  { id: 'p9', name: 'Hapag-Lloyd', type: 'maritime', country: 'Allemagne', volume: 210, onTimeRate: 91, rating: 4, contact: 'Stefan Weber', email: 's.weber@hapag-lloyd.com', phone: '+49 40 3001 0', status: 'actif', totalShipments: 32, revenue: 11800000 },
  { id: 'p10', name: 'SAGA Logistics', type: 'multi', country: 'Maroc', volume: 250, onTimeRate: 86, rating: 3, contact: 'Fatima El-Amrani', email: 'f.elamrani@saga.ma', phone: '+212 5 22 54 80 80', status: 'actif', totalShipments: 55, revenue: 9500000 },
];

// ─── Mappings ────────────────────────────────────────────────────────
const typeLabels: Record<PartnerType, string> = {
  maritime: 'Maritime',
  aerien: 'Aérien',
  terrestre: 'Terrestre',
  multi: 'Multi-modal',
};

const typeBadgeColors: Record<PartnerType, string> = {
  maritime: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  aerien: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  terrestre: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  multi: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const typeGradients: Record<PartnerType, string> = {
  maritime: 'from-blue-500 to-blue-600',
  aerien: 'from-orange-500 to-orange-600',
  terrestre: 'from-green-500 to-green-600',
  multi: 'from-purple-500 to-purple-600',
};

const typeIcons: Record<PartnerType, React.ElementType> = {
  maritime: Ship,
  aerien: Plane,
  terrestre: Truck,
  multi: Handshake,
};

const statusLabels: Record<PartnerStatus, string> = {
  actif: 'Actif',
  en_attente: 'En attente',
  inactif: 'Inactif',
};

const statusColors: Record<PartnerStatus, string> = {
  actif: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  inactif: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusDotColors: Record<PartnerStatus, string> = {
  actif: 'bg-green-500',
  en_attente: 'bg-yellow-500',
  inactif: 'bg-red-500',
};

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

// ─── Helper: Avatar initials ─────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((_, i, arr) => i === 0 || i === arr.length - 1 || arr.length <= 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ─── Helper: Star rating ─────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

// ─── Helper: Format revenue ──────────────────────────────────────────
function formatRevenue(value: number, symbol: string): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M ${symbol}`;
  }
  return value.toLocaleString('fr-FR') + ' ' + symbol;
}

// ─── KPI Cards Data ──────────────────────────────────────────────────
const kpiCards = [
  {
    title: 'Partenaires actifs',
    value: partners.filter((p) => p.status === 'actif').length,
    icon: Handshake,
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Compagnies maritimes',
    value: partners.filter((p) => p.type === 'maritime').length,
    icon: Ship,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Compagnies aériennes',
    value: partners.filter((p) => p.type === 'aerien').length,
    icon: Plane,
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Transporteurs terrestres',
    value: partners.filter((p) => p.type === 'terrestre').length,
    icon: Truck,
    gradient: 'from-green-500 to-green-600',
  },
];

// ─── Chart Data ──────────────────────────────────────────────────────
const chartData = partners.map((p) => ({
  name: p.name.length > 12 ? p.name.substring(0, 12) + '…' : p.name,
  volume: p.volume,
  fill:
    p.type === 'maritime'
      ? '#3b82f6'
      : p.type === 'aerien'
        ? '#f97316'
        : p.type === 'terrestre'
          ? '#22c55e'
          : '#a855f7',
}));

// ─── Component ───────────────────────────────────────────────────────
export default function PartnersPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const [data, setData] = useState<Partner[]>(partners);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const canEditPage = useCargoStore((s) => s.canEdit);

  const [newPartner, setNewPartner] = useState({
    name: '',
    type: 'maritime' as PartnerType,
    country: '',
    contact: '',
    email: '',
    phone: '',
    rating: 3,
  });

  const [editPartner, setEditPartner] = useState<{
    id: string;
    name: string;
    type: PartnerType;
    contact: string;
    email: string;
    phone: string;
    revenue: number;
  }>({
    id: '',
    name: '',
    type: 'maritime',
    contact: '',
    email: '',
    phone: '',
    revenue: 0,
  });

  // ─── Filtered data ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType !== 'all') {
      result = result.filter((p) => p.type === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.contact.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, filterType, searchQuery]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleAddPartner = () => {
    const partner: Partner = {
      id: `p${data.length + 1}`,
      name: newPartner.name,
      type: newPartner.type,
      country: newPartner.country,
      volume: 0,
      onTimeRate: 0,
      rating: newPartner.rating,
      contact: newPartner.contact,
      email: newPartner.email,
      phone: newPartner.phone,
      status: 'en_attente',
      totalShipments: 0,
      revenue: 0,
    };
    setData([partner, ...data]);
    setShowAddDialog(false);
    setNewPartner({
      name: '',
      type: 'maritime',
      country: '',
      contact: '',
      email: '',
      phone: '',
      rating: 3,
    });
  };

  const handleViewDetail = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDetailDialog(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setEditPartner({
      id: partner.id,
      name: partner.name,
      type: partner.type,
      contact: partner.contact,
      email: partner.email,
      phone: partner.phone,
      revenue: partner.revenue,
    });
    setShowEditDialog(true);
  };

  const handleEditPartner = () => {
    setData((prev) =>
      prev.map((p) =>
        p.id === editPartner.id
          ? {
              ...p,
              name: editPartner.name,
              type: editPartner.type,
              contact: editPartner.contact,
              email: editPartner.email,
              phone: editPartner.phone,
              revenue: editPartner.revenue,
            }
          : p
      )
    );
    setShowEditDialog(false);
    // Also update selectedPartner if detail dialog is open
    if (selectedPartner?.id === editPartner.id) {
      setSelectedPartner((prev) =>
        prev
          ? {
              ...prev,
              name: editPartner.name,
              type: editPartner.type,
              contact: editPartner.contact,
              email: editPartner.email,
              phone: editPartner.phone,
              revenue: editPartner.revenue,
            }
          : prev
      );
    }
  };

  const handleOpenDelete = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDeleteDialog(true);
  };

  const handleDeletePartner = () => {
    if (selectedPartner) {
      setData((prev) => prev.filter((p) => p.id !== selectedPartner.id));
    }
    setShowDeleteDialog(false);
    setShowDetailDialog(false);
    setSelectedPartner(null);
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Handshake className="w-6 h-6 text-teal-500" />
            Partenaires
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez votre réseau de transporteurs et partenaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-2 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {canEditPage('partners') && (
            <Button
              size="sm"
              className="text-xs text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouveau partenaire
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 truncate">
                      {card.title}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {typeof card.value === 'number'
                        ? card.value.toLocaleString('fr-FR')
                        : card.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart: Volume par partenaire */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Volume par partenaire
          </CardTitle>
          <CardDescription>
            Volume d&apos;expéditions annuel par partenaire
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toLocaleString('fr-FR')} expéditions`,
                    'Volume',
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <rect key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
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
                placeholder="Rechercher par nom, pays, contact..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="maritime">Maritime</SelectItem>
                <SelectItem value="aerien">Aérien</SelectItem>
                <SelectItem value="terrestre">Terrestre</SelectItem>
                <SelectItem value="multi">Multi-modal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Aucun partenaire trouvé
            </div>
          ) : (
            filtered.map((partner, index) => {
              const TypeIcon = typeIcons[partner.type];
              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetail(partner)}>
                    <CardContent className="p-4 sm:p-5">
                      {/* Header: Avatar + Name + Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeGradients[partner.type]} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {getInitials(partner.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {partner.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${statusDotColors[partner.status]}`} />
                              <span className="text-[10px] text-gray-500">
                                {statusLabels[partner.status]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-2 py-0.5 ${typeBadgeColors[partner.type]}`}
                        >
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeLabels[partner.type]}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="mb-3">
                        <StarRating rating={partner.rating} size={13} />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Package className="w-3.5 h-3.5" />
                          <span>
                            Volume:{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {partner.volume.toLocaleString('fr-FR')}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Ponctualité:{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {partner.onTimeRate}%
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="pt-3 border-t flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {partner.contact}
                          </p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            {partner.phone}
                          </p>
                        </div>
                        {canEditPage('partners') && (
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <button
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(partner);
                              }}
                              title="Modifier"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDelete(partner);
                              }}
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Partenaire</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Pays</TableHead>
                    <TableHead className="text-xs">Volume</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Ponctualité</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Note</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Contact</TableHead>
                    <TableHead className="text-xs w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun partenaire trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((partner) => (
                      <TableRow
                        key={partner.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                        onClick={() => handleViewDetail(partner)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback
                                className={`text-xs font-semibold text-white bg-gradient-to-br ${typeGradients[partner.type]}`}
                              >
                                {getInitials(partner.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {partner.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-2 py-0.5 ${typeBadgeColors[partner.type]}`}
                          >
                            {typeLabels[partner.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          {partner.country}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {partner.volume.toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          <span
                            className={
                              partner.onTimeRate >= 90
                                ? 'text-green-600 font-medium'
                                : partner.onTimeRate >= 80
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }
                          >
                            {partner.onTimeRate}%
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <StarRating rating={partner.rating} size={12} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-2 py-0.5 ${statusColors[partner.status]}`}
                          >
                            {statusLabels[partner.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden xl:table-cell">
                          {partner.contact}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(partner);
                              }}
                              title="Voir"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                            {canEditPage('partners') && (
                              <>
                                <button
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(partner);
                                  }}
                                  title="Modifier"
                                >
                                  <Pencil className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDelete(partner);
                                  }}
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
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
          </CardContent>
        </Card>
      )}

      {/* Partner Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du partenaire</DialogTitle>
            <DialogDescription>
              Informations et performance du partenaire
            </DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeGradients[selectedPartner.type]} flex items-center justify-center text-white text-lg font-bold`}
                >
                  {getInitials(selectedPartner.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedPartner.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${typeBadgeColors[selectedPartner.type]}`}
                    >
                      {typeLabels[selectedPartner.type]}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${statusColors[selectedPartner.status]}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${statusDotColors[selectedPartner.status]}`} />
                      {statusLabels[selectedPartner.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={selectedPartner.rating} size={16} />
                <span className="text-sm text-gray-500">
                  {selectedPartner.rating}/5
                </span>
              </div>

              <Separator />

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedPartner.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedPartner.phone}</span>
                </div>
                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{selectedPartner.email}</span>
                </div>
                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <Handshake className="w-4 h-4 text-gray-400" />
                  <span>{selectedPartner.contact}</span>
                </div>
              </div>

              <Separator />

              {/* Performance stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-2xl font-bold text-teal-600">
                    {selectedPartner.volume.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">Volume annuel</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p
                    className={`text-2xl font-bold ${
                      selectedPartner.onTimeRate >= 90
                        ? 'text-green-600'
                        : selectedPartner.onTimeRate >= 80
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {selectedPartner.onTimeRate}%
                  </p>
                  <p className="text-xs text-gray-500">Taux de ponctualité</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedPartner.totalShipments.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">Expéditions totales</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatRevenue(selectedPartner.revenue, symbol)}
                  </p>
                  <p className="text-xs text-gray-500">Revenu généré</p>
                </div>
              </div>

              {/* Ponctualité bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    Taux de ponctualité
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      selectedPartner.onTimeRate >= 90
                        ? 'text-green-600'
                        : selectedPartner.onTimeRate >= 80
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {selectedPartner.onTimeRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${selectedPartner.onTimeRate}%`,
                      background:
                        selectedPartner.onTimeRate >= 90
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : selectedPartner.onTimeRate >= 80
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {canEditPage('partners') && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDetailDialog(false);
                      handleOpenEdit(selectedPartner);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setShowDetailDialog(false);
                      handleOpenDelete(selectedPartner);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Partner Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le partenaire</DialogTitle>
            <DialogDescription>
              Modifier les informations du partenaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom</Label>
                <Input
                  value={editPartner.name}
                  onChange={(e) =>
                    setEditPartner({ ...editPartner, name: e.target.value })
                  }
                  placeholder="Nom du partenaire"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={editPartner.type}
                  onValueChange={(v) =>
                    setEditPartner({ ...editPartner, type: v as PartnerType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maritime">Maritime</SelectItem>
                    <SelectItem value="aerien">Aérien</SelectItem>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                    <SelectItem value="multi">Multi-modal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Contact</Label>
              <Input
                value={editPartner.contact}
                onChange={(e) =>
                  setEditPartner({ ...editPartner, contact: e.target.value })
                }
                placeholder="Nom du contact"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={editPartner.email}
                  onChange={(e) =>
                    setEditPartner({ ...editPartner, email: e.target.value })
                  }
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={editPartner.phone}
                  onChange={(e) =>
                    setEditPartner({ ...editPartner, phone: e.target.value })
                  }
                  placeholder="+XXX XX XX XX XX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{`Revenu (${symbol})`}</Label>
              <Input
                type="number"
                value={editPartner.revenue}
                onChange={(e) =>
                  setEditPartner({ ...editPartner, revenue: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEditPartner}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Partner AlertDialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le partenaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le partenaire{' '}
              <span className="font-semibold">{selectedPartner?.name}</span> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePartner}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Partner Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau partenaire</DialogTitle>
            <DialogDescription>
              Ajouter un nouveau partenaire transporteur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom</Label>
                <Input
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, name: e.target.value })
                  }
                  placeholder="Nom du partenaire"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={newPartner.type}
                  onValueChange={(v) =>
                    setNewPartner({ ...newPartner, type: v as PartnerType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maritime">Maritime</SelectItem>
                    <SelectItem value="aerien">Aérien</SelectItem>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                    <SelectItem value="multi">Multi-modal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Pays</Label>
                <Input
                  value={newPartner.country}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, country: e.target.value })
                  }
                  placeholder="Pays"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Note (1-5)</Label>
                <Select
                  value={String(newPartner.rating)}
                  onValueChange={(v) =>
                    setNewPartner({ ...newPartner, rating: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} étoile{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Contact</Label>
              <Input
                value={newPartner.contact}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, contact: e.target.value })
                }
                placeholder="Nom du contact"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, email: e.target.value })
                  }
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={newPartner.phone}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, phone: e.target.value })
                  }
                  placeholder="+XXX XX XX XX XX"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddPartner}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              Ajouter le partenaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
