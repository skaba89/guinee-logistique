'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  FileText,
  Clock,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  Ship,
  Plane,
  Truck,
  MapPin,
  Calendar,
  Weight,
  Eye,
  MessageSquare,
  Ticket,
  CheckCircle2,
  XCircle,
  Timer,
  ArrowUpDown,
  Paperclip,
  Send,
  FileDown,
  Shield,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCurrency } from '@/lib/use-currency';

// ─── Types ───────────────────────────────────────────────────────────────────

type PortalShipmentStatus = 'en_attente' | 'confirmee' | 'en_transit' | 'livree' | 'retardee' | 'annulee';
type PortalShipmentType = 'maritime' | 'aerien' | 'terrestre';
type PortalInvoiceStatus = 'payee' | 'en_attente' | 'en_retard' | 'annulee';
type PortalQuotationStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
type TicketType = 'reclamation' | 'question' | 'incident' | 'facturation' | 'douane';
type TicketPriority = 'basse' | 'moyenne' | 'haute' | 'urgente';
type TicketStatus = 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
type DocumentType = 'bl' | 'facture' | 'douane' | 'assurance' | 'packing_list' | 'certificat';

interface PortalShipment {
  id: string;
  trackingNumber: string;
  type: PortalShipmentType;
  status: PortalShipmentStatus;
  origin: string;
  destination: string;
  weight: number;
  dateCreation: string;
  dateExpedition: string;
  dateLivraisonEstimee: string;
  price: number;
  notes: string;
  progress: number;
  timeline: { date: string; event: string; location: string; completed: boolean }[];
}

interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: PortalInvoiceStatus;
  dateEmission: string;
  dateEcheance: string;
  shipmentRefs: string[];
  description: string;
}

interface PortalQuotation {
  id: string;
  quoteNumber: string;
  freightType: PortalShipmentType;
  origin: string;
  destination: string;
  weight: number;
  estimatedAmount: number;
  status: PortalQuotationStatus;
  createdAt: string;
  validUntil: string;
  notes: string;
}

interface PortalTicket {
  id: string;
  ticketNumber: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  shipmentRef?: string;
  responses: { date: string; author: string; message: string }[];
}

