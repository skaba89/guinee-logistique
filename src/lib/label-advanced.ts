/**
 * Advanced Label & Printer Extensions — LogisWay
 * Batch printing, print history, printer groups, custom label templates,
 * and enhanced label generation features.
 */

// ─── Batch Printing ────────────────────────────────────────────

export interface BatchPrintJob {
  id: string;
  /** Nom du lot */
  name: string;
  /** Liste des IDs de colis */
  parcelIds: string[];
  /** Format d'étiquette */
  labelFormatId: string;
  /** Imprimante sélectionnée */
  printerId: string;
  /** Copies par étiquette */
  copiesPerLabel: number;
  /** Statut du lot */
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'partial';
  /** Nombre imprimé */
  printedCount: number;
  /** Nombre échoué */
  failedCount: number;
  /** Créé par */
  createdBy: string;
  /** Date de création */
  createdAt: string;
  /** Date de complétion */
  completedAt?: string;
  /** Erreurs */
  errors: { parcelId: string; error: string }[];
}

const BATCH_JOBS_KEY = 'logisway-batch-jobs';

export function loadBatchJobs(): BatchPrintJob[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BATCH_JOBS_KEY);
    if (raw) return JSON.parse(raw) as BatchPrintJob[];
  } catch { /* ignore */ }
  return [];
}

export function saveBatchJobs(jobs: BatchPrintJob[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BATCH_JOBS_KEY, JSON.stringify(jobs.slice(-50)));
}

export function createBatchJob(job: Omit<BatchPrintJob, 'id' | 'createdAt' | 'status' | 'printedCount' | 'failedCount' | 'errors' | 'completedAt'>): BatchPrintJob {
  const newJob: BatchPrintJob = {
    ...job,
    id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'queued',
    printedCount: 0,
    failedCount: 0,
    errors: [],
    createdAt: new Date().toISOString(),
  };

  const jobs = loadBatchJobs();
  jobs.push(newJob);
  saveBatchJobs(jobs);
  return newJob;
}

export function updateBatchJobProgress(jobId: string, printed: number, failed: number, errors: { parcelId: string; error: string }[]): void {
  const jobs = loadBatchJobs();
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx >= 0) {
    jobs[idx].printedCount = printed;
    jobs[idx].failedCount = failed;
    jobs[idx].errors = errors;
    if (printed + failed >= jobs[idx].parcelIds.length) {
      jobs[idx].status = failed > 0 ? 'partial' : 'completed';
      jobs[idx].completedAt = new Date().toISOString();
    } else {
      jobs[idx].status = 'printing';
    }
    saveBatchJobs(jobs);
  }
}

// ─── Print History ─────────────────────────────────────────────

export interface PrintHistoryEntry {
  id: string;
  /** ID du colis */
  parcelId: string;
  /** Numéro de suivi */
  trackingNumber: string;
  /** Format d'étiquette */
  labelFormatId: string;
  /** Nom du format */
  labelFormatName: string;
  /** Imprimante utilisée */
  printerId: string;
  /** Nom de l'imprimante */
  printerName: string;
  /** Nombre de copies */
  copies: number;
  /** Utilisateur */
  userId: string;
  userName: string;
  /** Horodatage */
  printedAt: string;
  /** Résultat */
  result: 'success' | 'failed';
  /** Message d'erreur */
  errorMessage?: string;
  /** Type d'impression */
  printType: 'single' | 'batch';
  /** ID du lot si batch */
  batchJobId?: string;
  /** Durée d'impression (ms) */
  duration?: number;
}

const PRINT_HISTORY_KEY = 'logisway-print-history';

export function loadPrintHistory(): PrintHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRINT_HISTORY_KEY);
    if (raw) return JSON.parse(raw) as PrintHistoryEntry[];
  } catch { /* ignore */ }
  return [];
}

export function savePrintHistory(history: PrintHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRINT_HISTORY_KEY, JSON.stringify(history.slice(-200)));
}

