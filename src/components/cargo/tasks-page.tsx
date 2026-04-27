'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ListTodo,
  Plus,
  GripVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  MessageSquare,
  Calendar,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  Search,
  Trash2,
  Paperclip,
  ArrowRight,
  Users,
  TrendingUp,
  Timer,
  Target,
  Send,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
type TaskStatus = 'a_faire' | 'en_cours' | 'en_revision' | 'termine';
type TaskPriority = 'critique' | 'haute' | 'moyenne' | 'basse';
type TaskCategory = 'expedition' | 'douanes' | 'documentation' | 'facturation' | 'entrepot' | 'reclamation' | 'autre';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo: string;
  dueDate: string;
  relatedEntity: string;
  subtasks: SubTask[];
  activityLog: ActivityLog[];
  attachments: number;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeTasks: number;
  completedTasks: number;
  avgResolutionHours: number;
}

// Labels
const statusLabels: Record<TaskStatus, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  en_revision: 'En révision',
  termine: 'Terminé',
};

const statusColors: Record<TaskStatus, string> = {
  a_faire: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  en_cours: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  termine: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const statusColumnColors: Record<TaskStatus, string> = {
  a_faire: 'border-t-gray-400 dark:border-t-gray-500',
  en_cours: 'border-t-blue-500 dark:border-t-blue-400',
  en_revision: 'border-t-orange-500 dark:border-t-orange-400',
  termine: 'border-t-emerald-500 dark:border-t-emerald-400',
};

const statusColumnBg: Record<TaskStatus, string> = {
  a_faire: 'bg-gray-50/80 dark:bg-gray-900/30',
  en_cours: 'bg-blue-50/50 dark:bg-blue-950/20',
  en_revision: 'bg-orange-50/50 dark:bg-orange-950/20',
  termine: 'bg-emerald-50/50 dark:bg-emerald-950/20',
};

const priorityLabels: Record<TaskPriority, string> = {
  critique: 'Critique',
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};

const priorityColors: Record<TaskPriority, string> = {
  critique: 'bg-red-500',
  haute: 'bg-orange-500',
  moyenne: 'bg-yellow-500',
  basse: 'bg-gray-400',
};

const priorityBadgeColors: Record<TaskPriority, string> = {
  critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  moyenne: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  basse: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const categoryLabels: Record<TaskCategory, string> = {
  expedition: 'Expédition',
  douanes: 'Douanes',
  documentation: 'Documentation',
  facturation: 'Facturation',
  entrepot: 'Entrepôt',
  reclamation: 'Réclamation',
  autre: 'Autre',
};

const categoryBadgeColors: Record<TaskCategory, string> = {
  expedition: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  douanes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  documentation: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  facturation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  entrepot: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  reclamation: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  autre: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// Team Members
const teamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Ahmed Benali', role: 'Administrateur', avatar: 'AB', activeTasks: 5, completedTasks: 28, avgResolutionHours: 18 },
  { id: 'tm2', name: 'Fatima Khelifi', role: 'Agent', avatar: 'FK', activeTasks: 4, completedTasks: 22, avgResolutionHours: 24 },
  { id: 'tm3', name: 'Karim Bouzid', role: 'Logisticien', avatar: 'KB', activeTasks: 3, completedTasks: 19, avgResolutionHours: 20 },
  { id: 'tm4', name: 'Nadia Benmoussa', role: 'Agent', avatar: 'NB', activeTasks: 3, completedTasks: 15, avgResolutionHours: 30 },
  { id: 'tm5', name: 'Ali Mezdad', role: 'Chauffeur', avatar: 'AM', activeTasks: 2, completedTasks: 12, avgResolutionHours: 36 },
];

// Test Data: 22 Tasks
const initialTasks: Task[] = [
  {
    id: 't1', title: 'Préparer déclaration douanière FFP-0002', description: 'Compléter la déclaration en douane pour le conteneur maritime FFP-0002-2026 à destination de Marseille. Vérifier les codes HS et les documents requis.', status: 'en_cours', priority: 'critique', category: 'douanes', assignedTo: 'Ahmed Benali', dueDate: '2026-03-05', relatedEntity: 'FFP-0002-2026', subtasks: [{ id: 'st1a', title: 'Vérifier codes HS', completed: true }, { id: 'st1b', title: 'Préparer facture commerciale', completed: true }, { id: 'st1c', title: 'Soumettre déclaration', completed: false }], activityLog: [{ id: 'al1a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-02-28T09:00:00' }, { id: 'al1b', user: 'Ahmed Benali', action: 'Sous-tâche "Vérifier codes HS" terminée', timestamp: '2026-03-01T14:30:00' }], attachments: 2, createdAt: '2026-02-28',
  },
  {
    id: 't2', title: 'Suivi conteneur retardé MSKU-7234561', description: 'Le conteneur MSKU-7234561 est en retard de 3 jours. Contacter la compagnie maritime et informer le client Entreprise Bouzidi & Fils.', status: 'en_cours', priority: 'haute', category: 'expedition', assignedTo: 'Fatima Khelifi', dueDate: '2026-03-04', relatedEntity: 'MSKU-7234561', subtasks: [{ id: 'st2a', title: 'Contacter CMA CGM', completed: true }, { id: 'st2b', title: 'Informer le client', completed: false }, { id: 'st2c', title: 'Mettre à jour le statut', completed: false }], activityLog: [{ id: 'al2a', user: 'Fatima Khelifi', action: 'Tâche créée', timestamp: '2026-03-01T10:00:00' }], attachments: 1, createdAt: '2026-03-01',
  },
  {
    id: 't3', title: 'Vérifier assurance conteneur réfrigéré', description: 'Vérifier la police d\'assurance pour le conteneur réfrigéré EISU-3345678 transportant des produits pharmaceutiques depuis Mumbai.', status: 'a_faire', priority: 'haute', category: 'documentation', assignedTo: 'Ahmed Benali', dueDate: '2026-03-08', relatedEntity: 'EISU-3345678', subtasks: [{ id: 'st3a', title: 'Récupérer police d\'assurance', completed: false }, { id: 'st3b', title: 'Vérifier couverture température', completed: false }], activityLog: [{ id: 'al3a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-03-02T08:00:00' }], attachments: 0, createdAt: '2026-03-02',
  },
  {
    id: 't4', title: 'Planifier chargement entrepôt Zone A', description: 'Organiser le chargement de 8 palettes pour l\'expédition terrestre FFP-0003-2026 vers Dakar. Coordonner avec l\'équipe entrepôt.', status: 'a_faire', priority: 'moyenne', category: 'entrepot', assignedTo: 'Karim Bouzid', dueDate: '2026-03-10', relatedEntity: 'FFP-0003-2026', subtasks: [{ id: 'st4a', title: 'Vérifier stock palettes', completed: false }, { id: 'st4b', title: 'Confirmer équipe chargement', completed: false }, { id: 'st4c', title: 'Imprimer bordereau', completed: false }], activityLog: [{ id: 'al4a', user: 'Karim Bouzid', action: 'Tâche créée', timestamp: '2026-03-01T11:00:00' }], attachments: 0, createdAt: '2026-03-01',
  },
  {
    id: 't5', title: 'Revoir facture client FAC-2026-0005', description: 'La facture FAC-2026-0005 pour SPA HydroServices est en retard. Relancer le client et proposer un échéancier de paiement.', status: 'en_cours', priority: 'critique', category: 'facturation', assignedTo: 'Nadia Benmoussa', dueDate: '2026-03-03', relatedEntity: 'FAC-2026-0005', subtasks: [{ id: 'st5a', title: 'Appeler le client', completed: true }, { id: 'st5b', title: 'Proposer échéancier', completed: false }], activityLog: [{ id: 'al5a', user: 'Nadia Benmoussa', action: 'Tâche créée', timestamp: '2026-02-27T09:30:00' }], attachments: 3, createdAt: '2026-02-27',
  },
  {
    id: 't6', title: 'Traiter réclamation Sarl TechnoPlus', description: 'Le client Sarl TechnoPlus signale des dommages sur la livraison FFP-0001-2026. Matériel informatique fragile avec casse constatée.', status: 'en_revision', priority: 'haute', category: 'reclamation', assignedTo: 'Fatima Khelifi', dueDate: '2026-03-06', relatedEntity: 'FFP-0001-2026', subtasks: [{ id: 'st6a', title: 'Collecter photos dommages', completed: true }, { id: 'st6b', title: 'Rédiger rapport d\'incident', completed: true }, { id: 'st6c', title: 'Soumettre réclamation assurance', completed: false }], activityLog: [{ id: 'al6a', user: 'Fatima Khelifi', action: 'Tâche créée', timestamp: '2026-02-25T14:00:00' }], attachments: 5, createdAt: '2026-02-25',
  },
  {
    id: 't7', title: 'Confirmer réservation vol AH-1234', description: 'Confirmer la réservation de capacité cargo sur le vol Air Algérie AH-1234 Alger-Paris pour le 5 mars 2026.', status: 'termine', priority: 'moyenne', category: 'expedition', assignedTo: 'Ahmed Benali', dueDate: '2026-03-04', relatedEntity: 'AH-1234', subtasks: [{ id: 'st7a', title: 'Vérifier disponibilité', completed: true }, { id: 'st7b', title: 'Confirmer réservation', completed: true }], activityLog: [{ id: 'al7a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-02-20T10:00:00' }], attachments: 1, createdAt: '2026-02-20',
  },
  {
    id: 't8', title: 'Préparer BL conteneur CSLU-8912345', description: 'Émettre le connaissement (Bill of Lading) pour le conteneur CSLU-8912345 en provenance de Shanghai.', status: 'en_cours', priority: 'moyenne', category: 'documentation', assignedTo: 'Fatima Khelifi', dueDate: '2026-03-12', relatedEntity: 'CSLU-8912345', subtasks: [{ id: 'st8a', title: 'Vérifier manifeste cargo', completed: true }, { id: 'st8b', title: 'Émettre BL', completed: false }], activityLog: [{ id: 'al8a', user: 'Fatima Khelifi', action: 'Tâche créée', timestamp: '2026-03-02T09:00:00' }], attachments: 2, createdAt: '2026-03-02',
  },
  {
    id: 't9', title: 'Mise à jour statut FFP-0018-2026', description: 'L\'expédition aérienne FFP-0018-2026 est retardée pour problème douanier. Mettre à jour le suivi et notifier le client Mohamed Amrani.', status: 'a_faire', priority: 'critique', category: 'expedition', assignedTo: 'Ahmed Benali', dueDate: '2026-03-02', relatedEntity: 'FFP-0018-2026', subtasks: [{ id: 'st9a', title: 'Contacter agent douanier', completed: false }, { id: 'st9b', title: 'Notifier client', completed: false }, { id: 'st9c', title: 'Mettre à jour système', completed: false }], activityLog: [{ id: 'al9a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-03-02T07:30:00' }], attachments: 0, createdAt: '2026-03-02',
  },
  {
    id: 't10', title: 'Inventaire entrepôt Zone B', description: 'Réaliser l\'inventaire mensuel de la Zone B de l\'entrepôt. Vérifier les écarts avec le système de gestion de stock.', status: 'a_faire', priority: 'basse', category: 'entrepot', assignedTo: 'Karim Bouzid', dueDate: '2026-03-15', relatedEntity: 'Zone B', subtasks: [{ id: 'st10a', title: 'Imprimer liste stock', completed: false }, { id: 'st10b', title: 'Comptage physique', completed: false }, { id: 'st10c', title: 'Rapprochement système', completed: false }], activityLog: [{ id: 'al10a', user: 'Karim Bouzid', action: 'Tâche créée', timestamp: '2026-03-01T16:00:00' }], attachments: 0, createdAt: '2026-03-01',
  },
  {
    id: 't11', title: 'Émettre facture FAC-2026-0015', description: 'Émettre la facture pour l\'expédition FFP-0021-2026 (Entreprise Bouzidi & Fils). Montant : 3 100 000 DA.', status: 'en_revision', priority: 'moyenne', category: 'facturation', assignedTo: 'Nadia Benmoussa', dueDate: '2026-03-08', relatedEntity: 'FAC-2026-0015', subtasks: [{ id: 'st11a', title: 'Vérifier montant', completed: true }, { id: 'st11b', title: 'Validation comptable', completed: false }], activityLog: [{ id: 'al11a', user: 'Nadia Benmoussa', action: 'Tâche créée', timestamp: '2026-03-01T10:00:00' }], attachments: 1, createdAt: '2026-03-01',
  },
  {
    id: 't12', title: 'Organiser livraison FFP-0011-2026 Tunis-Alger', description: 'Coordonner la réception de l\'expédition terrestre FFP-0011-2026 en provenance de Tunis. Préparer l\'équipe de déchargement.', status: 'en_cours', priority: 'moyenne', category: 'expedition', assignedTo: 'Ali Mezdad', dueDate: '2026-03-14', relatedEntity: 'FFP-0011-2026', subtasks: [{ id: 'st12a', title: 'Confirmer heure arrivée', completed: true }, { id: 'st12b', title: 'Préparer quai déchargement', completed: false }], activityLog: [{ id: 'al12a', user: 'Ali Mezdad', action: 'Tâche créée', timestamp: '2026-03-05T08:00:00' }], attachments: 0, createdAt: '2026-03-05',
  },
  {
    id: 't13', title: 'Vérifier documents import FFP-0004-2026', description: 'Vérifier la complétude des documents d\'importation pour l\'expédition aérienne FFP-0004-2026 en provenance de Dubaï (Sarl MédiaCom).', status: 'a_faire', priority: 'haute', category: 'douanes', assignedTo: 'Ahmed Benali', dueDate: '2026-03-06', relatedEntity: 'FFP-0004-2026', subtasks: [{ id: 'st13a', title: 'Vérifier certificat d\'origine', completed: false }, { id: 'st13b', title: 'Vérifier facture proforma', completed: false }], activityLog: [{ id: 'al13a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-03-03T09:00:00' }], attachments: 0, createdAt: '2026-03-03',
  },
  {
    id: 't14', title: 'Réserver transport terrestre FFP-0022-2026', description: 'Réserver le transport pour l\'expédition FFP-0022-2026 Casablanca-Alger. Électroménager, 950 kg.', status: 'a_faire', priority: 'moyenne', category: 'expedition', assignedTo: 'Fatima Khelifi', dueDate: '2026-03-10', relatedEntity: 'FFP-0022-2026', subtasks: [{ id: 'st14a', title: 'Demander devis transporteur', completed: false }, { id: 'st14b', title: 'Confirmer réservation', completed: false }], activityLog: [{ id: 'al14a', user: 'Fatima Khelifi', action: 'Tâche créée', timestamp: '2026-03-04T11:00:00' }], attachments: 0, createdAt: '2026-03-04',
  },
  {
    id: 't15', title: 'Clôturer réclamation EURL BatiPlus', description: 'Finaliser la réclamation concernant les matériaux endommagés sur le conteneur FCIU-4456789. Remboursement approuvé.', status: 'termine', priority: 'basse', category: 'reclamation', assignedTo: 'Nadia Benmoussa', dueDate: '2026-02-28', relatedEntity: 'FCIU-4456789', subtasks: [{ id: 'st15a', title: 'Confirmer remboursement', completed: true }, { id: 'st15b', title: 'Archiver dossier', completed: true }], activityLog: [{ id: 'al15a', user: 'Nadia Benmoussa', action: 'Tâche créée', timestamp: '2026-02-20T09:00:00' }], attachments: 4, createdAt: '2026-02-20',
  },
  {
    id: 't16', title: 'Planifier maintenance fourgon Iveco', description: 'Le fourgon Iveco Daily 70C17 (09-2345-678) est en maintenance. Suivre les réparations et planifier la remise en service.', status: 'en_cours', priority: 'basse', category: 'autre', assignedTo: 'Karim Bouzid', dueDate: '2026-03-20', relatedEntity: '09-2345-678', subtasks: [{ id: 'st16a', title: 'Confirmer diagnostic garage', completed: true }, { id: 'st16b', title: 'Approuver devis réparation', completed: true }, { id: 'st16c', title: 'Planifier remise en service', completed: false }], activityLog: [{ id: 'al16a', user: 'Karim Bouzid', action: 'Tâche créée', timestamp: '2026-02-25T08:00:00' }], attachments: 2, createdAt: '2026-02-25',
  },
  {
    id: 't17', title: 'Préparer DEX export FFP-0015-2026', description: 'Préparer la déclaration d\'exportation (DEX) pour l\'envoi aérien FFP-0015-2026 Londres-Le Caire (échantillons textiles).', status: 'a_faire', priority: 'moyenne', category: 'douanes', assignedTo: 'Fatima Khelifi', dueDate: '2026-03-12', relatedEntity: 'FFP-0015-2026', subtasks: [{ id: 'st17a', title: 'Remplir DEX', completed: false }, { id: 'st17b', title: 'Joindre documents commerciaux', completed: false }], activityLog: [{ id: 'al17a', user: 'Fatima Khelifi', action: 'Tâche créée', timestamp: '2026-03-04T14:00:00' }], attachments: 0, createdAt: '2026-03-04',
  },
  {
    id: 't18', title: 'Valider BL conteneur TCLU-5567890', description: 'Valider le Bill of Lading pour le conteneur 40ft HC TCLU-5567890 à destination de Djeddah. Vérifier les détails cargo.', status: 'en_revision', priority: 'moyenne', category: 'documentation', assignedTo: 'Ahmed Benali', dueDate: '2026-03-10', relatedEntity: 'TCLU-5567890', subtasks: [{ id: 'st18a', title: 'Vérifier déclarations cargo', completed: true }, { id: 'st18b', title: 'Approuver BL', completed: false }], activityLog: [{ id: 'al18a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-03-03T10:00:00' }], attachments: 3, createdAt: '2026-03-03',
  },
  {
    id: 't19', title: 'Récupérer conteneur vide MSCU-1123456', description: 'Organiser le retour du conteneur vide MSCU-1123456 au port de Rotterdam. Coordonner avec le transporteur local.', status: 'termine', priority: 'basse', category: 'expedition', assignedTo: 'Ali Mezdad', dueDate: '2026-03-01', relatedEntity: 'MSCU-1123456', subtasks: [{ id: 'st19a', title: 'Confirmer transporteur local', completed: true }, { id: 'st19b', title: 'Planifier enlèvement', completed: true }], activityLog: [{ id: 'al19a', user: 'Ali Mezdad', action: 'Tâche créée', timestamp: '2026-02-26T08:00:00' }], attachments: 1, createdAt: '2026-02-26',
  },
  {
    id: 't20', title: 'Relancer paiement FAC-2026-0012', description: 'La facture FAC-2026-0012 pour Sarl TechnoPlus (280 000 DA) est en retard de paiement depuis le 15 avril.', status: 'en_cours', priority: 'haute', category: 'facturation', assignedTo: 'Nadia Benmoussa', dueDate: '2026-03-07', relatedEntity: 'FAC-2026-0012', subtasks: [{ id: 'st20a', title: 'Envoyer rappel écrit', completed: true }, { id: 'st20b', title: 'Appeler service comptable', completed: false }], activityLog: [{ id: 'al20a', user: 'Nadia Benmoussa', action: 'Tâche créée', timestamp: '2026-03-02T09:00:00' }], attachments: 2, createdAt: '2026-03-02',
  },
  {
    id: 't21', title: 'Vérifier certificat phytosanitaire', description: 'Obtenir le certificat phytosanitaire pour les produits alimentaires de l\'expédition FFP-0003-2026 vers Dakar.', status: 'a_faire', priority: 'haute', category: 'douanes', assignedTo: 'Ahmed Benali', dueDate: '2026-03-09', relatedEntity: 'FFP-0003-2026', subtasks: [{ id: 'st21a', title: 'Contacter laboratoire', completed: false }, { id: 'st21b', title: 'Obtenir certificat', completed: false }], activityLog: [{ id: 'al21a', user: 'Ahmed Benali', action: 'Tâche créée', timestamp: '2026-03-04T08:00:00' }], attachments: 0, createdAt: '2026-03-04',
  },
  {
    id: 't22', title: 'Coordonner arrivée conteneur TEMU-9987654', description: 'Le conteneur 40ft HC TEMU-9987654 est arrivé au port d\'Alger en provenance de Barcelone. Organiser le dédouanement et l\'enlèvement.', status: 'en_cours', priority: 'critique', category: 'expedition', assignedTo: 'Fatima Khelifi', dueDate: '2026-03-05', relatedEntity: 'TEMU-9987654', subtasks: [{ id: 'st22a', title: 'Confirmer arrivée au port', completed: true }, { id: 'st22b', title: 'Lancer dédouanement', completed: false }, { id: 'st22c', title: 'Réserver transport enlèvement', completed: false }], activityLog: [{ id: 'al22a', user: 'Fatima Khelifi', action: 'Tâche créée', timestamp: '2026-03-03T07:00:00' }], attachments: 3, createdAt: '2026-03-03',
  },
];

const allStatuses: TaskStatus[] = ['a_faire', 'en_cours', 'en_revision', 'termine'];
const allPriorities: TaskPriority[] = ['critique', 'haute', 'moyenne', 'basse'];
const allCategories: TaskCategory[] = ['expedition', 'douanes', 'documentation', 'facturation', 'entrepot', 'reclamation', 'autre'];

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date() && dateStr !== '';
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showTeamSection, setShowTeamSection] = useState(true);

  // Add task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'moyenne' as TaskPriority,
    category: 'expedition' as TaskCategory,
    assignedTo: '',
    dueDate: '',
    relatedEntity: '',
    subtasks: [] as string[],
  });
  const [subtaskInput, setSubtaskInput] = useState('');

  // KPI computations
  const kpis = useMemo(() => {
    const total = tasks.length;
    const enCours = tasks.filter(t => t.status === 'en_cours').length;
    const enAttente = tasks.filter(t => t.status === 'a_faire').length;
    const terminees = tasks.filter(t => t.status === 'termine').length;
    const taux = total > 0 ? Math.round((terminees / total) * 100) : 0;
    const today = new Date().toISOString().split('T')[0];
    const termineesAujourdhui = tasks.filter(t => t.status === 'termine' && t.createdAt === today).length;
    return { total, enCours, enAttente, termineesAujourdhui: Math.max(1, termineesAujourdhui), taux, terminees };
  }, [tasks]);

  // Filtered tasks
  const filtered = useMemo(() => {
    let result = [...tasks];
    if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
    if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory);
    if (filterAssignee !== 'all') result = result.filter(t => t.assignedTo === filterAssignee);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.relatedEntity.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, filterPriority, filterCategory, filterAssignee, searchQuery]);

  // Kanban grouped
  const kanbanGroups = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { a_faire: [], en_cours: [], en_revision: [], termine: [] };
    filtered.forEach(t => groups[t.status].push(t));
    return groups;
  }, [filtered]);

  // Team stats
  const teamStats = useMemo(() => {
    return teamMembers.map(m => {
      const memberTasks = tasks.filter(t => t.assignedTo === m.name);
      const active = memberTasks.filter(t => t.status !== 'termine').length;
      const completed = memberTasks.filter(t => t.status === 'termine').length;
      return { ...m, activeTasks: active, completedTasks: completed + m.completedTasks - (memberTasks.filter(t => t.status === 'termine').length) };
    });
  }, [tasks]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (draggedTaskId) {
      setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status: targetStatus } : t));
      setDraggedTaskId(null);
    }
  };

  const handleAddTask = () => {
    const id = `t${tasks.length + 1}`;
    const task: Task = {
      id,
      title: newTask.title,
      description: newTask.description,
      status: 'a_faire',
      priority: newTask.priority,
      category: newTask.category,
      assignedTo: newTask.assignedTo || 'Ahmed Benali',
      dueDate: newTask.dueDate,
      relatedEntity: newTask.relatedEntity,
      subtasks: newTask.subtasks.map((s, i) => ({ id: `st${id}${i}`, title: s, completed: false })),
      activityLog: [{ id: `al${id}a`, user: newTask.assignedTo || 'Ahmed Benali', action: 'Tâche créée', timestamp: new Date().toISOString() }],
      attachments: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([task, ...tasks]);
    setShowAddDialog(false);
    setNewTask({ title: '', description: '', priority: 'moyenne', category: 'expedition', assignedTo: '', dueDate: '', relatedEntity: '', subtasks: [] });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setShowDetailDialog(false);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st),
    } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        subtasks: selectedTask.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st),
      });
    }
  };

  const handleReassign = (taskId: string, newAssignee: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: newAssignee } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, assignedTo: newAssignee });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    const log: ActivityLog = {
      id: `al${selectedTask.id}${Date.now()}`,
      user: 'Ahmed Benali',
      action: `Commentaire: ${newComment}`,
      timestamp: new Date().toISOString(),
    };
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, activityLog: [...t.activityLog, log] } : t));
    setSelectedTask({ ...selectedTask, activityLog: [...selectedTask.activityLog, log] });
    setNewComment('');
  };

  // KPI Cards data
  const kpiCards = [
    { label: 'Tâches totales', value: kpis.total, icon: ListTodo, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'En cours', value: kpis.enCours, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'En attente', value: kpis.enAttente, icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Terminées aujourd\'hui', value: kpis.termineesAujourdhui, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Taux d\'achèvement', value: `${kpis.taux}%`, icon: Target, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-6 h-6" style={{ color: '#0d9488' }} />
            Centre de Tâches
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez et suivez vos tâches opérationnelles</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Liste
            </button>
          </div>
          <Button size="sm" className="text-xs text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((kpi, idx) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#0d9488' }}>{kpi.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters Row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher tâches, entités..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-36">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                {allPriorities.map(p => <SelectItem key={p} value={p}>{priorityLabels[p]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {allCategories.map(c => <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-full sm:w-40">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Assigné à" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les membres</SelectItem>
                {teamMembers.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {allStatuses.map((status) => (
            <div
              key={status}
              className={`rounded-xl border-t-4 ${statusColumnColors[status]} ${statusColumnBg[status]} p-3 min-h-[400px] transition-colors ${
                draggedTaskId ? 'ring-2 ring-teal-300/50' : ''
              }`}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-teal-400'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-teal-400'); }}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('ring-2', 'ring-teal-400'); handleDrop(status); }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[status]} text-xs font-semibold`}>{statusLabels[status]}</Badge>
                  <span className="text-xs text-gray-400">{kanbanGroups[status].length}</span>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                  {kanbanGroups[status].map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onClick={() => { setSelectedTask(task); setShowDetailDialog(true); }}
                      className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow group"
                    >
                      {/* Priority strip */}
                      <div className={`h-1 rounded-full mb-2 ${priorityColors[task.priority]}`} />
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight line-clamp-2">{task.title}</h4>
                        <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Badge className={`${categoryBadgeColors[task.category]} text-[10px] px-1.5 py-0`}>{categoryLabels[task.category]}</Badge>
                        <Badge className={`${priorityBadgeColors[task.priority]} text-[10px] px-1.5 py-0`}>{priorityLabels[task.priority]}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-[8px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              {getInitials(task.assignedTo)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{task.assignedTo.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.subtasks.length > 0 && (
                            <div className="flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-0.5 ${isOverdue(task.dueDate) && task.status !== 'termine' ? 'text-red-500' : 'text-gray-400'}`}>
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px]">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '-'}</span>
                          </div>
                        </div>
                      </div>
                      {task.relatedEntity && (
                        <div className="mt-1.5">
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono bg-teal-50 dark:bg-teal-900/20 px-1.5 py-0.5 rounded">{task.relatedEntity}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {kanbanGroups[status].length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-xs">Aucune tâche</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Priorité</TableHead>
                    <TableHead className="text-xs">Titre</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Catégorie</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Assigné à</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Échéance</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Entité liée</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">Aucune tâche trouvée</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((task) => (
                      <TableRow
                        key={task.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                        onClick={() => { setSelectedTask(task); setShowDetailDialog(true); }}
                      >
                        <TableCell>
                          <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} title={priorityLabels[task.priority]} />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className={`${categoryBadgeColors[task.category]} text-[10px]`}>{categoryLabels[task.category]}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-[8px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                {getInitials(task.assignedTo)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{task.assignedTo.split(' ')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[task.status]} text-[10px]`}>{statusLabels[task.status]}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) && task.status !== 'termine' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs font-mono text-teal-600 dark:text-teal-400">{task.relatedEntity || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {allStatuses.map(s => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusChange(task.id, s)}>
                                  <ArrowRight className="w-3 h-3 mr-2" />
                                  {statusLabels[s]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Overview Section */}
      <div>
        <button
          onClick={() => setShowTeamSection(!showTeamSection)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <Users className="w-5 h-5" style={{ color: '#0d9488' }} />
          Vue d&apos;équipe
          <ChevronDown className={`w-4 h-4 transition-transform ${showTeamSection ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {showTeamSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {teamStats.map((member) => {
                  const totalTasks = member.activeTasks + member.completedTasks;
                  const completionRate = totalTasks > 0 ? Math.round((member.completedTasks / totalTasks) * 100) : 0;
                  return (
                    <Card key={member.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="text-sm bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Tâches actives</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{member.activeTasks}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Terminées</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{member.completedTasks}</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Achèvement</span>
                              <span className="font-medium" style={{ color: '#0d9488' }}>{completionRate}%</span>
                            </div>
                            <Progress value={completionRate} className="h-1.5" />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Temps moyen</span>
                            <div className="flex items-center gap-1">
                              <Timer className="w-3 h-3 text-gray-400" />
                              <span className="font-medium text-gray-700 dark:text-gray-300">{member.avgResolutionHours}h</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {selectedTask && (
                <>
                  <div className={`w-3 h-3 rounded-full ${priorityColors[selectedTask.priority]}`} />
                  <span>{selectedTask.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>Détails de la tâche</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {/* Status + Priority + Category */}
              <div className="flex items-center gap-2 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                      <Badge className={`${statusColors[selectedTask.status]} text-xs cursor-pointer hover:opacity-80`}>
                        {statusLabels[selectedTask.status]}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {allStatuses.map(s => (
                      <DropdownMenuItem key={s} onClick={() => handleStatusChange(selectedTask.id, s)}>
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {statusLabels[s]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Badge className={`${priorityBadgeColors[selectedTask.priority]} text-xs`}>{priorityLabels[selectedTask.priority]}</Badge>
                <Badge className={`${categoryBadgeColors[selectedTask.category]} text-xs`}>{categoryLabels[selectedTask.category]}</Badge>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{selectedTask.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Assigné à</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[9px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                        {getInitials(selectedTask.assignedTo)}
                      </AvatarFallback>
                    </Avatar>
                    <Select value={selectedTask.assignedTo} onValueChange={(v) => handleReassign(selectedTask.id, v)}>
                      <SelectTrigger className="h-7 text-xs border-0 p-0 w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Échéance</p>
                  <div className={`flex items-center gap-1.5 mt-1 ${isOverdue(selectedTask.dueDate) && selectedTask.status !== 'termine' ? 'text-red-500' : ''}`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatDate(selectedTask.dueDate)}</span>
                    {isOverdue(selectedTask.dueDate) && selectedTask.status !== 'termine' && (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-1.5">En retard</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Entité liée</p>
                  <span className="text-sm font-mono font-medium" style={{ color: '#0d9488' }}>{selectedTask.relatedEntity || '-'}</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Pièces jointes</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedTask.attachments} fichier{selectedTask.attachments !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subtasks */}
              {selectedTask.subtasks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sous-tâches ({selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length})
                  </p>
                  <div className="space-y-1.5">
                    {selectedTask.subtasks.map(st => (
                      <div key={st.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={st.completed}
                          onCheckedChange={() => handleToggleSubtask(selectedTask.id, st.id)}
                          className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                        />
                        <span className={`text-sm ${st.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{st.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Activity Log */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Activité ({selectedTask.activityLog.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedTask.activityLog.map(log => (
                    <div key={log.id} className="flex items-start gap-2 text-xs">
                      <Avatar className="w-5 h-5 mt-0.5">
                        <AvatarFallback className="text-[7px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {getInitials(log.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{log.user}</span>
                        {' '}
                        <span className="text-gray-500 dark:text-gray-400">{log.action}</span>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(log.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Comment */}
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    placeholder="Ajouter un commentaire..."
                    className="text-xs h-8"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                  />
                  <Button size="sm" className="h-8 px-3 text-white" style={{ background: '#0d9488' }} onClick={handleAddComment}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowDetailDialog(false)}>Fermer</Button>
            {selectedTask && (
              <Button variant="destructive" size="sm" className="text-xs" onClick={() => handleDeleteTask(selectedTask.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Supprimer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
            <DialogDescription>Créer une nouvelle tâche opérationnelle</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Titre</Label>
              <Input
                placeholder="Titre de la tâche"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Description détaillée..."
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Priorité</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allPriorities.map(p => <SelectItem key={p} value={p}>{priorityLabels[p]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Catégorie</Label>
                <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v as TaskCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map(c => <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Assigné à</Label>
                <Select value={newTask.assignedTo} onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Échéance</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Entité liée</Label>
              <Input
                placeholder="N° expédition, conteneur, facture..."
                value={newTask.relatedEntity}
                onChange={(e) => setNewTask({ ...newTask, relatedEntity: e.target.value })}
              />
            </div>
            {/* Subtasks */}
            <div className="space-y-2">
              <Label className="text-xs">Sous-tâches</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ajouter une sous-tâche..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && subtaskInput.trim()) {
                      setNewTask({ ...newTask, subtasks: [...newTask.subtasks, subtaskInput.trim()] });
                      setSubtaskInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    if (subtaskInput.trim()) {
                      setNewTask({ ...newTask, subtasks: [...newTask.subtasks, subtaskInput.trim()] });
                      setSubtaskInput('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newTask.subtasks.length > 0 && (
                <div className="space-y-1 mt-2">
                  {newTask.subtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded text-xs">
                      <span>{st}</span>
                      <button
                        onClick={() => setNewTask({ ...newTask, subtasks: newTask.subtasks.filter((_, i) => i !== idx) })}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddTask} className="text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }} disabled={!newTask.title.trim()}>
              Créer la tâche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
