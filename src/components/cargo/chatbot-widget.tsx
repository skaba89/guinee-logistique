'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowUp,
  RotateCcw,
  Package,
  Ship,
  Truck,
  Plane,
  Clock,
  AlertCircle,
  Navigation,
  BarChart3,
  Backpack,
  Route,
  Receipt,
  FileText,
  Users,
  Settings,
  Zap,
  TrendingUp,
  Globe,
  Shield,
  Calculator,
  Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useCargoStore, type PageType } from '@/lib/cargo-store';

// ─── Types ────────────────────────────────────────────────────────

interface DetectedReference {
  type: 'tracking' | 'container' | 'flight' | 'parcel' | 'customs';
  value: string;
}

interface SuggestedAction {
  label: string;
  icon: React.ElementType;
  page: PageType;
  description: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  detectedReferences?: DetectedReference[];
  suggestedActions?: SuggestedAction[];
  error?: boolean;
}

interface ChatApiResponse {
  reply: string;
}

// ─── Constants ────────────────────────────────────────────────────

const STORAGE_KEY_HISTORY = 'guinee-logistique-chatbot-history';
const STORAGE_KEY_OPEN = 'guinee-logistique-chatbot-open';
const INITIAL_GREETING = "Bonjour ! Je suis **GL Bot**, votre assistant IA autonome Guinée Logistique. 🤖\n\nJe peux vous aider avec :\n• 📦 Suivi d'expéditions en temps réel\n• 💰 Tarifs, devis et facturation\n• 🗺️ Optimisation de tournées\n• 🎒 Ramassage et livraison\n• 🏢 Douanes et conformité\n• 📊 Analytics et reporting\n\nPosez-moi n'importe quelle question ou utilisez les raccourcis ci-dessous !";

const QUICK_ACTIONS = [
  { label: 'Suivi expédition', icon: Package, message: 'Je souhaite suivre une expédition. Quelles expéditions sont actuellement en cours ?', page: 'tracking' as PageType },
  { label: 'Mes colis', icon: Truck, message: 'Quel est le statut de mes colis en cours ?', page: 'parcels' as PageType },
  { label: 'Optimiser tournée', icon: Route, message: 'Comment optimiser mes tournées de livraison à Conakry ?', page: 'route-optimization' as PageType },
  { label: 'Ramasseurs', icon: Backpack, message: 'Quel est l\'état des ramassages en cours ?', page: 'collector-portal' as PageType },
  { label: 'Tarifs fret', icon: Ship, message: 'Quels sont les tarifs de fret actuels pour maritime, aérien et terrestre ?', page: 'rates' as PageType },
  { label: 'Facturation', icon: Receipt, message: 'Quelles factures sont en retard de paiement ?', page: 'billing' as PageType },
  { label: 'Analytics', icon: BarChart3, message: 'Donnez-moi un résumé des performances logistiques du mois', page: 'analytics' as PageType },
  { label: 'Aide', icon: Sparkles, message: 'Comment puis-je naviguer dans l\'application ?', page: 'dashboard' as PageType },
] as const;

const LOGISTICS_PATTERNS: Array<{
  type: DetectedReference['type'];
  regex: RegExp;
  icon: React.ElementType;
}> = [
  { type: 'tracking', regex: /\bFFP-\d{4}-\d{4}\b/gi, icon: Package },
  { type: 'container', regex: /\bMSKU-\d{7}\b/gi, icon: Ship },
  { type: 'flight', regex: /\b[A-Z]{2}-?\d{3,4}\b/g, icon: Plane },
  { type: 'parcel', regex: /\bPC-FP-\d{4}-\d{4}\b/gi, icon: Truck },
  { type: 'customs', regex: /\bDOU-\d{4}-\d{4}\b/gi, icon: FileText },
];

