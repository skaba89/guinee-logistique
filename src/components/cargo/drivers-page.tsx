'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Route,
  Coffee,
  Star,
  Plus,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Truck,
  Shield,
  Fuel,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Activity,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { vehicles, formatDate } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

// ─── Driver Data ───────────────────────────────────────────────────────────────

type DriverStatus = 'available' | 'on_route' | 'on_leave' | 'off_duty';
type LicenseType = 'B' | 'C' | 'CE' | 'D' | 'DE';

interface DriverDocument {
  type: string;
  label: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: DriverStatus;
  licenseType: LicenseType;
  licenseExpiry: string;
  vehiclePlate: string;
  vehicleType: string;
  rating: number;
  totalTrips: number;
  totalDistance: number;
  onTimeRate: number;
  safetyScore: number;
  fuelEfficiency: number;
  joinDate: string;
  documents: DriverDocument[];
  recentTrips: {
    route: string;
    date: string;
    status: 'completed' | 'delayed' | 'in_progress';
    distance: number;
  }[];
  weeklySchedule: {
    day: string;
    route: string;
    status: 'planned' | 'available' | 'off';
  }[];
}

const statusLabels: Record<DriverStatus, string> = {
  available: 'Disponible',
  on_route: 'En route',
  on_leave: 'En congé',
  off_duty: 'Hors service',
};

const statusColors: Record<DriverStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  on_route: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  off_duty: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const statusDotColors: Record<DriverStatus, string> = {
  available: 'bg-emerald-500',
  on_route: 'bg-blue-500',
  on_leave: 'bg-amber-500',
  off_duty: 'bg-gray-400',
};

const licenseLabels: Record<LicenseType, string> = {
  B: 'Permis B',
  C: 'Permis C',
  CE: 'Permis CE',
  D: 'Permis D',
  DE: 'Permis DE',
};

