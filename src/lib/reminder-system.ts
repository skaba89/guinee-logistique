/**
 * reminder-system.ts — Système de relance automatique des clients pour LogisWay
 *
 * Gère les relances automatiques pour les factures en attente ou en retard.
 * En mode prototype, les relances sont simulées (pas d'envoi réel d'email/SMS).
 * En production, connecter à un service d'email (SendGrid, etc.) et/ou SMS.
 *
 * Règles de relance :
 *   - 1ère relance : 7 jours avant l'échéance (rappel préventif)
 *   - 2ème relance : le jour de l'échéance
 *   - 3ème relance : 7 jours après l'échéance
 *   - 4ème relance : 15 jours après l'échéance
 *   - 5ème relance : 30 jours après l'échéance (mise en demeure)
 */

// ─── Types ──────────────────────────────────────────────────────

export type ReminderLevel = 1 | 2 | 3 | 4 | 5;

export type ReminderChannel = 'email' | 'sms' | 'whatsapp' | 'courrier';

export interface Reminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  level: ReminderLevel;
  channel: ReminderChannel;
  /** Date d'envoi (ou date prévue) */
  sentAt: string;
  /** Statut de la relance */
  status: 'pending' | 'sent' | 'failed';
  /** Sujet / Titre de la relance */
  subject: string;
  /** Contenu du message */
  body: string;
}

export interface ReminderConfig {
  /** Activer les relances automatiques */
  enabled: boolean;
  /** Jours avant l'échéance pour la 1ère relance */
  daysBeforeDue: number;
  /** Jours après l'échéance pour chaque niveau de relance */
  daysAfterDue: number[];
  /** Canal par défaut */
  defaultChannel: ReminderChannel;
  /** Inclure les factures en attente dans les relances */
  includePending: boolean;
  /** Inclure les factures en retard dans les relances */
  includeOverdue: boolean;
}

// ─── Constantes ─────────────────────────────────────────────────

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  daysBeforeDue: 7,
  daysAfterDue: [0, 7, 15, 30],
  defaultChannel: 'email',
  includePending: true,
  includeOverdue: true,
};

export const REMINDER_CONFIG_KEY = 'logisway-reminder-config';
export const REMINDERS_KEY = 'logisway-reminders';

// ─── Labels ─────────────────────────────────────────────────────

export const reminderLevelLabels: Record<ReminderLevel, string> = {
  1: 'Rappel préventif',
  2: 'Relance à échéance',
  3: '1ère relance',
  4: '2ème relance',
  5: 'Mise en demeure',
};

export const reminderLevelColors: Record<ReminderLevel, string> = {
  1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  4: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  5: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
};

export const reminderChannelLabels: Record<ReminderChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  courrier: 'Courrier',
};

export const reminderChannelIcons: Record<ReminderChannel, string> = {
  email: '📧',
  sms: '📱',
  whatsapp: '💬',
  courrier: '📬',
};

// ─── Configuration Management ───────────────────────────────────

export function loadReminderConfig(): ReminderConfig {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_CONFIG;
  try {
    const raw = localStorage.getItem(REMINDER_CONFIG_KEY);
    if (!raw) return DEFAULT_REMINDER_CONFIG;
    return { ...DEFAULT_REMINDER_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDER_CONFIG;
  }
}

export function saveReminderConfig(config: ReminderConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMINDER_CONFIG_KEY, JSON.stringify(config));
}

// ─── Reminder Data Management ───────────────────────────────────

