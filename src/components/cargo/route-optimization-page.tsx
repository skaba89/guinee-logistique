'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  MapPin,
  Clock,
  Fuel,
  TrendingUp,
  Play,
  Pause,
  CheckCircle2,
  SkipForward,
  Plus,
  Trash2,
  GripVertical,
  ArrowUpDown,
  Navigation,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Timer,
  Truck,
  Users,
  ChevronRight,
  ChevronDown,
  Printer,
  RotateCcw,
  CircleDot,
  Square,
  Diamond,
  Eye,
  Layers,
  Target,
  Activity,
  Save,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/lib/use-currency';
import { useToastAction } from '@/components/cargo/toast-provider';

// ══════════════════════════════════════════════════════════════════
//  TYPES
// ══════════════════════════════════════════════════════════════════

interface RouteStop {
  id: string;
  type: 'ramasse' | 'livraison' | 'depot';
  clientName: string;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  timeWindow: { start: string; end: string };
  estimatedDuration: number; // minutes
  priority: 'haute' | 'moyenne' | 'basse';
  packageWeight: number; // kg
  blReference?: string;
  status: 'pending' | 'visited' | 'skipped';
}

interface OptimizedRoute {
  id: string;
  name: string;
  driverName: string;
  vehiclePlate: string;
  stops: RouteStop[];
  totalDistance: number;
  totalDuration: number;
  totalFuelCost: number;
  optimizationScore: number;
  savings: {
    distanceKm: number;
    timeMinutes: number;
    fuelCost: number;
    percentage: number;
  };
  createdAt: string;
  status: 'planifiee' | 'en_cours' | 'terminee';
}

interface GeofenceZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number; // km
  color: string;
  stopCount: number;
}

interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// ══════════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════════

const FUEL_CONSUMPTION_PER_100KM = 12; // litres
const FUEL_PRICE_PER_LITER = 12500; // GNF per litre
const AVG_SPEED_KMH = 35; // average speed in Conakry area

const ROUTE_COLORS = [
  '#0d9488', // teal
  '#ea580c', // orange
  '#0284c7', // sky-blue
  '#7c3aed', // violet
  '#e11d48', // rose
  '#059669', // emerald
];

const STOP_TYPE_COLORS = {
  livraison: '#059669',
  ramasse: '#ea580c',
  depot: '#0284c7',
};

const PRIORITY_COLORS = {
  haute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  moyenne: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  basse: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_COLORS = {
  planifiee: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  en_cours: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  terminee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

// ══════════════════════════════════════════════════════════════════
//  HAVERSINE DISTANCE
// ══════════════════════════════════════════════════════════════════

function calculateDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aCalc =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng *
      sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
  return R * c;
}

function totalDistance(stops: RouteStop[]): number {
  let dist = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    dist += calculateDistance(stops[i].coordinates, stops[i + 1].coordinates);
  }
  return dist;
}

function calcFuelCost(distanceKm: number): number {
  return (distanceKm / 100) * FUEL_CONSUMPTION_PER_100KM * FUEL_PRICE_PER_LITER;
}

function calcDuration(distanceKm: number, stops: RouteStop[]): number {
  const travelMinutes = (distanceKm / AVG_SPEED_KMH) * 60;
  const stopMinutes = stops.reduce((sum, s) => sum + s.estimatedDuration, 0);
  return travelMinutes + stopMinutes;
}

// ══════════════════════════════════════════════════════════════════
//  2-OPT ALGORITHM
// ══════════════════════════════════════════════════════════════════

function twoOptOptimize(stops: RouteStop[]): RouteStop[] {
  if (stops.length <= 2) return [...stops];
  const depot = stops[0];
  const rest = stops.slice(1);
  let route = [...rest];
  let improved = true;
  let iterations = 0;
  const maxIterations = 1000;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const newRoute = [...route];
        const segment = newRoute.slice(i, j + 1).reverse();
        newRoute.splice(i, j - i + 1, ...segment);
        const oldDist = totalDistance([depot, ...route]);
        const newDist = totalDistance([depot, ...newRoute]);
        if (newDist < oldDist) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }
  return [depot, ...route];
}

// ══════════════════════════════════════════════════════════════════
//  NEAREST NEIGHBOR HEURISTIC
// ══════════════════════════════════════════════════════════════════

function nearestNeighborRoute(stops: RouteStop[]): RouteStop[] {
  if (stops.length <= 2) return [...stops];
  const depot = stops[0];
  const unvisited = stops.slice(1);
  const ordered: RouteStop[] = [depot];
  let current = depot;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateDistance(current.coordinates, unvisited[i].coordinates);
      // Weight by priority
      const priorityWeight =
        unvisited[i].priority === 'haute' ? 0.7 : unvisited[i].priority === 'moyenne' ? 0.85 : 1.0;
      const weightedDist = d * priorityWeight;
      if (weightedDist < nearestDist) {
        nearestDist = weightedDist;
        nearestIdx = i;
      }
    }
    current = unvisited[nearestIdx];
    ordered.push(current);
    unvisited.splice(nearestIdx, 1);
  }
  return ordered;
}

// ══════════════════════════════════════════════════════════════════
//  OPTIMIZATION SCORE
// ══════════════════════════════════════════════════════════════════

function computeOptimizationScore(originalDist: number, optimizedDist: number): number {
  if (originalDist === 0) return 100;
  const improvement = ((originalDist - optimizedDist) / originalDist) * 100;
  return Math.min(100, Math.max(0, Math.round(50 + improvement * 2.5)));
}

// ══════════════════════════════════════════════════════════════════
//  SVG MAP HELPERS
// ══════════════════════════════════════════════════════════════════

function coordToSVG(
  lat: number,
  lng: number,
  bounds: GeoBounds,
  mapWidth: number,
  mapHeight: number
): { x: number; y: number } {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapWidth;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * mapHeight;
  return { x, y };
}

function getBounds(stops: RouteStop[]): GeoBounds {
  const lats = stops.map((s) => s.coordinates.lat);
  const lngs = stops.map((s) => s.coordinates.lng);
  const padLat = (Math.max(...lats) - Math.min(...lats)) * 0.15 || 0.05;
  const padLng = (Math.max(...lngs) - Math.min(...lngs)) * 0.15 || 0.05;
  return {
    minLat: Math.min(...lats) - padLat,
    maxLat: Math.max(...lats) + padLat,
    minLng: Math.min(...lngs) - padLng,
    maxLng: Math.max(...lngs) + padLng,
  };
}

// ══════════════════════════════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════════════════════════════

