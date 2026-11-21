/**
 * Audit Trail & Enhanced Permissions System — Guinée Logistique
 * Journal d'audit complet, permissions granulaires par champ,
 * délégation de permissions et traçabilité des actions.
 */

import type { RoleKey } from './module-config';

// ─── Types d'audit ─────────────────────────────────────────────

export type AuditAction =
  | 'login' | 'logout' | 'login_failed'
  | 'create' | 'read' | 'update' | 'delete'
  | 'print_label' | 'print_batch'
  | 'upload_photo' | 'delete_photo'
  | 'change_status' | 'approve' | 'reject'
  | 'change_permission' | 'change_role'
  | 'export_data' | 'import_data'
  | 'change_settings' | 'change_printer_config'
  | 'rule_violation' | 'rule_override';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: RoleKey;
  action: AuditAction;
  module: string;
  /** ID de l'entité affectée (colis, expédition, etc.) */
  entityId: string;
  /** Type d'entité */
  entityType: string;
  /** Détails de l'action */
  details: string;
  /** Anciennes valeurs (pour les modifications) */
  oldValue?: string;
  /** Nouvelles valeurs */
  newValue?: string;
  /** Adresse IP (simulée) */
  ipAddress: string;
  /** Résultat: success, failed, denied */
  result: 'success' | 'failed' | 'denied';
  /** Sévérité de l'événement */
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ─── Persistance du journal d'audit ────────────────────────────

const AUDIT_TRAIL_KEY = 'guinee-logistique-audit-trail';

export function loadAuditTrail(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_TRAIL_KEY);
    if (raw) return JSON.parse(raw) as AuditEntry[];
  } catch { /* ignore */ }
  return [];
}

export function saveAuditTrail(entries: AuditEntry[]): void {
  if (typeof window === 'undefined') return;
  // Garder les 500 dernières entrées
  const trimmed = entries.slice(-500);
  localStorage.setItem(AUDIT_TRAIL_KEY, JSON.stringify(trimmed));
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress'>): AuditEntry {
  const fullEntry: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.' + Math.floor(Math.random() * 254 + 1), // Simulé
  };

  const trail = loadAuditTrail();
  trail.push(fullEntry);
  saveAuditTrail(trail);

  return fullEntry;
}

