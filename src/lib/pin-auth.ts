/**
 * pin-auth.ts — Système d'authentification par code PIN pour LogisWay
 *
 * BRANCHEMENT : Importez PinAuth depuis ce fichier et utilisez-le
 * comme wrapper autour des sections sensibles de votre application.
 *
 * Le PIN est stocké hashé côté serveur (env variable) ou en localStorage
 * pour le mode prototype. En production, utilisez une vraie API.
 *
 * Exemple :
 *   import PinGuard from '@/components/cargo/pin-guard';
 *   <PinGuard pin="1234" timeout={120}>
 *     <SensitiveContent />
 *   </PinGuard>
 */

// ─── Types ──────────────────────────────────────────────────────

export interface PinSession {
  authenticated: boolean;
  authenticatedAt: string;
  expiresAt: string;
}

// ─── Hashing simple (SHA-256) ───────────────────────────────────

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'logisway-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === storedHash;
}

// ─── Gestion de la session PIN ─────────────────────────────────

const PIN_SESSION_KEY = 'logisway-pin-session';
const PIN_HASH_KEY = 'logisway-pin-hash';

/**
 * Stocker le hash du PIN (appelé à l'initialisation ou au changement de PIN)
 */
export async function storePinHash(pin: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

/**
 * Vérifier si le hash du PIN est configuré
 */
export function isPinConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(PIN_HASH_KEY);
}

/**
 * Authentifier avec un PIN
 */
export async function authenticateWithPin(pin: string, timeoutSeconds: number = 120): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) {
    // Si aucun PIN n'est configuré, utiliser le PIN par défaut
    await storePinHash(pin);
    return true;
  }

  const isValid = await verifyPin(pin, storedHash);
  if (!isValid) return false;

  // Créer la session
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutSeconds * 1000);
  const session: PinSession = {
    authenticated: true,
    authenticatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));

  return true;
}

/**
 * Vérifier si la session PIN est active
 */
export function isPinSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(PIN_SESSION_KEY);
    if (!raw) return false;
    const session: PinSession = JSON.parse(raw);
    if (!session.authenticated) return false;
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
