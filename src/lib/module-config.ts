/**
 * Module Configuration System — FreightFlow Pro
 * Centralized configuration for feature modules, navigation, and feature flags.
 * This is the single source of truth for what modules exist, their metadata,
 * and whether they are enabled.
 */

import {
  LayoutDashboard,
  Package,
  Ship,
  Plane,
  Truck,
  PackageCheck,
  FileCheck,
  Warehouse,
  Shield,
  Calculator,
  AlertCircle,
  ScanLine,
  FileText,
  Users,
  Handshake,
  Receipt,
  FileSignature,
  DollarSign,
  Container,
  UserCheck,
  FolderOpen,
  BarChart3,
  FileSpreadsheet,
  ListTodo,
  CalendarDays,
  Leaf,
  MessageSquare,
  GitMerge,
  Plug,
  Settings,
  Flame,
  ThermometerSnowflake,
  CreditCard,
  Gauge,
  ClipboardCheck,
  AlertTriangle,
} from 'lucide-react';
import type { PageType } from './cargo-store';

// ─── Role Types ─────────────────────────────────────────────────

export type RoleKey = 'admin' | 'manager' | 'agent' | 'viewer' | 'client';
export type PermissionLevel = 'write' | 'read' | 'none';

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ─── Module Types ───────────────────────────────────────────────

export interface ModuleDefinition {
  /** Unique module ID matching PageType */
  id: PageType;
  /** Display label (French) */
  label: string;
  /** Lucide icon component reference (as string for serialization) */
  icon: string;
  /** Navigation group category */
  group: NavGroupKey;
  /** Sort order within group */
  order: number;
  /** Whether this module is globally enabled (feature flag) */
  enabled: boolean;
  /** Whether this module requires a paid plan */
  premium: boolean;
  /** Short description */
  description: string;
  /** Default permissions per role — can be overridden in settings */
  defaultPermissions: Record<RoleKey, PermissionLevel>;
}

export type NavGroupKey =
  | 'principal'
  | 'fret'
  | 'services'
  | 'commercial'
  | 'gestion'
  | 'communication'
  | 'conformite'
  | 'portail'
  | 'systeme';

export interface NavGroupDefinition {
  key: NavGroupKey;
  label: string;
  order: number;
}

// ─── Role Definitions ───────────────────────────────────────────

export const roleDefinitions: RoleDefinition[] = [
  {
    key: 'admin',
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités et paramètres système',
    color: '#dc2626',
    bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    borderColor: '#dc2626',
  },
  {
    key: 'manager',
    label: 'Responsable',
    description: 'Gestion des opérations, rapports et supervision des équipes',
    color: '#d97706',
    bgColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    borderColor: '#d97706',
  },
  {
    key: 'agent',
    label: 'Agent',
    description: 'Traitement des expéditions, suivi client et opérations quotidiennes',
    color: '#0d9488',
    bgColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    borderColor: '#0d9488',
  },
  {
    key: 'viewer',
    label: 'Observateur',
    description: 'Consultation des données et rapports en lecture seule',
    color: '#0284c7',
    bgColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    borderColor: '#0284c7',
  },
  {
    key: 'client',
    label: 'Client',
    description: 'Accès au portail client, suivi des expéditions propres',
    color: '#7c3aed',
    bgColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    borderColor: '#7c3aed',
  },
];

export const roleLabelsMap: Record<RoleKey, string> = Object.fromEntries(
  roleDefinitions.map((r) => [r.key, r.label])
) as Record<RoleKey, string>;

// ─── Navigation Groups ──────────────────────────────────────────

export const navGroups: NavGroupDefinition[] = [
  { key: 'principal', label: 'Principal', order: 1 },
  { key: 'fret', label: 'Fret', order: 2 },
  { key: 'services', label: 'Services', order: 3 },
  { key: 'commercial', label: 'Commercial', order: 4 },
  { key: 'gestion', label: 'Gestion', order: 5 },
  { key: 'communication', label: 'Communication', order: 6 },
  { key: 'conformite', label: 'Conformité', order: 7 },
  { key: 'portail', label: 'Portail', order: 8 },
  { key: 'systeme', label: 'Système', order: 9 },
];

