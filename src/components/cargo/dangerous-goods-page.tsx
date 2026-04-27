'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  Plane,
  Ship,
  Truck,
  Package,
  Shield,
  FileText,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertOctagon,
  CircleDot,
  Skull,
  Bomb,
  CloudLightning,
  Droplets,
  Beaker,
  Battery,
  Wind,
  ChevronDown,
  GraduationCap,
  Award,
  CalendarDays,
  Users,
  Info,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useCargoStore } from '@/lib/cargo-store';

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA — All inline, self-contained
// ═══════════════════════════════════════════════════════════════════

// ─── UN Classification Data ──────────────────────────────────────

type DGClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type PackingGroup = 'I' | 'II' | 'III' | '-';

interface UNEntry {
  unCode: string;
  properShippingName: string;
  dgClass: DGClass;
  subclass?: string;
  packingGroup: PackingGroup;
  air: boolean;
  ground: boolean;
  maritime: boolean;
  parcel: boolean;
}

const unClassifications: UNEntry[] = [
  // Classe 1 — Explosifs
  { unCode: 'UN0012', properShippingName: 'Cartouches à blanc', dgClass: 1, subclass: '1.4S', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN0014', properShippingName: 'Cartouches pour armes, avec charge de percussion', dgClass: 1, subclass: '1.4S', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN0027', properShippingName: 'Poudre noire (poudre à canon)', dgClass: 1, subclass: '1.1D', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN0042', properShippingName: 'Détonateurs pour munitions', dgClass: 1, subclass: '1.1B', packingGroup: '-', air: false, ground: true, maritime: false, parcel: false },
  // Classe 2 — Gaz
  { unCode: 'UN1005', properShippingName: 'Ammoniac, solution aqueuse', dgClass: 2, subclass: '2.3', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1013', properShippingName: 'Dioxyde de carbone', dgClass: 2, subclass: '2.2', packingGroup: '-', air: true, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1046', properShippingName: 'Hélium, comprimé', dgClass: 2, subclass: '2.2', packingGroup: '-', air: true, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1950', properShippingName: 'Aérosols', dgClass: 2, subclass: '2.1', packingGroup: '-', air: true, ground: true, maritime: true, parcel: true },
  { unCode: 'UN2037', properShippingName: 'Cartouches à gaz', dgClass: 2, subclass: '2.1', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  // Classe 3 — Liquides inflammables
  { unCode: 'UN1263', properShippingName: 'Peinture', dgClass: 3, packingGroup: 'III', air: true, ground: true, maritime: true, parcel: true },
  { unCode: 'UN1866', properShippingName: 'Résine, solution inflammable', dgClass: 3, packingGroup: 'III', air: true, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1993', properShippingName: 'Liquide inflammable, n.s.a.', dgClass: 3, packingGroup: 'II', air: true, ground: true, maritime: true, parcel: false },
  { unCode: 'UN3065', properShippingName: 'Boissons alcoolisées', dgClass: 3, packingGroup: 'III', air: true, ground: true, maritime: true, parcel: true },
  // Classe 4 — Solides inflammables
  { unCode: 'UN3175', properShippingName: 'Solide inflammable contenant un liquide inflammable', dgClass: 4, subclass: '4.1', packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1325', properShippingName: 'Solide inflammable, organique, n.s.a.', dgClass: 4, subclass: '4.1', packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1361', properShippingName: 'Charbon de bois', dgClass: 4, subclass: '4.2', packingGroup: 'III', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN2002', properShippingName: 'Phénol, fondu', dgClass: 4, subclass: '4.2', packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  // Classe 5 — Oxydants et peroxydes
  { unCode: 'UN2015', properShippingName: 'Peroxyde d\'hydrogène, en solution', dgClass: 5, subclass: '5.1', packingGroup: 'I', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1748', properShippingName: 'Hypochlorite de calcium, sec', dgClass: 5, subclass: '5.1', packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN3102', properShippingName: 'Peroxyde organique, type B', dgClass: 5, subclass: '5.2', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  // Classe 6 — Toxiques et infectieux
  { unCode: 'UN1239', properShippingName: 'Chlorure de méthyle', dgClass: 6, subclass: '6.1', packingGroup: 'I', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1671', properShippingName: 'Phénol', dgClass: 6, subclass: '6.1', packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN2814', properShippingName: 'Substance infectieuse pour l\'homme', dgClass: 6, subclass: '6.2', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN2900', properShippingName: 'Substance infectieuse pour les animaux', dgClass: 6, subclass: '6.2', packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  // Classe 7 — Radioactif
  { unCode: 'UN2910', properShippingName: 'Matière radioactive, colis excepté, quantité limitée', dgClass: 7, packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN2911', properShippingName: 'Matière radioactive, colis excepté, instruments', dgClass: 7, packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN2912', properShippingName: 'Matière radioactive, faible activité spécifique (LSA-I)', dgClass: 7, packingGroup: '-', air: false, ground: true, maritime: true, parcel: false },
  // Classe 8 — Corrosifs
  { unCode: 'UN1760', properShippingName: 'Liquide corrosif, n.s.a.', dgClass: 8, packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN2794', properShippingName: 'Acide sulfurique', dgClass: 8, packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1824', properShippingName: 'Solution d\'hydroxyde de sodium', dgClass: 8, packingGroup: 'II', air: false, ground: true, maritime: true, parcel: false },
  // Classe 9 — Divers
  { unCode: 'UN3480', properShippingName: 'Batteries au lithium ion', dgClass: 9, packingGroup: '-', air: true, ground: true, maritime: true, parcel: true },
  { unCode: 'UN3481', properShippingName: 'Batteries au lithium ion contenues dans un équipement', dgClass: 9, packingGroup: '-', air: true, ground: true, maritime: true, parcel: true },
  { unCode: 'UN3090', properShippingName: 'Batteries au lithium métal', dgClass: 9, packingGroup: '-', air: true, ground: true, maritime: true, parcel: false },
  { unCode: 'UN3091', properShippingName: 'Batteries au lithium métal contenues dans un équipement', dgClass: 9, packingGroup: '-', air: true, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1267', properShippingName: 'Pétrole brut', dgClass: 9, packingGroup: 'III', air: false, ground: true, maritime: true, parcel: false },
  { unCode: 'UN1863', properShippingName: 'Carburéacteur (kérosène)', dgClass: 9, packingGroup: 'III', air: false, ground: true, maritime: true, parcel: false },
];

// ─── Class metadata ──────────────────────────────────────────────

interface DGClassMeta {
  id: DGClass;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const dgClassMeta: DGClassMeta[] = [
  { id: 1, label: 'Classe 1 — Explosifs', icon: Bomb, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20', borderColor: 'border-orange-300 dark:border-orange-700' },
  { id: 2, label: 'Classe 2 — Gaz', icon: Wind, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20', borderColor: 'border-green-300 dark:border-green-700' },
  { id: 3, label: 'Classe 3 — Liquides inflammables', icon: Droplets, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', borderColor: 'border-red-300 dark:border-red-700' },
  { id: 4, label: 'Classe 4 — Solides inflammables', icon: Flame, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/20', borderColor: 'border-amber-300 dark:border-amber-700' },
  { id: 5, label: 'Classe 5 — Oxydants', icon: Beaker, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', borderColor: 'border-yellow-300 dark:border-yellow-700' },
  { id: 6, label: 'Classe 6 — Toxiques / Infectieux', icon: Skull, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/20', borderColor: 'border-purple-300 dark:border-purple-700' },
  { id: 7, label: 'Classe 7 — Radioactif', icon: CircleDot, color: 'text-yellow-500 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', borderColor: 'border-yellow-300 dark:border-yellow-700' },
  { id: 8, label: 'Classe 8 — Corrosifs', icon: CloudLightning, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/20', borderColor: 'border-pink-300 dark:border-pink-700' },
  { id: 9, label: 'Classe 9 — Divers', icon: Battery, color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-900/20', borderColor: 'border-slate-300 dark:border-slate-700' },
];

// ─── DGD Declarations ────────────────────────────────────────────

type DGDStatus = 'brouillon' | 'soumise' | 'approuvée' | 'rejetée';

interface DGDDeclaration {
  id: string;
  shipmentRef: string;
  unCodes: string[];
  dgClass: DGClass;
  packingGroup: PackingGroup;
  quantity: string;
  transporter: string;
  status: DGDStatus;
  createdAt: string;
  submittedAt?: string;
  approvedBy?: string;
  notes?: string;
}

const dgdDeclarations: DGDDeclaration[] = [
  { id: 'DGD-2026-001', shipmentRef: 'FFP-0001-2026', unCodes: ['UN3480'], dgClass: 9, packingGroup: '-', quantity: '150 kg', transporter: 'DHL Express', status: 'approuvée', createdAt: '2026-01-15', submittedAt: '2026-01-16', approvedBy: 'M. Benali', notes: 'Batteries lithium-ion, emballage certifié UN3480' },
  { id: 'DGD-2026-002', shipmentRef: 'FFP-0003-2026', unCodes: ['UN1263', 'UN1866'], dgClass: 3, packingGroup: 'III', quantity: '500 kg', transporter: 'FedEx', status: 'soumise', createdAt: '2026-02-08', submittedAt: '2026-02-09' },
  { id: 'DGD-2026-003', shipmentRef: 'FFP-0005-2026', unCodes: ['UN2911'], dgClass: 7, packingGroup: '-', quantity: '5 kg', transporter: 'Transport Spécialisé DZ', status: 'approuvée', createdAt: '2026-02-20', submittedAt: '2026-02-21', approvedBy: 'Mme Khelifi' },
  { id: 'DGD-2026-004', shipmentRef: 'FFP-0007-2026', unCodes: ['UN1950'], dgClass: 2, packingGroup: '-', quantity: '200 unités', transporter: 'UPS', status: 'brouillon', createdAt: '2026-03-01' },
  { id: 'DGD-2026-005', shipmentRef: 'FFP-0009-2026', unCodes: ['UN1760'], dgClass: 8, packingGroup: 'II', quantity: '2 m³', transporter: 'Aramex', status: 'rejetée', createdAt: '2026-03-05', submittedAt: '2026-03-06', notes: 'Documentation FDS/MSDS manquante' },
  { id: 'DGD-2026-006', shipmentRef: 'FFP-0011-2026', unCodes: ['UN3481', 'UN3091'], dgClass: 9, packingGroup: '-', quantity: '80 kg', transporter: 'DHL Express', status: 'soumise', createdAt: '2026-03-10', submittedAt: '2026-03-11' },
  { id: 'DGD-2026-007', shipmentRef: 'FFP-0013-2026', unCodes: ['UN2794'], dgClass: 8, packingGroup: 'II', quantity: '1000 L', transporter: 'Transport Spécialisé DZ', status: 'brouillon', createdAt: '2026-03-12' },
  { id: 'DGD-2026-008', shipmentRef: 'FFP-0015-2026', unCodes: ['UN1239'], dgClass: 6, packingGroup: 'I', quantity: '50 kg', transporter: 'FedEx', status: 'approuvée', createdAt: '2026-03-14', submittedAt: '2026-03-15', approvedBy: 'M. Benali' },
];

// ─── Restrictions Data ───────────────────────────────────────────

interface ModeRestriction {
  dgClass: DGClass;
  className: string;
  air: { allowed: boolean; condition: string };
  maritime: { allowed: boolean; condition: string };
  ground: { allowed: boolean; condition: string };
  parcel: { allowed: boolean; condition: string };
}

const modeRestrictions: ModeRestriction[] = [
  { dgClass: 1, className: 'Explosifs', air: { allowed: false, condition: 'INTERDIT — sécurité aérienne' }, maritime: { allowed: true, condition: 'Autorisé en cargaison, déclaration DGD obligatoire' }, ground: { allowed: true, condition: 'ADR: autorisé sous conditions spéciales' }, parcel: { allowed: false, condition: 'INTERDIT — colis standard' } },
  { dgClass: 2, className: 'Gaz', air: { allowed: true, condition: 'IATA: gaz non toxiques uniquement, quantité limitée' }, maritime: { allowed: true, condition: 'IMDG: autorisé, séparation requise' }, ground: { allowed: true, condition: 'ADR: autorisé avec étiquetage' }, parcel: { allowed: false, condition: 'Aérosols UN1950 uniquement, quantité limitée' } },
  { dgClass: 3, className: 'Liquides inflammables', air: { allowed: true, condition: 'IATA: PG III uniquement, quantité limitée' }, maritime: { allowed: true, condition: 'IMDG: autorisé, déclaration DGD' }, ground: { allowed: true, condition: 'ADR: autorisé, emballage certifié' }, parcel: { allowed: true, condition: 'PG III uniquement, < 5L par colis' } },
  { dgClass: 4, className: 'Solides inflammables', air: { allowed: false, condition: 'INTERDIT sauf 4.1 PG III sur approbation' }, maritime: { allowed: true, condition: 'IMDG: autorisé, séparation des sources de chaleur' }, ground: { allowed: true, condition: 'ADR: autorisé, protection anti-incendie' }, parcel: { allowed: false, condition: 'INTERDIT — colis standard' } },
  { dgClass: 5, className: 'Oxydants', air: { allowed: false, condition: 'INTERDIT — risque d\'incendie' }, maritime: { allowed: true, condition: 'IMDG: autorisé, séparation des inflammables' }, ground: { allowed: true, condition: 'ADR: autorisé, séparation requise' }, parcel: { allowed: false, condition: 'INTERDIT — colis standard' } },
  { dgClass: 6, className: 'Toxiques / Infectieux', air: { allowed: false, condition: 'INTERDIT — risque santé publique' }, maritime: { allowed: true, condition: 'IMDG: autorisé, isolation requise' }, ground: { allowed: true, condition: 'ADR: autorisé, équipement protection' }, parcel: { allowed: false, condition: 'INTERDIT — colis standard' } },
  { dgClass: 7, className: 'Radioactif', air: { allowed: false, condition: 'INTERDIT sauf colis excepté UN2910/2911' }, maritime: { allowed: true, condition: 'IMDG: autorisé, catégorie I-III, séparation' }, ground: { allowed: true, condition: 'ADR: autorisé, licences requises' }, parcel: { allowed: false, condition: 'INTERDIT — colis standard' } },
  { dgClass: 8, className: 'Corrosifs', air: { allowed: false, condition: 'INTERDIT — risque structure avion' }, maritime: { allowed: true, condition: 'IMDG: autorisé, emballage résistant' }, ground: { allowed: true, condition: 'ADR: autorisé, emballage certifié' }, parcel: { allowed: false, condition: 'INTERDIT — colis standard' } },
  { dgClass: 9, className: 'Divers (dont lithium)', air: { allowed: true, condition: 'IATA: batteries lithium, < 5kg par colis, PI966/967' }, maritime: { allowed: true, condition: 'IMDG: autorisé, déclaration DGD' }, ground: { allowed: true, condition: 'ADR: autorisé, étiquetage lithium' }, parcel: { allowed: true, condition: 'UN3480/3481: < 2.7Wh/cellule, limité' } },
];

interface CarrierRestriction {
  carrier: string;
  forbiddenClasses: DGClass[];
  maxWeightPerPackage: string;
  specialConditions: string;
  lithiumPolicy: string;
}

const carrierRestrictions: CarrierRestriction[] = [
  { carrier: 'DHL Express', forbiddenClasses: [1, 6, 7], maxWeightPerPackage: '70 kg', specialConditions: 'Classes 2/3/4/5/8: approbation préalable requise', lithiumPolicy: 'UN3480: max 2 colis, ≤ 5kg chacun; UN3481: autorisé' },
  { carrier: 'FedEx', forbiddenClasses: [1, 6, 7], maxWeightPerPackage: '68 kg', specialConditions: 'Classe 3 PG I interdit; autres sous conditions', lithiumPolicy: 'UN3480: ≤ 5kg; UN3481: ≤ 5kg par équipement' },
  { carrier: 'UPS', forbiddenClasses: [1, 4, 5, 6, 7, 8], maxWeightPerPackage: '70 kg', specialConditions: 'Seuls Classe 2 (aérosols), 3 (PG III), 9 (lithium)', lithiumPolicy: 'UN3480/3481: autorisé selon PI967, max 2 colis' },
  { carrier: 'Aramex', forbiddenClasses: [1, 4, 5, 6, 7, 8], maxWeightPerPackage: '30 kg', specialConditions: 'Seuls Classe 3 PG III et Classe 9 (lithium)', lithiumPolicy: 'UN3481 uniquement, pas de UN3480 vrac' },
];

interface SeasonalRestriction {
  id: string;
  title: string;
  description: string;
  affectedClasses: DGClass[];
  affectedModes: string[];
  startDate: string;
  endDate: string;
  status: 'actif' | 'planifié' | 'expiré';
}

const seasonalRestrictions: SeasonalRestriction[] = [
  { id: 'SR-001', title: 'Restriction estivale — Liquides inflammables', description: 'Interdiction de transport aérien des liquides inflammables PG I/II pendant la période estivale (juillet-août) en raison des températures élevées.', affectedClasses: [3], affectedModes: ['Aérien'], startDate: '2026-07-01', endDate: '2026-08-31', status: 'planifié' },
  { id: 'SR-002', title: 'Périence Ramadan — Horaires restreints', description: 'Les transports de marchandises dangereuses par voie terrestre sont limités aux horaires nocturnes pendant le Ramadan.', affectedClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9], affectedModes: ['Terrestre'], startDate: '2026-03-01', endDate: '2026-03-31', status: 'actif' },
  { id: 'SR-003', title: 'Hadj — Embargo MD vers Arabie Saoudite', description: 'Suspension des expéditions de marchandises dangereuses vers Jeddah et les points d\'entrée saoudiens pendant la saison du Hajj.', affectedClasses: [1, 2, 3, 4, 5, 6, 7, 8], affectedModes: ['Maritime', 'Aérien'], startDate: '2026-06-05', endDate: '2026-07-10', status: 'planifié' },
  { id: 'SR-004', title: 'Fêtes de fin d\'année — Délais étendus', description: 'Délais de traitement DGD prolongés de 48h supplémentaires pendant les fêtes.', affectedClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9], affectedModes: ['Tous'], startDate: '2025-12-20', endDate: '2026-01-05', status: 'expiré' },
];

// ─── Certifications & Training ───────────────────────────────────

interface ADRCertification {
  id: string;
  employeeName: string;
  position: string;
  certType: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valide' | 'expirant' | 'expiré' | 'en_formation';
}

const adrCertifications: ADRCertification[] = [
  { id: 'ADR-001', employeeName: 'Karim Benali', position: 'Responsable Logistique MD', certType: 'ADR Complet', certNumber: 'ADR-DZ-2024-1042', issueDate: '2024-06-15', expiryDate: '2026-06-15', status: 'valide' },
  { id: 'ADR-002', employeeName: 'Samira Khelifi', position: 'Conseillère Sécurité MD', certType: 'ADR Complet + IATA DGR', certNumber: 'ADR-DZ-2024-1087', issueDate: '2024-03-20', expiryDate: '2026-03-20', status: 'expirant' },
  { id: 'ADR-003', employeeName: 'Yacine Merzougui', position: 'Chauffeur ADR', certType: 'ADR Conducteur Classe 1-9', certNumber: 'ADR-DZ-2025-0215', issueDate: '2025-01-10', expiryDate: '2027-01-10', status: 'valide' },
  { id: 'ADR-004', employeeName: 'Fatima Zohra Boudiaf', position: 'Agent Documentation MD', certType: 'IATA DGR Cat. 6', certNumber: 'IATA-DGR-2025-312', issueDate: '2025-02-28', expiryDate: '2027-02-28', status: 'valide' },
  { id: 'ADR-005', employeeName: 'Mohamed Larbi Hadj', position: 'Chauffeur ADR', certType: 'ADR Conducteur Classe 3-9', certNumber: 'ADR-DZ-2023-0789', issueDate: '2023-09-01', expiryDate: '2025-09-01', status: 'expiré' },
  { id: 'ADR-006', employeeName: 'Amina Djebbar', position: 'Responsable Qualité', certType: 'ADR Complet + IMDG', certNumber: 'ADR-DZ-2024-1156', issueDate: '2024-11-05', expiryDate: '2026-11-05', status: 'valide' },
  { id: 'ADR-007', employeeName: 'Rachid Mokrani', position: 'Opérateur Entrepôt MD', certType: 'ADR Partie 9', certNumber: 'ADR-DZ-2025-0456', issueDate: '2025-04-12', expiryDate: '2027-04-12', status: 'valide' },
  { id: 'ADR-008', employeeName: 'Nadia Ferhat', position: 'Stagiaire Sécurité MD', certType: 'IATA DGR Cat. 3', certNumber: '—', issueDate: '—', expiryDate: '—', status: 'en_formation' },
];

interface TrainingRecord {
  id: string;
  title: string;
  type: string;
  duration: string;
  completedBy: number;
  totalEnrolled: number;
  nextSession: string;
}

const trainingRecords: TrainingRecord[] = [
  { id: 'TR-001', title: 'Fondamentaux ADR 2025', type: 'Obligatoire', duration: '3 jours', completedBy: 12, totalEnrolled: 15, nextSession: '2026-04-15' },
  { id: 'TR-002', title: 'IATA DGR Catégorie 6', type: 'Obligatoire', duration: '5 jours', completedBy: 8, totalEnrolled: 10, nextSession: '2026-05-20' },
  { id: 'TR-003', title: 'Manutention MD Classe 7', type: 'Spécialisé', duration: '2 jours', completedBy: 4, totalEnrolled: 6, nextSession: '2026-06-10' },
  { id: 'TR-004', title: 'Emballage certifié OACI/IATA', type: 'Obligatoire', duration: '2 jours', completedBy: 10, totalEnrolled: 12, nextSession: '2026-04-22' },
  { id: 'TR-005', title: 'Premiers secours en cas d\'incident MD', type: 'Recommandé', duration: '1 jour', completedBy: 18, totalEnrolled: 25, nextSession: '2026-07-05' },
  { id: 'TR-006', title: 'Mise à jour réglementaire 2026', type: 'Obligatoire', duration: '1 jour', completedBy: 6, totalEnrolled: 20, nextSession: '2026-03-28' },
];

// ─── Overview KPIs ───────────────────────────────────────────────

const overviewKPIs = [
  { title: 'Expéditions MD actives', value: 24, subtitle: '+3 cette semaine', icon: Flame, color: 'from-red-500 to-red-600' },
  { title: 'DGD en attente', value: 5, subtitle: '2 soumises, 3 brouillons', icon: FileText, color: 'from-amber-500 to-amber-600' },
  { title: 'Certifications expirant', value: 1, subtitle: 'Sous 90 jours', icon: Award, color: 'from-orange-500 to-orange-600' },
  { title: 'Incidents MD', value: 2, subtitle: 'Ce trimestre', icon: AlertOctagon, color: 'from-rose-500 to-rose-600' },
];

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function DangerousGoodsPage() {
  const canEdit = useCargoStore((s) => s.canEdit('dangerous-goods'));

  // Classification filters
  const [classFilter, setClassFilter] = useState<string>('all');
  const [unSearch, setUnSearch] = useState('');

  // DGD state
  const [dgdStatusFilter, setDgdStatusFilter] = useState<string>('all');
  const [createDgdOpen, setCreateDgdOpen] = useState(false);
  const [viewDgdOpen, setViewDgdOpen] = useState(false);
  const [selectedDgd, setSelectedDgd] = useState<DGDDeclaration | null>(null);

  // New DGD form
  const [newDgd, setNewDgd] = useState({
    shipmentRef: '',
    unCodes: '',
    dgClass: '9' as string,
    packingGroup: '-' as string,
    quantity: '',
    transporter: '',
    notes: '',
  });

  // ─── Filtered classifications ──────────────────────────────────
  const filteredClassifications = useMemo(() => {
    let data = unClassifications;
    if (classFilter !== 'all') {
      data = data.filter((e) => e.dgClass === Number(classFilter));
    }
    if (unSearch.trim()) {
      const q = unSearch.trim().toUpperCase();
      data = data.filter(
        (e) =>
          e.unCode.toUpperCase().includes(q) ||
          e.properShippingName.toUpperCase().includes(q)
      );
    }
    return data;
  }, [classFilter, unSearch]);

  // ─── Filtered DGDs ─────────────────────────────────────────────
  const filteredDgds = useMemo(() => {
    if (dgdStatusFilter === 'all') return dgdDeclarations;
    return dgdDeclarations.filter((d) => d.status === dgdStatusFilter);
  }, [dgdStatusFilter]);

  // ─── Helpers ───────────────────────────────────────────────────
  const getClassMeta = (cls: DGClass) => dgClassMeta.find((m) => m.id === cls);

  const statusBadge = (status: DGDStatus) => {
    const map: Record<DGDStatus, { label: string; className: string }> = {
      brouillon: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
      soumise: { label: 'Soumise', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      'approuvée': { label: 'Approuvée', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      'rejetée': { label: 'Rejetée', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    const s = map[status];
    return <Badge className={`text-[10px] px-2 py-0.5 border-0 ${s.className}`}>{s.label}</Badge>;
  };

  const certStatusBadge = (status: ADRCertification['status']) => {
    const map: Record<string, { label: string; className: string }> = {
      valide: { label: 'Valide', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      expirant: { label: 'Expirant bientôt', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      expiré: { label: 'Expiré', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      en_formation: { label: 'En formation', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    };
    const s = map[status];
    return <Badge className={`text-[10px] px-2 py-0.5 border-0 ${s.className}`}>{s.label}</Badge>;
  };

  const seasonalStatusBadge = (status: SeasonalRestriction['status']) => {
    const map: Record<string, { label: string; className: string }> = {
      actif: { label: 'Actif', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      planifié: { label: 'Planifié', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      expiré: { label: 'Expiré', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
    };
    const s = map[status];
    return <Badge className={`text-[10px] px-2 py-0.5 border-0 ${s.className}`}>{s.label}</Badge>;
  };

  const transportIcons = (entry: UNEntry) => (
    <div className="flex items-center gap-1.5">
      <Plane className={`w-3.5 h-3.5 ${entry.air ? 'text-teal-500' : 'text-gray-300 dark:text-gray-600'}`} />
      <Ship className={`w-3.5 h-3.5 ${entry.maritime ? 'text-teal-500' : 'text-gray-300 dark:text-gray-600'}`} />
      <Truck className={`w-3.5 h-3.5 ${entry.ground ? 'text-teal-500' : 'text-gray-300 dark:text-gray-600'}`} />
      <Package className={`w-3.5 h-3.5 ${entry.parcel ? 'text-teal-500' : 'text-gray-300 dark:text-gray-600'}`} />
    </div>
  );

  const handleCreateDgd = () => {
    setCreateDgdOpen(false);
    setNewDgd({ shipmentRef: '', unCodes: '', dgClass: '9', packingGroup: '-', quantity: '', transporter: '', notes: '' });
  };

  const daysUntilExpiry = (dateStr: string) => {
    if (dateStr === '—') return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Marchandises Dangereuses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Classification UN, déclarations DGD, restrictions et certifications ADR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            ADR / IATA DGR / IMDG
          </Badge>
        </div>
      </div>

      {/* ─── Main Tabs ─── */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-10 flex-wrap">
          <TabsTrigger value="overview" className="text-xs">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="classification" className="text-xs">Classification UN</TabsTrigger>
          <TabsTrigger value="declarations" className="text-xs">Déclarations DGD</TabsTrigger>
          <TabsTrigger value="restrictions" className="text-xs">Restrictions</TabsTrigger>
          <TabsTrigger value="certifications" className="text-xs">Certifications ADR</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1 — OVERVIEW
            ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {overviewKPIs.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                          {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{kpi.subtitle}</p>
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

          {/* Recent DGD Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Dérnières déclarations DGD
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {dgdDeclarations.slice(0, 5).map((dgd) => {
                    const meta = getClassMeta(dgd.dgClass);
                    return (
                      <div key={dgd.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta?.bgColor || 'bg-gray-100'}`}>
                          {React.createElement(meta?.icon || AlertTriangle, { className: `w-4 h-4 ${meta?.color || 'text-gray-500'}` })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{dgd.id}</p>
                            {statusBadge(dgd.status)}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {dgd.shipmentRef} — {dgd.unCodes.join(', ')} — {dgd.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Alertes actives
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <AlertOctagon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">Certification ADR expirée</p>
                      <p className="text-[10px] text-red-600 dark:text-red-400/70">Mohamed Larbi Hadj — ADR Conducteur — Expirée le 01/09/2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Certification expirant sous 90 jours</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400/70">Samira Khelifi — ADR Complet + IATA DGR — Expire le 20/03/2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Restriction saisonnière active</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400/70">Ramadan — Transports MD limités aux horaires nocturnes (terrestre)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">DGD rejetée nécessite correction</p>
                      <p className="text-[10px] text-orange-600 dark:text-orange-400/70">DGD-2026-005 — FDS/MSDS manquante — FFP-0009-2026</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Répartition par classe
              </CardTitle>
              <CardDescription>Expéditions MD actives par classe de danger</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                {dgClassMeta.map((meta) => {
                  const count = dgdDeclarations.filter((d) => d.dgClass === meta.id).length;
                  return (
                    <motion.div
                      key={meta.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 rounded-lg border ${meta.borderColor} ${meta.bgColor} text-center cursor-default`}
                    >
                      <meta.icon className={`w-5 h-5 mx-auto mb-1.5 ${meta.color}`} />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Classe {meta.id}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 2 — CLASSIFICATION UN
            ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-500" />
                Table de classification UN
              </CardTitle>
              <CardDescription>
                Référence complète des codes UN ONU — {unClassifications.length} entrées
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Rechercher code UN ou nom..."
                    value={unSearch}
                    onChange={(e) => setUnSearch(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-56">
                    <SelectValue placeholder="Filtrer par classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {dgClassMeta.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        Classe {m.id} — {m.label.split('—')[1]?.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Result count */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredClassifications.length} résultat{filteredClassifications.length !== 1 ? 's' : ''} trouvé{filteredClassifications.length !== 1 ? 's' : ''}
              </p>

              {/* Table */}
              <div className="overflow-x-auto max-h-[520px] rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs font-bold min-w-[100px]">Code UN</TableHead>
                      <TableHead className="text-xs font-bold min-w-[250px]">Dénomination propre</TableHead>
                      <TableHead className="text-xs font-bold min-w-[120px]">Classe</TableHead>
                      <TableHead className="text-xs font-bold text-center">Groupe emballage</TableHead>
                      <TableHead className="text-xs font-bold text-center min-w-[140px]">
                        <div className="flex items-center justify-center gap-2">
                          <Plane className="w-3.5 h-3.5" />
                          <Ship className="w-3.5 h-3.5" />
                          <Truck className="w-3.5 h-3.5" />
                          <Package className="w-3.5 h-3.5" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredClassifications.map((entry) => {
                        const meta = getClassMeta(entry.dgClass);
                        return (
                          <motion.tr
                            key={entry.unCode}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                          >
                            <TableCell className="text-xs font-mono font-semibold text-gray-900 dark:text-white">
                              {entry.unCode}
                            </TableCell>
                            <TableCell className="text-xs text-gray-700 dark:text-gray-300">
                              {entry.properShippingName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${meta?.bgColor || 'bg-gray-100'}`}>
                                  {React.createElement(meta?.icon || AlertTriangle, { className: `w-3.5 h-3.5 ${meta?.color || 'text-gray-500'}` })}
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {entry.dgClass}{entry.subclass ? ` (${entry.subclass})` : ''}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={`text-[10px] px-2 py-0 border-0 font-semibold ${
                                  entry.packingGroup === 'I'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : entry.packingGroup === 'II'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : entry.packingGroup === 'III'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                              >
                                {entry.packingGroup === '-' ? 'N/A' : `PG ${entry.packingGroup}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {transportIcons(entry)}
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Plane className="w-3 h-3 text-teal-500" /> Aérien</span>
                <span className="flex items-center gap-1"><Ship className="w-3 h-3 text-teal-500" /> Maritime</span>
                <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-teal-500" /> Terrestre</span>
                <span className="flex items-center gap-1"><Package className="w-3 h-3 text-teal-500" /> Colis</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>PG I = Danger élevé</span>
                <span>PG II = Danger moyen</span>
                <span>PG III = Danger faible</span>
                <span>N/A = Non applicable</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 3 — DGD DECLARATIONS
            ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="declarations" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Déclarations de marchandises dangereuses (DGD)
                  </CardTitle>
                  <CardDescription>{dgdDeclarations.length} déclarations enregistrées</CardDescription>
                </div>
                {canEdit && (
                  <Button
                    size="sm"
                    className="text-white h-8 text-xs"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}
                    onClick={() => setCreateDgdOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Nouvelle DGD
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {/* Status filter */}
              <Select value={dgdStatusFilter} onValueChange={setDgdStatusFilter}>
                <SelectTrigger className="h-9 w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="soumise">Soumise</SelectItem>
                  <SelectItem value="approuvée">Approuvée</SelectItem>
                  <SelectItem value="rejetée">Rejetée</SelectItem>
                </SelectContent>
              </Select>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs font-bold">ID DGD</TableHead>
                      <TableHead className="text-xs font-bold">Expédition</TableHead>
                      <TableHead className="text-xs font-bold">Codes UN</TableHead>
                      <TableHead className="text-xs font-bold">Classe</TableHead>
                      <TableHead className="text-xs font-bold text-center">Groupe</TableHead>
                      <TableHead className="text-xs font-bold">Quantité</TableHead>
                      <TableHead className="text-xs font-bold">Transporteur</TableHead>
                      <TableHead className="text-xs font-bold">Statut</TableHead>
                      <TableHead className="text-xs font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDgds.map((dgd) => {
                      const meta = getClassMeta(dgd.dgClass);
                      return (
                        <TableRow key={dgd.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <TableCell className="text-xs font-semibold text-gray-900 dark:text-white">{dgd.id}</TableCell>
                          <TableCell className="text-xs font-mono text-gray-600 dark:text-gray-400">{dgd.shipmentRef}</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-wrap gap-1">
                              {dgd.unCodes.map((code) => (
                                <Badge key={code} className="text-[9px] px-1.5 py-0 border-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${meta?.bgColor || 'bg-gray-100'}`}>
                                {React.createElement(meta?.icon || AlertTriangle, { className: `w-3 h-3 ${meta?.color || 'text-gray-500'}` })}
                              </div>
                              <span className="text-xs">{dgd.dgClass}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold">
                            {dgd.packingGroup === '-' ? 'N/A' : dgd.packingGroup}
                          </TableCell>
                          <TableCell className="text-xs text-gray-700 dark:text-gray-300">{dgd.quantity}</TableCell>
                          <TableCell className="text-xs text-gray-700 dark:text-gray-300">{dgd.transporter}</TableCell>
                          <TableCell>{statusBadge(dgd.status)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => { setSelectedDgd(dgd); setViewDgdOpen(true); }}
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Create DGD Dialog */}
          <Dialog open={createDgdOpen} onOpenChange={setCreateDgdOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  Nouvelle déclaration DGD
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de la déclaration de marchandises dangereuses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Référence expédition</Label>
                    <Input
                      className="h-9 text-sm"
                      placeholder="FFP-XXXX-2026"
                      value={newDgd.shipmentRef}
                      onChange={(e) => setNewDgd({ ...newDgd, shipmentRef: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Codes UN (séparés par virgule)</Label>
                    <Input
                      className="h-9 text-sm"
                      placeholder="UN3480, UN3091"
                      value={newDgd.unCodes}
                      onChange={(e) => setNewDgd({ ...newDgd, unCodes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Classe de danger</Label>
                    <Select value={newDgd.dgClass} onValueChange={(v) => setNewDgd({ ...newDgd, dgClass: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dgClassMeta.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            Classe {m.id} — {m.label.split('—')[1]?.trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Groupe d&apos;emballage</Label>
                    <Select value={newDgd.packingGroup} onValueChange={(v) => setNewDgd({ ...newDgd, packingGroup: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">N/A</SelectItem>
                        <SelectItem value="I">I — Danger élevé</SelectItem>
                        <SelectItem value="II">II — Danger moyen</SelectItem>
                        <SelectItem value="III">III — Danger faible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      className="h-9 text-sm"
                      placeholder="ex: 150 kg"
                      value={newDgd.quantity}
                      onChange={(e) => setNewDgd({ ...newDgd, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Transporteur</Label>
                    <Select value={newDgd.transporter} onValueChange={(v) => setNewDgd({ ...newDgd, transporter: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DHL Express">DHL Express</SelectItem>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="Aramex">Aramex</SelectItem>
                        <SelectItem value="Transport Spécialisé DZ">Transport Spécialisé DZ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Notes / observations</Label>
                  <Textarea
                    className="text-sm min-h-[80px]"
                    placeholder="Informations complémentaires, FDS/MSDS, emballage spécial..."
                    value={newDgd.notes}
                    onChange={(e) => setNewDgd({ ...newDgd, notes: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    La DGD sera créée en statut &quot;Brouillon&quot;. Vous devrez la soumettre pour approbation avant l&apos;expédition.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setCreateDgdOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 text-xs text-white"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}
                    onClick={handleCreateDgd}
                  >
                    Créer la DGD
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View DGD Detail Dialog */}
          <Dialog open={viewDgdOpen} onOpenChange={setViewDgdOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Détails DGD — {selectedDgd?.id}
                </DialogTitle>
                <DialogDescription>
                  Déclaration de marchandises dangereuses
                </DialogDescription>
              </DialogHeader>
              {selectedDgd && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Référence expédition</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedDgd.shipmentRef}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Statut</p>
                      {statusBadge(selectedDgd.status)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Codes UN</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedDgd.unCodes.map((code) => (
                          <Badge key={code} className="text-[9px] px-2 py-0.5 border-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Classe / Groupe emballage</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Classe {selectedDgd.dgClass} — PG {selectedDgd.packingGroup === '-' ? 'N/A' : selectedDgd.packingGroup}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Quantité</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDgd.quantity}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Transporteur</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDgd.transporter}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Date de création</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDgd.createdAt}</p>
                    </div>
                    {selectedDgd.submittedAt && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Date de soumission</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDgd.submittedAt}</p>
                      </div>
                    )}
                  </div>
                  {selectedDgd.approvedBy && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Approuvé par</p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{selectedDgd.approvedBy}</p>
                    </div>
                  )}
                  {selectedDgd.notes && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Notes</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">{selectedDgd.notes}</p>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
                    <Shield className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <p className="text-[10px] text-sky-700 dark:text-sky-400">
                      Cette déclaration est soumise aux réglementations ADR (terrestre), IATA DGR (aérien) et IMDG (maritime).
                      Conservez une copie signée avec l&apos;expédition.
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 4 — RESTRICTIONS
            ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="restrictions" className="space-y-4">
          {/* Mode-specific restrictions matrix */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Matrice des restrictions par mode de transport
              </CardTitle>
              <CardDescription>
                Quelles classes de danger sont autorisées selon le mode —{' '}
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Autorisé</span>
                {' / '}
                <span className="inline-flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> Interdit</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs font-bold">Classe</TableHead>
                      <TableHead className="text-xs font-bold text-center">
                        <div className="flex items-center justify-center gap-1"><Plane className="w-3.5 h-3.5" /> Aérien</div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-center">
                        <div className="flex items-center justify-center gap-1"><Ship className="w-3.5 h-3.5" /> Maritime</div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-center">
                        <div className="flex items-center justify-center gap-1"><Truck className="w-3.5 h-3.5" /> Terrestre</div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-center">
                        <div className="flex items-center justify-center gap-1"><Package className="w-3.5 h-3.5" /> Colis</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modeRestrictions.map((row) => {
                      const meta = getClassMeta(row.dgClass);
                      return (
                        <TableRow key={row.dgClass} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded flex items-center justify-center ${meta?.bgColor || 'bg-gray-100'}`}>
                                {React.createElement(meta?.icon || AlertTriangle, { className: `w-4 h-4 ${meta?.color || 'text-gray-500'}` })}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">Classe {row.dgClass}</p>
                                <p className="text-[9px] text-gray-500 dark:text-gray-400">{row.className}</p>
                              </div>
                            </div>
                          </TableCell>
                          {(['air', 'maritime', 'ground', 'parcel'] as const).map((mode) => {
                            const m = row[mode];
                            return (
                              <TableCell key={mode} className="text-center">
                                <div className="flex flex-col items-center gap-1">
                                  {m.allowed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <p className={`text-[9px] leading-tight max-w-[160px] ${m.allowed ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400 font-medium'}`}>
                                    {m.condition}
                                  </p>
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Carrier-specific restrictions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                Restrictions par transporteur
              </CardTitle>
              <CardDescription>
                Politiques spécifiques DHL, FedEx, UPS et Aramex
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carrierRestrictions.map((cr) => (
                  <motion.div
                    key={cr.carrier}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{cr.carrier}</p>
                          <Badge className="text-[9px] px-2 py-0 border-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            MD
                          </Badge>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Classes interdites</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cr.forbiddenClasses.map((cls) => {
                                const meta = getClassMeta(cls);
                                return (
                                  <Badge key={cls} className="text-[9px] px-1.5 py-0 border-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    Cl. {cls}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Poids max / colis</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{cr.maxWeightPerPackage}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Conditions spéciales</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{cr.specialConditions}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Politique lithium</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{cr.lithiumPolicy}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal / Temporary restrictions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-orange-500" />
                Restrictions saisonnières et temporaires
              </CardTitle>
              <CardDescription>
                Embargos et limitations périodiques affectant le transport MD
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {seasonalRestrictions.map((sr) => (
                  <motion.div
                    key={sr.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-lg border ${
                      sr.status === 'actif'
                        ? 'border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10'
                        : sr.status === 'planifié'
                        ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/10'
                        : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{sr.title}</p>
                          {seasonalStatusBadge(sr.status)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{sr.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {sr.startDate} → {sr.endDate}</span>
                          <span className="flex items-center gap-1">
                            Classes: {sr.affectedClasses.join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            Modes: {sr.affectedModes.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 5 — CERTIFICATIONS ADR
            ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="certifications" className="space-y-4">
          {/* Certifications table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Certifications ADR du personnel
              </CardTitle>
              <CardDescription>
                {adrCertifications.length} certifications enregistrées — Expération suivie
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs font-bold">Employé</TableHead>
                      <TableHead className="text-xs font-bold">Poste</TableHead>
                      <TableHead className="text-xs font-bold">Type certification</TableHead>
                      <TableHead className="text-xs font-bold">N° Certificat</TableHead>
                      <TableHead className="text-xs font-bold text-center">Émission</TableHead>
                      <TableHead className="text-xs font-bold text-center">Expiration</TableHead>
                      <TableHead className="text-xs font-bold text-center">Validité</TableHead>
                      <TableHead className="text-xs font-bold">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adrCertifications.map((cert) => {
                      const daysLeft = daysUntilExpiry(cert.expiryDate);
                      const progressValue = daysLeft !== null
                        ? Math.max(0, Math.min(100, ((730 - daysLeft) / 730) * 100))
                        : 0;
                      return (
                        <TableRow key={cert.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                                cert.status === 'valide' ? 'bg-emerald-500' :
                                cert.status === 'expirant' ? 'bg-amber-500' :
                                cert.status === 'expiré' ? 'bg-red-500' : 'bg-sky-500'
                              }`}>
                                {cert.employeeName.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">{cert.employeeName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 dark:text-gray-400">{cert.position}</TableCell>
                          <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">{cert.certType}</TableCell>
                          <TableCell className="text-xs font-mono text-gray-600 dark:text-gray-400">{cert.certNumber}</TableCell>
                          <TableCell className="text-xs text-center text-gray-600 dark:text-gray-400">{cert.issueDate}</TableCell>
                          <TableCell className="text-xs text-center text-gray-600 dark:text-gray-400">{cert.expiryDate}</TableCell>
                          <TableCell className="text-center">
                            {daysLeft !== null ? (
                              <div className="space-y-1">
                                <Progress
                                  value={progressValue}
                                  className={`h-1.5 w-16 ${
                                    daysLeft <= 0 ? '[&>div]:bg-red-500' :
                                    daysLeft <= 90 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                                  }`}
                                />
                                <p className={`text-[9px] ${
                                  daysLeft <= 0 ? 'text-red-500 font-semibold' :
                                  daysLeft <= 90 ? 'text-amber-500 font-medium' : 'text-gray-500'
                                }`}>
                                  {daysLeft <= 0 ? 'Expiré' : `${daysLeft}j restants`}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>{certStatusBadge(cert.status)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Training records */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-orange-500" />
                Formations MD
              </CardTitle>
              <CardDescription>
                Programme de formation et recyclage du personnel
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs font-bold">Formation</TableHead>
                      <TableHead className="text-xs font-bold">Type</TableHead>
                      <TableHead className="text-xs font-bold text-center">Durée</TableHead>
                      <TableHead className="text-xs font-bold text-center">Progression</TableHead>
                      <TableHead className="text-xs font-bold text-center">Prochaine session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRecords.map((tr) => (
                      <TableRow key={tr.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <TableCell className="text-xs font-semibold text-gray-900 dark:text-white">{tr.title}</TableCell>
                        <TableCell>
                          <Badge className={`text-[9px] px-2 py-0 border-0 ${
                            tr.type === 'Obligatoire'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : tr.type === 'Spécialisé'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                          }`}>
                            {tr.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center text-gray-600 dark:text-gray-400">{tr.duration}</TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <Progress
                              value={(tr.completedBy / tr.totalEnrolled) * 100}
                              className="h-1.5 w-20 [&>div]:bg-teal-500 mx-auto"
                            />
                            <p className="text-[9px] text-gray-500 dark:text-gray-400">
                              {tr.completedBy}/{tr.totalEnrolled} complété
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center text-gray-600 dark:text-gray-400">{tr.nextSession}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
