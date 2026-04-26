'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Building2,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  clients as initialClients,
  shipments,
  clientTypeLabels,
  formatDZD,
  statusLabels,
  type Client,
  type ClientType,
} from '@/lib/test-data';

const ITEMS_PER_PAGE = 8;

const algerianCities = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Sétif', 'Blida',
  'Tizi Ouzou', 'Béjaïa', 'Batna', 'Djelfa', 'Biskra', 'Tiaret',
];

export default function ClientsPage() {
  const [data, setData] = useState<Client[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    type: 'particulier' as ClientType,
  });

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType !== 'all') {
      result = result.filter((c) => c.type === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, filterType, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const clientShipments = useMemo(() => {
    if (!selectedClient) return [];
    return shipments.filter((s) => s.clientName === selectedClient.name);
  }, [selectedClient]);

  const handleAddClient = () => {
    const client: Client = {
      id: `c${data.length + 1}`,
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      address: newClient.address,
      city: newClient.city,
      type: newClient.type,
      totalShipments: 0,
      totalRevenue: 0,
    };
    setData([client, ...data]);
    setShowAddDialog(false);
    setNewClient({ name: '', phone: '', email: '', address: '', city: '', type: 'particulier' });
  };

  const handleViewDetail = (client: Client) => {
    setSelectedClient(client);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez votre base de clients</p>
        </div>
        <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }} onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Nouveau client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, téléphone, email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="entreprise">Entreprise</SelectItem>
                <SelectItem value="particulier">Particulier</SelectItem>
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
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Téléphone</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-xs">Ville</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Expéditions</TableHead>
                  <TableHead className="text-xs text-right">CA Total</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" onClick={() => handleViewDetail(client)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`text-xs font-semibold text-white ${client.type === 'entreprise' ? 'bg-blue-600' : 'bg-teal-600'}`}>
                              {client.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{client.phone}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{client.email}</TableCell>
                      <TableCell className="text-xs">{client.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${client.type === 'entreprise' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                          {client.type === 'entreprise' ? <Building2 className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                          {clientTypeLabels[client.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs hidden lg:table-cell font-medium">{client.totalShipments}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{formatDZD(client.totalRevenue)}</TableCell>
                      <TableCell>
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={(e) => { e.stopPropagation(); handleViewDetail(client); }}>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">
                {filtered.length} client{filtered.length > 1 ? 's' : ''} — Page {currentPage}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
            <DialogDescription>Informations et historique des expéditions</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className={`text-lg font-semibold text-white ${selectedClient.type === 'entreprise' ? 'bg-blue-600' : 'bg-teal-600'}`}>
                    {selectedClient.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedClient.name}</h3>
                  <Badge variant="secondary" className={`text-[10px] ${selectedClient.type === 'entreprise' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
                    {clientTypeLabels[selectedClient.type]}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedClient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{selectedClient.email}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedClient.address}, {selectedClient.city}</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-2xl font-bold" style={{ color: '#1a56db' }}>{selectedClient.totalShipments}</p>
                  <p className="text-xs text-gray-500">Expéditions</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-2xl font-bold text-green-600">{formatDZD(selectedClient.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">CA Total</p>
                </div>
              </div>

              {/* Client's Shipments */}
              {clientShipments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Expéditions récentes</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clientShipments.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs">
                        <div>
                          <span className="font-mono font-semibold">{s.trackingNumber}</span>
                          <span className="text-gray-500 ml-2">{s.origin} → {s.destination}</span>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5`}>
                          {statusLabels[s.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
            <DialogDescription>Ajouter un nouveau client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Nom complet</Label>
                <Input
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={newClient.type} onValueChange={(v) => setNewClient({ ...newClient, type: v as ClientType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entreprise">Entreprise</SelectItem>
                    <SelectItem value="particulier">Particulier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="email@exemple.dz"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Adresse</Label>
              <Input
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Ville</Label>
              <Select value={newClient.city} onValueChange={(v) => setNewClient({ ...newClient, city: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {algerianCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddClient} className="text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}>
              Ajouter le client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
