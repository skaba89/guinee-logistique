'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  GraduationCap,
  Target,
  Star,
  BarChart3,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plane,
  Ship,
  Truck,
  Warehouse,
  ShieldCheck,
  FileText,
  Award,
  Download,
  MapPin,
  Building2,
  UserPlus,
  Heart,
  Banknote,
  Monitor,
  PieChart as PieChartIcon,
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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useCurrency } from '@/lib/use-currency';

// ─── Types ─────────────────────────────────────────────────────

type EmployeeStatus = 'actif' | 'en_conge' | 'inactif' | 'essai';
type LeaveStatus = 'en_attente' | 'approuve' | 'rejete';
type JobStatus = 'ouvert' | 'en_cours' | 'ferme';
type TrainingStatus = 'planifie' | 'en_cours' | 'termine';

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  departement: string;
  poste: string;
  statut: EmployeeStatus;
  dateEmbauche: string;
  salaire: number;
  email: string;
  telephone: string;
  evaluation: number;
}

interface LeaveRequest {
  id: string;
  employeId: string;
  employeNom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  jours: number;
  statut: LeaveStatus;
  motif: string;
}

interface JobOpening {
  id: string;
  titre: string;
  departement: string;
  statut: JobStatus;
  candidats: number;
  datePublication: string;
  typeContrat: string;
  lieu: string;
}

interface Training {
  id: string;
  titre: string;
  formateur: string;
  dateDebut: string;
  dateFin: string;
  participants: number;
  capacite: number;
  statut: TrainingStatus;
  completion: number;
  categorie: string;
}

interface PerformanceReview {
  id: string;
  employeNom: string;
  poste: string;
  note: number;
  objectifs: number;
  objectifsAtteints: number;
  periode: string;
  statut: 'en_cours' | 'termine';
  commentaire: string;
}

interface PayrollEntry {
  mois: string;
  totalBrut: number;
  totalNet: number;
  charges: number;
  employes: number;
}

// ─── Mock Data ─────────────────────────────────────────────────

const departments = [
  'Fret Maritime',
  'Fret Aérien',
  'Transport Terrestre',
  'Douanes',
  'Entrepôt',
  'Comptabilité',
  'RH',
  'IT',
];

const employees: Employee[] = [
  { id: 'e1', nom: 'Kaci', prenom: 'Rachid', departement: 'Fret Maritime', poste: 'Chef d\'équipe Maritime', statut: 'actif', dateEmbauche: '2020-03-15', salaire: 185000, email: 'r.kaci@logisway.pro', telephone: '0555111222', evaluation: 4.5 },
  { id: 'e2', nom: 'Boudiaf', prenom: 'Nadia', departement: 'Douanes', poste: 'Agent Douanes Senior', statut: 'actif', dateEmbauche: '2021-06-01', salaire: 145000, email: 'n.boudiaf@logisway.pro', telephone: '0555333444', evaluation: 4.2 },
  { id: 'e3', nom: 'Hamdi', prenom: 'Yacine', departement: 'Fret Aérien', poste: 'Responsable Aérien', statut: 'actif', dateEmbauche: '2019-09-20', salaire: 210000, email: 'y.hamdi@logisway.pro', telephone: '0555555666', evaluation: 4.8 },
  { id: 'e4', nom: 'Khelifi', prenom: 'Fatima', departement: 'Transport Terrestre', poste: 'Chef Quart Transport', statut: 'en_conge', dateEmbauche: '2022-01-10', salaire: 155000, email: 'f.khelifi@logisway.pro', telephone: '0555777888', evaluation: 4.0 },
  { id: 'e5', nom: 'Mezdad', prenom: 'Ali', departement: 'Transport Terrestre', poste: 'Conducteur Principal', statut: 'actif', dateEmbauche: '2020-09-01', salaire: 120000, email: 'a.mezdad@logisway.pro', telephone: '0555999000', evaluation: 4.7 },
  { id: 'e6', nom: 'Benali', prenom: 'Sofiane', departement: 'Entrepôt', poste: 'Responsable Entrepôt', statut: 'actif', dateEmbauche: '2021-12-15', salaire: 160000, email: 's.benali@logisway.pro', telephone: '0555121202', evaluation: 4.3 },
  { id: 'e7', nom: 'Djebbar', prenom: 'Karim', departement: 'Fret Aérien', poste: 'Agent Fret Aérien', statut: 'actif', dateEmbauche: '2023-04-01', salaire: 130000, email: 'k.djebbar@logisway.pro', telephone: '0555141516', evaluation: 3.9 },
  { id: 'e8', nom: 'Mansouri', prenom: 'Youcef', departement: 'Comptabilité', poste: 'Comptable Senior', statut: 'actif', dateEmbauche: '2022-08-20', salaire: 140000, email: 'y.mansouri@logisway.pro', telephone: '0555171819', evaluation: 4.1 },
  { id: 'e9', nom: 'Rahmani', prenom: 'Amina', departement: 'RH', poste: 'Responsable RH', statut: 'actif', dateEmbauche: '2019-02-01', salaire: 195000, email: 'a.rahmani@logisway.pro', telephone: '0555202122', evaluation: 4.6 },
  { id: 'e10', nom: 'Talbi', prenom: 'Mourad', departement: 'Entrepôt', poste: 'Manutentionnaire', statut: 'essai', dateEmbauche: '2026-01-15', salaire: 85000, email: 'm.talbi@logisway.pro', telephone: '0555232425', evaluation: 3.5 },
  { id: 'e11', nom: 'Ferhat', prenom: 'Nabil', departement: 'IT', poste: 'Ingénieur Systèmes', statut: 'actif', dateEmbauche: '2021-10-01', salaire: 220000, email: 'n.ferhat@logisway.pro', telephone: '0555262728', evaluation: 4.4 },
  { id: 'e12', nom: 'Ait Kaci', prenom: 'Samira', departement: 'Douanes', poste: 'Spécialiste Réglementation', statut: 'actif', dateEmbauche: '2023-01-20', salaire: 150000, email: 's.aitkaci@logisway.pro', telephone: '0555293031', evaluation: 4.3 },
  { id: 'e13', nom: 'Bouzid', prenom: 'Karim', departement: 'Transport Terrestre', poste: 'Conducteur', statut: 'inactif', dateEmbauche: '2023-06-10', salaire: 95000, email: 'k.bouzid@logisway.pro', telephone: '0555323334', evaluation: 3.2 },
  { id: 'e14', nom: 'Kherrazi', prenom: 'Bilal', departement: 'Fret Maritime', poste: 'Opérateur Portuaire', statut: 'actif', dateEmbauche: '2022-11-01', salaire: 115000, email: 'b.kherrazi@logisway.pro', telephone: '0555353637', evaluation: 4.0 },
];

