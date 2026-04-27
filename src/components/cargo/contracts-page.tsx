'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSignature,
  Ship,
  Plane,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3,
  Download,
  Edit,
  Plus,
  Filter,
  Search,
  X,
  ArrowRightLeft,
  Eye,
  RefreshCw,
  Trash2,
  ChevronDown,
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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────
type ContractType = 'maritime' | 'aerien' | 'terrestre' | 'multimodal';
type ContractStatus = 'actif' | 'en_negociation' | 'expire' | 'resilie';

interface RateCard {
  origin: string;
  destination: string;
  ratePerKg: number;
  ratePerContainer: number;
  ratePerKm: number;
  transitTime: string;
}

interface Amendment {
  id: string;
  date: string;
  description: string;
  author: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  carrier: string;
  type: ContractType;
  mainRoute: string;
  startDate: string;
  endDate: string;
  annualValue: number;
  status: ContractStatus;
  compliance: number;
  onTimeDelivery: number;
  damageRate: number;
  claimRate: number;
  utilizationRate: number;
  savingsVsSpot: number;
  penaltyCount: number;
  terms: string;
  rateCards: RateCard[];
  amendments: Amendment[];
  paymentTerms: string;
  slaDeliveryDays: number;
  slaDamageLimit: number;
  penaltyClause: string;
  specialConditions: string;
}