export function getAuditTrail(filters?: {
  userId?: string;
  action?: AuditAction;
  module?: string;
  entityId?: string;
  severity?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): AuditEntry[] {
  let trail = loadAuditTrail();

  if (filters) {
    if (filters.userId) trail = trail.filter(e => e.userId === filters.userId);
    if (filters.action) trail = trail.filter(e => e.action === filters.action);
    if (filters.module) trail = trail.filter(e => e.module === filters.module);
    if (filters.entityId) trail = trail.filter(e => e.entityId === filters.entityId);
    if (filters.severity) trail = trail.filter(e => e.severity === filters.severity);
    if (filters.fromDate) trail = trail.filter(e => e.timestamp >= filters.fromDate!);
    if (filters.toDate) trail = trail.filter(e => e.timestamp <= filters.toDate!);
  }

  // Trier par date décroissante
  trail.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  if (filters?.limit) {
    return trail.slice(0, filters.limit);
  }

  return trail;
}

// ─── Permissions granulaires par champ ─────────────────────────

export type FieldPermission = 'hidden' | 'readonly' | 'editable' | 'required';

export interface FieldLevelPermission {
  /** Module concerné */
  module: string;
  /** Nom du champ */
  field: string;
  /** Permission par rôle */
  rolePermissions: Record<RoleKey, FieldPermission>;
  /** Description du champ */
  description: string;
  /** Catégorie du champ */
  category: 'personal' | 'financial' | 'operational' | 'system';
}

export const fieldLevelPermissions: FieldLevelPermission[] = [
  // Colis — informations personnelles
  {
    module: 'parcels',
    field: 'senderName',
    rolePermissions: { admin: 'required', manager: 'required', agent: 'required', viewer: 'readonly', client: 'hidden', ramasseur: 'hidden' },
    description: 'Nom de l\'expéditeur',
    category: 'personal',
  },
  {
    module: 'parcels',
    field: 'senderPhone',
    rolePermissions: { admin: 'required', manager: 'required', agent: 'required', viewer: 'readonly', client: 'hidden', ramasseur: 'hidden' },
    description: 'Téléphone de l\'expéditeur',
    category: 'personal',
  },
  {
    module: 'parcels',
    field: 'senderAddress',
    rolePermissions: { admin: 'required', manager: 'required', agent: 'required', viewer: 'readonly', client: 'hidden', ramasseur: 'hidden' },
    description: 'Adresse de l\'expéditeur',
    category: 'personal',
  },
  {
    module: 'parcels',
    field: 'receiverName',
    rolePermissions: { admin: 'required', manager: 'required', agent: 'required', viewer: 'readonly', client: 'required', ramasseur: 'hidden' },
    description: 'Nom du destinataire',
    category: 'personal',
  },
  {
    module: 'parcels',
    field: 'receiverPhone',
    rolePermissions: { admin: 'required', manager: 'required', agent: 'required', viewer: 'readonly', client: 'required', ramasseur: 'hidden' },
    description: 'Téléphone du destinataire',
    category: 'personal',
  },
  // Colis — informations financières
  {
    module: 'parcels',
    field: 'price',
    rolePermissions: { admin: 'editable', manager: 'readonly', agent: 'hidden', viewer: 'hidden', client: 'readonly', ramasseur: 'hidden' },
    description: 'Prix du transport',
    category: 'financial',
  },
  {
    module: 'parcels',
    field: 'declaredValue',
    rolePermissions: { admin: 'required', manager: 'required', agent: 'editable', viewer: 'hidden', client: 'editable', ramasseur: 'hidden' },
    description: 'Valeur déclarée',
    category: 'financial',
  },
  {
    module: 'parcels',
    field: 'insuranceAmount',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'readonly', viewer: 'hidden', client: 'readonly', ramasseur: 'hidden' },
    description: 'Montant assurance',
    category: 'financial',
  },
  // Colis — informations opérationnelles
  {
    module: 'parcels',
    field: 'status',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'editable', viewer: 'readonly', client: 'readonly', ramasseur: 'hidden' },
    description: 'Statut du colis',
    category: 'operational',
  },
  {
    module: 'parcels',
    field: 'weight',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'required', viewer: 'readonly', client: 'readonly', ramasseur: 'hidden' },
    description: 'Poids du colis',
    category: 'operational',
  },
  {
    module: 'parcels',
    field: 'dimensions',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'required', viewer: 'readonly', client: 'readonly', ramasseur: 'hidden' },
    description: 'Dimensions du colis',
    category: 'operational',
  },
  {
    module: 'parcels',
    field: 'carrier',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'editable', viewer: 'readonly', client: 'hidden', ramasseur: 'hidden' },
    description: 'Transporteur',
    category: 'operational',
  },
  {
    module: 'parcels',
    field: 'format',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'editable', viewer: 'readonly', client: 'readonly', ramasseur: 'hidden' },
    description: 'Format/taille du colis',
    category: 'operational',
  },
  // Colis — preuves et étiquettes
  {
    module: 'parcels',
    field: 'proofPhoto',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'editable', viewer: 'readonly', client: 'hidden', ramasseur: 'hidden' },
    description: 'Photo de preuve',
    category: 'operational',
  },
  {
    module: 'parcels',
    field: 'labelPrinted',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'editable', viewer: 'readonly', client: 'hidden', ramasseur: 'hidden' },
    description: 'Étiquette imprimée',
    category: 'system',
  },
  // Facturation — informations sensibles
  {
    module: 'billing',
    field: 'amount',
    rolePermissions: { admin: 'editable', manager: 'readonly', agent: 'hidden', viewer: 'hidden', client: 'readonly', ramasseur: 'hidden' },
    description: 'Montant facture',
    category: 'financial',
  },
  {
    module: 'billing',
    field: 'status',
    rolePermissions: { admin: 'editable', manager: 'editable', agent: 'readonly', viewer: 'readonly', client: 'readonly', ramasseur: 'hidden' },
    description: 'Statut paiement',
    category: 'financial',
  },
  // Paramètres — accès système
  {
    module: 'settings',
    field: 'permissions',
    rolePermissions: { admin: 'editable', manager: 'hidden', agent: 'hidden', viewer: 'hidden', client: 'hidden', ramasseur: 'hidden' },
    description: 'Configuration des permissions',
    category: 'system',
  },
  {
    module: 'settings',
    field: 'printers',
    rolePermissions: { admin: 'editable', manager: 'readonly', agent: 'readonly', viewer: 'hidden', client: 'hidden', ramasseur: 'hidden' },
    description: 'Configuration des imprimantes',
    category: 'system',
  },
];

/**
 * Obtient la permission d'un champ pour un rôle donné.
 */