interface PortalDocument {
  id: string;
  name: string;
  type: DocumentType;
  shipmentRef: string;
  date: string;
  fileSize: string;
  downloadable: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockShipments: PortalShipment[] = [
  {
    id: 'ps1',
    trackingNumber: 'FFP-0002-2026',
    type: 'maritime',
    status: 'en_transit',
    origin: 'Alger',
    destination: 'Marseille',
    weight: 1200,
    dateCreation: '2026-01-10',
    dateExpedition: '2026-01-12',
    dateLivraisonEstimee: '2026-03-18',
    price: 285000,
    notes: 'Conteneur marchandises diverses',
    progress: 65,
    timeline: [
      { date: '2026-01-10', event: 'Commande créée', location: 'Alger', completed: true },
      { date: '2026-01-12', event: 'Marchandises réceptionnées', location: 'Port d\'Alger', completed: true },
      { date: '2026-01-15', event: 'Chargement conteneur', location: 'Port d\'Alger', completed: true },
      { date: '2026-01-18', event: 'Départ navire', location: 'Port d\'Alger', completed: true },
      { date: '2026-03-10', event: 'Transit Méditerranée', location: 'En mer', completed: true },
      { date: '2026-03-18', event: 'Arrivée prévue', location: 'Port de Marseille', completed: false },
    ],
  },
  {
    id: 'ps2',
    trackingNumber: 'FFP-0007-2026',
    type: 'aerien',
    status: 'en_transit',
    origin: 'Istanbul',
    destination: 'Casablanca',
    weight: 8,
    dateCreation: '2026-02-15',
    dateExpedition: '2026-02-16',
    dateLivraisonEstimee: '2026-03-07',
    price: 85000,
    notes: 'Colis urgent - médicaments',
    progress: 80,
    timeline: [
      { date: '2026-02-15', event: 'Commande créée', location: 'Istanbul', completed: true },
      { date: '2026-02-16', event: 'Colis collecté', location: 'Istanbul', completed: true },
      { date: '2026-02-16', event: 'En vol', location: 'Istanbul → Casablanca', completed: true },
      { date: '2026-03-07', event: 'Arrivée prévue', location: 'Casablanca', completed: false },
    ],
  },
  {
    id: 'ps3',
    trackingNumber: 'FFP-0005-2026',
    type: 'terrestre',
    status: 'retardee',
    origin: 'Rotterdam',
    destination: 'Milan',
    weight: 850,
    dateCreation: '2026-02-05',
    dateExpedition: '2026-02-07',
    dateLivraisonEstimee: '2026-03-09',
    price: 950000,
    notes: 'Retard dû aux conditions météo',
    progress: 45,
    timeline: [
      { date: '2026-02-05', event: 'Commande créée', location: 'Rotterdam', completed: true },
      { date: '2026-02-07', event: 'Chargement camion', location: 'Rotterdam', completed: true },
      { date: '2026-02-08', event: 'Passage frontière', location: 'Belgique', completed: true },
      { date: '2026-02-10', event: 'Retard - conditions météo', location: 'Suisse', completed: true },
      { date: '2026-03-09', event: 'Arrivée prévue (retard)', location: 'Milan', completed: false },
    ],
  },
  {
    id: 'ps4',
    trackingNumber: 'FFP-0011-2026',
    type: 'terrestre',
    status: 'en_transit',
    origin: 'Tunis',
    destination: 'Alger',
    weight: 180,
    dateCreation: '2026-03-10',
    dateExpedition: '2026-03-11',
    dateLivraisonEstimee: '2026-03-14',
    price: 280000,
    notes: 'Produits artisanaux',
    progress: 70,
    timeline: [
      { date: '2026-03-10', event: 'Commande créée', location: 'Tunis', completed: true },
      { date: '2026-03-11', event: 'Départ', location: 'Tunis', completed: true },
      { date: '2026-03-12', event: 'Passage frontière', location: 'Oujda', completed: true },
      { date: '2026-03-14', event: 'Arrivée prévue', location: 'Alger', completed: false },
    ],
  },
  {
    id: 'ps5',
    trackingNumber: 'FFP-0001-2026',
    type: 'aerien',
    status: 'livree',
    origin: 'Alger',
    destination: 'Paris',
    weight: 45.5,
    dateCreation: '2026-01-05',
    dateExpedition: '2026-01-06',
    dateLivraisonEstimee: '2026-01-08',
    price: 350000,
    notes: 'Matériel informatique fragile',
    progress: 100,
    timeline: [
      { date: '2026-01-05', event: 'Commande créée', location: 'Alger', completed: true },
      { date: '2026-01-06', event: 'En vol', location: 'Alger → Paris', completed: true },
      { date: '2026-01-07', event: 'Arrivé à destination', location: 'Paris CDG', completed: true },
      { date: '2026-01-08', event: 'Livré', location: 'Paris', completed: true },
    ],
  },
  {
    id: 'ps6',
    trackingNumber: 'FFP-0015-2026',
    type: 'aerien',
    status: 'en_transit',
    origin: 'Londres',
    destination: 'Le Caire',
    weight: 12,
    dateCreation: '2026-04-01',
    dateExpedition: '2026-04-02',
    dateLivraisonEstimee: '2026-04-04',
    price: 150000,
    notes: 'Échantillons textiles',
    progress: 55,
    timeline: [
      { date: '2026-04-01', event: 'Commande créée', location: 'Londres', completed: true },
      { date: '2026-04-02', event: 'En vol', location: 'Londres → Le Caire', completed: true },
      { date: '2026-04-04', event: 'Arrivée prévue', location: 'Le Caire', completed: false },
    ],
  },
  {
    id: 'ps7',
    trackingNumber: 'FFP-0021-2026',
    type: 'maritime',
    status: 'en_transit',
    origin: 'Alger',
    destination: 'Marseille',
    weight: 1800,
    dateCreation: '2026-04-20',
    dateExpedition: '2026-04-22',
    dateLivraisonEstimee: '2026-05-05',
    price: 3100000,
    notes: 'Conteneur produits chimiques non dangereux',
    progress: 30,
    timeline: [
      { date: '2026-04-20', event: 'Commande créée', location: 'Alger', completed: true },
      { date: '2026-04-22', event: 'Chargement', location: 'Port d\'Alger', completed: true },
      { date: '2026-04-24', event: 'Départ navire', location: 'Port d\'Alger', completed: true },
      { date: '2026-05-05', event: 'Arrivée prévue', location: 'Port de Marseille', completed: false },
    ],
  },
  {
    id: 'ps8',
    trackingNumber: 'FFP-0006-2026',
    type: 'maritime',
    status: 'livree',
    origin: 'Shanghai',
    destination: 'Alger',
    weight: 2500,
    dateCreation: '2026-02-10',
    dateExpedition: '2026-02-12',
    dateLivraisonEstimee: '2026-03-15',
    price: 4200000,
    notes: 'Matériaux de construction',
    progress: 100,
    timeline: [
      { date: '2026-02-10', event: 'Commande créée', location: 'Shanghai', completed: true },
      { date: '2026-02-12', event: 'Chargement conteneur', location: 'Port de Shanghai', completed: true },
      { date: '2026-02-15', event: 'Départ navire', location: 'Shanghai', completed: true },
      { date: '2026-03-10', event: 'Arrivé au port', location: 'Port d\'Alger', completed: true },
      { date: '2026-03-15', event: 'Livré', location: 'Alger', completed: true },
    ],
  },
];

const mockInvoices: PortalInvoice[] = [
  { id: 'pi1', invoiceNumber: 'FAC-2026-0002', amount: 2850000, status: 'payee', dateEmission: '2026-01-10', dateEcheance: '2026-02-10', shipmentRefs: ['FFP-0002-2026'], description: 'Transport maritime Alger → Marseille' },
  { id: 'pi2', invoiceNumber: 'FAC-2026-0007', amount: 85000, status: 'payee', dateEmission: '2026-02-15', dateEcheance: '2026-03-15', shipmentRefs: ['FFP-0007-2026'], description: 'Transport aérien Istanbul → Casablanca' },
  { id: 'pi3', invoiceNumber: 'FAC-2026-0005', amount: 950000, status: 'en_retard', dateEmission: '2026-02-05', dateEcheance: '2026-03-05', shipmentRefs: ['FFP-0005-2026'], description: 'Transport terrestre Rotterdam → Milan' },
  { id: 'pi4', invoiceNumber: 'FAC-2026-0011', amount: 280000, status: 'en_attente', dateEmission: '2026-03-10', dateEcheance: '2026-04-10', shipmentRefs: ['FFP-0011-2026'], description: 'Transport terrestre Tunis → Alger' },
  { id: 'pi5', invoiceNumber: 'FAC-2026-0001', amount: 350000, status: 'payee', dateEmission: '2026-01-05', dateEcheance: '2026-02-05', shipmentRefs: ['FFP-0001-2026'], description: 'Transport aérien Alger → Paris' },
  { id: 'pi6', invoiceNumber: 'FAC-2026-0015', amount: 3100000, status: 'en_attente', dateEmission: '2026-04-20', dateEcheance: '2026-05-20', shipmentRefs: ['FFP-0021-2026'], description: 'Transport maritime Alger → Marseille' },
];

const mockQuotations: PortalQuotation[] = [
  { id: 'pq1', quoteNumber: 'DEV-2026-0002', freightType: 'aerien', origin: 'Dubaï', destination: 'Alger', weight: 45, estimatedAmount: 380000, status: 'envoye', createdAt: '2026-01-20', validUntil: '2026-02-20', notes: 'Matériel informatique urgent' },
  { id: 'pq2', quoteNumber: 'DEV-2026-0007', freightType: 'aerien', origin: 'Paris', destination: 'Alger', weight: 8, estimatedAmount: 72000, status: 'envoye', createdAt: '2026-03-01', validUntil: '2026-04-01', notes: 'Documents et échantillons' },
  { id: 'pq3', quoteNumber: 'DEV-2026-0001', freightType: 'maritime', origin: 'Alger', destination: 'Marseille', weight: 3200, estimatedAmount: 4500000, status: 'accepte', createdAt: '2026-01-15', validUntil: '2026-02-15', notes: 'Conteneur 40ft équipements' },
  { id: 'pq4', quoteNumber: 'DEV-2026-0005', freightType: 'aerien', origin: 'Istanbul', destination: 'Alger', weight: 12, estimatedAmount: 95000, status: 'refuse', createdAt: '2026-02-15', validUntil: '2026-03-15', notes: 'Équipements audiovisuels' },
];

const mockTickets: PortalTicket[] = [
  {
    id: 'pt1', ticketNumber: 'TK-2026-0001', type: 'reclamation', priority: 'haute', status: 'en_cours',
    subject: 'Retard de livraison FFP-0005-2026', description: 'Mon expédition FFP-0005-2026 est en retard depuis plus de 2 semaines. Veuillez me fournir une mise à jour sur le statut.',
    createdAt: '2026-02-15', updatedAt: '2026-02-16', shipmentRef: 'FFP-0005-2026',
    responses: [
      { date: '2026-02-16', author: 'Support LogisWay', message: 'Bonjour, nous vérifions le statut de votre expédition. Le retard est dû à des conditions météorologiques défavorables dans les Alpes. Nous vous tiendrons informé.' },
    ],
  },
  {
    id: 'pt2', ticketNumber: 'TK-2026-0002', type: 'facturation', priority: 'moyenne', status: 'ouvert',
    subject: 'Facture FAC-2026-0005 - Demande de détail', description: 'Je souhaite obtenir le détail des frais sur la facture FAC-2026-0005. Le montant semble plus élevé que prévu.',
    createdAt: '2026-02-20', updatedAt: '2026-02-20', shipmentRef: 'FFP-0005-2026',
    responses: [],
  },
  {
    id: 'pt3', ticketNumber: 'TK-2026-0003', type: 'douane', priority: 'urgente', status: 'en_cours',
    subject: 'Problème de dédouanement FFP-0007-2026', description: 'Le colis FFP-0007-2026 est bloqué en douane à Casablanca. Les documents fournis ne sont pas conformes.',
    createdAt: '2026-03-01', updatedAt: '2026-03-02', shipmentRef: 'FFP-0007-2026',
    responses: [
      { date: '2026-03-02', author: 'Support LogisWay', message: 'Nous avons contacté notre agent en douane à Casablanca. Des documents complémentaires vous seront demandés par email.' },
    ],
  },
  {
    id: 'pt4', ticketNumber: 'TK-2026-0004', type: 'question', priority: 'basse', status: 'resolu',
    subject: 'Question sur l\'assurance transport', description: 'Quelle est la couverture d\'assurance incluse dans mon contrat pour les expéditions maritimes ?',
    createdAt: '2026-01-25', updatedAt: '2026-01-26',
    responses: [
      { date: '2026-01-26', author: 'Support LogisWay', message: 'Votre contrat inclut une assurance tous risques couvrant la valeur déclarée de la marchandise jusqu\'à 150% du CIF. Pour plus de détails, consultez la section assurance de votre portail.' },
    ],
  },
  {
    id: 'pt5', ticketNumber: 'TK-2026-0005', type: 'incident', priority: 'haute', status: 'ouvert',
    subject: 'Colis endommagé FFP-0001-2026', description: 'Le colis FFP-0001-2026 a été livré avec des dommages visibles sur l\'emballage. Le matériel informatique à l\'intérieur semble affecté.',
    createdAt: '2026-03-05', updatedAt: '2026-03-05', shipmentRef: 'FFP-0001-2026',
    responses: [],
  },
];

const mockDocuments: PortalDocument[] = [
  { id: 'pd1', name: 'BL FFP-0002-2026', type: 'bl', shipmentRef: 'FFP-0002-2026', date: '2026-01-12', fileSize: '245 Ko', downloadable: true },
  { id: 'pd2', name: 'Facture FAC-2026-0002', type: 'facture', shipmentRef: 'FFP-0002-2026', date: '2026-01-10', fileSize: '180 Ko', downloadable: true },
  { id: 'pd3', name: 'Déclaration douane FFP-0002', type: 'douane', shipmentRef: 'FFP-0002-2026', date: '2026-01-11', fileSize: '320 Ko', downloadable: true },
  { id: 'pd4', name: 'BL FFP-0007-2026', type: 'bl', shipmentRef: 'FFP-0007-2026', date: '2026-02-16', fileSize: '198 Ko', downloadable: true },
  { id: 'pd5', name: 'Facture FAC-2026-0007', type: 'facture', shipmentRef: 'FFP-0007-2026', date: '2026-02-15', fileSize: '155 Ko', downloadable: true },
  { id: 'pd6', name: 'Certificat assurance FFP-0005', type: 'assurance', shipmentRef: 'FFP-0005-2026', date: '2026-02-07', fileSize: '412 Ko', downloadable: true },
  { id: 'pd7', name: 'Packing list FFP-0001-2026', type: 'packing_list', shipmentRef: 'FFP-0001-2026', date: '2026-01-06', fileSize: '88 Ko', downloadable: true },
  { id: 'pd8', name: 'Certificat origine FFP-0006', type: 'certificat', shipmentRef: 'FFP-0006-2026', date: '2026-02-12', fileSize: '275 Ko', downloadable: true },
  { id: 'pd9', name: 'Déclaration douane FFP-0021', type: 'douane', shipmentRef: 'FFP-0021-2026', date: '2026-04-21', fileSize: '350 Ko', downloadable: false },
  { id: 'pd10', name: 'BL FFP-0021-2026', type: 'bl', shipmentRef: 'FFP-0021-2026', date: '2026-04-22', fileSize: '230 Ko', downloadable: true },
];

// ─── Chart Data ──────────────────────────────────────────────────────────────

const volumeChartData = [
  { month: 'Jan', volume: 3 },
  { month: 'Fév', volume: 2 },
  { month: 'Mar', volume: 4 },
  { month: 'Avr', volume: 3 },
  { month: 'Mai', volume: 5 },
  { month: 'Jun', volume: 2 },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const shipmentStatusLabels: Record<PortalShipmentStatus, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_transit: 'En transit',
  livree: 'Livrée',
  retardee: 'Retardée',
  annulee: 'Annulée',
};

const shipmentStatusColors: Record<PortalShipmentStatus, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const shipmentTypeLabels: Record<PortalShipmentType, string> = {
  maritime: 'Maritime',
  aerien: 'Aérien',
  terrestre: 'Terrestre',
};

const shipmentTypeIcons: Record<PortalShipmentType, React.ElementType> = {
  maritime: Ship,
  aerien: Plane,
  terrestre: Truck,
};

const invoiceStatusLabels: Record<PortalInvoiceStatus, string> = {
  payee: 'Payée',
  en_attente: 'En attente',
  en_retard: 'En retard',
  annulee: 'Annulée',
};

const invoiceStatusColors: Record<PortalInvoiceStatus, string> = {
  payee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_retard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const quotationStatusLabels: Record<PortalQuotationStatus, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  expire: 'Expiré',
};

const quotationStatusColors: Record<PortalQuotationStatus, string> = {
  brouillon: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  envoye: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  accepte: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refuse: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  expire: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const ticketTypeLabels: Record<TicketType, string> = {
  reclamation: 'Réclamation',
  question: 'Question',
  incident: 'Incident',
  facturation: 'Facturation',
  douane: 'Douane',
};

const ticketPriorityLabels: Record<TicketPriority, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
  urgente: 'Urgente',
};

const ticketPriorityColors: Record<TicketPriority, string> = {
  basse: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  moyenne: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ticketStatusLabels: Record<TicketStatus, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Résolu',
  ferme: 'Fermé',
};

const ticketStatusColors: Record<TicketStatus, string> = {
  ouvert: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_cours: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  resolu: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ferme: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const documentTypeLabels: Record<DocumentType, string> = {
  bl: 'Connaissement',
  facture: 'Facture',
  douane: 'Douane',
  assurance: 'Assurance',
  packing_list: 'Packing List',
  certificat: 'Certificat',
};

const documentTypeIcons: Record<DocumentType, string> = {
  bl: '🚢',
  facture: '💰',
  douane: '🛃',
  assurance: '🛡️',
  packing_list: '📋',
  certificat: '📜',
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
};

const ITEMS_PER_PAGE = 6;

// ─── Pagination Component ────────────────────────────────────────────────────

function PaginationControls({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Page {current}/{total}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={current === 1} onClick={() => onChange(current - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
          <Button key={page} variant={page === current ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => onChange(page)}
            style={page === current ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : {}}>
            {page}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={current === total} onClick={() => onChange(current + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CustomerPortalPage() {
  const { format: formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('suivi');
  const [shipments] = useState<PortalShipment[]>(mockShipments);
  const [invoices] = useState<PortalInvoice[]>(mockInvoices);
  const [quotations] = useState<PortalQuotation[]>(mockQuotations);
  const [tickets, setTickets] = useState<PortalTicket[]>(mockTickets);
  const [documents] = useState<PortalDocument[]>(mockDocuments);

  // Search & filter states
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('all');
  const [quotationSearch, setQuotationSearch] = useState('');
  const [quotationFilterStatus, setQuotationFilterStatus] = useState('all');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('all');

  // Pagination
  const [shipmentPage, setShipmentPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const [quotationPage, setQuotationPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);

  // Dialogs
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showShipmentDetail, setShowShipmentDetail] = useState<PortalShipment | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState<PortalInvoice | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState<PortalTicket | null>(null);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    type: 'question' as TicketType,
    priority: 'moyenne' as TicketPriority,
    subject: '',
    description: '',
    shipmentRef: '',
  });

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const activeShipments = shipments.filter(s => ['en_attente', 'confirmee', 'en_transit'].includes(s.status)).length;
  const pendingInvoices = invoices.filter(i => i.status === 'en_attente').length;
  const pendingQuotations = quotations.filter(q => q.status === 'envoye' || q.status === 'brouillon').length;
  const openTickets = tickets.filter(t => ['ouvert', 'en_cours'].includes(t.status)).length;

  const kpiCards = [
    {
      title: 'Mes Expéditions Actives',
      value: String(activeShipments),
      icon: Package,
      color: 'from-teal-500 to-teal-600',
      subtitle: `${shipments.length} total`,
    },
    {
      title: 'Factures en Attente',
      value: String(pendingInvoices),
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      subtitle: formatPrice(invoices.filter(i => i.status === 'en_attente').reduce((a, b) => a + b.amount, 0)),
    },
    {
      title: 'Devis en Cours',
      value: String(pendingQuotations),
      icon: Clock,
      color: 'from-emerald-500 to-emerald-600',
      subtitle: `${quotations.length} total`,
    },
    {
      title: 'Tickets Ouverts',
      value: String(openTickets),
      icon: MessageSquare,
      color: 'from-rose-500 to-rose-600',
      subtitle: tickets.filter(t => t.priority === 'urgente').length > 0 ? `${tickets.filter(t => t.priority === 'urgente').length} urgent(s)` : 'Aucun urgent',
    },
  ];

  // ─── Filtered Data ───────────────────────────────────────────────────────

  const filteredShipments = useMemo(() => {
    let result = [...shipments];
    if (shipmentFilterStatus !== 'all') {
      result = result.filter(s => s.status === shipmentFilterStatus);
    }
    if (shipmentSearch) {
      const q = shipmentSearch.toLowerCase();
      result = result.filter(s =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [shipments, shipmentFilterStatus, shipmentSearch]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    if (invoiceFilterStatus !== 'all') {
      result = result.filter(i => i.status === invoiceFilterStatus);
    }
    if (invoiceSearch) {
      const q = invoiceSearch.toLowerCase();
      result = result.filter(i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime());
  }, [invoices, invoiceFilterStatus, invoiceSearch]);

  const filteredQuotations = useMemo(() => {
    let result = [...quotations];
    if (quotationFilterStatus !== 'all') {
      result = result.filter(q => q.status === quotationFilterStatus);
    }
    if (quotationSearch) {
      const q = quotationSearch.toLowerCase();
      result = result.filter(qt =>
        qt.quoteNumber.toLowerCase().includes(q) ||
        qt.origin.toLowerCase().includes(q) ||
        qt.destination.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotations, quotationFilterStatus, quotationSearch]);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (ticketFilterStatus !== 'all') {
      result = result.filter(t => t.status === ticketFilterStatus);
    }
    if (ticketSearch) {
      const q = ticketSearch.toLowerCase();
      result = result.filter(t =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, ticketFilterStatus, ticketSearch]);

  // Paginated slices
  const paginatedShipments = filteredShipments.slice((shipmentPage - 1) * ITEMS_PER_PAGE, shipmentPage * ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice((invoicePage - 1) * ITEMS_PER_PAGE, invoicePage * ITEMS_PER_PAGE);
  const paginatedQuotations = filteredQuotations.slice((quotationPage - 1) * ITEMS_PER_PAGE, quotationPage * ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice((ticketPage - 1) * ITEMS_PER_PAGE, ticketPage * ITEMS_PER_PAGE);

  const shipmentTotalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE);
  const invoiceTotalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const quotationTotalPages = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE);
  const ticketTotalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCreateTicket = () => {
    const ticket: PortalTicket = {
      id: `pt${tickets.length + 1}`,
      ticketNumber: `TK-2026-${String(tickets.length + 1).padStart(4, '0')}`,
      type: newTicket.type,
      priority: newTicket.priority,
      status: 'ouvert',
      subject: newTicket.subject,
      description: newTicket.description,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      shipmentRef: newTicket.shipmentRef || undefined,
      responses: [],
    };
    setTickets([ticket, ...tickets]);
    setShowTicketDialog(false);
    setNewTicket({
      type: 'question',
      priority: 'moyenne',
      subject: '',
      description: '',
      shipmentRef: '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['N° Suivi', 'Type', 'Statut', 'Origine', 'Destination', 'Poids (kg)', 'Prix (DA)', 'Date Création', 'Livraison Estimée', 'Notes'];
    const rows = filteredShipments.map(s => [
      s.trackingNumber,
      shipmentTypeLabels[s.type] || s.type,
      shipmentStatusLabels[s.status] || s.status,
      s.origin,
      s.destination,
      String(s.weight),
      String(s.price),
      s.dateCreation,
      s.dateLivraisonEstimee,
      s.notes,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-customer-portal-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            Portail Client
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bienvenue, Entreprise Bouzidi & Fils — Suivez vos expéditions, factures et demandes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => { setActiveTab('support'); setShowTicketDialog(true); }}>
            <Plus className="w-4 h-4 mr-1" />
            Nouveau ticket
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 truncate">{card.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{card.subtitle}</p>
                  </div>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 ml-2`}>
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Shipment Volume Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume d&apos;expéditions par mois</CardTitle>
            <CardDescription>Nombre d&apos;expéditions sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Expéditions']}
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#0d9488" strokeWidth={2} fill="url(#volumeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4" style={{ background: 'rgba(15, 23, 42, 0.05)' }}>
          <TabsTrigger value="suivi" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-1 hidden sm:inline" />
            Suivi
          </TabsTrigger>
          <TabsTrigger value="factures" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
            Factures
          </TabsTrigger>
          <TabsTrigger value="devis" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <ArrowUpDown className="w-4 h-4 mr-1 hidden sm:inline" />
            Devis
          </TabsTrigger>
          <TabsTrigger value="support" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-1 hidden sm:inline" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* ─── Suivi Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="suivi" className="mt-4 space-y-4">
          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° suivi, origine, destination..."
                    className="pl-9"
                    value={shipmentSearch}
                    onChange={(e) => { setShipmentSearch(e.target.value); setShipmentPage(1); }}
                  />
                </div>
                <Select value={shipmentFilterStatus} onValueChange={(v) => { setShipmentFilterStatus(v); setShipmentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="confirmee">Confirmée</SelectItem>
                    <SelectItem value="en_transit">En transit</SelectItem>
                    <SelectItem value="livree">Livrée</SelectItem>
                    <SelectItem value="retardee">Retardée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Shipments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {paginatedShipments.map((shipment, idx) => {
                const TypeIcon = shipmentTypeIcons[shipment.type];
                return (
                  <motion.div
                    key={shipment.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowShipmentDetail(shipment)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600">
                              <TypeIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{shipment.trackingNumber}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{shipmentTypeLabels[shipment.type]}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${shipmentStatusColors[shipment.status]}`}>
                            {shipmentStatusLabels[shipment.status]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {shipment.origin} → {shipment.destination}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Progression</span>
                            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">{shipment.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: 'linear-gradient(90deg, #0d9488, #059669)' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${shipment.progress}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">ETA: {formatDate(shipment.dateLivraisonEstimee)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Weight className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">{shipment.weight} kg</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredShipments.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                Aucune expédition trouvée
              </CardContent>
            </Card>
          )}

          <Card>
            <PaginationControls current={shipmentPage} total={shipmentTotalPages} onChange={setShipmentPage} />
          </Card>

          {/* Documents section under Suivi */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-teal-600" />
                Mes Documents
              </CardTitle>
              <CardDescription>Connaissements, factures, documents douaniers</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Document</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Expédition</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Taille</TableHead>
                      <TableHead className="text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span>{documentTypeIcons[doc.type]}</span>
                            <span className="truncate max-w-[160px]">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                            {documentTypeLabels[doc.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono hidden sm:table-cell">{doc.shipmentRef}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{formatDate(doc.date)}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{doc.fileSize}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            disabled={!doc.downloadable}
                            style={doc.downloadable ? { color: '#0d9488' } : {}}
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            {doc.downloadable ? 'Télécharger' : 'Bientôt'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Factures Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="factures" className="mt-4 space-y-4">
          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° facture ou description..."
                    className="pl-9"
                    value={invoiceSearch}
                    onChange={(e) => { setInvoiceSearch(e.target.value); setInvoicePage(1); }}
                  />
                </div>
                <Select value={invoiceFilterStatus} onValueChange={(v) => { setInvoiceFilterStatus(v); setInvoicePage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="payee">Payée</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="en_retard">En retard</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoice summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Total Facturé</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(invoices.reduce((a, b) => a + b.amount, 0))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Payé</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatPrice(invoices.filter(i => i.status === 'payee').reduce((a, b) => a + b.amount, 0))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">En Retard</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatPrice(invoices.filter(i => i.status === 'en_retard').reduce((a, b) => a + b.amount, 0))}</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Facture</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Montant</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Émission</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Échéance</TableHead>
                      <TableHead className="text-xs">Détail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                          Aucune facture trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-xs font-semibold">{invoice.invoiceNumber}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{invoice.description}</TableCell>
                          <TableCell className="text-xs font-semibold">{formatPrice(invoice.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${invoiceStatusColors[invoice.status]}`}>
                              {invoiceStatusLabels[invoice.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">{formatDate(invoice.dateEmission)}</TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            <span className={invoice.status === 'en_retard' ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                              {formatDate(invoice.dateEcheance)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20" onClick={() => setShowInvoiceDetail(invoice)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls current={invoicePage} total={invoiceTotalPages} onChange={setInvoicePage} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Devis Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="devis" className="mt-4 space-y-4">
          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° devis, origine ou destination..."
                    className="pl-9"
                    value={quotationSearch}
                    onChange={(e) => { setQuotationSearch(e.target.value); setQuotationPage(1); }}
                  />
                </div>
                <Select value={quotationFilterStatus} onValueChange={(v) => { setQuotationFilterStatus(v); setQuotationPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="envoye">Envoyé</SelectItem>
                    <SelectItem value="accepte">Accepté</SelectItem>
                    <SelectItem value="refuse">Refusé</SelectItem>
                    <SelectItem value="expire">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quotations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedQuotations.length === 0 ? (
              <div className="col-span-2">
                <Card>
                  <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Aucun devis trouvé
                  </CardContent>
                </Card>
              </div>
            ) : (
              paginatedQuotations.map((quotation, idx) => {
                const TypeIcon = shipmentTypeIcons[quotation.freightType];
                return (
                  <motion.div
                    key={quotation.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600">
                              <TypeIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{quotation.quoteNumber}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{shipmentTypeLabels[quotation.freightType]}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${quotationStatusColors[quotation.status]}`}>
                            {quotationStatusLabels[quotation.status]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <p className="text-xs text-gray-700 dark:text-gray-300">{quotation.origin} → {quotation.destination}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Montant estimé</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(quotation.estimatedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Poids</p>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{quotation.weight} kg</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Créé: {formatDate(quotation.createdAt)}</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Valide: {formatDate(quotation.validUntil)}</span>
                          </div>
                          {quotation.status === 'accepte' && (
                            <Badge className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Accepté
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          <Card>
            <PaginationControls current={quotationPage} total={quotationTotalPages} onChange={setQuotationPage} />
          </Card>
        </TabsContent>

        {/* ─── Support Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="support" className="mt-4 space-y-4">
          {/* Search & Filter + New Ticket */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par N° ticket ou sujet..."
                    className="pl-9"
                    value={ticketSearch}
                    onChange={(e) => { setTicketSearch(e.target.value); setTicketPage(1); }}
                  />
                </div>
                <Select value={ticketFilterStatus} onValueChange={(v) => { setTicketFilterStatus(v); setTicketPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="resolu">Résolu</SelectItem>
                    <SelectItem value="ferme">Fermé</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="text-xs text-white whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowTicketDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Nouveau ticket
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-3">
            {paginatedTickets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Aucun ticket trouvé
                </CardContent>
              </Card>
            ) : (
              paginatedTickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTicketDetail(ticket)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            ticket.priority === 'urgente' ? 'bg-red-100 dark:bg-red-900/30' :
                            ticket.priority === 'haute' ? 'bg-orange-100 dark:bg-orange-900/30' :
                            'bg-gray-100 dark:bg-gray-900/30'
                          }`}>
                            <Ticket className={`w-4 h-4 ${
                              ticket.priority === 'urgente' ? 'text-red-600 dark:text-red-400' :
                              ticket.priority === 'haute' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{ticket.ticketNumber}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{ticket.subject}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${ticketStatusColors[ticket.status]}`}>
                            {ticketStatusLabels[ticket.status]}
                          </Badge>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${ticketPriorityColors[ticket.priority]}`}>
                            {ticketPriorityLabels[ticket.priority]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            {ticketTypeLabels[ticket.type]}
                          </Badge>
                          {ticket.shipmentRef && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">Réf: {ticket.shipmentRef}</span>
                          )}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(ticket.createdAt)}</span>
                        </div>
                        {ticket.responses.length > 0 && (
                          <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                            <MessageSquare className="w-3 h-3" />
                            <span className="text-[10px]">{ticket.responses.length}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <Card>
            <PaginationControls current={ticketPage} total={ticketTotalPages} onChange={setTicketPage} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Shipment Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!showShipmentDetail} onOpenChange={(open) => !open && setShowShipmentDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showShipmentDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                    {React.createElement(shipmentTypeIcons[showShipmentDetail.type], { className: 'w-3.5 h-3.5 text-white' })}
                  </div>
                  Suivi {showShipmentDetail.trackingNumber}
                </DialogTitle>
                <DialogDescription>
                  {showShipmentDetail.origin} → {showShipmentDetail.destination}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status & ETA */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={`text-xs px-3 py-1 ${shipmentStatusColors[showShipmentDetail.status]}`}>
                    {shipmentStatusLabels[showShipmentDetail.status]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Timer className="w-3.5 h-3.5" />
                    ETA: {formatDate(showShipmentDetail.dateLivraisonEstimee)}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{showShipmentDetail.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #0d9488, #059669)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${showShipmentDetail.progress}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-xs font-semibold">{shipmentTypeLabels[showShipmentDetail.type]}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Poids</p>
                    <p className="text-xs font-semibold">{showShipmentDetail.weight} kg</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Expédition</p>
                    <p className="text-xs font-semibold">{formatDate(showShipmentDetail.dateExpedition)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Montant</p>
                    <p className="text-xs font-semibold">{formatPrice(showShipmentDetail.price)}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Historique</h4>
                  <div className="space-y-0">
                    {showShipmentDetail.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            event.completed
                              ? 'bg-teal-500'
                              : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                          }`} />
                          {idx < showShipmentDetail.timeline.length - 1 && (
                            <div className={`w-0.5 h-8 ${
                              event.completed ? 'bg-teal-300 dark:bg-teal-700' : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className={`text-xs font-medium ${event.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                            {event.event}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {formatDate(event.date)} — {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {showShipmentDetail.notes && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{showShipmentDetail.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => navigator.clipboard?.writeText(showShipmentDetail.trackingNumber)}>
                  <Copy className="w-3.5 h-3.5" />
                  Copier N°
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Partager
                </Button>
                <Button size="sm" className="text-xs text-white gap-1" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                  <FileDown className="w-3.5 h-3.5" />
                  Télécharger PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Invoice Detail Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!showInvoiceDetail} onOpenChange={(open) => !open && setShowInvoiceDetail(null)}>
        <DialogContent className="max-w-md">
          {showInvoiceDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  {showInvoiceDetail.invoiceNumber}
                </DialogTitle>
                <DialogDescription>{showInvoiceDetail.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Montant</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(showInvoiceDetail.amount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Statut</p>
                    <Badge variant="secondary" className={`text-xs px-2 py-0.5 mt-1 ${invoiceStatusColors[showInvoiceDetail.status]}`}>
                      {invoiceStatusLabels[showInvoiceDetail.status]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-gray-500 dark:text-gray-400">Date d&apos;émission</Label>
                    <p className="text-xs font-medium">{formatDate(showInvoiceDetail.dateEmission)}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500 dark:text-gray-400">Date d&apos;échéance</Label>
                    <p className={`text-xs font-medium ${showInvoiceDetail.status === 'en_retard' ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {formatDate(showInvoiceDetail.dateEcheance)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-gray-500 dark:text-gray-400">Expéditions liées</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {showInvoiceDetail.shipmentRefs.map((ref) => (
                      <Badge key={ref} variant="outline" className="text-[10px] font-mono">
                        {ref}
                      </Badge>
                    ))}
                  </div>
                </div>

                {showInvoiceDetail.status === 'en_retard' && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">Cette facture est en retard de paiement</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <FileDown className="w-3.5 h-3.5" />
                  Télécharger PDF
                </Button>
                {showInvoiceDetail.status === 'en_attente' || showInvoiceDetail.status === 'en_retard' ? (
                  <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                    Payer en ligne
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Ticket Detail Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!showTicketDetail} onOpenChange={(open) => !open && setShowTicketDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {showTicketDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-teal-600" />
                  {showTicketDetail.ticketNumber}
                </DialogTitle>
                <DialogDescription>{showTicketDetail.subject}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${ticketStatusColors[showTicketDetail.status]}`}>
                    {ticketStatusLabels[showTicketDetail.status]}
                  </Badge>
                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${ticketPriorityColors[showTicketDetail.priority]}`}>
                    {ticketPriorityLabels[showTicketDetail.priority]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {ticketTypeLabels[showTicketDetail.type]}
                  </Badge>
                </div>

                {/* Description */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{showTicketDetail.description}</p>
                </div>

                {showTicketDetail.shipmentRef && (
                  <div>
                    <Label className="text-[10px] text-gray-500 dark:text-gray-400">Expédition liée</Label>
                    <p className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">{showTicketDetail.shipmentRef}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-gray-500 dark:text-gray-400">Créé le</Label>
                    <p className="text-xs font-medium">{formatDate(showTicketDetail.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500 dark:text-gray-400">Mis à jour le</Label>
                    <p className="text-xs font-medium">{formatDate(showTicketDetail.updatedAt)}</p>
                  </div>
                </div>

                {/* Responses */}
                {showTicketDetail.responses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Réponses</h4>
                    <div className="space-y-3">
                      {showTicketDetail.responses.map((response, idx) => (
                        <div key={idx} className="p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{response.author}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(response.date)}</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply input */}
                {['ouvert', 'en_cours'].includes(showTicketDetail.status) && (
                  <div className="space-y-2">
                    <Label className="text-xs">Ajouter une réponse</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Votre message..." className="text-xs" />
                      <Button size="sm" className="text-xs text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {['ouvert', 'en_cours'].includes(showTicketDetail.status) && (
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => {
                    setTickets(tickets.map(t => t.id === showTicketDetail.id ? { ...t, status: 'ferme' as TicketStatus } : t));
                    setShowTicketDetail(null);
                  }}>
                    <XCircle className="w-3.5 h-3.5" />
                    Fermer le ticket
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── New Ticket Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              Nouveau ticket
            </DialogTitle>
            <DialogDescription>Soumettez une demande de support ou une réclamation</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={newTicket.type}
                  onValueChange={(v) => setNewTicket({ ...newTicket, type: v as TicketType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="reclamation">Réclamation</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="facturation">Facturation</SelectItem>
                    <SelectItem value="douane">Douane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Priorité</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as TicketPriority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Sujet</Label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Résumez votre demande..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Référence expédition (optionnel)</Label>
              <Select
                value={newTicket.shipmentRef}
                onValueChange={(v) => setNewTicket({ ...newTicket, shipmentRef: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une expédition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {shipments.map(s => (
                    <SelectItem key={s.id} value={s.trackingNumber}>{s.trackingNumber} ({s.origin} → {s.destination})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Décrivez votre demande en détail..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Pièce jointe (optionnel)</Label>
              <div className="border-2 border-dashed dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 dark:hover:border-teal-600 transition-colors">
                <Paperclip className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Cliquez ou glissez un fichier ici</p>
                <p className="text-[10px] text-gray-400">PDF, JPG, PNG (max 5 Mo)</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>Annuler</Button>
            <Button
              onClick={handleCreateTicket}
              className="text-white"
              disabled={!newTicket.subject || !newTicket.description}
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              <Send className="w-4 h-4 mr-1" />
              Soumettre le ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
