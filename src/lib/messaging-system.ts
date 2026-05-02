/**
 * messaging-system.ts — Système de messagerie interne pour Guinée Logistique
 *
 * BRANCHEMENT : Ce système étend le module de notifications existant
 * sans le modifier. Il utilise le même pattern localStorage.
 *
 * Pour brancher :
 *   import { sendMessage, getConversations, ... } from '@/lib/messaging-system';
 */

import type { User } from './test-data';

// ─── Types ──────────────────────────────────────────────────────

export interface Message {
  id: string;
  /** ID de la conversation */
  conversationId: string;
  /** Expéditeur */
  senderId: string;
  senderName: string;
  /** Destinataire (userId ou 'all') */
  recipientId: string;
  recipientName: string;
  /** Objet du message */
  subject: string;
  /** Contenu du message */
  body: string;
  /** Horodatage */
  sentAt: string;
  /** Lu par le destinataire */
  read: boolean;
  /** Pièce jointe (URL optionnelle) */
  attachmentUrl?: string;
  /** Priorité */
  priority: 'normal' | 'urgent' | 'high';
}

export interface Conversation {
  id: string;
  /** Participants */
  participantIds: string[];
  participantNames: string[];
  /** Dernier message */
  lastMessage: string;
  lastMessageAt: string;
  /** Nombre de messages non lus */
  unreadCount: number;
  /** Objet de la conversation */
  subject: string;
}

// ─── Persistance ────────────────────────────────────────────────

const MESSAGES_KEY = 'guinee-logistique-messages';
const CONVERSATIONS_KEY = 'guinee-logistique-conversations';

export function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  // Garder les 500 derniers messages
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-500)));
}

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

// ─── Fonctions ──────────────────────────────────────────────────

/**
 * Envoyer un message
 */
export function sendMessage(params: {
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  priority?: Message['priority'];
}): Message {
  const { senderId, senderName, recipientId, recipientName, subject, body, priority = 'normal' } = params;

  // Trouver ou créer la conversation
  const conversations = loadConversations();
  let conversation = conversations.find(c =>
    c.participantIds.includes(senderId) &&
    c.participantIds.includes(recipientId) &&
    c.participantIds.length === 2
  );

  if (!conversation) {
    conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      participantIds: [senderId, recipientId],
      participantNames: [senderName, recipientName],
      lastMessage: body.substring(0, 60),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 1,
      subject,
    };
    conversations.push(conversation);
  } else {
    conversation.lastMessage = body.substring(0, 60);
    conversation.lastMessageAt = new Date().toISOString();
    conversation.unreadCount += 1;
  }
  saveConversations(conversations);

  // Créer le message
  const message: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    conversationId: conversation.id,
    senderId,
    senderName,
    recipientId,
    recipientName,
    subject,
    body,
    sentAt: new Date().toISOString(),
    read: false,
    priority,
  };

  const messages = loadMessages();
  messages.push(message);
  saveMessages(messages);

  return message;
}

/**
 * Récupérer les conversations d'un utilisateur
 */
export function getConversationsForUser(userId: string): Conversation[] {
  return loadConversations()
    .filter(c => c.participantIds.includes(userId))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

/**
 * Récupérer les messages d'une conversation
 */
export function getMessagesForConversation(conversationId: string): Message[] {
  return loadMessages()
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

/**
 * Marquer un message comme lu
 */
export function markMessageRead(messageId: string): void {
  const messages = loadMessages();
  const msg = messages.find(m => m.id === messageId);
  if (msg) {
    msg.read = true;
    saveMessages(messages);

    // Mettre à jour le compteur non lu de la conversation
    const conversations = loadConversations();
    const conv = conversations.find(c => c.id === msg.conversationId);
    if (conv && conv.unreadCount > 0) {
      conv.unreadCount = messages.filter(
        m => m.conversationId === conv.id && !m.read
      ).length;
      saveConversations(conversations);
    }
  }
}

/**
 * Marquer tous les messages d'une conversation comme lus
 */
export function markConversationRead(conversationId: string, userId: string): void {
  const messages = loadMessages();
  messages.forEach(m => {
    if (m.conversationId === conversationId && m.recipientId === userId && !m.read) {
      m.read = true;
    }
  });
  saveMessages(messages);

  const conversations = loadConversations();
  const conv = conversations.find(c => c.id === conversationId);
  if (conv) {
    conv.unreadCount = 0;
    saveConversations(conversations);
  }
}

/**
 * Compter les messages non lus pour un utilisateur
 */
export function getUnreadMessageCount(userId: string): number {
  return loadMessages().filter(m => m.recipientId === userId && !m.read).length;
}

/**
 * Supprimer une conversation
 */
export function deleteConversation(conversationId: string): void {
  const conversations = loadConversations().filter(c => c.id !== conversationId);
  saveConversations(conversations);

  const messages = loadMessages().filter(m => m.conversationId !== conversationId);
  saveMessages(messages);
}

// ─── Données de test ────────────────────────────────────────────

export function seedMessages(): void {
  const existing = loadMessages();
  if (existing.length > 0) return;

  // Conversation Admin ↔ Agent
  const conv1Id = 'conv-seed-1';
  const conv1Messages: Omit<Message, 'id'>[] = [
    {
      conversationId: conv1Id,
      senderId: '1',
      senderName: 'Ahmed Benali',
      recipientId: '2',
      recipientName: 'Fatima Khelifi',
      subject: 'Expédition FFP-0005-2026',
      body: 'Bonjour Fatima, l\'expédition FFP-0005-2026 est retardée. Peux-tu contacter le client SPA HydroServices pour les informer ?',
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: true,
      priority: 'high',
    },
    {
      conversationId: conv1Id,
      senderId: '2',
      senderName: 'Fatima Khelifi',
      recipientId: '1',
      recipientName: 'Ahmed Benali',
      subject: 'Expédition FFP-0005-2026',
      body: 'C\'est noté Ahmed. Je les appelle immédiatement. Le retard est dû aux conditions météo sur la route Rotterdam-Milan.',
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      priority: 'normal',
    },
  ];

  // Conversation Admin ↔ Client
  const conv2Id = 'conv-seed-2';
  const conv2Messages: Omit<Message, 'id'>[] = [
    {
      conversationId: conv2Id,
      senderId: '3',
      senderName: 'Karim Bouzidi',
      recipientId: '1',
      recipientName: 'Ahmed Benali',
      subject: 'Demande de devis - Envoi Marseille',
      body: 'Bonjour, je souhaite un devis pour un envoi de 500kg Alger → Marseille en maritime. Pouvez-vous me faire une offre ?',
      sentAt: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      priority: 'normal',
    },
  ];

  const allMessages = [...conv1Messages, ...conv2Messages].map((m, i) => ({
    ...m,
    id: `msg-seed-${i + 1}`,
  }));
  saveMessages(allMessages);

  const conversations: Conversation[] = [
    {
      id: conv1Id,
      participantIds: ['1', '2'],
      participantNames: ['Ahmed Benali', 'Fatima Khelifi'],
      lastMessage: conv1Messages[1].body.substring(0, 60),
      lastMessageAt: conv1Messages[1].sentAt,
      unreadCount: 1,
      subject: 'Expédition FFP-0005-2026',
    },
    {
      id: conv2Id,
      participantIds: ['1', '3'],
      participantNames: ['Ahmed Benali', 'Karim Bouzidi'],
      lastMessage: conv2Messages[0].body.substring(0, 60),
      lastMessageAt: conv2Messages[0].sentAt,
      unreadCount: 1,
      subject: 'Demande de devis - Envoi Marseille',
    },
  ];
  saveConversations(conversations);
}
