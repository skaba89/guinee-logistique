'use client';

import React, { useState } from 'react';
import {
  Ship,
  Plane,
  Package,
  Globe,
  Link2,
  Zap,
  AlertCircle,
  CheckCircle2,
  Wifi,
  ExternalLink,
  Code,
  RefreshCw,
  Activity,
  Database,
  Plus,
  Trash2,
  Send,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  Boxes,
  FlaskConical,
  Signal,
  Loader2,
  Webhook,
  FileJson,
  Shield,
  Building2,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCargoStore } from '@/lib/cargo-store';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Static Data ────────────────────────────────────────────────────────────

type IntegrationStatus = 'connected' | 'available' | 'coming_soon';

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  color: string;
  icon: 'ship' | 'plane' | 'package' | 'globe' | 'building' | 'database' | 'signal' | 'shield';
  category: 'carriers' | 'customs' | 'erp' | 'tracking';
  lastSync?: string;
}

const integrations: IntegrationItem[] = [
  // Transporteurs
  { id: 'cma-cgm', name: 'CMA CGM', description: 'Transport maritime mondial — réservation, BL, suivi conteneurs', status: 'connected', color: '#0d9488', icon: 'ship', category: 'carriers', lastSync: 'Il y a 3 min' },
  { id: 'msc', name: 'MSC', description: 'Mediterranean Shipping Company — fret maritime international', status: 'connected', color: '#0d9488', icon: 'ship', category: 'carriers', lastSync: 'Il y a 12 min' },
  { id: 'air-algerie-cargo', name: 'Air Algérie Cargo', description: 'Fret aérien national et international — AWB, réservation', status: 'connected', color: '#0ea5e9', icon: 'plane', category: 'carriers', lastSync: 'Il y a 8 min' },
  { id: 'dhl', name: 'DHL Express', description: 'Express mondial — colis et courrier international', status: 'available', color: '#f59e0b', icon: 'package', category: 'carriers' },
  { id: 'fedex', name: 'FedEx', description: 'Express et fret mondial — colis, fret, logistique', status: 'available', color: '#f59e0b', icon: 'package', category: 'carriers' },
  { id: 'aramex', name: 'Aramex', description: 'Courrier et logistique Moyen-Orient & Afrique', status: 'available', color: '#f59e0b', icon: 'package', category: 'carriers' },
  // Douanes & Gouvernement
  { id: 'sida', name: 'SIDA', description: 'Système Informatique Douanier Algérien — déclarations, dédouanement', status: 'connected', color: '#0d9488', icon: 'shield', category: 'customs', lastSync: 'Il y a 5 min' },
  { id: 'eu-aes', name: 'EU AES', description: 'Automated Export System européen — déclarations d\'exportation', status: 'available', color: '#f59e0b', icon: 'globe', category: 'customs' },
  { id: 'hs-codes', name: 'Base HS Codes', description: 'Nomenclature douanière harmonisée mondiale — classification produits', status: 'connected', color: '#0d9488', icon: 'database', category: 'customs', lastSync: 'Il y a 1h' },
  // ERP & Comptabilité
  { id: 'sap', name: 'SAP Business One', description: 'ERP intégré — comptabilité, stocks, achats, ventes', status: 'available', color: '#f59e0b', icon: 'building', category: 'erp' },
  { id: 'sage', name: 'Sage 100', description: 'Comptabilité et gestion commerciale — facturation, trésorerie', status: 'connected', color: '#0d9488', icon: 'building', category: 'erp', lastSync: 'Il y a 20 min' },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Comptabilité en ligne — facturation, dépenses, rapports', status: 'available', color: '#f59e0b', icon: 'building', category: 'erp' },
  { id: 'netsuite', name: 'Oracle NetSuite', description: 'Cloud ERP — gestion financière, supply chain, CRM', status: 'coming_soon', color: '#94a3b8', icon: 'building', category: 'erp' },
  // Suivi Temps Réel
  { id: 'marine-traffic', name: 'MarineTraffic', description: 'Suivi AIS en temps réel — positions navires, ports, ETA', status: 'connected', color: '#0d9488', icon: 'signal', category: 'tracking', lastSync: 'Temps réel' },
  { id: 'flightaware', name: 'FlightAware', description: 'Suivi vols en temps réel — positions, retards, prévisions', status: 'connected', color: '#0d9488', icon: 'signal', category: 'tracking', lastSync: 'Temps réel' },
  { id: 'google-maps', name: 'Google Maps Platform', description: 'Géolocalisation, itinéraires, géocodage, Places API', status: 'connected', color: '#0d9488', icon: 'signal', category: 'tracking', lastSync: 'Temps réel' },
];

