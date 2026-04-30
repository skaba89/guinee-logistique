'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  CheckCircle2,
  Circle,
  Package,
  Truck,
  Plane,
  Ship,
  Clock,
  ArrowRight,
  Navigation,
  Share2,
  FileDown,
  Globe,
  Timer,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { shipments, statusLabels, typeLabels, formatDZD, formatDate, type Shipment, type ShipmentStatus } from '@/lib/test-data';

interface TimelineStep {
  label: string;
  status: ShipmentStatus;
  location?: string;
  date?: string;
}

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const typeIcons: Record<string, React.ElementType> = {
  aerien: Plane,
  maritime: Ship,
  terrestre: Truck,
};

// City coordinates for the world map
const cityCoords: Record<string, { x: number; y: number }> = {
  'Alger': { x: 470, y: 165 },
  'Oran': { x: 445, y: 170 },
  'Paris': { x: 465, y: 115 },
  'Marseille': { x: 472, y: 130 },
  'Casablanca': { x: 430, y: 175 },
  'Dakar': { x: 390, y: 210 },
  'Istanbul': { x: 520, y: 130 },
  'Le Caire': { x: 530, y: 165 },
  'Dubaï': { x: 585, y: 175 },
  'Shanghai': { x: 720, y: 155 },
  'Mumbai': { x: 610, y: 185 },
  'Londres': { x: 455, y: 110 },
  'New York': { x: 235, y: 135 },
  'Hambourg': { x: 472, y: 105 },
  'Djeddah': { x: 548, y: 185 },
  'Rotterdam': { x: 465, y: 108 },
  'Milan': { x: 480, y: 130 },
  'Barcelone': { x: 455, y: 142 },
  'Lagos': { x: 420, y: 225 },
  'Abidjan': { x: 405, y: 215 },
  'Singapour': { x: 690, y: 220 },
  'Nairobi': { x: 545, y: 235 },
  'Santos': { x: 300, y: 290 },
  'Tunis': { x: 485, y: 155 },
  'Anvers': { x: 465, y: 105 },
  'Montréal': { x: 245, y: 115 },
};

function getTimelineForShipment(shipment: Shipment): TimelineStep[] {
  const steps: TimelineStep[] = [
    { label: 'Colis créé', status: 'en_attente', location: shipment.origin, date: shipment.dateCreation },
    { label: 'Confirmé', status: 'confirmee', location: shipment.origin, date: shipment.dateCreation },
    { label: 'En cours de préparation', status: 'confirmee', location: shipment.origin, date: shipment.dateExpedition || undefined },
    { label: 'Expédié', status: 'en_transit', location: shipment.origin, date: shipment.dateExpedition || undefined },
    { label: 'En transit', status: 'en_transit', location: 'En route vers ' + shipment.destination, date: shipment.dateExpedition || undefined },
    { label: 'Arrivé au hub de destination', status: 'en_transit', location: shipment.destination },
    { label: 'En cours de livraison', status: 'en_transit', location: shipment.destination },
    { label: 'Livré', status: 'livree', location: shipment.destination, date: shipment.dateLivraisonEstimee },
  ];

  const statusOrder: Record<ShipmentStatus, number> = {
    en_attente: 0,
    confirmee: 1,
    en_transit: 2,
    livree: 3,
    retardee: 2,
    annulee: -1,
  };

  const currentLevel = statusOrder[shipment.status];

  return steps.map((step, index) => {
    let stepState: 'completed' | 'current' | 'pending';
    if (shipment.status === 'annulee') {
      stepState = index === 0 ? 'completed' : 'pending';
    } else if (shipment.status === 'retardee') {
      stepState = index <= 4 ? 'completed' : (index === 5 ? 'current' : 'pending');
    } else if (currentLevel === 0) {
      stepState = index === 0 ? 'current' : 'pending';
    } else if (currentLevel === 1) {
      stepState = index <= 1 ? 'completed' : (index === 2 ? 'current' : 'pending');
    } else if (currentLevel === 2) {
      stepState = index <= 3 ? 'completed' : (index === 4 ? 'current' : 'pending');
    } else {
      stepState = 'completed';
    }
    return { ...step, stepState } as TimelineStep & { stepState: 'completed' | 'current' | 'pending' };
  });
}

