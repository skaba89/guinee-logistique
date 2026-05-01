/**
 * feature-bridge.ts — Point de branchement central pour les nouvelles fonctionnalités LogisWay
 *
 * Ce fichier exporte tout ce dont vous avez besoin pour activer les nouvelles
 * fonctionnalités dans votre application. Suivez les instructions ci-dessous
 * pour chaque fonctionnalité que vous souhaitez activer.
 *
 * RÈGLE : Ne modifiez aucun fichier existant. Ajoutez uniquement les imports
 * et les lignes indiquées dans les diffs ci-dessous.
 */

// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 1 : Tableau Analytique / KPIs
// ═══════════════════════════════════════════════════════════════════
//
// Fichier : src/components/cargo/analytics-dashboard-page.tsx (DÉJÀ CRÉÉ)
// Hook   : src/hooks/use-analytics-data.ts (DÉJÀ CRÉÉ)
//
// Pour l'ajouter au routeur SPA, ajoutez dans src/app/page.tsx :
//
//   1. Import :
//      import AnalyticsDashboardPage from '@/components/cargo/analytics-dashboard-page';
//
//   2. Dans le switch (après le case 'analytics' existant) :
//      case 'analytics-kpi':
//        return <AnalyticsDashboardPage />;
//
//   3. Ajoutez 'analytics-kpi' dans le type PageType de src/lib/cargo-store.ts :
//      export type PageType = ... | 'analytics-kpi';
//
//   4. (Optionnel) Ajoutez le module dans src/lib/module-config.ts :
//      {
//        id: 'analytics-kpi',
//        label: 'Analytique KPIs',
//        icon: 'BarChart3',
//        group: 'gestion',
//        order: 5,
//        enabled: true,
//        premium: false,
//        description: 'Tableau analytique avancé avec KPIs, classements et filtres',
//        defaultPermissions: { admin: 'write', manager: 'write', agent: 'read', viewer: 'read', client: 'none' },
//      },

export { default as AnalyticsDashboardPage } from '@/components/cargo/analytics-dashboard-page';
export { useAnalyticsData } from '@/hooks/use-analytics-data';


// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 2 : Export Excel / PDF
// ═══════════════════════════════════════════════════════════════════
//
// Composant : src/components/cargo/export-buttons.tsx (DÉJÀ CRÉÉ)
// Utilitaire : src/lib/export-utils.ts (DÉJÀ CRÉÉ)
//
// Pour ajouter des boutons d'export sur une page existante :
//
//   import ExportButtons from '@/components/cargo/export-buttons';
//
//   <ExportButtons
//     data={myData}
//     columns={[
//       { key: 'trackingNumber', header: 'N° Suivi' },
//       { key: 'clientName', header: 'Client' },
//       { key: 'price', header: 'Prix', formatter: (v) => `${v} DA` },
//     ]}
//     filename="mon-rapport"
//     title="Mon Rapport"
//   />

export { default as ExportButtons } from '@/components/cargo/export-buttons';
export { exportToExcel, exportToPDF, exportToCSV } from '@/lib/export-utils';
export type { ExportColumn, ExcelExportOptions, PDFExportOptions } from '@/lib/export-utils';


// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 3 : Filtres de Recherche Avancés
// ═══════════════════════════════════════════════════════════════════
//
// Composant : src/components/cargo/advanced-filters.tsx (DÉJÉ CRÉÉ)
// Hook      : src/hooks/use-filters.ts (DÉJÉ CRÉÉ)
//
// Pour ajouter les filtres sur une page existante :
//
//   import AdvancedFilters from '@/components/cargo/advanced-filters';
//   import { applyFiltersToArray, type FilterState } from '@/hooks/use-filters';
//
//   const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
//
//   const filteredData = useMemo(() => {
//     if (!activeFilters) return myData;
//     return applyFiltersToArray(myData, activeFilters, {
//       dateField: 'dateCreation',
//       categoryField: 'type',
//     });
//   }, [myData, activeFilters]);
//
//   <AdvancedFilters
//     onFiltersChange={setActiveFilters}
//     availableOrigins={['Alger', 'Paris']}
//     availableClients={['Client 1', 'Client 2']}
//   />