interface ApiHealthItem {
  id: string;
  name: string;
  health: 'green' | 'yellow' | 'red';
  responseTime: number;
  uptime: number;
  dailyRequests: number;
  sparkline: number[];
}

const apiHealthData: ApiHealthItem[] = [
  { id: 'cma-cgm', name: 'CMA CGM API', health: 'green', responseTime: 245, uptime: 99.8, dailyRequests: 4520, sparkline: [120, 180, 210, 245, 320, 280, 245, 310, 250, 220, 190, 245] },
  { id: 'msc', name: 'MSC API', health: 'green', responseTime: 312, uptime: 99.5, dailyRequests: 3890, sparkline: [300, 280, 312, 350, 410, 380, 312, 290, 340, 310, 295, 312] },
  { id: 'air-algerie', name: 'Air Algérie API', health: 'yellow', responseTime: 890, uptime: 97.2, dailyRequests: 2100, sparkline: [450, 620, 890, 1100, 950, 890, 780, 1200, 890, 650, 890, 920] },
  { id: 'sida', name: 'SIDA API', health: 'green', responseTime: 178, uptime: 99.9, dailyRequests: 5600, sparkline: [150, 178, 200, 178, 160, 178, 210, 178, 190, 178, 165, 178] },
  { id: 'hs-codes', name: 'HS Codes API', health: 'green', responseTime: 95, uptime: 99.99, dailyRequests: 1240, sparkline: [80, 95, 110, 95, 85, 95, 100, 95, 90, 95, 105, 95] },
  { id: 'sage', name: 'Sage 100 API', health: 'green', responseTime: 320, uptime: 99.6, dailyRequests: 2800, sparkline: [280, 320, 350, 320, 400, 320, 290, 320, 360, 320, 310, 320] },
  { id: 'marine-traffic', name: 'MarineTraffic API', health: 'green', responseTime: 156, uptime: 99.95, dailyRequests: 8900, sparkline: [130, 156, 145, 156, 170, 156, 140, 156, 148, 156, 152, 156] },
  { id: 'flightaware', name: 'FlightAware API', health: 'green', responseTime: 210, uptime: 99.7, dailyRequests: 3400, sparkline: [180, 210, 230, 210, 195, 210, 250, 210, 200, 210, 220, 210] },
];

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastDelivery: string;
  created: string;
}

const initialWebhooks: WebhookItem[] = [
  { id: 'wh1', url: 'https://api.technoplus.dz/webhooks/shipments', events: ['shipment.created', 'shipment.status_changed', 'shipment.delivered'], status: 'active', lastDelivery: 'Il y a 2 min', created: '2026-01-15' },
  { id: 'wh2', url: 'https://erp.bouzidi.dz/hooks/invoice', events: ['invoice.paid', 'invoice.overdue'], status: 'active', lastDelivery: 'Il y a 15 min', created: '2026-02-01' },
  { id: 'wh3', url: 'https://sync.hydroservices.dz/customs', events: ['customs.cleared', 'customs.rejected'], status: 'active', lastDelivery: 'Il y a 45 min', created: '2026-02-10' },
  { id: 'wh4', url: 'https://notify.batiplus.dz/tracking', events: ['container.arrived', 'flight.delayed', 'shipment.delivered'], status: 'active', lastDelivery: 'Il y a 1h', created: '2026-03-01' },
];

interface DeliveryLogEntry {
  id: string;
  webhookId: string;
  timestamp: string;
  httpStatus: number;
  payloadSize: string;
  success: boolean;
}

