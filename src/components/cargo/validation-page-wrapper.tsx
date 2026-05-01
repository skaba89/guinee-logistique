'use client';

/**
 * validation-page-wrapper.tsx — Wrapper pour le module de validation en tant que page
 *
 * Ce composant transforme le ValidationModule (qui requiert des items en props)
 * en une page autonome qui charge les données des expéditions depuis test-data.
 */

import React, { useMemo } from 'react';
import ValidationModule from '@/components/cargo/validation-module';
import type { ValidatableItem } from '@/lib/validation-engine';
import { shipments, containers, customsDeclarations, invoices } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

export default function ValidationPageWrapper() {
  const user = useCargoStore((s) => s.user);

  const items: ValidatableItem[] = useMemo(() => {
    const allItems: ValidatableItem[] = [];

    // Expéditions
    shipments.forEach((s) => {
      allItems.push({
        id: `shipment-${s.id}`,
        label: s.trackingNumber,
        description: `${s.origin} → ${s.destination}`,
        category: `Expédition ${s.type === 'aerien' ? 'Aérien' : s.type === 'maritime' ? 'Maritime' : 'Terrestre'}`,
        details: {
          Client: s.clientName,
          Poids: `${s.weight} kg`,
          Statut: s.status.replace(/_/g, ' '),
          'Date création': s.dateCreation,
        },
      });
    });

    // Conteneurs
    containers.forEach((c) => {
      allItems.push({
        id: `container-${c.id}`,
        label: c.containerNumber,
        description: `${c.portOfLoading} → ${c.portOfDischarge}`,
        category: 'Conteneur Maritime',
        details: {
          Client: c.clientName,
          Type: c.type,
          Navire: c.vesselName || '—',
          BL: c.blNumber || '—',
        },
      });
    });

    // Déclarations douanières
    customsDeclarations.forEach((d) => {
      allItems.push({
        id: `customs-${d.id}`,
        label: d.declarationNumber,
        description: `${d.originCountry} → ${d.destinationCountry}`,
        category: 'Déclaration Douanière',
        details: {
          Client: d.clientName,
          'Code HS': d.hsCode,
          Marchandise: d.goodsDescription,
          Statut: d.status,
        },
      });
    });

    // Factures
    invoices.forEach((inv) => {
      allItems.push({
        id: `invoice-${inv.id}`,
        label: inv.invoiceNumber,
        description: `Facture — ${inv.clientName}`,
        category: 'Facturation',
        details: {
          Client: inv.clientName,
          Montant: `${inv.amount.toLocaleString('fr-FR')} DA`,
          Statut: inv.status.replace(/_/g, ' '),
          Échéance: inv.dateEcheance,
        },
      });
    });

    return allItems;
  }, []);

  return (
    <ValidationModule
      items={items}
      title="Contrôle & Validation des Opérations"
      userName={user?.name || 'Utilisateur'}
    />
  );
}
