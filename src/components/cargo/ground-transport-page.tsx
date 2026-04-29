'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Clock,
  Plus,
  Search,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Timer,
  Fuel,
  User,
  FileCheck,
  Signature,
  Camera,
  Gauge,
  Route as RouteIcon,
  Star,
  TrendingUp,
  AlertTriangle,
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
import { routes, routeStatusLabels, formatDate } from '@/lib/test-data';

const routeStatusColors: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Driver performance data
const driverPerformance = [
  { name: 'Yacine Hamdi', trips: 47, onTimeRate: 96, rating: 4.8, fuelEfficiency: 92, avatar: 'YH' },
  { name: 'Rachid Kaci', trips: 38, onTimeRate: 89, rating: 4.5, fuelEfficiency: 88, avatar: 'RK' },
  { name: 'Ali Mezdad', trips: 52, onTimeRate: 94, rating: 4.7, fuelEfficiency: 91, avatar: 'AM' },
  { name: 'Sofiane Benali', trips: 31, onTimeRate: 87, rating: 4.3, fuelEfficiency: 85, avatar: 'SB' },
  { name: 'Bilal Kherrazi', trips: 29, onTimeRate: 91, rating: 4.6, fuelEfficiency: 90, avatar: 'BK' },
  { name: 'Karim Bouzid', trips: 43, onTimeRate: 93, rating: 4.4, fuelEfficiency: 87, avatar: 'KB' },
];

// Proof of delivery records
const podRecords = [
  { routeNumber: 'RT-2026-002', clientName: 'Sarl TechnoPlus', deliveredAt: '2026-03-07T20:00:00', signedBy: 'M. Bouzidi', hasPhoto: true, hasSignature: true, status: 'verified' },
  { routeNumber: 'RT-2026-007', clientName: 'Amina Zeroual', deliveredAt: '2026-03-06T17:00:00', signedBy: 'A. Zeroual', hasPhoto: true, hasSignature: true, status: 'verified' },
  { routeNumber: 'RT-2026-008', clientName: 'Sarl AgriPro', deliveredAt: '2026-03-05T15:00:00', signedBy: 'S. Hadj', hasPhoto: false, hasSignature: true, status: 'pending' },
];

// Fuel consumption data
const fuelData = {
  totalConsumption: 12850,
  avgPer100km: 32.5,
  costPerLiter: 54.70,
  monthlyCost: 702895,
  savingsVsLastMonth: -3.2,
  fleetEfficiency: 89,
};

