'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Ban,
  Globe,
  Flag,
  Award,
  Users,
  FileText,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Info,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Play,
  Send,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  allBusinessRules,
  evaluateRules,
  getRuleCategoryStats,
  toggleRule,
  type BusinessRule,
  type RuleCategory,
  type Severity,
  type RuleContext,
  type RuleResult,
  EMBARGOED_COUNTRIES,
  HIGH_RISK_COUNTRIES,
} from '@/lib/business-rules';
import {
  loadAuditTrail,
  seedAuditTrail,
  auditActionLabels,
  auditSeverityColors,
  auditResultColors,
  auditResultLabels,
  auditSeverityLabels,
  type AuditEntry,
  type AuditAction,
} from '@/lib/audit-trail';
import { useCargoStore } from '@/lib/cargo-store';

// ─── Constants & Labels ────────────────────────────────────────

const categoryLabels: Record<RuleCategory, string> = {
  validation: 'Validation',
  compliance: 'Conformité',
  pricing: 'Tarification',
  workflow: 'Workflow',
  safety: 'Sécurité',
  customs: 'Douanes',
  credit: 'Crédit',
  operational: 'Opérationnel',
  environmental: 'Environnement',
};

const categoryColors: Record<RuleCategory, string> = {
  validation: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  compliance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  pricing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  workflow: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  safety: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  customs: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  credit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  operational: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  environmental: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const severityLabels: Record<Severity, string> = {
  critical: 'Critique',
  warning: 'Avertissement',
  info: 'Information',
};

const severityColors: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ─── Mock Data ─────────────────────────────────────────────────

const now = new Date();

const mockEmbargoList = [
  { country: 'Corée du Nord', code: 'KP', authority: 'ONU / UE', since: '2006-10-14', type: 'Embargo total', restrictions: 'Toutes marchandises, armes, technologie duale' },
  { country: 'Iran', code: 'IR', authority: 'ONU / UE / USA', since: '2010-06-09', type: 'Sanctions ciblées', restrictions: 'Pétrole, armes, nucléaire, technologie' },
  { country: 'Syrie', code: 'SY', authority: 'UE / USA', since: '2011-05-09', type: 'Sanctions ciblées', restrictions: 'Armes, pétrole, équipements de surveillance' },
  { country: 'Cuba', code: 'CU', authority: 'USA', since: '1962-02-07', type: 'Embargo partiel', restrictions: 'Commerce général (embargo américain)' },
  { country: 'Russie', code: 'RU', authority: 'UE / USA', since: '2022-02-24', type: 'Sanctions sectorielles', restrictions: 'Technologie duale, énergie, finance, luxe' },
  { country: 'Myanmar', code: 'MM', authority: 'UE / USA', since: '2021-02-01', type: 'Sanctions ciblées', restrictions: 'Armes, équipements surveillance, entreprises militaires' },
  { country: 'Biélorussie', code: 'BY', authority: 'UE', since: '2022-02-24', type: 'Sanctions sectorielles', restrictions: 'Technologie duale, potasse, tabac, finance' },
];

const mockSanctionsScreenings = [
  { id: 'SCR-001', shipmentRef: 'EXP-2026-0412', client: 'SARL AlgerTrade', destination: 'Téhéran, IR', date: '2026-03-04T10:30:00', result: 'blocked' as const, reason: 'Destination sous embargo (IR)', riskLevel: 'critical' },
  { id: 'SCR-002', shipmentRef: 'EXP-2026-0418', client: 'Global Pharma SA', destination: 'Damas, SY', date: '2026-03-04T11:15:00', result: 'blocked' as const, reason: 'Sanctions UE - Syrie', riskLevel: 'critical' },
  { id: 'SCR-003', shipmentRef: 'EXP-2026-0425', client: 'MedTech Algérie', destination: 'Moscou, RU', date: '2026-03-04T14:00:00', result: 'flagged' as const, reason: 'Sanctions sectorielles - vérification article requise', riskLevel: 'high' },
  { id: 'SCR-004', shipmentRef: 'EXP-2026-0430', client: 'Couscous Express', destination: 'Paris, FR', date: '2026-03-04T15:20:00', result: 'cleared' as const, reason: 'Aucune restriction détectée', riskLevel: 'low' },
  { id: 'SCR-005', shipmentRef: 'EXP-2026-0435', client: 'Nord Africa Logistics', destination: 'Istanbul, TR', date: '2026-03-04T16:00:00', result: 'cleared' as const, reason: 'Aucune restriction détectée', riskLevel: 'low' },
  { id: 'SCR-006', shipmentRef: 'EXP-2026-0440', client: 'Atlas Import Export', destination: 'Pyongyang, KP', date: '2026-03-03T09:00:00', result: 'blocked' as const, reason: 'Embargo total ONU (KP)', riskLevel: 'critical' },
  { id: 'SCR-007', shipmentRef: 'EXP-2026-0445', client: 'Tech Solutions DZ', destination: 'Minsk, BY', date: '2026-03-03T11:30:00', result: 'flagged' as const, reason: 'Sanctions sectorielles UE - Biélorussie', riskLevel: 'high' },
  { id: 'SCR-008', shipmentRef: 'EXP-2026-0450', client: 'Oasis Trading', destination: 'Dubai, AE', date: '2026-03-03T14:45:00', result: 'cleared' as const, reason: 'Aucune restriction détectée', riskLevel: 'low' },
];

const mockHighRiskCountries = [
  { code: 'NG', name: 'Nigéria', risk: 'fraude', level: 'high' },
  { code: 'GH', name: 'Ghana', risk: 'fraude', level: 'medium' },
  { code: 'CI', name: "Côte d'Ivoire", risk: 'fraude', level: 'medium' },
  { code: 'SN', name: 'Sénégal', risk: 'fraude', level: 'low' },
  { code: 'ML', name: 'Mali', risk: 'fraude', level: 'medium' },
  { code: 'RU', name: 'Russie', risk: 'sanctions', level: 'high' },
  { code: 'IR', name: 'Iran', risk: 'embargo', level: 'critical' },
  { code: 'KP', name: 'Corée du Nord', risk: 'embargo', level: 'critical' },
];

const mockLicenses = [
  { id: 'LIC-001', type: 'Licence import', holder: 'FreightFlow Pro', number: 'IMP-DZ-2026-0012', issuedDate: '2025-06-15', expiryDate: '2026-06-15', status: 'valid' as const },
  { id: 'LIC-002', type: 'Licence export', holder: 'FreightFlow Pro', number: 'EXP-DZ-2026-0087', issuedDate: '2025-03-01', expiryDate: '2026-03-15', status: 'expiring' as const },
  { id: 'LIC-003', type: 'Certificat ADR', holder: 'Transport Express SA', number: 'ADR-2024-456', issuedDate: '2024-09-01', expiryDate: '2026-03-20', status: 'expiring' as const },
  { id: 'LIC-004', type: 'Licence courtier douane', holder: 'Douane Services Plus', number: 'BC-DZ-2025-033', issuedDate: '2025-01-10', expiryDate: '2026-01-10', status: 'expired' as const },
  { id: 'LIC-005', type: 'Certificat IATA', holder: 'Air Cargo Algérie', number: 'IATA-23-89012', issuedDate: '2025-07-01', expiryDate: '2027-07-01', status: 'valid' as const },
  { id: 'LIC-006', type: 'Licence import', holder: 'MedTech Algérie', number: 'IMP-DZ-2026-0045', issuedDate: '2025-04-20', expiryDate: '2026-04-20', status: 'valid' as const },
  { id: 'LIC-007', type: 'Certificat ADR', holder: 'FreightFlow Pro', number: 'ADR-2025-789', issuedDate: '2025-02-01', expiryDate: '2026-02-28', status: 'expired' as const },
  { id: 'LIC-008', type: 'Licence export', holder: 'Atlas Shipping', number: 'EXP-DZ-2026-0112', issuedDate: '2025-08-15', expiryDate: '2026-08-15', status: 'valid' as const },
  { id: 'LIC-009', type: 'Certificat IATA', holder: 'FreightFlow Pro', number: 'IATA-24-55432', issuedDate: '2025-05-10', expiryDate: '2026-05-10', status: 'valid' as const },
  { id: 'LIC-010', type: 'Licence courtier douane', holder: 'ClearPort Agency', number: 'BC-DZ-2025-078', issuedDate: '2025-03-15', expiryDate: '2026-04-30', status: 'expiring' as const },
  { id: 'LIC-011', type: 'Licence import', holder: 'Pharma Dist DZ', number: 'IMP-DZ-2025-0099', issuedDate: '2024-12-01', expiryDate: '2025-12-01', status: 'expired' as const },
  { id: 'LIC-012', type: 'Certificat ADR', holder: 'Sahara Logistics', number: 'ADR-2025-1023', issuedDate: '2025-10-01', expiryDate: '2027-10-01', status: 'valid' as const },
];

const mockKYCClients = [
  { id: 'KYC-001', name: 'SARL AlgerTrade', level: 'full' as const, docsProvided: 8, docsRequired: 8, lastCheck: '2026-02-28', status: 'verified' as const, riskClass: 'faible' },
  { id: 'KYC-002', name: 'Global Pharma SA', level: 'enhanced' as const, docsProvided: 6, docsRequired: 8, lastCheck: '2026-03-01', status: 'verified' as const, riskClass: 'moyen' },
  { id: 'KYC-003', name: 'MedTech Algérie', level: 'basic' as const, docsProvided: 3, docsRequired: 5, lastCheck: '2026-01-15', status: 'expired' as const, riskClass: 'élevé' },
  { id: 'KYC-004', name: 'Couscous Express', level: 'full' as const, docsProvided: 7, docsRequired: 7, lastCheck: '2026-03-02', status: 'verified' as const, riskClass: 'faible' },
  { id: 'KYC-005', name: 'Nord Africa Logistics', level: 'enhanced' as const, docsProvided: 5, docsRequired: 7, lastCheck: '2026-02-20', status: 'pending' as const, riskClass: 'moyen' },
  { id: 'KYC-006', name: 'Atlas Import Export', level: 'basic' as const, docsProvided: 2, docsRequired: 5, lastCheck: '2025-12-10', status: 'expired' as const, riskClass: 'élevé' },
  { id: 'KYC-007', name: 'Tech Solutions DZ', level: 'enhanced' as const, docsProvided: 6, docsRequired: 7, lastCheck: '2026-03-03', status: 'pending' as const, riskClass: 'moyen' },
  { id: 'KYC-008', name: 'Oasis Trading', level: 'full' as const, docsProvided: 9, docsRequired: 9, lastCheck: '2026-02-25', status: 'verified' as const, riskClass: 'faible' },
  { id: 'KYC-009', name: 'Pharma Dist DZ', level: 'enhanced' as const, docsProvided: 5, docsRequired: 8, lastCheck: '2026-01-20', status: 'pending' as const, riskClass: 'élevé' },
  { id: 'KYC-010', name: 'Sahara Logistics', level: 'basic' as const, docsProvided: 3, docsRequired: 5, lastCheck: '2025-11-30', status: 'expired' as const, riskClass: 'élevé' },
  { id: 'KYC-011', name: 'ClearPort Agency', level: 'full' as const, docsProvided: 8, docsRequired: 8, lastCheck: '2026-03-01', status: 'verified' as const, riskClass: 'faible' },
  { id: 'KYC-012', name: 'Air Cargo Algérie', level: 'enhanced' as const, docsProvided: 7, docsRequired: 7, lastCheck: '2026-02-15', status: 'verified' as const, riskClass: 'moyen' },
];

// ─── Helper functions ──────────────────────────────────────────

function formatDate(d: string | undefined): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return d;
  }
}

