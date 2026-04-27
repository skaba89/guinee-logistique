'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plane,
  Clock,
  Plus,
  Search,
  ArrowRight,
  Gauge,
  Package,
  FileText,
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
import { flights, flightStatusLabels, formatDate } from '@/lib/test-data';

const flightStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  boarding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  in_flight: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  landed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// Airline color mapping for badges
const airlineColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'Air Algérie': { bg: 'bg-green-100', text: 'text-green-700', darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-400' },
  'Turkish Airlines': { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-400' },
  'Emirates': { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-400' },
  'Air France': { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-400' },
  'Saudia': { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-400' },
  'Lufthansa': { bg: 'bg-yellow-100', text: 'text-yellow-700', darkBg: 'dark:bg-yellow-900/30', darkText: 'dark:text-yellow-400' },
  'Qatar Airways': { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-400' },
  'Air Canada': { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-400' },
};

// Airline codes for badges
const airlineCodes: Record<string, string> = {
  'Air Algérie': 'AH',
  'Turkish Airlines': 'TK',
  'Emirates': 'EK',
  'Air France': 'AF',
  'Saudia': 'SV',
  'Lufthansa': 'LH',
  'Qatar Airways': 'QR',
  'Air Canada': 'AC',
};

// AWB data
const awbRecords = [
  { awb: '124-56789012', airline: 'Air Algérie', origin: 'Alger', destination: 'Paris', pieces: 45, weight: 12500, status: 'issued' },
  { awb: '124-67890123', airline: 'Air Algérie', origin: 'Alger', destination: 'Marseille', pieces: 32, weight: 10800, status: 'issued' },
  { awb: '235-78901234', airline: 'Turkish Airlines', origin: 'Istanbul', destination: 'Casablanca', pieces: 58, weight: 14200, status: 'issued' },
  { awb: '176-89012345', airline: 'Emirates', origin: 'Dubaï', destination: 'Alger', pieces: 72, weight: 22300, status: 'pending' },
  { awb: '057-90123456', airline: 'Air France', origin: 'Londres', destination: 'Le Caire', pieces: 40, weight: 16500, status: 'issued' },
  { awb: '020-23456789', airline: 'Lufthansa', origin: 'Anvers', destination: 'Alger', pieces: 55, weight: 15300, status: 'issued' },
];

const awbStatusLabels: Record<string, string> = {
  issued: 'Émise',
  pending: 'En attente',
  voided: 'Annulée',
};

const awbStatusColors: Record<string, string> = {
  issued: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  voided: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Total capacity across all flights
const totalCapacity = flights.reduce((acc, f) => acc + f.capacity, 0);
const totalBooked = flights.reduce((acc, f) => acc + f.booked, 0);
const overallUtilization = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

const kpis = [
  { title: 'Vols aujourd\'hui', value: flights.filter(f => f.status !== 'cancelled').length, icon: Plane, color: 'from-sky-500 to-blue-600' },
  { title: 'LTA émises', value: flights.length, icon: Package, color: 'from-teal-500 to-teal-600' },
  { title: 'Taux remplissage', value: `${overallUtilization}%`, icon: Gauge, color: 'from-emerald-500 to-green-600' },
  { title: 'Temps moyen transit', value: '6h30', icon: Clock, color: 'from-cyan-500 to-teal-600' },
];

export default function AirFreightPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState<typeof flights[0] | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const pageSize = 8;

  const filtered = flights.filter(f => {
    const matchSearch = search === '' ||
      f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.airline.toLowerCase().includes(search.toLowerCase()) ||
      f.clientName.toLowerCase().includes(search.toLowerCase()) ||
      f.origin.toLowerCase().includes(search.toLowerCase()) ||
      f.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
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
            <Plane className="w-6 h-6 text-sky-500" />
            Fret Aérien
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des vols cargo et transports aériens</p>
        </div>
        <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau vol
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

      {/* Capacity Utilization Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-5 h-5 text-teal-500" />
            Capacité globale
          </CardTitle>
          <CardDescription>Utilisation de la capacité cargo totale</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Capacité totale</span>
              <span className="font-semibold">{totalCapacity.toLocaleString('fr-FR')} kg</span>
            </div>
            <div className="relative h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallUtilization}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #0d9488, #059669)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-sm">{overallUtilization}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Réservé: {totalBooked.toLocaleString('fr-FR')} kg</span>
              <span>Disponible: {(totalCapacity - totalBooked).toLocaleString('fr-FR')} kg</span>
            </div>
          </div>

          {/* Per-airline capacity breakdown */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Par compagnie</p>
            {(() => {
              const airlineMap = new Map<string, { capacity: number; booked: number }>();
              flights.forEach((f) => {
                const existing = airlineMap.get(f.airline) || { capacity: 0, booked: 0 };
                airlineMap.set(f.airline, {
                  capacity: existing.capacity + f.capacity,
                  booked: existing.booked + f.booked,
                });
              });
              return Array.from(airlineMap.entries()).map(([airline, data]) => {
                const util = data.capacity > 0 ? Math.round((data.booked / data.capacity) * 100) : 0;
                const colors = airlineColors[airline] || { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' };
                return (
                  <div key={airline} className="flex items-center gap-3">
                    <Badge className={`text-[10px] ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} w-28 justify-center`}>
                      {airlineCodes[airline] || airline.substring(0, 2)}
                    </Badge>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${util}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-10 text-right">{util}%</span>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Rechercher vol, compagnie, client..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="boarding">Embarquement</SelectItem>
                <SelectItem value="in_flight">En vol</SelectItem>
                <SelectItem value="landed">Atterri</SelectItem>
                <SelectItem value="delayed">Retardé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
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
                  <TableHead className="text-xs">Vol</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Compagnie</TableHead>
                  <TableHead className="text-xs">Route</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Départ</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">LTA</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Capacité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((flight) => {
                  const utilization = flight.capacity > 0 ? Math.round((flight.booked / flight.capacity) * 100) : 0;
                  const colors = airlineColors[flight.airline] || { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' };
                  return (
                    <TableRow key={flight.id} className="cursor-pointer hover:bg-sky-50/50 dark:hover:bg-sky-900/10" onClick={() => setSelectedFlight(flight)}>
                      <TableCell className="font-mono text-xs font-semibold">{flight.flightNumber}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`text-[10px] ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                          {flight.airline}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <span>{flight.origin}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>{flight.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{formatDate(flight.departureTime)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${flightStatusColors[flight.status]}`}>
                          {flightStatusLabels[flight.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] hidden lg:table-cell">{flight.awbNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-16 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${utilization}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500">{utilization}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">{filtered.length} vol(s) trouvé(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Préc.</Button>
              <span className="text-xs text-gray-500">{page + 1}/{totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Suiv.</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AWB Management Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" />
            Gestion LTA
          </CardTitle>
          <CardDescription>Lettres de Transport Aérien émises</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">N° LTA</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Compagnie</TableHead>
                  <TableHead className="text-xs">Route</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Colis</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Poids</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awbRecords.map((awb) => {
                  const colors = airlineColors[awb.airline] || { bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' };
                  return (
                    <TableRow key={awb.awb} className="hover:bg-sky-50/50 dark:hover:bg-sky-900/10">
                      <TableCell className="font-mono text-xs font-semibold">{awb.awb}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`text-[10px] ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                          {airlineCodes[awb.airline] || awb.airline}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <span>{awb.origin}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>{awb.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{awb.pieces}</TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">{awb.weight.toLocaleString('fr-FR')} kg</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${awbStatusColors[awb.status]}`}>
                          {awbStatusLabels[awb.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Flight Detail Dialog */}
      <Dialog open={!!selectedFlight} onOpenChange={() => setSelectedFlight(null)}>
        <DialogContent className="max-w-lg">
          {selectedFlight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-sky-500" />
                  {selectedFlight.flightNumber} - {selectedFlight.airline}
                </DialogTitle>
                <DialogDescription>Détails du vol cargo</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-gray-500">Statut</Label><p><Badge variant="secondary" className={`text-[10px] ${flightStatusColors[selectedFlight.status]}`}>{flightStatusLabels[selectedFlight.status]}</Badge></p></div>
                  <div><Label className="text-xs text-gray-500">Client</Label><p className="text-sm font-medium">{selectedFlight.clientName}</p></div>
                  <div><Label className="text-xs text-gray-500">Origine</Label><p className="text-sm font-medium">{selectedFlight.origin}</p></div>
                  <div><Label className="text-xs text-gray-500">Destination</Label><p className="text-sm font-medium">{selectedFlight.destination}</p></div>
                  <div><Label className="text-xs text-gray-500">Départ</Label><p className="text-sm font-medium">{formatDate(selectedFlight.departureTime)}</p></div>
                  <div><Label className="text-xs text-gray-500">Arrivée</Label><p className="text-sm font-medium">{formatDate(selectedFlight.arrivalTime)}</p></div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Informations cargo</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-[10px] text-gray-400">LTA</p><p className="text-sm font-mono text-xs">{selectedFlight.awbNumber}</p></div>
                    <div><p className="text-[10px] text-gray-400">Capacité</p><p className="text-sm font-medium">{selectedFlight.capacity.toLocaleString('fr-FR')} kg</p></div>
                    <div><p className="text-[10px] text-gray-400">Réservé</p><p className="text-sm font-medium">{selectedFlight.booked.toLocaleString('fr-FR')} kg</p></div>
                    <div><p className="text-[10px] text-gray-400">Taux de remplissage</p><p className="text-sm font-medium">{selectedFlight.capacity > 0 ? Math.round((selectedFlight.booked / selectedFlight.capacity) * 100) : 0}%</p></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Flight Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau vol</DialogTitle>
            <DialogDescription>Enregistrer un nouveau vol cargo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">N° Vol</Label>
                <Input placeholder="AH-1234" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Compagnie</Label>
                <Input placeholder="Air Algérie" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Origine</Label>
                <Input placeholder="Alger" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destination</Label>
                <Input placeholder="Paris" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Capacité (kg)</Label>
                <Input placeholder="15000" type="number" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Client</Label>
                <Input placeholder="Nom du client" className="h-9" />
              </div>
            </div>
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
