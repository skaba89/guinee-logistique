/**
 * Notifications & Workflow System — LogisWay
 * Système de notifications en temps réel, workflow d'approbation,
 * alertes automatiques et règles de notification.
 */

import type { RoleKey } from './module-config';

// ─── Types de notification ─────────────────────────────────────

export type NotificationType =
  | 'shipment_created' | 'shipment_status_changed' | 'shipment_delayed'
  | 'parcel_created' | 'parcel_status_changed' | 'parcel_delivered' | 'parcel_returned'
  | 'label_printed' | 'label_print_failed'
  | 'proof_photo_uploaded' | 'proof_photo_required'
  | 'invoice_overdue' | 'invoice_paid'
  | 'customs_hold' | 'customs_cleared'
  | 'rule_violation' | 'rule_override'
  | 'approval_requested' | 'approval_granted' | 'approval_rejected'
  | 'printer_offline' | 'printer_error' | 'printer_low_media'
  | 'fuel_surcharge_change'
  | 'system_maintenance' | 'system_update'
  | 'task_assigned' | 'task_overdue'
  | 'chat_message';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  /** Module source */
  module: string;
  /** Entité concernée */
  entityId: string;
  entityType: string;
  /** Destinataires (roles ou userId) */
  targetRoles: RoleKey[];
  targetUserIds?: string[];
  /** Horodatage */
  createdAt: string;
  /** Lu */
  read: boolean;
  /** Action URL */
  actionUrl?: string;
  /** Données supplémentaires */
  data?: Record<string, unknown>;
  /** Expire à */
  expiresAt?: string;
}

// ─── Persistance des notifications ─────────────────────────────

const NOTIFICATIONS_KEY = 'logisway-notifications';

export function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch { /* ignore */ }
  return [];
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  // Garder les 200 dernières + non lues
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read).slice(-100);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...unread, ...read]));
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const full: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const notifications = loadNotifications();
  notifications.push(full);
  saveNotifications(notifications);

  return full;
}

export function markNotificationRead(notificationId: string): void {
  const notifications = loadNotifications();
  const idx = notifications.findIndex(n => n.id === notificationId);
  if (idx >= 0) {
    notifications[idx].read = true;
    saveNotifications(notifications);
  }
}

export function markAllNotificationsRead(): void {
  const notifications = loadNotifications();
  notifications.forEach(n => { n.read = true; });
  saveNotifications(notifications);
}

export function getUnreadCount(): number {
  return loadNotifications().filter(n => !n.read).length;
}

export function getNotificationsForRole(role: RoleKey): Notification[] {
  return loadNotifications()
    .filter(n => n.targetRoles.includes(role))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteNotification(id: string): void {
  const notifications = loadNotifications().filter(n => n.id !== id);
  saveNotifications(notifications);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

// ─── Configuration des préférences de notification ─────────────

export interface NotificationPreferences {
  /** Notifications activées par type */
  enabledTypes: Partial<Record<NotificationType, boolean>>;
  /** Canaux de notification */
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  /** Heures de silence */
  quietHoursStart?: string;
  quietHoursEnd?: string;
  /** Son */
  sound: boolean;
  /** Dossier pour les notifications lues */
  autoArchiveAfterDays: number;
}

const NOTIFICATION_PREFS_KEY = 'logisway-notification-prefs';

export const defaultNotificationPrefs: NotificationPreferences = {
  enabledTypes: {},
  channels: {
    inApp: true,
    email: false,
    sms: false,
    push: false,
  },
  sound: true,
  autoArchiveAfterDays: 30,
};

export function loadNotificationPrefs(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultNotificationPrefs;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (raw) return { ...defaultNotificationPrefs, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultNotificationPrefs;
}

export function saveNotificationPrefs(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

// ─── Workflow d'approbation ────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';

export interface ApprovalRequest {
  id: string;
  /** Type d'approbation */
  type: 'status_change' | 'return' | 'refund' | 'price_override' | 'rule_override' | 'high_value' | 'dangerous_goods';
  /** Module concerné */
  module: string;
  /** Entité concernée */
  entityId: string;
  entityType: string;
  /** Demandé par */
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  /** Raison de la demande */
  reason: string;
  /** Données de la demande */
  requestData: Record<string, unknown>;
  /** Statut */
  status: ApprovalStatus;
  /** Approuvé/rejeté par */
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  /** Commentaire du réviseur */
  reviewComment?: string;
  /** Priorité */
  priority: NotificationPriority;
  /** Montant concerné (si applicable) */
  amount?: number;
  /** Expiration */
  expiresAt: string;
}

const APPROVALS_KEY = 'logisway-approvals';

export function loadApprovals(): ApprovalRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPROVALS_KEY);
    if (raw) return JSON.parse(raw) as ApprovalRequest[];
  } catch { /* ignore */ }
  return [];
}

export function saveApprovals(approvals: ApprovalRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals));
}

