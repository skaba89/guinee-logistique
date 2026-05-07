'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Users,
  Building,
  Bell,
  Moon,
  Sun,
  Globe,
  Info,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  Key,
  Webhook,
  DollarSign,
  Palette,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Lock,
  RotateCcw,
  Puzzle,
  ToggleLeft,
  ToggleRight,
  Printer,
  Tag,
  ScrollText,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCargoStore } from '@/lib/cargo-store';
import { useTheme } from 'next-themes';
import {
  type RoleKey,
  type PermissionLevel,
  type NavGroupKey,
  moduleDefinitions,
  navGroups,
  roleDefinitions,
  getEffectivePermission,
  getFullPermissionMatrix,
  setPermissionOverride,
  setFeatureFlag,
  isModuleEnabled,
  savePermissionsConfig,
  resetPermissionsConfig,
  type PermissionsConfig,
} from '@/lib/permissions';
import {
  permissionLevelLabels,
  permissionLevelColors,
  permissionLevelCodes,
  iconNameToComponent,
} from '@/lib/module-config';
import {
  allBusinessRules,
  isRuleEnabled as isRuleEnabledLib,
  toggleRule as toggleRuleLib,
  currentFuelSurcharges,
} from '@/lib/business-rules';
import {
  getAuditTrail,
  auditActionLabels,
  auditSeverityColors,
  auditSeverityLabels,
  auditResultLabels,
  auditResultColors,
  fieldLevelPermissions,
} from '@/lib/audit-trail';
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  getPendingApprovals,
  approveRequest,
  rejectRequest,
  approvalStatusLabels,
  approvalStatusColors,
  notificationTypeLabels,
} from '@/lib/notifications';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  created: string;
}