export function addPrintHistoryEntry(entry: Omit<PrintHistoryEntry, 'id'>): void {
  const full: PrintHistoryEntry = {
    ...entry,
    id: `phist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const history = loadPrintHistory();
  history.push(full);
  savePrintHistory(history);
}

export function getPrintHistoryForParcel(parcelId: string): PrintHistoryEntry[] {
  return loadPrintHistory().filter(h => h.parcelId === parcelId);
}

export function getPrintHistoryForPrinter(printerId: string): PrintHistoryEntry[] {
  return loadPrintHistory().filter(h => h.printerId === printerId);
}

// ─── Printer Groups ────────────────────────────────────────────

export interface PrinterGroup {
  id: string;
  name: string;
  description: string;
  /** Liste des IDs d'imprimantes dans le groupe */
  printerIds: string[];
  /** Stratégie de sélection */
  strategy: 'round-robin' | 'failover' | 'load-balance' | 'manual';
  /** Imprimante par défaut dans le groupe */
  defaultPrinterId: string;
  /** Activé */
  enabled: boolean;
}

const PRINTER_GROUPS_KEY = 'logisway-printer-groups';

export const defaultPrinterGroups: PrinterGroup[] = [
  {
    id: 'group-expedition',
    name: 'Groupe Expédition',
    description: 'Imprimantes dédiées aux étiquettes d\'expédition standard',
    printerIds: ['printer-1', 'printer-2'],
    strategy: 'failover',
    defaultPrinterId: 'printer-1',
    enabled: true,
  },
  {
    id: 'group-compact',
    name: 'Groupe Compact',
    description: 'Imprimantes pour étiquettes compactes et codes-barres',
    printerIds: ['printer-3'],
    strategy: 'manual',
    defaultPrinterId: 'printer-3',
    enabled: true,
  },
];

export function loadPrinterGroups(): PrinterGroup[] {
  if (typeof window === 'undefined') return defaultPrinterGroups;
  try {
    const raw = localStorage.getItem(PRINTER_GROUPS_KEY);
    if (raw) return JSON.parse(raw) as PrinterGroup[];
  } catch { /* ignore */ }
  return defaultPrinterGroups;
}

export function savePrinterGroups(groups: PrinterGroup[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRINTER_GROUPS_KEY, JSON.stringify(groups));
}

/**
 * Sélectionne une imprimante dans un groupe selon la stratégie.
 */
export function selectPrinterFromGroup(groupId: string): string | null {
  const groups = loadPrinterGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group || !group.enabled) return null;

  // Pour la simulation, on retourne toujours l'imprimante par défaut
  // En production, on appliquerait la stratégie (round-robin, failover, load-balance)
  return group.defaultPrinterId;
}

// ─── Custom Label Templates ────────────────────────────────────

export type LabelTemplateType = 'shipping' | 'return' | 'warehouse' | 'qr_only' | 'barcode_only' | 'pallet' | 'custom';

export interface LabelTemplate {
  id: string;
  name: string;
  type: LabelTemplateType;
  description: string;
  /** Format d'étiquette compatible */
  compatibleFormats: string[];
  /** Sections à inclure */
  sections: {
    header: boolean;
    barcode: boolean;
    qrCode: boolean;
    sender: boolean;
    receiver: boolean;
    parcelInfo: boolean;
    price: boolean;
    tracking: boolean;
    customs: boolean;
    warnings: boolean;
    companyLogo: boolean;
  };
  /** Couleurs personnalisées */
  colors: {
    header: string;
    accent: string;
    text: string;
  };
  /** Créé par l'utilisateur ? */
  isCustom: boolean;
  /** Actif */
  active: boolean;
}

export const defaultLabelTemplates: LabelTemplate[] = [
  {
    id: 'tpl-shipping-standard',
    name: 'Expédition Standard',
    type: 'shipping',
    description: 'Étiquette d\'expédition complète avec toutes les informations',
    compatibleFormats: ['4x6', '4x8', '6x4'],
    sections: {
      header: true, barcode: true, qrCode: true, sender: true, receiver: true,
      parcelInfo: true, price: true, tracking: true, customs: false, warnings: false, companyLogo: true,
    },
    colors: { header: '#0d9488', accent: '#059669', text: '#1f2937' },
    isCustom: false,
    active: true,
  },
  {
    id: 'tpl-shipping-compact',
    name: 'Expédition Compact',
    description: 'Étiquette compacte avec informations essentielles uniquement',
    compatibleFormats: ['4x4', '2-4x4'],
    sections: {
      header: true, barcode: true, qrCode: false, sender: false, receiver: true,
      parcelInfo: true, price: true, tracking: true, customs: false, warnings: false, companyLogo: false,
    },
    colors: { header: '#2563eb', accent: '#1d4ed8', text: '#1f2937' },
    isCustom: false,
    active: true,
  },
  {
    id: 'tpl-return',
    name: 'Retour',
    description: 'Étiquette de retour avec motif pré-imprimé',
    compatibleFormats: ['4x6', '4x4'],
    sections: {
      header: true, barcode: true, qrCode: true, sender: true, receiver: true,
      parcelInfo: true, price: false, tracking: true, customs: false, warnings: true, companyLogo: true,
    },
    colors: { header: '#dc2626', accent: '#b91c1c', text: '#1f2937' },
    isCustom: false,
    active: true,
  },
  {
    id: 'tpl-warehouse',
    name: 'Entrepôt',
    description: 'Étiquette d\'entrepôt avec emplacement et QR code',
    compatibleFormats: ['2-4x4', '2x1'],
    sections: {
      header: true, barcode: true, qrCode: true, sender: false, receiver: false,
      parcelInfo: true, price: false, tracking: true, customs: false, warnings: false, companyLogo: false,
    },
    colors: { header: '#7c3aed', accent: '#6d28d9', text: '#1f2937' },
    isCustom: false,
    active: true,
  },
  {
    id: 'tpl-qr-only',
    name: 'QR Code uniquement',
    description: 'Mini étiquette avec QR code pour identification rapide',
    compatibleFormats: ['2x1'],
    sections: {
      header: false, barcode: false, qrCode: true, sender: false, receiver: false,
      parcelInfo: false, price: false, tracking: true, customs: false, warnings: false, companyLogo: false,
    },
    colors: { header: '#000000', accent: '#333333', text: '#000000' },
    isCustom: false,
    active: true,
  },
  {
    id: 'tpl-pallet',
    name: 'Palette',
    description: 'Étiquette grande format pour palettes et conteneurs',
    compatibleFormats: ['4x8', '6x4', 'a4'],
    sections: {
      header: true, barcode: true, qrCode: true, sender: true, receiver: true,
      parcelInfo: true, price: true, tracking: true, customs: true, warnings: true, companyLogo: true,
    },
    colors: { header: '#ea580c', accent: '#c2410c', text: '#1f2937' },
    isCustom: false,
    active: true,
  },
];

const LABEL_TEMPLATES_KEY = 'logisway-label-templates';

export function loadLabelTemplates(): LabelTemplate[] {
  if (typeof window === 'undefined') return defaultLabelTemplates;
  try {
    const raw = localStorage.getItem(LABEL_TEMPLATES_KEY);
    if (raw) return JSON.parse(raw) as LabelTemplate[];
  } catch { /* ignore */ }
  return defaultLabelTemplates;
}

export function saveLabelTemplates(templates: LabelTemplate[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LABEL_TEMPLATES_KEY, JSON.stringify(templates));
}

export function getTemplatesForFormat(formatId: string): LabelTemplate[] {
  return loadLabelTemplates().filter(t => t.active && t.compatibleFormats.includes(formatId));
}

// ─── Photos de preuve persistantes ─────────────────────────────

export interface ProofPhoto {
  id: string;
  /** ID du colis associé */
  parcelId: string;
  /** Type de photo */
  type: 'pickup' | 'warehouse' | 'transit' | 'delivery' | 'damage' | 'return' | 'custom';
  /** Données de l'image (base64 data URL) */
  dataUrl: string;
  /** Métadonnées */
  metadata: {
    /** Horodatage de la capture */
    capturedAt: string;
    /** Latitude */
    latitude?: number;
    /** Longitude */
    longitude?: number;
    /** Appareil */
    device?: string;
    /** Taille du fichier en octets */
    fileSize: number;
    /** Largeur en pixels */
    width: number;
    /** Hauteur en pixels */
    height: number;
    /** Hash pour vérification d'intégrité */
    hash: string;
  };
  /** Utilisateur ayant capturé */
  capturedBy: string;
  /** Commentaire */
  comment?: string;
  /** Vérifié par un manager */
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

const PROOF_PHOTOS_KEY = 'logisway-proof-photos';

export function loadProofPhotos(): ProofPhoto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROOF_PHOTOS_KEY);
    if (raw) return JSON.parse(raw) as ProofPhoto[];
  } catch { /* ignore */ }
  return [];
}

export function saveProofPhotos(photos: ProofPhoto[]): void {
  if (typeof window === 'undefined') return;
  // Limiter le stockage (garder 50 photos max en localStorage)
  localStorage.setItem(PROOF_PHOTOS_KEY, JSON.stringify(photos.slice(-50)));
}

export function addProofPhoto(photo: Omit<ProofPhoto, 'id'>): ProofPhoto {
  const full: ProofPhoto = {
    ...photo,
    id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const photos = loadProofPhotos();
  photos.push(full);
  saveProofPhotos(photos);
  return full;
}

export function getPhotosForParcel(parcelId: string): ProofPhoto[] {
  return loadProofPhotos().filter(p => p.parcelId === parcelId);
}

export function deleteProofPhoto(photoId: string): void {
  const photos = loadProofPhotos().filter(p => p.id !== photoId);
  saveProofPhotos(photos);
}

export function verifyProofPhoto(photoId: string, verifiedBy: string): void {
  const photos = loadProofPhotos();
  const idx = photos.findIndex(p => p.id === photoId);
  if (idx >= 0) {
    photos[idx].verified = true;
    photos[idx].verifiedBy = verifiedBy;
    photos[idx].verifiedAt = new Date().toISOString();
    saveProofPhotos(photos);
  }
}

/**
 * Génère un hash simple pour vérifier l'intégrité d'une photo.
 */
export function generatePhotoHash(dataUrl: string): string {
  let hash = 0;
  for (let i = 0; i < dataUrl.length; i++) {
    const char = dataUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export const photoTypeLabels: Record<ProofPhoto['type'], string> = {
  pickup: 'Collecte',
  warehouse: 'Entrepôt',
  transit: 'Transit',
  delivery: 'Livraison',
  damage: 'Dommage',
  return: 'Retour',
  custom: 'Autre',
};

export const photoTypeColors: Record<ProofPhoto['type'], string> = {
  pickup: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warehouse: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  delivery: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  damage: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  return: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  custom: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// ─── Données de test pour l'historique d'impression ────────────

export function seedPrintHistory(): void {
  const existing = loadPrintHistory();
  if (existing.length > 0) return;

  const now = new Date();
  const entries: Omit<PrintHistoryEntry, 'id'>[] = [
    {
      parcelId: 'p1', trackingNumber: 'PC-FP-2026-0001', labelFormatId: '4x6', labelFormatName: '4" x 6"',
      printerId: 'printer-1', printerName: 'Zebra ZD421', copies: 1, userId: '2', userName: 'Fatima Khelifi',
      printedAt: new Date(now.getTime() - 86400000).toISOString(), result: 'success', printType: 'single', duration: 1200,
    },
    {
      parcelId: 'p3', trackingNumber: 'PC-FP-2026-0003', labelFormatId: '4x4', labelFormatName: '4" x 4"',
      printerId: 'printer-2', printerName: 'Zebra ZT411', copies: 2, userId: '1', userName: 'Ahmed Benali',
      printedAt: new Date(now.getTime() - 72000000).toISOString(), result: 'success', printType: 'single', duration: 980,
    },
    {
      parcelId: 'p5', trackingNumber: 'PC-FP-2026-0005', labelFormatId: '4x6', labelFormatName: '4" x 6"',
      printerId: 'printer-1', printerName: 'Zebra ZD421', copies: 1, userId: '2', userName: 'Fatima Khelifi',
      printedAt: new Date(now.getTime() - 36000000).toISOString(), result: 'success', printType: 'batch', batchJobId: 'batch-demo-1', duration: 1500,
    },
    {
      parcelId: 'p7', trackingNumber: 'PC-FP-2026-0007', labelFormatId: '2-4x4', labelFormatName: '2.4" x 4"',
      printerId: 'printer-3', printerName: 'Zebra GK420d', copies: 1, userId: '2', userName: 'Fatima Khelifi',
      printedAt: new Date(now.getTime() - 18000000).toISOString(), result: 'failed', errorMessage: 'Imprimante hors ligne', printType: 'single',
    },
  ];

  entries.forEach(entry => addPrintHistoryEntry(entry));
}