function calculateETA(shipment: Shipment): string {
  if (shipment.status === 'livree') return 'Livré';
  if (shipment.status === 'annulee') return 'Annulé';

  const now = new Date();
  const eta = new Date(shipment.dateLivraisonEstimee);
  const diffMs = eta.getTime() - now.getTime();

  if (diffMs <= 0) {
    if (shipment.status === 'retardee') return 'En retard';
    return 'Arrivée imminente';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays}j ${diffHours}h restants`;
  }
  return `${diffHours}h restantes`;
}

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return shipments.filter(
      (s) =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowResults(false);
    setSearchQuery(shipment.trackingNumber);
  };

  const handleShareLink = () => {
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    const link = `https://logisway.pro/track/${selectedShipment?.trackingNumber || ''}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    const element = document.createElement('a');
    const content = `LogisWay - Bon de Suivi\n\nN° Suivi: ${selectedShipment?.trackingNumber}\nClient: ${selectedShipment?.clientName}\nOrigine: ${selectedShipment?.origin}\nDestination: ${selectedShipment?.destination}\nStatut: ${statusLabels[selectedShipment?.status || 'en_attente']}\nPoids: ${selectedShipment?.weight} kg\nPrix: ${formatDZD(selectedShipment?.price || 0)}\nDate création: ${selectedShipment?.dateCreation}\nLivraison estimée: ${selectedShipment?.dateLivraisonEstimee}`;
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `suivi-${selectedShipment?.trackingNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const timeline = selectedShipment ? getTimelineForShipment(selectedShipment) : [];
  const eta = selectedShipment ? calculateETA(selectedShipment) : '';

  // Get route coordinates for the map
  const originCoords = selectedShipment ? cityCoords[selectedShipment.origin] : null;
  const destCoords = selectedShipment ? cityCoords[selectedShipment.destination] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi colis</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Suivez vos expéditions en temps réel</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Entrez le numéro de suivi (ex: FFP-0001-2026)"
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setShowResults(false);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              className="h-12 px-6 text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              onClick={handleSearch}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Suivre
            </Button>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-3 border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-lg"
              >
                {searchResults.map((shipment) => {
                  const TypeIcon = typeIcons[shipment.type];
                  return (
                    <button
                      key={shipment.id}
                      onClick={() => handleSelectShipment(shipment)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left border-b last:border-b-0"
                    >
                      <TypeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-semibold truncate">{shipment.trackingNumber}</p>
                        <p className="text-xs text-gray-500">{shipment.clientName} — {shipment.origin} → {shipment.destination}</p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${statusColors[shipment.status]}`}>
                        {statusLabels[shipment.status]}
                      </Badge>
                    </button>
                  );
                })}
              </motion.div>
            )}
            {showResults && searchResults.length === 0 && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-3 border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-lg text-center"
              >
                <p className="text-sm text-gray-500">Aucun colis trouvé pour &quot;{searchQuery}&quot;</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Tracking Details */}
      {selectedShipment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-500" />
                    Historique de suivi
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{selectedShipment.trackingNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[selectedShipment.status]} text-sm`}>
                    {statusLabels[selectedShipment.status]}
                  </Badge>
                  {/* ETA Display */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                    <Timer className="w-4 h-4 text-teal-500" />
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">{eta}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-0">
                  {timeline.map((step, index) => {
                    const isCompleted = step.stepState === 'completed';
                    const isCurrent = step.stepState === 'current';

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-start gap-4 py-3 relative"
                      >
                        {/* Step indicator */}
                        <div className="flex-shrink-0 w-[31px] flex items-center justify-center">
                          {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                              <Circle className="w-3 h-3 text-white fill-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-10">
                              <Circle className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Step content */}
                        <div className={`flex-1 pb-2 ${step.stepState === 'pending' ? 'opacity-40' : ''}`}>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${isCompleted ? 'text-green-700 dark:text-green-400' : isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                              {step.label}
                            </p>
                            {step.date && (
                              <span className="text-xs text-gray-400">{formatDate(step.date)}</span>
                            )}
                          </div>
                          {step.location && (
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {step.location}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleShareLink}
              >
                <Share2 className="w-4 h-4 mr-1.5" />
                Partager
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleDownloadPDF}
              >
                <FileDown className="w-4 h-4 mr-1.5" />
                Télécharger PDF
              </Button>
            </div>

            {/* World Map */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-500" />
                  Carte de suivi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className="relative h-56 bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950">
                  {/* SVG World Map */}
                  <svg viewBox="0 0 800 400" className="w-full h-full">
                    {/* Simplified world outline */}
                    <rect x="0" y="0" width="800" height="400" fill="none" />
                    {/* Grid lines */}
                    {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                      <line key={`v${x}`} x1={x} y1="0" x2={x} y2="400" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="0.5" />
                    ))}
                    {[80, 160, 240, 320].map((y) => (
                      <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="0.5" />
                    ))}

                    {/* Simple continent shapes */}
                    {/* Africa */}
                    <path d="M420,140 Q440,120 480,130 Q500,150 510,180 Q520,220 500,260 Q470,280 440,250 Q420,200 420,140Z" fill="currentColor" className="text-gray-200 dark:text-gray-800" opacity="0.5" />
                    {/* Europe */}
                    <path d="M440,70 Q460,60 490,70 Q510,80 520,100 Q510,120 490,130 Q460,130 450,110 Q440,90 440,70Z" fill="currentColor" className="text-gray-200 dark:text-gray-800" opacity="0.5" />
                    {/* Asia */}
                    <path d="M520,60 Q580,50 650,70 Q700,90 720,140 Q710,180 680,210 Q630,230 580,200 Q540,170 520,130 Q510,90 520,60Z" fill="currentColor" className="text-gray-200 dark:text-gray-800" opacity="0.5" />
                    {/* Americas */}
                    <path d="M200,60 Q230,50 260,70 Q270,100 260,140 Q250,170 230,200 Q210,240 190,280 Q180,310 170,290 Q160,250 180,200 Q190,150 200,100 Q200,80 200,60Z" fill="currentColor" className="text-gray-200 dark:text-gray-800" opacity="0.5" />
                    {/* Middle East */}
                    <path d="M530,140 Q560,130 580,150 Q590,170 570,190 Q540,180 530,160 Q530,150 530,140Z" fill="currentColor" className="text-gray-200 dark:text-gray-800" opacity="0.5" />

                    {/* Origin point */}
                    {originCoords && (
                      <g>
                        <circle cx={originCoords.x} cy={originCoords.y} r="6" fill="#0d9488" opacity="0.3">
                          <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={originCoords.x} cy={originCoords.y} r="4" fill="#0d9488" />
                        <text x={originCoords.x} y={originCoords.y - 12} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" fontSize="10" fontWeight="600">{selectedShipment.origin}</text>
                      </g>
                    )}

                    {/* Destination point */}
                    {destCoords && (
                      <g>
                        <circle cx={destCoords.x} cy={destCoords.y} r="6" fill="#059669" opacity="0.3">
                          <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" begin="1s" />
                          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" begin="1s" />
                        </circle>
                        <circle cx={destCoords.x} cy={destCoords.y} r="4" fill="#059669" />
                        <text x={destCoords.x} y={destCoords.y - 12} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" fontSize="10" fontWeight="600">{selectedShipment.destination}</text>
                      </g>
                    )}

                    {/* Route line */}
                    {originCoords && destCoords && (
                      <g>
                        <line
                          x1={originCoords.x}
                          y1={originCoords.y}
                          x2={destCoords.x}
                          y2={destCoords.y}
                          stroke="#0d9488"
                          strokeWidth="2"
                          strokeDasharray="8 4"
                          opacity="0.6"
                        />
                        {/* Moving dot along the route */}
                        <circle r="4" fill="#0d9488">
                          <animateMotion
                            dur="3s"
                            repeatCount="indefinite"
                            path={`M${originCoords.x},${originCoords.y} L${destCoords.x},${destCoords.y}`}
                          />
                        </circle>
                      </g>
                    )}
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Details Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-500" />
                  Détails du colis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium flex items-center gap-1.5">
                    {React.createElement(typeIcons[selectedShipment.type], { className: 'w-4 h-4' })}
                    {typeLabels[selectedShipment.type]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Client</span>
                  <span className="font-medium">{selectedShipment.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Téléphone</span>
                  <span className="font-medium">{selectedShipment.clientPhone}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-500">Origine</span>
                  <span className="font-medium">{selectedShipment.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination</span>
                  <span className="font-medium">{selectedShipment.destination}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-500">Poids</span>
                  <span className="font-medium">{selectedShipment.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dimensions</span>
                  <span className="font-medium">{selectedShipment.dimensions} cm</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-500">Prix</span>
                  <span className="font-bold text-lg text-teal-600 dark:text-teal-400">{formatDZD(selectedShipment.price)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dates Card */}
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Créé le: {formatDate(selectedShipment.dateCreation)}</span>
                </div>
                {selectedShipment.dateExpedition && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck className="w-4 h-4" />
                    <span>Expédié le: {formatDate(selectedShipment.dateExpedition)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>Livraison estimée: {formatDate(selectedShipment.dateLivraisonEstimee)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Empty state */
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Suivez votre colis
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Entrez un numéro de suivi (ex: FFP-0001-2026) ou le nom d&apos;un client pour voir l&apos;historique de votre expédition en temps réel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-teal-500" />
              Partager le lien de suivi
            </DialogTitle>
            <DialogDescription>Envoyez ce lien pour permettre le suivi de l&apos;expédition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`https://logisway.pro/track/${selectedShipment?.trackingNumber || ''}`}
                className="font-mono text-xs"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                className="flex-shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">N° Suivi</span>
                <span className="font-mono font-semibold">{selectedShipment?.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-medium">{selectedShipment?.origin} → {selectedShipment?.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ETA</span>
                <span className="font-medium text-teal-600 dark:text-teal-400">{eta}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
