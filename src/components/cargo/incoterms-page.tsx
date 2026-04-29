'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Ship,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Info,
  Calculator,
  BarChart3,
  BookOpen,
  ChevronDown,
  Scale,
  Package,
  TrendingUp,
  DollarSign,
  Activity,
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCargoStore } from '@/lib/cargo-store';

// ─── Static Data ───────────────────────────────────────────────────────────

type IncotermCategory = 'maritime' | 'multimodal';

interface IncotermDef {
  code: string;
  fullName: string;
  description: string;
  category: IncotermCategory;
  riskTransferPoint: string;
  usageTip: string;
}

const incoterms: IncotermDef[] = [
  {
    code: 'EXW',
    fullName: 'Ex Works',
    description: "Le vendeur met la marchandise à disposition dans ses locaux. L'acheteur supporte tous les coûts et risques.",
    category: 'multimodal',
    riskTransferPoint: 'Locaux du vendeur',
    usageTip: 'Minimum de responsabilité pour le vendeur. Idéal si l\'acheteur gère toute la logistique.',
  },
  {
    code: 'FCA',
    fullName: 'Free Carrier',
    description: "Le vendeur livre la marchandise au transporteur désigné par l'acheteur au lieu convenu.",
    category: 'multimodal',
    riskTransferPoint: 'Remise au transporteur',
    usageTip: 'Alternative multimodale au FOB. Recommandé pour le transport conteneurisé.',
  },
  {
    code: 'CPT',
    fullName: 'Carriage Paid To',
    description: "Le vendeur paie le transport jusqu'à la destination, mais le risque est transféré à la remise au transporteur.",
    category: 'multimodal',
    riskTransferPoint: 'Remise au premier transporteur',
    usageTip: 'Le vendeur choisit le transport mais ne contrôle pas le risque en cours de route.',
  },
  {
    code: 'CIP',
    fullName: 'Carriage Insurance Paid To',
    description: "Comme CPT, mais le vendeur doit aussi fournir une assurance transport couvrant la marchandise.",
    category: 'multimodal',
    riskTransferPoint: 'Remise au premier transporteur',
    usageTip: 'Similaire à CIF mais pour tout mode de transport. Assurance obligatoire (110% de la valeur CIP).',
  },
  {
    code: 'DAP',
    fullName: 'Delivered At Place',
    description: "Le vendeur livre la marchandise à destination, non dédouanée, prête à être déchargée.",
    category: 'multimodal',
    riskTransferPoint: 'Lieu de destination convenu',
    usageTip: 'Le vendeur gère le transport jusqu\'à destination. L\'acheteur fait le dédouanement import.',
  },
  {
    code: 'DPU',
    fullName: 'Delivered At Place Unloaded',
    description: "Le vendeur livre et décharge la marchandise à destination. Seul incoterm où le vendeur décharge.",
    category: 'multimodal',
    riskTransferPoint: 'Après déchargement à destination',
    usageTip: 'Nouveauté Incoterms 2020. Utile si le vendeur peut organiser le déchargement sur place.',
  },
  {
    code: 'DDP',
    fullName: 'Delivered Duty Paid',
    description: "Le vendeur assume tous les coûts et risques, y compris les droits de douane import, jusqu'à destination.",
    category: 'multimodal',
    riskTransferPoint: 'Lieu de destination convenu',
    usageTip: 'Maximum de responsabilité pour le vendeur. L\'acheteur n\'a qu\'à réceptionner la marchandise.',
  },
  {
    code: 'FAS',
    fullName: 'Free Alongside Ship',
    description: "Le vendeur livre la marchandise le long du navire au port d'embarquement désigné.",
    category: 'maritime',
    riskTransferPoint: 'Quai du port de chargement',
    usageTip: 'Uniquement pour transport maritime. Utilisé pour les marchandises en vrac ou lourdes.',
  },
  {
    code: 'FOB',
    fullName: 'Free On Board',
    description: "Le vendeur livre la marchandise à bord du navire au port d'embarquement désigné.",
    category: 'maritime',
    riskTransferPoint: 'À bord du navire au port de chargement',
    usageTip: 'Le plus utilisé pour le maritime. L\'acheteur gère le fret et l\'assurance.',
  },
  {
    code: 'CFR',
    fullName: 'Cost and Freight',
    description: "Le vendeur paie le fret jusqu'au port de destination, mais le risque passe à bord du navire.",
    category: 'maritime',
    riskTransferPoint: 'À bord du navire au port de chargement',
    usageTip: 'Le vendeur paie le fret maritime mais l\'acheteur supporte le risque de perte pendant le trajet.',
  },
  {
    code: 'CIF',
    fullName: 'Cost Insurance Freight',
    description: "Comme CFR, mais le vendeur doit aussi fournir une assurance maritime minimale.",
    category: 'maritime',
    riskTransferPoint: 'À bord du navire au port de chargement',
    usageTip: 'Équivalent maritime du CIP. Assurance obligatoire (110% de la valeur CIF). Très courant.',
  },
];

