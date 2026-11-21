/**
 * pin-guard.tsx — Wrapper de protection par code PIN pour Guinée Logistique
 *
 * Supporte les codes PIN par utilisateur. Le composant récupère
 * automatiquement le PIN et l'ID de l'utilisateur connecté depuis
 * le store Zustand pour vérifier l'authentification.
 *
 * Props optionnelles pour personnaliser le comportement :
 *   - timeout : Durée de la session en secondes avant re-demande (défaut: 120)
 *   - title : Titre affiché dans la modale
 *   - description : Description dans la modale
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Clock, Shield, User } from 'lucide-react';
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
import { useCargoStore } from '@/lib/cargo-store';

// ─── Props ──────────────────────────────────────────────────────

export interface PinGuardProps {
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
  timeout = 120,
  title = 'Accès sécurisé',
  description = 'Entrez votre code PIN pour accéder à cette section.',
  children,
  onAuthenticated,
  onAuthenticationFailed,
}: PinGuardProps) {
  const user = useCargoStore((s) => s.user);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDialog, setShowDialog] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // L'utilisateur courant et son PIN
  const userId = user?.id || '';
  const userPin = user?.pin || '1234'; // fallback pour compatibilité
  const userName = user?.name || 'Utilisateur';

  // Initialiser le hash du PIN et vérifier la session existante
  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      let active = false;
      try {
        if (userId) {
          await storePinHash(userPin, userId);
          active = isPinSessionActive(userId);
        }
      } catch {
        // Un accès au stockage indisponible ne doit pas ouvrir la section.
      }
      if (!cancelled) {
        setIsAuthenticated(active);
        setShowDialog(!active);
      }
    };
    const timer = window.setTimeout(() => void initialize(), 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [userId, userPin]);

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
    if (!userId) return;
    let isValid = false;
    try {
      await storePinHash(userPin, userId);
      isValid = await authenticateWithPin(pinInput, userId, timeout);
    } catch {
      setError('Impossible de vérifier le code PIN.');
      return;
    }

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
  }, [pinInput, userId, userPin, timeout, attempts, onAuthenticated, onAuthenticationFailed]);

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
          {/* Info utilisateur */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              {userName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{userName}</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <User className="w-2.5 h-2.5" />
                {user?.role || 'Utilisateur'}
              </p>
            </div>
          </div>

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