const MOCK_STOPS_POOL: RouteStop[] = [
  { id: 's1', type: 'depot', clientName: 'Dépot Central', address: 'Port Autonome', city: 'Kaloum', coordinates: { lat: 9.5092, lng: -13.7122 }, timeWindow: { start: '06:00', end: '18:00' }, estimatedDuration: 15, priority: 'haute', packageWeight: 0, blReference: undefined, status: 'pending' },
  { id: 's2', type: 'livraison', clientName: 'Société Minière de Boké', address: '12 Rue du Commerce', city: 'Dixinn', coordinates: { lat: 9.5350, lng: -13.6870 }, timeWindow: { start: '08:00', end: '12:00' }, estimatedDuration: 20, priority: 'haute', packageWeight: 450, blReference: 'BL-2024-0142', status: 'pending' },
  { id: 's3', type: 'ramasse', clientName: 'Guinée Import SARL', address: '45 Avenue de la République', city: 'Matam', coordinates: { lat: 9.5410, lng: -13.6620 }, timeWindow: { start: '07:30', end: '11:00' }, estimatedDuration: 25, priority: 'haute', packageWeight: 320, blReference: 'BL-2024-0148', status: 'pending' },
  { id: 's4', type: 'livraison', clientName: 'CIMENCAM Guinée', address: '78 Boulevard du Commerce', city: 'Matoto', coordinates: { lat: 9.5680, lng: -13.6320 }, timeWindow: { start: '09:00', end: '14:00' }, estimatedDuration: 30, priority: 'moyenne', packageWeight: 1200, blReference: 'BL-2024-0155', status: 'pending' },
  { id: 's5', type: 'ramasse', clientName: 'Aluminium Guinée Co.', address: '23 Route du Niger', city: 'Ratoma', coordinates: { lat: 9.5820, lng: -13.6580 }, timeWindow: { start: '08:00', end: '16:00' }, estimatedDuration: 20, priority: 'moyenne', packageWeight: 180, blReference: 'BL-2024-0160', status: 'pending' },
  { id: 's6', type: 'livraison', clientName: 'Friguia SA', address: '56 Quartier Almamya', city: 'Ratoma', coordinates: { lat: 9.5750, lng: -13.6750 }, timeWindow: { start: '08:30', end: '15:00' }, estimatedDuration: 25, priority: 'basse', packageWeight: 95, blReference: 'BL-2024-0163', status: 'pending' },
  { id: 's7', type: 'ramasse', clientName: 'Compagnie des Bauxites', address: '3 Route de Kindia', city: 'Dixinn', coordinates: { lat: 9.5280, lng: -13.6950 }, timeWindow: { start: '07:00', end: '12:00' }, estimatedDuration: 30, priority: 'haute', packageWeight: 560, blReference: 'BL-2024-0170', status: 'pending' },
  { id: 's8', type: 'livraison', clientName: 'SOguiPAMI', address: '90 Avenue Kaba', city: 'Kaloum', coordinates: { lat: 9.5150, lng: -13.7050 }, timeWindow: { start: '09:00', end: '16:00' }, estimatedDuration: 15, priority: 'moyenne', packageWeight: 210, blReference: 'BL-2024-0175', status: 'pending' },
  { id: 's9', type: 'depot', clientName: 'Entrepôt Kamsar', address: 'Zone Industrielle', city: 'Kamsar', coordinates: { lat: 10.0667, lng: -14.4833 }, timeWindow: { start: '06:00', end: '18:00' }, estimatedDuration: 20, priority: 'haute', packageWeight: 0, blReference: undefined, status: 'pending' },
  { id: 's10', type: 'livraison', clientName: 'CBG Bauxite', address: 'Port de Kamsar', city: 'Kamsar', coordinates: { lat: 10.0720, lng: -14.4900 }, timeWindow: { start: '07:00', end: '15:00' }, estimatedDuration: 35, priority: 'haute', packageWeight: 2400, blReference: 'BL-2024-0180', status: 'pending' },
  { id: 's11', type: 'ramasse', clientName: 'Kindia Agro', address: '15 Marché Central', city: 'Kindia', coordinates: { lat: 10.0588, lng: -12.8600 }, timeWindow: { start: '08:00', end: '13:00' }, estimatedDuration: 25, priority: 'moyenne', packageWeight: 380, blReference: 'BL-2024-0185', status: 'pending' },
  { id: 's12', type: 'livraison', clientName: 'Labé Commerce', address: '42 Avenue de l\'Indépendance', city: 'Labé', coordinates: { lat: 11.3167, lng: -12.2833 }, timeWindow: { start: '07:00', end: '14:00' }, estimatedDuration: 30, priority: 'haute', packageWeight: 650, blReference: 'BL-2024-0190', status: 'pending' },
  { id: 's13', type: 'ramasse', clientName: 'Nzérékoré Export', address: '8 Route de la Forêt', city: 'Nzérékoré', coordinates: { lat: 7.7500, lng: -8.8167 }, timeWindow: { start: '06:30', end: '12:00' }, estimatedDuration: 35, priority: 'haute', packageWeight: 890, blReference: 'BL-2024-0195', status: 'pending' },
  { id: 's14', type: 'livraison', clientName: 'Boké Minerals', address: 'Zone Minière', city: 'Boké', coordinates: { lat: 10.9333, lng: -14.3000 }, timeWindow: { start: '07:00', end: '12:00' }, estimatedDuration: 30, priority: 'moyenne', packageWeight: 1100, blReference: 'BL-2024-0200', status: 'pending' },
  { id: 's15', type: 'ramasse', clientName: 'Matoto Express', address: '33 Carrefour Matoto', city: 'Matoto', coordinates: { lat: 9.5620, lng: -13.6450 }, timeWindow: { start: '08:00', end: '17:00' }, estimatedDuration: 15, priority: 'basse', packageWeight: 72, blReference: 'BL-2024-0205', status: 'pending' },
  { id: 's16', type: 'livraison', clientName: 'Conakry Pharma', address: '67 Avenue de la Paix', city: 'Dixinn', coordinates: { lat: 9.5320, lng: -13.6800 }, timeWindow: { start: '09:00', end: '11:30' }, estimatedDuration: 20, priority: 'haute', packageWeight: 150, blReference: 'BL-2024-0210', status: 'pending' },
  { id: 's17', type: 'depot', clientName: 'Dépot Minière', address: 'Zone Portuaire', city: 'Kaloum', coordinates: { lat: 9.5060, lng: -13.7180 }, timeWindow: { start: '06:00', end: '18:00' }, estimatedDuration: 10, priority: 'haute', packageWeight: 0, blReference: undefined, status: 'pending' },
  { id: 's18', type: 'ramasse', clientName: 'Ratoma Distribution', address: '11 Marché Madina', city: 'Ratoma', coordinates: { lat: 9.5880, lng: -13.6680 }, timeWindow: { start: '07:30', end: '15:00' }, estimatedDuration: 20, priority: 'moyenne', packageWeight: 260, blReference: 'BL-2024-0215', status: 'pending' },
  { id: 's19', type: 'livraison', clientName: 'Guinée Telecom', address: '5 Tourtel Rond-Point', city: 'Matam', coordinates: { lat: 9.5380, lng: -13.6700 }, timeWindow: { start: '08:30', end: '12:00' }, estimatedDuration: 15, priority: 'moyenne', packageWeight: 130, blReference: 'BL-2024-0220', status: 'pending' },
  { id: 's20', type: 'ramasse', clientName: 'Kaloum Trading', address: '9 Quai de Commerce', city: 'Kaloum', coordinates: { lat: 9.5120, lng: -13.7100 }, timeWindow: { start: '07:00', end: '11:00' }, estimatedDuration: 20, priority: 'haute', packageWeight: 440, blReference: 'BL-2024-0225', status: 'pending' },
];

