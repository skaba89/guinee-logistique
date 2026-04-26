'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Plane,
  Ship,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  shipments as initialShipments,
  statusLabels,
  typeLabels,
  formatDZD,
  formatDate,
  type Shipment,
  type ShipmentType,
  type ShipmentStatus,
} from '@/lib/test-data';

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const typeIcons: Record<ShipmentType, React.ElementType> = {
  aerien: Plane,
  maritime: Ship,
  terrestre: Truck,
};

const ITEMS_PER_PAGE = 8;

const algerianCities = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Sétif', 'Blida',
  'Tizi Ouzou', 'Béjaïa', 'Batna', 'Djelfa', 'Biskra', 'Tiaret',
];

export default function ShipmentsPage() {
  const [data, setData] = useState<Shipment[]>(initialShipments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Add form state
  const [newShipment, setNewShipment] = useState({
    type: 'aerien' as ShipmentType,
    origin: '',
    destination: '',
    clientName: '',
    clientPhone: '',
    weight: '',
    dimensions: '',
    price: '',
    notes: '',
    driverName: '',
    dateLivraisonEstimee: '',
  });

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType !== 'all') {
      result = result.filter((s) => s.type === filterType);
    }
    if (filterStatus !== 'all') {
      result = result.filter((s) => s.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.clientName.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [data, filterType, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleViewDetail = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowDetailDialog(true);
  };

  const handleAddShipment = () => {
    const id = `s${data.length + 1}`;
    const trackingNumber = `CG360-${String(data.length + 1).padStart(4, '0')}-2026`;
    const shipment: Shipment = {
      id,
      trackingNumber,
      type: newShipment.type,
      status: 'en_attente',
      origin: newShipment.origin,
      destination: newShipment.destination,
      clientName: newShipment.clientName,
      clientPhone: newShipment.clientPhone,
      weight: parseFloat(newShipment.weight) || 0,
      dimensions: newShipment.dimensions,
      dateCreation: new Date().toISOString().split('T')[0],
      dateExpedition: '',
      dateLivraisonEstimee: newShipment.dateLivraisonEstimee,
      price: parseFloat(newShipment.price) || 0,
      notes: newShipment.notes,
      driverName: newShipment.driverName,
    };
    setData([shipment, ...data]);
    setShowAddDialog(false);
    setNewShipment({
      type: 'aerien',
      origin: '',
      destination: '',
      clientName: '',
      clientPhone: '',
      weight: '',
      dimensions: '',
      price: '',
      notes: '',
      driverName: '',
      dateLivraisonEstimee: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expéditions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos expéditions et colis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </Button>
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle expédition
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par N°, client, ville..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="aerien">Aérien</SelectItem>
                <SelectItem value="maritime">Maritime</SelectItem>
                <SelectItem value="terrestre">Terrestre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirmee">Confirmée</SelectItem>
                <SelectItem value="en_transit">En transit</SelectItem>
                <SelectItem value="livree">Livrée</SelectItem>
                <SelectItem value="retardee">Retardée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
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
                  <TableHead className="text-xs">N° Suivi</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Origine</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Destination</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Poids</TableHead>
                  <TableHead className="text-xs text-right">Prix</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Aucune expédition trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((shipment) => {
                    const TypeIcon = typeIcons[shipment.type];
                    return (
                      <TableRow key={shipment.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" onClick={() => handleViewDetail(shipment)}>
                        <TableCell className="font-mono text-xs font-semibold">{shipment.trackingNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TypeIcon className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs">{typeLabels[shipment.type]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{shipment.clientName}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{shipment.origin}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{shipment.destination}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[shipment.status]}`}>
                            {statusLabels[shipment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{formatDate(shipment.dateCreation)}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{shipment.weight} kg</TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatDZD(shipment.price)}</TableCell>
                        <TableCell>
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={(e) => { e.stopPropagation(); handleViewDetail(shipment); }}>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} — Page {currentPage}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono">{selectedShipment?.trackingNumber}</span>
            </DialogTitle>
            <DialogDescription>Détails de l&apos;expédition</DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${statusColors[selectedShipment.status]} text-sm px-3 py-1`}>
                  {statusLabels[selectedShipment.status]}
                </Badge>
                <div className="flex items-center gap-1.5">
                  {React.createElement(typeIcons[selectedShipment.type], { className: 'w-4 h-4 text-gray-500' })}
                  <span className="text-sm text-gray-600 dark:text-gray-300">{typeLabels[selectedShipment.type]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Client</p>
                  <p className="font-medium">{selectedShipment.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Téléphone</p>
                  <p className="font-medium">{selectedShipment.clientPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Origine</p>
                  <p className="font-medium">{selectedShipment.origin}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Destination</p>
                  <p className="font-medium">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Poids</p>
                  <p className="font-medium">{selectedShipment.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Dimensions</p>
                  <p className="font-medium">{selectedShipment.dimensions} cm</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date création</p>
                  <p className="font-medium">{formatDate(selectedShipment.dateCreation)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date expédition</p>
                  <p className="font-medium">{formatDate(selectedShipment.dateExpedition)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Livraison estimée</p>
                  <p className="font-medium">{formatDate(selectedShipment.dateLivraisonEstimee)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Prix</p>
                  <p className="font-semibold text-lg" style={{ color: '#1a56db' }}>{formatDZD(selectedShipment.price)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Chauffeur</p>
                  <p className="font-medium">{selectedShipment.driverName || '-'}</p>
                </div>
              </div>

              {selectedShipment.notes && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{selectedShipment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Shipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle expédition</DialogTitle>
            <DialogDescription>Créer une nouvelle expédition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={newShipment.type} onValueChange={(v) => setNewShipment({ ...newShipment, type: v as ShipmentType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aerien">Aérien</SelectItem>
                    <SelectItem value="maritime">Maritime</SelectItem>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Poids (kg)</Label>
                <Input
                  type="number"
                  value={newShipment.weight}
                  onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Origine</Label>
                <Select value={newShipment.origin} onValueChange={(v) => setNewShipment({ ...newShipment, origin: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ville d'origine" />
                  </SelectTrigger>
                  <SelectContent>
                    {algerianCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destination</Label>
                <Select value={newShipment.destination} onValueChange={(v) => setNewShipment({ ...newShipment, destination: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ville de destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {algerianCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom du client</Label>
                <Input
                  value={newShipment.clientName}
                  onChange={(e) => setNewShipment({ ...newShipment, clientName: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone client</Label>
                <Input
                  value={newShipment.clientPhone}
                  onChange={(e) => setNewShipment({ ...newShipment, clientPhone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Dimensions (cm)</Label>
                <Input
                  value={newShipment.dimensions}
                  onChange={(e) => setNewShipment({ ...newShipment, dimensions: e.target.value })}
                  placeholder="LxlxH"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prix (DA)</Label>
                <Input
                  type="number"
                  value={newShipment.price}
                  onChange={(e) => setNewShipment({ ...newShipment, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Chauffeur</Label>
                <Input
                  value={newShipment.driverName}
                  onChange={(e) => setNewShipment({ ...newShipment, driverName: e.target.value })}
                  placeholder="Nom du chauffeur"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Livraison estimée</Label>
                <Input
                  type="date"
                  value={newShipment.dateLivraisonEstimee}
                  onChange={(e) => setNewShipment({ ...newShipment, dateLivraisonEstimee: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={newShipment.notes}
                onChange={(e) => setNewShipment({ ...newShipment, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddShipment} className="text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}>
              Créer l&apos;expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
