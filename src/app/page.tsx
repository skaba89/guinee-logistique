'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { seedAuditTrail } from '@/lib/audit-trail';
import { seedNotifications, seedApprovals } from '@/lib/notifications';
import { seedPrintHistory } from '@/lib/label-advanced';
import { Button } from '@/components/ui/button';
import { useCargoStore } from '@/lib/cargo-store';
import { canViewPage } from '@/lib/permissions';
import LoginPage from '@/components/cargo/login-page';
import DashboardLayout from '@/components/cargo/dashboard-layout';
import DashboardPage from '@/components/cargo/dashboard-page';
import ShipmentsPage from '@/components/cargo/shipments-page';
import TrackingPage from '@/components/cargo/tracking-page';
import ClientsPage from '@/components/cargo/clients-page';
import BillingPage from '@/components/cargo/billing-page';
import FleetPage from '@/components/cargo/fleet-page';
import SettingsPage from '@/components/cargo/settings-page';
import MaritimePage from '@/components/cargo/maritime-page';
import AirFreightPage from '@/components/cargo/air-freight-page';
import GroundTransportPage from '@/components/cargo/ground-transport-page';
import ParcelsPage from '@/components/cargo/parcels-page';
import CustomsPage from '@/components/cargo/customs-page';
import AnalyticsPage from '@/components/cargo/analytics-page';
import WarehousePage from '@/components/cargo/warehouse-page';
import QuotationsPage from '@/components/cargo/quotations-page';
import DocumentsPage from '@/components/cargo/documents-page';
import InsurancePage from '@/components/cargo/insurance-page';
import PartnersPage from '@/components/cargo/partners-page';
import IncotermsPage from '@/components/cargo/incoterms-page';
import ReportsPage from '@/components/cargo/reports-page';
import DriversPage from '@/components/cargo/drivers-page';
import IntegrationsPage from '@/components/cargo/integrations-page';
import ClaimsPage from '@/components/cargo/claims-page';
import MultimodalPage from '@/components/cargo/multimodal-page';
import ContractsPage from '@/components/cargo/contracts-page';
import TasksPage from '@/components/cargo/tasks-page';
import CalendarPage from '@/components/cargo/calendar-page';
import UsersPage from '@/components/cargo/users-page';
import SustainabilityPage from '@/components/cargo/sustainability-page';
import RatesPage from '@/components/cargo/rates-page';
import ChatPage from '@/components/cargo/chat-page';
import ScannerPage from '@/components/cargo/scanner-page';
import CustomerPortalPage from '@/components/cargo/customer-portal-page';
import CreditManagementPage from '@/components/cargo/credit-management-page';
import DangerousGoodsPage from '@/components/cargo/dangerous-goods-page';
import TemperatureControlledPage from '@/components/cargo/temperature-controlled-page';
import CompliancePage from '@/components/cargo/compliance-page';

// ─── Access Denied Page ─────────────────────────────────────────

function AccessDeniedPage() {
  const setPage = useCargoStore((s) => s.setPage);
  const user = useCargoStore((s) => s.user);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Accès refusé
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
          Connecté en tant que <span className="font-semibold">{user?.name || 'Utilisateur'}</span> ({user?.role || '—'}).
          Contactez un administrateur pour obtenir l&apos;accès.
        </p>
        <Button
          onClick={() => setPage('dashboard')}
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Page Renderer with Permission Check ────────────────────────

function PageRenderer() {
  const currentPage = useCargoStore((s) => s.currentPage);
  const roleKey = useCargoStore((s) => s.roleKey);
  const permissionsConfig = useCargoStore((s) => s.permissionsConfig);

  // Check permission — if user can't view this page, show access denied
  if (!canViewPage(currentPage, roleKey, permissionsConfig)) {
    return <AccessDeniedPage />;
  }

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'shipments':
      return <ShipmentsPage />;
    case 'tracking':
      return <TrackingPage />;
    case 'clients':
      return <ClientsPage />;
    case 'billing':
      return <BillingPage />;
    case 'fleet':
      return <FleetPage />;
    case 'settings':
      return <SettingsPage />;
    case 'maritime':
      return <MaritimePage />;
    case 'air-freight':
      return <AirFreightPage />;
    case 'ground-transport':
      return <GroundTransportPage />;
    case 'parcels':
      return <ParcelsPage />;
    case 'customs':
      return <CustomsPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'warehouse':
      return <WarehousePage />;
    case 'quotations':
      return <QuotationsPage />;
    case 'documents':
      return <DocumentsPage />;
    case 'insurance':
      return <InsurancePage />;
    case 'partners':
      return <PartnersPage />;
    case 'incoterms':
      return <IncotermsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'drivers':
      return <DriversPage />;
    case 'integrations':
      return <IntegrationsPage />;
    case 'claims':
      return <ClaimsPage />;
    case 'multimodal':
      return <MultimodalPage />;
    case 'contracts':
      return <ContractsPage />;
    case 'tasks':
      return <TasksPage />;
    case 'calendar':
      return <CalendarPage />;
    case 'users':
      return <UsersPage />;
    case 'sustainability':
      return <SustainabilityPage />;
    case 'rates':
      return <RatesPage />;
    case 'chat':
      return <ChatPage />;
    case 'scanner':
      return <ScannerPage />;
    case 'customer-portal':
      return <CustomerPortalPage />;
    case 'credit-management':
      return <CreditManagementPage />;
    case 'dangerous-goods':
      return <DangerousGoodsPage />;
    case 'temperature-controlled':
      return <TemperatureControlledPage />;
    case 'compliance':
      return <CompliancePage />;
    default:
      return <DashboardPage />;
  }
}

// ─── Main Home Component ────────────────────────────────────────

export default function Home() {
  const isAuthenticated = useCargoStore((s) => s.isAuthenticated);

  useEffect(() => {
    seedAuditTrail();
    seedNotifications();
    seedApprovals();
    seedPrintHistory();
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <PageRenderer />
    </DashboardLayout>
  );
}