const kpis = [
  { title: 'Routes actives', value: routes.filter(r => r.status === 'in_progress').length, icon: MapPin, color: 'from-orange-500 to-amber-600' },
  { title: 'Véhicules en route', value: routes.filter(r => r.status === 'in_progress').length, icon: Truck, color: 'from-teal-500 to-teal-600' },
  { title: 'Temps moyen livraison', value: '18h', icon: Timer, color: 'from-cyan-500 to-teal-600' },
  { title: 'Taux à l\'heure', value: '89%', icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
];

export default function GroundTransportPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<typeof routes[0] | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const pageSize = 8;

  const filtered = routes.filter(r => {
    const matchSearch = search === '' ||
      r.routeNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.origin.toLowerCase().includes(search.toLowerCase()) ||
      r.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Generate route stops SVG timeline for the selected route
  const renderRouteTimeline = (route: typeof routes[0]) => {
    const allStops = [route.origin, ...route.stops, route.destination];
    const totalStops = allStops.length;
    const svgWidth = 600;
    const svgHeight = totalStops > 4 ? totalStops * 50 + 20 : 220;
    const stopSpacing = totalStops > 1 ? (svgHeight - 40) / (totalStops - 1) : 0;
    const currentStopIndex = route.status === 'in_progress' ? Math.min(2, totalStops - 1) : route.status === 'completed' ? totalStops - 1 : 0;

    return (
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
        {/* Vertical line connecting all stops */}
        <line x1="60" y1="20" x2="60" y2={20 + (totalStops - 1) * stopSpacing} stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />

        {allStops.map((stop, index) => {
          const y = 20 + index * stopSpacing;
          const isCompleted = route.status === 'completed' || index <= currentStopIndex;
          const isCurrent = route.status === 'in_progress' && index === currentStopIndex;
          const isOrigin = index === 0;
          const isDestination = index === totalStops - 1;

          return (
            <g key={index}>
              {/* Progress line for completed segments */}
              {index > 0 && (isCompleted || isCurrent) && (
                <line x1="60" y1={y - stopSpacing} x2="60" y2={y} stroke="#0d9488" strokeWidth="2" />
              )}
              {/* Stop circle */}
              <circle cx="60" cy={y} r={isCurrent ? 10 : 7} fill={isCurrent ? '#0d9488' : isCompleted ? '#059669' : 'var(--muted)'} stroke={isCurrent ? '#0d9488' : 'var(--border)'} strokeWidth="2">
                {isCurrent && (
                  <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite" />
                )}
              </circle>
              {/* Stop icon for origin/destination */}
              {isOrigin && (
                <g transform={`translate(60, ${y})`}>
                  <circle r="14" fill="#0d9488" opacity="0.15" />
                </g>
              )}
              {isDestination && (
                <g transform={`translate(60, ${y})`}>
                  <circle r="14" fill="#059669" opacity="0.15" />
                </g>
              )}
              {/* Stop label */}
              <text x="82" y={y + 4} fill={isCurrent ? '#0d9488' : isCompleted ? 'var(--foreground)' : 'var(--muted-foreground)'} fontSize="12" fontWeight={isCurrent || isOrigin || isDestination ? '600' : '400'}>
                {stop}
              </text>
              {/* Stop type label */}
              <text x="82" y={y + 16} fill="var(--muted-foreground)" fontSize="9">
                {isOrigin ? 'Départ' : isDestination ? 'Arrivée' : `Arrêt ${index}`}
              </text>
              {/* Status indicator for current stop */}
              {isCurrent && route.status === 'in_progress' && (
                <g transform={`translate(30, ${y - 6})`}>
                  <rect x="0" y="0" width="22" height="12" rx="6" fill="#0d9488" />
                  <text x="11" y="9" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">ACTIF</text>
                </g>
              )}
              {/* Checkmark for completed stops */}
              {isCompleted && !isCurrent && index < totalStops - 1 && (
                <g transform={`translate(52, ${y - 4})`}>
                  <path d="M0 4 L3 7 L8 1" stroke="white" strokeWidth="1.5" fill="none" />
                </g>
              )}
            </g>
          );
        })}

        {/* Moving truck indicator for in_progress routes */}
        {route.status === 'in_progress' && (
          <g transform={`translate(42, ${20 + currentStopIndex * stopSpacing - 28})`}>
            <motion.g
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Truck x="0" y="0" width="16" height="16" color="#0d9488" />
            </motion.g>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-500" />
            Transport Terrestre
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des routes et transports par route</p>
        </div>
        <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle route
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

      {/* Fuel Consumption KPIs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-500" />
            Consommation carburant
          </CardTitle>
          <CardDescription>Indicateurs de consommation et efficacité énergétique</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Consommation totale</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{fuelData.totalConsumption.toLocaleString('fr-FR')} L</p>
              <p className="text-[10px] text-gray-400">Ce mois</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Moy. / 100km</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{fuelData.avgPer100km} L</p>
              <p className="text-[10px] text-gray-400">Flotte entière</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coût / litre</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{fuelData.costPerLiter} DA</p>
              <p className="text-[10px] text-gray-400">Prix moyen</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coût mensuel</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{(fuelData.monthlyCost / 1000).toFixed(0)}K DA</p>
              <div className="flex items-center gap-1">
                {fuelData.savingsVsLastMonth < 0 ? (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                )}
                <p className={`text-[10px] ${fuelData.savingsVsLastMonth < 0 ? 'text-red-500' : 'text-green-500'}`}>{fuelData.savingsVsLastMonth}% vs mois préc.</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Efficacité flotte</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Progress value={fuelData.fleetEfficiency} className="h-2" />
                </div>
                <span className="text-sm font-bold text-teal-600">{fuelData.fleetEfficiency}%</span>
              </div>
              <p className="text-[10px] text-gray-400">Objectif: 92%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Performance Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" />
            Performance des chauffeurs
          </CardTitle>
          <CardDescription>Classement et indicateurs par chauffeur</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {driverPerformance.sort((a, b) => b.rating - a.rating).map((driver, index) => (
              <motion.div
                key={driver.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {driver.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{driver.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">{driver.rating}</span>
                      <span className="text-[10px] text-gray-400 ml-1">({driver.trips} trajets)</span>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">TOP</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Ponctualité</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{driver.onTimeRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${driver.onTimeRate}%`, background: driver.onTimeRate >= 90 ? '#059669' : driver.onTimeRate >= 85 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Efficacité carburant</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{driver.fuelEfficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${driver.fuelEfficiency}%`, background: 'linear-gradient(90deg, #0d9488, #059669)' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proof of Delivery Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            Preuves de livraison
          </CardTitle>
          <CardDescription>Confirmation de réception et documents associés</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {podRecords.map((pod, index) => (
              <motion.div
                key={pod.routeNumber}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{pod.routeNumber}</p>
                    <p className="text-[10px] text-gray-400">Livré à {pod.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(pod.deliveredAt)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Signature className="w-3 h-3" />
                    {pod.signedBy}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-[9px] ${pod.hasSignature ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      <Signature className="w-2.5 h-2.5 mr-1" />
                      Signature
                    </Badge>
                    <Badge variant="secondary" className={`text-[9px] ${pod.hasPhoto ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      <Camera className="w-2.5 h-2.5 mr-1" />
                      Photo
                    </Badge>
                    <Badge variant="secondary" className={`text-[9px] ${pod.status === 'verified' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {pod.status === 'verified' ? 'Vérifié' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Stops Timeline Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-amber-500" />
            Timeline des arrêts en temps réel
          </CardTitle>
          <CardDescription>Visualisation des routes actives et planifiées</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {routes.filter(r => r.status === 'in_progress' || r.status === 'planned').slice(0, 4).map((route) => (
              <div key={route.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{route.routeNumber}</span>
                    <Badge variant="secondary" className={`text-[10px] ${routeStatusColors[route.status]}`}>
                      {routeStatusLabels[route.status]}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-gray-400">{route.origin} → {route.destination}</span>
                </div>
                <div className="overflow-x-auto max-h-52">
                  {renderRouteTimeline(route)}
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
              <Input placeholder="Rechercher route, chauffeur, client..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="planned">Planifié</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="delayed">Retardé</SelectItem>
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
                  <TableHead className="text-xs">Route</TableHead>
                  <TableHead className="text-xs">Trajet</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Chauffeur</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Véhicule</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Départ</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Distance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((route) => (
                  <TableRow key={route.id} className="cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-900/10" onClick={() => setSelectedRoute(route)}>
                    <TableCell className="font-mono text-xs font-semibold">{route.routeNumber}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <span>{route.origin}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span>{route.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{route.driverName}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell font-mono">{route.vehiclePlate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${routeStatusColors[route.status]}`}>
                        {routeStatusLabels[route.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{formatDate(route.departureTime)}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{route.distance.toLocaleString('fr-FR')} km</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">{filtered.length} route(s) trouvée(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Préc.</Button>
              <span className="text-xs text-gray-500">{page + 1}/{totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Suiv.</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Route Detail Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedRoute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-500" />
                  {selectedRoute.routeNumber}
                </DialogTitle>
                <DialogDescription>Détails de la route</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status and Client */}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-gray-500">Statut</Label><p><Badge variant="secondary" className={`text-[10px] ${routeStatusColors[selectedRoute.status]}`}>{routeStatusLabels[selectedRoute.status]}</Badge></p></div>
                  <div><Label className="text-xs text-gray-500">Client</Label><p className="text-sm font-medium">{selectedRoute.clientName}</p></div>
                  <div><Label className="text-xs text-gray-500">Origine</Label><p className="text-sm font-medium">{selectedRoute.origin}</p></div>
                  <div><Label className="text-xs text-gray-500">Destination</Label><p className="text-sm font-medium">{selectedRoute.destination}</p></div>
                  <div><Label className="text-xs text-gray-500">Chauffeur</Label><p className="text-sm font-medium">{selectedRoute.driverName}</p></div>
                  <div><Label className="text-xs text-gray-500">Véhicule</Label><p className="text-sm font-mono text-xs">{selectedRoute.vehiclePlate}</p></div>
                  <div><Label className="text-xs text-gray-500">Distance</Label><p className="text-sm font-medium">{selectedRoute.distance.toLocaleString('fr-FR')} km</p></div>
                  <div><Label className="text-xs text-gray-500">Durée estimée</Label><p className="text-sm font-medium">{selectedRoute.estimatedDuration}</p></div>
                  <div><Label className="text-xs text-gray-500">Départ</Label><p className="text-sm font-medium">{formatDate(selectedRoute.departureTime)}</p></div>
                  <div><Label className="text-xs text-gray-500">Arrivée</Label><p className="text-sm font-medium">{formatDate(selectedRoute.arrivalTime)}</p></div>
                </div>

                {/* Cargo info */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Cargo</Label>
                  <p className="text-sm font-medium mt-1">{selectedRoute.cargo}</p>
                </div>

                {/* Estimated fuel consumption */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    Estimation carburant
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div>
                      <p className="text-[10px] text-gray-400">Consommation estimée</p>
                      <p className="text-sm font-medium">{Math.round(selectedRoute.distance * 0.325)} L</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Coût estimé</p>
                      <p className="text-sm font-medium">{Math.round(selectedRoute.distance * 0.325 * 54.7).toLocaleString('fr-FR')} DA</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">CO2 estimé</p>
                      <p className="text-sm font-medium">{(selectedRoute.distance * 0.325 * 2.68 / 1000).toFixed(1)} t</p>
                    </div>
                  </div>
                </div>

                {/* Route stops SVG timeline in dialog */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <RouteIcon className="w-3 h-3" />
                    Itinéraire détaillé
                  </Label>
                  <div className="mt-3 overflow-x-auto max-h-64">
                    {renderRouteTimeline(selectedRoute)}
                  </div>
                </div>

                {/* Driver info card */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Chauffeur assigné
                  </Label>
                  {(() => {
                    const driver = driverPerformance.find(d => d.name === selectedRoute.driverName);
                    return driver ? (
                      <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                          {driver.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{driver.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {driver.rating}
                            </span>
                            <span className="text-[10px] text-gray-500">{driver.onTimeRate}% ponctuel</span>
                            <span className="text-[10px] text-gray-500">{driver.trips} trajets</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">{selectedRoute.driverName}</p>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Route Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle route</DialogTitle>
            <DialogDescription>Enregistrer une nouvelle route terrestre</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">Origine</Label><Input placeholder="Alger" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Destination</Label><Input placeholder="Oran" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Chauffeur</Label><Input placeholder="Nom du chauffeur" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Véhicule</Label><Input placeholder="Plaque d&apos;immatriculation" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Distance (km)</Label><Input placeholder="500" type="number" className="h-9" /></div>
              <div className="space-y-2"><Label className="text-xs">Client</Label><Input placeholder="Nom du client" className="h-9" /></div>
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
