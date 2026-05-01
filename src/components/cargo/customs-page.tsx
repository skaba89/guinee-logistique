'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  AlertTriangle,
  XCircle,
  BookOpen,
  Calculator,
  ClipboardCheck,
  FileText,
  Shield,
  ArrowRight,
  ChevronRight,
  Info,
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { customsDeclarations, customsTypeLabels, customsStatusLabels, formatDate, formatCurrency as formatCurrencyTest } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';
import { useCurrency } from '@/lib/use-currency';

const customsStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  under_review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  cleared: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const customsTypeColors: Record<string, string> = {
  import: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  export: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  transit: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// HS Code database
const hsCodes = [
  { code: '8471.30', description: 'Machines automatiques de traitement de données - Portatives', dutyRate: 5, vatRate: 19, category: 'Électronique' },
  { code: '8517.12', description: 'Téléphones pour réseaux cellulaires', dutyRate: 2, vatRate: 19, category: 'Électronique' },
  { code: '8703.23', description: 'Véhicules automobiles à moteur à allumage par étincelle', dutyRate: 15, vatRate: 19, category: 'Automobile' },
  { code: '6110.20', description: 'Pulls en coton à tricoter', dutyRate: 12, vatRate: 19, category: 'Textile' },
  { code: '2203.00', description: 'Bière de malt', dutyRate: 30, vatRate: 19, category: 'Alimentaire' },
  { code: '1006.30', description: 'Riz semi-blanchi ou blanchi', dutyRate: 5, vatRate: 9, category: 'Alimentaire' },
  { code: '2710.12', description: 'Huiles de pétrole légères', dutyRate: 20, vatRate: 19, category: 'Énergie' },
  { code: '3004.90', description: 'Médicaments conditionnés pour la vente au détail', dutyRate: 0, vatRate: 9, category: 'Pharmaceutique' },
  { code: '3923.21', description: 'Sacs et poches en polymères de l\'éthylène', dutyRate: 10, vatRate: 19, category: 'Emballage' },
  { code: '7308.90', description: 'Constructions et parties de constructions en fonte/fer', dutyRate: 8, vatRate: 19, category: 'Construction' },
  { code: '8421.21', description: 'Appareils pour filtrer ou déparer les liquides', dutyRate: 5, vatRate: 19, category: 'Industriel' },
  { code: '6403.99', description: 'Chaussures à semelle extérieure en caoutchouc', dutyRate: 15, vatRate: 19, category: 'Textile' },
  { code: '4819.10', description: 'Cartons ondulés en papier ou carton', dutyRate: 8, vatRate: 19, category: 'Emballage' },
  { code: '9403.50', description: 'Meubles en bois pour bureaux', dutyRate: 12, vatRate: 19, category: 'Ameublement' },
  { code: '8443.32', description: 'Imprimantes machines à imprimer', dutyRate: 5, vatRate: 19, category: 'Électronique' },
  { code: '2101.11', description: 'Café extrait ou à base de café', dutyRate: 15, vatRate: 19, category: 'Alimentaire' },
  { code: '8481.80', description: 'Robinetterie et articles similaires', dutyRate: 8, vatRate: 19, category: 'Industriel' },
  { code: '5702.42', description: 'Tapis tissés en laine ou poils animaux', dutyRate: 12, vatRate: 19, category: 'Textile' },
];

// Compliance checklist items
const complianceItems = [
  { id: 1, label: 'Déclaration douanière complète', status: 'required', description: 'Formulaire D1/D2 rempli et signé' },
  { id: 2, label: 'Facture commerciale', status: 'required', description: 'Facture originale avec valeur FOB/CIF' },
  { id: 3, label: 'Connaissement (BL) / LTA', status: 'required', description: 'Document de transport original' },
  { id: 4, label: 'Certificat d\'origine', status: 'required', description: 'Document certifiant le pays de fabrication' },
  { id: 5, label: 'Liste de colisage', status: 'required', description: 'Détail des colis avec poids et dimensions' },
  { id: 6, label: 'Assurance transport', status: 'optional', description: 'Attestation d\'assurance couvrant la marchandise' },
  { id: 7, label: 'Certificat phytosanitaire', status: 'conditional', description: 'Requis pour les produits végétaux' },
  { id: 8, label: 'Licence d\'importation', status: 'conditional', description: 'Requis pour les produits soumis à restriction' },
  { id: 9, label: 'Certificat de conformité', status: 'conditional', description: 'Requis pour les produits réglementés' },
  { id: 10, label: 'Déclaration de valeur', status: 'optional', description: 'Déclaration détaillée de la valeur des marchandises' },
];

const complianceStatusColors: Record<string, string> = {
  required: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  optional: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  conditional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const complianceStatusLabels: Record<string, string> = {
  required: 'Obligatoire',
  optional: 'Optionnel',
  conditional: 'Conditionnel',
};

// Required documents for declarations
const requiredDocuments = [
  { name: 'Déclaration D1 - Import', type: 'import', status: 'available', format: 'PDF', lastUpdated: '2026-02-15' },
  { name: 'Déclaration D2 - Export', type: 'export', status: 'available', format: 'PDF', lastUpdated: '2026-02-15' },
  { name: 'Formulaire de transit', type: 'transit', status: 'available', format: 'PDF', lastUpdated: '2026-01-20' },
  { name: 'Facture commerciale', type: 'all', status: 'available', format: 'PDF/XLS', lastUpdated: '2026-03-01' },
  { name: 'Certificat d\'origine', type: 'all', status: 'available', format: 'PDF', lastUpdated: '2026-02-28' },
  { name: 'Liste de colisage', type: 'all', status: 'available', format: 'PDF/XLS', lastUpdated: '2026-03-05' },
  { name: 'Demande de licence', type: 'import', status: 'pending', format: 'PDF', lastUpdated: '2026-03-10' },
  { name: 'Certificat phytosanitaire', type: 'import', status: 'unavailable', format: 'PDF', lastUpdated: '-' },
];

const docStatusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  unavailable: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const docStatusLabels: Record<string, string> = {
  available: 'Disponible',
  pending: 'En attente',
  unavailable: 'Indisponible',
};

// kpis moved inside component to use useCurrency hook

export default function CustomsPage() {
  const canEditPage = useCargoStore((s) => s.canEdit('customs'));
  const { format: formatPrice } = useCurrency();

  const kpis = [
    { title: 'En attente', value: customsDeclarations.filter(d => d.status === 'submitted' || d.status === 'under_review').length, icon: Clock, color: 'from-orange-500 to-amber-600' },
    { title: 'Dédouanées aujourd\'hui', value: customsDeclarations.filter(d => d.status === 'cleared').length, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { title: 'Droits collectés', value: formatPrice(customsDeclarations.filter(d => d.status === 'cleared').reduce((a, b) => a + b.dutiesAndTaxes, 0)), icon: DollarSign, color: 'from-teal-500 to-teal-600' },
    { title: 'En révision', value: customsDeclarations.filter(d => d.status === 'under_review').length, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  ];
  const [data, setData] = useState(customsDeclarations);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedDecl, setSelectedDecl] = useState<typeof customsDeclarations[0] | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDecl, setNewDecl] = useState({
    type: 'import' as 'import' | 'export' | 'transit',
    clientName: '',
    originCountry: '',
    destinationCountry: '',
    hsCode: '',
    declaredValue: '',
    goodsDescription: '',
  });

  // HS Code lookup state
  const [hsSearch, setHsSearch] = useState('');
  const [selectedHsCode, setSelectedHsCode] = useState<typeof hsCodes[0] | null>(null);

  // Duty calculator state
  const [calcHsCode, setCalcHsCode] = useState<string>('');
  const [calcValue, setCalcValue] = useState<string>('');
  const [calcCurrency, setCalcCurrency] = useState<string>('EUR');

  const pageSize = 8;

  const handleAddDeclaration = () => {
    const decl = {
      id: `cd${data.length + 1}-${Date.now()}`,
      declarationNumber: 'DOU-2026-' + String(data.length + 1).padStart(4, '0'),
      type: newDecl.type,
      status: 'draft' as const,
      clientName: newDecl.clientName,
      originCountry: newDecl.originCountry,
      destinationCountry: newDecl.destinationCountry,
      hsCode: newDecl.hsCode,
      goodsDescription: newDecl.goodsDescription,
      declaredValue: parseInt(newDecl.declaredValue) || 0,
      currency: 'DZD',
      dutiesAndTaxes: 0,
      submissionDate: '',
      clearanceDate: '',
    };
    setData([decl, ...data]);
    setNewDecl({ type: 'import', clientName: '', originCountry: '', destinationCountry: '', hsCode: '', declaredValue: '', goodsDescription: '' });
    setShowAddDialog(false);
    setPage(0);
  };

  // HS Code search results
  const hsSearchResults = useMemo(() => {
    if (hsSearch.length < 2) return [];
    const query = hsSearch.toLowerCase();
    return hsCodes.filter(hs =>
      hs.code.includes(query) ||
      hs.description.toLowerCase().includes(query) ||
      hs.category.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [hsSearch]);

  // Duty calculation
  const dutyCalculation = useMemo(() => {
    const hs = hsCodes.find(h => h.code === calcHsCode);
    if (!hs || !calcValue || parseFloat(calcValue) <= 0) return null;

    const value = parseFloat(calcValue);
    const dutyAmount = value * (hs.dutyRate / 100);
    const cifValue = value + dutyAmount;
    const vatAmount = cifValue * (hs.vatRate / 100);
    const totalDuties = dutyAmount + vatAmount;
    const totalCost = value + totalDuties;

    return {
      hsCode: hs.code,
      description: hs.description,
      declaredValue: value,
      dutyRate: hs.dutyRate,
      dutyAmount,
      cifValue,
      vatRate: hs.vatRate,
      vatAmount,
      totalDuties,
      totalCost,
    };
  }, [calcHsCode, calcValue, calcCurrency]);

  const filtered = data.filter(d => {
    const matchSearch = search === '' ||
      d.declarationNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.goodsDescription.toLowerCase().includes(search.toLowerCase()) ||
      d.hsCode.includes(search);
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-500" />
            Douanes & Conformité
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestion des déclarations douanières</p>
        </div>
        {canEditPage && (
          <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle déclaration
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                    </p>
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

      {/* HS Code Lookup */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-500" />
            Recherche de codes HS
          </CardTitle>
          <CardDescription>Consultation de la nomenclature douanière harmonisée</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par code HS ou description (ex: 8471, ordinateur, coton)..."
                value={hsSearch}
                onChange={(e) => { setHsSearch(e.target.value); setSelectedHsCode(null); }}
                className="pl-9 h-9"
              />
            </div>

            {hsSearchResults.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Code HS</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Catégorie</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Droits</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">TVA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hsSearchResults.map((hs) => (
                      <TableRow
                        key={hs.code}
                        className={`cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-900/10 ${selectedHsCode?.code === hs.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                        onClick={() => setSelectedHsCode(hs)}
                      >
                        <TableCell className="font-mono text-xs font-semibold text-teal-600">{hs.code}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{hs.description}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {hs.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell font-medium">{hs.dutyRate}%</TableCell>
                        <TableCell className="text-xs hidden md:table-cell font-medium">{hs.vatRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedHsCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-bold text-teal-600">{selectedHsCode.code}</span>
                  <Badge variant="secondary" className="text-[9px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{selectedHsCode.category}</Badge>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">{selectedHsCode.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400">Droits de douane</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedHsCode.dutyRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">TVA</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedHsCode.vatRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Taux effectif</p>
                    <p className="text-sm font-bold text-teal-600">{(selectedHsCode.dutyRate + selectedHsCode.vatRate + (selectedHsCode.dutyRate * selectedHsCode.vatRate / 100)).toFixed(1)}%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Duty Calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            Calculateur de droits
          </CardTitle>
          <CardDescription>Estimation des droits et taxes pour une importation</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Code HS</Label>
                <Select value={calcHsCode} onValueChange={setCalcHsCode}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sélectionner un code HS" />
                  </SelectTrigger>
                  <SelectContent>
                    {hsCodes.map((hs) => (
                      <SelectItem key={hs.code} value={hs.code}>
                        {hs.code} - {hs.description.substring(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Valeur déclarée</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={calcValue}
                    onChange={(e) => setCalcValue(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Devise</Label>
                  <Select value={calcCurrency} onValueChange={setCalcCurrency}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="DZD">DZD (DA)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="space-y-3">
              {dutyCalculation ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-[10px] text-gray-400 mb-1">{dutyCalculation.hsCode} — {dutyCalculation.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Valeur déclarée (FOB)</span>
                        <span className="font-medium">{dutyCalculation.declaredValue.toLocaleString('fr-FR')} {calcCurrency}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Droits de douane ({dutyCalculation.dutyRate}%)</span>
                        <span className="font-medium text-amber-600">+{dutyCalculation.dutyAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {calcCurrency}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Valeur CIF</span>
                        <span className="font-medium">{dutyCalculation.cifValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {calcCurrency}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">TVA ({dutyCalculation.vatRate}%)</span>
                        <span className="font-medium text-orange-600">+{dutyCalculation.vatAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {calcCurrency}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-900 dark:text-white">Total droits & taxes</span>
                        <span className="font-bold text-teal-600">{dutyCalculation.totalDuties.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {calcCurrency}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-900 dark:text-white">Coût total</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dutyCalculation.totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {calcCurrency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-teal-50 dark:bg-teal-900/20">
                    <Info className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <p className="text-[10px] text-teal-700 dark:text-teal-400">Taux effectif total: {((dutyCalculation.totalDuties / dutyCalculation.declaredValue) * 100).toFixed(1)}% — Estimation indicative uniquement</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Calculator className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Sélectionnez un code HS et entrez une valeur</p>
                    <p className="text-[10px] mt-1">pour calculer les droits estimés</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-500" />
            Liste de conformité
          </CardTitle>
          <CardDescription>Documents et exigences réglementaires</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {complianceItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${item.status === 'required' ? 'bg-red-100 dark:bg-red-900/30' : item.status === 'conditional' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {item.status === 'required' ? (
                    <Shield className="w-3 h-3 text-red-500" />
                  ) : item.status === 'conditional' ? (
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.label}</p>
                    <Badge variant="secondary" className={`text-[8px] px-1.5 py-0 ${complianceStatusColors[item.status]}`}>
                      {complianceStatusLabels[item.status]}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" />
            Documents requis
          </CardTitle>
          <CardDescription>Modèles et formulaires disponibles</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Document</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Format</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Dernière MAJ</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requiredDocuments.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[9px] ${doc.type === 'all' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : customsTypeColors[doc.type] || 'bg-gray-100 text-gray-600'}`}>
                        {doc.type === 'all' ? 'Tous' : customsTypeLabels[doc.type as keyof typeof customsTypeLabels] || doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${doc.status === 'available' ? 'bg-green-500' : doc.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <Badge variant="secondary" className={`text-[9px] ${docStatusColors[doc.status]}`}>
                          {docStatusLabels[doc.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 hidden sm:table-cell">{doc.format}</TableCell>
                    <TableCell className="text-xs text-gray-500 hidden md:table-cell">{doc.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px]" disabled={doc.status !== 'available'}>
                        <FileText className="w-3 h-3 mr-1" />
                        {doc.status === 'available' ? 'Télécharger' : 'Indisponible'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Rechercher déclaration, client, code HS..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="transit">Transit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="under_review">En révision</SelectItem>
                <SelectItem value="cleared">Dédouané</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Déclaration</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Client</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Pays</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Code HS</TableHead>
                  <TableHead className="text-xs text-right">Valeur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((decl) => (
                  <TableRow key={decl.id} className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10" onClick={() => setSelectedDecl(decl)}>
                    <TableCell className="font-mono text-xs font-semibold">{decl.declarationNumber}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${customsTypeColors[decl.type]}`}>
                        {customsTypeLabels[decl.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${customsStatusColors[decl.status]}`}>
                        {customsStatusLabels[decl.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">{decl.clientName}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{decl.originCountry} → {decl.destinationCountry}</TableCell>
                    <TableCell className="font-mono text-[10px] hidden lg:table-cell">{decl.hsCode}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{formatCurrencyTest(decl.declaredValue, decl.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">{filtered.length} déclaration(s) trouvée(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Préc.</Button>
              <span className="text-xs text-gray-500">{page + 1}/{totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Suiv.</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDecl} onOpenChange={() => setSelectedDecl(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedDecl && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-500" />
                  {selectedDecl.declarationNumber}
                </DialogTitle>
                <DialogDescription>Détails de la déclaration douanière</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-gray-500">Type</Label><p><Badge variant="secondary" className={`text-[10px] ${customsTypeColors[selectedDecl.type]}`}>{customsTypeLabels[selectedDecl.type]}</Badge></p></div>
                  <div><Label className="text-xs text-gray-500">Statut</Label><p><Badge variant="secondary" className={`text-[10px] ${customsStatusColors[selectedDecl.status]}`}>{customsStatusLabels[selectedDecl.status]}</Badge></p></div>
                  <div><Label className="text-xs text-gray-500">Client</Label><p className="text-sm font-medium">{selectedDecl.clientName}</p></div>
                  <div><Label className="text-xs text-gray-500">Code HS</Label><p className="text-sm font-mono">{selectedDecl.hsCode}</p></div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Marchandise</Label>
                  <p className="text-sm mt-1">{selectedDecl.goodsDescription}</p>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Itinéraire</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-[10px] text-gray-400">Pays d&apos;origine</p><p className="text-sm font-medium">{selectedDecl.originCountry}</p></div>
                    <div><p className="text-[10px] text-gray-400">Pays de destination</p><p className="text-sm font-medium">{selectedDecl.destinationCountry}</p></div>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <Label className="text-xs text-gray-500">Financier</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><p className="text-[10px] text-gray-400">Valeur déclarée</p><p className="text-sm font-medium">{formatCurrencyTest(selectedDecl.declaredValue, selectedDecl.currency)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Droits et taxes</p><p className="text-sm font-medium">{formatCurrencyTest(selectedDecl.dutiesAndTaxes, selectedDecl.currency)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Date de soumission</p><p className="text-sm font-medium">{formatDate(selectedDecl.submissionDate)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Date de dédouanement</p><p className="text-sm font-medium">{formatDate(selectedDecl.clearanceDate)}</p></div>
                  </div>
                </div>

                {/* HS Code lookup in detail dialog */}
                {(() => {
                  const hs = hsCodes.find(h => h.code === selectedDecl.hsCode);
                  return hs ? (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                      <Label className="text-xs text-gray-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Détails du code HS
                      </Label>
                      <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-[10px] text-gray-500">{hs.description}</p>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <div><p className="text-[9px] text-gray-400">Catégorie</p><p className="text-[10px] font-medium">{hs.category}</p></div>
                          <div><p className="text-[9px] text-gray-400">Droits</p><p className="text-[10px] font-medium">{hs.dutyRate}%</p></div>
                          <div><p className="text-[9px] text-gray-400">TVA</p><p className="text-[10px] font-medium">{hs.vatRate}%</p></div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Declaration Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle déclaration</DialogTitle>
            <DialogDescription>Créer une nouvelle déclaration douanière</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={newDecl.type} onValueChange={(v) => setNewDecl({ ...newDecl, type: v as 'import' | 'export' | 'transit' })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">Client</Label><Input placeholder="Nom du client" className="h-9" value={newDecl.clientName} onChange={(e) => setNewDecl({ ...newDecl, clientName: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Pays d&apos;origine</Label><Input placeholder="France" className="h-9" value={newDecl.originCountry} onChange={(e) => setNewDecl({ ...newDecl, originCountry: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-xs">Pays de destination</Label><Input placeholder="Algérie" className="h-9" value={newDecl.destinationCountry} onChange={(e) => setNewDecl({ ...newDecl, destinationCountry: e.target.value })} /></div>
              <div className="space-y-2">
                <Label className="text-xs">Code HS</Label>
                <Select value={newDecl.hsCode} onValueChange={(v) => setNewDecl({ ...newDecl, hsCode: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {hsCodes.slice(0, 10).map((hs) => (
                      <SelectItem key={hs.code} value={hs.code}>{hs.code} — {hs.description.substring(0, 30)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">Valeur déclarée</Label><Input placeholder="1000000" type="number" className="h-9" value={newDecl.declaredValue} onChange={(e) => setNewDecl({ ...newDecl, declaredValue: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Description des marchandises</Label><Input placeholder="Description" className="h-9" value={newDecl.goodsDescription} onChange={(e) => setNewDecl({ ...newDecl, goodsDescription: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
              <Button className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={handleAddDeclaration}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
