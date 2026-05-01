/**
 * export-buttons.tsx — Boutons d'export Excel/PDF réutilisables pour LogisWay
 *
 * BRANCHEMENT : Importez ExportButtons depuis ce fichier et placez-le
 * où vous voulez dans votre page. Passez les données et colonnes.
 *
 * Exemple :
 *   <ExportButtons
 *     data={filteredShipments}
 *     columns={[
 *       { key: 'trackingNumber', header: 'N° Suivi' },
 *       { key: 'clientName', header: 'Client' },
 *       { key: 'price', header: 'Prix', formatter: (v) => `${v} DA` },
 *     ]}
 *     filename="expeditions"
 *     title="Rapport des Expéditions"
 *   />
 */

'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  exportToExcel,
  exportToPDF,
  exportToCSV,
  type ExportColumn,
} from '@/lib/export-utils';

// ─── Props ──────────────────────────────────────────────────────

export interface ExportButtonsProps {
  /** Données à exporter */
  data: Record<string, unknown>[];
  /** Définition des colonnes */
  columns: ExportColumn[];
  /** Nom du fichier sans extension */
  filename: string;
  /** Titre du rapport (utilisé dans le PDF et l'Excel) */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Taille des boutons */
  size?: 'sm' | 'default';
  /** Variante du bouton */
  variant?: 'outline' | 'default' | 'ghost';
  /** Classe CSS additionnelle */
  className?: string;
  /** Désactiver les boutons */
  disabled?: boolean;
}

// ─── Composant ──────────────────────────────────────────────────

export default function ExportButtons({
  data,
  columns,
  filename,
  title,
  subtitle,
  size = 'sm',
  variant = 'outline',
  className = '',
  disabled = false,
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportExcel = () => {
    setExporting('excel');
    try {
      exportToExcel({
        data,
        columns,
        filename,
        title,
      });
    } catch (error) {
      console.error('Erreur export Excel:', error);
    } finally {
      setTimeout(() => setExporting(null), 500);
    }
  };

  const handleExportPDF = () => {
    setExporting('pdf');
    try {
      exportToPDF({
        title,
        subtitle,
        data,
        columns,
        filename,
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setTimeout(() => setExporting(null), 500);
    }
  };

  const handleExportCSV = () => {
    setExporting('csv');
    try {
      exportToCSV({
        data,
        columns,
        filename,
        title,
      });
    } catch (error) {
      console.error('Erreur export CSV:', error);
    } finally {
      setTimeout(() => setExporting(null), 500);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-1.5 ${className}`}
          disabled={disabled || exporting !== null}
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {exporting === 'excel' ? 'Excel...' : exporting === 'pdf' ? 'PDF...' : exporting === 'csv' ? 'CSV...' : 'Exporter'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel} disabled={data.length === 0}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Exporter en Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={data.length === 0}>
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={data.length === 0}>
          <Download className="w-4 h-4 mr-2 text-blue-500" />
          Exporter en CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