const leaveRequests: LeaveRequest[] = [
  { id: 'l1', employeId: 'e4', employeNom: 'Fatima Khelifi', type: 'Congé Annuel', dateDebut: '2026-03-10', dateFin: '2026-03-21', jours: 10, statut: 'approuve', motif: 'Voyage familial' },
  { id: 'l2', employeId: 'e5', employeNom: 'Ali Mezdad', type: 'Congé Maladie', dateDebut: '2026-03-15', dateFin: '2026-03-17', jours: 3, statut: 'approuve', motif: 'Certificat médical fourni' },
  { id: 'l3', employeId: 'e3', employeNom: 'Yacine Hamdi', type: 'Congé Annuel', dateDebut: '2026-04-01', dateFin: '2026-04-10', jours: 8, statut: 'en_attente', motif: 'Vacances personnelles' },
  { id: 'l4', employeId: 'e9', employeNom: 'Amina Rahmani', type: 'Congé Exceptionnel', dateDebut: '2026-03-20', dateFin: '2026-03-20', jours: 1, statut: 'en_attente', motif: 'Événement familial' },
  { id: 'l5', employeId: 'e1', employeNom: 'Rachid Kaci', type: 'Congé Annuel', dateDebut: '2026-05-05', dateFin: '2026-05-16', jours: 10, statut: 'en_attente', motif: 'Voyage à l\'étranger' },
  { id: 'l6', employeId: 'e11', employeNom: 'Nabil Ferhat', type: 'Télétravail', dateDebut: '2026-03-18', dateFin: '2026-03-20', jours: 3, statut: 'rejete', motif: 'Maintenance serveur prévue' },
  { id: 'l7', employeId: 'e8', employeNom: 'Youcef Mansouri', type: 'Congé Annuel', dateDebut: '2026-04-14', dateFin: '2026-04-25', jours: 9, statut: 'en_attente', motif: 'Pèlerinage' },
  { id: 'l8', employeId: 'e6', employeNom: 'Sofiane Benali', type: 'Récupération', dateDebut: '2026-03-22', dateFin: '2026-03-23', jours: 2, statut: 'en_attente', motif: 'Heures supplémentaires semaine 10' },
];

const jobOpenings: JobOpening[] = [
  { id: 'j1', titre: 'Chef d\'équipes Maritime', departement: 'Fret Maritime', statut: 'ouvert', candidats: 12, datePublication: '2026-02-20', typeContrat: 'CDI', lieu: 'Alger' },
  { id: 'j2', titre: 'Agent Douanes Junior', departement: 'Douanes', statut: 'en_cours', candidats: 8, datePublication: '2026-02-10', typeContrat: 'CDI', lieu: 'Oran' },
  { id: 'j3', titre: 'Conducteur Poids Lourd', departement: 'Transport Terrestre', statut: 'ouvert', candidats: 23, datePublication: '2026-03-01', typeContrat: 'CDI', lieu: 'Alger' },
  { id: 'j4', titre: 'Responsable Qualité', departement: 'Fret Aérien', statut: 'en_cours', candidats: 5, datePublication: '2026-01-15', typeContrat: 'CDI', lieu: 'Alger' },
  { id: 'j5', titre: 'Manutentionnaire', departement: 'Entrepôt', statut: 'ferme', candidats: 18, datePublication: '2026-01-05', typeContrat: 'CDD 6 mois', lieu: 'Alger' },
  { id: 'j6', titre: 'Développeur Full-Stack', departement: 'IT', statut: 'ouvert', candidats: 31, datePublication: '2026-03-05', typeContrat: 'CDI', lieu: 'Alger / Télétravail' },
  { id: 'j7', titre: 'Gestionnaire Paie', departement: 'Comptabilité', statut: 'ouvert', candidats: 7, datePublication: '2026-03-02', typeContrat: 'CDI', lieu: 'Alger' },
];