// ─── Test Data ───────────────────────────────────────────────────────
const contracts: Contract[] = [
  {
    id: 'ct1', contractNumber: 'CTR-2025-001', carrier: 'CMA CGM', type: 'maritime',
    mainRoute: 'Alger → Marseille', startDate: '2025-01-15', endDate: '2026-01-14',
    annualValue: 15200000, status: 'actif', compliance: 94, onTimeDelivery: 92,
    damageRate: 0.8, claimRate: 1.2, utilizationRate: 78, savingsVsSpot: 18,
    penaltyCount: 2, terms: 'Contrat cadre annuel avec engagements de volume minimum 120 EVP/mois. Fréquence de départ hebdomadaire garantie.',
    rateCards: [
      { origin: 'Alger', destination: 'Marseille', ratePerKg: 45, ratePerContainer: 2850, ratePerKm: 0, transitTime: '3 jours' },
      { origin: 'Alger', destination: 'Barcelone', ratePerKg: 52, ratePerContainer: 3100, ratePerKm: 0, transitTime: '4 jours' },
      { origin: 'Alger', destination: 'Gênes', ratePerKg: 58, ratePerContainer: 3400, ratePerKm: 0, transitTime: '4 jours' },
    ],
    amendments: [
      { id: 'a1', date: '2025-06-01', description: 'Ajustement tarifaire +3% sur lignes méditerranéennes', author: 'Ahmed Benali' },
      { id: 'a2', date: '2025-09-15', description: 'Ajout ligne Alger → Gênes', author: 'Fatima Khelifi' },
    ],
    paymentTerms: 'Net 30 jours, escompte 2% pour paiement sous 10 jours', slaDeliveryDays: 5,
    slaDamageLimit: 1.5, penaltyClause: 'Pénalité de 5% par jour de retard au-delà du délai SLA', specialConditions: 'Assurance tous risques incluse pour marchandises de valeur > 50 000 DA',
  },
  {
    id: 'ct2', contractNumber: 'CTR-2025-002', carrier: 'MSC', type: 'maritime',
    mainRoute: 'Shanghai → Alger', startDate: '2025-03-01', endDate: '2026-02-28',
    annualValue: 14200000, status: 'actif', compliance: 90, onTimeDelivery: 88,
    damageRate: 1.1, claimRate: 1.8, utilizationRate: 82, savingsVsSpot: 15,
    penaltyCount: 4, terms: 'Contrat long-courrier avec volume minimum 80 EVP/mois. Transit time garanti 28 jours Shanghai-Alger.',
    rateCards: [
      { origin: 'Shanghai', destination: 'Alger', ratePerKg: 38, ratePerContainer: 4200, ratePerKm: 0, transitTime: '28 jours' },
      { origin: 'Shenzhen', destination: 'Alger', ratePerKg: 40, ratePerContainer: 4350, ratePerKm: 0, transitTime: '30 jours' },
    ],
    amendments: [
      { id: 'a3', date: '2025-07-20', description: 'Réduction volume minimum à 70 EVP/mois', author: 'Ahmed Benali' },
    ],
    paymentTerms: 'Net 45 jours', slaDeliveryDays: 32, slaDamageLimit: 2.0,
    penaltyClause: 'Pénalité de 3% par semaine de retard au-delà du transit time garanti', specialConditions: 'Surchauffement conteneur reefer : prise en charge intégrale',
  },
  {
    id: 'ct3', contractNumber: 'CTR-2025-003', carrier: 'Air Algérie Cargo', type: 'aerien',
    mainRoute: 'Alger → Paris CDG', startDate: '2025-04-01', endDate: '2025-09-30',
    annualValue: 4200000, status: 'expire', compliance: 75, onTimeDelivery: 75,
    damageRate: 2.5, claimRate: 3.1, utilizationRate: 65, savingsVsSpot: 8,
    penaltyCount: 7, terms: 'Contrat aérien saisonnier. Capacité réservée 5 tonnes/semaine. Priorité de booking 48h.',
    rateCards: [
      { origin: 'Alger', destination: 'Paris CDG', ratePerKg: 185, ratePerContainer: 0, ratePerKm: 0, transitTime: '4h30' },
      { origin: 'Alger', destination: 'Marseille', ratePerKg: 165, ratePerContainer: 0, ratePerKm: 0, transitTime: '3h45' },
    ],
    amendments: [],
    paymentTerms: 'Net 15 jours', slaDeliveryDays: 2, slaDamageLimit: 1.0,
    penaltyClause: 'Remboursement intégral en cas de perte, 50% en cas de retard >24h', specialConditions: 'Pas de marchandises dangereuses acceptées',
  },
  {
    id: 'ct4', contractNumber: 'CTR-2025-004', carrier: 'Turkish Airlines Cargo', type: 'aerien',
    mainRoute: 'Istanbul → Casablanca', startDate: '2025-06-01', endDate: '2026-05-31',
    annualValue: 6800000, status: 'actif', compliance: 91, onTimeDelivery: 89,
    damageRate: 0.9, claimRate: 1.4, utilizationRate: 72, savingsVsSpot: 22,
    penaltyCount: 1, terms: 'Contrat aérien annuel via hub Istanbul. Volume minimum 3 tonnes/semaine. Connexion vers 15 destinations.',
    rateCards: [
      { origin: 'Istanbul', destination: 'Casablanca', ratePerKg: 175, ratePerContainer: 0, ratePerKm: 0, transitTime: '5h' },
      { origin: 'Istanbul', destination: 'Alger', ratePerKg: 160, ratePerContainer: 0, ratePerKm: 0, transitTime: '4h' },
      { origin: 'Istanbul', destination: 'Dubaï', ratePerKg: 145, ratePerContainer: 0, ratePerKm: 0, transitTime: '4h30' },
    ],
    amendments: [
      { id: 'a4', date: '2025-10-01', description: 'Ajout destination Dubaï', author: 'Fatima Khelifi' },
    ],
    paymentTerms: 'Net 30 jours, garantie bancaire requise', slaDeliveryDays: 3,
    slaDamageLimit: 1.0, penaltyClause: 'Crédit fret gratuit sur prochain envoi en cas de retard >48h', specialConditions: 'Acceptation marchandises dangereuses classe 3-6 sous condition',
  },
  {
    id: 'ct5', contractNumber: 'CTR-2025-005', carrier: 'DHL Express', type: 'aerien',
    mainRoute: 'Alger → Monde entier', startDate: '2025-02-01', endDate: '2026-01-31',
    annualValue: 3200000, status: 'actif', compliance: 97, onTimeDelivery: 97,
    damageRate: 0.3, claimRate: 0.5, utilizationRate: 88, savingsVsSpot: 12,
    penaltyCount: 0, terms: 'Contrat express international. Livraison J+1 garantie vers 220 pays. Pas de volume minimum.',
    rateCards: [
      { origin: 'Alger', destination: 'Europe', ratePerKg: 420, ratePerContainer: 0, ratePerKm: 0, transitTime: '24h' },
      { origin: 'Alger', destination: 'Asie', ratePerKg: 580, ratePerContainer: 0, ratePerKm: 0, transitTime: '48h' },
      { origin: 'Alger', destination: 'Amériques', ratePerKg: 650, ratePerContainer: 0, ratePerKm: 0, transitTime: '48h' },
    ],
    amendments: [],
    paymentTerms: 'Net 15 jours, prélèvement automatique', slaDeliveryDays: 2,
    slaDamageLimit: 0.5, penaltyClause: 'Remboursement frais de transport + indemnité forfaitaire 100 DA/kg', specialConditions: 'Tracking en temps réel inclus, assurance ad valorem jusqu\'à 500 000 DA',
  },
  {
    id: 'ct6', contractNumber: 'CTR-2025-006', carrier: 'Trans-Afrique Logistics', type: 'terrestre',
    mainRoute: 'Casablanca → Dakar', startDate: '2025-05-01', endDate: '2026-04-30',
    annualValue: 6800000, status: 'actif', compliance: 82, onTimeDelivery: 82,
    damageRate: 1.8, claimRate: 2.2, utilizationRate: 70, savingsVsSpot: 25,
    penaltyCount: 3, terms: 'Contrat terrestre régional. Flotte dédiée 12 camions. Couverture Maghreb-Afrique de l\'Ouest.',
    rateCards: [
      { origin: 'Casablanca', destination: 'Dakar', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 1.8, transitTime: '3 jours' },
      { origin: 'Alger', destination: 'Tunis', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 1.5, transitTime: '12h' },
      { origin: 'Alger', destination: 'Annaba', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 1.2, transitTime: '7h' },
    ],
    amendments: [
      { id: 'a5', date: '2025-08-10', description: 'Ajustement tarif km +5% carburant', author: 'Ahmed Benali' },
    ],
    paymentTerms: 'Net 30 jours, acompte 20% à la commande', slaDeliveryDays: 4,
    slaDamageLimit: 2.5, penaltyClause: 'Pénalité 500 DA/heure de retard au-delà du délai convenu', specialConditions: 'Convoyage sécurité inclus pour transports > 5 tonnes',
  },
  {
    id: 'ct7', contractNumber: 'CTR-2025-007', carrier: 'SAGA Logistics', type: 'multimodal',
    mainRoute: 'Rotterdam → Alger (Mer+Route)', startDate: '2025-07-01', endDate: '2026-06-30',
    annualValue: 9500000, status: 'en_negociation', compliance: 86, onTimeDelivery: 86,
    damageRate: 1.3, claimRate: 1.6, utilizationRate: 0, savingsVsSpot: 20,
    penaltyCount: 0, terms: 'Contrat multimodal porte-à-porte. Pré-acheminement et post-acheminement inclus. Volume estimé 100 EVP/an.',
    rateCards: [
      { origin: 'Rotterdam', destination: 'Alger (porte-à-porte)', ratePerKg: 62, ratePerContainer: 5800, ratePerKm: 0, transitTime: '12 jours' },
    ],
    amendments: [],
    paymentTerms: 'En négociation', slaDeliveryDays: 15,
    slaDamageLimit: 1.5, penaltyClause: 'En négociation', specialConditions: 'Service douanier inclus, dédouanement express garanti 48h',
  },
  {
    id: 'ct8', contractNumber: 'CTR-2024-008', carrier: 'Hapag-Lloyd', type: 'maritime',
    mainRoute: 'Hambourg → Djeddah', startDate: '2024-06-01', endDate: '2025-05-31',
    annualValue: 11800000, status: 'resilie', compliance: 88, onTimeDelivery: 85,
    damageRate: 1.5, claimRate: 2.0, utilizationRate: 0, savingsVsSpot: 0,
    penaltyCount: 6, terms: 'Contrat résilié pour non-respect des SLA. 6 pénalités appliquées sur 12 mois.',
    rateCards: [
      { origin: 'Hambourg', destination: 'Djeddah', ratePerKg: 55, ratePerContainer: 3900, ratePerKm: 0, transitTime: '18 jours' },
    ],
    amendments: [
      { id: 'a6', date: '2024-12-01', description: 'Mise en demeure pour non-respect SLA', author: 'Ahmed Benali' },
      { id: 'a7', date: '2025-03-15', description: 'Résiliation du contrat', author: 'Direction' },
    ],
    paymentTerms: 'Résilié - litige en cours', slaDeliveryDays: 20,
    slaDamageLimit: 1.5, penaltyClause: 'Contrat résilié', specialConditions: 'Procédure judiciaire en cours pour recouvrement pénalités',
  },
  {
    id: 'ct9', contractNumber: 'CTR-2025-009', carrier: 'SNTV', type: 'terrestre',
    mainRoute: 'Alger → Oran', startDate: '2025-08-01', endDate: '2025-07-31',
    annualValue: 4500000, status: 'en_negociation', compliance: 70, onTimeDelivery: 70,
    damageRate: 2.8, claimRate: 3.5, utilizationRate: 0, savingsVsSpot: 30,
    penaltyCount: 0, terms: 'Contrat terrestre national en cours de négociation. Réseau couverture 48 wilayas.',
    rateCards: [
      { origin: 'Alger', destination: 'Oran', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 0.9, transitTime: '8h' },
      { origin: 'Alger', destination: 'Constantine', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 0.8, transitTime: '6h' },
    ],
    amendments: [],
    paymentTerms: 'En négociation - proposition Net 45 jours', slaDeliveryDays: 1,
    slaDamageLimit: 3.0, penaltyClause: 'En négociation', specialConditions: 'Demande subvention étatique pour transport produits de première nécessité',
  },
  {
    id: 'ct10', contractNumber: 'CTR-2025-010', carrier: 'Emirates SkyCargo', type: 'aerien',
    mainRoute: 'Dubaï → Alger', startDate: '2025-09-01', endDate: '2026-08-31',
    annualValue: 8900000, status: 'actif', compliance: 95, onTimeDelivery: 95,
    damageRate: 0.4, claimRate: 0.7, utilizationRate: 85, savingsVsSpot: 28,
    penaltyCount: 0, terms: 'Contrat premium via hub Dubaï. Capacité garantie 8 tonnes/semaine. Accès lounge cargo prioritaire.',
    rateCards: [
      { origin: 'Dubaï', destination: 'Alger', ratePerKg: 195, ratePerContainer: 0, ratePerKm: 0, transitTime: '6h' },
      { origin: 'Dubaï', destination: 'Casablanca', ratePerKg: 210, ratePerContainer: 0, ratePerKm: 0, transitTime: '7h' },
      { origin: 'Dubaï', destination: 'Tunis', ratePerKg: 200, ratePerContainer: 0, ratePerKm: 0, transitTime: '6h30' },
    ],
    amendments: [],
    paymentTerms: 'Net 30 jours, L/C irrevocable', slaDeliveryDays: 2,
    slaDamageLimit: 0.5, penaltyClause: 'Indemnité forfaitaire 200 DA/kg en cas de dommage', specialConditions: 'Marchandises périssables acceptées avec chambre froide dédiée',
  },
  {
    id: 'ct11', contractNumber: 'CTR-2025-011', carrier: 'Maersk Line', type: 'maritime',
    mainRoute: 'Alger → Rotterdam', startDate: '2025-02-01', endDate: '2026-01-31',
    annualValue: 18500000, status: 'actif', compliance: 89, onTimeDelivery: 88,
    damageRate: 0.9, claimRate: 1.3, utilizationRate: 80, savingsVsSpot: 16,
    penaltyCount: 2, terms: 'Contrat cadre annuel. Volume minimum 150 EVP/mois. Départ bi-hebdomadaire garanti.',
    rateCards: [
      { origin: 'Alger', destination: 'Rotterdam', ratePerKg: 50, ratePerContainer: 3200, ratePerKm: 0, transitTime: '5 jours' },
      { origin: 'Alger', destination: 'Hambourg', ratePerKg: 55, ratePerContainer: 3500, ratePerKm: 0, transitTime: '6 jours' },
    ],
    amendments: [
      { id: 'a8', date: '2025-11-01', description: 'Renouvellement anticipé avec reduction 2%', author: 'Ahmed Benali' },
    ],
    paymentTerms: 'Net 30 jours', slaDeliveryDays: 7,
    slaDamageLimit: 1.5, penaltyClause: 'Pénalité de 4% par jour de retard au-delà SLA', specialConditions: 'Conteneurs reefer disponibles sur demande 48h avant départ',
  },
];

