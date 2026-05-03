/**
 * export-utils.ts — Utilitaires d'export Excel et PDF pour Guinée Logistique
 *
 * DÉPENDANCES : xlsx (SheetJS), jspdf, jspdf-autotable
 *
 * BRANCHEMENT : Importez exportToExcel() ou exportToPDF() depuis n'importe quel
 * composant. Passez vos données et colonnes. Aucune modification du code
 * existant n'est nécessaire.
 *
 * Exemple d'utilisation :
 *   import { exportToExcel, exportToPDF } from '@/lib/export-utils';
 *   exportToExcel({ data: myData, columns: myColumns, filename: 'rapport' });
 *   exportToPDF({ title: 'Mon Rapport', data: myData, columns: myColumns, filename: 'rapport' });
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Types ──────────────────────────────────────────────────────

export interface ExportColumn {
  /** Clé de la donnée (nom de propriété) */
  key: string;
  /** En-tête de colonne lisible */
  header: string;
  /** Largeur optionnelle (pour PDF) */
  width?: number;
  /** Fonction de formatage personnalisée */
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface ExcelExportOptions {
  /** Données à exporter (tableau d'objets) */
  data: Record<string, unknown>[];
  /** Définition des colonnes */
  columns: ExportColumn[];
  /** Nom du fichier sans extension */
  filename: string;
  /** Nom de la feuille Excel */
  sheetName?: string;
  /** Titre optionnel en première ligne */
  title?: string;
}

export interface PDFExportOptions {
  /** Titre du rapport */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Données à exporter */
  data: Record<string, unknown>[];
  /** Définition des colonnes */
  columns: ExportColumn[];
  /** Nom du fichier sans extension */
  filename: string;
  /** Orientation de la page */
  orientation?: 'portrait' | 'landscape';
  /** Format de la page */
  format?: 'a4' | 'a3' | 'letter';
  /** Couleur d'en-tête (hex sans #) */
  headerColor?: string;
}

// ─── Export Excel ───────────────────────────────────────────────

export function exportToExcel(options: ExcelExportOptions): void {
  const { data, columns, filename, sheetName = 'Données', title } = options;

  // Préparer les en-têtes
  const headers = columns.map(col => col.header);

  // Préparer les lignes de données
  const rows = data.map(row =>
    columns.map(col => {
      const raw = row[col.key];
      if (col.formatter) {
        return col.formatter(raw, row);
      }
      return raw ?? '';
    })
  );

  // Créer le worksheet
  const wsData: unknown[][] = [];

  // Ajouter le titre si fourni
  if (title) {
    wsData.push([title]);
    wsData.push([]); // Ligne vide
  }

  // Ajouter la date de génération
  wsData.push([`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`]);
  wsData.push([]);

  // Ajouter en-têtes et données
  wsData.push(headers);
  rows.forEach(row => wsData.push(row));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Largeurs de colonnes automatiques
  const colWidths = columns.map((col, i) => {
    const maxDataLen = Math.max(
      col.header.length,
      ...rows.map(row => String(row[i] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxDataLen + 2, 10), 40) };
  });
  ws['!cols'] = colWidths;

  // Fusion du titre si présent
  if (title) {
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: columns.length - 1 } },
    ];
  }

  // Créer le workbook et télécharger
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Export PDF ─────────────────────────────────────────────────

export function exportToPDF(options: PDFExportOptions): void {
  const {
    title,
    subtitle,
    data,
    columns,
    filename,
    orientation = 'landscape',
    format = 'a4',
    headerColor = '0d9488',
  } = options;

  const doc = new jsPDF({ orientation, unit: 'mm', format });

  // En-tête avec fond coloré
  doc.setFillColor(parseInt(headerColor.slice(0, 2), 16), parseInt(headerColor.slice(2, 4), 16), parseInt(headerColor.slice(4, 6), 16));
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');

  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 14);

  // Sous-titre
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 21);
  }

  // Date de génération
  doc.setFontSize(8);
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    doc.internal.pageSize.getWidth() - 14,
    21,
    { align: 'right' }
  );

  // Tableau de données
  const tableHeaders = columns.map(col => col.header);
  const tableRows = data.map(row =>
    columns.map(col => {
      const raw = row[col.key];
      if (col.formatter) {
        return col.formatter(raw, row);
      }
      return String(raw ?? '');
    })
  );

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 34,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [parseInt(headerColor.slice(0, 2), 16), parseInt(headerColor.slice(2, 4), 16), parseInt(headerColor.slice(4, 6), 16)],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 34, left: 10, right: 10, bottom: 20 },
    // Pied de page
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Guinée Logistique — Page ${data.pageNumber} / ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Export CSV (alternatif léger) ──────────────────────────────

export function exportToCSV(options: Omit<ExcelExportOptions, 'sheetName'>): void {
  const { data, columns, filename, title } = options;

  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const raw = row[col.key];
      if (col.formatter) {
        return col.formatter(raw, row);
      }
      return String(raw ?? '');
    })
  );

  const lines: string[] = [];
  if (title) {
    lines.push(title);
    lines.push('');
  }
  lines.push(`Généré le ${new Date().toLocaleDateString('fr-FR')}`);
  lines.push('');
  lines.push(headers.join(';'));
  rows.forEach(row => {
    lines.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'));
  });

  const csv = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
