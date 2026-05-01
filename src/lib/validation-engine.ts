/**
 * validation-engine.ts — Moteur de validation pour le module de contrôle LogisWay
 *
 * BRANCHEMENT : Importez les fonctions depuis ce fichier. Branchez sur vos données
 * en passant un tableau d'éléments et une interface de validation.
 *
 * Le moteur est entièrement indépendant — il ne lit aucune donnée en dur.
 * Vous lui fournissez les éléments à valider via startValidationSession().
 */

// ─── Types ──────────────────────────────────────────────────────

export type ValidationStatus = 'pending' | 'validated' | 'rejected' | 'skipped';

export interface ValidatableItem {
  /** Identifiant unique */
  id: string;
  /** Libellé principal (ex: N° de suivi) */
  label: string;
  /** Description secondaire */
  description?: string;
  /** Catégorie ou type */
  category?: string;
  /** Données supplémentaires (clé → valeur) pour le rapport */
  details?: Record<string, string>;
}

export interface ValidationResult {
  itemId: string;
  status: ValidationStatus;
  validatedAt: string;
  validatedBy: string;
  comment?: string;
}

export interface ValidationSession {
  /** ID unique de la session */
  id: string;
  /** Titre de la session de contrôle */
  title: string;
  /** Date de début */
  startedAt: string;
  /** Date de fin */
  completedAt?: string;
  /** Éléments à valider */
  items: ValidatableItem[];
  /** Résultats de validation */
  results: Map<string, ValidationResult>;
  /** Utilisateur qui effectue le contrôle */
  performedBy: string;
  /** Statut global */
  status: 'in_progress' | 'completed';
}

export interface ValidationStats {
  total: number;
  validated: number;
  rejected: number;
  skipped: number;
  pending: number;
  progressPercent: number;
}

// ─── Persistance localStorage ───────────────────────────────────

const VALIDATION_KEY = 'logisway-validation-sessions';

export function loadValidationSessions(): ValidationSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VALIDATION_KEY);
    if (raw) {
      const sessions = JSON.parse(raw);
      // Reconvertir les résultats en Map
      return sessions.map((s: ValidationSession & { results: [string, ValidationResult][] }) => ({
        ...s,
        results: new Map(s.results as unknown as [string, ValidationResult][]),
      }));
    }
  } catch { /* ignore */ }
  return [];
}

export function saveValidationSessions(sessions: ValidationSession[]): void {
  if (typeof window === 'undefined') return;
  // Convertir les Map en tableaux pour la sérialisation
  const serializable = sessions.map(s => ({
    ...s,
    results: Array.from(s.results.entries()),
  }));
  localStorage.setItem(VALIDATION_KEY, JSON.stringify(serializable));
}

// ─── Fonctions du moteur ────────────────────────────────────────

let currentSession: ValidationSession | null = null;

/**
 * Démarrer une nouvelle session de validation
 */
export function startValidationSession(
  items: ValidatableItem[],
  title: string,
  performedBy: string
): ValidationSession {
  currentSession = {
    id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    startedAt: new Date().toISOString(),
    items,
    results: new Map(),
    performedBy,
    status: 'in_progress',
  };

  // Initialiser tous les résultats comme "pending"
  items.forEach(item => {
    currentSession!.results.set(item.id, {
      itemId: item.id,
      status: 'pending',
      validatedAt: '',
      validatedBy: '',
    });
  });

  return currentSession;
}

/**
 * Valider un élément individuel
 */
export function validateItem(
  itemId: string,
  status: ValidationStatus,
  validatedBy: string,
  comment?: string
): ValidationResult | null {
  if (!currentSession) return null;

  const result: ValidationResult = {
    itemId,
    status,
    validatedAt: new Date().toISOString(),
    validatedBy,
    comment,
  };

  currentSession.results.set(itemId, result);
  return result;
}

/**
 * Valider plusieurs éléments d'un coup
 */
export function validateMultiple(
  itemIds: string[],
  status: ValidationStatus,
  validatedBy: string,
  comment?: string
): void {
  itemIds.forEach(id => validateItem(id, status, validatedBy, comment));
}

/**
 * Obtenir les statistiques de la session courante
 */
export function getValidationStats(session?: ValidationSession): ValidationStats {
  const s = session || currentSession;
  if (!s) {
    return { total: 0, validated: 0, rejected: 0, skipped: 0, pending: 0, progressPercent: 0 };
  }

  const results = Array.from(s.results.values());
  const validated = results.filter(r => r.status === 'validated').length;
  const rejected = results.filter(r => r.status === 'rejected').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const pending = results.filter(r => r.status === 'pending').length;
  const total = s.items.length;
  const progressPercent = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

  return { total, validated, rejected, skipped, pending, progressPercent };
}

/**
 * Terminer la session de validation
 */
export function completeValidationSession(): ValidationSession | null {
  if (!currentSession) return null;

  currentSession.completedAt = new Date().toISOString();
  currentSession.status = 'completed';

  // Sauvegarder dans l'historique
  const sessions = loadValidationSessions();
  sessions.push(currentSession);
  saveValidationSessions(sessions);

  const completed = currentSession;
  currentSession = null;
  return completed;
}

/**
 * Obtenir la session courante
 */
export function getCurrentSession(): ValidationSession | null {
  return currentSession;
}

/**
 * Réinitialiser la session courante
 */
export function resetCurrentSession(): void {
  currentSession = null;
}

/**
 * Générer les données du rapport PDF de fin de contrôle
 */
export function generateReportData(session: ValidationSession): {
  title: string;
  subtitle: string;
  data: Record<string, unknown>[];
  columns: { key: string; header: string; formatter?: (v: unknown) => string }[];
} {
  const stats = getValidationStats(session);

  const data = session.items.map(item => {
    const result = session.results.get(item.id);
    return {
      id: item.id,
      label: item.label,
      description: item.description || '',
      category: item.category || '',
      status: result?.status === 'validated' ? 'Validé' :
              result?.status === 'rejected' ? 'Rejeté' :
              result?.status === 'skipped' ? 'Ignoré' : 'En attente',
      comment: result?.comment || '',
      validatedAt: result?.validatedAt ? new Date(result.validatedAt).toLocaleString('fr-FR') : '',
    };
  });

  return {
    title: `Rapport de Contrôle — ${session.title}`,
    subtitle: `Effectué par ${session.performedBy} le ${new Date(session.startedAt).toLocaleDateString('fr-FR')} | Total: ${stats.total} | Validés: ${stats.validated} | Rejetés: ${stats.rejected} | Ignorés: ${stats.skipped} | Progression: ${stats.progressPercent}%`,
    data,
    columns: [
      { key: 'label', header: 'Élément' },
      { key: 'description', header: 'Description' },
      { key: 'category', header: 'Catégorie' },
      { key: 'status', header: 'Statut' },
      { key: 'comment', header: 'Commentaire' },
      { key: 'validatedAt', header: 'Date/Heure' },
    ],
  };
}