const trainings: Training[] = [
  { id: 't1', titre: 'Sécurité Portuaire Niveau 2', formateur: 'Dr. Benmoussa', dateDebut: '2026-03-15', dateFin: '2026-03-18', participants: 8, capacite: 12, statut: 'en_cours', completion: 45, categorie: 'Sécurité' },
  { id: 't2', titre: 'Réglementation Douanière 2026', formateur: 'Me. Hadj Ahmed', dateDebut: '2026-04-01', dateFin: '2026-04-03', participants: 6, capacite: 10, statut: 'planifie', completion: 0, categorie: 'Réglementation' },
  { id: 't3', titre: 'Conduite Éco-responsable', formateur: 'M. Zerrouki', dateDebut: '2026-03-10', dateFin: '2026-03-12', participants: 10, capacite: 10, statut: 'en_cours', completion: 70, categorie: 'Transport' },
  { id: 't4', titre: 'Gestion des Risques Logistiques', formateur: 'Mme. Boukhalfa', dateDebut: '2026-02-20', dateFin: '2026-02-22', participants: 14, capacite: 15, statut: 'termine', completion: 100, categorie: 'Management' },
  { id: 't5', titre: 'Incoterms 2026 — Mise à jour', formateur: 'Me. Djoudi', dateDebut: '2026-04-10', dateFin: '2026-04-10', participants: 4, capacite: 20, statut: 'planifie', completion: 0, categorie: 'Réglementation' },
  { id: 't6', titre: 'First Aid & SST', formateur: 'Dr. Meddour', dateDebut: '2026-03-05', dateFin: '2026-03-06', participants: 12, capacite: 12, statut: 'termine', completion: 100, categorie: 'Sécurité' },
  { id: 't7', titre: 'SAP Logistics Module', formateur: 'M. Idir', dateDebut: '2026-04-15', dateFin: '2026-04-20', participants: 5, capacite: 8, statut: 'planifie', completion: 0, categorie: 'IT' },
];

const performanceReviews: PerformanceReview[] = [
  { id: 'p1', employeNom: 'Yacine Hamdi', poste: 'Responsable Aérien', note: 4.8, objectifs: 6, objectifsAtteints: 6, periode: 'S1 2026', statut: 'termine', commentaire: 'Excellente performance. Leadership exemplaire.' },
  { id: 'p2', employeNom: 'Amina Rahmani', poste: 'Responsable RH', note: 4.6, objectifs: 5, objectifsAtteints: 5, periode: 'S1 2026', statut: 'termine', commentaire: 'Réforme RH menée avec succès.' },
  { id: 'p3', employeNom: 'Ali Mezdad', poste: 'Conducteur Principal', note: 4.7, objectifs: 4, objectifsAtteints: 4, periode: 'S1 2026', statut: 'termine', commentaire: 'Ponctualité et sécurité impeccables.' },
  { id: 'p4', employeNom: 'Rachid Kaci', poste: 'Chef d\'équipe Maritime', note: 4.5, objectifs: 7, objectifsAtteints: 6, periode: 'S1 2026', statut: 'termine', commentaire: 'Très bon. Un objectif en cours de finalisation.' },
  { id: 'p5', employeNom: 'Nabil Ferhat', poste: 'Ingénieur Systèmes', note: 4.4, objectifs: 5, objectifsAtteints: 4, periode: 'S1 2026', statut: 'en_cours', commentaire: 'Migration cloud en cours.' },
  { id: 'p6', employeNom: 'Sofiane Benali', poste: 'Responsable Entrepôt', note: 4.3, objectifs: 6, objectifsAtteints: 5, periode: 'S1 2026', statut: 'termine', commentaire: 'Amélioration significative des processus.' },
  { id: 'p7', employeNom: 'Karim Djebbar', poste: 'Agent Fret Aérien', note: 3.9, objectifs: 5, objectifsAtteints: 3, periode: 'S1 2026', statut: 'en_cours', commentaire: 'Besoin d\'accompagnement sur les procédures.' },
  { id: 'p8', employeNom: 'Mourad Talbi', poste: 'Manutentionnaire', note: 3.5, objectifs: 3, objectifsAtteints: 1, periode: 'S1 2026', statut: 'en_cours', commentaire: 'Période d\'essai — suivi renforcé nécessaire.' },
];

const payrollData: PayrollEntry[] = [
  { mois: 'Oct 2025', totalBrut: 2850000, totalNet: 2137500, charges: 712500, employes: 13 },
  { mois: 'Nov 2025', totalBrut: 2850000, totalNet: 2137500, charges: 712500, employes: 13 },
  { mois: 'Déc 2025', totalBrut: 3050000, totalNet: 2287500, charges: 762500, employes: 13 },
  { mois: 'Jan 2026', totalBrut: 2920000, totalNet: 2190000, charges: 730000, employes: 14 },
  { mois: 'Fév 2026', totalBrut: 2920000, totalNet: 2190000, charges: 730000, employes: 14 },
  { mois: 'Mar 2026', totalBrut: 2980000, totalNet: 2235000, charges: 745000, employes: 14 },
];

