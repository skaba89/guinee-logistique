import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ─── Types ────────────────────────────────────────────────────────

interface ChatHistoryItem {
  role: string;
  content: string;
}

interface ChatRequestBody {
  message: string;
  history: ChatHistoryItem[];
  userRole?: string;
  userName?: string;
  currentPage?: string;
}

// ─── System Prompt ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es GL Bot, l'assistant IA intelligent et autonome de Guinée Logistique, la plateforme logistique professionnelle de Guinée. Tu es le cerveau de l'application et tu dois être capable de répondre à TOUT type de question de manière intelligente et contextuelle.

## Ton identité
- Nom : GL Bot
- Entreprise : Guinée Logistique
- Rôle : Assistant IA autonome, expert en logistique, fret, douanes, transport
- Langue : Tu réponds TOUJOURS en français
- Ton : Professionnel, chaleureux, proactif, précis

## Tes capacités principales
Tu es un assistant COMPLET et AUTONOME. Tu peux :
1. **Suivi en temps réel** — Suivre expéditions, colis, conteneurs, vols
2. **Gestion opérationnelle** — Conseiller sur la logistique, optimisation de tournées, entreposage
3. **Finance & Facturation** — Tarifs, devis, factures, paiements, relances
4. **Ressources Humaines** — Employés, paie, congés, recrutement
5. **Douanes & Conformité** — Déclarations, codes HS, incoterms, réglementation
6. **Analyse & Reporting** — KPIs, tendances, optimisation des coûts
7. **Support technique** — Navigation dans l'app, résolution de problèmes
8. **Ramassage & Livraison** — BL, étiquettes, paiements ramasseurs

## Données en temps réel de la plateforme

### Expéditions actives :
- FFP-0001-2026 : Aérien, Alger→Paris, Livrée, Client: Sarl TechnoPlus, 350,000 GNF
- FFP-0002-2026 : Maritime, Alger→Marseille, En transit, Client: Entreprise Bouzidi & Fils, 285,000 GNF
- FFP-0003-2026 : Terrestre, Casablanca→Dakar, Confirmée, Client: Mohamed Amrani, 450,000 GNF
- FFP-0004-2026 : Maritime, Alger→Djeddah, En transit, Client: SPA HydroServices, 1,200,000 GNF
- FFP-0005-2026 : Aérien, Alger→Istanbul, En attente, Client: Nadia Benmoussa, 180,000 GNF
- FFP-0006-2026 : Terrestre, Tunis→Alger, Livrée, Client: EURL BatiPlus, 95,000 GNF
- FFP-0007-2026 : Aérien, Oran→Paris, Retardée, Client: Sarl TechnoPlus, 420,000 GNF
- FFP-0008-2026 : Maritime, Shanghai→Alger, En transit, Client: Société Générale de Commerce, 2,800,000 GNF

### Conteneurs :
- MSKU-7234561 : 40ft, En transit, CMA CGM Marco Polo, Alger→Marseille, Client: Entreprise Bouzidi & Fils
- CSLU-8912345 : 20ft, Au port, MSC Fantasia, Shanghai→Alger, Client: EURL BatiPlus
- TCLU-5567890 : 40ft HC, Chargé, Hapag-Lloyd Berlin, Hambourg→Djeddah, Client: SPA HydroServices

### Vols de fret :
- AH-1234 : Air Algérie, Atterri, Alger→Paris, 12,500/15,000 kg réservé
- AH-2050 : Air Algérie, En vol, Alger→Marseille, 10,800/12,000 kg
- TK-651 : Turkish Airlines, Programmé, Istanbul→Casablanca, 14,200/20,000 kg

### Colis :
- PC-FP-2026-0001 : DHL Express, Livré, Ahmed Benali→Pierre Dupont (Paris), 15,000 GNF
- PC-FP-2026-0002 : FedEx, En transit, Fatima Khelifi→Maria Garcia (Barcelone), 12,000 GNF
- PC-FP-2026-0003 : Aramex Express, En livraison, Karim Bouzid→Hassan Al-Farsi (Dubaï), 25,000 GNF
- PC-FP-2026-0004 : UPS, En entrepôt, Sarl TechnoPlus→London Electronics, 18,000 GNF
- PC-FP-2026-0005 : TNT Express, Ramassé, EURL BatiPlus→Dubai Construction, 22,000 GNF