const costCategories = [
  'Emballage export',
  'Chargement origine',
  'Transport départ',
  'Douanes export',
  'Transport principal',
  'Assurance',
  'Douanes import',
  'Transport arrivée',
  'Déchargement destination',
  'Droits import',
] as const;

// 'V' = Vendeur, 'A' = Acheteur
type CostPayer = 'V' | 'A';

const costMatrix: Record<string, CostPayer[]> = {
  EXW:  ['V','A','A','A','A','A','A','A','A','A'],
  FCA:  ['V','V','V','A','A','A','A','A','A','A'],
  CPT:  ['V','V','V','A','V','A','A','A','A','A'],
  CIP:  ['V','V','V','A','V','V','A','A','A','A'],
  DAP:  ['V','V','V','A','V','V','A','V','A','A'],
  DPU:  ['V','V','V','A','V','V','A','V','V','A'],
  DDP:  ['V','V','V','V','V','V','V','V','V','V'],
  FAS:  ['V','V','A','A','A','A','A','A','A','A'],
  FOB:  ['V','V','V','A','A','A','A','A','A','A'],
  CFR:  ['V','V','V','A','V','A','A','A','A','A'],
  CIF:  ['V','V','V','A','V','V','A','A','A','A'],
};

// Recommender logic
interface Recommendation {
  code: string;
  reason: string;
  details: string;
}