const departmentPayroll = [
  { departement: 'Fret Maritime', montant: 580000, employes: 3 },
  { departement: 'Fret Aérien', montant: 670000, employes: 2 },
  { departement: 'Transport Terrestre', montant: 545000, employes: 3 },
  { departement: 'Douanes', montant: 440000, employes: 2 },
  { departement: 'Entrepôt', montant: 360000, employes: 2 },
  { departement: 'Comptabilité', montant: 340000, employes: 1 },
  { departement: 'RH', montant: 390000, employes: 1 },
  { departement: 'IT', montant: 440000, employes: 1 },
];

// ─── Chart Data ────────────────────────────────────────────────

const departmentDistribution = [
  { name: 'Fret Maritime', value: 3, color: '#0d9488' },
  { name: 'Fret Aérien', value: 2, color: '#059669' },
  { name: 'Transport', value: 3, color: '#0f766e' },
  { name: 'Douanes', value: 2, color: '#14b8a6' },
  { name: 'Entrepôt', value: 2, color: '#34d399' },
  { name: 'Comptabilité', value: 1, color: '#6ee7b7' },
  { name: 'RH', value: 1, color: '#a7f3d0' },
  { name: 'IT', value: 1, color: '#047857' },
];

const monthlyEvolution = [
  { mois: 'Oct', embauches: 2, departs: 1, effectif: 12 },
  { mois: 'Nov', embauches: 1, departs: 0, effectif: 13 },
  { mois: 'Déc', embauches: 1, departs: 1, effectif: 13 },
  { mois: 'Jan', embauches: 2, departs: 1, effectif: 14 },
  { mois: 'Fév', embauches: 0, departs: 0, effectif: 14 },
  { mois: 'Mar', embauches: 1, departs: 0, effectif: 14 },
];

const payrollChartData = payrollData.map(p => ({
  mois: p.mois.split(' ')[0],
  brut: p.totalBrut / 100000,
  net: p.totalNet / 100000,
  charges: p.charges / 100000,
}));

// ─── Helpers ───────────────────────────────────────────────────