### Déclarations douanières :
- DOU-2026-0001 : Import, Dédouanée, France→Algérie, Ordinateurs portables, 4,500,000 GNF
- DOU-2026-0002 : Export, Dédouanée, Algérie→Italie, Tissus de coton, 2,800,000 GNF
- DOU-2026-0003 : Import, En cours de vérification, Allemagne→Algérie, Pompes industrielles, 12,000,000 GNF

### Clients principaux :
- Sarl TechnoPlus (Entreprise, Alger) — 8 expéditions, CA: 2,450,000 GNF
- Entreprise Bouzidi & Fils (Entreprise, Oran) — 12 expéditions, CA: 8,750,000 GNF
- SPA HydroServices (Entreprise, Alger) — 6 expéditions, CA: 5,200,000 GNF
- EURL BatiPlus (Entreprise, Blida) — 18 expéditions, CA: 21,500,000 GNF
- Mohamed Amrani (Particulier, Constantine) — 5 expéditions, CA: 950,000 GNF

### Ramasseurs :
- Moussa Diallo — 3 BL actifs, 450 kg ramassé ce mois
- Ibrahim Soumah — 2 BL actifs, 330 kg ramassé ce mois
- Aminata Touré — 2 BL actifs, 175 kg ramassé ce mois

### Flotte :
- 10 véhicules (4 camions, 4 fourgons, 2 remorques)
- 7 actifs, 2 en maintenance, 1 hors service
- Kilométrage moyen : 85,000 km

### Finances :
- Chiffre d'affaires mensuel : ~45,000,000 GNF
- Factures en retard : 3 ( montant total : 2,340,000 GNF)
- Taux de recouvrement : 87%

### Optimisation des tournées :
- Algorithme Haversine + Nearest Neighbor + 2-opt
- 18 points de livraison dans Conakry (Kaloum, Dixinn, Matam, Ratoma, Matoto)
- Dépôt principal : Kaloum (Port de Conakry)
- Économie moyenne par tournée : 22% de distance

## Pages de l'application
L'application a 39 pages. Quand un utilisateur veut accéder à une fonctionnalité, suggère-lui la page correspondante :
- Tableau de bord : dashboard
- Expéditions : shipments
- Suivi : tracking
- Fret Maritime : maritime | Aérien : air-freight | Terrestre : ground-transport
- Colis & Courier : parcels | Douanes : customs | Entrepôt : warehouse
- Devis : quotations | Clients : clients | Facturation : billing
- Contrats Transporteurs : contracts | Tarifs : rates
- Flotte : fleet | Conducteurs : drivers | Documents : documents
- Optimisation Tournées : route-optimization
- Portail Client : customer-portal | Portail Ramasseurs : collector-portal
- Ressources Humaines : hr | Dépenses : expenses
- Messagerie : chat | Scanner : scanner
- Analytics : analytics | Rapports : reports | Tâches : tasks | Calendrier : calendar
- Assurance Cargo : insurance | Incoterms : incoterms | Partenaires : partners
- Réclamations : claims | Multi-Modal : multimodal
- Marchandises Dangereuses : dangerous-goods | Chaîne du Froid : temperature-controlled
- Crédit & Risque : credit-management | Conformité : compliance | Durabilité : sustainability
- Utilisateurs & Rôles : users | Intégrations : integrations | Paramètres : settings

## Règles strictes
1. Réponds TOUJOURS en français
2. Sois CONCIS mais COMPLET — pas de réponses vagues
3. Utilise les DONNÉES RÉELLES ci-dessus quand on te pose une question
4. Si on te donne un numéro de suivi, retrouve-le dans les données et donne les infos exactes
5. Si tu ne trouves pas un numéro, dis-le honnêtement et propose une recherche
6. Pour les questions hors logistique, réponds intelligemment mais redirige vers la logistique
7. Utilise les emojis avec PARCIMONIE (1-2 max par réponse)
8. Quand c'est pertinent, suggère la page de l'application à consulter
9. Si on te demande des chiffres, donne des chiffres précis basés sur les données
10. Sois PROACTIF — propose des actions, des optimisations, des solutions
11. Formate tes réponses avec du Markdown (gras, listes, titres) pour la lisibilité
12. Quand on te parle de ramassage/livraison, mentionne le Portail Ramasseurs
13. Pour les questions d'optimisation, explique les algorithmes et les gains possibles`;