export function getFieldPermission(module: string, field: string, role: RoleKey): FieldPermission {
  const perm = fieldLevelPermissions.find(
    p => p.module === module && p.field === field
  );
  if (!perm) return 'editable'; // Par défaut: éditable
  return perm.rolePermissions[role] ?? 'hidden';
}

/**
 * Vérifie si un champ est visible pour un rôle.
 */
export function isFieldVisible(module: string, field: string, role: RoleKey): boolean {
  const perm = getFieldPermission(module, field, role);
  return perm !== 'hidden';
}

/**
 * Vérifie si un champ est éditable pour un rôle.
 */
export function isFieldEditable(module: string, field: string, role: RoleKey): boolean {
  const perm = getFieldPermission(module, field, role);
  return perm === 'editable' || perm === 'required';
}

/**
 * Vérifie si un champ est requis pour un rôle.
 */
export function isFieldRequired(module: string, field: string, role: RoleKey): boolean {
  const perm = getFieldPermission(module, field, role);
  return perm === 'required';
}

/**
 * Obtient tous les champs visibles pour un rôle dans un module.
 */
export function getVisibleFields(module: string, role: RoleKey): string[] {
  return fieldLevelPermissions
    .filter(p => p.module === module && p.rolePermissions[role] !== 'hidden')
    .map(p => p.field);
}

/**
 * Obtient tous les champs requis pour un rôle dans un module.
 */
export function getRequiredFields(module: string, role: RoleKey): string[] {
  return fieldLevelPermissions
    .filter(p => p.module === module && p.rolePermissions[role] === 'required')
    .map(p => p.field);
}

// ─── Délégation de permissions ─────────────────────────────────

export interface PermissionDelegation {
  id: string;
  /** Utilisateur qui délègue */
  fromUserId: string;
  /** Utilisateur qui reçoit la délégation */
  toUserId: string;
  /** Modules délégués */
  delegatedModules: string[];
  /** Niveau de permission délégué */
  delegatedLevel: 'read' | 'write';
  /** Date de début */
  startDate: string;
  /** Date de fin */
  endDate: string;
  /** Raison de la délégation */
  reason: string;
  /** Statut */
  status: 'active' | 'expired' | 'revoked';
  /** Approuvé par */
  approvedBy?: string;
}

const DELEGATIONS_KEY = 'guinee-logistique-delegations';

export function loadDelegations(): PermissionDelegation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELEGATIONS_KEY);
    if (raw) return JSON.parse(raw) as PermissionDelegation[];
  } catch { /* ignore */ }
  return [];
}

export function saveDelegations(delegations: PermissionDelegation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DELEGATIONS_KEY, JSON.stringify(delegations));
}

export function addDelegation(delegation: Omit<PermissionDelegation, 'id' | 'status'>): PermissionDelegation {
  const newDelegation: PermissionDelegation = {
    ...delegation,
    id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'active',
  };

  const delegations = loadDelegations();
  delegations.push(newDelegation);
  saveDelegations(delegations);

  addAuditEntry({
    userId: delegation.fromUserId,
    userName: delegation.fromUserId,
    userRole: 'admin',
    action: 'change_permission',
    module: 'users',
    entityId: delegation.toUserId,
    entityType: 'delegation',
    details: `Délégation de permissions vers ${delegation.toUserId} pour modules: ${delegation.delegatedModules.join(', ')}`,
    result: 'success',
    severity: 'high',
  });

  return newDelegation;
}

export function revokeDelegation(delegationId: string): void {
  const delegations = loadDelegations();
  const idx = delegations.findIndex(d => d.id === delegationId);
  if (idx >= 0) {
    delegations[idx].status = 'revoked';
    saveDelegations(delegations);
  }
}

export function getActiveDelegationsForUser(userId: string): PermissionDelegation[] {
  const now = new Date().toISOString();
  return loadDelegations().filter(
    d => d.toUserId === userId && d.status === 'active' && d.endDate >= now
  );
}

// ─── Helpers de formatage audit ────────────────────────────────

export const auditActionLabels: Record<AuditAction, string> = {
  login: 'Connexion',
  logout: 'Déconnexion',
  login_failed: 'Tentative de connexion échouée',
  create: 'Création',
  read: 'Consultation',
  update: 'Modification',
  delete: 'Suppression',
  print_label: 'Impression étiquette',
  print_batch: 'Impression par lots',
  upload_photo: 'Upload photo',
  delete_photo: 'Suppression photo',
  change_status: 'Changement de statut',
  approve: 'Approbation',
  reject: 'Rejet',
  change_permission: 'Modification permission',
  change_role: 'Modification rôle',
  export_data: 'Export données',
  import_data: 'Import données',
  change_settings: 'Modification paramètres',
  change_printer_config: 'Configuration imprimante',
  rule_violation: 'Violation de règle',
  rule_override: 'Contournement de règle',
};