// ─── Icon name to component map ─────────────────────────────────

export const iconNameToComponent: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  Ship,
  Plane,
  Truck,
  PackageCheck,
  FileCheck,
  Warehouse,
  Shield,
  Calculator,
  AlertCircle,
  ScanLine,
  FileText,
  Users,
  Handshake,
  Receipt,
  FileSignature,
  DollarSign,
  Container,
  UserCheck,
  FolderOpen,
  BarChart3,
  FileSpreadsheet,
  ListTodo,
  CalendarDays,
  Leaf,
  MessageSquare,
  GitMerge,
  Plug,
  Settings,
  Flame,
  ThermometerSnowflake,
  CreditCard,
  Gauge,
  ClipboardCheck,
  AlertTriangle,
};

// ─── Module Definitions (Single Source of Truth) ────────────────

export const moduleDefinitions: ModuleDefinition[] = [
  // Principal
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'LayoutDashboard',
    group: 'principal',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Vue d\'ensemble des opérations logistiques avec KPIs et graphiques',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'read' },
  },
  {
    id: 'shipments',
    label: 'Expéditions',
    icon: 'Package',
    group: 'principal',
    order: 2,
    enabled: true,
    premium: false,
    description: 'Gestion complète des expéditions tous modes confondus',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },
  {
    id: 'tracking',
    label: 'Suivi',
    icon: 'Package',
    group: 'principal',
    order: 3,
    enabled: true,
    premium: false,
    description: 'Suivi en temps réel des expéditions avec carte interactive',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },

  // Fret
  {
    id: 'maritime',
    label: 'Maritime',
    icon: 'Ship',
    group: 'fret',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Fret maritime — conteneurs, booking, BL, programme navires',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },
  {
    id: 'air-freight',
    label: 'Aérien',
    icon: 'Plane',
    group: 'fret',
    order: 2,
    enabled: true,
    premium: false,
    description: 'Fret aérien — vols cargo, LTA/AWB, capacité compagnies',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },
  {
    id: 'ground-transport',
    label: 'Terrestre',
    icon: 'Truck',
    group: 'fret',
    order: 3,
    enabled: true,
    premium: false,
    description: 'Transport terrestre — routes, chauffeurs, preuves livraison',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },
  {
    id: 'multimodal',
    label: 'Multi-Modal',
    icon: 'GitMerge',
    group: 'fret',
    order: 4,
    enabled: true,
    premium: true,
    description: 'Transport multimodal — combinaison maritime/aérien/terrestre',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },

  // Services
  {
    id: 'parcels',
    label: 'Colis & Courier',
    icon: 'PackageCheck',
    group: 'services',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Colis express — comparaison transporteurs, suivi dernier km',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },
  {
    id: 'customs',
    label: 'Douanes',
    icon: 'FileCheck',
    group: 'services',
    order: 2,
    enabled: true,
    premium: false,
    description: 'Déclarations douanières — codes HS, calcul droits, conformité',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'warehouse',
    label: 'Entrepôt',
    icon: 'Warehouse',
    group: 'services',
    order: 3,
    enabled: true,
    premium: false,
    description: 'Gestion d\'entrepôt — zones, inventaire, planification quais',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },
  {
    id: 'insurance',
    label: 'Assurance Cargo',
    icon: 'Shield',
    group: 'services',
    order: 4,
    enabled: true,
    premium: true,
    description: 'Assurance marchandises — polices, sinistres, couverture',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'read' },
  },
  {
    id: 'incoterms',
    label: 'Incoterms',
    icon: 'Calculator',
    group: 'services',
    order: 5,
    enabled: true,
    premium: false,
    description: 'Incoterms 2020 — calcul des coûts et responsabilités',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'read' },
  },
  {
    id: 'claims',
    label: 'Réclamations',
    icon: 'AlertCircle',
    group: 'services',
    order: 6,
    enabled: true,
    premium: false,
    description: 'Gestion des réclamations — suivi, résolution, historique',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },
  {
    id: 'scanner',
    label: 'Scanner',
    icon: 'ScanLine',
    group: 'services',
    order: 7,
    enabled: true,
    premium: true,
    description: 'Scanner QR/Barcode — vérification, génération, historique',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },

  // Commercial
  {
    id: 'quotations',
    label: 'Devis',
    icon: 'FileText',
    group: 'commercial',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Gestion des devis — création, envoi, suivi, conversion',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'Users',
    group: 'commercial',
    order: 2,
    enabled: true,
    premium: false,
    description: 'Gestion du portefeuille clients — contacts, historique, CRM',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'read' },
  },
  {
    id: 'partners',
    label: 'Partenaires',
    icon: 'Handshake',
    group: 'commercial',
    order: 3,
    enabled: true,
    premium: false,
    description: 'Gestion des partenaires transporteurs et prestataires',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: 'Receipt',
    group: 'commercial',
    order: 4,
    enabled: true,
    premium: false,
    description: 'Facturation — émission, suivi paiements, relances',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'read' },
  },
  {
    id: 'contracts',
    label: 'Contrats Transporteurs',
    icon: 'FileSignature',
    group: 'commercial',
    order: 5,
    enabled: true,
    premium: true,
    description: 'Contrats avec transporteurs — tarifs, conditions, renouvellement',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'none', client: 'none' },
  },
  {
    id: 'rates',
    label: 'Gestion des Tarifs',
    icon: 'DollarSign',
    group: 'commercial',
    order: 6,
    enabled: true,
    premium: true,
    description: 'Grille tarifaire — surcharges, comparatif, historique',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'none', client: 'none' },
  },

  // Gestion
  {
    id: 'fleet',
    label: 'Flotte',
    icon: 'Container',
    group: 'gestion',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Gestion de la flotte — véhicules, maintenance, kilométrage',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'drivers',
    label: 'Conducteurs',
    icon: 'UserCheck',
    group: 'gestion',
    order: 2,
    enabled: true,
    premium: false,
    description: 'Gestion des conducteurs — planning, permis, performance',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'FolderOpen',
    group: 'gestion',
    order: 3,
    enabled: true,
    premium: false,
    description: 'Gestion documentaire — BL, LTA, factures, certificats',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    group: 'gestion',
    order: 4,
    enabled: true,
    premium: true,
    description: 'Analyses avancées — IA prédictive, optimisation coûts',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: 'FileSpreadsheet',
    group: 'gestion',
    order: 5,
    enabled: true,
    premium: false,
    description: 'Rapports et exportations — opérationnels, financiers, douaniers',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'tasks',
    label: 'Centre de Tâches',
    icon: 'ListTodo',
    group: 'gestion',
    order: 6,
    enabled: true,
    premium: false,
    description: 'Gestion des tâches — assignation, suivi, priorisation',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },
  {
    id: 'calendar',
    label: 'Calendrier',
    icon: 'CalendarDays',
    group: 'gestion',
    order: 7,
    enabled: true,
    premium: false,
    description: 'Calendrier des opérations — départs, arrivées, échéances',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'read' },
  },

  // Communication
  {
    id: 'chat',
    label: 'Messagerie',
    icon: 'MessageSquare',
    group: 'communication',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Messagerie interne — canaux, DM, escalade tickets',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },

  // Conformité
  {
    id: 'dangerous-goods',
    label: 'Marchandises Dangereuses',
    icon: 'Flame',
    group: 'conformite',
    order: 1,
    enabled: true,
    premium: true,
    description: 'Gestion MD — classification UN, DGD, emballage certifié, restrictions par mode',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'temperature-controlled',
    label: 'Chaîne du Froid',
    icon: 'ThermometerSnowflake',
    group: 'conformite',
    order: 2,
    enabled: true,
    premium: true,
    description: 'Chaîne du froid — conteneurs réfrigérés, data loggers, alertes température',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'write', viewer: 'read', client: 'none' },
  },
  {
    id: 'credit-management',
    label: 'Crédit & Risque',
    icon: 'CreditCard',
    group: 'conformite',
    order: 3,
    enabled: true,
    premium: true,
    description: 'Gestion du crédit client — limites, encours, relances, scoring risque',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'none', client: 'none' },
  },
  {
    id: 'compliance',
    label: 'Conformité Réglementaire',
    icon: 'ClipboardCheck',
    group: 'conformite',
    order: 4,
    enabled: true,
    premium: true,
    description: 'Conformité réglementaire — KYC, sanctions, embargo, licences, audits',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },
  {
    id: 'sustainability',
    label: 'Durabilité & RSE',
    icon: 'Leaf',
    group: 'conformite',
    order: 5,
    enabled: true,
    premium: true,
    description: 'Empreinte carbone, RSE, conformité environnementale',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
  },

  // Portail
  {
    id: 'customer-portal',
    label: 'Portail Client',
    icon: 'Users',
    group: 'portail',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Portail self-service client — suivi, factures, support',
    defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'write' },
  },

  // Système
  {
    id: 'users',
    label: 'Utilisateurs & Rôles',
    icon: 'Users',
    group: 'systeme',
    order: 1,
    enabled: true,
    premium: false,
    description: 'Gestion des utilisateurs, rôles RBAC et sessions',
    defaultPermissions: { admin: 'write', manager: 'read', agent: 'none', viewer: 'none', client: 'none' },
  },
  {
    id: 'integrations',
    label: 'Intégrations',
    icon: 'Plug',
    group: 'systeme',
    order: 2,
    enabled: true,
    premium: true,
    description: 'Intégrations API — ERP, CRM, douanes, transporteurs',
    defaultPermissions: { admin: 'write', manager: 'read', agent: 'none', viewer: 'none', client: 'none' },
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'Settings',
    group: 'systeme',
    order: 3,
    enabled: true,
    premium: false,
    description: 'Configuration de la plateforme — profil, entreprise, notifications',
    defaultPermissions: { admin: 'write', manager: 'read', agent: 'none', viewer: 'none', client: 'none' },
  },
];