// Page name mapping for navigation suggestions
const PAGE_NAMES: Record<string, string> = {
  dashboard: 'Tableau de bord',
  shipments: 'Expéditions',
  tracking: 'Suivi',
  maritime: 'Fret Maritime',
  'air-freight': 'Fret Aérien',
  'ground-transport': 'Transport Terrestre',
  parcels: 'Colis & Courier',
  customs: 'Douanes',
  warehouse: 'Entrepôt',
  quotations: 'Devis',
  clients: 'Clients',
  billing: 'Facturation',
  contracts: 'Contrats',
  rates: 'Tarifs',
  fleet: 'Flotte',
  drivers: 'Conducteurs',
  documents: 'Documents',
  'route-optimization': 'Optimisation Tournées',
  'customer-portal': 'Portail Client',
  'collector-portal': 'Portail Ramasseurs',
  hr: 'Ressources Humaines',
  expenses: 'Dépenses',
  chat: 'Messagerie',
  analytics: 'Analytics',
  reports: 'Rapports',
  insurance: 'Assurance Cargo',
  incoterms: 'Incoterms',
  'credit-management': 'Crédit & Risque',
  compliance: 'Conformité',
  settings: 'Paramètres',
};

// Keywords to page mapping for smart navigation suggestions
const NAVIGATION_KEYWORDS: Record<string, PageType[]> = {
  'expédition|shipment|envoi|colis envoi': ['shipments', 'tracking'],
  'suivi|tracking|localiser|où est': ['tracking', 'shipments'],
  'maritime|conteneur|navire|fret mer': ['maritime'],
  'aérien|vol|avion|fret air': ['air-freight'],
  'terrestre|camion|route|fret terre': ['ground-transport'],
  'colis|courrier|parcel|paquet': ['parcels'],
  'douane|customs|déclaration|hs code': ['customs'],
  'entrepôt|stock|warehouse|stockage': ['warehouse'],
  'devis|quotation|citation': ['quotations'],
  'client|customer': ['clients'],
  'factur|paiement|payment|relance': ['billing'],
  'contrat|contract': ['contracts'],
  'tarif|prix|rate|cost': ['rates'],
  'flotte|véhicule|vehicle|camion': ['fleet'],
  'conducteur|chauffeur|driver': ['drivers'],
  'document|bl|lta|connaissement': ['documents'],
  'optimis|tournée|route|chemin|livraison': ['route-optimization'],
  'ramass|collect|pickup|ramasseur': ['collector-portal'],
  'portail client|self-service': ['customer-portal'],
  'employé|rh|paie|congé|recrutement': ['hr'],
  'dépense|budget|expense|finance': ['expenses'],
  'messagerie|chat|message': ['chat'],
  'analyt|kpi|statistique|performance': ['analytics'],
  'rapport|report|export': ['reports'],
  'assurance|insurance|dommage': ['insurance'],
  'incoterm|fob|cif|ddp': ['incoterms'],
  'crédit|risque|encours': ['credit-management'],
  'conformité|réglement|kyc': ['compliance'],
  'paramètre|settings|config': ['settings'],
};

// ─── Utility Functions ────────────────────────────────────────────

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function detectLogisticsReferences(text: string): DetectedReference[] {
  const refs: DetectedReference[] = [];
  for (const pattern of LOGISTICS_PATTERNS) {
    const matches = text.matchAll(pattern.regex);
    for (const match of matches) {
      refs.push({ type: pattern.type, value: match[0].toUpperCase() });
    }
  }
  return refs;
}

function getReferenceIcon(type: DetectedReference['type']): React.ElementType {
  const mapping: Record<DetectedReference['type'], React.ElementType> = {
    tracking: Package,
    container: Ship,
    flight: Plane,
    parcel: Truck,
    customs: FileText,
  };
  return mapping[type];
}

