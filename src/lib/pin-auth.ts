/**
 * pin-auth.ts — Système d'authentification par code PIN pour Guinée Logistique
 *
 * Supporte les codes PIN par utilisateur. Chaque utilisateur a son propre
 * PIN stocké dans les données de test (user.pin). Le hash est calculé
 * avec le PIN + l'ID utilisateur comme sel supplémentaire, ce qui garantit
 * que deux utilisateurs avec le même PIN auront des hashes différents.
 *
 * En mode prototype, les hashes sont stockés en localStorage.
 * En production, utilisez une vraie API côté serveur.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface PinSession {
  authenticated: boolean;
  authenticatedAt: string;
  expiresAt: string;
  /** ID de l'utilisateur authentifié */
  userId: string;
}

// ─── Hashing simple (SHA-256) ───────────────────────────────────

/**
 * Hacher un PIN avec l'ID utilisateur comme sel additionnel.
 * Cela garantit que deux utilisateurs avec le même PIN auront des hashes différents.
 */
export async function hashPin(pin: string, userId?: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = `guinee-logistique-salt-2026${userId ? `:${userId}` : ''}`;
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, storedHash: string, userId?: string): Promise<boolean> {
  const hash = await hashPin(pin, userId);
  return hash === storedHash;
}

// ─── Gestion de la session PIN ─────────────────────────────────

const PIN_SESSION_KEY = 'guinee-logistique-pin-session';
const PIN_HASH_KEY_PREFIX = 'guinee-logistique-pin-hash-';

/**
 * Obtenir la clé de stockage du hash pour un utilisateur donné
 */
function getPinHashKey(userId: string): string {
  return `${PIN_HASH_KEY_PREFIX}${userId}`;
}

/**
 * Stocker le hash du PIN pour un utilisateur spécifique
 */
export async function storePinHash(pin: string, userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const hash = await hashPin(pin, userId);
  localStorage.setItem(getPinHashKey(userId), hash);
}

/**
 * Vérifier si un PIN est configuré pour un utilisateur donné
 */
export function isPinConfigured(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(getPinHashKey(userId));
}

/**
 * Authentifier avec un PIN pour un utilisateur donné
 */
export async function authenticateWithPin(
  pin: string,
  userId: string,
  timeoutSeconds: number = 120
): Promise<boolean> {
  const storedHash = localStorage.getItem(getPinHashKey(userId));

  if (!storedHash) {
    // Si aucun PIN n'est configuré pour cet utilisateur, stocker ce PIN
    await storePinHash(pin, userId);
  } else {
    const isValid = await verifyPin(pin, storedHash, userId);
    if (!isValid) return false;
  }

  // Créer la session
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutSeconds * 1000);
  const session: PinSession = {
    authenticated: true,
    authenticatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    userId,
  };
  localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));

  return true;
}

/**
 * Vérifier si la session PIN est active pour un utilisateur donné
 */
export function isPinSessionActive(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(PIN_SESSION_KEY);
    if (!raw) return false;
    const session: PinSession = JSON.parse(raw);
    if (!session.authenticated) return false;
    // Vérifier que la session appartient à l'utilisateur courant
    if (session.userId !== userId) return false;
    return new Date(session.expiresAt) > new Date();
  } catch {
    return false;
  }
}

/**
 * Déconnecter la session PIN
 */
export function clearPinSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_SESSION_KEY);
}

/**
 * Obtenir le temps restant de la session en secondes
 */
export function getPinSessionRemainingTime(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(PIN_SESSION_KEY);
    if (!raw) return 0;
    const session: PinSession = JSON.parse(raw);
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.round(remaining / 1000));
  } catch {
    return 0;
  }
}

// ─── Rétrocompatibilité ────────────────────────────────────────

/**
 * @deprecated Utiliser storePinHash(pin, userId) à la place
 */
export async function storePinHashLegacy(pin: string): Promise<void> {
  return storePinHash(pin, '');
}

/**
 * @deprecated Utiliser isPinConfigured(userId) à la place
 */
export function isPinConfiguredLegacy(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('guinee-logistique-pin-hash');
}

/**
 * @deprecated Utiliser authenticateWithPin(pin, userId, timeout) à la place
 */
export async function authenticateWithPinLegacy(pin: string, timeoutSeconds: number = 120): Promise<boolean> {
  return authenticateWithPin(pin, '', timeoutSeconds);
}

/**
 * @deprecated Utiliser isPinSessionActive(userId) à la place
 */
export function isPinSessionActiveLegacy(): boolean {
  return isPinSessionActive('');
}
