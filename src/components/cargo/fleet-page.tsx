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
  Pencil,
  Trash2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  vehicles as initialVehicles,
  vehicleTypeLabels,
  vehicleStatusLabels,
  type Vehicle,
  type VehicleType,
  type VehicleStatus,
} from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

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

const emptyVehicleForm = {
  immatriculation: '',
  type: 'camion' as VehicleType,
  marque: '',
  modele: '',
  annee: '',
  status: 'actif' as VehicleStatus,
  driverName: '',
  driverPhone: '',
  capacity: '',
  kilometrage: '',
};

export default function FleetPage() {
  const canEditFleet = useCargoStore((s) => s.canEdit('fleet'));
  const [data, setData] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  const [newVehicle, setNewVehicle] = useState({ ...emptyVehicleForm });

  const [editForm, setEditForm] = useState({ ...emptyVehicleForm });

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
      id: `v${Date.now()}`,
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
    setNewVehicle({ ...emptyVehicleForm });
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditForm({
      immatriculation: vehicle.immatriculation,
      type: vehicle.type,
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee: String(vehicle.annee),
      status: vehicle.status,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      capacity: String(vehicle.capacity),
      kilometrage: String(vehicle.kilometrage),
    });
    setShowEditDialog(true);
  };

  const handleEditVehicle = () => {
    if (!editingVehicle) return;
    setData((prev) =>
      prev.map((v) =>
        v.id === editingVehicle.id
          ? {
              ...v,
              immatriculation: editForm.immatriculation,
              marque: editForm.marque,
              modele: editForm.modele,
              annee: parseInt(editForm.annee) || v.annee,
              status: editForm.status,
              driverName: editForm.driverName,
              driverPhone: editForm.driverPhone,
              capacity: parseFloat(editForm.capacity) || v.capacity,
              kilometrage: parseInt(editForm.kilometrage) || v.kilometrage,
            }
          : v
      )
    );
    setShowEditDialog(false);
    setEditingVehicle(null);
  };

  const handleOpenDelete = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
    setShowDeleteDialog(true);
  };

  const handleDeleteVehicle = () => {
    if (!deletingVehicle) return;
    setData((prev) => prev.filter((v) => v.id !== deletingVehicle.id));
    setShowDeleteDialog(false);
    setDeletingVehicle(null);
  };

  const handleStatusChange = (vehicleId: string, newStatus: VehicleStatus) => {
    setData((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: newStatus } : v))
    );
  };

  const StatusBadge = ({ vehicle }: { vehicle: Vehicle }) => {
    if (!canEditFleet) {
      return (
        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[vehicle.status]}`}>
          {vehicleStatusLabels[vehicle.status]}
        </Badge>
      );
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none">
            <Badge
              variant="secondary"
              className={`text-[10px] px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity ${statusColors[vehicle.status]}`}
            >
              {vehicleStatusLabels[vehicle.status]}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => handleStatusChange(vehicle.id, 'actif')}
            className="text-xs"
          >
            <span className={`inline-block w-2 h-2 rounded-full bg-green-500 mr-2`} />
            Actif
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(vehicle.id, 'en_maintenance')}
            className="text-xs"
          >
            <span className={`inline-block w-2 h-2 rounded-full bg-orange-500 mr-2`} />
            En maintenance
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(vehicle.id, 'hors_service')}
            className="text-xs"
          >
            <span className={`inline-block w-2 h-2 rounded-full bg-red-500 mr-2`} />
            Hors service
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
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
                        <div className="flex items-center gap-1">
                          <StatusBadge vehicle={vehicle} />
                          {canEditFleet && (
                            <>
                              <button
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => handleOpenEdit(vehicle)}
                                title="Modifier"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <button
                                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                onClick={() => handleOpenDelete(vehicle)}
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
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
                    {canEditFleet && <TableHead className="text-xs w-20">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canEditFleet ? 9 : 8} className="text-center py-8 text-gray-500">
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
                          <StatusBadge vehicle={vehicle} />
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{vehicle.driverName || '-'}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{vehicle.capacity} t</TableCell>
                        <TableCell className="text-xs hidden xl:table-cell">{vehicle.kilometrage.toLocaleString('fr-FR')} km</TableCell>
                        {canEditFleet && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => handleOpenEdit(vehicle)}
                                title="Modifier"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <button
                                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                onClick={() => handleOpenDelete(vehicle)}
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </TableCell>
                        )}
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
            <Button onClick={handleAddVehicle} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Ajouter le véhicule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le véhicule</DialogTitle>
            <DialogDescription>Modifier les informations du véhicule</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Immatriculation</Label>
                <Input
                  value={editForm.immatriculation}
                  onChange={(e) => setEditForm({ ...editForm, immatriculation: e.target.value })}
                  placeholder="XX-XXXX-XXX"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Statut</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as VehicleStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="en_maintenance">En maintenance</SelectItem>
                    <SelectItem value="hors_service">Hors service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Marque</Label>
                <Input
                  value={editForm.marque}
                  onChange={(e) => setEditForm({ ...editForm, marque: e.target.value })}
                  placeholder="Marque"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Modèle</Label>
                <Input
                  value={editForm.modele}
                  onChange={(e) => setEditForm({ ...editForm, modele: e.target.value })}
                  placeholder="Modèle"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Année</Label>
                <Input
                  type="number"
                  value={editForm.annee}
                  onChange={(e) => setEditForm({ ...editForm, annee: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Capacité (tonnes)</Label>
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom du chauffeur</Label>
                <Input
                  value={editForm.driverName}
                  onChange={(e) => setEditForm({ ...editForm, driverName: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Téléphone chauffeur</Label>
                <Input
                  value={editForm.driverPhone}
                  onChange={(e) => setEditForm({ ...editForm, driverPhone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Kilométrage</Label>
              <Input
                type="number"
                value={editForm.kilometrage}
                onChange={(e) => setEditForm({ ...editForm, kilometrage: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleEditVehicle} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le véhicule</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le véhicule{' '}
              <span className="font-semibold">{deletingVehicle?.immatriculation}</span> ?{' '}
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
