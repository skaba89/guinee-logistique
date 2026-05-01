/**
 * pin-guard.tsx — Wrapper de protection par code PIN pour LogisWay
 *
 * BRANCHEMENT : Encadrez n'importe quelle section sensible avec <PinGuard>.
 * Aucune modification du code existant n'est nécessaire.
 *
 * Exemple :
 *   import PinGuard from '@/components/cargo/pin-guard';
 *
 *   <PinGuard pin="1234" timeout={120}>
 *     <SensitivePage />
 *   </PinGuard>
 *
 * Props :
 *   - pin : Code PIN à utiliser (défaut: "1234"). En production, utilisez
 *     une variable d'environnement côté serveur.
 *   - timeout : Durée de la session en secondes avant re-demande (défaut: 120)
 *   - title : Titre affiché dans la modale
 *   - description : Description dans la modale
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  authenticateWithPin,
  isPinSessionActive,
  clearPinSession,
  getPinSessionRemainingTime,
  storePinHash,
} from '@/lib/pin-auth';

// ─── Props ──────────────────────────────────────────────────────

export interface PinGuardProps {
  /** Code PIN (défaut: "1234") */
  pin?: string;
  /** Durée de session en secondes (défaut: 120 = 2 minutes) */
  timeout?: number;
  /** Titre de la modale */
  title?: string;
  /** Description de la modale */
  description?: string;
  /** Contenu protégé */
  children: React.ReactNode;
  /** Callback quand l'authentification réussit */
  onAuthenticated?: () => void;
  /** Callback quand l'authentification échoue */
  onAuthenticationFailed?: () => void;
}

// ─── Composant ──────────────────────────────────────────────────

export default function PinGuard({
  pin = '1234',
  timeout = 120,
  title = 'Accès sécurisé',
  description = 'Entrez votre code PIN pour accéder à cette section.',
  children,
  onAuthenticated,
  onAuthenticationFailed,
}: PinGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDialog, setShowDialog] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Initialiser le hash du PIN et vérifier la session existante
  useEffect(() => {
    storePinHash(pin);

    if (isPinSessionActive()) {
      setIsAuthenticated(true);
      setShowDialog(false);
    }
  }, [pin]);

  // Timer de session
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const remaining = getPinSessionRemainingTime();
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearPinSession();
        setIsAuthenticated(false);
        setShowDialog(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Soumettre le PIN
  const handleSubmit = useCallback(async () => {
    const isValid = await authenticateWithPin(pinInput, timeout);

    if (isValid) {
      setIsAuthenticated(true);
      setShowDialog(false);
      setPinInput('');
      setError('');
      setAttempts(0);
      onAuthenticated?.();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`Code PIN incorrect. ${newAttempts >= 3 ? 'Trop de tentatives.' : `Tentative ${newAttempts}/3`}`);
      setPinInput('');
      onAuthenticationFailed?.();

      if (newAttempts >= 3) {
        // Verrouiller temporairement après 3 tentatives
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 30000); // 30 secondes de verrouillage
      }
    }
  }, [pinInput, timeout, attempts, onAuthenticated, onAuthenticationFailed]);

  // Afficher le contenu protégé
  if (isAuthenticated) {
    return (
      <div className="relative">
        {/* Indicateur de session (coin supérieur droit) */}
        {remainingTime > 0 && remainingTime <= 30 && (
          <div className="absolute -top-1 -right-1 z-10">
            <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
              <Clock className="w-2.5 h-2.5 mr-0.5" />
              {remainingTime}s
            </Badge>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Afficher la modale PIN
  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-teal-600" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Champ PIN */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                placeholder="Code PIN"
                value={pinInput}
                onChange={e => { setPinInput(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                className="text-center text-lg tracking-widest pr-10"
                maxLength={8}
                autoFocus
                disabled={attempts >= 3}
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> {error}
              </motion.p>
            )}

            {/* Verrouillage après 3 tentatives */}
            {attempts >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2 rounded bg-red-50 dark:bg-red-900/10 text-center"
              >
                <p className="text-xs text-red-600 dark:text-red-400">
                  Trop de tentatives. Réessayez dans 30 secondes.
                </p>
              </motion.div>
            )}
          </div>

          {/* Timer de session info */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Session de {timeout} secondes après authentification</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full text-white"
            style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            onClick={handleSubmit}
            disabled={pinInput.length < 4 || attempts >= 3}
          >
            <Lock className="w-4 h-4 mr-2" />
            Déverrouiller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

