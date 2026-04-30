'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Hash,
  AtSign,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Ship,
  Plane,
  Truck,
  FileText,
  Link2,
  ChevronDown,
  Smile,
  Pin,
  Users,
  Circle,
  Package,
  ExternalLink,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ── Types ───────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachment?: {
    type: 'shipment' | 'tracking' | 'document' | 'link';
    label: string;
    reference: string;
  };
}

interface Channel {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  unread: number;
  lastMessage: string;
  lastMessageTime: string;
  members: number;
}

interface DirectMessage {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRole: string;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastMessageTime: string;
}

type Conversation = Channel | DirectMessage;
type ConversationType = 'channel' | 'dm';

// ── Mock Data ───────────────────────────────────────────────────────

const channels: Channel[] = [
  {
    id: 'ch-general',
    name: 'Général',
    icon: Hash,
    description: 'Canal général de l\'équipe',
    unread: 3,
    lastMessage: 'Réunion demain à 9h pour le point hebdo',
    lastMessageTime: '10:32',
    members: 24,
  },
  {
    id: 'ch-expeditions',
    name: 'Expéditions',
    icon: Ship,
    description: 'Suivi des expéditions en cours',
    unread: 7,
    lastMessage: 'FFP-0015 arrive demain à Marseille',
    lastMessageTime: '09:45',
    members: 18,
  },
  {
    id: 'ch-douanes',
    name: 'Douanes',
    icon: FileText,
    description: 'Questions et mises à jour douanières',
    unread: 2,
    lastMessage: 'DD-2026-0008 en attente de documents',
    lastMessageTime: '08:15',
    members: 12,
  },
  {
    id: 'ch-facturation',
    name: 'Facturation',
    icon: FileText,
    description: 'Suivi des factures et paiements',
    unread: 0,
    lastMessage: 'FAC-2026-0012 réglée par virement',
    lastMessageTime: 'Hier',
    members: 8,
  },
  {
    id: 'ch-urgences',
    name: 'Urgences',
    icon: AlertTriangle,
    description: 'Alertes et situations urgentes',
    unread: 1,
    lastMessage: '⚠️ Vol EK-757 retardé — clients à prévenir',
    lastMessageTime: '07:50',
    members: 15,
  },
];

const directMessages: DirectMessage[] = [
  {
    id: 'dm-karim',
    partnerId: 'u-karim',
    partnerName: 'Karim Benali',
    partnerAvatar: 'KB',
    partnerRole: 'Chef d\'équipe Maritime',
    online: true,
    unread: 2,
    lastMessage: 'Le conteneur CSLU-8912345 est bien arrivé',
    lastMessageTime: '11:05',
  },
  {
    id: 'dm-sara',
    partnerId: 'u-sara',
    partnerName: 'Sara Medjadi',
    partnerAvatar: 'SM',
    partnerRole: 'Agent Douanes',
    online: true,
    unread: 0,
    lastMessage: 'Dossier DD-2026-0003 dédouané ✅',
    lastMessageTime: '10:20',
  },
  {
    id: 'dm-youssef',
    partnerId: 'u-youssef',
    partnerName: 'Youssef Khelil',
    partnerAvatar: 'YK',
    partnerRole: 'Responsable Aérien',
    online: false,
    unread: 1,
    lastMessage: 'Peux-tu vérifier le LTA du vol TK-655 ?',
    lastMessageTime: '09:30',
  },
  {
    id: 'dm-amina',
    partnerId: 'u-amina',
    partnerName: 'Amina Cherif',
    partnerAvatar: 'AC',
    partnerRole: 'Partenaire — Globex Shipping',
    online: false,
    unread: 0,
    lastMessage: 'Offre de fret pour Istanbul→Alger envoyée',
    lastMessageTime: 'Hier',
  },
];