// ─── Mappings ────────────────────────────────────────────────────────
const typeLabels: Record<ContractType, string> = {
  maritime: 'Maritime', aerien: 'Aérien', terrestre: 'Terrestre', multimodal: 'Multimodal',
};
const typeIcons: Record<ContractType, React.ElementType> = {
  maritime: Ship, aerien: Plane, terrestre: Truck, multimodal: ArrowRightLeft,
};
const typeBadgeColors: Record<ContractType, string> = {
  maritime: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  aerien: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  terrestre: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  multimodal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};
const typeGradients: Record<ContractType, string> = {
  maritime: 'from-blue-500 to-blue-600', aerien: 'from-orange-500 to-orange-600',
  terrestre: 'from-green-500 to-green-600', multimodal: 'from-purple-500 to-purple-600',
};

const statusLabels: Record<ContractStatus, string> = {
  actif: 'Actif', en_negociation: 'En négociation', expire: 'Expiré', resilie: 'Résilié',
};
const statusColors: Record<ContractStatus, string> = {
  actif: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_negociation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  expire: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  resilie: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};
const calendarStatusColors: Record<ContractStatus, string> = {
  actif: '#22c55e', en_negociation: '#f59e0b', expire: '#ef4444', resilie: '#6b7280',
};

const tooltipStyle = {
  backgroundColor: 'var(--popover)', border: '1px solid var(--border)',
  borderRadius: '8px', fontSize: '12px',
};

