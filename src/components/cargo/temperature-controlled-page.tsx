'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ThermometerSnowflake,
  AlertTriangle,
  Radio,
  ShieldCheck,
  Container,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MoreHorizontal,
  Snowflake,
  Droplets,
  Activity,
  Zap,
  Wifi,
  WifiOff,
  ChevronRight,
  RefreshCw,
  Download,
  Bell,
  BellOff,
  Thermometer,
  Sun,
  Plus,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useCargoStore } from '@/lib/cargo-store';

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

type TempStatus = 'ok' | 'warning' | 'breach';
type ShipmentStatus = 'en_transit' | 'chargement' | 'livree' | 'en_attente';
type LoggerStatus = 'active' | 'idle' | 'low_battery' | 'offline';
type AlertSeverity = 'critique' | 'majeure' | 'mineure';
type AlertStatus = 'active' | 'acquittée' | 'résolue';
type ContainerRFType = '20RF' | '40RF';
type ContainerRFStatus = 'actif' | 'en_maintenance' | 'en_transit' | 'en_attente';

interface ColdShipment {
  id: string;
  trackingNumber: string;
  commodityType: string;
  tempMin: number;
  tempMax: number;
  currentTemp: number;
  status: ShipmentStatus;
  dataLoggerId: string;
  departure: string;
  arrival: string;
  departureDate: string;
  arrivalDate: string;
}

interface DataLogger {
  id: string;
  model: string;
  batteryLevel: number;
  status: LoggerStatus;
  assignedShipment: string | null;
  lastReading: string;
  lastTemp: number;
  location: string;
  firmware: string;
}

interface TempAlert {
  id: string;
  severity: AlertSeverity;
  shipmentRef: string;
  loggerId: string;
  expectedTempMin: number;
  expectedTempMax: number;
  actualTemp: number;
  deviation: number;
  timestamp: string;
  actionTaken: string;
  status: AlertStatus;
}

interface ContainerRF {
  id: string;
  type: ContainerRFType;
  setTemp: number;
  currentTemp: number;
  humidity: number;
  status: ContainerRFStatus;
  currentVoyage: string;
  nextMaintenance: string;
  tempRange: string;
  humidityRange: string;
}

// --- Cold Chain Shipments ---
const initialColdShipments: ColdShipment[] = [
  { id: 'RF-001', trackingNumber: 'FFP-CD-2026-001', commodityType: 'Produits pharmaceutiques', tempMin: 2, tempMax: 8, currentTemp: 4.2, status: 'en_transit', dataLoggerId: 'DL-1001', departure: 'Alger', arrival: 'Marseille', departureDate: '2026-03-03', arrivalDate: '2026-03-06' },
  { id: 'RF-002', trackingNumber: 'FFP-CD-2026-002', commodityType: 'Vaccins', tempMin: -25, tempMax: -15, currentTemp: -18.5, status: 'en_transit', dataLoggerId: 'DL-1002', departure: 'Dubaï', arrival: 'Alger', departureDate: '2026-03-02', arrivalDate: '2026-03-05' },
  { id: 'RF-003', trackingNumber: 'FFP-CD-2026-003', commodityType: 'Produits laitiers', tempMin: 0, tempMax: 4, currentTemp: 5.8, status: 'en_transit', dataLoggerId: 'DL-1003', departure: 'Oran', arrival: 'Casablanca', departureDate: '2026-03-04', arrivalDate: '2026-03-07' },
  { id: 'RF-004', trackingNumber: 'FFP-CD-2026-004', commodityType: 'Fruits & Légumes', tempMin: 2, tempMax: 8, currentTemp: 3.1, status: 'chargement', dataLoggerId: 'DL-1004', departure: 'Béjaïa', arrival: 'Paris CDG', departureDate: '2026-03-05', arrivalDate: '2026-03-08' },
  { id: 'RF-005', trackingNumber: 'FFP-CD-2026-005', commodityType: 'Viande congelée', tempMin: -22, tempMax: -18, currentTemp: -12.3, status: 'en_transit', dataLoggerId: 'DL-1005', departure: 'Tunis', arrival: 'Alger', departureDate: '2026-03-01', arrivalDate: '2026-03-04' },
  { id: 'RF-006', trackingNumber: 'FFP-CD-2026-006', commodityType: 'Poisson frais', tempMin: -2, tempMax: 2, currentTemp: 0.5, status: 'en_transit', dataLoggerId: 'DL-1006', departure: 'Annaba', arrival: 'Barcelone', departureDate: '2026-03-04', arrivalDate: '2026-03-06' },
  { id: 'RF-007', trackingNumber: 'FFP-CD-2026-007', commodityType: 'Produits pharmaceutiques', tempMin: 15, tempMax: 25, currentTemp: 21.0, status: 'livree', dataLoggerId: 'DL-1007', departure: 'Istanbul', arrival: 'Alger', departureDate: '2026-02-28', arrivalDate: '2026-03-03' },
  { id: 'RF-008', trackingNumber: 'FFP-CD-2026-008', commodityType: 'Cosmétiques', tempMin: 10, tempMax: 25, currentTemp: 13.7, status: 'en_attente', dataLoggerId: 'DL-1008', departure: 'Milan', arrival: 'Alger', departureDate: '2026-03-06', arrivalDate: '2026-03-09' },
  { id: 'RF-009', trackingNumber: 'FFP-CD-2026-009', commodityType: 'Biotechnologie', tempMin: -80, tempMax: -60, currentTemp: -70.2, status: 'en_transit', dataLoggerId: 'DL-1009', departure: 'Francfort', arrival: 'Alger', departureDate: '2026-03-03', arrivalDate: '2026-03-05' },
  { id: 'RF-010', trackingNumber: 'FFP-CD-2026-010', commodityType: 'Chocolat & Confiserie', tempMin: 12, tempMax: 18, currentTemp: 16.5, status: 'en_transit', dataLoggerId: 'DL-1010', departure: 'Bruxelles', arrival: 'Oran', departureDate: '2026-03-02', arrivalDate: '2026-03-06' },
];

