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
