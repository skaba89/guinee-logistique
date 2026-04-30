'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ship,
  Container,
  Clock,
  Plus,
  Search,
  ArrowRight,
  X,
  Anchor,
  Package,
  Calendar,
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
import { containers, containerTypeLabels, containerStatusLabels, formatDate } from '@/lib/test-data';

const containerStatusColors: Record<string, string> = {
  empty: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  loaded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  at_port: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

// Vessel schedule data
const vesselSchedule = [
  { vessel: 'CMA CGM Marco Polo', voyage: '026W', departure: 'Alger', arrival: 'Marseille', etd: '2026-03-15', eta: '2026-03-18', status: 'loading' },
  { vessel: 'MSC Fantasia', voyage: 'W312E', departure: 'Shanghai', arrival: 'Alger', etd: '2026-03-10', eta: '2026-03-25', status: 'in_transit' },
  { vessel: 'Hapag-Lloyd Berlin', voyage: 'BB415R', departure: 'Hambourg', arrival: 'Djeddah', etd: '2026-03-20', eta: '2026-04-05', status: 'scheduled' },
  { vessel: 'Evergreen Ever Given', voyage: 'EG072E', departure: 'Mumbai', arrival: 'Djeddah', etd: '2026-03-25', eta: '2026-04-22', status: 'scheduled' },
  { vessel: 'Yang Ming Unity', voyage: '037W', departure: 'Alger', arrival: 'Marseille', etd: '2026-04-10', eta: '2026-05-02', status: 'scheduled' },
];

const vesselStatusLabels: Record<string, string> = {
  loading: 'Chargement',
  in_transit: 'En transit',
  scheduled: 'Programmé',
  arrived: 'Arrivé',
};

const vesselStatusColors: Record<string, string> = {
  loading: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  arrived: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const kpis = [
  { title: 'Conteneurs actifs', value: containers.filter(c => c.status !== 'empty').length, icon: Container, color: 'from-teal-500 to-teal-600' },
  { title: 'En transit', value: containers.filter(c => c.status === 'in_transit').length, icon: Ship, color: 'from-orange-500 to-amber-600' },
  { title: 'Capacité TEU', value: containers.reduce((acc, c) => acc + (c.type === '20ft' ? 1 : 2), 0), icon: Package, color: 'from-cyan-500 to-teal-600' },
  { title: 'Temps moyen transit', value: '14 jours', icon: Clock, color: 'from-emerald-500 to-green-600' },
];

export default function MaritimePage() {
  const [data, setData] = useState(containers);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState<typeof containers[0] | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContainer, setNewContainer] = useState({
    containerNumber: '',
    type: '40ft' as '20ft' | '40ft' | '40ft_hc' | 'reefer',
    portOfLoading: '',
    portOfDischarge: '',
    vesselName: '',
    clientName: '',
  });
  const pageSize = 8;

  const handleAddContainer = () => {
    const container = {
      id: `ct${data.length + 1}-${Date.now()}`,
      containerNumber: newContainer.containerNumber || 'NEW-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      type: newContainer.type,
      status: 'empty' as const,
      vesselName: newContainer.vesselName,
      voyageNumber: '',
      portOfLoading: newContainer.portOfLoading,
      portOfDischarge: newContainer.portOfDischarge,
      eta: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      weight: 0,
      bookingRef: 'BK-' + Date.now().toString(36).toUpperCase(),
      blNumber: '',
      clientName: newContainer.clientName,
    };
    setData([container, ...data]);
    setNewContainer({ containerNumber: '', type: '40ft', portOfLoading: '', portOfDischarge: '', vesselName: '', clientName: '' });
    setShowAddDialog(false);
    setPage(0);
  };

  const filtered = data.filter(c => {
    const matchSearch = search === '' ||
      c.containerNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.vesselName.toLowerCase().includes(search.toLowerCase()) ||
      c.portOfLoading.toLowerCase().includes(search.toLowerCase()) ||
      c.portOfDischarge.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Container type breakdown for donut chart
  const typeBreakdown = [
    { type: '20ft', count: containers.filter(c => c.type === '20ft').length, color: '#0d9488', label: '20 pieds' },
    { type: '40ft', count: containers.filter(c => c.type === '40ft').length, color: '#059669', label: '40 pieds' },
    { type: '40ft_hc', count: containers.filter(c => c.type === '40ft_hc').length, color: '#0891b2', label: '40 pieds HC' },
    { type: 'reefer', count: containers.filter(c => c.type === 'reefer').length, color: '#d97706', label: 'Réfrigéré' },
  ];
  const totalContainers = containers.length;
  const donutSize = 120;
  const donutStroke = 20;
  const donutRadius = (donutSize - donutStroke) / 2;
  const donutCircumference = 2 * Math.PI * donutRadius;

  let currentOffset = 0;
  const donutSegments = typeBreakdown.map((item) => {
    const segmentLength = (item.count / totalContainers) * donutCircumference;
    const segment = {
      ...item,
      dashArray: `${segmentLength} ${donutCircumference - segmentLength}`,
      dashOffset: -currentOffset,
      percentage: Math.round((item.count / totalContainers) * 100),
    };
    currentOffset += segmentLength;
    return segment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Ship className="w-6 h-6 text-teal-500" />
            Fret Maritime
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des conteneurs et transports maritimes</p>
        </div>
        <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau conteneur
        </Button>
      </div>

      {/* Vessel Schedule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            Programme des navires
          </CardTitle>
          <CardDescription>Départs et arrivées à venir</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {vesselSchedule.map((vessel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Anchor className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{vessel.vessel}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Voyage {vessel.voyage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">{vessel.departure}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium">{vessel.arrival}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span>ETD: {formatDate(vessel.etd)}</span>
                  <span>ETA: {formatDate(vessel.eta)}</span>
                </div>
                <Badge variant="secondary" className={`text-[10px] ${vesselStatusColors[vessel.status]}`}>
                  {vesselStatusLabels[vessel.status]}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPIs and Container Type Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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

        {/* Container Type Donut Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Répartition par type</p>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <svg width={donutSize} height={donutSize} className="-rotate-90">
                    {donutSegments.map((segment) => (
                      <circle
                        key={segment.type}
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={donutRadius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={donutStroke}
                        strokeDasharray={segment.dashArray}
                        strokeDashoffset={segment.dashOffset}
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{totalContainers}</span>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {typeBreakdown.map((item) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate">{item.label}</span>
                      <span className="text-[10px] font-semibold text-gray-900 dark:text-white ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher conteneur, navire, client..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 h-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="20ft">20 pieds</SelectItem>
                <SelectItem value="40ft">40 pieds</SelectItem>
                <SelectItem value="40ft_hc">40 pieds HC</SelectItem>
                <SelectItem value="reefer">Réfrigéré</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="empty">Vide</SelectItem>
                <SelectItem value="loaded">Chargé</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="at_port">Au port</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
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
                  <TableHead className="text-xs">Conteneur</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Navire</TableHead>
                  <TableHead className="text-xs">Route</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">ETA</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Client</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">BL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((container) => (
                  <TableRow
                    key={container.id}
                    className="cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
                    onClick={() => setSelectedContainer(container)}
                  >
                    <TableCell className="font-mono text-xs font-semibold">{container.containerNumber}</TableCell>
                    <TableCell className="text-xs">{containerTypeLabels[container.type]}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${containerStatusColors[container.status]}`}>
                        {containerStatusLabels[container.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{container.vesselName || '-'}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <span>{container.portOfLoading}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span>{container.portOfDischarge}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{formatDate(container.eta)}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{container.clientName}</TableCell>
                    <TableCell className="font-mono text-[10px] hidden lg:table-cell">{container.blNumber || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">{filtered.length} conteneur(s) trouvé(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Préc.</Button>
              <span className="text-xs text-gray-500">{page + 1}/{totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Suiv.</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Detail Dialog */}
      <Dialog open={!!selectedContainer} onOpenChange={() => setSelectedContainer(null)}>
        <DialogContent className="max-w-lg">
          {selectedContainer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Container className="w-5 h-5 text-teal-500" />
                  {selectedContainer.containerNumber}
                </DialogTitle>
                <DialogDescription>Détails du conteneur</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-gray-500">Type</Label><p className="text-sm font-medium">{containerTypeLabels[selectedContainer.type]}</p></div>
                  <div><Label className="text-xs text-gray-500">Statut</Label><p><Badge variant="secondary" className={`text-[10px] ${containerStatusColors[selectedContainer.status]}`}>{containerStatusLabels[selectedContainer.status]}</Badge></p></div>
                  <div><Label className="text-xs text-gray-500">Poids</Label><p className="text-sm font-medium">{selectedContainer.weight.toLocaleString('fr-FR')} kg</p></div>
                  <div><Label className="text-xs text-gray-500">Client</Label><p className="text-sm font-medium">{selectedContainer.clientName}</p></div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Informations voyage</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-[10px] text-gray-400">Navire</p><p className="text-sm font-medium">{selectedContainer.vesselName || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Voyage</p><p className="text-sm font-medium">{selectedContainer.voyageNumber || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Port de chargement</p><p className="text-sm font-medium">{selectedContainer.portOfLoading}</p></div>
                    <div><p className="text-[10px] text-gray-400">Port de déchargement</p><p className="text-sm font-medium">{selectedContainer.portOfDischarge}</p></div>
                    <div><p className="text-[10px] text-gray-400">ETA</p><p className="text-sm font-medium">{formatDate(selectedContainer.eta)}</p></div>
                    <div><p className="text-[10px] text-gray-400">BL</p><p className="text-sm font-mono text-xs">{selectedContainer.blNumber || '-'}</p></div>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Réservation</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-[10px] text-gray-400">Référence</p><p className="text-sm font-mono text-xs">{selectedContainer.bookingRef}</p></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Container Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau conteneur</DialogTitle>
            <DialogDescription>Enregistrer un nouveau conteneur maritime</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">N° Conteneur</Label>
                <Input placeholder="MSKU-1234567" className="h-9" value={newContainer.containerNumber} onChange={(e) => setNewContainer({ ...newContainer, containerNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={newContainer.type} onValueChange={(v) => setNewContainer({ ...newContainer, type: v as '20ft' | '40ft' | '40ft_hc' | 'reefer' })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20ft">20 pieds</SelectItem>
                    <SelectItem value="40ft">40 pieds</SelectItem>
                    <SelectItem value="40ft_hc">40 pieds HC</SelectItem>
                    <SelectItem value="reefer">Réfrigéré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Port de chargement</Label>
                <Input placeholder="Alger" className="h-9" value={newContainer.portOfLoading} onChange={(e) => setNewContainer({ ...newContainer, portOfLoading: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Port de déchargement</Label>
                <Input placeholder="Marseille" className="h-9" value={newContainer.portOfDischarge} onChange={(e) => setNewContainer({ ...newContainer, portOfDischarge: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Navire</Label>
                <Input placeholder="Nom du navire" className="h-9" value={newContainer.vesselName} onChange={(e) => setNewContainer({ ...newContainer, vesselName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Client</Label>
                <Input placeholder="Nom du client" className="h-9" value={newContainer.clientName} onChange={(e) => setNewContainer({ ...newContainer, clientName: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleAddContainer}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
