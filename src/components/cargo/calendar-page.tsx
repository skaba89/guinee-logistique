'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Ship,
  Plane,
  Truck,
  Package,
  FileCheck,
  Receipt,
  FileSignature,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { containers, flights, routes, invoices, parcels, shipments } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

// ─── Types ───────────────────────────────────────────────────────────
type EventCategory =
  | 'maritime_departure'
  | 'maritime_arrival'
  | 'air_departure'
  | 'air_arrival'
  | 'ground_departure'
  | 'ground_arrival'
  | 'parcel_delivery'
  | 'customs_deadline'
  | 'invoice_due'
  | 'contract_expiry'
  | 'task_due';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: EventCategory;
  title: string;
  description: string;
  entityRef: string;
  clientName: string;
  status: 'pending' | 'confirmed' | 'completed' | 'overdue' | 'urgent';
}

// ─── Category config ─────────────────────────────────────────────────
const categoryConfig: Record<EventCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  dotColor: string;
}> = {
  maritime_departure: {
    label: 'Départ maritime',
    icon: Ship,
    color: '#0d9488',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-900/20',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-400',
    dotColor: 'bg-teal-500',
  },
  maritime_arrival: {
    label: 'Arrivée maritime',
    icon: Ship,
    color: '#0d9488',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-900/20',
    textLight: 'text-teal-600',
    textDark: 'dark:text-teal-300',
    dotColor: 'bg-teal-400',
  },
  air_departure: {
    label: 'Départ aérien',
    icon: Plane,
    color: '#0ea5e9',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-900/20',
    textLight: 'text-sky-700',
    textDark: 'dark:text-sky-400',
    dotColor: 'bg-sky-500',
  },
  air_arrival: {
    label: 'Arrivée aérienne',
    icon: Plane,
    color: '#0ea5e9',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-900/20',
    textLight: 'text-sky-600',
    textDark: 'dark:text-sky-300',
    dotColor: 'bg-sky-400',
  },
  ground_departure: {
    label: 'Départ terrestre',
    icon: Truck,
    color: '#f59e0b',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  ground_arrival: {
    label: 'Arrivée terrestre',
    icon: Truck,
    color: '#f59e0b',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    textLight: 'text-amber-600',
    textDark: 'dark:text-amber-300',
    dotColor: 'bg-amber-400',
  },
  parcel_delivery: {
    label: 'Livraison colis',
    icon: Package,
    color: '#8b5cf6',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/20',
    textLight: 'text-violet-700',
    textDark: 'dark:text-violet-400',
    dotColor: 'bg-violet-500',
  },
  customs_deadline: {
    label: 'Échéance douanière',
    icon: FileCheck,
    color: '#a855f7',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-900/20',
    textLight: 'text-purple-700',
    textDark: 'dark:text-purple-400',
    dotColor: 'bg-purple-500',
  },
  invoice_due: {
    label: 'Échéance facture',
    icon: Receipt,
    color: '#ef4444',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-900/20',
    textLight: 'text-red-700',
    textDark: 'dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  contract_expiry: {
    label: 'Expiration contrat',
    icon: FileSignature,
    color: '#f97316',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-900/20',
    textLight: 'text-orange-700',
    textDark: 'dark:text-orange-400',
    dotColor: 'bg-orange-500',
  },
  task_due: {
    label: 'Tâche due',
    icon: Clock,
    color: '#6b7280',
    bgLight: 'bg-gray-50',
    bgDark: 'dark:bg-gray-800/40',
    textLight: 'text-gray-700',
    textDark: 'dark:text-gray-400',
    dotColor: 'bg-gray-500',
  },
};

// ─── Filter group labels ────────────────────────────────────────────
const filterGroups: { key: string; label: string; categories: EventCategory[] }[] = [
  { key: 'maritime', label: '🚢 Maritime', categories: ['maritime_departure', 'maritime_arrival'] },
  { key: 'air', label: '✈️ Aérien', categories: ['air_departure', 'air_arrival'] },
  { key: 'ground', label: '🚛 Terrestre', categories: ['ground_departure', 'ground_arrival'] },
  { key: 'parcel', label: '📦 Colis', categories: ['parcel_delivery'] },
  { key: 'customs', label: '📋 Douanes', categories: ['customs_deadline'] },
  { key: 'invoice', label: '💰 Factures', categories: ['invoice_due'] },
  { key: 'contract', label: '⚠️ Contrats', categories: ['contract_expiry'] },
  { key: 'task', label: '📝 Tâches', categories: ['task_due'] },
];

// ─── Generate calendar events ───────────────────────────────────────
function generateEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let counter = 0;
  const nextId = () => `evt-${++counter}`;

  // Container ETAs → maritime arrival events
  containers.forEach((c) => {
    if (c.eta) {
      const etaDate = new Date(c.eta);
      if (etaDate.getMonth() === 3 || etaDate.getMonth() === 4) {
        events.push({
          id: nextId(),
          date: c.eta,
          time: '08:00',
          category: 'maritime_arrival',
          title: `Arrivée conteneur ${c.containerNumber}`,
          description: `${c.vesselName} — ${c.portOfLoading} → ${c.portOfDischarge}`,
          entityRef: c.containerNumber,
          clientName: c.clientName,
          status: c.status === 'in_transit' ? 'pending' : c.status === 'at_port' ? 'confirmed' : 'completed',
        });
      }
    }
    // Departure events (1 day before for loaded/in_transit)
    if (c.eta && c.portOfLoading) {
      const etaDate = new Date(c.eta);
      if (etaDate.getMonth() === 3 || etaDate.getMonth() === 4) {
        const depDate = new Date(etaDate);
        depDate.setDate(depDate.getDate() - 14);
        if (depDate.getMonth() === 3 || depDate.getMonth() === 4) {
          events.push({
            id: nextId(),
            date: depDate.toISOString().split('T')[0],
            time: '06:00',
            category: 'maritime_departure',
            title: `Départ conteneur ${c.containerNumber}`,
            description: `${c.vesselName} — Départ de ${c.portOfLoading}`,
            entityRef: c.containerNumber,
            clientName: c.clientName,
            status: c.status === 'in_transit' ? 'confirmed' : 'completed',
          });
        }
      }
    }
  });

  // Flight departures/arrivals → air events
  // Generate April/May flights from existing data
  const aprilFlights = [
    { fn: 'AH-2201', airline: 'Air Algérie', origin: 'Alger', dest: 'Marseille', dep: '2026-04-02T08:30:00', arr: '2026-04-02T11:00:00', client: 'Entreprise Bouzidi & Fils', status: 'confirmed' as const },
    { fn: 'EK-758', airline: 'Emirates', origin: 'Dubaï', dest: 'Alger', dep: '2026-04-05T03:30:00', arr: '2026-04-05T07:45:00', client: 'Sarl MédiaCom', status: 'pending' as const },
    { fn: 'TK-652', airline: 'Turkish Airlines', origin: 'Istanbul', dest: 'Casablanca', dep: '2026-04-08T09:15:00', arr: '2026-04-08T12:00:00', client: 'Nadia Benmoussa', status: 'confirmed' as const },
    { fn: 'AF-1855', airline: 'Air France', origin: 'Paris', dest: 'Alger', dep: '2026-04-10T10:20:00', arr: '2026-04-10T12:30:00', client: 'Sarl TechnoPlus', status: 'pending' as const },
    { fn: 'SV-342', airline: 'Saudia', origin: 'Djeddah', dest: 'Alger', dep: '2026-04-12T12:00:00', arr: '2026-04-12T15:30:00', client: 'SPA HydroServices', status: 'confirmed' as const },
    { fn: 'AH-1081', airline: 'Air Algérie', origin: 'Alger', dest: 'Dubaï', dep: '2026-04-15T22:00:00', arr: '2026-04-16T06:30:00', client: 'Sarl MédiaCom', status: 'pending' as const },
    { fn: 'QR-140', airline: 'Qatar Airways', origin: 'Doha', dest: 'Alger', dep: '2026-04-18T04:00:00', arr: '2026-04-18T08:15:00', client: 'EURL BatiPlus', status: 'pending' as const },
    { fn: 'LH-1125', airline: 'Lufthansa', origin: 'Francfort', dest: 'Alger', dep: '2026-04-20T07:45:00', arr: '2026-04-20T10:30:00', client: 'Mohamed Amrani', status: 'confirmed' as const },
    { fn: 'AH-2202', airline: 'Air Algérie', origin: 'Alger', dest: 'Paris', dep: '2026-04-22T08:30:00', arr: '2026-04-22T11:45:00', client: 'Entreprise Bouzidi & Fils', status: 'pending' as const },
    { fn: 'AC-871', airline: 'Air Canada', origin: 'Montréal', dest: 'Alger', dep: '2026-04-25T16:00:00', arr: '2026-04-26T05:45:00', client: 'Amina Zeroual', status: 'pending' as const },
    { fn: 'AH-2203', airline: 'Air Algérie', origin: 'Alger', dest: 'Marseille', dep: '2026-04-28T14:00:00', arr: '2026-04-28T16:30:00', client: 'SPA TextilMaghreb', status: 'pending' as const },
    { fn: 'EK-759', airline: 'Emirates', origin: 'Dubaï', dest: 'Alger', dep: '2026-05-03T03:30:00', arr: '2026-05-03T07:45:00', client: 'Sarl MédiaCom', status: 'pending' as const },
    { fn: 'AH-2204', airline: 'Air Algérie', origin: 'Alger', dest: 'Istanbul', dep: '2026-05-08T09:00:00', arr: '2026-05-08T13:30:00', client: 'Karim Djebbar', status: 'pending' as const },
  ];

  aprilFlights.forEach((fl) => {
    const depDateStr = fl.dep.split('T')[0];
    const depTime = fl.dep.split('T')[1].substring(0, 5);
    events.push({
      id: nextId(),
      date: depDateStr,
      time: depTime,
      category: 'air_departure',
      title: `Départ vol ${fl.fn}`,
      description: `${fl.airline} — ${fl.origin} → ${fl.dest}`,
      entityRef: fl.fn,
      clientName: fl.client,
      status: fl.status,
    });
    const arrDateStr = fl.arr.split('T')[0];
    const arrTime = fl.arr.split('T')[1].substring(0, 5);
    events.push({
      id: nextId(),
      date: arrDateStr,
      time: arrTime,
      category: 'air_arrival',
      title: `Arrivée vol ${fl.fn}`,
      description: `${fl.airline} — ${fl.origin} → ${fl.dest}`,
      entityRef: fl.fn,
      clientName: fl.client,
      status: fl.status,
    });
  });

  // Ground transport routes → April/May events
  const aprilRoutes = [
    { rn: 'RT-2026-011', origin: 'Alger', dest: 'Oran', dep: '2026-04-03T06:00:00', arr: '2026-04-03T14:00:00', client: 'EURL BatiPlus', cargo: 'Matériaux de construction', status: 'confirmed' as const },
    { rn: 'RT-2026-012', origin: 'Casablanca', dest: 'Alger', dep: '2026-04-07T05:00:00', arr: '2026-04-08T18:00:00', client: 'Karim Djebbar', cargo: 'Électroménager', status: 'confirmed' as const },
    { rn: 'RT-2026-013', origin: 'Tunis', dest: 'Alger', dep: '2026-04-11T06:00:00', arr: '2026-04-11T20:00:00', client: 'Sarl TechnoPlus', cargo: 'Matériel informatique', status: 'pending' as const },
    { rn: 'RT-2026-014', origin: 'Alger', dest: 'Annaba', dep: '2026-04-14T05:00:00', arr: '2026-04-14T15:00:00', client: 'Sarl AgriPro', cargo: 'Produits agricoles', status: 'pending' as const },
    { rn: 'RT-2026-015', origin: 'Barcelone', dest: 'Milan', dep: '2026-04-17T06:00:00', arr: '2026-04-17T19:00:00', client: 'SPA HydroServices', cargo: 'Équipements industriels', status: 'pending' as const },
    { rn: 'RT-2026-016', origin: 'Alger', dest: 'Constantine', dep: '2026-04-21T06:00:00', arr: '2026-04-21T12:00:00', client: 'Amina Zeroual', cargo: 'Textiles', status: 'pending' as const },
    { rn: 'RT-2026-017', origin: 'Casablanca', dest: 'Dakar', dep: '2026-04-24T05:00:00', arr: '2026-04-27T18:00:00', client: 'Mohamed Amrani', cargo: 'Produits alimentaires', status: 'pending' as const },
    { rn: 'RT-2026-018', origin: 'Alger', dest: 'Sétif', dep: '2026-04-28T07:00:00', arr: '2026-04-28T12:00:00', client: 'Karim Djebbar', cargo: 'Mobilier', status: 'pending' as const },
    { rn: 'RT-2026-019', origin: 'Alger', dest: 'Béjaïa', dep: '2026-05-02T06:00:00', arr: '2026-05-02T10:00:00', client: 'EURL BatiPlus', cargo: 'Ciment', status: 'pending' as const },
    { rn: 'RT-2026-020', origin: 'Oran', dest: 'Tlemcen', dep: '2026-05-06T07:00:00', arr: '2026-05-06T10:00:00', client: 'Sarl ElectroDZ', cargo: 'Électronique', status: 'pending' as const },
  ];

  aprilRoutes.forEach((rt) => {
    const depDateStr = rt.dep.split('T')[0];
    const depTime = rt.dep.split('T')[1].substring(0, 5);
    events.push({
      id: nextId(),
      date: depDateStr,
      time: depTime,
      category: 'ground_departure',
      title: `Départ route ${rt.rn}`,
      description: `${rt.origin} → ${rt.dest} — ${rt.cargo}`,
      entityRef: rt.rn,
      clientName: rt.client,
      status: rt.status,
    });
    const arrDateStr = rt.arr.split('T')[0];
    const arrTime = rt.arr.split('T')[1].substring(0, 5);
    events.push({
      id: nextId(),
      date: arrDateStr,
      time: arrTime,
      category: 'ground_arrival',
      title: `Arrivée route ${rt.rn}`,
      description: `${rt.origin} → ${rt.dest} — ${rt.cargo}`,
      entityRef: rt.rn,
      clientName: rt.client,
      status: rt.status,
    });
  });

  // Parcel deliveries
  const aprilParcels = [
    { tn: 'PC-FP-2026-0011', client: 'Sarl TechnoPlus', dest: 'Paris', ed: '2026-04-03', status: 'pending' as const },
    { tn: 'PC-FP-2026-0012', client: 'EURL BatiPlus', dest: 'Marseille', ed: '2026-04-08', status: 'pending' as const },
    { tn: 'PC-FP-2026-0013', client: 'SPA HydroServices', dest: 'Djeddah', ed: '2026-04-12', status: 'pending' as const },
    { tn: 'PC-FP-2026-0014', client: 'Nadia Benmoussa', dest: 'Istanbul', ed: '2026-04-15', status: 'pending' as const },
    { tn: 'PC-FP-2026-0015', client: 'Karim Djebbar', dest: 'Casablanca', ed: '2026-04-18', status: 'pending' as const },
    { tn: 'PC-FP-2026-0016', client: 'Amina Zeroual', dest: 'New York', ed: '2026-04-22', status: 'pending' as const },
    { tn: 'PC-FP-2026-0017', client: 'Mohamed Amrani', dest: 'Dakar', ed: '2026-04-25', status: 'pending' as const },
    { tn: 'PC-FP-2026-0018', client: 'Sarl MédiaCom', dest: 'Dubaï', ed: '2026-04-28', status: 'pending' as const },
    { tn: 'PC-FP-2026-0019', client: 'Sarl AgriPro', dest: 'Abidjan', ed: '2026-05-02', status: 'pending' as const },
    { tn: 'PC-FP-2026-0020', client: 'SPA TextilMaghreb', dest: 'Milan', ed: '2026-05-06', status: 'pending' as const },
  ];

  aprilParcels.forEach((pc) => {
    events.push({
      id: nextId(),
      date: pc.ed,
      time: '14:00',
      category: 'parcel_delivery',
      title: `Livraison colis ${pc.tn}`,
      description: `Destination: ${pc.dest}`,
      entityRef: pc.tn,
      clientName: pc.client,
      status: pc.status,
    });
  });

  // Invoice due dates
  invoices.forEach((inv) => {
    const dueDate = new Date(inv.dateEcheance);
    if (dueDate.getMonth() === 3 || dueDate.getMonth() === 4) {
      events.push({
        id: nextId(),
        date: inv.dateEcheance,
        time: '23:59',
        category: 'invoice_due',
        title: `Échéance facture ${inv.invoiceNumber}`,
        description: `Montant: ${(inv.amount / 1000).toFixed(0)}K DZD — ${inv.clientName}`,
        entityRef: inv.invoiceNumber,
        clientName: inv.clientName,
        status: inv.status === 'en_retard' ? 'overdue' : inv.status === 'payee' ? 'completed' : 'pending',
      });
    }
  });

  // Customs deadlines
  const customsDeadlines = [
    { dn: 'DOU-2026-010', client: 'Entreprise Bouzidi & Fils', date: '2026-04-03', desc: 'Déclaration import conteneur MSKU-7234561' },
    { dn: 'DOU-2026-011', client: 'SPA HydroServices', date: '2026-04-08', desc: 'Déclaration import équipements Hambourg' },
    { dn: 'DOU-2026-012', client: 'EURL BatiPlus', date: '2026-04-12', desc: 'Déclaration export matériaux Alger→Marseille' },
    { dn: 'DOU-2026-013', client: 'Sarl TechnoPlus', date: '2026-04-16', desc: 'Déclaration import matériel informatique' },
    { dn: 'DOU-2026-014', client: 'Karim Djebbar', date: '2026-04-20', desc: 'Déclaration transit électroménager Casablanca' },
    { dn: 'DOU-2026-015', client: 'SPA TextilMaghreb', date: '2026-04-24', desc: 'Déclaration export textiles Alger→Milan' },
    { dn: 'DOU-2026-016', client: 'Sarl MédiaCom', date: '2026-04-28', desc: 'Déclaration import matériel audiovisuel Dubaï' },
    { dn: 'DOU-2026-017', client: 'Amina Zeroual', date: '2026-05-02', desc: 'Déclaration import pièces New York' },
    { dn: 'DOU-2026-018', client: 'Mohamed Amrani', date: '2026-05-06', desc: 'Déclaration transit produits alimentaires' },
  ];

  customsDeadlines.forEach((cd) => {
    events.push({
      id: nextId(),
      date: cd.date,
      time: '17:00',
      category: 'customs_deadline',
      title: `Échéance douane ${cd.dn}`,
      description: cd.desc,
      entityRef: cd.dn,
      clientName: cd.client,
      status: 'pending',
    });
  });

  // Contract expirations
  const contractExpirations = [
    { ref: 'CTR-2024-HYDRO', client: 'SPA HydroServices', date: '2026-04-10', desc: 'Contrat de transport annuel' },
    { ref: 'CTR-2024-BOUZIDI', client: 'Entreprise Bouzidi & Fils', date: '2026-04-18', desc: 'Contrat maritime régulier' },
    { ref: 'CTR-2025-TECHNO', client: 'Sarl TechnoPlus', date: '2026-04-25', desc: 'Contrat fret aérien' },
    { ref: 'CTR-2025-BATI', client: 'EURL BatiPlus', date: '2026-05-05', desc: 'Contrat logistique intégré' },
    { ref: 'CTR-2025-MEDIA', client: 'Sarl MédiaCom', date: '2026-05-12', desc: 'Contrat express international' },
    { ref: 'CTR-2024-AGRI', client: 'Sarl AgriPro', date: '2026-05-15', desc: 'Contrat transport température contrôlée' },
  ];

  contractExpirations.forEach((ce) => {
    events.push({
      id: nextId(),
      date: ce.date,
      time: '23:59',
      category: 'contract_expiry',
      title: `Expiration contrat ${ce.ref}`,
      description: ce.desc,
      entityRef: ce.ref,
      clientName: ce.client,
      status: 'urgent',
    });
  });

  // Task deadlines
  const taskDeadlines = [
    { ref: 'TSK-001', client: '-', date: '2026-04-01', desc: 'Mise à jour tarifs Q2 2026', time: '09:00' },
    { ref: 'TSK-002', client: '-', date: '2026-04-05', desc: 'Audit conformité douanière', time: '10:00' },
    { ref: 'TSK-003', client: '-', date: '2026-04-10', desc: 'Renouvellement assurance flotte', time: '11:00' },
    { ref: 'TSK-004', client: '-', date: '2026-04-14', desc: 'Formation équipe nouvelles procédures', time: '08:30' },
    { ref: 'TSK-005', client: '-', date: '2026-04-18', desc: 'Inventaire entrepôt Alger', time: '07:00' },
    { ref: 'TSK-006', client: '-', date: '2026-04-22', desc: 'Rapport mensuel performance', time: '16:00' },
    { ref: 'TSK-007', client: '-', date: '2026-04-28', desc: 'Révision contrats partenaires', time: '14:00' },
    { ref: 'TSK-008', client: '-', date: '2026-05-01', desc: 'Planification capacité mai', time: '09:00' },
    { ref: 'TSK-009', client: '-', date: '2026-05-05', desc: 'Inspection véhicules trimestrielle', time: '08:00' },
    { ref: 'TSK-010', client: '-', date: '2026-05-10', desc: 'Mise à jour système informatique', time: '22:00' },
  ];

  taskDeadlines.forEach((td) => {
    events.push({
      id: nextId(),
      date: td.date,
      time: td.time,
      category: 'task_due',
      title: `Tâche: ${td.desc}`,
      description: td.desc,
      entityRef: td.ref,
      clientName: td.client,
      status: 'pending',
    });
  });

  return events;
}