export function createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>): ApprovalRequest {
  const approval: ApprovalRequest = {
    ...request,
    id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  const approvals = loadApprovals();
  approvals.push(approval);
  saveApprovals(approvals);

  // Créer une notification pour les managers/admins
  addNotification({
    type: 'approval_requested',
    title: `Approbation requise: ${getApprovalTypeLabel(request.type)}`,
    message: `${request.requestedByName} demande une approbation: ${request.reason}`,
    priority: request.priority,
    module: request.module,
    entityId: request.entityId,
    entityType: 'approval',
    targetRoles: ['admin', 'manager'],
    actionUrl: request.module,
  });

  return approval;
}

export function approveRequest(approvalId: string, reviewerId: string, reviewerName: string, comment?: string): ApprovalRequest | null {
  const approvals = loadApprovals();
  const idx = approvals.findIndex(a => a.id === approvalId);
  if (idx < 0) return null;

  approvals[idx].status = 'approved';
  approvals[idx].reviewedBy = reviewerId;
  approvals[idx].reviewedByName = reviewerName;
  approvals[idx].reviewedAt = new Date().toISOString();
  approvals[idx].reviewComment = comment;
  saveApprovals(approvals);

  // Notifier le demandeur
  addNotification({
    type: 'approval_granted',
    title: 'Approbation accordée',
    message: `Votre demande a été approuvée par ${reviewerName}${comment ? `: ${comment}` : ''}`,
    priority: 'normal',
    module: approvals[idx].module,
    entityId: approvals[idx].entityId,
    entityType: 'approval',
    targetRoles: ['admin', 'manager', 'agent'],
    targetUserIds: [approvals[idx].requestedBy],
  });

  return approvals[idx];
}

export function rejectRequest(approvalId: string, reviewerId: string, reviewerName: string, reason: string): ApprovalRequest | null {
  const approvals = loadApprovals();
  const idx = approvals.findIndex(a => a.id === approvalId);
  if (idx < 0) return null;

  approvals[idx].status = 'rejected';
  approvals[idx].reviewedBy = reviewerId;
  approvals[idx].reviewedByName = reviewerName;
  approvals[idx].reviewedAt = new Date().toISOString();
  approvals[idx].reviewComment = reason;
  saveApprovals(approvals);

  addNotification({
    type: 'approval_rejected',
    title: 'Approbation refusée',
    message: `Votre demande a été refusée par ${reviewerName}: ${reason}`,
    priority: 'normal',
    module: approvals[idx].module,
    entityId: approvals[idx].entityId,
    entityType: 'approval',
    targetRoles: ['admin', 'manager', 'agent'],
    targetUserIds: [approvals[idx].requestedBy],
  });

  return approvals[idx];
}

export function getPendingApprovals(): ApprovalRequest[] {
  const now = new Date().toISOString();
  return loadApprovals()
    .filter(a => a.status === 'pending' && a.expiresAt > now)
    .sort((a, b) => {
      const priorityOrder: Record<NotificationPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function getApprovalHistory(limit: number = 50): ApprovalRequest[] {
  return loadApprovals()
    .filter(a => a.status !== 'pending')
    .sort((a, b) => b.reviewedAt?.localeCompare(a.reviewedAt ?? '') ?? 0)
    .slice(0, limit);
}

// ─── Labels et couleurs ────────────────────────────────────────

export const notificationTypeLabels: Record<NotificationType, string> = {
  shipment_created: 'Expédition créée',
  shipment_status_changed: 'Statut expédition modifié',
  shipment_delayed: 'Expédition retardée',
  parcel_created: 'Colis créé',
  parcel_status_changed: 'Statut colis modifié',
  parcel_delivered: 'Colis livré',
  parcel_returned: 'Colis retourné',
  label_printed: 'Étiquette imprimée',
  label_print_failed: 'Impression échouée',
  proof_photo_uploaded: 'Photo uploadée',
  proof_photo_required: 'Photo requise',
  invoice_overdue: 'Facture en retard',
  invoice_paid: 'Facture payée',
  customs_hold: 'Retenu en douane',
  customs_cleared: 'Dédouané',
  rule_violation: 'Violation de règle',
  rule_override: 'Contournement de règle',
  approval_requested: 'Approbation requise',
  approval_granted: 'Approbation accordée',
  approval_rejected: 'Approbation refusée',
  printer_offline: 'Imprimante hors ligne',
  printer_error: 'Erreur imprimante',
  printer_low_media: 'Support faible',
  fuel_surcharge_change: 'Changement surcharge carburant',
  system_maintenance: 'Maintenance système',
  system_update: 'Mise à jour système',
  task_assigned: 'Tâche assignée',
  task_overdue: 'Tâche en retard',
  chat_message: 'Message chat',
};

export const notificationPriorityColors: Record<NotificationPriority, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const notificationPriorityDotColors: Record<NotificationPriority, string> = {
  low: 'bg-gray-400',
  normal: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500 animate-pulse',
};

export function getApprovalTypeLabel(type: ApprovalRequest['type']): string {
  const labels: Record<ApprovalRequest['type'], string> = {
    status_change: 'Changement de statut',
    return: 'Retour de colis',
    refund: 'Remboursement',
    price_override: 'Modification de prix',
    rule_override: 'Contournement de règle',
    high_value: 'Colis haute valeur',
    dangerous_goods: 'Marchandises dangereuses',
  };
  return labels[type] ?? type;
}

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  expired: 'Expiré',
  cancelled: 'Annulé',
};

export const approvalStatusColors: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  expired: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

// ─── Données de test pour les notifications ────────────────────

export function seedNotifications(): void {
  const existing = loadNotifications();
  if (existing.length > 0) return;

  const now = new Date();

  const sampleNotifications: Omit<Notification, 'id' | 'createdAt' | 'read'>[] = [
    {
      type: 'parcel_delivered',
      title: 'Colis livré',
      message: 'Le colis PC-FP-2026-0001 a été livré avec succès à Alger',
      priority: 'normal',
      module: 'parcels',
      entityId: 'p1',
      entityType: 'parcel',
      targetRoles: ['admin', 'manager', 'agent'],
    },
    {
      type: 'shipment_delayed',
      title: 'Expédition retardée',
      message: 'L\'expédition FFP-0005-2026 est retardée — conditions météo défavorables',
      priority: 'high',
      module: 'shipments',
      entityId: 's5',
      entityType: 'shipment',
      targetRoles: ['admin', 'manager'],
    },
    {
      type: 'approval_requested',
      title: 'Approbation requise: Retour de colis',
      message: 'Fatima Khelifi demande l\'approbation pour le retour du colis PC-FP-2026-0006',
      priority: 'high',
      module: 'parcels',
      entityId: 'p6',
      entityType: 'approval',
      targetRoles: ['admin', 'manager'],
    },
    {
      type: 'rule_violation',
      title: 'Violation de règle détectée',
      message: 'Le colis PC-FP-2026-0005 dépasse les dimensions du format L sélectionné',
      priority: 'high',
      module: 'parcels',
      entityId: 'p5',
      entityType: 'parcel',
      targetRoles: ['admin', 'manager'],
    },
    {
      type: 'printer_offline',
      title: 'Imprimante hors ligne',
      message: 'La Zebra GK420d (USB001) est hors ligne depuis 12h',
      priority: 'normal',
      module: 'parcels',
      entityId: 'printer-3',
      entityType: 'printer',
      targetRoles: ['admin', 'manager'],
    },
    {
      type: 'invoice_overdue',
      title: 'Facture en retard',
      message: 'La facture FAC-2026-0005 (SPA HydroServices, 950 000 DZD) est en retard de paiement',
      priority: 'high',
      module: 'billing',
      entityId: 'inv5',
      entityType: 'invoice',
      targetRoles: ['admin', 'manager'],
    },
    {
      type: 'customs_hold',
      title: 'Retenu en douane',
      message: 'Le conteneur MSKU-7234561 est retenu en douane à Marseille — documents manquants',
      priority: 'urgent',
      module: 'customs',
      entityId: 'ct1',
      entityType: 'container',
      targetRoles: ['admin', 'manager', 'agent'],
    },
    {
      type: 'fuel_surcharge_change',
      title: 'Changement surcharge carburant',
      message: 'La surcharge carburant aérienne Moyen-Orient passe à 12.5% (DHL Express)',
      priority: 'normal',
      module: 'rates',
      entityId: 'fs-1',
      entityType: 'surcharge',
      targetRoles: ['admin', 'manager'],
    },
    {
      type: 'proof_photo_required',
      title: 'Photo de preuve requise',
      message: 'Le colis PC-FP-2026-0004 (livré) nécessite une photo de preuve de livraison',
      priority: 'normal',
      module: 'parcels',
      entityId: 'p4',
      entityType: 'parcel',
      targetRoles: ['admin', 'manager', 'agent'],
    },
    {
      type: 'parcel_returned',
      title: 'Colis retourné',
      message: 'Le colis PC-FP-2026-0002 a été retourné — colis endommagé',
      priority: 'high',
      module: 'parcels',
      entityId: 'p2',
      entityType: 'parcel',
      targetRoles: ['admin', 'manager'],
    },
  ];

  sampleNotifications.forEach((notif, i) => {
    const full: Notification = {
      ...notif,
      id: `notif-seed-${i + 1}`,
      createdAt: new Date(now.getTime() - (sampleNotifications.length - i) * 1800000).toISOString(),
      read: i > 5, // Seulement les 4 dernières sont non lues
    };
    const notifs = loadNotifications();
    notifs.push(full);
    saveNotifications(notifs);
  });
}

export function seedApprovals(): void {
  const existing = loadApprovals();
  if (existing.length > 0) return;

  const now = new Date();

  const sampleApprovals: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>[] = [
    {
      type: 'return',
      module: 'parcels',
      entityId: 'p2',
      entityType: 'parcel',
      requestedBy: '2',
      requestedByName: 'Fatima Khelifi',
      reason: 'Colis endommagé — client demande retour et remboursement',
      requestData: { trackingNumber: 'PC-FP-2026-0002', refundAmount: 6500 },
      priority: 'high',
      amount: 6500,
      expiresAt: new Date(now.getTime() + 48 * 3600000).toISOString(),
    },
    {
      type: 'price_override',
      module: 'parcels',
      entityId: 'p10',
      entityType: 'parcel',
      requestedBy: '2',
      requestedByName: 'Fatima Khelifi',
      reason: 'Client VIP — remise de 15% sur le tarif standard',
      requestData: { originalPrice: 12500, newPrice: 10625, discount: 15 },
      priority: 'normal',
      amount: 1875,
      expiresAt: new Date(now.getTime() + 24 * 3600000).toISOString(),
    },
    {
      type: 'rule_override',
      module: 'parcels',
      entityId: 'p5',
      entityType: 'parcel',
      requestedBy: '2',
      requestedByName: 'Fatima Khelifi',
      reason: 'Dimensions légèrement supérieures au format L — client prévenu, accepte le surcoût',
      requestData: { ruleId: 'rule-dim-001', override: true },
      priority: 'high',
      expiresAt: new Date(now.getTime() + 12 * 3600000).toISOString(),
    },
  ];

  sampleApprovals.forEach((appr) => {
    const full: ApprovalRequest = {
      ...appr,
      id: `appr-seed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestedAt: new Date(now.getTime() - Math.random() * 3600000 * 4).toISOString(),
      status: 'pending',
    };
    const approvals = loadApprovals();
    approvals.push(full);
    saveApprovals(approvals);
  });
}