// ─── Helpers ─────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M DA`;
  return val.toLocaleString('fr-FR') + ' DA';
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Chart Data ──────────────────────────────────────────────────────
const performanceChartData = contracts
  .filter(c => c.status === 'actif')
  .map(c => ({
    name: c.carrier.length > 10 ? c.carrier.substring(0, 10) + '…' : c.carrier,
    ponctualite: c.onTimeDelivery,
    conformite: c.compliance,
    tauxAvarie: c.damageRate * 10,
  }));

const rateTrendData = [
  { month: 'Jan', maritime: 2850, aerien: 185, terrestre: 1.5 },
  { month: 'Fév', maritime: 2900, aerien: 190, terrestre: 1.55 },
  { month: 'Mar', maritime: 2950, aerien: 188, terrestre: 1.6 },
  { month: 'Avr', maritime: 3000, aerien: 192, terrestre: 1.65 },
  { month: 'Mai', maritime: 3100, aerien: 195, terrestre: 1.7 },
  { month: 'Jun', maritime: 3050, aerien: 200, terrestre: 1.68 },
  { month: 'Jul', maritime: 3200, aerien: 210, terrestre: 1.75 },
  { month: 'Aoû', maritime: 3150, aerien: 205, terrestre: 1.72 },
  { month: 'Sep', maritime: 3300, aerien: 198, terrestre: 1.8 },
  { month: 'Oct', maritime: 3250, aerien: 195, terrestre: 1.78 },
  { month: 'Nov', maritime: 3350, aerien: 202, terrestre: 1.82 },
  { month: 'Déc', maritime: 3400, aerien: 210, terrestre: 1.85 },
];

const radarData = [
  { subject: 'Ponctualité', CMA_CGM: 92, MSC: 88, DHL: 97, Emirates: 95 },
  { subject: 'Conformité', CMA_CGM: 94, MSC: 90, DHL: 97, Emirates: 95 },
  { subject: 'Coût', CMA_CGM: 70, MSC: 75, DHL: 50, Emirates: 60 },
  { subject: 'Fiabilité', CMA_CGM: 85, MSC: 82, DHL: 95, Emirates: 92 },
  { subject: 'Service', CMA_CGM: 80, MSC: 78, DHL: 98, Emirates: 90 },
  { subject: 'Couverture', CMA_CGM: 85, MSC: 88, DHL: 99, Emirates: 75 },
];