function formatDateTime(d: string | undefined): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return d;
  }
}

function getLicenseExpiryStatus(expiryDate: string): 'valid' | 'expiring' | 'expired' {
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays < 30) return 'expiring'; // actually we need "urgent" but we map it
  return 'valid';
}

// ─── Main Component ────────────────────────────────────────────

export default function CompliancePage() {
  const { user } = useCargoStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Règles Métier state ──
  const [rules, setRules] = useState<BusinessRule[]>(allBusinessRules);
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('all');
  const [ruleSeverityFilter, setRuleSeverityFilter] = useState<string>('all');
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null);
  const [ruleTestResult, setRuleTestResult] = useState<RuleResult | null>(null);
  const [isTestingRule, setIsTestingRule] = useState(false);

  // ── Sanctions state ──
  const [showSanctionsDialog, setShowSanctionsDialog] = useState(false);
  const [sanctionsCheckClient, setSanctionsCheckClient] = useState('');
  const [sanctionsCheckDest, setSanctionsCheckDest] = useState('');
  const [sanctionsCheckResult, setSanctionsCheckResult] = useState<string | null>(null);

  // ── Licences state ──
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>('all');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<string>('all');
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<typeof mockLicenses[0] | null>(null);

  // ── Audit Trail state ──
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(() => {
    if (typeof window !== 'undefined') {
      seedAuditTrail();
      return loadAuditTrail();
    }
    return [];
  });
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('all');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');

  // ── KYC state ──
  const [kycSearch, setKycSearch] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState<string>('all');
  const [kycLevelFilter, setKycLevelFilter] = useState<string>('all');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<typeof mockKYCClients[0] | null>(null);

  // ── Computed values ──

  const categoryStats = useMemo(() => getRuleCategoryStats(), [rules]);

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchSearch = ruleSearch === '' ||
        rule.name.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        rule.id.toLowerCase().includes(ruleSearch.toLowerCase());
      const matchCategory = ruleCategoryFilter === 'all' || rule.category === ruleCategoryFilter;
      const matchSeverity = ruleSeverityFilter === 'all' || rule.severity === ruleSeverityFilter;
      return matchSearch && matchCategory && matchSeverity;
    });
  }, [rules, ruleSearch, ruleCategoryFilter, ruleSeverityFilter]);

  const complianceScore = useMemo(() => {
    const enabledRules = rules.filter(r => r.enabled);
    const criticalActive = enabledRules.filter(r => r.severity === 'critical').length;
    const totalEnabled = enabledRules.length;
    // Score based on enabled ratio and critical rules coverage
    const baseScore = Math.round((totalEnabled / rules.length) * 70);
    const criticalBonus = criticalActive > 0 ? 30 : 0;
    return Math.min(100, baseScore + criticalBonus);
  }, [rules]);

  const activeRulesCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);
  const violationsThisMonth = 3;
  const expiredDocs = useMemo(() => mockLicenses.filter(l => l.status === 'expired').length, []);
  const pendingApprovals = 4;
  const plannedAudits = 2;

  const filteredLicenses = useMemo(() => {
    return mockLicenses.filter(lic => {
      const matchType = licenseTypeFilter === 'all' || lic.type === licenseTypeFilter;
      let matchStatus = true;
      if (licenseStatusFilter !== 'all') {
        if (licenseStatusFilter === 'valid') matchStatus = lic.status === 'valid';
        else if (licenseStatusFilter === 'expiring') matchStatus = lic.status === 'expiring';
        else if (licenseStatusFilter === 'expired') matchStatus = lic.status === 'expired';
      }
      return matchType && matchStatus;
    });
  }, [licenseTypeFilter, licenseStatusFilter]);

  const filteredAuditEntries = useMemo(() => {
    return auditEntries.filter(entry => {
      const matchAction = auditActionFilter === 'all' || entry.action === auditActionFilter;
      const matchSeverity = auditSeverityFilter === 'all' || entry.severity === auditSeverityFilter;
      const matchFrom = !auditDateFrom || entry.timestamp >= auditDateFrom;
      const matchTo = !auditDateTo || entry.timestamp <= auditDateTo + 'T23:59:59';
      return matchAction && matchSeverity && matchFrom && matchTo;
    });
  }, [auditEntries, auditActionFilter, auditSeverityFilter, auditDateFrom, auditDateTo]);

  const filteredKYCClients = useMemo(() => {
    return mockKYCClients.filter(client => {
      const matchSearch = kycSearch === '' ||
        client.name.toLowerCase().includes(kycSearch.toLowerCase());
      const matchStatus = kycStatusFilter === 'all' || client.status === kycStatusFilter;
      const matchLevel = kycLevelFilter === 'all' || client.level === kycLevelFilter;
      return matchSearch && matchStatus && matchLevel;
    });
  }, [kycSearch, kycStatusFilter, kycLevelFilter]);

  // ── Handlers ──

  const handleToggleRule = useCallback((ruleId: string, enabled: boolean) => {
    toggleRule(ruleId, enabled);
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r));
  }, []);

  const handleTestRule = useCallback((rule: BusinessRule) => {
    setIsTestingRule(true);
    setRuleTestResult(null);
    // Simulate test evaluation with sample context
    setTimeout(() => {
      const testContext: RuleContext = {
        data: { weightKg: 15, lengthCm: 60, widthCm: 40, heightCm: 30, isInternational: true, declaredValue: 75000 },
        userRole: 'agent',
        module: 'parcels',
        action: 'create',
      };
      try {
        const result = rule.evaluate(testContext);
        setRuleTestResult(result);
      } catch {
        setRuleTestResult({
          passed: true,
          ruleId: rule.id,
          message: 'Test exécuté — règle non applicable au contexte de test',
          severity: 'info',
        });
      }
      setIsTestingRule(false);
    }, 600);
  }, []);

  const handleSanctionsCheck = useCallback(() => {
    const dest = sanctionsCheckDest.toUpperCase();
    const isEmbargoed = EMBARGOED_COUNTRIES.some(c => dest.includes(c));
    const isHighRisk = HIGH_RISK_COUNTRIES.some(c => dest.includes(c));
    if (isEmbargoed) {
      setSanctionsCheckResult(`BLOQUÉ: La destination "${sanctionsCheckDest}" est sous embargo. Toute expédition est interdite.`);
    } else if (isHighRisk) {
      setSanctionsCheckResult(`ATTENTION: La destination "${sanctionsCheckDest}" est classée comme pays à haut risque. Vérification renforcée requise.`);
    } else {
      setSanctionsCheckResult(`AUTORISÉ: Aucune restriction détectée pour la destination "${sanctionsCheckDest}". Vérification KYC du client "${sanctionsCheckClient}" recommandée.`);
    }
  }, [sanctionsCheckClient, sanctionsCheckDest]);

  const handleExportAudit = useCallback(() => {
    const csv = [
      ['Date', 'Utilisateur', 'Action', 'Module', 'Détails', 'Sévérité', 'Résultat'].join(';'),
      ...filteredAuditEntries.map(e => [
        formatDateTime(e.timestamp),
        e.userName,
        auditActionLabels[e.action] || e.action,
        e.module,
        e.details.replace(/;/g, ','),
        auditSeverityLabels[e.severity] || e.severity,
        auditResultLabels[e.result] || e.result,
      ].join(';'))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredAuditEntries]);

  // ─── Render helpers ──

  const screeningResultColors: Record<string, string> = {
    cleared: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    flagged: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const screeningResultLabels: Record<string, string> = {
    cleared: 'Conforme',
    flagged: 'Signalé',
    blocked: 'Bloqué',
  };

  const kycLevelLabels: Record<string, string> = { basic: 'Base', enhanced: 'Renforcé', full: 'Complet' };
  const kycLevelColors: Record<string, string> = {
    basic: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    enhanced: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    full: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  const kycStatusColors: Record<string, string> = {
    verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  const kycStatusLabels: Record<string, string> = { verified: 'Vérifié', pending: 'En attente', expired: 'Expiré' };

  const riskClassColors: Record<string, string> = {
    faible: 'text-green-600 dark:text-green-400',
    moyen: 'text-amber-600 dark:text-amber-400',
    élevé: 'text-red-600 dark:text-red-400',
  };

  // ─── Dashboard KPIs ──

  const dashboardKPIs = [
    { title: 'Score de conformité', value: `${complianceScore}%`, icon: Shield, color: complianceScore >= 80 ? 'from-green-500 to-emerald-600' : complianceScore >= 60 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600', subtitle: complianceScore >= 80 ? 'Bon' : complianceScore >= 60 ? 'À améliorer' : 'Critique' },
    { title: 'Règles actives', value: `${activeRulesCount}/${rules.length}`, icon: Scale, color: 'from-teal-500 to-teal-600', subtitle: 'règles métier' },
    { title: 'Violations ce mois', value: violationsThisMonth, icon: AlertTriangle, color: violationsThisMonth > 5 ? 'from-red-500 to-rose-600' : 'from-amber-500 to-orange-600', subtitle: violationsThisMonth === 0 ? 'Aucune' : 'À surveiller' },
    { title: 'Documents expirés', value: expiredDocs, icon: FileCheck, color: expiredDocs > 0 ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600', subtitle: expiredDocs === 0 ? 'Tous valides' : 'Renouvellement requis' },
    { title: 'Approbations en attente', value: pendingApprovals, icon: Clock, color: 'from-orange-500 to-amber-600', subtitle: 'à traiter' },
    { title: 'Audits planifiés', value: plannedAudits, icon: Calendar, color: 'from-sky-500 to-sky-600', subtitle: 'ce trimestre' },
  ];

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-500" />
            Conformité Réglementaire
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestion de la conformité, sanctions, licences et KYC — FreightFlow Pro
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
            <TabsTrigger value="dashboard" className="text-xs py-2">Tableau de Bord</TabsTrigger>
            <TabsTrigger value="rules" className="text-xs py-2">Règles Métier</TabsTrigger>
            <TabsTrigger value="sanctions" className="text-xs py-2">Sanctions & Embargo</TabsTrigger>
            <TabsTrigger value="licenses" className="text-xs py-2">Licences & Certificats</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs py-2">Audit Trail</TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs py-2">KYC</TabsTrigger>
          </TabsList>
        </div>

        {/* ════════════════════════════════════════════════════════
            TAB 1: TABLEAU DE BORD
            ════════════════════════════════════════════════════════ */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {dashboardKPIs.map((kpi, index) => (
              <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{kpi.title}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                        <p className="text-[10px] text-gray-400">{kpi.subtitle}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                        <kpi.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Compliance Score Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-500" />
                  Score de conformité global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${complianceScore * 2.51} 251`}
                          className={complianceScore >= 80 ? 'text-green-500' : complianceScore >= 60 ? 'text-amber-500' : 'text-red-500'}
                          stroke="currentColor"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">{complianceScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-lg font-bold text-green-600">{activeRulesCount}</p>
                      <p className="text-[10px] text-green-700 dark:text-green-400">Actives</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <p className="text-lg font-bold text-amber-600">{rules.filter(r => !r.enabled).length}</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">Désactivées</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <p className="text-lg font-bold text-red-600">{rules.filter(r => r.severity === 'critical' && r.enabled).length}</p>
                      <p className="text-[10px] text-red-700 dark:text-red-400">Critiques</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-violet-500" />
                  Règles par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {Object.entries(categoryStats).filter(([, s]) => s.count > 0).map(([cat, stats]) => (
                      <div key={cat} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <Badge variant="secondary" className={`text-[9px] min-w-[80px] justify-center ${categoryColors[cat as RuleCategory]}`}>
                          {categoryLabels[cat as RuleCategory]}
                        </Badge>
                        <div className="flex-1">
                          <Progress value={(stats.enabled / stats.count) * 100} className="h-2" />
                        </div>
                        <span className="text-xs text-gray-500 min-w-[50px] text-right">{stats.enabled}/{stats.count}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { msg: 'Certificat ADR de Transport Express SA expire le 20 mars 2026', severity: 'warning', time: 'Il y a 2h' },
                  { msg: 'Licence courtier douane Douane Services Plus a expiré', severity: 'critical', time: 'Il y a 5h' },
                  { msg: 'Vérification KYC de MedTech Algérie expirée depuis le 15/01', severity: 'warning', time: 'Il y a 1j' },
                  { msg: 'Tentative d\'expédition vers Iran (embargo) bloquée', severity: 'critical', time: 'Il y a 1j' },
                  { msg: '3 violations de règles ce mois — seuil d\'alerte atteint', severity: 'warning', time: 'Il y a 2j' },
                ].map((alert, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex-1">{alert.msg}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{alert.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
            TAB 2: RÈGLES MÉTIER
            ════════════════════════════════════════════════════════ */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom ou ID de règle..."
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={ruleCategoryFilter} onValueChange={setRuleCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={ruleSeverityFilter} onValueChange={setRuleSeverityFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Sévérité" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes sévérités</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Category Stats Summary */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {Object.entries(categoryStats).filter(([, s]) => s.count > 0).map(([cat, stats]) => (
              <div key={cat} className={`p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-center cursor-pointer hover:shadow-sm transition-all ${ruleCategoryFilter === cat ? 'ring-2 ring-teal-500' : ''}`}
                onClick={() => setRuleCategoryFilter(ruleCategoryFilter === cat ? 'all' : cat)}
              >
                <Badge variant="secondary" className={`text-[8px] mb-1 ${categoryColors[cat as RuleCategory]}`}>
                  {categoryLabels[cat as RuleCategory]}
                </Badge>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.enabled}/{stats.count}</p>
              </div>
            ))}
          </div>

          {/* Rules Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Nom</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Catégorie</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Sévérité</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Applique à</TableHead>
                      <TableHead className="text-xs text-center">Actif</TableHead>
                      <TableHead className="text-xs text-right">Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10">
                        <TableCell className="font-mono text-[10px] font-semibold text-teal-600">{rule.id}</TableCell>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">{rule.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={`text-[9px] ${categoryColors[rule.category]}`}>
                            {categoryLabels[rule.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className={`text-[9px] ${severityColors[rule.severity]}`}>
                            {severityLabels[rule.severity]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {rule.appliesTo.slice(0, 2).map(m => (
                              <Badge key={m} variant="outline" className="text-[8px] px-1 py-0">{m}</Badge>
                            ))}
                            {rule.appliesTo.length > 2 && (
                              <Badge variant="outline" className="text-[8px] px-1 py-0">+{rule.appliesTo.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setSelectedRule(rule); setRuleTestResult(null); }}>
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">{filteredRules.length} règle(s) affichée(s) sur {rules.length}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rule Detail Dialog */}
          <Dialog open={!!selectedRule} onOpenChange={() => setSelectedRule(null)}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              {selectedRule && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                      <Scale className="w-5 h-5 text-teal-500" />
                      {selectedRule.name}
                    </DialogTitle>
                    <DialogDescription>Détails de la règle métier</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] ${categoryColors[selectedRule.category]}`}>
                        {categoryLabels[selectedRule.category]}
                      </Badge>
                      <Badge variant="secondary" className={`text-[10px] ${severityColors[selectedRule.severity]}`}>
                        {severityLabels[selectedRule.severity]}
                      </Badge>
                      <Badge variant="secondary" className={`text-[10px] ${selectedRule.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {selectedRule.enabled ? 'Active' : 'Désactivée'}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">ID</Label>
                      <p className="text-sm font-mono">{selectedRule.id}</p>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Description</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRule.description}</p>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Modules concernés</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRule.appliesTo.map(m => (
                          <Badge key={m} variant="outline" className="text-[9px]">{m}</Badge>
                        ))}
                      </div>
                    </div>

                    {selectedRule.tags && selectedRule.tags.length > 0 && (
                      <div>
                        <Label className="text-xs text-gray-500">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRule.tags.map(t => (
                            <Badge key={t} variant="secondary" className="text-[9px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRule.version && (
                      <div>
                        <Label className="text-xs text-gray-500">Version</Label>
                        <p className="text-sm">{selectedRule.version}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Test Evaluation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Test d&apos;évaluation
                        </Label>
                        <Button size="sm" className="h-7 text-[10px]" onClick={() => handleTestRule(selectedRule)} disabled={isTestingRule}>
                          {isTestingRule ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                          Exécuter le test
                        </Button>
                      </div>
                      {ruleTestResult && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border ${ruleTestResult.passed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {ruleTestResult.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            <span className="text-sm font-medium">{ruleTestResult.passed ? 'Conforme' : 'Non conforme'}</span>
                            <Badge variant="secondary" className={`text-[9px] ${severityColors[ruleTestResult.severity]}`}>
                              {severityLabels[ruleTestResult.severity]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{ruleTestResult.message}</p>
                          {ruleTestResult.suggestions && ruleTestResult.suggestions.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <Label className="text-[10px] text-gray-500">Suggestions :</Label>
                              {ruleTestResult.suggestions.map((s, i) => (
                                <p key={i} className="text-[10px] text-gray-600 dark:text-gray-400 pl-2">• {s}</p>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
            TAB 3: SANCTIONS & EMBARGO
            ════════════════════════════════════════════════════════ */}
        <TabsContent value="sanctions" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Embargo List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" />
                  Liste d&apos;embargo par pays
                </CardTitle>
                <CardDescription>Pays sous sanctions ou embargo en vigueur</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <div className="space-y-2">
                    {mockEmbargoList.map((item) => (
                      <div key={item.code} className="p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.country}</span>
                            <Badge variant="secondary" className="text-[8px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-mono">{item.code}</Badge>
                          </div>
                          <Badge variant="secondary" className={`text-[9px] ${item.type === 'Embargo total' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : item.type === 'Embargo partiel' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Autorité: {item.authority} | Depuis: {formatDate(item.since)}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5">{item.restrictions}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* High-Risk Countries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Pays à haut risque
                </CardTitle>
                <CardDescription>Classification par niveau de risque</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockHighRiskCountries.map((item) => (
                    <div key={item.code} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                        <Badge variant="secondary" className="text-[8px] font-mono bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{item.code}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[9px] ${item.risk === 'embargo' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : item.risk === 'sanctions' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {item.risk === 'embargo' ? 'Embargo' : item.risk === 'sanctions' ? 'Sanctions' : 'Fraude'}
                        </Badge>
                        <Badge variant="secondary" className={`text-[9px] ${item.level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : item.level === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {item.level === 'critical' ? 'Critique' : item.level === 'high' ? 'Élevé' : 'Moyen'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Sanctions Check Action */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Search className="w-4 h-4 text-teal-500" />
                    Vérification sanctions
                  </Label>
                  <div className="space-y-2">
                    <Input placeholder="Nom du client" value={sanctionsCheckClient} onChange={e => setSanctionsCheckClient(e.target.value)} className="h-9" />
                    <Input placeholder="Destination (pays ou code, ex: IR, Russie)" value={sanctionsCheckDest} onChange={e => setSanctionsCheckDest(e.target.value)} className="h-9" />
                    <Button className="w-full text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleSanctionsCheck} disabled={!sanctionsCheckClient || !sanctionsCheckDest}>
                      <Shield className="w-4 h-4 mr-2" />
                      Vérifier
                    </Button>
                  </div>
                  {sanctionsCheckResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`p-3 rounded-lg text-xs ${sanctionsCheckResult.includes('BLOQUÉ') ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : sanctionsCheckResult.includes('ATTENTION') ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}
                    >
                      {sanctionsCheckResult}
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sanctions Screenings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                Résultats de screening récents
              </CardTitle>
              <CardDescription>Vérifications de sanctions pour les expéditions récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Réf.</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Destination</TableHead>
                      <TableHead className="text-xs">Résultat</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Motif</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSanctionsScreenings.map((scr) => (
                      <TableRow key={scr.id}>
                        <TableCell className="font-mono text-[10px] font-semibold">{scr.shipmentRef}</TableCell>
                        <TableCell className="text-xs">{scr.client}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{scr.destination}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[9px] ${screeningResultColors[scr.result]}`}>
                            {screeningResultLabels[scr.result]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-gray-500 max-w-[200px] truncate hidden md:table-cell">{scr.reason}</TableCell>
                        <TableCell className="text-[10px] text-gray-400 hidden lg:table-cell">{formatDateTime(scr.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
            TAB 4: LICENCES & CERTIFICATS
            ════════════════════════════════════════════════════════ */}
        <TabsContent value="licenses" className="space-y-4 mt-4">
          {/* Expiry Alerts */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-red-200 dark:border-red-900/30">
              <CardContent className="p-3 text-center">
                <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-600">{mockLicenses.filter(l => l.status === 'expired').length}</p>
                <p className="text-[10px] text-red-600">Expirés</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-600">{mockLicenses.filter(l => l.status === 'expiring').length}</p>
                <p className="text-[10px] text-amber-600">Bientôt expirés</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-900/30">
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-600">{mockLicenses.filter(l => l.status === 'valid').length}</p>
                <p className="text-[10px] text-green-600">Valides</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-9"><SelectValue placeholder="Type de document" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="Licence import">Licence import</SelectItem>
                    <SelectItem value="Licence export">Licence export</SelectItem>
                    <SelectItem value="Certificat ADR">Certificat ADR</SelectItem>
                    <SelectItem value="Licence courtier douane">Licence courtier douane</SelectItem>
                    <SelectItem value="Certificat IATA">Certificat IATA</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={licenseStatusFilter} onValueChange={setLicenseStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="valid">Valide</SelectItem>
                    <SelectItem value="expiring">Bientôt expiré</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Licenses Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Titulaire</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">N°</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Émission</TableHead>
                      <TableHead className="text-xs">Expiration</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLicenses.map((lic) => {
                      const daysToExpiry = Math.ceil((new Date(lic.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      let statusBadge: string;
                      let statusClass: string;
                      if (daysToExpiry < 0) {
                        statusBadge = 'Expiré';
                        statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                      } else if (daysToExpiry < 30) {
                        statusBadge = `Expire dans ${daysToExpiry}j`;
                        statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                      } else if (daysToExpiry < 90) {
                        statusBadge = `Expire dans ${daysToExpiry}j`;
                        statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                      } else {
                        statusBadge = 'Valide';
                        statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                      }

                      return (
                        <TableRow key={lic.id}>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {lic.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{lic.holder}</TableCell>
                          <TableCell className="font-mono text-[10px] hidden sm:table-cell">{lic.number}</TableCell>
                          <TableCell className="text-xs text-gray-500 hidden md:table-cell">{formatDate(lic.issuedDate)}</TableCell>
                          <TableCell className="text-xs">{formatDate(lic.expiryDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] ${statusClass}`}>{statusBadge}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setSelectedLicense(lic); setShowRenewDialog(true); }}>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Renouveler
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">{filteredLicenses.length} document(s) réglementaire(s)</p>
              </div>
            </CardContent>
          </Card>

          {/* Renew Dialog */}
          <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
            <DialogContent className="max-w-md">
              {selectedLicense && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-teal-500" />
                      Renouvellement de document
                    </DialogTitle>
                    <DialogDescription>Demande de renouvellement</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-medium">{selectedLicense.type}</p>
                      <p className="text-xs text-gray-500 mt-1">Titulaire</p>
                      <p className="text-sm font-medium">{selectedLicense.holder}</p>
                      <p className="text-xs text-gray-500 mt-1">N° Document</p>
                      <p className="text-sm font-mono">{selectedLicense.number}</p>
                      <p className="text-xs text-gray-500 mt-1">Date d&apos;expiration</p>
                      <p className="text-sm font-medium text-red-600">{formatDate(selectedLicense.expiryDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20">
                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">La demande de renouvellement sera envoyée au service compétent. Délai estimé: 5-15 jours ouvrés.</p>
                    </div>
                    <Button className="w-full text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowRenewDialog(false)}>
                      <Send className="w-4 h-4 mr-2" />
                      Confirmer le renouvellement
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
            TAB 5: AUDIT TRAIL
            ════════════════════════════════════════════════════════ */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Action" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes actions</SelectItem>
                      {Object.entries(auditActionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={auditSeverityFilter} onValueChange={setAuditSeverityFilter}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Sévérité" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes sévérités</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="high">Élevé</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={auditDateFrom} onChange={e => setAuditDateFrom(e.target.value)} className="h-9" placeholder="Du" />
                  <Input type="date" value={auditDateTo} onChange={e => setAuditDateTo(e.target.value)} className="h-9" placeholder="Au" />
                </div>
                <Button variant="outline" className="h-9" onClick={handleExportAudit} disabled={filteredAuditEntries.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date/Heure</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Utilisateur</TableHead>
                      <TableHead className="text-xs">Action</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Module</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Détails</TableHead>
                      <TableHead className="text-xs">Sévérité</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Résultat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                          Aucune entrée d&apos;audit trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditEntries.slice(0, 50).map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-[10px] text-gray-500 whitespace-nowrap">{formatDateTime(entry.timestamp)}</TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">{entry.userName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {auditActionLabels[entry.action] || entry.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell text-gray-500">{entry.module}</TableCell>
                          <TableCell className="text-[10px] text-gray-500 max-w-[200px] truncate hidden lg:table-cell">{entry.details}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-[9px] ${auditSeverityColors[entry.severity] || ''}`}>
                              {auditSeverityLabels[entry.severity] || entry.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className={`text-[9px] ${auditResultColors[entry.result] || ''}`}>
                              {auditResultLabels[entry.result] || entry.result}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-xs text-gray-500">{filteredAuditEntries.length} entrée(s) d&apos;audit</p>
                {filteredAuditEntries.length > 50 && (
                  <p className="text-xs text-gray-400">Affichage des 50 premières</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
            TAB 6: KYC
            ════════════════════════════════════════════════════════ */}
        <TabsContent value="kyc" className="space-y-4 mt-4">
          {/* KYC Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <ShieldCheck className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-600">{mockKYCClients.filter(c => c.status === 'verified').length}</p>
                <p className="text-[10px] text-gray-500">Vérifiés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-600">{mockKYCClients.filter(c => c.status === 'pending').length}</p>
                <p className="text-[10px] text-gray-500">En attente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <ShieldX className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-600">{mockKYCClients.filter(c => c.status === 'expired').length}</p>
                <p className="text-[10px] text-gray-500">Expirés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-orange-600">{mockKYCClients.filter(c => c.riskClass === 'élevé').length}</p>
                <p className="text-[10px] text-gray-500">Risque élevé</p>
              </CardContent>
            </Card>
          </div>

          {/* KYC Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Rechercher un client..." value={kycSearch} onChange={e => setKycSearch(e.target.value)} className="pl-9 h-9" />
                </div>
                <Select value={kycStatusFilter} onValueChange={setKycStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="verified">Vérifié</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={kycLevelFilter} onValueChange={setKycLevelFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="basic">Base</SelectItem>
                    <SelectItem value="enhanced">Renforcé</SelectItem>
                    <SelectItem value="full">Complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* KYC Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredKYCClients.map((client, index) => (
              <motion.div key={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className={`border-l-4 ${client.status === 'verified' ? 'border-l-green-500' : client.status === 'pending' ? 'border-l-amber-500' : 'border-l-red-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${client.status === 'verified' ? 'bg-green-100 dark:bg-green-900/30' : client.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {client.status === 'verified' ? <ShieldCheck className="w-4 h-4 text-green-500" /> : client.status === 'pending' ? <Clock className="w-4 h-4 text-amber-500" /> : <ShieldX className="w-4 h-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{client.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400">Niveau KYC</p>
                        <Badge variant="secondary" className={`text-[9px] ${kycLevelColors[client.level]}`}>
                          {kycLevelLabels[client.level]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Statut</p>
                        <Badge variant="secondary" className={`text-[9px] ${kycStatusColors[client.status]}`}>
                          {kycStatusLabels[client.status]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Documents</p>
                        <p className="text-xs font-medium">{client.docsProvided}/{client.docsRequired}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Dernière vérif.</p>
                        <p className="text-xs">{formatDate(client.lastCheck)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-400">Risque:</p>
                        <span className={`text-xs font-semibold ${riskClassColors[client.riskClass]}`}>{client.riskClass}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setSelectedKyc(client); setShowVerifyDialog(true); }}
                        disabled={client.status === 'verified'}>
                        <Shield className="w-3 h-3 mr-1" />
                        {client.status === 'verified' ? 'Vérifié' : 'Vérifier'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* KYC Verify Dialog */}
          <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
            <DialogContent className="max-w-md">
              {selectedKyc && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-500" />
                      Vérification KYC — {selectedKyc.name}
                    </DialogTitle>
                    <DialogDescription>Lancer ou renouveler la vérification client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Niveau actuel</span>
                        <Badge variant="secondary" className={`text-[9px] ${kycLevelColors[selectedKyc.level]}`}>{kycLevelLabels[selectedKyc.level]}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Statut</span>
                        <Badge variant="secondary" className={`text-[9px] ${kycStatusColors[selectedKyc.status]}`}>{kycStatusLabels[selectedKyc.status]}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Documents</span>
                        <span className="text-xs font-medium">{selectedKyc.docsProvided}/{selectedKyc.docsRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Classification risque</span>
                        <span className={`text-xs font-semibold ${riskClassColors[selectedKyc.riskClass]}`}>{selectedKyc.riskClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Dernière vérification</span>
                        <span className="text-xs">{formatDate(selectedKyc.lastCheck)}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Niveau de vérification cible</Label>
                      <Select defaultValue={selectedKyc.level === 'basic' ? 'enhanced' : 'full'}>
                        <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Base — identité et adresse</SelectItem>
                          <SelectItem value="enhanced">Renforcé — + source de fonds, activités</SelectItem>
                          <SelectItem value="full">Complet — + vérification sur site, références</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded bg-teal-50 dark:bg-teal-900/20">
                      <Info className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <p className="text-[10px] text-teal-700 dark:text-teal-400">La vérification sera initiée et le client sera notifié pour fournir les documents manquants.</p>
                    </div>

                    <Button className="w-full text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowVerifyDialog(false)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Démarrer la vérification
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
