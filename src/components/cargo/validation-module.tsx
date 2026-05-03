/**
 * validation-module.tsx — Module de contrôle / validation pour Guinée Logistique
 *
 * BRANCHEMENT : Importez ValidationModule depuis ce fichier.
 * Fournissez les éléments à valider via la prop `items`.
 *
 * Le module est entièrement indépendant. Il gère :
 *   - Sélection multiple (tout sélectionner / sélection manuelle)
 *   - Validation élément par élément avec confirmation
 *   - Compteur : total / validés / restants
 *   - Génération d'un rapport PDF de fin de contrôle
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  SkipForward,
  RotateCcw,
  FileText,
  Check,
  Square,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  type ValidatableItem,
  type ValidationStatus,
  type ValidationStats,
  startValidationSession,
  validateItem,
  validateMultiple,
  getValidationStats,
  completeValidationSession,
  getCurrentSession,
  generateReportData,
} from '@/lib/validation-engine';
import { exportToPDF, exportToExcel } from '@/lib/export-utils';

// ─── Props ──────────────────────────────────────────────────────

export interface ValidationModuleProps {
  /** Éléments à valider */
  items: ValidatableItem[];
  /** Titre de la session de contrôle */
  title?: string;
  /** Nom de l'utilisateur qui effectue le contrôle */
  userName?: string;
  /** Callback quand la session est terminée */
  onComplete?: (stats: ValidationStats) => void;
  /** Classe CSS additionnelle */
  className?: string;
}

// ─── Composant ──────────────────────────────────────────────────