export default function SettingsPage() {
  const user = useCargoStore((s) => s.user);
  const roleKey = useCargoStore((s) => s.roleKey);
  const permissionsConfig = useCargoStore((s) => s.permissionsConfig);
  const setPermissionsConfig = useCargoStore((s) => s.setPermissionsConfig);
  const storeCurrency = useCargoStore((s) => s.currency);
  const setStoreCurrency = useCargoStore((s) => s.setCurrency);
  const { theme, setTheme } = useTheme();

  // ─── Module & Permissions Configuration ─────────────
  const [activeModuleTab, setActiveModuleTab] = useState<'features' | 'permissions' | 'client-visibility'>('features');
  const [selectedPermGroup, setSelectedPermGroup] = useState<NavGroupKey | 'all'>('all');

  // Permission matrix derived from config
  const permissionMatrix = useMemo(() => {
    return getFullPermissionMatrix(permissionsConfig);
  }, [permissionsConfig]);

  const handlePermissionChange = (moduleId: string, role: RoleKey, level: PermissionLevel) => {
    const newConfig = setPermissionOverride(moduleId as any, role, level, permissionsConfig);
    savePermissionsConfig(newConfig);
    setPermissionsConfig(newConfig);
  };

  const handleFeatureToggle = (moduleId: string, enabled: boolean) => {
    const newConfig = setFeatureFlag(moduleId as any, enabled, permissionsConfig);
    savePermissionsConfig(newConfig);
    setPermissionsConfig(newConfig);
  };

  const handleResetPermissions = () => {
    resetPermissionsConfig();
    setPermissionsConfig({ overrides: {}, featureFlags: {}, clientVisibility: {} });
  };

  // ─── Client Module Visibility ─────────────
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const handleClientModuleToggle = (clientId: string, moduleId: string, visible: boolean) => {
    const newVis = setClientModuleVisibility(clientId, moduleId as any, visible, permissionsConfig.clientVisibility);
    const newConfig = { ...permissionsConfig, clientVisibility: newVis };
    savePermissionsConfig(newConfig);
    setPermissionsConfig(newConfig);
  };

  const handleAllClientModulesToggle = (clientId: string, visible: boolean) => {
    const newVis = setAllClientModulesVisibility(clientId, visible, permissionsConfig.clientVisibility);
    const newConfig = { ...permissionsConfig, clientVisibility: newVis };
    savePermissionsConfig(newConfig);
    setPermissionsConfig(newConfig);
  };

  const handleResetClientVisibility = (clientId: string) => {
    const newVis = resetClientModuleVisibility(clientId, permissionsConfig.clientVisibility);
    const newConfig = { ...permissionsConfig, clientVisibility: newVis };
    savePermissionsConfig(newConfig);
    setPermissionsConfig(newConfig);
  };

  // Get modules that are accessible to the 'client' role by default
  const clientAccessibleModules = useMemo(() => {
    return moduleDefinitions.filter((m) => m.defaultPermissions.client !== 'none');
  }, []);

  // Filter modules by group
  const filteredModules = useMemo(() => {
    if (selectedPermGroup === 'all') return permissionMatrix;
    return permissionMatrix.filter((m) => m.module.group === selectedPermGroup);
  }, [permissionMatrix, selectedPermGroup]);

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Guinée Logistique',
    address: '23 Rue Didouche Mourad, Alger Centre',
    phone: '+213 21 00 00 00',
    email: 'contact@guinee-logistique.pro',
  });

  const [notifications, setNotifications] = useState({
    emailNewShipment: true,
    emailStatusChange: true,
    emailInvoice: true,
    smsShipment: false,
    smsStatusChange: true,
    smsDelivery: true,
  });

  const [saved, setSaved] = useState(false);

  // Zebra Printers (from localStorage or defaults)
  const [zebraPrinters] = useState<Array<{
    id: string; name: string; model: string; connection: string; ipAddress?: string; port?: number; usbPort?: string;
    dpi: number; defaultLabelFormat: string; status: string; labelsPrinted: number; isDefault: boolean;
    darkness: number; speed: number; mediaType: string;
  }>>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('guinee-logistique-printers');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [
      { id: 'printer-1', name: 'Zebra ZD421', model: 'ZD421t', connection: 'network', ipAddress: '192.168.1.50', port: 9100, dpi: 300, defaultLabelFormat: '4x6', status: 'online', labelsPrinted: 1247, isDefault: true, darkness: 15, speed: 6, mediaType: 'Autocollant 100x150mm' },
      { id: 'printer-2', name: 'Zebra ZT411', model: 'ZT411', connection: 'network', ipAddress: '192.168.1.51', port: 9100, dpi: 300, defaultLabelFormat: '4x8', status: 'idle', labelsPrinted: 3521, isDefault: false, darkness: 18, speed: 8, mediaType: 'Autocollant 100x200mm' },
      { id: 'printer-3', name: 'Zebra GK420d', model: 'GK420d', connection: 'usb', usbPort: 'USB001', dpi: 203, defaultLabelFormat: '2-4x4', status: 'offline', labelsPrinted: 856, isDefault: false, darkness: 12, speed: 4, mediaType: 'Autocollant 62x100mm' },
    ];
  });

  const printerStatusDot: Record<string, string> = {
    online: 'bg-green-500', offline: 'bg-gray-400', error: 'bg-red-500', idle: 'bg-amber-500', printing: 'bg-blue-500 animate-pulse',
  };
  const printerStatusText: Record<string, string> = {
    online: 'En ligne', offline: 'Hors ligne', error: 'Erreur', idle: 'En veille', printing: 'Impression',
  };

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'ak1', name: 'Production API', key: 'ffp_live_k8x2m9p4q7r1s3t5', created: '2026-01-15', lastUsed: 'Il y a 2h', status: 'active' },
    { id: 'ak2', name: 'Test API', key: 'ffp_test_a1b2c3d4e5f6g7h8', created: '2026-02-01', lastUsed: 'Il y a 5j', status: 'active' },
    { id: 'ak3', name: 'Ancienne clé', key: 'ffp_live_z9y8x7w6v5u4t3s2', created: '2025-11-10', lastUsed: 'Il y a 30j', status: 'revoked' },
  ]);
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: 'wh1', url: 'https://api.example.com/webhooks/shipment', events: ['shipment.created', 'shipment.status_changed'], status: 'active', created: '2026-01-20' },
    { id: 'wh2', url: 'https://api.example.com/webhooks/invoice', events: ['invoice.overdue', 'invoice.paid'], status: 'active', created: '2026-02-05' },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);

  // Multi-currency
  const [currencies, setCurrencies] = useState([
    { code: 'DZD', name: 'Dinar Algérien', symbol: 'DA', rate: 1, isDefault: true, active: true },
    { code: 'EUR', name: 'Euro', symbol: '\u20AC', rate: 0.0068, isDefault: false, active: true },
    { code: 'USD', name: 'Dollar US', symbol: '$', rate: 0.0074, isDefault: false, active: true },
    { code: 'GBP', name: 'Livre Sterling', symbol: '\u00A3', rate: 0.0054, isDefault: false, active: false },
  ]);
  const [defaultCurrency, setDefaultCurrency] = useState(storeCurrency);

  // Sync local state with store
  const handleCurrencyChange = (code: string) => {
    setDefaultCurrency(code);
    setStoreCurrency(code);
  };

  // Branding
  const [branding, setBranding] = useState({
    primaryColor: '#0d9488',
    secondaryColor: '#059669',
    logoUrl: '',
    companyName: 'Guinée Logistique',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    if (currentPassword !== (user?.password || '')) {
      setPasswordError('Mot de passe actuel incorrect');
      return;
    }

    // Simulate password change success
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const generateApiKey = () => {
    if (!newKeyName.trim()) return;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'ffp_live_';
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newKey: ApiKey = {
      id: `ak${apiKeys.length + 1}`,
      name: newKeyName,
      key,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Jamais',
      status: 'active',
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)));
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    });
  };

  const addWebhook = () => {
    if (!newWebhookUrl.trim() || newWebhookEvents.length === 0) return;
    const newWh: Webhook = {
      id: `wh${webhooks.length + 1}`,
      url: newWebhookUrl,
      events: [...newWebhookEvents],
      status: 'active',
      created: new Date().toISOString().split('T')[0],
    };
    setWebhooks([...webhooks, newWh]);
    setNewWebhookUrl('');
    setNewWebhookEvents([]);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const toggleWebhookEvent = (event: string) => {
    setNewWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const webhookEventOptions = [
    'shipment.created',
    'shipment.status_changed',
    'shipment.delivered',
    'invoice.paid',
    'invoice.overdue',
    'container.arrived',
    'flight.delayed',
    'customs.cleared',
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configurez votre application</p>
        </div>
        <Button
          size="sm"
          className="text-xs text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-1" />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </Button>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" />
            Profil utilisateur
          </CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'AB'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name || 'Utilisateur'}</h3>
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || 'Administrateur'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Nom complet</Label>
              <Input value={user?.name || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Email</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Téléphone</Label>
              <Input value={user?.phone || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Rôle</Label>
              <Input value={user?.role || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Module Configuration & Permissions ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-teal-500" />
            Modules & Permissions
          </CardTitle>
          <CardDescription>Activez/désactivez les modules et configurez les droits d&apos;accès par rôle</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Tab selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModuleTab('features')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeModuleTab === 'features'
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ToggleLeft className="w-4 h-4 inline mr-1.5" />
              Feature Flags
            </button>
            <button
              onClick={() => setActiveModuleTab('permissions')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeModuleTab === 'permissions'
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1.5" />
              Matrice de Permissions
            </button>
            <button
              onClick={() => setActiveModuleTab('client-visibility')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeModuleTab === 'client-visibility'
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1.5" />
              Visibilité Client
            </button>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                onClick={handleResetPermissions}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* ─── Feature Flags Tab ─── */}
          {activeModuleTab === 'features' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Activez ou désactivez les modules fonctionnels. Un module désactivé sera invisible pour tous les utilisateurs, quel que soit leur rôle.
              </p>
              {navGroups.map((group) => {
                const groupModules = moduleDefinitions.filter((m) => m.group === group.key);
                if (groupModules.length === 0) return null;
                return (
                  <div key={group.key}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mt-4 first:mt-0">
                      {group.label}
                    </p>
                    <div className="space-y-1.5">
                      {groupModules.map((mod) => {
                        const enabled = isModuleEnabled(mod.id, permissionsConfig);
                        const IconComponent = iconNameToComponent[mod.icon];
                        const isOverridden = permissionsConfig.featureFlags[mod.id] !== undefined;
                        return (
                          <div
                            key={mod.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              enabled
                                ? 'border-gray-200 dark:border-gray-700'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 opacity-60'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              enabled ? 'bg-teal-100 dark:bg-teal-900/20' : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              {IconComponent && <IconComponent className={`w-4.5 h-4.5 ${enabled ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{mod.label}</p>
                                {mod.premium && (
                                  <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0">
                                    Premium
                                  </Badge>
                                )}
                                {isOverridden && (
                                  <Badge className="text-[9px] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 px-1.5 py-0">
                                    Personnalisé
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mod.description}</p>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => handleFeatureToggle(mod.id, checked)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Permission Matrix Tab ─── */}
          {activeModuleTab === 'permissions' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configurez les droits d&apos;accès par module et par rôle. Cliquez sur une cellule pour changer le niveau de permission.
              </p>

              {/* Role legend */}
              <div className="flex flex-wrap gap-2">
                {roleDefinitions.map((role) => (
                  <Badge key={role.key} className={`text-[10px] px-2 py-0.5 ${role.bgColor}`}>
                    {role.label}
                  </Badge>
                ))}
              </div>

              {/* Permission level legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">RW</span>
                  <span className="text-[11px] text-gray-500">Lecture & Écriture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">RO</span>
                  <span className="text-[11px] text-gray-500">Lecture seule</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-bold">—</span>
                  <span className="text-[11px] text-gray-500">Aucun accès</span>
                </div>
              </div>

              {/* Group filter */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedPermGroup('all')}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedPermGroup === 'all'
                      ? 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700'
                      : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                  }`}
                >
                  Tous
                </button>
                {navGroups.map((group) => (
                  <button
                    key={group.key}
                    onClick={() => setSelectedPermGroup(group.key)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      selectedPermGroup === group.key
                        ? 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700'
                        : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              {/* Matrix grid */}
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-3 py-2 sticky left-0 bg-gray-50 dark:bg-gray-900/50 z-10 min-w-[180px]">
                        Module
                      </th>
                      {roleDefinitions.map((role) => (
                        <th key={role.key} className="text-center px-2 py-2 min-w-[80px]">
                          <Badge className={`text-[10px] ${role.bgColor}`}>
                            {role.label}
                          </Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.map(({ module: mod, permissions }) => {
                      const isEnabled = isModuleEnabled(mod.id, permissionsConfig);
                      const IconComponent = iconNameToComponent[mod.icon];
                      return (
                        <tr
                          key={mod.id}
                          className={`border-b border-gray-100 dark:border-gray-800 ${
                            !isEnabled ? 'opacity-40 bg-gray-50/50 dark:bg-gray-900/30' : ''
                          }`}
                        >
                          <td className="text-left px-3 py-2 sticky left-0 bg-white dark:bg-gray-950 z-10">
                            <div className="flex items-center gap-2">
                              {IconComponent && <IconComponent className="w-3.5 h-3.5 text-gray-400" />}
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{mod.label}</span>
                              {!isEnabled && (
                                <Badge className="text-[8px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1 py-0">
                                  Off
                                </Badge>
                              )}
                            </div>
                          </td>
                          {roleDefinitions.map((role) => {
                            const level = permissions[role.key];
                            const defaultLevel = mod.defaultPermissions[role.key];
                            const isCustom = level !== defaultLevel;
                            return (
                              <td key={role.key} className="text-center px-2 py-1.5">
                                <button
                                  onClick={() => {
                                    // Cycle through: none → read → write → none
                                    const nextLevel: PermissionLevel =
                                      level === 'none' ? 'read' : level === 'read' ? 'write' : 'none';
                                    handlePermissionChange(mod.id, role.key, nextLevel);
                                  }}
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold transition-all cursor-pointer hover:ring-2 hover:ring-teal-300 ${
                                    level === 'write'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : level === 'read'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                  } ${isCustom ? 'ring-1 ring-sky-400' : ''}`}
                                  title={`${permissionLevelLabels[level]}${isCustom ? ' (personnalisé)' : ' (défaut)'}`}
                                >
                                  {permissionLevelCodes[level]}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Override count */}
              {Object.keys(permissionsConfig.overrides).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>
                    {Object.keys(permissionsConfig.overrides).length} permission{Object.keys(permissionsConfig.overrides).length > 1 ? 's' : ''} personnalisée{Object.keys(permissionsConfig.overrides).length > 1 ? 's' : ''} (anneau bleu).
                    Cliquez sur « Réinitialiser » pour restaurer les valeurs par défaut.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── Client Module Visibility Tab ─── */}
          {activeModuleTab === 'client-visibility' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contrôlez les modules visibles pour chaque client. Sélectionnez un client, puis activez ou désactivez les modules qu&apos;il peut voir dans son portail.
                Un module masqué pour un client n&apos;apparaîtra pas dans sa barre latérale, même si son rôle lui donne normalement accès.
              </p>

              {/* Client selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Sélectionner un client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-full sm:w-80">
                    <SelectValue placeholder="Choisir un client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-gray-400">— {c.city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected client details & module toggles */}
              {selectedClientId ? (() => {
                const client = clientsData.find((c) => c.id === selectedClientId);
                if (!client) return null;
                const clientOverrides = permissionsConfig.clientVisibility[selectedClientId] ?? {};
                const overrideCount = Object.keys(clientOverrides).length;
                const visibleCount = clientAccessibleModules.filter((m) =>
                  isModuleVisibleForClient(m.id, selectedClientId, permissionsConfig.clientVisibility)
                ).length;
                const hiddenCount = clientAccessibleModules.length - visibleCount;

                return (
                  <div className="space-y-4">
                    {/* Client info banner */}
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{client.city}</span>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                              {client.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
                            </Badge>
                            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {visibleCount} module{visibleCount !== 1 ? 's' : ''} visible{visibleCount !== 1 ? 's' : ''}
                            </Badge>
                            {hiddenCount > 0 && (
                              <Badge className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {hiddenCount} masqué{hiddenCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {overrideCount > 0 && (
                              <Badge className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                {overrideCount} personnalisé{overrideCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                            onClick={() => handleAllClientModulesToggle(selectedClientId, true)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Tout afficher
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 text-gray-600 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            onClick={() => handleAllClientModulesToggle(selectedClientId, false)}
                          >
                            <EyeOff className="w-3 h-3 mr-1" />
                            Tout masquer
                          </Button>
                          {overrideCount > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                              onClick={() => handleResetClientVisibility(selectedClientId)}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Réinitialiser
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Module visibility grid — only show modules the client role has access to by default */}
                    {navGroups.map((group) => {
                      const groupModules = clientAccessibleModules.filter((m) => m.group === group.key);
                      if (groupModules.length === 0) return null;
                      return (
                        <div key={group.key}>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mt-3 first:mt-0">
                            {group.label}
                          </p>
                          <div className="space-y-1.5">
                            {groupModules.map((mod) => {
                              const isVisible = isModuleVisibleForClient(mod.id, selectedClientId, permissionsConfig.clientVisibility);
                              const isOverridden = clientOverrides[mod.id] !== undefined;
                              const IconComponent = iconNameToComponent[mod.icon];
                              return (
                                <div
                                  key={mod.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    isVisible
                                      ? 'border-gray-200 dark:border-gray-700'
                                      : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 opacity-60'
                                  }`}
                                >
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                    isVisible ? 'bg-violet-100 dark:bg-violet-900/20' : 'bg-gray-100 dark:bg-gray-800'
                                  }`}>
                                    {IconComponent && <IconComponent className={`w-4.5 h-4.5 ${isVisible ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{mod.label}</p>
                                      {mod.premium && (
                                        <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0">
                                          Premium
                                        </Badge>
                                      )}
                                      {isOverridden && (
                                        <Badge className="text-[9px] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 px-1.5 py-0">
                                          Personnalisé
                                        </Badge>
                                      )}
                                      {!isVisible && (
                                        <Badge className="text-[9px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0">
                                          Masqué
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mod.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${isVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                                      {isVisible ? 'Visible' : 'Masqué'}
                                    </span>
                                    <Switch
                                      checked={isVisible}
                                      onCheckedChange={(checked) => handleClientModuleToggle(selectedClientId, mod.id, checked)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-violet-100 dark:bg-violet-900/20 mb-4">
                    <Users className="w-8 h-8 text-violet-500 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sélectionnez un client</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Choisissez un client ci-dessus pour configurer la visibilité de ses modules.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-500" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Retapez le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {passwordError && (
              <p className="text-xs text-red-600 dark:text-red-400">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mot de passe modifié avec succès
              </p>
            )}
            <div className="flex justify-end">
              <Button
                size="sm"
                className="text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                <Key className="w-4 h-4 mr-1" />
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-500" />
            Informations entreprise
          </CardTitle>
          <CardDescription>Détails de votre société</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom de l&apos;entreprise</Label>
              <Input
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email professionnel</Label>
              <Input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Téléphone</Label>
              <Input
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Adresse</Label>
              <Input
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-500" />
            Clés API
          </CardTitle>
          <CardDescription>Gérez vos clés d&apos;accès API pour les intégrations</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Add new key */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nom de la clé API..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateApiKey} className="text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <Plus className="w-4 h-4 mr-1" />
              Générer
            </Button>
          </div>

          {/* Keys list */}
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${
                  apiKey.status === 'revoked'
                    ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{apiKey.name}</p>
                    <Badge className={`text-[10px] ${
                      apiKey.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {apiKey.status === 'active' ? 'Active' : 'Révoquée'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {showKeyValues[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 12)}${'*'.repeat(12)}`}
                    </code>
                    <button
                      onClick={() => setShowKeyValues({ ...showKeyValues, [apiKey.id]: !showKeyValues[apiKey.id] })}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {showKeyValues[apiKey.id] ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                    <button
                      onClick={() => copyKey(apiKey.id, apiKey.key)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {copiedKeyId === apiKey.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                    <span>Créée le: {apiKey.created}</span>
                    <span>Dernière utilisation: {apiKey.lastUsed}</span>
                  </div>
                </div>
                {apiKey.status === 'active' && (
                  <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20" onClick={() => revokeApiKey(apiKey.id)}>
                    Révoquer
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Configuration */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="w-5 h-5 text-teal-500" />
            Webhooks
          </CardTitle>
          <CardDescription>Configurez les webhooks pour les notifications en temps réel</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Add new webhook */}
          <div className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <Label className="text-xs">URL du webhook</Label>
              <Input
                placeholder="https://api.example.com/webhooks"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Événements</Label>
              <div className="flex flex-wrap gap-1.5">
                {webhookEventOptions.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleWebhookEvent(event)}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                      newWebhookEvents.includes(event)
                        ? 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={addWebhook} size="sm" className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter webhook
            </Button>
          </div>

          {/* Webhooks list */}
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">{webhook.url}</code>
                    <Badge className={`text-[10px] ${
                      webhook.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {webhook.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {webhook.events.map((event) => (
                      <span key={event} className="text-[9px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-100 dark:border-teal-800">
                        {event}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Créé le: {webhook.created}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => deleteWebhook(webhook.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Multi-Currency Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-500" />
            Devises
          </CardTitle>
          <CardDescription>Configurez les devises et les taux de change</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Devise par défaut</Label>
            <Select value={defaultCurrency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.filter((c) => c.active).map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {currencies.map((currency) => (
              <div key={currency.code} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                    {currency.symbol}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{currency.code} - {currency.name}</p>
                    <p className="text-xs text-gray-400">Taux: 1 {defaultCurrency} = {currency.rate} {currency.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currency.isDefault && (
                    <Badge className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">Par défaut</Badge>
                  )}
                  <Switch
                    checked={currency.active}
                    onCheckedChange={(checked) =>
                      setCurrencies(currencies.map((c) => (c.code === currency.code ? { ...c, active: checked } : c)))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Dernière mise à jour des taux: aujourd&apos;hui à 08:00</span>
          </div>
        </CardContent>
      </Card>

      {/* Company Branding */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-5 h-5 text-teal-500" />
            Image de marque
          </CardTitle>
          <CardDescription>Personnalisez l&apos;apparence de votre plateforme</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom de l&apos;entreprise</Label>
              <Input
                value={branding.companyName}
                onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Logo</Label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  <Upload className="w-4 h-4 mr-1" />
                  Charger un logo
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Couleur principale</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Couleur secondaire</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <Input
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Color preview */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-3">Aperçu</p>
            <div className="flex items-center gap-3">
              <div className="w-24 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ background: branding.primaryColor }}>
                Principal
              </div>
              <div className="w-24 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ background: branding.secondaryColor }}>
                Secondaire
              </div>
              <div className="w-24 h-10 rounded-lg flex items-center justify-center text-xs font-medium border" style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}>
                Contour
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-500" />
            Notifications
          </CardTitle>
          <CardDescription>Configurez vos alertes</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Notifications email
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Nouvelle expédition</p>
                  <p className="text-xs text-gray-500">Recevoir un email lors de la création d&apos;une expédition</p>
                </div>
                <Switch
                  checked={notifications.emailNewShipment}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailNewShipment: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Changement de statut</p>
                  <p className="text-xs text-gray-500">Notification lors du changement de statut d&apos;un colis</p>
                </div>
                <Switch
                  checked={notifications.emailStatusChange}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailStatusChange: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Facturation</p>
                  <p className="text-xs text-gray-500">Alerte pour les nouvelles factures et paiements</p>
                </div>
                <Switch
                  checked={notifications.emailInvoice}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailInvoice: v })}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Notifications SMS
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Création d&apos;expédition</p>
                  <p className="text-xs text-gray-500">SMS lors de la création</p>
                </div>
                <Switch
                  checked={notifications.smsShipment}
                  onCheckedChange={(v) => setNotifications({ ...notifications, smsShipment: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Changement de statut</p>
                  <p className="text-xs text-gray-500">SMS pour les changements importants</p>
                </div>
                <Switch
                  checked={notifications.smsStatusChange}
                  onCheckedChange={(v) => setNotifications({ ...notifications, smsStatusChange: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Livraison</p>
                  <p className="text-xs text-gray-500">SMS de confirmation de livraison</p>
                </div>
                <Switch
                  checked={notifications.smsDelivery}
                  onCheckedChange={(v) => setNotifications({ ...notifications, smsDelivery: v })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Zebra Printer Configuration ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-500" />
            Imprimantes Zebra & Étiquettes
          </CardTitle>
          <CardDescription>Configurez vos imprimantes d&apos;étiquettes autocollantes et les formats par défaut</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Printer list */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Imprimantes configurées pour l&apos;impression d&apos;étiquettes ZPL</p>
            {zebraPrinters.map(printer => (
              <div key={printer.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${printer.isDefault ? 'border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <Printer className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-950 ${printerStatusDot[printer.status] ?? 'bg-gray-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{printer.name}</p>
                      {printer.isDefault && <Badge className="text-[9px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-1 py-0">Défaut</Badge>}
                    </div>
                    <p className="text-xs text-gray-400">{printer.model} — {printer.dpi} DPI — {printer.mediaType}</p>
                    <p className="text-[10px] text-gray-400">{printer.connection === 'network' ? `IP: ${printer.ipAddress}:${printer.port}` : `Port: ${printer.usbPort}`} | Noircir: {printer.darkness} | Vitesse: {printer.speed}&quot;/s | {printer.labelsPrinted} étiquettes</p>
                  </div>
                </div>
                <Badge className={`text-[10px] ${printer.status === 'online' || printer.status === 'idle' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {printerStatusText[printer.status] ?? printer.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Label format info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Formats d&apos;étiquettes autocollantes disponibles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: '4" x 6" (100x150mm)', desc: 'Standard expédition — le plus courant', type: 'Zebra' },
                { name: '4" x 4" (100x100mm)', desc: 'Compact pour petits colis', type: 'Zebra' },
                { name: '4" x 8" (100x200mm)', desc: 'Grand format avec détails complets', type: 'Zebra' },
                { name: '2.4" x 4" (62x100mm)', desc: 'Étiquette étroite DHL/FedEx', type: 'Zebra' },
                { name: '2" x 1" (50x25mm)', desc: 'Barcode/QR compact', type: 'Zebra' },
                { name: '6" x 4" (150x100mm)', desc: 'Paysage — palette et fret', type: 'Zebra' },
                { name: 'A4 (210x297mm)', desc: 'Papier standard avec prédécoupes', type: 'Laser' },
              ].map(fmt => (
                <div key={fmt.name} className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <Tag className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{fmt.name}</p>
                    <p className="text-[10px] text-gray-400">{fmt.desc}</p>
                  </div>
                  <Badge className="text-[8px] ml-auto bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-1 py-0">{fmt.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-teal-500" /> : <Sun className="w-5 h-5 text-teal-500" />}
            Apparence
          </CardTitle>
          <CardDescription>Personnalisez l&apos;interface</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mode sombre</p>
              <p className="text-xs text-gray-500">Basculer entre le mode clair et sombre</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Langue
              </p>
              <p className="text-xs text-gray-500">Langue de l&apos;interface</p>
            </div>
            <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
              Français
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ─── Business Rules Configuration ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-teal-500" />
            Règles Métier
          </CardTitle>
          <CardDescription>Configurez les règles de validation, conformité et tarification automatiques</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Les règles métier sont évaluées automatiquement lors de la création et modification de colis et expéditions.
            Les règles critiques bloquent l&apos;action, les avertissements affichent un message.
          </p>
          {allBusinessRules.map((rule) => {
            const enabled = isRuleEnabledLib(rule.id);
            const severityColors: Record<string, string> = {
              critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            };
            const categoryLabels: Record<string, string> = {
              validation: 'Validation', compliance: 'Conformité', pricing: 'Tarification',
              workflow: 'Workflow', safety: 'Sécurité', customs: 'Douanes',
            };
            return (
              <div
                key={rule.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  enabled ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 opacity-60'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-teal-100 dark:bg-teal-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <AlertTriangle className={`w-4.5 h-4.5 ${enabled ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</p>
                    <Badge className={`text-[9px] ${severityColors[rule.severity]}`}>
                      {rule.severity === 'critical' ? 'Critique' : rule.severity === 'warning' ? 'Avertissement' : 'Info'}
                    </Badge>
                    <Badge className="text-[9px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0">
                      {categoryLabels[rule.category] || rule.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{rule.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Modules: {rule.appliesTo.join(', ')}</p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => toggleRuleLib(rule.id, checked)}
                />
              </div>
            );
          })}

          {/* Fuel Surcharges */}
          <Separator className="my-4" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Surcharges carburant en vigueur</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentFuelSurcharges.map((surcharge) => (
              <div key={surcharge.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{surcharge.transportMode === 'air' ? 'Aérien' : surcharge.transportMode === 'maritime' ? 'Maritime' : surcharge.transportMode === 'ground' ? 'Terrestre' : 'Colis'} — {surcharge.region}</p>
                  <p className="text-[10px] text-gray-500">{surcharge.carrier || 'Tous transporteurs'} — {surcharge.percentage}%</p>
                  <p className="text-[9px] text-gray-400">Depuis le {surcharge.effectiveDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Audit Trail ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-500" />
            Journal d&apos;audit
          </CardTitle>
          <CardDescription>Historique des actions et modifications effectuées sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <div className="space-y-2">
            {getAuditTrail({ limit: 10 }).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${auditSeverityColors[entry.severity]}`}>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{entry.userName}</p>
                    <Badge className={`text-[8px] ${auditSeverityColors[entry.severity]}`}>
                      {auditSeverityLabels[entry.severity]}
                    </Badge>
                    <Badge className={`text-[8px] ${auditResultColors[entry.result]}`}>
                      {auditResultLabels[entry.result]}
                    </Badge>
                    <span className="text-[9px] text-gray-400">{auditActionLabels[entry.action]}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{entry.details}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{new Date(entry.timestamp).toLocaleString('fr-FR')} — IP: {entry.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Approval Workflow ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-teal-500" />
            Approbations en attente
          </CardTitle>
          <CardDescription>Demandes d&apos;approbation nécessitant une action (admin/manager uniquement)</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          {roleKey !== 'admin' && roleKey !== 'manager' ? (
            <p className="text-xs text-gray-400">Accès réservé aux administrateurs et responsables</p>
          ) : getPendingApprovals().length === 0 ? (
            <p className="text-xs text-gray-400">Aucune approbation en attente</p>
          ) : (
            getPendingApprovals().map((approval) => (
              <div key={approval.id} className="flex flex-col gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[9px] ${approvalStatusColors[approval.status]}`}>
                    {approvalStatusLabels[approval.status]}
                  </Badge>
                  <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {approval.type === 'return' ? 'Retour' : approval.type === 'price_override' ? 'Modification prix' : approval.type === 'rule_override' ? 'Contournement règle' : approval.type}
                  </Badge>
                  {approval.amount && (
                    <Badge className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      {approval.amount.toLocaleString('fr-DZ')} DZD
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">{approval.reason}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span>Demandé par: {approval.requestedByName}</span>
                  <span>—</span>
                  <span>{new Date(approval.requestedAt).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    size="sm"
                    className="h-7 text-[10px] text-white"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                    onClick={() => {
                      approveRequest(approval.id, user?.id || '1', user?.name || 'Admin');
                    }}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800"
                    onClick={() => {
                      rejectRequest(approval.id, user?.id || '1', user?.name || 'Admin', 'Non conforme aux politiques');
                    }}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Rejeter
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ─── Field-Level Permissions ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-500" />
            Permissions par champ
          </CardTitle>
          <CardDescription>Contrôle granulaire de la visibilité et l&apos;édition des champs par rôle</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Définit quels champs sont visibles, éditables ou requis selon le rôle de l&apos;utilisateur.
          </p>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-3 py-2">Champ</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-3 py-2">Module</th>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-3 py-2">Catégorie</th>
                  {roleDefinitions.map((role) => (
                    <th key={role.key} className="text-center px-2 py-2 min-w-[70px]">
                      <Badge className={`text-[9px] ${role.bgColor}`}>{role.label}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fieldLevelPermissions.slice(0, 15).map((perm, idx) => {
                  const fieldPermLabels: Record<string, string> = {
                    hidden: 'Masqué', readonly: 'Lecture', editable: 'Édition', required: 'Requis',
                  };
                  const fieldPermColors: Record<string, string> = {
                    hidden: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
                    readonly: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    editable: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    required: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  };
                  const categoryLabels: Record<string, string> = {
                    personal: 'Personnel', financial: 'Financier', operational: 'Opérationnel', system: 'Système',
                  };
                  return (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">{perm.field}</td>
                      <td className="px-3 py-1.5 text-[10px] text-gray-500">{perm.module}</td>
                      <td className="px-3 py-1.5"><Badge className="text-[8px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{categoryLabels[perm.category] || perm.category}</Badge></td>
                      {roleDefinitions.map((role) => {
                        const p = perm.rolePermissions[role.key];
                        return (
                          <td key={role.key} className="text-center px-2 py-1.5">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-[9px] font-bold ${fieldPermColors[p]}`}>
                              {p === 'hidden' ? '—' : p === 'readonly' ? 'RO' : p === 'editable' ? 'ED' : 'REQ'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-5 h-5 text-teal-500" />
            À propos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Application</p>
              <p className="font-medium">Guinée Logistique</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Version</p>
              <p className="font-medium">3.0.0</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Support technique</p>
              <p className="font-medium">support@guinee-logistique.pro</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Contact commercial</p>
              <p className="font-medium">+213 21 00 00 00</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
            © 2026 Guinée Logistique. Tous droits réservés. Plateforme logistique mondiale.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
