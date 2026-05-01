/**
 * messaging-page.tsx — Page de messagerie interne pour LogisWay
 *
 * BRANCHEMENT : Ajoutez un nouveau PageType 'messaging' dans le routeur
 * et importez ce composant dans le switch de page.tsx.
 * Voir feature-bridge.ts pour les instructions.
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  loadMessages,
  loadConversations,
  saveMessages,
  saveConversations,
  sendMessage,
  getConversationsForUser,
  getMessagesForConversation,
  markMessageRead,
  markConversationRead,
  getUnreadMessageCount,
  deleteConversation,
  seedMessages,
  type Message,
  type Conversation,
} from '@/lib/messaging-system';
import { users } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

// ─── Composant principal ────────────────────────────────────────

export default function MessagingPage() {
  const user = useCargoStore(s => s.user);
  const userId = user?.id || '1';
  const userName = user?.name || 'Utilisateur';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Charger les données initiales
  useEffect(() => {
    seedMessages();
    refreshConversations();
  }, []);

  const refreshConversations = useCallback(() => {
    const convs = getConversationsForUser(userId);
    setConversations(convs);
  }, [userId]);

  // Charger les messages d'une conversation
  useEffect(() => {
    if (selectedConvId) {
      const msgs = getMessagesForConversation(selectedConvId);
      setMessages(msgs);
      markConversationRead(selectedConvId, userId);
      refreshConversations();
    }
  }, [selectedConvId, userId, refreshConversations]);

  // Filtrer les conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.subject.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      c.participantNames.some(n => n.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Nombre total de non-lus
  const totalUnread = useMemo(() =>
    conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  // Envoyer un message
  const handleSend = () => {
    if (!newMessage.trim() || !selectedConvId) return;

    const conv = conversations.find(c => c.id === selectedConvId);
    if (!conv) return;

    // Trouver le destinataire
    const otherIndex = conv.participantIds.indexOf(userId) === 0 ? 1 : 0;
    const recipientId = conv.participantIds[otherIndex];
    const recipientName = conv.participantNames[otherIndex];

    sendMessage({
      senderId: userId,
      senderName: userName,
      recipientId,
      recipientName,
      subject: conv.subject,
      body: newMessage.trim(),
    });

    setNewMessage('');
    // Rafraîchir les messages
    const msgs = getMessagesForConversation(selectedConvId);
    setMessages(msgs);
    refreshConversations();
  };

  // Nouvelle conversation
  const handleCompose = () => {
    if (!composeRecipient || !composeBody.trim()) return;

    const recipient = users.find(u => u.id === composeRecipient);
    if (!recipient) return;

    sendMessage({
      senderId: userId,
      senderName: userName,
      recipientId: recipient.id,
      recipientName: recipient.name,
      subject: composeSubject || '(Sans objet)',
      body: composeBody.trim(),
      priority: 'normal',
    });

    setComposeOpen(false);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
    refreshConversations();
  };

  // Supprimer une conversation
  const handleDelete = (convId: string) => {
    deleteConversation(convId);
    if (selectedConvId === convId) {
      setSelectedConvId(null);
      setMessages([]);
    }
    refreshConversations();
  };

  // Initiales pour l'avatar
  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Couleur avatar par ID
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
      'bg-amber-500', 'bg-green-500', 'bg-red-500', 'bg-cyan-500',
    ];
    return colors[parseInt(id) % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-500" />
            Messagerie
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalUnread > 0 ? `${totalUnread} message(s) non lu(s)` : 'Tous les messages sont lus'}
          </p>
        </div>
        <Button
          size="sm"
          className="text-white"
          style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
          onClick={() => setComposeOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Nouveau message
        </Button>
      </div>

      {/* Corps de la messagerie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Liste des conversations */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="p-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                Aucune conversation
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === selectedConvId;
                const otherIndex = conv.participantIds.indexOf(userId) === 0 ? 1 : 0;
                const otherName = conv.participantNames[otherIndex] || 'Inconnu';
                const otherId = conv.participantIds[otherIndex] || '0';

                return (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-teal-50 dark:bg-teal-900/10 border-l-2 border-l-teal-500' : ''}`}
                    onClick={() => setSelectedConvId(conv.id)}
                  >
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className={`${getAvatarColor(otherId)} text-white text-xs`}>
                        {getInitials(otherName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{otherName}</p>
                        <span className="text-[9px] text-gray-400 flex-shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.subject}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="text-[9px] h-4 px-1 bg-teal-500 text-white flex-shrink-0">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Zone de messages */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConvId ? (
            <>
              {/* En-tête conversation */}
              <CardHeader className="p-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const conv = conversations.find(c => c.id === selectedConvId);
                      if (!conv) return null;
                      const otherIndex = conv.participantIds.indexOf(userId) === 0 ? 1 : 0;
                      const otherName = conv.participantNames[otherIndex] || 'Inconnu';
                      const otherId = conv.participantIds[otherIndex] || '0';
                      return (
                        <>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`${getAvatarColor(otherId)} text-white text-xs`}>
                              {getInitials(otherName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{otherName}</p>
                            <p className="text-[10px] text-gray-400">{conv.subject}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(selectedConvId)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-3 flex-1 overflow-y-auto space-y-3">
                {messages.map(msg => {
                  const isMine = msg.senderId === userId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-lg p-2.5 ${
                        isMine
                          ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        <p className="text-xs leading-relaxed">{msg.body}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                          <span className={`text-[9px] ${isMine ? 'text-teal-100' : 'text-gray-400'}`}>
                            {new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            msg.read
                              ? <CheckCheck className="w-3 h-3 text-teal-100" />
                              : <Check className="w-3 h-3 text-teal-100" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>

              {/* Zone de saisie */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    className="text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-sm text-gray-400">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Dialogue nouvelle conversation */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Destinataire</label>
              <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                <SelectTrigger className="h-9 text-sm mt-1">
                  <SelectValue placeholder="Choisir un destinataire" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.id !== userId).map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Objet</label>
              <Input
                placeholder="Objet du message"
                value={composeSubject}
                onChange={e => setComposeSubject(e.target.value)}
                className="h-9 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Message</label>
              <textarea
                placeholder="Votre message..."
                value={composeBody}
                onChange={e => setComposeBody(e.target.value)}
                className="w-full h-24 mt-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>Annuler</Button>
            <Button
              size="sm"
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
              onClick={handleCompose}
              disabled={!composeRecipient || !composeBody.trim()}
            >
              <Send className="w-4 h-4 mr-1" /> Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


