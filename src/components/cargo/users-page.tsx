'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  Key,
  Activity,
  Monitor,
  Smartphone,
  Search,
  Plus,
  Mail,
  MoreHorizontal,
  Phone,
  Eye,
  ToggleLeft,
  ToggleRight,
  LogIn,
  LogOut,
  FileText,
  Settings,
  Edit3,
  Trash2,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  ShieldCheck,
  Lock,
  Wifi,
  Laptop,
  Tablet,
  MapPin,
  Copy,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// ─── Types ──────────────────────────────────────────────────────

type RoleKey = 'admin' | 'manager' | 'agent' | 'viewer' | 'client';
type PermissionLevel = 'write' | 'read' | 'none';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
  phone: string;
  team: string;
  joinedDate: string;
}

interface Role {
  key: RoleKey;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  userCount: number;
}

interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'navigation' | 'data' | 'settings' | 'admin';
  details: string;
  timestamp: string;
  ip: string;
}

interface SessionRecord {
  id: string;
  userId: string;
  userName: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'laptop';
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────

const mockUsers: UserRecord[] = [
  {
    id: 'u1',
    name: 'Ahmed Benali',
    email: 'ahmed.benali@guinee-logistique.pro',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-03-04 08:32',
    phone: '+213 555 010 001',
    team: 'Direction',
    joinedDate: '2024-01-15',
  },
  {
    id: 'u2',
    name: 'Fatima Khelifi',
    email: 'fatima.khelifi@guinee-logistique.pro',
    role: 'agent',
    status: 'active',
    lastLogin: '2026-03-04 09:15',
    phone: '+213 555 010 002',
    team: 'Fret Maritime',
    joinedDate: '2024-03-22',
  },
  {
    id: 'u3',
    name: 'Karim Djebbar',
    email: 'karim.djebbar@guinee-logistique.pro',
    role: 'manager',
    status: 'active',
    lastLogin: '2026-03-03 17:45',
    phone: '+213 555 010 003',
    team: 'Fret Aérien',
    joinedDate: '2024-06-10',
  },
  {
    id: 'u4',
    name: 'Nadia Boudiaf',
    email: 'nadia.boudiaf@guinee-logistique.pro',
    role: 'agent',
    status: 'active',
    lastLogin: '2026-03-04 07:50',
    phone: '+213 555 010 004',
    team: 'Douanes',
    joinedDate: '2024-08-01',
  },
  {
    id: 'u5',
    name: 'Youcef Mansouri',
    email: 'youcef.mansouri@guinee-logistique.pro',
    role: 'viewer',
    status: 'active',
    lastLogin: '2026-03-02 14:20',
    phone: '+213 555 010 005',
    team: 'Comptabilité',
    joinedDate: '2025-01-08',
  },
  {
    id: 'u6',
    name: 'Amina Rahmani',
    email: 'amina.rahmani@guinee-logistique.pro',
    role: 'client',
    status: 'inactive',
    lastLogin: '2026-02-15 11:30',
    phone: '+213 555 010 006',
    team: 'Clients',
    joinedDate: '2025-04-20',
  },
  {
    id: 'u7',
    name: 'Rachid Hamidou',
    email: 'rachid.hamidou@guinee-logistique.pro',
    role: 'agent',
    status: 'active',
    lastLogin: '2026-03-04 10:05',
    phone: '+213 555 010 007',
    team: 'Transport Terrestre',
    joinedDate: '2025-02-14',
  },
  {
    id: 'u8',
    name: 'Samira Ait Kaci',
    email: 'samira.aitkaci@guinee-logistique.pro',
    role: 'manager',
    status: 'inactive',
    lastLogin: '2026-02-28 16:10',
    phone: '+213 555 010 008',
    team: 'Entrepôt',
    joinedDate: '2025-06-30',
  },
];

const roles: Role[] = [
  {
    key: 'admin',
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités et paramètres système',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    userCount: 1,
  },
  {
    key: 'manager',
    label: 'Responsable',
    description: 'Gestion des opérations, rapports et supervision des équipes',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    userCount: 2,
  },
  {
    key: 'agent',
    label: 'Agent',
    description: 'Traitement des expéditions, suivi client et opérations quotidiennes',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    userCount: 3,
  },
  {
    key: 'viewer',
    label: 'Observateur',
    description: 'Consultation des données et rapports en lecture seule',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    userCount: 1,
  },
  {
    key: 'client',
    label: 'Client',
    description: 'Accès au portail client, suivi des expéditions propres',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    userCount: 1,
  },
];

const modules = [
  'Tableau de bord',
  'Expéditions',
  'Fret Maritime',
  'Fret Aérien',
  'Transport Terrestre',
  'Colis & Courier',
  'Douanes',
  'Entrepôt',
  'Clients',
  'Facturation',
  'Analytics',
  'Paramètres',
];

const permissionMatrix: Record<RoleKey, PermissionLevel[]> = {
  admin:   ['write','write','write','write','write','write','write','write','write','write','write','write'],
  manager: ['write','write','write','write','write','write','write','write','write','write','write','read'],
  agent:   ['read', 'write','write','write','write','write','read', 'write','read', 'read', 'read', 'none'],
  viewer:  ['read', 'read', 'read', 'read', 'read', 'read', 'read', 'read', 'read', 'read', 'read', 'none'],
  client:  ['read', 'read', 'none', 'none', 'none', 'read', 'none', 'none', 'read', 'read', 'none', 'none'],
};

const activityLog: ActivityEntry[] = [
  { id: 'a1', userId: 'u1', userName: 'Ahmed Benali', action: 'Connexion', category: 'auth', details: 'Connexion réussie depuis Alger', timestamp: '2026-03-04 08:32', ip: '192.168.1.10' },
  { id: 'a2', userId: 'u2', userName: 'Fatima Khelifi', action: 'Création expédition', category: 'data', details: 'Nouvelle expédition FFP-0030-2026 créée', timestamp: '2026-03-04 09:20', ip: '192.168.1.22' },
  { id: 'a3', userId: 'u3', userName: 'Karim Djebbar', action: 'Modification statut', category: 'data', details: 'Conteneur CSLU-8912345 → Arrivé au port', timestamp: '2026-03-04 09:45', ip: '192.168.1.35' },
  { id: 'a4', userId: 'u4', userName: 'Nadia Boudiaf', action: 'Dédouanement', category: 'data', details: 'Déclaration DD-2026-0003 dédouanée', timestamp: '2026-03-04 10:05', ip: '192.168.1.41' },
  { id: 'a5', userId: 'u7', userName: 'Rachid Hamidou', action: 'Page visitée', category: 'navigation', details: 'Consultation Transport Terrestre', timestamp: '2026-03-04 10:15', ip: '192.168.1.58' },
  { id: 'a6', userId: 'u1', userName: 'Ahmed Benali', action: 'Modification paramètres', category: 'settings', details: 'Taux de change EUR/DZD mis à jour', timestamp: '2026-03-04 10:30', ip: '192.168.1.10' },
  { id: 'a7', userId: 'u2', userName: 'Fatima Khelifi', action: 'Ajout client', category: 'data', details: 'Nouveau client SARL MedTrans ajouté', timestamp: '2026-03-03 16:45', ip: '192.168.1.22' },
  { id: 'a8', userId: 'u5', userName: 'Youcef Mansouri', action: 'Export rapport', category: 'data', details: 'Rapport facturation Mars 2026 exporté', timestamp: '2026-03-03 14:50', ip: '192.168.1.67' },
  { id: 'a9', userId: 'u3', userName: 'Karim Djebbar', action: 'Invitation utilisateur', category: 'admin', details: 'Invitation envoyée à youcef.m@guinee-logistique.pro', timestamp: '2026-03-02 11:20', ip: '192.168.1.35' },
  { id: 'a10', userId: 'u6', userName: 'Amina Rahmani', action: 'Connexion échouée', category: 'auth', details: 'Tentative de connexion échouée — mot de passe incorrect', timestamp: '2026-02-28 09:10', ip: '10.0.0.55' },
];

const sessions: SessionRecord[] = [
  { id: 's1', userId: 'u1', userName: 'Ahmed Benali', device: 'desktop', browser: 'Chrome 122', os: 'Windows 11', ip: '192.168.1.10', location: 'Alger, DZ', lastActivity: '2026-03-04 10:32', isCurrent: true },
  { id: 's2', userId: 'u2', userName: 'Fatima Khelifi', device: 'desktop', browser: 'Firefox 124', os: 'macOS Sonoma', ip: '192.168.1.22', location: 'Oran, DZ', lastActivity: '2026-03-04 09:58', isCurrent: false },
  { id: 's3', userId: 'u3', userName: 'Karim Djebbar', device: 'laptop', browser: 'Chrome 122', os: 'Windows 11', ip: '192.168.1.35', location: 'Alger, DZ', lastActivity: '2026-03-04 09:45', isCurrent: false },
  { id: 's4', userId: 'u4', userName: 'Nadia Boudiaf', device: 'mobile', browser: 'Safari Mobile', os: 'iOS 17', ip: '192.168.1.41', location: 'Constantine, DZ', lastActivity: '2026-03-04 10:05', isCurrent: false },
  { id: 's5', userId: 'u7', userName: 'Rachid Hamidou', device: 'tablet', browser: 'Chrome 122', os: 'Android 14', ip: '192.168.1.58', location: 'Sétif, DZ', lastActivity: '2026-03-04 10:15', isCurrent: false },
  { id: 's6', userId: 'u1', userName: 'Ahmed Benali', device: 'mobile', browser: 'Safari Mobile', os: 'iOS 17', ip: '10.0.0.12', location: 'Alger, DZ', lastActivity: '2026-03-04 08:10', isCurrent: false },
];

const teams = [
  'Direction', 'Fret Maritime', 'Fret Aérien', 'Transport Terrestre',
  'Douanes', 'Entrepôt', 'Comptabilité', 'Clients', 'IT',
];

// ─── Helpers ────────────────────────────────────────────────────

const roleLabels: Record<RoleKey, string> = {
  admin: 'Administrateur',
  manager: 'Responsable',
  agent: 'Agent',
  viewer: 'Observateur',
  client: 'Client',
};

const roleColors: Record<RoleKey, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  agent: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  viewer: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  client: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
};