const drivers: Driver[] = [
  {
    id: 'd1',
    firstName: 'Rachid',
    lastName: 'Kaci',
    phone: '0555111222',
    email: 'r.kaci@guinee-logistique.pro',
    status: 'on_route',
    licenseType: 'CE',
    licenseExpiry: '2026-12-15',
    vehiclePlate: '16-0234-105',
    vehicleType: 'Mercedes-Benz Actros 1845',
    rating: 4.5,
    totalTrips: 38,
    totalDistance: 48200,
    onTimeRate: 89,
    safetyScore: 92,
    fuelEfficiency: 88,
    joinDate: '2022-03-01',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2026-12-15', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-06-20', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-04-10', status: 'expiring_soon' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-01-05', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Alger → Tunis', date: '2026-03-07', status: 'completed', distance: 850 },
      { route: 'Alger → Oran', date: '2026-03-05', status: 'completed', distance: 430 },
      { route: 'Rotterdam → Milan', date: '2026-02-28', status: 'delayed', distance: 1200 },
      { route: 'Barcelone → Milan', date: '2026-02-25', status: 'completed', distance: 950 },
      { route: 'Montréal → New York', date: '2026-02-20', status: 'completed', distance: 600 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: 'Alger → Constantine', status: 'planned' },
      { day: 'Mar', route: 'Constantine → Annaba', status: 'planned' },
      { day: 'Mer', route: 'Annaba → Tunis', status: 'planned' },
      { day: 'Jeu', route: 'Tunis → Alger', status: 'planned' },
      { day: 'Ven', route: '—', status: 'available' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd2',
    firstName: 'Yacine',
    lastName: 'Hamdi',
    phone: '0555333444',
    email: 'y.hamdi@guinee-logistique.pro',
    status: 'on_route',
    licenseType: 'CE',
    licenseExpiry: '2027-03-22',
    vehiclePlate: '16-0567-208',
    vehicleType: 'Volvo FH 500',
    rating: 4.8,
    totalTrips: 47,
    totalDistance: 61300,
    onTimeRate: 96,
    safetyScore: 97,
    fuelEfficiency: 92,
    joinDate: '2021-06-15',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2027-03-22', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-09-10', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-07-15', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-06-01', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Casablanca → Dakar', date: '2026-03-08', status: 'in_progress', distance: 2800 },
      { route: 'Alger → Annaba', date: '2026-03-05', status: 'completed', distance: 530 },
      { route: 'Tunis → Alger', date: '2026-03-01', status: 'completed', distance: 850 },
      { route: 'Casablanca → Alger', date: '2026-02-26', status: 'completed', distance: 1600 },
      { route: 'Alger → Béjaïa', date: '2026-02-22', status: 'completed', distance: 260 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: 'Casablanca → Dakar', status: 'planned' },
      { day: 'Mar', route: 'En route vers Dakar', status: 'planned' },
      { day: 'Mer', route: 'Arrivée Dakar', status: 'planned' },
      { day: 'Jeu', route: 'Dakar → Casablanca', status: 'planned' },
      { day: 'Ven', route: 'En route retour', status: 'planned' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd3',
    firstName: 'Karim',
    lastName: 'Bouzid',
    phone: '0555555666',
    email: 'k.bouzid@guinee-logistique.pro',
    status: 'available',
    licenseType: 'C',
    licenseExpiry: '2026-08-30',
    vehiclePlate: '09-1234-567',
    vehicleType: 'Renault Master L3H2',
    rating: 4.4,
    totalTrips: 43,
    totalDistance: 35800,
    onTimeRate: 93,
    safetyScore: 88,
    fuelEfficiency: 87,
    joinDate: '2023-01-10',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2026-08-30', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-04-05', status: 'expiring_soon' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-09-20', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2026-11-12', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Montréal → New York', date: '2026-03-06', status: 'completed', distance: 600 },
      { route: 'Istanbul → Le Caire', date: '2026-03-02', status: 'completed', distance: 1300 },
      { route: 'Alger → Dubaï', date: '2026-02-27', status: 'completed', distance: 5400 },
      { route: 'New York → Alger', date: '2026-02-20', status: 'completed', distance: 6200 },
      { route: 'Anvers → Alger', date: '2026-02-15', status: 'delayed', distance: 2100 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'available' },
      { day: 'Mar', route: 'Alger → Oran', status: 'planned' },
      { day: 'Mer', route: 'Oran → Tlemcen', status: 'planned' },
      { day: 'Jeu', route: 'Tlemcen → Alger', status: 'planned' },
      { day: 'Ven', route: '—', status: 'available' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd4',
    firstName: 'Ali',
    lastName: 'Mezdad',
    phone: '0555999000',
    email: 'a.mezdad@guinee-logistique.pro',
    status: 'on_route',
    licenseType: 'CE',
    licenseExpiry: '2028-01-10',
    vehiclePlate: '16-8901-302',
    vehicleType: 'Schmitz Cargobull',
    rating: 4.7,
    totalTrips: 52,
    totalDistance: 78500,
    onTimeRate: 94,
    safetyScore: 95,
    fuelEfficiency: 91,
    joinDate: '2020-09-01',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2028-01-10', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-05-18', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-08-30', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-04-22', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Casablanca → Alger', date: '2026-03-10', status: 'in_progress', distance: 1600 },
      { route: 'Hambourg → Djeddah', date: '2026-03-05', status: 'completed', distance: 5200 },
      { route: 'Shanghai → Alger', date: '2026-02-28', status: 'completed', distance: 10500 },
      { route: 'Santos → Rotterdam', date: '2026-02-15', status: 'completed', distance: 9800 },
      { route: 'Alger → Marseille', date: '2026-02-10', status: 'completed', distance: 1200 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: 'Casablanca → Alger', status: 'planned' },
      { day: 'Mar', route: 'En route', status: 'planned' },
      { day: 'Mer', route: 'Arrivée Alger', status: 'planned' },
      { day: 'Jeu', route: 'Alger → Béjaïa', status: 'planned' },
      { day: 'Ven', route: 'Béjaïa → Alger', status: 'planned' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd5',
    firstName: 'Sofiane',
    lastName: 'Benali',
    phone: '0555121202',
    email: 's.benali@guinee-logistique.pro',
    status: 'on_leave',
    licenseType: 'C',
    licenseExpiry: '2026-07-14',
    vehiclePlate: '16-3456-789',
    vehicleType: 'Scania R450',
    rating: 4.3,
    totalTrips: 31,
    totalDistance: 28900,
    onTimeRate: 87,
    safetyScore: 82,
    fuelEfficiency: 85,
    joinDate: '2023-08-20',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2026-07-14', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-03-15', status: 'expired' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-06-01', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2026-12-30', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Rotterdam → Milan', date: '2026-03-09', status: 'delayed', distance: 1200 },
      { route: 'Alger → Constantine', date: '2026-03-04', status: 'completed', distance: 430 },
      { route: 'Oran → Alger', date: '2026-02-28', status: 'completed', distance: 430 },
      { route: 'Alger → Tizi Ouzou', date: '2026-02-25', status: 'completed', distance: 110 },
      { route: 'Blida → Alger', date: '2026-02-22', status: 'completed', distance: 45 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'off' },
      { day: 'Mar', route: '—', status: 'off' },
      { day: 'Mer', route: '—', status: 'off' },
      { day: 'Jeu', route: '—', status: 'off' },
      { day: 'Ven', route: '—', status: 'off' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd6',
    firstName: 'Bilal',
    lastName: 'Kherrazi',
    phone: '0555171819',
    email: 'b.kherrazi@guinee-logistique.pro',
    status: 'available',
    licenseType: 'CE',
    licenseExpiry: '2027-06-25',
    vehiclePlate: '16-4567-890',
    vehicleType: 'MAN TGX 18.500',
    rating: 4.6,
    totalTrips: 29,
    totalDistance: 32100,
    onTimeRate: 91,
    safetyScore: 93,
    fuelEfficiency: 90,
    joinDate: '2022-11-01',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2027-06-25', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-11-10', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-09-05', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-08-15', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Barcelone → Milan', date: '2026-03-12', status: 'completed', distance: 950 },
      { route: 'Alger → Oran', date: '2026-03-08', status: 'completed', distance: 430 },
      { route: 'Constantine → Alger', date: '2026-03-04', status: 'completed', distance: 430 },
      { route: 'Milan → Barcelone', date: '2026-02-28', status: 'completed', distance: 950 },
      { route: 'Alger → Annaba', date: '2026-02-24', status: 'completed', distance: 530 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'available' },
      { day: 'Mar', route: '—', status: 'available' },
      { day: 'Mer', route: 'Alger → Sétif', status: 'planned' },
      { day: 'Jeu', route: 'Sétif → Constantine', status: 'planned' },
      { day: 'Ven', route: 'Constantine → Alger', status: 'planned' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd7',
    firstName: 'Mourad',
    lastName: 'Talbi',
    phone: '0555777888',
    email: 'm.talbi@guinee-logistique.pro',
    status: 'off_duty',
    licenseType: 'C',
    licenseExpiry: '2026-05-01',
    vehiclePlate: '09-2345-678',
    vehicleType: 'Iveco Daily 70C17',
    rating: 3.9,
    totalTrips: 22,
    totalDistance: 18400,
    onTimeRate: 78,
    safetyScore: 75,
    fuelEfficiency: 80,
    joinDate: '2023-04-15',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2026-05-01', status: 'expiring_soon' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-02-28', status: 'expired' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-03-12', status: 'expiring_soon' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2026-09-20', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Alger → Blida', date: '2026-02-25', status: 'delayed', distance: 45 },
      { route: 'Blida → Alger', date: '2026-02-22', status: 'completed', distance: 45 },
      { route: 'Alger → Tizi Ouzou', date: '2026-02-18', status: 'delayed', distance: 110 },
      { route: 'Oran → Alger', date: '2026-02-14', status: 'completed', distance: 430 },
      { route: 'Alger → Oran', date: '2026-02-10', status: 'completed', distance: 430 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'off' },
      { day: 'Mar', route: '—', status: 'off' },
      { day: 'Mer', route: '—', status: 'off' },
      { day: 'Jeu', route: '—', status: 'off' },
      { day: 'Ven', route: '—', status: 'off' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd8',
    firstName: 'Mustapha',
    lastName: 'Djamel',
    phone: '0555141516',
    email: 'm.djamel@guinee-logistique.pro',
    status: 'available',
    licenseType: 'D',
    licenseExpiry: '2027-09-18',
    vehiclePlate: '09-3456-890',
    vehicleType: 'Peugeot Boxer L4H3',
    rating: 4.1,
    totalTrips: 35,
    totalDistance: 24200,
    onTimeRate: 85,
    safetyScore: 86,
    fuelEfficiency: 83,
    joinDate: '2021-12-01',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2027-09-18', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-08-22', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-10-15', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-03-30', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Lagos → Abidjan', date: '2026-03-14', status: 'completed', distance: 1500 },
      { route: 'Alger → Béjaïa', date: '2026-03-10', status: 'completed', distance: 260 },
      { route: 'Béjaïa → Alger', date: '2026-03-07', status: 'completed', distance: 260 },
      { route: 'Alger → Blida', date: '2026-03-04', status: 'completed', distance: 45 },
      { route: 'Blida → Alger', date: '2026-03-02', status: 'completed', distance: 45 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'available' },
      { day: 'Mar', route: 'Alger → Sétif', status: 'planned' },
      { day: 'Mer', route: 'Sétif → Batna', status: 'planned' },
      { day: 'Jeu', route: 'Batna → Biskra', status: 'planned' },
      { day: 'Ven', route: 'Biskra → Alger', status: 'planned' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd9',
    firstName: 'Hichem',
    lastName: 'Rouabah',
    phone: '0555202122',
    email: 'h.rouabah@guinee-logistique.pro',
    status: 'on_route',
    licenseType: 'CE',
    licenseExpiry: '2027-11-05',
    vehiclePlate: '09-4567-890',
    vehicleType: 'Ford Transit Custom',
    rating: 4.2,
    totalTrips: 26,
    totalDistance: 19800,
    onTimeRate: 88,
    safetyScore: 84,
    fuelEfficiency: 86,
    joinDate: '2024-02-01',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2027-11-05', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-10-20', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-11-30', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-09-15', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Istanbul → Le Caire', date: '2026-03-13', status: 'in_progress', distance: 1300 },
      { route: 'Alger → Tunis', date: '2026-03-09', status: 'completed', distance: 850 },
      { route: 'Tunis → Alger', date: '2026-03-05', status: 'completed', distance: 850 },
      { route: 'Alger → Constantine', date: '2026-03-01', status: 'completed', distance: 430 },
      { route: 'Constantine → Alger', date: '2026-02-27', status: 'completed', distance: 430 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: 'Istanbul → Le Caire', status: 'planned' },
      { day: 'Mar', route: 'En route', status: 'planned' },
      { day: 'Mer', route: 'Le Caire → Alexandrie', status: 'planned' },
      { day: 'Jeu', route: 'Alexandrie → Le Caire', status: 'planned' },
      { day: 'Ven', route: '—', status: 'available' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd10',
    firstName: 'Samir',
    lastName: 'Boudiaf',
    phone: '0555232425',
    email: 's.boudiaf@guinee-logistique.pro',
    status: 'available',
    licenseType: 'C',
    licenseExpiry: '2026-10-20',
    vehiclePlate: '16-6789-012',
    vehicleType: 'DAF XF 480',
    rating: 4.0,
    totalTrips: 18,
    totalDistance: 14200,
    onTimeRate: 82,
    safetyScore: 79,
    fuelEfficiency: 82,
    joinDate: '2024-07-01',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2026-10-20', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-04-18', status: 'expiring_soon' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-12-01', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-05-10', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Alger → Oran', date: '2026-03-08', status: 'completed', distance: 430 },
      { route: 'Oran → Tlemcen', date: '2026-03-05', status: 'delayed', distance: 180 },
      { route: 'Tlemcen → Oran', date: '2026-03-02', status: 'completed', distance: 180 },
      { route: 'Oran → Alger', date: '2026-02-28', status: 'completed', distance: 430 },
      { route: 'Alger → Blida', date: '2026-02-25', status: 'completed', distance: 45 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'available' },
      { day: 'Mar', route: '—', status: 'available' },
      { day: 'Mer', route: 'Alger → Annaba', status: 'planned' },
      { day: 'Jeu', route: 'Annaba → Alger', status: 'planned' },
      { day: 'Ven', route: '—', status: 'available' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
  {
    id: 'd11',
    firstName: 'Nabil',
    lastName: 'Ferhat',
    phone: '0555262728',
    email: 'n.ferhat@guinee-logistique.pro',
    status: 'on_leave',
    licenseType: 'CE',
    licenseExpiry: '2027-04-30',
    vehiclePlate: '16-7890-456',
    vehicleType: 'Renault T High 520',
    rating: 4.5,
    totalTrips: 40,
    totalDistance: 52800,
    onTimeRate: 90,
    safetyScore: 91,
    fuelEfficiency: 89,
    joinDate: '2021-10-15',
    documents: [
      { type: 'license', label: 'Permis de conduire', expiryDate: '2027-04-30', status: 'valid' },
      { type: 'medical', label: 'Certificat médical', expiryDate: '2026-07-25', status: 'valid' },
      { type: 'insurance', label: 'Attestation assurance', expiryDate: '2026-08-10', status: 'valid' },
      { type: 'training', label: 'Formation FIMO', expiryDate: '2027-02-15', status: 'valid' },
    ],
    recentTrips: [
      { route: 'Marseille → Alger', date: '2026-03-02', status: 'completed', distance: 1200 },
      { route: 'Alger → Marseille', date: '2026-02-25', status: 'completed', distance: 1200 },
      { route: 'Casablanca → Alger', date: '2026-02-20', status: 'completed', distance: 1600 },
      { route: 'Alger → Casablanca', date: '2026-02-14', status: 'completed', distance: 1600 },
      { route: 'Alger → Tunis', date: '2026-02-08', status: 'completed', distance: 850 },
    ],
    weeklySchedule: [
      { day: 'Lun', route: '—', status: 'off' },
      { day: 'Mar', route: '—', status: 'off' },
      { day: 'Mer', route: '—', status: 'off' },
      { day: 'Jeu', route: '—', status: 'off' },
      { day: 'Ven', route: '—', status: 'off' },
      { day: 'Sam', route: '—', status: 'off' },
      { day: 'Dim', route: '—', status: 'off' },
    ],
  },
];

// ─── Performance chart data ────────────────────────────────────────────────────

const onTimeData = drivers
  .sort((a, b) => b.onTimeRate - a.onTimeRate)
  .map(d => ({ name: `${d.firstName} ${d.lastName.charAt(0)}.`, taux: d.onTimeRate }));

const safetyData = drivers
  .sort((a, b) => b.safetyScore - a.safetyScore)
  .map(d => ({ name: `${d.firstName} ${d.lastName.charAt(0)}.`, score: d.safetyScore }));

const fuelEffData = drivers
  .sort((a, b) => b.fuelEfficiency - a.fuelEfficiency)
  .map(d => ({ name: `${d.firstName} ${d.lastName.charAt(0)}.`, efficacite: d.fuelEfficiency }));

const monthlyTripData = [
  { mois: 'Oct', trajets: 62 },
  { mois: 'Nov', trajets: 58 },
  { mois: 'Déc', trajets: 71 },
  { mois: 'Jan', trajets: 65 },
  { mois: 'Fév', trajets: 68 },
  { mois: 'Mar', trajets: 54 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}

function getAvatarColor(rating: number) {
  if (rating >= 4.7) return 'from-emerald-500 to-teal-600';
  if (rating >= 4.3) return 'from-teal-500 to-cyan-600';
  if (rating >= 4.0) return 'from-amber-500 to-orange-600';
  return 'from-red-500 to-rose-600';
}

function getDaysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDocStatusColor(status: string) {
  if (status === 'expired') return 'text-red-500';
  if (status === 'expiring_soon') return 'text-amber-500';
  return 'text-emerald-500';
}

function getDocBadge(status: string) {
  if (status === 'expired') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (status === 'expiring_soon') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
}

function getDocStatusText(status: string, expiryDate: string) {
  const days = getDaysUntil(expiryDate);
  if (status === 'expired') return `Expiré (${Math.abs(days)}j)`;
  if (status === 'expiring_soon') return `Expire bientôt (${days}j)`;
  return `Valide (${days}j)`;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />);
    } else if (i === full && half) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-200" />);
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DriversPage() {
  const canEditDrivers = useCargoStore((s) => s.canEdit('drivers'));
  const setPage = useCargoStore((s) => s.setPage);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mutable drivers state
  const [driversList, setDriversList] = useState<Driver[]>(drivers);

  // New driver form state
  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    licenseType: 'C' as LicenseType,
    licenseExpiry: '',
    vehicleId: '',
    status: 'available' as DriverStatus,
  });

  // Handle adding a new driver
  const handleAddDriver = () => {
    if (!newDriver.firstName || !newDriver.lastName || !newDriver.phone) return;
    const vehicle = vehicles.find(v => v.id === newDriver.vehicleId);
    const newDrv: Driver = {
      id: `d${Date.now()}`,
      firstName: newDriver.firstName,
      lastName: newDriver.lastName,
      phone: newDriver.phone,
      email: newDriver.email || '',
      status: newDriver.status,
      licenseType: newDriver.licenseType,
      licenseExpiry: newDriver.licenseExpiry || '2027-01-01',
      vehiclePlate: vehicle?.immatriculation || 'N/A',
      vehicleType: vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Non assigné',
      rating: 0,
      totalTrips: 0,
      totalDistance: 0,
      onTimeRate: 0,
      safetyScore: 0,
      fuelEfficiency: 0,
      joinDate: new Date().toISOString().split('T')[0],
      documents: [
        { type: 'license', label: 'Permis de conduire', expiryDate: newDriver.licenseExpiry || '2027-01-01', status: 'valid' },
        { type: 'medical', label: 'Certificat médical', expiryDate: '2027-01-01', status: 'valid' },
        { type: 'insurance', label: 'Attestation assurance', expiryDate: '2027-01-01', status: 'valid' },
        { type: 'training', label: 'Formation FIMO', expiryDate: '2027-01-01', status: 'valid' },
      ],
      recentTrips: [],
      weeklySchedule: [
        { day: 'Lun', route: '—', status: 'available' as const },
        { day: 'Mar', route: '—', status: 'available' as const },
        { day: 'Mer', route: '—', status: 'available' as const },
        { day: 'Jeu', route: '—', status: 'available' as const },
        { day: 'Ven', route: '—', status: 'available' as const },
        { day: 'Sam', route: '—', status: 'off' as const },
        { day: 'Dim', route: '—', status: 'off' as const },
      ],
    };
    setDriversList(prev => [...prev, newDrv]);
    setNewDriver({ firstName: '', lastName: '', phone: '', email: '', licenseType: 'C', licenseExpiry: '', vehicleId: '', status: 'available' });
    setShowAddDialog(false);
  };

  // KPI calculations
  const totalDrivers = driversList.length;
  const availableDrivers = driversList.filter(d => d.status === 'available').length;
  const onRouteDrivers = driversList.filter(d => d.status === 'on_route').length;
  const onLeaveDrivers = driversList.filter(d => d.status === 'on_leave').length;
  const avgRating = driversList.length > 0 ? (driversList.reduce((s, d) => s + d.rating, 0) / driversList.length).toFixed(1) : '0';

  const kpis = [
    { title: 'Total chauffeurs', value: totalDrivers, icon: Users, color: 'from-teal-500 to-teal-600' },
    { title: 'Disponibles', value: availableDrivers, icon: UserCheck, color: 'from-emerald-500 to-green-600' },
    { title: 'En route', value: onRouteDrivers, icon: Route, color: 'from-blue-500 to-blue-600' },
    { title: 'En congé', value: onLeaveDrivers, icon: Coffee, color: 'from-amber-500 to-amber-600' },
    { title: 'Note moyenne', value: avgRating, icon: Star, color: 'from-amber-500 to-orange-600' },
  ];

  const filtered = useMemo(() => {
    let result = [...driversList];
    if (statusFilter !== 'all') result = result.filter(d => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.vehiclePlate.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, statusFilter, driversList]);

  // Count documents expiring soon or expired
  const allDocs = driversList.flatMap(d => d.documents);
  const expiringDocs = allDocs.filter(d => d.status === 'expiring_soon');
  const expiredDocs = allDocs.filter(d => d.status === 'expired');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-500" />
            Gestion des Chauffeurs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Centre de gestion et suivi des performances chauffeurs</p>
        </div>
        {canEditDrivers && (
          <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau chauffeur
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

      {/* Document Alerts */}
      {(expiringDocs.length > 0 || expiredDocs.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 dark:border-amber-800/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Alertes documents</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {expiredDocs.length > 0 && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                        <XCircle className="w-3 h-3 mr-1" />
                        {expiredDocs.length} document(s) expiré(s)
                      </Badge>
                    )}
                    {expiringDocs.length > 0 && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {expiringDocs.length} document(s) expirent bientôt
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Rechercher par nom, téléphone, email, véhicule..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="on_route">En route</SelectItem>
                <SelectItem value="on_leave">En congé</SelectItem>
                <SelectItem value="off_duty">Hors service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun chauffeur trouvé</p>
          </div>
        ) : (
          filtered.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="cursor-pointer"
              onClick={() => setSelectedDriver(driver)}
            >
              <Card className="hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all h-full">
                <CardContent className="p-4 sm:p-5">
                  {/* Header with avatar, name, status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(driver.rating)} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                        {getInitials(driver.firstName, driver.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{driver.firstName} {driver.lastName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {renderStars(driver.rating)}
                          <span className="text-[10px] text-gray-500 ml-1">{driver.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[driver.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[driver.status]} mr-1 inline-block`} />
                      {statusLabels[driver.status]}
                    </Badge>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {driver.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {driver.email}
                    </div>
                  </div>

                  {/* License & Vehicle */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400 uppercase">Permis</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{licenseLabels[driver.licenseType]}</p>
                      <p className="text-[10px] text-gray-400">Exp. {formatDate(driver.licenseExpiry)}</p>
                    </div>
                    <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400 uppercase">Véhicule</p>
                      <p className="text-xs font-mono font-medium text-gray-900 dark:text-white">{driver.vehiclePlate}</p>
                      <p className="text-[10px] text-gray-400 truncate">{driver.vehicleType}</p>
                    </div>
                  </div>

                  {/* Performance metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-gray-500">Ponctualité</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{driver.onTimeRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${driver.onTimeRate}%`, background: driver.onTimeRate >= 90 ? '#059669' : driver.onTimeRate >= 85 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-gray-500">Sécurité</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{driver.safetyScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${driver.safetyScore}%`, background: 'linear-gradient(90deg, #0d9488, #059669)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Route className="w-3 h-3" />{driver.totalTrips} trajets</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{(driver.totalDistance / 1000).toFixed(1)}K km</span>
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{driver.fuelEfficiency}% eff.</span>
                  </div>

                  {/* Document warnings */}
                  {driver.documents.some(d => d.status !== 'valid') && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3 h-3 ${driver.documents.some(d => d.status === 'expired') ? 'text-red-500' : 'text-amber-500'}`} />
                        <span className="text-[10px] text-gray-500">
                          {driver.documents.filter(d => d.status === 'expired').length > 0 && `${driver.documents.filter(d => d.status === 'expired').length} expiré(s) `}
                          {driver.documents.filter(d => d.status === 'expiring_soon').length > 0 && `${driver.documents.filter(d => d.status === 'expiring_soon').length} expirent`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quick action buttons */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(driver.phone); setCopiedPhone(driver.id); setTimeout(() => setCopiedPhone(null), 2000); }} title={copiedPhone === driver.id ? 'Numéro copié !' : 'Copier le numéro'}>
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={(e) => { e.stopPropagation(); setPage('chat'); }} title="Ouvrir le chat">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={(e) => { e.stopPropagation(); setSelectedDriver(driver); }}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <div className="flex-1" />
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Performance Dashboard */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-500" />
          Tableau de bord des performances
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* On-time delivery rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" />
                Taux de livraison à l&apos;heure
              </CardTitle>
              <CardDescription>Ponctualité par chauffeur (%)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={onTimeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)' }}
                    formatter={(value: number) => [`${value}%`, 'Taux à l\'heure']}
                  />
                  <Bar dataKey="taux" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Safety score ranking */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Classement sécurité
              </CardTitle>
              <CardDescription>Score de sécurité par chauffeur (%)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={safetyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)' }}
                    formatter={(value: number) => [`${value}%`, 'Score sécurité']}
                  />
                  <Bar dataKey="score" fill="#059669" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fuel efficiency comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-500" />
                Efficacité carburant
              </CardTitle>
              <CardDescription>Comparaison efficacité énergétique (%)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={fuelEffData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)' }}
                    formatter={(value: number) => [`${value}%`, 'Efficacité']}
                  />
                  <Bar dataKey="efficacite" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly trip count trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Tendance mensuelle des trajets
              </CardTitle>
              <CardDescription>Nombre de trajets par mois</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTripData} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mois" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)' }}
                    formatter={(value: number) => [`${value}`, 'Trajets']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="trajets" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Management Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" />
            Gestion des documents
          </CardTitle>
          <CardDescription>Suivi des documents et certifications par chauffeur</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Chauffeur</TableHead>
                  <TableHead className="text-xs">Permis</TableHead>
                  <TableHead className="text-xs">Certificat médical</TableHead>
                  <TableHead className="text-xs">Assurance</TableHead>
                  <TableHead className="text-xs">Formation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driversList.map((driver) => (
                  <TableRow key={driver.id} className="cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-900/10" onClick={() => setSelectedDriver(driver)}>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(driver.rating)} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {getInitials(driver.firstName, driver.lastName)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{driver.firstName} {driver.lastName}</span>
                      </div>
                    </TableCell>
                    {driver.documents.map((doc) => (
                      <TableCell key={doc.type}>
                        <div className="flex items-center gap-1.5">
                          {doc.status === 'valid' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : doc.status === 'expiring_soon' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <div>
                            <p className={`text-[10px] font-medium ${getDocStatusColor(doc.status)}`}>
                              {getDocStatusText(doc.status, doc.expiryDate)}
                            </p>
                            <p className="text-[9px] text-gray-400">{formatDate(doc.expiryDate)}</p>
                          </div>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedDriver.rating)} flex items-center justify-center text-white text-sm font-bold`}>
                    {getInitials(selectedDriver.firstName, selectedDriver.lastName)}
                  </div>
                  <div>
                    <span>{selectedDriver.firstName} {selectedDriver.lastName}</span>
                    <Badge variant="secondary" className={`text-[10px] ml-2 ${statusColors[selectedDriver.status]}`}>
                      {statusLabels[selectedDriver.status]}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>Profil complet et performances</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile" className="text-xs">Profil</TabsTrigger>
                  <TabsTrigger value="trips" className="text-xs">Trajets</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
                  <TabsTrigger value="schedule" className="text-xs">Semaine</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4 mt-4">
                  {/* Personal info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Téléphone</Label>
                      <p className="text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{selectedDriver.phone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{selectedDriver.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Permis</Label>
                      <p className="text-sm font-medium">{licenseLabels[selectedDriver.licenseType]} — Exp. {formatDate(selectedDriver.licenseExpiry)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Date d&apos;embauche</Label>
                      <p className="text-sm font-medium">{formatDate(selectedDriver.joinDate)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Véhicule assigné</Label>
                      <p className="text-sm font-medium flex items-center gap-1"><Truck className="w-3 h-3 text-gray-400" />{selectedDriver.vehiclePlate} — {selectedDriver.vehicleType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Note</Label>
                      <div className="flex items-center gap-1 mt-0.5">
                        {renderStars(selectedDriver.rating)}
                        <span className="text-sm font-medium ml-1">{selectedDriver.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance metrics */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Indicateurs de performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />Ponctualité</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedDriver.onTimeRate}%</span>
                        </div>
                        <Progress value={selectedDriver.onTimeRate} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" />Sécurité</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedDriver.safetyScore}%</span>
                        </div>
                        <Progress value={selectedDriver.safetyScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Fuel className="w-3 h-3" />Efficacité carburant</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedDriver.fuelEfficiency}%</span>
                        </div>
                        <Progress value={selectedDriver.fuelEfficiency} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Award className="w-3 h-3" />Note globale</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedDriver.rating}/5</span>
                        </div>
                        <Progress value={selectedDriver.rating * 20} className="h-2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="p-2 rounded-md bg-teal-50 dark:bg-teal-900/20 text-center">
                        <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{selectedDriver.totalTrips}</p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-500">Trajets complétés</p>
                      </div>
                      <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-center">
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{(selectedDriver.totalDistance / 1000).toFixed(1)}K</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500">Km parcourus</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Trips Tab */}
                <TabsContent value="trips" className="space-y-3 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">5 derniers trajets</h4>
                  <div className="space-y-2">
                    {selectedDriver.recentTrips.map((trip, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          trip.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                          trip.status === 'delayed' ? 'bg-amber-100 dark:bg-amber-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {trip.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                           trip.status === 'delayed' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                           <Route className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.route}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(trip.date)} • {trip.distance.toLocaleString('fr-FR')} km</p>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] ${
                          trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          trip.status === 'delayed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {trip.status === 'completed' ? 'Terminé' : trip.status === 'delayed' ? 'Retardé' : 'En cours'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-3 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Documents et certifications</h4>
                  <div className="space-y-2">
                    {selectedDriver.documents.map((doc) => {
                      const days = getDaysUntil(doc.expiryDate);
                      return (
                        <div key={doc.type} className={`flex items-center gap-3 p-3 rounded-lg border ${
                          doc.status === 'expired' ? 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10' :
                          doc.status === 'expiring_soon' ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10' :
                          'border-gray-200 dark:border-gray-700'
                        }`}>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            doc.status === 'expired' ? 'bg-red-100 dark:bg-red-900/30' :
                            doc.status === 'expiring_soon' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            'bg-emerald-100 dark:bg-emerald-900/30'
                          }`}>
                            {doc.status === 'valid' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                             doc.status === 'expiring_soon' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                             <XCircle className="w-4 h-4 text-red-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.label}</p>
                            <p className="text-[10px] text-gray-400">Expire le {formatDate(doc.expiryDate)}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className={`text-[10px] ${getDocBadge(doc.status)}`}>
                              {getDocStatusText(doc.status, doc.expiryDate)}
                            </Badge>
                            {days <= 90 && days > 0 && (
                              <div className="mt-1">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                  <div className="h-1 rounded-full" style={{
                                    width: `${Math.max(5, (days / 365) * 100)}%`,
                                    background: days < 30 ? '#ef4444' : '#f59e0b'
                                  }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-3 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Planning de la semaine</h4>
                  <div className="space-y-2">
                    {selectedDriver.weeklySchedule.map((slot, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                          slot.status === 'planned' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                          slot.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {slot.day}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {slot.route !== '—' ? slot.route : 'Aucune route planifiée'}
                          </p>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] ${
                          slot.status === 'planned' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                          slot.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {slot.status === 'planned' ? 'Planifié' : slot.status === 'available' ? 'Disponible' : 'Repos'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Driver Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              Nouveau chauffeur
            </DialogTitle>
            <DialogDescription>Enregistrer un nouveau chauffeur dans le système</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Personal info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Informations personnelles</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Prénom</Label>
                  <Input placeholder="Prénom" className="h-9" value={newDriver.firstName} onChange={e => setNewDriver({ ...newDriver, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Nom</Label>
                  <Input placeholder="Nom" className="h-9" value={newDriver.lastName} onChange={e => setNewDriver({ ...newDriver, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Téléphone</Label>
                  <Input placeholder="05XXXXXXXX" className="h-9" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Email</Label>
                  <Input placeholder="email@guinee-logistique.pro" className="h-9" value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })} />
                </div>
              </div>
            </div>

            {/* License details */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Détails du permis</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Type de permis</Label>
                  <Select value={newDriver.licenseType} onValueChange={v => setNewDriver({ ...newDriver, licenseType: v as LicenseType })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B">Permis B</SelectItem>
                      <SelectItem value="C">Permis C</SelectItem>
                      <SelectItem value="CE">Permis CE</SelectItem>
                      <SelectItem value="D">Permis D</SelectItem>
                      <SelectItem value="DE">Permis DE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Date d&apos;expiration</Label>
                  <Input type="date" className="h-9" value={newDriver.licenseExpiry} onChange={e => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Vehicle assignment */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Assignation véhicule</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Véhicule</Label>
                  <Select value={newDriver.vehicleId} onValueChange={v => setNewDriver({ ...newDriver, vehicleId: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner un véhicule" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.filter(v => v.status === 'actif').map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.immatriculation} — {v.marque} {v.modele}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Statut initial</Label>
                  <Select value={newDriver.status} onValueChange={v => setNewDriver({ ...newDriver, status: v as DriverStatus })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="on_route">En route</SelectItem>
                      <SelectItem value="on_leave">En congé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleAddDriver}>
                <Plus className="w-4 h-4 mr-1" />
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
