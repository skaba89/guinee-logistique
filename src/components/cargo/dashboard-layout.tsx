'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Ship,
  Plane,
  Truck,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Container,
  FileCheck,
  Warehouse,
  PackageCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  ChevronRight,
  CheckCheck,
  MapPin,
  Calculator,
  Shield,
  Handshake,
  FileSpreadsheet,
  UserCheck,
  Plug,
  FolderOpen,
  AlertCircle,
  GitMerge,
  FileSignature,
  ListTodo,
  CalendarDays,
  Leaf,
  MessageSquare,
  ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useCargoStore, type PageType } from '@/lib/cargo-store';
import { shipments, containers, flights, parcels, customsDeclarations, clients } from '@/lib/test-data';
import { getFilteredNavigation, canViewPage } from '@/lib/permissions';

const pageNameMap: Record<PageType, string> = {
  dashboard: 'Tableau de bord',
  shipments: 'Expéditions',
  tracking: 'Suivi',
  clients: 'Clients',
  billing: 'Facturation',
  fleet: 'Flotte',
  settings: 'Paramètres',
  maritime: 'Fret Maritime',
  'air-freight': 'Fret Aérien',
  'ground-transport': 'Transport Terrestre',
  parcels: 'Colis & Courier',
  customs: 'Douanes',
  analytics: 'Analytics',
  warehouse: 'Entrepôt',
  quotations: 'Devis',
  documents: 'Documents',
  insurance: 'Assurance Cargo',
  partners: 'Partenaires',
  incoterms: 'Incoterms',
  reports: 'Rapports',
  drivers: 'Conducteurs',
  integrations: 'Intégrations',
  claims: 'Réclamations',
  multimodal: 'Transport Multi-Modal',
  contracts: 'Contrats Transporteurs',
  tasks: 'Centre de Tâches',
  calendar: 'Calendrier',
  sustainability: 'Durabilité & RSE',
  rates: 'Gestion des Tarifs',
  'customer-portal': 'Portail Client',
  users: 'Utilisateurs & Rôles',
  chat: 'Messagerie',
  scanner: 'Scanner',
};

// Notification data
interface Notification {
  id: string;
  type: 'shipment_status' | 'container_arrival' | 'flight_delay' | 'customs_clearance' | 'invoice_overdue' | 'delivery_completed';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
}

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'shipment_status', title: 'Statut mis à jour', description: 'FFP-0002-2026 est maintenant En transit', time: 'Il y a 5 min', read: false, icon: Package },
  { id: 'n2', type: 'container_arrival', title: 'Conteneur arrivé', description: 'CSLU-8912345 est arrivé au port d\'Alger', time: 'Il y a 15 min', read: false, icon: Ship },
  { id: 'n3', type: 'flight_delay', title: 'Vol retardé', description: 'EK-757 Emirates retardé de 2h', time: 'Il y a 30 min', read: false, icon: Plane },
  { id: 'n4', type: 'customs_clearance', title: 'Déclaration dédouanée', description: 'DD-2026-0003 a été dédouanée avec succès', time: 'Il y a 1h', read: false, icon: FileCheck },
  { id: 'n5', type: 'invoice_overdue', title: 'Facture en retard', description: 'FAC-2026-0005 - SPA HydroServices : 950 000 DA', time: 'Il y a 2h', read: false, icon: CreditCard },
  { id: 'n6', type: 'delivery_completed', title: 'Livraison terminée', description: 'FFP-0001-2026 livré à Paris', time: 'Il y a 3h', read: true, icon: CheckCircle2 },
  { id: 'n7', type: 'shipment_status', title: 'Nouvelle expédition', description: 'FFP-0022-2026 créée pour Karim Djebbar', time: 'Il y a 4h', read: true, icon: Package },
  { id: 'n8', type: 'container_arrival', title: 'Conteneur au port', description: 'TEMU-9987654 arrivé à Alger en provenance de Barcelone', time: 'Il y a 5h', read: true, icon: Ship },
  { id: 'n9', type: 'flight_delay', title: 'Vol annulé', description: 'AH-1080 Air Algérie Alger-Dubaï annulé', time: 'Il y a 6h', read: true, icon: AlertTriangle },
  { id: 'n10', type: 'invoice_overdue', title: 'Facture en retard', description: 'FAC-2026-0012 - Sarl TechnoPlus : 280 000 DA', time: 'Hier', read: true, icon: CreditCard },
];

const notificationTypeColors: Record<Notification['type'], string> = {
  shipment_status: 'text-teal-500',
  container_arrival: 'text-sky-500',
  flight_delay: 'text-orange-500',
  customs_clearance: 'text-emerald-500',
  invoice_overdue: 'text-red-500',
  delivery_completed: 'text-green-500',
};

// Search result types
interface SearchItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  page: PageType;
}

function getSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];

  shipments.forEach((s) => {
    items.push({
      id: `shipment-${s.id}`,
      label: s.trackingNumber,
      description: `${s.clientName} - ${s.origin} vers ${s.destination}`,
      icon: s.type === 'aerien' ? Plane : s.type === 'maritime' ? Ship : Truck,
      page: 'shipments',
    });
  });

  containers.forEach((c) => {
    items.push({
      id: `container-${c.id}`,
      label: c.containerNumber,
      description: `${c.portOfLoading} vers ${c.portOfDischarge} - ${c.clientName}`,
      icon: Container,
      page: 'maritime',
    });
  });

  flights.forEach((f) => {
    items.push({
      id: `flight-${f.id}`,
      label: f.flightNumber,
      description: `${f.airline} - ${f.origin} vers ${f.destination}`,
      icon: Plane,
      page: 'air-freight',
    });
  });

  parcels.forEach((p) => {
    items.push({
      id: `parcel-${p.id}`,
      label: p.trackingNumber,
      description: `${p.senderName} vers ${p.receiverName}`,
      icon: PackageCheck,
      page: 'parcels',
    });
  });

  customsDeclarations.forEach((d) => {
    items.push({
      id: `customs-${d.id}`,
      label: d.declarationNumber,
      description: `${d.clientName} - ${d.goodsDescription}`,
      icon: FileCheck,
      page: 'customs',
    });
  });

  clients.forEach((c) => {
    items.push({
      id: `client-${c.id}`,
      label: c.name,
      description: `${c.city} - ${c.email}`,
      icon: Users,
      page: 'clients',
    });
  });

  return items;
}

const searchItems = getSearchItems();

// Recent searches (static demo)
const recentSearches = [
  { id: 'rs1', label: 'FFP-0002-2026', description: 'Expédition en transit', icon: Package, page: 'shipments' as PageType },
  { id: 'rs2', label: 'MSKU-7234561', description: 'Conteneur maritime', icon: Container, page: 'maritime' as PageType },
  { id: 'rs3', label: 'SPA HydroServices', description: 'Client', icon: Users, page: 'clients' as PageType },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentPage, setPage, user, logout, sidebarOpen, toggleSidebar, setSidebarOpen, roleKey, permissionsConfig } = useCargoStore();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [commandOpen, setCommandOpen] = useState(false);

  // Build dynamic navigation based on user role and permissions
  const filteredNavGroups = React.useMemo(() => {
    return getFilteredNavigation(roleKey, permissionsConfig);
  }, [roleKey, permissionsConfig]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearchSelect = (page: PageType) => {
    setCommandOpen(false);
    // Only navigate if user has permission
    if (canViewPage(page, roleKey, permissionsConfig)) {
      setPage(page);
    }
  };

  // Filter search items based on user permissions
  const accessibleSearchItems = React.useMemo(() => {
    return searchItems.filter((item) => canViewPage(item.page, roleKey, permissionsConfig));
  }, [roleKey, permissionsConfig]);

  const accessibleRecentSearches = React.useMemo(() => {
    return recentSearches.filter((item) => canViewPage(item.page, roleKey, permissionsConfig));
  }, [roleKey, permissionsConfig]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a2520 100%)' }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                <Ship className="w-5 h-5 text-white" />
                <div className="absolute -right-0.5 -top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#0f172a', border: '1.5px solid #0d9488' }}>
                  <ArrowRight className="w-2 h-2 text-teal-400" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">FreightFlow Pro</h1>
                <p className="text-[9px] text-teal-300/50 uppercase tracking-widest">Logistique</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation — Dynamically filtered by role & permissions */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
            {filteredNavGroups.map((group) => (
              <div key={group.key}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-teal-400/50">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-teal-500/15 text-white shadow-sm border-l-2 border-teal-400'
                            : 'text-slate-300/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <IconComponent className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-indicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Search button / command palette trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 h-9 w-64 lg:w-80 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Rechercher...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Center */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-1.5 py-0">
                        {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tout marquer
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.map((notification) => {
                      const NotifIcon = notification.icon;
                      return (
                        <button
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            !notification.read ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                          }`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${notificationTypeColors[notification.type]}`}>
                            <NotifIcon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400">{notification.time}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="px-4 py-2.5 border-t bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                  <button className="w-full text-center text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                      {user?.name?.split(' ').map((n) => n[0]).join('') || 'AB'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                      {user?.name || 'Utilisateur'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {user?.role || 'Admin'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setPage('settings')}>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPage('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <nav className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => setPage('dashboard')}
              className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
            >
              FreightFlow Pro
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {pageNameMap[currentPage]}
            </span>
          </nav>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette Dialog */}
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Recherche universelle"
        description="Rechercher des expéditions, conteneurs, vols, clients..."
      >
        <CommandInput placeholder="Rechercher un colis, conteneur, vol, client..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
          <CommandGroup heading="Recherches récentes">
            {accessibleRecentSearches.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSearchSelect(item.page)}
                className="cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-400 ml-2">{item.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Expéditions">
            {accessibleSearchItems.filter((i) => i.page === 'shipments').slice(0, 5).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSearchSelect(item.page)}
                className="cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-teal-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-semibold text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-2 truncate">{item.description}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  Expédition
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Conteneurs">
            {accessibleSearchItems.filter((i) => i.page === 'maritime').slice(0, 4).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSearchSelect(item.page)}
                className="cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-sky-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-semibold text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-2 truncate">{item.description}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  Conteneur
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Vols">
            {accessibleSearchItems.filter((i) => i.page === 'air-freight').slice(0, 4).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSearchSelect(item.page)}
                className="cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-semibold text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-2 truncate">{item.description}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Vol
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Clients">
            {accessibleSearchItems.filter((i) => i.page === 'clients').slice(0, 4).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSearchSelect(item.page)}
                className="cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-violet-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-2 truncate">{item.description}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  Client
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