export const auditSeverityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const auditResultColors: Record<string, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  denied: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const auditResultLabels: Record<string, string> = {
  success: 'Succès',
  failed: 'Échoué',
  denied: 'Refusé',
};

export const auditSeverityLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  critical: 'Critique',
};

// ─── Données de test pour l'audit ──────────────────────────────

export function seedAuditTrail(): void {
  const existing = loadAuditTrail();
  if (existing.length > 0) return; // Déjà peuplé

  const now = new Date();
  const entries: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress'>[] = [
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'login', module: 'dashboard', entityId: '', entityType: 'session',
      details: 'Connexion réussie', result: 'success', severity: 'low',
    },
    {
      userId: '2', userName: 'Fatima Khelifi', userRole: 'agent',
      action: 'create', module: 'parcels', entityId: 'p1', entityType: 'parcel',
      details: 'Création du colis PC-FP-2026-0001', result: 'success', severity: 'low',
    },
    {
      userId: '2', userName: 'Fatima Khelifi', userRole: 'agent',
      action: 'print_label', module: 'parcels', entityId: 'p1', entityType: 'parcel',
      details: 'Impression étiquette 4x6 pour PC-FP-2026-0001 — imprimante ZD421', result: 'success', severity: 'low',
    },
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'change_status', module: 'parcels', entityId: 'p3', entityType: 'parcel',
      details: 'Statut changé: in_transit → out_for_delivery', oldValue: 'in_transit', newValue: 'out_for_delivery', result: 'success', severity: 'medium',
    },
    {
      userId: '2', userName: 'Fatima Khelifi', userRole: 'agent',
      action: 'rule_violation', module: 'parcels', entityId: 'p5', entityType: 'parcel',
      details: 'Violation: dimensions dépassent le format sélectionné', result: 'failed', severity: 'high',
    },
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'rule_override', module: 'parcels', entityId: 'p5', entityType: 'parcel',
      details: 'Contournement de la règle rule-dim-001 autorisé par admin', result: 'success', severity: 'critical',
    },
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'change_permission', module: 'users', entityId: '2', entityType: 'user',
      details: 'Permission modifiée pour Agent: billing read→none', oldValue: 'read', newValue: 'none', result: 'success', severity: 'high',
    },
    {
      userId: '2', userName: 'Fatima Khelifi', userRole: 'agent',
      action: 'upload_photo', module: 'parcels', entityId: 'p7', entityType: 'parcel',
      details: 'Photo de preuve uploadée pour PC-FP-2026-0007', result: 'success', severity: 'low',
    },
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'approve', module: 'parcels', entityId: 'p8', entityType: 'parcel',
      details: 'Approbation du retour du colis PC-FP-2026-0008', result: 'success', severity: 'medium',
    },
    {
      userId: 'unknown', userName: 'Inconnu', userRole: 'viewer',
      action: 'login_failed', module: 'dashboard', entityId: '', entityType: 'session',
      details: 'Tentative de connexion échouée — identifiants invalides', result: 'failed', severity: 'high',
    },
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'print_batch', module: 'parcels', entityId: 'batch-1', entityType: 'batch',
      details: 'Impression par lots de 5 étiquettes — imprimante ZT411', result: 'success', severity: 'medium',
    },
    {
      userId: '1', userName: 'Ahmed Benali', userRole: 'admin',
      action: 'change_settings', module: 'settings', entityId: 'label-settings', entityType: 'settings',
      details: 'Paramètres étiquettes modifiés: autoPrint=true, defaultFormat=4x6', result: 'success', severity: 'medium',
    },
    {
      userId: '2', userName: 'Fatima Khelifi', userRole: 'agent',
      action: 'export_data', module: 'reports', entityId: '', entityType: 'export',
      details: 'Export rapport colis avril 2026 (CSV)', result: 'success', severity: 'medium',
    },
  ];

  entries.forEach((entry, i) => {
    const timestamp = new Date(now.getTime() - (entries.length - i) * 3600000).toISOString();
    const fullEntry: AuditEntry = {
      ...entry,
      id: `audit-seed-${i + 1}`,
      timestamp,
      ipAddress: '192.168.1.' + (Math.floor(Math.random() * 254) + 1),
    };
    const trail = loadAuditTrail();
    trail.push(fullEntry);
    saveAuditTrail(trail);
  });
}
