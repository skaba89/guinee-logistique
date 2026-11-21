# 🚢 Guinée Logistique

**Plateforme de gestion logistique et cargo tout-en-un** — Fret maritime, aérien et terrestre, gestion d'entrepôt, douanes, facturation, RH et bien plus encore.

---

## 📋 Sommaire

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Utilisateurs de démonstration](#-utilisateurs-de-démonstration)
- [Structure du projet](#-structure-du-projet)
- [Système de permissions](#-système-de-permissions)
- [Modules](#-modules)
- [Scripts](#-scripts)
- [Licence](#-licence)

---

## 🖥 Aperçu

Guinée Logistique est une application web complète de gestion logistique conçue pour les entreprises de transport et de fret en Afrique de l'Ouest. Elle couvre l'ensemble de la chaîne logistique — de la création d'expéditions au suivi en temps réel, en passant par la gestion douanière, la facturation et les ressources humaines.

L'interface est entièrement en français et adaptée aux flux métier africains (DZD, GNF, XOF, etc.).

---

## ✨ Fonctionnalités

### 🚛 Transport & Fret
- **Fret Maritime** — Gestion des conteneurs, B/L, ports de chargement/déchargement
- **Fret Aérien** — Suivi des vols, AWB, compagnies aériennes
- **Transport Terrestre** — Flotte, conducteurs, itinéraires
- **Transport Multi-Modal** — Combinaison maritime + aérien + terrestre
- **Optimisation d'Itinéraires** — Algorithme Haversine + heuristique 2-opt TSP

### 📦 Gestion des Expéditions
- Création et suivi des expéditions avec numéros de suivi
- Gestion des colis & courrier
- Scan de codes-barres / QR codes
- Étiquettes Zebra ZPL (ZD421, ZT411, GK420d)
- Chaîne du froid & marchandises dangereuses

### 🏢 Gestion Commerciale
- Gestion des clients (entreprises & particuliers)
- Devis et facturation avec TVA 18%
- Gestion du crédit & risque client
- Assurance cargo
- Contrats transporteurs & partenaires

### 🛂 Douanes & Conformité
- Déclarations douanières
- Conformité réglementaire
- Incoterms (EXW, FOB, CIF, DDP...)
- Contrôle & validation

### 📊 Tableaux de bord & Analytics
- Tableau de bord principal avec KPIs en temps réel
- Analytics avancés (Recharts)
- Rapports personnalisables
- Export Excel & PDF (jsPDF + SheetJS)
- Indicateurs de durabilité & RSE

### 👥 Ressources Humaines & Utilisateurs
- Gestion des utilisateurs & rôles (RBAC)
- 6 rôles : Administrateur, Manager, Agent, Viewer, Client, Ramasseur
- Permissions granulaires par module et par champ
- Sécurité PIN (SHA-256, verrouillage après 3 tentatives)
- Visibilité des modules par client (paramétrage administrateur)

### 💬 Communication
- Messagerie interne avancée
- Chatbot intelligent (GL Bot)
- Système de notifications en temps réel
- Centre d'approbations

### ⚙️ Système & Configuration
- Feature flags (activation/désactivation de modules)
- Matrice de permissions (lecture/écriture par rôle)
- Paramétrage de visibilité par client
- Moteur de règles métier (tarification dynamique, conformité)
- Journal d'audit complet
- Impression par lots, historique d'impression
- Gestion multi-devises (DZD, MAD, TND, USD, EUR, GNF, XOF...)
- Mode sombre / clair
- Interface bilingue (i18n)

---

## 🏗 Architecture technique

| Couche | Technologies |
|--------|-------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS 4, shadcn/ui, Radix UI |
| **Animations** | Framer Motion |
| **Graphiques** | Recharts |
| **État** | Zustand 5 + persist middleware (localStorage) |
| **Base de données** | Prisma ORM (configuré) + données mock |
| **Authentification** | Système PIN SHA-256 + sessions |
| **Export** | SheetJS (xlsx), jsPDF + autotable |
| **Impression** | Zebra ZPL, étiquettes 100x150mm, 100x200mm |
| **IA** | z-ai-web-dev-sdk (chat, recherche web, génération d'images) |
| **Langage** | TypeScript 5 |

---

## 📦 Prérequis

- **Node.js** >= 18 ou **Bun** >= 1.0
- **npm** ou **bun** (recommandé : bun)

---

## 🚀 Installation

> Statut : prototype de démonstration. L'authentification, les données métier et les permissions côté serveur ne sont pas encore adaptées à une exploitation avec des données réelles. Ne pas exposer cette version à des clients en production.

```bash
# Cloner le dépôt
git clone https://github.com/skaba89/guinee-logistique.git
cd guinee-logistique

# Configurer la base de démonstration
cp .env.example .env

# Installer les dépendances
npm install
# ou
bun install

# Lancer le serveur de développement
npm run dev
# ou
bun dev
```

L'application est accessible sur **http://localhost:3000**

---

## 👤 Utilisateurs de démonstration

| Nom | Rôle | Téléphone | Mot de passe | PIN |
|-----|------|-----------|-------------|-----|
| Ahmed Benali | Administrateur | 0600000001 | admin123 | 1987 |
| Fatima Khelifi | Agent | 0600000002 | user123 | 2456 |
| Karim Bouzidi | Client | 0600000003 | client123 | 3674 |
| Moussa Diallo | Ramasseur | 0600000004 | ramass123 | 4521 |

> Le PIN est requis pour accéder aux sections protégées (3 tentatives max, verrouillage 120s).

---

## 📁 Structure du projet

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Routeur SPA principal
│   ├── layout.tsx                # Layout racine
│   └── api/                      # Routes API (chat, scan)
├── components/
│   ├── cargo/                    # 55 composants métier
│   │   ├── dashboard-page.tsx    # Tableau de bord
│   │   ├── shipments-page.tsx    # Expéditions
│   │   ├── maritime-page.tsx     # Fret maritime
│   │   ├── air-freight-page.tsx  # Fret aérien
│   │   ├── settings-page.tsx     # Paramètres & permissions
│   │   ├── collector-portal-page.tsx  # Portail ramasseurs
│   │   ├── route-optimization-page.tsx # Optimisation routes
│   │   └── ...                   # 48 autres pages
│   └── ui/                       # Composants shadcn/ui
├── hooks/                        # Hooks personnalisés
│   ├── use-sidebar-collapse.ts   # État sidebar
│   ├── use-filters.ts            # Filtres avancés
│   └── use-analytics-data.ts     # Données analytics
└── lib/                          # Logique métier
    ├── cargo-store.ts            # Store Zustand (état global)
    ├── module-config.ts          # 46 modules, 9 groupes, 6 rôles
    ├── permissions.ts            # RBAC + visibilité client
    ├── business-rules.ts         # Moteur de règles métier
    ├── audit-trail.ts            # Journal d'audit
    ├── notifications.ts          # Système de notifications
    ├── test-data.ts              # Données mock (clients, BL, vols...)
    ├── label-config.ts           # Configuration étiquettes Zebra
    ├── label-advanced.ts         # Impression avancée
    ├── export-utils.ts           # Export Excel/PDF
    ├── messaging-system.ts       # Messagerie interne
    ├── validation-engine.ts      # Moteur de validation
    └── pin-auth.ts               # Authentification PIN
```

---

## 🔐 Système de permissions

### Rôles (RBAC)

| Rôle | Accès |
|------|-------|
| **Administrateur** | Lecture & écriture sur tous les modules |
| **Manager** | Lecture & écriture sur la plupart des modules |
| **Agent** | Lecture générale, écriture sur les opérations |
| **Viewer** | Lecture seule |
| **Client** | Accès au portail client (paramétrable) |
| **Ramasseur** | Accès au portail ramasseurs |

### Niveaux de permission

- **RW** (Lecture & Écriture) — Création, modification, suppression
- **RO** (Lecture seule) — Consultation uniquement
- **Aucun** — Module invisible

### Visibilité par client

Les administrateurs peuvent configurer quels modules sont visibles pour chaque client individuellement :

1. Aller dans **Paramètres → Modules & Permissions → Visibilité Client**
2. Sélectionner un client
3. Activer/désactiver les modules avec des toggles
4. Les modules masqués n'apparaissent pas dans la barre latérale du client

---

## 🧩 Modules

L'application comprend **46 modules** organisés en **9 groupes** :

| Groupe | Modules |
|--------|---------|
| **Principal** | Tableau de bord, Expéditions, Suivi, Clients, Facturation, Flotte |
| **Fret** | Fret Maritime, Fret Aérien, Transport Terrestre, Multi-Modal |
| **Services** | Colis & Courier, Entrepôt, Douanes, Devis, Assurance |
| **Commercial** | Partenaires, Contrats Transporteurs, Incoterms, Rapports, Gestion des Tarifs |
| **Gestion** | Conducteurs, Documents, Réclamations, Calendrier, Tâches |
| **Communication** | Messagerie, Messagerie Avancée |
| **Conformité** | Marchandises Dangereuses, Chaîne du Froid, Crédit & Risque, Conformité, Contrôle & Validation |
| **Portail** | Portail Client, Portail Ramasseurs, Optimisation d'Itinéraires |
| **Système** | Paramètres, Utilisateurs & Rôles, Intégrations, Analytics, Durabilité & RSE, Scanner, RH, Dépenses, KPIs |

---

## 🛠 Scripts

### Clients et expéditions SaaS

La gestion commerciale (`/saas/billing`) est réservée aux administrateurs et managers. Elle propose des devis à une ligne, leur conversion irréversible en documents internes de facturation, les règlements partiels et le solde global en GNF entiers. Le total est calculé côté serveur et le règlement est atomique avec le solde; la référence est unique par organisation. Orange Money/MTN sont des modes de règlement déjà reçu, enregistrés manuellement, et non des intégrations de paiement. Ces documents internes ne sont pas encore des factures fiscales conformes : numérotation réglementaire, taxes, avoirs, clôtures et PDF restent à mettre en place.

L'activité opérationnelle (`/saas/activity`, GET `/api/saas/activity`) est une vue des événements persistés, filtrée par organisation, association client ou ramasseur affecté. Elle est actualisée à la demande, sans alertes push/SMS/e-mail.

Sur un appareil de confiance, le ramasseur peut choisir de conserver une confirmation non envoyée en cas d'échec réseau. La file est limitée à 100 éléments dans `sessionStorage`, dans l'onglet actif; elle est isolée par compte et organisation et effacée à la déconnexion. Le retour du réseau ou le bouton de synchronisation déclenche une vérification de session, puis l'envoi via l'API idempotente. Une réponse 409 reste en attente pour résolution explicite, aucune preuve n'est écrasée. La fermeture de l'onglet peut perdre les confirmations non synchronisées. Aucune page authentifiée n'est mise en cache; il ne s'agit pas encore d'une PWA hors connexion complète.

Les agents, managers et administrateurs peuvent affecter une mission de ramassage (expédition confirmée) ou de livraison (en transit) à un membre actif de rôle ramasseur, depuis la fiche expédition. Le ramasseur consulte ses seules missions à `/saas/missions`. Une remise déclarée enregistre le nom du réceptionnaire, une observation facultative, la date serveur et l'identifiant du ramasseur; elle fait progresser l'expédition et ajoute un événement dans la même transaction. Ce justificatif déclaratif n'est pas une signature électronique certifiée. Une mission active empêche la modification manuelle du statut, et peut être annulée par un agent pour réaffectation. Une répétition à l'identique d'une confirmation déjà enregistrée est idempotente. La synchronisation hors connexion et les notifications externes restent à implémenter.

Les colis sont ajoutés aux expéditions en brouillon, avec poids en grammes et code-barres Code 39 unique. L'écran logistique accepte les lecteurs de codes-barres fonctionnant comme clavier ou une saisie manuelle. Le scan retourne le statut enregistré de l'expédition, sans simulation GPS.

Le portail `/saas/portal` et son API GET `/api/saas/portal/shipments` sont réservés au rôle client et affichent uniquement les expéditions explicitement associées par `CustomerAccess`. Le provisionnement initial se fait avec le rôle d'administration PostgreSQL (aucun droit d'écriture sur les associations n'est accordé au runtime) :

```sql
INSERT INTO "CustomerAccess" ("organizationId","accountId","customerId")
VALUES ('identifiant-organisation','identifiant-compte-client','identifiant-client');
```

Vérifier auparavant le rôle client actif dans Membership. Supprimer l'association pour révoquer l'accès. Les clés étrangères composites et les politiques RLS restrictives bloquent les liens inter-organisations et les lectures d'autres clients dans le portail. Le suivi affiche les événements persistés lors de l'actualisation, non une géolocalisation en direct.

Après application des migrations PostgreSQL, configurez aussi `SAAS_TENANT_DATABASE_URL` avec un login non propriétaire membre uniquement de `gl_tenant` (distinct du rôle d'authentification et du rôle de migration). Ne jamais utiliser le superutilisateur pour l'application. L'espace `/saas/logistics` permet de créer des clients, créer des expéditions, modifier un itinéraire à l'état brouillon et suivre l'historique des statuts. Les 100 enregistrements les plus récents sont affichés. Les administrateurs, managers et agents écrivent, les viewers lisent, les clients et ramasseurs n'ont pas accès à ce module interne.

API : GET/POST `/api/saas/customers`, GET/POST `/api/saas/shipments`, GET/PATCH `/api/saas/shipments/:id`. Les mutations JSON nécessitent une session et l'origine HTTPS configurée. PATCH exige la version courante; une version obsolète renvoie 409. Statuts : brouillon → confirmé → en transit → livré, annulation possible avant transit. Les événements de statut sont ajoutés dans la même transaction; aucun droit de modification ou suppression d'événement n'est accordé au rôle runtime.

### Mode SaaS sécurisé

La démo historique reste le mode par défaut. Après avoir provisionné PostgreSQL, appliqué les migrations SaaS et créé un compte avec une adhésion et un mot de passe haché par `hashPassword`, configurez `SAAS_AUTH_ENABLED=true`, `SAAS_AUTH_DATABASE_URL` (rôle de connexion membre de `gl_auth`) et `SAAS_PUBLIC_ORIGIN` (origine HTTPS exacte, sans barre finale).

Générez les deux clients Prisma avant le développement ou la compilation :

```bash
bun run db:generate
bunx prisma generate --schema prisma/saas/schema.prisma
```

La page d'accueil redirige alors vers `/saas`. La connexion exige l'identifiant de l'organisation, l'e-mail et le mot de passe. L'annuaire `/saas/members` est en lecture seule, réservé aux administrateurs de leur propre organisation. Les modules de démo, dont les API de chat et scan, sont désactivés en mode SaaS. Une configuration incomplète ne réactive jamais la démo. Les autres modules métier restent à migrer.

Le pipeline CI vérifie le typage, le lint, la compilation et les réponses HTTP de la page d'accueil et de `/api/health`. Cette dernière est une sonde de vie, pas une certification de disponibilité de la base de données.

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancement en production
npm run start

# Lint
npm run lint

# Contrôle TypeScript
npm run typecheck

# Base de données (Prisma)
npm run db:push      # Synchroniser le schéma
npm run db:generate   # Générer le client Prisma
npm run db:migrate    # Créer une migration
npm run db:reset      # Réinitialiser la base
```

---

## 📄 Licence

© 2026 Guinée Logistique. Tous droits réservés.