// --- Data Loggers ---
const dataLoggers: DataLogger[] = [
  { id: 'DL-1001', model: 'TempTale Ultra', batteryLevel: 92, status: 'active', assignedShipment: 'FFP-CD-2026-001', lastReading: '2026-03-04 14:32', lastTemp: 4.2, location: 'Méditerranée - En mer', firmware: 'v3.2.1' },
  { id: 'DL-1002', model: 'Libero Ti1', batteryLevel: 78, status: 'active', assignedShipment: 'FFP-CD-2026-002', lastReading: '2026-03-04 14:28', lastTemp: -18.5, location: 'Aéroport Dubaï DXB', firmware: 'v2.8.4' },
  { id: 'DL-1003', model: 'TempTale Ultra', batteryLevel: 45, status: 'low_battery', assignedShipment: 'FFP-CD-2026-003', lastReading: '2026-03-04 14:15', lastTemp: 5.8, location: 'Route Oran-Casablanca', firmware: 'v3.2.1' },
  { id: 'DL-1004', model: 'Libero Ti1', batteryLevel: 88, status: 'active', assignedShipment: 'FFP-CD-2026-004', lastReading: '2026-03-04 14:30', lastTemp: 3.1, location: 'Entrepôt Béjaïa', firmware: 'v2.8.4' },
  { id: 'DL-1005', model: 'TempTale Geo', batteryLevel: 15, status: 'low_battery', assignedShipment: 'FFP-CD-2026-005', lastReading: '2026-03-04 13:45', lastTemp: -12.3, location: 'Port de Tunis', firmware: 'v3.1.0' },
  { id: 'DL-1006', model: 'TempTale Ultra', batteryLevel: 67, status: 'active', assignedShipment: 'FFP-CD-2026-006', lastReading: '2026-03-04 14:20', lastTemp: 0.5, location: 'Méditerranée - En mer', firmware: 'v3.2.1' },
  { id: 'DL-1007', model: 'Libero Ti1', batteryLevel: 5, status: 'idle', assignedShipment: null, lastReading: '2026-03-03 18:00', lastTemp: 21.0, location: 'Entrepôt Alger - Zone Froid', firmware: 'v2.8.4' },
  { id: 'DL-1008', model: 'TempTale Geo', batteryLevel: 95, status: 'idle', assignedShipment: null, lastReading: '2026-03-04 12:00', lastTemp: 13.7, location: 'Entrepôt Milan', firmware: 'v3.1.0' },
  { id: 'DL-1009', model: 'Libero CX', batteryLevel: 82, status: 'active', assignedShipment: 'FFP-CD-2026-009', lastReading: '2026-03-04 14:25', lastTemp: -70.2, location: 'Aéroport Francfort FRA', firmware: 'v4.0.2' },
  { id: 'DL-1010', model: 'TempTale Ultra', batteryLevel: 54, status: 'active', assignedShipment: 'FFP-CD-2026-010', lastReading: '2026-03-04 14:18', lastTemp: 16.5, location: 'Port d\'Anvers', firmware: 'v3.2.1' },
  { id: 'DL-1011', model: 'Libero CX', batteryLevel: 0, status: 'offline', assignedShipment: null, lastReading: '2026-02-20 09:00', lastTemp: 0, location: 'Stock - Non déployé', firmware: 'v4.0.1' },
  { id: 'DL-1012', model: 'TempTale Geo', batteryLevel: 100, status: 'idle', assignedShipment: null, lastReading: '2026-03-04 08:00', lastTemp: 22.0, location: 'Stock - Réserve', firmware: 'v3.1.0' },
];

// --- Temperature Alerts ---
const tempAlerts: TempAlert[] = [
  { id: 'ALT-001', severity: 'critique', shipmentRef: 'FFP-CD-2026-005', loggerId: 'DL-1005', expectedTempMin: -22, expectedTempMax: -18, actualTemp: -12.3, deviation: 5.7, timestamp: '2026-03-04 13:45', actionTaken: 'Aucune action', status: 'active' },
  { id: 'ALT-002', severity: 'majeure', shipmentRef: 'FFP-CD-2026-003', loggerId: 'DL-1003', expectedTempMin: 0, expectedTempMax: 4, actualTemp: 5.8, deviation: 1.8, timestamp: '2026-03-04 14:15', actionTaken: 'Aucune action', status: 'active' },
  { id: 'ALT-003', severity: 'mineure', shipmentRef: 'FFP-CD-2026-006', loggerId: 'DL-1006', expectedTempMin: -2, expectedTempMax: 2, actualTemp: 2.8, deviation: 0.8, timestamp: '2026-03-04 12:30', actionTaken: 'Vérification en cours', status: 'acquittée' },
  { id: 'ALT-004', severity: 'critique', shipmentRef: 'FFP-CD-2026-002', loggerId: 'DL-1002', expectedTempMin: -25, expectedTempMax: -15, actualTemp: -10.0, deviation: 5.0, timestamp: '2026-03-03 22:15', actionTaken: 'Réfrigération d\'urgence activée', status: 'résolue' },
  { id: 'ALT-005', severity: 'majeure', shipmentRef: 'FFP-CD-2026-001', loggerId: 'DL-1001', expectedTempMin: 2, expectedTempMax: 8, actualTemp: 9.2, deviation: 1.2, timestamp: '2026-03-03 08:00', actionTaken: 'Unité de refroidissement remplacée', status: 'résolue' },
  { id: 'ALT-006', severity: 'mineure', shipmentRef: 'FFP-CD-2026-010', loggerId: 'DL-1010', expectedTempMin: 12, expectedTempMax: 18, actualTemp: 19.1, deviation: 1.1, timestamp: '2026-03-04 10:20', actionTaken: 'Ajustement thermostat', status: 'résolue' },
  { id: 'ALT-007', severity: 'critique', shipmentRef: 'FFP-CD-2026-005', loggerId: 'DL-1005', expectedTempMin: -22, expectedTempMax: -18, actualTemp: -14.0, deviation: 4.0, timestamp: '2026-03-04 10:00', actionTaken: 'Transfert conteneur de secours', status: 'acquittée' },
  { id: 'ALT-008', severity: 'majeure', shipmentRef: 'FFP-CD-2026-003', loggerId: 'DL-1003', expectedTempMin: 0, expectedTempMax: 4, actualTemp: 6.5, deviation: 2.5, timestamp: '2026-03-03 16:45', actionTaken: 'Inspection technique', status: 'résolue' },
];

