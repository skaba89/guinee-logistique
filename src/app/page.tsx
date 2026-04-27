'use client';

import React from 'react';
import { useCargoStore } from '@/lib/cargo-store';
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

function PageRenderer() {
  const currentPage = useCargoStore((s) => s.currentPage);

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
    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  const isAuthenticated = useCargoStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <PageRenderer />
    </DashboardLayout>
  );
}