const statusConfig: Record<EmployeeStatus, { label: string; color: string; dot: string }> = {
  actif: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  en_conge: { label: 'En congé', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  inactif: { label: 'Inactif', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' },
  essai: { label: 'Période d\'essai', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', dot: 'bg-sky-500' },
};

const leaveStatusConfig: Record<LeaveStatus, { label: string; color: string; icon: React.ElementType }> = {
  en_attente: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  approuve: { label: 'Approuvé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const jobStatusConfig: Record<JobStatus, { label: string; color: string }> = {
  ouvert: { label: 'Ouvert', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  ferme: { label: 'Fermé', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

const trainingStatusConfig: Record<TrainingStatus, { label: string; color: string }> = {
  planifie: { label: 'Planifié', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  termine: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

// formatCurrency is now provided by useCurrency hook inside the component

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDeptIcon(dept: string) {
  if (dept.includes('Maritime')) return Ship;
  if (dept.includes('Aérien')) return Plane;
  if (dept.includes('Transport')) return Truck;
  if (dept.includes('Douanes')) return ShieldCheck;
  if (dept.includes('Entrepôt')) return Warehouse;
  if (dept.includes('Comptabilité')) return Banknote;
  if (dept.includes('RH')) return Heart;
  if (dept.includes('IT')) return Monitor;
  return Building2;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  const stars: React.ReactElement[] = [];
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

// ─── Tab definitions ───────────────────────────────────────────

const tabs = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { key: 'employes', label: 'Employés', icon: Users },
  { key: 'conges', label: 'Congés', icon: CalendarDays },
  { key: 'recrutement', label: 'Recrutement', icon: UserPlus },
  { key: 'paie', label: 'Paie', icon: Banknote },
  { key: 'formation', label: 'Formation', icon: GraduationCap },
  { key: 'performances', label: 'Performances', icon: Target },
];

// ─── Component ─────────────────────────────────────────────────

export default function HRPage() {
  const { format: formatPrice, symbol } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState<string>('all');

  // Mutable state for employees and leave requests
  const [employeesList, setEmployeesList] = useState<Employee[]>(employees);
  const [leaveRequestsList, setLeaveRequestsList] = useState<LeaveRequest[]>(leaveRequests);

  // View/Edit employee dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Add employee form state
  const [newEmployee, setNewEmployee] = useState({
    prenom: '',
    nom: '',
    departement: '',
    poste: '',
    salaire: '',
    email: '',
    telephone: '',
  });

  // Handle adding a new employee
  const handleAddEmployee = () => {
    if (!newEmployee.prenom || !newEmployee.nom || !newEmployee.departement) return;
    const newEmp: Employee = {
      id: `e${Date.now()}`,
      nom: newEmployee.nom,
      prenom: newEmployee.prenom,
      departement: newEmployee.departement,
      poste: newEmployee.poste || 'Non assigné',
      statut: 'essai',
      dateEmbauche: new Date().toISOString().split('T')[0],
      salaire: parseInt(newEmployee.salaire) || 0,
      email: newEmployee.email || '',
      telephone: newEmployee.telephone || '',
      evaluation: 0,
    };
    setEmployeesList(prev => [...prev, newEmp]);
    setNewEmployee({ prenom: '', nom: '', departement: '', poste: '', salaire: '', email: '', telephone: '' });
    setShowAddDialog(false);
  };

  // Handle approving a leave request
  const handleApproveLeave = (leaveId: string) => {
    setLeaveRequestsList(prev =>
      prev.map(l => l.id === leaveId ? { ...l, statut: 'approuve' as LeaveStatus } : l)
    );
  };

  // Handle rejecting a leave request
  const handleRejectLeave = (leaveId: string) => {
    setLeaveRequestsList(prev =>
      prev.map(l => l.id === leaveId ? { ...l, statut: 'rejete' as LeaveStatus } : l)
    );
  };

  // Computed: filtered employees
  const filteredEmployees = useMemo(() => {
    let result = [...employeesList];
    if (deptFilter !== 'all') result = result.filter(e => e.departement === deptFilter);
    if (statusFilter !== 'all') result = result.filter(e => e.statut === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        `${e.prenom} ${e.nom}`.toLowerCase().includes(q) ||
        e.poste.toLowerCase().includes(q) ||
        e.departement.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, deptFilter, statusFilter, employeesList]);

  // Computed: filtered leave requests
  const filteredLeaves = useMemo(() => {
    if (leaveFilter === 'all') return leaveRequestsList;
    return leaveRequestsList.filter(l => l.statut === leaveFilter);
  }, [leaveFilter, leaveRequestsList]);

  const handleExportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Département', 'Poste', 'Statut', 'Date Embauche', `Salaire (${symbol})`, 'Email', 'Téléphone', 'Évaluation'];
    const rows = filteredEmployees.map(e => [
      e.nom,
      e.prenom,
      e.departement,
      e.poste,
      statusConfig[e.statut]?.label || e.statut,
      e.dateEmbauche,
      String(e.salaire),
      e.email,
      e.telephone,
      String(e.evaluation),
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-hr-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // KPI calculations
  const totalEmployes = employeesList.length;
  const presentsAujourdhui = employeesList.filter(e => e.statut === 'actif' || e.statut === 'essai').length;
  const enConge = employeesList.filter(e => e.statut === 'en_conge').length;
  const postesVacants = jobOpenings.filter(j => j.statut === 'ouvert' || j.statut === 'en_cours').length;
  const tauxRotation = '4.2%';
  const masseSalariale = employeesList.reduce((sum, e) => sum + e.salaire, 0);

  const kpis = [
    { title: 'Total Employés', value: totalEmployes, icon: Users, gradient: 'from-teal-500 to-teal-600', change: '+2 ce mois', changeUp: true },
    { title: 'Présents Aujourd\'hui', value: presentsAujourdhui, icon: UserCheck, gradient: 'from-emerald-500 to-green-600', change: `${Math.round((presentsAujourdhui / totalEmployes) * 100)}%`, changeUp: true },
    { title: 'En Congé', value: enConge, icon: CalendarDays, gradient: 'from-amber-500 to-amber-600', change: `${leaveRequestsList.filter(l => l.statut === 'en_attente').length} en attente`, changeUp: false },
    { title: 'Postes Vacants', value: postesVacants, icon: Briefcase, gradient: 'from-rose-500 to-rose-600', change: `${jobOpenings.filter(j => j.statut === 'ouvert').length} ouverts`, changeUp: false },
    { title: 'Taux de Rotation', value: tauxRotation, icon: TrendingUp, gradient: 'from-orange-500 to-orange-600', change: '-0.5% vs S1', changeUp: true },
    { title: 'Masse Salariale', value: formatPrice(masseSalariale), icon: DollarSign, gradient: 'from-cyan-500 to-cyan-600', change: '+3.2% vs S2', changeUp: false },
  ];

  // ─── Render Tabs ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <Users className="w-6 h-6 text-teal-500" />
            Ressources Humaines
          </motion.h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion du personnel, paie, formation et performances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Exporter
          </Button>
          <Button
            size="sm"
            className="text-white h-9"
            style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvel Employé
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={
              activeTab === tab.key
                ? { background: 'linear-gradient(135deg, #0d9488, #059669)' }
                : {}
            }
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >

          {/* ═══════════════════════════════════════════════════════
              TAB: Vue d'ensemble
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {kpis.map((kpi, idx) => (
                  <motion.div
                    key={kpi.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center`}>
                            <kpi.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className={`text-[10px] flex items-center gap-0.5 ${kpi.changeUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {kpi.changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {kpi.change}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                          {typeof kpi.value === 'number' ? kpi.value : kpi.value}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Department Distribution Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-teal-500" />
                      Répartition par Département
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={departmentDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {departmentDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number, name: string) => [`${value} employé(s)`, name]}
                              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs flex-1">
                        {departmentDistribution.map(d => (
                          <div key={d.name} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-auto">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Evolution Bar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-500" />
                      Évolutions Mensuelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyEvolution} barGap={4}>
                          <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="embauches" fill="#0d9488" radius={[4, 4, 0, 0]} name="Embauches" />
                          <Bar dataKey="departs" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Départs" />
                          <Bar dataKey="effectif" fill="#059669" radius={[4, 4, 0, 0]} name="Effectif" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Demandes de congé en attente</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{leaveRequestsList.filter(l => l.statut === 'en_attente').length}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('conges')}>
                      Traiter les demandes
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Formations en cours</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{trainings.filter(t => t.statut === 'en_cours').length}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('formation')}>
                      Voir les formations
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Postes ouverts</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{jobOpenings.filter(j => j.statut === 'ouvert').length}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('recrutement')}>
                      Gérer le recrutement
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: Employés
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'employes' && (
            <div className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher par nom, poste, département..."
                        className="pl-9 h-9"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={deptFilter} onValueChange={setDeptFilter}>
                      <SelectTrigger className="w-full sm:w-44 h-9">
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les départements</SelectItem>
                        {departments.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-36 h-9">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="en_conge">En congé</SelectItem>
                        <SelectItem value="essai">Période d'essai</SelectItem>
                        <SelectItem value="inactif">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Nom</TableHead>
                          <TableHead className="text-xs">Département</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Poste</TableHead>
                          <TableHead className="text-xs">Statut</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Date Embauche</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Salaire</TableHead>
                          <TableHead className="text-xs w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                              Aucun employé trouvé
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEmployees.map((emp, idx) => {
                            const DeptIcon = getDeptIcon(emp.departement);
                            return (
                              <motion.tr
                                key={emp.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                      {emp.prenom.charAt(0)}{emp.nom.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.prenom} {emp.nom}</p>
                                      <p className="text-xs text-gray-500 md:hidden">{emp.poste}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <DeptIcon className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-300">{emp.departement}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-600 dark:text-gray-300 hidden md:table-cell">
                                  {emp.poste}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusConfig[emp.statut].color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[emp.statut].dot} mr-1 inline-block`} />
                                    {statusConfig[emp.statut].label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500 hidden lg:table-cell">
                                  {formatDate(emp.dateEmbauche)}
                                </TableCell>
                                <TableCell className="text-xs text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                  {formatPrice(emp.salaire)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Voir" onClick={() => { setViewingEmployee(emp); setShowViewDialog(true); }}>
                                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Modifier" onClick={() => { setEditingEmployee({...emp}); setShowEditDialog(true); }}>
                                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500">{filteredEmployees.length} employé(s) affiché(s) sur {employeesList.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: Congés
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'conges' && (
            <div className="space-y-4">
              {/* Leave Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{leaveRequestsList.filter(l => l.statut === 'en_attente').length}</p>
                    <p className="text-xs text-gray-500">En attente</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{leaveRequestsList.filter(l => l.statut === 'approuve').length}</p>
                    <p className="text-xs text-gray-500">Approuvées</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{leaveRequestsList.filter(l => l.statut === 'rejete').length}</p>
                    <p className="text-xs text-gray-500">Rejetées</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={leaveFilter} onValueChange={setLeaveFilter}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="Filtrer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les demandes</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="approuve">Approuvées</SelectItem>
                    <SelectItem value="rejete">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Requests Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Employé</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Début</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Fin</TableHead>
                          <TableHead className="text-xs">Jours</TableHead>
                          <TableHead className="text-xs">Statut</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Motif</TableHead>
                          <TableHead className="text-xs w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeaves.map((leave, idx) => {
                          const config = leaveStatusConfig[leave.statut];
                          const StatusIcon = config.icon;
                          return (
                            <motion.tr
                              key={leave.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
                            >
                              <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                                {leave.employeNom}
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                                {leave.type}
                              </TableCell>
                              <TableCell className="text-xs text-gray-500 hidden sm:table-cell">
                                {formatDate(leave.dateDebut)}
                              </TableCell>
                              <TableCell className="text-xs text-gray-500 hidden sm:table-cell">
                                {formatDate(leave.dateFin)}
                              </TableCell>
                              <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {leave.jours}j
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${config.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                                {leave.motif}
                              </TableCell>
                              <TableCell>
                                {leave.statut === 'en_attente' ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                      title="Approuver"
                                      onClick={() => handleApproveLeave(leave.id)}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    </button>
                                    <button
                                      className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                      title="Rejeter"
                                      onClick={() => handleRejectLeave(leave.id)}
                                    >
                                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-400">—</span>
                                )}
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: Recrutement
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'recrutement' && (
            <div className="space-y-4">
              {/* Recruitment Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{jobOpenings.filter(j => j.statut === 'ouvert').length}</p>
                    <p className="text-xs text-gray-500">Postes Ouverts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{jobOpenings.filter(j => j.statut === 'en_cours').length}</p>
                    <p className="text-xs text-gray-500">En Cours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-500">{jobOpenings.reduce((s, j) => s + j.candidats, 0)}</p>
                    <p className="text-xs text-gray-500">Total Candidats</p>
                  </CardContent>
                </Card>
              </div>

              {/* Job Openings Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobOpenings.map((job, idx) => {
                  const JobIcon = getDeptIcon(job.departement);
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                                <JobIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.titre}</p>
                                <p className="text-[10px] text-gray-500">{job.departement}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${jobStatusConfig[job.statut].color}`}>
                              {jobStatusConfig[job.statut].label}
                            </Badge>
                          </div>
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.lieu}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FileText className="w-3.5 h-3.5" />
                              {job.typeContrat}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Users className="w-3.5 h-3.5" />
                              {job.candidats} candidat(s)
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] text-gray-400">Publié le {formatDate(job.datePublication)}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-600 hover:text-teal-700">
                              Détails
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: Paie
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'paie' && (
            <div className="space-y-4">
              {/* Payroll Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Masse Salariale Mensuelle</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(2980000)}</p>
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +2.1%
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Salaire Moyen</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(Math.round(masseSalariale / totalEmployes))}</p>
                    <span className="text-[10px] text-gray-400">Brut mensuel</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Charges Sociales</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(745000)}</p>
                    <span className="text-[10px] text-gray-400">25% du brut</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500">Employés Payés</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">14</p>
                    <span className="text-[10px] text-gray-400">Mois de mars 2026</span>
                  </CardContent>
                </Card>
              </div>

              {/* Payroll Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-500" />
                    {`Évolution de la Masse Salariale (×100K ${symbol})`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={payrollChartData} barGap={2}>
                        <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="brut" fill="#0d9488" radius={[4, 4, 0, 0]} name="Brut" />
                        <Bar dataKey="net" fill="#059669" radius={[4, 4, 0, 0]} name="Net" />
                        <Bar dataKey="charges" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Charges" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Payroll Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-500" />
                    Répartition par Département
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Département</TableHead>
                          <TableHead className="text-xs">Masse Salariale</TableHead>
                          <TableHead className="text-xs">Employés</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Salaire Moyen</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Part</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentPayroll.map((row, idx) => {
                          const totalDeptPayroll = departmentPayroll.reduce((s, r) => s + r.montant, 0);
                          const share = ((row.montant / totalDeptPayroll) * 100).toFixed(1);
                          const RowIcon = getDeptIcon(row.departement);
                          return (
                            <motion.tr
                              key={row.departement}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <RowIcon className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-sm text-gray-900 dark:text-white">{row.departement}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatPrice(row.montant)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                {row.employes}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                {formatPrice(Math.round(row.montant / row.employes))}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <Progress value={parseFloat(share)} className="h-2 w-20" />
                                  <span className="text-xs text-gray-500">{share}%</span>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: Formation
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'formation' && (
            <div className="space-y-4">
              {/* Training Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{trainings.filter(t => t.statut === 'termine').length}</p>
                    <p className="text-xs text-gray-500">Terminées</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{trainings.filter(t => t.statut === 'en_cours').length}</p>
                    <p className="text-xs text-gray-500">En Cours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-sky-600">{trainings.filter(t => t.statut === 'planifie').length}</p>
                    <p className="text-xs text-gray-500">Planifiées</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">{trainings.reduce((s, t) => s + t.participants, 0)}</p>
                    <p className="text-xs text-gray-500">Participants Total</p>
                  </CardContent>
                </Card>
              </div>

              {/* Training Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainings.map((training, idx) => (
                  <motion.div
                    key={training.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              training.statut === 'termine'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : training.statut === 'en_cours'
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : 'bg-sky-100 dark:bg-sky-900/30'
                            }`}>
                              <GraduationCap className={`w-4 h-4 ${
                                training.statut === 'termine'
                                  ? 'text-emerald-600'
                                  : training.statut === 'en_cours'
                                  ? 'text-amber-600'
                                  : 'text-sky-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{training.titre}</p>
                              <p className="text-[10px] text-gray-500">{training.categorie}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${trainingStatusConfig[training.statut].color}`}>
                            {trainingStatusConfig[training.statut].label}
                          </Badge>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Award className="w-3.5 h-3.5" />
                            {training.formateur}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formatDate(training.dateDebut)} — {formatDate(training.dateFin)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            {training.participants}/{training.capacite} participants
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-gray-500">Avancement</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{training.completion}%</span>
                          </div>
                          <Progress
                            value={training.completion}
                            className="h-1.5"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              TAB: Performances
              ═══════════════════════════════════════════════════════ */}
          {activeTab === 'performances' && (
            <div className="space-y-4">
              {/* Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">
                      {(performanceReviews.reduce((s, p) => s + p.note, 0) / performanceReviews.length).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">Note Moyenne</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{performanceReviews.filter(p => p.statut === 'termine').length}</p>
                    <p className="text-xs text-gray-500">Évaluations Terminées</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{performanceReviews.filter(p => p.statut === 'en_cours').length}</p>
                    <p className="text-xs text-gray-500">En Cours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round((performanceReviews.reduce((s, p) => s + p.objectifsAtteints, 0) / performanceReviews.reduce((s, p) => s + p.objectifs, 0)) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">Objectifs Atteints</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Review Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {performanceReviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                              review.note >= 4.5
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                : review.note >= 4.0
                                ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                                : review.note >= 3.5
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                : 'bg-gradient-to-br from-red-500 to-rose-600'
                            }`}>
                              {review.employeNom.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.employeNom}</p>
                              <p className="text-[10px] text-gray-500">{review.poste}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{review.note}</p>
                            {renderStars(review.note)}
                          </div>
                        </div>

                        {/* Objectives Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Objectifs atteints</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {review.objectifsAtteints}/{review.objectifs}
                            </span>
                          </div>
                          <Progress
                            value={(review.objectifsAtteints / review.objectifs) * 100}
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] ${
                              review.statut === 'termine'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {review.statut === 'termine' ? 'Terminé' : 'En cours'}
                            </Badge>
                            <span className="text-[10px] text-gray-400">{review.periode}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-600 hover:text-teal-700">
                            Détails
                          </Button>
                        </div>

                        {/* Comment */}
                        <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{review.commentaire}&rdquo;</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ADD EMPLOYEE DIALOG
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-500" />
              Nouvel Employé
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouvel employé
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-xs">Prénom</Label>
                <Input
                  id="prenom"
                  placeholder="Prénom"
                  value={newEmployee.prenom}
                  onChange={e => setNewEmployee({ ...newEmployee, prenom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-xs">Nom</Label>
                <Input
                  id="nom"
                  placeholder="Nom"
                  value={newEmployee.nom}
                  onChange={e => setNewEmployee({ ...newEmployee, nom: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departement" className="text-xs">Département</Label>
              <Select
                value={newEmployee.departement}
                onValueChange={v => setNewEmployee({ ...newEmployee, departement: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="poste" className="text-xs">Poste</Label>
              <Input
                id="poste"
                placeholder="Intitulé du poste"
                value={newEmployee.poste}
                onChange={e => setNewEmployee({ ...newEmployee, poste: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaire" className="text-xs">{`Salaire (${symbol})`}</Label>
                <Input
                  id="salaire"
                  placeholder="120000"
                  type="number"
                  value={newEmployee.salaire}
                  onChange={e => setNewEmployee({ ...newEmployee, salaire: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-xs">Téléphone</Label>
                <Input
                  id="telephone"
                  placeholder="0555XXXXXX"
                  value={newEmployee.telephone}
                  onChange={e => setNewEmployee({ ...newEmployee, telephone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                placeholder="prenom.nom@logisway.pro"
                type="email"
                value={newEmployee.email}
                onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              onClick={handleAddEmployee}
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Ajouter l&apos;employé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-500" />
              Détails de l&apos;employé
            </DialogTitle>
            <DialogDescription>Informations détaillées sur l&apos;employé</DialogDescription>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                  {viewingEmployee.prenom.charAt(0)}{viewingEmployee.nom.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{viewingEmployee.prenom} {viewingEmployee.nom}</p>
                  <p className="text-sm text-gray-500">{viewingEmployee.poste}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Département :</span><p className="font-medium text-gray-900 dark:text-white">{viewingEmployee.departement}</p></div>
                <div><span className="text-gray-500">Statut :</span><p><Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusConfig[viewingEmployee.statut].color}`}><span className={`w-1.5 h-1.5 rounded-full ${statusConfig[viewingEmployee.statut].dot} mr-1 inline-block`} />{statusConfig[viewingEmployee.statut].label}</Badge></p></div>
                <div><span className="text-gray-500">Date d&apos;embauche :</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(viewingEmployee.dateEmbauche)}</p></div>
                <div><span className="text-gray-500">Salaire :</span><p className="font-medium text-gray-900 dark:text-white">{formatPrice(viewingEmployee.salaire)}</p></div>
                <div><span className="text-gray-500">Email :</span><p className="font-medium text-gray-900 dark:text-white break-all">{viewingEmployee.email}</p></div>
                <div><span className="text-gray-500">Téléphone :</span><p className="font-medium text-gray-900 dark:text-white">{viewingEmployee.telephone}</p></div>
                <div className="col-span-2"><span className="text-gray-500">Évaluation :</span><div className="mt-1">{renderStars(viewingEmployee.evaluation)}<span className="text-xs text-gray-500 ml-2">{viewingEmployee.evaluation}/5</span></div></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-500" />
              Modifier l&apos;employé
            </DialogTitle>
            <DialogDescription>Modifier les informations de l&apos;employé</DialogDescription>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Prénom</Label>
                  <Input className="h-9" value={editingEmployee.prenom} onChange={e => setEditingEmployee({ ...editingEmployee, prenom: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Nom</Label>
                  <Input className="h-9" value={editingEmployee.nom} onChange={e => setEditingEmployee({ ...editingEmployee, nom: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Département</Label>
                <Select value={editingEmployee.departement} onValueChange={v => setEditingEmployee({ ...editingEmployee, departement: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Poste</Label>
                <Input className="h-9" value={editingEmployee.poste} onChange={e => setEditingEmployee({ ...editingEmployee, poste: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">{`Salaire (${symbol})`}</Label>
                  <Input type="number" className="h-9" value={editingEmployee.salaire} onChange={e => setEditingEmployee({ ...editingEmployee, salaire: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Statut</Label>
                  <Select value={editingEmployee.statut} onValueChange={v => setEditingEmployee({ ...editingEmployee, statut: v as EmployeeStatus })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="en_conge">En congé</SelectItem>
                      <SelectItem value="essai">Période d&apos;essai</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input type="email" className="h-9" value={editingEmployee.email} onChange={e => setEditingEmployee({ ...editingEmployee, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone</Label>
                <Input className="h-9" value={editingEmployee.telephone} onChange={e => setEditingEmployee({ ...editingEmployee, telephone: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => {
              if (editingEmployee) {
                setEmployeesList(prev => prev.map(e => e.id === editingEmployee.id ? editingEmployee : e));
              }
              setShowEditDialog(false);
            }}>
              <Edit3 className="w-4 h-4 mr-1.5" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
