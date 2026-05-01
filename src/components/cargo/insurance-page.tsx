'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  DollarSign,
  Percent,
  Plus,
  Search,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCurrency } from '@/lib/use-currency';

// ─── Types ───────────────────────────────────────────────────────────────────

type CoverageType = 'tous_risques' | 'fap' | 'avarie_particuliere';
type PolicyStatus = 'active' | 'en_attente' | 'expiree' | 'resiliee';
type ClaimNature = 'avarie' | 'perte' | 'vol' | 'dommage' | 'retard';
type ClaimStatus = 'declare' | 'en_cours' | 'indemnise' | 'refuse';

interface Policy {
  id: string;
  policyNumber: string;
  clientName: string;
  shipmentRef: string;
  coverageType: CoverageType;
  insuredValue: number;
  premium: number;
  status: PolicyStatus;
  startDate: string;
  endDate: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  policyRef: string;
  clientName: string;
  declarationDate: string;
  nature: ClaimNature;
  claimedAmount: number;
  status: ClaimStatus;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const coverageTypeLabels: Record<CoverageType, string> = {
  tous_risques: 'Tous risques',
  fap: 'FAP',
  avarie_particuliere: 'Avarie particulière',
};

const policyStatusLabels: Record<PolicyStatus, string> = {
  active: 'Active',
  en_attente: 'En attente',
  expiree: 'Expirée',
  resiliee: 'Résiliée',
};

const claimNatureLabels: Record<ClaimNature, string> = {
  avarie: 'Avarie',
  perte: 'Perte totale',
  vol: 'Vol/pillage',
  dommage: 'Dommage',
  retard: 'Retard de livraison',
};

const claimStatusLabels: Record<ClaimStatus, string> = {
  declare: 'Déclaré',
  en_cours: 'En cours de traitement',
  indemnise: 'Indemnisé',
  refuse: 'Refusé',
};

// ─── Badge colors ────────────────────────────────────────────────────────────

const policyStatusColors: Record<PolicyStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  expiree: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  resiliee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const coverageTypeColors: Record<CoverageType, string> = {
  tous_risques: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  fap: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  avarie_particuliere: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const claimStatusColors: Record<ClaimStatus, string> = {
  declare: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_cours: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  indemnise: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refuse: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const claimNatureColors: Record<ClaimNature, string> = {
  avarie: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  perte: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  vol: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  dommage: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  retard: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Test data ───────────────────────────────────────────────────────────────

const initialPolicies: Policy[] = [
  { id: 'pol1', policyNumber: 'POL-2026-ALG-001', clientName: 'EURL BatiPlus', shipmentRef: 'FFP-0006-2026', coverageType: 'tous_risques', insuredValue: 4200000, premium: 84000, status: 'active', startDate: '2026-02-10', endDate: '2026-08-10' },
  { id: 'pol2', policyNumber: 'POL-2026-ALG-002', clientName: 'SPA HydroServices', shipmentRef: 'FFP-0005-2026', coverageType: 'fap', insuredValue: 950000, premium: 14250, status: 'active', startDate: '2026-02-05', endDate: '2026-05-05' },
  { id: 'pol3', policyNumber: 'POL-2026-ALG-003', clientName: 'Entreprise Bouzidi & Fils', shipmentRef: 'FFP-0021-2026', coverageType: 'tous_risques', insuredValue: 3100000, premium: 62000, status: 'active', startDate: '2026-04-20', endDate: '2026-10-20' },
  { id: 'pol4', policyNumber: 'POL-2026-ALG-004', clientName: 'Sarl AgriPro', shipmentRef: 'FFP-0016-2026', coverageType: 'avarie_particuliere', insuredValue: 155000, premium: 1550, status: 'expiree', startDate: '2026-01-05', endDate: '2026-04-05' },
  { id: 'pol5', policyNumber: 'POL-2026-ALG-005', clientName: 'SPA HydroServices', shipmentRef: 'FFP-0010-2026', coverageType: 'tous_risques', insuredValue: 5200000, premium: 104000, status: 'active', startDate: '2026-03-05', endDate: '2026-09-05' },
  { id: 'pol6', policyNumber: 'POL-2026-ALG-006', clientName: 'Sarl TechnoPlus', shipmentRef: 'FFP-0001-2026', coverageType: 'fap', insuredValue: 350000, premium: 5250, status: 'expiree', startDate: '2026-01-05', endDate: '2026-04-05' },
  { id: 'pol7', policyNumber: 'POL-2026-ALG-007', clientName: 'Karim Djebbar', shipmentRef: 'FFP-0022-2026', coverageType: 'avarie_particuliere', insuredValue: 850000, premium: 8500, status: 'en_attente', startDate: '2026-04-24', endDate: '2026-10-24' },
  { id: 'pol8', policyNumber: 'POL-2026-ALG-008', clientName: 'EPC Groupe Construction', shipmentRef: 'FFP-0014-2026', coverageType: 'tous_risques', insuredValue: 21500000, premium: 430000, status: 'active', startDate: '2026-01-01', endDate: '2026-12-31' },
];

const initialClaims: Claim[] = [
  { id: 'clm1', claimNumber: 'SIN-2026-001', policyRef: 'POL-2026-ALG-002', clientName: 'SPA HydroServices', declarationDate: '2026-03-01', nature: 'retard', claimedAmount: 95000, status: 'indemnise' },
  { id: 'clm2', claimNumber: 'SIN-2026-002', policyRef: 'POL-2026-ALG-004', clientName: 'Sarl AgriPro', declarationDate: '2026-03-15', nature: 'avarie', claimedAmount: 42000, status: 'en_cours' },
  { id: 'clm3', claimNumber: 'SIN-2026-003', policyRef: 'POL-2026-ALG-001', clientName: 'EURL BatiPlus', declarationDate: '2026-04-01', nature: 'dommage', claimedAmount: 380000, status: 'declare' },
  { id: 'clm4', claimNumber: 'SIN-2026-004', policyRef: 'POL-2026-ALG-006', clientName: 'Sarl TechnoPlus', declarationDate: '2026-02-20', nature: 'perte', claimedAmount: 350000, status: 'refuse' },
  { id: 'clm5', claimNumber: 'SIN-2026-005', policyRef: 'POL-2026-ALG-005', clientName: 'SPA HydroServices', declarationDate: '2026-04-10', nature: 'avarie', claimedAmount: 156000, status: 'en_cours' },
];

// ─── Chart data ──────────────────────────────────────────────────────────────

const chartData = [
  { month: 'Jan', primes: 430000, sinistres: 0 },
  { month: 'Fév', primes: 98250, sinistres: 350000 },
  { month: 'Mar', primes: 118250, sinistres: 137000 },
  { month: 'Avr', primes: 104000, sinistres: 536000 },
  { month: 'Mai', primes: 62000, sinistres: 0 },
  { month: 'Jun', primes: 0, sinistres: 0 },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function InsurancePage() {
  const { format: formatPrice } = useCurrency();
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [claims] = useState<Claim[]>(initialClaims);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newPolicy, setNewPolicy] = useState({
    clientName: '',
    shipmentRef: '',
    coverageType: '' as CoverageType | '',
    insuredValue: '',
    premium: '',
    startDate: '',
    endDate: '',
  });

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const activePolicies = policies.filter((p) => p.status === 'active').length;
  const activeClaims = claims.filter((c) => c.status === 'declare' || c.status === 'en_cours').length;
  const totalInsuredValue = policies.filter((p) => p.status === 'active').reduce((a, b) => a + b.insuredValue, 0);
  const totalPremiums = policies.reduce((a, b) => a + b.premium, 0);
  const totalClaimed = claims.reduce((a, b) => a + b.claimedAmount, 0);
  const claimsRate = totalPremiums > 0 ? ((totalClaimed / totalPremiums) * 100) : 0;

  // ─── Filtered policies ──────────────────────────────────────────────────

  const filteredPolicies = useMemo(() => {
    if (!searchQuery) return policies;
    const q = searchQuery.toLowerCase();
    return policies.filter(
      (p) =>
        p.policyNumber.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.shipmentRef.toLowerCase().includes(q)
    );
  }, [policies, searchQuery]);

  const filteredClaims = useMemo(() => {
    if (!searchQuery) return claims;
    const q = searchQuery.toLowerCase();
    return claims.filter(
      (c) =>
        c.claimNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.policyRef.toLowerCase().includes(q)
    );
  }, [claims, searchQuery]);

  // ─── Add policy handler ─────────────────────────────────────────────────

  const handleAddPolicy = () => {
    if (!newPolicy.clientName || !newPolicy.coverageType || !newPolicy.insuredValue) return;

    const policy: Policy = {
      id: `pol${policies.length + 1}`,
      policyNumber: `POL-2026-ALG-${String(policies.length + 1).padStart(3, '0')}`,
      clientName: newPolicy.clientName,
      shipmentRef: newPolicy.shipmentRef,
      coverageType: newPolicy.coverageType as CoverageType,
      insuredValue: parseFloat(newPolicy.insuredValue) || 0,
      premium: parseFloat(newPolicy.premium) || 0,
      status: 'en_attente',
      startDate: newPolicy.startDate || new Date().toISOString().split('T')[0],
      endDate: newPolicy.endDate || '',
    };
    setPolicies([policy, ...policies]);
    setShowAddDialog(false);
    setNewPolicy({
      clientName: '',
      shipmentRef: '',
      coverageType: '',
      insuredValue: '',
      premium: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['N° Police', 'Client', 'Expédition', 'Type Couverture', 'Valeur Assurée (DA)', 'Prime (DA)', 'Statut', 'Date Début', 'Date Fin'];
    const rows = filteredPolicies.map(p => [
      p.policyNumber,
      p.clientName,
      p.shipmentRef,
      coverageTypeLabels[p.coverageType] || p.coverageType,
      String(p.insuredValue),
      String(p.premium),
      policyStatusLabels[p.status] || p.status,
      p.startDate,
      p.endDate,
    ]);
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logisway-insurance-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── KPI cards config ───────────────────────────────────────────────────

  const kpiCards = [
    {
      title: 'Polices actives',
      value: activePolicies,
      icon: Shield,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Sinistres en cours',
      value: activeClaims,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Couverture totale',
      value: formatPrice(totalInsuredValue),
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Taux de sinistralité',
      value: `${claimsRate.toFixed(1)}%`,
      icon: Percent,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-500" />
            Assurance Cargo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez vos polices d&apos;assurance et sinistres
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button
            size="sm"
            className="text-xs text-white"
            style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle police
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {typeof card.value === 'number'
                        ? card.value.toLocaleString('fr-FR')
                        : card.value}
                    </p>
                  </div>
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Area Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Évolution des primes et sinistres</CardTitle>
          <CardDescription>Primes encaissées vs montants des sinistres par mois</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrimes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSinistres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatPrice(value),
                    name === 'primes' ? 'Primes' : 'Sinistres',
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'primes' ? 'Primes' : 'Sinistres'
                  }
                />
                <Area
                  type="monotone"
                  dataKey="primes"
                  stroke="#0d9488"
                  fill="url(#colorPrimes)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="sinistres"
                  stroke="#ef4444"
                  fill="url(#colorSinistres)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par N° police, client, sinistre..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="polices">
        <TabsList>
          <TabsTrigger value="polices">Polices</TabsTrigger>
          <TabsTrigger value="sinistres">Sinistres</TabsTrigger>
        </TabsList>

        {/* ─── Polices Tab ─────────────────────────────────────────────── */}
        <TabsContent value="polices">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Police</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Expédition</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Type couverture</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Valeur assurée</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Prime</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Date début</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Date fin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          Aucune police trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPolicies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-mono text-xs font-semibold">
                            {policy.policyNumber}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {policy.clientName}
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell font-mono">
                            {policy.shipmentRef}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 ${coverageTypeColors[policy.coverageType]}`}
                            >
                              {coverageTypeLabels[policy.coverageType]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell font-semibold">
                            {formatPrice(policy.insuredValue)}
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell font-medium">
                            {formatPrice(policy.premium)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 ${policyStatusColors[policy.status]}`}
                            >
                              {policyStatusLabels[policy.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">
                            {formatDate(policy.startDate)}
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">
                            {formatDate(policy.endDate)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  {filteredPolicies.length} police{filteredPolicies.length > 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Sinistres Tab ───────────────────────────────────────────── */}
        <TabsContent value="sinistres">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">N° Sinistre</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Police</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Date déclaration</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Nature sinistre</TableHead>
                      <TableHead className="text-xs">Montant réclamé</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Aucun sinistre trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-mono text-xs font-semibold">
                            {claim.claimNumber}
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell font-mono">
                            {claim.policyRef}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {claim.clientName}
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            {formatDate(claim.declarationDate)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 ${claimNatureColors[claim.nature]}`}
                            >
                              {claimNatureLabels[claim.nature]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {formatPrice(claim.claimedAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.5 ${claimStatusColors[claim.status]}`}
                            >
                              {claimStatusLabels[claim.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  {filteredClaims.length} sinistre{filteredClaims.length > 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Policy Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle police d&apos;assurance</DialogTitle>
            <DialogDescription>Créer une nouvelle police d&apos;assurance cargo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Client</Label>
              <Input
                value={newPolicy.clientName}
                onChange={(e) => setNewPolicy({ ...newPolicy, clientName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Expédition</Label>
              <Input
                value={newPolicy.shipmentRef}
                onChange={(e) => setNewPolicy({ ...newPolicy, shipmentRef: e.target.value })}
                placeholder="Référence expédition (ex: FFP-0001-2026)"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type couverture</Label>
              <Select
                value={newPolicy.coverageType}
                onValueChange={(v) => setNewPolicy({ ...newPolicy, coverageType: v as CoverageType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous_risques">Tous risques</SelectItem>
                  <SelectItem value="fap">FAP</SelectItem>
                  <SelectItem value="avarie_particuliere">Avarie particulière</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Valeur assurée (DA)</Label>
                <Input
                  type="number"
                  value={newPolicy.insuredValue}
                  onChange={(e) => setNewPolicy({ ...newPolicy, insuredValue: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prime (DA)</Label>
                <Input
                  type="number"
                  value={newPolicy.premium}
                  onChange={(e) => setNewPolicy({ ...newPolicy, premium: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Date début</Label>
                <Input
                  type="date"
                  value={newPolicy.startDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date fin</Label>
                <Input
                  type="date"
                  value={newPolicy.endDate}
                  onChange={(e) => setNewPolicy({ ...newPolicy, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddPolicy}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              Créer la police
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