// --- Refrigerated Containers ---
const containersRF: ContainerRF[] = [
  { id: 'CRF-001', type: '40RF', setTemp: -18, currentTemp: -17.8, humidity: 65, status: 'actif', currentVoyage: 'FFP-CD-2026-005', nextMaintenance: '2026-04-15', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-002', type: '20RF', setTemp: 4, currentTemp: 4.2, humidity: 58, status: 'en_transit', currentVoyage: 'FFP-CD-2026-001', nextMaintenance: '2026-05-01', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-003', type: '40RF', setTemp: 2, currentTemp: 5.8, humidity: 72, status: 'en_transit', currentVoyage: 'FFP-CD-2026-003', nextMaintenance: '2026-03-20', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-004', type: '20RF', setTemp: -20, currentTemp: -18.5, humidity: 60, status: 'actif', currentVoyage: 'FFP-CD-2026-002', nextMaintenance: '2026-06-10', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-005', type: '40RF', setTemp: 0, currentTemp: 0.5, humidity: 70, status: 'en_transit', currentVoyage: 'FFP-CD-2026-006', nextMaintenance: '2026-04-22', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-006', type: '20RF', setTemp: 15, currentTemp: 16.5, humidity: 55, status: 'actif', currentVoyage: 'FFP-CD-2026-010', nextMaintenance: '2026-05-15', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-007', type: '40RF', setTemp: -70, currentTemp: -70.2, humidity: 40, status: 'en_transit', currentVoyage: 'FFP-CD-2026-009', nextMaintenance: '2026-04-01', tempRange: '-80°C à +25°C', humidityRange: '30%-60%' },
  { id: 'CRF-008', type: '20RF', setTemp: 3, currentTemp: 3.1, humidity: 62, status: 'en_attente', currentVoyage: 'FFP-CD-2026-004', nextMaintenance: '2026-07-01', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-009', type: '40RF', setTemp: 20, currentTemp: 21.0, humidity: 50, status: 'en_maintenance', currentVoyage: null, nextMaintenance: '2026-03-08', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
  { id: 'CRF-010', type: '20RF', setTemp: -18, currentTemp: -17.5, humidity: 63, status: 'en_attente', currentVoyage: null, nextMaintenance: '2026-05-20', tempRange: '-25°C à +25°C', humidityRange: '50%-85%' },
];

// --- Simulated Temperature History (mini sparkline data) ---
function generateTempHistory(current: number, min: number, max: number, points: number = 24): number[] {
  const data: number[] = [];
  const range = max - min;
  const mid = (min + max) / 2;
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * range * 0.3;
    const trend = Math.sin(i / points * Math.PI * 2) * range * 0.15;
    data.push(+(current + noise + trend).toFixed(1));
  }
  return data;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function getTempStatus(current: number, min: number, max: number): TempStatus {
  const margin = (max - min) * 0.15;
  if (current < min - margin || current > max + margin) return 'breach';
  if (current < min || current > max) return 'warning';
  return 'ok';
}

function getTempStatusColor(status: TempStatus): string {
  switch (status) {
    case 'ok': return 'text-emerald-600 dark:text-emerald-400';
    case 'warning': return 'text-amber-600 dark:text-amber-400';
    case 'breach': return 'text-red-600 dark:text-red-400';
  }
}

function getTempBgColor(status: TempStatus): string {
  switch (status) {
    case 'ok': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    case 'breach': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }
}

function getTempBadgeColor(status: TempStatus): string {
  switch (status) {
    case 'ok': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'breach': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
}

const shipmentStatusLabel: Record<ShipmentStatus, string> = {
  en_transit: 'En transit',
  chargement: 'Chargement',
  livree: 'Livrée',
  en_attente: 'En attente',
};

const shipmentStatusColors: Record<ShipmentStatus, string> = {
  en_transit: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  chargement: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  livree: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_attente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const loggerStatusLabel: Record<LoggerStatus, string> = {
  active: 'Actif',
  idle: 'Inactif',
  low_battery: 'Batterie faible',
  offline: 'Hors ligne',
};

const loggerStatusColors: Record<LoggerStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  idle: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  low_battery: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  offline: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const severityColors: Record<AlertSeverity, string> = {
  critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  majeure: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  mineure: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const alertStatusColors: Record<AlertStatus, string> = {
  active: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'acquittée': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'résolue': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const containerRFStatusLabel: Record<ContainerRFStatus, string> = {
  actif: 'Actif',
  en_maintenance: 'En maintenance',
  en_transit: 'En transit',
  en_attente: 'En attente',
};

const containerRFStatusColors: Record<ContainerRFStatus, string> = {
  actif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  en_transit: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  en_attente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// Mini sparkline component using SVG
function SparkLine({ data, color, width = 80, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * w;
    const y = padding + h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Temperature trend visualization for containers
function TempHumidityChart({ tempData, humidityData, tempRange, humidityRange }: {
  tempData: number[];
  humidityData: number[];
  tempRange: [number, number];
  humidityRange: [number, number];
}) {
  const width = 280;
  const height = 120;
  const padding = { top: 15, right: 10, bottom: 20, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allTemps = [...tempData, ...tempRange];
  const tempMin = Math.min(...allTemps) - 5;
  const tempMax = Math.max(...allTemps) + 5;
  const tempRangeVal = tempMax - tempMin || 1;

  const humMin = 0;
  const humMax = 100;

  const tempPoints = tempData.map((v, i) => {
    const x = padding.left + (i / (tempData.length - 1)) * chartW;
    const y = padding.top + chartH - ((v - tempMin) / tempRangeVal) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const humPoints = humidityData.map((v, i) => {
    const x = padding.left + (i / (humidityData.length - 1)) * chartW;
    const y = padding.top + chartH - ((v - humMin) / (humMax - humMin)) * chartH;
    return `${x},${y}`;
  }).join(' ');

  // Temp range band
  const bandTop = padding.top + chartH - ((tempRange[1] - tempMin) / tempRangeVal) * chartH;
  const bandBottom = padding.top + chartH - ((tempRange[0] - tempMin) / tempRangeVal) * chartH;

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Background */}
      <rect x={padding.left} y={padding.top} width={chartW} height={chartH} fill="var(--muted)" opacity={0.2} rx={2} />

      {/* Temperature acceptable range band */}
      <rect x={padding.left} y={bandTop} width={chartW} height={bandBottom - bandTop} fill="#10b981" opacity={0.1} />
      <line x1={padding.left} y1={bandTop} x2={padding.left + chartW} y2={bandTop} stroke="#10b981" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />
      <line x1={padding.left} y1={bandBottom} x2={padding.left + chartW} y2={bandBottom} stroke="#10b981" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.5} />

      {/* Humidity line */}
      <polyline points={humPoints} fill="none" stroke="#3b82f6" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />

      {/* Temperature line */}
      <polyline points={tempPoints} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Labels */}
      <text x={padding.left - 5} y={padding.top + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={8}>{tempMax}°</text>
      <text x={padding.left - 5} y={height - padding.bottom + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={8}>{tempMin}°</text>

      {/* Legend */}
      <circle cx={padding.left + 5} cy={height - 5} r={3} fill="#ef4444" />
      <text x={padding.left + 12} y={height - 2} fill="var(--muted-foreground)" fontSize={7}>Temp</text>
      <circle cx={padding.left + 50} cy={height - 5} r={3} fill="#3b82f6" />
      <text x={padding.left + 57} y={height - 2} fill="var(--muted-foreground)" fontSize={7}>Humidité</text>
      <rect x={padding.left + 100} y={height - 8} width={8} height={6} fill="#10b981" opacity={0.3} />
      <text x={padding.left + 112} y={height - 2} fill="var(--muted-foreground)" fontSize={7}>Plage OK</text>
    </svg>
  );
}

// Battery icon component
function BatteryIcon({ level }: { level: number }) {
  if (level <= 10) return <BatteryLow className="w-4 h-4 text-red-500" />;
  if (level <= 30) return <BatteryLow className="w-4 h-4 text-amber-500" />;
  if (level <= 60) return <BatteryMedium className="w-4 h-4 text-amber-500" />;
  if (level <= 90) return <Battery className="w-4 h-4 text-teal-500" />;
  return <BatteryFull className="w-4 h-4 text-emerald-500" />;
}

function getBatteryColor(level: number): string {
  if (level <= 10) return 'bg-red-500';
  if (level <= 30) return 'bg-amber-500';
  if (level <= 60) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function TemperatureControlledPage() {
  const { currentPage } = useCargoStore();

  // Filters - Shipments
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<string>('all');
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [tempRangeFilter, setTempRangeFilter] = useState<string>('all');
  const [shipmentSearch, setShipmentSearch] = useState('');

  // Filters - Alerts
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('all');

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLogger, setSelectedLogger] = useState<DataLogger | null>(null);
  const [selectedShipmentForAssign, setSelectedShipmentForAssign] = useState<string>('');

  // Container detail dialog
  const [containerDetailOpen, setContainerDetailOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerRF | null>(null);

  // New shipment dialog
  const [createShipmentOpen, setCreateShipmentOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({
    client: '',
    origin: '',
    destination: '',
    commodityType: '',
    tempMin: '',
    tempMax: '',
    weight: '',
  });

  // Cold shipments state
  const [coldShipments, setColdShipments] = useState<ColdShipment[]>(initialColdShipments);

  // Alert action state (local mock)
  const [localAlerts, setLocalAlerts] = useState<TempAlert[]>(tempAlerts);

  // --- Filtered shipments ---
  const commodityTypes = useMemo(() => [...new Set(coldShipments.map(s => s.commodityType))], [coldShipments]);
  const filteredShipments = useMemo(() => {
    return coldShipments.filter(s => {
      const matchSearch = shipmentSearch === '' ||
        s.trackingNumber.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
        s.commodityType.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
        s.departure.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
        s.arrival.toLowerCase().includes(shipmentSearch.toLowerCase());
      const matchStatus = shipmentStatusFilter === 'all' || s.status === shipmentStatusFilter;
      const matchCommodity = commodityFilter === 'all' || s.commodityType === commodityFilter;

      let matchTemp = true;
      const tempStatus = getTempStatus(s.currentTemp, s.tempMin, s.tempMax);
      if (tempRangeFilter === 'ok') matchTemp = tempStatus === 'ok';
      else if (tempRangeFilter === 'warning') matchTemp = tempStatus === 'warning';
      else if (tempRangeFilter === 'breach') matchTemp = tempStatus === 'breach';

      return matchSearch && matchStatus && matchCommodity && matchTemp;
    });
  }, [shipmentSearch, shipmentStatusFilter, commodityFilter, tempRangeFilter, coldShipments]);

  // --- Filtered alerts ---
  const filteredAlerts = useMemo(() => {
    return localAlerts.filter(a => {
      const matchSeverity = alertSeverityFilter === 'all' || a.severity === alertSeverityFilter;
      const matchStatus = alertStatusFilter === 'all' || a.status === alertStatusFilter;
      return matchSeverity && matchStatus;
    });
  }, [localAlerts, alertSeverityFilter, alertStatusFilter]);

  // --- KPIs ---
  const activeShipments = coldShipments.filter(s => s.status === 'en_transit' || s.status === 'chargement').length;
  const activeAlerts = localAlerts.filter(a => a.status === 'active').length;
  const deployedLoggers = dataLoggers.filter(l => l.status === 'active').length;
  const totalMonitored = coldShipments.length;
  const complianceCount = coldShipments.filter(s => getTempStatus(s.currentTemp, s.tempMin, s.tempMax) === 'ok').length;
  const complianceRate = totalMonitored > 0 ? ((complianceCount / totalMonitored) * 100).toFixed(1) : '0';

  // --- Alert actions ---
  const acknowledgeAlert = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acquittée' as AlertStatus, actionTaken: 'Alerte acquittée par l\'opérateur' } : a));
  };
  const resolveAlert = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'résolue' as AlertStatus, actionTaken: 'Problème résolu — température stabilisée' } : a));
  };

  const handleExportCSV = () => {
    const headers = ['N° Suivi', 'Type Marchandise', 'Temp Min (°C)', 'Temp Max (°C)', 'Temp Actuelle (°C)', 'Statut', 'Data Logger', 'Départ', 'Arrivée', 'Date Départ', 'Date Arrivée'];
    const rows = filteredShipments.map(s => [
      s.trackingNumber,
      s.commodityType,
      String(s.tempMin),
      String(s.tempMax),
      String(s.currentTemp),
      shipmentStatusLabel[s.status] || s.status,
      s.dataLoggerId,
      s.departure,
      s.arrival,
      s.departureDate,
      s.arrivalDate,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guinee-logistique-temperature-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateShipment = () => {
    if (!newShipment.origin || !newShipment.destination || !newShipment.commodityType || !newShipment.tempMin || !newShipment.tempMax || !newShipment.weight) return;
    const newId = `RF-${String(coldShipments.length + 1).padStart(3, '0')}`;
    const newTrackingNumber = `FFP-CD-2026-${String(coldShipments.length + 1).padStart(3, '0')}`;
    const tempMin = parseFloat(newShipment.tempMin);
    const tempMax = parseFloat(newShipment.tempMax);
    const midTemp = +((tempMin + tempMax) / 2).toFixed(1);
    const newEntry: ColdShipment = {
      id: newId,
      trackingNumber: newTrackingNumber,
      commodityType: newShipment.commodityType,
      tempMin,
      tempMax,
      currentTemp: midTemp,
      status: 'en_attente',
      dataLoggerId: '—',
      departure: newShipment.origin,
      arrival: newShipment.destination,
      departureDate: new Date().toISOString().slice(0, 10),
      arrivalDate: '—',
    };
    setColdShipments((prev) => [...prev, newEntry]);
    setCreateShipmentOpen(false);
    setNewShipment({ client: '', origin: '', destination: '', commodityType: '', tempMin: '', tempMax: '', weight: '' });
  };

  // Container chart data
  const getContainerTempHistory = (container: ContainerRF) => generateTempHistory(container.currentTemp, container.setTemp - 5, container.setTemp + 5, 24);
  const getContainerHumidityHistory = (container: ContainerRF) => {
    const base = container.humidity;
    return Array.from({ length: 24 }, () => +(base + (Math.random() - 0.5) * 10).toFixed(0));
  };

  // ═══════════════════════════════════════════════════════════════
  // KPI CARDS
  // ═══════════════════════════════════════════════════════════════
  const kpis = [
    {
      title: 'Expéditions chaîne du froid',
      value: activeShipments,
      subtitle: `sur ${totalMonitored} total`,
      icon: ThermometerSnowflake,
      color: 'from-cyan-500 to-teal-600',
      trend: '+2',
      trendUp: true,
    },
    {
      title: 'Alertes température actives',
      value: activeAlerts,
      subtitle: localAlerts.filter(a => a.severity === 'critique' && a.status === 'active').length > 0
        ? `${localAlerts.filter(a => a.severity === 'critique' && a.status === 'active').length} critique(s)`
        : 'Aucune critique',
      icon: AlertTriangle,
      color: activeAlerts > 0 ? 'from-red-500 to-orange-600' : 'from-emerald-500 to-green-600',
      trend: activeAlerts > 0 ? `+${activeAlerts}` : '0',
      trendUp: activeAlerts === 0,
    },
    {
      title: 'Data loggers déployés',
      value: deployedLoggers,
      subtitle: `sur ${dataLoggers.length} appareils`,
      icon: Radio,
      color: 'from-teal-500 to-emerald-600',
      trend: '',
      trendUp: true,
    },
    {
      title: 'Taux de conformité',
      value: `${complianceRate}%`,
      subtitle: complianceCount === totalMonitored ? 'Parfait' : `${totalMonitored - complianceCount} écart(s)`,
      icon: ShieldCheck,
      color: Number(complianceRate) >= 90 ? 'from-emerald-500 to-green-600' : Number(complianceRate) >= 70 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-orange-600',
      trend: Number(complianceRate) >= 90 ? '+3%' : '-2%',
      trendUp: Number(complianceRate) >= 90,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ThermometerSnowflake className="w-6 h-6 text-cyan-500" />
            Chaîne du Froid
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion du transport sous température contrôlée — conteneurs RF, data loggers & conformité</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button size="sm" className="text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0d9488)' }} onClick={() => setCreateShipmentOpen(true)}>
            <ThermometerSnowflake className="w-4 h-4 mr-1" />
            Nouvelle expédition RF
          </Button>
        </div>
      </div>

      {/* New Shipment Dialog */}
      <Dialog open={createShipmentOpen} onOpenChange={setCreateShipmentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-500" />
              Nouvelle expédition RF
            </DialogTitle>
            <DialogDescription>
              Créez une nouvelle expédition sous température contrôlée
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rf-client">Client</Label>
              <Input
                id="rf-client"
                placeholder="Nom du client"
                value={newShipment.client}
                onChange={(e) => setNewShipment({ ...newShipment, client: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rf-origin">Origine</Label>
                <Input
                  id="rf-origin"
                  placeholder="Ville de départ"
                  value={newShipment.origin}
                  onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rf-destination">Destination</Label>
                <Input
                  id="rf-destination"
                  placeholder="Ville d'arrivée"
                  value={newShipment.destination}
                  onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rf-commodity">Type de marchandise</Label>
              <Select
                value={newShipment.commodityType}
                onValueChange={(v) => setNewShipment({ ...newShipment, commodityType: v })}
              >
                <SelectTrigger id="rf-commodity">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Produits pharmaceutiques">Produits pharmaceutiques</SelectItem>
                  <SelectItem value="Vaccins">Vaccins</SelectItem>
                  <SelectItem value="Produits laitiers">Produits laitiers</SelectItem>
                  <SelectItem value="Fruits & Légumes">Fruits & Légumes</SelectItem>
                  <SelectItem value="Viande congelée">Viande congelée</SelectItem>
                  <SelectItem value="Poisson frais">Poisson frais</SelectItem>
                  <SelectItem value="Cosmétiques">Cosmétiques</SelectItem>
                  <SelectItem value="Biotechnologie">Biotechnologie</SelectItem>
                  <SelectItem value="Chocolat & Confiserie">Chocolat & Confiserie</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rf-tempmin">Température min (°C)</Label>
                <Input
                  id="rf-tempmin"
                  type="number"
                  placeholder="ex: 2"
                  value={newShipment.tempMin}
                  onChange={(e) => setNewShipment({ ...newShipment, tempMin: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rf-tempmax">Température max (°C)</Label>
                <Input
                  id="rf-tempmax"
                  type="number"
                  placeholder="ex: 8"
                  value={newShipment.tempMax}
                  onChange={(e) => setNewShipment({ ...newShipment, tempMax: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rf-weight">Poids (kg)</Label>
              <Input
                id="rf-weight"
                type="number"
                placeholder="ex: 500"
                value={newShipment.weight}
                onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateShipmentOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateShipment}
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0d9488)' }}
              className="text-white"
            >
              Créer l&apos;expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 truncate">{kpi.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{kpi.subtitle}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm gap-1.5">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
            <span className="sm:hidden">TDB</span>
          </TabsTrigger>
          <TabsTrigger value="expeditions" className="text-xs sm:text-sm gap-1.5">
            <Thermometer className="w-4 h-4" />
            <span className="hidden sm:inline">Expéditions Réfrigérées</span>
            <span className="sm:hidden">Expé.</span>
          </TabsTrigger>
          <TabsTrigger value="loggers" className="text-xs sm:text-sm gap-1.5">
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Data Loggers</span>
            <span className="sm:hidden">Loggers</span>
          </TabsTrigger>
          <TabsTrigger value="alertes" className="text-xs sm:text-sm gap-1.5 relative">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alertes</span>
            <span className="sm:hidden">Alertes</span>
            {activeAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                {activeAlerts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="conteneurs" className="text-xs sm:text-sm gap-1.5">
            <Container className="w-4 h-4" />
            <span className="hidden sm:inline">Conteneurs RF</span>
            <span className="sm:hidden">Cont. RF</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: TABLEAU DE BORD
        ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Compliance Overview */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-500" />
                  Conformité température — Vue d&apos;ensemble
                </CardTitle>
                <CardDescription>État actuel de toutes les expéditions sous température contrôlée</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {coldShipments.map((shipment) => {
                    const status = getTempStatus(shipment.currentTemp, shipment.tempMin, shipment.tempMax);
                    const tempHistory = generateTempHistory(shipment.currentTemp, shipment.tempMin, shipment.tempMax);
                    const sparkColor = status === 'ok' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={shipment.id} className={`p-3 rounded-lg border ${getTempBgColor(status)}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{shipment.trackingNumber}</span>
                              <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${getTempBadgeColor(status)}`}>
                                {status === 'ok' ? 'CONFORME' : status === 'warning' ? 'ATTENTION' : 'NON CONFORME'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{shipment.commodityType}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {shipment.departure} → {shipment.arrival}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThermometerSnowflake className="w-3 h-3" />
                                Requis: {shipment.tempMin}°C à {shipment.tempMax}°C
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-2xl font-bold ${getTempStatusColor(status)}`}>
                              {shipment.currentTemp}°C
                            </p>
                            <div className="mt-1">
                              <SparkLine data={tempHistory} color={sparkColor} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Active Alerts Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Alertes actives
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {activeAlerts}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {localAlerts.filter(a => a.status === 'active').length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aucune alerte active</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Toutes les températures sont conformes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {localAlerts.filter(a => a.status === 'active').map((alert) => (
                        <div key={alert.id} className={`p-2.5 rounded-lg border ${alert.severity === 'critique' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : alert.severity === 'majeure' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 ${severityColors[alert.severity]}`}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] font-mono text-gray-500">{alert.shipmentRef}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            Écart de {alert.deviation}°C — {alert.actualTemp}°C (attendu: {alert.expectedTempMin}°C à {alert.expectedTempMax}°C)
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-[9px] text-gray-400">{alert.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Logger Status Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Radio className="w-5 h-5 text-teal-500" />
                    Data Loggers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                      <p className="text-lg font-bold text-emerald-600">{dataLoggers.filter(l => l.status === 'active').length}</p>
                      <p className="text-[9px] text-gray-500">Actifs</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                      <p className="text-lg font-bold text-amber-600">{dataLoggers.filter(l => l.status === 'low_battery').length}</p>
                      <p className="text-[9px] text-gray-500">Batterie faible</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                      <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{dataLoggers.filter(l => l.status === 'idle').length}</p>
                      <p className="text-[9px] text-gray-500">Inactifs</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                      <p className="text-lg font-bold text-red-600">{dataLoggers.filter(l => l.status === 'offline').length}</p>
                      <p className="text-[9px] text-gray-500">Hors ligne</p>
                    </div>
                  </div>
                  {/* Low battery warnings */}
                  {dataLoggers.filter(l => l.batteryLevel <= 30 && l.status !== 'offline').length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Batterie faible</p>
                      {dataLoggers.filter(l => l.batteryLevel <= 30 && l.status !== 'offline').map(logger => (
                        <div key={logger.id} className="flex items-center justify-between p-1.5 rounded bg-amber-50 dark:bg-amber-900/10 text-xs">
                          <div className="flex items-center gap-2">
                            <BatteryIcon level={logger.batteryLevel} />
                            <span className="font-mono font-medium">{logger.id}</span>
                          </div>
                          <span className="text-amber-600 font-semibold">{logger.batteryLevel}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: EXPÉDITIONS RÉFRIGÉRÉES
        ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="expeditions">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher n° tracking, marchandise, origine..."
                    value={shipmentSearch}
                    onChange={(e) => setShipmentSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={shipmentStatusFilter} onValueChange={setShipmentStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-9">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="en_transit">En transit</SelectItem>
                    <SelectItem value="chargement">Chargement</SelectItem>
                    <SelectItem value="livree">Livrée</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                  <SelectTrigger className="w-full sm:w-52 h-9">
                    <SelectValue placeholder="Type marchandise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    {commodityTypes.map(ct => (
                      <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tempRangeFilter} onValueChange={setTempRangeFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-9">
                    <SelectValue placeholder="Conformité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="ok">Conforme</SelectItem>
                    <SelectItem value="warning">Attention</SelectItem>
                    <SelectItem value="breach">Non conforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Shipments Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Tracking</TableHead>
                      <TableHead className="text-xs">Marchandise</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Plage requise</TableHead>
                      <TableHead className="text-xs">T° actuelle</TableHead>
                      <TableHead className="text-xs">Conformité</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Historique</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Logger</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Route</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => {
                      const tempStatus = getTempStatus(shipment.currentTemp, shipment.tempMin, shipment.tempMax);
                      const tempHistory = generateTempHistory(shipment.currentTemp, shipment.tempMin, shipment.tempMax);
                      const sparkColor = tempStatus === 'ok' ? '#10b981' : tempStatus === 'warning' ? '#f59e0b' : '#ef4444';
                      return (
                        <TableRow key={shipment.id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10">
                          <TableCell className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            {shipment.trackingNumber}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>
                              <p className="font-medium">{shipment.commodityType}</p>
                              <p className="text-[10px] text-gray-400">{shipment.departureDate} → {shipment.arrivalDate}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              {shipment.tempMin}°C / {shipment.tempMax}°C
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-bold ${getTempStatusColor(tempStatus)}`}>
                              {shipment.currentTemp}°C
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] px-2 py-0.5 ${getTempBadgeColor(tempStatus)}`}>
                              {tempStatus === 'ok' ? 'CONFORME' : tempStatus === 'warning' ? 'ATTENTION' : 'NON CONFORME'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <SparkLine data={tempHistory} color={sparkColor} width={70} height={24} />
                          </TableCell>
                          <TableCell className="font-mono text-[11px] hidden lg:table-cell">
                            {shipment.dataLoggerId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] px-2 py-0.5 ${shipmentStatusColors[shipment.status]}`}>
                              {shipmentStatusLabel[shipment.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{shipment.departure}</span>
                              <ChevronRight className="w-3 h-3 text-gray-300" />
                              <span>{shipment.arrival}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">{filteredShipments.length} expédition(s) trouvée(s)</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-gray-400">Conforme</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-gray-400">Attention</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-gray-400">Non conforme</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: DATA LOGGERS
        ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="loggers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataLoggers.map((logger) => (
              <motion.div
                key={logger.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{logger.id}</span>
                          <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${loggerStatusColors[logger.status]}`}>
                            {loggerStatusLabel[logger.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{logger.model}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {logger.status === 'active' ? (
                          <Wifi className="w-4 h-4 text-emerald-500" />
                        ) : logger.status === 'offline' ? (
                          <WifiOff className="w-4 h-4 text-red-400" />
                        ) : (
                          <Wifi className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Battery */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <BatteryIcon level={logger.batteryLevel} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Batterie</span>
                        </div>
                        <span className={`text-xs font-bold ${logger.batteryLevel <= 20 ? 'text-red-500' : logger.batteryLevel <= 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {logger.batteryLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getBatteryColor(logger.batteryLevel)}`}
                          style={{ width: `${logger.batteryLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Last reading */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Dernière lecture</span>
                        <span className="font-medium text-gray-900 dark:text-white">{logger.lastTemp > 0 || logger.status !== 'offline' ? `${logger.lastTemp}°C` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Heure</span>
                        <span className="text-gray-700 dark:text-gray-300">{logger.lastReading}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Localisation</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{logger.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Expédition</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">{logger.assignedShipment || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Firmware</span>
                        <span className="text-gray-700 dark:text-gray-300">{logger.firmware}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => {
                          setSelectedLogger(logger);
                          setSelectedShipmentForAssign(logger.assignedShipment || '');
                          setAssignDialogOpen(true);
                        }}
                      >
                        <Radio className="w-3.5 h-3.5 mr-1" />
                        {logger.assignedShipment ? 'Réassigner' : 'Assigner'}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 4: ALERTES
        ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="alertes">
          {/* Alert Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={alertSeverityFilter} onValueChange={setAlertSeverityFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-9">
                    <SelectValue placeholder="Sévérité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes sévérités</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                    <SelectItem value="majeure">Majeure</SelectItem>
                    <SelectItem value="mineure">Mineure</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={alertStatusFilter} onValueChange={setAlertStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-9">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acquittée">Acquittée</SelectItem>
                    <SelectItem value="résolue">Résolue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alert Cards */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune alerte ne correspond aux filtres</p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card className={`overflow-hidden ${alert.status === 'active' ? 'border-l-4 ' + (alert.severity === 'critique' ? 'border-l-red-500' : alert.severity === 'majeure' ? 'border-l-orange-500' : 'border-l-yellow-500') : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        {/* Severity icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.severity === 'critique' ? 'bg-red-100 dark:bg-red-900/20' : alert.severity === 'majeure' ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                          <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critique' ? 'text-red-500' : alert.severity === 'majeure' ? 'text-orange-500' : 'text-yellow-500'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{alert.id}</span>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${severityColors[alert.severity]}`}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${alertStatusColors[alert.status]}`}>
                              {alert.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Expédition <span className="font-mono">{alert.shipmentRef}</span> — Logger <span className="font-mono">{alert.loggerId}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <ThermometerSnowflake className="w-3 h-3" />
                              Attendu: {alert.expectedTempMin}°C à {alert.expectedTempMax}°C
                            </span>
                            <span className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              Réel: <span className="font-bold text-red-600 dark:text-red-400">{alert.actualTemp}°C</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Écart: <span className="font-bold text-red-600 dark:text-red-400">+{alert.deviation}°C</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.timestamp}
                            </span>
                            <span>Action: {alert.actionTaken}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {alert.status === 'active' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                <BellOff className="w-3.5 h-3.5 mr-1" />
                                Acquitter
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs h-8 text-white"
                                style={{ background: 'linear-gradient(135deg, #06b6d4, #0d9488)' }}
                                onClick={() => resolveAlert(alert.id)}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Résoudre
                              </Button>
                            </>
                          )}
                          {alert.status === 'acquittée' && (
                            <Button
                              size="sm"
                              className="text-xs h-8 text-white"
                              style={{ background: 'linear-gradient(135deg, #06b6d4, #0d9488)' }}
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Résoudre
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 5: CONTENEURS RF
        ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="conteneurs">
          {/* Container specs legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Container className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">20RF</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">5.9m × 2.35m × 2.39m — Plage: -25°C à +25°C</span>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-6" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Container className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">40RF</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">12m × 2.35m × 2.39m — Plage: -25°C à +25°C (ou -80°C ultra-froid)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Container Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {containersRF.map((container) => {
              const tempDeviation = Math.abs(container.currentTemp - container.setTemp);
              const isTempOk = tempDeviation <= 2;
              const isHumidityOk = container.humidity >= 50 && container.humidity <= 85;
              const tempHistory = getContainerTempHistory(container);
              const humidityHistory = getContainerHumidityHistory(container);
              const tempStatus = isTempOk ? 'ok' : tempDeviation <= 4 ? 'warning' : 'breach';

              return (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`overflow-hidden ${tempStatus === 'breach' ? 'border-red-200 dark:border-red-800' : tempStatus === 'warning' ? 'border-amber-200 dark:border-amber-800' : ''}`}>
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{container.id}</span>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${container.type === '20RF' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                              {container.type}
                            </Badge>
                            <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${containerRFStatusColors[container.status]}`}>
                              {containerRFStatusLabel[container.status]}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">Plage: {container.tempRange} | Humidité: {container.humidityRange}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setSelectedContainer(container);
                            setContainerDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Temp & Humidity readings */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg border ${getTempBgColor(tempStatus)}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Température</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-bold ${getTempStatusColor(tempStatus)}`}>
                              {container.currentTemp}°C
                            </span>
                            <span className="text-[10px] text-gray-400">/ {container.setTemp}°C</span>
                          </div>
                        </div>
                        <div className={`p-2.5 rounded-lg border ${isHumidityOk ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Humidité</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-bold ${isHumidityOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {container.humidity}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trend chart */}
                      <div className="mb-3">
                        <TempHumidityChart
                          tempData={tempHistory}
                          humidityData={humidityHistory}
                          tempRange={[container.setTemp - 3, container.setTemp + 3]}
                          humidityRange={[30, 90]}
                        />
                      </div>

                      {/* Footer info */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Voyage</span>
                          <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{container.currentVoyage || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Maintenance</span>
                          <span className="text-gray-700 dark:text-gray-300">{container.nextMaintenance}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: Assign/Reassign Data Logger
      ═══════════════════════════════════════════════════════════ */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-teal-500" />
              {selectedLogger?.assignedShipment ? 'Réassigner le Data Logger' : 'Assigner le Data Logger'}
            </DialogTitle>
            <DialogDescription>
              {selectedLogger && (
                <span>
                  Logger <span className="font-mono font-semibold">{selectedLogger.id}</span> ({selectedLogger.model}) —
                  Batterie: {selectedLogger.batteryLevel}%
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Expédition à assigner</Label>
              <Select value={selectedShipmentForAssign} onValueChange={setSelectedShipmentForAssign}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sélectionner une expédition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucune (retirer) —</SelectItem>
                  {coldShipments.map(s => (
                    <SelectItem key={s.id} value={s.trackingNumber}>
                      <span className="font-mono">{s.trackingNumber}</span> — {s.commodityType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLogger && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs space-y-1">
                <p className="font-semibold text-gray-900 dark:text-white">Informations du logger</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modèle</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedLogger.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Firmware</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedLogger.firmware}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dernière lecture</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedLogger.lastTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Localisation</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedLogger.location}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Annuler</Button>
              <Button
                className="text-white"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0d9488)' }}
                onClick={() => setAssignDialogOpen(false)}
              >
                <Radio className="w-4 h-4 mr-1" />
                {selectedLogger?.assignedShipment ? 'Réassigner' : 'Assigner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: Container Detail
      ═══════════════════════════════════════════════════════════ */}
      <Dialog open={containerDetailOpen} onOpenChange={setContainerDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Container className="w-5 h-5 text-teal-500" />
              Conteneur {selectedContainer?.id}
            </DialogTitle>
            <DialogDescription>
              Détails du conteneur réfrigéré {selectedContainer?.type}
            </DialogDescription>
          </DialogHeader>
          {selectedContainer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                  <Snowflake className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContainer.currentTemp}°C</p>
                  <p className="text-[10px] text-gray-500">Consigne: {selectedContainer.setTemp}°C</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                  <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContainer.humidity}%</p>
                  <p className="text-[10px] text-gray-500">Humidité relative</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedContainer.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Statut</span>
                  <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${containerRFStatusColors[selectedContainer.status]}`}>
                    {containerRFStatusLabel[selectedContainer.status]}
                  </Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Plage température</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedContainer.tempRange}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Plage humidité</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedContainer.humidityRange}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Voyage actuel</span>
                  <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{selectedContainer.currentVoyage || 'Aucun'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Prochaine maintenance</span>
                  <span className="text-gray-700 dark:text-gray-300">{selectedContainer.nextMaintenance}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setContainerDetailOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