const deliveryLogs: DeliveryLogEntry[] = [
  { id: 'dl1', webhookId: 'wh1', timestamp: '2026-03-04 14:32:05', httpStatus: 200, payloadSize: '2.4 KB', success: true },
  { id: 'dl2', webhookId: 'wh1', timestamp: '2026-03-04 14:28:11', httpStatus: 200, payloadSize: '1.8 KB', success: true },
  { id: 'dl3', webhookId: 'wh2', timestamp: '2026-03-04 14:15:22', httpStatus: 200, payloadSize: '3.1 KB', success: true },
  { id: 'dl4', webhookId: 'wh3', timestamp: '2026-03-04 13:50:44', httpStatus: 503, payloadSize: '0.5 KB', success: false },
  { id: 'dl5', webhookId: 'wh4', timestamp: '2026-03-04 13:30:00', httpStatus: 200, payloadSize: '2.9 KB', success: true },
  { id: 'dl6', webhookId: 'wh1', timestamp: '2026-03-04 13:12:38', httpStatus: 200, payloadSize: '2.1 KB', success: true },
  { id: 'dl7', webhookId: 'wh2', timestamp: '2026-03-04 12:45:15', httpStatus: 408, payloadSize: '0.3 KB', success: false },
  { id: 'dl8', webhookId: 'wh3', timestamp: '2026-03-04 12:20:09', httpStatus: 200, payloadSize: '1.7 KB', success: true },
  { id: 'dl9', webhookId: 'wh4', timestamp: '2026-03-04 11:55:33', httpStatus: 200, payloadSize: '3.5 KB', success: true },
  { id: 'dl10', webhookId: 'wh1', timestamp: '2026-03-04 11:30:01', httpStatus: 200, payloadSize: '2.0 KB', success: true },
];

interface SyncJob {
  id: string;
  source: string;
  destination: string;
  direction: 'bidirectional' | 'outbound' | 'inbound';
  lastSync: string;
  nextSync: string;
  records: number;
  status: 'success' | 'partial' | 'failed';
}

const syncJobs: SyncJob[] = [
  { id: 'sj1', source: 'CMA CGM', destination: 'LogisWay', direction: 'inbound', lastSync: '14:32', nextSync: '14:47', records: 1245, status: 'success' },
  { id: 'sj2', source: 'MSC', destination: 'LogisWay', direction: 'inbound', lastSync: '14:20', nextSync: '14:50', records: 892, status: 'success' },
  { id: 'sj3', source: 'SIDA', destination: 'LogisWay', direction: 'bidirectional', lastSync: '14:15', nextSync: '14:45', records: 3421, status: 'success' },
  { id: 'sj4', source: 'LogisWay', destination: 'Sage 100', direction: 'outbound', lastSync: '14:00', nextSync: '15:00', records: 567, status: 'partial' },
  { id: 'sj5', source: 'MarineTraffic', destination: 'LogisWay', direction: 'inbound', lastSync: '14:35', nextSync: '14:40', records: 8920, status: 'success' },
  { id: 'sj6', source: 'HS Codes', destination: 'LogisWay', direction: 'inbound', lastSync: '13:00', nextSync: '14:00', records: 15678, status: 'success' },
  { id: 'sj7', source: 'Air Algérie', destination: 'LogisWay', direction: 'inbound', lastSync: '13:45', nextSync: '14:15', records: 2100, status: 'failed' },
  { id: 'sj8', source: 'LogisWay', destination: 'FlightAware', direction: 'outbound', lastSync: '14:30', nextSync: '14:45', records: 3400, status: 'success' },
];

const webhookEventOptions = [
  'shipment.created',
  'shipment.status_changed',
  'shipment.delivered',
  'invoice.paid',
  'invoice.overdue',
  'container.arrived',
  'flight.delayed',
  'customs.cleared',
  'customs.rejected',
];

// ─── Helper Components ──────────────────────────────────────────────────────

function getIcon(icon: IntegrationItem['icon'], className?: string) {
  const cls = className || 'w-5 h-5';
  switch (icon) {
    case 'ship': return <Ship className={cls} />;
    case 'plane': return <Plane className={cls} />;
    case 'package': return <Package className={cls} />;
    case 'globe': return <Globe className={cls} />;
    case 'building': return <Building2 className={cls} />;
    case 'database': return <Database className={cls} />;
    case 'signal': return <Signal className={cls} />;
    case 'shield': return <Shield className={cls} />;
    default: return <Link2 className={cls} />;
  }
}

