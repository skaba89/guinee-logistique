'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Truck,
  Search,
  LayoutGrid,
  List,
  Phone,
  Gauge,
  Weight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  vehicles as initialVehicles,
  vehicleTypeLabels,
  vehicleStatusLabels,
  type Vehicle,
  type VehicleType,
  type VehicleStatus,
} from '@/lib/test-data';

const statusColors: Record<string, string> = {
  actif: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  en_maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  hors_service: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const vehicleIcons: Record<VehicleType, React.ElementType> = {
  camion: Truck,
  fourgon: Truck,
  remorque: Truck,
};

const vehicleGradients: Record<VehicleType, string> = {
  camion: 'from-blue-500 to-blue-600',
  fourgon: 'from-emerald-500 to-emerald-600',
  remorque: 'from-purple-500 to-purple-600',
};

export default function FleetPage() {
  const [data, setData] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    immatriculation: '',
    type: 'camion' as VehicleType,
    marque: '',
    modele: '',
    annee: '',
    driverName: '',
    driverPhone: '',
    capacity: '',
    kilometrage: '',
  });

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType !== 'all') {
      result = result.filter((v) => v.type === filterType);
    }
    if (filterStatus !== 'all') {
      result = result.filter((v) => v.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.immatriculation.toLowerCase().includes(q) ||
          v.marque.toLowerCase().includes(q) ||
          v.modele.toLowerCase().includes(q) ||
          v.driverName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, filterType, filterStatus, searchQuery]);

  const handleAddVehicle = () => {
    const vehicle: Vehicle = {
      id: `v${data.length + 1}`,
      immatriculation: newVehicle.immatriculation,
      type: newVehicle.type,
      marque: newVehicle.marque,
      modele: newVehicle.modele,
      annee: parseInt(newVehicle.annee) || 2024,
      status: 'actif',
      driverName: newVehicle.driverName,
      driverPhone: newVehicle.driverPhone,
      capacity: parseFloat(newVehicle.capacity) || 0,
      kilometrage: parseInt(newVehicle.kilometrage) || 0,
    };
    setData([vehicle, ...data]);
    setShowAddDialog(false);
    setNewVehicle({
      immatriculation: '',
      type: 'camion',
      marque: '',
      modele: '',
      annee: '',
      driverName: '',
      driverPhone: '',
      capacity: '',
      kilometrage: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flotte</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez votre parc de véhicules</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-2 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouveau véhicule
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
                placeholder="Rechercher par immatriculation, marque, chauffeur..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="camion">Camion</SelectItem>
                <SelectItem value="fourgon">Fourgon</SelectItem>
                <SelectItem value="remorque">Remorque</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en_maintenance">En maintenance</SelectItem>
                <SelectItem value="hors_service">Hors service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">Aucun véhicule trouvé</div>
          ) : (
            filtered.map((vehicle, index) => {
              const VehicleIcon = vehicleIcons[vehicle.type];
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${vehicleGradients[vehicle.type]} flex items-center justify-center`}>
                            <VehicleIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-semibold">{vehicle.immatriculation}</p>
                            <p className="text-xs text-gray-500">{vehicle.marque} {vehicle.modele}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[vehicle.status]}`}>
                          {vehicleStatusLabels[vehicle.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Weight className="w-3.5 h-3.5" />
                          <span>{vehicle.capacity} tonnes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Gauge className="w-3.5 h-3.5" />
                          <span>{vehicle.kilometrage.toLocaleString('fr-FR')} km</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{vehicleTypeLabels[vehicle.type]}</span>
                        </div>
                        <div className="text-gray-500">
                          {vehicle.annee}
                        </div>
                      </div>

                      {vehicle.driverName && (
                        <div className="pt-3 border-t flex items-center justify-between">
                          <div className="text-xs">
                            <p className="font-medium text-gray-900 dark:text-white">{vehicle.driverName}</p>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {vehicle.driverPhone}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Immatriculation</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Marque/Modèle</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Année</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Chauffeur</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Capacité</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Kilométrage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Aucun véhicule trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-mono text-xs font-semibold">{vehicle.immatriculation}</TableCell>
                        <TableCell className="text-xs">{vehicleTypeLabels[vehicle.type]}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{vehicle.marque} {vehicle.modele}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{vehicle.annee}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[vehicle.status]}`}>
                            {vehicleStatusLabels[vehicle.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{vehicle.driverName || '-'}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{vehicle.capacity} t</TableCell>
                        <TableCell className="text-xs hidden xl:table-cell">{vehicle.kilometrage.toLocaleString('fr-FR')} km</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau véhicule</DialogTitle>
            <DialogDescription>Ajouter un véhicule à la flotte</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Immatriculation</Label>
                <Input
                  value={newVehicle.immatriculation}
                  onChange={(e) => setNewVehicle({ ...newVehicle, immatriculation: e.target.value })}
                  placeholder="XX-XXXX-XXX"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={newVehicle.type} onValueChange={(v) => setNewVehicle({ ...newVehicle, type: v as VehicleType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camion">Camion</SelectItem>
                    <SelectItem value="fourgon">Fourgon</SelectItem>
                    <SelectItem value="remorque">Remorque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Marque</Label>
                <Input
                  value={newVehicle.marque}
                  onChange={(e) => setNewVehicle({ ...newVehicle, marque: e.target.value })}
                  placeholder="Marque"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Modèle</Label>
                <Input
                  value={newVehicle.modele}
                  onChange={(e) => setNewVehicle({ ...newVehicle, modele: e.target.value })}
                  placeholder="Modèle"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Année</Label>
                <Input
                  type="number"
                  value={newVehicle.annee}
                  onChange={(e) => setNewVehicle({ ...newVehicle, annee: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Capacité (tonnes)</Label>
                <Input
                  type="number"
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom du chauffeur</Label>
                <Input
                  value={newVehicle.driverName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone chauffeur</Label>
                <Input
                  value={newVehicle.driverPhone}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverPhone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Kilométrage</Label>
              <Input
                type="number"
                value={newVehicle.kilometrage}
                onChange={(e) => setNewVehicle({ ...newVehicle, kilometrage: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddVehicle} className="text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}>
              Ajouter le véhicule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