const allEvents = generateEvents();

// ─── Helpers ─────────────────────────────────────────────────────────
const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const FRENCH_DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FRENCH_DAYS_MINI = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
  return day === 0 ? 6 : day - 1;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  return dateStr === formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDZDShort(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
}

// ─── Component ───────────────────────────────────────────────────────
export default function CalendarPage() {
  const setPage = useCargoStore((s) => s.setPage);

  // Current view month/year (April 2026 default)
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(3); // 0-indexed, 3 = April

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(filterGroups.map((g) => g.key)));

  // Filtered events
  const filteredEvents = useMemo(() => {
    const activeCats = new Set<EventCategory>();
    filterGroups.forEach((g) => {
      if (activeFilters.has(g.key)) {
        g.categories.forEach((c) => activeCats.add(c));
      }
    });
    return allEvents.filter((e) => activeCats.has(e.category));
  }, [activeFilters]);

  // Events for the visible month
  const monthEvents = useMemo(() => {
    return filteredEvents.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
  }, [filteredEvents, viewYear, viewMonth]);

  // Events for selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter((e) => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredEvents, selectedDate]);

  // Map: date → events for calendar dots
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    monthEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [monthEvents]);

  // ─── KPI calculations ────────────────────────────────────────────
  const todayStr = formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const todayEvents = filteredEvents.filter((e) => e.date === todayStr);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEvents = filteredEvents.filter((e) => {
    const d = new Date(e.date);
    return d >= weekStart && d <= weekEnd;
  });

  const upcomingDepartures = filteredEvents.filter(
    (e) =>
      (e.category === 'maritime_departure' || e.category === 'air_departure' || e.category === 'ground_departure') &&
      getDaysUntil(e.date) >= 0 &&
      getDaysUntil(e.date) <= 7
  );

  const expectedArrivals = filteredEvents.filter(
    (e) =>
      (e.category === 'maritime_arrival' || e.category === 'air_arrival' || e.category === 'ground_arrival') &&
      getDaysUntil(e.date) >= 0 &&
      getDaysUntil(e.date) <= 7
  );

  // ─── Timeline events (next 7 days) ──────────────────────────────
  const timelineDays = useMemo(() => {
    const days: { date: string; label: string; dayNum: number; events: CalendarEvent[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
      const dayLabel = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : FRENCH_DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1] + ' ' + d.getDate();
      days.push({
        date: dateStr,
        label: dayLabel,
        dayNum: d.getDate(),
        events: filteredEvents.filter((e) => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time)),
      });
    }
    return days;
  }, [filteredEvents]);

  // ─── Deadline alerts ─────────────────────────────────────────────
  const deadlineAlerts = useMemo(() => {
    const alerts: (CalendarEvent & { daysUntil: number })[] = [];
    filteredEvents.forEach((e) => {
      if (
        e.category === 'customs_deadline' ||
        e.category === 'invoice_due' ||
        e.category === 'contract_expiry' ||
        e.category === 'task_due'
      ) {
        const days = getDaysUntil(e.date);
        if (days <= 7) {
          alerts.push({ ...e, daysUntil: days });
        }
      }
    });
    return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [filteredEvents]);

  // ─── Navigation ──────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(formatDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  // Toggle filter
  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ─── Calendar grid ───────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfMonth(viewYear, viewMonth);
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  // Prev month trailing days
  const prevMonthDays = getDaysInMonth(viewMonth === 0 ? viewYear - 1 : viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  // ─── Status badge helper ─────────────────────────────────────────
  const statusBadge = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 px-1.5 py-0">Terminé</Badge>;
      case 'confirmed':
        return <Badge className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0 px-1.5 py-0">Confirmé</Badge>;
      case 'pending':
        return <Badge className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 px-1.5 py-0">En attente</Badge>;
      case 'overdue':
        return <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 px-1.5 py-0">En retard</Badge>;
      case 'urgent':
        return <Badge className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 px-1.5 py-0">Urgent</Badge>;
    }
  };

  // ─── KPI cards data ──────────────────────────────────────────────
  const kpiCards = [
    {
      title: "Événements aujourd'hui",
      value: todayEvents.length,
      icon: CalendarDays,
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Événements cette semaine',
      value: weekEvents.length,
      icon: Clock,
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      title: 'Prochains départs',
      value: upcomingDepartures.length,
      icon: Ship,
      gradient: 'from-sky-500 to-cyan-600',
    },
    {
      title: 'Arrivées attendues',
      value: expectedArrivals.length,
      icon: Package,
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendrier Logistique</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Planification et suivi des événements logistiques
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={goToToday}>
            <CalendarDays className="w-4 h-4 mr-1" />
            Aujourd&apos;hui
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 truncate">
                      {card.title}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] ml-auto h-6 px-2"
              onClick={() => setActiveFilters(new Set(filterGroups.map((g) => g.key)))}
            >
              Tout sélectionner
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterGroups.map((g) => {
              const isActive = activeFilters.has(g.key);
              const cats = g.categories;
              const dotColors = cats.map((c) => categoryConfig[c].dotColor);
              return (
                <button
                  key={g.key}
                  onClick={() => toggleFilter(g.key)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700'
                      : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 line-through'
                  }`}
                >
                  <span className="flex -space-x-0.5">
                    {dotColors.slice(0, 2).map((dc, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${dc}`} />
                    ))}
                  </span>
                  {g.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main grid: Calendar + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {FRENCH_MONTHS[viewMonth]} {viewYear}
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                {monthEvents.length} événements
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {FRENCH_DAYS_MINI.map((d, i) => (
                <div key={i} className="text-center text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  // Empty cell
                  const isLeading = idx < firstDayOffset;
                  const prevDay = isLeading ? prevMonthDays - firstDayOffset + idx + 1 : null;
                  return (
                    <div key={`empty-${idx}`} className="aspect-square sm:aspect-auto sm:min-h-[72px] flex flex-col items-center justify-start p-0.5 sm:p-1 rounded-lg opacity-30">
                      {prevDay && <span className="text-[10px] text-gray-400">{prevDay}</span>}
                    </div>
                  );
                }

                const dateStr = formatDateStr(viewYear, viewMonth, day);
                const dayEvents = eventsByDate[dateStr] || [];
                const isCurrentDay = isToday(dateStr);
                const isSelected = selectedDate === dateStr;
                // Unique categories for dots
                const uniqueCats = [...new Set(dayEvents.map((e) => e.category))].slice(0, 4);

                return (
                  <motion.button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                    className={`aspect-square sm:aspect-auto sm:min-h-[72px] flex flex-col items-center justify-start p-0.5 sm:p-1.5 rounded-lg transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : isCurrentDay
                        ? 'bg-teal-50/50 dark:bg-teal-900/10'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span
                      className={`text-[11px] sm:text-sm font-medium leading-tight ${
                        isCurrentDay
                          ? 'text-teal-700 dark:text-teal-400 font-bold'
                          : isSelected
                          ? 'text-teal-700 dark:text-teal-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                        {uniqueCats.map((cat, i) => (
                          <span key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${categoryConfig[cat].dotColor}`} />
                        ))}
                      </div>
                    )}
                    {dayEvents.length > 0 && (
                      <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                        {dayEvents.length}
                      </span>
                    )}
                    {isCurrentDay && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Calendar legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {filterGroups.slice(0, 4).map((g) => (
                <div key={g.key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${categoryConfig[g.categories[0]].dotColor}`} />
                  <span className="text-[9px] text-gray-500 dark:text-gray-400">{g.label.replace(/^[^\s]+\s/, '')}</span>
                </div>
              ))}
              {filterGroups.slice(4).map((g) => (
                <div key={g.key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${categoryConfig[g.categories[0]].dotColor}`} />
                  <span className="text-[9px] text-gray-500 dark:text-gray-400">{g.label.replace(/^[^\s]+\s/, '')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day Detail Panel */}
        <Card className="lg:row-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedDate
                    ? (() => {
                        const d = new Date(selectedDate);
                        return `${FRENCH_DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()} ${FRENCH_MONTHS[d.getMonth()]}`;
                      })()
                    : 'Sélectionnez un jour'}
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `${selectedDayEvents.length} événement${selectedDayEvents.length !== 1 ? 's' : ''}`
                    : 'Cliquez sur un jour du calendrier'}
                </CardDescription>
              </div>
              {selectedDate && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate(null)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {selectedDate ? (
              <ScrollArea className="max-h-[480px]">
                <div className="space-y-2 pr-2">
                  {selectedDayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                      <CalendarDays className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Aucun événement</p>
                    </div>
                  ) : (
                    selectedDayEvents.map((evt, idx) => {
                      const config = categoryConfig[evt.category];
                      const IconComp = config.icon;
                      return (
                        <motion.div
                          key={evt.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className={`p-2.5 rounded-lg border ${config.bgLight} ${config.bgDark} border-gray-100 dark:border-gray-800`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${config.dotColor} bg-opacity-20`} style={{ backgroundColor: `${config.color}20` }}>
                              <IconComp className="w-3.5 h-3.5" style={{ color: config.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">
                                  {evt.title}
                                </p>
                                {statusBadge(evt.status)}
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                {evt.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" /> {evt.time}
                                </span>
                                {evt.clientName !== '-' && (
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                    {evt.clientName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 text-[10px] px-1.5 text-teal-600 dark:text-teal-400"
                                  onClick={() => {
                                    if (evt.category.includes('maritime')) setPage('maritime');
                                    else if (evt.category.includes('air')) setPage('air-freight');
                                    else if (evt.category.includes('ground')) setPage('ground-transport');
                                    else if (evt.category.includes('parcel')) setPage('parcels');
                                    else if (evt.category.includes('customs')) setPage('customs');
                                    else if (evt.category.includes('invoice')) setPage('billing');
                                    else if (evt.category.includes('contract')) setPage('contracts');
                                    else setPage('shipments');
                                  }}
                                >
                                  <ExternalLink className="w-3 h-3 mr-0.5" />
                                  Voir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Cliquez sur un jour</p>
                <p className="text-xs">pour voir les événements</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Today's Schedule + Timeline + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Programme du jour</CardTitle>
                <CardDescription>Événements d&apos;aujourd&apos;hui</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                {todayEvents.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-2">
                {todayEvents.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-gray-400 dark:text-gray-500">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Aucun événement aujourd&apos;hui</p>
                  </div>
                ) : (
                  todayEvents
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((evt) => {
                      const config = categoryConfig[evt.category];
                      const IconComp = config.icon;
                      return (
                        <div key={evt.id} className="flex items-start gap-2.5 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="w-1 h-8 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: config.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <IconComp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: config.color }} />
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{evt.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400">{evt.time}</span>
                              {evt.clientName !== '-' && (
                                <span className="text-[10px] text-gray-400 truncate">{evt.clientName}</span>
                              )}
                            </div>
                          </div>
                          {statusBadge(evt.status)}
                        </div>
                      );
                    })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Upcoming Events Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">7 prochains jours</CardTitle>
                <CardDescription>Chronologie des événements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-72">
              <div className="space-y-0 pr-2">
                {timelineDays.map((day, dIdx) => (
                  <div key={day.date} className="relative">
                    {/* Timeline line */}
                    {dIdx < timelineDays.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
                    )}
                    <div className="flex items-start gap-2.5 pb-3">
                      {/* Day indicator */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                        dIdx === 0
                          ? 'bg-teal-500 text-white'
                          : day.events.length > 0
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}>
                        {day.dayNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${dIdx === 0 ? 'text-teal-700 dark:text-teal-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {day.label}
                        </p>
                        {day.events.length === 0 ? (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">Aucun événement</p>
                        ) : (
                          <div className="space-y-0.5 mt-0.5">
                            {day.events.slice(0, 3).map((evt) => {
                              const config = categoryConfig[evt.category];
                              const IconComp = config.icon;
                              return (
                                <div key={evt.id} className="flex items-center gap-1">
                                  <IconComp className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
                                  <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                    {evt.time} — {evt.title}
                                  </span>
                                </div>
                              );
                            })}
                            {day.events.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{day.events.length - 3} autres</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Deadline Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Alertes échéances</CardTitle>
                <CardDescription>Échéances à venir et en retard</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {deadlineAlerts.filter((a) => a.daysUntil < 0).length} en retard
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-2">
                {deadlineAlerts.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-gray-400 dark:text-gray-500">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Aucune échéance proche</p>
                  </div>
                ) : (
                  deadlineAlerts.map((alert, idx) => {
                    const config = categoryConfig[alert.category];
                    const IconComp = config.icon;
                    const isOverdue = alert.daysUntil < 0;
                    const isTodayAlert = alert.daysUntil === 0;
                    const isSoon = alert.daysUntil > 0 && alert.daysUntil <= 3;

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className={`p-2.5 rounded-lg border ${
                          isOverdue
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                            : isTodayAlert
                            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30'
                            : isSoon
                            ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                            : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {isOverdue ? (
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            ) : (
                              <IconComp className="w-3.5 h-3.5" style={{ color: config.color }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${
                              isOverdue ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {alert.title}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                              {alert.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-gray-400">{alert.entityRef}</span>
                              <span className={`text-[10px] font-semibold ${
                                isOverdue
                                  ? 'text-red-600 dark:text-red-400'
                                  : isTodayAlert
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : isSoon
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {isOverdue
                                  ? `${Math.abs(alert.daysUntil)}j de retard`
                                  : isTodayAlert
                                  ? "Aujourd'hui"
                                  : `${alert.daysUntil}j restants`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
