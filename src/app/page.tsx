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