function getStatusBadge(status: IntegrationStatus) {
  switch (status) {
    case 'connected':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-1">
          <Wifi className="w-3 h-3" />
          Connecté
        </Badge>
      );
    case 'available':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] gap-1">
          <Link2 className="w-3 h-3" />
          Disponible
        </Badge>
      );
    case 'coming_soon':
      return (
        <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-[10px] gap-1">
          <Clock className="w-3 h-3" />
          Bientôt
        </Badge>
      );
  }
}

function getHealthDot(health: ApiHealthItem['health']) {
  const colors = {
    green: 'bg-emerald-500 shadow-emerald-500/50',
    yellow: 'bg-amber-500 shadow-amber-500/50',
    red: 'bg-red-500 shadow-red-500/50',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shadow-sm ${colors[health]}`} />;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function getDirectionIcon(dir: SyncJob['direction']) {
  switch (dir) {
    case 'bidirectional': return <ArrowLeftRight className="w-4 h-4 text-teal-500" />;
    case 'outbound': return <ArrowRight className="w-4 h-4 text-blue-500" />;
    case 'inbound': return <ArrowLeft className="w-4 h-4 text-emerald-500" />;
  }
}

function getSyncStatusBadge(status: SyncJob['status']) {
  switch (status) {
    case 'success':
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">Succès</Badge>;
    case 'partial':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">Partiel</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]">Échec</Badge>;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const user = useCargoStore((s) => s.user);

  // Webhook state
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean } | null>(null);
  const [deliveryLogWebhook, setDeliveryLogWebhook] = useState<string | null>(null);

  // Integration category tab
  const [categoryTab, setCategortyTab] = useState('carriers');

  // Retry state
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const addWebhook = () => {
    if (!newWebhookUrl.trim() || newWebhookEvents.length === 0) return;
    const newWh: WebhookItem = {
      id: `wh${webhooks.length + 1}`,
      url: newWebhookUrl,
      events: [...newWebhookEvents],
      status: 'active',
      lastDelivery: 'Jamais',
      created: new Date().toISOString().split('T')[0],
    };
    setWebhooks([...webhooks, newWh]);
    setNewWebhookUrl('');
    setNewWebhookEvents([]);
    setShowAddWebhook(false);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const toggleWebhookEvent = (event: string) => {
    setNewWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const testWebhook = (id: string) => {
    setTestingWebhook(id);
    setTestResult(null);
    setTimeout(() => {
      setTestingWebhook(null);
      setTestResult({ id, ok: Math.random() > 0.2 });
      setTimeout(() => setTestResult(null), 3000);
    }, 1500);
  };

  const handleRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => setRetryingId(null), 2000);
  };

  const categoryIntegrations = integrations.filter((i) => i.category === categoryTab);
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const totalApiCalls = 22450;
  const syncErrors = 2;
  const syncRate = 99.2;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-7 h-7 text-teal-500" />
            Intégrations & API Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connectez vos services, surveillez les API et gérez les webhooks
          </p>
        </div>
        <Button
          size="sm"
          className="text-xs text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Nouvelle intégration
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Intégrations actives', value: connectedCount, icon: <Link2 className="w-5 h-5" />, color: 'teal', sub: `sur ${integrations.length} disponibles` },
          { label: 'Appels API aujourd\'hui', value: totalApiCalls.toLocaleString('fr-FR'), icon: <Activity className="w-5 h-5" />, color: 'emerald', sub: '+12% vs hier' },
          { label: 'Erreurs de sync', value: syncErrors, icon: <AlertCircle className="w-5 h-5" />, color: 'red', sub: '0.08% du total' },
          { label: 'Taux de synchronisation', value: `${syncRate}%`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald', sub: 'Objectif: 99.5%' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</span>
                  <div className={`p-1.5 rounded-lg ${
                    kpi.color === 'teal' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' :
                    kpi.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {kpi.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Integration Categories - Tabbed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-500" />
            Catalogue d&apos;intégrations
          </CardTitle>
          <CardDescription>Parcourez et connectez vos services partenaires</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={categoryTab} onValueChange={setCategortyTab}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="carriers" className="text-xs">
                <Ship className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Transporteurs
              </TabsTrigger>
              <TabsTrigger value="customs" className="text-xs">
                <Shield className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Douanes & Gouv.
              </TabsTrigger>
              <TabsTrigger value="erp" className="text-xs">
                <Building2 className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                ERP & Compta.
              </TabsTrigger>
              <TabsTrigger value="tracking" className="text-xs">
                <Signal className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Suivi Temps Réel
              </TabsTrigger>
            </TabsList>

            {['carriers', 'customs', 'erp', 'tracking'].map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {integrations.filter((i) => i.category === cat).map((integ, idx) => (
                      <motion.div
                        key={integ.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className={`h-full transition-all hover:shadow-md ${
                          integ.status === 'coming_soon' ? 'opacity-70' : ''
                        }`}>
                          <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className="p-2.5 rounded-xl text-white flex-shrink-0"
                                style={{ background: integ.color }}
                              >
                                {getIcon(integ.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{integ.name}</h4>
                                  {getStatusBadge(integ.status)}
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{integ.description}</p>
                              </div>
                            </div>

                            {integ.lastSync && (
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-3">
                                <RefreshCw className="w-3 h-3" />
                                Dernière sync : {integ.lastSync}
                              </div>
                            )}

                            <div className="mt-auto pt-2">
                              {integ.status === 'connected' && (
                                <Button size="sm" variant="outline" className="w-full text-xs h-8">
                                  <Settings className="w-3.5 h-3.5 mr-1" />
                                  Configurer
                                </Button>
                              )}
                              {integ.status === 'available' && (
                                <Button
                                  size="sm"
                                  className="w-full text-xs h-8 text-white"
                                  style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                                >
                                  <Link2 className="w-3.5 h-3.5 mr-1" />
                                  Connecter
                                </Button>
                              )}
                              {integ.status === 'coming_soon' && (
                                <Button size="sm" variant="outline" className="w-full text-xs h-8 opacity-60" disabled>
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  Bientôt disponible
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* API Health Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                Santé des API
              </CardTitle>
              <CardDescription>Surveillance en temps réel des API connectées</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {apiHealthData.map((api, idx) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getHealthDot(api.health)}
                        <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{api.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <MiniSparkline
                        data={api.sparkline}
                        color={api.health === 'green' ? '#10b981' : api.health === 'yellow' ? '#f59e0b' : '#ef4444'}
                      />
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Latence</p>
                        <p className={`text-xs font-semibold ${
                          api.responseTime < 300 ? 'text-emerald-600 dark:text-emerald-400' :
                          api.responseTime < 600 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {api.responseTime}ms
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-gray-400">Uptime</span>
                        <p className={`font-semibold ${
                          api.uptime >= 99.5 ? 'text-emerald-600 dark:text-emerald-400' :
                          api.uptime >= 98 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>{api.uptime}%</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Req/jour</span>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{api.dailyRequests.toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Webhook className="w-5 h-5 text-teal-500" />
                Webhooks
              </CardTitle>
              <CardDescription>Gérez vos webhooks pour les notifications en temps réel</CardDescription>
            </div>
            <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="text-xs h-8 text-white"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau webhook</DialogTitle>
                  <DialogDescription>Ajoutez un endpoint pour recevoir des notifications en temps réel</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">URL du webhook</label>
                    <Input
                      placeholder="https://api.example.com/webhooks"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Événements à surveiller</label>
                    <div className="flex flex-wrap gap-1.5">
                      {webhookEventOptions.map((event) => (
                        <button
                          key={event}
                          onClick={() => toggleWebhookEvent(event)}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                            newWebhookEvents.includes(event)
                              ? 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`}
                        >
                          {event}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setShowAddWebhook(false)}>Annuler</Button>
                  <Button
                    size="sm"
                    className="text-white"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                    onClick={addWebhook}
                    disabled={!newWebhookUrl.trim() || newWebhookEvents.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter webhook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {webhooks.map((webhook, idx) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate max-w-[300px]">{webhook.url}</code>
                    <Badge className={`text-[10px] ${
                      webhook.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {webhook.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    {testResult && testResult.id === webhook.id && (
                      <Badge className={`text-[10px] ${
                        testResult.ok
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {testResult.ok ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {testResult.ok ? 'Succès (200)' : 'Échec (503)'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <span key={event} className="text-[9px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 border border-teal-100 dark:border-teal-800">
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Dernière livraison : {webhook.lastDelivery}</span>
                    <span>Créé le : {webhook.created}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Test Webhook */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => testWebhook(webhook.id)}
                    disabled={testingWebhook === webhook.id}
                  >
                    {testingWebhook === webhook.id ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1" />
                    )}
                    Tester
                  </Button>
                  {/* Delivery Log Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setDeliveryLogWebhook(webhook.id)}>
                        <FileJson className="w-3.5 h-3.5 mr-1" />
                        Livraisons
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Journal des livraisons</DialogTitle>
                        <DialogDescription>
                          Dernières livraisons pour {webhook.url}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-80 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px]">Horodatage</TableHead>
                              <TableHead className="text-[10px]">Statut</TableHead>
                              <TableHead className="text-[10px]">Taille</TableHead>
                              <TableHead className="text-[10px]">Résultat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deliveryLogs.filter((l) => l.webhookId === webhook.id).map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="text-[10px] font-mono">{log.timestamp}</TableCell>
                                <TableCell className="text-[10px]">
                                  <Badge className={`text-[9px] ${
                                    log.httpStatus >= 200 && log.httpStatus < 300
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {log.httpStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-[10px] text-gray-500">{log.payloadSize}</TableCell>
                                <TableCell className="text-[10px]">
                                  {log.success ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => deleteWebhook(webhook.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sync Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-500" />
                État de synchronisation
              </CardTitle>
              <CardDescription>Suivi des jobs de synchronisation en temps réel</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Tout synchroniser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Source → Destination</TableHead>
                  <TableHead className="text-[10px]">Direction</TableHead>
                  <TableHead className="text-[10px]">Dernière sync</TableHead>
                  <TableHead className="text-[10px]">Prochaine sync</TableHead>
                  <TableHead className="text-[10px]">Enregistrements</TableHead>
                  <TableHead className="text-[10px]">Statut</TableHead>
                  <TableHead className="text-[10px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {job.source} → {job.destination}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getDirectionIcon(job.direction)}
                        <span className="text-[10px] text-gray-500">
                          {job.direction === 'bidirectional' ? 'Bidirectionnel' : job.direction === 'outbound' ? 'Sortant' : 'Entrant'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-300 font-mono">{job.lastSync}</TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-300 font-mono">{job.nextSync}</TableCell>
                    <TableCell className="text-xs text-gray-700 dark:text-gray-300">{job.records.toLocaleString('fr-FR')}</TableCell>
                    <TableCell>{getSyncStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      {job.status !== 'success' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-teal-600 hover:text-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                          onClick={() => handleRetry(job.id)}
                          disabled={retryingId === job.id}
                        >
                          {retryingId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-500" />
            Ressources développeurs
          </CardTitle>
          <CardDescription>Documentation, SDKs et outils pour l&apos;intégration</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Documentation API',
                description: 'Référence complète des endpoints REST et GraphQL',
                icon: <Code className="w-5 h-5" />,
                color: 'teal',
                href: '#',
              },
              {
                title: 'SDKs & Bibliothèques',
                description: 'Python, Node.js, PHP, Java, C# — prêts à l\'emploi',
                icon: <Boxes className="w-5 h-5" />,
                color: 'emerald',
                href: '#',
              },
              {
                title: 'Environnement Sandbox',
                description: 'Testez vos intégrations sans impact sur la production',
                icon: <FlaskConical className="w-5 h-5" />,
                color: 'amber',
                href: '#',
              },
              {
                title: 'Page de statut',
                description: 'Suivi en temps réel de la disponibilité des services',
                icon: <BarChart3 className="w-5 h-5" />,
                color: 'sky',
                href: '#',
              },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group flex flex-col items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className={`p-2.5 rounded-lg ${
                  item.color === 'teal' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' :
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  item.color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                }`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1">
                    {item.title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Inline Settings icon to avoid import conflict
function Settings({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || 'w-4 h-4'}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