export function loadReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReminders(reminders: Reminder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

// ─── Generate Reminder Content ──────────────────────────────────

export function generateReminderSubject(
  level: ReminderLevel,
  invoiceNumber: string,
): string {
  switch (level) {
    case 1: return `Rappel : Facture ${invoiceNumber} à échéance prochaine`;
    case 2: return `Échéance aujourd'hui : Facture ${invoiceNumber}`;
    case 3: return `1ère relance : Facture ${invoiceNumber} en retard de paiement`;
    case 4: return `2ème relance : Facture ${invoiceNumber} — Paiement urgent requis`;
    case 5: return `MISE EN DEMEURE : Facture ${invoiceNumber} — Dernier avis avant recouvrement`;
  }
}

export function generateReminderBody(
  level: ReminderLevel,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  currencySymbol: string = 'DA',
): string {
  const formattedAmount = new Intl.NumberFormat('fr-FR').format(amount) + ' ' + currencySymbol;
  const formattedDueDate = new Date(dueDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  switch (level) {
    case 1:
      return `Cher ${clientName},\n\nNous vous rappelons que la facture ${invoiceNumber} d'un montant de ${formattedAmount} arrive à échéance le ${formattedDueDate}.\n\nNous vous prions de bien vouloir procéder au règlement dans les meilleurs délais.\n\nCordialement,\nLogisWay — Service Facturation`;
    case 2:
      return `Cher ${clientName},\n\nLa facture ${invoiceNumber} d'un montant de ${formattedAmount} arrive à échéance aujourd'hui (${formattedDueDate}).\n\nMerci de procéder au règlement dès réception de ce message.\n\nCordialement,\nLogisWay — Service Facturation`;
    case 3:
      return `Cher ${clientName},\n\nMalgré notre rappel du ${formattedDueDate}, la facture ${invoiceNumber} d'un montant de ${formattedAmount} reste impayée.\n\nNous vous demandons de bien vouloir régler cette facture dans un délai de 7 jours.\n\nÀ défaut de paiement, des frais de retard pourront être appliqués.\n\nCordialement,\nLogisWay — Service Facturation`;
    case 4:
      return `Cher ${clientName},\n\nÀ ce jour, la facture ${invoiceNumber} d'un montant de ${formattedAmount} demeure impayée malgré nos précédentes relances.\n\nNous vous demandons de procéder au règlement immédiat de cette facture.\n\nEn l'absence de paiement sous 48h, nous serons contraints d'engager une procédure de recouvrement.\n\nCordialement,\nLogisWay — Service Facturation`;
    case 5:
      return `OBJET : MISE EN DEMEURE\n\nCher ${clientName},\n\nNonobstant nos précédentes relances, la facture ${invoiceNumber} d'un montant de ${formattedAmount} demeure impayée.\n\nPar la présente, nous vous mettons en demeure de procéder au règlement intégral de cette facture dans un délai de 8 jours à compter de la réception de la présente.\n\nÀ défaut, nous nous réservons le droit d'engager toutes voies de droit à votre encontre, incluant une procédure judiciaire de recouvrement avec demandes de dommages et intérêts.\n\nLogisWay — Direction Générale`;
  }
}

// ─── Auto-reminder Check ────────────────────────────────────────

export interface InvoiceForReminder {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: string;
  dateEmission: string;
  dateEcheance: string;
}

/**
 * Déterminer le niveau de relance requis pour une facture
 * Retourne null si aucune relance n'est nécessaire
 */
export function getRequiredReminderLevel(
  invoice: InvoiceForReminder,
  config: ReminderConfig = DEFAULT_REMINDER_CONFIG,
): ReminderLevel | null {
  if (invoice.status === 'payee' || invoice.status === 'annulee') return null;

  const now = new Date();
  const dueDate = new Date(invoice.dateEcheance);
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Facture en retard
  if (daysDiff < 0) {
    const daysLate = Math.abs(daysDiff);
    if (daysLate >= 30) return 5;
    if (daysLate >= 15) return 4;
    if (daysLate >= 7) return 3;
    if (daysLate >= 0) return 2;
  }

  // Facture à échéance aujourd'hui
  if (daysDiff === 0) return 2;

  // Facture à échéance proche
  if (daysDiff <= config.daysBeforeDue) return 1;

  return null;
}

/**
 * Générer les relances nécessaires pour une liste de factures
 */
export function generateAutoReminders(
  invoices: InvoiceForReminder[],
  config: ReminderConfig = DEFAULT_REMINDER_CONFIG,
  existingReminders: Reminder[] = [],
): Reminder[] {
  if (!config.enabled) return [];

  const newReminders: Reminder[] = [];
  const now = new Date().toISOString();

  for (const invoice of invoices) {
    const requiredLevel = getRequiredReminderLevel(invoice, config);
    if (!requiredLevel) continue;

    // Vérifier si une relance de ce niveau existe déjà pour cette facture
    const alreadySent = existingReminders.some(
      (r) => r.invoiceId === invoice.id && r.level >= requiredLevel && r.status === 'sent'
    );
    if (alreadySent) continue;

    const subject = generateReminderSubject(requiredLevel, invoice.invoiceNumber);
    const body = generateReminderBody(
      requiredLevel,
      invoice.clientName,
      invoice.invoiceNumber,
      invoice.amount,
      invoice.dateEcheance,
    );

    newReminders.push({
      id: `rem-${Date.now()}-${invoice.id}-${requiredLevel}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      amount: invoice.amount,
      level: requiredLevel,
      channel: config.defaultChannel,
      sentAt: now,
      status: 'pending',
      subject,
      body,
    });
  }

  return newReminders;
}

/**
 * Simuler l'envoi d'une relance (mode prototype)
 */
export function sendReminder(reminder: Reminder): Reminder {
  // En mode prototype, on simule l'envoi en marquant comme "sent"
  // En production, ici on appellerait l'API d'envoi (SendGrid, Twilio, etc.)
  return {
    ...reminder,
    status: 'sent',
    sentAt: new Date().toISOString(),
  };
}

/**
 * Obtenir le nombre de jours de retard d'une facture
 */
export function getDaysLate(dateEcheance: string): number {
  const now = new Date();
  const dueDate = new Date(dateEcheance);
  const diff = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Obtenir le nombre de jours avant l'échéance
 */
export function getDaysUntilDue(dateEcheance: string): number {
  const now = new Date();
  const dueDate = new Date(dateEcheance);
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}