// ─── Helper Functions ───────────────────────────────────────────

/** Get a module definition by its page ID */
export function getModuleById(id: PageType): ModuleDefinition | undefined {
  return moduleDefinitions.find((m) => m.id === id);
}

/** Get all modules in a specific navigation group */
export function getModulesByGroup(group: NavGroupKey): ModuleDefinition[] {
  return moduleDefinitions
    .filter((m) => m.group === group && m.enabled)
    .sort((a, b) => a.order - b.order);
}

/** Get all enabled modules */
export function getEnabledModules(): ModuleDefinition[] {
  return moduleDefinitions.filter((m) => m.enabled);
}

/** Get all premium modules */
export function getPremiumModules(): ModuleDefinition[] {
  return moduleDefinitions.filter((m) => m.premium);
}

/** Map a user-facing role string to a RoleKey */
export function mapRoleString(role: string): RoleKey {
  const normalized = role.toLowerCase().trim();
  if (normalized.includes('admin') || normalized.includes('administrat')) return 'admin';
  if (normalized.includes('manager') || normalized.includes('responsable')) return 'manager';
  if (normalized.includes('agent')) return 'agent';
  if (normalized.includes('observ') || normalized.includes('viewer') || normalized.includes('lecture')) return 'viewer';
  if (normalized.includes('client') || normalized.includes('customer')) return 'client';
  // Default to viewer for safety
  return 'viewer';
}

/** Permission level labels */
export const permissionLevelLabels: Record<PermissionLevel, string> = {
  write: 'Lecture & Écriture',
  read: 'Lecture seule',
  none: 'Aucun accès',
};

/** Permission level colors for badges */
export const permissionLevelColors: Record<PermissionLevel, string> = {
  write: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  read: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  none: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
};

/** Permission level short codes */
export const permissionLevelCodes: Record<PermissionLevel, string> = {
  write: 'RW',
  read: 'RO',
  none: '—',
};