const MOCK_ROUTES: OptimizedRoute[] = [
  {
    id: 'r1', name: 'Tournée Conakry Nord', driverName: 'Mamadou Diallo', vehiclePlate: 'CK-2024-A123',
    stops: [MOCK_STOPS_POOL[0], MOCK_STOPS_POOL[1], MOCK_STOPS_POOL[2], MOCK_STOPS_POOL[3], MOCK_STOPS_POOL[4], MOCK_STOPS_POOL[5]],
    totalDistance: 42.8, totalDuration: 195, totalFuelCost: 642000, optimizationScore: 87,
    savings: { distanceKm: 12.3, timeMinutes: 35, fuelCost: 184500, percentage: 22.3 },
    createdAt: '2024-12-15T08:00:00', status: 'en_cours',
  },
  {
    id: 'r2', name: 'Tournée Conakry Sud', driverName: 'Ibrahim Camara', vehiclePlate: 'CK-2024-B456',
    stops: [MOCK_STOPS_POOL[0], MOCK_STOPS_POOL[6], MOCK_STOPS_POOL[7], MOCK_STOPS_POOL[15], MOCK_STOPS_POOL[18]],
    totalDistance: 28.5, totalDuration: 145, totalFuelCost: 427500, optimizationScore: 92,
    savings: { distanceKm: 9.8, timeMinutes: 28, fuelCost: 147000, percentage: 25.6 },
    createdAt: '2024-12-15T08:30:00', status: 'planifiee',
  },
  {
    id: 'r3', name: 'Tournée Boké-Kamsar', driverName: 'Sory Condé', vehiclePlate: 'BK-2024-C789',
    stops: [MOCK_STOPS_POOL[8], MOCK_STOPS_POOL[9], MOCK_STOPS_POOL[13]],
    totalDistance: 135.2, totalDuration: 285, totalFuelCost: 2028000, optimizationScore: 78,
    savings: { distanceKm: 28.5, timeMinutes: 45, fuelCost: 427500, percentage: 17.4 },
    createdAt: '2024-12-14T06:00:00', status: 'terminee',
  },
  {
    id: 'r4', name: 'Tournée Intérieur Labé', driverName: 'Abdoulaye Touré', vehiclePlate: 'LB-2024-D012',
    stops: [MOCK_STOPS_POOL[16], MOCK_STOPS_POOL[11]],
    totalDistance: 312.5, totalDuration: 540, totalFuelCost: 4687500, optimizationScore: 71,
    savings: { distanceKm: 45.0, timeMinutes: 60, fuelCost: 675000, percentage: 12.6 },
    createdAt: '2024-12-13T05:00:00', status: 'terminee',
  },
  {
    id: 'r5', name: 'Tournée Express Matoto', driverName: 'Kadiatou Bah', vehiclePlate: 'CK-2024-E345',
    stops: [MOCK_STOPS_POOL[0], MOCK_STOPS_POOL[3], MOCK_STOPS_POOL[14], MOCK_STOPS_POOL[17]],
    totalDistance: 35.2, totalDuration: 165, totalFuelCost: 528000, optimizationScore: 89,
    savings: { distanceKm: 10.7, timeMinutes: 30, fuelCost: 160500, percentage: 23.3 },
    createdAt: '2024-12-15T09:00:00', status: 'en_cours',
  },
  {
    id: 'r6', name: 'Tournée Kaloum Ramasse', driverName: 'Moussa Sylla', vehiclePlate: 'CK-2024-F678',
    stops: [MOCK_STOPS_POOL[0], MOCK_STOPS_POOL[19], MOCK_STOPS_POOL[7]],
    totalDistance: 18.9, totalDuration: 95, totalFuelCost: 283500, optimizationScore: 94,
    savings: { distanceKm: 7.2, timeMinutes: 22, fuelCost: 108000, percentage: 27.6 },
    createdAt: '2024-12-15T07:30:00', status: 'en_cours',
  },
  {
    id: 'r7', name: 'Tournée Kindia-Nzérékoré', driverName: 'Fanta Kouyaté', vehiclePlate: 'NZ-2024-G901',
    stops: [MOCK_STOPS_POOL[16], MOCK_STOPS_POOL[10], MOCK_STOPS_POOL[12]],
    totalDistance: 478.3, totalDuration: 720, totalFuelCost: 7174500, optimizationScore: 68,
    savings: { distanceKm: 65.2, timeMinutes: 85, fuelCost: 978000, percentage: 12.0 },
    createdAt: '2024-12-12T04:00:00', status: 'terminee',
  },
];

const MOCK_GEOFENCE_ZONES: GeofenceZone[] = [
  { id: 'z1', name: 'Conakry Centre', center: { lat: 9.5300, lng: -13.6800 }, radius: 8, color: '#0d9488', stopCount: 14 },
  { id: 'z2', name: 'Boké-Kamsar', center: { lat: 10.5000, lng: -14.4000 }, radius: 60, color: '#ea580c', stopCount: 3 },
  { id: 'z3', name: 'Kindia', center: { lat: 10.0588, lng: -12.8600 }, radius: 25, color: '#0284c7', stopCount: 1 },
  { id: 'z4', name: 'Haute-Guinée', center: { lat: 11.0000, lng: -12.0000 }, radius: 80, color: '#7c3aed', stopCount: 2 },
];

// ══════════════════════════════════════════════════════════════════
//  ANALYTICS MOCK DATA
// ══════════════════════════════════════════════════════════════════

const FUEL_SAVINGS_DATA = [
  { week: 'S1', savings: 1250000, baseline: 8500000 },
  { week: 'S2', savings: 1480000, baseline: 9200000 },
  { week: 'S3', savings: 1620000, baseline: 8900000 },
  { week: 'S4', savings: 1390000, baseline: 9500000 },
  { week: 'S5', savings: 1750000, baseline: 8700000 },
  { week: 'S6', savings: 1920000, baseline: 9100000 },
  { week: 'S7', savings: 2100000, baseline: 8600000 },
  { week: 'S8', savings: 2280000, baseline: 8400000 },
];

const DISTANCE_SAVED_DATA = [
  { route: 'Conakry Nord', saved: 12.3 },
  { route: 'Conakry Sud', saved: 9.8 },
  { route: 'Boké-Kamsar', saved: 28.5 },
  { route: 'Labé', saved: 45.0 },
  { route: 'Matoto', saved: 10.7 },
  { route: 'Kaloum', saved: 7.2 },
  { route: 'Kindia-NZ', saved: 65.2 },
];

const SCORE_DISTRIBUTION = [
  { name: 'Excellent (>90)', value: 2, fill: '#059669' },
  { name: 'Bon (80-90)', value: 3, fill: '#0d9488' },
  { name: 'Moyen (70-80)', value: 1, fill: '#ea580c' },
  { name: 'Faible (<70)', value: 1, fill: '#e11d48' },
];

const STOPS_TREND_DATA = [
  { month: 'Juil', avgStops: 5.2, avgScore: 72 },
  { month: 'Août', avgStops: 5.8, avgScore: 75 },
  { month: 'Sept', avgStops: 6.1, avgScore: 78 },
  { month: 'Oct', avgStops: 5.5, avgScore: 81 },
  { month: 'Nov', avgStops: 6.4, avgScore: 84 },
  { month: 'Déc', avgStops: 6.8, avgScore: 87 },
];