function getRecommendation(
  mode: string,
  direction: string,
  control: string,
  insurance: string
): Recommendation {
  // Maritime
  if (mode === 'Maritime') {
    if (control === 'Vendeur') {
      if (insurance === 'Requise') return { code: 'CIF', reason: 'Le vendeur contrôle le transport maritime et fournit l\'assurance obligatoire.', details: 'CIF est idéal pour les exportations maritimes où le vendeur veut maîtriser le fret et couvrir l\'acheteur avec une assurance.' };
      if (insurance === 'Optionnelle') return { code: 'CFR', reason: 'Le vendeur paie le fret maritime sans obligation d\'assurance.', details: 'CFR convient quand le vendeur veut gérer le fret mais laisse le choix d\'assurance à l\'acheteur.' };
      return { code: 'CFR', reason: 'Le vendeur paie le fret maritime. L\'assurance n\'est pas requise.', details: 'CFR est adapté quand l\'acheteur peut souscrire sa propre assurance.' };
    }
    if (control === 'Acheteur') {
      if (direction === 'Import') return { code: 'FOB', reason: 'L\'acheteur contrôle le fret maritime et l\'assurance depuis le port de chargement.', details: 'FOB est le choix standard pour les importations maritimes où l\'acheteur négocie le fret.' };
      return { code: 'FAS', reason: 'L\'acheteur prend en charge dès le quai du port d\'embarquement.', details: 'FAS convient aux marchandises en vrac où l\'acheteur organise tout le transport maritime.' };
    }
    // Équilibré
    if (insurance === 'Requise') return { code: 'CIF', reason: 'Partage équilibré avec assurance couvrant le transport maritime.', details: 'CIF offre un bon équilibre : le vendeur gère le fret et l\'assurance, l\'acheteur gère l\'arrivée.' };
    return { code: 'FOB', reason: 'Équilibre classique du commerce maritime international.', details: 'FOB est l\'incoterm le plus utilisé, offrant un bon équilibre des responsabilités.' };
  }

  // Aérien / Terrestre / Multimodal
  if (control === 'Vendeur') {
    if (insurance === 'Requise') return { code: 'CIP', reason: 'Le vendeur contrôle le transport et fournit une assurance couvrant la marchandise.', details: 'CIP est l\'équivalent multimodal du CIF avec obligation d\'assurance renforcée (110% valeur CIP).' };
    if (control === 'Vendeur' && direction === 'Export') return { code: 'CPT', reason: 'Le vendeur paie le transport principal sans obligation d\'assurance.', details: 'CPT permet au vendeur de gérer le fret tout en laissant la couverture d\'assurance à l\'acheteur.' };
    return { code: 'DAP', reason: 'Le vendeur gère la livraison jusqu\'à destination.', details: 'DAP est adapté quand le vendeur veut livrer jusqu\'au point de destination sans dédouanement import.' };
  }
  if (control === 'Acheteur') {
    if (direction === 'Import') return { code: 'FCA', reason: 'L\'acheteur prend le contrôle dès la remise au transporteur au départ.', details: 'FCA est l\'alternative multimodale au FOB, recommandée pour le transport conteneurisé et aérien.' };
    return { code: 'EXW', reason: 'L\'acheteur gère l\'intégralité de la logistique depuis les locaux du vendeur.', details: 'EXW est adapté quand l\'acheteur a une forte capacité logistique et veut un prix minimal.' };
  }
  // Équilibré
  if (insurance === 'Requise') return { code: 'CIP', reason: 'Équilibre optimal avec assurance transport fournie par le vendeur.', details: 'CIP offre un bon compromis : le vendeur paie le transport et l\'assurance, l\'acheteur gère l\'arrivée.' };
  if (direction === 'Import') return { code: 'FCA', reason: 'Partage équilibré pour import multimodal.', details: 'FCA permet un transfert de risque clair au premier transporteur, adapté au conteneur et à l\'aérien.' };
  return { code: 'CPT', reason: 'Équilibre entre contrôle vendeur (transport) et responsabilité acheteur (risque).', details: 'CPT permet au vendeur de gérer le transport tout en transférant le risque dès la remise au transporteur.' };
}

// Usage statistics (fictional)
const usageStats = [
  { code: 'FOB', count: 342, percentage: 28 },
  { code: 'CIF', count: 256, percentage: 21 },
  { code: 'EXW', count: 158, percentage: 13 },
  { code: 'DDP', count: 124, percentage: 10 },
  { code: 'FCA', count: 98, percentage: 8 },
  { code: 'CFR', count: 76, percentage: 6 },
  { code: 'CPT', count: 54, percentage: 4 },
  { code: 'DAP', count: 48, percentage: 4 },
  { code: 'CIP', count: 32, percentage: 3 },
  { code: 'FAS', count: 18, percentage: 2 },
  { code: 'DPU', count: 12, percentage: 1 },
];

