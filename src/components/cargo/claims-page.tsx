'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Package,
  Ship,
  Plane,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  MessageSquare,
  FileImage,
  Upload,
  Filter,
  Plus,
  Eye,
  ChevronDown,
  Search,
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  Download,
  Send,
  Ban,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCurrency } from '@/lib/use-currency';

// ─── Types ───────────────────────────────────────────────────────────────────

type ClaimStatus = 'ouverte' | 'en_cours' | 'en_resolution' | 'resolue' | 'rejetee';
type ClaimType = 'endommage' | 'perdu' | 'en_retard' | 'incorrect' | 'facturation';
type TransportMode = 'maritime' | 'aerien' | 'terrestre';
type Priority = 'critique' | 'haute' | 'moyenne' | 'basse';

interface TimelineEvent {
  date: string;
  status: string;
  description: string;
  actor: string;
}

interface Evidence {
  id: string;
  name: string;
  type: 'photo' | 'document';
  uploadedAt: string;
}

interface Communication {
  id: string;
  from: string;
  to: string;
  message: string;
  date: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  clientName: string;
  type: ClaimType;
  transportMode: TransportMode;
  description: string;
  claimedAmount: number;
  status: ClaimStatus;
  priority: Priority;
  date: string;
  shipmentRef: string;
  assignedTo: string;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  communications: Communication[];
  resolutionAmount?: number;
  resolutionDate?: string;
  resolutionNote?: string;
  slaDeadline: string;
  daysOpen: number;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const claimStatusLabels: Record<ClaimStatus, string> = {
  ouverte: 'Ouverte',
  en_cours: 'En cours',
  en_resolution: 'En résolution',
  resolue: 'Résolue',
  rejetee: 'Rejetée',
};

const claimTypeLabels: Record<ClaimType, string> = {
  endommage: 'Endommagé',
  perdu: 'Perdu',
  en_retard: 'En retard',
  incorrect: 'Incorrect',
  facturation: 'Facturation',
};

const transportModeLabels: Record<TransportMode, string> = {
  maritime: 'Maritime',
  aerien: 'Aérien',
  terrestre: 'Terrestre',
};

const priorityLabels: Record<Priority, string> = {
  critique: 'Critique',
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};

// ─── Badge colors ────────────────────────────────────────────────────────────

const claimStatusColors: Record<ClaimStatus, string> = {
  ouverte: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_resolution: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  resolue: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejetee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const claimTypeColors: Record<ClaimType, string> = {
  endommage: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  perdu: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  en_retard: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  incorrect: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  facturation: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

const priorityColors: Record<Priority, string> = {
  critique: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  haute: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  moyenne: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  basse: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#0ea5e9', '#0d9488'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getTransportIcon = (mode: TransportMode) => {
  switch (mode) {
    case 'maritime': return Ship;
    case 'aerien': return Plane;
    case 'terrestre': return Truck;
  }
};

const getTypeIcon = (type: ClaimType) => {
  switch (type) {
    case 'endommage': return AlertCircle;
    case 'perdu': return Package;
    case 'en_retard': return Clock;
    case 'incorrect': return AlertTriangle;
    case 'facturation': return FileText;
  }
};

// ─── Test data ───────────────────────────────────────────────────────────────

const initialClaims: Claim[] = [
  {
    id: 'rec1', claimNumber: 'REC-2026-001', clientName: 'SPA HydroServices', type: 'endommage',
    transportMode: 'maritime', description: 'Conteneur MSKU-7234561 arrivé avec dommages d\'eau importants. Marchandises humides, emballages détériorés. Pompes industrielles affectées par la corrosion.',
    claimedAmount: 950000, status: 'en_cours', priority: 'critique', date: '2026-03-15',
    shipmentRef: 'FFP-0005-2026', assignedTo: 'Fatima Khelifi',
    timeline: [
      { date: '2026-03-15', status: 'Soumis', description: 'Réclamation déposée par le client', actor: 'SPA HydroServices' },
      { date: '2026-03-17', status: 'En cours d\'examen', description: 'Dossier assigné pour investigation', actor: 'Fatima Khelifi' },
      { date: '2026-03-22', status: 'Expertise en cours', description: 'Expert maritime désigné pour inspection', actor: 'Expert Benmoussa' },
    ],
    evidence: [
      { id: 'ev1', name: 'photo_dommage_eau.jpg', type: 'photo', uploadedAt: '2026-03-15' },
      { id: 'ev2', name: 'BL_endommage.pdf', type: 'document', uploadedAt: '2026-03-15' },
      { id: 'ev3', name: 'rapport_reception.pdf', type: 'document', uploadedAt: '2026-03-16' },
    ],
    communications: [
      { id: 'cm1', from: 'SPA HydroServices', to: 'LogisWay', message: 'Le conteneur est arrivé avec des traces d\'eau importante. Veuillez envoyer un expert.', date: '2026-03-15' },
      { id: 'cm2', from: 'LogisWay', to: 'SPA HydroServices', message: 'Nous avons bien reçu votre réclamation. Un expert sera désigné sous 48h.', date: '2026-03-16' },
    ],
    slaDeadline: '2026-04-14', daysOpen: 12,
  },
  {
    id: 'rec2', claimNumber: 'REC-2026-002', clientName: 'Sarl TechnoPlus', type: 'perdu',
    transportMode: 'aerien', description: 'Colis FFP-0001-2026 déclaré perdu en transit. Matériel informatique haute valeur non livré à destination Paris.',
    claimedAmount: 350000, status: 'resolue', priority: 'haute', date: '2026-02-20',
    shipmentRef: 'FFP-0001-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-02-20', status: 'Soumis', description: 'Réclamation déposée pour colis perdu', actor: 'Sarl TechnoPlus' },
      { date: '2026-02-22', status: 'En cours d\'examen', description: 'Recherche lancée auprès du transporteur aérien', actor: 'Ahmed Benali' },
      { date: '2026-03-05', status: 'Décision', description: 'Colis confirmé perdu. Indemnisation approuvée.', actor: 'Direction' },
      { date: '2026-03-10', status: 'Résolu', description: 'Indemnisation versée', actor: 'Comptabilité' },
    ],
    evidence: [
      { id: 'ev4', name: 'AWB_124-56789012.pdf', type: 'document', uploadedAt: '2026-02-20' },
    ],
    communications: [
      { id: 'cm3', from: 'Sarl TechnoPlus', to: 'LogisWay', message: 'Le colis n\'est jamais arrivé à Paris. Il est introuvable dans le système de suivi.', date: '2026-02-20' },
      { id: 'cm4', from: 'LogisWay', to: 'Sarl TechnoPlus', message: 'Après vérification, le colis est déclaré perdu. Nous procédons à l\'indemnisation.', date: '2026-03-05' },
    ],
    resolutionAmount: 315000, resolutionDate: '2026-03-10', resolutionNote: 'Indemnisation à 90% de la valeur déclarée selon les conditions du contrat.',
    slaDeadline: '2026-03-22', daysOpen: 18,
  },
  {
    id: 'rec3', claimNumber: 'REC-2026-003', clientName: 'EURL BatiPlus', type: 'en_retard',
    transportMode: 'maritime', description: 'Retard de livraison de 12 jours sur le conteneur de matériaux de construction Shanghai-Alger. Impact direct sur le chantier.',
    claimedAmount: 420000, status: 'resolue', priority: 'haute', date: '2026-02-28',
    shipmentRef: 'FFP-0006-2026', assignedTo: 'Fatima Khelifi',
    timeline: [
      { date: '2026-02-28', status: 'Soumis', description: 'Réclamation pour retard de livraison', actor: 'EURL BatiPlus' },
      { date: '2026-03-02', status: 'En cours d\'examen', description: 'Vérification des causes du retard', actor: 'Fatima Khelifi' },
      { date: '2026-03-10', status: 'Décision', description: 'Retard confirmé dû aux conditions météo. Compensation partielle accordée.', actor: 'Direction' },
      { date: '2026-03-15', status: 'Résolu', description: 'Compensation versée', actor: 'Comptabilité' },
    ],
    evidence: [
      { id: 'ev5', name: 'tracking_retard.pdf', type: 'document', uploadedAt: '2026-02-28' },
      { id: 'ev6', name: 'photo_chantier_arret.jpg', type: 'photo', uploadedAt: '2026-03-01' },
    ],
    communications: [
      { id: 'cm5', from: 'EURL BatiPlus', to: 'LogisWay', message: 'Le chantier est à l\'arrêt depuis 12 jours. Nous réclamons une compensation pour préjudice.', date: '2026-02-28' },
    ],
    resolutionAmount: 210000, resolutionDate: '2026-03-15', resolutionNote: 'Compensation partielle de 50% pour force majeure (conditions météorologiques).',
    slaDeadline: '2026-03-30', daysOpen: 15,
  },
  {
    id: 'rec4', claimNumber: 'REC-2026-004', clientName: 'Entreprise Bouzidi & Fils', type: 'endommage',
    transportMode: 'terrestre', description: 'Marchandises endommagées durant le transport terrestre Casablanca-Dakar. Produits alimentaires détériorés par la chaleur.',
    claimedAmount: 380000, status: 'en_resolution', priority: 'critique', date: '2026-03-20',
    shipmentRef: 'FFP-0003-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-03-20', status: 'Soumis', description: 'Réclamation déposée pour avarie', actor: 'Entreprise Bouzidi & Fils' },
      { date: '2026-03-22', status: 'En cours d\'examen', description: 'Expertise terrain programmée', actor: 'Ahmed Benali' },
      { date: '2026-03-28', status: 'En résolution', description: 'Expertise confirmée. Négociation en cours.', actor: 'Direction' },
    ],
    evidence: [
      { id: 'ev7', name: 'photo_produits_aborimes.jpg', type: 'photo', uploadedAt: '2026-03-20' },
      { id: 'ev8', name: 'certificat_temperature.pdf', type: 'document', uploadedAt: '2026-03-21' },
      { id: 'ev9', name: 'photo_thermometre.jpg', type: 'photo', uploadedAt: '2026-03-21' },
    ],
    communications: [
      { id: 'cm6', from: 'Entreprise Bouzidi & Fils', to: 'LogisWay', message: 'Le camion frigorifique n\'a pas maintenu la température. 60% des produits sont perdus.', date: '2026-03-20' },
      { id: 'cm7', from: 'LogisWay', to: 'Entreprise Bouzidi & Fils', message: 'Nous regrettons cet incident. L\'expertise est en cours pour déterminer les responsabilités.', date: '2026-03-22' },
    ],
    slaDeadline: '2026-04-19', daysOpen: 7,
  },
  {
    id: 'rec5', claimNumber: 'REC-2026-005', clientName: 'Sarl AgriPro', type: 'facturation',
    transportMode: 'terrestre', description: 'Surfacturation constatée sur l\'expédition FFP-0016-2026. Montant facturé ne correspond pas au devis initial.',
    claimedAmount: 45000, status: 'ouverte', priority: 'moyenne', date: '2026-04-08',
    shipmentRef: 'FFP-0016-2026', assignedTo: 'Fatima Khelifi',
    timeline: [
      { date: '2026-04-08', status: 'Soumis', description: 'Contestation de facturation soumise', actor: 'Sarl AgriPro' },
    ],
    evidence: [
      { id: 'ev10', name: 'devis_initial.pdf', type: 'document', uploadedAt: '2026-04-08' },
      { id: 'ev11', name: 'facture_recue.pdf', type: 'document', uploadedAt: '2026-04-08' },
    ],
    communications: [
      { id: 'cm8', from: 'Sarl AgriPro', to: 'LogisWay', message: 'La facture est de 155 000 DA alors que le devis était de 110 000 DA. Merci de rectifier.', date: '2026-04-08' },
    ],
    slaDeadline: '2026-05-08', daysOpen: 2,
  },
  {
    id: 'rec6', claimNumber: 'REC-2026-006', clientName: 'Karim Djebbar', type: 'incorrect',
    transportMode: 'terrestre', description: 'Livraison incorrecte : mobilier de bureau reçu au lieu d\'électroménager. Erreur d\'étiquetage au dépôt.',
    claimedAmount: 180000, status: 'en_cours', priority: 'haute', date: '2026-04-05',
    shipmentRef: 'FFP-0022-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-04-05', status: 'Soumis', description: 'Réclamation pour livraison incorrecte', actor: 'Karim Djebbar' },
      { date: '2026-04-06', status: 'En cours d\'examen', description: 'Vérification au dépôt en cours', actor: 'Ahmed Benali' },
    ],
    evidence: [
      { id: 'ev12', name: 'photo_livraison_incorrecte.jpg', type: 'photo', uploadedAt: '2026-04-05' },
      { id: 'ev13', name: 'bon_commande.pdf', type: 'document', uploadedAt: '2026-04-05' },
    ],
    communications: [
      { id: 'cm9', from: 'Karim Djebbar', to: 'LogisWay', message: 'J\'ai reçu du mobilier au lieu de l\'électroménager commandé. Veuillez échanger rapidement.', date: '2026-04-05' },
      { id: 'cm10', from: 'LogisWay', to: 'Karim Djebbar', message: 'Nous vérifions au dépôt. Un échange sera organisé dans les plus brefs délais.', date: '2026-04-06' },
    ],
    slaDeadline: '2026-05-05', daysOpen: 5,
  },
  {
    id: 'rec7', claimNumber: 'REC-2026-007', clientName: 'Nadia Benmoussa', type: 'perdu',
    transportMode: 'aerien', description: 'Colis de médicaments perdu lors du transit Istanbul-Casablanca. Expédition urgente non livrée.',
    claimedAmount: 85000, status: 'rejetee', priority: 'haute', date: '2026-02-25',
    shipmentRef: 'FFP-0007-2026', assignedTo: 'Fatima Khelifi',
    timeline: [
      { date: '2026-02-25', status: 'Soumis', description: 'Réclamation pour colis perdu', actor: 'Nadia Benmoussa' },
      { date: '2026-02-27', status: 'En cours d\'examen', description: 'Investigation auprès de la compagnie aérienne', actor: 'Fatima Khelifi' },
      { date: '2026-03-10', status: 'Décision', description: 'Colis retrouvé mais retour expéditeur. Réclamation rejetée.', actor: 'Direction' },
      { date: '2026-03-12', status: 'Rejeté', description: 'Dossier classé sans suite', actor: 'Direction' },
    ],
    evidence: [
      { id: 'ev14', name: 'retour_expediteur.pdf', type: 'document', uploadedAt: '2026-03-10' },
    ],
    communications: [
      { id: 'cm11', from: 'LogisWay', to: 'Nadia Benmoussa', message: 'Le colis a été retrouvé mais a été retourné à l\'expéditeur. La réclamation est rejetée selon les CGV.', date: '2026-03-10' },
    ],
    resolutionNote: 'Colis retrouvé et retourné à l\'expéditeur. Pas de perte effective. Réclamation non recevable.',
    slaDeadline: '2026-03-27', daysOpen: 15,
  },
  {
    id: 'rec8', claimNumber: 'REC-2026-008', clientName: 'SPA HydroServices', type: 'endommage',
    transportMode: 'maritime', description: 'Équipements industriels endommagés durant le transport Hambourg-Djeddah. Conteneur avec traces d\'impact.',
    claimedAmount: 1560000, status: 'ouverte', priority: 'critique', date: '2026-04-10',
    shipmentRef: 'FFP-0010-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-04-10', status: 'Soumis', description: 'Réclamation pour dommages importants', actor: 'SPA HydroServices' },
    ],
    evidence: [
      { id: 'ev15', name: 'photo_impact_conteneur.jpg', type: 'photo', uploadedAt: '2026-04-10' },
      { id: 'ev16', name: 'photo_equipements_endommages.jpg', type: 'photo', uploadedAt: '2026-04-10' },
      { id: 'ev17', name: 'rapport_dechargement.pdf', type: 'document', uploadedAt: '2026-04-10' },
    ],
    communications: [
      { id: 'cm12', from: 'SPA HydroServices', to: 'LogisWay', message: 'Le conteneur présente des impacts visibles. Les équipements à l\'intérieur sont sérieusement endommagés.', date: '2026-04-10' },
    ],
    slaDeadline: '2026-05-10', daysOpen: 1,
  },
  {
    id: 'rec9', claimNumber: 'REC-2026-009', clientName: 'Mohamed Amrani', type: 'en_retard',
    transportMode: 'aerien', description: 'Retard de livraison de 5 jours sur expédition Anvers-Alger. Problème douanier signalé.',
    claimedAmount: 65000, status: 'en_cours', priority: 'moyenne', date: '2026-04-14',
    shipmentRef: 'FFP-0018-2026', assignedTo: 'Fatima Khelifi',
    timeline: [
      { date: '2026-04-14', status: 'Soumis', description: 'Réclamation pour retard de livraison', actor: 'Mohamed Amrani' },
      { date: '2026-04-15', status: 'En cours d\'examen', description: 'Vérification auprès des douanes', actor: 'Fatima Khelifi' },
    ],
    evidence: [
      { id: 'ev18', name: 'tracking_delay_screenshot.png', type: 'photo', uploadedAt: '2026-04-14' },
    ],
    communications: [
      { id: 'cm13', from: 'Mohamed Amrani', to: 'LogisWay', message: 'Mon colis est bloqué en douane depuis 5 jours. Quel est le problème ?', date: '2026-04-14' },
      { id: 'cm14', from: 'LogisWay', to: 'Mohamed Amrani', message: 'Nous contactons les services douaniers. Nous vous tiendrons informé.', date: '2026-04-15' },
    ],
    slaDeadline: '2026-05-14', daysOpen: 3,
  },
  {
    id: 'rec10', claimNumber: 'REC-2026-010', clientName: 'Sarl MédiaCom', type: 'facturation',
    transportMode: 'aerien', description: 'Double facturation sur l\'expédition FFP-0004-2026. Deux factures émises pour le même service.',
    claimedAmount: 120000, status: 'resolue', priority: 'basse', date: '2026-03-01',
    shipmentRef: 'FFP-0004-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-03-01', status: 'Soumis', description: 'Contestation pour double facturation', actor: 'Sarl MédiaCom' },
      { date: '2026-03-03', status: 'En cours d\'examen', description: 'Vérification comptable', actor: 'Ahmed Benali' },
      { date: '2026-03-08', status: 'Résolu', description: 'Facture en double annulée. Avoir émis.', actor: 'Comptabilité' },
    ],
    evidence: [
      { id: 'ev19', name: 'facture_double_1.pdf', type: 'document', uploadedAt: '2026-03-01' },
      { id: 'ev20', name: 'facture_double_2.pdf', type: 'document', uploadedAt: '2026-03-01' },
    ],
    communications: [
      { id: 'cm15', from: 'Sarl MédiaCom', to: 'LogisWay', message: 'J\'ai reçu deux factures pour la même expédition. Merci de corriger.', date: '2026-03-01' },
    ],
    resolutionAmount: 120000, resolutionDate: '2026-03-08', resolutionNote: 'Avoir émis pour le montant de la facture en double. Erreur comptable confirmée.',
    slaDeadline: '2026-03-31', daysOpen: 7,
  },
  {
    id: 'rec11', claimNumber: 'REC-2026-011', clientName: 'EPC Groupe Construction', type: 'endommage',
    transportMode: 'terrestre', description: 'Matériaux de construction endommagés lors du transport Barcelone-Milan. Planches fissurées et céramiques cassées.',
    claimedAmount: 520000, status: 'ouverte', priority: 'haute', date: '2026-04-12',
    shipmentRef: 'FFP-0014-2026', assignedTo: 'Fatima Khelifi',
    timeline: [
      { date: '2026-04-12', status: 'Soumis', description: 'Réclamation pour avarie marchandises', actor: 'EPC Groupe Construction' },
    ],
    evidence: [
      { id: 'ev21', name: 'photo_planches_fissurees.jpg', type: 'photo', uploadedAt: '2026-04-12' },
      { id: 'ev22', name: 'photo_ceramiques_cassees.jpg', type: 'photo', uploadedAt: '2026-04-12' },
    ],
    communications: [
      { id: 'cm16', from: 'EPC Groupe Construction', to: 'LogisWay', message: 'Plus de 30% de la cargaison est endommagée. Nous exigeons une expertise immédiate.', date: '2026-04-12' },
    ],
    slaDeadline: '2026-05-12', daysOpen: 1,
  },
  {
    id: 'rec12', claimNumber: 'REC-2026-012', clientName: 'Amina Zeroual', type: 'incorrect',
    transportMode: 'terrestre', description: 'Colis livré à une mauvaise adresse. Le destinataire a reçu un colis qui ne lui était pas destiné.',
    claimedAmount: 95000, status: 'en_cours', priority: 'moyenne', date: '2026-04-09',
    shipmentRef: 'FFP-0019-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-04-09', status: 'Soumis', description: 'Réclamation pour erreur de livraison', actor: 'Amina Zeroual' },
      { date: '2026-04-10', status: 'En cours d\'examen', description: 'Enquête auprès du chauffeur', actor: 'Ahmed Benali' },
    ],
    evidence: [
      { id: 'ev23', name: 'bon_livraison_signe.pdf', type: 'document', uploadedAt: '2026-04-09' },
    ],
    communications: [
      { id: 'cm17', from: 'Amina Zeroual', to: 'LogisWay', message: 'Mon colis a été livré à quelqu\'un d\'autre. La personne qui l\'a reçu me l\'a signalé.', date: '2026-04-09' },
      { id: 'cm18', from: 'LogisWay', to: 'Amina Zeroual', message: 'Nous enquêtons auprès du chauffeur. Nous ferons le nécessaire pour récupérer votre colis.', date: '2026-04-10' },
    ],
    slaDeadline: '2026-05-09', daysOpen: 4,
  },
  {
    id: 'rec13', claimNumber: 'REC-2026-013', clientName: 'Entreprise Bouzidi & Fils', type: 'facturation',
    transportMode: 'maritime', description: 'Frais de surestaries non prévus facturés sur le conteneur MSKU-7234561. Demande de régularisation.',
    claimedAmount: 75000, status: 'ouverte', priority: 'basse', date: '2026-04-13',
    shipmentRef: 'FFP-0021-2026', assignedTo: 'Ahmed Benali',
    timeline: [
      { date: '2026-04-13', status: 'Soumis', description: 'Contestation des frais de surestaries', actor: 'Entreprise Bouzidi & Fils' },
    ],
    evidence: [
      { id: 'ev24', name: 'facture_surestaries.pdf', type: 'document', uploadedAt: '2026-04-13' },
      { id: 'ev25', name: 'contrat_transport.pdf', type: 'document', uploadedAt: '2026-04-13' },
    ],
    communications: [
      { id: 'cm19', from: 'Entreprise Bouzidi & Fils', to: 'LogisWay', message: 'Les frais de surestaries ne figurent pas dans notre contrat. Merci de les annuler.', date: '2026-04-13' },
    ],
    slaDeadline: '2026-05-13', daysOpen: 1,
  },
];

