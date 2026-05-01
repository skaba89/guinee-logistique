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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// ─── Types ────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  detectedReferences?: LogisticsReference[];
  error?: boolean;
}

interface LogisticsReference {
  type: 'tracking' | 'container' | 'flight' | 'parcel';
  value: string;
}

interface ChatApiResponse {
  reply: string;
}

// ─── Constants ────────────────────────────────────────────────────

const STORAGE_KEY_HISTORY = 'logisway-chatbot-history';
const STORAGE_KEY_OPEN = 'logisway-chatbot-open';
const INITIAL_GREETING = "Bonjour ! 👋 Je suis FlowBot, votre assistant logistique. Comment puis-je vous aider ?";

const QUICK_ACTIONS = [
  { label: 'Suivi d\'expédition', icon: Package, message: 'Je souhaite suivre une expédition' },
  { label: 'Statut des colis', icon: Truck, message: 'Quel est le statut de mes colis ?' },
  { label: 'Tarifs fret', icon: Ship, message: 'Quels sont les tarifs de fret actuels ?' },
  { label: 'Aide', icon: Sparkles, message: 'J\'ai besoin d\'aide' },
] as const;

const LOGISTICS_PATTERNS: Array<{
  type: LogisticsReference['type'];
  regex: RegExp;
  icon: React.ElementType;
}> = [
  { type: 'tracking', regex: /\bFFP-\d{4}-\d{4}\b/gi, icon: Package },
  { type: 'container', regex: /\bMSKU-\d{7}\b/gi, icon: Ship },
  { type: 'flight', regex: /\b[A-Z]{2}\d{3,4}\b/g, icon: Plane },
  { type: 'parcel', regex: /\bPRC-\d{6}\b/gi, icon: Truck },
];

const FALLBACK_RESPONSES = [
  "Je rencontre un problème technique, mais voici quelques conseils utiles :\n\n• Vérifiez vos numéros de suivi au format FFP-XXXX-XXXX\n• Pour les conteneurs, utilisez le format MSKU-XXXXXXX\n• Consultez le tableau de bord pour une vue d'ensemble de vos expéditions\n• Contactez notre support à support@logisway.pro",
  "Désolé, je suis temporairement indisponible. En attendant :\n\n• Vos expéditions en cours sont visibles dans la section 'Expéditions'\n• Les tarifs de fret sont mis à jour dans 'Gestion des Tarifs'\n• Pour les douanes, consultez la section dédiée\n• Notre équipe est disponible au +33 1 23 45 67 89",
  "Une erreur s'est produite. Voici ce que vous pouvez faire :\n\n• Réessayez dans quelques instants\n• Utilisez la recherche (Ctrl+K) pour trouver vos expéditions\n• Consultez les notifications pour les mises à jour\n• Les documents sont accessibles dans la section 'Documents'",
];

// ─── Utility Functions ────────────────────────────────────────────

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function detectLogisticsReferences(text: string): LogisticsReference[] {
  const refs: LogisticsReference[] = [];
  for (const pattern of LOGISTICS_PATTERNS) {
    const matches = text.matchAll(pattern.regex);
    for (const match of matches) {
      refs.push({ type: pattern.type, value: match[0].toUpperCase() });
    }
  }
  return refs;
}

function getReferenceIcon(type: LogisticsReference['type']): React.ElementType {
  const mapping: Record<LogisticsReference['type'], React.ElementType> = {
    tracking: Package,
    container: Ship,
    flight: Plane,
    parcel: Truck,
  };
  return mapping[type];
}

function getReferenceColor(type: LogisticsReference['type']): string {
  const mapping: Record<LogisticsReference['type'], string> = {
    tracking: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    container: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    flight: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    parcel: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  return mapping[type];
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
    // ignore parse errors
  }
  return [];
}

function saveHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep only the last 100 messages to avoid storage overflow
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(toSave));
  } catch {
    // ignore storage errors
  }
}

function loadOpenState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_OPEN);
    return stored === 'true';
  } catch {
    return false;
  }
}

function saveOpenState(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_OPEN, String(open));
  } catch {
    // ignore storage errors
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
    // Audio not supported — silent fallback
  }
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
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble Component ─────────────────────────────────────

function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry?: (msg: ChatMessage) => void }) {
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
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gray-200 dark:bg-gray-700'
            : ''
        }`}
        style={!isUser ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble content */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
          }`}
          style={isUser ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : undefined}
        >
          {message.content}
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Add initial greeting
      const greeting: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: INITIAL_GREETING,
        timestamp: Date.now(),
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

    // Prepare history for API (exclude detected references and error flags)
    const apiHistory = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: apiHistory }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as ChatApiResponse;
      const botRefs = detectLogisticsReferences(data.reply);
      const botMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        detectedReferences: botRefs.length > 0 ? botRefs : undefined,
      };

      const newMessages = [...updatedMessages, botMessage];
      setMessages(newMessages);
      saveHistory(newMessages);
      playBeep();
    } catch (err) {
      // Fallback response with logistics tips
      const fallbackText = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: fallbackText,
        timestamp: Date.now(),
        error: true,
      };

      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      saveHistory(newMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  // ─── Retry failed message ─────────────────────────────────────
  const handleRetry = useCallback((failedMsg: ChatMessage) => {
    // Find the user message right before this failed bot message
    const idx = messages.findIndex((m) => m.id === failedMsg.id);
    if (idx > 0) {
      const userMsg = messages[idx - 1];
      if (userMsg.role === 'user') {
        // Remove the error message and resend
        const newMessages = messages.slice(0, idx);
        setMessages(newMessages);
        saveHistory(newMessages);
        // Small delay so state updates first
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
    };
    setMessages([greeting]);
    saveHistory([greeting]);
  }, []);

  // ─── Handle quick action ──────────────────────────────────────
  const handleQuickAction = useCallback((message: string) => {
    sendMessage(message);
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
            aria-label="Ouvrir le chat FlowBot"
          >
            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} />
            <span className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} />

            <MessageSquare className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              FlowBot
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
              w-full h-full sm:w-[400px] sm:h-[550px]
              sm:rounded-2xl sm:shadow-2xl
              flex flex-col overflow-hidden
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700 sm:border-gray-200 dark:sm:border-gray-700"
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
                  <h3 className="text-sm font-bold leading-tight">FlowBot</h3>
                  <p className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Assistant IA LogisWay
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear conversation */}
                <button
                  onClick={handleClearConversation}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Effacer la conversation"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Close button */}
                <button
                  onClick={toggleChat}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Fermer le chat"
                >
                  <X className="w-4 h-4" />
                </button>
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
                  {QUICK_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.message)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                          bg-teal-50 text-teal-700 hover:bg-teal-100
                          dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40
                          transition-colors border border-teal-200/50 dark:border-teal-700/30"
                      >
                        <ActionIcon className="w-3.5 h-3.5" />
                        {action.label}
                      </button>
                    );
                  })}
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
                    placeholder="Écrivez votre message..."
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
                  aria-label="Envoyer le message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>

              {/* Footer hint */}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                FlowBot peut faire des erreurs. Vérifiez les informations importantes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
