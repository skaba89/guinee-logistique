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
  Camera,
  RotateCcw,
  Printer,
  DollarSign,
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
import ChatbotWidget from '@/components/cargo/chatbot-widget';
import {
  getNotificationsForRole,
  markNotificationRead as markNotificationReadLib,
  markAllNotificationsRead as markAllNotificationsReadLib,
  getUnreadCount as getUnreadCountLib,
  notificationTypeLabels,
  getPendingApprovals,
  type Notification as LibNotification,
} from '@/lib/notifications';

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
  'temperature-controlled': 'Chaîne du Froid',
  'dangerous-goods': 'Marchandises Dangereuses',
  'credit-management': 'Crédit & Risque',
  compliance: 'Conformité Réglementaire',
  hr: 'Ressources Humaines',
  expenses: 'Gestion des Dépenses',
};

// Notification type icon mapping
const notificationIconMap: Record<string, React.ElementType> = {
  shipment_created: Package,
  shipment_status_changed: Package,
  shipment_delayed: AlertTriangle,
  parcel_created: PackageCheck,
  parcel_status_changed: PackageCheck,
  parcel_delivered: CheckCircle2,
  parcel_returned: RotateCcw,
  label_printed: Printer,
  label_print_failed: AlertTriangle,
  proof_photo_uploaded: Camera,
  proof_photo_required: Camera,
  invoice_overdue: CreditCard,
  invoice_paid: CheckCircle2,
  customs_hold: AlertCircle,
  customs_cleared: FileCheck,
  rule_violation: AlertTriangle,
  rule_override: Shield,
  approval_requested: Clock,
  approval_granted: CheckCircle2,
  approval_rejected: X,
  printer_offline: Printer,
  printer_error: AlertTriangle,
  printer_low_media: Printer,
  fuel_surcharge_change: DollarSign,
  system_maintenance: Settings,
  system_update: Settings,
  task_assigned: ListTodo,
  task_overdue: AlertTriangle,
  chat_message: MessageSquare,
};

const notificationTypeColorMap: Record<string, string> = {
  shipment_created: 'text-teal-500',
  shipment_status_changed: 'text-teal-500',
  shipment_delayed: 'text-orange-500',
  parcel_created: 'text-violet-500',
  parcel_status_changed: 'text-violet-500',
  parcel_delivered: 'text-green-500',
  parcel_returned: 'text-red-500',
  label_printed: 'text-blue-500',
  label_print_failed: 'text-red-500',
  proof_photo_uploaded: 'text-amber-500',
  proof_photo_required: 'text-amber-500',
  invoice_overdue: 'text-red-500',
  invoice_paid: 'text-green-500',
  customs_hold: 'text-orange-500',
  customs_cleared: 'text-emerald-500',
  rule_violation: 'text-red-500',
  rule_override: 'text-amber-500',
  approval_requested: 'text-amber-500',
  approval_granted: 'text-green-500',
  approval_rejected: 'text-red-500',
  printer_offline: 'text-gray-500',
  printer_error: 'text-red-500',
  printer_low_media: 'text-amber-500',
  fuel_surcharge_change: 'text-sky-500',
  system_maintenance: 'text-gray-500',
  system_update: 'text-blue-500',
  task_assigned: 'text-violet-500',
  task_overdue: 'text-red-500',
  chat_message: 'text-sky-500',
};

function formatNotifTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

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
  const [notifications, setNotifications] = useState<LibNotification[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);

  // Load notifications from real system
  useEffect(() => {
    setNotifications(getNotificationsForRole(roleKey));
    setPendingApprovals(getPendingApprovals().length);
  }, [roleKey]);

  // Build dynamic navigation based on user role and permissions
  const filteredNavGroups = React.useMemo(() => {
    return getFilteredNavigation(roleKey, permissionsConfig);
  }, [roleKey, permissionsConfig]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useCallback(() => {
    markAllNotificationsReadLib();
    setNotifications(getNotificationsForRole(roleKey));
  }, [roleKey]);

  const markAsRead = useCallback((id: string) => {
    markNotificationReadLib(id);
    setNotifications(getNotificationsForRole(roleKey));
  }, [roleKey]);

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
                <h1 className="text-base font-bold text-white tracking-tight">LogisWay</h1>
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
                  {pendingApprovals > 0 && (
                    <span className="absolute -bottom-0.5 -left-0.5 min-w-[16px] h-[16px] rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                      {pendingApprovals}
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
                      const NotifIcon = notificationIconMap[notification.type] || Bell;
                      return (
                        <button
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            !notification.read ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                          }`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${notificationTypeColorMap[notification.type] || 'text-gray-500'}`}>
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
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400">{formatNotifTime(notification.createdAt)}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="px-4 py-2.5 border-t bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                  <button onClick={() => setPage('settings')} className="w-full text-center text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
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
              LogisWay
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

      {/* FlowBot Chatbot Widget */}
      <ChatbotWidget />

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