const allMessages: ChatMessage[] = [
  // Général channel
  { id: 'm1', conversationId: 'ch-general', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Bonjour à tous ! N\'oubliez pas la réunion de demain matin.', timestamp: '09:00', read: true },
  { id: 'm2', conversationId: 'ch-general', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Bien noté Karim. Je prépare les dossiers douanes en attente.', timestamp: '09:05', read: true },
  { id: 'm3', conversationId: 'ch-general', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Est-ce qu\'on discute aussi du retard du vol Emirates ?', timestamp: '09:12', read: true },
  { id: 'm4', conversationId: 'ch-general', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Oui, je l\'ai ajouté à l\'ordre du jour. Il faut qu\'on voie les alternatives pour les clients impactés.', timestamp: '09:15', read: true },
  { id: 'm5', conversationId: 'ch-general', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Parfait. J\'ai aussi une mise à jour sur la déclaration DD-2026-0003.', timestamp: '09:22', read: true },
  { id: 'm6', conversationId: 'ch-general', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Merci pour les infos. Je vais préparer le rapport hebdomadaire avant la réunion.', timestamp: '09:30', read: true },
  { id: 'm7', conversationId: 'ch-general', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Réunion demain à 9h pour le point hebdo', timestamp: '10:32', read: false },
  { id: 'm8', conversationId: 'ch-general', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'J\'envoie le compte-rendu de la semaine dernière en pièce jointe.', timestamp: '10:45', read: false, attachment: { type: 'document', label: 'CR-Semaine-11.pdf', reference: 'DOC-2026-0045' } },
  { id: 'm9', conversationId: 'ch-general', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Super, merci Karim ! 👍', timestamp: '10:50', read: false },

  // Expéditions channel
  { id: 'm10', conversationId: 'ch-expeditions', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'FFP-0015 est en route vers Marseille. ETA demain 6h du matin.', timestamp: '08:00', read: true },
  { id: 'm11', conversationId: 'ch-expeditions', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Le client a été notifié ? Il faut confirmer la livraison.', timestamp: '08:15', read: true },
  { id: 'm12', conversationId: 'ch-expeditions', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Oui, confirmation envoyée par email et SMS.', timestamp: '08:20', read: true, attachment: { type: 'shipment', label: 'FFP-0015-2026', reference: 'FFP-0015-2026' } },
  { id: 'm13', conversationId: 'ch-expeditions', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Nouveau conteneur chargé à Shenzhen : MSKU-7234561. Destination Alger via Singapour.', timestamp: '08:45', read: true, attachment: { type: 'shipment', label: 'FFP-0008-2026', reference: 'FFP-0008-2026' } },
  { id: 'm14', conversationId: 'ch-expeditions', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Attention, le dossier douanier pour ce conteneur n\'est pas complet. Il manque la facture commerciale.', timestamp: '09:00', read: true },
  { id: 'm15', conversationId: 'ch-expeditions', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Je relance le client pour le document manquant.', timestamp: '09:10', read: true },
  { id: 'm16', conversationId: 'ch-expeditions', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Le vol LH-1170 de Francfort est confirmé pour jeudi. Capacité disponible : 12 tonnes.', timestamp: '09:25', read: true, attachment: { type: 'tracking', label: 'Suivre LH-1170', reference: 'LH-1170' } },
  { id: 'm17', conversationId: 'ch-expeditions', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'FFP-0015 arrive demain à Marseille', timestamp: '09:45', read: false },
  { id: 'm18', conversationId: 'ch-expeditions', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Les documents d\'import sont prêts pour FFP-0015. Je les transmets à l\'agent à Marseille.', timestamp: '10:00', read: false },
  { id: 'm19', conversationId: 'ch-expeditions', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'On a aussi FFP-0020 qui part mercredi vers Istanbul. Quelqu\'un peut vérifier la réservation ?', timestamp: '10:15', read: false },
  { id: 'm20', conversationId: 'ch-expeditions', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Je m\'en occupe. La réservation TK-655 est confirmée.', timestamp: '10:20', read: false, attachment: { type: 'tracking', label: 'Suivre FFP-0020', reference: 'FFP-0020-2026' } },
  { id: 'm21', conversationId: 'ch-expeditions', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Parfait. Le client a demandé une assurance cargo supplémentaire pour cette expédition.', timestamp: '10:30', read: false },
  { id: 'm22', conversationId: 'ch-expeditions', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Je vais vérifier les options d\'assurance avec notre partenaire.', timestamp: '10:35', read: false },
  { id: 'm23', conversationId: 'ch-expeditions', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'N\'oubliez pas qu\'on a aussi 3 colis DHL qui arrivent cet après-midi.', timestamp: '10:40', read: false },

  // Douanes channel
  { id: 'm24', conversationId: 'ch-douanes', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Bonne nouvelle : DD-2026-0003 a été dédouanée avec succès ! 🎉', timestamp: '07:30', read: true },
  { id: 'm25', conversationId: 'ch-douanes', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Excellent ! Le client va être content. On peut organiser l\'enlèvement.', timestamp: '07:45', read: true },
  { id: 'm26', conversationId: 'ch-douanes', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Je planifie l\'enlèvement pour demain matin avec notre transporteur partenaire.', timestamp: '08:00', read: true },
  { id: 'm27', conversationId: 'ch-douanes', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'DD-2026-0008 en attente de documents', timestamp: '08:15', read: false, attachment: { type: 'document', label: 'Liste documents manquants', reference: 'DD-2026-0008' } },
  { id: 'm28', conversationId: 'ch-douanes', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Il faut aussi le certificat d\'origine pour la déclaration DD-2026-0010.', timestamp: '09:00', read: false },

  // Facturation channel
  { id: 'm29', conversationId: 'ch-facturation', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'FAC-2026-0012 réglée par virement', timestamp: '14:00', read: true },
  { id: 'm30', conversationId: 'ch-facturation', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Le paiement de 280 000 DA a bien été reçu. Je mets à jour le statut.', timestamp: '14:15', read: true },
  { id: 'm31', conversationId: 'ch-facturation', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Il reste 3 factures en retard de paiement. Je relance les clients demain.', timestamp: '14:30', read: true },

  // Urgences channel
  { id: 'm32', conversationId: 'ch-urgences', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: '⚠️ Alerte : Vol EK-757 Emirates retardé de 2h. 4 clients impactés.', timestamp: '07:30', read: true },
  { id: 'm33', conversationId: 'ch-urgences', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Je contacte les clients immédiatement pour les informer.', timestamp: '07:35', read: true },
  { id: 'm34', conversationId: 'ch-urgences', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'On doit proposer un réacheminement via Turkish Airlines si le retard s\'allonge.', timestamp: '07:40', read: true },
  { id: 'm35', conversationId: 'ch-urgences', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Les documents de transit sont déjà préparés au cas où.', timestamp: '07:45', read: true },
  { id: 'm36', conversationId: 'ch-urgences', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: '⚠️ Vol EK-757 retardé — clients à prévenir', timestamp: '07:50', read: false },

  // DM with Karim
  { id: 'm37', conversationId: 'dm-karim', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Salut ! Tu as des nouvelles du conteneur CSLU-8912345 ?', timestamp: '10:00', read: true },
  { id: 'm38', conversationId: 'dm-karim', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Oui, il est arrivé au port d\'Alger ce matin. Les formalités sont en cours.', timestamp: '10:15', read: true },
  { id: 'm39', conversationId: 'dm-karim', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Super ! Le client SPA HydroServices attend depuis 2 semaines.', timestamp: '10:30', read: true },
  { id: 'm40', conversationId: 'dm-karim', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Je vais accélérer le dédouanement. Peux-tu confirmer que tous les documents sont complets ?', timestamp: '10:45', read: true },
  { id: 'm41', conversationId: 'dm-karim', senderId: 'u-karim', senderName: 'Karim Benali', senderAvatar: 'KB', content: 'Le conteneur CSLU-8912345 est bien arrivé', timestamp: '11:05', read: false, attachment: { type: 'shipment', label: 'CSLU-8912345', reference: 'CSLU-8912345' } },

  // DM with Sara
  { id: 'm42', conversationId: 'dm-sara', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Bonjour ! La déclaration DD-2026-0003 est officiellement dédouanée. 🎉', timestamp: '09:00', read: true },
  { id: 'm43', conversationId: 'dm-sara', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Génial Sara ! Merci pour ton efficacité. On organise l\'enlèvement ?', timestamp: '09:15', read: true },
  { id: 'm44', conversationId: 'dm-sara', senderId: 'u-sara', senderName: 'Sara Medjadi', senderAvatar: 'SM', content: 'Dossier DD-2026-0003 dédouané ✅', timestamp: '10:20', read: true },

  // DM with Youssef
  { id: 'm45', conversationId: 'dm-youssef', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Hey, tu as le LTA du vol TK-655 Istanbul-Alger ?', timestamp: '09:00', read: true },
  { id: 'm46', conversationId: 'dm-youssef', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Je regarde... Oui, le numéro AWB est 235-12345678. Je t\'envoie la copie.', timestamp: '09:15', read: true },
  { id: 'm47', conversationId: 'dm-youssef', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Voici la copie du LTA :', timestamp: '09:16', read: true, attachment: { type: 'document', label: 'LTA-TK655.pdf', reference: 'AWB-235-12345678' } },
  { id: 'm48', conversationId: 'dm-youssef', senderId: 'u-youssef', senderName: 'Youssef Khelil', senderAvatar: 'YK', content: 'Peux-tu vérifier le LTA du vol TK-655 ?', timestamp: '09:30', read: false },

  // DM with Amina
  { id: 'm49', conversationId: 'dm-amina', senderId: 'u-amina', senderName: 'Amina Cherif', senderAvatar: 'AC', content: 'Bonjour ! Je vous envoie notre nouvelle offre de fret pour la ligne Istanbul-Alger.', timestamp: '15:00', read: true },
  { id: 'm50', conversationId: 'dm-amina', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'Merci Amina ! Quel est le tarif pour un conteneur 40\' HC ?', timestamp: '15:30', read: true },
  { id: 'm51', conversationId: 'dm-amina', senderName: 'Amina Cherif', senderId: 'u-amina', senderAvatar: 'AC', content: '2 800 USD pour un 40\' HC, transit time 8 jours. C\'est notre meilleur tarif.', timestamp: '16:00', read: true },
  { id: 'm52', conversationId: 'dm-amina', senderId: 'me', senderName: 'Vous', senderAvatar: 'AB', content: 'C\'est intéressant. Je vais en discuter avec l\'équipe et je vous reviens.', timestamp: '16:15', read: true },
  { id: 'm53', conversationId: 'dm-amina', senderId: 'u-amina', senderName: 'Amina Cherif', senderAvatar: 'AC', content: 'Offre de fret pour Istanbul→Alger envoyée', timestamp: '16:30', read: true, attachment: { type: 'link', label: 'Offre Fret IST-ALG', reference: 'QUOT-2026-0089' } },
];

// ── Component ───────────────────────────────────────────────────────

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = useState<string>('ch-general');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(allMessages);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'phone' | 'video' | null>(null);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current conversation messages
  const currentMessages = messages.filter((m) => {
    if (m.conversationId !== activeConversation) return false;
    if (showChatSearch && chatSearchQuery && !m.content.toLowerCase().includes(chatSearchQuery.toLowerCase())) return false;
    return true;
  });

  // Determine if active conversation is channel or DM
  const activeChannel = channels.find((c) => c.id === activeConversation);
  const activeDM = directMessages.find((d) => d.id === activeConversation);
  const isChannel = !!activeChannel;
  const isDM = !!activeDM;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeConversation]);

  // Handle sending a message
  const handleSend = () => {
    if (!messageInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation,
      senderId: 'me',
      senderName: 'Vous',
      senderAvatar: 'AB',
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action: attach shipment reference
  const handleAttachShipment = () => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation,
      senderId: 'me',
      senderName: 'Vous',
      senderAvatar: 'AB',
      content: 'Référence expédition jointe :',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      attachment: { type: 'shipment', label: 'FFP-0015-2026', reference: 'FFP-0015-2026' },
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowQuickActions(false);
  };

  // Quick action: share tracking link
  const handleShareTracking = () => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation,
      senderId: 'me',
      senderName: 'Vous',
      senderAvatar: 'AB',
      content: 'Lien de suivi partagé :',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      attachment: { type: 'tracking', label: 'Suivre FFP-0015-2026', reference: 'FFP-0015-2026' },
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowQuickActions(false);
  };

  // Quick action: escalate to ticket
  const handleEscalate = () => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation,
      senderId: 'me',
      senderName: 'Vous',
      senderAvatar: 'AB',
      content: `🎟️ Ticket d'escalade créé : ${escalateReason || 'Problème nécessitant une attention urgente'}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      attachment: { type: 'document', label: `Ticket-${Date.now().toString().slice(-6)}`, reference: `TKT-${Date.now().toString().slice(-6)}` },
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowEscalateDialog(false);
    setEscalateReason('');
    setShowQuickActions(false);
  };

  // Filter conversations based on search
  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDMs = directMessages.filter(
    (d) =>
      d.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get conversation title
  const getConversationTitle = () => {
    if (activeChannel) return activeChannel.name;
    if (activeDM) return activeDM.partnerName;
    return '';
  };

  // Get total unread
  const totalUnread = channels.reduce((sum, c) => sum + c.unread, 0) + directMessages.reduce((sum, d) => sum + d.unread, 0);

  // Attachment badge colors
  const attachmentColors: Record<string, string> = {
    shipment: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    tracking: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    document: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    link: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  };

  const attachmentIcons: Record<string, React.ElementType> = {
    shipment: Package,
    tracking: Link2,
    document: FileText,
    link: ExternalLink,
  };

  // ── Sidebar ─────────────────────────────────────────────────────

  const sidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
          </div>
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] justify-center">
              {totalUnread}
            </Badge>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Channels section */}
        <div className="px-2 pt-3">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Canaux
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="space-y-0.5">
            {filteredChannels.map((channel) => {
              const isActive = activeConversation === channel.id;
              const Icon = channel.icon;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveConversation(channel.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${isActive ? 'text-teal-700 dark:text-teal-300' : ''}`}>
                        {channel.name}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{channel.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {channel.lastMessage}
                    </p>
                  </div>
                  {channel.unread > 0 && (
                    <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 min-w-[18px] justify-center flex-shrink-0">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Direct Messages section */}
        <div className="px-2 pb-3">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Messages directs
            </span>
            <button className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Plus className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <div className="space-y-0.5">
            {filteredDMs.map((dm) => {
              const isActive = activeConversation === dm.id;
              return (
                <button
                  key={dm.id}
                  onClick={() => {
                    setActiveConversation(dm.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className={`text-[11px] font-semibold text-white ${
                          isActive ? 'bg-teal-600' : ''
                        }`}
                        style={!isActive ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : undefined}
                      >
                        {dm.partnerAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      dm.online ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${isActive ? 'text-teal-700 dark:text-teal-300' : ''}`}>
                        {dm.partnerName}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{dm.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {dm.lastMessage}
                    </p>
                  </div>
                  {dm.unread > 0 && (
                    <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 min-w-[18px] justify-center flex-shrink-0">
                      {dm.unread}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // ── Chat header ──────────────────────────────────────────────────

  const chatHeader = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {/* Mobile back button */}
        <button
          onClick={() => setMobileShowChat(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {isChannel && activeChannel && (
          <>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-100 dark:bg-teal-900/30">
              <activeChannel.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{activeChannel.name}</h3>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {activeChannel.members} membres • {activeChannel.description}
              </p>
            </div>
          </>
        )}

        {isDM && activeDM && (
          <>
            <div className="relative">
              <Avatar className="w-9 h-9">
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                >
                  {activeDM.partnerAvatar}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                activeDM.online ? 'bg-emerald-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{activeDM.partnerName}</h3>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  activeDM.online
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {activeDM.online ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">{activeDM.partnerRole}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {isDM && (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCallType('phone'); setShowCallDialog(true); }}>
              <Phone className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCallType('video'); setShowCallDialog(true); }}>
              <Video className="w-4 h-4 text-gray-500" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
          const lastMsg = currentMessages[currentMessages.length - 1];
          if (lastMsg) {
            setPinnedMessageIds(prev => {
              const next = new Set(prev);
              if (next.has(lastMsg.id)) { next.delete(lastMsg.id); } else { next.add(lastMsg.id); }
              return next;
            });
          }
          alert(pinnedMessageIds.has(currentMessages[currentMessages.length - 1]?.id) ? 'Message désépinglé' : 'Message épinglé');
        }}>
          <Pin className="w-4 h-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-8 w-8 ${showChatSearch ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`} onClick={() => { setShowChatSearch(!showChatSearch); if (showChatSearch) setChatSearchQuery(''); }}>
          <Search className="w-4 h-4 text-gray-500" />
        </Button>
        <Popover open={showMoreMenu} onOpenChange={setShowMoreMenu}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="end" sideOffset={8}>
            <button
              onClick={() => { setMessages(prev => prev.map(m => m.conversationId === activeConversation ? { ...m, read: true } : m)); setShowMoreMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-gray-400" />
              Marquer comme lu
            </button>
            <button
              onClick={() => { setShowMoreMenu(false); alert('Sourdine activée pour ce canal'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              Sourdine
            </button>
            <button
              onClick={() => { setShowMoreMenu(false); alert('Vous avez quitté le canal'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quitter le canal
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  // ── Message bubble ───────────────────────────────────────────────

  const MessageBubble = ({ msg, index }: { msg: ChatMessage; index: number }) => {
    const isMe = msg.senderId === 'me';
    const showAvatar = index === 0 || currentMessages[index - 1]?.senderId !== msg.senderId;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
        className={`flex gap-2.5 px-4 py-1 ${isMe ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
      >
        {/* Avatar */}
        {showAvatar ? (
          <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
            <AvatarFallback
              className={`text-[11px] font-semibold ${
                isMe
                  ? 'bg-gray-700 dark:bg-gray-600 text-white'
                  : 'text-white'
              }`}
              style={!isMe ? { background: 'linear-gradient(135deg, #0d9488, #059669)' } : undefined}
            >
              {msg.senderAvatar}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 flex-shrink-0" />
        )}

        <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
          {/* Sender name & time */}
          {showAvatar && (
            <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {msg.senderName}
              </span>
              <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
            </div>
          )}

          {/* Message content */}
          <div
            className={`rounded-2xl px-3.5 py-2.5 inline-block ${
              isMe
                ? 'bg-teal-600 text-white rounded-tr-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md'
            }`}
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>

            {/* Attachment */}
            {msg.attachment && (
              <div className={`mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${attachmentColors[msg.attachment.type]}`}>
                {React.createElement(attachmentIcons[msg.attachment.type], { className: 'w-3.5 h-3.5 flex-shrink-0' })}
                <span>{msg.attachment.label}</span>
              </div>
            )}
          </div>

          {/* Read receipt */}
          {isMe && showAvatar && (
            <div className="flex items-center justify-end mt-1 gap-1">
              {msg.read ? (
                <CheckCheck className="w-3.5 h-3.5 text-teal-500" />
              ) : (
                <Check className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ── Chat area ────────────────────────────────────────────────────

  const chatArea = (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {chatHeader}

      {/* Chat search bar */}
      <AnimatePresence>
        {showChatSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Rechercher dans la conversation..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  autoFocus
                />
              </div>
              {chatSearchQuery && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {currentMessages.length} résultat{currentMessages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {/* Channel welcome */}
          {isChannel && activeChannel && (
            <div className="px-4 mb-6 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 mb-3">
                <activeChannel.icon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">#{activeChannel.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeChannel.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activeChannel.members} membres dans ce canal</p>
            </div>
          )}

          {/* DM welcome */}
          {isDM && activeDM && (
            <div className="px-4 mb-6 text-center">
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarFallback
                  className="text-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                >
                  {activeDM.partnerAvatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeDM.partnerName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeDM.partnerRole}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Circle className={`w-2 h-2 ${activeDM.online ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-400 text-gray-400'}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activeDM.online ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          )}

          <Separator className="mb-4" />

          {/* Pinned message indicator */}
          {pinnedMessageIds.size > 0 && currentMessages.some(m => pinnedMessageIds.has(m.id)) && (
            <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Message épinglé ({pinnedMessageIds.size})
              </span>
            </div>
          )}

          {currentMessages.map((msg, index) => (
            <MessageBubble key={msg.id} msg={msg} index={index} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Popover open={showQuickActions} onOpenChange={setShowQuickActions}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
                <Paperclip className="w-4.5 h-4.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="start" sideOffset={8}>
              <button
                onClick={handleAttachShipment}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <div className="text-left">
                  <p className="font-medium">Réf. Expédition</p>
                  <p className="text-[11px] text-gray-400">Joindre une référence</p>
                </div>
              </button>
              <button
                onClick={handleShareTracking}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                <Link2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <div className="text-left">
                  <p className="font-medium">Lien de suivi</p>
                  <p className="text-[11px] text-gray-400">Partager un lien de suivi</p>
                </div>
              </button>
              <Separator className="my-1" />
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  setShowEscalateDialog(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div className="text-left">
                  <p className="font-medium">Escalader en ticket</p>
                  <p className="text-[11px] text-gray-400">Créer un ticket d'escalade</p>
                </div>
              </button>
            </PopoverContent>
          </Popover>

          {/* Input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder={`Message ${isChannel ? `#${getConversationTitle()}` : `@${getConversationTitle()}`}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-10 text-sm pr-20 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <AtSign className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="h-10 px-4 rounded-xl flex-shrink-0"
            style={{
              background: messageInput.trim()
                ? 'linear-gradient(135deg, #0d9488, #059669)'
                : undefined,
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Escalate Dialog ──────────────────────────────────────────────

  const escalateDialog = (
    <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Escalader en ticket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Raison de l&apos;escalade
            </label>
            <Input
              placeholder="Décrivez le problème urgent..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Le ticket sera créé et assigné à l&apos;équipe de support. Tous les participants de cette conversation seront notifiés.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEscalate}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Ticket className="w-4 h-4 mr-1.5" />
              Créer le ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Desktop: sidebar + chat side by side */}
      {/* Mobile: conditional rendering */}
      <div className={`${mobileShowChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 xl:w-80 flex-shrink-0`}>
        {sidebar}
      </div>
      <div className={`${!mobileShowChat ? 'hidden lg:flex' : 'flex'} flex-1 min-w-0`}>
        {chatArea}
      </div>

      {escalateDialog}
    </div>
  );
}