// ─── Component ───────────────────────────────────────────────────────
export default function ContractsPage() {
  const [data, setData] = useState<Contract[]>(contracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('contracts');

  const [newContract, setNewContract] = useState({
    carrier: '', type: 'maritime' as ContractType, startDate: '', endDate: '',
    annualValue: 0, terms: '', paymentTerms: 'Net 30 jours', slaDeliveryDays: 5,
    slaDamageLimit: 1.5, penaltyClause: '', specialConditions: '',
  });
  const [newRateCards, setNewRateCards] = useState<RateCard[]>([
    { origin: '', destination: '', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 0, transitTime: '' },
  ]);

  // ─── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const active = data.filter(c => c.status === 'actif');
    const negotiating = data.filter(c => c.status === 'en_negociation');
    const expiring = data.filter(c => c.status === 'actif' && daysUntil(c.endDate) > 0 && daysUntil(c.endDate) <= 30);
    const totalValue = active.reduce((s, c) => s + c.annualValue, 0);
    const avgCompliance = active.length > 0 ? Math.round(active.reduce((s, c) => s + c.compliance, 0) / active.length) : 0;
    return { activeCount: active.length, negotiatingCount: negotiating.length, expiringCount: expiring.length, totalValue, avgCompliance };
  }, [data]);

  // ─── Filtered data ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...data];
    if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
    if (filterType !== 'all') result = result.filter(c => c.type === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.contractNumber.toLowerCase().includes(q) || c.carrier.toLowerCase().includes(q));
    }
    return result;
  }, [data, filterStatus, filterType, searchQuery]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleViewDetail = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailDialog(true);
  };

  const handleAddContract = () => {
    const contract: Contract = {
      id: `ct${data.length + 1}`,
      contractNumber: `CTR-2025-${String(data.length + 1).padStart(3, '0')}`,
      carrier: newContract.carrier,
      type: newContract.type,
      mainRoute: newRateCards[0]?.origin && newRateCards[0]?.destination ? `${newRateCards[0].origin} → ${newRateCards[0].destination}` : 'À définir',
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      annualValue: newContract.annualValue,
      status: 'en_negociation',
      compliance: 0, onTimeDelivery: 0, damageRate: 0, claimRate: 0,
      utilizationRate: 0, savingsVsSpot: 0, penaltyCount: 0,
      terms: newContract.terms,
      rateCards: newRateCards.filter(r => r.origin && r.destination),
      amendments: [],
      paymentTerms: newContract.paymentTerms,
      slaDeliveryDays: newContract.slaDeliveryDays,
      slaDamageLimit: newContract.slaDamageLimit,
      penaltyClause: newContract.penaltyClause,
      specialConditions: newContract.specialConditions,
    };
    setData([contract, ...data]);
    setShowNewDialog(false);
    setNewContract({ carrier: '', type: 'maritime', startDate: '', endDate: '', annualValue: 0, terms: '', paymentTerms: 'Net 30 jours', slaDeliveryDays: 5, slaDamageLimit: 1.5, penaltyClause: '', specialConditions: '' });
    setNewRateCards([{ origin: '', destination: '', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 0, transitTime: '' }]);
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const compareContracts = useMemo(() => data.filter(c => compareIds.includes(c.id)), [data, compareIds]);

  // ─── Calendar data ────────────────────────────────────────────────
  const calendarEvents = useMemo(() => {
    return data.map(c => ({
      id: c.id,
      title: `${c.carrier} - ${c.contractNumber}`,
      start: new Date(c.startDate),
      end: new Date(c.endDate),
      status: c.status,
      daysLeft: daysUntil(c.endDate),
    }));
  }, [data]);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-teal-500" />
            Contrats Transporteurs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez vos contrats, tarifs et performances transporteurs
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {compareIds.length > 0 && (
            <Button size="sm" variant="outline" className="text-xs border-teal-500 text-teal-600" onClick={() => setShowCompareDialog(true)}>
              <BarChart3 className="w-4 h-4 mr-1" />
              Comparer ({compareIds.length})
            </Button>
          )}
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowNewDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouveau contrat
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { title: 'Contrats actifs', value: kpis.activeCount, icon: CheckCircle2, gradient: 'from-teal-500 to-teal-600' },
          { title: 'En négociation', value: kpis.negotiatingCount, icon: Clock, gradient: 'from-yellow-500 to-yellow-600' },
          { title: 'Expirent bientôt', value: kpis.expiringCount, icon: AlertTriangle, gradient: 'from-orange-500 to-orange-600' },
          { title: 'Valeur totale', value: formatCurrency(kpis.totalValue), icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
          { title: 'Taux conformité', value: `${kpis.avgCompliance}%`, icon: TrendingUp, gradient: 'from-cyan-500 to-cyan-600' },
        ].map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">{card.title}</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="contracts" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <FileSignature className="w-4 h-4 mr-1" />Contrats
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Calendar className="w-4 h-4 mr-1" />Calendrier
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 mr-1" />Performance
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <TrendingUp className="w-4 h-4 mr-1" />Comparatif
          </TabsTrigger>
        </TabsList>

        {/* ─── Contracts Tab ─────────────────────────────────────── */}
        <TabsContent value="contracts" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Rechercher par n° contrat ou transporteur..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="en_negociation">En négociation</SelectItem>
                    <SelectItem value="expire">Expiré</SelectItem>
                    <SelectItem value="resilie">Résilié</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="maritime">Maritime</SelectItem>
                    <SelectItem value="aerien">Aérien</SelectItem>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                    <SelectItem value="multimodal">Multimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-8"></TableHead>
                      <TableHead className="text-xs">N° Contrat</TableHead>
                      <TableHead className="text-xs">Transporteur</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Route principale</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Début</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Fin</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Valeur annuelle</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Conformité</TableHead>
                      <TableHead className="text-xs w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={11} className="text-center py-8 text-gray-500">Aucun contrat trouvé</TableCell></TableRow>
                    ) : (
                      filtered.map(contract => {
                        const TypeIcon = typeIcons[contract.type];
                        return (
                          <TableRow key={contract.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" onClick={() => handleViewDetail(contract)}>
                            <TableCell>
                              <input type="checkbox" checked={compareIds.includes(contract.id)} onChange={() => toggleCompare(contract.id)}
                                onClick={e => e.stopPropagation()} className="w-4 h-4 accent-teal-500" />
                            </TableCell>
                            <TableCell className="text-xs font-mono font-medium">{contract.contractNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${typeGradients[contract.type]} flex items-center justify-center text-white text-[10px] font-bold`}>
                                  {contract.carrier.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                </div>
                                <span className="text-sm font-medium">{contract.carrier}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${typeBadgeColors[contract.type]}`}>
                                <TypeIcon className="w-3 h-3 mr-1" />{typeLabels[contract.type]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs hidden md:table-cell max-w-[160px] truncate">{contract.mainRoute}</TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">{formatDate(contract.startDate)}</TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">
                              <span className={contract.status === 'actif' && daysUntil(contract.endDate) <= 30 && daysUntil(contract.endDate) > 0 ? 'text-orange-600 font-medium' : ''}>
                                {formatDate(contract.endDate)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-medium hidden lg:table-cell">{formatCurrency(contract.annualValue)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[contract.status]}`}>
                                {statusLabels[contract.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <div className="flex items-center gap-2">
                                <Progress value={contract.compliance} className="w-16 h-2" />
                                <span className="text-xs font-medium">{contract.compliance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={e => { e.stopPropagation(); handleViewDetail(contract); }}>
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={e => e.stopPropagation()}>
                                  <Download className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Calendar Tab ──────────────────────────────────────── */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" />
                Calendrier des contrats
              </CardTitle>
              <CardDescription>Timeline visuelle des contrats — code couleur par statut</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" />Actif</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500" />En négociation</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" />Expiré</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400" />Résilié</span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {calendarEvents
                  .sort((a, b) => b.start.getTime() - a.start.getTime())
                  .map(ev => {
                    const barWidth = Math.max(10, Math.min(100, ((ev.end.getTime() - ev.start.getTime()) / (365 * 24 * 60 * 60 * 1000)) * 100));
                    const startOffset = Math.max(0, Math.min(100, ((ev.start.getTime() - new Date('2024-01-01').getTime()) / (3 * 365 * 24 * 60 * 60 * 1000)) * 100));
                    return (
                      <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => handleViewDetail(data.find(c => c.id === ev.id)!)}>
                        <span className="text-xs font-mono w-28 flex-shrink-0 truncate">{ev.title.split(' - ')[1]}</span>
                        <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded relative overflow-hidden">
                          <div className="absolute top-0 h-full rounded flex items-center px-2 text-[10px] text-white font-medium"
                            style={{ left: `${startOffset}%`, width: `${barWidth}%`, backgroundColor: calendarStatusColors[ev.status] }}>
                            {ev.title.split(' - ')[0]}
                          </div>
                          <div className="absolute top-0 h-full w-0.5 bg-gray-900 dark:bg-white z-10" style={{ left: `${((Date.now() - new Date('2024-01-01').getTime()) / (3 * 365 * 24 * 60 * 60 * 1000)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-24 text-right flex-shrink-0">
                          {ev.daysLeft > 0 ? `${ev.daysLeft}j restants` : ev.daysLeft === 0 ? "Dernier jour" : 'Expiré'}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Performance Tab ───────────────────────────────────── */}
        <TabsContent value="performance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-500" />
                  Performance transporteurs actifs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceChartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} angle={-25} textAnchor="end" height={55} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="ponctualite" name="Ponctualité %" fill="#0d9488" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="conformite" name="Conformité %" fill="#059669" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  Comparaison multidimensionnelle
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                      <PolarRadiusAxis tick={{ fontSize: 9 }} />
                      <Radar name="CMA CGM" dataKey="CMA_CGM" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} />
                      <Radar name="DHL" dataKey="DHL" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                      <Radar name="Emirates" dataKey="Emirates" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Utilization & Penalties */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" />
                  Taux d&apos;utilisation & pénalités
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {data.filter(c => c.status === 'actif').map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${typeGradients[c.type]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                        {c.carrier.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.carrier}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={c.utilizationRate} className="flex-1 h-2" />
                          <span className="text-[10px] text-gray-500 w-8">{c.utilizationRate}%</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-medium ${c.penaltyCount === 0 ? 'text-green-600' : c.penaltyCount <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {c.penaltyCount} pénalité{c.penaltyCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Savings vs Spot */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-500" />
                  Économies vs marché spot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {data.filter(c => c.status === 'actif' && c.savingsVsSpot > 0).sort((a, b) => b.savingsVsSpot - a.savingsVsSpot).map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${typeGradients[c.type]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                        {c.carrier.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.carrier}</p>
                        <p className="text-[10px] text-gray-500">{c.mainRoute}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-600">-{c.savingsVsSpot}%</span>
                        <p className="text-[10px] text-gray-500">vs spot</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Rate Comparison Tab ────────────────────────────────── */}
        <TabsContent value="comparison" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                Tendances des tarifs
              </CardTitle>
              <CardDescription>Évolution des tarifs par mode de transport (2025)</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateTrendData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="maritime" name="Maritime (DA/EVP)" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="aerien" name="Aérien (DA/kg)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="terrestre" name="Terrestre (DA/km)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-500" />
                Comparaison des tarifs transporteurs
              </CardTitle>
              <CardDescription>
                Sélectionnez des contrats dans le tableau pour comparer (max 4)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {compareContracts.length < 2 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Cochez au moins 2 contrats dans l&apos;onglet Contrats pour comparer</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Critère</TableHead>
                        {compareContracts.map(c => (
                          <TableHead key={c.id} className="text-xs text-center">{c.carrier}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Type</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center"><Badge variant="secondary" className={`text-[10px] ${typeBadgeColors[c.type]}`}>{typeLabels[c.type]}</Badge></TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Valeur annuelle</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center font-medium">{formatCurrency(c.annualValue)}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Ponctualité</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center"><span className={c.onTimeDelivery >= 90 ? 'text-green-600' : c.onTimeDelivery >= 80 ? 'text-yellow-600' : 'text-red-600'}>{c.onTimeDelivery}%</span></TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Taux d&apos;avarie</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center">{c.damageRate}%</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Conformité</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center">{c.compliance}%</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Économie vs spot</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center text-emerald-600 font-medium">-{c.savingsVsSpot}%</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Pénalités SLA</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center">{c.penaltyCount}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium">Utilisation</TableCell>
                        {compareContracts.map(c => <TableCell key={c.id} className="text-xs text-center">{c.utilizationRate}%</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-medium bg-teal-50 dark:bg-teal-900/20 font-semibold">Recommandation</TableCell>
                        {compareContracts.map(c => {
                          const score = c.onTimeDelivery * 0.3 + c.compliance * 0.2 + c.savingsVsSpot * 0.3 + (100 - c.damageRate * 10) * 0.2;
                          return (
                            <TableCell key={c.id} className="text-xs text-center bg-teal-50 dark:bg-teal-900/20">
                              <span className="font-bold text-teal-600">{score.toFixed(0)}/100</span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Contract Detail Dialog ──────────────────────────────── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-teal-500" />
              Détails du contrat
            </DialogTitle>
            <DialogDescription>Informations complètes et historique du contrat</DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeGradients[selectedContract.type]} flex items-center justify-center text-white text-sm font-bold`}>
                  {selectedContract.carrier.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedContract.contractNumber}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedContract.carrier}</p>
                </div>
                <Badge variant="secondary" className={`text-xs ${statusColors[selectedContract.status]}`}>{statusLabels[selectedContract.status]}</Badge>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-lg font-bold text-teal-600">{formatCurrency(selectedContract.annualValue)}</p>
                  <p className="text-[10px] text-gray-500">Valeur annuelle</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className={`text-lg font-bold ${selectedContract.onTimeDelivery >= 90 ? 'text-green-600' : selectedContract.onTimeDelivery >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {selectedContract.onTimeDelivery}%
                  </p>
                  <p className="text-[10px] text-gray-500">Ponctualité</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-lg font-bold text-emerald-600">-{selectedContract.savingsVsSpot}%</p>
                  <p className="text-[10px] text-gray-500">Économie vs spot</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedContract.compliance}%</p>
                  <p className="text-[10px] text-gray-500">Conformité</p>
                </div>
              </div>

              <Separator />

              {/* Terms */}
              <div>
                <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                  <FileSignature className="w-4 h-4 text-gray-400" />Conditions générales
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{selectedContract.terms}</p>
              </div>

              {/* Dates & Route */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-gray-500">Route :</span><p className="font-medium">{selectedContract.mainRoute}</p></div>
                <div><span className="text-gray-500">Début :</span><p className="font-medium">{formatDate(selectedContract.startDate)}</p></div>
                <div><span className="text-gray-500">Fin :</span>
                  <p className={`font-medium ${selectedContract.status === 'actif' && daysUntil(selectedContract.endDate) <= 30 && daysUntil(selectedContract.endDate) > 0 ? 'text-orange-600' : ''}`}>
                    {formatDate(selectedContract.endDate)}
                    {selectedContract.status === 'actif' && daysUntil(selectedContract.endDate) > 0 && (
                      <span className="text-gray-400 ml-1">({daysUntil(selectedContract.endDate)}j)</span>
                    )}
                  </p>
                </div>
                <div><span className="text-gray-500">Paiement :</span><p className="font-medium">{selectedContract.paymentTerms}</p></div>
                <div><span className="text-gray-500">SLA livraison :</span><p className="font-medium">{selectedContract.slaDeliveryDays} jours</p></div>
                <div><span className="text-gray-500">Limite avarie :</span><p className="font-medium">{selectedContract.slaDamageLimit}%</p></div>
              </div>

              <Separator />

              {/* Rate Schedule */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gray-400" />Grille tarifaire
                </h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Origine</TableHead>
                        <TableHead className="text-xs">Destination</TableHead>
                        <TableHead className="text-xs">Tarif/kg</TableHead>
                        <TableHead className="text-xs">Tarif/EVP</TableHead>
                        <TableHead className="text-xs">Tarif/km</TableHead>
                        <TableHead className="text-xs">Transit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedContract.rateCards.map((rc, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{rc.origin}</TableCell>
                          <TableCell className="text-xs">{rc.destination}</TableCell>
                          <TableCell className="text-xs font-medium">{rc.ratePerKg > 0 ? `${rc.ratePerKg.toLocaleString('fr-FR')} DA` : '—'}</TableCell>
                          <TableCell className="text-xs font-medium">{rc.ratePerContainer > 0 ? `${rc.ratePerContainer.toLocaleString('fr-FR')} DA` : '—'}</TableCell>
                          <TableCell className="text-xs font-medium">{rc.ratePerKm > 0 ? `${rc.ratePerKm.toLocaleString('fr-FR')} DA` : '—'}</TableCell>
                          <TableCell className="text-xs">{rc.transitTime}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-gray-400" />Métriques de performance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Ponctualité</span><span className="font-medium">{selectedContract.onTimeDelivery}%</span></div>
                    <Progress value={selectedContract.onTimeDelivery} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Conformité</span><span className="font-medium">{selectedContract.compliance}%</span></div>
                    <Progress value={selectedContract.compliance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Taux d&apos;avarie</span><span className="font-medium">{selectedContract.damageRate}%</span></div>
                    <Progress value={Math.min(100, selectedContract.damageRate * 10)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Taux de réclamation</span><span className="font-medium">{selectedContract.claimRate}%</span></div>
                    <Progress value={Math.min(100, selectedContract.claimRate * 10)} className="h-2" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amendment History */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />Historique des avenants
                </h4>
                {selectedContract.amendments.length === 0 ? (
                  <p className="text-xs text-gray-500">Aucun avenant enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {selectedContract.amendments.map(am => (
                      <div key={am.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Edit className="w-3 h-3 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{am.description}</p>
                          <p className="text-[10px] text-gray-500">{formatDate(am.date)} — {am.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special conditions */}
              {selectedContract.specialConditions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5">Conditions spéciales</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{selectedContract.specialConditions}</p>
                  </div>
                </>
              )}

              {/* Penalty clause */}
              {selectedContract.penaltyClause && (
                <div>
                  <h4 className="text-sm font-semibold mb-1.5">Clause de pénalité</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{selectedContract.penaltyClause}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedContract.status === 'actif' && daysUntil(selectedContract.endDate) <= 90 && (
                  <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                    <RefreshCw className="w-4 h-4 mr-1" />Renouveler
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-xs">
                  <Edit className="w-4 h-4 mr-1" />Modifier
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Download className="w-4 h-4 mr-1" />Télécharger PDF
                </Button>
                {selectedContract.status === 'actif' && (
                  <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 mr-1" />Résilier
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── New Contract Dialog ──────────────────────────────────── */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau contrat</DialogTitle>
            <DialogDescription>Créer un nouveau contrat transporteur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Transporteur</Label>
                <Select value={newContract.carrier} onValueChange={v => setNewContract({ ...newContract, carrier: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {['CMA CGM', 'MSC', 'Maersk Line', 'Air Algérie Cargo', 'Turkish Airlines Cargo', 'Emirates SkyCargo', 'DHL Express', 'Trans-Afrique Logistics', 'SAGA Logistics', 'SNTV', 'Hapag-Lloyd'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type de contrat</Label>
                <Select value={newContract.type} onValueChange={v => setNewContract({ ...newContract, type: v as ContractType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maritime">Maritime</SelectItem>
                    <SelectItem value="aerien">Aérien</SelectItem>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                    <SelectItem value="multimodal">Multimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Date de début</Label>
                <Input type="date" value={newContract.startDate} onChange={e => setNewContract({ ...newContract, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date de fin</Label>
                <Input type="date" value={newContract.endDate} onChange={e => setNewContract({ ...newContract, endDate: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Valeur annuelle (DA)</Label>
                <Input type="number" value={newContract.annualValue || ''} onChange={e => setNewContract({ ...newContract, annualValue: Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Conditions de paiement</Label>
                <Select value={newContract.paymentTerms} onValueChange={v => setNewContract({ ...newContract, paymentTerms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15 jours">Net 15 jours</SelectItem>
                    <SelectItem value="Net 30 jours">Net 30 jours</SelectItem>
                    <SelectItem value="Net 45 jours">Net 45 jours</SelectItem>
                    <SelectItem value="Net 60 jours">Net 60 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Rate Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">Grille tarifaire</Label>
                <Button size="sm" variant="outline" className="text-[10px] h-7"
                  onClick={() => setNewRateCards([...newRateCards, { origin: '', destination: '', ratePerKg: 0, ratePerContainer: 0, ratePerKm: 0, transitTime: '' }])}>
                  <Plus className="w-3 h-3 mr-1" />Ajouter route
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newRateCards.map((rc, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1.5 items-end">
                    <div><Label className="text-[10px]">Origine</Label><Input className="h-7 text-xs" value={rc.origin} onChange={e => { const u = [...newRateCards]; u[i] = { ...u[i], origin: e.target.value }; setNewRateCards(u); }} /></div>
                    <div><Label className="text-[10px]">Destination</Label><Input className="h-7 text-xs" value={rc.destination} onChange={e => { const u = [...newRateCards]; u[i] = { ...u[i], destination: e.target.value }; setNewRateCards(u); }} /></div>
                    <div><Label className="text-[10px]">Tarif/kg</Label><Input type="number" className="h-7 text-xs" value={rc.ratePerKg || ''} onChange={e => { const u = [...newRateCards]; u[i] = { ...u[i], ratePerKg: Number(e.target.value) }; setNewRateCards(u); }} /></div>
                    <div><Label className="text-[10px]">Transit</Label><Input className="h-7 text-xs" value={rc.transitTime} onChange={e => { const u = [...newRateCards]; u[i] = { ...u[i], transitTime: e.target.value }; setNewRateCards(u); }} /></div>
                    <div>{newRateCards.length > 1 && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => setNewRateCards(newRateCards.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></Button>
                    )}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* SLA Terms */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">Conditions SLA</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px]">Délai livraison (jours)</Label>
                  <Input type="number" className="h-7 text-xs" value={newContract.slaDeliveryDays} onChange={e => setNewContract({ ...newContract, slaDeliveryDays: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">Limite avarie (%)</Label>
                  <Input type="number" step="0.1" className="h-7 text-xs" value={newContract.slaDamageLimit} onChange={e => setNewContract({ ...newContract, slaDamageLimit: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Clause de pénalité</Label>
              <Input value={newContract.penaltyClause} onChange={e => setNewContract({ ...newContract, penaltyClause: e.target.value })} placeholder="Ex: Pénalité 5% par jour de retard" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Conditions spéciales</Label>
              <Input value={newContract.specialConditions} onChange={e => setNewContract({ ...newContract, specialConditions: e.target.value })} placeholder="Conditions particulières..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button onClick={handleAddContract} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Créer le contrat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Rate Comparison Dialog ─────────────────────────────── */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              Comparaison des contrats
            </DialogTitle>
            <DialogDescription>Analyse comparative côte à côte</DialogDescription>
          </DialogHeader>
          {compareContracts.length >= 2 && (
            <div className="space-y-4">
              {/* Visual comparison chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareContracts.map(c => ({
                    name: c.carrier.length > 10 ? c.carrier.substring(0, 10) + '…' : c.carrier,
                    ponctualite: c.onTimeDelivery,
                    conformite: c.compliance,
                    economie: c.savingsVsSpot * 3,
                  }))} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="ponctualite" name="Ponctualité" fill="#0d9488" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="conformite" name="Conformité" fill="#059669" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="economie" name="Économie (x3)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rate comparison table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Route</TableHead>
                      {compareContracts.map(c => <TableHead key={c.id} className="text-xs text-center">{c.carrier}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const allRoutes = new Set<string>();
                      compareContracts.forEach(c => c.rateCards.forEach(rc => allRoutes.add(`${rc.origin}→${rc.destination}`)));
                      return Array.from(allRoutes).map(route => (
                        <TableRow key={route}>
                          <TableCell className="text-xs font-medium">{route}</TableCell>
                          {compareContracts.map(c => {
                            const rc = c.rateCards.find(r => `${r.origin}→${r.destination}` === route);
                            return (
                              <TableCell key={c.id} className="text-xs text-center">
                                {rc ? (rc.ratePerKg > 0 ? `${rc.ratePerKg} DA/kg` : rc.ratePerContainer > 0 ? `${rc.ratePerContainer} DA/EVP` : rc.ratePerKm > 0 ? `${rc.ratePerKm} DA/km` : '—') : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>

              {/* Best recommendation */}
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">Recommandation</p>
                {(() => {
                  const best = compareContracts.reduce((prev, curr) => {
                    const ps = prev.onTimeDelivery * 0.3 + prev.compliance * 0.2 + prev.savingsVsSpot * 0.3 + (100 - prev.damageRate * 10) * 0.2;
                    const cs = curr.onTimeDelivery * 0.3 + curr.compliance * 0.2 + curr.savingsVsSpot * 0.3 + (100 - curr.damageRate * 10) * 0.2;
                    return cs > ps ? curr : prev;
                  });
                  return <p className="text-xs text-teal-600 dark:text-teal-300"><strong>{best.carrier}</strong> offre le meilleur rapport coût/performance avec un score de {((best.onTimeDelivery * 0.3 + best.compliance * 0.2 + best.savingsVsSpot * 0.3 + (100 - best.damageRate * 10) * 0.2)).toFixed(0)}/100.</p>;
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