export { default as AdvancedFilters } from '@/components/cargo/advanced-filters';
export { useFilters, applyFiltersToArray } from '@/hooks/use-filters';
export type { FilterState, QuickPeriod, UseFiltersReturn } from '@/hooks/use-filters';


// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 4 : Module de Contrôle / Validation
// ═══════════════════════════════════════════════════════════════════
//
// Composant : src/components/cargo/validation-module.tsx (DÉJÉ CRÉÉ)
// Moteur    : src/lib/validation-engine.ts (DÉJÉ CRÉÉ)
//
// Pour utiliser le module de validation :
//
//   import ValidationModule from '@/components/cargo/validation-module';
//   import type { ValidatableItem } from '@/lib/validation-engine';
//
//   const items: ValidatableItem[] = myShipments.map(s => ({
//     id: s.id,
//     label: s.trackingNumber,
//     description: `${s.origin} → ${s.destination}`,
//     category: s.type,
//     details: { Client: s.clientName, Poids: `${s.weight} kg`, Prix: `${s.price} DA` },
//   }));
//
//   <ValidationModule items={items} title="Contrôle des expéditions" userName={user?.name} />
//
// Pour l'ajouter comme page dans le routeur, même principe que la fonctionnalité 1.

export { default as ValidationModule } from '@/components/cargo/validation-module';
export type { ValidatableItem, ValidationStats } from '@/lib/validation-engine';


// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 5 : Messagerie / Notifications enrichies
// ═══════════════════════════════════════════════════════════════════
//
// Page      : src/components/cargo/messaging-page.tsx (DÉJÉ CRÉÉ)
// Système   : src/lib/messaging-system.ts (DÉJÉ CRÉÉ)
//
// Pour l'ajouter au routeur SPA :
//
//   1. Import :
//      import MessagingPage from '@/components/cargo/messaging-page';
//
//   2. Dans le switch :
//      case 'messaging':
//        return <MessagingPage />;
//
//   3. Ajoutez 'messaging' dans le type PageType
//
//   OU : remplacez le case 'chat' existant par MessagingPage
//
// Pour accéder au système de messagerie depuis le code :
//
//   import { sendMessage, getUnreadMessageCount } from '@/lib/messaging-system';

export { default as MessagingPage } from '@/components/cargo/messaging-page';
export { sendMessage, getConversationsForUser, getUnreadMessageCount } from '@/lib/messaging-system';


// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 6 : Thème Dark / Light
// ═══════════════════════════════════════════════════════════════════
//
// Composant : src/components/cargo/theme-switcher.tsx (DÉJÉ CRÉÉ)
//
// next-themes est DÉJÀ installé et configuré dans layout.tsx !
//
// Pour ajouter le switcher dans le header :
//
//   import ThemeSwitcher from '@/components/cargo/theme-switcher';
//
//   // Dans votre header (dashboard-layout.tsx), ajoutez :
//   <ThemeSwitcher />
//
//   Placez-le à côté du sélecteur de devise ou du dropdown utilisateur.

export { default as ThemeSwitcher } from '@/components/cargo/theme-switcher';


// ═══════════════════════════════════════════════════════════════════
// FONCTIONNALITÉ 7 : Sécurité par Code PIN
// ═══════════════════════════════════════════════════════════════════
//
// Wrapper  : src/components/cargo/pin-guard.tsx (DÉJÉ CRÉÉ)
// Auth     : src/lib/pin-auth.ts (DÉJÉ CRÉÉ)
//
// Pour protéger une page ou section sensible :
//
//   import PinGuard from '@/components/cargo/pin-guard';
//
//   <PinGuard pin="1234" timeout={120}>
//     <MySensitivePage />
//   </PinGuard>
//
// Le PIN par défaut est "1234". Changez-le en production via
// une variable d'environnement.
//
// Pour protéger une page entière dans le routeur :
//
//   case 'settings':
//     return (
//       <PinGuard pin="1234" timeout={120} title="Accès Paramètres">
//         <SettingsPage />
//       </PinGuard>
//     );

export { default as PinGuard } from '@/components/cargo/pin-guard';
export { authenticateWithPin, isPinSessionActive, clearPinSession } from '@/lib/pin-auth';