const categoryIcons: Record<ActivityEntry['category'], React.ElementType> = {
  auth: LogIn,
  navigation: Globe,
  data: FileText,
  settings: Settings,
  admin: Shield,
};

const categoryColors: Record<ActivityEntry['category'], string> = {
  auth: 'text-teal-500',
  navigation: 'text-sky-500',
  data: 'text-emerald-500',
  settings: 'text-amber-500',
  admin: 'text-red-500',
};

const categoryLabels: Record<ActivityEntry['category'], string> = {
  auth: 'Authentification',
  navigation: 'Navigation',
  data: 'Données',
  settings: 'Paramètres',
  admin: 'Administration',
};

const deviceIcons: Record<SessionRecord['device'], React.ElementType> = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

function getPermissionCell(level: PermissionLevel) {
  if (level === 'write') {
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          RW
        </span>
      </div>
    );
  }
  if (level === 'read') {
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
          RO
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs font-bold">
        —
      </span>
    </div>
  );
}

function getPermissionLevelLabel(level: PermissionLevel) {
  if (level === 'write') return 'Lecture & Écriture';
  if (level === 'read') return 'Lecture seule';
  return 'Aucun accès';
}

function getUserPermissions(role: RoleKey) {
  return modules.map((mod, i) => ({
    module: mod,
    level: permissionMatrix[role][i],
  }));
}