function getReferenceColor(type: DetectedReference['type']): string {
  const mapping: Record<DetectedReference['type'], string> = {
    tracking: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    container: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    flight: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    parcel: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    customs: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return mapping[type];
}

function detectSuggestedActions(text: string): SuggestedAction[] {
  const actions: SuggestedAction[] = [];
  const lowerText = text.toLowerCase();

  for (const [keywords, pages] of Object.entries(NAVIGATION_KEYWORDS)) {
    const keywordList = keywords.split('|');
    if (keywordList.some((kw) => lowerText.includes(kw))) {
      for (const page of pages) {
        const pageName = PAGE_NAMES[page] || page;
        const iconMap: Record<string, React.ElementType> = {
          shipments: Package, tracking: Package, maritime: Ship, 'air-freight': Plane,
          'ground-transport': Truck, parcels: Package, customs: Shield, warehouse: Warehouse,
          quotations: FileText, clients: Users, billing: Receipt, contracts: FileText,
          rates: Calculator, fleet: Truck, drivers: Users, documents: FileText,
          'route-optimization': Route, 'collector-portal': Backpack, 'customer-portal': Users,
          hr: Users, expenses: Receipt, chat: MessageSquare, analytics: BarChart3,
          reports: FileText, insurance: Shield, incoterms: Calculator,
          'credit-management': Receipt, compliance: Shield, settings: Settings,
        };
        if (!actions.find((a) => a.page === page)) {
          actions.push({
            label: `Voir ${pageName}`,
            icon: iconMap[page] || Package,
            page,
            description: `Naviguer vers ${pageName}`,
          });
        }
      }
    }
  }

  return actions.slice(0, 3); // Max 3 suggestions
}

function loadHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

function loadOpenState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY_OPEN) === 'true';
  } catch {
    return false;
  }
}

function saveOpenState(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_OPEN, String(open));
  } catch {
    // ignore
  }
}

function playBeep(): void {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gain.gain.value = 0.08;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch {
    // silent
  }
}

// ─── Markdown-like renderer (simple) ─────────────────────────────

function renderMessageContent(content: string): React.ReactNode {
  // Split by lines and handle basic markdown
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bold
    let processed = line.replace(/\*\*(.+?)\*\*/g, '⟪B⟫$1⟪/B⟫');
    // Italic
    processed = processed.replace(/\*(.+?)\*/g, '⟪I⟫$1⟪/I⟫');

    // Split by markers and create spans
    const parts = processed.split(/(⟪\/?[BI]⟫)/);
    const elements: React.ReactNode[] = [];
    let currentTag: string | null = null;

    for (const part of parts) {
      if (part === '⟪B⟫') { currentTag = 'bold'; continue; }
      if (part === '⟪/B⟫') { currentTag = null; continue; }
      if (part === '⟪I⟫') { currentTag = 'italic'; continue; }
      if (part === '⟪/I⟫') { currentTag = null; continue; }

      if (currentTag === 'bold') {
        elements.push(<strong key={`b-${i}-${elements.length}`} className="font-semibold">{part}</strong>);
      } else if (currentTag === 'italic') {
        elements.push(<em key={`i-${i}-${elements.length}`}>{part}</em>);
      } else {
        elements.push(part);
      }
    }

    // Bullet points
    if (line.trimStart().startsWith('•') || line.trimStart().startsWith('- ') || line.trimStart().startsWith('* ')) {
      const bulletText = line.replace(/^\s*[•\-*]\s*/, '');
      return <div key={i} className="flex gap-1.5 ml-2"><span className="text-teal-500 flex-shrink-0">•</span><span>{elements}</span></div>;
    }

    // Numbered lists
    const numMatch = line.match(/^(\d+)\.\s/);
    if (numMatch) {
      return <div key={i} className="flex gap-1.5 ml-2"><span className="text-teal-500 font-medium flex-shrink-0">{numMatch[1]}.</span><span>{elements}</span></div>;
    }

    // Empty line
    if (line.trim() === '') {
      return <div key={i} className="h-2" />;
    }

    return <div key={i}>{elements}</div>;
  });
}

// ─── Typing Indicator Component ───────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-teal-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-2">GL Bot réfléchit...</span>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble Component ─────────────────────────────────────