// ─── Chart data ──────────────────────────────────────────────────────────────

const claimsByTypeData = [
  { name: 'Endommagé', value: 5 },
  { name: 'Perdu', value: 2 },
  { name: 'En retard', value: 2 },
  { name: 'Incorrect', value: 2 },
  { name: 'Facturation', value: 2 },
];

const claimsByMonthData = [
  { month: 'Jan', reclamations: 0 },
  { month: 'Fév', reclamations: 2 },
  { month: 'Mar', reclamations: 4 },
  { month: 'Avr', reclamations: 7 },
  { month: 'Mai', reclamations: 0 },
  { month: 'Jun', reclamations: 0 },
];

const resolutionByTransportData = [
  { mode: 'Maritime', taux: 50 },
  { mode: 'Aérien', taux: 33 },
  { mode: 'Terrestre', taux: 25 },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterTransport, setFilterTransport] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewClaimDialog, setShowNewClaimDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('liste');

  const [newClaim, setNewClaim] = useState({
    shipmentRef: '',
    type: '' as ClaimType | '',
    priority: '' as Priority | '',
    description: '',
    claimedAmount: '',
    assignedTo: '',
  });

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const totalClaims = claims.length;
  const enCours = claims.filter((c) => c.status === 'ouverte' || c.status === 'en_cours').length;
  const resolues = claims.filter((c) => c.status === 'resolue').length;
  const resolutionRate = totalClaims > 0 ? ((resolues / totalClaims) * 100) : 0;
  const totalClaimed = claims.reduce((a, b) => a + b.claimedAmount, 0);

  // ─── SLA calculations ───────────────────────────────────────────────────

  const overdueClaims = claims.filter((c) => {
    if (c.status === 'resolue' || c.status === 'rejetee') return false;
    return new Date(c.slaDeadline) < new Date();
  });

  const slaCompliance = totalClaims > 0
    ? (((totalClaims - overdueClaims.length) / totalClaims) * 100)
    : 100;

  const avgDaysToResolution = claims.filter(c => c.status === 'resolue').length > 0
    ? claims.filter(c => c.status === 'resolue').reduce((a, b) => a + b.daysOpen, 0) / claims.filter(c => c.status === 'resolue').length
    : 0;

  const avgTimeToFirstResponse = 1.5; // mock

  const topClients = useMemo(() => {
    const countMap: Record<string, number> = {};
    claims.forEach((c) => {
      countMap[c.clientName] = (countMap[c.clientName] || 0) + 1;
    });
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [claims]);

  // ─── Filtered claims ──────────────────────────────────────────────────

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        c.claimNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q);
      const matchStatus = !filterStatus || c.status === filterStatus;
      const matchType = !filterType || c.type === filterType;
      const matchTransport = !filterTransport || c.transportMode === filterTransport;
      const matchPriority = !filterPriority || c.priority === filterPriority;
      return matchSearch && matchStatus && matchType && matchTransport && matchPriority;
    });
  }, [claims, searchQuery, filterStatus, filterType, filterTransport, filterPriority]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetailDialog(true);
  };

  const handleAddClaim = () => {
    if (!newClaim.type || !newClaim.priority || !newClaim.description) return;
    const claim: Claim = {
      id: `rec${claims.length + 1}`,
      claimNumber: `REC-2026-${String(claims.length + 1).padStart(3, '0')}`,
      clientName: 'Client à déterminer',
      type: newClaim.type as ClaimType,
      transportMode: 'terrestre',
      description: newClaim.description,
      claimedAmount: parseFloat(newClaim.claimedAmount) || 0,
      status: 'ouverte',
      priority: newClaim.priority as Priority,
      date: new Date().toISOString().split('T')[0],
      shipmentRef: newClaim.shipmentRef,
      assignedTo: newClaim.assignedTo || 'Non assigné',
      timeline: [
        { date: new Date().toISOString().split('T')[0], status: 'Soumis', description: 'Réclamation déposée', actor: 'Système' },
      ],
      evidence: [],
      communications: [],
      slaDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysOpen: 0,
    };
    setClaims([claim, ...claims]);
    setShowNewClaimDialog(false);
    setNewClaim({ shipmentRef: '', type: '', priority: '', description: '', claimedAmount: '', assignedTo: '' });
  };

  const handleClaimAction = (action: 'approuver' | 'rejeter' | 'demander_info' | 'escalader') => {
    if (!selectedClaim) return;
    const updated = claims.map((c) => {
      if (c.id !== selectedClaim.id) return c;
      const newTimeline = [...c.timeline];
      let newStatus = c.status;
      switch (action) {
        case 'approuver':
          newStatus = 'resolue';
          newTimeline.push({ date: new Date().toISOString().split('T')[0], status: 'Résolu', description: 'Réclamation approuvée et résolue', actor: 'Direction' });
          break;
        case 'rejeter':
          newStatus = 'rejetee';
          newTimeline.push({ date: new Date().toISOString().split('T')[0], status: 'Rejeté', description: 'Réclamation rejetée', actor: 'Direction' });
          break;
        case 'demander_info':
          newTimeline.push({ date: new Date().toISOString().split('T')[0], status: 'Info demandée', description: 'Informations complémentaires demandées', actor: c.assignedTo });
          break;
        case 'escalader':
          newStatus = 'en_resolution';
          newTimeline.push({ date: new Date().toISOString().split('T')[0], status: 'Escaladé', description: 'Réclamation escaladée à la direction', actor: c.assignedTo });
          break;
      }
      return { ...c, status: newStatus, timeline: newTimeline };
    });
    setClaims(updated);
    const updatedClaim = updated.find((c) => c.id === selectedClaim.id);
    if (updatedClaim) setSelectedClaim(updatedClaim);
  };

  const hasActiveFilters = filterStatus || filterType || filterTransport || filterPriority;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setFilterTransport('');
    setFilterPriority('');
    setSearchQuery('');
  };

  const handleExportCSV = () => {
    const headers = ['N° Réclamation', 'Client', 'Type', 'Mode Transport', `Montant Réclamé (${symbol})`, 'Statut', 'Priorité', 'Date', 'Expédition', 'Assigné à', 'Jours Ouverts'];
    const rows = filteredClaims.map(c => [
      c.claimNumber,
      c.clientName,
      claimTypeLabels[c.type] || c.type,
      transportModeLabels[c.transportMode] || c.transportMode,
      String(c.claimedAmount),
      claimStatusLabels[c.status] || c.status,
      priorityLabels[c.priority] || c.priority,
      c.date,
      c.shipmentRef,
      c.assignedTo,
      String(c.daysOpen),
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-claims-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── KPI cards config ───────────────────────────────────────────────────

  const kpiCards = [
    {
      title: 'Total réclamations',
      value: totalClaims,
      icon: AlertCircle,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'En cours',
      value: enCours,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Résolues',
      value: resolues,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Taux de résolution',
      value: `${resolutionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Montant total réclamé',
      value: formatPrice(totalClaimed),
      icon: Shield,
      color: 'from-red-500 to-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-teal-500" />
            Gestion des Réclamations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suivez et gérez les réclamations clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button
            size="sm"
            className="text-xs text-white"
            style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            onClick={() => setShowNewClaimDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle réclamation
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {typeof card.value === 'number'
                        ? card.value.toLocaleString('fr-FR')
                        : card.value}
                    </p>
                  </div>
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="liste">Liste des réclamations</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="sla">Suivi SLA</TabsTrigger>
        </TabsList>

        {/* ─── Claims List Tab ─────────────────────────────────────────────── */}
        <TabsContent value="liste" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° réclamation ou client..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
                    <SelectTrigger className="text-xs">
                      <Filter className="w-3 h-3 mr-1 text-gray-400" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="ouverte">Ouverte</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="en_resolution">En résolution</SelectItem>
                      <SelectItem value="resolue">Résolue</SelectItem>
                      <SelectItem value="rejetee">Rejetée</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="endommage">Endommagé</SelectItem>
                      <SelectItem value="perdu">Perdu</SelectItem>
                      <SelectItem value="en_retard">En retard</SelectItem>
                      <SelectItem value="incorrect">Incorrect</SelectItem>
                      <SelectItem value="facturation">Facturation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterTransport} onValueChange={(v) => setFilterTransport(v === 'all' ? '' : v)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les modes</SelectItem>
                      <SelectItem value="maritime">Maritime</SelectItem>
                      <SelectItem value="aerien">Aérien</SelectItem>
                      <SelectItem value="terrestre">Terrestre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v === 'all' ? '' : v)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes priorités</SelectItem>
                      <SelectItem value="critique">Critique</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="moyenne">Moyenne</SelectItem>
                      <SelectItem value="basse">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                      Filtres actifs
                    </Badge>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                    >
                      Effacer les filtres
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Claims Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Réclamation</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Transport</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Description</TableHead>
                      <TableHead className="text-xs">Montant</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Priorité</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          Aucune réclamation trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => {
                        const TransportIcon = getTransportIcon(claim.transportMode);
                        const TypeIcon = getTypeIcon(claim.type);
                        return (
                          <TableRow key={claim.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => handleViewDetail(claim)}>
                            <TableCell className="font-mono text-xs font-semibold">
                              {claim.claimNumber}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {claim.clientName}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1.5">
                                <TypeIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${claimTypeColors[claim.type]}`}>
                                  {claimTypeLabels[claim.type]}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1.5">
                                <TransportIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs">{transportModeLabels[claim.transportMode]}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs hidden xl:table-cell max-w-[200px] truncate">
                              {claim.description}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              {formatPrice(claim.claimedAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${claimStatusColors[claim.status]}`}>
                                {claimStatusLabels[claim.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${priorityColors[claim.priority]}`}>
                                {priorityLabels[claim.priority]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs hidden md:table-cell">
                              {formatDate(claim.date)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleViewDetail(claim); }}>
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  {filteredClaims.length} réclamation{filteredClaims.length > 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Analytics Tab ──────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Claims by type - Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Réclamations par type</CardTitle>
                <CardDescription>Répartition des réclamations selon leur nature</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={claimsByTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {claimsByTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value}`, name]}
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        formatter={(value: string) => value}
                        iconType="circle"
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Claims by month - Line */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tendance mensuelle</CardTitle>
                <CardDescription>Évolution des réclamations par mois</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={claimsByMonthData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reclamations"
                        stroke="#0d9488"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#0d9488' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Resolution by transport - Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Taux de résolution par mode de transport</CardTitle>
                <CardDescription>Pourcentage de réclamations résolues par mode</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resolutionByTransportData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="mode"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, 'Taux']}
                        contentStyle={{
                          backgroundColor: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="taux" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 clients + Avg resolution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 5 clients par réclamations</CardTitle>
                <CardDescription>Clients ayant le plus de réclamations</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {topClients.map(([name, count], index) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400 dark:bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(count / (topClients[0]?.[1] || 1)) * 100}%`,
                              background: index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#0d9488',
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Temps moyen de résolution</span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{avgDaysToResolution.toFixed(1)} jours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── SLA Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="sla" className="space-y-4">
          {/* SLA KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Conformité SLA</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{slaCompliance.toFixed(1)}%</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Objectif : résolution sous 30 jours</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${slaCompliance >= 80 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {slaCompliance >= 80 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Réclamations en retard</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">{overdueClaims.length}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Dépassant le délai SLA</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temps moyen 1ère réponse</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{avgTimeToFirstResponse} j</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Délai de première réaction</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temps moyen de résolution</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{avgDaysToResolution.toFixed(1)} j</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Sur réclamations résolues</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Overdue claims list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Réclamations en retard SLA
              </CardTitle>
              <CardDescription>Réclamations dépassant le délai de résolution de 30 jours</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueClaims.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune réclamation en retard</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Toutes les réclamations sont dans les délais SLA</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {overdueClaims.map((claim) => (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          En retard
                        </Badge>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{claim.claimNumber}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{claim.clientName} — {claimTypeLabels[claim.type]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400">{claim.daysOpen} jours</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">Échéance : {formatDate(claim.slaDeadline)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SLA by status breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Répartition par statut</CardTitle>
              <CardDescription>Vue d&apos;ensemble des réclamations par statut actuel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(['ouverte', 'en_cours', 'en_resolution', 'resolue', 'rejetee'] as ClaimStatus[]).map((status) => {
                  const count = claims.filter((c) => c.status === status).length;
                  const pct = totalClaims > 0 ? (count / totalClaims) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 min-w-[90px] justify-center ${claimStatusColors[status]}`}>
                        {claimStatusLabels[status]}
                      </Badge>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                          className="h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            background: status === 'resolue' ? '#059669' : status === 'rejetee' ? '#ef4444' : status === 'en_cours' ? '#eab308' : status === 'en_resolution' ? '#8b5cf6' : '#0d9488',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Claim Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedClaim && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg">{selectedClaim.claimNumber}</DialogTitle>
                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${claimStatusColors[selectedClaim.status]}`}>
                    {claimStatusLabels[selectedClaim.status]}
                  </Badge>
                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${priorityColors[selectedClaim.priority]}`}>
                    {priorityLabels[selectedClaim.priority]}
                  </Badge>
                </div>
                <DialogDescription>
                  {selectedClaim.clientName} — {formatDate(selectedClaim.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Claim info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Client</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{selectedClaim.clientName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Type</p>
                    <div className="flex items-center gap-1">
                      {React.createElement(getTypeIcon(selectedClaim.type), { className: 'w-3.5 h-3.5 text-gray-500' })}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{claimTypeLabels[selectedClaim.type]}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Mode de transport</p>
                    <div className="flex items-center gap-1">
                      {React.createElement(getTransportIcon(selectedClaim.transportMode), { className: 'w-3.5 h-3.5 text-gray-500' })}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{transportModeLabels[selectedClaim.transportMode]}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Montant réclamé</p>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">{formatPrice(selectedClaim.claimedAmount)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Expédition</p>
                    <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{selectedClaim.shipmentRef}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Assigné à</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{selectedClaim.assignedTo}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{selectedClaim.description}</p>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Chronologie</h4>
                  <div className="space-y-0">
                    {selectedClaim.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            idx === selectedClaim.timeline.length - 1
                              ? 'bg-teal-500 border-teal-500'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                          }`} />
                          {idx < selectedClaim.timeline.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{event.status}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{event.description}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(event.date)} — {event.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affected Shipment */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Expédition concernée</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-3">
                    <Package className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{selectedClaim.shipmentRef}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Mode : {transportModeLabels[selectedClaim.transportMode]}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preuves ({selectedClaim.evidence.length})</h4>
                  {selectedClaim.evidence.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">Aucune preuve déposée</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedClaim.evidence.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          {ev.type === 'photo' ? (
                            <FileImage className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-gray-900 dark:text-white truncate">{ev.name}</p>
                            <p className="text-[9px] text-gray-400">{formatDate(ev.uploadedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Communications */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Communications ({selectedClaim.communications.length})
                  </h4>
                  {selectedClaim.communications.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">Aucune communication</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedClaim.communications.map((comm) => (
                        <div key={comm.id} className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">{comm.from} → {comm.to}</p>
                            <p className="text-[9px] text-gray-400">{formatDate(comm.date)}</p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{comm.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolution details */}
                {(selectedClaim.status === 'resolue' || selectedClaim.status === 'rejetee') && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
                    <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                      {selectedClaim.status === 'resolue' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {selectedClaim.status === 'resolue' ? 'Résolution' : 'Motif de rejet'}
                    </h4>
                    {selectedClaim.resolutionAmount && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                        <span className="font-semibold">Montant indemnisation :</span> {formatPrice(selectedClaim.resolutionAmount)}
                      </p>
                    )}
                    {selectedClaim.resolutionDate && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                        <span className="font-semibold">Date :</span> {formatDate(selectedClaim.resolutionDate)}
                      </p>
                    )}
                    {selectedClaim.resolutionNote && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selectedClaim.resolutionNote}</p>
                    )}
                  </div>
                )}

                {/* SLA info */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Délai SLA</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {selectedClaim.daysOpen} / 30 jours
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Échéance</p>
                    <p className={`text-xs font-semibold ${
                      new Date(selectedClaim.slaDeadline) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatDate(selectedClaim.slaDeadline)}
                    </p>
                  </div>
                  {new Date(selectedClaim.slaDeadline) < new Date() && selectedClaim.status !== 'resolue' && selectedClaim.status !== 'rejetee' && (
                    <Badge className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      En retard
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {selectedClaim.status !== 'resolue' && selectedClaim.status !== 'rejetee' && (
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    className="text-xs text-white flex-1"
                    style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                    onClick={() => handleClaimAction('approuver')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs flex-1"
                    onClick={() => handleClaimAction('rejeter')}
                  >
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1"
                    onClick={() => handleClaimAction('demander_info')}
                  >
                    <Info className="w-3.5 h-3.5 mr-1" />
                    Demander info
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    onClick={() => handleClaimAction('escalader')}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                    Escalader
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── New Claim Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showNewClaimDialog} onOpenChange={setShowNewClaimDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle réclamation</DialogTitle>
            <DialogDescription>Enregistrer une nouvelle réclamation client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Expédition concernée</Label>
              <Select value={newClaim.shipmentRef} onValueChange={(v) => setNewClaim({ ...newClaim, shipmentRef: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une expédition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FFP-0001-2026">FFP-0001-2026 — Sarl TechnoPlus</SelectItem>
                  <SelectItem value="FFP-0003-2026">FFP-0003-2026 — Mohamed Amrani</SelectItem>
                  <SelectItem value="FFP-0005-2026">FFP-0005-2026 — SPA HydroServices</SelectItem>
                  <SelectItem value="FFP-0006-2026">FFP-0006-2026 — EURL BatiPlus</SelectItem>
                  <SelectItem value="FFP-0007-2026">FFP-0007-2026 — Nadia Benmoussa</SelectItem>
                  <SelectItem value="FFP-0010-2026">FFP-0010-2026 — SPA HydroServices</SelectItem>
                  <SelectItem value="FFP-0014-2026">FFP-0014-2026 — Karim Djebbar</SelectItem>
                  <SelectItem value="FFP-0016-2026">FFP-0016-2026 — Sarl AgriPro</SelectItem>
                  <SelectItem value="FFP-0018-2026">FFP-0018-2026 — Mohamed Amrani</SelectItem>
                  <SelectItem value="FFP-0019-2026">FFP-0019-2026 — Amina Zeroual</SelectItem>
                  <SelectItem value="FFP-0021-2026">FFP-0021-2026 — Entreprise Bouzidi & Fils</SelectItem>
                  <SelectItem value="FFP-0022-2026">FFP-0022-2026 — Karim Djebbar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type de réclamation</Label>
              <Select value={newClaim.type} onValueChange={(v) => setNewClaim({ ...newClaim, type: v as ClaimType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="endommage">Endommagé</SelectItem>
                  <SelectItem value="perdu">Perdu</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                  <SelectItem value="incorrect">Incorrect</SelectItem>
                  <SelectItem value="facturation">Facturation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Priorité</Label>
              <Select value={newClaim.priority} onValueChange={(v) => setNewClaim({ ...newClaim, priority: v as Priority })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critique">Critique</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={newClaim.description}
                onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                placeholder="Décrivez la réclamation en détail..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">{`Montant estimé (${symbol})`}</Label>
                <Input
                  type="number"
                  value={newClaim.claimedAmount}
                  onChange={(e) => setNewClaim({ ...newClaim, claimedAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Assigner à</Label>
                <Select value={newClaim.assignedTo} onValueChange={(v) => setNewClaim({ ...newClaim, assignedTo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ahmed Benali">Ahmed Benali</SelectItem>
                    <SelectItem value="Fatima Khelifi">Fatima Khelifi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Preuves (photos, documents)</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-teal-400 dark:hover:border-teal-500 transition-colors cursor-pointer">
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Cliquez ou glissez vos fichiers ici</p>
                <p className="text-[9px] text-gray-400">(Simulation — aucun fichier ne sera uploadé)</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewClaimDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddClaim}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              <Send className="w-4 h-4 mr-1" />
              Soumettre la réclamation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