export default function ValidationModule({
  items,
  title = 'Session de contrôle',
  userName = 'Utilisateur',
  onComplete,
  className = '',
}: ValidationModuleProps) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, { status: ValidationStatus; comment: string }>>(new Map());
  const [confirmDialog, setConfirmDialog] = useState<{ action: ValidationStatus; ids: string[] } | null>(null);
  const [comment, setComment] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);

  // Statistiques
  const stats = useMemo(() => {
    const validated = Array.from(results.values()).filter(r => r.status === 'validated').length;
    const rejected = Array.from(results.values()).filter(r => r.status === 'rejected').length;
    const skipped = Array.from(results.values()).filter(r => r.status === 'skipped').length;
    const pending = items.length - validated - rejected - skipped;
    const progressPercent = items.length > 0 ? Math.round(((items.length - pending) / items.length) * 100) : 0;
    return { total: items.length, validated, rejected, skipped, pending, progressPercent };
  }, [results, items.length]);

  // Démarrer la session
  const handleStart = () => {
    startValidationSession(items, title, userName);
    setSessionStarted(true);
    setSessionComplete(false);
    setCurrentIndex(0);
    setResults(new Map());
    setSelectedIds(new Set());
  };

  // Sélectionner/désélectionner un élément
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tout sélectionner / désélectionner
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  // Confirmer une action de validation
  const handleConfirmAction = (action: ValidationStatus, ids: string[]) => {
    setConfirmDialog({ action, ids });
    setComment('');
  };

  // Exécuter l'action confirmée
  const executeAction = () => {
    if (!confirmDialog) return;

    const { action, ids } = confirmDialog;

    ids.forEach(id => {
      validateItem(id, action, userName, comment || undefined);
      setResults(prev => {
        const next = new Map(prev);
        next.set(id, { status: action, comment: comment || '' });
        return next;
      });
    });

    setConfirmDialog(null);
    setComment('');
    setSelectedIds(new Set());

    // Avancer automatiquement si on valide l'élément courant
    if (ids.length === 1 && ids[0] === items[currentIndex]?.id) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < items.length) {
        setCurrentIndex(nextIndex);
      }
    }
  };

  // Navigation
  const goTo = (index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
    }
  };

  // Terminer la session
  const handleComplete = () => {
    completeValidationSession();
    setSessionComplete(true);
    onComplete?.(stats);
  };

  // Exporter le rapport
  const handleExportReport = (format: 'pdf' | 'excel') => {
    const session = getCurrentSession();
    if (!session) return;

    const reportData = generateReportData(session);

    if (format === 'pdf') {
      exportToPDF({
        title: reportData.title,
        subtitle: reportData.subtitle,
        data: reportData.data,
        columns: reportData.columns,
        filename: `controle-${title.replace(/\s+/g, '-').toLowerCase()}`,
      });
    } else {
      exportToExcel({
        data: reportData.data,
        columns: reportData.columns,
        filename: `controle-${title.replace(/\s+/g, '-').toLowerCase()}`,
        title: reportData.title,
      });
    }
  };

  // Statut badge
  const getStatusBadge = (status: ValidationStatus) => {
    const styles: Record<ValidationStatus, string> = {
      pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      validated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      skipped: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    const labels: Record<ValidationStatus, string> = {
      pending: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté',
      skipped: 'Ignoré',
    };
    return (
      <Badge variant="secondary" className={`text-[10px] ${styles[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  // ── Vue : pas encore démarré ──
  if (!sessionStarted) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
              <ClipboardCheck className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Module de Contrôle</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Validez ou rejetez des éléments un par un ou par lot. Générez un rapport PDF à la fin du contrôle.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{items.length} éléments à contrôler</span>
            </div>
            <Button
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              onClick={handleStart}
              disabled={items.length === 0}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Démarrer le contrôle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Vue : session terminée ──
  if (sessionComplete) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contrôle terminé</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tous les éléments ont été traités.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                <p className="text-xl font-bold text-green-600">{stats.validated}</p>
                <p className="text-[10px] text-green-500">Validés</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-[10px] text-red-500">Rejetés</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                <p className="text-xl font-bold text-amber-600">{stats.skipped}</p>
                <p className="text-[10px] text-amber-500">Ignorés</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/10">
                <p className="text-xl font-bold text-gray-600">{stats.pending}</p>
                <p className="text-[10px] text-gray-500">Restants</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                <FileText className="w-4 h-4 mr-1" /> Rapport PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                <Download className="w-4 h-4 mr-1" /> Rapport Excel
              </Button>
              <Button variant="ghost" size="sm" onClick={handleStart}>
                <RotateCcw className="w-4 h-4 mr-1" /> Nouveau contrôle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Vue : en cours de contrôle ──
  const currentItem = items[currentIndex];
  const currentResult = currentItem ? results.get(currentItem.id) : undefined;
  const allSelected = selectedIds.size === items.length;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-500" />
              {title}
            </CardTitle>
            <CardDescription>Contrôle en cours — élément {currentIndex + 1} / {items.length}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleComplete}>
              Terminer le contrôle
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de progression */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Progression</span>
            <span className="font-medium">{stats.progressPercent}%</span>
          </div>
          <Progress value={stats.progressPercent} className="h-2" />
          <div className="flex items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {stats.validated} validés</span>
            <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> {stats.rejected} rejetés</span>
            <span className="flex items-center gap-1"><SkipForward className="w-3 h-3 text-amber-500" /> {stats.skipped} ignorés</span>
            <span>{stats.pending} restants</span>
          </div>
        </div>

        {/* Sélection multiple */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={toggleSelectAll}>
            {allSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-[10px] text-gray-400">{selectedIds.size} sélectionné(s)</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] text-green-600 border-green-200 dark:border-green-800"
                onClick={() => handleConfirmAction('validated', Array.from(selectedIds))}
              >
                <Check className="w-3 h-3 mr-1" /> Valider la sélection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] text-red-600 border-red-200 dark:border-red-800"
                onClick={() => handleConfirmAction('rejected', Array.from(selectedIds))}
              >
                <XCircle className="w-3 h-3 mr-1" /> Rejeter la sélection
              </Button>
            </>
          )}
        </div>

        {/* Élément courant */}
        {currentItem && (
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.has(currentItem.id)}
                  onCheckedChange={() => toggleSelect(currentItem.id)}
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{currentItem.label}</p>
                  {currentItem.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{currentItem.description}</p>
                  )}
                  {currentItem.category && (
                    <Badge variant="secondary" className="text-[9px] mt-1">{currentItem.category}</Badge>
                  )}
                </div>
              </div>
              {currentResult && getStatusBadge(currentResult.status)}
            </div>

            {/* Détails supplémentaires */}
            {currentItem.details && Object.keys(currentItem.details).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                {Object.entries(currentItem.details).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[10px] text-gray-400">{key}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Boutons d'action */}
            {!currentResult && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                  size="sm"
                  className="text-white h-8 text-xs"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                  onClick={() => handleConfirmAction('validated', [currentItem.id])}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valider
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-600 border-red-200 dark:border-red-800"
                  onClick={() => handleConfirmAction('rejected', [currentItem.id])}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-amber-600"
                  onClick={() => handleConfirmAction('skipped', [currentItem.id])}
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" /> Ignorer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> Précédent
          </Button>
          <div className="flex items-center gap-1">
            {items.map((item, i) => {
              const r = results.get(item.id);
              const dotColor = r?.status === 'validated' ? 'bg-green-500' :
                              r?.status === 'rejected' ? 'bg-red-500' :
                              r?.status === 'skipped' ? 'bg-amber-500' :
                              i === currentIndex ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600';
              return (
                <button
                  key={item.id}
                  className={`w-2 h-2 rounded-full ${dotColor} ${i === currentIndex ? 'ring-2 ring-teal-300' : ''}`}
                  onClick={() => goTo(i)}
                />
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === items.length - 1}
          >
            Suivant <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Dialogue de confirmation */}
        <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {confirmDialog?.action === 'validated' ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-500" /> Confirmer la validation</>
                ) : confirmDialog?.action === 'rejected' ? (
                  <><XCircle className="w-5 h-5 text-red-500" /> Confirmer le rejet</>
                ) : (
                  <><SkipForward className="w-5 h-5 text-amber-500" /> Confirmer l'ignorage</>
                )}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog?.ids.length === 1
                  ? `Vous allez ${confirmDialog?.action === 'validated' ? 'valider' : confirmDialog?.action === 'rejected' ? 'rejeter' : 'ignorer'} cet élément.`
                  : `Vous allez ${confirmDialog?.action === 'validated' ? 'valider' : confirmDialog?.action === 'rejected' ? 'rejeter' : 'ignorer'} ${confirmDialog?.ids.length} élément(s).`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input
                placeholder="Commentaire optionnel..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="text-sm"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDialog(null)}>Annuler</Button>
              <Button
                size="sm"
                className="text-white"
                style={{
                  background: confirmDialog?.action === 'validated'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : confirmDialog?.action === 'rejected'
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                }}
                onClick={executeAction}
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