function MessageBubble({
  message,
  onRetry,
  onNavigate,
}: {
  message: ChatMessage;
  onRetry?: (msg: ChatMessage) => void;
  onNavigate?: (page: PageType) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-start gap-2.5 px-4 py-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        style={!isUser ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble content */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
            isUser
              ? 'text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
          }`}
          style={isUser ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : undefined}
        >
          {isUser ? message.content : renderMessageContent(message.content)}
        </div>

        {/* Detected logistics references */}
        {message.detectedReferences && message.detectedReferences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.detectedReferences.map((ref, idx) => {
              const RefIcon = getReferenceIcon(ref.type);
              const colorClass = getReferenceColor(ref.type);
              return (
                <motion.span
                  key={`${ref.value}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono ${colorClass}`}
                >
                  <RefIcon className="w-3 h-3" />
                  {ref.value}
                </motion.span>
              );
            })}
          </div>
        )}

        {/* Suggested actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && onNavigate && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestedActions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <motion.button
                  key={`action-${idx}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  onClick={() => onNavigate(action.page)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium
                    bg-teal-50 text-teal-700 hover:bg-teal-100
                    dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40
                    transition-colors border border-teal-200/50 dark:border-teal-700/30"
                >
                  <ActionIcon className="w-3 h-3" />
                  {action.label}
                  <ArrowUp className="w-2.5 h-2.5 rotate-45" />
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Retry button for error messages */}
        {message.error && onRetry && (
          <button
            onClick={() => onRetry(message)}
            className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-[11px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Réessayer
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Chatbot Widget ──────────────────────────────────────────

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { setPage, user, roleKey, currentPage } = useCargoStore();

  // ─── Initialize state from localStorage ───────────────────────
  useEffect(() => {
    if (hasInitialized) return;
    setHasInitialized(true);

    const savedOpen = loadOpenState();
    setIsOpen(savedOpen);

    const savedHistory = loadHistory();
    if (savedHistory.length > 0) {
      setMessages(savedHistory);
    } else {
      const greeting: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: INITIAL_GREETING,
        timestamp: Date.now(),
        suggestedActions: [
          { label: 'Voir Suivi', icon: Package, page: 'tracking', description: 'Naviguer vers Suivi' },
          { label: 'Voir Expéditions', icon: Ship, page: 'shipments', description: 'Naviguer vers Expéditions' },
          { label: 'Voir Optimisation', icon: Route, page: 'route-optimization', description: 'Naviguer vers Optimisation Tournées' },
        ],
      };
      setMessages([greeting]);
      saveHistory([greeting]);
    }
  }, [hasInitialized]);

  // ─── Persist open state ───────────────────────────────────────
  useEffect(() => {
    if (hasInitialized) {
      saveOpenState(isOpen);
    }
  }, [isOpen, hasInitialized]);

  // ─── Auto-scroll to bottom ────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // ─── Focus input when opening ─────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ─── Handle navigation from chatbot ───────────────────────────
  const handleNavigate = useCallback((page: PageType) => {
    setPage(page);
    // Add a system message about navigation
    const navMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `📍 Navigation vers **${PAGE_NAMES[page] || page}** — Vous y êtes !`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, navMsg]);
    saveHistory([...messages, navMsg]);
  }, [setPage, messages]);

  // ─── Send message to API ──────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Create user message
    const userRefs = detectLogisticsReferences(trimmed);
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      detectedReferences: userRefs.length > 0 ? userRefs : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    // Prepare history for API
    const apiHistory = updatedMessages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: apiHistory,
          userRole: roleKey,
          userName: user?.name || '',
          currentPage: currentPage || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as ChatApiResponse;
      const botRefs = detectLogisticsReferences(data.reply);
      const suggestedActions = detectSuggestedActions(trimmed + ' ' + data.reply);

      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        detectedReferences: botRefs.length > 0 ? botRefs : undefined,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      };

      const newMessages = [...updatedMessages, botMessage];
      setMessages(newMessages);
      saveHistory(newMessages);
      playBeep();
    } catch {
      // Fallback response
      const fallbackText = `Je rencontre un problème technique temporaire. En attendant :\n\n• Utilisez **Ctrl+K** pour rechercher dans l'application\n• Consultez le **Tableau de bord** pour une vue d'ensemble\n• Les numéros de suivi sont au format **FFP-XXXX-XXXX**\n\nRéessayez dans quelques instants ou contactez support@guinee-logistique.pro`;
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: fallbackText,
        timestamp: Date.now(),
        error: true,
        suggestedActions: [
          { label: 'Tableau de bord', icon: BarChart3, page: 'dashboard', description: 'Aller au dashboard' },
          { label: 'Expéditions', icon: Package, page: 'shipments', description: 'Voir les expéditions' },
        ],
      };

      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      saveHistory(newMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, roleKey, user, currentPage]);

  // ─── Retry failed message ─────────────────────────────────────
  const handleRetry = useCallback((failedMsg: ChatMessage) => {
    const idx = messages.findIndex((m) => m.id === failedMsg.id);
    if (idx > 0) {
      const userMsg = messages[idx - 1];
      if (userMsg.role === 'user') {
        const newMessages = messages.slice(0, idx);
        setMessages(newMessages);
        saveHistory(newMessages);
        setTimeout(() => sendMessage(userMsg.content), 50);
      }
    }
  }, [messages, sendMessage]);

  // ─── Clear conversation ───────────────────────────────────────
  const handleClearConversation = useCallback(() => {
    const greeting: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: Date.now(),
      suggestedActions: [
        { label: 'Voir Suivi', icon: Package, page: 'tracking', description: 'Naviguer vers Suivi' },
        { label: 'Voir Expéditions', icon: Ship, page: 'shipments', description: 'Naviguer vers Expéditions' },
        { label: 'Voir Optimisation', icon: Route, page: 'route-optimization', description: 'Optimisation Tournées' },
      ],
    };
    setMessages([greeting]);
    saveHistory([greeting]);
  }, []);

  // ─── Handle quick action ──────────────────────────────────────
  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[number]) => {
    sendMessage(action.message);
  }, [sendMessage]);

  // ─── Handle form submit ───────────────────────────────────────
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  }, [inputValue, sendMessage]);

  // ─── Handle key press ─────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage]);

  // ─── Toggle chat panel ────────────────────────────────────────
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Visible quick actions
  const visibleActions = showAllActions ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 4);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Button ────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            aria-label="Ouvrir le chat GL Bot"
          >
            <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} />
            <span className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} />
            <MessageSquare className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              GL Bot — Assistant IA
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-100" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50
              w-full h-full sm:w-[420px] sm:h-[580px]
              sm:rounded-2xl sm:shadow-2xl
              flex flex-col overflow-hidden
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700"
          >
            {/* ── Header ─────────────────────────────────────────── */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-4 py-3 text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">GL Bot</h3>
                  <p className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Assistant IA Autonome
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearConversation}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Nouvelle conversation"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Status Bar ─────────────────────────────────────── */}
            <div className="flex-shrink-0 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/10 border-b border-teal-100 dark:border-teal-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-teal-600 dark:text-teal-400">
                  <Zap className="w-3 h-3" />
                  <span>IA Autonome — Données en temps réel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {user && (
                    <span className="text-[10px] text-teal-600/70 dark:text-teal-400/70">
                      {user.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Messages Area ──────────────────────────────────── */}
            <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
              <div className="py-4 space-y-1">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onRetry={msg.error ? handleRetry : undefined}
                    onNavigate={handleNavigate}
                  />
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* ── Quick Actions ──────────────────────────────────── */}
            {messages.length <= 2 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex-shrink-0 px-3 pb-2"
              >
                <div className="flex flex-wrap gap-1.5">
                  {visibleActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                          bg-teal-50 text-teal-700 hover:bg-teal-100
                          dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40
                          transition-colors border border-teal-200/50 dark:border-teal-700/30"
                      >
                        <ActionIcon className="w-3 h-3" />
                        {action.label}
                      </button>
                    );
                  })}
                  {!showAllActions && QUICK_ACTIONS.length > 4 && (
                    <button
                      onClick={() => setShowAllActions(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                        text-gray-500 hover:text-teal-600 hover:bg-gray-50
                        dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-gray-800
                        transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      Plus...
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Input Area ─────────────────────────────────────── */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez n'importe quelle question..."
                    disabled={isLoading}
                    className="pr-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                      focus-visible:ring-teal-500/50 focus-visible:border-teal-500
                      text-sm disabled:opacity-50"
                  />
                  {inputValue.trim() && (
                    <span className="absolute right-1 top-1/2 -translate-y-1/2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:shadow-md disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                        aria-label="Envoyer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !inputValue.trim()}
                  className="h-10 w-10 rounded-xl flex-shrink-0 text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                  aria-label="Envoyer"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>

              {/* Footer */}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                GL Bot — IA Autonome Guinée Logistique • Réponses contextuelles en temps réel
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
