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
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCargoStore, type PageType, CURRENCIES } from '@/lib/cargo-store';
import { shipments, containers, flights, parcels, customsDeclarations, clients } from '@/lib/test-data';
import { getFilteredNavigation, canViewPage } from '@/lib/permissions';
import ChatbotWidget from '@/components/cargo/chatbot-widget';
import CollapsibleSidebarNav from '@/components/cargo/collapsible-sidebar-nav';
import ThemeSwitcher from '@/components/cargo/theme-switcher';
import { brandGradient } from '@/lib/design-tokens';
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
  'analytics-kpi': 'Analytique KPIs',
  validation: 'Contrôle & Validation',
  messaging: 'Messagerie Avancée',
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
  const sidebarCollapsed = useCargoStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useCargoStore((s) => s.toggleSidebarCollapsed);
  const pageHistory = useCargoStore((s) => s.pageHistory);
  const currency = useCargoStore((s) => s.currency);
  const setCurrency = useCargoStore((s) => s.setCurrency);
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

  // Breadcrumb: can go back?
  const previousPage = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
        {/* ─── Desktop Sidebar (collapsible) ─────────────────────── */}
        <motion.aside
          className="hidden lg:flex flex-shrink-0 h-screen sticky top-0 flex-col overflow-hidden"
          animate={{ width: sidebarCollapsed ? 68 : 256 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a2520 100%)' }}
        >
          <CollapsibleSidebarNav collapsed={sidebarCollapsed} />

          {/* Collapse toggle button */}
          <div className="px-2 pb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebarCollapsed}
                  className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <>
                      <PanelLeftClose className="w-4 h-4" />
                      <span>Réduire</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {sidebarCollapsed ? 'Développer le menu' : 'Réduire le menu'}
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.aside>

        {/* ─── Mobile Sidebar (Sheet) ────────────────────────────── */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 sm:max-w-xs" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a2520 100%)' }}>
            <SheetTitle className="sr-only">Navigation LogisWay</SheetTitle>
            <CollapsibleSidebarNav collapsed={false} onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* ─── Main content area ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ─── Top header bar ─────────────────────────────────────── */}
          <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Desktop collapse button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebarCollapsed}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
                  >
                    <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {sidebarCollapsed ? 'Développer le menu' : 'Réduire le menu'}
                </TooltipContent>
              </Tooltip>

              {/* Search button / command palette trigger */}
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 h-9 w-64 lg:w-80 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-sm transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Rechercher...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                  <span className="text-xs">Ctrl</span>K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Currency Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                    <DollarSign className="w-3.5 h-3.5 text-teal-500" />
                    {currency}
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {Object.values(CURRENCIES).map((c) => (
                    <DropdownMenuItem
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={`text-xs ${currency === c.code ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold' : ''}`}
                    >
                      <span className="font-medium w-10">{c.code}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-gray-500 dark:text-gray-400 truncate">{c.symbol} {c.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notification Center */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1"
                      >
                        {unreadCount}
                      </motion.span>
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
                  <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-[0.98]">
                    <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-teal-200 dark:hover:ring-teal-800 transition-all">
                      <AvatarFallback className="text-xs font-semibold text-white" style={{ background: brandGradient }}>
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

          {/* ─── Enhanced Breadcrumbs ───────────────────────────────── */}
          <div className="px-4 sm:px-6 py-2.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
            <nav className="flex items-center gap-2 text-sm">
              {/* Back button if history */}
              {previousPage && (
                <button
                  onClick={() => setPage(previousPage)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-1"
                  title="Retour"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              <button
                onClick={() => setPage('dashboard')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LogisWay</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
              <motion.span
                key={currentPage}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-gray-700 dark:text-gray-200 font-semibold"
              >
                {pageNameMap[currentPage]}
              </motion.span>
            </nav>
          </div>

          {/* ─── Page content ──────────────────────────────────────────── */}
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
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
    </TooltipProvider>
  );
}
