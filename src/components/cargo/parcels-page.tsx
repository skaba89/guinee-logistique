'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  RotateCcw,
  Plus,
  Search,
  ArrowRight,
  Clock,
  Tag,
  Printer,
  QrCode,
  ChevronRight,
  MapPin,
  Phone,
  FileText,
  Shield,
  ArrowDownToLine,
  Star,
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
import { parcels, parcelStatusLabels, formatDate, formatDZD } from '@/lib/test-data';

const parcelStatusColors: Record<string, string> = {
  picked_up: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_warehouse: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  out_for_delivery: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  returned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Carrier rate comparison data
const carrierRates = [
  {
    carrier: 'DHL Express',
    logo: 'DHL',
    color: '#FFCC00',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    express: { price: 12500, eta: '1-2 jours', tracked: true, insurance: true },
    standard: { price: 7500, eta: '3-5 jours', tracked: true, insurance: false },
    economy: { price: 4200, eta: '7-10 jours', tracked: false, insurance: false },
    rating: 4.7,
  },
  {
    carrier: 'FedEx',
    logo: 'FDX',
    color: '#4D148C',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    express: { price: 11800, eta: '1-3 jours', tracked: true, insurance: true },
    standard: { price: 6800, eta: '3-5 jours', tracked: true, insurance: false },
    economy: { price: 3900, eta: '7-12 jours', tracked: true, insurance: false },
    rating: 4.5,
  },
  {
    carrier: 'UPS',
    logo: 'UPS',
    color: '#351C15',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
    express: { price: 13200, eta: '1-2 jours', tracked: true, insurance: true },
    standard: { price: 7900, eta: '3-6 jours', tracked: true, insurance: true },
    economy: { price: 4500, eta: '8-12 jours', tracked: true, insurance: false },
    rating: 4.6,
  },
  {
    carrier: 'Aramex',
    logo: 'ARX',
    color: '#0066CC',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    borderColor: 'border-sky-300 dark:border-sky-700',
    express: { price: 9800, eta: '2-3 jours', tracked: true, insurance: true },
    standard: { price: 5500, eta: '4-7 jours', tracked: true, insurance: false },
    economy: { price: 3200, eta: '10-14 jours', tracked: true, insurance: false },
    rating: 4.3,
  },
];

// Last-mile tracking data
const lastMileTracking = [
  { id: 'p1', trackingNumber: 'FFP-P-001', courier: 'Karim Bouzid', courierPhone: '0555555666', estimatedArrival: '14:30', status: 'out_for_delivery', distance: '2.3 km' },
  { id: 'p2', trackingNumber: 'FFP-P-003', courier: 'Mustapha Djamel', courierPhone: '0555777888', estimatedArrival: '16:00', status: 'out_for_delivery', distance: '5.1 km' },
  { id: 'p3', trackingNumber: 'FFP-P-005', courier: 'Hichem Rouabah', courierPhone: '0555202122', estimatedArrival: '17:45', status: 'out_for_delivery', distance: '8.7 km' },
];

// Return management data
const returnRecords = [
  { id: 'r1', trackingNumber: 'FFP-P-002', reason: 'Colis endommagé', requestDate: '2026-03-08', status: 'approved', returnCarrier: 'DHL Express', refundAmount: 6500 },
  { id: 'r2', trackingNumber: 'FFP-P-006', reason: 'Article incorrect', requestDate: '2026-03-10', status: 'pending', returnCarrier: '-', refundAmount: 3200 },
  { id: 'r3', trackingNumber: 'FFP-P-008', reason: 'Non réclamé', requestDate: '2026-03-12', status: 'in_transit', returnCarrier: 'Aramex', refundAmount: 4800 },
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

// Label generation options
const labelOptions = [
  { type: 'Thermique 4x6', description: 'Étiquette adhesive pour imprimante thermique', icon: Printer, available: true },
  { type: 'A4 Standard', description: 'Format A4 pour imprimante laser/inkjet', icon: FileText, available: true },
  { type: 'QR Code', description: 'Code QR avec lien de suivi intégré', icon: QrCode, available: true },
  { type: 'ZPL', description: 'Format ZPL pour imprimantes Zebra', icon: Tag, available: false },
];

const kpis = [
  { title: 'Colis aujourd\'hui', value: parcels.length, icon: PackageCheck, color: 'from-violet-500 to-purple-600' },
  { title: 'En livraison', value: parcels.filter(p => p.status === 'out_for_delivery').length, icon: Truck, color: 'from-teal-500 to-teal-600' },
  { title: 'Livrés aujourd\'hui', value: parcels.filter(p => p.status === 'delivered').length, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
  { title: 'Retours', value: parcels.filter(p => p.status === 'returned').length, icon: RotateCcw, color: 'from-red-500 to-rose-600' },
];

export default function ParcelsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState<typeof parcels[0] | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const pageSize = 8;

  const filtered = parcels.filter(p => {
    const matchSearch = search === '' ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.senderName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      p.carrier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-violet-500" />
            Colis & Courier
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des colis et envois express</p>
        </div>
        <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau colis
        </Button>
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
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: carrier.color }}>
                      {carrier.logo}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{carrier.carrier}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-gray-500">{carrier.rating}</span>
                      </div>
                    </div>
                  </div>
                  {selectedCarrier === carrier.carrier && (
                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  )}
                </div>

                <div className="space-y-2">
                  {/* Express */}
                  <div className={`p-2 rounded ${carrier.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Express</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{formatDZD(carrier.express.price)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-gray-500">{carrier.express.eta}</span>
                      <div className="flex items-center gap-1">
                        {carrier.express.tracked && <Shield className="w-2.5 h-2.5 text-teal-500" />}
                        {carrier.express.insurance && <Shield className="w-2.5 h-2.5 text-amber-500" />}
                      </div>
                    </div>
                  </div>
                  {/* Standard */}
                  <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Standard</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{formatDZD(carrier.standard.price)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-gray-500">{carrier.standard.eta}</span>
                      <div className="flex items-center gap-1">
                        {carrier.standard.tracked && <Shield className="w-2.5 h-2.5 text-teal-500" />}
                      </div>
                    </div>
                  </div>
                  {/* Economy */}
                  <div className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Économique</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{formatDZD(carrier.economy.price)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-gray-500">{carrier.economy.eta}</span>
                      <div className="flex items-center gap-1">
                        {carrier.economy.tracked && <Shield className="w-2.5 h-2.5 text-teal-500" />}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCarrier === carrier.carrier && (
                  <Button className="w-full mt-3 text-white h-8 text-xs" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                    Sélectionner {carrier.carrier}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  <Badge variant="secondary" className={`text-[10px] ${parcelStatusColors[delivery.status]}`}>
                    En livraison
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Phone className="w-3 h-3 text-teal-500" />
                  </Button>
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

      {/* Label Generation Options */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-5 h-5 text-violet-500" />
            Génération d&apos;étiquettes
          </CardTitle>
          <CardDescription>Formats d&apos;impression disponibles</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {labelOptions.map((option, index) => (
              <motion.div
                key={option.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-3 rounded-lg border ${option.available ? 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700' : 'border-gray-100 dark:border-gray-800 opacity-50'} transition-colors cursor-pointer`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-md ${option.available ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gray-300 dark:bg-gray-700'} flex items-center justify-center`}>
                    <option.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{option.type}</p>
                    {!option.available && (
                      <Badge className="text-[8px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-0">Bientôt</Badge>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{option.description}</p>
                {option.available && (
                  <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-[10px]">
                    <Printer className="w-3 h-3 mr-1" />
                    Imprimer
                  </Button>
                )}
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
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
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
                  <TableHead className="text-xs">N° Suivi</TableHead>
                  <TableHead className="text-xs">Expéditeur</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Destinataire</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Transporteur</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Livraison estimée</TableHead>
                  <TableHead className="text-xs text-right">Prix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((parcel) => (
                  <TableRow key={parcel.id} className="cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/10" onClick={() => setSelectedParcel(parcel)}>
                    <TableCell className="font-mono text-xs font-semibold">{parcel.trackingNumber}</TableCell>
                    <TableCell className="text-xs">{parcel.senderName}</TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{parcel.receiverName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${parcelStatusColors[parcel.status]}`}>
                        {parcelStatusLabels[parcel.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{parcel.carrier}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{formatDate(parcel.estimatedDelivery)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatDZD(parcel.price)}</TableCell>
                  </TableRow>
                ))}
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
        </CardContent>
      </Card>

      {/* Parcel Detail Dialog */}
      <Dialog open={!!selectedParcel} onOpenChange={() => setSelectedParcel(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-gray-500">Statut</Label><p><Badge variant="secondary" className={`text-[10px] ${parcelStatusColors[selectedParcel.status]}`}>{parcelStatusLabels[selectedParcel.status]}</Badge></p></div>
                  <div><Label className="text-xs text-gray-500">Transporteur</Label><p className="text-sm font-medium">{selectedParcel.carrier}</p></div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Expéditeur</Label>
                  <div className="mt-1">
                    <p className="text-sm font-medium">{selectedParcel.senderName}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.senderPhone}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.senderAddress}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Destinataire</Label>
                  <div className="mt-1">
                    <p className="text-sm font-medium">{selectedParcel.receiverName}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.receiverPhone}</p>
                    <p className="text-xs text-gray-500">{selectedParcel.receiverAddress}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Informations</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-[10px] text-gray-400">Poids</p><p className="text-sm font-medium">{selectedParcel.weight} kg</p></div>
                    <div><p className="text-[10px] text-gray-400">Dimensions</p><p className="text-sm font-medium">{selectedParcel.dimensions}</p></div>
                    <div><p className="text-[10px] text-gray-400">Livraison estimée</p><p className="text-sm font-medium">{formatDate(selectedParcel.estimatedDelivery)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Prix</p><p className="text-sm font-medium">{formatDZD(selectedParcel.price)}</p></div>
                  </div>
                </div>

                {/* Carrier rate comparison for this parcel */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Tarifs alternatifs
                  </Label>
                  <div className="space-y-2 mt-2">
                    {carrierRates.slice(0, 3).map((carrier) => (
                      <div key={carrier.carrier} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: carrier.color }}>
                            {carrier.logo}
                          </div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">{carrier.carrier}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatDZD(carrier.standard.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Suivi</Label>
                  <div className="mt-2 space-y-3">
                    {[
                      { label: 'Colis collecté', time: formatDate(selectedParcel.estimatedDelivery), done: selectedParcel.status !== 'picked_up' || selectedParcel.status === 'picked_up' },
                      { label: 'En entrepôt', time: '', done: ['in_warehouse', 'in_transit', 'out_for_delivery', 'delivered'].includes(selectedParcel.status) },
                      { label: 'En transit', time: '', done: ['in_transit', 'out_for_delivery', 'delivered'].includes(selectedParcel.status) },
                      { label: 'En livraison', time: '', done: ['out_for_delivery', 'delivered'].includes(selectedParcel.status) },
                      { label: 'Livré', time: selectedParcel.status === 'delivered' ? formatDate(selectedParcel.estimatedDelivery) : '', done: selectedParcel.status === 'delivered' },
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

      {/* Add Parcel Dialog with Carrier Selection */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau colis</DialogTitle>
            <DialogDescription>Enregistrer un nouveau colis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">Expéditeur</Label><Input placeholder="Nom" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Destinataire</Label><Input placeholder="Nom" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Poids (kg)</Label><Input placeholder="2.5" type="number" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Dimensions</Label><Input placeholder="30x20x15" className="h-9" /></div>
            </div>

            {/* Carrier Selection in Add Dialog */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <Label className="text-xs text-gray-500">Sélection du transporteur</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {carrierRates.map((carrier) => (
                  <div
                    key={carrier.carrier}
                    className={`p-2 rounded border cursor-pointer transition-colors ${selectedCarrier === carrier.carrier ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'}`}
                    onClick={() => setSelectedCarrier(carrier.carrier)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: carrier.color }}>
                        {carrier.logo}
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-900 dark:text-white">{carrier.carrier}</p>
                        <p className="text-[9px] text-gray-500">à partir de {formatDZD(carrier.economy.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Level Selection */}
            {selectedCarrier && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <Label className="text-xs text-gray-500">Niveau de service</Label>
                <Select>
                  <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="express">Express (1-3 jours)</SelectItem>
                    <SelectItem value="standard">Standard (3-5 jours)</SelectItem>
                    <SelectItem value="economy">Économique (7-12 jours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(false)}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
