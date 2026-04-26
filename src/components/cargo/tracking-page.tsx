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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showResults, setShowResults] = useState(false);

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

  const timeline = selectedShipment ? getTimelineForShipment(selectedShipment) : [];

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
                placeholder="Entrez le numéro de suivi (ex: CG360-0001-2026)"
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
              style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}
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
                    <MapPin className="w-5 h-5" style={{ color: '#1a56db' }} />
                    Historique de suivi
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{selectedShipment.trackingNumber}</p>
                </div>
                <Badge className={`${statusColors[selectedShipment.status]} text-sm`}>
                  {statusLabels[selectedShipment.status]}
                </Badge>
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
                    const isPending = step.stepState === 'pending';

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
                            <div className="w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}>
                              <Circle className="w-3 h-3 text-white fill-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-10">
                              <Circle className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Step content */}
                        <div className={`flex-1 pb-2 ${isPending ? 'opacity-40' : ''}`}>
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

          {/* Shipment Details Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-5 h-5" style={{ color: '#1a56db' }} />
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
                  <span className="font-bold text-lg" style={{ color: '#1a56db' }}>{formatDZD(selectedShipment.price)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                      backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(59,124,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,201,167,0.2) 0%, transparent 50%)',
                    }} />
                  </div>
                  <MapPin className="w-8 h-8 mb-2" style={{ color: '#1a56db' }} />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Carte de suivi</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <span>{selectedShipment.origin}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{selectedShipment.destination}</span>
                  </div>
                  {/* Animated route line */}
                  <svg className="absolute top-1/2 left-1/4 w-1/2" height="2" viewBox="0 0 200 2">
                    <motion.line
                      x1="0" y1="1" x2="200" y2="1"
                      stroke="#1a56db"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
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
              Entrez un numéro de suivi (ex: CG360-0001-2026) ou le nom d&apos;un client pour voir l&apos;historique de votre expédition en temps réel.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