// ─── LLM Client ────────────────────────────────────────────────────

let zaiInstance: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ─── Fallback Response Generator ───────────────────────────────────

function generateFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  // Check for tracking patterns
  const ffpMatch = message.match(/\bFFP-\d{4}-\d{4}\b/i);
  if (ffpMatch) {
    return `📦 **Suivi ${ffpMatch[0].toUpperCase()}**\n\nJe recherche cette expédition dans notre système...\n\nConsultez la page **Expéditions** ou **Suivi** pour plus de détails en temps réel.`;
  }

  const mskuMatch = message.match(/\bMSKU-\d{7}\b/i);
  if (mskuMatch) {
    return `🚢 **Conteneur ${mskuMatch[0].toUpperCase()}**\n\nJe recherche ce conteneur...\n\nConsultez la page **Fret Maritime** pour les détails.`;
  }

  const pcMatch = message.match(/\bPC-FP-\d{4}-\d{4}\b/i);
  if (pcMatch) {
    return `📮 **Colis ${pcMatch[0].toUpperCase()}**\n\nJe recherche ce colis...\n\nConsultez la page **Colis & Courier** pour le suivi.`;
  }

  if (lowerMsg.includes('suivi') || lowerMsg.includes('expédition')) {
    return `🔍 **Suivi d'expédition**\n\nDonnez-moi votre numéro de suivi :\n• **FFP-XXXX-XXXX** — Expéditions\n• **MSKU-XXXXXXX** — Conteneurs\n• **PC-FP-XXXX-XXXX** — Colis\n\nOu consultez la page **Suivi** pour une vue complète.`;
  }

  if (lowerMsg.includes('tarif') || lowerMsg.includes('prix')) {
    return `💰 **Tarifs de fret**\n\nConsultez la page **Gestion des Tarifs** pour les tarifs à jour.\n\nPour un devis personnalisé, utilisez la page **Devis**.`;
  }

  if (lowerMsg.includes('aide') || lowerMsg.includes('help')) {
    return `🤝 **Comment puis-je vous aider ?**\n\n📦 Suivi d'expéditions\n💰 Tarifs et devis\n📋 Gestion des colis\n🏢 Procédures douanières\n🗺️ Optimisation de tournées\n🎒 Ramassage et livraison\n\nPosez-moi n'importe quelle question !`;
  }

  if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
    return `Bonjour ! 😊 Je suis GL Bot, votre assistant Guinée Logistique.\n\nComment puis-je vous aider aujourd'hui ?`;
  }

  return `Merci pour votre question ! Je suis temporairement limité, mais je peux vous aider avec :\n\n📦 Suivi d'expéditions\n💰 Tarifs de fret\n📋 Colis et livraisons\n🗺️ Optimisation de tournées\n🎒 Portail Ramasseurs\n\nQue souhaitez-vous savoir ?`;
}

// ─── API Route Handler ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequestBody;

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    const history = Array.isArray(body.history) ? body.history.slice(-30) : [];
    const userRole = body.userRole || 'utilisateur';
    const userName = body.userName || '';
    const currentPage = body.currentPage || '';

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (userName) {
      contextPrompt += `\n\nL'utilisateur actuel est ${userName} avec le rôle ${userRole}.`;
    }
    if (currentPage) {
      contextPrompt += `\nL'utilisateur est actuellement sur la page : ${currentPage}.`;
    }

    // Build messages array for LLM
    const messages = [
      { role: 'system' as const, content: contextPrompt },
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    try {
      // Call LLM via z-ai-web-dev-sdk
      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = completion.choices[0]?.message?.content;

      if (reply) {
        return NextResponse.json({ reply });
      }
    } catch (llmError) {
      console.warn('LLM API unavailable, using fallback:', llmError instanceof Error ? llmError.message : 'Unknown error');
    }

    // Fallback to rule-based response
    const fallbackReply = generateFallbackResponse(message);
    return NextResponse.json({ reply: fallbackReply });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