// Active shipments by incoterm (fictional)
const activeByIncoterm: Record<string, number> = {
  FOB: 47, CIF: 38, EXW: 22, DDP: 18, FCA: 14,
  CFR: 11, CPT: 8, DAP: 7, CIP: 5, FAS: 3, DPU: 2,
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function IncotermsPage() {
  const [tabFilter, setTabFilter] = useState<string>('tous');
  const [recommenderMode, setRecommenderMode] = useState<string>('');
  const [recommenderDirection, setRecommenderDirection] = useState<string>('');
  const [recommenderControl, setRecommenderControl] = useState<string>('');
  const [recommenderInsurance, setRecommenderInsurance] = useState<string>('');
  const [compareLeft, setCompareLeft] = useState<string>('');
  const [compareRight, setCompareRight] = useState<string>('');
  const [selectedIncoterm, setSelectedIncoterm] = useState<IncotermDef | null>(null);

  // Filtered incoterms
  const filteredIncoterms = useMemo(() => {
    if (tabFilter === 'tous') return incoterms;
    return incoterms.filter(i => i.category === tabFilter);
  }, [tabFilter]);

  // Recommendation
  const recommendation = useMemo(() => {
    if (!recommenderMode || !recommenderDirection || !recommenderControl || !recommenderInsurance) return null;
    return getRecommendation(recommenderMode, recommenderDirection, recommenderControl, recommenderInsurance);
  }, [recommenderMode, recommenderDirection, recommenderControl, recommenderInsurance]);

  // Comparison data
  const comparisonData = useMemo(() => {
    if (!compareLeft || !compareRight) return null;
    const left = incoterms.find(i => i.code === compareLeft);
    const right = incoterms.find(i => i.code === compareRight);
    if (!left || !right) return null;
    const leftCosts = costMatrix[compareLeft];
    const rightCosts = costMatrix[compareRight];
    return {
      left,
      right,
      leftCosts,
      rightCosts,
      differences: costCategories.map((cat, idx) => ({
        category: cat,
        left: leftCosts[idx],
        right: rightCosts[idx],
        same: leftCosts[idx] === rightCosts[idx],
      })),
    };
  }, [compareLeft, compareRight]);

  // KPIs
  const kpis = [
    {
      title: 'Total Incoterms',
      value: 11,
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Plus utilisé ce mois',
      value: 'FOB',
      subtitle: '28% des expéditions',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Expéditions actives',
      value: Object.values(activeByIncoterm).reduce((a, b) => a + b, 0),
      icon: Activity,
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Impact revenus estimé',
      value: '2.4M DA',
      icon: DollarSign,
      color: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-500" />
            Incoterms 2020
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Référence et outil de décision pour les termes de livraison
          </p>
        </div>
        <Badge
          className="text-xs px-3 py-1.5 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0"
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          Norme ICC 2020
        </Badge>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                    </p>
                    {kpi.subtitle && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{kpi.subtitle}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── Incoterms 2020 Reference Grid ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-500" />
            Grille de référence Incoterms 2020
          </CardTitle>
          <CardDescription>
            Les 11 termes de livraison internationaux classés par mode de transport
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs value={tabFilter} onValueChange={setTabFilter}>
            <TabsList className="mb-4 h-9">
              <TabsTrigger value="tous" className="text-xs">Tous (11)</TabsTrigger>
              <TabsTrigger value="maritime" className="text-xs flex items-center gap-1">
                <Ship className="w-3.5 h-3.5" />
                Maritime (4)
              </TabsTrigger>
              <TabsTrigger value="multimodal" className="text-xs flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Multimodal (7)
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={tabFilter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              >
                {filteredIncoterms.map((inc, idx) => (
                  <motion.div
                    key={inc.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 h-full"
                      onClick={() => setSelectedIncoterm(inc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              inc.category === 'maritime'
                                ? 'bg-teal-100 dark:bg-teal-900/30'
                                : 'bg-amber-100 dark:bg-amber-900/30'
                            }`}>
                              {inc.category === 'maritime' ? (
                                <Ship className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
                              ) : (
                                <Globe className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{inc.code}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{inc.fullName}</p>
                            </div>
                          </div>
                          <Badge
                            className={`text-[9px] px-1.5 py-0 border-0 ${
                              inc.category === 'maritime'
                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {inc.category === 'maritime' ? 'Maritime' : 'Multimodal'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {inc.description}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-teal-500 flex-shrink-0" />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-200">Risque:</span>{' '}
                              {inc.riskTransferPoint}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Info className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                              {inc.usageTip}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>

      {/* ─── Cost & Responsibility Matrix ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            Matrice des coûts et responsabilités
          </CardTitle>
          <CardDescription>
            Qui paie quoi pour chaque Incoterm —{' '}
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-teal-200 dark:bg-teal-800 inline-block" /> Vendeur
            </span>
            {' / '}
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-800 inline-block" /> Acheteur
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto max-h-96 rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="text-xs font-bold sticky left-0 bg-gray-50 dark:bg-gray-800/50 z-10 min-w-[72px]">
                    Incoterm
                  </TableHead>
                  {costCategories.map(cat => (
                    <TableHead key={cat} className="text-[10px] font-semibold text-center min-w-[90px] whitespace-nowrap">
                      {cat}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {incoterms.map(inc => {
                  const row = costMatrix[inc.code];
                  return (
                    <TableRow key={inc.code} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <TableCell className="text-xs font-bold sticky left-0 bg-white dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-700">
                        <span className={`inline-flex items-center gap-1.5 ${
                          inc.category === 'maritime' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {inc.category === 'maritime' ? <Ship className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          {inc.code}
                        </span>
                      </TableCell>
                      {row.map((payer, idx) => (
                        <TableCell
                          key={idx}
                          className={`text-center text-xs font-semibold p-2 ${
                            payer === 'V'
                              ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                          }`}
                        >
                          {payer === 'V' ? (
                            <span className="flex items-center justify-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> V
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-0.5">
                              <XCircle className="w-3 h-3" /> A
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Incoterm Recommender ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-500" />
            Recommandateur d&apos;Incoterm
          </CardTitle>
          <CardDescription>
            Obtenez une recommandation personnalisée selon vos critères d&apos;expédition
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dropdowns */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Mode de transport</label>
                  <Select value={recommenderMode} onValueChange={setRecommenderMode}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maritime">🚢 Maritime</SelectItem>
                      <SelectItem value="Aérien">✈️ Aérien</SelectItem>
                      <SelectItem value="Terrestre">🚛 Terrestre</SelectItem>
                      <SelectItem value="Multimodal">🌍 Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Sens</label>
                  <Select value={recommenderDirection} onValueChange={setRecommenderDirection}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Export">📤 Export</SelectItem>
                      <SelectItem value="Import">📥 Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contrôle souhaité</label>
                  <Select value={recommenderControl} onValueChange={setRecommenderControl}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendeur">🏭 Vendeur</SelectItem>
                      <SelectItem value="Acheteur">🏢 Acheteur</SelectItem>
                      <SelectItem value="Équilibré">⚖️ Équilibré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Assurance</label>
                  <Select value={recommenderInsurance} onValueChange={setRecommenderInsurance}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Requise">✅ Requise</SelectItem>
                      <SelectItem value="Optionnelle">⚪ Optionnelle</SelectItem>
                      <SelectItem value="Non requise">❌ Non requise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(!recommenderMode || !recommenderDirection || !recommenderControl || !recommenderInsurance) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Remplissez les 4 critères pour obtenir une recommandation personnalisée.
                  </p>
                </div>
              )}
            </div>

            {/* Recommendation result */}
            <div>
              {recommendation ? (
                <motion.div
                  key={recommendation.code}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="p-4 rounded-lg border-2 border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10">
                    <div className="flex items-center gap-3 mb-3">
                      {(() => {
                        const inc = incoterms.find(i => i.code === recommendation.code);
                        const isMar = inc?.category === 'maritime';
                        return (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isMar
                              ? 'bg-teal-200 dark:bg-teal-800'
                              : 'bg-amber-200 dark:bg-amber-800'
                          }`}>
                            {isMar
                              ? <Ship className="w-6 h-6 text-teal-700 dark:text-teal-300" />
                              : <Globe className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                            }
                          </div>
                        );
                      })()}
                      <div>
                        <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                          {recommendation.code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {incoterms.find(i => i.code === recommendation.code)?.fullName}
                        </p>
                      </div>
                      <Badge className="ml-auto bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0 text-xs">
                        Recommandé
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {recommendation.reason}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {recommendation.details}
                    </p>
                  </div>

                  {/* Cost breakdown for recommended */}
                  {(() => {
                    const costs = costMatrix[recommendation.code];
                    if (!costs) return null;
                    const vendorCount = costs.filter(c => c === 'V').length;
                    const buyerCount = costs.filter(c => c === 'A').length;
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Vendeur paie</p>
                          <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{vendorCount}/10</p>
                          <p className="text-[10px] text-gray-400">
                            {costCategories.filter((_, idx) => costs[idx] === 'V').join(', ')}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Acheteur paie</p>
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{buyerCount}/10</p>
                          <p className="text-[10px] text-gray-400">
                            {costCategories.filter((_, idx) => costs[idx] === 'A').join(', ')}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Scale className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Sélectionnez vos critères</p>
                    <p className="text-[10px] mt-1">pour obtenir une recommandation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Comparison Tool ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500" />
            Outil de comparaison
          </CardTitle>
          <CardDescription>
            Comparez deux Incoterms côte à côte pour visualiser les différences
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Select value={compareLeft} onValueChange={setCompareLeft}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Premier Incoterm" />
              </SelectTrigger>
              <SelectContent>
                {incoterms.map(inc => (
                  <SelectItem key={inc.code} value={inc.code} disabled={inc.code === compareRight}>
                    {inc.code} — {inc.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={compareRight} onValueChange={setCompareRight}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Second Incoterm" />
              </SelectTrigger>
              <SelectContent>
                {incoterms.map(inc => (
                  <SelectItem key={inc.code} value={inc.code} disabled={inc.code === compareLeft}>
                    {inc.code} — {inc.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparisonData ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { inc: comparisonData.left, costs: comparisonData.leftCosts, label: 'Gauche' },
                  { inc: comparisonData.right, costs: comparisonData.rightCosts, label: 'Droite' },
                ].map(({ inc, costs, label }) => {
                  const isMar = inc.category === 'maritime';
                  return (
                    <div
                      key={inc.code}
                      className={`p-3 rounded-lg border ${
                        isMar
                          ? 'border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10'
                          : 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isMar ? <Ship className="w-4 h-4 text-teal-500" /> : <Globe className="w-4 h-4 text-amber-500" />}
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{inc.code}</span>
                        <Badge className={`text-[9px] border-0 ${
                          isMar
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300'
                        }`}>
                          {isMar ? 'Maritime' : 'Multimodal'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{inc.fullName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{inc.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-teal-600 dark:text-teal-400">
                          Vendeur: {costs.filter(c => c === 'V').length}/10
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                          Acheteur: {costs.filter(c => c === 'A').length}/10
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="text-xs font-bold">Catégorie de coût</TableHead>
                      <TableHead className="text-xs font-bold text-center">{comparisonData.left.code}</TableHead>
                      <TableHead className="text-xs font-bold text-center">{comparisonData.right.code}</TableHead>
                      <TableHead className="text-xs font-bold text-center">Diff.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.differences.map((diff, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {diff.category}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                            diff.left === 'V'
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {diff.left === 'V' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {diff.left === 'V' ? 'Vendeur' : 'Acheteur'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                            diff.right === 'V'
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {diff.right === 'V' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {diff.right === 'V' ? 'Vendeur' : 'Acheteur'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {diff.same ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">≠</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Risk transfer comparison */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-teal-500" />
                  Transfert du risque
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400">{comparisonData.left.code}</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{comparisonData.left.riskTransferPoint}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">{comparisonData.right.code}</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{comparisonData.right.riskTransferPoint}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <Scale className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Sélectionnez deux Incoterms à comparer</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Usage Statistics ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" />
            Statistiques d&apos;utilisation
          </CardTitle>
          <CardDescription>
            Fréquence d&apos;utilisation de chaque Incoterm sur les 12 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-2">
            {usageStats.map((stat, idx) => {
              const inc = incoterms.find(i => i.code === stat.code);
              const isMar = inc?.category === 'maritime';
              const maxCount = usageStats[0].count;
              return (
                <motion.div
                  key={stat.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 flex-shrink-0 flex items-center gap-1">
                    {isMar ? (
                      <Ship className="w-3 h-3 text-teal-500" />
                    ) : (
                      <Globe className="w-3 h-3 text-amber-500" />
                    )}
                    <span className={`text-xs font-bold ${
                      isMar ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {stat.code}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full h-7 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.count / maxCount) * 100}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.04, ease: 'easeOut' }}
                        className={`h-full rounded-md ${
                          isMar
                            ? 'bg-gradient-to-r from-teal-400 to-teal-500 dark:from-teal-600 dark:to-teal-500'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-600 dark:to-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="w-14 text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stat.count}</span>
                    <span className="text-[10px] text-gray-400 ml-1">({stat.percentage}%)</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/10">
              <div className="flex items-center gap-2 mb-1">
                <Ship className="w-4 h-4 text-teal-500" />
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Incoterms Maritimes</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {usageStats.filter(s => incoterms.find(i => i.code === s.code)?.category === 'maritime').reduce((a, b) => a + b.count, 0).toLocaleString('fr-FR')}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {usageStats.filter(s => incoterms.find(i => i.code === s.code)?.category === 'maritime').reduce((a, b) => a + b.percentage, 0)}% du total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Incoterms Multimodaux</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {usageStats.filter(s => incoterms.find(i => i.code === s.code)?.category === 'multimodal').reduce((a, b) => a + b.count, 0).toLocaleString('fr-FR')}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {usageStats.filter(s => incoterms.find(i => i.code === s.code)?.category === 'multimodal').reduce((a, b) => a + b.percentage, 0)}% du total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Active Shipments by Incoterm ─── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Expéditions actives par Incoterm
          </CardTitle>
          <CardDescription>
            Répartition des expéditions en cours selon le terme de livraison
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {incoterms.map((inc, idx) => {
              const count = activeByIncoterm[inc.code] || 0;
              const isMar = inc.category === 'maritime';
              return (
                <motion.div
                  key={inc.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className={`p-3 rounded-lg border text-center cursor-pointer hover:shadow-sm transition-shadow ${
                    isMar
                      ? 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                      : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }`}
                  onClick={() => setSelectedIncoterm(inc)}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isMar ? <Ship className="w-3 h-3 text-teal-500" /> : <Globe className="w-3 h-3 text-amber-500" />}
                    <span className={`text-sm font-bold ${
                      isMar ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {inc.code}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">expédition(s)</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Incoterm Detail Dialog ─── */}
      <Dialog open={!!selectedIncoterm} onOpenChange={() => setSelectedIncoterm(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedIncoterm && (() => {
            const isMar = selectedIncoterm.category === 'maritime';
            const costs = costMatrix[selectedIncoterm.code];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {isMar ? (
                      <Ship className="w-5 h-5 text-teal-500" />
                    ) : (
                      <Globe className="w-5 h-5 text-amber-500" />
                    )}
                    {selectedIncoterm.code} — {selectedIncoterm.fullName}
                  </DialogTitle>
                  <DialogDescription>
                    Détails de l&apos;Incoterm {selectedIncoterm.code} (Incoterms 2020)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Category badge */}
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border-0 ${
                      isMar
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {isMar ? '🚢 Maritime uniquement' : '🌍 Multimodal'}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-700 dark:text-gray-300">{selectedIncoterm.description}</p>
                  </div>

                  {/* Risk transfer */}
                  <div className="p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10">
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      Point de transfert du risque
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedIncoterm.riskTransferPoint}</p>
                  </div>

                  {/* Usage tip */}
                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      Conseil d&apos;utilisation
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedIncoterm.usageTip}</p>
                  </div>

                  {/* Cost breakdown */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                      Répartition des coûts
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {costCategories.map((cat, idx) => (
                        <div
                          key={cat}
                          className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                            costs[idx] === 'V'
                              ? 'bg-teal-50 dark:bg-teal-900/10'
                              : 'bg-amber-50 dark:bg-amber-900/10'
                          }`}
                        >
                          {costs[idx] === 'V' ? (
                            <CheckCircle2 className="w-3 h-3 text-teal-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                          <span className={`ml-auto font-semibold ${
                            costs[idx] === 'V'
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {costs[idx] === 'V' ? 'Vendeur' : 'Acheteur'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary bar */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-1">
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 dark:bg-teal-400 transition-all"
                          style={{ width: `${(costs.filter(c => c === 'V').length / 10) * 100}%` }}
                        />
                        <div
                          className="bg-amber-500 dark:bg-amber-400 transition-all"
                          style={{ width: `${(costs.filter(c => c === 'A').length / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                      V: {costs.filter(c => c === 'V').length}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      A: {costs.filter(c => c === 'A').length}
                    </span>
                  </div>

                  {/* Active shipments */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Expéditions actives</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {activeByIncoterm[selectedIncoterm.code] || 0}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