// ══════════════════════════════════════════════════════════════════
//  TIME FORMATTING
// ══════════════════════════════════════════════════════════════════

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}min`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

function formatFrenchDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ══════════════════════════════════════════════════════════════════
//  SVG ROUTE MAP COMPONENT
// ══════════════════════════════════════════════════════════════════

function RouteSVGMap({
  stops,
  routeColor,
  showLabels = true,
  animated = true,
  width = 700,
  height = 420,
}: {
  stops: RouteStop[];
  routeColor: string;
  showLabels?: boolean;
  animated?: boolean;
  width?: number;
  height?: number;
}) {
  const bounds = useMemo(() => getBounds(stops), [stops]);
  const points = useMemo(
    () => stops.map((s) => ({ ...s, svg: coordToSVG(s.coordinates.lat, s.coordinates.lng, bounds, width, height) })),
    [stops, bounds, width, height]
  );

  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.svg.x} ${p.svg.y}`)
      .join(' ');
  }, [points]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      style={{ maxHeight: '420px' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
        </filter>
        {animated && (
          <style>
            {`@keyframes dashMove {
              to { stroke-dashoffset: -20; }
            }
            .animated-route {
              animation: dashMove 1s linear infinite;
            }
            @keyframes pulse-ring {
              0% { transform: scale(0.8); opacity: 0.8; }
              100% { transform: scale(2); opacity: 0; }
            }`}
          </style>
        )}
      </defs>

      {/* Grid */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`vg${i}`} x1={(width / 9) * (i + 1)} y1={0} x2={(width / 9) * (i + 1)} y2={height} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`hg${i}`} x1={0} y1={(height / 7) * (i + 1)} x2={width} y2={(height / 7) * (i + 1)} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
      ))}

      {/* Route path shadow */}
      <path d={pathD} fill="none" stroke={routeColor} strokeWidth="6" opacity="0.1" strokeLinecap="round" strokeLinejoin="round" />

      {/* Route path main */}
      <path d={pathD} fill="none" stroke={routeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

      {/* Animated overlay */}
      {animated && (
        <path d={pathD} fill="none" stroke={routeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8,12" className="animated-route" opacity="0.9" />
      )}

      {/* Direction arrows along path */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const mx = (p.svg.x + next.svg.x) / 2;
        const my = (p.svg.y + next.svg.y) / 2;
        const angle = (Math.atan2(next.svg.y - p.svg.y, next.svg.x - p.svg.x) * 180) / Math.PI;
        return (
          <g key={`arrow-${i}`} transform={`translate(${mx},${my}) rotate(${angle})`}>
            <polygon points="-4,-3 4,0 -4,3" fill={routeColor} opacity="0.5" />
          </g>
        );
      })}

      {/* Stop markers */}
      {points.map((p, i) => {
        const isDepot = p.type === 'depot';
        const color = STOP_TYPE_COLORS[p.type];
        return (
          <g key={p.id} filter="url(#shadow)">
            {/* Pulse ring for depot or first stop */}
            {(isDepot || i === 0) && animated && (
              <circle cx={p.svg.x} cy={p.svg.y} r="12" fill={color} opacity="0.3">
                <animate attributeName="r" from="8" to="20" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {isDepot ? (
              <rect x={p.svg.x - 8} y={p.svg.y - 8} width="16" height="16" rx="3" fill={color} stroke="white" strokeWidth="2" />
            ) : (
              <circle cx={p.svg.x} cy={p.svg.y} r="7" fill={color} stroke="white" strokeWidth="2" />
            )}
            {showLabels && (
              <>
                <text x={p.svg.x} y={p.svg.y + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                  {i + 1}
                </text>
                <text x={p.svg.x + 12} y={p.svg.y + 3} fill="#374151" fontSize="9" fontWeight="500">
                  {p.clientName.length > 18 ? p.clientName.slice(0, 18) + '…' : p.clientName}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(15, ${height - 70})`}>
        <rect x="0" y="0" width="140" height="65" rx="6" fill="white" fillOpacity="0.9" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx="15" cy="15" r="5" fill={STOP_TYPE_COLORS.livraison} />
        <text x="28" y="18" fill="#374151" fontSize="9">Livraison</text>
        <circle cx="15" cy="32" r="5" fill={STOP_TYPE_COLORS.ramasse} />
        <text x="28" y="35" fill="#374151" fontSize="9">Ramasse</text>
        <rect x="10" y="44" width="10" height="10" rx="2" fill={STOP_TYPE_COLORS.depot} />
        <text x="28" y="53" fill="#374151" fontSize="9">Dépôt</text>
        <line x1="85" y1="15" x2="110" y2="15" stroke={routeColor} strokeWidth="2" />
        <text x="115" y="18" fill="#374151" fontSize="9">Route</text>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
//  GEOFENCE SVG MAP COMPONENT
// ══════════════════════════════════════════════════════════════════

function GeofenceSVGMap({ zones, width = 700, height = 420 }: { zones: GeofenceZone[]; width?: number; height?: number }) {
  const allStops = zones.flatMap((z) =>
    Array.from({ length: z.stopCount }, (_, i) => ({
      lat: z.center.lat + (Math.random() - 0.5) * z.radius * 0.015,
      lng: z.center.lng + (Math.random() - 0.5) * z.radius * 0.015,
    }))
  );

  const bounds: GeoBounds = useMemo(() => {
    const lats = zones.map((z) => z.center.lat);
    const lngs = zones.map((z) => z.center.lng);
    return {
      minLat: Math.min(...lats) - 2,
      maxLat: Math.max(...lats) + 2,
      minLng: Math.min(...lngs) - 3,
      maxLng: Math.max(...lngs) + 3,
    };
  }, [zones]);

  const zoneSvgData = useMemo(
    () =>
      zones.map((z) => ({
        ...z,
        svg: coordToSVG(z.center.lat, z.center.lng, bounds, width, height),
        radiusSvg: (z.radius / ((bounds.maxLat - bounds.minLat) * 111)) * height,
      })),
    [zones, bounds, width, height]
  );

  const stopDots = useMemo(
    () =>
      allStops.map((s, i) => ({
        ...s,
        svg: coordToSVG(s.lat, s.lng, bounds, width, height),
        key: i,
      })),
    [allStops, bounds, width, height]
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800" style={{ maxHeight: '420px' }}>
      <defs>
        {zones.map((z) => (
          <radialGradient key={z.id} id={`zoneGrad-${z.id}`}>
            <stop offset="0%" stopColor={z.color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={z.color} stopOpacity="0.03" />
          </radialGradient>
        ))}
      </defs>

      {/* Grid */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`vg${i}`} x1={(width / 9) * (i + 1)} y1={0} x2={(width / 9) * (i + 1)} y2={height} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4,4" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`hg${i}`} x1={0} y1={(height / 7) * (i + 1)} x2={width} y2={(height / 7) * (i + 1)} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4,4" />
      ))}

      {/* Zones */}
      {zoneSvgData.map((z) => (
        <g key={z.id}>
          <circle cx={z.svg.x} cy={z.svg.y} r={z.radiusSvg} fill={`url(#zoneGrad-${z.id})`} stroke={z.color} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.8" />
          <circle cx={z.svg.x} cy={z.svg.y} r="4" fill={z.color} />
          <text x={z.svg.x} y={z.svg.y - z.radiusSvg - 5} textAnchor="middle" fill={z.color} fontSize="10" fontWeight="600">{z.name}</text>
          <text x={z.svg.x} y={z.svg.y + 14} textAnchor="middle" fill="#6b7280" fontSize="9">{z.stopCount} arrêts</text>
        </g>
      ))}

      {/* Stop dots */}
      {stopDots.map((d, i) => (
        <circle key={i} cx={d.svg.x} cy={d.svg.y} r="2.5" fill="#059669" opacity="0.6" />
      ))}

      {/* Legend */}
      <g transform={`translate(15, ${height - 45})`}>
        <rect x="0" y="0" width="150" height="38" rx="6" fill="white" fillOpacity="0.9" stroke="#e5e7eb" />
        <circle cx="15" cy="14" r="4" fill="#059669" opacity="0.6" />
        <text x="25" y="17" fill="#374151" fontSize="9">Point d&apos;arrêt</text>
        <circle cx="15" cy="30" r="8" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="28" y="33" fill="#374151" fontSize="9">Zone géofence</text>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
//  KPI CARD COMPONENT
// ══════════════════════════════════════════════════════════════════

function KPICard({ icon: Icon, label, value, subValue, color, delay = 0 }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
              {subValue && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{subValue}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CREATE ROUTE DIALOG
// ══════════════════════════════════════════════════════════════════

function CreateRouteDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (route: Omit<OptimizedRoute, 'id' | 'totalDistance' | 'totalDuration' | 'totalFuelCost' | 'optimizationScore' | 'savings' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [selectedStops, setSelectedStops] = useState<RouteStop[]>([]);
  const [status, setStatus] = useState<'planifiee' | 'en_cours' | 'terminee'>('planifiee');
  const { toast } = useToastAction();

  const addStop = (stop: RouteStop) => {
    if (!selectedStops.find((s) => s.id === stop.id)) {
      setSelectedStops((prev) => [...prev, { ...stop, id: stop.id + '_' + Date.now() }]);
    }
  };

  const removeStop = (stopId: string) => {
    setSelectedStops((prev) => prev.filter((s) => s.id !== stopId));
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...selectedStops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;
    [newStops[index], newStops[targetIdx]] = [newStops[targetIdx], newStops[index]];
    setSelectedStops(newStops);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Nom requis', 'Veuillez saisir un nom pour la tournée'); return; }
    if (!driverName.trim()) { toast.error('Conducteur requis', 'Veuillez sélectionner un conducteur'); return; }
    if (selectedStops.length < 2) { toast.error('Arrêts insuffisants', 'Ajoutez au moins 2 arrêts'); return; }
    onSave({ name, driverName, vehiclePlate, stops: selectedStops, status });
    setName(''); setDriverName(''); setVehiclePlate(''); setSelectedStops([]); setStatus('planifiee');
    onOpenChange(false);
  };

  const availableStops = MOCK_STOPS_POOL.filter((s) => s.type !== 'depot');
  const depotStops = MOCK_STOPS_POOL.filter((s) => s.type === 'depot');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-teal-600" />
            Nouvelle Tournée
          </DialogTitle>
          <DialogDescription>Créez une nouvelle tournée en ajoutant des arrêts et en assignant un conducteur</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nom de la tournée</Label>
              <Input placeholder="Ex: Tournée Conakry Est" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Conducteur</Label>
              <Select value={driverName} onValueChange={setDriverName}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mamadou Diallo">Mamadou Diallo</SelectItem>
                  <SelectItem value="Ibrahim Camara">Ibrahim Camara</SelectItem>
                  <SelectItem value="Sory Condé">Sory Condé</SelectItem>
                  <SelectItem value="Abdoulaye Touré">Abdoulaye Touré</SelectItem>
                  <SelectItem value="Kadiatou Bah">Kadiatou Bah</SelectItem>
                  <SelectItem value="Moussa Sylla">Moussa Sylla</SelectItem>
                  <SelectItem value="Fanta Kouyaté">Fanta Kouyaté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Véhicule</Label>
              <Select value={vehiclePlate} onValueChange={setVehiclePlate}>
                <SelectTrigger><SelectValue placeholder="Immatriculation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CK-2024-A123">CK-2024-A123</SelectItem>
                  <SelectItem value="CK-2024-B456">CK-2024-B456</SelectItem>
                  <SelectItem value="BK-2024-C789">BK-2024-C789</SelectItem>
                  <SelectItem value="LB-2024-D012">LB-2024-D012</SelectItem>
                  <SelectItem value="CK-2024-E345">CK-2024-E345</SelectItem>
                  <SelectItem value="CK-2024-F678">CK-2024-F678</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available stops */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Arrêts disponibles</Label>
              <ScrollArea className="h-64">
                <div className="space-y-1.5 pr-3">
                  {depotStops.map((stop) => (
                    <div key={stop.id} className="flex items-center gap-2 p-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" onClick={() => addStop(stop)}>
                      <Square className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{stop.clientName}</p>
                        <p className="text-[10px] text-gray-500">{stop.city}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  ))}
                  {availableStops.map((stop) => (
                    <div key={stop.id} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => addStop(stop)}>
                      <CircleDot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: STOP_TYPE_COLORS[stop.type] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{stop.clientName}</p>
                        <p className="text-[10px] text-gray-500">{stop.city} — {stop.blReference || 'Manuel'}</p>
                      </div>
                      <Badge variant="outline" className={PRIORITY_COLORS[stop.priority]} style={{ fontSize: '9px', padding: '0 4px' }}>
                        {stop.priority}
                      </Badge>
                      <Plus className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Selected stops */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Arrêts sélectionnés ({selectedStops.length})</Label>
              <ScrollArea className="h-64">
                <div className="space-y-1 pr-3">
                  <AnimatePresence>
                    {selectedStops.map((stop, idx) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-gray-900 shadow-sm"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: ROUTE_COLORS[idx % ROUTE_COLORS.length] }}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{stop.clientName}</p>
                          <p className="text-[10px] text-gray-500">{stop.address}, {stop.city}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveStop(idx, 'up')} disabled={idx === 0}>
                            <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveStop(idx, 'down')} disabled={idx === selectedStops.length - 1}>
                            <ChevronRight className="w-3 h-3 rotate-90" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeStop(stop.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {selectedStops.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-8">Cliquez sur un arrêt pour l&apos;ajouter</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} className="text-white">
            <Save className="w-4 h-4 mr-2" />
            Créer la tournée
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
//  OPTIMIZATION COMPARISON PANEL
// ══════════════════════════════════════════════════════════════════

function OptimizationComparison({ originalStops, optimizedStops, originalDist, optimizedDist }: {
  originalStops: RouteStop[];
  optimizedStops: RouteStop[];
  originalDist: number;
  optimizedDist: number;
}) {
  const savingsKm = originalDist - optimizedDist;
  const savingsPct = originalDist > 0 ? ((savingsKm / originalDist) * 100).toFixed(1) : '0';
  const savingsTime = (savingsKm / AVG_SPEED_KMH) * 60;
  const savingsFuel = calcFuelCost(savingsKm);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Distance gagnée</p>
            <p className="text-lg font-bold text-emerald-600">{savingsKm.toFixed(1)} km</p>
            <p className="text-xs text-emerald-500">-{savingsPct}%</p>
          </CardContent>
        </Card>
        <Card className="border-sky-200 dark:border-sky-800">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Temps gagné</p>
            <p className="text-lg font-bold text-sky-600">{formatMinutes(savingsTime)}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Carburant économisé</p>
            <p className="text-lg font-bold text-amber-600">{Math.round(savingsFuel / 1000)}K GNF</p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 dark:border-teal-800">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Score</p>
            <p className="text-lg font-bold text-teal-600">{computeOptimizationScore(originalDist, optimizedDist)}/100</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-red-500" />
              Ordre original
              <Badge variant="outline" className="text-[10px]">{originalDist.toFixed(1)} km</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex items-center gap-1 flex-wrap">
              {originalStops.map((s, i) => (
                <React.Fragment key={s.id}>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-medium">
                    {i + 1}. {s.clientName.slice(0, 12)}
                  </span>
                  {i < originalStops.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Ordre optimisé
              <Badge variant="outline" className="text-[10px]">{optimizedDist.toFixed(1)} km</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex items-center gap-1 flex-wrap">
              {optimizedStops.map((s, i) => (
                <React.Fragment key={s.id}>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium">
                    {i + 1}. {s.clientName.slice(0, 12)}
                  </span>
                  {i < optimizedStops.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export default function RouteOptimizationPage() {
  const { format } = useCurrency();
  const { toast } = useToastAction();

  // ─── State ────────────────────────────────────────────────────
  const [routes, setRoutes] = useState<OptimizedRoute[]>(MOCK_ROUTES);
  const [activeTab, setActiveTab] = useState('planification');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(MOCK_ROUTES[0].id);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedStops, setOptimizedStops] = useState<RouteStop[] | null>(null);
  const [originalStops, setOriginalStops] = useState<RouteStop[] | null>(null);
  const [originalDist, setOriginalDist] = useState(0);
  const [optimizedDist, setOptimizedDist] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [algorithm, setAlgorithm] = useState<'2opt' | 'nearest'>('2opt');
  const [geofenceZones] = useState<GeofenceZone[]>(MOCK_GEOFENCE_ZONES);
  const [printing, setPrinting] = useState(false);
  const [routeProgress, setRouteProgress] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    MOCK_ROUTES.forEach((r) => {
      if (r.status === 'en_cours') p[r.id] = Math.floor(Math.random() * r.stops.length * 0.6) + 1;
      else if (r.status === 'terminee') p[r.id] = r.stops.length;
      else p[r.id] = 0;
    });
    return p;
  });

  const selectedRoute = useMemo(() => routes.find((r) => r.id === selectedRouteId) || routes[0], [routes, selectedRouteId]);

  // ─── KPIs ─────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const activeRoutes = routes.filter((r) => r.status === 'en_cours').length;
    const totalSavedKm = routes.reduce((s, r) => s + r.savings.distanceKm, 0);
    const avgTimeSaved = routes.reduce((s, r) => s + r.savings.timeMinutes, 0) / routes.length;
    const avgScore = Math.round(routes.reduce((s, r) => s + r.optimizationScore, 0) / routes.length);
    const totalFuelSaved = routes.reduce((s, r) => s + r.savings.fuelCost, 0);
    return { activeRoutes, totalSavedKm, avgTimeSaved, avgScore, totalFuelSaved };
  }, [routes]);

  // ─── Algorithm runner ─────────────────────────────────────────
  const runOptimization = useCallback(() => {
    if (!selectedRoute) return;
    setOptimizing(true);
    setShowComparison(false);
    const original = [...selectedRoute.stops];
    const origDist = totalDistance(original);
    setOriginalStops(original);
    setOriginalDist(origDist);

    setTimeout(() => {
      let result: RouteStop[];
      if (algorithm === '2opt') {
        result = twoOptOptimize(original);
      } else {
        result = nearestNeighborRoute(original);
      }
      const optDist = totalDistance(result);
      setOptimizedStops(result);
      setOptimizedDist(optDist);
      setOptimizing(false);
      setShowComparison(true);
      const score = computeOptimizationScore(origDist, optDist);
      toast.success('Optimisation terminée', `Score: ${score}/100 — ${((origDist - optDist) / origDist * 100).toFixed(1)}% de distance économisée`);
    }, 1800);
  }, [selectedRoute, algorithm, toast]);

  // ─── Apply optimization ───────────────────────────────────────
  const applyOptimization = useCallback(() => {
    if (!optimizedStops || !selectedRoute) return;
    const newDist = totalDistance(optimizedStops);
    const newDuration = calcDuration(newDist, optimizedStops);
    const newFuel = calcFuelCost(newDist);
    const origDist = originalDist;
    const score = computeOptimizationScore(origDist, newDist);

    setRoutes((prev) =>
      prev.map((r) =>
        r.id === selectedRoute.id
          ? {
              ...r,
              stops: optimizedStops,
              totalDistance: Math.round(newDist * 10) / 10,
              totalDuration: Math.round(newDuration),
              totalFuelCost: Math.round(newFuel),
              optimizationScore: score,
              savings: {
                distanceKm: Math.round((origDist - newDist) * 10) / 10,
                timeMinutes: Math.round(((origDist - newDist) / AVG_SPEED_KMH) * 60),
                fuelCost: Math.round(calcFuelCost(origDist - newDist)),
                percentage: Math.round(((origDist - newDist) / origDist) * 1000) / 10,
              },
            }
          : r
      )
    );
    setShowComparison(false);
    setOptimizedStops(null);
    toast.success('Tournée mise à jour', 'L&apos;itinéraire optimisé a été appliqué');
  }, [optimizedStops, selectedRoute, originalDist, toast]);

  // ─── Create route handler ─────────────────────────────────────
  const handleCreateRoute = useCallback((data: Omit<OptimizedRoute, 'id' | 'totalDistance' | 'totalDuration' | 'totalFuelCost' | 'optimizationScore' | 'savings' | 'createdAt'>) => {
    const dist = totalDistance(data.stops);
    const dur = calcDuration(dist, data.stops);
    const fuel = calcFuelCost(dist);
    const newRoute: OptimizedRoute = {
      ...data,
      id: 'r_' + Date.now(),
      totalDistance: Math.round(dist * 10) / 10,
      totalDuration: Math.round(dur),
      totalFuelCost: Math.round(fuel),
      optimizationScore: 50,
      savings: { distanceKm: 0, timeMinutes: 0, fuelCost: 0, percentage: 0 },
      createdAt: new Date().toISOString(),
    };
    setRoutes((prev) => [...prev, newRoute]);
    setSelectedRouteId(newRoute.id);
    setRouteProgress((prev) => ({ ...prev, [newRoute.id]: 0 }));
    toast.success('Tournée créée', `"${data.name}" ajoutée avec ${data.stops.length} arrêts`);
  }, [toast]);

  // ─── Start/Advance route ──────────────────────────────────────
  const startRoute = useCallback((routeId: string) => {
    setRoutes((prev) => prev.map((r) => (r.id === routeId ? { ...r, status: 'en_cours' as const } : r)));
    setRouteProgress((prev) => ({ ...prev, [routeId]: 1 }));
    toast.info('Tournée démarrée', 'Les arrêts sont en cours de traitement');
  }, [toast]);

  const advanceStop = useCallback((routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;
    const currentProgress = routeProgress[routeId] || 0;
    if (currentProgress >= route.stops.length) return;
    const newProgress = currentProgress + 1;

    setRouteProgress((prev) => ({ ...prev, [routeId]: newProgress }));

    const updatedStops = route.stops.map((s, i) => (i < newProgress ? { ...s, status: 'visited' as const } : s.status === 'visited' ? s : s));
    setRoutes((prev) => prev.map((r) => {
      if (r.id !== routeId) return r;
      return { ...r, stops: updatedStops, status: newProgress >= route.stops.length ? 'terminee' as const : 'en_cours' as const };
    }));

    if (newProgress >= route.stops.length) {
      toast.success('Tournée terminée', `"${route.name}" est complète !`);
    } else {
      const nextStop = route.stops[newProgress];
      toast.info('Arrêt validé', `Prochain: ${nextStop?.clientName || 'Terminé'}`);
    }
  }, [routes, routeProgress, toast]);

  // ─── Print itinerary ──────────────────────────────────────────
  const printItinerary = useCallback(() => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  }, []);

  // ─── Itinerary time calculation ───────────────────────────────
  const itineraryWithTimes = useMemo(() => {
    const stops = showComparison && optimizedStops ? optimizedStops : selectedRoute.stops;
    // Build cumulative values using reduce to avoid mutation
    const cumulative = stops.reduce<{ dist: number; time: number; items: Array<{ stopNumber: number; arrivalTime: string; departTime: string; runningDist: number; runningTime: number }> }>(
      (acc, stop, i) => {
        const dist = i > 0 ? acc.dist + calculateDistance(stops[i - 1].coordinates, stop.coordinates) : acc.dist;
        const travelTime = i > 0 ? (calculateDistance(stops[i - 1].coordinates, stop.coordinates) / AVG_SPEED_KMH) * 60 : 0;
        const arrivalMinutes = acc.time + travelTime;
        const departMinutes = arrivalMinutes + stop.estimatedDuration;
        const arrivalTime = `${Math.floor(arrivalMinutes / 60).toString().padStart(2, '0')}:${(Math.round(arrivalMinutes) % 60).toString().padStart(2, '0')}`;
        const departTime = `${Math.floor(departMinutes / 60).toString().padStart(2, '0')}:${(Math.round(departMinutes) % 60).toString().padStart(2, '0')}`;
        return {
          dist,
          time: departMinutes,
          items: [...acc.items, { stopNumber: i + 1, arrivalTime, departTime, runningDist: Math.round(dist * 10) / 10, runningTime: Math.round(departMinutes - 8 * 60) }],
        };
      },
      { dist: 0, time: 8 * 60, items: [] }
    );
    return stops.map((stop, i) => ({ ...stop, ...cumulative.items[i] }));
  }, [selectedRoute, showComparison, optimizedStops]);

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className={`space-y-6 ${printing ? 'print-area' : ''}`}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <Route className="w-5 h-5 text-white" />
            </div>
            Optimisation Tournées
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Algorithmes de chemin court — 2-opt & plus proche voisin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={printItinerary} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} className="text-white" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Tournée
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard icon={Truck} label="Tournées actives" value={String(kpis.activeRoutes)} subValue={`${routes.length} au total`} color="#0d9488" delay={0} />
        <KPICard icon={MapPin} label="Km économisés" value={`${kpis.totalSavedKm.toFixed(1)}`} subValue="Aujourd'hui" color="#059669" delay={0.05} />
        <KPICard icon={Clock} label="Temps moyen gagné" value={formatMinutes(kpis.avgTimeSaved)} subValue="Par tournée" color="#0284c7" delay={0.1} />
        <KPICard icon={Target} label="Score optimisation" value={`${kpis.avgScore}/100`} subValue="Moyenne globale" color="#ea580c" delay={0.15} />
        <KPICard icon={Fuel} label="Carburant économisé" value={`${(kpis.totalFuelSaved / 1_000_000).toFixed(1)}M`} subValue="GNF" color="#7c3aed" delay={0.2} />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="planification" className="text-xs">Planification</TabsTrigger>
          <TabsTrigger value="optimisation" className="text-xs">Optimisation</TabsTrigger>
          <TabsTrigger value="actives" className="text-xs">Tournées Actives</TabsTrigger>
          <TabsTrigger value="zones" className="text-xs">Zones</TabsTrigger>
          <TabsTrigger value="analyse" className="text-xs">Analyse</TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: PLANIFICATION ──────────────────────────── */}
        <TabsContent value="planification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Route selector + stops list */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sélectionner une tournée</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Select value={selectedRouteId} onValueChange={(v) => { setSelectedRouteId(v); setShowComparison(false); setOptimizedStops(null); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span className="flex items-center gap-2">
                            <Badge className={STATUS_COLORS[r.status]} variant="outline" style={{ fontSize: '9px', padding: '0 4px' }}>
                              {r.status}
                            </Badge>
                            {r.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Conducteur: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedRoute.driverName}</span></p>
                    <p>Véhicule: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedRoute.vehiclePlate}</span></p>
                    <p>Arrêts: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedRoute.stops.length}</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Arrêts de la tournée
                    <Badge variant="outline">{selectedRoute.stops.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1.5">
                      {selectedRoute.stops.map((stop, idx) => (
                        <div key={stop.id} className="flex items-center gap-2 p-2 rounded-lg border text-xs">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: STOP_TYPE_COLORS[stop.type] }}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{stop.clientName}</p>
                            <p className="text-gray-500">{stop.city} • {stop.timeWindow.start}-{stop.timeWindow.end}</p>
                          </div>
                          <Badge variant="outline" className={PRIORITY_COLORS[stop.priority]} style={{ fontSize: '8px', padding: '0 3px' }}>
                            {stop.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Algorithm selection + optimize button */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Algorithme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs">Méthode</Label>
                    <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as '2opt' | 'nearest')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2opt">2-Opt (Amélioration)</SelectItem>
                        <SelectItem value="nearest">Plus Proche Voisin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={runOptimization} disabled={optimizing} className="w-full text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                    {optimizing ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Optimisation en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Optimiser la tournée
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <Info className="w-3 h-3" />
                    {algorithm === '2opt' ? '2-opt inverse les segments pour réduire la distance totale' : 'Le plus proche voisin choisit l\'arrêt le plus proche à chaque étape'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map + Comparison */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Map className="w-4 h-4 text-teal-600" />
                    Carte de la tournée — {selectedRoute.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteSVGMap
                    stops={showComparison && optimizedStops ? optimizedStops : selectedRoute.stops}
                    routeColor={ROUTE_COLORS[routes.indexOf(selectedRoute) % ROUTE_COLORS.length]}
                  />
                </CardContent>
              </Card>

              {showComparison && (
                <OptimizationComparison
                  originalStops={originalStops!}
                  optimizedStops={optimizedStops!}
                  originalDist={originalDist}
                  optimizedDist={optimizedDist}
                />
              )}

              {showComparison && (
                <div className="flex gap-2">
                  <Button onClick={applyOptimization} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Appliquer l&apos;optimisation
                  </Button>
                  <Button variant="outline" onClick={() => { setShowComparison(false); setOptimizedStops(null); }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}

              {/* Itinerary Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-teal-600" />
                    Itinéraire détaillé
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px] w-10">#</TableHead>
                          <TableHead className="text-[10px]">Client</TableHead>
                          <TableHead className="text-[10px]">Adresse</TableHead>
                          <TableHead className="text-[10px]">Type</TableHead>
                          <TableHead className="text-[10px]">Arrivée</TableHead>
                          <TableHead className="text-[10px]">Durée</TableHead>
                          <TableHead className="text-[10px]">Dist. cumulée</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itineraryWithTimes.map((stop) => (
                          <TableRow key={stop.id}>
                            <TableCell className="text-xs font-bold">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: STOP_TYPE_COLORS[stop.type] }}>
                                {stop.stopNumber}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{stop.clientName}</TableCell>
                            <TableCell className="text-xs text-gray-500">{stop.address}, {stop.city}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[9px]" style={{ color: STOP_TYPE_COLORS[stop.type], borderColor: STOP_TYPE_COLORS[stop.type] }}>
                                {stop.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{stop.arrivalTime}</TableCell>
                            <TableCell className="text-xs">{stop.estimatedDuration}min</TableCell>
                            <TableCell className="text-xs">{stop.runningDist} km</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 2: OPTIMISATION ───────────────────────────── */}
        <TabsContent value="optimisation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Before optimization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-red-500" />
                  Avant optimisation — Ordre original
                </CardTitle>
                <CardDescription>Ordre actuel des arrêts sans optimisation</CardDescription>
              </CardHeader>
              <CardContent>
                <RouteSVGMap stops={selectedRoute.stops} routeColor="#dc2626" animated={false} />
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Distance totale</span>
                    <span className="font-bold text-red-600">{totalDistance(selectedRoute.stops).toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Durée estimée</span>
                    <span className="font-bold text-red-600">{formatMinutes(calcDuration(totalDistance(selectedRoute.stops), selectedRoute.stops))}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Coût carburant</span>
                    <span className="font-bold text-red-600">{format(calcFuelCost(totalDistance(selectedRoute.stops)))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After optimization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Après optimisation — Algorithme {algorithm === '2opt' ? '2-Opt' : 'Plus Proche Voisin'}
                </CardTitle>
                <CardDescription>Itinéraire optimisé pour minimiser la distance</CardDescription>
              </CardHeader>
              <CardContent>
                {optimizedStops ? (
                  <>
                    <RouteSVGMap stops={optimizedStops} routeColor="#059669" animated={true} />
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Distance totale</span>
                        <span className="font-bold text-emerald-600">{optimizedDist.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Durée estimée</span>
                        <span className="font-bold text-emerald-600">{formatMinutes(calcDuration(optimizedDist, optimizedStops))}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Coût carburant</span>
                        <span className="font-bold text-emerald-600">{format(calcFuelCost(optimizedDist))}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xs font-bold">
                        <span>Économie</span>
                        <span className="text-emerald-600">
                          {((originalDist - optimizedDist) / originalDist * 100).toFixed(1)}% — {((originalDist - optimizedDist)).toFixed(1)} km gagnés
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Zap className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Cliquez sur &quot;Optimiser&quot; dans l&apos;onglet Planification</p>
                    <p className="text-xs mt-1">pour voir la comparaison avant/après</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Algorithm explanation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Fonctionnement des algorithmes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10">
                  <h4 className="font-semibold text-sm text-teal-700 dark:text-teal-400 mb-2">Algorithme 2-Opt</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Heuristique d&apos;amélioration pour le TSP (Traveling Salesman Problem). À chaque itération, l&apos;algorithme inverse un segment de la route et vérifie si la distance totale diminue. Le processus se répète jusqu&apos;à ce qu&apos;aucune amélioration ne soit possible. Complexité : O(n²) par itération.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" variant="outline">O(n²)</Badge>
                    <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" variant="outline">Optimal local</Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
                  <h4 className="font-semibold text-sm text-orange-700 dark:text-orange-400 mb-2">Plus Proche Voisin</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Heuristique constructive : part du dépôt, et à chaque étape choisit l&apos;arrêt non visité le plus proche (pondéré par la priorité). Rapide mais ne garantit pas un optimum global. Sert de base de comparaison pour mesurer les gains du 2-opt.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" variant="outline">O(n²)</Badge>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" variant="outline">Glouton</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 3: TOURNÉES ACTIVES ───────────────────────── */}
        <TabsContent value="actives" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {routes.map((route, idx) => {
              const progress = routeProgress[route.id] || 0;
              const progressPct = route.stops.length > 0 ? (progress / route.stops.length) * 100 : 0;
              const remainingStops = route.stops.length - progress;
              const avgTimePerStop = route.totalDuration / route.stops.length;
              const estimatedRemaining = remainingStops * avgTimePerStop;

              return (
                <motion.div key={route.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: ROUTE_COLORS[idx % ROUTE_COLORS.length] }} />
                          {route.name}
                        </CardTitle>
                        <Badge className={STATUS_COLORS[route.status]} variant="outline">
                          {route.status === 'planifiee' ? 'Planifiée' : route.status === 'en_cours' ? 'En cours' : 'Terminée'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          {route.driverName}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Truck className="w-3.5 h-3.5" />
                          {route.vehiclePlate}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {route.totalDistance} km
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatMinutes(route.totalDuration)}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>Arrêts: {progress}/{route.stops.length}</span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                        <Progress value={progressPct} className="h-2" />
                      </div>

                      {route.status === 'en_cours' && remainingStops > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          Temps restant estimé: {formatMinutes(estimatedRemaining)}
                        </div>
                      )}

                      {/* Stop chips */}
                      <div className="flex flex-wrap gap-1">
                        {route.stops.map((stop, si) => (
                          <span
                            key={stop.id}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                              si < progress
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : si === progress
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-300'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {si < progress ? <CheckCircle2 className="w-2.5 h-2.5" /> : si === progress ? <Play className="w-2.5 h-2.5" /> : <CircleDot className="w-2.5 h-2.5" />}
                            {stop.clientName.slice(0, 10)}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {route.status === 'planifiee' && (
                          <Button size="sm" onClick={() => startRoute(route.id)} className="text-white flex-1" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                            <Play className="w-3 h-3 mr-1" />
                            Démarrer
                          </Button>
                        )}
                        {route.status === 'en_cours' && progress < route.stops.length && (
                          <Button size="sm" onClick={() => advanceStop(route.id)} variant="outline" className="flex-1">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Valider arrêt
                          </Button>
                        )}
                        {route.status === 'en_cours' && (
                          <Button size="sm" variant="ghost" onClick={() => advanceStop(route.id)}>
                            <SkipForward className="w-3 h-3 mr-1" />
                            Passer
                          </Button>
                        )}
                        {route.status === 'terminee' && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" variant="outline">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complétée
                          </Badge>
                        )}
                      </div>

                      {/* Savings */}
                      {route.savings.percentage > 0 && (
                        <div className="pt-1 border-t flex justify-between text-[10px]">
                          <span className="text-gray-400">Économie optimisation</span>
                          <span className="font-medium text-emerald-600">
                            -{route.savings.percentage}% ({route.savings.distanceKm} km)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── TAB 4: ZONES ──────────────────────────────────── */}
        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    Carte des zones géofence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GeofenceSVGMap zones={geofenceZones} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Zones configurées</CardTitle>
                  <CardDescription>{geofenceZones.length} zones actives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {geofenceZones.map((zone) => (
                      <div key={zone.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: zone.color + '20' }}>
                          <div className="w-3 h-3 rounded-full" style={{ background: zone.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{zone.name}</p>
                          <p className="text-xs text-gray-500">Rayon: {zone.radius} km • {zone.stopCount} arrêts</p>
                        </div>
                        <Badge variant="outline" style={{ borderColor: zone.color, color: zone.color }}>
                          {zone.stopCount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Statistiques zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total arrêts couverts</span>
                      <span className="font-bold">{geofenceZones.reduce((s, z) => s + z.stopCount, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rayon moyen</span>
                      <span className="font-bold">{Math.round(geofenceZones.reduce((s, z) => s + z.radius, 0) / geofenceZones.length)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Couverture Conakry</span>
                      <span className="font-bold text-emerald-600">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Couverture nationale</span>
                      <span className="font-bold text-amber-600">42%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Distance moy. inter-zone</span>
                      <span className="font-bold">185 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Densité moy. arrêts</span>
                      <span className="font-bold">5.0 / zone</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 5: ANALYSE ────────────────────────────────── */}
        <TabsContent value="analyse" className="space-y-4">
          {/* Analytics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard icon={MapPin} label="Km total économisés" value="178.7" subValue="Ce mois" color="#059669" delay={0} />
            <KPICard icon={Fuel} label="Carburant économisé" value="26.8M" subValue="GNF ce mois" color="#0d9488" delay={0.05} />
            <KPICard icon={Clock} label="Temps total gagné" value="305 min" subValue="Ce mois" color="#0284c7" delay={0.1} />
            <KPICard icon={TrendingUp} label="Tendance" value="+12.4%" subValue="vs mois dernier" color="#ea580c" delay={0.15} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Fuel savings over time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-teal-600" />
                  Économies carburant par semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={FUEL_SAVINGS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => `${(value / 1_000_000).toFixed(2)}M GNF`} />
                    <Legend />
                    <Area type="monotone" dataKey="savings" name="Économies" fill="#0d948833" stroke="#0d9488" strokeWidth={2} />
                    <Area type="monotone" dataKey="baseline" name="Base" fill="#e5e7eb33" stroke="#9ca3af" strokeWidth={1} strokeDasharray="5,5" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distance saved per route */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Km économisés par tournée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={DISTANCE_SAVED_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="route" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} unit=" km" />
                    <Tooltip formatter={(value: number) => `${value} km`} />
                    <Bar dataKey="saved" name="Km gagnés" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score distribution pie chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-violet-600" />
                  Distribution des scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={SCORE_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {SCORE_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stops per route trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-600" />
                  Tendance arrêts & scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={STOPS_TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgStops" name="Arrêts moyens" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7' }} />
                    <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Score moyen" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top performing routes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Top tournées par score d&apos;optimisation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Rang</TableHead>
                      <TableHead className="text-[10px]">Tournée</TableHead>
                      <TableHead className="text-[10px]">Conducteur</TableHead>
                      <TableHead className="text-[10px]">Score</TableHead>
                      <TableHead className="text-[10px]">Km économisés</TableHead>
                      <TableHead className="text-[10px]">Temps gagné</TableHead>
                      <TableHead className="text-[10px]">Carburant</TableHead>
                      <TableHead className="text-[10px]">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...routes]
                      .sort((a, b) => b.optimizationScore - a.optimizationScore)
                      .map((route, idx) => (
                        <TableRow key={route.id}>
                          <TableCell className="text-xs font-bold">
                            <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-[10px] font-bold text-white ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                              {idx + 1}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{route.name}</TableCell>
                          <TableCell className="text-xs text-gray-500">{route.driverName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Progress value={route.optimizationScore} className="h-1.5 w-16" />
                              <span className="text-xs font-bold">{route.optimizationScore}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-emerald-600 font-medium">{route.savings.distanceKm} km</TableCell>
                          <TableCell className="text-xs text-sky-600">{formatMinutes(route.savings.timeMinutes)}</TableCell>
                          <TableCell className="text-xs">{format(route.savings.fuelCost)}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[route.status]} variant="outline" style={{ fontSize: '9px' }}>
                              {route.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Route Dialog */}
      <CreateRouteDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSave={handleCreateRoute} />
    </div>
  );
}