// ─── Component ──────────────────────────────────────────────────

export default function UsersPage() {
  const [userData, setUserData] = useState<UserRecord[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [activeTab, setActiveTab] = useState('users');

  // Dialogs
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleKey>('agent');
  const [inviteTeam, setInviteTeam] = useState('');

  // Activity filter
  const [activityCategory, setActivityCategory] = useState<string>('all');

  const ITEMS_PER_PAGE = 6;

  // ── Computed ──

  const filteredUsers = useMemo(() => {
    let result = [...userData];
    if (filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole);
    }
    if (filterStatus !== 'all') {
      result = result.filter((u) => u.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [userData, filterRole, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentTablePage - 1) * ITEMS_PER_PAGE,
    currentTablePage * ITEMS_PER_PAGE
  );

  const filteredActivity = useMemo(() => {
    if (activityCategory === 'all') return activityLog;
    return activityLog.filter((a) => a.category === activityCategory);
  }, [activityCategory]);

  // ── KPI ──

  const activeUsers = userData.filter((u) => u.status === 'active').length;
  const activeSessions = sessions.length;
  const todayActions = activityLog.filter((a) => a.timestamp.startsWith('2026-03-04')).length;

  // ── Handlers ──

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newUser: UserRecord = {
      id: `u${userData.length + 1}`,
      name: inviteEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail,
      role: inviteRole,
      status: 'active',
      lastLogin: '—',
      phone: '—',
      team: inviteTeam || 'Non assigné',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUserData([newUser, ...userData]);
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('agent');
    setInviteTeam('');
  };

  const handleToggleStatus = (userId: string) => {
    setUserData((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      )
    );
  };

  const handleViewDetail = (user: UserRecord) => {
    setSelectedUser(user);
    setShowDetailDialog(true);
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDialog(true);
  };

  // ── KPI Cards ──

  const kpis = [
    {
      label: 'Utilisateurs Actifs',
      value: activeUsers,
      icon: Users,
      color: '#0d9488',
      bgLight: 'bg-teal-50 dark:bg-teal-900/20',
      change: `${userData.length} total`,
    },
    {
      label: 'Rôles Définis',
      value: roles.length,
      icon: Shield,
      color: '#059669',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      change: 'RBAC actif',
    },
    {
      label: 'Sessions en Cours',
      value: activeSessions,
      icon: Monitor,
      color: '#0f172a',
      bgLight: 'bg-slate-50 dark:bg-slate-900/20',
      change: `${sessions.filter((s) => s.isCurrent).length} actuelle`,
    },
    {
      label: "Actions Aujourd'hui",
      value: todayActions,
      icon: Activity,
      color: '#d97706',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      change: 'Dernière 24h',
    },
  ];

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Utilisateurs & Rôles
          </motion.h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion des accès et permissions RBAC
          </p>
        </div>
        <Button
          size="sm"
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
          onClick={() => setShowInviteDialog(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Inviter un utilisateur
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: kpi.color }}>
                      {kpi.value}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{kpi.change}</p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bgLight}`}
                  >
                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs sm:text-sm">
            <Shield className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Rôles & Permissions
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            <Activity className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Journal d&apos;Activité
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs sm:text-sm">
            <Monitor className="w-4 h-4 mr-1.5 hidden sm:inline" />
            Sessions
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab: Users ─── */}
        <TabsContent value="users" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email, rôle..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentTablePage(1);
                    }}
                  />
                </div>
                <Select
                  value={filterRole}
                  onValueChange={(v) => {
                    setFilterRole(v);
                    setCurrentTablePage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.key} value={r.key}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={(v) => {
                    setFilterStatus(v);
                    setCurrentTablePage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Utilisateur</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-xs">Rôle</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Dernière connexion</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Équipe</TableHead>
                      <TableHead className="text-xs w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
                          onClick={() => handleViewDetail(user)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback
                                  className="text-xs font-semibold text-white"
                                  style={{
                                    background:
                                      user.role === 'admin'
                                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                        : user.role === 'manager'
                                        ? 'linear-gradient(135deg, #d97706, #b45309)'
                                        : user.role === 'agent'
                                        ? 'linear-gradient(135deg, #0d9488, #059669)'
                                        : user.role === 'viewer'
                                        ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                                        : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                  }}
                                >
                                  {user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 dark:text-gray-300 hidden md:table-cell">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 ${roleColors[user.role]}`}
                            >
                              {roleLabels[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {user.status === 'active' ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    Actif
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Inactif
                                  </span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 hidden lg:table-cell">
                            {user.lastLogin}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 hidden sm:table-cell">
                            {user.team}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(user.id);
                                }}
                                title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                              >
                                {user.status === 'active' ? (
                                  <ToggleRight className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <button
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetail(user);
                                }}
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">
                    {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} — Page{' '}
                    {currentTablePage}/{totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={currentTablePage === 1}
                      onClick={() => setCurrentTablePage(currentTablePage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentTablePage ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
                        style={
                          page === currentTablePage
                            ? { background: 'linear-gradient(135deg, #0d9488, #059669)' }
                            : {}
                        }
                        onClick={() => setCurrentTablePage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={currentTablePage === totalPages}
                      onClick={() => setCurrentTablePage(currentTablePage + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Roles & Permissions ─── */}
        <TabsContent value="permissions" className="mt-4 space-y-6">
          {/* Roles Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((role, idx) => (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: role.color.includes('red') ? '#dc2626' : role.color.includes('amber') ? '#d97706' : role.color.includes('teal') ? '#0d9488' : role.color.includes('sky') ? '#0284c7' : '#7c3aed' }}
                  onClick={() => handleViewRole(role)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5" style={{ color: role.color.includes('red') ? '#dc2626' : role.color.includes('amber') ? '#d97706' : role.color.includes('teal') ? '#0d9488' : role.color.includes('sky') ? '#0284c7' : '#7c3aed' }} />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {role.label}
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {role.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={`text-[10px] ${role.bgColor}`}>
                        {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
                      </Badge>
                      <Key className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Permission Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Matrice de Permissions
              </CardTitle>
              <CardDescription className="text-xs">
                Vue d&apos;ensemble des accès par rôle et module
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Legend */}
              <div className="flex items-center gap-4 px-6 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    RW
                  </span>
                  <span className="text-[11px] text-gray-500">Lecture & Écriture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                    RO
                  </span>
                  <span className="text-[11px] text-gray-500">Lecture seule</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-bold">
                    —
                  </span>
                  <span className="text-[11px] text-gray-500">Aucun accès</span>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold sticky left-0 bg-white dark:bg-gray-950 z-10 min-w-[160px]">
                        Module
                      </TableHead>
                      {roles.map((role) => (
                        <TableHead
                          key={role.key}
                          className="text-xs font-semibold text-center min-w-[80px]"
                        >
                          <Badge variant="secondary" className={`text-[10px] ${role.bgColor}`}>
                            {role.label}
                          </Badge>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((mod, modIdx) => (
                      <TableRow key={mod}>
                        <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-950 z-10">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            {mod}
                          </div>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.key} className="text-center p-2">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: modIdx * 0.02 }}
                            >
                              {getPermissionCell(permissionMatrix[role.key][modIdx])}
                            </motion.div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Activity Log ─── */}
        <TabsContent value="activity" className="mt-4 space-y-4">
          {/* Activity Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher dans le journal..."
                    className="pl-9"
                  />
                </div>
                <Select value={activityCategory} onValueChange={setActivityCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="auth">Authentification</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="data">Données</SelectItem>
                    <SelectItem value="settings">Paramètres</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Journal d&apos;Activité Récent
              </CardTitle>
              <CardDescription className="text-xs">
                {filteredActivity.length} entrée{filteredActivity.length > 1 ? 's' : ''} trouvée
                {filteredActivity.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                {filteredActivity.map((entry, idx) => {
                  const CategoryIcon = categoryIcons[entry.category];
                  const catColor = categoryColors[entry.category];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <div
                        className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                          entry.category === 'auth'
                            ? 'bg-teal-100 dark:bg-teal-900/30'
                            : entry.category === 'navigation'
                            ? 'bg-sky-100 dark:bg-sky-900/30'
                            : entry.category === 'data'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : entry.category === 'settings'
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        <CategoryIcon className={`w-4.5 h-4.5 ${catColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {entry.action}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-[9px] px-1.5 py-0 ${
                              entry.category === 'auth'
                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                : entry.category === 'navigation'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                : entry.category === 'data'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : entry.category === 'settings'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {categoryLabels[entry.category]}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {entry.details}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {entry.userName}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {entry.timestamp}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {entry.ip}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab: Sessions ─── */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Sessions Actives
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {sessions.length} session{sessions.length > 1 ? 's' : ''} active
                    {sessions.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sessions.map((session, idx) => {
                  const DeviceIcon = deviceIcons[session.device];
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      {/* Device Icon */}
                      <div
                        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                          session.isCurrent
                            ? 'bg-teal-100 dark:bg-teal-900/30'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <DeviceIcon
                          className={`w-5 h-5 ${
                            session.isCurrent
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        />
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {session.userName}
                          </span>
                          {session.isCurrent && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              Session actuelle
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {session.browser} · {session.os}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {session.ip}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.lastActivity}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {session.isCurrent ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-teal-600 border-teal-300 dark:text-teal-400 dark:border-teal-700"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="w-3.5 h-3.5 mr-1" />
                            Révoquer
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Session Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessions.filter((s) => s.device === 'desktop' || s.device === 'laptop').length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Desktop / Laptop</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessions.filter((s) => s.device === 'mobile').length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <Tablet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessions.filter((s) => s.device === 'tablet').length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tablette</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Dialog: Invite User ─── */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Inviter un utilisateur
            </DialogTitle>
            <DialogDescription>
              Envoyez une invitation par email pour rejoindre l&apos;équipe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="collegue@guinee-logistique.pro"
                  className="pl-9"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Rôle assigné</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as RoleKey)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.key} value={role.key}>
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Équipe</Label>
                <Select value={inviteTeam} onValueChange={setInviteTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Role Preview */}
            {inviteRole && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Aperçu des permissions — {roleLabels[inviteRole]}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {getUserPermissions(inviteRole)
                    .slice(0, 6)
                    .map((perm) => (
                      <div
                        key={perm.module}
                        className="flex items-center gap-1 text-[10px]"
                      >
                        {perm.level === 'write' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : perm.level === 'read' ? (
                          <Eye className="w-3 h-3 text-amber-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        )}
                        <span className="text-gray-600 dark:text-gray-300 truncate">
                          {perm.module}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleInvite}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              disabled={!inviteEmail}
            >
              <Send className="w-4 h-4 mr-1.5" />
              Envoyer l&apos;invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: User Detail ─── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;utilisateur</DialogTitle>
            <DialogDescription>Profil, permissions et activité récente</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback
                    className="text-lg font-bold text-white"
                    style={{
                      background:
                        selectedUser.role === 'admin'
                          ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                          : selectedUser.role === 'manager'
                          ? 'linear-gradient(135deg, #d97706, #b45309)'
                          : selectedUser.role === 'agent'
                          ? 'linear-gradient(135deg, #0d9488, #059669)'
                          : selectedUser.role === 'viewer'
                          ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                          : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    }}
                  >
                    {selectedUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`text-[10px] ${roleColors[selectedUser.role]}`}>
                      {roleLabels[selectedUser.role]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        selectedUser.status === 'active'
                          ? 'text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700'
                          : 'text-gray-400 border-gray-300 dark:text-gray-500 dark:border-gray-600'
                      }`}
                    >
                      {selectedUser.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedUser.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Membre depuis {selectedUser.joinedDate} · Équipe {selectedUser.team}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {selectedUser.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selectedUser.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Dernière connexion: {selectedUser.lastLogin}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Shield className="w-4 h-4 text-gray-400" />
                  {roleLabels[selectedUser.role]}
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Permissions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getUserPermissions(selectedUser.role).map((perm) => (
                    <div
                      key={perm.module}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        perm.level === 'write'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : perm.level === 'read'
                          ? 'bg-amber-50 dark:bg-amber-900/20'
                          : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      {perm.level === 'write' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : perm.level === 'read' ? (
                        <Eye className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                          {perm.module}
                        </p>
                        <p
                          className={`text-[10px] ${
                            perm.level === 'write'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : perm.level === 'read'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {getPermissionLevelLabel(perm.level)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Activité récente
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activityLog
                    .filter((a) => a.userId === selectedUser.id)
                    .map((entry) => {
                      const CategoryIcon = categoryIcons[entry.category];
                      return (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900"
                        >
                          <CategoryIcon
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${categoryColors[entry.category]}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                {entry.action}
                              </span>
                              <span className="text-[10px] text-gray-400">{entry.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {entry.details}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  {activityLog.filter((a) => a.userId === selectedUser.id).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Aucune activité récente
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    handleToggleStatus(selectedUser.id);
                    setSelectedUser({
                      ...selectedUser,
                      status: selectedUser.status === 'active' ? 'inactive' : 'active',
                    });
                  }}
                >
                  {selectedUser.status === 'active' ? (
                    <>
                      <UserX className="w-3.5 h-3.5 mr-1" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Activer
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedUser.email);
                  }}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copier l&apos;email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Role Detail ─── */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Détail du rôle
            </DialogTitle>
            <DialogDescription>Permissions associées au rôle</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-5">
              {/* Role Header */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      selectedRole.key === 'admin'
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                        : selectedRole.key === 'manager'
                        ? 'linear-gradient(135deg, #d97706, #b45309)'
                        : selectedRole.key === 'agent'
                        ? 'linear-gradient(135deg, #0d9488, #059669)'
                        : selectedRole.key === 'viewer'
                        ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                        : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedRole.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedRole.description}
                  </p>
                  <Badge className={`text-[10px] mt-1 ${selectedRole.bgColor}`}>
                    {userData.filter((u) => u.role === selectedRole.key).length} utilisateur
                    {userData.filter((u) => u.role === selectedRole.key).length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Permissions List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Permissions par module
                </h4>
                <div className="space-y-1.5">
                  {getUserPermissions(selectedRole.key).map((perm) => (
                    <div
                      key={perm.module}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {perm.module}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            perm.level === 'write'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : perm.level === 'read'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {getPermissionLevelLabel(perm.level)}
                        </span>
                        {perm.level === 'write' ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            RW
                          </span>
                        ) : perm.level === 'read' ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                            RO
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-bold">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Users with this role */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Utilisateurs avec ce rôle
                </h4>
                <div className="space-y-2">
                  {userData
                    .filter((u) => u.role === selectedRole.key)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback
                            className="text-xs font-semibold text-white"
                            style={{
                              background:
                                user.role === 'admin'
                                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                  : user.role === 'manager'
                                  ? 'linear-gradient(135deg, #d97706, #b45309)'
                                  : user.role === 'agent'
                                  ? 'linear-gradient(135deg, #0d9488, #059669)'
                                  : user.role === 'viewer'
                                  ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                                  : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            }}
                          >
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            user.status === 'active'
                              ? 'text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700'
                              : 'text-gray-400 border-gray-300 dark:text-gray-500 dark:border-gray-600'
                          }`}
                        >
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    ))}
                  {userData.filter((u) => u.role === selectedRole.key).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Aucun utilisateur avec ce rôle
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
